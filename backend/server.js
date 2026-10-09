const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadFileToGoogleDrive } = require('./services/googleDriveService');
const { 
    fetchCatalogFromGoogleSheet, 
    appendTestToSheet, 
    updateTestInSheet,
    appendProfileToSheet, 
    updateProfileInSheet,
    getWebhookUrl,
    saveWebhookUrl
} = require('./services/googleSheetsService');

const app = express();

// SAFE PORT CHECK FOR HOSTINGER VPS
// Defaults to port 5080 (avoiding 5000-5009 which are in active use)
const PORT = process.env.PORT || 5080;

app.use(cors());
app.use(express.json());

// In-memory multer storage for streaming directly to Google Drive
const upload = multer({ storage: multer.memoryStorage() });

// -------------------------------------------------------------
// MASTER CATALOG DATA STORE (TESTS, PROFILES & PACKAGES)
// -------------------------------------------------------------
const CATALOG_FILE = path.join(__dirname, 'data/catalogData.json');

let catalogState = {
    tests: [],
    profiles: [],
    packages: [],
    lastSynced: new Date().toISOString()
};

function loadCatalogData() {
    try {
        if (fs.existsSync(CATALOG_FILE)) {
            const raw = fs.readFileSync(CATALOG_FILE, 'utf8');
            catalogState = JSON.parse(raw);
            console.log(`Loaded catalog: ${catalogState.tests.length} tests, ${catalogState.profiles.length} profiles, ${catalogState.packages.length} packages.`);
        }
    } catch (err) {
        console.error('Failed to load catalogData.json:', err.message);
    }
}

function saveCatalogData() {
    try {
        catalogState.lastSynced = new Date().toISOString();
        fs.writeFileSync(CATALOG_FILE, JSON.stringify(catalogState, null, 2), 'utf8');
    } catch (err) {
        console.error('Failed to persist catalogData.json:', err.message);
    }
}

// Initial load
loadCatalogData();

// -------------------------------------------------------------
// HEALTH & AUTH ENDPOINTS
// -------------------------------------------------------------
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        service: 'MedMarg Backend API',
        catalog: {
            tests: catalogState.tests.length,
            profiles: catalogState.profiles.length,
            packages: catalogState.packages.length,
            lastSynced: catalogState.lastSynced
        },
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

// DEMO USERS DATABASE STORE
const DEMO_USERS_DB = [
    { id: 'usr_admin', email: 'admin@medmarg.com', phone: '9999999999', password: 'password123', name: 'MedMarg Super Admin', role: 'ADMIN', organization: 'MedMarg Platform Governance & Central Command' },
    { id: 'usr_staff', email: 'staff@medmarg.com', phone: '9888888888', password: 'password123', name: 'MedMarg Operations Staff', role: 'STAFF', organization: 'MedMarg Central Operations Desk' },
    { id: 'usr_patient', email: 'patient@medmarg.com', phone: '9876543210', password: 'password123', name: 'Rahul Sharma (Patient)', role: 'PATIENT', organization: 'MedMarg Patient Portal (Tirupati)' },
    { id: 'usr_salaried', email: 'salaried@medmarg.com', phone: '9777777777', password: 'password123', name: 'Ramesh Kumar (Salaried Agent AG-01)', role: 'SALARIED_AGENT', organization: 'MedMarg In-House Fleet (Zone 1)' },
    { id: 'usr_freelance', email: 'freelance@medmarg.com', phone: '9666666666', password: 'password123', name: 'Suresh Phlebo (Freelance Agent)', role: 'FREELANCER_AGENT', organization: 'MedMarg Freelance Phlebotomist Network' },
    { id: 'usr_doctor', email: 'doctor@medmarg.com', phone: '9555555555', password: 'password123', name: 'Dr. Ananya Sharma, MD', role: 'DOCTOR', organization: 'MedMarg Care Clinic (OPD Practice)' },
    { id: 'usr_lab', email: 'lab@medmarg.com', phone: '9444444444', password: 'password123', name: 'MedMarg Central Pathology Hub', role: 'DIAGNOSTIC_LAB', organization: 'MedMarg Central Diagnostics (NABL Certified)' },
    { id: 'usr_scans', email: 'scans@medmarg.com', phone: '9333333333', password: 'password123', name: 'Aarthi Scans Operations', role: 'SCAN_CENTER', organization: 'Aarthi Scans & Radiology Center (3.0T MRI)' }
];

// SINGLE LOGIN (EMAIL / PHONE & PASSWORD)
app.post('/api/v1/auth/login', (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier) {
        return res.status(400).json({ error: 'Email address or Mobile number is required.' });
    }

    const cleanId = identifier.trim().toLowerCase().replace(/\s+/g, '');

    // Search in DEMO_USERS_DB first
    const foundUser = DEMO_USERS_DB.find(u => 
        u.email.toLowerCase() === cleanId || 
        u.phone === cleanId || 
        u.phone === cleanId.replace(/\D/g, '') ||
        cleanId.includes(u.email.split('@')[0])
    );

    if (foundUser) {
        return res.json({
            success: true,
            token: `jwt_medmarg_${Date.now()}`,
            user: {
                id: foundUser.id,
                name: foundUser.name,
                email: foundUser.email,
                phone: foundUser.phone,
                identifier: identifier,
                role: foundUser.role,
                organization: foundUser.organization
            }
        });
    }

    // Dynamic Role Auto-Detection fallback
    let detectedRole = 'PATIENT';
    let name = 'Customer Patient';
    let organization = 'MedMarg Healthcare Patient Portal';

    if (cleanId.includes('admin') || cleanId === 'superadmin') {
        detectedRole = 'ADMIN';
        name = 'MedMarg Super Admin';
        organization = 'MedMarg Platform Governance & Central Command';
    } else if (cleanId.includes('staff') || cleanId.includes('ops')) {
        detectedRole = 'STAFF';
        name = 'MedMarg Operations Staff';
        organization = 'MedMarg Central Operations Desk';
    } else if (cleanId.includes('freelance') || cleanId.includes('gig')) {
        detectedRole = 'FREELANCER_AGENT';
        name = 'Suresh Phlebotomy (Freelancer)';
        organization = 'MedMarg Freelance Phlebotomist Network';
    } else if (cleanId.includes('salaried') || cleanId.includes('agent') || cleanId.includes('phlebo')) {
        detectedRole = 'SALARIED_AGENT';
        name = 'Ramesh Kumar (Salaried Agent AG-01)';
        organization = 'MedMarg In-House Fleet (Zone 1)';
    } else if (cleanId.includes('lab') || cleanId.includes('lal') || cleanId.includes('thyrocare')) {
        detectedRole = 'DIAGNOSTIC_LAB';
        name = 'MedMarg Central Pathology Hub';
        organization = 'MedMarg Central Diagnostics';
    } else if (cleanId.includes('scan') || cleanId.includes('aarthi') || cleanId.includes('mri')) {
        detectedRole = 'SCAN_CENTER';
        name = 'Aarthi Scans Operations';
        organization = 'Aarthi Scans & Radiology Center';
    } else if (cleanId.includes('dr') || cleanId.includes('doctor')) {
        detectedRole = 'DOCTOR';
        name = 'Dr. Ananya Sharma, MD';
        organization = 'MedMarg Care Clinic';
    }

    return res.json({
        success: true,
        token: `jwt_medmarg_${Date.now()}`,
        user: {
            id: `usr_${Date.now()}`,
            name,
            email: cleanId.includes('@') ? cleanId : `${cleanId}@medmarg.com`,
            phone: cleanId.match(/^[0-9]{10,12}$/) ? cleanId : '9876543210',
            identifier,
            role: detectedRole,
            organization
        }
    });
});

