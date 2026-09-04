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
