# MedMarg Healthcare Ecosystem — Project Master Overview (`overview.md`)

**Date & Status:** 4 October 2026 — Active Phase 1 Execution  
**Live Staging URL:** `https://medmarg.sriddha.com` (VPS IP: `147.93.107.21`)  
**Project Mission:** Single-provider trusted healthcare diagnostic ecosystem and phlebotomy logistics platform.  
**Supported Platforms:** Web (React / Vite), Native Android (Kotlin + Jetpack Compose), Native iOS (SwiftUI)  
**Unified Backend:** Node.js (Express) + PostgreSQL + Firebase Auth/FCM + Google Cloud Drive API

---

## 📌 Instructions for AI Assistants & Developers (Read First in New Session)

> **IMPORTANT FOR AI ASSISTANTS / DEVELOPERS:**  
> When starting a new session or window, **ALWAYS** reference this file (`overview.md`) and [`backend_structure.md`](file:///d:/MedMarg/backend_structure.md) first.
> 1. Maintain the **Single Unified Backend Gateway** strategy.
> 2. Ensure all API responses conform to the standard envelope:  
>    `{ "success": true, "code": 200, "message": "...", "data": {}, "error": null }`
> 3. Preserve the **Super Admin Omnipresent Control** architecture. Super Admin has 100% super-set capabilities connected to all 5 user roles.
> 4. Do not alter the order state machine or database schemas without updating [`backend_structure.md`](file:///d:/MedMarg/backend_structure.md).

---

## 🏗️ System Architecture & Documentation Index

The MedMarg system operates on a **Hub-and-Spoke Documentation Model**. [`backend_structure.md`](file:///d:/MedMarg/backend_structure.md) serves as the central hub for database DDL, API envelopes, and order state transitions, while dedicated files govern specific role workflows:

```
                            MedMarg Workspace
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      ▼                            ▼                            ▼
overview.md               backend_structure.md          Role Specifications
(Master Briefing)         (DB Schemas & APIs v3.0.0)    (User-Wise Blueprints)
                                                                │
     ┌───────────────────┬───────────────────┬──────────────────┼───────────────────┐
     ▼                   ▼                   ▼                  ▼                   ▼
super_admin.md    patient_customer.md  medmarg_staff.md   salaried_agent.md   freelance_agent.md &
(Master Admin)    (Customer Hub)       (Ops Staff)        (In-House Agent)    partners_pre_registration.md
```

### 📚 Documentation Index:
1. **⚙️ [`backend_structure.md`](file:///d:/MedMarg/backend_structure.md) (v3.0.0):** Central database DDL schemas (`users`, `freelancer_verifications`, `inventory_items`, `indent_requests`, `orders`), API envelope standards, state machine, and Super Admin override endpoints.
2. **👑 [`super_admin.md`](file:///d:/MedMarg/super_admin.md):** Omnipresent control panel, daily quota configuration, freelancer certificate approvals (DMLT/BSc MLT), onboarding fee conversion to inventory wallet credits, stock indent approvals, designated lab assignments, NABL report publishing, partner queue, and role impersonation mode.
3. **👤 [`patient_customer.md`](file:///d:/MedMarg/patient_customer.md):** 913+ tests & smart dynamic package upgrade recommendations, slot selection, dual payment options (Prepaid Online & Doorstep Razorpay QR), live delivery-style map tracking, 4-digit Handover OTP, NABL health locker, and doctor sharing links.
4. **💼 [`medmarg_staff.md`](file:///d:/MedMarg/medmarg_staff.md):** Assisted bookings on customer's behalf, dispatch supervision, stock indent fulfillment, raw lab result verification, and NABL PDF report uploads.
5. **🛵 [`salaried_agent.md`](file:///d:/MedMarg/salaried_agent.md):** Zone duty roster, daily quota tracking (max orders/day), stock tracking, inventory indents, turn-by-turn route navigation, doorstep dynamic Razorpay UPI QR payment generation, barcode scanning, and designated lab handover.
6. **⚡ [`freelance_agent.md`](file:///d:/MedMarg/freelance_agent.md):** Qualification document onboarding (DMLT/Vocational MLT/BSc MLT, Paramedical Certificate, Experience Letter), onboarding fee payment & wallet credit conversion, FCM broadcast job claiming ("First claim wins"), stock indents, doorstep Razorpay QR payment, and instant bank payout requests.
7. **🩺 [`partners_pre_registration.md`](file:///d:/MedMarg/partners_pre_registration.md):** Public pre-registration portal for Doctors, Partner Labs, Scan/MRI Centers, Health Coaches, and Hospitals, storing metadata in PostgreSQL and powering the automated multi-channel (SMS, Email, Push) launch notification queue when partner portals go live.

---

## 🔄 End-to-End Master Operational Workflow

```
1. ORDER CREATION
   └── Customer books directly OR MedMarg Staff/Super Admin books on customer's behalf.
   └── Selected Payment Mode: Prepaid Online OR Doorstep Razorpay QR.

2. DYNAMIC AUTO-DISPATCH & CAPACITY ENGINE
   ├── Step A: Auto-check assigned primary Salaried Agent in that zone.
   │    └── Is agent under daily order quota limit (e.g. max 15 orders/day)?
   │         ├── YES ──► Assigned to Primary Salaried Agent.
   │         └── NO ───► Check nearby secondary Salaried Agent.
   └── Step B: All salaried agents in zone full?
        └── FCM Broadcast to Freelance Agents ("First to claim gets assigned").

3. INVENTORY CHECK & INDENT SYSTEM
   └── Agent accepts order ➔ Checks stock of vacutainers (SST Gold, EDTA, Fluoride, etc.).
   └── Stock Sufficient? Proceed to pickup.
   └── Stock Low? Agent raises Indent Request ➔ Staff/Super Admin approves & dispatches stock.

4. REAL-TIME GPS TRACKING & DOORSTEP VISIT
   └── Real-time GPS map tracking active for Customer, Staff, and Super Admin.
   └── Agent arrives ➔ Verifies 4-digit Handover OTP provided by customer.
   └── Unpaid Order? Agent presents Dynamic Razorpay UPI QR code on mobile app ➔ Customer scans & pays online.
   └── Sample collected ➔ Vacutainer tube barcodes scanned & bound to order.

5. DESIGNATED LAB HANDOVER & REPORT PUBLISHING
   └── Agent delivers samples to Designated Processing Lab (assigned by Super Admin).
   └── Lab processes sample ➔ Super Admin / Staff uploads NABL certified PDF report.
   └── Report instantly published to Customer Dashboard ➔ Customer can share report with Doctor / Health Coach.
```

---

## 🎯 Phase-by-Phase Roadmap

### 🗓️ Phase 1 (Current Scope)
- [x] Create standardized master architecture & single backend specification ([`backend_structure.md`](file:///d:/MedMarg/backend_structure.md)).
- [x] Create dedicated user-wise role specification files ([`super_admin.md`](file:///d:/MedMarg/super_admin.md), [`patient_customer.md`](file:///d:/MedMarg/patient_customer.md), [`medmarg_staff.md`](file:///d:/MedMarg/medmarg_staff.md), [`salaried_agent.md`](file:///d:/MedMarg/salaried_agent.md), [`freelance_agent.md`](file:///d:/MedMarg/freelance_agent.md), [`partners_pre_registration.md`](file:///d:/MedMarg/partners_pre_registration.md)).
- [ ] Deploy 913+ Pathology & Diagnostic tests live with dynamic smart package recommendations across Web, Android, and iOS.
- [ ] Roll out live dashboards across Web, Android, and iOS for Customer, Super Admin, Staff, Salaried Agent, and Freelance Agent.
- [ ] Deploy Partner Pre-Registration portal & automated launch notification queue.

### 🗓️ Phase 2
- Automated smart geo-routing engine & IoT cold-chain telemetry hardware integration.
- Daily freelancer earnings wallet auto-settlement via RazorpayX / Cashfree.

### 🗓️ Phase 3
- Roll out dedicated Partner Portals (Doctor Panel, Diagnostic/Scan/MRI Panel, Health Coach Panel).
- Trigger multi-channel (SMS, Email, Push) launch announcements to pre-registered partners.

---

## 🛠️ Codebase Structure Guidelines

```
MedMarg/
├── overview.md                       <-- THIS FILE (Master Briefing for AI & Devs)
├── backend_structure.md              <-- Single Source of Truth for APIs & DB Schemas
├── super_admin.md                    <-- Super Admin Specification
├── patient_customer.md               <-- Patient / Customer Specification
├── medmarg_staff.md                  <-- Staff Operations Specification
├── salaried_agent.md                 <-- Salaried Agent Specification
├── freelance_agent.md                <-- Freelance Agent Specification
├── partners_pre_registration.md      <-- Partner Pre-Registration & Launch Queue
├── backend/                          <-- Node.js / Express API Backend Gateway
│   ├── server.js                     <-- Primary Entry Point
│   ├── data/                         <-- Catalog data & DB migrations
│   └── services/                     <-- Google Drive, Sheets, Firebase & SMS Services
├── app/                              <-- Native Android App (Kotlin + Jetpack Compose)
│   └── src/main/java/com/medmarg/patient/
├── ios/                              <-- Native iOS App (SwiftUI)
└── web/                              <-- Web Dashboard App (React / Vite)
```
