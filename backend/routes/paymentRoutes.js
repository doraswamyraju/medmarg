const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { dbStore, saveDbStore } = require('../models/dataStore');

// Helper to verify order ownership via per-order access token
function verifyOrderToken(order, req, strictHeaderOnly = false) {
    if (!order) return false;
    
    // For strict payment endpoints, orders MUST have an access token and it MUST be in x-order-token header
    if (strictHeaderOnly) {
        if (!order.orderTokenHash) return false;
        const headerToken = req.headers['x-order-token'];
        if (!headerToken || typeof headerToken !== 'string') return false;
        const providedHash = crypto.createHash('sha256').update(headerToken).digest('hex');
        try {
            return crypto.timingSafeEqual(Buffer.from(providedHash, 'hex'), Buffer.from(order.orderTokenHash, 'hex'));
        } catch (e) {
            return false;
        }
    }

    // Legacy fallback for read-only general endpoints if order was created before token system
    if (!order.orderTokenHash) return true;

    const providedToken = req.headers['x-order-token'];
    if (!providedToken || typeof providedToken !== 'string') return false;

    const providedHash = crypto.createHash('sha256').update(providedToken).digest('hex');
    try {
        return crypto.timingSafeEqual(Buffer.from(providedHash, 'hex'), Buffer.from(order.orderTokenHash, 'hex'));
    } catch (e) {
        return false;
    }
}

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

        // Also create a hosted Razorpay checkout payment link for native mobile app integration
        let hostedPaymentUrl = null;
        let paymentLinkId = null;
        try {
            let cleanPhone = (patientPhone || '').replace(/[^0-9]/g, '');
            if (cleanPhone.length === 10) cleanPhone = '+91' + cleanPhone;
            else if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) cleanPhone = '+' + cleanPhone;
            else if (!cleanPhone.startsWith('+')) cleanPhone = '+917997991101'; // Default valid merchant contact fallback

            const plink = await razorpay.paymentLink.create({
                amount: amountInPaise,
                currency: 'INR',
                accept_partial: false,
                reference_id: receiptId,
                description: `MedMarg Lab Services (${orderId || receiptId})`,
                customer: {
                    name: patientName || 'MedMarg Patient',
                    contact: cleanPhone,
                    email: (notes && notes.email) || 'patient@medmarg.com'
                },
                notify: { sms: false, email: false },
                callback_url: 'https://medmarg.com/api/v1/payments/callback',
                callback_method: 'get',
                notes: options.notes
            });
            hostedPaymentUrl = plink.short_url;
            paymentLinkId = plink.id;
        } catch (plinkErr) {
            console.warn('[Razorpay PaymentLink note]:', plinkErr.message);
        }

        if (orderId && dbStore.orders) {
            const existingOrder = dbStore.orders.find(o => o.id === orderId);
            if (existingOrder) {
                existingOrder.razorpayOrderId = razorpayOrder.id;
                if (paymentLinkId) existingOrder.razorpayPaymentLinkId = paymentLinkId;
                existingOrder.canonicalAmountPaise = amountInPaise;
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
                description: 'MedMarg Diagnostic Lab Services',
                paymentUrl: hostedPaymentUrl,
                paymentLinkId: paymentLinkId
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

// 5A. Authoritative Native Razorpay Payment Verification
router.post('/verify-native', async (req, res) => {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({
            success: false,
            code: 400,
            message: 'Missing required parameters: orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature',
            error: 'Missing parameters'
        });
    }

    const order = (dbStore.orders || []).find(o => o.id === orderId);
    if (!order) {
        return res.status(404).json({ success: false, code: 404, message: 'Internal order not found', error: 'Order not found' });
    }

    // Verify order token authorization (Strict: requires x-order-token header)
    if (!verifyOrderToken(order, req, true)) {
        return res.status(403).json({ success: false, code: 403, message: 'Unauthorized: Invalid order access token header', error: 'Forbidden' });
    }

    // Idempotent check: if already verified and marked paid with same payment ID
    if (order.paymentStatus === 'PAID_SUCCESS' && order.razorpayPaymentId === razorpayPaymentId) {
        return res.json({
            success: true,
            verified: true,
            paymentStatus: 'PAID_SUCCESS',
            paymentId: order.razorpayPaymentId,
            message: 'Payment already verified and captured (idempotent)'
        });
    }

    // Verify razorpayOrderId matches stored order
    if (order.razorpayOrderId && order.razorpayOrderId !== razorpayOrderId) {
        return res.status(400).json({
            success: false,
            code: 400,
            message: 'Razorpay order ID mismatch with internal order record',
            error: 'Order mismatch'
        });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
        return res.status(500).json({ success: false, code: 500, message: 'Server Razorpay credentials not configured', error: 'Server configuration error' });
    }

    // Step 1: HMAC-SHA256 constant-time signature verification
    try {
        const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
        const expectedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(payload)
            .digest('hex');

        const expectedBuf = Buffer.from(expectedSignature, 'utf8');
        const signatureBuf = Buffer.from(razorpaySignature, 'utf8');

        if (expectedBuf.length !== signatureBuf.length || !crypto.timingSafeEqual(expectedBuf, signatureBuf)) {
            return res.status(400).json({
                success: false,
                code: 400,
                message: 'Invalid Razorpay payment signature',
                error: 'Signature verification failed'
            });
        }
    } catch (sigErr) {
        return res.status(400).json({ success: false, code: 400, message: 'Error verifying signature: ' + sigErr.message, error: 'Signature error' });
    }

    // Step 2: Server-side Razorpay SDK payment entity fetch & status validation
    if (!razorpay) {
        return res.status(500).json({ success: false, code: 500, message: 'Razorpay client unavailable', error: 'Payment client error' });
    }

    try {
        const payment = await razorpay.payments.fetch(razorpayPaymentId);
        if (!payment) {
            return res.status(404).json({ success: false, code: 404, message: 'Payment record not found on Razorpay server', error: 'Payment not found' });
        }

        // Verify payment belongs to Razorpay order
        if (payment.order_id !== razorpayOrderId) {
            return res.status(400).json({
                success: false,
                code: 400,
                message: `Payment entity belongs to order ${payment.order_id}, expected ${razorpayOrderId}`,
                error: 'Order ID mismatch'
            });
        }

        // Verify canonical amount in paise
        const expectedPaise = order.amountPaise || order.canonicalAmountPaise || Math.round(Number(order.amount || order.totalAmount) * 100);
        if (Number(payment.amount) !== expectedPaise) {
            return res.status(400).json({
                success: false,
                code: 400,
                message: `Payment amount (${payment.amount}) does not match expected order amount (${expectedPaise})`,
                error: 'Amount mismatch'
            });
        }

        // Verify currency
        if (payment.currency !== 'INR') {
            return res.status(400).json({
                success: false,
                code: 400,
                message: `Invalid currency: ${payment.currency}. Expected INR`,
                error: 'Currency mismatch'
            });
        }

        // Check payment status
        if (payment.status === 'captured') {
            order.paymentStatus = 'PAID_SUCCESS';
            order.paymentCollected = true;
            order.razorpayPaymentId = payment.id;
            order.paymentMode = 'ONLINE_PREPAID';
            saveDbStore();

            return res.json({
                success: true,
                verified: true,
                paymentStatus: 'PAID_SUCCESS',
                paymentId: payment.id,
                message: 'Payment verified and captured successfully'
            });
        } else if (payment.status === 'authorized') {
            order.paymentStatus = 'PAYMENT_AUTHORIZED';
            order.razorpayPaymentId = payment.id;
            saveDbStore();

            return res.json({
                success: true,
                verified: false,
                paymentStatus: 'PAYMENT_AUTHORIZED',
                paymentId: payment.id,
                message: 'Payment is authorized by bank but awaiting capture'
            });
        } else {
            return res.status(400).json({
                success: false,
                verified: false,
                paymentStatus: payment.status || 'FAILED',
                paymentId: payment.id,
                error: `Payment is in ${payment.status} state, not captured`
            });
        }
    } catch (fetchErr) {
        console.error('[Verify Native Fetch Error]:', fetchErr);
        return res.status(500).json({
            success: false,
            code: 500,
            message: 'Failed to fetch payment details from Razorpay: ' + fetchErr.message,
            error: fetchErr.message
        });
    }
});

// 5B. Safe Switching to Hosted Checkout (Checks existing attempts before creating/returning Payment Link)
router.post('/switch-to-hosted', async (req, res) => {
    const { orderId, patientName, patientPhone } = req.body;

    if (!orderId) {
        return res.status(400).json({ success: false, code: 400, message: 'orderId is required', error: 'Missing parameters' });
    }

    const order = (dbStore.orders || []).find(o => o.id === orderId);
    if (!order) {
        return res.status(404).json({ success: false, code: 404, message: 'Order not found', error: 'Order not found' });
    }

    if (!verifyOrderToken(order, req, true)) {
        return res.status(403).json({ success: false, code: 403, message: 'Unauthorized: Invalid order access token header', error: 'Forbidden' });
    }

    // Step 1: If order is already paid, return immediately
    if (order.paymentStatus === 'PAID_SUCCESS') {
        return res.json({
            success: true,
            alreadyPaid: true,
            paymentStatus: 'PAID_SUCCESS',
            paymentId: order.razorpayPaymentId,
            message: 'Order is already paid.'
        });
    }

    // Step 2: Check if an existing native order payment was captured
    if (order.razorpayOrderId && razorpay) {
        try {
            const orderPayments = await razorpay.orders.fetchPayments(order.razorpayOrderId);
            const items = orderPayments?.items || [];
            const captured = items.find(p => p.status === 'captured');
            if (captured) {
                order.paymentStatus = 'PAID_SUCCESS';
                order.paymentCollected = true;
                order.razorpayPaymentId = captured.id;
                order.paymentMode = 'ONLINE_PREPAID';
                saveDbStore();

                return res.json({
                    success: true,
                    alreadyPaid: true,
                    paymentStatus: 'PAID_SUCCESS',
                    paymentId: captured.id,
                    message: 'Payment on native checkout was already captured.'
                });
            }

            const authorized = items.find(p => p.status === 'authorized');
            if (authorized) {
                order.paymentStatus = 'PAYMENT_AUTHORIZED';
                order.razorpayPaymentId = authorized.id;
                saveDbStore();

                return res.json({
                    success: true,
                    alreadyPaid: false,
                    paymentStatus: 'PAYMENT_AUTHORIZED',
                    paymentId: authorized.id,
                    message: 'Payment is authorized on previous attempt, awaiting capture.'
                });
            }
        } catch (checkErr) {
            console.warn('[Switch-to-Hosted Order Check Warning]:', checkErr.message);
        }
    }

    // Step 3: Check if existing payment link was already paid before reusing or creating
    if (order.razorpayPaymentLinkId && razorpay) {
        try {
            const existingPlink = await razorpay.paymentLink.fetch(order.razorpayPaymentLinkId);
            if (existingPlink) {
                // Check if payment link was actually paid
                if (existingPlink.status === 'paid' || existingPlink.amount_paid > 0) {
                    let plinkPayId = null;
                    if (Array.isArray(existingPlink.payments) && existingPlink.payments.length > 0) {
                        const captured = existingPlink.payments.find(p => p.status === 'captured') || existingPlink.payments[0];
                        if (captured && captured.payment_id && captured.payment_id.startsWith('pay_')) {
                            plinkPayId = captured.payment_id;
                        }
                    }
                    if (plinkPayId) {
                        order.paymentStatus = 'PAID_SUCCESS';
                        order.paymentCollected = true;
                        order.razorpayPaymentId = plinkPayId;
                        order.paymentMode = 'ONLINE_PREPAID';
                        saveDbStore();

                        return res.json({
                            success: true,
                            alreadyPaid: true,
                            paymentStatus: 'PAID_SUCCESS',
                            paymentId: plinkPayId,
                            message: 'Payment on hosted payment link was already captured.'
                        });
                    }
                }

                if (existingPlink.status !== 'cancelled' && existingPlink.status !== 'expired') {
                    return res.json({
                        success: true,
                        alreadyPaid: false,
                        paymentUrl: existingPlink.short_url,
                        paymentLinkId: existingPlink.id
                    });
                }
            }
        } catch (plinkFetchErr) {
            console.warn('[Existing Plink Fetch Note]:', plinkFetchErr.message);
        }
    }

    // Step 4: Create a new Payment Link safely
    const amountInPaise = order.amountPaise || order.canonicalAmountPaise || Math.round(Number(order.amount || order.totalAmount || 1499) * 100);
    const receiptId = `MM_${order.id.replace(/[^a-zA-Z0-9]/g, '').slice(-15)}`;

    try {
        let cleanPhone = (patientPhone || order.phone || order.patientPhone || '').replace(/[^0-9]/g, '');
        if (cleanPhone.length === 10) cleanPhone = '+91' + cleanPhone;
        else if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) cleanPhone = '+' + cleanPhone;
        else if (!cleanPhone.startsWith('+')) cleanPhone = '+917997991101';

        const plink = await razorpay.paymentLink.create({
            amount: amountInPaise,
            currency: 'INR',
            accept_partial: false,
            reference_id: receiptId,
            description: `MedMarg Lab Services (${order.id})`,
            customer: {
                name: patientName || order.patientName || 'MedMarg Patient',
                contact: cleanPhone,
                email: order.email || 'patient@medmarg.com'
            },
            notify: { sms: false, email: false },
            callback_url: 'https://medmarg.com/api/v1/payments/callback',
            callback_method: 'get',
            notes: {
                orderId: order.id,
                brand: 'MedMarg Healthcare',
                merchant: 'Medcare Health Services'
            }
        });

        order.razorpayPaymentLinkId = plink.id;
        saveDbStore();

        return res.json({
            success: true,
            alreadyPaid: false,
            paymentUrl: plink.short_url,
            paymentLinkId: plink.id
        });
    } catch (createErr) {
        console.error('[Create Payment Link Error]:', createErr);
        return res.status(500).json({
            success: false,
            code: 500,
            message: 'Failed to create payment link: ' + createErr.message,
            error: createErr.message
        });
    }
});

