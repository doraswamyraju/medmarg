const express = require('express');
const router = express.Router();
const { dbStore, saveDbStore } = require('../models/dataStore');

// DEMO USERS DATABASE STORE
const DEMO_USERS_DB = [
    { id: 'usr_admin', email: 'admin@medmarg.com', phone: '9999999999', password: 'password123', name: 'MedMarg Super Admin', role: 'ADMIN', organization: 'MedMarg Platform Governance & Central Command' },
    { id: 'usr_staff', email: 'staff@medmarg.com', phone: '9888888888', password: 'password123', name: 'MedMarg Operations Staff', role: 'STAFF', organization: 'MedMarg Central Operations Desk' },
    { id: 'usr_patient', email: 'patient@medmarg.com', phone: '9876543210', password: 'password123', name: 'Rahul Sharma (Patient)', role: 'PATIENT', organization: 'MedMarg Patient Portal (Tirupati)' },
    { id: 'usr_salaried', email: 'salaried@medmarg.com', phone: '9777777777', password: 'password123', name: 'Ramesh Kumar (Salaried Agent AG-01)', role: 'SALARIED_AGENT', organization: 'MedMarg In-House Fleet (Zone 1)' },
    { id: 'usr_freelance', email: 'freelance@medmarg.com', phone: '9666666666', password: 'password123', name: 'Suresh Phlebo (Freelance Agent)', role: 'FREELANCER_AGENT', organization: 'MedMarg Freelance Phlebotomist Network' },
    { id: 'usr_doctor', email: 'doctor@medmarg.com', phone: '9555555555', password: 'password123', name: 'Dr. Ananya Sharma, MD', role: 'DOCTOR', organization: 'MedMarg Care Clinic (OPD Practice)' },
    { id: 'usr_lab', email: 'lab@medmarg.com', phone: '9444444444', password: 'password123', name: 'MedMarg Central Pathology Hub', role: 'DIAGNOSTIC_LAB', organization: 'MedMarg Central Diagnostics (NABL Certified)' },
    { id: 'usr_scans', email: 'scans@medmarg.com', phone: '9333333333', password: 'password123', name: 'Aarthi Scans Operations', role: 'SCAN_CENTER', organization: 'Aarthi Scans & Radiology Center (3.0T MRI)' }
];

// SINGLE LOGIN (EMAIL / PHONE & PASSWORD)
router.post('/login', (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier) {
        return res.status(400).json({ error: 'Email address or Mobile number is required.' });
    }

    const cleanId = identifier.trim().toLowerCase().replace(/\s+/g, '');

    // Search in registered users store, live freelancers store, and DEMO_USERS_DB
    const dynamicFreelancers = (dbStore.freelancers || []).map(f => ({
        id: f.id,
        name: f.name,
        email: f.email,
        phone: f.phone,
        password: f.password,
        role: 'FREELANCER_AGENT',
        agentType: 'FREELANCE',
        organization: 'MedMarg Freelance Phlebotomist Network'
    }));

    const allUsers = [...(dbStore.users || []), ...dynamicFreelancers, ...DEMO_USERS_DB];
    const foundUser = allUsers.find(u => 
        (u.email && u.email.toLowerCase() === cleanId) || 
        (u.phone && (u.phone === cleanId || u.phone.replace(/\D/g, '') === cleanId.replace(/\D/g, ''))) ||
        (u.id && u.id.toLowerCase() === cleanId) ||
        (u.email && cleanId.includes(u.email.split('@')[0]))
    );

    if (foundUser) {
        // Normalize role if freelancer
        let finalRole = foundUser.role;
        if (finalRole === 'FREELANCE_AGENT' || finalRole === 'FREELANCE' || finalRole === 'FREELANCER') {
            finalRole = 'FREELANCER_AGENT';
        }

        return res.json({
            success: true,
            token: `jwt_medmarg_${Date.now()}`,
            user: {
                id: foundUser.id,
                name: foundUser.name,
                email: foundUser.email,
                phone: foundUser.phone,
                identifier: identifier,
                role: finalRole,
                agentType: 'FREELANCE',
                organization: foundUser.organization || 'MedMarg Healthcare'
            }
        });
    }

    // Dynamic Role Auto-Detection fallback
    let detectedRole = 'PATIENT';
    let name = 'Customer Patient';
    let organization = 'MedMarg Healthcare Patient Portal';

    if (cleanId.includes('admin') || cleanId === 'superadmin') {
        detectedRole = 'ADMIN';
        name = 'MedMarg Super Admin';
        organization = 'MedMarg Platform Governance & Central Command';
    } else if (cleanId.includes('staff') || cleanId.includes('ops')) {
        detectedRole = 'STAFF';
        name = 'MedMarg Operations Staff';
        organization = 'MedMarg Central Operations Desk';
    } else if (cleanId.includes('freelance') || cleanId.includes('gig') || cleanId.startsWith('fl') || cleanId.includes('fl-')) {
        detectedRole = 'FREELANCER_AGENT';
        name = 'Freelance Phlebotomist';
        organization = 'MedMarg Freelance Phlebotomist Network';
    } else if (cleanId.includes('salaried') || cleanId.includes('agent') || cleanId.includes('phlebo')) {
        detectedRole = 'SALARIED_AGENT';
        name = 'Ramesh Kumar (Salaried Agent AG-01)';
        organization = 'MedMarg In-House Fleet (Zone 1)';
    } else if (cleanId.includes('lab') || cleanId.includes('lal') || cleanId.includes('thyrocare')) {
        detectedRole = 'DIAGNOSTIC_LAB';
        name = 'MedMarg Central Pathology Hub';
        organization = 'MedMarg Central Diagnostics';
    } else if (cleanId.includes('scan') || cleanId.includes('aarthi') || cleanId.includes('mri')) {
        detectedRole = 'SCAN_CENTER';
        name = 'Aarthi Scans Operations';
        organization = 'Aarthi Scans & Radiology Center';
    } else if (cleanId.includes('dr') || cleanId.includes('doctor')) {
        detectedRole = 'DOCTOR';
        name = 'Dr. Ananya Sharma, MD';
        organization = 'MedMarg Care Clinic';
    }

    return res.json({
        success: true,
        token: `jwt_medmarg_${Date.now()}`,
        user: {
            id: `usr_${Date.now()}`,
            name,
            email: cleanId.includes('@') ? cleanId : `${cleanId}@medmarg.com`,
            phone: cleanId.match(/^[0-9]{10,12}$/) ? cleanId : '9876543210',
            identifier,
            role: detectedRole,
            organization
        }
    });
});

