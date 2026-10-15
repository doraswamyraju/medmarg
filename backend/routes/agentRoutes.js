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

// DEFAULT INVENTORY SEED
const DEFAULT_AGENT_INVENTORY = [
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

// AGENT CONSUMABLES INVENTORY (LIVE SYNCED WITH ADMIN & STORE IN-CHARGE)
router.get('/inventory', (req, res) => {
    const agentId = req.query.agentId || 'AG-01';

    if (!dbStore.agentInventory) dbStore.agentInventory = {};
    if (!dbStore.agentInventory[agentId]) {
        dbStore.agentInventory[agentId] = JSON.parse(JSON.stringify(DEFAULT_AGENT_INVENTORY));
        saveDbStore();
    }

    const inHandInventory = dbStore.agentInventory[agentId];
    const warehouseStock = dbStore.inventoryStock || [];
    const agentIndents = (dbStore.indents || []).filter(i => !i.agentId || i.agentId === agentId || i.agentName?.includes(agentId));

    res.json({
        success: true,
        agentId,
        inventory: inHandInventory,
        warehouseStock: warehouseStock,
        indents: agentIndents
    });
});

// RAISE INDENT (STOCK REPLENISHMENT REQUEST TO ADMIN/STORE IN-CHARGE)
router.post('/indent', (req, res) => {
    const { agentName, agentId = 'AG-01', items, urgency = 'NORMAL', notes = '' } = req.body;
    const newIndent = {
        id: `IND-${Math.floor(1000 + Math.random() * 9000)}`,
        agentName: agentName || 'Ramesh Kumar (AG-01)',
        agentId: agentId || 'AG-01',
        items: items || [],
        urgency,
        notes,
        status: 'PENDING_APPROVAL',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        requestedAt: new Date().toISOString()
    };
    if (!dbStore.indents) dbStore.indents = [];
    dbStore.indents.unshift(newIndent);
    saveDbStore();
    res.status(201).json({ success: true, message: 'Stock replenishment indent submitted to Admin Store Desk.', indent: newIndent });
});

// AGENT PROFILE MANAGEMENT & GET DETAILS
router.get('/profile/:agentId', (req, res) => {
    const { agentId } = req.params;
    const agent = (dbStore.salariedAgents || []).find(a => a.id === agentId) || {
        id: agentId,
        name: 'Ramesh Kumar',
        phone: '+91 97777 77777',
        email: 'salaried@medmarg.com',
        role: 'SALARIED_AGENT',
        zone: 'Tirupati Urban & Bypass (Zone 1)',
        vehicle: 'Hero Electric Nyx EV (AP 03 EV 4821)',
        emergencyContact: '+91 94400 99881 (Spouse)',
        bloodGroup: 'B+',
        joiningDate: '12 Jan 2025',
        qualification: 'DMLT Certified Phlebotomist'
    };
    res.json({ success: true, profile: agent });
});

router.post('/profile', (req, res) => {
    const { agentId = 'AG-01', name, phone, email, vehicle, emergencyContact, bloodGroup } = req.body;
    
    if (!dbStore.salariedAgents) dbStore.salariedAgents = [];
    let agent = dbStore.salariedAgents.find(a => a.id === agentId);

    if (!agent) {
        agent = {
            id: agentId,
            name: name || 'Ramesh Kumar',
            phone: phone || '+91 97777 77777',
            email: email || 'salaried@medmarg.com',
            role: 'SALARIED_AGENT',
            zone: 'Tirupati Urban & Bypass (Zone 1)',
            vehicle: vehicle || 'Hero Electric Nyx EV (AP 03 EV 4821)',
            emergencyContact: emergencyContact || '+91 94400 99881',
            bloodGroup: bloodGroup || 'B+'
        };
        dbStore.salariedAgents.push(agent);
    } else {
        if (name) agent.name = name;
        if (phone) agent.phone = phone;
        if (email) agent.email = email;
        if (vehicle) agent.vehicle = vehicle;
        if (emergencyContact) agent.emergencyContact = emergencyContact;
        if (bloodGroup) agent.bloodGroup = bloodGroup;
    }

    saveDbStore();
    res.json({ success: true, message: 'Phlebotomist profile updated successfully.', profile: agent });
});

// DOORSTEP PAYMENTS & SETTLEMENTS LEDGER
router.get('/payments/:agentId', (req, res) => {
    const { agentId } = req.params;
    
    // Find all orders assigned to this agent with payment collected
    const orders = (dbStore.orders || []).filter(o => 
        o.assignedAgent && o.assignedAgent.includes(agentId)
    );

    const doorstepPayments = orders.map(ord => ({
        id: `TXN-${ord.id}`,
        orderId: ord.id,
        patientName: ord.patientName,
        phone: ord.phone,
        amount: Number(ord.amount || ord.totalAmount) || 899,
        paymentMode: ord.paymentMode || 'DOORSTEP_QR',
        paymentStatus: ord.paymentStatus || (ord.paymentMode === 'PREPAID_UPI' ? 'PAID_ONLINE' : 'PAID_DOORSTEP_QR'),
        date: ord.createdAt || 'Today',
        razorpayPaymentId: ord.razorpayPaymentId || `pay_qr_${ord.id}`
    }));

    const totalCollected = doorstepPayments
        .filter(p => p.paymentStatus.includes('PAID') || p.paymentStatus === 'PAID_DOORSTEP_QR')
        .reduce((sum, p) => sum + p.amount, 0);

    res.json({
        success: true,
        agentId,
        totalCollected,
        transactions: doorstepPayments
    });
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

// LIVE AGENT GPS LOCATION TELEMETRY & TRACKING
router.post('/location', (req, res) => {
    const { agentId, agentName, lat, lng, accuracy, address, heading, speed } = req.body;

    if (!lat || !lng) {
        return res.status(400).json({ error: 'Latitude and Longitude are required for agent tracking.' });
    }

    const effectiveId = agentId || 'AG-01';
    const locPayload = {
        lat: Number(lat),
        lng: Number(lng),
        accuracy: Number(accuracy) || 10,
        address: address || 'Tirupati Live Route',
        heading: heading || 0,
        speed: speed || 0,
        updatedAt: new Date().toISOString()
    };

    if (!dbStore.agentLocations) dbStore.agentLocations = {};
    dbStore.agentLocations[effectiveId] = {
        agentId: effectiveId,
        agentName: agentName || 'Ramesh Kumar',
        ...locPayload
    };

    // Update salariedAgent record if present
    if (dbStore.salariedAgents) {
        const ag = dbStore.salariedAgents.find(a => a.id === effectiveId);
        if (ag) {
            ag.lastLocation = locPayload;
            ag.lat = locPayload.lat;
            ag.lng = locPayload.lng;
        }
    }

    // Update live coordinates on any active orders assigned to this agent in EN_ROUTE status
    if (dbStore.orders) {
        dbStore.orders.forEach(ord => {
            if (ord.assignedAgent && ord.assignedAgent.includes(effectiveId) && (ord.status === 'EN_ROUTE' || ord.status === 'ENROUTE' || ord.status === 'ARRIVED')) {
                ord.phleboCoords = { lat: locPayload.lat, lng: locPayload.lng };
                ord.lastLocationPing = locPayload.updatedAt;
            }
        });
    }

    saveDbStore();

    res.json({
        success: true,
        message: 'Agent GPS location updated successfully.',
        location: locPayload
    });
});

// GET AGENT GPS LOCATION
router.get('/location/:agentId', (req, res) => {
    const { agentId } = req.params;
    const loc = dbStore.agentLocations && dbStore.agentLocations[agentId];
    if (loc) {
        return res.json({ success: true, location: loc });
    }
    // Default fallback coordinates around Tirupati central
    res.json({
        success: true,
        location: {
            agentId,
            lat: 13.6288,
            lng: 79.4192,
            accuracy: 15,
            address: 'Air Bypass Road, Tirupati (Fallback)',
            updatedAt: new Date().toISOString()
        }
    });
});

// SHIFT PUNCH-IN / PUNCH-OUT
router.post('/shift', (req, res) => {
    const { agentId = 'AG-01', agentName = 'Ramesh Kumar', status, lat, lng } = req.body;
    const isOnDuty = status === 'ON_DUTY';

    if (!dbStore.agentShifts) dbStore.agentShifts = [];
    const punchRecord = {
        id: `PUNCH-${Date.now()}`,
        agentId,
        agentName,
        status: isOnDuty ? 'ON_DUTY' : 'OFF_DUTY',
        timestamp: new Date().toISOString(),
        coords: (lat && lng) ? { lat: Number(lat), lng: Number(lng) } : null
    };

    dbStore.agentShifts.unshift(punchRecord);

    if (dbStore.salariedAgents) {
        const ag = dbStore.salariedAgents.find(a => a.id === agentId);
        if (ag) {
            ag.isOnDuty = isOnDuty;
            ag.lastPunch = punchRecord;
        }
    }

    saveDbStore();

    res.json({
        success: true,
        isOnDuty,
        message: isOnDuty ? 'Shift started! You are now active for auto-dispatch.' : 'Shift ended. Marked offline.',
        record: punchRecord
    });
});

// GET SALARIED QUOTA & PERFORMANCE STATS
router.get('/quota-stats', (req, res) => {
    const agentId = req.query.agentId || 'AG-01';
    const agent = (dbStore.salariedAgents || []).find(a => a.id === agentId) || {
        id: 'AG-01',
        name: 'Ramesh Kumar',
        samplesToday: 8,
        maxDailyQuota: 15,
        rating: 4.9,
        zone: 'Tirupati Urban & Bypass (Zone 1)'
    };

    const completed = (dbStore.orders || []).filter(o => 
        o.assignedAgent && o.assignedAgent.includes(agentId) && (o.status === 'SAMPLE_COLLECTED' || o.status === 'TRANSFERRED_TO_LAB')
    ).length;

    res.json({
        success: true,
        agentId: agent.id,
        name: agent.name,
        samplesToday: agent.samplesToday || completed || 8,
        maxDailyQuota: agent.maxDailyQuota || 15,
        quotaRemaining: Math.max(0, (agent.maxDailyQuota || 15) - (agent.samplesToday || completed || 8)),
        rating: agent.rating || 4.9,
        zone: agent.zone || 'Tirupati Urban (Zone 1)',
        onTimeRate: '98%',
        fastingAccuracy: '100%'
    });
});

// NABL LAB SAMPLE BATCH HANDOVER
router.post('/lab-handover', (req, res) => {
    const { labId, labName, samplesCount, temp, otp, technicianName } = req.body;

    const manifest = {
        id: `HND-${Date.now()}`,
        labId: labId || 'LAB-01',
        labName: labName || 'MedMarg Central NABL Pathology Lab',
        samplesCount: Number(samplesCount) || 1,
        bagTemp: temp || '4.2°C',
        handoverOtp: otp || '4821',
        technicianName: technicianName || 'Dr. Srinivasulu MLT',
        timestamp: new Date().toISOString(),
        status: 'ACCEPTED_BY_LAB'
    };

    if (!dbStore.handoverManifests) dbStore.handoverManifests = [];
    dbStore.handoverManifests.unshift(manifest);

    // Update orders that were collected by agent to IN_LAB_PROCESSING
    if (dbStore.orders) {
        dbStore.orders.forEach(ord => {
            if (ord.status === 'SAMPLE_COLLECTED') {
                ord.status = 'IN_LAB_PROCESSING';
                ord.labDestination = manifest.labName;
                ord.labHandoverAt = manifest.timestamp;
            }
        });
    }

    saveDbStore();

    res.json({
        success: true,
        message: `Successfully transferred ${manifest.samplesCount} specimens to ${manifest.labName}.`,
        manifest
    });
});

module.exports = router;

