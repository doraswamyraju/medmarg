const express = require('express');
const router = express.Router();
const { dbStore, saveDbStore } = require('../models/dataStore');

// AGENT ROSTER - Exclude CANCELLED orders from active field dispatch
router.get('/roster', (req, res) => {
    const rawOrders = dbStore.orders || [];
    const activeOrders = rawOrders.filter(o => o.status !== 'CANCELLED');
    res.json({ success: true, roster: activeOrders });
});

// SAMPLE PICKUP & STATUS UPDATE (DOORSTEP VISIT & DIGITAL EXECUTION)
router.post('/pickup/update', (req, res) => {
    const { orderId, status, barcode, arrivalPhoto, samplePhotos, paymentCollected, paymentMode, sendReviewRequest, notes, vitals } = req.body;
    const order = (dbStore.orders || []).find(o => o.id === orderId);
    if (order) {
        if (status) order.status = status;
        if (barcode) order.barcode = barcode;
        if (arrivalPhoto) order.arrivalPhoto = arrivalPhoto;
        if (samplePhotos) order.samplePhotos = samplePhotos;
        if (paymentCollected) {
            order.paymentStatus = 'PAID_DOORSTEP_QR';
            order.paymentMode = paymentMode || 'DOORSTEP_QR';
            order.paymentCollectedAt = new Date().toISOString();
        }
        if (typeof sendReviewRequest === 'boolean') {
            order.reviewRequestSent = sendReviewRequest;
            if (sendReviewRequest) {
                order.reviewStatus = 'PENDING_CUSTOMER_FEEDBACK';
            }
        }
        if (notes) order.agentNotes = notes;

        // Bedside Vitals Checkup by Phlebotomist
        if (vitals && (vitals.bp || vitals.pulse || vitals.spo2 || vitals.sugar || vitals.temp)) {
            order.phleboVitals = {
                recordedAt: new Date().toISOString(),
                phleboName: order.assignedAgent || order.phleboName || 'Certified Phlebotomist',
                bp: vitals.bp || null, // e.g. "120/80" or { systolic: 120, diastolic: 80 }
                pulse: vitals.pulse || null,
                spo2: vitals.spo2 || null,
                sugar: vitals.sugar || null,
                temp: vitals.temp || null,
                notes: vitals.notes || ''
            };

            // Mirror into customer profile if exists
            const custPhone = (order.phone || order.patientPhone || '').replace(/[^0-9]/g, '');
            if (dbStore.customers && custPhone) {
                const cust = dbStore.customers.find(c => c.phone && c.phone.replace(/[^0-9]/g, '').endsWith(custPhone.slice(-10)));
                if (cust) {
                    if (!cust.vitals) cust.vitals = {};
                    if (!cust.vitals.SELF) cust.vitals.SELF = { history: [] };
                    const entry = {
                        id: `VIT-PHLEBO-${Date.now()}`,
                        recordedAt: new Date().toISOString(),
                        source: 'PHLEBOTOMIST_VISIT',
                        phleboOrderId: order.id,
                        phleboName: order.assignedAgent || order.phleboName,
                        bp: typeof vitals.bp === 'string' ? { 
                            systolic: parseInt(vitals.bp.split('/')[0]) || 120, 
                            diastolic: parseInt(vitals.bp.split('/')[1]) || 80 
                        } : vitals.bp,
                        pulse: vitals.pulse ? parseInt(vitals.pulse) : null,
                        spo2: vitals.spo2 ? parseInt(vitals.spo2) : null,
                        sugar: vitals.sugar ? { fbs: parseInt(vitals.sugar) } : null,
                        temp: vitals.temp || null
                    };
                    cust.vitals.SELF.latest = entry;
                    if (!cust.vitals.SELF.history) cust.vitals.SELF.history = [];
                    cust.vitals.SELF.history.unshift(entry);
                }
            }
        }

        order.lastUpdated = new Date().toISOString();
        saveDbStore();
        return res.json({ success: true, order });
    }
    res.status(404).json({ error: 'Pickup order not found' });
});

