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
        totalCategories: (catalogState.categories || []).length,
        lastSynced: catalogState.lastSynced
    });
});

// GET DISCOVERY CATEGORIES (With Item Counts & Group Filtering)
router.get('/categories', (req, res) => {
    const { group } = req.query;
    let list = catalogState.categories || [];
    if (group && group !== 'ALL') {
        list = list.filter(c => (c.group || 'CONDITION') === group);
    }

    const categories = list.map(cat => {
        const testCount = catalogState.tests.filter(t => (t.categoryIds || []).includes(cat.id)).length;
        const profileCount = catalogState.profiles.filter(p => (p.categoryIds || []).includes(cat.id)).length;
        const packageCount = catalogState.packages.filter(pkg => (pkg.categoryIds || []).includes(cat.id)).length;
        return {
            ...cat,
            group: cat.group || 'CONDITION',
            testCount,
            profileCount,
            packageCount,
            totalItems: testCount + profileCount + packageCount
        };
    });

    // Sort by displayOrder
    categories.sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));

    res.json({
        success: true,
        total: categories.length,
        categories
    });
});

// CREATE / UPDATE DISCOVERY CATEGORY
router.post('/categories', (req, res) => {
    const { id, name, group, description, icon, imageUrl, color, displayOrder, isFeatured, active } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Category Name is required.' });
    }

    if (!Array.isArray(catalogState.categories)) {
        catalogState.categories = [];
    }

    const catId = id || `CAT_${name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_')}`;
    const existingIndex = catalogState.categories.findIndex(c => c.id === catId);

    const categoryItem = {
        id: catId,
        name: name.trim(),
        group: group || (existingIndex >= 0 ? catalogState.categories[existingIndex].group || 'CONDITION' : 'CONDITION'),
        description: description || `Diagnostic tests and packages for ${name.trim()}.`,
        icon: icon || 'square.grid.2x2.fill',
        imageUrl: imageUrl !== undefined ? imageUrl : (existingIndex >= 0 ? catalogState.categories[existingIndex].imageUrl || '' : ''),
        color: color || (existingIndex >= 0 ? catalogState.categories[existingIndex].color || '#006B70' : '#006B70'),
        displayOrder: Number(displayOrder) || (catalogState.categories.length + 1),
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : true,
        active: active !== undefined ? Boolean(active) : true
    };

    if (existingIndex >= 0) {
        catalogState.categories[existingIndex] = { ...catalogState.categories[existingIndex], ...categoryItem };
    } else {
        catalogState.categories.push(categoryItem);
    }
    saveCatalogData();

    res.status(201).json({
        success: true,
        message: existingIndex >= 0 ? 'Category updated successfully.' : 'Category created successfully.',
        category: categoryItem
    });
});

// UPLOAD CATEGORY IMAGE
router.post('/categories/upload-image', (req, res) => {
    const { image, filename } = req.body;
    if (!image) {
        return res.status(400).json({ error: 'Image data is required' });
    }

    try {
        const fs = require('fs');
        const path = require('path');
        const uploadDir = path.join(__dirname, '../uploads/categories');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const safeName = (filename || `cat_${Date.now()}.png`).replace(/[^a-zA-Z0-9_.-]/g, '_');
        const filePath = path.join(uploadDir, safeName);

        // Strip data header if present
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

        const publicUrl = `/uploads/categories/${safeName}`;
        res.json({
            success: true,
            imageUrl: publicUrl,
            message: 'Category image uploaded successfully'
        });
    } catch (err) {
        console.error('Error saving category image:', err);
        // Fallback: return raw data URI so it still works if disk write fails
        res.json({
            success: true,
            imageUrl: image,
            message: 'Image cached as data URL'
        });
    }
});

// DELETE / DEACTIVATE DISCOVERY CATEGORY
router.delete('/categories/:id', (req, res) => {
    const { id } = req.params;
    if (!catalogState.categories) return res.status(404).json({ error: 'No categories found' });

    const idx = catalogState.categories.findIndex(c => c.id === id);
    if (idx === 0 && catalogState.categories.length <= 1) {
        return res.status(400).json({ error: 'Cannot delete the only remaining discovery category.' });
    }

    if (idx >= 0) {
        const removed = catalogState.categories.splice(idx, 1)[0];
        // Clean up references in tests, profiles, packages
        catalogState.tests.forEach(t => {
            if (Array.isArray(t.categoryIds)) t.categoryIds = t.categoryIds.filter(cid => cid !== id);
        });
        catalogState.profiles.forEach(p => {
            if (Array.isArray(p.categoryIds)) p.categoryIds = p.categoryIds.filter(cid => cid !== id);
        });
        catalogState.packages.forEach(pkg => {
            if (Array.isArray(pkg.categoryIds)) pkg.categoryIds = pkg.categoryIds.filter(cid => cid !== id);
        });
        saveCatalogData();
        return res.json({ success: true, message: `Category ${removed.name} deleted successfully.` });
    }

    res.status(404).json({ error: 'Category not found.' });
});