// GOOGLE SIGN-IN & PROFILE DETECTION ENDPOINT
router.post('/google', (req, res) => {
    const { email, name, picture, googleId, phone } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Google email is required.' });
    }

    const emailLower = email.trim().toLowerCase();

    let detectedRole = 'PATIENT';
    let organization = 'MedMarg Healthcare Patient Portal';

    if (emailLower.includes('admin@medmarg.com')) {
        detectedRole = 'ADMIN';
        organization = 'MedMarg Platform Governance & Audit';
    } else if (emailLower.includes('lab') || emailLower.includes('pathlabs') || emailLower.includes('thyrocare')) {
        detectedRole = 'DIAGNOSTIC_LAB';
        organization = 'MedMarg Central Diagnostics (NABL Certified)';
    } else if (emailLower.includes('scan') || emailLower.includes('aarthi') || emailLower.includes('mri')) {
        detectedRole = 'SCAN_CENTER';
        organization = 'Aarthi Scans & Radiology Center (3.0T MRI)';
    } else if (emailLower.includes('doctor') || emailLower.includes('dr.')) {
        detectedRole = 'DOCTOR';
        organization = 'MedMarg Care Clinic (In-Clinic OPD Practice)';
    } else if (emailLower.includes('pharmacy') || emailLower.includes('chemist')) {
        detectedRole = 'PHARMACY';
        organization = 'MedPlus Pharmacy (Generic Dispenser)';
    }

    if (!dbStore.customers) dbStore.customers = [];
    let existingCust = dbStore.customers.find(c => c.email && c.email.toLowerCase() === emailLower);

    const finalPhone = (phone && phone.trim().length >= 10) 
        ? phone.trim() 
        : (existingCust && existingCust.phone ? existingCust.phone : '');

    const requiresPhone = !finalPhone || finalPhone.replace(/[^0-9]/g, '').length < 10;

    if (!existingCust && detectedRole === 'PATIENT') {
        existingCust = {
            id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
            name: name || email.split('@')[0],
            phone: finalPhone,
            email: emailLower,
            city: 'Tirupati',
            picture: picture || '',
            avatarUrl: picture || '',
            abhaId: `ABHA-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
            memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            age: 30,
            gender: 'Verified',
            bloodGroup: 'O+',
            chronicConditions: 'None',
            allergies: 'None',
            locations: [
                { id: `LOC-${Date.now()}`, label: 'Primary Location', fullAddress: 'Air Bypass Road, Tirupati', pincode: '517501', isPrimary: true }
            ],
            familyMembers: [],
            orderHistory: []
        };
        dbStore.customers.unshift(existingCust);
        saveDbStore();
    } else if (existingCust) {
        if (finalPhone && finalPhone.trim().length >= 10) existingCust.phone = finalPhone.trim();
        if (name && (!existingCust.name || existingCust.name === 'Google User')) existingCust.name = name;
        if (picture) {
            existingCust.picture = picture;
            existingCust.avatarUrl = picture;
        }
        saveDbStore();
    }

    return res.json({
        success: true,
        token: `jwt_google_medmarg_${Date.now()}`,
        requiresPhone,
        user: {
            id: existingCust ? existingCust.id : `usr_g_${googleId || Date.now()}`,
            name: name || (existingCust ? existingCust.name : email.split('@')[0]),
            email: emailLower,
            identifier: finalPhone || emailLower,
            phone: finalPhone,
            picture: picture || (existingCust ? (existingCust.picture || existingCust.avatarUrl) : null) || null,
            avatar: picture || (existingCust ? (existingCust.picture || existingCust.avatarUrl) : null) || null,
            role: detectedRole,
            organization,
            authProvider: 'google'
        }
    });
});

// UPDATE USER PHONE NUMBER ENDPOINT
router.post('/update-phone', (req, res) => {
    const { userId, phone, email, name } = req.body;

    if (!phone || phone.trim().length < 10) {
        return res.status(400).json({ error: 'A valid 10-digit mobile number is required.' });
    }

    if (!dbStore.customers) dbStore.customers = [];
    let cust = dbStore.customers.find(c => (userId && c.id === userId) || (email && c.email && c.email.toLowerCase() === email.toLowerCase()));
    
    if (cust) {
        cust.phone = phone.trim();
        if (name && (!cust.name || cust.name === 'Google User')) cust.name = name;
        saveDbStore();
    } else if (email) {
        cust = {
            id: userId || `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
            name: name || email.split('@')[0],
            phone: phone.trim(),
            email: email.trim().toLowerCase(),
            city: 'Tirupati',
            abhaId: `ABHA-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
            memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            age: 30,
            gender: 'Verified',
            bloodGroup: 'O+',
            chronicConditions: 'None',
            allergies: 'None',
            locations: [
                { id: `LOC-${Date.now()}`, label: 'Primary Location', fullAddress: 'Air Bypass Road, Tirupati', pincode: '517501', isPrimary: true }
            ],
            familyMembers: [],
            orderHistory: []
        };
        dbStore.customers.unshift(cust);
        saveDbStore();
    }

    return res.json({
        success: true,
        message: 'Phone number updated and customer profile saved to database.',
        phone: phone.trim(),
        customer: cust
    });
});

// RESET / UPDATE PASSWORD ENDPOINT
router.post('/reset-password', (req, res) => {
    const { email, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    if (!dbStore.users) dbStore.users = [];
    const emailLower = email ? email.toLowerCase().trim() : '';

    let user = dbStore.users.find(u => u.email && u.email.toLowerCase() === emailLower);
    if (user) {
        user.password = newPassword;
        saveDbStore();
    } else {
        dbStore.users.push({
            id: `usr_${Date.now()}`,
            email: emailLower,
            password: newPassword,
            name: emailLower.split('@')[0],
            role: 'PATIENT',
            createdAt: new Date().toISOString()
        });
        saveDbStore();
    }

    return res.json({
        success: true,
        message: 'Your account password has been updated successfully.'
    });
});

// PUBLIC FREELANCER AGENT SIGNUP ENDPOINT
router.post('/signup-freelancer', (req, res) => {
    const { 
        name, 
        email, 
        phone, 
        password, 
        city, 
        experience, 
        vehicleType, 
        hasColdBag, 
        qualification, 
        aadhaarNo, 
        panNo 
    } = req.body;

    if (!name || (!email && !phone)) {
        return res.status(400).json({ error: 'Name, and Email or Mobile Number are required.' });
    }

    const cleanEmail = email ? email.trim().toLowerCase() : `${(phone || 'agent').replace(/[^0-9]/g, '')}@medmarg.com`;
    const cleanPhone = phone ? phone.trim().replace(/[^0-9]/g, '') : '';

    if (!dbStore.freelancers) dbStore.freelancers = [];
    if (!dbStore.users) dbStore.users = [];

    // Check duplicate
    const existing = dbStore.freelancers.find(f => 
        (f.email && f.email.toLowerCase() === cleanEmail) || 
        (f.phone && cleanPhone && f.phone.replace(/[^0-9]/g, '') === cleanPhone)
    );

    if (existing) {
        return res.status(409).json({ error: 'A phlebotomist account with this email or mobile number already exists. Please sign in.' });
    }

    const newId = `FL-${String(100 + dbStore.freelancers.length + 1)}`;
    const newFreelancer = {
        id: newId,
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone || '9876543210',
        password: password || 'MedMarg@2026',
        city: city || 'Tirupati',
        experience: experience || '2+ Years',
        vehicleType: vehicleType || 'Two Wheeler',
        hasColdBag: Boolean(hasColdBag),
        qualification: qualification || 'DMLT / BSc MLT',
        aadhaarNo: aadhaarNo || '',
        panNo: panNo || '',
        rating: '5.0 ★',
        completedTrips: 0,
        kycStatus: 'VERIFIED',
        onboardingFeePaid: true,
        feeAmount: dbStore.settings?.freelancerOnboardingFee || 2000,
        walletBalance: dbStore.settings?.freelancerOnboardingFee || 2000,
        joinedDate: `Today ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        status: 'AVAILABLE',
        activePincodes: ['517501', '517502', '517507']
    };

    dbStore.freelancers.unshift(newFreelancer);

    // Save to users store for instant credential login
    const newUserRecord = {
        id: newFreelancer.id,
        name: newFreelancer.name,
        email: newFreelancer.email,
        phone: newFreelancer.phone,
        password: newFreelancer.password,
        role: 'FREELANCER_AGENT',
        agentType: 'FREELANCE',
        organization: 'MedMarg Freelance Phlebotomy Fleet'
    };
    dbStore.users.push(newUserRecord);

    // Audit Log
    if (!dbStore.auditLogs) dbStore.auditLogs = [];
    dbStore.auditLogs.unshift({
        id: `AUD-${Date.now()}`,
        action: 'FREELANCER_SELF_SIGNUP',
        user: newFreelancer.name,
        details: `Self-registered as freelance phlebotomist ID ${newId}`,
        timestamp: new Date().toISOString()
    });

    saveDbStore();

    return res.status(201).json({
        success: true,
        message: 'Freelance Phlebotomist account registered successfully! You can now log in.',
        user: newUserRecord,
        freelancer: newFreelancer
    });
});

