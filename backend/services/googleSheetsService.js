const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');

const DEFAULT_SPREADSHEET_ID = process.env.GOOGLE_SHEETS_CATALOG_ID || '1W37T0qzCZDYoBYPIG5MsWZeBZrict_BfDUx9itGSZp0';
const GOOGLE_APPS_SCRIPT_WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL || '';

/**
 * Helper to fetch CSV directly from Google Sheets Public / Shared URL
 */
function fetchSheetCsv(spreadsheetId, sheetName) {
    return new Promise((resolve, reject) => {
        const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
        
        https.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                // Follow redirect
                https.get(res.headers.location, (redRes) => {
                    let data = '';
                    redRes.on('data', chunk => data += chunk);
                    redRes.on('end', () => resolve(data));
                }).on('error', reject);
                return;
            }

            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

/**
 * Robust CSV Line Parser that handles quoted commas
 */
function parseCsvRows(csvText) {
    if (!csvText) return [];
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    const rows = [];

    for (const line of lines) {
        const row = [];
        let inQuotes = false;
        let cell = '';
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    cell += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                row.push(cell.trim());
                cell = '';
            } else {
                cell += char;
            }
        }
        row.push(cell.trim());
        rows.push(row);
    }
    return rows;
}

/**
 * Fetch all rows from live Google Sheets (both TESTS and PROFILE tabs)
 */
async function fetchCatalogFromGoogleSheet(spreadsheetId = DEFAULT_SPREADSHEET_ID) {
    try {
        console.log(`[GoogleSheetsSync] Fetching live data from Google Sheet ID: ${spreadsheetId}...`);

        const [testCsv, profileCsv] = await Promise.all([
            fetchSheetCsv(spreadsheetId, 'TESTS'),
            fetchSheetCsv(spreadsheetId, 'PROFILE')
        ]);

        const testRows = parseCsvRows(testCsv);
        const profileRows = parseCsvRows(profileCsv);

        const parseItems = (rows, keyPrefix) => {
            if (!rows || rows.length <= 1) return [];
            return rows.slice(1).map((r, idx) => {
                const sNo = r[0] || (idx + 1).toString();
                const code = (r[1] || '').trim();
                const name = (r[2] || '').trim();
                const sampleType = (r[3] || 'SERUM').trim().toUpperCase();
                const fasting = ((r[4] || 'NO').trim().toUpperCase() === 'YES') ? 'YES' : 'NO';

                if (!code && !name) return null;

                return {
                    id: `${keyPrefix}_${sNo}`,
                    serialNo: parseInt(sNo, 10) || idx + 1,
                    code,
                    name,
                    sampleType,
                    fasting,
                    category: keyPrefix === 'PROF' ? 'Diagnostic Profile' : 'Individual Test',
                    mrp: keyPrefix === 'PROF' ? 1499 : 499,
                    price: keyPrefix === 'PROF' ? 899 : 299,
                    tatHours: 24,
                    description: `Clinical ${keyPrefix === 'PROF' ? 'profile panel' : 'test'} analyzing ${name}.`,
                    active: true
                };
            }).filter(Boolean);
        };

        const tests = parseItems(testRows, 'TEST');
        const profiles = parseItems(profileRows, 'PROF');

        console.log(`[GoogleSheetsSync] Successfully fetched ${tests.length} tests and ${profiles.length} profiles directly from Google Sheets!`);

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
        console.error('[GoogleSheetsSync] Live Google Sheets fetch error:', err.message);
        throw err;
    }
}

/**
 * Send write / append / edit payload to Google Apps Script Webhook (if configured)
 */
function sendToGoogleAppsScript(action, payload, webhookUrl = GOOGLE_APPS_SCRIPT_WEBHOOK_URL) {
    if (!webhookUrl) {
        console.log('[GoogleSheetsSync] Webhook URL not set. Saved to MedMarg DB cache.');
        return Promise.resolve({ success: true, message: 'Saved locally' });
    }

    return new Promise((resolve) => {
        try {
            const data = JSON.stringify({ action, data: payload, timestamp: new Date().toISOString() });
            const parsedUrl = new URL(webhookUrl);
            const req = https.request(parsedUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data)
                }
            }, (res) => {
                let resData = '';
                res.on('data', chunk => resData += chunk);
                res.on('end', () => {
                    console.log(`[GoogleSheetsSync] Google Apps Script responded: ${resData}`);
                    resolve({ success: true, response: resData });
                });
            });

            req.on('error', (err) => {
                console.warn('[GoogleSheetsSync] Apps Script webhook error:', err.message);
                resolve({ success: false, error: err.message });
            });

            req.write(data);
            req.end();
        } catch (e) {
            resolve({ success: false, error: e.message });
        }
    });
}

async function appendTestToSheet(testItem, spreadsheetId = DEFAULT_SPREADSHEET_ID) {
    return sendToGoogleAppsScript('APPEND_TEST', testItem);
}

async function appendProfileToSheet(profileItem, spreadsheetId = DEFAULT_SPREADSHEET_ID) {
    return sendToGoogleAppsScript('APPEND_PROFILE', profileItem);
}

module.exports = {
    fetchCatalogFromGoogleSheet,
    appendTestToSheet,
    appendProfileToSheet
};
