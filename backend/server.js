const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { uploadFileToGoogleDrive } = require('./services/googleDriveService');

const app = express();

// SAFE PORT CHECK FOR HOSTINGER VPS
// Defaults to port 5080 (avoiding 5000-5009 which are in active use)
const PORT = process.env.PORT || 5080;

app.use(cors());
app.use(express.json());

// In-memory multer storage for streaming directly to Google Drive
const upload = multer({ storage: multer.memoryStorage() });

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        service: 'MedMarg Backend API',
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

// SINGLE LOGIN & ROLE AUTO-DETECTION ENDPOINT
app.post('/api/v1/auth/login', (req, res) => {
    const { identifier } = req.body;

    if (!identifier) {
        return res.status(400).json({ error: 'Mobile, Email or ABHA identifier is required.' });
    }

    const idLower = identifier.trim().toLowerCase();

    // Auto-detect role based on identifier or credentials
    let detectedRole = 'PATIENT';
    let name = 'Patient User';
    let organization = 'Bangalore, Indiranagar';

    if (idLower.includes('lab') || idLower.includes('lal') || idLower.includes('pathlabs')) {
        detectedRole = 'DIAGNOSTIC_LAB';
        name = 'Dr. Lal PathLabs Admin';
        organization = 'Dr. Lal PathLabs (NABL Certified)';
    } else if (idLower.includes('scan') || idLower.includes('aarthi') || idLower.includes('mri')) {
        detectedRole = 'SCAN_CENTER';
        name = 'Aarthi Scans Operations';
        organization = 'Aarthi Scans & Radiology Center (3.0T MRI)';
    } else if (idLower.includes('dr') || idLower.includes('doctor') || idLower.includes('ananya')) {
        detectedRole = 'DOCTOR';
        name = 'Dr. Ananya Sharma';
        organization = 'MedMarg Care Clinic (In-Clinic OPD Practice)';
    } else if (idLower.includes('pharmacy') || idLower.includes('chemist') || idLower.includes('medplus')) {
        detectedRole = 'PHARMACY';
        name = 'MedPlus Chemist Admin';
        organization = 'MedPlus Pharmacy (Generic & Branded Dispenser)';
    } else if (idLower.includes('admin')) {
        detectedRole = 'ADMIN';
        name = 'MedMarg Super Admin';
        organization = 'MedMarg Platform Governance';
    }

    return res.json({
        success: true,
        token: `jwt_medmarg_${Date.now()}`,
        user: {
            id: `usr_${Date.now()}`,
            name,
            identifier,
            role: detectedRole,
            organization
        }
    });
});

