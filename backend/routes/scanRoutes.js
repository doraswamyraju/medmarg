const express = require('express');
const router = express.Router();

// RADIOLOGY SCANS API
router.get('/', (req, res) => {
    res.json([
        {
            id: 's_mri_brain',
            name: 'MRI Brain (Plain + Angio)',
            modality: 'MRI',
            price: 3499,
            mrp: 6000,
            nextSlot: 'Today, 5:00 PM',
            tatHours: 4
        },
        {
            id: 's_ct_chest',
            name: 'HRCT Chest (High Resolution Lung CT)',
            modality: 'CT Scan',
            price: 2499,
            mrp: 4500,
            nextSlot: 'Today, 4:30 PM',
            tatHours: 3
        },
        {
            id: 's_usg_abdomen',
            name: 'Ultrasound Whole Abdomen & Pelvis',
            modality: 'Ultrasound',
            price: 1199,
            mrp: 2000,
            nextSlot: 'Tomorrow, 9:00 AM',
            tatHours: 2
        }
    ]);
});

module.exports = router;
