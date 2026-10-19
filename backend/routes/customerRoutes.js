const express = require('express');
const router = express.Router();
const { dbStore, saveDbStore } = require('../models/dataStore');

// GET ALL CUSTOMERS
router.get('/', (req, res) => {
    res.json({ success: true, customers: dbStore.customers || [] });
});

// GET OR CREATE CUSTOMER DOSSIER (Including Vitals, Family Members, Addresses)
router.get('/dossier', (req, res) => {
    const { email, phone } = req.query;
    if (!dbStore.customers) dbStore.customers = [];
    
    const emailLower = email ? email.toLowerCase().trim() : '';
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';

    let cust = dbStore.customers.find(c => 
        (emailLower && c.email && c.email.toLowerCase() === emailLower) ||
        (cleanPhone && c.phone && c.phone.replace(/[^0-9]/g, '').endsWith(cleanPhone.slice(-10)))
    );

    if (!cust && (emailLower || cleanPhone)) {
        cust = {
            id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
            name: emailLower ? emailLower.split('@')[0] : 'Valued Patient',
            phone: phone || '',
            email: emailLower,
            city: 'Tirupati',
            bloodGroup: 'O+',
            preferredLanguage: 'Telugu & English',
            needleSensitivity: 'Standard',
            abhaId: `ABHA-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
            memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            locations: [
                { id: `LOC-${Date.now()}`, label: 'Home', fullAddress: 'Air Bypass Road, Tirupati, AP - 517501', pincode: '517501', isPrimary: true }
            ],
            familyMembers: [
                { id: 'SELF', name: emailLower ? emailLower.split('@')[0] : 'Self', relation: 'Self', age: 32, gender: 'Male' }
            ],
            vitals: {},
            smartDevice: { connected: false, deviceType: null, lastSynced: null }
        };
        dbStore.customers.push(cust);
        saveDbStore();
    }

    res.json({
        success: true,
        customer: cust || null,
        smartRecommendationsRules: dbStore.clinicalRecommendationRules || [
            { id: 'RULE-GLUCOSE', conditionMetric: 'glucose', operator: '>', threshold: 110, recommendedItemCode: 'P-DM-01', recommendedItemName: 'HbA1c & Fasting Glucose Comprehensive Panel', reason: 'Fasting glucose was logged above optimal range (>110 mg/dL)', priority: 'HIGH', active: true },
            { id: 'RULE-BP', conditionMetric: 'systolic', operator: '>', threshold: 135, recommendedItemCode: 'P-CARD-02', recommendedItemName: 'Lipid Profile & Serum Electrolytes', reason: 'Elevated Systolic Blood Pressure detected (>135 mmHg)', priority: 'MEDIUM', active: true },
            { id: 'RULE-SPO2', conditionMetric: 'spo2', operator: '<', threshold: 94, recommendedItemCode: 'T-CBC-01', recommendedItemName: 'Complete Blood Count (CBC) with Differential Hemogram', reason: 'SpO2 levels below 94% recorded', priority: 'URGENT', active: true }
        ]
    });
});

// SAVE VITALS LOG (Manual or Device Sync)
router.post('/vitals', (req, res) => {
    const { email, phone, memberId = 'SELF', vitals, source = 'MANUAL', deviceMeta } = req.body;
    if (!dbStore.customers) dbStore.customers = [];

    const emailLower = email ? email.toLowerCase().trim() : '';
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';

    let cust = dbStore.customers.find(c => 
        (emailLower && c.email && c.email.toLowerCase() === emailLower) ||
        (cleanPhone && c.phone && c.phone.replace(/[^0-9]/g, '').endsWith(cleanPhone.slice(-10)))
    );

    if (!cust) {
        cust = {
            id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
            name: emailLower ? emailLower.split('@')[0] : 'Patient',
            phone: phone || '',
            email: emailLower,
            locations: [{ id: `LOC-${Date.now()}`, label: 'Home', fullAddress: 'Tirupati, AP', pincode: '517501', isPrimary: true }],
            familyMembers: [{ id: 'SELF', name: 'Self', relation: 'Self', age: 32, gender: 'Male' }],
            vitals: {}
        };
        dbStore.customers.push(cust);
    }

    if (!cust.vitals) cust.vitals = {};
    if (!cust.vitals[memberId]) cust.vitals[memberId] = { history: [] };

    const entry = {
        id: `VIT-${Date.now()}`,
        recordedAt: new Date().toISOString(),
        source: source, // 'MANUAL' | 'DEVICE' | 'PHLEBOTOMIST_VISIT'
        deviceMeta: deviceMeta || null,
        bp: vitals.bp || null, // { systolic, diastolic, pulse }
        sugar: vitals.sugar || null, // { fbs, ppbs }
        pulse: vitals.pulse || null,
        spo2: vitals.spo2 || null,
        weight: vitals.weight || null,
        heightCm: vitals.heightCm || null,
        bmi: vitals.bmi || null,
        temp: vitals.temp || null,
        phleboOrderId: vitals.phleboOrderId || null,
        phleboName: vitals.phleboName || null
    };

    cust.vitals[memberId].latest = entry;
    if (!cust.vitals[memberId].history) cust.vitals[memberId].history = [];
    cust.vitals[memberId].history.unshift(entry);

    if (source === 'DEVICE' && deviceMeta) {
        cust.smartDevice = {
            connected: true,
            deviceType: deviceMeta.type || 'Smart Health Wearable',
            deviceId: deviceMeta.id || 'DEV-W101',
            lastSynced: new Date().toISOString()
        };
    }

    saveDbStore();

    res.json({
        success: true,
        message: 'Vitals recorded successfully in database.',
        vitals: cust.vitals[memberId],
        smartDevice: cust.smartDevice
    });
});

// CONNECT / DISCONNECT SMART HEALTH DEVICE
router.post('/smart-device', (req, res) => {
    const { email, phone, action = 'CONNECT', deviceType = 'Apple Health / Google Health Connect' } = req.body;
    if (!dbStore.customers) dbStore.customers = [];

    const emailLower = email ? email.toLowerCase().trim() : '';
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';

    let cust = dbStore.customers.find(c => 
        (emailLower && c.email && c.email.toLowerCase() === emailLower) ||
        (cleanPhone && c.phone && c.phone.replace(/[^0-9]/g, '').endsWith(cleanPhone.slice(-10)))
    );

    if (cust) {
        if (action === 'CONNECT') {
            cust.smartDevice = {
                connected: true,
                deviceType,
                deviceId: `HEALTH-${Math.floor(1000 + Math.random() * 9000)}`,
                lastSynced: new Date().toISOString()
            };
        } else {
            cust.smartDevice = {
                connected: false,
                deviceType: null,
                lastSynced: null
            };
        }
        saveDbStore();
        return res.json({ success: true, smartDevice: cust.smartDevice });
    }
    res.status(404).json({ error: 'Customer not found' });
});

// ADD / UPDATE FAMILY MEMBER
router.post('/family-members', (req, res) => {
    const { email, phone, member } = req.body;
    if (!dbStore.customers) dbStore.customers = [];

    const emailLower = email ? email.toLowerCase().trim() : '';
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';

    let cust = dbStore.customers.find(c => 
        (emailLower && c.email && c.email.toLowerCase() === emailLower) ||
        (cleanPhone && c.phone && c.phone.replace(/[^0-9]/g, '').endsWith(cleanPhone.slice(-10)))
    );

    if (!cust) return res.status(404).json({ error: 'Customer not found' });

    if (!cust.familyMembers) cust.familyMembers = [{ id: 'SELF', name: 'Self', relation: 'Self', age: 32, gender: 'Male' }];
    
    const memberId = member.id || `FAM-${Date.now()}`;
    const idx = cust.familyMembers.findIndex(m => m.id === memberId);
    const memberObj = { ...member, id: memberId };

    if (idx >= 0) {
        cust.familyMembers[idx] = memberObj;
    } else {
        cust.familyMembers.push(memberObj);
    }

    saveDbStore();
    res.json({ success: true, familyMembers: cust.familyMembers });
});

// ADD / UPDATE / DELETE SAVED LOCATIONS
router.post('/locations', (req, res) => {
    const { email, phone, location, action = 'SAVE' } = req.body;
    if (!dbStore.customers) dbStore.customers = [];

    const emailLower = email ? email.toLowerCase().trim() : '';
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';

    let cust = dbStore.customers.find(c => 
        (emailLower && c.email && c.email.toLowerCase() === emailLower) ||
        (cleanPhone && c.phone && c.phone.replace(/[^0-9]/g, '').endsWith(cleanPhone.slice(-10)))
    );

    if (!cust) return res.status(404).json({ error: 'Customer not found' });
    if (!cust.locations) cust.locations = [];

    if (action === 'DELETE') {
        cust.locations = cust.locations.filter(l => l.id !== location.id);
    } else {
        const locId = location.id || `LOC-${Date.now()}`;
        if (location.isPrimary) {
            cust.locations.forEach(l => { l.isPrimary = false; });
        }
        const idx = cust.locations.findIndex(l => l.id === locId);
        const locObj = { ...location, id: locId };
        if (idx >= 0) {
            cust.locations[idx] = locObj;
        } else {
            cust.locations.push(locObj);
        }
    }

    saveDbStore();
    res.json({ success: true, locations: cust.locations });
});

// CLINICAL RECOMMENDATION RULES (ADMIN / CLINICAL TEAM CONTROL)
router.get('/recommendation-rules', (req, res) => {
    const rules = dbStore.clinicalRecommendationRules || [
        { id: 'RULE-GLUCOSE', conditionMetric: 'glucose', operator: '>', threshold: 110, recommendedItemCode: 'P-DM-01', recommendedItemName: 'HbA1c & Fasting Glucose Comprehensive Panel', reason: 'Fasting glucose was logged above optimal range (>110 mg/dL)', priority: 'HIGH', active: true, endorsedBy: 'Clinical Pathology Lead' },
        { id: 'RULE-BP', conditionMetric: 'systolic', operator: '>', threshold: 135, recommendedItemCode: 'P-CARD-02', recommendedItemName: 'Lipid Profile & Serum Electrolytes', reason: 'Elevated Systolic Blood Pressure detected (>135 mmHg)', priority: 'MEDIUM', active: true, endorsedBy: 'Clinical Pathology Lead' },
        { id: 'RULE-SPO2', conditionMetric: 'spo2', operator: '<', threshold: 94, recommendedItemCode: 'T-CBC-01', recommendedItemName: 'Complete Blood Count (CBC) with Differential Hemogram', reason: 'SpO2 levels below 94% recorded', priority: 'URGENT', active: true, endorsedBy: 'Emergency Triage Review' }
    ];
    res.json({ success: true, rules });
});

router.post('/recommendation-rules', (req, res) => {
    const { rules, endorsedBy = 'Admin & Clinical Quality Officer' } = req.body;
    if (Array.isArray(rules)) {
        dbStore.clinicalRecommendationRules = rules.map(r => ({
            ...r,
            lastUpdated: new Date().toISOString(),
            endorsedBy
        }));
        saveDbStore();
        return res.json({ success: true, rules: dbStore.clinicalRecommendationRules });
    }
    res.status(400).json({ error: 'Rules must be an array' });
});

module.exports = router;
