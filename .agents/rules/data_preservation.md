# STRICT DATA PRESERVATION RULE FOR ALL CODING AGENTS

## CRITICAL DIRECTIVE: NEVER OVERWRITE LIVE CATALOG OR INVENTORY DATABASE

The database files:
1. `backend/data/catalogData.json` (Tests, Diagnostic Profiles, Health Packages, Multi-Lab Rates, Slabs, Alias Names)
2. `backend/data/dbStore.json` (Inventory Stock, Combo Kits, Purchases GRN, Indents, Vendors, Staff Users, Orders, Customers)

are **LIVE PRODUCTION DATA STORES** being actively populated and updated by the MedMarg administration team (`admin@medmarg.com`, Receptionists, and Store In-Charges).

### Absolute Prohibitions:
1. **NEVER** overwrite `catalogData.json` or `dbStore.json` with dummy, mock, test, or truncated sample data.
2. **NEVER** replace live tests, profiles, packages, or inventory items with hardcoded arrays during git pushes, builds, or feature development.
3. **NEVER** run commands or scripts that wipe server state (e.g., `rm backend/data/*.json`).
4. **ALWAYS** use safe append/merge patterns when updating database schemas:
   - When adding fields to tests or inventory items, preserve all existing objects, IDs, codes, pricing, and custom edits.
   - When importing Excel sheets or JSON updates, match by code (`code` / `id`), update matching items, and append new ones without deleting unmodified existing records.
5. **AUTOMATIC BACKUP MANDATE**:
   - Any script or endpoint modifying database records MUST log an entry in `backend/data/auditLogs.json` and generate an automated point-in-time snapshot in `backend/data/backups/`.
6. **VPS DEPLOYMENT SAFETY**:
   - Live server deployment commands must never destroy the `backend/data/` directory.

Any violation of this rule that causes loss of real catalog or inventory records is unacceptable.