// 6. Razorpay Webhook Handler (Auto-Verifies Payments & Settlements with Deduplication)
router.post('/razorpay/webhook', (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (webhookSecret) {
        if (!signature) {
            return res.status(400).json({ success: false, message: 'Missing webhook signature header' });
        }
        if (!req.rawBody) {
            return res.status(400).json({ success: false, message: 'Missing raw request body for webhook signature verification' });
        }
        try {
            // Strictly verify using the original unparsed raw body buffer (no re-serialization fallback)
            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(req.rawBody)
                .digest('hex');

            const expectedBuf = Buffer.from(expectedSignature, 'utf8');
            const signatureBuf = Buffer.from(signature, 'utf8');

            if (expectedBuf.length !== signatureBuf.length || !crypto.timingSafeEqual(expectedBuf, signatureBuf)) {
                console.warn('[Razorpay Webhook] Invalid signature received!');
                return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
            }
        } catch (sigErr) {
            console.error('[Razorpay Webhook Signature Check Error]:', sigErr);
            return res.status(400).json({ success: false, message: 'Webhook signature validation error: ' + sigErr.message });
        }
    }

    const { event, payload, contains } = req.body;
    const eventId = req.body.event_id || (payload?.payment?.entity?.id ? `${event}_${payload.payment.entity.id}` : null);
    console.log(`[Razorpay Webhook] Event received: ${event} (ID: ${eventId})`);

    // Durable event deduplication
    if (!dbStore.processedWebhookEvents) dbStore.processedWebhookEvents = [];
    if (eventId && dbStore.processedWebhookEvents.includes(eventId)) {
        console.log(`[Razorpay Webhook] Duplicate event ${eventId} ignored (already processed)`);
        return res.json({ success: true, message: 'Event already processed' });
    }

    try {
        if (event === 'order.paid' || event === 'payment.captured') {
            const payment = payload?.payment?.entity;
            const orderNotes = payment?.notes || {};
            const orderId = orderNotes.orderId || orderNotes.order_id;

            if (orderId && dbStore.orders) {
                const targetOrder = dbStore.orders.find(o => o.id === orderId);
                if (targetOrder) {
                    // Check if already paid with another payment entity (Duplicate Payment Detection)
                    if (targetOrder.paymentStatus === 'PAID_SUCCESS' && targetOrder.razorpayPaymentId && targetOrder.razorpayPaymentId !== payment?.id) {
                        console.warn(`[DUPLICATE_PAYMENT_DETECTED] Order ${orderId} already settled with ${targetOrder.razorpayPaymentId}. Incoming payment: ${payment?.id}`);
                        if (!dbStore.reconciliationLog) dbStore.reconciliationLog = [];
                        dbStore.reconciliationLog.unshift({
                            orderId: orderId,
                            initialPaymentId: targetOrder.razorpayPaymentId,
                            duplicatePaymentId: payment?.id,
                            amount: payment?.amount,
                            currency: payment?.currency,
                            detectedAt: new Date().toISOString(),
                            status: 'EXCESS_PAYMENT_PENDING_REVIEW',
                            note: 'Duplicate payment detected via webhook for already fulfilled order'
                        });
                        saveDbStore();
                    } else if (payment?.status === 'captured') {
                        targetOrder.paymentStatus = 'PAID_SUCCESS';
                        targetOrder.paymentCollected = true;
                        targetOrder.razorpayPaymentId = payment?.id;
                        saveDbStore();
                        console.log(`[Razorpay Webhook] Order ${orderId} marked as PAID_SUCCESS with payment ${payment?.id}.`);
                    } else if (payment?.status === 'authorized') {
                        targetOrder.paymentStatus = 'PAYMENT_AUTHORIZED';
                        targetOrder.razorpayPaymentId = payment?.id;
                        saveDbStore();
                        console.log(`[Razorpay Webhook] Order ${orderId} updated to PAYMENT_AUTHORIZED with payment ${payment?.id}.`);
                    }
                }
            }
        } else if (event === 'payment.failed') {
            const payment = payload?.payment?.entity;
            const orderNotes = payment?.notes || {};
            const orderId = orderNotes.orderId || orderNotes.order_id;
            if (orderId && dbStore.orders) {
                const targetOrder = dbStore.orders.find(o => o.id === orderId);
                if (targetOrder && targetOrder.paymentStatus !== 'PAID_SUCCESS') {
                    targetOrder.paymentStatus = 'PAYMENT_FAILED';
                    saveDbStore();
                    console.log(`[Razorpay Webhook] Order ${orderId} marked as PAYMENT_FAILED.`);
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

        if (eventId) {
            dbStore.processedWebhookEvents.push(eventId);
            if (dbStore.processedWebhookEvents.length > 2000) {
                dbStore.processedWebhookEvents = dbStore.processedWebhookEvents.slice(-1000);
            }
            saveDbStore();
        }

        res.json({ success: true, message: 'Webhook processed successfully' });
    } catch (whErr) {
        console.error('[Razorpay Webhook Processing Error]:', whErr);
        res.status(500).json({ success: false, error: whErr.message });
    }
});

// 7. Check / Verify Order / Payment Status Live (supports Razorpay Payment Link sync)
router.get('/order-status/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const order = (dbStore.orders || []).find(o => o.id === orderId);
    if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Verify order token authorization strictly: x-order-token header only, no legacy tokenless bypass
    if (!verifyOrderToken(order, req, true)) {
        return res.status(403).json({ success: false, code: 403, error: 'Unauthorized: Invalid order access token' });
    }

    // If order has a razorpayPaymentLinkId and is not marked paid yet, query Razorpay live
    if (order.razorpayPaymentLinkId && order.paymentStatus !== 'PAID_SUCCESS' && razorpay) {
        try {
            const plink = await razorpay.paymentLink.fetch(order.razorpayPaymentLinkId);
            if (plink) {
                const expectedPaise = order.amountPaise || order.canonicalAmountPaise || Math.round(Number(order.amount || order.totalAmount || 1499) * 100);
                
                // Validate plink belongs to order and amount/currency match
                const plinkAmount = Number(plink.amount);
                const isAmountMatch = plinkAmount === expectedPaise;
                const isCurrencyMatch = plink.currency === 'INR';

                if (isAmountMatch && isCurrencyMatch && (plink.status === 'paid' || plink.amount_paid >= expectedPaise)) {
                    // Extract real payment ID from plink.payments array (never substitute plink.id!)
                    let realPaymentId = null;
                    if (Array.isArray(plink.payments) && plink.payments.length > 0) {
                        const captured = plink.payments.find(p => p.status === 'captured');
                        if (captured && captured.payment_id && captured.payment_id.startsWith('pay_')) {
                            realPaymentId = captured.payment_id;
                        } else {
                            const first = plink.payments[0];
                            if (first && first.payment_id && first.payment_id.startsWith('pay_')) {
                                realPaymentId = first.payment_id;
                            }
                        }
                    }

                    if (realPaymentId) {
                        order.paymentStatus = 'PAID_SUCCESS';
                        order.paymentCollected = true;
                        order.razorpayPaymentId = realPaymentId;
                        order.paymentMode = 'ONLINE_PREPAID';
                        saveDbStore();
                    } else {
                        // Payment link says paid, but payments list is still propagating
                        console.log(`[Plink Status Sync] Plink ${plink.id} marked paid, but real paymentId not yet propagated.`);
                    }
                }
            }
        } catch (syncErr) {
            console.warn('[Razorpay plink sync]:', syncErr.message);
        }
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
        paymentId: order.razorpayPaymentId || null,
        amount: order.amount || order.totalAmount
    });
});

// 8. Financial Reconciliation Ledger (Multi-Lab, Phlebotomist Payouts, Gross Margins)
router.get('/ledger', (req, res) => {
    const orders = dbStore.orders || [];
    const ledger = orders.map((o, idx) => {
        const orderAmount = Number(o.amount || o.totalAmount || 499);
        const labCost = Math.round(orderAmount * 0.45); // 45% B2B Lab Transfer
        const phleboPayout = Math.round(orderAmount * 0.20); // 20% Phlebotomist Doorstep Payout
        const grossMargin = orderAmount - labCost - phleboPayout;

        return {
            id: `TXN-${1000 + idx}`,
            orderId: o.id,
            patient: o.patientName || 'Care Seeker',
            patientPhone: o.phone || o.patientPhone || 'N/A',
            mode: o.paymentMode || (o.paymentStatus === 'PAID_DOORSTEP_QR' ? 'Doorstep UPI QR' : 'Online Prepaid'),
            amount: orderAmount,
            labCost,
            phleboPayout,
            grossMargin,
            paymentStatus: o.paymentStatus || 'PAID_SUCCESS',
            settlementStatus: o.settlementStatus || (o.paymentStatus === 'PAID_SUCCESS' ? 'SETTLED' : 'PENDING'),
            labName: o.processingLab || 'MedMarg Central Pathology Hub',
            date: o.date || 'Today'
        };
    });

    const totalCollected = ledger.reduce((acc, curr) => acc + curr.amount, 0);
    const totalLabPayable = ledger.reduce((acc, curr) => acc + curr.labCost, 0);
    const totalPhleboPayable = ledger.reduce((acc, curr) => acc + curr.phleboPayout, 0);
    const netGrossMargin = ledger.reduce((acc, curr) => acc + curr.grossMargin, 0);

    res.json({
        success: true,
        ledger,
        summary: {
            totalCollected,
            totalLabPayable,
            totalPhleboPayable,
            netGrossMargin,
            settledOrdersCount: ledger.filter(l => l.settlementStatus === 'SETTLED').length,
            pendingOrdersCount: ledger.filter(l => l.settlementStatus === 'PENDING').length
        }
    });
});

// 9. Razorpay Payment Link Callback Endpoint
router.get('/callback', (req, res) => {
    const { razorpay_payment_id, razorpay_payment_link_id, razorpay_payment_link_reference_id, razorpay_payment_link_status } = req.query;
    console.log(`[Payment Link Callback] ID: ${razorpay_payment_id}, Link: ${razorpay_payment_link_id}, Status: ${razorpay_payment_link_status}`);

    const isPaid = razorpay_payment_link_status === 'paid' || Boolean(razorpay_payment_id);
    const orderId = razorpay_payment_link_reference_id ? razorpay_payment_link_reference_id.replace(/^MM_/, 'MM-LAB-') : '';
    const paymentId = razorpay_payment_id || '';

    // Secure App Link / Deep Link redirect to MedMarg Android / iOS App
    // Note: No secret tokens are exposed in deep-link URL; client will poll /payments/order-status/:orderId
    const appDeepLink = `medmarg://payment-callback?status=${isPaid ? 'success' : 'failed'}&payment_link_id=${razorpay_payment_link_id || ''}&razorpay_payment_id=${encodeURIComponent(paymentId)}&order_id=${encodeURIComponent(orderId)}`;

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="refresh" content="1;url=${appDeepLink}">
            <title>MedMarg Payment Complete</title>
            <style>
                body { background: #0B132B; color: #FFFFFF; font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
                .card { padding: 32px; background: #1C2541; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); max-width: 90%; }
                .success { color: #10B981; font-size: 48px; margin-bottom: 12px; }
                .btn { display: inline-block; margin-top: 18px; padding: 12px 24px; background: #006B70; color: #fff; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="success">${isPaid ? '✓' : 'ℹ'}</div>
                <h2 style="margin: 0 0 8px;">${isPaid ? 'Payment Received!' : 'Processing Payment...'}</h2>
                <p style="color: #94A3B8; font-size: 14px; margin: 0;">Returning securely to MedMarg app...</p>
                <a href="${appDeepLink}" class="btn">Tap to Return to MedMarg</a>
            </div>
            <script>
                // Instant JS redirect to app deep link
                try {
                    window.location.href = "${appDeepLink}";
                } catch(e) {}
            </script>
        </body>
        </html>
    `);
});

// 10. Manual Doorstep Cash / External Collection Override (Staff / Phlebo)
router.post('/mark-collected', (req, res) => {
    const { orderId, mode = 'CASH_DOORSTEP', collectedBy = 'Staff' } = req.body;
    if (!orderId) {
        return res.status(400).json({ success: false, error: 'Order ID required' });
    }

    const order = (dbStore.orders || []).find(o => o.id === orderId);
    if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
    }

    order.paymentStatus = 'PAID_COLLECTED';
    order.paymentCollected = true;
    order.paymentMode = mode;
    order.collectedBy = collectedBy;
    order.collectedAt = new Date().toISOString();

    saveDbStore();

    res.json({
        success: true,
        message: `Order #${orderId} marked as collected via ${mode}`,
        order
    });
});

module.exports = router;

