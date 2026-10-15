// MedMarg Master Catalog Store (Unified Single-Lab Architecture)
// Loads 913 Tests and 87 Profiles from tests data master with full search, filtering and package creation.

import initialCatalog from './catalogData.json';

const STORAGE_KEY = 'medmarg_custom_catalog_v2';

// Load stored state or fallback to default ingested json
export function getCatalogState() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.tests && parsed.tests.length > 0) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn('LocalStorage read error, fallback to static catalog:', e);
    }
    return initialCatalog;
}

export function saveCatalogState(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.warn('LocalStorage write error:', e);
    }
}

/**
 * Filter catalog items by search keyword, fasting status, and sample type
 */
export function filterCatalogItems(items = [], query = '', fastingFilter = 'ALL', sampleFilter = 'ALL') {
    return items.filter(item => {
        // Query match
        const q = query.trim().toLowerCase();
        const matchesQuery = !q || 
            (item.name && item.name.toLowerCase().includes(q)) ||
            (item.code && item.code.toLowerCase().includes(q)) ||
            (item.sampleType && item.sampleType.toLowerCase().includes(q));

        // Fasting match
        const matchesFasting = fastingFilter === 'ALL' || item.fasting === fastingFilter;

        // Sample type match
        const matchesSample = sampleFilter === 'ALL' || 
            (item.sampleType && item.sampleType.toUpperCase().includes(sampleFilter.toUpperCase()));

        return matchesQuery && matchesFasting && matchesSample;
    });
}

/**
 * Aggregate sample types from a list of profiles and tests
 */
export function calculateAggregatedSamples(profiles = [], tests = [], allProfiles = [], allTests = []) {
    const sampleSet = new Set();

    profiles.forEach(code => {
        const p = allProfiles.find(item => item.code === code);
        if (p && p.sampleType) {
            p.sampleType.split(',').forEach(s => sampleSet.add(s.trim().toUpperCase()));
        }
    });

    tests.forEach(code => {
        const t = allTests.find(item => item.code === code);
        if (t && t.sampleType) {
            t.sampleType.split(',').forEach(s => sampleSet.add(s.trim().toUpperCase()));
        }
    });

    const arr = Array.from(sampleSet).filter(Boolean);
    return arr.length > 0 ? arr : ['SERUM'];
}

/**
 * Check if any selected item requires fasting
 */
export function calculateFastingRequirement(profiles = [], tests = [], allProfiles = [], allTests = []) {
    const hasProfileFasting = profiles.some(code => {

        const p = allProfiles.find(item => item.code === code);
        return p && p.fasting === 'YES';
    });

    const hasTestFasting = tests.some(code => {
        const t = allTests.find(item => item.code === code);
        return t && t.fasting === 'YES';
    });

    return hasProfileFasting || hasTestFasting;
}


/**
 * Multi-Lab Pricing Architecture (MedMarg Suggested, Thyrocare, Lalpath Labs, & Extensible Signed-Up Labs)
 */

export const DEFAULT_LAB_PROVIDERS = [
    {
        id: 'medmarg_suggested',
        name: 'MedMarg',
        suggestedLab: 'Central Processing Partner Lab',
        isMedmargSuggested: true,
        badge: 'Recommended & Best Price',
        accentColor: '#006B70',
        markupMultiplier: 1.0,
        mrpMultiplier: 1.6
    },
    {
        id: 'thyrocare',
        name: 'Thyrocare',
        suggestedLab: null,
        isMedmargSuggested: false,
        badge: 'Automated Processing',
        accentColor: '#B91C1C',
        markupMultiplier: 1.15,
        mrpMultiplier: 1.7
    },
    {
        id: 'lalpath',
        name: 'Dr. Lal PathLabs',
        suggestedLab: null,
        isMedmargSuggested: false,
        badge: 'National Reference Lab',
        accentColor: '#D97706',
        markupMultiplier: 1.30,
        mrpMultiplier: 1.85
    }
];

