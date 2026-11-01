const fs = require('fs');
const path = require('path');

const CATALOG_FILE = path.join(__dirname, '../data/catalogData.json');

const DEFAULT_CATEGORIES = [
    {
        id: "CAT_POPULAR",
        name: "Popular Tests",
        description: "Frequently booked routine investigations and screenings",
        icon: "flame.fill",
        displayOrder: 1,
        isFeatured: true,
        active: true
    },
    {
        id: "CAT_DIABETES",
        name: "Diabetes Care",
        description: "HbA1c, Fasting & Post-Prandial Glucose monitoring",
        icon: "drop.fill",
        displayOrder: 2,
        isFeatured: true,
        active: true
    },
    {
        id: "CAT_HEART",
        name: "Heart Health",
        description: "Lipid profile, cardiac risk markers & cholesterol assessment",
        icon: "heart.fill",
        displayOrder: 3,
        isFeatured: true,
        active: true
    },
    {
        id: "CAT_THYROID",
        name: "Thyroid Care",
        description: "TSH, Total T3, Total T4 thyroid gland function evaluations",
        icon: "cross.case.fill",
        displayOrder: 4,
        isFeatured: true,
        active: true
    },
    {
        id: "CAT_WOMEN",
        name: "Women's Health",
        description: "Hormonal, iron deficiency, bone & wellness screenings for women",
        icon: "figure.stand.dress",
        displayOrder: 5,
        isFeatured: true,
        active: true
    },
    {
        id: "CAT_SENIOR",
        name: "Senior Citizen Health",
        description: "Geriatric wellness, vital organs and arthritis checks",
        icon: "figure.walk",
        displayOrder: 6,
        isFeatured: true,
        active: true
    },
    {
        id: "CAT_WELLNESS",
        name: "Full Body Checkups",
        description: "Comprehensive preventive health packages covering 80+ parameters",
        icon: "shield.lefthalf.filled",
        displayOrder: 7,
        isFeatured: true,
        active: true
    }
];

const catalogState = {
    tests: [],
    profiles: [],
    packages: [],
    categories: [],
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
            catalogState.categories = (parsed.categories && parsed.categories.length > 0) 
                ? parsed.categories 
                : DEFAULT_CATEGORIES;
            catalogState.lastSynced = parsed.lastSynced || new Date().toISOString();

            // Safe merge categoryIds to existing items if not present
            catalogState.tests.forEach(t => {
                if (!Array.isArray(t.categoryIds)) {
                    t.categoryIds = t.categoryIds ? [t.categoryIds] : ["CAT_POPULAR"];
                }
            });
            catalogState.profiles.forEach(p => {
                if (!Array.isArray(p.categoryIds)) {
                    p.categoryIds = p.categoryIds ? [p.categoryIds] : (p.code === 'LIPID' ? ["CAT_POPULAR", "CAT_HEART"] : ["CAT_POPULAR"]);
                }
            });
            catalogState.packages.forEach(pkg => {
                if (!Array.isArray(pkg.categoryIds)) {
                    pkg.categoryIds = pkg.categoryIds ? [pkg.categoryIds] : ["CAT_POPULAR", "CAT_WELLNESS"];
                }
            });

            console.log(`[CatalogStore] Loaded catalog: ${catalogState.tests.length} tests, ${catalogState.profiles.length} profiles, ${catalogState.packages.length} packages, ${catalogState.categories.length} categories.`);
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
