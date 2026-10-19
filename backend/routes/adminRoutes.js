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
        assignedZone = 'All Zones (Open Broadcast)',
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
        assignedZone: assignedZone || 'All Zones (Open Broadcast)',
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
        role: 'FREELANCER_AGENT',
        agentType: 'FREELANCE',
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
        const u = dbStore.users.find(usr => usr.id === id || usr.email === fl.email || (usr.phone && usr.phone === fl.phone));
        if (u) {
            if (req.body.name) u.name = req.body.name;
            if (req.body.phone) u.phone = req.body.phone;
            if (req.body.email) u.email = req.body.email;
            if (req.body.password) u.password = req.body.password;
            u.role = 'FREELANCER_AGENT';
            u.agentType = 'FREELANCE';
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
            fl.assignedZone = assignedZone || 'All Zones (Open Broadcast)';
            fl.approvedAt = new Date().toISOString();

            // Ensure credentials in users store
            if (!dbStore.users) dbStore.users = [];
            let u = dbStore.users.find(usr => usr.id === id || usr.email === fl.email || (usr.phone && usr.phone === fl.phone));
            if (u) {
                u.role = 'FREELANCER_AGENT';
                u.agentType = 'FREELANCE';
                if (fl.password) u.password = fl.password;
            } else {
                dbStore.users.push({
                    id: fl.id,
                    name: fl.name,
                    email: fl.email,
                    phone: fl.phone,
                    password: fl.password || 'Medmarg@123',
                    role: 'FREELANCER_AGENT',
                    agentType: 'FREELANCE',
                    organization: 'MedMarg Freelance Phlebotomy Fleet'
                });
            }
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

// ==========================================
// INVENTORY STOCK & KITS CRUD ENDPOINTS
// ==========================================
router.get('/inventory', (req, res) => {
    res.json({ success: true, inventory: dbStore.inventoryStock || [] });
});

router.post('/inventory', (req, res) => {
    const { code, name, type, category, stock, unit, reorderLevel, unitCost, incharge, components } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Item / Kit Name is required.' });
    }

    if (!dbStore.inventoryStock) dbStore.inventoryStock = [];

    const itemType = type === 'KIT' ? 'KIT' : 'SINGLE';
    const itemCode = (code || `${itemType === 'KIT' ? 'KIT' : 'STK'}-${Date.now().toString().slice(-4)}`).trim().toUpperCase();
    const existingIndex = dbStore.inventoryStock.findIndex(i => i.code === itemCode);

    const item = {
        code: itemCode,
        name: name.trim(),
        type: itemType,
        category: category || (itemType === 'KIT' ? 'Pre-Packaged Kits' : 'Blood Containers'),
        stock: Number(stock) || 0,
        unit: unit || (itemType === 'KIT' ? 'Kits' : 'Units'),
        reorderLevel: Number(reorderLevel) || 100,
        unitCost: Number(unitCost) || 0,
        incharge: incharge || 'Anand Store Lead (store.tirupati@medmarg.com)',
        alertSent: false,
        components: Array.isArray(components) ? components : []
    };

    if (existingIndex >= 0) {
        dbStore.inventoryStock[existingIndex] = item;
    } else {
        dbStore.inventoryStock.unshift(item);
    }

    saveDbStore();
    res.status(201).json({ success: true, item, message: existingIndex >= 0 ? 'Inventory item updated successfully.' : 'Inventory item added successfully.' });
});

router.put('/inventory/:code', (req, res) => {
    const { code } = req.params;
    if (!dbStore.inventoryStock) dbStore.inventoryStock = [];
    const item = dbStore.inventoryStock.find(i => i.code === code);
    if (!item) return res.status(404).json({ error: 'Inventory item not found.' });

    Object.assign(item, req.body);
    saveDbStore();
    res.json({ success: true, item, message: 'Inventory item updated successfully.' });
});

