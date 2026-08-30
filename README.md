# MedMarg Healthcare Platform (Omnichannel Ecosystem)

**[MedMarg](https://www.medmarg.com/)** is an open multi-lab diagnostic marketplace and integrated healthcare platform.

---

## 🏗️ Multi-Platform Architecture

```
d:\MedMarg\
├── web/                  # 🌐 Web Application (React.js + Vite)
├── app/                  # 🤖 Native Android App (Kotlin + Jetpack Compose - Material 3)
├── ios/                  # 🍎 Native iOS App (Swift + SwiftUI)
├── backend/              # ⚙️ Node.js Express API (Google Drive API + Firebase Admin)
├── deploy.sh             # 🚀 Automated VPS Deployment Script
└── README.md
```

---

## 🚀 VPS Deployment & Fast-Update Guide (Hostinger VPS)

### Safe Ports Allocated on VPS:
- **Web Application:** `5085` (`pm2 serve dist 5085 --spa --name "medmarg-web"`)
- **Backend API:** `5080` (`PORT=5080 pm2 start server.js --name "medmarg-api"`)
- *(Leaves ports 5000–5009 and port 80 completely undisturbed for other hosted sites)*

---

### How to Update the Live Server (Standard Fast-Update Command):
Whenever changes are pushed to GitHub, run this single block on your VPS terminal (`root@srv875579:~#`):

```bash
cd /var/www/medmarg
git reset --hard
git clean -fd
git pull origin main
cd web && npm run build
pm2 restart medmarg-web medmarg-api
```

---

### Live URLs:
- **🌐 Full Landing Page:** [http://147.93.107.21:5085/](http://147.93.107.21:5085/)
- **🔑 Universal Single Sign-In & Role Dashboards:** [http://147.93.107.21:5085/login](http://147.93.107.21:5085/login)
- **⚙️ Backend API Health:** [http://147.93.107.21:5080/api/health](http://147.93.107.21:5080/api/health)

---

## 🌟 Key Technical Implementations

1. **Client Applications by Stack:**
   - **Web:** React.js (`web/`) with full marketplace landing page at `/`, single login at `/login`, and role dashboards.
   - **Android:** Native Kotlin + Jetpack Compose (`app/`).
   - **iOS:** Native Swift + SwiftUI (`ios/`).

2. **Single Universal Login & Automatic Role Detection:**
   - Single sign-in via Phone OTP, Google Social Auth, or ABHA ID.
   - Automatically detects user role (`PATIENT`, `DIAGNOSTIC_LAB`, `SCAN_CENTER`, `DOCTOR`, `PHARMACY`, `ADMIN`) and loads their dedicated dashboard.

3. **Multi-Lab Pathology Marketplace:**
   - Open registration for pathology labs.
   - Patients compare tests on price, NABL accreditation, turnaround time (TAT), and free home collection.

4. **Radiology & Advanced Scanning Centers:**
   - Booking for 1.5T/3.0T MRI, CT Scan, Ultrasound with machine specs and slot reservation.

5. **In-Clinic Doctor Appointment Booking:**
   - Walk-in OPD appointment scheduling with verified specialists (No video calls).

6. **Google Drive Storage Integration:**
   - Prescriptions, lab report PDFs, and scan files are uploaded to Google Drive.
   - The database stores direct shareable Google Drive `webViewLink` URLs; clicking in the app opens the Drive document.

7. **Hostinger VPS Safe Hosting:**
   - Dedicated internal ports **`5080` (API)** and **`5085` (Web)**.
   - Nginx reverse proxy configuration provided in [`backend/deploy/nginx-medmarg.conf`](file:///d:/MedMarg/backend/deploy/nginx-medmarg.conf).

---

## 💻 Local Development

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