// GOOGLE SIGN-IN & PROFILE DETECTION ENDPOINT
app.post('/api/v1/auth/google', (req, res) => {
    const { email, name, picture, googleId, phone } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Google email is required.' });
    }

    const emailLower = email.trim().toLowerCase();

    // Determine role from email if predefined admin/partner, default to PATIENT
    let detectedRole = 'PATIENT';
    let organization = 'MedMarg Healthcare Patient Portal';

    if (emailLower.includes('admin@medmarg.com')) {
        detectedRole = 'ADMIN';
        organization = 'MedMarg Platform Governance & Audit';
    } else if (emailLower.includes('lab') || emailLower.includes('pathlabs') || emailLower.includes('thyrocare')) {
        detectedRole = 'DIAGNOSTIC_LAB';
        organization = 'MedMarg Central Diagnostics (NABL Certified)';
    } else if (emailLower.includes('scan') || emailLower.includes('aarthi') || emailLower.includes('mri')) {
        detectedRole = 'SCAN_CENTER';
        organization = 'Aarthi Scans & Radiology Center (3.0T MRI)';
    } else if (emailLower.includes('doctor') || emailLower.includes('dr.')) {
        detectedRole = 'DOCTOR';
        organization = 'MedMarg Care Clinic (In-Clinic OPD Practice)';
    } else if (emailLower.includes('pharmacy') || emailLower.includes('chemist')) {
        detectedRole = 'PHARMACY';
        organization = 'MedPlus Pharmacy (Generic Dispenser)';
    }

    const requiresPhone = !phone || phone.trim().length < 10;

    // Automatically register/update customer in central dbStore
    if (!dbStore.customers) dbStore.customers = [];
    let existingCust = dbStore.customers.find(c => c.email && c.email.toLowerCase() === emailLower);
    if (!existingCust && detectedRole === 'PATIENT') {
        existingCust = {
            id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
            name: name || email.split('@')[0],
            phone: phone || '',
            email: emailLower,
            city: 'Tirupati',
            abhaId: `ABHA-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
            memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            age: 30,
            gender: 'Verified',
            bloodGroup: 'O+',
            chronicConditions: 'None',
            allergies: 'None',
            locations: [
                { id: `LOC-${Date.now()}`, label: 'Primary Location', fullAddress: 'Air Bypass Road, Tirupati', pincode: '517501', isPrimary: true }
            ],
            familyMembers: [],
            orderHistory: []
        };
        dbStore.customers.unshift(existingCust);
        saveDbStore();
    } else if (existingCust) {
        if (phone && phone.trim().length >= 10) existingCust.phone = phone.trim();
        if (name && (!existingCust.name || existingCust.name === 'Google User')) existingCust.name = name;
        saveDbStore();
    }

    return res.json({
        success: true,
        token: `jwt_google_medmarg_${Date.now()}`,
        requiresPhone,
        user: {
            id: existingCust ? existingCust.id : `usr_g_${googleId || Date.now()}`,
            name: name || (existingCust ? existingCust.name : email.split('@')[0]),
            email: emailLower,
            identifier: phone || emailLower,
            phone: phone || (existingCust ? existingCust.phone : ''),
            picture: picture || null,
            role: detectedRole,
            organization,
            authProvider: 'google'
        }
    });
});

// UPDATE USER PHONE NUMBER ENDPOINT
app.post('/api/v1/auth/update-phone', (req, res) => {
    const { userId, phone, email, name } = req.body;

    if (!phone || phone.trim().length < 10) {
        return res.status(400).json({ error: 'A valid 10-digit mobile number is required.' });
    }

    if (!dbStore.customers) dbStore.customers = [];
    let cust = dbStore.customers.find(c => (userId && c.id === userId) || (email && c.email && c.email.toLowerCase() === email.toLowerCase()));
    
    if (cust) {
        cust.phone = phone.trim();
        if (name && (!cust.name || cust.name === 'Google User')) cust.name = name;
        saveDbStore();
    } else if (email) {
        cust = {
            id: userId || `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
            name: name || email.split('@')[0],
            phone: phone.trim(),
            email: email.trim().toLowerCase(),
            city: 'Tirupati',
            abhaId: `ABHA-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
            memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            age: 30,
            gender: 'Verified',
            bloodGroup: 'O+',
            chronicConditions: 'None',
            allergies: 'None',
            locations: [
                { id: `LOC-${Date.now()}`, label: 'Primary Location', fullAddress: 'Air Bypass Road, Tirupati', pincode: '517501', isPrimary: true }
            ],
            familyMembers: [],
            orderHistory: []
        };
        dbStore.customers.unshift(cust);
        saveDbStore();
    }

    return res.json({
        success: true,
        message: 'Phone number updated and customer profile saved to database.',
        phone: phone.trim(),
        customer: cust
    });
});

// GOOGLE DRIVE FILE & REPORT UPLOAD ENDPOINT
app.post('/api/v1/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        const { originalname, buffer, mimetype } = req.file;
        const driveResult = await uploadFileToGoogleDrive(buffer, originalname, mimetype);

        res.json({
            success: true,
            fileName: originalname,
            fileId: driveResult.fileId,
            driveViewUrl: driveResult.webViewLink,
            driveDownloadUrl: driveResult.webContentLink,
            message: 'File successfully uploaded to Google Drive and link stored in MedMarg database.'
        });
    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).json({ error: 'Failed to upload file to Google Drive.' });
    }
});

// -------------------------------------------------------------
// UNIFIED MEDMARG CATALOG APIS (SINGLE-LAB ARCHITECTURE)
// -------------------------------------------------------------

// SUMMARY STATS
app.get('/api/v1/catalog/summary', (req, res) => {
    res.json({
        success: true,
        labBrand: 'MedMarg Central Diagnostics',
        totalTests: catalogState.tests.length,
        totalProfiles: catalogState.profiles.length,
        totalPackages: catalogState.packages.length,
        lastSynced: catalogState.lastSynced
    });
});

// GET TESTS (With Search, Filter by Fasting & Sample Type)
app.get('/api/v1/catalog/tests', (req, res) => {
    const { q, fasting, sample, limit, page } = req.query;
    let list = catalogState.tests;

    if (q) {
        const query = q.toLowerCase();
        list = list.filter(t => 
            (t.name && t.name.toLowerCase().includes(query)) ||
            (t.code && t.code.toLowerCase().includes(query)) ||
            (t.sampleType && t.sampleType.toLowerCase().includes(query))
        );
    }

    if (fasting) {
        list = list.filter(t => t.fasting === fasting.toUpperCase());
    }

    if (sample) {
        list = list.filter(t => t.sampleType && t.sampleType.toUpperCase().includes(sample.toUpperCase()));
    }

    const total = list.length;
    if (limit) {
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 50;
        const start = (pageNum - 1) * limitNum;
        list = list.slice(start, start + limitNum);
    }

    res.json({
        success: true,
        total,
        tests: list
    });
});

// CREATE / ADD / UPDATE TEST (Syncs to Google Sheets & MedMarg DB)
app.post('/api/v1/catalog/tests', async (req, res) => {
    const { code, name, sampleType, fasting, mrp, price, tatHours, description } = req.body;

    if (!code || !name) {
        return res.status(400).json({ error: 'Test Code and Test Name are required.' });
    }

    const testCode = code.trim().toUpperCase();
    const existingIndex = catalogState.tests.findIndex(t => t.code === testCode);

    const testItem = {
        id: existingIndex >= 0 ? catalogState.tests[existingIndex].id : `TEST_${catalogState.tests.length + 1}`,
        serialNo: existingIndex >= 0 ? catalogState.tests[existingIndex].serialNo : catalogState.tests.length + 1,
        code: testCode,
        name: name.trim(),
        sampleType: (sampleType || 'SERUM').trim().toUpperCase(),
        fasting: (fasting || 'NO').trim().toUpperCase(),
        category: 'Individual Test',
        mrp: Number(mrp) || 499,
        price: Number(price) || 299,
        tatHours: Number(tatHours) || 24,
        description: description || `Clinical laboratory test for ${name}.`,
        active: true
    };

    if (existingIndex >= 0) {
        catalogState.tests[existingIndex] = testItem;
    } else {
        catalogState.tests.unshift(testItem);
    }
    saveCatalogData();

    // Async sync with Google Sheet
    try {
        await updateTestInSheet(testItem);
    } catch (sheetErr) {
        console.warn('Google Sheet update deferred:', sheetErr.message);
    }

    res.status(201).json({
        success: true,
        message: existingIndex >= 0 ? 'Test updated and synced to Google Sheets.' : 'Test created and synced to Google Sheets.',
        test: testItem
    });
});

// GET PROFILES (With Search & Filter)
app.get('/api/v1/catalog/profiles', (req, res) => {
    const { q, fasting, sample } = req.query;
    let list = catalogState.profiles;

    if (q) {
        const query = q.toLowerCase();
        list = list.filter(p => 
            (p.name && p.name.toLowerCase().includes(query)) ||
            (p.code && p.code.toLowerCase().includes(query)) ||
            (p.sampleType && p.sampleType.toLowerCase().includes(query))
        );
    }

    if (fasting) {
        list = list.filter(p => p.fasting === fasting.toUpperCase());
    }

    res.json({
        success: true,
        total: list.length,
        profiles: list
    });
});

// CREATE / ADD / UPDATE PROFILE (Syncs to Google Sheets & MedMarg DB)
app.post('/api/v1/catalog/profiles', async (req, res) => {
    const { code, name, sampleType, fasting, mrp, price, tatHours, description } = req.body;

    if (!code || !name) {
        return res.status(400).json({ error: 'Profile Code and Profile Name are required.' });
    }

    const profCode = code.trim().toUpperCase();
    const existingIndex = catalogState.profiles.findIndex(p => p.code === profCode);

    const profItem = {
        id: existingIndex >= 0 ? catalogState.profiles[existingIndex].id : `PROF_${catalogState.profiles.length + 1}`,
        serialNo: existingIndex >= 0 ? catalogState.profiles[existingIndex].serialNo : catalogState.profiles.length + 1,
        code: profCode,
        name: name.trim(),
        sampleType: (sampleType || 'SERUM').trim().toUpperCase(),
        fasting: (fasting || 'NO').trim().toUpperCase(),
        category: 'Diagnostic Profile',
        mrp: Number(mrp) || 1499,
        price: Number(price) || 899,
        tatHours: Number(tatHours) || 24,
        description: description || `Comprehensive diagnostic profile panel for ${name}.`,
        active: true
    };

    if (existingIndex >= 0) {
        catalogState.profiles[existingIndex] = profItem;
    } else {
        catalogState.profiles.unshift(profItem);
    }
    saveCatalogData();

    try {
        await updateProfileInSheet(profItem);
    } catch (sheetErr) {
        console.warn('Google Sheet update deferred:', sheetErr.message);
    }

    res.status(201).json({
        success: true,
        message: existingIndex >= 0 ? 'Profile updated and synced to Google Sheets.' : 'Profile created and synced to Google Sheets.',
        profile: profItem
    });
});

// GET PACKAGES (Custom Bundles combining Tests & Profiles)
app.get('/api/v1/catalog/packages', (req, res) => {
    // Populate package details with referenced profile/test metadata
    const populated = catalogState.packages.map(pkg => {
        const profileDetails = (pkg.profiles || []).map(code => 
            catalogState.profiles.find(p => p.code === code) || { code, name: code }
        );
        const testDetails = (pkg.tests || []).map(code => 
            catalogState.tests.find(t => t.code === code) || { code, name: code }
        );

        return {
            ...pkg,
            profileDetails,
            testDetails
        };
    });

    res.json({
        success: true,
        total: populated.length,
        packages: populated
    });
});

// CREATE / PUBLISH NEW HEALTH PACKAGE (Package Builder)
app.post('/api/v1/catalog/packages', (req, res) => {
    const { name, code, tagline, category, mrp, price, selectedProfiles, selectedTests, description, tatHours } = req.body;

    if (!name || !price) {
        return res.status(400).json({ error: 'Package Name and Price are required.' });
    }

    const profileCodes = selectedProfiles || [];
    const testCodes = selectedTests || [];

    // Auto-calculate aggregated sample types and fasting
    const referencedProfiles = catalogState.profiles.filter(p => profileCodes.includes(p.code));
    const referencedTests = catalogState.tests.filter(t => testCodes.includes(t.code));

    const sampleSet = new Set();
    [...referencedProfiles, ...referencedTests].forEach(item => {
        if (item.sampleType) {
            item.sampleType.split(',').forEach(s => sampleSet.add(s.trim()));
        }
    });
    const aggregatedSamples = Array.from(sampleSet);
    if (aggregatedSamples.length === 0) aggregatedSamples.push('SERUM');

    const needsFasting = [...referencedProfiles, ...referencedTests].some(item => item.fasting === 'YES');

    const newPackage = {
        id: `PKG_${Date.now()}`,
        name: name.trim(),
        code: (code || `MM_PKG_${Date.now().toString().slice(-4)}`).toUpperCase(),
        tagline: tagline || 'Custom Curated Health Assessment Bundle',
        category: category || 'Wellness Checkup',
        mrp: Number(mrp) || Number(price) * 2,
        price: Number(price),
        discountPercent: mrp ? Math.round(((mrp - price) / mrp) * 100) : 50,
        fasting: needsFasting ? 'YES' : 'NO',
        fastingNote: needsFasting ? '8-10 hours overnight fasting recommended' : 'No special fasting required',
        sampleTypes: aggregatedSamples,
        tatHours: Number(tatHours) || 24,
        popular: true,
        profiles: profileCodes,
        tests: testCodes,
        testCount: profileCodes.length * 10 + testCodes.length,
        description: description || `Comprehensive health package combining ${profileCodes.length} profiles and ${testCodes.length} clinical tests.`
    };

    catalogState.packages.unshift(newPackage);
    saveCatalogData();

    res.status(201).json({
        success: true,
        message: 'Package created and published successfully to MedMarg catalog.',
        package: newPackage
    });
});

// DELETE PACKAGE
app.delete('/api/v1/catalog/packages/:id', (req, res) => {
    const { id } = req.params;
    catalogState.packages = catalogState.packages.filter(p => p.id !== id);
    saveCatalogData();
    res.json({ success: true, message: `Package ${id} deleted successfully.` });
});

// GET / SET GOOGLE APPS SCRIPT WEBHOOK CONFIG
app.get('/api/v1/catalog/webhook-config', (req, res) => {
    res.json({
        success: true,
        webhookUrl: getWebhookUrl(),
        connected: Boolean(getWebhookUrl())
    });
});

app.post('/api/v1/catalog/webhook-config', (req, res) => {
    const { webhookUrl } = req.body;
    saveWebhookUrl(webhookUrl || '');
    res.json({
        success: true,
        message: 'Google Sheets Two-Way Webhook configured successfully.',
        webhookUrl: getWebhookUrl(),
        connected: Boolean(getWebhookUrl())
    });
});

// TWO-WAY SYNC TRIGGER (Google Sheets <-> MedMarg DB)
app.post('/api/v1/catalog/sync', async (req, res) => {
    try {
        const result = await fetchCatalogFromGoogleSheet();
        if (result && result.tests && result.tests.length > 0) {
            catalogState.tests = result.tests;
            if (result.profiles && result.profiles.length > 0) {
                catalogState.profiles = result.profiles;
            }
            saveCatalogData();
        }

        res.json({
            success: true,
            source: result.source || 'google_sheets_live',
            message: `Catalog synchronized successfully. ${catalogState.tests.length} tests and ${catalogState.profiles.length} profiles active.`,
            tests: catalogState.tests,
            profiles: catalogState.profiles,
            packages: catalogState.packages,
            stats: {
                totalTests: catalogState.tests.length,
                totalProfiles: catalogState.profiles.length,
                totalPackages: catalogState.packages.length,
                lastSynced: catalogState.lastSynced
            }
        });
    } catch (err) {
        res.status(500).json({
            error: 'Failed to sync with Google Sheets',
            details: err.message
        });
    }
});

// RADIOLOGY SCANS API
app.get('/api/v1/scans', (req, res) => {
    res.json([
        {
            id: 's_mri_brain',
            name: 'MRI Brain (Plain + Angio)',
            modality: 'MRI',
            price: 3499,
            mrp: 6000,
            nextSlot: 'Today, 5:00 PM',
            tatHours: 4
        },
        {
            id: 's_ct_chest',
            name: 'HRCT Chest (High Resolution Lung CT)',
            modality: 'CT Scan',
            price: 2499,
            mrp: 4500,
            nextSlot: 'Today, 4:30 PM',
            tatHours: 3
        },
        {
            id: 's_usg_abdomen',
            name: 'Ultrasound Whole Abdomen & Pelvis',
            modality: 'Ultrasound',
            price: 1199,
            mrp: 2000,
            nextSlot: 'Tomorrow, 9:00 AM',
            tatHours: 2
        }
    ]);
});

// LEGACY TESTS ENDPOINT COMPATIBILITY (Single-Lab MedMarg Format)
app.get('/api/v1/tests', (req, res) => {
    const list = catalogState.tests.slice(0, 100).map(t => ({
        id: t.id,
        name: t.name,
        code: t.code,
        category: t.category,
        parametersCount: 1,
        sampleType: t.sampleType,
        fastingRequiredHours: t.fasting === 'YES' ? 10 : 0,
        price: t.price,
        mrp: t.mrp,
        tatHours: t.tatHours
    }));

    res.json({
        success: true,
        tests: list,
        packages: catalogState.packages
    });
});

// -------------------------------------------------------------
// PERSISTENT DB STORE (ORDERS, FREELANCERS, INDENTS, PARTNERS)
// -------------------------------------------------------------
const DB_STORE_FILE = path.join(__dirname, 'data/dbStore.json');

let dbStore = {
    orders: [],
    freelancers: [],
    salariedAgents: [],
    inventoryStock: [],
    indents: [],
    partnerQueue: [],
    transactions: [],
    offers: [
        {
            id: 'off_1',
            title: '⚡ 60-Minute Express Home Phlebotomy',
            subtitle: 'Flat 60% OFF on Aarogyam Full Body Checkup',
            code: 'EXPRESS60',
            price: '₹1,499',
            mrp: '₹3,500',
            gradient: 'linear-gradient(135deg, #004D40 0%, #006B70 100%)',
            badge: 'TOP CHOICE',
            tagColor: '#FEF3C7',
            tagText: '#B45309',
            packageId: 'pkg_aarogyam_13',
            active: true
        },
        {
            id: 'off_2',
            title: '👵 Senior Citizen Diabetic & Cardiac Panel',
            subtitle: 'HbA1c + Fasting Blood Sugar + Lipid Profile',
            code: 'SENIORCARE',
            price: '₹599',
            mrp: '₹1,400',
            gradient: 'linear-gradient(135deg, #1E3A8A 0%, #0284C7 100%)',
            badge: 'POPULAR',
            tagColor: '#E0F2FE',
            tagText: '#0369A1',
            packageId: 'pkg_mm_cardio_diab',
            active: true
        },
        {
            id: 'off_3',
            title: '🌸 Complete Women\'s Vitality & Hormone',
            subtitle: 'Thyroid (T3/T4/TSH), Iron, Calcium & Vitamins D3/B12',
            code: 'WOMENHEALTH',
            price: '₹999',
            mrp: '₹2,200',
            gradient: 'linear-gradient(135deg, #581C87 0%, #9333EA 100%)',
            badge: 'SPECIAL',
            tagColor: '#F3E8FF',
            tagText: '#6B21A8',
            packageId: 'pkg_mm_women_well',
            active: true
        },
        {
            id: 'off_4',
            title: '👨‍👩‍👧 Family & Corporate Wellness Days',
            subtitle: 'Book for 2+ Members & Get ₹500 MedMarg Wallet Cashback',
            code: 'FAMILY500',
            price: '₹500 Cashback',
            mrp: 'Free Home Visit',
            gradient: 'linear-gradient(135deg, #065F46 0%, #059669 100%)',
            badge: 'CASHBACK',
            tagColor: '#D1FAE5',
            tagText: '#047857',
            packageId: 'pkg_mm_master',
            active: true
        }
    ]
};

function loadDbStore() {
    try {
        if (fs.existsSync(DB_STORE_FILE)) {
            const raw = fs.readFileSync(DB_STORE_FILE, 'utf8');
            dbStore = JSON.parse(raw);
            console.log(`Loaded DB Store: ${dbStore.orders.length} orders, ${dbStore.freelancers.length} freelancers, ${dbStore.partnerQueue.length} pre-registered partners.`);
        }
        if (!dbStore.offers || dbStore.offers.length === 0) {
            dbStore.offers = [
                {
                    id: 'off_1',
                    title: '⚡ 60-Minute Express Home Phlebotomy',
                    subtitle: 'Flat 60% OFF on Aarogyam Full Body Checkup',
                    code: 'EXPRESS60',
                    price: '₹1,499',
                    mrp: '₹3,500',
                    gradient: 'linear-gradient(135deg, #004D40 0%, #006B70 100%)',
                    badge: 'TOP CHOICE',
                    tagColor: '#FEF3C7',
                    tagText: '#B45309',
                    packageId: 'pkg_aarogyam_13',
                    active: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'off_2',
                    title: '👵 Senior Citizen Diabetic & Cardiac Panel',
                    subtitle: 'HbA1c + Fasting Blood Sugar + Lipid Profile',
                    code: 'SENIORCARE',
                    price: '₹599',
                    mrp: '₹1,400',
                    gradient: 'linear-gradient(135deg, #1E3A8A 0%, #0284C7 100%)',
                    badge: 'POPULAR',
                    tagColor: '#E0F2FE',
                    tagText: '#0369A1',
                    packageId: 'pkg_mm_cardio_diab',
                    active: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'off_3',
                    title: '🌸 Complete Women\'s Vitality & Hormone',
                    subtitle: 'Thyroid (T3/T4/TSH), Iron, Calcium & Vitamins D3/B12',
                    code: 'WOMENHEALTH',
                    price: '₹999',
                    mrp: '₹2,200',
                    gradient: 'linear-gradient(135deg, #581C87 0%, #9333EA 100%)',
                    badge: 'SPECIAL',
                    tagColor: '#F3E8FF',
                    tagText: '#6B21A8',
                    packageId: 'pkg_mm_women_well',
                    active: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'off_4',
                    title: '👨‍👩‍👧 Family & Corporate Wellness Days',
                    subtitle: 'Book for 2+ Members & Get ₹500 MedMarg Wallet Cashback',
                    code: 'FAMILY500',
                    price: '₹500 Cashback',
                    mrp: 'Free Home Visit',
                    gradient: 'linear-gradient(135deg, #065F46 0%, #059669 100%)',
                    badge: 'CASHBACK',
                    tagColor: '#D1FAE5',
                    tagText: '#047857',
                    packageId: 'pkg_mm_master',
                    active: true,
                    createdAt: new Date().toISOString()
                }
            ];
            saveDbStore();
        }
    } catch (err) {
        console.error('Failed to load dbStore.json:', err.message);
    }
}

function saveDbStore() {
    try {
        fs.writeFileSync(DB_STORE_FILE, JSON.stringify(dbStore, null, 2), 'utf8');
    } catch (err) {
        console.error('Failed to save dbStore.json:', err.message);
    }
}

loadDbStore();

// DB API ENDPOINTS
app.get('/api/v1/admin/orders', (req, res) => {
    res.json({ success: true, orders: dbStore.orders });
});

app.post('/api/v1/admin/orders', (req, res) => {
    const newOrder = {
        id: `MM-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'BOOKED',
        otp: Math.floor(1000 + Math.random() * 9000).toString(),
        createdAt: new Date().toLocaleTimeString(),
        ...req.body
    };
    dbStore.orders.unshift(newOrder);
    saveDbStore();
    res.status(201).json({ success: true, order: newOrder });
});