export function getDefaultLabPricing(basePrice = 299, baseMrp = null, tatHours = 24, customSuggestedLab = null) {
    const p = Math.max(99, Number(basePrice) || 299);
    const suggestedLabName = customSuggestedLab || 'Central Partner Hub (Tirupati/Regional)';

    return [
        {
            labId: 'medmarg_suggested',
            labName: 'MedMarg',
            suggestedLabName: suggestedLabName,
            isMedmargSuggested: true,
            price: p,
            mrp: Number(baseMrp) || Math.round(p * 1.6),
            discountPercent: Math.max(10, Math.round((((Number(baseMrp) || p * 1.6) - p) / (Number(baseMrp) || p * 1.6)) * 100)),
            tatHours: Number(tatHours) || 24,
            tag: '⭐ Best Price & Verified Quality',
            isRecommended: true
        },
        {
            labId: 'thyrocare',
            labName: 'Thyrocare',
            suggestedLabName: null,
            isMedmargSuggested: false,
            price: Math.round((p * 1.15) / 10) * 10 - 1, // Nice retail price ending (e.g. 349)
            mrp: Math.round((p * 1.7) / 10) * 10,
            discountPercent: Math.max(10, Math.round(((Math.round((p * 1.7) / 10) * 10 - (Math.round((p * 1.15) / 10) * 10 - 1)) / (Math.round((p * 1.7) / 10) * 10)) * 100)),
            tatHours: Number(tatHours) || 24,
            tag: '⚡ Direct Automated Center',
            isRecommended: false
        },
        {
            labId: 'lalpath',
            labName: 'Dr. Lal PathLabs',
            suggestedLabName: null,
            isMedmargSuggested: false,
            price: Math.round((p * 1.30) / 10) * 10 - 1, // Nice retail price ending (e.g. 399)
            mrp: Math.round((p * 1.85) / 10) * 10,
            discountPercent: Math.max(10, Math.round(((Math.round((p * 1.85) / 10) * 10 - (Math.round((p * 1.30) / 10) * 10 - 1)) / (Math.round((p * 1.85) / 10) * 10)) * 100)),
            tatHours: Number(tatHours) || 24,
            tag: '🏆 NABL / CAP Gold Standard',
            isRecommended: false
        }
    ];
}

export const PREFERRED_LAB_STORAGE_KEY = 'medmarg_preferred_lab_choice';
export const PREFERRED_LAB_KEY_ALT = 'medmarg_preferred_lab';

export function getPreferredLab() {
    try {
        const stored = localStorage.getItem(PREFERRED_LAB_STORAGE_KEY) || localStorage.getItem(PREFERRED_LAB_KEY_ALT);
        if (stored && typeof stored === 'string' && stored.trim()) {
            return stored.trim();
        }
    } catch (e) {
        // Fallback
    }
    return 'medmarg_suggested';
}

export function savePreferredLab(labId) {
    try {
        if (labId && typeof labId === 'string' && labId.trim()) {
            const clean = labId.trim();
            localStorage.setItem(PREFERRED_LAB_STORAGE_KEY, clean);
            localStorage.setItem(PREFERRED_LAB_KEY_ALT, clean);
            localStorage.setItem('medmarg_remember_lab_flag', 'true');
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('medmarg_lab_changed', { detail: { labId: clean } }));
            }
        }
    } catch (e) {
        console.warn('Could not save preferred lab:', e);
    }
}

/**
 * Returns array of lab pricing for an item. If item does not have custom labPricing,
 * computes standard MedMarg, Thyrocare, Lalpath Labs pricing dynamically.
 */
export function getItemLabPricing(item) {
    if (item && item.labPricing && Array.isArray(item.labPricing) && item.labPricing.length > 0) {
        return item.labPricing;
    }
    return getDefaultLabPricing(item?.price, item?.mrp, item?.tatHours, item?.suggestedLab || item?.suggestedLabName);
}

/**
 * Gets the starting (minimum) price and MRP across all lab options for an item
 */
export function getStartingPrice(item) {
    const list = getItemLabPricing(item);
    const minPrice = Math.min(...list.map(l => Number(l.price) || 299));
    const maxMrp = Math.max(...list.map(l => Number(l.mrp) || Math.round(minPrice * 1.6)));
    const discountPercent = maxMrp > minPrice ? Math.round(((maxMrp - minPrice) / maxMrp) * 100) : 40;
    
    return {
        price: minPrice,
        mrp: maxMrp,
        discountPercent: Math.max(10, discountPercent),
        labCount: list.length,
        defaultLab: list.find(l => l.isRecommended) || list[0]
    };
}

