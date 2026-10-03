# MedMarg Healthcare Ecosystem — Super Admin Specification (`super_admin.md`)

**Role Title:** MedMarg Super Admin  
**Access Level:** Omnipresent Master Control (100% Connected Super-Set Access)  
**Supported Platforms:** Web (React / Vite), Android (Kotlin + Jetpack Compose), iOS (SwiftUI)

---

## 1. 📌 Role Overview

The **Super Admin** is the central authority of the MedMarg ecosystem. Super Admin possesses complete visibility, override control, and operational capability across every user role (Customer, Staff, Salaried Collection Agent, Freelance Collection Agent, Designated Processing Labs, Doctors, Scan/MRI Centers, and Health Coaches).

---

## 2. 🎛️ Omnipresent Connected Sub-Modules & Features

### 2.1 Customer & Booking Management
* **View As / Impersonate Patient:** Switch to any customer's account view to assist with troubleshooting or orders.
* **Book on Behalf of Patient:** Create new lab test / package bookings for any patient, select pickup slots, and apply custom discounts or waivers.
* **Order Status Overrides:** Update, cancel, reschedule, or reassign any order at any stage of execution.
* **Payment & Refund Control:** View all transaction logs (Online Prepaid & Doorstep Razorpay QR). Issue manual payment verifications or process instant refunds.

### 2.2 Staff Management & Delegation
* **Staff Role Assignments:** Assign operational permissions, territorial zones, and order queues to MedMarg Staff members.
* **Activity & Audit Logs:** Track all staff actions (order edits, report uploads, indent approvals).
* **Report Verification Approvals:** Review staff-uploaded lab reports before publishing them to the patient dashboard.

### 2.3 Salaried Collection Agent Management
* **Zone & Territory Assignment:** Map salaried agents to operational locations/cities.
* **Daily Order Quota Configurator:** Define maximum daily order capacity limits per salaried agent (e.g., max 15 orders/day).
* **Real-Time GPS Fleet Telemetry Radar:** Global map dashboard displaying real-time positions, speed, ETA, and IoT cold-chain temperature status (`2°C - 8°C`) for all active agents.
* **Manual Override Dispatch:** Force-assign any order to any salaried agent, overriding automated dispatch logic.

### 2.4 Freelance Collection Agent Management
* **Verification & Certificate Approval Desk:** Review uploaded qualification documents (**DMLT**, **Vocational MLT**, **BSc MLT**), **Paramedical Board Certificates**, and **Experience Letters** with 1-click Approve or Reject decisions.
* **Onboarding Fee & Inventory Wallet Manager:** Set the one-time registration fee (e.g., ₹2,000) and automatically convert paid registration fees into **Inventory Wallet Credits** in the freelancer's wallet upon approval.
* **FCM Broadcast Monitor:** Monitor live broadcast notifications sent to freelancers when salaried agents hit daily capacity limits. View claim timestamps ("First-come, first-served").
* **Payout & Settlement Approvals:** Review and approve wallet payout requests from freelancers to their bank accounts or UPI VPAs.

### 2.5 Master Diagnostic Catalog & Pricing
* **913+ Tests & Packages Management:** Add, edit, activate, or deactivate tests, profiles, and life-stage packages.
* **Dynamic Pricing Engine:** Set MRP, offer prices, fasting requirements, turnaround times (TAT), sample container types (Serum SST, EDTA, Fluoride), and parameter breakdowns.
* **Smart Package Recommendation Rules:** Configure dynamic containing package upgrades and savings badges.

### 2.6 Inventory & Indent Approval Center
* **Supply Catalog Control:** Manage stock items (Gold SST tubes, Purple EDTA, Grey Fluoride, Syringes, Ice gel packs, Biohazard bags, Barcode labels).
* **Indent Request Desk:** Review and approve/reject inventory replenishment requests submitted by salaried or freelance agents; trigger staff stock dispatch.

### 2.7 Designated Lab Allocation & NABL Reports
* **Designated Processing Lab Assignment:** Assign specific NABL-accredited processing labs to orders based on city, test specialty, or capacity.
* **Master Report Publishing:** Upload, replace, verify, or revoke NABL PDF reports; trigger instant SMS, WhatsApp, and Push notifications to patients.

### 2.8 Partner Pre-Registration & Launch Queue
* **Partner Database:** View pre-registered Doctors, Partner Diagnostic Labs, Scan/MRI Centers, and Health Coaches.
* **1-Click Launch Notification Trigger:** Send bulk SMS, WhatsApp, Email, and Push launch announcements when dedicated partner portals (Phase 3) go live.

---

## 3. 🖥️ Screen Layout & Navigation Specs

### Web Command Center
* **Header Bar:** MedMarg Master Logo, Global Search (Orders, Patients, Agents, Barcodes), City Filter Dropdown, System Health Indicators, Admin Profile & Red Logout Button.
* **Sidebar Drawer:**
  - 📊 `Dashboard Overview`
  - 🧪 `Master Catalog (913+ Tests)`
  - 📦 `Live Orders & Dispatch`
  - 📡 `GPS Radar Fleet Map`
  - 👥 `Users & Customers`
  - 👔 `MedMarg Staff`
  - 🛵 `Salaried Agents & Quotas`
  - ⚡ `Freelancers & Verification`
  - 📝 `Stock & Indents`
  - 🏥 `Designated Labs`
  - 🩺 `Partner Pre-Registration Queue`
  - 💰 `Financials & Payouts`

---

## 4. 🔑 API Permissions & Endpoints

- `GET /api/v1/admin/overview`: Aggregate system performance stats.
- `POST /api/v1/admin/orders/override`: Force re-route or re-assign order.
- `POST /api/v1/admin/freelancers/:id/verify`: Approve/Reject freelancer & credit wallet balance.
- `POST /api/v1/admin/indents/:id/approve`: Approve inventory stock replenishment.
- `POST /api/v1/admin/catalog/save`: Add/edit diagnostic catalog item.
- `POST /api/v1/admin/reports/publish`: Publish NABL PDF report to customer account.
- `POST /api/v1/admin/partners/notify-launch`: Trigger bulk multi-channel launch notifications.
