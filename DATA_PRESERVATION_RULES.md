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