/**
 * Gets price for a specific lab ID on a given item
 */
/**
 * Tiered Volume Pricing for Multiple People (1, 2, 5, 10+ people)
 * Allows different rates if test is taken by family members or staff.
 */
export function getDefaultTierPricing(basePrice = 299, baseMrp = null) {
    const p = Math.max(50, Number(basePrice) || 299);
    const m = Number(baseMrp) || Math.round(p * 1.6);

    return {
        '1': {
            persons: 1,
            label: 'Individual (1 Person)',
            tag: 'Standard Single',
            pricePerPerson: p,
            offerPrice: p,
            mrpPerPerson: m,
            discountPercent: Math.max(10, Math.round(((m - p) / m) * 100))
        },
        '2': {
            persons: 2,
            label: 'Couple / Pair (2 People)',
            tag: 'Family / Duo ~15% Off',
            pricePerPerson: Math.round((p * 0.85) / 10) * 10 - 1,
            offerPrice: Math.round((p * 0.85) / 10) * 10 - 1,
            mrpPerPerson: m,
            discountPercent: Math.max(15, Math.round(((m - (p * 0.85)) / m) * 100))
        },
        '5': {
            persons: 5,
            label: 'Family Pack (5 People)',
            tag: 'Family Pack ~30% Off',
            pricePerPerson: Math.round((p * 0.70) / 10) * 10 - 1,
            offerPrice: Math.round((p * 0.70) / 10) * 10 - 1,
            mrpPerPerson: m,
            discountPercent: Math.max(30, Math.round(((m - (p * 0.70)) / m) * 100))
        },
        '10': {
            persons: 10,
            label: 'Corporate Staff / Camp (10+ People)',
            tag: 'Corporate Bulk ~45% Off',
            pricePerPerson: Math.round((p * 0.55) / 10) * 10 - 1,
            offerPrice: Math.round((p * 0.55) / 10) * 10 - 1,
            mrpPerPerson: m,
            discountPercent: Math.max(45, Math.round(((m - (p * 0.55)) / m) * 100))
        }
    };
}

export function getItemTierPricing(item) {
    if (item && item.tierPricing && typeof item.tierPricing === 'object' && item.tierPricing['1']) {
        return item.tierPricing;
    }
    const baseP = item?.price || (item?.labPricing?.[0]?.price) || 299;
    const baseM = item?.mrp || (item?.labPricing?.[0]?.mrp) || Math.round(baseP * 1.6);
    return getDefaultTierPricing(baseP, baseM);
}

export function getItemPriceForPeople(item, count = 1) {
    const tiers = getItemTierPricing(item);
    let tierKey = '1';
    if (count >= 10) tierKey = '10';
    else if (count >= 5) tierKey = '5';
    else if (count >= 2) tierKey = '2';

    const tier = tiers[tierKey] || tiers['1'];
    const p = tier.pricePerPerson || tier.offerPrice || item.price || 299;
    return {
        tierKey,
        persons: count,
        pricePerPerson: p,
        totalPrice: p * count,
        mrpPerPerson: tier.mrpPerPerson || item.mrp || 499,
        discountPercent: tier.discountPercent || 20,
        label: tier.label || `${count} People`
    };
}

export function getItemPriceForLab(item, labId = 'medmarg_suggested') {
    const list = getItemLabPricing(item);
    const opt = list.find(l => l.labId === labId) || list.find(l => l.isRecommended) || list[0];
    return {
        price: opt.price || 499,
        mrp: opt.mrp || Math.round((opt.price || 499) * 1.6),
        discountPercent: opt.discountPercent || 40,
        tatHours: opt.tatHours || 24,
        labName: opt.labName || 'MedMarg',
        suggestedLabName: opt.suggestedLabName,
        isMedmargSuggested: !!opt.isMedmargSuggested,
        tag: opt.tag || ''
    };
}

/**
 * Computes comparative totals for all items in the cart across each of the 3 lab providers
 */
