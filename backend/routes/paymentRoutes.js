const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { dbStore, saveDbStore } = require('../models/dataStore');

// RAZORPAY INSTANCE INITIALIZATION
let razorpay = null;
try {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        console.log(`[Payment Engine] Razorpay initialized for Merchant: ${process.env.RAZORPAY_MERCHANT_ACCOUNT_ID || 'Medcare Health Services'}`);
    } else {
        console.warn(`[Payment Engine] Razorpay credentials missing in .env`);
    }
} catch (e) {
    console.error(`[Payment Engine] Failed to initialize Razorpay:`, e.message);
}

// 1. Initiate OAuth Authorization Flow (Links Medcare to Rajugari Ventures)
router.get('/razorpay/authorize', (req, res) => {
    const clientId = process.env.RAZORPAY_PARTNER_CLIENT_ID;
    const redirectUri = process.env.RAZORPAY_OAUTH_REDIRECT_URI;

    if (!clientId) {
        return res.status(500).json({
            success: false,
            code: 500,
            message: 'RAZORPAY_PARTNER_CLIENT_ID is not configured in .env',
            data: null,
            error: 'Missing Partner Client ID'
        });
    }

    const authUrl = `https://auth.razorpay.com/authorize?client_id=${clientId}&response_type=code&scope=read_write&redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.json({
            success: true,
            code: 200,
            message: 'Razorpay OAuth Authorization URL generated',
            data: { authUrl, clientId, redirectUri },
            error: null
        });
    }

    res.redirect(authUrl);
});

// 2. Razorpay OAuth Callback (Exchanges Code for Access Tokens & Links Account)
router.get('/razorpay/oauth/callback', async (req, res) => {
    const { code, error, error_description } = req.query;

    if (error) {
        console.error('[Razorpay OAuth] Authorization Error:', error, error_description);
        return res.status(400).send(`
            <!DOCTYPE html>
            <html>
            <head><title>OAuth Authorization Failed - MedMarg</title></head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #0F172A; color: #fff; margin: 0;">
                <div style="background: #1E293B; padding: 2.5rem; border-radius: 12px; text-align: center; max-width: 500px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); border: 1px solid #EF4444;">
                    <h2 style="color: #EF4444; margin-top: 0;">Authorization Failed</h2>
                    <p style="color: #94A3B8;">${error_description || error || 'Unknown OAuth error occurred'}</p>
                    <a href="/" style="display: inline-block; margin-top: 1.5rem; padding: 0.75rem 1.5rem; background: #3B82F6; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 600;">Return to MedMarg</a>
                </div>
            </body>
            </html>
        `);
    }

    if (!code) {
        return res.status(400).send('Authorization code missing in request.');
    }

    try {
        console.log(`[Razorpay OAuth] Received authorization code. Exchanging tokens with Razorpay...`);
        
        const clientId = process.env.RAZORPAY_PARTNER_CLIENT_ID;
        const clientSecret = process.env.RAZORPAY_PARTNER_CLIENT_SECRET;
        const redirectUri = process.env.RAZORPAY_OAUTH_REDIRECT_URI;

        const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

        const tokenResponse = await fetch('https://api.razorpay.com/v1/oauth/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${basicAuth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri,
                code: code,
                mode: 'live'
            })
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error('[Razorpay OAuth] Token Exchange Failed:', tokenData);
            throw new Error(tokenData.error_description || tokenData.error?.description || 'Token exchange failed');
        }

        // Persist OAuth Connection in dbStore
        dbStore.razorpayOAuth = {
            connected: true,
            connectedAt: new Date().toISOString(),
            razorpayAccountId: tokenData.razorpay_account_id || process.env.RAZORPAY_MERCHANT_ACCOUNT_ID || 'acc_G33QwfxQtg7MBx',
            tokenType: tokenData.token_type,
            publicToken: tokenData.public_token,
            scope: tokenData.scope,
            partnerClientId: clientId
        };
        saveDbStore();

        console.log(`[Razorpay OAuth] Successfully connected merchant ${dbStore.razorpayOAuth.razorpayAccountId} to partner ${clientId}`);

        return res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Medcare Linked Successfully - MedMarg Partner Platform</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #0B132B; color: #FFFFFF; margin: 0; padding: 1rem;">
                <div style="background: #1C2541; padding: 2.5rem; border-radius: 16px; text-align: center; max-width: 520px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); border: 1px solid #10B981;">
                    <div style="width: 64px; height: 64px; margin: 0 auto 1.5rem; background: rgba(16, 185, 129, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #10B981; font-size: 32px;">✓</div>
                    <h2 style="color: #FFFFFF; margin: 0 0 0.5rem 0; font-size: 1.5rem;">Medcare Successfully Connected!</h2>
                    <p style="color: #94A3B8; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.5rem;">
                        <strong>Medcare Health Services</strong> (<code>${dbStore.razorpayOAuth.razorpayAccountId}</code>) has been successfully authorized and linked under <strong>Rajugari Ventures (MedMarg)</strong>.
                    </p>
                    <div style="background: rgba(15, 23, 42, 0.6); padding: 1rem; border-radius: 8px; text-align: left; margin-bottom: 2rem; font-size: 0.85rem; color: #CBD5E1;">
                        <div style="margin-bottom: 0.4rem;">• <strong>Customer Branded:</strong> MedMarg / Medcare Health Services</div>
                        <div style="margin-bottom: 0.4rem;">• <strong>Partner Visibility:</strong> Hidden from patient checkout</div>
                        <div>• <strong>Status:</strong> Active & Live for Orders and Doorstep QR</div>
                    </div>
                    <a href="/admin" style="display: block; width: 100%; box-sizing: border-box; padding: 0.9rem; background: linear-gradient(135deg, #10B981, #059669); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 1rem;">Go to MedMarg Super Admin Dashboard</a>
                </div>
            </body>
            </html>
        `);
    } catch (err) {
        console.error('[Razorpay OAuth] Callback exception:', err);
        return res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <head><title>Connection Error - MedMarg</title></head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #0F172A; color: #fff; margin: 0;">
                <div style="background: #1E293B; padding: 2.5rem; border-radius: 12px; text-align: center; max-width: 500px; border: 1px solid #EF4444;">
                    <h2 style="color: #EF4444; margin-top: 0;">OAuth Token Exchange Failed</h2>
                    <p style="color: #94A3B8;">${err.message}</p>
                    <a href="/" style="display: inline-block; margin-top: 1.5rem; padding: 0.75rem 1.5rem; background: #3B82F6; color: #fff; text-decoration: none; border-radius: 6px;">Return to MedMarg</a>
                </div>
            </body>
            </html>
        `);
    }
});

// 3. Payment Status & OAuth Linkage Check
router.get('/razorpay/status', (req, res) => {
    const isOAuthConnected = !!(dbStore.razorpayOAuth && dbStore.razorpayOAuth.connected);
    const hasApiKeys = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

    res.json({
        success: true,
        code: 200,
        message: 'Razorpay integration status retrieved',
        data: {
            oauthConnected: isOAuthConnected,
            oauthDetails: dbStore.razorpayOAuth || null,
            apiKeysConfigured: hasApiKeys,
            merchantAccountId: process.env.RAZORPAY_MERCHANT_ACCOUNT_ID || 'acc_G33QwfxQtg7MBx',
            partnerClientId: process.env.RAZORPAY_PARTNER_CLIENT_ID || 'TnNhTQ3GNcZ0yM',
            keyId: process.env.RAZORPAY_KEY_ID ? `${process.env.RAZORPAY_KEY_ID.substring(0, 10)}...` : null,
            customerBrand: 'Medcare Health Services (MedMarg)'
        },
        error: null
    });
});

// 4. Create Razorpay Order for Online Checkout (Patient Web / App)
router.post('/create-order', async (req, res) => {
    const { amount, orderId, patientName, patientPhone, notes } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({
            success: false,
            code: 400,
            message: 'Valid amount in INR is required',
            data: null,
            error: 'Invalid amount'
        });
    }

    if (!razorpay) {
        return res.status(500).json({
            success: false,
            code: 500,
            message: 'Razorpay is not configured on the server',
            data: null,
            error: 'Missing Razorpay credentials'
        });
    }

    try {
        const amountInPaise = Math.round(Number(amount) * 100);
        const receiptId = orderId ? `MM_${orderId.replace(/[^a-zA-Z0-9]/g, '').slice(-15)}` : `MM_${Date.now()}`;

        const options = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: receiptId,
            notes: {
                brand: 'MedMarg Healthcare',
                merchant: 'Medcare Health Services',
                orderId: orderId || '',
                patientName: patientName || '',
                patientPhone: patientPhone || '',
                ...(notes || {})
            }
        };

        const razorpayOrder = await razorpay.orders.create(options);

        if (orderId && dbStore.orders) {
            const existingOrder = dbStore.orders.find(o => o.id === orderId);
            if (existingOrder) {
                existingOrder.razorpayOrderId = razorpayOrder.id;
                saveDbStore();
            }
        }

        return res.json({
            success: true,
            code: 200,
            message: 'Razorpay order created successfully',
            data: {
                orderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                keyId: process.env.RAZORPAY_KEY_ID,
                businessName: 'Medcare Health Services',
                description: 'MedMarg Diagnostic Lab Services'
            },
            error: null
        });
    } catch (err) {
        console.error('[Razorpay Order Creation Error]:', err);
        return res.status(500).json({
            success: false,
            code: 500,
            message: 'Failed to create Razorpay order',
            data: null,
            error: err.message
        });
    }
});

// 5. Generate Dynamic Razorpay Doorstep UPI QR Code
router.post('/generate-doorstep-qr', async (req, res) => {
    const { orderId, amount, patientName, patientPhone } = req.body;

    if (!orderId || !amount) {
        return res.status(400).json({
            success: false,
            code: 400,
            message: 'Order ID and amount are required',
            data: null,
            error: 'Missing parameters'
        });
    }

    const amountInPaise = Math.round(Number(amount) * 100);

    try {
        let qrData = null;

        if (razorpay && razorpay.qrCode) {
            try {
                qrData = await razorpay.qrCode.create({
                    type: 'upi_qr',
                    name: `MedMarg Collect: ${orderId}`,
                    usage: 'single_use',
                    fixed_amount: true,
                    payment_amount: amountInPaise,
                    description: `Doorstep Collection for Order ${orderId}`,
                    notes: {
                        orderId: orderId,
                        merchant: 'Medcare Health Services',
                        type: 'DOORSTEP_PHLEBO_QR'
                    }
                });
            } catch (qrErr) {
                console.warn('[Razorpay QR API note]:', qrErr.message, '- Falling back to dynamic UPI string');
            }
        }

        const merchantUpiId = process.env.RAZORPAY_UPI_VPA || 'medcare.health@icici';
        const dynamicUpiString = qrData?.image_url 
            ? null 
            : `upi://pay?pa=${encodeURIComponent(merchantUpiId)}&pn=${encodeURIComponent('Medcare Health Services')}&am=${amount}&cu=INR&tr=${orderId}&tn=${encodeURIComponent(`MedMarg Order ${orderId}`)}`;
        
        const qrImageUrl = qrData?.image_url || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(dynamicUpiString)}`;

        return res.json({
            success: true,
            code: 200,
            message: 'Dynamic doorstep QR generated successfully',
            data: {
                orderId: orderId,
                amount: Number(amount),
                qrId: qrData?.id || `QR-${orderId}`,
                qrImageUrl: qrImageUrl,
                upiString: dynamicUpiString || qrData?.image_url,
                merchant: 'Medcare Health Services',
                brand: 'MedMarg'
            },
            error: null
        });
    } catch (err) {
        console.error('[Doorstep QR Generation Error]:', err);
        return res.status(500).json({
            success: false,
            code: 500,
            message: 'Failed to generate dynamic doorstep QR',
            data: null,
            error: err.message
        });
    }
});

// 6. Razorpay Webhook Handler (Auto-Verifies Payments & Settlements)
router.post('/razorpay/webhook', (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (webhookSecret && signature) {
        try {
            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(JSON.stringify(req.body))
                .digest('hex');

            if (expectedSignature !== signature) {
                console.warn('[Razorpay Webhook] Invalid signature received!');
                return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
            }
        } catch (sigErr) {
            console.error('[Razorpay Webhook Signature Check Error]:', sigErr);
        }
    }

    const { event, payload } = req.body;
    console.log(`[Razorpay Webhook] Event received: ${event}`);

    try {
        if (event === 'order.paid' || event === 'payment.captured') {
            const payment = payload?.payment?.entity;
            const orderNotes = payment?.notes || {};
            const orderId = orderNotes.orderId || orderNotes.order_id;

            if (orderId && dbStore.orders) {
                const targetOrder = dbStore.orders.find(o => o.id === orderId);
                if (targetOrder) {
                    targetOrder.paymentStatus = 'PAID_SUCCESS';
                    targetOrder.paymentCollected = true;
                    targetOrder.razorpayPaymentId = payment?.id;
                    saveDbStore();
                    console.log(`[Razorpay Webhook] Order ${orderId} marked as PAID_SUCCESS.`);
                }
            }
        } else if (event === 'qr_code.credited') {
            const qrEntity = payload?.qr_code?.entity;
            const orderId = qrEntity?.notes?.orderId;
            if (orderId && dbStore.orders) {
                const targetOrder = dbStore.orders.find(o => o.id === orderId);
                if (targetOrder) {
                    targetOrder.paymentStatus = 'PAID_DOORSTEP_QR';
                    targetOrder.paymentCollected = true;
                    saveDbStore();
                    console.log(`[Razorpay Webhook] Doorstep QR Order ${orderId} marked as PAID_DOORSTEP_QR.`);
                }
            }
        }

        res.json({ success: true, message: 'Webhook processed successfully' });
    } catch (whErr) {
        console.error('[Razorpay Webhook Processing Error]:', whErr);
        res.status(500).json({ success: false, error: whErr.message });
    }
});

// 7. Check / Verify Doorstep Payment Status Live
router.get('/order-status/:orderId', (req, res) => {
    const { orderId } = req.params;
    const order = (dbStore.orders || []).find(o => o.id === orderId);
    if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
    }
    const isPaid = order.paymentStatus === 'PAID_ONLINE' || 
                   order.paymentStatus === 'PAID_DOORSTEP_QR' || 
                   order.paymentStatus === 'PAID_SUCCESS' || 
                   Boolean(order.paymentCollected);
    
    res.json({
        success: true,
        orderId,
        isPaid,
        paymentStatus: order.paymentStatus,
        paymentMode: order.paymentMode,
        amount: order.amount || order.totalAmount
    });
});

module.exports = router;
