/**
 * MedMarg Two-Way Sync Google Apps Script
 * 
 * INSTRUCTIONS:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1W37T0qzCZDYoBYPIG5MsWZeBZrict_BfDUx9itGSZp0/edit
 * 2. Click on "Extensions" > "Apps Script" in the top menu.
 * 3. Delete any code in the editor and PASTE this entire script.
 * 4. Click the blue "Deploy" button at top right > "New deployment".
 * 5. Select type "Web app":
 *    - Description: MedMarg Sync
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Click "Deploy", authorize access, and copy the Web App URL.
 * 7. Paste that Web App URL in your MedMarg Admin Panel under Google Sheets Sync Hub!
 */

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var action = contents.action;
    var data = contents.data;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'APPEND_TEST') {
      var sheet = ss.getSheetByName('TESTS');
      if (!sheet) sheet = ss.insertSheet('TESTS');
      
      var lastRow = sheet.getLastRow();
      var serialNo = data.serialNo || (lastRow);
      
      sheet.appendRow([
        serialNo,
        data.code || '',
        data.name || '',
        data.sampleType || 'SERUM',
        data.fasting || 'NO'
      ]);

      return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Test appended to Google Sheet' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'APPEND_PROFILE') {
      var sheet = ss.getSheetByName('PROFILE');
      if (!sheet) sheet = ss.insertSheet('PROFILE');
      
      var lastRow = sheet.getLastRow();
      var serialNo = data.serialNo || (lastRow);
      
      sheet.appendRow([
        serialNo,
        data.code || '',
        data.name || '',
        data.sampleType || 'SERUM',
        data.fasting || 'NO'
      ]);

      return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Profile appended to Google Sheet' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("MedMarg Google Sheets Two-Way Sync Webhook is Active!");
}
