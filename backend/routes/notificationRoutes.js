const express = require('express');
const router = express.Router();
const { dbStore, saveDbStore } = require('../models/dataStore');
const { notificationService } = require('../services/notificationService');

// 1. REGISTER DEVICE PUSH TOKEN (Web ServiceWorker / iOS APNs / Android FCM)
router.post('/register-token', (req, res) => {
    const { token, platform, userId, email, phone } = req.body;
    if (!token) {
        return res.status(400).json({ success: false, error: 'Token is required' });
    }

    if (!dbStore.deviceTokens) {
        dbStore.deviceTokens = [];
    }

    // Check if token already registered
    const existingIdx = dbStore.deviceTokens.findIndex(t => t.token === token);
    const tokenRecord = {
        token,
        platform: platform || 'web',
        userId: userId || email || 'GUEST',
        email: email || null,
        phone: phone || null,
        updatedAt: new Date().toISOString()
    };

    if (existingIdx >= 0) {
        dbStore.deviceTokens[existingIdx] = tokenRecord;
    } else {
        dbStore.deviceTokens.push(tokenRecord);
    }

    saveDbStore();

    res.json({
        success: true,
        message: 'Push notification device token registered successfully'
    });
});

// 2. GET IN-APP NOTIFICATIONS STREAM FOR USER
router.get('/user-stream', (req, res) => {
    const { userId, email } = req.query;
    const target = userId || email || 'ALL';

    const notifs = (dbStore.notifications || []).filter(n => 
        n.userId === target || n.userId === 'ALL' || (email && n.userId === email)
    );

    res.json({
        success: true,
        notifications: notifs.slice(0, 50)
    });
});

// 3. MARK NOTIFICATION AS READ
router.post('/mark-read', (req, res) => {
    const { id, all, userId } = req.body;

    if (!dbStore.notifications) dbStore.notifications = [];

    if (all && userId) {
        dbStore.notifications.forEach(n => {
            if (n.userId === userId || n.userId === 'ALL') {
                n.read = true;
            }
        });
    } else if (id) {
        const item = dbStore.notifications.find(n => n.id === id);
        if (item) item.read = true;
    }

    saveDbStore();

    res.json({ success: true, message: 'Notification state updated' });
});

// 4. TEST DISPATCH (Admin / Debug)
router.post('/send-test', async (req, res) => {
    const { target, title, body, email } = req.body;

    const pushResult = await notificationService.sendPush({
        target: target || 'ALL',
        title: title || 'MedMarg Health Alert',
        body: body || 'Test push notification from MedMarg system.'
    });

    if (email) {
        await notificationService.sendEmail({
            to: email,
            subject: title || 'MedMarg Health Alert',
            htmlContent: `<p>${body || 'Test notification from MedMarg'}</p>`,
            textContent: body
        });
    }

    res.json({ success: true, pushResult });
});

module.exports = router;
