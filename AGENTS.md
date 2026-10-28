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

## CODEBASE MEMORY — REQUIRED CODE DISCOVERY WORKFLOW

Before investigating or implementing a feature, bug fix, or refactor:

1. Use the `codebase-memory` MCP tools FIRST. Start with `search_graph` or `search_code` to find relevant symbols and files.
2. Use `trace_path` to follow only the necessary callers, dependencies, routes, and navigation paths.
3. Use `get_code_snippet` or `get_file_outline` to inspect relevant source and immediate dependencies.
4. Do not begin with broad filesystem searches, repeatedly read unrelated files, or scan the whole repository when indexed results are sufficient.
5. Do not re-index the whole repository for every task. Use `index_status` and `detect_changes` when appropriate.
6. If Codebase Memory tools are unavailable, return errors, or lack necessary information, state that explicitly and fall back to targeted source inspection.
7. Before editing, briefly identify the files to change and the reason each is needed.
8. Verify critical behavior against actual source code. The graph is a discovery aid, not proof of correctness.
9. Run focused tests or builds relevant to the change and report the results.
10. All existing data-preservation directives above remain mandatory and take priority. Never overwrite live catalog or inventory data.

At the start of each new coding task, explicitly confirm whether Codebase Memory tools are available. Use them for discovery rather than merely claiming to use them.
