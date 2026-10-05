# MedMarg Healthcare Ecosystem — Single Backend Architecture & API Specification (`backend_structure.md`)

**Version:** 3.1.0  
**Status:** Active Master Single-Backend & Workflow Specification  
**Live Staging Domain:** `https://medmarg.sriddha.com` (VPS: `147.93.107.21`)  
**Supported Clients:** Web (React / Vite), Android (Kotlin + Jetpack Compose), iOS (SwiftUI)

---

## 1. 🏗 System Architecture Overview

MedMarg operates on a **Single Unified Backend Gateway** architecture built with **Node.js (Express), PostgreSQL (Relational Data), Firebase Auth & FCM (Push Notifications), and Google Cloud / Drive API (Report Storage & Delivery)**.

The **Super Admin** is the **Omnipresent System Master**. Super Admin possesses a 100% super-set of capabilities—able to view, execute, override, switch to, and manage every single feature, workflow, and action present across all other user roles (Customer, Staff, Salaried Agent, Freelance Agent, Designated Lab, Doctor, Scan Center, Health Coach).

```
                            +-------------------------------------------+
                            |            MEDMARG SUPER ADMIN            |
                            |  (Omnipresent Master Control & Overrides) |
                            +---------------------+---------------------+
                                                  |
           +--------------------------------------+--------------------------------------+
           |                                      |                                      |
           v                                      v                                      v
+-----------------------+              +-----------------------+              +-----------------------+
|  CUSTOMER & STAFF HUB |              | SALARIED & FREELANCE  |              |   PARTNER & LAB HUB   |
|  - Booking & Catalog  |              | AGENT HUB             |              |  - Designated Labs    |
|  - Payment & QR Code  |              |  - Quotas & Broadcast |              |  - Onboarding & Verif |
|  - Reports & Locker   |              |  - GPS Radar & Indent |              |  - Doctor & Scan Sync |
+-----------------------+              +-----------------------+              +-----------------------+
                                                  |
                                                  v
                            +-------------------------------------------+
                            |      MEDMARG UNIFIED BACKEND API          |
                            |           (backend_structure.md)          |
                            +-------------------------------------------+
```

---

## 2. 🔄 Master Operational Workflow & Super Admin Overrides

```
[Customer / Staff / Super Admin Booking] 
         │
         ▼
[Payment Engine: Prepaid Online OR Doorstep Razorpay QR]
         │
         ▼
[Auto-Dispatch Engine (Super Admin Can Manual Override Anytime)]
   ├── 1. Primary Salaried Agent Available? ──► [Assigned to Salaried Agent]
   ├── 2. Primary Full? Check Nearby Salaried ──► [Assigned to Backup Salaried Agent]
   └── 3. All Salaried Full? ──► [FCM Broadcast to Freelance Agents (First Claim Wins)]
         │
         ▼
[Agent / Super Admin Accepts & Verifies Inventory]
   ├── Stock Sufficient ──► [Lock Vacutainers/Tubes for Order]
   └── Stock Low ───────► [Agent Raises Indent ➔ Super Admin/Staff Approves & Dispatches]
         │
         ▼
[Real-Time GPS Telemetry Radar (Tracked by Customer, Staff, and Super Admin)]
         │
         ▼
[Agent / Super Admin Doorstep Visit & Verification]
   ├── If Paid Online ──► [Proceed to Collection]
   └── If Unpaid ───────► [Generate Dynamic Razorpay QR ➔ Payment Verified]
         │
         ▼
[Sample Handover at Designated Lab (Assigned & Managed by Super Admin)]
         │
         ▼
[Lab Processing & NABL Report Generation]
         │
         ▼
[Super Admin / Staff Uploads Report ➔ Patient Dashboard ➔ Doctor Sharing]
```

---

## 3. 👑 Master Role & Capability Matrix (Super Admin Omnipresence)

