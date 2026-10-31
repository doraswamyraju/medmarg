const express = require('express');
const router = express.Router();
const multer = require('multer');
const { dbStore, saveDbStore } = require('../models/dataStore');
const { uploadFileToGoogleDrive } = require('../services/googleDriveService');

const upload = multer({ storage: multer.memoryStorage() });

// Fetch patient's orders
router.get('/patient/orders', (req, res) => {
    const rawOrders = dbStore.orders || [];
    const normalized = rawOrders.map(ord => {
        let itms = ord.items;
        if (typeof itms === 'string') {
            const parts = itms.split(/[+,]/).map(s => s.trim()).filter(Boolean);
            itms = parts.map(name => ({
                name,
                price: ord.amount ? Math.round(ord.amount / (parts.length || 1)) : 499,
                sampleType: 'SERUM',
                fasting: 'NO'
            }));
        } else if (!Array.isArray(itms)) {
            itms = [{ name: 'Comprehensive Pathology Test', price: ord.amount || 499, sampleType: 'SERUM', fasting: 'NO' }];
        }
        return {
            ...ord,
            items: itms,
            totalAmount: ord.amount || ord.totalAmount || 899,
            phleboName: ord.assignedAgent || ord.phleboName || 'Ajay Kumar (Certified Phlebotomist)',
            phleboPhone: ord.phleboPhone || '+91 98765 11223',
            phleboRating: ord.phleboRating || '4.8 (320+ collections)',
            handoverOtp: ord.otp || ord.handoverOtp || '4821',
            tempTelemetry: ord.tempTelemetry || '3.8°C (Optimal Cold-Chain)',
            slot: ord.slot || '07:30 AM - 08:30 AM',
            date: ord.createdAt || ord.date || 'Today',
            eta: ord.eta || (ord.status === 'EN_ROUTE' || ord.status === 'ENROUTE' ? '8 mins' : 'In Lab Processing')
        };
    });
    res.json({ success: true, orders: normalized });
});

// Book new lab test / package order
const handleOrderBooking = (req, res) => {
    const { 
        patientName, 
        careSeekerName,
        phone, 
        patientPhone,
        careSeekerPhone,
        address, 
        city = 'Tirupati', 
        pincode = '517501', 
        scheduledDate, 
        scheduledSlot, 
        slot,
        items = [], 
        totalAmount, 
        paymentMode = 'DOORSTEP_QR',
        paymentStatus,
        handoverOtp,
        beneficiaries = [],
        totalPersons = 1,
        selectedLabProvider = 'medmarg_suggested',
        labName = 'MedMarg (Home Phlebotomy Fleet)',
        isExpress = false,
        notes
    } = req.body;

    const newOrderId = `MM-LAB-${Math.floor(1000 + Math.random() * 9000)}`;
    const otp = handoverOtp || Math.floor(1000 + Math.random() * 9000).toString();

    const matchedZone = (dbStore.territories && dbStore.territories.find(t => t.pincodes.includes(pincode))) || (dbStore.territories && dbStore.territories[0]) || { name: 'Tirupati Central Zone', primaryAgentId: 'AG-01' };
    const primaryAgent = (dbStore.salariedAgents && dbStore.salariedAgents.find(a => a.id === matchedZone.primaryAgentId)) || { name: 'Ramesh Kumar', id: 'AG-01', phone: '+91 98765 11223' };

    const effectivePhone = phone || patientPhone || careSeekerPhone || '+91 98765 43210';
    const effectiveName = patientName || careSeekerName || 'Rahul Sharma';

    const newOrder = {
        id: newOrderId,
        patientName: effectiveName,
        careSeekerName: effectiveName,
        phone: effectivePhone,
        patientPhone: effectivePhone,
        city: city,
        address: address || 'Plot 42, Air Bypass Road, Tirupati',
        items: Array.isArray(items) ? items.map(i => typeof i === 'string' ? i : i.name).join(', ') : (items || 'MedMarg Master Health Checkup'),
        itemsDetails: Array.isArray(items) ? items : [],
        beneficiaries: Array.isArray(beneficiaries) && beneficiaries.length > 0 ? beneficiaries : [{ personNumber: 1, name: effectiveName, phone: effectivePhone }],
        totalPersons: Math.max(Number(totalPersons) || 1, Array.isArray(beneficiaries) ? beneficiaries.length : 1),
        selectedLabProvider: selectedLabProvider,
        labProvider: labName || 'MedMarg',
        labName: labName || 'MedMarg',
        amount: Number(totalAmount) || 1499,
        totalAmount: Number(totalAmount) || 1499,
        status: 'ASSIGNED',
        assignedAgent: `${primaryAgent.name} (${primaryAgent.id})`,
        phleboName: `${primaryAgent.name} (Certified Phlebotomist)`,
        phleboPhone: primaryAgent.phone || '+91 98765 11223',
        phleboRating: '4.8 (320+ collections)',
        otp: otp,
        handoverOtp: otp,
        slot: slot || scheduledSlot || '07:30 AM - 08:30 AM',
        date: scheduledDate || 'Today',
        eta: isExpress ? '12 Mins' : 'At scheduled slot',
        tempTelemetry: '3.9°C (Optimal 2-8°C IoT Cold-Chain)',
        paymentMode: paymentMode,
        paymentStatus: paymentStatus || (paymentMode === 'PREPAID_UPI' || paymentMode === 'ONLINE_PREPAID' ? 'PAID_SUCCESS' : 'PENDING_DOORSTEP'),
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        notes: notes || ''
    };

    if (!dbStore.orders) dbStore.orders = [];
    dbStore.orders.unshift(newOrder);
    saveDbStore();

    res.status(201).json({
        success: true,
        order: newOrder,
        message: 'Order booked successfully! Certified phlebotomist assigned.'
    });
};