// GOOGLE DRIVE FILE & REPORT UPLOAD ENDPOINT
// Uploads PDF reports or prescriptions to Google Drive and returns shareable webViewLink
app.post('/api/v1/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        const { originalname, buffer, mimetype } = req.file;

        // Upload to Google Drive folder
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

// MULTI-LAB DIAGNOSTIC TESTS COMPARISON API
app.get('/api/v1/tests', (req, res) => {
    res.json([
        {
            id: 't_lipid',
            name: 'Lipid Profile (Complete Cholesterol)',
            category: 'Heart Health',
            parametersCount: 8,
            sampleType: 'Blood',
            fastingRequiredHours: 12,
            labs: [
                { labName: 'Apollo Diagnostics', price: 499, mrp: 850, tatHours: 6, isNabl: true, freeHomeCollection: true },
                { labName: 'Dr. Lal PathLabs', price: 549, mrp: 900, tatHours: 8, isNabl: true, freeHomeCollection: false },
                { labName: 'Thyrocare Central Lab', price: 399, mrp: 750, tatHours: 12, isNabl: true, freeHomeCollection: true }
            ]
        },
        {
            id: 't_hba1c',
            name: 'HbA1c (Glycosylated Hemoglobin)',
            category: 'Diabetes Care',
            parametersCount: 2,
            sampleType: 'Blood',
            fastingRequiredHours: 0,
            labs: [
                { labName: 'Thyrocare Central Lab', price: 299, mrp: 600, tatHours: 6, isNabl: true, freeHomeCollection: true },
                { labName: 'Apollo Diagnostics', price: 349, mrp: 650, tatHours: 4, isNabl: true, freeHomeCollection: true },
                { labName: 'Dr. Lal PathLabs', price: 399, mrp: 700, tatHours: 6, isNabl: true, freeHomeCollection: false }
            ]
        }
    ]);
});

// RADIOLOGY SCANS API
app.get('/api/v1/scans', (req, res) => {
    res.json([
        {
            id: 's_mri_brain',
            name: 'MRI Brain (Plain + Angio)',
            modality: 'MRI',
            centers: [
                { centerName: 'Aarthi Scans & Labs', machine: 'Siemens 3.0 Tesla Silent MRI', price: 3499, mrp: 6000, nextSlot: 'Today, 5:00 PM' },
                { centerName: 'Medall Diagnostic Center', machine: 'GE 1.5T Wide Bore', price: 2999, mrp: 5200, nextSlot: 'Today, 6:30 PM' }
            ]
        }
    ]);
});

// IN-MEMORY PATHOLOGY TESTS & PACKAGES STORE
let customTestsCatalog = [];
let customPackagesStore = [];

// TESTS & PACKAGES CATALOG API
app.get('/api/v1/tests', (req, res) => {
    res.json({
        success: true,
        tests: customTestsCatalog,
        packages: customPackagesStore
    });
});

// CREATE NEW INDIVIDUAL TEST API
app.post('/api/v1/tests', (req, res) => {
    const { name, category, params, sample, fasting, tat, thyrocarePrice, originalPrice, apolloPrice, lalPrice, description, yellowTag } = req.body;
    
    if (!name || !thyrocarePrice) {
        return res.status(400).json({ error: 'Test name and price are required.' });
    }

    const newTest = {
        id: `custom_test_${Date.now()}`,
        name,
        category: category || 'General Pathology',
        params: Number(params) || 1,
        sample: sample || 'Blood (Serum)',
        fasting: fasting || '10-12 hrs Fasting',
        tat: tat || '12 Hours',
        thyrocarePrice: Number(thyrocarePrice),
        originalPrice: Number(originalPrice || thyrocarePrice * 1.5),
        apolloPrice: Number(apolloPrice || thyrocarePrice * 1.4),
        lalPrice: Number(lalPrice || thyrocarePrice * 1.6),
        description: description || `${name} diagnostic pathology biomarker test.`,
        yellowTag: yellowTag || 'NEW'
    };

    customTestsCatalog.unshift(newTest);
    return res.status(201).json({ success: true, message: 'Test created successfully', test: newTest });
});

// CREATE NEW HEALTH PACKAGE (BUNDLE CREATOR) API
app.post('/api/v1/packages', (req, res) => {
    const { name, selectedTestIds, packagePrice, originalPrice, yellowTag, description, fasting, tat } = req.body;

    if (!name || !packagePrice) {
        return res.status(400).json({ error: 'Package name and package price are required.' });
    }

    const newPackage = {
        id: `pkg_${Date.now()}`,
        name,
        category: 'Aarogyam Full Body Profiles',
        includedItems: selectedTestIds || [],
        params: (selectedTestIds || []).length * 5 + 10,
        thyrocarePrice: Number(packagePrice),
        originalPrice: Number(originalPrice || packagePrice * 2),
        discountPercent: originalPrice ? Math.round(((originalPrice - packagePrice) / originalPrice) * 100) : 50,
        yellowTag: yellowTag || 'SPECIAL BUNDLE',
        description: description || `Comprehensive health checkup bundle including ${(selectedTestIds || []).length} major test profiles.`,
        sample: 'Blood (Serum) & Urine',
        fasting: fasting || '10-12 hrs Overnight Fasting',
        tat: tat || '24 Hours'
    };

    customPackagesStore.unshift(newPackage);
    return res.status(201).json({ success: true, message: 'Health package created successfully', package: newPackage });
});

// DELETE TEST OR PACKAGE
app.delete('/api/v1/tests/:id', (req, res) => {
    const { id } = req.params;
    customTestsCatalog = customTestsCatalog.filter(t => t.id !== id);
    customPackagesStore = customPackagesStore.filter(p => p.id !== id);
    return res.json({ success: true, message: `Item ${id} deleted successfully.` });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`=========================================`);
    console.log(` MedMarg Backend API running on port ${PORT}`);
    console.log(` Google Drive File Storage: ACTIVE`);
    console.log(` Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=========================================`);
});
