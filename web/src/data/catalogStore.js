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
 * Gets the primary / recommended lab option (default MedMarg Suggested)
 */
export function getRecommendedLabOption(item) {
    const list = getItemLabPricing(item);
    return list.find(l => l.isRecommended || l.isMedmargSuggested) || list[0];
}

