const fs = require('fs');
const path = require('path');

const AUDIT_FILE = path.join(__dirname, '../data/auditLogs.json');
const BACKUPS_DIR = path.join(__dirname, '../data/backups');
const CATALOG_FILE = path.join(__dirname, '../data/catalogData.json');
const DB_STORE_FILE = path.join(__dirname, '../data/dbStore.json');

// Ensure backups dir exists
if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

// Ensure audit logs file exists
if (!fs.existsSync(AUDIT_FILE)) {
    fs.writeFileSync(AUDIT_FILE, JSON.stringify([], null, 2), 'utf8');
}

let auditCache = null;

function getAuditLogs(limit = 100) {
    try {
        if (!auditCache) {
            if (fs.existsSync(AUDIT_FILE)) {
                auditCache = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf8') || '[]');
            } else {
                auditCache = [];
            }
        }
        return auditCache.slice(0, limit);
    } catch (e) {
        console.error('[AuditStore] Failed to read audit logs:', e.message);
        return [];
    }
}

function logAuditAction({ user = 'System', role = 'Admin', module = 'General', action = 'MODIFY', entityCode = '', details = '' }) {
    try {
        const logs = getAuditLogs(1000);
        const entry = {
            id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            timestamp: new Date().toISOString(),
            user,
            role,
            module,
            action,
            entityCode,
            details
        };
        logs.unshift(entry);
        if (logs.length > 500) {
            logs.length = 500; // Cap to latest 500
        }
        auditCache = logs;
        fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs, null, 2), 'utf8');
    } catch (e) {
        console.error('[AuditStore] Failed to write audit log:', e.message);
    }
}

// Rolling snapshot creation
let lastAutoBackupTime = 0;
function createSnapshot(type = 'AUTO', notes = '') {
    try {
        const now = Date.now();
        // Throttle auto backups to max once every 10 seconds to prevent thrashing
        if (type === 'AUTO' && (now - lastAutoBackupTime < 10000)) {
            return null;
        }

        const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup_${type.toLowerCase()}_${dateStr}.json`;
        const targetPath = path.join(BACKUPS_DIR, filename);

        let catalog = null;
        let dbStore = null;

        if (fs.existsSync(CATALOG_FILE)) {
            catalog = JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8'));
        }
        if (fs.existsSync(DB_STORE_FILE)) {
            dbStore = JSON.parse(fs.readFileSync(DB_STORE_FILE, 'utf8'));
        }

        const snapshotData = {
            timestamp: new Date().toISOString(),
            type,
            notes,
            stats: {
                testsCount: (catalog?.tests || []).length,
                profilesCount: (catalog?.profiles || []).length,
                packagesCount: (catalog?.packages || []).length,
                inventoryCount: (dbStore?.inventoryStock || []).length,
                ordersCount: (dbStore?.orders || []).length
            },
            catalog,
            dbStore
        };

        fs.writeFileSync(targetPath, JSON.stringify(snapshotData, null, 2), 'utf8');
        lastAutoBackupTime = now;

        // Clean up old auto snapshots keeping latest 20 auto snapshots
        pruneOldBackups();

        logAuditAction({
            user: 'System',
            module: 'Backup Engine',
            action: 'SNAPSHOT_CREATED',
            entityCode: filename,
            details: `${type} backup created. Tests: ${snapshotData.stats.testsCount}, Inventory: ${snapshotData.stats.inventoryCount}`
        });

        return { filename, stats: snapshotData.stats, timestamp: snapshotData.timestamp };
    } catch (e) {
        console.error('[AuditStore] Snapshot creation failed:', e.message);
        return null;
    }
}

function pruneOldBackups() {
    try {
        const files = fs.readdirSync(BACKUPS_DIR)
            .filter(f => f.startsWith('backup_auto_') && f.endsWith('.json'))
            .map(f => ({ name: f, time: fs.statSync(path.join(BACKUPS_DIR, f)).mtimeMs }))
            .sort((a, b) => b.time - a.time);

        if (files.length > 20) {
            for (let i = 20; i < files.length; i++) {
                try {
                    fs.unlinkSync(path.join(BACKUPS_DIR, files[i].name));
                } catch (err) {}
            }
        }
    } catch (e) {}
}

function listBackups() {
    try {
        const files = fs.readdirSync(BACKUPS_DIR).filter(f => f.endsWith('.json'));
        return files.map(file => {
            const fullPath = path.join(BACKUPS_DIR, file);
            const stat = fs.statSync(fullPath);
            let stats = null;
            let type = file.includes('manual') ? 'MANUAL' : 'AUTO';
            let notes = '';
            try {
                // Read header only (read first 500 bytes or parse basic stats)
                const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                stats = content.stats;
                type = content.type || type;
                notes = content.notes || '';
            } catch (err) {}

            return {
                filename: file,
                sizeBytes: stat.size,
                sizeFormatted: (stat.size / (1024 * 1024)).toFixed(2) + ' MB',
                createdAt: stat.mtime.toISOString(),
                type,
                notes,
                stats
            };
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (e) {
        console.error('[AuditStore] Failed to list backups:', e.message);
        return [];
    }
}

function restoreBackup(filename, user = 'admin@medmarg.com') {
    try {
        const filePath = path.join(BACKUPS_DIR, path.basename(filename));
        if (!fs.existsSync(filePath)) {
            throw new Error(`Backup file ${filename} does not exist`);
        }

        // Before restoring, take a safety backup of current state
        createSnapshot('SAFETY_PRE_RESTORE', `Pre-restore snapshot before restoring ${filename}`);

        const raw = fs.readFileSync(filePath, 'utf8');
        const backup = JSON.parse(raw);

        if (backup.catalog) {
            fs.writeFileSync(CATALOG_FILE, JSON.stringify(backup.catalog, null, 2), 'utf8');
        }
        if (backup.dbStore) {
            fs.writeFileSync(DB_STORE_FILE, JSON.stringify(backup.dbStore, null, 2), 'utf8');
        }

        // Refresh stores in memory if accessible
        try {
            const catalogStore = require('./catalogStore');
            catalogStore.loadCatalogData();
        } catch (e) {}

        try {
            const dataStore = require('./dataStore');
            dataStore.loadDbStore();
        } catch (e) {}

        logAuditAction({
            user,
            module: 'Backup Engine',
            action: 'RESTORED_BACKUP',
            entityCode: filename,
            details: `Restored state to snapshot from ${backup.timestamp || filename}`
        });

        return { success: true, message: `Successfully restored database to backup ${filename}` };
    } catch (e) {
        console.error('[AuditStore] Failed to restore backup:', e.message);
        return { success: false, error: e.message };
    }
}

module.exports = {
    getAuditLogs,
    logAuditAction,
    createSnapshot,
    listBackups,
    restoreBackup,
    BACKUPS_DIR
};
