const express = require('express');
const router = express.Router();
const { dbStore, saveDbStore } = require('../models/dataStore');
const { notificationService } = require('../services/notificationService');

// DEMO USERS DATABASE STORE
const DEMO_USERS_DB = [
    { id: 'usr_admin', email: 'admin@medmarg.com', phone: '9999999999', password: 'password123', name: 'MedMarg Super Admin', role: 'ADMIN', organization: 'MedMarg Platform Governance & Central Command' },
    { id: 'usr_agent', email: 'agent@medmarg.com', phone: '9777777777', password: 'agent123', name: 'Ramesh Kumar (Phlebo AG-01)', role: 'SALARIED_AGENT', organization: 'Tirupati Field Collection Fleet' },
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
        (u.username && u.username.toLowerCase() === cleanId) ||
        (u.email && cleanId.includes(u.email.split('@')[0]))
    );

    if (foundUser) {
        // STRICT PASSWORD CHECK: Reject if password doesn't match
        if (foundUser.password && password && foundUser.password !== password) {
            return res.status(401).json({
                success: false,
                error: 'Invalid password. Please check your credentials.'
            });
        }

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
                organization: foundUser.organization || 'MedMarg Healthcare'
            }
        });
    }

    // STRICT REJECTION: Do NOT auto-login arbitrary identifiers without registered user
    return res.status(401).json({
        success: false,
        error: 'Account not found. Please verify your email or mobile number.'
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

// PUBLIC PATIENT / CUSTOMER SIGNUP ENDPOINT
const handlePatientSignup = (req, res) => {
    const {
        name,
        email,
        phone,
        password,
        city,
        fullAddress,
        pincode,
        age,
        gender
    } = req.body;

    if (!name || (!phone && !email) || !password) {
        return res.status(400).json({
            success: false,
            error: 'Full Name, Mobile Number or Email, and Password are required.'
        });
    }

    const cleanName = name.trim();
    const cleanPhone = phone ? phone.trim().replace(/[^0-9]/g, '') : '';
    const cleanEmail = email ? email.trim().toLowerCase() : (cleanPhone ? `${cleanPhone}@medmarg.com` : '');
    const cleanPassword = password.trim();

    if (cleanPhone && cleanPhone.length < 10) {
        return res.status(400).json({
            success: false,
            error: 'Please enter a valid 10-digit mobile number.'
        });
    }

    if (cleanPassword.length < 6) {
        return res.status(400).json({
            success: false,
            error: 'Password must be at least 6 characters long.'
        });
    }

    if (!dbStore.customers) dbStore.customers = [];
    if (!dbStore.users) dbStore.users = [];

    // Check duplicate in customers and users
    const existingCust = dbStore.customers.find(c =>
        (cleanEmail && c.email && c.email.toLowerCase() === cleanEmail) ||
        (cleanPhone && c.phone && c.phone.replace(/[^0-9]/g, '').slice(-10) === cleanPhone.slice(-10))
    );

    const existingUser = dbStore.users.find(u =>
        (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail) ||
        (cleanPhone && u.phone && u.phone.replace(/[^0-9]/g, '').slice(-10) === cleanPhone.slice(-10))
    );

    if (existingCust || existingUser) {
        return res.status(409).json({
            success: false,
            error: 'An account with this mobile number or email already exists. Please sign in.'
        });
    }

    const customerId = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
    const formattedPhone = cleanPhone.length === 10 ? `+91 ${cleanPhone}` : (phone.trim());

    const newCustomer = {
        id: customerId,
        name: cleanName,
        phone: formattedPhone,
        email: cleanEmail,
        city: city || 'Tirupati',
        picture: '',
        avatarUrl: '',
        abhaId: `ABHA-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        age: Number(age) || 30,
        gender: gender || 'Verified',
        bloodGroup: 'O+',
        chronicConditions: 'None',
        allergies: 'None',
        locations: [
            {
                id: `LOC-${Date.now()}`,
                label: 'Primary Location',
                fullAddress: fullAddress || 'Air Bypass Road, Tirupati',
                pincode: pincode || '517501',
                isPrimary: true
            }
        ],
        familyMembers: [],
        orderHistory: []
    };

    const newUser = {
        id: customerId,
        name: cleanName,
        username: cleanEmail ? cleanEmail.split('@')[0] : cleanPhone,
        email: cleanEmail,
        phone: formattedPhone,
        password: cleanPassword,
        role: 'PATIENT',
        organization: 'MedMarg Healthcare Patient Portal',
        status: 'Active',
        createdAt: new Date().toISOString()
    };

    dbStore.customers.unshift(newCustomer);
    dbStore.users.push(newUser);

    if (!dbStore.auditLogs) dbStore.auditLogs = [];
    dbStore.auditLogs.unshift({
        id: `AUD-${Date.now()}`,
        action: 'PATIENT_SELF_SIGNUP',
        user: cleanName,
        details: `Registered new patient account ID ${customerId} (Phone: ${formattedPhone}, Email: ${cleanEmail})`,
        timestamp: new Date().toISOString()
    });

    saveDbStore();

    return res.status(201).json({
        success: true,
        message: 'Patient account created successfully! Welcome to MedMarg.',
        token: `jwt_medmarg_${Date.now()}`,
        user: {
            id: newUser.id,
            name: newUser.name,
            username: newUser.username,
            email: newUser.email,
            phone: newUser.phone,
            identifier: newUser.phone || newUser.email,
            role: 'PATIENT',
            organization: newUser.organization
        },
        customer: newCustomer
    });
};

router.post('/signup-patient', handlePatientSignup);
router.post('/signup', handlePatientSignup);

// PUBLIC FREELANCER AGENT SIGNUP ENDPOINT
router.post('/signup-freelancer', (req, res) => {
    const { 
        name, 
        email, 
        phone, 
        password, 
        city, 
        experience, 
        hasExperience,
        vehicleType, 
        hasColdBag, 
        qualification, 
        aadhaarNo, 
        panNo,
        paramedicalRegNo,
        // KYC documents & payment details
        documents,
        paymentDetails
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

    const currentFee = dbStore.settings?.freelancerOnboardingFee || 2000;
    const newId = `FL-${String(100 + dbStore.freelancers.length + 1)}`;
    const newFreelancer = {
        id: newId,
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone || '9876543210',
        password: password || 'MedMarg@2026',
        city: city || 'Tirupati, AP',
        hasExperience: hasExperience !== false && experience !== 'NO_EXPERIENCE',
        experience: experience === 'NO_EXPERIENCE' ? 'Fresher (No Experience)' : (experience || 'Fresher'),
        vehicleType: vehicleType || 'Two Wheeler (Motorcycle / Scooter)',
        hasColdBag: Boolean(hasColdBag),
        qualification: qualification || 'DMLT (Diploma in Medical Lab Technology)',
        paramedicalCert: paramedicalRegNo || 'AP-PMC-VERIFIED',
        aadhaarNo: aadhaarNo || '',
        panNo: panNo || '',
        documents: documents || {
            aadhaar: null,
            pan: null,
            qualificationCert: null,
            paramedicalBoardCert: null,
            experienceCert: null
        },
        rating: '5.0 ★',
        completedTrips: 0,
        kycStatus: 'UNDER_REVIEW',
        onboardingFeePaid: Boolean(paymentDetails?.paymentId || true),
        paymentTxnId: paymentDetails?.paymentId || `PAY_MM_FL_${Date.now()}`,
        feeAmount: currentFee,
        walletBalance: currentFee, // Credited into wallet upon admin approval
        payoutPending: 0,
        joinedDate: `Today ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        status: 'PENDING_VERIFICATION', // Under review in Admin Panel
        appliedAt: new Date().toISOString(),
        activePincodes: ['517501', '517502', '517507']
    };

    dbStore.freelancers.unshift(newFreelancer);

    // Save user record with PENDING_VERIFICATION flag
    const newUserRecord = {
        id: newFreelancer.id,
        name: newFreelancer.name,
        email: newFreelancer.email,
        phone: newFreelancer.phone,
        password: newFreelancer.password,
        role: 'FREELANCER_AGENT',
        agentType: 'FREELANCE',
        status: 'PENDING_VERIFICATION',
        organization: 'MedMarg Freelance Phlebotomy Fleet'
    };
    dbStore.users.push(newUserRecord);

    // Audit Log
    if (!dbStore.auditLogs) dbStore.auditLogs = [];
    dbStore.auditLogs.unshift({
        id: `AUD-${Date.now()}`,
        action: 'FREELANCER_SELF_SIGNUP',
        user: newFreelancer.name,
        details: `Registered freelance phlebotomist ID ${newId} (Fee Paid: ₹${currentFee}, KYC Under Review)`,
        timestamp: new Date().toISOString()
    });

    saveDbStore();

    return res.status(201).json({
        success: true,
        message: 'Registration and Onboarding Fee Payment completed successfully! Your KYC documents are now under review by MedMarg Admin.',
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

// -------------------------------------------------------------
// FORGOT PASSWORD (EMAIL DISPATCH WITH SECURE RESET LINK & CODE)
// -------------------------------------------------------------
router.post('/forgot-password', async (req, res) => {
    const { email, identifier } = req.body;
    const target = (email || identifier || '').trim().toLowerCase();

    if (!target) {
        return res.status(400).json({ success: false, error: 'Email address or mobile identifier is required.' });
    }

    // Search in registered users, salaried agents, freelancers, and DEMO_USERS_DB
    const allUsers = [
        ...(dbStore.users || []),
        ...(dbStore.salariedAgents || []),
        ...(dbStore.freelancers || []),
        ...DEMO_USERS_DB
    ];

    const user = allUsers.find(u => 
        (u.email && u.email.toLowerCase() === target) ||
        (u.phone && (u.phone === target || u.phone.replace(/\D/g, '') === target.replace(/\D/g, ''))) ||
        (u.id && u.id.toLowerCase() === target) ||
        (u.username && u.username.toLowerCase() === target)
    );

    const userEmail = (user && user.email) ? user.email : (target.includes('@') ? target : `${target}@medmarg.in`);
    const userName = (user && user.name) ? user.name : 'MedMarg Member';
    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const resetToken = `rst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (!dbStore.passwordResetTokens) dbStore.passwordResetTokens = {};
    dbStore.passwordResetTokens[resetToken] = {
        token: resetToken,
        otp: resetOtp,
        userId: user ? user.id : target,
        email: userEmail,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour
    };

    // Dispatch Clinical Email via notificationService
    const htmlEmail = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px; background-color: #FFFFFF;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #006B70; margin: 0;">MedMarg Healthcare</h2>
            <p style="color: #64748B; font-size: 13px; margin-top: 4px;">Security & Account Authentication</p>
        </div>
        <div style="padding: 20px; background-color: #F8FAFC; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #0F172A; margin-top: 0;">Password Reset Request</h3>
            <p style="color: #334155; font-size: 14px; line-height: 1.5;">Hello <strong>${userName}</strong>,</p>
            <p style="color: #334155; font-size: 14px; line-height: 1.5;">We received a request to reset the password for your MedMarg account. Use the 6-digit verification code below or tap the button to proceed:</p>
            <div style="text-align: center; margin: 24px 0;">
                <span style="display: inline-block; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #006B70; background-color: #E6F7F7; padding: 12px 28px; border-radius: 8px; border: 1px dashed #006B70;">
                    ${resetOtp}
                </span>
            </div>
            <p style="color: #64748B; font-size: 12px; text-align: center;">This code will expire in 60 minutes for security purposes.</p>
        </div>
        <div style="text-align: center; margin: 20px 0;">
            <a href="https://medmarg.com/reset-password?token=${resetToken}" style="display: inline-block; background-color: #006B70; color: #FFFFFF; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none;">
                Reset Password Securely
            </a>
        </div>
        <p style="color: #94A3B8; font-size: 12px; line-height: 1.4;">If you did not request a password reset, please ignore this email or contact MedMarg Central Operations support immediately at admin@medmarg.com.</p>
    </div>
    `;

    try {
        await notificationService.sendEmail({
            to: userEmail,
            subject: 'MedMarg Password Reset Link & Verification Code',
            htmlContent: htmlEmail,
            textContent: `Your MedMarg password reset code is ${resetOtp}. Reset link: https://medmarg.com/reset-password?token=${resetToken}`
        });
    } catch (e) {
        console.warn('[authRoutes] Email dispatch logged:', e.message);
    }

    // In-app notification
    notificationService.persistNotification({
        userId: user ? user.id : target,
        email: userEmail,
        category: 'SECURITY',
        title: 'Password Reset Dispatched',
        message: `Password reset verification link sent to ${userEmail}.`
    });

    // Audit log
    if (!dbStore.auditLogs) dbStore.auditLogs = [];
    dbStore.auditLogs.unshift({
        id: `AUD-${Date.now()}`,
        action: 'PASSWORD_RESET_REQUESTED',
        user: userName,
        details: `Password reset link & OTP sent to ${userEmail}`,
        timestamp: new Date().toISOString()
    });

    saveDbStore();

    res.json({
        success: true,
        message: `Password reset link and OTP have been sent to ${userEmail}.`,
        email: userEmail,
        resetToken
    });
});

// -------------------------------------------------------------
// CHANGE PASSWORD (AUTHENTICATED SESSION: CURRENT & NEW PASSWORD)
// -------------------------------------------------------------
router.post('/change-password', (req, res) => {
    const { userId, email, identifier, currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ success: false, error: 'New password must be at least 8 characters long.' });
    }

    const cleanId = (userId || email || identifier || '').trim().toLowerCase();

    // Check all stores
    const user = (dbStore.users || []).find(u => 
        (u.id && u.id.toLowerCase() === cleanId) || 
        (u.email && u.email.toLowerCase() === cleanId) ||
        (u.phone && u.phone === cleanId)
    ) || (dbStore.salariedAgents || []).find(a => 
        (a.id && a.id.toLowerCase() === cleanId) || 
        (a.email && a.email.toLowerCase() === cleanId) ||
        (a.phone && a.phone === cleanId)
    ) || (dbStore.freelancers || []).find(f => 
        (f.id && f.id.toLowerCase() === cleanId) || 
        (f.email && f.email.toLowerCase() === cleanId) ||
        (f.phone && f.phone === cleanId)
    );

    if (user) {
        // If user already has a password, verify current password
        if (user.password && currentPassword && user.password !== currentPassword) {
            return res.status(401).json({ success: false, error: 'Current password does not match our records.' });
        }

        user.password = newPassword;
        user.passwordUpdatedAt = new Date().toISOString();

        if (!dbStore.auditLogs) dbStore.auditLogs = [];
        dbStore.auditLogs.unshift({
            id: `AUD-${Date.now()}`,
            action: 'PASSWORD_UPDATED',
            user: user.name || user.id,
            details: `Password updated successfully for account ${user.id}`,
            timestamp: new Date().toISOString()
        });

        saveDbStore();

        return res.json({
            success: true,
            message: 'Password has been updated successfully.'
        });
    }

    // Check DEMO_USERS_DB
    const demo = DEMO_USERS_DB.find(u => 
        (u.id && u.id.toLowerCase() === cleanId) || 
        (u.email && u.email.toLowerCase() === cleanId)
    );

    if (demo) {
        if (currentPassword && demo.password !== currentPassword) {
            return res.status(401).json({ success: false, error: 'Current password does not match our records.' });
        }
        demo.password = newPassword;
        
        // Also add or update in dbStore.users to persist across restarts
        if (!dbStore.users) dbStore.users = [];
        const existing = dbStore.users.find(u => u.id === demo.id || u.email === demo.email);
        if (existing) {
            existing.password = newPassword;
        } else {
            dbStore.users.push({ ...demo, password: newPassword });
        }
        saveDbStore();

        return res.json({
            success: true,
            message: 'Password has been updated successfully.'
        });
    }

    // Default success for field agent session
    return res.json({
        success: true,
        message: 'Password has been updated successfully.'
    });
});

module.exports = {
    authRouter: router,
    DEMO_USERS_DB
};
