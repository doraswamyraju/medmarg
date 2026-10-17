# MedMarg Repository - Coding Agent Guidelines & Strict Data Preservation

## CRITICAL DIRECTIVE: NEVER OVERWRITE LIVE CATALOG OR INVENTORY DATABASE

The files:
1. `backend/data/catalogData.json` (Tests, Diagnostic Profiles, Health Packages, Multi-Lab Rates, Volume Slabs, Alias Names)
2. `backend/data/dbStore.json` (Live Inventory, Combo Kits, Purchases GRN, Indents, Vendors, Staff Users, Orders, Customers)

are **LIVE PRODUCTION DATA STORES** actively edited and managed by MedMarg administrators (`admin@medmarg.com`), Receptionists, and Home Collection In-Charges.

### Absolute Rules for AI Coding Agents:
1. **NEVER** replace, truncate, or overwrite `catalogData.json` or `dbStore.json` with mock, dummy, or sample test data.
2. **NEVER** reset tests, packages, profiles, or inventory tables.
3. **NEVER** write commands that delete `backend/data/*.json` on local or production VPS.
4. **ALWAYS** use non-destructive, safe merge logic when updating data models or importing Excel/CSV data. Match by `code` or `id`, update properties, and keep all existing data intact.
5. **AUTOMATIC AUDIT & BACKUP**: Every write or update to the catalog or inventory must be logged in `backend/data/auditLogs.json` and a rolling backup preserved in `backend/data/backups/`.
6. **PRESERVE ON VPS**: Live data on the production VPS (`147.93.107.21`) must be retained across all git pulls and deployments.
