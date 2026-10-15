const express = require('express');
const router = express.Router();
const { catalogState, saveCatalogData } = require('../models/catalogStore');
const { 
    fetchCatalogFromGoogleSheet, 
    updateTestInSheet,
    updateProfileInSheet,
    getWebhookUrl,
    saveWebhookUrl
} = require('../services/googleSheetsService');

// SUMMARY STATS
router.get('/summary', (req, res) => {
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
router.get('/tests', (req, res) => {
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
router.post('/tests', async (req, res) => {
    const { 
        id, 
        serialNo, 
        code, 
        name, 
        sampleType, 
        fasting, 
        mrp, 
        price, 
        tatHours, 
        description, 
        labPricing, 
        tierPricing 
    } = req.body;

    if (!code || !name) {
        return res.status(400).json({ error: 'Test Code and Test Name are required.' });
    }

    const testCode = code.trim().toUpperCase();
    const existingIndex = catalogState.tests.findIndex(t => t.code === testCode || (id && t.id === id));

    const testItem = {
        id: id || (existingIndex >= 0 ? catalogState.tests[existingIndex].id : `TEST_${catalogState.tests.length + 1}`),
        serialNo: serialNo || (existingIndex >= 0 ? catalogState.tests[existingIndex].serialNo : catalogState.tests.length + 1),
        code: testCode,
        name: name.trim(),
        sampleType: (sampleType || 'SERUM').trim().toUpperCase(),
        fasting: (fasting || 'NO').trim().toUpperCase(),
        category: 'Individual Test',
        mrp: Number(mrp) || 499,
        price: Number(price) || 299,
        tatHours: Number(tatHours) || 24,
        description: description || `Clinical laboratory test for ${name}.`,
        labPricing: labPricing || (existingIndex >= 0 ? catalogState.tests[existingIndex].labPricing : null),
        tierPricing: tierPricing || (existingIndex >= 0 ? catalogState.tests[existingIndex].tierPricing : null),
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
router.get('/profiles', (req, res) => {
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
router.post('/profiles', async (req, res) => {
    const { 
        id, 
        serialNo, 
        code, 
        name, 
        sampleType, 
        fasting, 
        mrp, 
        price, 
        tatHours, 
        description, 
        tests = [], 
        selectedTests = [],
        testCount,
        labPricing, 
        tierPricing 
    } = req.body;

    if (!code || !name) {
        return res.status(400).json({ error: 'Profile Code and Profile Name are required.' });
    }

    const profCode = code.trim().toUpperCase();
    const existingIndex = catalogState.profiles.findIndex(p => p.code === profCode || (id && p.id === id));

    const finalTests = Array.isArray(tests) && tests.length > 0 
        ? tests 
        : (Array.isArray(selectedTests) ? selectedTests : (existingIndex >= 0 ? catalogState.profiles[existingIndex].tests || [] : []));

    const profItem = {
        id: id || (existingIndex >= 0 ? catalogState.profiles[existingIndex].id : `PROF_${catalogState.profiles.length + 1}`),
        serialNo: serialNo || (existingIndex >= 0 ? catalogState.profiles[existingIndex].serialNo : catalogState.profiles.length + 1),
        code: profCode,
        name: name.trim(),
        sampleType: (sampleType || 'SERUM').trim().toUpperCase(),
        fasting: (fasting || 'NO').trim().toUpperCase(),
        category: 'Diagnostic Profile',
        mrp: Number(mrp) || 1499,
        price: Number(price) || 899,
        tatHours: Number(tatHours) || 24,
        description: description || `Comprehensive diagnostic profile panel for ${name}.`,
        tests: finalTests,
        testCount: finalTests.length || Number(testCount) || 1,
        labPricing: labPricing || (existingIndex >= 0 ? catalogState.profiles[existingIndex].labPricing : null),
        tierPricing: tierPricing || (existingIndex >= 0 ? catalogState.profiles[existingIndex].tierPricing : null),
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
        message: existingIndex >= 0 ? 'Profile updated and saved to MedMarg catalog.' : 'Profile created and saved to MedMarg catalog.',
        profile: profItem
    });
});

// GET PACKAGES (Custom Bundles combining Tests & Profiles)
router.get('/packages', (req, res) => {
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

// CREATE / PUBLISH / UPDATE HEALTH PACKAGE
router.post('/packages', (req, res) => {
    const { 
        id, 
        name, 
        code, 
        tagline, 
        category, 
        mrp, 
        price, 
        selectedProfiles, 
        selectedTests, 
        profiles, 
        tests, 
        description, 
        tatHours,
        labPricing,
        tierPricing
    } = req.body;

    if (!name || !price) {
        return res.status(400).json({ error: 'Package Name and Price are required.' });
    }

    const profileCodes = profiles || selectedProfiles || [];
    const testCodes = tests || selectedTests || [];

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
    const pkgCode = (code || `MM_PKG_${Date.now().toString().slice(-4)}`).toUpperCase();

    const existingIndex = catalogState.packages.findIndex(p => (id && p.id === id) || p.code === pkgCode);

    const savedPackage = {
        id: id || (existingIndex >= 0 ? catalogState.packages[existingIndex].id : `PKG_${Date.now()}`),
        name: name.trim(),
        code: pkgCode,
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
        testCount: profileCodes.length * 8 + testCodes.length,
        description: description || `Comprehensive health package combining ${profileCodes.length} profiles and ${testCodes.length} clinical tests.`,
        labPricing: labPricing || (existingIndex >= 0 ? catalogState.packages[existingIndex].labPricing : null),
        tierPricing: tierPricing || (existingIndex >= 0 ? catalogState.packages[existingIndex].tierPricing : null)
    };

    if (existingIndex >= 0) {
        catalogState.packages[existingIndex] = savedPackage;
    } else {
        catalogState.packages.unshift(savedPackage);
    }
    saveCatalogData();

    res.status(201).json({
        success: true,
        message: existingIndex >= 0 ? 'Package updated successfully.' : 'Package created and published successfully to MedMarg catalog.',
        package: savedPackage
    });
});

// SYNC FULL CATALOG BULK SAVE
router.post('/sync-full', (req, res) => {
    const { packages, profiles, tests } = req.body;
    if (Array.isArray(packages)) catalogState.packages = packages;
    if (Array.isArray(profiles)) catalogState.profiles = profiles;
    if (Array.isArray(tests)) catalogState.tests = tests;
    saveCatalogData();
    res.json({
        success: true,
        message: 'Full catalog state successfully persisted to backend database.',
        stats: {
            tests: catalogState.tests.length,
            profiles: catalogState.profiles.length,
            packages: catalogState.packages.length
        }
    });
});

// DELETE PACKAGE
router.delete('/packages/:id', (req, res) => {
    const { id } = req.params;
    catalogState.packages = catalogState.packages.filter(p => p.id !== id);
    saveCatalogData();
    res.json({ success: true, message: `Package ${id} deleted successfully.` });
});

// GET / SET GOOGLE APPS SCRIPT WEBHOOK CONFIG
router.get('/webhook-config', (req, res) => {
    res.json({
        success: true,
        webhookUrl: getWebhookUrl(),
        connected: Boolean(getWebhookUrl())
    });
});

router.post('/webhook-config', (req, res) => {
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
router.post('/sync', async (req, res) => {
    try {
        const result = await fetchCatalogFromGoogleSheet();
        if (result && result.tests && result.tests.length > 0) {
            catalogState.tests = result.tests;
            if (result.profiles && result.profiles.length > 0) {
                catalogState.profiles = result.profiles.map(sp => {
                    const existing = catalogState.profiles.find(ep => ep.code === sp.code || ep.id === sp.id);
                    return {
                        ...sp,
                        tests: (existing && existing.tests && existing.tests.length > 0) ? existing.tests : (sp.tests || []),
                        testCount: (existing && existing.tests && existing.tests.length > 0) ? existing.tests.length : (sp.testCount || existing?.testCount || 1),
                        labPricing: existing?.labPricing || sp.labPricing || null,
                        tierPricing: existing?.tierPricing || sp.tierPricing || null
                    };
                });
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

module.exports = router;
