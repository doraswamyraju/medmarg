import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#0F172A'
    }}>
      {/* Top Navigation Header */}
      <header style={{
        backgroundColor: '#004D40',
        color: '#FFFFFF',
        padding: '24px 20px',
        borderBottom: '4px solid #10B981'
      }}>
        <div style={{ maxWidth: '920px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img
              src="/logo.png"
              alt="MedMarg"
              style={{ height: '42px', backgroundColor: '#FFFFFF', padding: '6px 10px', borderRadius: '10px' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, letterSpacing: '-0.3px' }}>
                MedMarg Health & Diagnostics
              </h1>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#A7F3D0', fontWeight: 600, letterSpacing: '0.8px' }}>
                PRIVACY POLICY • TERMS OF SERVICE • HEALTHKIT & DATA PROTECTION
              </p>
            </div>
          </div>
          <a
            href="/"
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: '#FFFFFF',
              textDecoration: 'none',
              padding: '10px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              border: '1px solid rgba(255,255,255,0.25)'
            }}
          >
            ← Back to MedMarg Home
          </a>
        </div>
      </header>

      {/* Main Content Container */}
      <main style={{ maxWidth: '920px', margin: '32px auto', padding: '0 20px 64px 20px' }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '36px',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
          border: '1px solid #E2E8F0',
          lineHeight: 1.7
        }}>
          <div style={{
            display: 'inline-block',
            backgroundColor: '#ECFDF5',
            color: '#047857',
            padding: '6px 14px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '16px'
          }}>
            Effective Date: November 4, 2026 • Last Updated: November 4, 2026
          </div>

          <h2 style={{ marginTop: 0, fontSize: '28px', fontWeight: 800, color: '#0F172A' }}>
            MedMarg Privacy Policy & Clinical Data Protection Charter
          </h2>
          <p style={{ color: '#475569', fontSize: '15px' }}>
            MedMarg Healthcare Services ("MedMarg", "we", "our", or "us") operates the <strong>MedMarg Health & Diagnostics</strong> mobile applications (iOS and Android) and web platform (<a href="https://medmarg.com" style={{ color: '#006B70', fontWeight: 600 }}>https://medmarg.com</a>). We are committed to safeguarding your personal information, diagnostic test records, and physiological vitals in strict compliance with applicable healthcare privacy regulations, Apple App Store Review Guidelines, and Google Play Developer Policies.
          </p>

          <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '28px 0' }} />

          {/* Section 1 */}
          <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#006B70' }}>
            1. Information We Collect
          </h3>
          <p style={{ color: '#334155', fontSize: '15px' }}>
            We collect only the information necessary to provide doorstep diagnostic sample collection, laboratory processing, real-time phlebotomist tracking, and verified pathology report delivery:
          </p>
          <ul style={{ color: '#334155', fontSize: '15px', paddingLeft: '22px' }}>
            <li><strong>Contact & Account Information:</strong> Full name, mobile phone number, email address, age, gender, and doorstep sample collection address.</li>
            <li><strong>Diagnostic & Clinical Records:</strong> Ordered pathology tests, health checkup packages, uploaded doctor prescriptions, and NABL-certified diagnostic PDF reports stored in your encrypted Health Vault.</li>
            <li><strong>Apple HealthKit & Smart Vitals Data (iOS & Android):</strong> With your explicit permission, MedMarg reads and/or writes physiological metrics from Apple Health (HealthKit) or connected health monitors, including Heart Rate (BPM), Resting Heart Rate, Blood Oxygen Saturation (SpO2), Blood Pressure (Systolic/Diastolic), Fasting Blood Glucose, Step Count, Active Energy, Body Temperature, Respiratory Rate, and Sleep Analysis.</li>
            <li><strong>Location Information:</strong> Precise and approximate GPS location to pin your doorstep sample collection address, dispatch the nearest certified phlebotomist, and display live transit radar tracking.</li>
            <li><strong>Camera & Photo Library Access:</strong> Used only when you choose to upload a doctor's prescription or when collection agents scan barcoded vacutainers and capture sample custody verification photos.</li>
          </ul>

          {/* Section 2 */}
          <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#006B70', marginTop: '28px' }}>
            2. Apple HealthKit & Health Data Privacy Commitment
          </h3>
          <div style={{
            backgroundColor: '#F0FDF4',
            borderLeft: '4px solid #10B981',
            padding: '16px 20px',
            borderRadius: '10px',
            marginBottom: '16px'
          }}>
            <p style={{ margin: 0, color: '#065F46', fontSize: '14px', fontWeight: 600 }}>
              Strict Compliance with Apple HealthKit Guidelines:
            </p>
            <ul style={{ margin: '8px 0 0 0', color: '#065F46', fontSize: '14px', paddingLeft: '20px' }}>
              <li>MedMarg <strong>never</strong> uses information gained through Apple HealthKit for advertising, marketing, or use-based data mining purposes.</li>
              <li>MedMarg <strong>never</strong> sells, rents, or discloses your HealthKit data or diagnostic records to advertising platforms, data brokers, or information resellers.</li>
              <li>HealthKit data is used solely to display your real-time physiological trends and provide correlated preventive diagnostic test suggestions within the app.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#006B70', marginTop: '28px' }}>
            3. How We Use Your Information
          </h3>
          <ul style={{ color: '#334155', fontSize: '15px', paddingLeft: '22px' }}>
            <li>To schedule and coordinate 60-minute doorstep sample collection with certified phlebotomists.</li>
            <li>To verify sample custody handover using a secure 4-digit doorstep OTP and barcoded vacutainers.</li>
            <li>To route biological samples under monitored 2°C–8°C cold-chain transit to NABL-accredited partner laboratories.</li>
            <li>To deliver verified diagnostic reports and biomarker trend insights into your personal Health Vault.</li>
            <li>To authenticate your account via Password, Mobile OTP, Google Sign-In, Apple Sign-In, or Biometric (Face ID / Touch ID / Fingerprint) login.</li>
          </ul>

          {/* Section 4 */}
          <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#006B70', marginTop: '28px' }}>
            4. Medical Disclaimer
          </h3>
          <p style={{ color: '#334155', fontSize: '15px' }}>
            MedMarg connects patients with certified diagnostic laboratories and trained phlebotomy professionals. Vital correlations and biomarker summaries displayed in the app are for informational and preventive wellness tracking only. <strong>Always seek the advice of a qualified physician or healthcare provider in addition to using this app and before making any medical decisions.</strong>
          </p>

          {/* Section 5 */}
          <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#006B70', marginTop: '28px' }}>
            5. Data Security, Retention & Account Deletion Rights
          </h3>
          <p style={{ color: '#334155', fontSize: '15px' }}>
            All network traffic and clinical records are transmitted over 256-bit SSL/TLS encryption. You have the right to view, export, or permanently delete your MedMarg account and all associated personal and health records at any time:
          </p>
          <ul style={{ color: '#334155', fontSize: '15px', paddingLeft: '22px' }}>
            <li><strong>In-App Deletion:</strong> Navigate to <em>Profile → Account Settings → Delete Account</em> inside the MedMarg iOS or Android app.</li>
            <li><strong>By Email / Support Request:</strong> Send an account deletion or data inquiry request to <a href="mailto:admin@medmarg.com" style={{ color: '#006B70', fontWeight: 600 }}>admin@medmarg.com</a> or call <a href="tel:+917997991101" style={{ color: '#006B70', fontWeight: 600 }}>+91 7997991101</a>. Account deletion requests are processed within 48 hours.</li>
          </ul>

          {/* Section 6 */}
          <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#006B70', marginTop: '28px' }}>
            6. Contact Us & Grievance Officer
          </h3>
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '20px',
            fontSize: '14px',
            color: '#334155'
          }}>
            <p style={{ margin: '0 0 6px 0' }}><strong>Organization:</strong> MedMarg Healthcare Services</p>
            <p style={{ margin: '0 0 6px 0' }}><strong>Registered Address:</strong> Plot 42, Air Bypass Road, Tirupati, Andhra Pradesh – 517501, India</p>
            <p style={{ margin: '0 0 6px 0' }}><strong>Support & Privacy Email:</strong> <a href="mailto:admin@medmarg.com" style={{ color: '#006B70', fontWeight: 600 }}>admin@medmarg.com</a> / <a href="mailto:rajugariventures@gmail.com" style={{ color: '#006B70', fontWeight: 600 }}>rajugariventures@gmail.com</a></p>
            <p style={{ margin: 0 }}><strong>24×7 Helpline:</strong> <a href="tel:+917997991101" style={{ color: '#006B70', fontWeight: 600 }}>+91 7997991101</a></p>
          </div>
        </div>
      </main>
    </div>
  );
}