| Capability / Module | Super Admin | Customer | MedMarg Staff | Salaried Agent | Freelance Agent |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Catalog & Test Management (913+ Tests, Prices, Packages)** | 👑 Full Control | 👁️ View & Book | 👁️ View & Book | 👁️ View Specs | 👁️ View Specs |
| **Place Orders & Book Slots** | 👑 Full Control (Any Patient) | 👤 Self / Family | 👥 Customer Behalf | ❌ | ❌ |
| **Auto-Dispatch & Capacity Rules** | 👑 Full Control & Override | ❌ | 👁️ Monitor | 📥 Receive | 📢 Claim Broadcast |
| **Freelancer Document Onboarding & Verification** | 👑 Full Control (Approve/Reject) | ❌ | 👁️ Assist | ❌ | 📄 Submit Documents |
| **Onboarding Fee & Inventory Wallet Credits** | 👑 Full Control (Set Fee/Credits) | ❌ | ❌ | ❌ | 💳 Pay & Use Credits |
| **Inventory & Indent Approval** | 👑 Full Control (Approve/Dispatch) | ❌ | 📦 Dispatch | 📝 Raise Indent | 📝 Raise Indent |
| **Real-Time GPS Tracking & Telemetry Radar** | 👑 Global Radar View | 📍 My Agent | 📍 Fleet Radar | 🛰️ Broadcast GPS | 🛰️ Broadcast GPS |
| **Doorstep Razorpay QR & Payment Overrides** | 👑 Full Control & Refund | 💳 Pay / Scan QR | 💳 Collect | 📲 Display QR | 📲 Display QR |
| **Designated Lab Allocation** | 👑 Full Control (Set Lab Per Order) | ❌ | 👁️ View Lab | 🚚 Deliver to Lab | 🚚 Deliver to Lab |
| **NABL Report Upload, Editing & Publishing** | 👑 Full Control | 📑 View & Share | 📑 Upload & View | ❌ | ❌ |
| **Financial Wallet, Commission & Payout Approval** | 👑 Full Control (Approve Payouts) | ❌ | ❌ | 💼 Salary View | 💰 Wallet & Cashout |
| **Role Impersonation / View-As Mode** | 👑 Switch to Any View | ❌ | ❌ | ❌ | ❌ |

---

## 4. 💾 Master Database Schemas (PostgreSQL Specification)

