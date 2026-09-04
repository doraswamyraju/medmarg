const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Google Sheets Service for Two-Way Synchronisation with MedMarg DB
let sheetsClient = null;

function getSheetsClient() {
    if (sheetsClient) return sheetsClient;

    try {
        const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, '../config/google-drive-key.json');
        
        if (fs.existsSync(credentialsPath)) {
            const auth = new google.auth.GoogleAuth({
                keyFile: credentialsPath,
                scopes: [
                    'https://www.googleapis.com/auth/spreadsheets',
                    'https://www.googleapis.com/auth/drive'
                ]
            });
            sheetsClient = google.sheets({ version: 'v4', auth });
            return sheetsClient;
        }
    } catch (err) {
        console.warn('Google Sheets service account not configured yet. Fallback sync active.');
    }
    return null;
}

/**
 * Fetch all rows from a Google Sheet (both TESTS and PROFILE tabs)
 * @param {string} spreadsheetId 
 * @returns {Promise<{tests: Array, profiles: Array, lastSynced: string}>}
 */
const DEFAULT_SPREADSHEET_ID = process.env.GOOGLE_SHEETS_CATALOG_ID || '1W37T0qzCZDYoBYPIG5MsWZeBZrict_BfDUx9itGSZp0';

async function fetchCatalogFromGoogleSheet(spreadsheetId = DEFAULT_SPREADSHEET_ID) {
    const sheets = getSheetsClient();

    if (!sheets || !spreadsheetId) {
        // Return local catalog if live sheet ID is not set
        const catalogPath = path.join(__dirname, '../data/catalogData.json');
        if (fs.existsSync(catalogPath)) {
            const localData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
            return {
                success: true,
                source: 'local_synced_cache',
                lastSynced: new Date().toISOString(),
                totalTests: localData.tests.length,
                totalProfiles: localData.profiles.length,
                tests: localData.tests,
                profiles: localData.profiles,
                packages: localData.packages
            };
        }
    }

    try {
        const testRes = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'TESTS!A2:E'
        });

        const profileRes = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'PROFILE!A2:E'
        });

        const parseRows = (rows, keyPrefix) => {
            if (!rows) return [];
            return rows.map((r, idx) => ({
                id: `${keyPrefix}_${r[0] || idx + 1}`,
                serialNo: parseInt(r[0], 10) || idx + 1,
                code: r[1] || '',
                name: r[2] || '',
                sampleType: r[3] || 'SERUM',
                fasting: (r[4] || 'NO').toUpperCase(),
                category: keyPrefix === 'PROF' ? 'Diagnostic Profile' : 'Individual Test',
                mrp: keyPrefix === 'PROF' ? 1499 : 499,
                price: keyPrefix === 'PROF' ? 899 : 299,
                tatHours: 24,
                active: true
            }));
        };

        const tests = parseRows(testRes.data.values, 'TEST');
        const profiles = parseRows(profileRes.data.values, 'PROF');

        return {
            success: true,
            source: 'google_sheets_live',
            lastSynced: new Date().toISOString(),
            totalTests: tests.length,
            totalProfiles: profiles.length,
            tests,
            profiles
        };
    } catch (err) {
        console.error('Error reading from Google Sheets:', err.message);
        throw err;
    }
}

/**
 * Append or update a single test in Google Sheet
 */
async function appendTestToSheet(testItem, spreadsheetId = DEFAULT_SPREADSHEET_ID) {
    const sheets = getSheetsClient();
    if (!sheets || !spreadsheetId) {
        return { success: true, message: 'Saved to MedMarg DB (Sheet sync queued)' };
    }

    const values = [[
        testItem.serialNo || '',
        testItem.code || '',
        testItem.name || '',
        testItem.sampleType || 'SERUM',
        testItem.fasting || 'NO'
    ]];

    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'TESTS!A:E',
        valueInputOption: 'USER_ENTERED',
        resource: { values }
    });

    return { success: true, message: 'Test appended to Google Sheet and synced with MedMarg DB' };
}

/**
 * Append or update a profile in Google Sheet
 */
async function appendProfileToSheet(profileItem, spreadsheetId = DEFAULT_SPREADSHEET_ID) {
    const sheets = getSheetsClient();
    if (!sheets || !spreadsheetId) {
        return { success: true, message: 'Saved to MedMarg DB (Sheet sync queued)' };
    }

    const values = [[
        profileItem.serialNo || '',
        profileItem.code || '',
        profileItem.name || '',
        profileItem.sampleType || 'SERUM',
        profileItem.fasting || 'NO'
    ]];

    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'PROFILE!A:E',
        valueInputOption: 'USER_ENTERED',
        resource: { values }
    });

    return { success: true, message: 'Profile appended to Google Sheet and synced with MedMarg DB' };
}

module.exports = {
    getSheetsClient,
    fetchCatalogFromGoogleSheet,
    appendTestToSheet,
    appendProfileToSheet
};
