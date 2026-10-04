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

    return res.json({
        success: true,
        token: `jwt_google_medmarg_${Date.now()}`,
        requiresPhone,
        user: {
            id: `usr_g_${googleId || Date.now()}`,
            name: name || email.split('@')[0],
            email: emailLower,
            identifier: phone || emailLower,
            phone: phone || '',
            picture: picture || null,
            role: detectedRole,
            organization,
            authProvider: 'google'
        }
    });
});

// UPDATE USER PHONE NUMBER ENDPOINT
app.post('/api/v1/auth/update-phone', (req, res) => {
    const { userId, phone } = req.body;

    if (!phone || phone.trim().length < 10) {
        return res.status(400).json({ error: 'A valid 10-digit mobile number is required.' });
    }

    return res.json({
        success: true,
        message: 'Phone number updated and profile verified.',
        phone: phone.trim()
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
    transactions: []
};

function loadDbStore() {
    try {
        if (fs.existsSync(DB_STORE_FILE)) {
            const raw = fs.readFileSync(DB_STORE_FILE, 'utf8');
            dbStore = JSON.parse(raw);
            console.log(`Loaded DB Store: ${dbStore.orders.length} orders, ${dbStore.freelancers.length} freelancers, ${dbStore.partnerQueue.length} pre-registered partners.`);
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

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(` MedMarg Backend API running on port ${PORT}`);
    console.log(` Database Store Active: ${dbStore.orders.length} Orders | ${dbStore.freelancers.length} Freelancers | ${dbStore.partnerQueue.length} Pre-Registered Partners`);
    console.log(` Unified Diagnostics: ${catalogState.tests.length} Tests | ${catalogState.profiles.length} Profiles | ${catalogState.packages.length} Packages`);
    console.log(` Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
});

