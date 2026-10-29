require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// DATA STORES
const { catalogState } = require('./models/catalogStore');
const { dbStore } = require('./models/dataStore');

// FEATURE ROUTERS
const { authRouter } = require('./routes/authRoutes');
const catalogRouter = require('./routes/catalogRoutes');
const { orderRouter } = require('./routes/orderRoutes');
const adminRouter = require('./routes/adminRoutes');
const agentRouter = require('./routes/agentRoutes');
const paymentRouter = require('./routes/paymentRoutes');
const offerRouter = require('./routes/offerRoutes');
const scanRouter = require('./routes/scanRoutes');
const customerRouter = require('./routes/customerRoutes');
const reportRouter = require('./routes/reportRoutes');

const app = express();

// SAFE PORT CHECK FOR HOSTINGER VPS (Port 5080 for MedMarg API)
const PORT = process.env.PORT || 5080;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// -------------------------------------------------------------
// HEALTH ENDPOINT
// -------------------------------------------------------------
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        service: 'MedMarg Modular Backend API',
        catalog: {
            tests: (catalogState.tests || []).length,
            profiles: (catalogState.profiles || []).length,
            packages: (catalogState.packages || []).length,
            lastSynced: catalogState.lastSynced
        },
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

// -------------------------------------------------------------
// FEATURE ROUTE MOUNTS
// -------------------------------------------------------------
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/catalog', catalogRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/agent', agentRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/offers', offerRouter);
app.use('/api/v1/scans', scanRouter);
app.use('/api/v1/customer', customerRouter);
app.use('/api/v1/customers', customerRouter);
app.use('/api/v1', reportRouter);
app.use('/api/v1', orderRouter);

// LEGACY TESTS ENDPOINT COMPATIBILITY (Single-Lab MedMarg Format)
app.get('/api/v1/tests', (req, res) => {
    const list = (catalogState.tests || []).slice(0, 100).map(t => ({
        id: t.id,
        name: t.name,
        code: t.code,
        category: t.category,
        parametersCount: 1,
        sampleType: t.sampleType,
        fastingRequiredHours: t.fasting === 'YES' ? 10 : 0,
        price: t.price,
        mrp: t.mrp,
        tatHours: t.tatHours
    }));

    res.json({
        success: true,
        tests: list,
        packages: catalogState.packages || []
    });
});

// -------------------------------------------------------------
// SERVE STATIC REACT WEB FRONTEND (UNIFIED HOSTING)
// -------------------------------------------------------------
const webDistPath = path.join(__dirname, '../web/dist');
if (fs.existsSync(webDistPath)) {
    console.log(`[Static Frontend] Serving built React SPA from: ${webDistPath}`);
    app.use(express.static(webDistPath));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) return next();
        res.sendFile(path.join(webDistPath, 'index.html'));
    });
}

// Global error safety guards to prevent crash loops
process.on('uncaughtException', (err) => {
    console.error('[CRITICAL] Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    const ordersCount = (dbStore.orders || []).length;
    const flCount = (dbStore.freelancers || []).length;
    const partnerCount = (dbStore.partnerQueue || []).length;
    const zonesCount = (dbStore.territories || []).length;

    console.log(`=======================================================`);
    console.log(` MedMarg Modular Backend API running on port ${PORT}`);
    console.log(` Database Store Active: ${ordersCount} Orders | ${flCount} Freelancers | ${partnerCount} Pre-Registered Partners`);
    console.log(` Dispatch Cascade & Territories Active: ${zonesCount} Zones Managed`);
    console.log(` Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
});