export function getCartTotalsByLab(cartItems = []) {
    const labs = [
        {
            id: 'medmarg_suggested',
            name: 'MedMarg',
            subtitle: 'via Central Processing Partner Hub',
            isMedmargSuggested: true,
            badge: '⭐ Recommended & Best Value',
            accentColor: '#006B70',
            bgLight: '#E0F2F1',
            tatText: '24 Hours TAT',
            perks: ['Free Home Phlebotomy', '100% NABL Quality Assurance', 'Best Price Guarantee']
        },
        {
            id: 'thyrocare',
            name: 'Thyrocare',
            subtitle: 'Direct Automated Laboratory',
            isMedmargSuggested: false,
            badge: '⚡ Direct Automated Lab',
            accentColor: '#B91C1C',
            bgLight: '#FEE2E2',
            tatText: '24-36 Hours TAT',
            perks: ['Automated Track Processing', 'NABL Accredited', 'Direct Lab Dispatch']
        },
        {
            id: 'lalpath',
            name: 'Dr. Lal PathLabs',
            subtitle: 'National Reference Laboratory',
            isMedmargSuggested: false,
            badge: '🏆 Gold Standard Reference',
            accentColor: '#D97706',
            bgLight: '#FEF3C7',
            tatText: '24-48 Hours TAT',
            perks: ['NABL & CAP Certified', 'National Reference Standard', 'Senior Pathologist Review']
        }
    ];

    return labs.map(lab => {
        let totalPrice = 0;
        let totalMrp = 0;
        const itemBreakdown = [];

        cartItems.forEach(item => {
            const pricing = getItemPriceForLab(item, lab.id);
            totalPrice += pricing.price;
            totalMrp += pricing.mrp;
            itemBreakdown.push({
                id: item.id || item.code || item.name,
                name: item.name || item.title,
                price: pricing.price,
                mrp: pricing.mrp,
                tatHours: pricing.tatHours
            });
        });

        const totalSavings = Math.max(0, totalMrp - totalPrice);
        const discountPercent = totalMrp > 0 ? Math.round((totalSavings / totalMrp) * 100) : 0;

        return {
            ...lab,
            totalPrice,
            totalMrp,
            totalSavings,
            discountPercent,
            itemBreakdown
        };
    });
}

/**
 * Gets the primary / recommended lab option (default MedMarg Suggested)
 */
export function getRecommendedLabOption(item) {
    const list = getItemLabPricing(item);
    return list.find(l => l.isRecommended || l.isMedmargSuggested) || list[0];
}

/**
 * Decomposes standard clinical profiles into individual biomarker tests
 */