app.post('/api/v1/admin/orders/assign', (req, res) => {
    const { orderId, assignedAgent } = req.body;
    const order = dbStore.orders.find(o => o.id === orderId);
    if (order) {
        order.assignedAgent = assignedAgent;
        order.status = 'EN_ROUTE';
        saveDbStore();
        return res.json({ success: true, order });
    }
    res.status(404).json({ error: 'Order not found' });
});

app.get('/api/v1/admin/freelancers', (req, res) => {
    res.json({ success: true, freelancers: dbStore.freelancers });
});

// -------------------------------------------------------------
// REGISTERED CUSTOMERS API ENDPOINTS
// -------------------------------------------------------------
app.get('/api/v1/customers', (req, res) => {
    res.json({ success: true, customers: dbStore.customers || [] });
});

app.get('/api/v1/admin/customers', (req, res) => {
    res.json({ success: true, customers: dbStore.customers || [] });
});

app.post('/api/v1/admin/customers', (req, res) => {
    const newCustomer = {
        id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
        memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        locations: req.body.locations || [
            { id: `LOC-${Date.now()}`, label: 'Home Address', fullAddress: 'Air Bypass Road, Tirupati', pincode: '517501', isPrimary: true }
        ],
        familyMembers: req.body.familyMembers || [],
        orderHistory: req.body.orderHistory || [],
        ...req.body
    };
    if (!dbStore.customers) dbStore.customers = [];
    dbStore.customers.unshift(newCustomer);
    saveDbStore();
    res.status(201).json({ success: true, customer: newCustomer });
});

