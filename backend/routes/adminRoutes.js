const express = require('express');
const router = express.Router();
const { dbStore, saveDbStore } = require('../models/dataStore');

// ORDERS MANAGEMENT
router.get('/orders', (req, res) => {
    res.json({ success: true, orders: dbStore.orders || [] });
});

router.post('/orders', (req, res) => {
    const newOrder = {
        id: `MM-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'BOOKED',
        otp: Math.floor(1000 + Math.random() * 9000).toString(),
        createdAt: new Date().toLocaleTimeString(),
        ...req.body
    };
    if (!dbStore.orders) dbStore.orders = [];
    dbStore.orders.unshift(newOrder);
    saveDbStore();
    res.status(201).json({ success: true, order: newOrder });
});

router.post('/orders/assign', (req, res) => {
    const { orderId, assignedAgent } = req.body;
    const order = (dbStore.orders || []).find(o => o.id === orderId);
    if (order) {
        order.assignedAgent = assignedAgent;
        order.status = 'EN_ROUTE';
        saveDbStore();
        return res.json({ success: true, order });
    }
    res.status(404).json({ error: 'Order not found' });
});

// FREELANCER AGENTS MANAGEMENT
router.get('/freelancers', (req, res) => {
    res.json({ success: true, freelancers: dbStore.freelancers || [] });
});

router.post('/freelancers', (req, res) => {
    const { 
        name, 
        phone, 
        email, 
        password, 
        city = 'Tirupati', 
        qualification = 'DMLT (Diploma Medical Lab Tech)', 
        paramedicalCert, 
        experience = '3 Years',
        assignedZone = 'Tirupati Urban (Zone 1)',
        commission = 300
    } = req.body;

    const newFreelancer = {
        id: `FL-${Math.floor(100 + Math.random() * 900)}`,
        name,
        phone,
        email: email || `${phone || 'fl'}@medmarg.com`,
        password: password || 'Medmarg@123',
        city,
        qualification,
        paramedicalCert: paramedicalCert || `AP-PMC-${Math.floor(10000 + Math.random() * 90000)}`,
        experience,
        assignedZone,
        commission: Number(commission) || 300,
        regFeePaid: true,
        feeAmount: dbStore.settings?.freelancerOnboardingFee || 2000,
        walletBalance: dbStore.settings?.freelancerOnboardingFee || 2000,
        status: 'PENDING_VERIFICATION',
        rating: 5.0,
        completedOrders: 0,
        createdAt: new Date().toISOString()
    };

    if (!dbStore.freelancers) dbStore.freelancers = [];
    dbStore.freelancers.unshift(newFreelancer);

    // Save to users store so freelancer can log in immediately
    if (!dbStore.users) dbStore.users = [];
    dbStore.users.push({
        id: newFreelancer.id,
        name: newFreelancer.name,
        email: newFreelancer.email,
        phone: newFreelancer.phone,
        password: newFreelancer.password,
        role: 'FREELANCE_AGENT',
        organization: 'MedMarg Freelance Phlebotomy Fleet'
    });

    saveDbStore();
    res.status(201).json({ success: true, freelancer: newFreelancer, message: 'Freelancer registered successfully.' });
});

router.put('/freelancers/:id', (req, res) => {
    const { id } = req.params;
    const fl = (dbStore.freelancers || []).find(f => f.id === id);
    if (!fl) return res.status(404).json({ error: 'Freelancer not found' });

    Object.assign(fl, req.body);
    fl.updatedAt = new Date().toISOString();

    // Also update in dbStore.users if email/phone changed
    if (dbStore.users) {
        const u = dbStore.users.find(usr => usr.id === id || usr.email === fl.email);
        if (u) {
            if (req.body.name) u.name = req.body.name;
            if (req.body.phone) u.phone = req.body.phone;
            if (req.body.email) u.email = req.body.email;
            if (req.body.password) u.password = req.body.password;
        }
    }

    saveDbStore();
    res.json({ success: true, freelancer: fl, message: 'Freelancer updated successfully.' });
});

router.delete('/freelancers/:id', (req, res) => {
    const { id } = req.params;
    const initialLen = (dbStore.freelancers || []).length;
    dbStore.freelancers = (dbStore.freelancers || []).filter(f => f.id !== id);
    
    if (dbStore.users) {
        dbStore.users = dbStore.users.filter(u => u.id !== id);
    }
    saveDbStore();

    if (dbStore.freelancers.length === initialLen) {
        return res.status(404).json({ error: 'Freelancer not found' });
    }
    res.json({ success: true, message: 'Freelancer successfully deleted.' });
});

router.post('/freelancers/verify', (req, res) => {
    const { id, action, status, commission, commissionType, assignedZone, onboardingFeeCredited } = req.body;
    const fl = (dbStore.freelancers || []).find(f => f.id === id);
    if (fl) {
        const nextStatus = action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : (status || fl.status);
        fl.status = nextStatus;
        if (nextStatus === 'APPROVED') {
            const fee = onboardingFeeCredited || dbStore.settings?.freelancerOnboardingFee || 2000;
            fl.walletBalance = fee;
            fl.payoutPending = fee;
            fl.commission = Number(commission) || 300;
            fl.commissionType = commissionType || 'FLAT_PER_ORDER';
            fl.assignedZone = assignedZone || 'Tirupati Urban (Zone 1)';
            fl.approvedAt = new Date().toISOString();
        }
        saveDbStore();
        return res.json({ success: true, freelancer: fl });
    }
    res.status(404).json({ error: 'Freelancer not found' });
});

// STAFF MANAGEMENT (CRUD)
router.get('/staff', (req, res) => {
    res.json({ success: true, staff: dbStore.staff || [] });
});

router.post('/staff', (req, res) => {
    const { 
        name, 
        role, 
        roleCategory = 'LAB_ASSISTANT', 
        department = 'Pathology Hub', 
        phone, 
        email, 
        password,
        branch = 'MedMarg Central Hub (Tirupati)', 
        shift = 'Morning Shift (06:00 AM - 02:00 PM)',
        permissions = ['VIEW_LAB_QUEUE']
    } = req.body;

    const newStaff = {
        id: `STF-${Math.floor(100 + Math.random() * 900)}`,
        name,
        role: role || 'Medical Lab Assistant',
        roleCategory,
        department,
        phone,
        email: email || `${phone || 'staff'}@medmarg.com`,
        password: password || 'Staff@123',
        branch,
        shift,
        status: 'ON_DUTY',
        tasksCompletedToday: 0,
        accuracyScore: '100%',
        permissions,
        createdAt: new Date().toISOString()
    };

    if (!dbStore.staff) dbStore.staff = [];
    dbStore.staff.unshift(newStaff);

    // Save user for portal login
    if (!dbStore.users) dbStore.users = [];
    dbStore.users.push({
        id: newStaff.id,
        name: newStaff.name,
        email: newStaff.email,
        phone: newStaff.phone,
        password: newStaff.password,
        role: 'STAFF',
        organization: newStaff.branch
    });

    saveDbStore();
    res.status(201).json({ success: true, staff: newStaff, message: 'Staff member onboarded successfully.' });
});

router.put('/staff/:id', (req, res) => {
    const { id } = req.params;
    const stf = (dbStore.staff || []).find(s => s.id === id);
    if (!stf) return res.status(404).json({ error: 'Staff member not found' });

    Object.assign(stf, req.body);
    stf.updatedAt = new Date().toISOString();

    if (dbStore.users) {
        const u = dbStore.users.find(usr => usr.id === id || usr.email === stf.email);
        if (u) {
            if (req.body.name) u.name = req.body.name;
            if (req.body.phone) u.phone = req.body.phone;
            if (req.body.email) u.email = req.body.email;
        }
    }

    saveDbStore();
    res.json({ success: true, staff: stf, message: 'Staff details updated successfully.' });
});

router.delete('/staff/:id', (req, res) => {
    const { id } = req.params;
    const initialLen = (dbStore.staff || []).length;
    dbStore.staff = (dbStore.staff || []).filter(s => s.id !== id);

    if (dbStore.users) {
        dbStore.users = dbStore.users.filter(u => u.id !== id);
    }
    saveDbStore();

    if (dbStore.staff.length === initialLen) {
        return res.status(404).json({ error: 'Staff member not found' });
    }
    res.json({ success: true, message: 'Staff member successfully deleted.' });
});

// ONBOARDING FEE CONFIG (SETUP BY ADMIN, REVISABLE ANYTIME)
router.get('/settings/onboarding-fee', (req, res) => {
    const fee = dbStore.settings?.freelancerOnboardingFee || 2000;
    res.json({ success: true, onboardingFee: fee });
});

router.post('/settings/onboarding-fee', (req, res) => {
    const { onboardingFee } = req.body;
    if (!dbStore.settings) dbStore.settings = {};
    dbStore.settings.freelancerOnboardingFee = Number(onboardingFee) || 2000;
    saveDbStore();
    res.json({ 
        success: true, 
        onboardingFee: dbStore.settings.freelancerOnboardingFee, 
        message: 'Freelancer onboarding fee updated successfully.' 
    });
});

// CUSTOMERS MANAGEMENT
router.get('/customers', (req, res) => {
    res.json({ success: true, customers: dbStore.customers || [] });
});

router.post('/customers', (req, res) => {
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

router.delete('/customers/:id', (req, res) => {
    const { id } = req.params;
    if (dbStore.customers) {
        dbStore.customers = dbStore.customers.filter(c => c.id !== id);
        saveDbStore();
    }
    res.json({ success: true, message: 'Customer removed' });
});

// INDENTS MANAGEMENT
router.get('/indents', (req, res) => {
    res.json({ success: true, indents: dbStore.indents || [] });
});

router.post('/indents/approve', (req, res) => {
    const { id } = req.body;
    const ind = (dbStore.indents || []).find(i => i.id === id);
    if (ind) {
        ind.status = 'APPROVED_DISPATCHED';
        saveDbStore();
        return res.json({ success: true, indent: ind });
    }
    res.status(404).json({ error: 'Indent not found' });
});

// PARTNER PRE-REGISTRATIONS MANAGEMENT
router.get('/partners', (req, res) => {
    res.json({ success: true, partners: dbStore.partnerQueue || [] });
});

router.post('/partners/register', (req, res) => {
    const newPartner = {
        id: `P-${Math.floor(100 + Math.random() * 900)}`,
        status: 'PRE_REGISTERED',
        createdAt: new Date().toISOString(),
        ...req.body
    };
    if (!dbStore.partnerQueue) dbStore.partnerQueue = [];
    dbStore.partnerQueue.unshift(newPartner);
    saveDbStore();
    res.status(201).json({ success: true, partner: newPartner });
});

// TERRITORIES DB STORE
router.get('/territories', (req, res) => {
    res.json({ success: true, territories: dbStore.territories || [] });
});

router.post('/territories', (req, res) => {
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

router.delete('/territories/:id', (req, res) => {
    const { id } = req.params;
    if (!dbStore.territories) dbStore.territories = [];
    dbStore.territories = dbStore.territories.filter(t => t.id !== id);
    saveDbStore();
    res.json({ success: true, message: `Territory ${id} deleted successfully.` });
});

// AUTOMATED DISPATCH CASCADE ENGINE (3-TIER)
router.post('/dispatch/auto', (req, res) => {
    const { orderId, pincode } = req.body;
    
    // Find matching territory
    const matchedZone = (dbStore.territories && dbStore.territories.find(t => t.pincodes.includes(pincode))) || (dbStore.territories && dbStore.territories[0]) || { name: 'Default Zone', primaryAgentId: 'AG-01' };
    const primaryAgent = (dbStore.salariedAgents || []).find(a => a.id === matchedZone.primaryAgentId);

    // Tier 1: Check Primary Salaried Agent Quota Limit (max 15/day)
    if (primaryAgent && primaryAgent.samplesToday < primaryAgent.maxDailyQuota) {
        primaryAgent.samplesToday += 1;
        const order = (dbStore.orders || []).find(o => o.id === orderId);
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
    const backupAgent = (dbStore.salariedAgents || []).find(a => a.id !== matchedZone.primaryAgentId && a.samplesToday < a.maxDailyQuota);
    if (backupAgent) {
        backupAgent.samplesToday += 1;
        const order = (dbStore.orders || []).find(o => o.id === orderId);
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
    const order = (dbStore.orders || []).find(o => o.id === orderId);
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

module.exports = router;
