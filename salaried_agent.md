# MedMarg Healthcare Ecosystem — Salaried Collection Agent Specification (`salaried_agent.md`)

**Role Title:** Salaried Collection Agent (In-House Phlebotomist)  
**Access Scope:** Assigned Zone Pickups, Inventory Tracking, Indent Requests, Doorstep QR Payment, Lab Handover  
**Supported Platforms:** Web (React / Vite), Android (Kotlin + Jetpack Compose), iOS (SwiftUI)

---

## 1. 📌 Role Overview

**Salaried Collection Agents** are in-house phlebotomists employed by MedMarg. They are assigned specific operational location zones and receive auto-routed home sample pickup orders up to a maximum daily order capacity limit set by the Super Admin (e.g., max 15 orders/day).

---

## 2. 🛵 Core Features & Field Workflows

### 2.1 Daily Duty Roster & Quota Management
* **Zone Duty Activation:** Toggle online status (`Active on Duty` / `Off Duty`) within assigned location zone.
* **Auto-Assigned Orders:** Receive home collection orders automatically routed by the dispatch engine based on location and current daily order count.
* **Daily Quota HUD:** Display daily progress counter (e.g., `8 / 15 Orders Completed Today`).

### 2.2 Inventory Management & Stock Indents
* **Live In-Hand Inventory Tracker:** Real-time stock counts of vacutainers (Gold SST, Purple EDTA, Grey Fluoride), syringes, cool packs, biohazard bags, and barcode labels.
* **Raise Indent Request:** Quick mobile form to request stock replenishment from MedMarg Staff/Super Admin when stock is low. Select requested item quantities and submit for approval.

### 2.3 Turn-by-Turn GPS Navigation & Customer Visit
* **Turn-by-Turn Directions:** 1-tap launcher for Google Maps / Apple Maps to navigate to customer doorstep.
* **Patient Identity Verification:** Verify patient name, requested tests, and fasting compliance upon arrival.

### 2.4 Doorstep Dynamic Razorpay QR Payment Collection
* **Dynamic Razorpay UPI QR Generator:** For unpaid orders (`Pay at Doorstep`), the app generates a dynamic UPI QR code on the mobile screen.
* **Instant Payment Confirmation:** Customer scans and pays via any UPI app (GPay, PhonePe, Paytm, BHIM). App displays green payment confirmation badge automatically.

### 2.5 Sample Collection & Handover OTP Security
* **4-Digit Handover OTP Verification:** Input the 4-digit security OTP provided by the patient to start sample collection.
* **Vacutainer Barcode Scanner:** Built-in camera barcode scanner to scan and bind vacutainer tube barcodes to the specific order.
* **IoT Cold-Chain Carrier Bag:** Place collected tubes in temperature-controlled bag (`2°C - 8°C`).

### 2.6 Designated Lab Handover
* **Designated Lab Instructions:** View destination lab details assigned by Super Admin for the order.
* **Sample Handover Confirmation:** Deliver samples to lab technician, scan handover barcode, and record arrival timestamp.

---

## 3. 🖥️ Mobile Application Screen Layout (Android / iOS)

* **Home Screen:** Duty Toggle Switch, Daily Quota Counter (`8/15`), Next Scheduled Pickup Card, Quick Action: `+ Raise Indent`.
* **Pickups Roster Screen:** Chronological list of assigned visits with address, slot time, fasting icon, payment status (`PAID` / `COLLECT QR PAYMENT`).
* **Active Pickup Execution Screen:**
  - Patient Details & Address Navigation.
  - Razorpay Dynamic QR Button (if unpaid).
  - 4-Digit OTP Entry Pad.
  - Barcode Scanner Camera Module.
  - Collection Checklist: `Gold SST Tube [Scanned]`, `Purple EDTA Tube [Scanned]`.
  - Complete Collection CTA Button.
* **Inventory & Indents Screen:** Current Stock Table, Active Indent Status (`PENDING` / `DISPATCHED`).

---

## 4. 🔑 Key Salaried Agent API Endpoints

- `GET /api/v1/agent/roster`: Fetch daily assigned orders.
- `POST /api/v1/agent/indent`: Submit stock replenishment request.
- `POST /api/v1/payments/generate-doorstep-qr`: Generate dynamic Razorpay UPI QR code.
- `POST /api/v1/agent/verify-otp`: Validate patient handover OTP.
- `POST /api/v1/agent/scan-barcode`: Bind vacutainer barcode to order.
- `POST /api/v1/agent/lab-handover`: Confirm sample delivery at designated lab.
