/**
 * MedMarg Google Sheets Two-Way Synchronization Script
 * 
 * STEP-BY-STEP SETUP (Takes 30 seconds):
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1W37T0qzCZDYoBYPIG5MsWZeBZrict_BfDUx9itGSZp0/edit
 * 2. In Google Sheets menu, click: "Extensions" > "Apps Script".
 * 3. Delete everything in the code editor, paste ALL of this code, and click the Save disk icon.
 * 4. Click the blue "Deploy" button (top right) > "New deployment".
 * 5. Click the gear icon (Select type) > Choose "Web app".
 *    - Description: MedMarg Sync Webhook
 *    - Execute as: "Me" (your Google account)
 *    - Who has access: "Anyone" (IMPORTANT!)
 * 6. Click "Deploy", click "Authorize access", and copy the Web App URL (starts with https://script.google.com/macros/s/...).
 * 7. Paste that URL into MedMarg Admin Panel > Google Sheets Two-Way Sync > Webhook URL field!
 */

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var contents = JSON.parse(rawData);
    var action = contents.action;
    var data = contents.data;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'APPEND_TEST' || action === 'UPDATE_TEST') {
      var sheet = ss.getSheetByName('TESTS');
      if (!sheet) sheet = ss.insertSheet('TESTS');
      
      var targetCode = (data.code || '').trim().toUpperCase();
      var values = sheet.getDataRange().getValues();
      var foundRow = -1;

      // Search if test code already exists to update it
      for (var i = 1; i < values.length; i++) {
        if (values[i][1] && values[i][1].toString().trim().toUpperCase() === targetCode) {
          foundRow = i + 1;
          break;
        }
      }

      if (foundRow > 0) {
        // Update existing row
        sheet.getRange(foundRow, 3).setValue(data.name || values[foundRow-1][2]);
        sheet.getRange(foundRow, 4).setValue((data.sampleType || 'SERUM').toUpperCase());
        sheet.getRange(foundRow, 5).setValue((data.fasting || 'NO').toUpperCase());
        return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Test updated in Google Sheet at row ' + foundRow })).setMimeType(ContentService.MimeType.JSON);
      } else {
        // Append new row
        var lastRow = sheet.getLastRow();
        var serialNo = data.serialNo || lastRow;
        sheet.appendRow([
          serialNo,
          data.code || '',
          data.name || '',
          (data.sampleType || 'SERUM').toUpperCase(),
          (data.fasting || 'NO').toUpperCase()
        ]);
        return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'New test appended to Google Sheet' })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    if (action === 'APPEND_PROFILE' || action === 'UPDATE_PROFILE') {
      var sheet = ss.getSheetByName('PROFILE');
      if (!sheet) sheet = ss.insertSheet('PROFILE');
      
      var targetCode = (data.code || '').trim().toUpperCase();
      var values = sheet.getDataRange().getValues();
      var foundRow = -1;

      for (var i = 1; i < values.length; i++) {
        if (values[i][1] && values[i][1].toString().trim().toUpperCase() === targetCode) {
          foundRow = i + 1;
          break;
        }
      }

      if (foundRow > 0) {
        // Update existing row
        sheet.getRange(foundRow, 3).setValue(data.name || values[foundRow-1][2]);
        sheet.getRange(foundRow, 4).setValue((data.sampleType || 'SERUM').toUpperCase());
        sheet.getRange(foundRow, 5).setValue((data.fasting || 'NO').toUpperCase());
        return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Profile updated in Google Sheet at row ' + foundRow })).setMimeType(ContentService.MimeType.JSON);
      } else {
        // Append new row
        var lastRow = sheet.getLastRow();
        var serialNo = data.serialNo || lastRow;
        sheet.appendRow([
          serialNo,
          data.code || '',
          data.name || '',
          (data.sampleType || 'SERUM').toUpperCase(),
          (data.fasting || 'NO').toUpperCase()
        ]);
        return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'New profile appended to Google Sheet' })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Unknown action' })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("MedMarg Google Sheets Two-Way Webhook is Active!");
}