export function getDecomposedBiomarkersForProfile(profileName = '', sampleType = 'SERUM', fasting = 'NO') {
    const nameLower = (profileName || '').toLowerCase();
    
    if (nameLower.includes('lipid')) {
        return [
            { code: 'CHOL_T', name: 'Total Cholesterol', sampleType: 'SERUM', fasting: 'YES', tatHours: 24, description: 'Measures total circulating cholesterol in bloodstream.' },
            { code: 'HDL_C', name: 'HDL Cholesterol (Good Cholesterol)', sampleType: 'SERUM', fasting: 'YES', tatHours: 24, description: 'High-density lipoprotein protects against cardiovascular disease.' },
            { code: 'LDL_C', name: 'LDL Cholesterol (Bad Cholesterol - Direct)', sampleType: 'SERUM', fasting: 'YES', tatHours: 24, description: 'Low-density lipoprotein causes arterial plaque buildup.' },
            { code: 'TRIGL', name: 'Triglycerides', sampleType: 'SERUM', fasting: 'YES', tatHours: 24, description: 'Primary circulating fat; risk indicator for coronary artery disease.' },
            { code: 'VLDL_C', name: 'VLDL Cholesterol', sampleType: 'SERUM', fasting: 'YES', tatHours: 24, description: 'Very low-density lipoprotein carrying triglycerides.' },
            { code: 'NON_HDL', name: 'Non-HDL Cholesterol', sampleType: 'SERUM', fasting: 'YES', tatHours: 24, description: 'Total atherogenic particle concentration.' },
            { code: 'CHOL_RAT', name: 'Total / HDL Cholesterol Ratio', sampleType: 'SERUM', fasting: 'YES', tatHours: 24, description: 'Coronary artery disease risk ratio.' },
            { code: 'LDL_HDL', name: 'LDL / HDL Ratio', sampleType: 'SERUM', fasting: 'YES', tatHours: 24, description: 'Atherogenic index of vascular health.' }
        ];
    }

    if (nameLower.includes('liver') || nameLower.includes('lft') || nameLower.includes('hepatic')) {
        return [
            { code: 'BILI_T', name: 'Bilirubin Total', sampleType: 'SERUM', fasting: 'NO', tatHours: 24, description: 'Detects jaundice and evaluates liver clearance.' },
            { code: 'BILI_D', name: 'Bilirubin Direct (Conjugated)', sampleType: 'SERUM', fasting: 'NO', tatHours: 24, description: 'Identifies biliary obstruction or intrahepatic cholestasis.' },
            { code: 'BILI_I', name: 'Bilirubin Indirect (Unconjugated)', sampleType: 'SERUM', fasting: 'NO', tatHours: 24, description: 'Hemolytic indicator.' },
            { code: 'SGOT_AST', name: 'SGOT / AST (Aspartate Aminotransferase)', sampleType: 'SERUM', fasting: 'NO', tatHours: 24, description: 'Enzyme indicative of hepatocellular necrosis or cardiac injury.' },
            { code: 'SGPT_ALT', name: 'SGPT / ALT (Alanine Aminotransferase)', sampleType: 'SERUM', fasting: 'NO', tatHours: 24, description: 'Key enzyme specific to liver cell inflammation.' },
            { code: 'ALP', name: 'Alkaline Phosphatase (ALP)', sampleType: 'SERUM', fasting: 'NO', tatHours: 24, description: 'Marker of biliary tract and bone metabolism.' },
            { code: 'PROT_T', name: 'Total Protein', sampleType: 'SERUM', fasting: 'NO', tatHours: 24, description: 'Measures albumin and globulin in blood.' },
            { code: 'ALB', name: 'Serum Albumin', sampleType: 'SERUM', fasting: 'NO', tatHours: 24, description: 'Major circulating protein manufactured by liver.' },
            { code: 'GLOB', name: 'Serum Globulin', sampleType: 'SERUM', fasting: 'NO', tatHours: 24, description: 'Immunoglobulins and transport proteins.' },
            { code: 'AG_RAT', name: 'Albumin / Globulin (A/G) Ratio', sampleType: 'SERUM', fasting: 'NO', tatHours: 24, description: 'Calculated nutritional and synthetic liver marker.' },
            { code: 'GGTP', name: 'Gamma Glutamyl Transferase (GGT)', sampleType: 'SERUM', fasting: 'NO', tatHours: 24, description: 'Sensitive indicator of alcohol exposure and cholestasis.' }
        ];
    }

    if (nameLower.includes('renal') || nameLower.includes('kidney') || nameLower.includes('kft') || nameLower.includes('rft')) {
        return [
            { code: 'CREAT', name: 'Serum Creatinine', sampleType: 'SERUM', fasting: 'NO', tatHours: 24, description: 'Critical biomarker for glomerular filtration and renal function.' },
            { code: 'BUN', name: 'Blood Urea Nitrogen (BUN)', sampleType: 'SERUM', fasting: 'NO', tatHours: 24, description: 'Metabolic waste product filtered by functional kidneys.' },
            { code: 'UREA', name: 'Serum Urea', sampleType: 'SERUM', fasting: 'NO', tatHours: 24, description: 'Evaluates hydration and renal excretion capacity.' },
            { code: 'URIC', name: 'Uric Acid', sampleType: 'SERUM', fasting: 'NO', tatHours: 24, description: 'Screens for hyperuricemia, gout, and renal calculi.' },
            { code: 'CALC', name: 'Serum Calcium Total', sampleType: 'SERUM', fasting: 'NO', tatHours: 24, description: 'Essential mineral regulated by kidneys and parathyroid.' },
            { code: 'PHOS', name: 'Inorganic Phosphorus', sampleType: 'SERUM', fasting: 'NO', tatHours: 24, description: 'Mineral balance indicator in renal disease.' },
            { code: 'SOD', name: 'Serum Sodium (Na+)', sampleType: 'SERUM', fasting: 'NO', tatHours: 24, description: 'Electrolyte regulating fluid balance and blood pressure.' },
            { code: 'POT', name: 'Serum Potassium (K+)', sampleType: 'SERUM', fasting: 'NO', tatHours: 24, description: 'Crucial cardiac and renal intracellular electrolyte.' },
            { code: 'CHL', name: 'Serum Chloride (Cl-)', sampleType: 'SERUM', fasting: 'NO', tatHours: 24, description: 'Acid-base and neuromuscular homeostasis marker.' },
            { code: 'EGFR', name: 'Estimated Glomerular Filtration Rate (eGFR)', sampleType: 'SERUM', fasting: 'NO', tatHours: 24, description: 'Calculated staging of chronic kidney function.' }
        ];
    }

    if (nameLower.includes('thyroid')) {
        return [
            { code: 'T3_TOT', name: 'Total Triiodothyronine (T3)', sampleType: 'SERUM', fasting: 'NO', tatHours: 24, description: 'Active metabolic thyroid hormone.' },
            { code: 'T4_TOT', name: 'Total Thyroxine (T4)', sampleType: 'SERUM', fasting: 'NO', tatHours: 24, description: 'Primary prohormone released by thyroid gland.' },
            { code: 'TSH_ULT', name: 'Thyroid Stimulating Hormone (TSH Ultra-sensitive)', sampleType: 'SERUM', fasting: 'NO', tatHours: 24, description: 'Pituitary gland regulator for hyperthyroidism and hypothyroidism.' }
        ];
    }

    if (nameLower.includes('cbc') || nameLower.includes('hemogram') || nameLower.includes('blood count')) {
        return [
            { code: 'HB', name: 'Hemoglobin (Hb)', sampleType: 'EDTA', fasting: 'NO', tatHours: 12, description: 'Oxygen carrying protein in red blood cells.' },
            { code: 'RBC', name: 'Total RBC Count', sampleType: 'EDTA', fasting: 'NO', tatHours: 12, description: 'Red blood cell count per microliter.' },
            { code: 'PCV', name: 'Packed Cell Volume / Hematocrit (PCV)', sampleType: 'EDTA', fasting: 'NO', tatHours: 12, description: 'Percentage of blood volume composed of erythrocytes.' },
            { code: 'MCV', name: 'Mean Corpuscular Volume (MCV)', sampleType: 'EDTA', fasting: 'NO', tatHours: 12, description: 'Average volume of single erythrocyte (Anemia classification).' },
            { code: 'MCH', name: 'Mean Corpuscular Hemoglobin (MCH)', sampleType: 'EDTA', fasting: 'NO', tatHours: 12, description: 'Average hemoglobin weight per red cell.' },
            { code: 'MCHC', name: 'Mean Corpuscular Hemoglobin Concentration (MCHC)', sampleType: 'EDTA', fasting: 'NO', tatHours: 12, description: 'Hemoglobin concentration per packed unit.' },
            { code: 'RDW', name: 'Red Cell Distribution Width (RDW)', sampleType: 'EDTA', fasting: 'NO', tatHours: 12, description: 'Variation in red blood cell sizing (Anisocytosis).' },
            { code: 'TLC_WBC', name: 'Total Leukocyte Count (WBC)', sampleType: 'EDTA', fasting: 'NO', tatHours: 12, description: 'Immune defense cells fighting infection and inflammation.' },
            { code: 'NEUT', name: 'Neutrophils %', sampleType: 'EDTA', fasting: 'NO', tatHours: 12, description: 'First responders in bacterial infection defense.' },
            { code: 'LYMPH', name: 'Lymphocytes %', sampleType: 'EDTA', fasting: 'NO', tatHours: 12, description: 'Adaptive immune cells (T-cells, B-cells).' },
            { code: 'MONO', name: 'Monocytes %', sampleType: 'EDTA', fasting: 'NO', tatHours: 12, description: 'Phagocytic cells clearing tissue cellular debris.' },
            { code: 'EOS', name: 'Eosinophils %', sampleType: 'EDTA', fasting: 'NO', tatHours: 12, description: 'Allergic reactions and parasite defense indicator.' },
            { code: 'BASO', name: 'Basophils %', sampleType: 'EDTA', fasting: 'NO', tatHours: 12, description: 'Histamine producing immune granulocytes.' },
            { code: 'PLT', name: 'Platelet Count (Thrombocytes)', sampleType: 'EDTA', fasting: 'NO', tatHours: 12, description: 'Coagulation cells preventing blood loss and hemorrhage.' },
            { code: 'MPV', name: 'Mean Platelet Volume (MPV)', sampleType: 'EDTA', fasting: 'NO', tatHours: 12, description: 'Average size of platelets in circulation.' }
        ];
    }

    if (nameLower.includes('diabet') || nameLower.includes('glycem') || nameLower.includes('sugar')) {
        return [
            { code: 'GLUC_F', name: 'Fasting Blood Sugar (FBS)', sampleType: 'FLUORIDE', fasting: 'YES', tatHours: 12, description: 'Baseline glucose concentration following 8-10 hour fast.' },
            { code: 'HBA1C', name: 'HbA1c Glycated Hemoglobin', sampleType: 'EDTA', fasting: 'NO', tatHours: 12, description: 'Gold standard 90-day average blood sugar control marker.' },
            { code: 'EAG', name: 'Estimated Average Glucose (eAG)', sampleType: 'EDTA', fasting: 'NO', tatHours: 12, description: 'Calculated average daily blood sugar level.' }
        ];
    }

    if (nameLower.includes('iron') || nameLower.includes('anemia')) {
        return [
            { code: 'FE', name: 'Serum Iron', sampleType: 'SERUM', fasting: 'YES', tatHours: 24, description: 'Circulating iron attached to transferrin.' },
            { code: 'TIBC', name: 'Total Iron Binding Capacity (TIBC)', sampleType: 'SERUM', fasting: 'YES', tatHours: 24, description: 'Total binding sites available for iron transport.' },
            { code: 'UIBC', name: 'Unsaturated Iron Binding Capacity (UIBC)', sampleType: 'SERUM', fasting: 'YES', tatHours: 24, description: 'Reserve iron binding capability.' },
            { code: 'TRANS_SAT', name: 'Transferrin Saturation %', sampleType: 'SERUM', fasting: 'YES', tatHours: 24, description: 'Percentage of iron transport proteins saturated.' },
            { code: 'FERRITIN', name: 'Serum Ferritin', sampleType: 'SERUM', fasting: 'NO', tatHours: 24, description: 'Intracellular iron storage reserve.' }
        ];
    }

    if (nameLower.includes('allergy') || nameLower.includes('rhinitis') || nameLower.includes('phadia')) {
        return [
            { code: 'IGE_TOT', name: 'Total IgE Antibodies', sampleType: 'SERUM', fasting: 'NO', tatHours: 24, description: 'Immunoglobulin E level associated with allergic hypersensitivity.' },
            { code: 'ALLERG_P1', name: 'Inhalant Allergen Specific Panel (Phadia)', sampleType: 'SERUM', fasting: 'NO', tatHours: 48, description: 'Detects specific IgE antibodies against airborne pollen and dust mites.' },
            { code: 'ALLERG_P2', name: 'Food Allergen Specific Panel (Phadia)', sampleType: 'SERUM', fasting: 'NO', tatHours: 48, description: 'Detects antibodies against dietary and environmental allergens.' },
            { code: 'ABS_EOS', name: 'Absolute Eosinophil Count (AEC)', sampleType: 'EDTA', fasting: 'NO', tatHours: 12, description: 'Quantifies circulating eosinophils during active allergic reactions.' }
        ];
    }

    if (nameLower.includes('aldosterone') || nameLower.includes('renin')) {
        return [
            { code: 'ALDO', name: 'Plasma Aldosterone', sampleType: 'EDTA', fasting: 'YES', tatHours: 48, description: 'Adrenal cortex steroid hormone regulating sodium retention.' },
            { code: 'RENIN_DIR', name: 'Direct Renin Concentration', sampleType: 'EDTA', fasting: 'YES', tatHours: 48, description: 'Kidney enzyme regulating blood pressure and vascular volume.' },
            { code: 'ARR_RAT', name: 'Aldosterone / Renin Ratio (ARR)', sampleType: 'EDTA', fasting: 'YES', tatHours: 48, description: 'Diagnostic index for primary aldosteronism (Conn syndrome).' }
        ];
    }

    // Generic fallback decomposition: split by slash, commas, or parentheses
    const parts = profileName
        .replace(/panel|profile|screening|by phadia/gi, '')
        .split(/[/,()&+-]/)
        .map(s => s.trim())
        .filter(s => s.length > 2);

    if (parts.length > 1) {
        return parts.map((part, pIdx) => ({
            code: `PARAM_${pIdx + 1}`,
            name: part.charAt(0).toUpperCase() + part.slice(1),
            sampleType: sampleType || 'SERUM',
            fasting: fasting || 'NO',
            tatHours: 24,
            description: `Biomarker parameter tested as part of ${profileName}.`
        }));
    }

    return [
        {
            code: 'PARAM_1',
            name: `${profileName} - Quantitative Biomarker Assay`,
            sampleType: sampleType || 'SERUM',
            fasting: fasting || 'NO',
            tatHours: 24,
            description: `Core clinical laboratory biomarker assay.`
        }
    ];
}

