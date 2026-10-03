# MedMarg Healthcare Ecosystem — Partner Pre-Registration & Launch Specification (`partners_pre_registration.md`)

**Role Title:** Pre-Registered Healthcare Partners (Doctors, Diagnostic Labs, Scan/MRI Centers, Health Coaches, Hospitals)  
**Access Scope:** Pre-Registration Portal, Data Collection, Automated Multi-Channel Launch Announcement Queue  
**Supported Platforms:** Web (Public Registration Landing Page) & Super Admin Control Panel

---

## 1. 📌 Role Overview

The **Partner Pre-Registration System** captures information from healthcare professionals and institutions interested in joining the MedMarg ecosystem. Registered partners are saved in PostgreSQL, and an automated multi-channel notification engine (SMS, WhatsApp, Email, Push) alerts them as soon as their dedicated partner portals (Phase 3) go live.

---

## 2. 📝 Partner Categories & Registration Requirements

Stakeholders register under 5 primary categories:

### 2.1 Doctors / Medical Practitioners
* **Required Data:** Doctor Full Name, Specialization (General Physician, Cardiologist, Endocrinologist, etc.), Medical Council License Number, Clinic/Hospital Name, City, Phone, Email.
* **Future Portal Role (Phase 3):** E-prescriptions, ordering lab tests for patients, reviewing patient NABL diagnostic reports, telehealth consultations.

### 2.2 Partner Diagnostic Labs
* **Required Data:** Laboratory Name, NABL / ICMR Accreditation Number, Lab Director Contact, Address, City, Testing Capabilities (Pathology, Histopathology, Microbiology), Phone, Email.
* **Future Portal Role (Phase 3):** Receiving sample batches, lab sync, digital test result entry.

### 2.3 Radiology / Scan & MRI Centers
* **Required Data:** Center Name, Modalities Available (X-Ray, Ultrasound, CT Scan, 1.5T/3T MRI, PET-CT), License Number, Address, City, Contact Person, Phone, Email.
* **Future Portal Role (Phase 3):** Radiology appointment slot booking, DICOM image viewer, scan report uploads.

### 2.4 Health & Wellness Coaches / Nutritionists
* **Required Data:** Coach Name, Certification Body (Dietetics, Wellness Coaching), Establishment Name, Specialty, City, Phone, Email.
* **Future Portal Role (Phase 3):** Client biomarker monitoring, diet and wellness plan generation.

### 2.5 Others (Hospitals, Clinics, Corporate Wellness)
* **Required Data:** Establishment Name, Category Type, Contact Person, Address, City, Phone, Email, Expected Monthly Test Volume.

---

## 3. 🔔 Automated Multi-Channel Launch Notification Queue

When Super Admin releases a specific partner dashboard module (e.g., Doctor Portal or Scan/MRI Center Portal):
1. **Targeted Filtering:** Super Admin filters pre-registered partners by category (e.g., `Category = DOCTOR`).
2. **1-Click Launch Trigger:** Super Admin clicks `Send Live Launch Announcement`.
3. **Multi-Channel Dispatch:**
   - **SMS / WhatsApp:** Fast2SMS / Twilio API dispatches personalized launch message with secure onboarding link.
   - **Email:** SendGrid / Mailgun API sends HTML invite email detailing portal features and access credentials.
   - **Push Notification:** FCM notification delivered if partner has installed the MedMarg app.
4. **Status Tracker:** Database updates record status from `REGISTERED` to `NOTIFIED` and `ONBOARDED`.

---

## 4. 🔑 Key Partner API Endpoints

- `POST /api/v1/partners/register`: Public registration endpoint.
- `GET /api/v1/partners/list` *(Super Admin)*: List all pre-registered partners with category filter.
- `POST /api/v1/partners/notify-launch` *(Super Admin)*: Trigger bulk multi-channel launch announcement notifications.
