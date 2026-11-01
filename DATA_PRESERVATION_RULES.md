# MedMarg Production Data Preservation & Integrity Policy

## Scope
This policy strictly governs any developer, AI coding agent, or automation script operating on this repository or server.

## Protected Data Files
- `backend/data/catalogData.json`
  - Tests (Clinical info, sample type, tube color, alias names, multi-lab pricing, volume slabs)
  - Diagnostic Profiles
  - Health Packages
  - Active Labs
- `backend/data/dbStore.json`
  - Single Items Inventory & Stock Batches
  - Combo Kits
  - Purchase Orders / GRN records
  - Indents & Dispatches
  - Vendors & Staff Users
  - Orders & Customer Records
- `backend/data/auditLogs.json` (Immutable chronological history of modifications)
- `backend/data/backups/` (Point-in-time timestamped snapshots)

## Developer & Agent Mandatory Protocol
1. **No Destructive Resets**:
   - Do NOT run scripts that replace these files with placeholder arrays.
   - Do NOT use `git checkout -- backend/data/` or `git reset` on the production server if it discards admin entries.
2. **Safe Schema Migrations**:
   - Always load the existing JSON file first.
   - Iterate and enrich objects with new default keys if schema expands.
   - Save back the enriched full array without dropping existing records.
3. **Audit Trail**:
   - Every mutation must append an entry to `auditLogs.json` with user info, action, module, and timestamp.
4. **Automated Rolling Backups**:
   - The backup engine creates timestamped copies in `backend/data/backups/`.
   - Administrators can trigger manual snapshots and 1-click restorations from the Admin Web Dashboard.

## Canonical Production VPS Deployment Command
Whenever updating the live production VPS (`147.93.107.21`), developers and agents MUST execute this exact one-liner to back up data stores before git merge, restore them immediately, and safely restart services:

```bash
cd /var/www/medmarg && mkdir -p /var/www/medmarg_data_backup && cp -r backend/data/*.json /var/www/medmarg_data_backup/ 2>/dev/null || true && git fetch origin main && git merge origin/main && cp -r /var/www/medmarg_data_backup/*.json backend/data/ 2>/dev/null || true && cd /var/www/medmarg/web && npm install --legacy-peer-deps && npm run build && cd /var/www/medmarg/backend && npm install --legacy-peer-deps && pm2 restart medmarg-api --update-env || PORT=5080 pm2 start server.js --name "medmarg-api" && pm2 restart medmarg-web 2>/dev/null || true && pm2 save
```
