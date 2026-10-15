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

router.post('/freelancers/verify', (req, res) => {
    const { id, status } = req.body;
    const fl = (dbStore.freelancers || []).find(f => f.id === id);
    if (fl) {
        fl.status = status;
        if (status === 'APPROVED') fl.walletBalance = 2000;
        saveDbStore();
        return res.json({ success: true, freelancer: fl });
    }
    res.status(404).json({ error: 'Freelancer not found' });
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