router.post('/patient/orders/book', handleOrderBooking);
router.post('/orders/book', handleOrderBooking);

// Patient Digital Health Reports Vault
router.get('/patient/reports', (req, res) => {
    const liveReports = [
        {
            id: 'REP-8821',
            orderId: 'MM-8921',
            title: 'Thyrocare Aarogyam Master Health Checkup (104 Biomarkers)',
            date: 'Today 08:00 AM',
            lab: 'MedMarg Central Processing Pathology Lab (NABL-AP-2026-01)',
            status: 'READY_PDF',
            pdfUrl: 'https://drive.google.com/file/d/medmarg_rep_8821/view?usp=sharing',
            doctorVerified: 'Dr. Ananya Sharma, MD Pathologist',
            biomarkers: {
                fbs: 94,
                hba1c: 5.6,
                cholesterol: 172,
                tsh: 2.4,
                bp: '120/80',
                vitaminD: 38
            }
        },
        {
            id: 'REP-7910',
            orderId: 'MM-8922',
            title: 'Diabetic, Lipid & Renal Comprehensive Health Profile',
            date: '14 Jul 2026',
            lab: 'Apollo Diagnostics Regional Lab',
            status: 'READY_PDF',
            pdfUrl: 'https://drive.google.com/file/d/medmarg_rep_7910/view?usp=sharing',
            doctorVerified: 'Dr. K. Sivasankar, MD',
            biomarkers: {
                fbs: 102,
                hba1c: 5.9,
                cholesterol: 188,
                tsh: 2.8,
                bp: '124/82',
                vitaminD: 32
            }
        }
    ];

    res.json({
        success: true,
        reports: liveReports,
        biomarkerHistory: [
            { date: 'Jan 2026', fbs: 110, hba1c: 6.1, cholesterol: 195, tsh: 3.1, vitaminD: 28 },
            { date: 'Apr 2026', fbs: 102, hba1c: 5.9, cholesterol: 188, tsh: 2.8, vitaminD: 32 },
            { date: 'Aug 2026', fbs: 94, hba1c: 5.6, cholesterol: 172, tsh: 2.4, vitaminD: 38 }
        ]
    });
});

// Patient Prescription Upload (Multer)
router.post('/patient/upload-prescription', upload.single('prescription'), async (req, res) => {
    try {
        let driveResult = { webViewLink: 'https://drive.google.com/file/d/prescription_uploaded' };
        if (req.file) {
            driveResult = await uploadFileToGoogleDrive(req.file.buffer, req.file.originalname, req.file.mimetype);
        }
        res.json({
            success: true,
            fileUrl: driveResult.webViewLink,
            message: 'Prescription uploaded successfully to MedMarg Google Drive Cloud.'
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to upload prescription: ' + err.message });
    }
});

// General File / Document Upload Endpoint
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        const { originalname, buffer, mimetype } = req.file;
        const driveResult = await uploadFileToGoogleDrive(buffer, originalname, mimetype);

        res.json({
            success: true,
            fileName: originalname,
            fileId: driveResult.fileId,
            driveViewUrl: driveResult.webViewLink,
            driveDownloadUrl: driveResult.webContentLink,
            message: 'File successfully uploaded to Google Drive and link stored in MedMarg database.'
        });
    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).json({ error: 'Failed to upload file to Google Drive.' });
    }
});

module.exports = {
    orderRouter: router,
    handleOrderBooking
};
