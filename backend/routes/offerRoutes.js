const express = require('express');
const router = express.Router();
const { dbStore, saveDbStore } = require('../models/dataStore');

// GET OFFERS
router.get('/', (req, res) => {
    const activeOnly = req.query.active === 'true';
    let offers = dbStore.offers || [];
    if (activeOnly) {
        offers = offers.filter(o => o.active !== false);
    }
    res.json({ success: true, offers });
});

// CREATE OFFER
router.post('/', (req, res) => {
    const { title, subtitle, code, price, mrp, gradient, badge, tagColor, tagText, packageId, active = true } = req.body;
    if (!title || !code) {
        return res.status(400).json({ error: 'Offer Title and Promo Code are required.' });
    }

    const newOffer = {
        id: `off_${Date.now()}`,
        title: title.trim(),
        subtitle: subtitle || 'Special diagnostic package discount',
        code: code.trim().toUpperCase(),
        price: price || '₹999',
        mrp: mrp || '₹1,999',
        gradient: gradient || 'linear-gradient(135deg, #004D40 0%, #006B70 100%)',
        badge: badge || 'SPECIAL',
        tagColor: tagColor || '#FEF3C7',
        tagText: tagText || '#B45309',
        packageId: packageId || 'pkg_aarogyam_13',
        active: active !== false,
        createdAt: new Date().toISOString()
    };

    if (!dbStore.offers) dbStore.offers = [];
    dbStore.offers.unshift(newOffer);
    saveDbStore();

    res.status(201).json({ success: true, offer: newOffer, message: 'Offer banner published successfully.' });
});

// UPDATE OFFER
router.put('/:id', (req, res) => {
    const { id } = req.params;
    if (!dbStore.offers) dbStore.offers = [];
    const index = dbStore.offers.findIndex(o => o.id === id);
    if (index >= 0) {
        dbStore.offers[index] = { ...dbStore.offers[index], ...req.body };
        saveDbStore();
        return res.json({ success: true, offer: dbStore.offers[index], message: 'Offer updated successfully.' });
    }
    res.status(404).json({ error: 'Offer not found' });
});

// DELETE OFFER
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    if (!dbStore.offers) dbStore.offers = [];
    dbStore.offers = dbStore.offers.filter(o => o.id !== id);
    saveDbStore();
    res.json({ success: true, message: `Offer ${id} removed successfully.` });
});

module.exports = router;
