# MedMarg Healthcare Ecosystem — Freelance Collection Agent Specification (`freelance_agent.md`)

**Role Title:** Freelance Collection Agent (Independent Phlebotomist)  
**Access Scope:** Registration Portal, Inventory Wallet, Broadcast Job Claiming, Doorstep QR Payment, Payout Requests  
**Supported Platforms:** Web (React / Vite), Android (Kotlin + Jetpack Compose), iOS (SwiftUI)

---

## 1. 📌 Role Overview

**Freelance Collection Agents** are independent phlebotomists who join the MedMarg gig economy network. They complete a formal qualification verification process, pay a one-time onboarding fee (which is returned as inventory credits to purchase collection supplies), and claim overflow sample collection jobs broadcasted via FCM Push notifications when salaried agents hit daily capacity limits.

---

## 2. ⚡ Onboarding & Document Verification Workflow

### 2.1 Qualification & Certificate Submission
During registration, the freelancer must upload clear copies of the following mandatory documents:
1. **Educational Qualification Certificate:** One of:
   - **DMLT** (Diploma in Medical Laboratory Technology)
   - **Vocational MLT**
   - **BSc MLT** (Bachelor of Science in Medical Laboratory Technology)
2. **Paramedical Board Registration Certificate:** Official state/national paramedical council license.
3. **Experience Letter:** Proof of prior clinical or lab collection experience.

### 2.2 One-Time Onboarding Fee & Inventory Credit Wallet
* **Onboarding Fee Payment:** Freelancer completes the one-time registration fee set by Super Admin (e.g., ₹2,000).
* **Automated Credit Conversion:** Upon Super Admin approval of documents, the paid fee is credited 1:1 into the freelancer's **Inventory Wallet Balance** (₹2,000 credits).
* **Collection Kit Purchase:** Freelancer uses wallet credits to purchase initial collection kit supplies (vacutainers, syringes, cool bag, barcodes) from the MedMarg inventory store.

---

## 3. 🛵 Field Operations & Earning Workflow

### 3.1 Broadcast Job Marketplace ("First Claim Wins")
* **FCM Push Notification Alerts:** Real-time push alerts when salaried agents in nearby zones hit daily quotas.
* **Broadcast Job Feed:** Available job cards showing pickup location, earning payout (e.g., `Earn ₹350`), slot time, fasting requirement, and distance.
* **Claim Order Button:** Instant 1-tap claim mechanism (*"First to claim gets assigned"*).

### 3.2 Inventory & Stock Indents
* **Live In-Hand Inventory Tracker:** Monitor available vacutainers and supplies.
* **Raise Indent Request:** Submit stock replenishment requests to Super Admin/Staff using wallet credits or earned balance.

### 3.3 Doorstep Razorpay QR Payment Collection
* **Dynamic Razorpay UPI QR Code:** Display dynamic UPI QR code on mobile screen for unpaid orders (`Pay at Doorstep`). Customer scans and pays instantly.

### 3.4 Sample Collection & Designated Lab Handover
* **4-Digit Handover OTP Verification:** Confirm patient identity using OTP.
* **Barcode Scan:** Scan vacutainer tube barcodes into app.
* **Lab Handover:** Deliver samples to Super Admin-designated processing lab and record handover timestamp.

### 3.5 Earning Wallet & Instant Bank Payouts
* **Earnings Dashboard:** Detailed daily/weekly breakdown of completed trips, base payouts, distance bonuses, and customer tips.
* **Instant Payout Requests:** Request instant bank transfers or UPI VPA payouts for approved wallet earnings (processed upon Super Admin sign-off).

---

## 4. 📱 Mobile Application Screen Layout (Android / iOS)

* **Onboarding Status Screen:** Document Upload Checklist (`DMLT Cert`, `Paramedical Cert`, `Exp Letter`), Fee Payment Status, Admin Approval Indicator (`PENDING` / `APPROVED`).
* **Available Jobs Screen:** Broadcast Feed of nearby pickups with earnings badge, timer countdown, and `⚡ Claim Order` button.
* **Active Job Execution Screen:** Pickup location map navigation, Razorpay QR button, OTP entry pad, barcode scanner, and lab delivery guide.
* **Wallet & Payouts Screen:** Total Earnings (`₹12,450`), Available Cashout (`₹3,200`), Bank/UPI Details, `Request Payout` Button.

---

## 5. 🔑 Key Freelancer API Endpoints

- `POST /api/v1/freelancer/register`: Submit qualification documents and pay onboarding fee.
- `GET /api/v1/freelancer/jobs/broadcast`: Fetch available unassigned pickup jobs.
- `POST /api/v1/freelancer/jobs/:id/claim`: Claim broadcasted job (First claim wins).
- `POST /api/v1/freelancer/indent`: Request inventory replenishment using wallet credits.
- `POST /api/v1/payments/generate-doorstep-qr`: Generate dynamic Razorpay QR code.
- `POST /api/v1/freelancer/wallet/payout`: Submit payout request to bank/UPI.
