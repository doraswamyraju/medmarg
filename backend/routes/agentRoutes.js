const express = require('express');
const router = express.Router();
const { dbStore, saveDbStore } = require('../models/dataStore');

// AGENT ROSTER
router.get('/roster', (req, res) => {
    const orders = dbStore.orders || [];
    res.json({ success: true, roster: orders });
});

// SAMPLE PICKUP & STATUS UPDATE (DOORSTEP QR DIGITAL COLLECTION)
router.post('/pickup/update', (req, res) => {
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

// BROADCAST JOBS FOR FREELANCERS
router.get('/broadcast-jobs', (req, res) => {
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

router.post('/broadcast-jobs/claim', (req, res) => {
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

// AGENT CONSUMABLES INVENTORY
router.get('/inventory', (req, res) => {
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

router.post('/indent', (req, res) => {
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

// AGENT WALLET & EARNINGS
router.get('/wallet', (req, res) => {
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

router.post('/wallet/payout', (req, res) => {
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

module.exports = router;
