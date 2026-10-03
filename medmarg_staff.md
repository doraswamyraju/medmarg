# MedMarg Healthcare Ecosystem — Staff Specification (`medmarg_staff.md`)

**Role Title:** MedMarg Staff / Operations & Support  
**Access Scope:** Customer Assistance, Dispatch Supervision, Stock Fulfillment & Report Uploads  
**Supported Platforms:** Web (React / Vite), Android (Kotlin + Jetpack Compose), iOS (SwiftUI)

---

## 1. 📌 Role Overview

**MedMarg Staff** members are operational personnel responsible for assisting customers with bookings, supervising live dispatch queues, processing physical inventory indents raised by agents, verifying raw test data from processing labs, and uploading final NABL-certified PDF reports.

---

## 2. 💼 Core Features & Operations

### 2.1 Customer Booking Assistance (On Customer's Behalf)
* **Assisted Booking Portal:** Create orders for customers who phone in or visit physical helpdesks.
* **Customer Lookup:** Search existing customer records by mobile number, name, or ABDM ID; create new patient profiles if required.
* **Slot & Test Selection:** Add required lab tests/packages, select home pickup slots, and confirm payment choice (Prepaid Online link or Doorstep Razorpay QR).

### 2.2 Dispatch Supervision & Order Monitoring
* **Live Fulfillment Desk:** Monitor incoming orders across city zones.
* **Dispatch Queue Tracking:** Verify that orders are auto-assigned to primary salaried agents within their daily capacity limit.
* **Broadcast Monitoring:** Track overflow orders broadcasted to freelance collection agents when salaried quotas are full.
* **Manual Re-Assignment:** Re-route orders to backup agents if an assigned agent encounters delays or emergencies.

### 2.3 Agent Stock Indent Fulfillment
* **Indent Order Queue:** Receive notifications when a Salaried or Freelance Agent submits a stock replenishment request (**Indent**).
* **Stock Preparation & Dispatch:** Prepare requested supplies (Gold SST tubes, Purple EDTA, Grey Fluoride, Syringes, Ice gel packs, Barcodes), verify item counts, and mark indents as `DISPATCHED`.

### 2.4 Designated Lab Report Processing & Upload
* **Processing Lab Receipt:** Receive raw result data / lab PDFs from designated processing labs.
* **Patient & Barcode Verification:** Cross-check vacutainer barcode numbers, patient names, and requested test parameters.
* **NABL Report Upload:** Upload certified PDF diagnostic reports into the backend portal. Uploading sends instant SMS, WhatsApp, and Push notifications to the customer.

### 2.5 Customer Support & Fleet Supervision Radar
* **Live Agent Radar:** Access the multi-agent GPS tracking map to address patient queries regarding phlebotomist arrival times.
* **Support Ticket Escalation:** Escalate unresolved delivery, cold-chain temperature breach, or payment issues directly to the Super Admin.

---

## 3. 🖥️ Screen Layout & Navigation Specs

* **Web Operations Control Desk:**
  - Header: Staff ID Badge, City Zone Switcher, Order Quick-Search, Pending Indents Counter (`[3] Pending`), Logout.
  - Sidebar:
    - 📦 `Customer Bookings (Assisted)`
    - 🚦 `Order Dispatch Desk`
    - 📝 `Agent Indent Requests`
    - 📄 `NABL Report Upload Queue`
    - 📡 `Fleet GPS Radar`
    - 📞 `Customer Support`

---

## 4. 🔑 Key Staff API Endpoints

- `POST /api/v1/staff/orders/create`: Place order on customer's behalf.
- `GET /api/v1/staff/indents/pending`: List pending stock indents.
- `POST /api/v1/staff/indents/:id/fulfill`: Fulfill and dispatch inventory indent.
- `POST /api/v1/staff/reports/upload`: Upload NABL PDF test report.
- `GET /api/v1/staff/fleet/radar`: Fetch active agent map telemetry.