// RESOLVE COMPOSITION HELPER (Inspects Tests + Profiles, Duplicates, Overlaps, Aggregated Specs)
router.get('/resolve-composition', (req, res) => {
    const profileCodes = (req.query.profiles ? req.query.profiles.split(',') : []).map(c => c.trim().toUpperCase()).filter(Boolean);
    const directTestCodes = (req.query.tests ? req.query.tests.split(',') : []).map(c => c.trim().toUpperCase()).filter(Boolean);

    // Resolve profiles
    const selectedProfiles = catalogState.profiles.filter(p => profileCodes.includes(p.code));
    
    // Resolve direct tests
    const selectedDirectTests = catalogState.tests.filter(t => directTestCodes.includes(t.code));

    // Map test appearances
    const testUsage = new Map(); // testCode -> array of sources ['Direct Test', 'Profile: LIPID']

    directTestCodes.forEach(code => {
        if (!testUsage.has(code)) testUsage.set(code, []);
        testUsage.get(code).push('Direct Single Test');
    });

    selectedProfiles.forEach(prof => {
        (prof.tests || []).forEach(testCode => {
            const upper = testCode.trim().toUpperCase();
            if (!testUsage.has(upper)) testUsage.set(upper, []);
            testUsage.get(upper).push(`Profile: ${prof.name} (${prof.code})`);
        });
    });

    // Detect overlaps
    const overlaps = [];
    testUsage.forEach((sources, code) => {
        if (sources.length > 1) {
            const testObj = catalogState.tests.find(t => t.code === code);
            overlaps.push({
                testCode: code,
                testName: testObj ? testObj.name : code,
                sources
            });
        }
    });

    // Unique list of all resolved test codes
    const allUniqueTestCodes = Array.from(testUsage.keys());
    const resolvedInvestigations = allUniqueTestCodes.map(code => {
        const found = catalogState.tests.find(t => t.code === code);
        return found || { code, name: code, sampleType: 'SERUM', fasting: 'NO', price: 299, mrp: 499 };
    });

    // Component Price Breakdown
    const directTestsPriceSum = selectedDirectTests.reduce((sum, t) => sum + (Number(t.price) || 0), 0);
    const directTestsMrpSum = selectedDirectTests.reduce((sum, t) => sum + (Number(t.mrp) || 0), 0);
    const profilesPriceSum = selectedProfiles.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
    const profilesMrpSum = selectedProfiles.reduce((sum, p) => sum + (Number(p.mrp) || 0), 0);
    const componentTotalOfferSum = directTestsPriceSum + profilesPriceSum;
    const componentTotalMrpSum = directTestsMrpSum + profilesMrpSum;

    // Aggregated sample types
    const sampleSet = new Set();
    resolvedInvestigations.forEach(t => {
        if (t.sampleType) {
            t.sampleType.split(',').forEach(s => sampleSet.add(s.trim()));
        }
    });
    const aggregatedSamples = Array.from(sampleSet);
    if (aggregatedSamples.length === 0) aggregatedSamples.push('SERUM');

    const requiresFasting = resolvedInvestigations.some(t => t.fasting === 'YES');

    res.json({
        success: true,
        selectedProfiles,
        selectedDirectTests,
        resolvedInvestigations,
        totalUniqueTestsCount: resolvedInvestigations.length,
        hasOverlaps: overlaps.length > 0,
        overlaps,
        priceBreakdown: {
            directTestsPriceSum,
            directTestsMrpSum,
            profilesPriceSum,
            profilesMrpSum,
            componentTotalOfferSum,
            componentTotalMrpSum
        },
        aggregatedSamples,
        fasting: requiresFasting ? 'YES' : 'NO'
    });
});