### 4.1 `users`
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'STAFF', 'CUSTOMER', 'SALARIED_AGENT', 'FREELANCER_AGENT')),
    status VARCHAR(30) DEFAULT 'ACTIVE' CHECK (status IN ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED')),
    assigned_zone_id UUID,
    daily_order_quota INT DEFAULT 15,
    fcm_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 4.2 `freelancer_verifications`
```sql
CREATE TABLE freelancer_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    qualification_type VARCHAR(50) NOT NULL CHECK (qualification_type IN ('DMLT', 'VOCATIONAL_MLT', 'BSC_MLT')),
    qualification_certificate_url TEXT NOT NULL,
    paramedical_board_certificate_url TEXT NOT NULL,
    experience_letter_url TEXT NOT NULL,
    onboarding_fee_amount NUMERIC(10, 2) NOT NULL,
    onboarding_fee_paid BOOLEAN DEFAULT FALSE,
    wallet_inventory_credits NUMERIC(10, 2) DEFAULT 0.00,
    verification_status VARCHAR(30) DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    verified_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 4.3 `inventory_items` & `agent_inventory`
```sql
CREATE TABLE inventory_items (
    id VARCHAR(50) PRIMARY KEY,
    item_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    unit_cost NUMERIC(10, 2) NOT NULL
);

CREATE TABLE agent_inventory (
    agent_id UUID REFERENCES users(id),
    item_id VARCHAR(50) REFERENCES inventory_items(id),
    quantity_in_hand INT DEFAULT 0,
    PRIMARY KEY (agent_id, item_id)
);
```

### 4.4 `indent_requests`
```sql
CREATE TABLE indent_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES users(id) NOT NULL,
    requested_items JSONB NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'DISPATCHED', 'REJECTED')),
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 4.5 `orders`
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(30) UNIQUE NOT NULL,
    customer_id UUID REFERENCES users(id) NOT NULL,
    booked_by_staff_id UUID REFERENCES users(id),
    assigned_agent_id UUID REFERENCES users(id),
    agent_type VARCHAR(30) CHECK (agent_type IN ('SALARIED', 'FREELANCER')),
    designated_lab_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'BOOKED' CHECK (status IN ('BOOKED', 'BROADCASTED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'SAMPLE_COLLECTED', 'HANDED_OVER_TO_LAB', 'REPORT_UPLOADED', 'CANCELLED')),
    pickup_address JSONB NOT NULL,
    scheduled_slot TIMESTAMP WITH TIME ZONE NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_mode VARCHAR(30) NOT NULL CHECK (payment_mode IN ('ONLINE_PREPAID', 'RAZORPAY_QR_AT_DOORSTEP')),
    payment_status VARCHAR(30) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED')),
    razorpay_payment_id VARCHAR(100),
    handover_otp VARCHAR(6) NOT NULL,
    report_file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. 🌐 Universal Super Admin API Standards

Super Admin JWT tokens grant access to all endpoints, including dedicated admin override APIs:
- `POST /api/v1/admin/orders/override-assign`: Force-assign any order to any agent or lab.
- `POST /api/v1/admin/freelancers/verify`: Approve/Reject freelancer qualification docs & set wallet inventory credits.
- `POST /api/v1/admin/indents/approve`: Approve stock indents and update agent inventory automatically.
- `POST /api/v1/admin/catalog/manage`: Create, edit, activate/deactivate lab tests and packages.
- `POST /api/v1/admin/reports/upload`: Upload, re-upload, or revoke NABL PDF test reports.
- `POST /api/v1/admin/impersonate`: Generate a scoped preview session as any Customer, Staff, or Agent.

---

## 6. 🚀 VPS Deployment & Process Architecture Guide

### 6.1 Server & Port Topology (Hostinger VPS: `147.93.107.21`)
* **Live Domain:** `https://medmarg.sriddha.com`
* **Reserved Port Allocation:**
  - `5080`: **`medmarg-api`** (Unified Node.js / Express Backend & Static SPA Host)
  - `5085`: **`medmarg-web`** (Optional standalone React SPA server via PM2 serve)
  - *Ports `5000-5009` are reserved for other co-hosted services on the VPS.*

### 6.2 Single Unified Process vs. Dual Process Architecture

#### ❓ Do we need `medmarg-web` and `medmarg-api` separately?
* **No, in production a Single Unified Process (`medmarg-api`) is the recommended best practice:**
  1. `server.js` automatically detects `../web/dist` and serves the built React SPA on **Port 5080**.
  2. Running a single process reduces VPS RAM & CPU overhead by 50%.
  3. Eliminates cross-origin (CORS) preflight latencies since API and Frontend run on the exact same origin.
  4. Simplifies PM2 process management to just **1 active process**.

### 6.3 Standard VPS Deployment Commands
```bash
# 1. Update repo
cd /var/www/medmarg
git reset --hard
git clean -fd
git pull origin main

# 2. Build React Frontend
cd /var/www/medmarg/web
npm install --legacy-peer-deps
npm run build

# 3. Start Unified Backend
cd /var/www/medmarg/backend
npm install --legacy-peer-deps
pm2 delete medmarg-api 2>/dev/null || true
PORT=5080 pm2 start server.js --name "medmarg-api"
pm2 save
```

### 6.4 Crash Loop Prevention & Safety Architecture
1. **Global Process Exception Handlers:** `process.on('uncaughtException')` and `process.on('unhandledRejection')` are registered in `server.js` to log errors safely rather than crashing the Node runtime.
2. **Safe Scope Auditing:** Always ensure variables logged in `app.listen()` callbacks (such as `dbStore.territories`) are accessed with default fallback guards `(dbStore.territories || []).length`.
3. **PM2 Reboot Persistence:** Always run `pm2 save` after starting or restarting services.