// PUBLIC PARTNER PRE-REGISTRATION / SIGNUP ENDPOINT
router.post('/signup-partner', (req, res) => {
    const { 
        name, 
        category, 
        type, 
        contactPerson, 
        phone, 
        email, 
        city, 
        specialty, 
        experience, 
        licenseNumber, 
        address,
        notes 
    } = req.body;

    if (!name || (!phone && !email)) {
        return res.status(400).json({ error: 'Organization/Doctor Name and Contact Phone/Email are required.' });
    }

    if (!dbStore.partnerQueue) dbStore.partnerQueue = [];

    const newPartner = {
        id: `P-${Math.floor(100 + Math.random() * 900)}`,
        name: name.trim(),
        category: category || 'DOCTORS_OPD',
        type: type || 'Doctor / OPD Practice',
        contactPerson: contactPerson || name.trim(),
        city: city || 'Tirupati',
        phone: phone ? phone.trim() : '',
        email: email ? email.trim().toLowerCase() : '',
        specialty: specialty || 'General Healthcare & Diagnostics Referral',
        experience: experience || 'Established',
        licenseNumber: licenseNumber || '',
        address: address || '',
        notes: notes || '',
        status: 'PRE_REGISTERED',
        assignedMargin: '20%',
        referredPatientsCount: 0,
        commissionEarned: '₹0',
        appliedDate: `Today ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        createdAt: new Date().toISOString()
    };

    dbStore.partnerQueue.unshift(newPartner);

    // Audit Log
    if (!dbStore.auditLogs) dbStore.auditLogs = [];
    dbStore.auditLogs.unshift({
        id: `AUD-${Date.now()}`,
        action: 'PARTNER_PRE_REGISTERED',
        user: newPartner.name,
        details: `Healthcare partner inquiry registered: ${newPartner.name} (${newPartner.category})`,
        timestamp: new Date().toISOString()
    });

    saveDbStore();

    return res.status(201).json({
        success: true,
        message: 'Partnership pre-registration submitted successfully! MedMarg Partner Operations will review within 24 hours.',
        partner: newPartner
    });
});

module.exports = {
    authRouter: router,
    DEMO_USERS_DB
};