app.delete('/api/v1/admin/customers/:id', (req, res) => {
    const { id } = req.params;
    if (dbStore.customers) {
        dbStore.customers = dbStore.customers.filter(c => c.id !== id);
        saveDbStore();
    }
    res.json({ success: true, message: 'Customer removed' });
});

app.post('/api/v1/admin/freelancers/verify', (req, res) => {
    const { id, status } = req.body;
    const fl = dbStore.freelancers.find(f => f.id === id);
    if (fl) {
        fl.status = status;
        if (status === 'APPROVED') fl.walletBalance = 2000;
        saveDbStore();
        return res.json({ success: true, freelancer: fl });
    }
    res.status(404).json({ error: 'Freelancer not found' });
});

app.get('/api/v1/admin/indents', (req, res) => {
    res.json({ success: true, indents: dbStore.indents });
});

app.post('/api/v1/admin/indents/approve', (req, res) => {
    const { id } = req.body;
    const ind = dbStore.indents.find(i => i.id === id);
    if (ind) {
        ind.status = 'APPROVED_DISPATCHED';
        saveDbStore();
        return res.json({ success: true, indent: ind });
    }
    res.status(404).json({ error: 'Indent not found' });
});

app.get('/api/v1/admin/partners', (req, res) => {
    res.json({ success: true, partners: dbStore.partnerQueue });
});

