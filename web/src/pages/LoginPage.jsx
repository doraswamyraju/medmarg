import React, { useState } from 'react';
import { 
  Building2, 
  FlaskConical, 
  Stethoscope, 
  Pill, 
  ShieldCheck, 
  User, 
  Phone, 
  Mail, 
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const DEMO_ACCOUNTS = [
  {
    role: 'PATIENT',
    name: 'Rahul Sharma',
    identifier: '+91 98765 43210',
    title: 'Patient (Customer)',
    org: 'Bangalore, Indiranagar',
    icon: User,
    color: '#006B70',
    bg: '#E0F2F1'
  },
  {
    role: 'DIAGNOSTIC_LAB',
    name: 'Dr. Lal PathLabs Admin',
    identifier: 'lab.lal@medmarg.com',
    title: 'Diagnostic Lab Partner',
    org: 'Dr. Lal PathLabs (NABL Accredited)',
    icon: FlaskConical,
    color: '#2563EB',
    bg: '#DBEAFE'
  },
  {
    role: 'SCAN_CENTER',
    name: 'Aarthi Scans Operations',
    identifier: 'aarthi.scans@medmarg.com',
    title: 'Radiology & Scan Center',
    org: 'Aarthi Scans (3.0T MRI Center)',
    icon: Building2,
    color: '#06B6D4',
    bg: '#CFFAFE'
  },
  {
    role: 'DOCTOR',
    name: 'Dr. Ananya Sharma',
    identifier: 'dr.ananya@medmarg.com',
    title: 'Doctor (OPD Clinic)',
    org: 'MBBS, MD - Diabetologist & Physician',
    icon: Stethoscope,
    color: '#8B5CF6',
    bg: '#EDE9FE'
  },
  {
    role: 'PHARMACY',
    name: 'MedPlus Partner Chemist',
    identifier: 'chemist@medplus.com',
    title: 'Pharmacy Partner',
    org: 'Generic & Branded Dispenser',
    icon: Pill,
    color: '#10B981',
    bg: '#D1FAE5'
  },
  {
    role: 'ADMIN',
    name: 'MedMarg Super Admin',
    identifier: 'admin@medmarg.com',
    title: 'MedMarg Admin',
    org: 'Platform Governance & Lab Audits',
    icon: ShieldCheck,
    color: '#EF4444',
    bg: '#FEE2E2'
  }
];

export default function LoginPage({ onLoginSuccess }) {
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('IDENTIFIER'); // 'IDENTIFIER' | 'OTP'
  const [detectedUser, setDetectedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auto-detect user type upon entry
  const handleProceedToOtp = (e) => {
    e.preventDefault();
    if (!identifier) return;

    setLoading(true);
    setTimeout(() => {
      // Lookup if matches demo or defaults to Patient
      const match = DEMO_ACCOUNTS.find(
        (a) => a.identifier.toLowerCase() === identifier.trim().toLowerCase()
      ) || {
        role: 'PATIENT',
        name: 'Patient User',
        identifier: identifier,
        title: 'Patient (Customer)',
        org: 'Standard Patient Profile',
        color: '#006B70'
      };

      setDetectedUser(match);
      setStep('OTP');
      setLoading(false);
    }, 400);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLoginSuccess(detectedUser);
      setLoading(false);
    }, 400);
  };

  const handleQuickDemoLogin = (demoAccount) => {
    onLoginSuccess(demoAccount);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC' }}>
      {/* Header */}
      <header style={{ padding: '0.85rem 2rem', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={onBackToHome}>
          <img 
            src="/logo.png" 
            alt="MedMarg" 
            style={{ height: '40px', objectFit: 'contain' }} 
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Hospital / Lab Partner?</span>
          <button 
            onClick={() => handleQuickDemoLogin(DEMO_ACCOUNTS[1])}
            style={{ padding: '0.4rem 0.8rem', border: '1px solid #006B70', borderRadius: '8px', color: '#006B70', backgroundColor: '#FFF', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}
          >
            Partner Portal
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '1000px', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '2rem', backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 40px -15px rgba(0, 107, 112, 0.07)' }}>
          
          {/* Left Column: Universal Login Form */}
          <div style={{ padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', backgroundColor: '#E0F2F1', color: '#006B70', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                <Sparkles size={14} /> Universal Single Sign-In
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0F172A', lineHeight: '1.2' }}>
                Welcome to MedMarg
              </h2>
              <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '0.4rem' }}>
                One unified portal for Patients, Diagnostic Labs, Scan Centers, Doctors & Pharmacies.
              </p>
            </div>

            {step === 'IDENTIFIER' ? (
              <form onSubmit={handleProceedToOtp}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>
                    Mobile Number / Email / ABHA ID
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="e.g. +91 9876543210 or your@email.com"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s' }}
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.25rem', display: 'block' }}>
                    System automatically detects your user type and loads your dedicated dashboard.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading || !identifier}
                  style={{ width: '100%', padding: '0.9rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Detecting Profile...' : 'Continue with OTP'} <ArrowRight size={18} />
                </button>

                {/* Social Login Button */}
                <div style={{ position: 'relative', textAlign: 'center', margin: '1.5rem 0' }}>
                  <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: '#E2E8F0' }}></div>
                  <span style={{ position: 'relative', backgroundColor: '#FFF', padding: '0 0.75rem', fontSize: '0.8rem', color: '#94A3B8' }}>OR</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin(DEMO_ACCOUNTS[0])}
                  style={{ width: '100%', padding: '0.8rem', backgroundColor: '#FFF', color: '#334155', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  Continue with Google
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#006B70' }}>USER TYPE DETECTED</span>
                    <button type="button" onClick={() => setStep('IDENTIFIER')} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.75rem', textDecoration: 'underline', cursor: 'pointer' }}>Change</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <CheckCircle2 size={20} color="#10B981" />
                    <div>
                      <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '0.95rem' }}>{detectedUser?.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{detectedUser?.title} ({detectedUser?.org})</div>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>
                    Enter 6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '1.25rem', letterSpacing: '0.3em', textAlign: 'center', outline: 'none' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '0.4rem', display: 'block' }}>
                    Demo Mode: Enter any 6 digits (e.g. 123456)
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length < 4}
                  style={{ width: '100%', padding: '0.9rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                >
                  {loading ? 'Entering Dashboard...' : 'Verify & Launch Dashboard'}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Quick Role Switcher Showcase */}
          <div style={{ backgroundColor: '#F1F5F9', padding: '2.5rem', borderLeft: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Instant Role Previews
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0F172A', marginTop: '0.2rem' }}>
                Explore Specific Dashboards
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', maxHeight: '420px', paddingRight: '0.25rem' }}>
              {DEMO_ACCOUNTS.map((account) => {
                const IconComponent = account.icon;
                return (
                  <div
                    key={account.role}
                    onClick={() => handleQuickDemoLogin(account)}
                    style={{ backgroundColor: '#FFFFFF', padding: '0.9rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.85rem', transition: 'all 0.15s ease' }}
                    className="card-hover"
                  >
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: account.bg, color: account.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconComponent size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0F172A' }}>{account.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{account.org}</div>
                    </div>
                    <ArrowRight size={16} color="#94A3B8" />
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer style={{ padding: '1rem 2rem', textAlign: 'center', fontSize: '0.8rem', color: '#94A3B8', borderTop: '1px solid #E2E8F0', backgroundColor: '#FFF' }}>
        © 2026 MedMarg Healthcare Platform (https://www.medmarg.com/). All rights reserved. NABL, CAP & ABHA Certified.
      </footer>
    </div>
  );
}