router.delete('/inventory/:code', (req, res) => {
    const { code } = req.params;
    if (!dbStore.inventoryStock) dbStore.inventoryStock = [];
    dbStore.inventoryStock = dbStore.inventoryStock.filter(i => i.code !== code);
    saveDbStore();
    res.json({ success: true, message: `Inventory item ${code} deleted successfully.` });
});

router.post('/inventory/bulk', (req, res) => {
    const { items, overwrite } = req.body;
    if (!Array.isArray(items)) {
        return res.status(400).json({ error: 'Items array is required for bulk import.' });
    }

    if (!dbStore.inventoryStock || overwrite) {
        dbStore.inventoryStock = [];
    }

    items.forEach(newItem => {
        if (!newItem || !newItem.name) return;
        const code = (newItem.code || `STK-${Date.now().toString().slice(-4)}`).trim().toUpperCase();
        const existingIdx = dbStore.inventoryStock.findIndex(i => i.code === code);
        const itemObj = {
            code,
            name: newItem.name.trim(),
            type: newItem.type === 'KIT' ? 'KIT' : 'SINGLE',
            category: newItem.category || 'Blood Containers',
            stock: Number(newItem.stock) || 0,
            unit: newItem.unit || 'Tubes',
            reorderLevel: Number(newItem.reorderLevel) || 100,
            unitCost: Number(newItem.unitCost) || 10,
            incharge: newItem.incharge || 'Anand Store Lead (store.tirupati@medmarg.com)',
            alertSent: false,
            components: Array.isArray(newItem.components) ? newItem.components : []
        };

        if (existingIdx >= 0) {
            dbStore.inventoryStock[existingIdx] = { ...dbStore.inventoryStock[existingIdx], ...itemObj };
        } else {
            dbStore.inventoryStock.push(itemObj);
        }
    });

    saveDbStore();
    res.json({ success: true, count: dbStore.inventoryStock.length, inventory: dbStore.inventoryStock });
});

// ==========================================
// PURCHASES / INWARD GOODS (GRN) CRUD
// ==========================================
router.get('/purchases', (req, res) => {
    res.json({ success: true, purchases: dbStore.purchases || [] });
});