/**
 * Resolves all single tests covered under a profile
 */
export function resolveProfileTests(profile, allTests = []) {
    if (!profile) return [];
    
    // 1. If profile has explicit tests array of codes or objects
    if (profile.tests && Array.isArray(profile.tests) && profile.tests.length > 0) {
        return profile.tests.map(tCodeOrObj => {
            const tCode = typeof tCodeOrObj === 'string' ? tCodeOrObj : (tCodeOrObj.code || tCodeOrObj.id);
            const found = allTests.find(t => t.code === tCode || t.id === tCode);
            return found || (typeof tCodeOrObj === 'object' ? tCodeOrObj : {
                name: tCode,
                code: tCode,
                sampleType: profile.sampleType || 'SERUM',
                fasting: profile.fasting || 'NO',
                description: `Quantitative biomarker in ${profile.name}`
            });
        });
    }

    // 2. If profile has includes array
    if (profile.includes && Array.isArray(profile.includes) && profile.includes.length > 0) {
        return profile.includes.map((incName, idx) => {
            const found = allTests.find(t => t.name.toLowerCase() === incName.toLowerCase());
            return found || {
                code: `PARAM_${idx + 1}`,
                name: incName,
                sampleType: profile.sampleType || 'SERUM',
                fasting: profile.fasting || 'NO',
                description: `Biomarker component analyzed under ${profile.name}`
            };
        });
    }

    // 3. Fallback: Decompose based on medical profile name
    return getDecomposedBiomarkersForProfile(profile.name, profile.sampleType, profile.fasting);
}

