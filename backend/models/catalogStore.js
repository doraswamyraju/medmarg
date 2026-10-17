const fs = require('fs');
const path = require('path');

const CATALOG_FILE = path.join(__dirname, '../data/catalogData.json');

const catalogState = {
    tests: [],
    profiles: [],
    packages: [],
    lastSynced: new Date().toISOString()
};

function loadCatalogData() {
    try {
        if (fs.existsSync(CATALOG_FILE)) {
            const raw = fs.readFileSync(CATALOG_FILE, 'utf8');
            const parsed = JSON.parse(raw);
            catalogState.tests = parsed.tests || [];
            catalogState.profiles = parsed.profiles || [];
            catalogState.packages = parsed.packages || [];
            catalogState.lastSynced = parsed.lastSynced || new Date().toISOString();
            console.log(`[CatalogStore] Loaded catalog: ${catalogState.tests.length} tests, ${catalogState.profiles.length} profiles, ${catalogState.packages.length} packages.`);
        }
    } catch (err) {
        console.error('[CatalogStore] Failed to load catalogData.json:', err.message);
    }
}

function saveCatalogData() {
    try {
        catalogState.lastSynced = new Date().toISOString();
        fs.writeFileSync(CATALOG_FILE, JSON.stringify(catalogState, null, 2), 'utf8');
        try {
            const auditStore = require('./auditStore');
            auditStore.createSnapshot('AUTO', 'Catalog updated');
        } catch (e) {}
    } catch (err) {
        console.error('[CatalogStore] Failed to persist catalogData.json:', err.message);
    }
}

// Initial load
loadCatalogData();

module.exports = {
    catalogState,
    loadCatalogData,
    saveCatalogData,
    CATALOG_FILE
};