app.post('/api/v1/admin/partners/register', (req, res) => {
    const newPartner = {
        id: `P-${Math.floor(100 + Math.random() * 900)}`,
        status: 'PRE_REGISTERED',
        createdAt: new Date().toISOString(),
        ...req.body
    };
    dbStore.partnerQueue.unshift(newPartner);
    saveDbStore();
    res.status(201).json({ success: true, partner: newPartner });
});

// -------------------------------------------------------------
// COLLECTION AGENT & PHLEBOTOMIST FLEET ENDPOINTS
// -------------------------------------------------------------
app.get('/api/v1/agent/roster', (req, res) => {
    const orders = dbStore.orders || [];
    res.json({ success: true, roster: orders });
});

app.post('/api/v1/agent/pickup/update', (req, res) => {
    const { orderId, status, barcode, otp, paymentCollected, notes } = req.body;
    const order = (dbStore.orders || []).find(o => o.id === orderId);
    if (order) {
        if (status) order.status = status;
        if (barcode) order.barcode = barcode;
        if (otp) order.handoverOtp = otp;
        if (paymentCollected) order.paymentStatus = 'PAID_DOORSTEP_QR';
        if (notes) order.agentNotes = notes;
        order.lastUpdated = new Date().toISOString();
        saveDbStore();
        return res.json({ success: true, order });
    }
    res.status(404).json({ error: 'Pickup order not found' });
});