// ASSESS & ASSIGN KIT FROM IN-HAND INVENTORY TO ORDER
router.post('/order/assign-kit', (req, res) => {
    const { orderId, agentId = 'AG-01', kitItems = [] } = req.body;
    const order = (dbStore.orders || []).find(o => o.id === orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (!dbStore.agentInventory) dbStore.agentInventory = {};
    if (!dbStore.agentInventory[agentId]) {
        dbStore.agentInventory[agentId] = JSON.parse(JSON.stringify(DEFAULT_AGENT_INVENTORY));
    }

    const currentInventory = dbStore.agentInventory[agentId];
    const shortages = [];

    // Check if sufficient supplies exist in in-hand kit
    kitItems.forEach(item => {
        const invItem = currentInventory.find(i => 
            (item.code && i.code === item.code) || 
            (item.name && i.name.toLowerCase().includes(item.name.toLowerCase()))
        );
        const needed = item.qty || 1;
        if (!invItem || invItem.stock < needed) {
            shortages.push({
                name: item.name || item.code,
                code: item.code,
                needed,
                available: invItem ? invItem.stock : 0
            });
        }
    });

    if (shortages.length > 0) {
        return res.status(400).json({
            success: false,
            insufficient: true,
            shortages,
            message: `Insufficient in-hand supplies! You are short of: ${shortages.map(s => s.name).join(', ')}. Please place an indent and visit the MedMarg Store.`
        });
    }

    // Deduct kit from in-hand inventory
    kitItems.forEach(item => {
        const invItem = currentInventory.find(i => 
            (item.code && i.code === item.code) || 
            (item.name && i.name.toLowerCase().includes(item.name.toLowerCase()))
        );
        if (invItem) {
            invItem.stock = Math.max(0, invItem.stock - (item.qty || 1));
        }
    });

    order.kitAssigned = true;
    order.kitAssignedAt = new Date().toISOString();
    order.assignedKitItems = kitItems;
    saveDbStore();

    res.json({
        success: true,
        message: 'Kit supplies successfully assigned and reserved from in-hand inventory.',
        remainingInventory: currentInventory,
        order
    });
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
// STRICT AUDIT RULE: Agent only holds consumables explicitly allotted from Central Warehouse!
router.get('/inventory', (req, res) => {
    const agentId = req.query.agentId || 'AG-01';

    if (!dbStore.agentInventory) dbStore.agentInventory = {};
    
    // Check if agent has an explicit allocated record, or look in dbStore.agentInventories
    if (!dbStore.agentInventory[agentId]) {
        const adminAgentRecord = (dbStore.agentInventories || []).find(a => a.agentId === agentId);
        if (adminAgentRecord && adminAgentRecord.inHandStock) {
            // Map admin format to agent item list
            const mapped = [];
            const ih = adminAgentRecord.inHandStock;
            if (ih.sstTubes) mapped.push({ id: 'INV-SST', name: 'Vacutainer Gold SST (Serum Gel)', code: 'TUBE-SST', stock: ih.sstTubes, unit: 'Tubes', minThreshold: 5 });
            if (ih.edtaTubes) mapped.push({ id: 'INV-EDTA', name: 'Vacutainer Purple (EDTA Whole Blood)', code: 'TUBE-EDTA', stock: ih.edtaTubes, unit: 'Tubes', minThreshold: 5 });
            if (ih.fluorideTubes) mapped.push({ id: 'INV-FLR', name: 'Vacutainer Grey (Fluoride Sugar)', code: 'TUBE-FLR', stock: ih.fluorideTubes, unit: 'Tubes', minThreshold: 5 });
            if (ih.needles21g) mapped.push({ id: 'INV-SYR', name: 'Sterile Safety Syringes 5ml', code: 'SYR-5ML', stock: ih.needles21g, unit: 'Units', minThreshold: 10 });
            if (ih.barcodeRolls) mapped.push({ id: 'INV-LBL', name: 'Barcode Thermal Label Rolls', code: 'LBL-ROLL', stock: ih.barcodeRolls, unit: 'Rolls', minThreshold: 1 });
            if (ih.fullBodyKits) mapped.push({ id: 'INV-KIT', name: 'Standard Phlebotomy Sample Collection Kit', code: 'KIT-101', stock: ih.fullBodyKits, unit: 'Kits', minThreshold: 2 });
            dbStore.agentInventory[agentId] = mapped;
        } else {
            // New agent or freelance agent with 0 allotted stock
            dbStore.agentInventory[agentId] = [];
        }
        saveDbStore();
    }

    const inHandInventory = dbStore.agentInventory[agentId] || [];
    const warehouseStock = dbStore.inventoryStock || [];
    const agentIndents = (dbStore.indents || []).filter(i => !i.agentId || i.agentId === agentId || (i.agentName && i.agentName.includes(agentId)));

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

// ACCEPT & ADD DISPATCHED INDENT TO IN-HAND BAG
router.post('/indent/accept', (req, res) => {
    const { indentId, agentId = 'AG-01' } = req.body;
    const indent = (dbStore.indents || []).find(i => i.id === indentId);
    if (!indent) return res.status(404).json({ error: 'Indent not found' });
    if (indent.status !== 'APPROVED_DISPATCHED') {
        return res.status(400).json({ error: 'Indent is not ready for pickup/handover yet.' });
    }

    if (!dbStore.agentInventory) dbStore.agentInventory = {};
    if (!dbStore.agentInventory[agentId]) dbStore.agentInventory[agentId] = [];

    // Credit each item to agent inventory
    (indent.items || []).forEach(it => {
        const itemName = it.item || it.name;
        const itemQty = Number(it.quantity || it.qty) || 1;
        const existing = dbStore.agentInventory[agentId].find(i => 
            (i.name && i.name.toLowerCase() === itemName.toLowerCase()) || 
            (it.code && i.code === it.code)
        );
        if (existing) {
            existing.stock = (existing.stock || 0) + itemQty;
        } else {
            dbStore.agentInventory[agentId].push({
                id: `INV-${Date.now().toString().slice(-4)}`,
                name: itemName,
                code: it.code || `SKU-${Date.now().toString().slice(-4)}`,
                stock: itemQty,
                unit: it.unit || 'Units',
                minThreshold: 5
            });
        }
    });

    indent.status = 'DELIVERED_RECEIVED';
    indent.receivedAt = new Date().toISOString();
    saveDbStore();

    res.json({
        success: true,
        message: 'Supplies successfully received and credited to your in-hand bag!',
        inventory: dbStore.agentInventory[agentId],
        indent
    });
});

// ==========================================
// BARCODE MANAGEMENT: GENERATE & RECORD BARCODES
// ==========================================
router.post('/barcode/generate', (req, res) => {
    const { orderId, tubeCode, prefix = 'MM' } = req.body;
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const barcode = `${prefix}-${tubeCode ? tubeCode.replace(/[^A-Z0-9]/g, '').slice(0, 4) : 'TUBE'}-${randomSuffix}`;
    
    if (!dbStore.barcodes) dbStore.barcodes = [];
    const barcodeEntry = {
        barcode,
        orderId: orderId || null,
        tubeCode: tubeCode || 'SAMPLE',
        generatedAt: new Date().toISOString(),
        status: 'GENERATED'
    };
    dbStore.barcodes.unshift(barcodeEntry);
    saveDbStore();

    res.json({
        success: true,
        barcode,
        barcodeEntry
    });
});

router.post('/barcode/record', (req, res) => {
    const { barcode, orderId, tubeType, phleboId = 'AG-01', notes = '' } = req.body;
    if (!barcode) return res.status(400).json({ error: 'Barcode string is required' });

    if (!dbStore.barcodes) dbStore.barcodes = [];
    const existing = dbStore.barcodes.find(b => b.barcode === barcode);

    const record = {
        barcode: barcode.trim().toUpperCase(),
        orderId: orderId || 'STANDALONE_SAMPLE',
        tubeType: tubeType || 'Vacutainer',
        scannedBy: phleboId,
        scannedAt: new Date().toISOString(),
        notes,
        status: 'AFFIXED_TO_SPECIMEN'
    };

    if (existing) {
        Object.assign(existing, record);
    } else {
        dbStore.barcodes.unshift(record);
    }

    // If orderId is provided, attach barcode to order record
    if (orderId && dbStore.orders) {
        const order = dbStore.orders.find(o => o.id === orderId);
        if (order) {
            if (!order.barcodes) order.barcodes = [];
            if (!order.barcodes.includes(record.barcode)) {
                order.barcodes.push(record.barcode);
            }
            order.primaryBarcode = record.barcode;
        }
    }

    saveDbStore();
    res.json({
        success: true,
        message: `Barcode ${record.barcode} successfully recorded for specimen.`,
        record
    });
});

router.get('/barcode/verify/:barcode', (req, res) => {
    const { barcode } = req.params;
    const clean = (barcode || '').trim().toUpperCase();
    const entry = (dbStore.barcodes || []).find(b => b.barcode === clean);
    if (!entry) {
        return res.status(404).json({ success: false, found: false, message: 'Barcode not found in registry.' });
    }
    res.json({ success: true, found: true, barcode: entry });
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

