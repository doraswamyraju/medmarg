const express = require('express');
const router = express.Router();
const { dbStore, saveDbStore } = require('../models/dataStore');

// GET ALL CUSTOMERS
router.get('/', (req, res) => {
    res.json({ success: true, customers: dbStore.customers || [] });
});

// UPDATE CUSTOMER PROFILE DETAILS ENDPOINT
router.post('/profile', (req, res) => {
    const { userId, email, name, phone, bloodGroup, preferredLanguage, needleSensitivity, city, address, picture } = req.body;

    if (!dbStore.customers) dbStore.customers = [];
    const emailLower = email ? email.toLowerCase().trim() : '';
    let cust = dbStore.customers.find(c => (userId && c.id === userId) || (emailLower && c.email && c.email.toLowerCase() === emailLower));

    if (cust) {
        if (name) cust.name = name.trim();
        if (phone) cust.phone = phone.trim();
        if (bloodGroup) cust.bloodGroup = bloodGroup;
        if (preferredLanguage) cust.preferredLanguage = preferredLanguage;
        if (needleSensitivity) cust.needleSensitivity = needleSensitivity;
        if (city) cust.city = city.trim();
        if (picture) cust.picture = picture;
        if (address && cust.locations && cust.locations[0]) {
            cust.locations[0].fullAddress = address;
        }
        saveDbStore();
    } else if (emailLower) {
        cust = {
            id: userId || `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
            name: name || emailLower.split('@')[0],
            phone: phone || '',
            email: emailLower,
            city: city || 'Tirupati',
            bloodGroup: bloodGroup || 'O+',
            preferredLanguage: preferredLanguage || 'Telugu & English',
            needleSensitivity: needleSensitivity || 'Butterfly Needle',
            picture: picture || '',
            abhaId: `ABHA-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
            memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            locations: [
                { id: `LOC-${Date.now()}`, label: 'Primary Location', fullAddress: address || 'Air Bypass Road, Tirupati', pincode: '517501', isPrimary: true }
            ],
            familyMembers: [],
            orderHistory: []
        };
        dbStore.customers.unshift(cust);
        saveDbStore();
    }

    return res.json({
        success: true,
        message: 'Care Seeker profile details saved successfully.',
        customer: cust
    });
});

module.exports = router;