/**
 * Resolves full hierarchical composition of a package (both profiles and standalone tests)
 */
export function resolvePackageContents(pkg, catalog = {}) {
    if (!pkg) return { profiles: [], standaloneTests: [], totalBiomarkersCount: 0 };
    const allProfiles = catalog.profiles || [];
    const allTests = catalog.tests || [];

    // Resolve profiles
    const profiles = (pkg.profiles || []).map(pCodeOrObj => {
        const pCode = typeof pCodeOrObj === 'string' ? pCodeOrObj : (pCodeOrObj.code || pCodeOrObj.id);
        const pObj = allProfiles.find(p => p.code === pCode || p.id === pCode) || (typeof pCodeOrObj === 'object' ? pCodeOrObj : null);
        const baseProfile = pObj || {
            code: pCode,
            name: pCode,
            sampleType: 'SERUM',
            fasting: 'NO',
            description: `Diagnostic profile within ${pkg.name}`
        };
        const testsInside = resolveProfileTests(baseProfile, allTests);
        return {
            ...baseProfile,
            testsInside
        };
    });

    // Resolve standalone tests
    const standaloneTests = (pkg.tests || []).map(tCodeOrObj => {
        const tCode = typeof tCodeOrObj === 'string' ? tCodeOrObj : (tCodeOrObj.code || tCodeOrObj.id);
        const found = allTests.find(t => t.code === tCode || t.id === tCode);
        return found || (typeof tCodeOrObj === 'object' ? tCodeOrObj : {
            code: tCode,
            name: tCode,
            sampleType: 'SERUM',
            fasting: 'NO',
            description: `Biomarker test included in ${pkg.name}`
        });
    });

    const totalBiomarkersCount = profiles.reduce((sum, p) => sum + (p.testsInside?.length || 1), 0) + standaloneTests.length;

    return {
        profiles,
        standaloneTests,
        totalBiomarkersCount: Math.max(totalBiomarkersCount, pkg.testCount || 0)
    };
}


