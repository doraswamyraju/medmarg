const { google } = require('googleapis');
const stream = require('stream');
const path = require('path');

// Google Drive Service integration
// Uses Google Drive API v3 to upload files (prescriptions, lab report PDFs, doctor images)
// and returns public/shareable webViewLink stored in the DB.

let driveClient = null;

function getDriveClient() {
    if (driveClient) return driveClient;

    try {
        const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, '../config/google-drive-key.json');
        
        const auth = new google.auth.GoogleAuth({
            keyFile: credentialsPath,
            scopes: ['https://www.googleapis.com/auth/drive.file']
        });

        driveClient = google.drive({ version: 'v3', auth });
        return driveClient;
    } catch (err) {
        console.warn('Google Drive credentials not configured yet. Fallback mode enabled.');
        return null;
    }
}

/**
 * Upload a buffer/file to Google Drive
 * @param {Buffer} fileBuffer - Buffer from multer
 * @param {string} fileName - File name
 * @param {string} mimeType - File mime type (image/jpeg, application/pdf)
 * @param {string} folderId - Target Google Drive folder ID
 * @returns {Promise<{fileId: string, webViewLink: string, webContentLink: string}>}
 */
async function uploadFileToGoogleDrive(fileBuffer, fileName, mimeType, folderId = process.env.GOOGLE_DRIVE_FOLDER_ID) {
    const drive = getDriveClient();

    if (!drive) {
        // Fallback simulation when keys are pending setup
        const fakeId = 'gdrive_' + Date.now();
        return {
            fileId: fakeId,
            webViewLink: `https://drive.google.com/file/d/${fakeId}/view?usp=sharing`,
            webContentLink: `https://drive.google.com/uc?id=${fakeId}&export=download`
        };
    }

    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);

    const fileMetadata = {
        name: `MedMarg_${Date.now()}_${fileName}`,
        parents: folderId ? [folderId] : []
    };

    const media = {
        mimeType: mimeType,
        body: bufferStream
    };

    const response = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink, webContentLink'
    });

    // Make file readable with link
    await drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
            role: 'reader',
            type: 'anyone'
        }
    });

    return {
        fileId: response.data.id,
        webViewLink: response.data.webViewLink,
        webContentLink: response.data.webContentLink
    };
}

module.exports = {
    uploadFileToGoogleDrive
};