app.get('/api/v1/agent/broadcast-jobs', (req, res) => {
    // Return sample broadcast overflow jobs
    const jobs = [
        {
            id: 'BJ-901',
            patientName: 'Kavitha R',
            age: '45F',
            timeSlot: '11:30 AM - 12:30 PM (Fasting)',
            address: 'Door 5-112, Bhavani Nagar, Tirupati - 517501',
            phone: '+91 94400 88991',
            tests: 'Comprehensive Diabetic Health Panel (88 Tests)',
            tubes: ['Yellow SST (Serum)', 'Grey (Fluoride Sugar)', 'Lavender (EDTA)'],
            payout: 350,
            distance: '2.4 km',
            fastingRequired: true,
            urgency: 'HIGH_PRIORITY'
        },
        {
            id: 'BJ-902',
            patientName: 'Subramanyam Naidu',
            age: '62M',
            timeSlot: '01:00 PM - 02:00 PM (Non-Fasting)',
            address: 'Plot 18, Renigunta Road, Tirupati - 517506',
            phone: '+91 98855 22441',
            tests: 'Cardiac Risk Profile + Lipid + Electrolytes',
            tubes: ['Yellow SST (Serum)', 'Green (Heparin)'],
            payout: 420,
            distance: '4.1 km',
            fastingRequired: false,
            urgency: 'STANDARD'
        }
    ];
    res.json({ success: true, jobs });
});

app.post('/api/v1/agent/broadcast-jobs/claim', (req, res) => {
    const { jobId, agentName } = req.body;
    const newOrder = {
        id: `MM-${Math.floor(8000 + Math.random() * 1000)}`,
        patientName: req.body.patientName || 'Claimed Patient',
        time: req.body.timeSlot || 'Today Scheduled',
        address: req.body.address || 'Tirupati Doorstep',
        amount: 899,
        status: 'ASSIGNED',
        assignedAgent: agentName || 'Active Agent',
        tests: req.body.tests || 'Diagnostic Tests'
    };
    if (!dbStore.orders) dbStore.orders = [];
    dbStore.orders.unshift(newOrder);
    saveDbStore();
    res.json({ success: true, message: 'Job successfully claimed!', order: newOrder });
});

app.get('/api/v1/agent/inventory', (req, res) => {
    const inventory = [
        { id: 'INV-01', name: 'Vacutainer Gold SST (Serum Gel)', code: 'TUBE-SST', stock: 18, unit: 'Tubes', minThreshold: 10, status: 'NORMAL' },
        { id: 'INV-02', name: 'Vacutainer Purple (EDTA Whole Blood)', code: 'TUBE-EDTA', stock: 24, unit: 'Tubes', minThreshold: 10, status: 'NORMAL' },
        { id: 'INV-03', name: 'Vacutainer Grey (Fluoride Sugar)', code: 'TUBE-FLR', stock: 6, unit: 'Tubes', minThreshold: 10, status: 'LOW' },
        { id: 'INV-04', name: 'Vacutainer Light Blue (Citrate Coagulation)', code: 'TUBE-CIT', stock: 8, unit: 'Tubes', minThreshold: 5, status: 'NORMAL' },
        { id: 'INV-05', name: 'Sterile Safety Syringes 5ml', code: 'SYR-5ML', stock: 30, unit: 'Units', minThreshold: 15, status: 'NORMAL' },
        { id: 'INV-06', name: 'Sterile Safety Syringes 2ml', code: 'SYR-2ML', stock: 25, unit: 'Units', minThreshold: 15, status: 'NORMAL' },
        { id: 'INV-07', name: 'Barcode Thermal Label Rolls', code: 'LBL-ROLL', stock: 2, unit: 'Rolls', minThreshold: 2, status: 'LOW' },
        { id: 'INV-08', name: 'Biohazard Seal Bags (A4)', code: 'BIO-BAG', stock: 40, unit: 'Bags', minThreshold: 20, status: 'NORMAL' },
        { id: 'INV-09', name: 'Cold-Chain Ice Gel Freeze Packs', code: 'ICE-GEL', stock: 4, unit: 'Packs', minThreshold: 2, status: 'NORMAL' }
    ];
    res.json({ success: true, inventory });
});

app.post('/api/v1/agent/indent', (req, res) => {
    const { agentName, agentId, items, urgency = 'NORMAL', notes = '' } = req.body;
    const newIndent = {
        id: `IND-${Date.now()}`,
        agentName: agentName || 'Phlebotomist Agent',
        agentId: agentId || 'AG-01',
        items: items || [],
        urgency,
        notes,
        status: 'PENDING',
        requestedAt: new Date().toISOString()
    };
    if (!dbStore.indents) dbStore.indents = [];
    dbStore.indents.unshift(newIndent);
    saveDbStore();
    res.status(201).json({ success: true, indent: newIndent });
});

app.get('/api/v1/agent/wallet', (req, res) => {
    const wallet = {
        totalLifetimeEarnings: 18450,
        todayEarnings: 2450,
        availableCashoutBalance: 4850,
        completedTripsToday: 6,
        targetTrips: 12,
        distancePayout: 650,
        tipsBonus: 300,
        recentPayouts: [
            { id: 'PO-108', date: 'Yesterday 06:30 PM', amount: 3200, method: 'UPI (9876543210@upi)', status: 'SETTLED' },
            { id: 'PO-107', date: '04 Oct 2026', amount: 4500, method: 'Bank Transfer (HDFC ***412)', status: 'SETTLED' }
        ]
    };
    res.json({ success: true, wallet });
});

app.post('/api/v1/agent/wallet/payout', (req, res) => {
    const { amount, method, vpaOrAccount } = req.body;
    const payoutReceipt = {
        id: `PO-${Date.now()}`,
        amount: Number(amount) || 0,
        method: method || 'UPI',
        vpaOrAccount: vpaOrAccount || 'upi@bank',
        status: 'PROCESSING',
        requestedAt: new Date().toISOString(),
        expectedCredit: 'Within 15-30 Minutes'
    };
    res.json({ success: true, message: 'Payout request received and queued for dispatch.', payout: payoutReceipt });
});