router.post('/purchases', (req, res) => {
    if (!dbStore.purchases) dbStore.purchases = [];
    const newPurchase = {
        id: req.body.id || `GRN-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        poNumber: req.body.poNumber || `PO-MM-${Math.floor(1000 + Math.random() * 9000)}`,
        vendor: req.body.vendor || 'Becton Dickinson (BD India Pvt Ltd)',
        invoiceNo: req.body.invoiceNo || `INV-${Date.now().toString().slice(-5)}`,
        inwardDate: req.body.inwardDate || 'Today ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        batchNo: req.body.batchNo || `BATCH-${Date.now().toString().slice(-4)}`,
        mfgDate: req.body.mfgDate || '2026-01-01',
        expDate: req.body.expDate || '2028-01-01',
        itemsCount: req.body.itemsCount || 1,
        details: req.body.details || '',
        totalAmount: Number(req.body.totalAmount) || 0,
        receivedBy: req.body.receivedBy || 'Anand Store Lead',
        qcStatus: req.body.qcStatus || 'PASSED_VERIFIED'
    };
    dbStore.purchases.unshift(newPurchase);
    saveDbStore();
    res.status(201).json({ success: true, purchase: newPurchase });
});

router.put('/purchases/:id', (req, res) => {
    const { id } = req.params;
    if (!dbStore.purchases) dbStore.purchases = [];
    const item = dbStore.purchases.find(p => p.id === id);
    if (!item) return res.status(404).json({ error: 'Purchase record not found' });
    Object.assign(item, req.body);
    saveDbStore();
    res.json({ success: true, purchase: item });
});

router.delete('/purchases/:id', (req, res) => {
    const { id } = req.params;
    if (dbStore.purchases) {
        dbStore.purchases = dbStore.purchases.filter(p => p.id !== id);
        saveDbStore();
    }
    res.json({ success: true, message: `Purchase ${id} deleted` });
});

// ==========================================
// AGENT INDENTS CRUD
// ==========================================
router.get('/indents', (req, res) => {
    res.json({ success: true, indents: dbStore.indents || [] });
});

router.post('/indents', (req, res) => {
    if (!dbStore.indents) dbStore.indents = [];
    const newIndent = {
        id: req.body.id || `IND-${Math.floor(500 + Math.random() * 500)}`,
        agentType: req.body.agentType || 'SALARIED_AGENT',
        agentName: req.body.agentName || 'Ramesh Kumar (AG-01)',
        area: req.body.area || 'Tirupati Central',
        requestedItems: req.body.requestedItems || '',
        status: req.body.status || 'PENDING_APPROVAL',
        date: req.body.date || 'Today ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        paymentMode: req.body.paymentMode || 'Company Quota Allocation (Free)'
    };
    dbStore.indents.unshift(newIndent);
    saveDbStore();
    res.status(201).json({ success: true, indent: newIndent });
});

router.put('/indents/:id', (req, res) => {
    const { id } = req.params;
    if (!dbStore.indents) dbStore.indents = [];
    const indent = dbStore.indents.find(i => i.id === id);
    if (!indent) return res.status(404).json({ error: 'Indent record not found' });
    Object.assign(indent, req.body);
    saveDbStore();
    res.json({ success: true, indent });
});

router.delete('/indents/:id', (req, res) => {
    const { id } = req.params;
    if (dbStore.indents) {
        dbStore.indents = dbStore.indents.filter(i => i.id !== id);
        saveDbStore();
    }
    res.json({ success: true, message: `Indent ${id} deleted` });
});

// ==========================================
// SCRAP, DAMAGED & EXPIRY LOGS CRUD
// ==========================================
router.get('/scraps', (req, res) => {
    res.json({ success: true, scraps: dbStore.scrapLogs || [] });
});

router.post('/scraps', (req, res) => {
    if (!dbStore.scrapLogs) dbStore.scrapLogs = [];
    const newScrap = {
        id: req.body.id || `SCR-${Math.floor(400 + Math.random() * 500)}`,
        date: req.body.date || 'Today ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        itemCode: req.body.itemCode || 'STK-01',
        itemName: req.body.itemName || 'Consumable Item',
        batchNo: req.body.batchNo || 'BATCH-01',
        quantity: Number(req.body.quantity) || 1,
        reason: req.body.reason || 'Damaged / Expiry',
        lossValue: Number(req.body.lossValue) || 0,
        loggedBy: req.body.loggedBy || 'Anand Store Lead',
        actionTaken: req.body.actionTaken || 'Stock Written Off from Central Warehouse'
    };
    dbStore.scrapLogs.unshift(newScrap);
    saveDbStore();
    res.status(201).json({ success: true, scrap: newScrap });
});

router.put('/scraps/:id', (req, res) => {
    const { id } = req.params;
    if (!dbStore.scrapLogs) dbStore.scrapLogs = [];
    const scrap = dbStore.scrapLogs.find(s => s.id === id);
    if (!scrap) return res.status(404).json({ error: 'Scrap record not found' });
    Object.assign(scrap, req.body);
    saveDbStore();
    res.json({ success: true, scrap });
});

router.delete('/scraps/:id', (req, res) => {
    const { id } = req.params;
    if (dbStore.scrapLogs) {
        dbStore.scrapLogs = dbStore.scrapLogs.filter(s => s.id !== id);
        saveDbStore();
    }
    res.json({ success: true, message: `Scrap record ${id} deleted` });
});

// ==========================================
// SUPPLIERS / VENDORS CRUD
// ==========================================
router.get('/vendors', (req, res) => {
    res.json({ success: true, vendors: dbStore.vendors || [] });
});

router.post('/vendors', (req, res) => {
    if (!dbStore.vendors) dbStore.vendors = [];
    const code = (req.body.code || `VND-${(dbStore.vendors.length + 1).toString().padStart(2, '0')}`).toUpperCase();
    const existing = dbStore.vendors.find(v => v.code === code);
    const newVendor = {
        code,
        name: req.body.name || 'New Supplier',
        category: req.body.category || 'Vacutainers & Supplies',
        contactPerson: req.body.contactPerson || 'Store Manager',
        phone: req.body.phone || '+91 98480 00000',
        email: req.body.email || 'supplier@medmarg.com',
        gstin: req.body.gstin || '37AABCB0000A1Z0',
        leadTimeDays: Number(req.body.leadTimeDays) || 3,
        paymentTerms: req.body.paymentTerms || 'Net 30 Days',
        rating: req.body.rating || '4.8 ★'
    };
    if (existing) {
        Object.assign(existing, newVendor);
    } else {
        dbStore.vendors.push(newVendor);
    }
    saveDbStore();
    res.status(201).json({ success: true, vendor: newVendor });
});

router.put('/vendors/:code', (req, res) => {
    const { code } = req.params;
    if (!dbStore.vendors) dbStore.vendors = [];
    const vendor = dbStore.vendors.find(v => v.code === code);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    Object.assign(vendor, req.body);
    saveDbStore();
    res.json({ success: true, vendor });
});

router.delete('/vendors/:code', (req, res) => {
    const { code } = req.params;
    if (dbStore.vendors) {
        dbStore.vendors = dbStore.vendors.filter(v => v.code !== code);
        saveDbStore();
    }
    res.json({ success: true, message: `Vendor ${code} deleted` });
});

// ==========================================
// AGENT IN-HAND INVENTORIES CRUD
// ==========================================
router.get('/agent-inventory', (req, res) => {
    res.json({ success: true, agentInventories: dbStore.agentInventories || [] });
});

router.put('/agent-inventory/:agentId', (req, res) => {
    const { agentId } = req.params;
    if (!dbStore.agentInventories) dbStore.agentInventories = [];
    let ag = dbStore.agentInventories.find(a => a.agentId === agentId);
    if (!ag) {
        ag = { agentId, ...req.body };
        dbStore.agentInventories.push(ag);
    } else {
        Object.assign(ag, req.body);
    }
    saveDbStore();
    res.json({ success: true, agentInventory: ag });
});

// ==========================================
// EXTRA USAGES & WAIVERS CRUD
// ==========================================
router.get('/extra-usages', (req, res) => {
    res.json({ success: true, extraUsages: dbStore.extraUsages || [] });
});

router.post('/extra-usages', (req, res) => {
    if (!dbStore.extraUsages) dbStore.extraUsages = [];
    const newUsage = {
        id: req.body.id || `EX-${Math.floor(900 + Math.random() * 100)}`,
        orderId: req.body.orderId || 'MM-8921',
        patientName: req.body.patientName || 'Patient',
        agentId: req.body.agentId || 'AG-01',
        agentName: req.body.agentName || 'Agent',
        agentType: req.body.agentType || 'SALARIED',
        reportedAt: req.body.reportedAt || 'Today ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        itemsUsed: req.body.itemsUsed || [],
        totalValue: Number(req.body.totalValue) || 0,
        phleboReason: req.body.phleboReason || 'Clinical draw difficulty',
        decision: req.body.decision || 'PENDING',
        decisionNotes: req.body.decisionNotes || '',
        decidedBy: req.body.decidedBy || null
    };
    dbStore.extraUsages.unshift(newUsage);
    saveDbStore();
    res.status(201).json({ success: true, extraUsage: newUsage });
});

router.put('/extra-usages/:id', (req, res) => {
    const { id } = req.params;
    if (!dbStore.extraUsages) dbStore.extraUsages = [];
    const item = dbStore.extraUsages.find(u => u.id === id);
    if (!item) return res.status(404).json({ error: 'Extra usage record not found' });
    Object.assign(item, req.body);
    saveDbStore();
    res.json({ success: true, extraUsage: item });
});

router.delete('/extra-usages/:id', (req, res) => {
    const { id } = req.params;
    if (dbStore.extraUsages) {
        dbStore.extraUsages = dbStore.extraUsages.filter(u => u.id !== id);
        saveDbStore();
    }
    res.json({ success: true, message: `Extra usage record ${id} deleted` });
});

// ==========================================
// AUDIT TRAILS & DATABASE BACKUPS
// ==========================================
const auditStore = require('../models/auditStore');

router.get('/audit-logs', (req, res) => {
    try {
        const logs = auditStore.getAuditLogs(300);
        res.json({ success: true, logs });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/backups', (req, res) => {
    try {
        const backups = auditStore.listBackups();
        res.json({ success: true, backups });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/backups/create', (req, res) => {
    try {
        const { notes = 'Manual snapshot from Admin Panel' } = req.body;
        const result = auditStore.createSnapshot('MANUAL', notes);
        if (!result) {
            return res.status(500).json({ error: 'Failed to create snapshot' });
        }
        res.json({ success: true, snapshot: result });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/backups/restore/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        const result = auditStore.restoreBackup(filename, req.body.user || 'Admin');
        if (!result.success) {
            return res.status(500).json(result);
        }
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/backups/download/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        const path = require('path');
        const filePath = path.join(auditStore.BACKUPS_DIR, path.basename(filename));
        if (!require('fs').existsSync(filePath)) {
            return res.status(404).json({ error: 'Backup file not found' });
        }
        res.download(filePath, filename);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ADMIN INVOICE CONFIGURATION & TAX PROFILE
router.get('/invoice-settings', (req, res) => {
    const settings = dbStore.invoiceSettings || {
        companyName: 'MedMarg Healthcare & Multi-Lab Logistics Pvt Ltd',
        gstin: '37AABCM8921F1ZX',
        pan: 'AABCM8921F',
        sacCode: '999312', // SAC code for medical & diagnostic testing services
        gstRatePercent: 0, // Healthcare diagnostic services are exempt or 0% under GST SAC 999312, or 18% if administrative
        stateName: 'Andhra Pradesh',
        stateCode: '37',
        registeredAddress: 'Plot 42, Ground & 1st Floor, Air Bypass Road, Tirupati, Andhra Pradesh - 517501',
        contactEmail: 'billing@medmarg.com',
        contactPhone: '+91 91799 79911',
        authorizedSignatory: 'Authorized Signatory (MedMarg Diagnostics Hub)',
        invoicePrefix: 'MM-INV-2026-',
        notes: 'Medical & Diagnostic Pathological Services exempt under Sl. No. 74 of Notification No. 12/2017-Central Tax (Rate).'
    };
    res.json({ success: true, settings });
});

router.post('/invoice-settings', (req, res) => {
    dbStore.invoiceSettings = {
        ...(dbStore.invoiceSettings || {}),
        ...req.body,
        updatedAt: new Date().toISOString()
    };
    saveDbStore();
    res.json({ success: true, settings: dbStore.invoiceSettings, message: 'GST Invoice settings updated successfully.' });
});

// RESCHEDULE OR CANCEL ORDER API
router.post('/orders/:id/reschedule', (req, res) => {
    const { id } = req.params;
    const { date, slot, reason } = req.body;
    const order = (dbStore.orders || []).find(o => o.id === id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.date = date || order.date;
    order.slot = slot || order.slot;
    order.rescheduleReason = reason || 'Customer requested new time slot';
    order.rescheduledAt = new Date().toISOString();
    saveDbStore();
    res.json({ success: true, order, message: `Order #${id} successfully rescheduled to ${order.date} (${order.slot}).` });
});

router.post('/orders/:id/cancel', (req, res) => {
    const { id } = req.params;
    const { reason = 'Cancelled by Customer' } = req.body;
    const order = (dbStore.orders || []).find(o => o.id === id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.status = 'CANCELLED';
    order.cancellationReason = reason;
    order.cancelledAt = new Date().toISOString();
    saveDbStore();
    res.json({ success: true, order, message: `Order #${id} has been cancelled.` });
});

module.exports = router;


