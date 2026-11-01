const fs = require('fs');
const path = require('path');

const CATALOG_FILE = path.join(__dirname, '../data/catalogData.json');

const TAXONOMY_GROUPS = [
    { key: "CLINICAL", label: "Clinical Specialties", icon: "flask.fill", badge: "🔬 CLINICAL" },
    { key: "CONDITION", label: "Health Concerns & Conditions", icon: "cross.fill", badge: "🩺 CONCERNS" },
    { key: "ORGAN", label: "Body Organs & Systems", icon: "heart.fill", badge: "🫀 ORGANS" },
    { key: "DEMOGRAPHIC", label: "Demographic Collections", icon: "person.2.fill", badge: "👥 DEMOGRAPHICS" },
    { key: "GOAL", label: "Health Goals", icon: "target", badge: "🎯 GOALS" },
    { key: "CURATED", label: "Curated Collections & Campaigns", icon: "sparkles", badge: "⭐ CURATED" }
];

const DEFAULT_CATEGORIES = [
    // 1. CLINICAL SPECIALTIES
    { id: "CAT_CLIN_HEM", name: "Hematology", group: "CLINICAL", description: "Complete blood counts, cell morphology & coagulation parameters", icon: "drop.fill", color: "#DC2626", displayOrder: 1, isFeatured: false, active: true },
    { id: "CAT_CLIN_BIO", name: "Clinical Biochemistry", group: "CLINICAL", description: "Blood glucose, renal & liver enzymes, lipid & metabolic markers", icon: "waveform.path.ecg", color: "#006B70", displayOrder: 2, isFeatured: false, active: true },
    { id: "CAT_CLIN_HORM", name: "Thyroid & Hormones", group: "CLINICAL", description: "Endocrine investigations, fertility & metabolic hormones", icon: "cross.fill", color: "#7C3AED", displayOrder: 3, isFeatured: false, active: true },
    { id: "CAT_CLIN_IMM", name: "Immunology & Serology", group: "CLINICAL", description: "Antibodies, autoimmune panels, viral and bacterial antigens", icon: "shield.checkerboard", color: "#2563EB", displayOrder: 4, isFeatured: false, active: true },
    { id: "CAT_CLIN_MICRO", name: "Microbiology", group: "CLINICAL", description: "Culture, antibiotic sensitivity, smear & pathogen assays", icon: "microscope", color: "#059669", displayOrder: 5, isFeatured: false, active: true },
    { id: "CAT_CLIN_URINE", name: "Urine & Stool Analysis", group: "CLINICAL", description: "Urinalysis, occult blood, gastrointestinal filtration", icon: "flask.fill", color: "#D97706", displayOrder: 6, isFeatured: false, active: true },
    { id: "CAT_CLIN_MOL", name: "Molecular Diagnostics", group: "CLINICAL", description: "RT-PCR, viral loads, genetic & biomarker sequencing", icon: "dna", color: "#6366F1", displayOrder: 7, isFeatured: false, active: true },

    // 2. HEALTH CONCERNS & CONDITIONS
    { id: "CAT_DIABETES", name: "Diabetes Care", group: "CONDITION", description: "HbA1c, Fasting & Post-Prandial Glucose monitoring", icon: "drop.fill", color: "#EF4444", displayOrder: 10, isFeatured: true, active: true },
    { id: "CAT_FEVER", name: "Fever & Infection", group: "CONDITION", description: "Dengue, Malaria, Typhoid, viral fevers and inflammatory markers", icon: "thermometer.medium", color: "#E11D48", displayOrder: 11, isFeatured: true, active: true },
    { id: "CAT_THYROID", name: "Thyroid Disorders", group: "CONDITION", description: "TSH, Total & Free T3, T4 thyroid gland function evaluations", icon: "cross.fill", color: "#006B70", displayOrder: 12, isFeatured: true, active: true },
    { id: "CAT_HEART", name: "Heart Health", group: "CONDITION", description: "Lipid profile, cardiac risk markers & cholesterol assessment", icon: "heart.fill", color: "#DC2626", displayOrder: 13, isFeatured: true, active: true },
    { id: "CAT_KIDNEY", name: "Kidney Health", group: "CONDITION", description: "KFT, Creatinine, Blood Urea Nitrogen, Uric Acid & Electrolytes", icon: "crosshair", color: "#0891B2", displayOrder: 14, isFeatured: true, active: true },
    { id: "CAT_LIVER", name: "Liver Health", group: "CONDITION", description: "LFT, Bilirubin, SGOT, SGPT, Alkaline Phosphatase & Albumin", icon: "flame.fill", color: "#EA580C", displayOrder: 15, isFeatured: true, active: true },
    { id: "CAT_WOMEN", name: "Women's Health", group: "CONDITION", description: "Hormonal, iron deficiency, bone & wellness screenings for women", icon: "figure.dress.line.vertical.figure", color: "#EC4899", displayOrder: 16, isFeatured: true, active: true },
    { id: "CAT_MEN", name: "Men's Health", group: "CONDITION", description: "Prostate PSA, testosterone, vitality and cardiac checks for men", icon: "person.fill", color: "#2563EB", displayOrder: 17, isFeatured: true, active: true },
    { id: "CAT_SKIN_HAIR", name: "Hair & Skin Health", group: "CONDITION", description: "Biotin, Zinc, Iron studies, Vitamin D & dermatology markers", icon: "sparkles", color: "#D97706", displayOrder: 18, isFeatured: true, active: true },
    { id: "CAT_ALLERGY", name: "Allergy & Respiratory", group: "CONDITION", description: "IgE antibodies, respiratory pollen, dust & food allergen panels", icon: "waveform.path.ecg", color: "#059669", displayOrder: 19, isFeatured: true, active: true },
    { id: "CAT_BONE_JOINT", name: "Bone & Joint Health", group: "CONDITION", description: "Calcium, Vitamin D3, Phosphorus, Uric Acid & RA Factor", icon: "shield.fill", color: "#7C3AED", displayOrder: 20, isFeatured: true, active: true },
    { id: "CAT_CANCER", name: "Cancer Screening", group: "CONDITION", description: "Preventive oncology markers, PSA, CEA, CA-125 & AFP", icon: "cross.fill", color: "#8B5CF6", displayOrder: 21, isFeatured: true, active: true },

    // 3. BODY ORGANS & SYSTEMS
    { id: "CAT_ORG_HEART", name: "Heart", group: "ORGAN", description: "Cardiovascular system, arterial lipid balance & cardiac markers", icon: "heart.fill", color: "#DC2626", displayOrder: 30, isFeatured: true, active: true },
    { id: "CAT_ORG_THYROID", name: "Thyroid", group: "ORGAN", description: "Endocrine gland regulation, metabolic rate & hormonal synthesis", icon: "cross.fill", color: "#006B70", displayOrder: 31, isFeatured: true, active: true },
    { id: "CAT_ORG_LIVER", name: "Liver", group: "ORGAN", description: "Hepatic detoxification, protein synthesis & enzyme regulation", icon: "flame.fill", color: "#EA580C", displayOrder: 32, isFeatured: true, active: true },
    { id: "CAT_ORG_KIDNEY", name: "Kidney", group: "ORGAN", description: "Renal excretion, glomerular filtration, creatinine & electrolytes", icon: "crosshair", color: "#0891B2", displayOrder: 33, isFeatured: true, active: true },
    { id: "CAT_ORG_LUNGS", name: "Lungs & Chest", group: "ORGAN", description: "Pulmonary health, respiratory allergy & oxygenation markers", icon: "waveform.path.ecg", color: "#059669", displayOrder: 34, isFeatured: true, active: true },
    { id: "CAT_ORG_BONE", name: "Bone & Skeleton", group: "ORGAN", description: "Skeletal density, joint articulation, calcium & mineralization", icon: "shield.fill", color: "#7C3AED", displayOrder: 35, isFeatured: true, active: true },
    { id: "CAT_ORG_REPRO", name: "Reproductive System", group: "ORGAN", description: "Reproductive wellness, pelvic hormones & fertility parameters", icon: "figure.dress.line.vertical.figure", color: "#EC4899", displayOrder: 36, isFeatured: true, active: true },
    { id: "CAT_ORG_DIGEST", name: "Digestive System", group: "ORGAN", description: "Gastrointestinal tract, gut absorption, stomach & pancreas", icon: "drop.fill", color: "#D97706", displayOrder: 37, isFeatured: true, active: true },
    { id: "CAT_ORG_FULLBODY", name: "Full Body", group: "ORGAN", description: "Comprehensive multi-organ vital health evaluation", icon: "shield.checkerboard", color: "#006B70", displayOrder: 38, isFeatured: true, active: true },

    // 4. DEMOGRAPHIC COLLECTIONS
    { id: "CAT_DEMO_CHILD", name: "Children & Pediatrics", group: "DEMOGRAPHIC", description: "Growth parameters, pediatric CBC, developmental nutrition (0-14 yrs)", icon: "figure.and.child.holdinghands", color: "#14B8A6", displayOrder: 40, isFeatured: true, active: true },
    { id: "CAT_DEMO_ADULT", name: "Adults", group: "DEMOGRAPHIC", description: "Routine health screening, corporate wellness, active lifestyle (18-59 yrs)", icon: "person.fill", color: "#2563EB", displayOrder: 41, isFeatured: true, active: true },
    { id: "CAT_SENIOR", name: "Senior Citizens", group: "DEMOGRAPHIC", description: "Geriatric vital organs, arthritis, diabetes & cardiac care (60+ yrs)", icon: "figure.seated.side.right", color: "#7C3AED", displayOrder: 42, isFeatured: true, active: true },
    { id: "CAT_DEMO_PREG", name: "Pregnancy & Antenatal", group: "DEMOGRAPHIC", description: "Maternal nutrition, fetal development & gestational screenings", icon: "heart.fill", color: "#EC4899", displayOrder: 43, isFeatured: true, active: true },

    // 5. HEALTH GOALS
    { id: "CAT_GOAL_PREV", name: "Preventive Health", group: "GOAL", description: "Early detection of latent risks before clinical symptoms develop", icon: "shield.checkerboard", color: "#059669", displayOrder: 50, isFeatured: true, active: true },
    { id: "CAT_WELLNESS", name: "Annual Checkups", group: "GOAL", description: "Master yearly comprehensive evaluations covering 80+ parameters", icon: "shield.checkerboard", color: "#006B70", displayOrder: 51, isFeatured: true, active: true },
    { id: "CAT_GOAL_MONITOR", name: "Routine Monitoring", group: "GOAL", description: "Ongoing tracking for hypertension, diabetes, thyroid & lipid control", icon: "waveform.path.ecg", color: "#0891B2", displayOrder: 52, isFeatured: true, active: true },
    { id: "CAT_GOAL_FITNESS", name: "Fitness & Wellness", group: "GOAL", description: "Athletic performance, muscle recovery, protein & vitamin biomarkers", icon: "flame.fill", color: "#EA580C", displayOrder: 53, isFeatured: true, active: true },
    { id: "CAT_GOAL_RX", name: "Doctor-Prescribed Tests", group: "GOAL", description: "Rapid diagnostic fulfillment for in-clinic OPD doctor prescriptions", icon: "stethoscope", color: "#006B70", displayOrder: 54, isFeatured: true, active: true },

    // 6. CURATED COLLECTIONS & CAMPAIGNS
    { id: "CAT_POPULAR", name: "Popular Tests", group: "CURATED", description: "Frequently booked routine investigations and screenings", icon: "flame.fill", color: "#F59E0B", displayOrder: 60, isFeatured: true, active: true },
    { id: "CAT_CUR_BESTSELLER", name: "Bestselling Packages", group: "CURATED", description: "Top-rated multi-organ preventive health packages", icon: "sparkles", color: "#D97706", displayOrder: 61, isFeatured: true, active: true },
    { id: "CAT_CUR_AFFORDABLE", name: "Affordable Checkups", group: "CURATED", description: "High-yield vital screenings at accessible MedMarg prices", icon: "drop.fill", color: "#059669", displayOrder: 62, isFeatured: true, active: true },
    { id: "CAT_CUR_FEATURED", name: "Featured Tests", group: "CURATED", description: "Doctor-endorsed clinical investigations with rapid turnaround", icon: "crosshair", color: "#2563EB", displayOrder: 63, isFeatured: true, active: true },
    { id: "CAT_CUR_SEASONAL", name: "Seasonal Campaigns", group: "CURATED", description: "Special weather, festival and seasonal health packages", icon: "thermometer.medium", color: "#E11D48", displayOrder: 64, isFeatured: true, active: true }
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
            // Non-destructive safe merge of categories across all 6 taxonomy groups
            let existingCats = (parsed.categories && parsed.categories.length > 0) ? parsed.categories : [...DEFAULT_CATEGORIES];
            const existingMap = new Map();
            existingCats.forEach(c => {
                existingMap.set(c.id, c);
            });

            // Ensure all canonical default categories exist, and existing ones have a group assigned
            DEFAULT_CATEGORIES.forEach(defCat => {
                if (!existingMap.has(defCat.id)) {
                    existingCats.push(defCat);
                    existingMap.set(defCat.id, defCat);
                } else {
                    const existing = existingMap.get(defCat.id);
                    if (!existing.group) {
                        existing.group = defCat.group;
                    }
                    if (!existing.color && defCat.color) {
                        existing.color = defCat.color;
                    }
                }
            });

            // Ensure every category has a valid group
            existingCats.forEach(c => {
                if (!c.group) {
                    c.group = "CONDITION";
                }
            });

            catalogState.categories = existingCats;
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