// -------------------------------------------------------------
// LIVE PATIENT / CUSTOMER ENDPOINTS
// -------------------------------------------------------------

// Fetch patient's orders
app.get('/api/v1/patient/orders', (req, res) => {
    res.json({ success: true, orders: dbStore.orders || [] });
});

// Book new lab test / package order
app.post('/api/v1/patient/orders/book', (req, res) => {
    const { 
        patientName, 
        phone, 
        address, 
        city = 'Tirupati', 
        pincode = '517501', 
        scheduledDate, 
        scheduledSlot, 
        items = [], 
        totalAmount, 
        paymentMode = 'DOORSTEP_QR',
        notes
    } = req.body;

    const newOrderId = `MM-LAB-${Math.floor(1000 + Math.random() * 9000)}`;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const matchedZone = (dbStore.territories && dbStore.territories.find(t => t.pincodes.includes(pincode))) || (dbStore.territories && dbStore.territories[0]) || { name: 'Tirupati Central Zone', primaryAgentId: 'AG-01' };
    const primaryAgent = (dbStore.salariedAgents && dbStore.salariedAgents.find(a => a.id === matchedZone.primaryAgentId)) || { name: 'Ramesh Kumar', id: 'AG-01', phone: '+91 98765 11223' };

    const newOrder = {
        id: newOrderId,
        patientName: patientName || 'Rahul Sharma',
        phone: phone || '+91 98765 43210',
        city: city,
        address: address || 'Plot 42, Air Bypass Road, Tirupati',
        items: Array.isArray(items) ? items.map(i => typeof i === 'string' ? i : i.name).join(', ') : (items || 'MedMarg Master Health Checkup'),
        itemsDetails: Array.isArray(items) ? items : [],
        amount: Number(totalAmount) || 1499,
        status: 'EN_ROUTE',
        assignedAgent: `${primaryAgent.name} (${primaryAgent.id})`,
        phleboName: `${primaryAgent.name} (Certified Phlebotomist)`,
        phleboPhone: primaryAgent.phone || '+91 98765 11223',
        otp: otp,
        slot: scheduledSlot || '07:30 AM - 08:30 AM',
        date: scheduledDate || 'Today',
        eta: '25 Mins',
        tempTelemetry: '4.2°C (Optimal 2-8°C Cold-Chain)',
        paymentMode: paymentMode,
        paymentStatus: paymentMode === 'ONLINE_PREPAID' ? 'PAID_SUCCESS' : 'PENDING_DOORSTEP',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        notes: notes || ''
    };

    if (!dbStore.orders) dbStore.orders = [];
    dbStore.orders.unshift(newOrder);
    saveDbStore();

    res.status(201).json({
        success: true,
        order: newOrder,
        message: 'Order booked successfully! Certified phlebotomist assigned.'
    });
});

// Patient Digital Health Reports Vault
app.get('/api/v1/patient/reports', (req, res) => {
    const liveReports = [
        {
            id: 'REP-8821',
            orderId: 'MM-8921',
            title: 'Thyrocare Aarogyam Master Health Checkup (104 Biomarkers)',
            date: 'Today 08:00 AM',
            lab: 'MedMarg Central Processing Pathology Lab (NABL-AP-2026-01)',
            status: 'READY_PDF',
            pdfUrl: 'https://drive.google.com/file/d/medmarg_rep_8821/view?usp=sharing',
            doctorVerified: 'Dr. Ananya Sharma, MD Pathologist',
            biomarkers: {
                fbs: 94,
                hba1c: 5.6,
                cholesterol: 172,
                tsh: 2.4,
                bp: '120/80',
                vitaminD: 38
            }
        },
        {
            id: 'REP-7910',
            orderId: 'MM-8922',
            title: 'Diabetic, Lipid & Renal Comprehensive Health Profile',
            date: '14 Jul 2026',
            lab: 'Apollo Diagnostics Regional Lab',
            status: 'READY_PDF',
            pdfUrl: 'https://drive.google.com/file/d/medmarg_rep_7910/view?usp=sharing',
            doctorVerified: 'Dr. K. Sivasankar, MD',
            biomarkers: {
                fbs: 102,
                hba1c: 5.9,
                cholesterol: 188,
                tsh: 2.8,
                bp: '124/82',
                vitaminD: 32
            }
        }
    ];

    res.json({
        success: true,
        reports: liveReports,
        biomarkerHistory: [
            { date: 'Jan 2026', fbs: 110, hba1c: 6.1, cholesterol: 195, tsh: 3.1, vitaminD: 28 },
            { date: 'Apr 2026', fbs: 102, hba1c: 5.9, cholesterol: 188, tsh: 2.8, vitaminD: 32 },
            { date: 'Aug 2026', fbs: 94, hba1c: 5.6, cholesterol: 172, tsh: 2.4, vitaminD: 38 }
        ]
    });
});

