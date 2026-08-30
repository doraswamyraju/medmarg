# MedMarg Healthcare Platform (Omnichannel Ecosystem)

**[MedMarg](https://www.medmarg.com/)** is an open multi-lab diagnostic marketplace and integrated healthcare platform.

---

## 🏗️ Multi-Platform Architecture

```
d:\MedMarg\
├── app/                  # Native Android (Kotlin + Jetpack Compose - Material 3)
├── web/                  # Web Application (React.js + Vite)
├── ios/                  # Native iOS (Swift + SwiftUI)
├── backend/              # Node.js Express API (Google Drive API + Firebase Admin)
└── README.md
```

---

## 🌟 Key Technical Implementations

1. **Native Client Apps:**
   - **Web:** React.js (`d:\MedMarg\web`) with universal login and dynamic dashboards for Patients, Labs, Scan Centers, Doctors, Pharmacies, and Admins.
   - **Android:** Native Kotlin + Jetpack Compose (`d:\MedMarg\app`).
   - **iOS:** Native Swift + SwiftUI (`d:\MedMarg\ios`).

2. **Single Universal Login & Automatic User Type Detection:**
   - Single sign-in using Phone OTP, Google Social Auth, or ABHA ID.
   - Automatically detects user role (`PATIENT`, `DIAGNOSTIC_LAB`, `SCAN_CENTER`, `DOCTOR`, `PHARMACY`, `ADMIN`) and routes to their dedicated dashboard.

3. **Multi-Lab Pathology Marketplace:**
   - Allows accredited pathology labs to register and list tests.
   - Patients compare tests on price, NABL accreditation, turnaround time (TAT), and free home collection.

4. **Radiology & Advanced Scanning Centers:**
   - Booking for 1.5T/3.0T MRI, CT Scan, Ultrasound with machine specs and slot reservation.

5. **In-Clinic Doctor Appointment Booking:**
   - Walk-in OPD appointment scheduling with verified specialists (No video calls).

6. **Google Drive Storage Integration:**
   - Prescriptions, lab report PDFs, and scan files are uploaded to Google Drive.
   - The database stores direct shareable Google Drive `webViewLink` URLs; clicking in the app opens the Drive document.

7. **Hostinger VPS Safe Hosting & Port Isolation:**
   - Dedicated internal port: **`5080`** (safe from ports 5000–5009 used by other hosted sites).
   - Nginx reverse proxy configuration template in `backend/deploy/nginx-medmarg.conf`.
   - Real-time location tracking & Push notifications via Firebase (Firestore + FCM).

---

## 🚀 How to Run Each Module

### 1. Web Module (React)
```bash
cd web
npm install
npm run dev
# Running on http://localhost:3000
```

### 2. Backend Module (Node.js API)
```bash
cd backend
npm install
node server.js
# Running on port 5080 (Health check: http://localhost:5080/api/health)
```

### 3. Android Module (Kotlin)
Open `d:\MedMarg` in **Android Studio** and click **Run**.

### 4. iOS Module (Swift)
Open `d:\MedMarg\ios` in **Xcode** and click **Run**.
