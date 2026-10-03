# MedMarg Healthcare Ecosystem — Patient / Customer Specification (`patient_customer.md`)

**Role Title:** Patient / Customer  
**Access Scope:** Self & Linked Family Members  
**Supported Platforms:** Web (React / Vite), Android (Kotlin + Jetpack Compose), iOS (SwiftUI)

---

## 1. 📌 Role Overview

The **Patient / Customer** interface is engineered to provide a high-trust, friction-free healthcare journey—enabling patients to browse 913+ lab tests and packages, book home sample pickups, track phlebotomists live on a map, pay online or at doorstep via dynamic Razorpay QR, access NABL PDF reports, and share test results with healthcare professionals.

---

## 2. 📱 Core Features & User Workflows

### 2.1 Diagnostic Catalog & Smart Package Discovery
* **Master Catalog Search:** Instant search across 913+ pathology and diagnostic tests, profiles, and life-stage packages.
* **Filter by Categories:** Pathology, Radiology, His Wellness, Her Wellness, Senior Care, Diabetes, Cardiac, Thyroid.
* **Smart Dynamic Package Upgrade:** Dynamic algorithm highlighting savings when selecting single tests (e.g., *"Upgrading to Full Body Package saves ₹2,001 - 57% OFF"*).
* **Detailed Specifications Sheet:** View sample container requirements (Serum SST, EDTA, Fluoride), fasting hours requirement (e.g., 8-10 hrs fasting), and turnaround time (TAT).

### 2.2 Flexible Order Booking & Slot Selection
* **Patient Selection:** Book tests for self or linked family members (Spouse, Children, Parents).
* **Address Manager:** Multi-address manager with GPS pinpoint location picker.
* **Time Slot Selection:** Select 60-minute home collection slots (Morning Fasting slots: 06:00 AM - 11:00 AM; Afternoon/Evening slots).

### 2.3 Dual Payment Modes
* **Prepaid Online Payment:** Pay securely via UPI, Credit/Debit Cards, NetBanking, or Mobile Wallets at the time of booking.
* **Doorstep Dynamic Razorpay QR:** Select `Pay at Doorstep`. Upon phlebotomist arrival, the agent presents a dynamic Razorpay UPI QR code on their mobile screen for instant scanning and payment.

### 2.4 Live Phlebotomist Map Tracking & OTP Security
* **Delivery-Style Map View:** Interactive city map showing real-time phlebotomist movement, vehicle speed (`km/h`), arterial routes, and dynamic ETA countdown (`mins`).
* **Phlebotomist Card:** View agent name, photo, star rating, vehicle details, and 1-tap Call/WhatsApp buttons.
* **4-Digit Handover Security OTP:** Displayed on-screen (e.g., `OTP: 4 8 9 2`). The patient provides this OTP to the agent to confirm identity before sample collection.
* **Cold-Chain Sensor HUD:** Live telemetry monitoring sample container temperature (`4.2°C Active` within optimal 2°C–8°C range).

### 2.5 NABL Health Locker & Report Dashboard
* **NABL PDF Reports:** Instant view and 1-tap PDF report download as soon as published by Super Admin / Staff.
* **Biomarker Longitudinal Trends:** Interactive curve graphs visualizing historical biomarker metrics (Systolic/Diastolic BP, Fasting Blood Glucose, HbA1c, Cholesterol, Vitamin D, Thyroid TSH).

### 2.6 Doctor & Healthcare Professional Sharing
* **1-Click Share:** Generate secure encrypted share links or PDF report bundles to send diagnostic results directly to consulting Doctors, Scan/MRI Centers, or Health Coaches.

---

## 3. 🖥️ Screen Layout & Navigation Specs (Web, Android, iOS)

* **Top Bar:** Hamburger Drawer Toggle, Official MedMarg Logo, Scrollable Welcome Label (`Welcome, [Name]`), Notification Bell with Red Badge, Logout Power Button.
* **Bottom Navigation Bar (5 Core Tabs):**
  1. 🏠 **Home:** Featured Packages, Vitals Snapshot, Category Chips.
  2. 🧪 **Labs & Tests:** Universal Search, 913+ Tests Filterable List, Smart Package Recommendations.
  3. 🛵 **Track:** Live Vector Map tracking, Delivery HUD, ETA countdown, 4-digit OTP.
  4. 📋 **Reports:** NABL PDF Report History, Biomarker Curve Graphs.
  5. 👤 **Profile:** Saved Addresses, Linked Family Members, ABDM Health ID, Settings.
* **Workspace Hub Sheet:** Vertical drag gesture anywhere on the bottom navigation bar smoothly slides up the full module hub.
* **Floating Cart Bar:** Appears whenever items are selected with total price, savings badge, free collection indicator, and checkout CTA button.

---

## 4. 🔑 Key Client API Endpoints

- `GET /api/v1/catalog/tests`: Search master catalog and packages.
- `POST /api/v1/orders/book`: Submit new home pickup booking.
- `GET /api/v1/orders/:id/track`: Fetch live agent GPS coordinates, cold-chain telemetry, and ETA.
- `GET /api/v1/reports/my-reports`: Access published NABL PDF test reports.
- `POST /api/v1/reports/share`: Generate temporary secure sharing link for doctor.