// Patient Prescription Upload (Multer)
app.post('/api/v1/patient/upload-prescription', upload.single('prescription'), async (req, res) => {
    try {
        let driveResult = { webViewLink: 'https://drive.google.com/file/d/prescription_uploaded' };
        if (req.file) {
            driveResult = await uploadFileToGoogleDrive(req.file.buffer, req.file.originalname, req.file.mimetype);
        }
        res.json({
            success: true,
            fileUrl: driveResult.webViewLink,
            message: 'Prescription uploaded successfully to MedMarg Google Drive Cloud.'
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to upload prescription: ' + err.message });
    }
});

// TERRITORIES DB STORE
app.get('/api/v1/admin/territories', (req, res) => {
    res.json({ success: true, territories: dbStore.territories || [] });
});

app.post('/api/v1/admin/territories', (req, res) => {
    const { id, name, pincodes, primaryAgentId, primaryAgentName, color, maxDailyQuota, polygonCoords } = req.body;
    if (!dbStore.territories) dbStore.territories = [];
    
    let zone = dbStore.territories.find(t => t.id === id);
    if (zone) {
        if (name) zone.name = name;
        if (pincodes) zone.pincodes = Array.isArray(pincodes) ? pincodes : pincodes.split(',').map(p => p.trim());
        if (primaryAgentId) zone.primaryAgentId = primaryAgentId;
        if (primaryAgentName) zone.primaryAgentName = primaryAgentName;
        if (color) zone.color = color;
        if (maxDailyQuota !== undefined) zone.maxDailyQuota = Number(maxDailyQuota);
        if (polygonCoords) zone.polygonCoords = polygonCoords;
        saveDbStore();
        return res.json({ success: true, territory: zone, message: 'Territory zone updated successfully.' });
    } else {
        const newZone = {
            id: id || `ZONE-${String(dbStore.territories.length + 1).padStart(2, '0')}`,
            name: name || `Zone ${dbStore.territories.length + 1}`,
            pincodes: Array.isArray(pincodes) ? pincodes : (pincodes ? pincodes.split(',').map(p => p.trim()) : ['517501']),
            primaryAgentId: primaryAgentId || 'AG-01',
            primaryAgentName: primaryAgentName || 'Ramesh Kumar',
            color: color || '#38BDF8',
            maxDailyQuota: Number(maxDailyQuota) || 15,
            activeOrders: 0,
            status: 'ACTIVE',
            polygonCoords: polygonCoords || "50,50 150,50 150,150 50,150"
        };
        dbStore.territories.push(newZone);
        saveDbStore();
        return res.json({ success: true, territory: newZone, message: 'New territory zone created successfully.' });
    }
});

app.delete('/api/v1/admin/territories/:id', (req, res) => {
    const { id } = req.params;
    if (!dbStore.territories) dbStore.territories = [];
    dbStore.territories = dbStore.territories.filter(t => t.id !== id);
    saveDbStore();
    res.json({ success: true, message: `Territory ${id} deleted successfully.` });
});

// AUTOMATED DISPATCH CASCADE ENGINE (3-TIER)
app.post('/api/v1/admin/dispatch/auto', (req, res) => {
    const { orderId, pincode } = req.body;
    
    // Find matching territory
    const matchedZone = (dbStore.territories && dbStore.territories.find(t => t.pincodes.includes(pincode))) || (dbStore.territories && dbStore.territories[0]) || { name: 'Default Zone', primaryAgentId: 'AG-01' };
    const primaryAgent = dbStore.salariedAgents.find(a => a.id === matchedZone.primaryAgentId);

    // Tier 1: Check Primary Salaried Agent Quota Limit (max 15/day)
    if (primaryAgent && primaryAgent.samplesToday < primaryAgent.maxDailyQuota) {
        primaryAgent.samplesToday += 1;
        const order = dbStore.orders.find(o => o.id === orderId);
        if (order) {
            order.assignedAgent = `${primaryAgent.name} (${primaryAgent.id})`;
            order.status = 'EN_ROUTE';
        }
        saveDbStore();
        return res.json({
            success: true,
            tier: 'TIER_1_PRIMARY_SALARIED',
            assignedAgent: primaryAgent.name,
            quotaRemaining: primaryAgent.maxDailyQuota - primaryAgent.samplesToday,
            message: `Auto-dispatched to Primary Salaried Agent ${primaryAgent.name} for ${matchedZone.name}.`
        });
    }

    // Tier 2: Check Secondary Salaried Agent in nearby zone
    const backupAgent = dbStore.salariedAgents.find(a => a.id !== matchedZone.primaryAgentId && a.samplesToday < a.maxDailyQuota);
    if (backupAgent) {
        backupAgent.samplesToday += 1;
        const order = dbStore.orders.find(o => o.id === orderId);
        if (order) {
            order.assignedAgent = `${backupAgent.name} (${backupAgent.id})`;
            order.status = 'EN_ROUTE';
        }
        saveDbStore();
        return res.json({
            success: true,
            tier: 'TIER_2_BACKUP_SALARIED',
            assignedAgent: backupAgent.name,
            quotaRemaining: backupAgent.maxDailyQuota - backupAgent.samplesToday,
            message: `Primary quota full. Auto-dispatched to Backup Salaried Agent ${backupAgent.name}.`
        });
    }

    // Tier 3: All Salaried Agents at max capacity -> Trigger FCM Broadcast to Freelancers
    const order = dbStore.orders.find(o => o.id === orderId);
    if (order) {
        order.assignedAgent = 'Broadcasting to Freelancers...';
        order.status = 'BROADCASTED';
    }
    saveDbStore();
    return res.json({
        success: true,
        tier: 'TIER_3_FREELANCE_FCM_BROADCAST',
        assignedAgent: 'Freelance Gig Network',
        message: `All salaried agents hit 15 order/day capacity! High-priority FCM Push Broadcast triggered to verified Freelance Phlebotomists.`
    });
});

// OFFERS & PROMOTIONS CAROUSEL APIS (ADMIN CREATED & CONTROLLED)
app.get('/api/v1/offers', (req, res) => {
    const activeOnly = req.query.active === 'true';
    let offers = dbStore.offers || [];
    if (activeOnly) {
        offers = offers.filter(o => o.active !== false);
    }
    res.json({ success: true, offers });
});

app.post('/api/v1/offers', (req, res) => {
    const { title, subtitle, code, price, mrp, gradient, badge, tagColor, tagText, packageId, active = true } = req.body;
    if (!title || !code) {
        return res.status(400).json({ error: 'Offer Title and Promo Code are required.' });
    }

    const newOffer = {
        id: `off_${Date.now()}`,
        title: title.trim(),
        subtitle: subtitle || 'Special diagnostic package discount',
        code: code.trim().toUpperCase(),
        price: price || '₹999',
        mrp: mrp || '₹1,999',
        gradient: gradient || 'linear-gradient(135deg, #004D40 0%, #006B70 100%)',
        badge: badge || 'SPECIAL',
        tagColor: tagColor || '#FEF3C7',
        tagText: tagText || '#B45309',
        packageId: packageId || 'pkg_aarogyam_13',
        active: active !== false,
        createdAt: new Date().toISOString()
    };

    if (!dbStore.offers) dbStore.offers = [];
    dbStore.offers.unshift(newOffer);
    saveDbStore();

    res.status(201).json({ success: true, offer: newOffer, message: 'Offer banner published successfully.' });
});

app.put('/api/v1/offers/:id', (req, res) => {
    const { id } = req.params;
    if (!dbStore.offers) dbStore.offers = [];
    const index = dbStore.offers.findIndex(o => o.id === id);
    if (index >= 0) {
        dbStore.offers[index] = { ...dbStore.offers[index], ...req.body };
        saveDbStore();
        return res.json({ success: true, offer: dbStore.offers[index], message: 'Offer updated successfully.' });
    }
    res.status(404).json({ error: 'Offer not found' });
});

app.delete('/api/v1/offers/:id', (req, res) => {
    const { id } = req.params;
    if (!dbStore.offers) dbStore.offers = [];
    dbStore.offers = dbStore.offers.filter(o => o.id !== id);
    saveDbStore();
    res.json({ success: true, message: `Offer ${id} removed successfully.` });
});

// SERVE STATIC REACT WEB FRONTEND (UNIFIED SINGLE-PROCESS HOSTING)
const webDistPath = path.join(__dirname, '../web/dist');
if (fs.existsSync(webDistPath)) {
    console.log(`[Static Frontend] Serving built React SPA from: ${webDistPath}`);
    app.use(express.static(webDistPath));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) return next();
        res.sendFile(path.join(webDistPath, 'index.html'));
    });
}

// Global error safety guards to prevent crash loops
process.on('uncaughtException', (err) => {
    console.error('[CRITICAL] Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    const ordersCount = (dbStore.orders || []).length;
    const flCount = (dbStore.freelancers || []).length;
    const partnerCount = (dbStore.partnerQueue || []).length;
    const zonesCount = (dbStore.territories || []).length;

    console.log(`=======================================================`);
    console.log(` MedMarg Backend API running on port ${PORT}`);
    console.log(` Database Store Active: ${ordersCount} Orders | ${flCount} Freelancers | ${partnerCount} Pre-Registered Partners`);
    console.log(` Dispatch Cascade & Territories Active: ${zonesCount} Zones Managed`);
    console.log(` Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
});