// GET TESTS (With Search, Filter by Fasting, Sample Type & Category)
router.get('/tests', (req, res) => {
    const { q, fasting, sample, categoryId, limit, page } = req.query;
    let list = catalogState.tests;

    if (categoryId) {
        list = list.filter(t => (t.categoryIds || []).includes(categoryId));
    }

    if (q) {
        const query = q.toLowerCase();
        list = list.filter(t => {
            const aliasStr = Array.isArray(t.aliasNames) ? t.aliasNames.join(' ') : (t.aliasNames || '');
            return (t.name && t.name.toLowerCase().includes(query)) ||
                (t.code && t.code.toLowerCase().includes(query)) ||
                (t.sampleType && t.sampleType.toLowerCase().includes(query)) ||
                aliasStr.toLowerCase().includes(query);
        });
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
        aliasNames,
        sampleType, 
        fasting, 
        mrp, 
        price, 
        tatHours, 
        description, 
        categoryIds,
        labPricing, 
        tierPricing 
    } = req.body;

    if (!code || !name) {
        return res.status(400).json({ error: 'Test Code and Test Name are required.' });
    }

    const testCode = code.trim().toUpperCase();
    const existingIndex = catalogState.tests.findIndex(t => t.code === testCode || (id && t.id === id));

    let parsedAliases = [];
    if (Array.isArray(aliasNames)) {
        parsedAliases = aliasNames.map(a => a.trim()).filter(Boolean);
    } else if (typeof aliasNames === 'string' && aliasNames.trim()) {
        parsedAliases = aliasNames.split(',').map(a => a.trim()).filter(Boolean);
    } else if (existingIndex >= 0 && catalogState.tests[existingIndex].aliasNames) {
        parsedAliases = catalogState.tests[existingIndex].aliasNames;
    }

    const finalCategoryIds = Array.isArray(categoryIds) && categoryIds.length > 0
        ? categoryIds
        : (existingIndex >= 0 && catalogState.tests[existingIndex].categoryIds ? catalogState.tests[existingIndex].categoryIds : ['CAT_POPULAR']);

    const testItem = {
        id: id || (existingIndex >= 0 ? catalogState.tests[existingIndex].id : `TEST_${catalogState.tests.length + 1}`),
        serialNo: serialNo || (existingIndex >= 0 ? catalogState.tests[existingIndex].serialNo : catalogState.tests.length + 1),
        code: testCode,
        name: name.trim(),
        aliasNames: parsedAliases,
        sampleType: (sampleType || 'SERUM').trim().toUpperCase(),
        fasting: (fasting || 'NO').trim().toUpperCase(),
        category: 'Individual Test',
        categoryIds: finalCategoryIds,
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

// GET PROFILES (With Search, Filter & Resolved Tests)
router.get('/profiles', (req, res) => {
    const { q, fasting, sample, categoryId } = req.query;
    let list = catalogState.profiles;

    if (categoryId) {
        list = list.filter(p => (p.categoryIds || []).includes(categoryId));
    }

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

    // Populate tests details
    const populated = list.map(prof => {
        const testDetails = (prof.tests || []).map(code => 
            catalogState.tests.find(t => t.code === code) || { code, name: code, sampleType: 'SERUM', fasting: 'NO', price: 299, mrp: 499 }
        );
        return {
            ...prof,
            testDetails
        };
    });

    res.json({
        success: true,
        total: populated.length,
        profiles: populated
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
        categoryIds,
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

    const finalCategoryIds = Array.isArray(categoryIds) && categoryIds.length > 0
        ? categoryIds
        : (existingIndex >= 0 && catalogState.profiles[existingIndex].categoryIds ? catalogState.profiles[existingIndex].categoryIds : ['CAT_POPULAR']);

    const profItem = {
        id: id || (existingIndex >= 0 ? catalogState.profiles[existingIndex].id : `PROF_${catalogState.profiles.length + 1}`),
        serialNo: serialNo || (existingIndex >= 0 ? catalogState.profiles[existingIndex].serialNo : catalogState.profiles.length + 1),
        code: profCode,
        name: name.trim(),
        sampleType: (sampleType || 'SERUM').trim().toUpperCase(),
        fasting: (fasting || 'NO').trim().toUpperCase(),
        category: 'Diagnostic Profile',
        categoryIds: finalCategoryIds,
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
    const { categoryId, q } = req.query;
    let list = catalogState.packages;

    if (categoryId) {
        list = list.filter(pkg => (pkg.categoryIds || []).includes(categoryId));
    }

    if (q) {
        const query = q.toLowerCase();
        list = list.filter(pkg => 
            (pkg.name && pkg.name.toLowerCase().includes(query)) ||
            (pkg.code && pkg.code.toLowerCase().includes(query)) ||
            (pkg.tagline && pkg.tagline.toLowerCase().includes(query))
        );
    }

    const populated = list.map(pkg => {
        const profileDetails = (pkg.profiles || []).map(code => 
            catalogState.profiles.find(p => p.code === code) || { code, name: code }
        );
        const testDetails = (pkg.tests || []).map(code => 
            catalogState.tests.find(t => t.code === code) || { code, name: code }
        );

        // Resolve investigations inside profiles
        const testCodeSet = new Set(pkg.tests || []);
        profileDetails.forEach(p => {
            (p.tests || []).forEach(tc => testCodeSet.add(tc));
        });
        const resolvedInvestigations = Array.from(testCodeSet).map(tc => 
            catalogState.tests.find(t => t.code === tc) || { code: tc, name: tc }
        );

        return {
            ...pkg,
            profileDetails,
            testDetails,
            resolvedInvestigations,
            resolvedCount: resolvedInvestigations.length
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
        categoryIds,
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

    // Resolve unique tests inside package
    const uniqueTestCodes = new Set(testCodes);
    referencedProfiles.forEach(p => {
        (p.tests || []).forEach(tc => uniqueTestCodes.add(tc));
    });

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

    const finalCategoryIds = Array.isArray(categoryIds) && categoryIds.length > 0
        ? categoryIds
        : (existingIndex >= 0 && catalogState.packages[existingIndex].categoryIds ? catalogState.packages[existingIndex].categoryIds : ['CAT_POPULAR', 'CAT_WELLNESS']);

    const savedPackage = {
        id: id || (existingIndex >= 0 ? catalogState.packages[existingIndex].id : `PKG_${Date.now()}`),
        name: name.trim(),
        code: pkgCode,
        tagline: tagline || 'Custom Curated Health Assessment Bundle',
        category: category || 'Wellness Checkup',
        categoryIds: finalCategoryIds,
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
        testCount: uniqueTestCodes.size || (profileCodes.length * 8 + testCodes.length),
        description: description || `Comprehensive health package combining ${profileCodes.length} profiles and ${testCodes.length} clinical tests.`,
        labPricing: labPricing || (existingIndex >= 0 ? catalogState.packages[existingIndex].labPricing : null),
        tierPricing: tierPricing || (existingIndex >= 0 ? catalogState.packages[existingIndex].tierPricing : null),
        active: true
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

// SYNC FULL CATALOG BULK SAVE (Protected with Safe Merge)
router.post('/sync-full', (req, res) => {
    const { packages, profiles, tests } = req.body;
    
    // SAFETY GUARD: Do not allow a stale client with 1 test to wipe out 900+ tests on server!
    if (Array.isArray(tests)) {
        if (tests.length === 0 && catalogState.tests.length > 10) {
            console.warn('[CatalogRoutes] Blocked attempt to wipe tests array from client');
        } else if (tests.length < 5 && catalogState.tests.length > 100) {
            console.warn('[CatalogRoutes] Blocked stale client payload with only 1 test from wiping 900+ server tests');
        } else {
            catalogState.tests = tests;
        }
    }
    
    if (Array.isArray(profiles)) {
        if (profiles.length === 0 && catalogState.profiles.length > 5) {
            console.warn('[CatalogRoutes] Blocked attempt to wipe profiles array');
        } else {
            // Deduplicate by normalized code
            const norm = s => (s || '').toString().trim().toUpperCase();
            const profMap = new Map();
            profiles.forEach(p => {
                const k = norm(p.code);
                if (k && !profMap.has(k)) profMap.set(k, p);
            });
            catalogState.profiles = Array.from(profMap.values());
        }
    }

    if (Array.isArray(packages)) {
        const norm = s => (s || '').toString().trim().toUpperCase();
        const pkgMap = new Map();
        packages.forEach(p => {
            const k = norm(p.code);
            if (k && !pkgMap.has(k)) pkgMap.set(k, p);
        });
        catalogState.packages = Array.from(pkgMap.values());
    }

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

// DELETE TEST
router.delete('/tests/:id', (req, res) => {
    const { id } = req.params;
    catalogState.tests = catalogState.tests.filter(t => t.id !== id && t.code !== id);
    saveCatalogData();
    res.json({ success: true, message: `Test ${id} deleted successfully.` });
});

// DELETE PROFILE
router.delete('/profiles/:id', (req, res) => {
    const { id } = req.params;
    catalogState.profiles = catalogState.profiles.filter(p => p.id !== id && p.code !== id);
    saveCatalogData();
    res.json({ success: true, message: `Profile ${id} deleted successfully.` });
});

// DELETE PACKAGE
router.delete('/packages/:id', (req, res) => {
    const { id } = req.params;
    catalogState.packages = catalogState.packages.filter(p => p.id !== id && p.code !== id);
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
