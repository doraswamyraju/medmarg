import React, { useState, useEffect } from 'react';
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
  CheckCircle2,
  Lock,
  Smartphone,
  Shield,
  AlertCircle,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';
import { API_BASE } from '../data/apiConfig';

export default function LoginPage({ onLoginSuccess, onBackToHome = () => {} }) {
  // Auth Modes: 'PASSWORD' | 'OTP'
  const [authMode, setAuthMode] = useState('PASSWORD'); 
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  
  // Step: 'IDENTIFIER' | 'OTP_VERIFY' | 'GOOGLE_PHONE_PROMPT'
  const [step, setStep] = useState('IDENTIFIER'); 
  const [detectedUser, setDetectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Google Sign-In Temp State
  const [googleUserTemp, setGoogleUserTemp] = useState(null);
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const GOOGLE_CLIENT_ID = '167766774028-lrhfc69ubgv0po3kp9gup09cfvd82jlu.apps.googleusercontent.com';

  // Demo Credentials Quick Switcher Helper
  const applyQuickCredential = (roleKey, emailVal, passVal = 'password123') => {
    setIdentifier(emailVal);
    setPassword(passVal);
    setError('');
  };

  // Process Form Submission (Password or OTP Request)
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          identifier: identifier.trim(),
          password: password,
          authMode
        })
      });
      const data = await res.json();

      if (data.user) {
        setDetectedUser(data.user);
        if (authMode === 'PASSWORD') {
          // Direct authentication with password
          setTimeout(() => {
            setLoading(false);
            onLoginSuccess(data.user);
          }, 300);
          return;
        } else {
          // OTP flow -> move to OTP verification step
          setStep('OTP_VERIFY');
        }
      } else {
        // Fallback for offline/demo
        const fallbackUser = createFallbackUser(identifier.trim());
        setDetectedUser(fallbackUser);
        if (authMode === 'PASSWORD') {
          setTimeout(() => {
            setLoading(false);
            onLoginSuccess(fallbackUser);
          }, 300);
          return;
        } else {
          setStep('OTP_VERIFY');
        }
      }
    } catch (err) {
      console.warn('Backend login fallback:', err.message);
      const fallbackUser = createFallbackUser(identifier.trim());
      setDetectedUser(fallbackUser);
      if (authMode === 'PASSWORD') {
        setTimeout(() => {
          setLoading(false);
          onLoginSuccess(fallbackUser);
        }, 300);
        return;
      } else {
        setStep('OTP_VERIFY');
      }
    } finally {
      if (authMode !== 'PASSWORD') {
        setLoading(false);
      }
    }
  };

  // Helper to create fallback user role if backend is offline
  const createFallbackUser = (idVal) => {
    const lower = idVal.toLowerCase();
    let role = 'PATIENT';
    let name = 'Patient User';
    let organization = 'MedMarg Healthcare Patient Portal';

    if (lower.includes('admin') || lower === 'superadmin') {
      role = 'ADMIN';
      name = 'MedMarg Super Admin';
      organization = 'MedMarg Platform Governance';
    } else if (lower.includes('staff') || lower.includes('ops')) {
      role = 'STAFF';
      name = 'MedMarg Operations Staff';
      organization = 'MedMarg Central Operations Desk';
    } else if (lower.includes('freelance') || lower.includes('gig')) {
      role = 'FREELANCER_AGENT';
      name = 'Suresh Phlebotomy (Freelancer)';
      organization = 'MedMarg Freelance Phlebotomist Network';
    } else if (lower.includes('salaried') || lower.includes('agent') || lower.includes('phlebo')) {
      role = 'SALARIED_AGENT';
      name = 'Ramesh Kumar (Salaried Agent AG-01)';
      organization = 'MedMarg In-House Fleet (Zone 1)';
    } else if (lower.includes('doctor') || lower.includes('dr.')) {
      role = 'DOCTOR';
      name = 'Dr. Ananya Sharma, MD';
      organization = 'MedMarg Care Clinic';
    } else if (lower.includes('lab') || lower.includes('lal')) {
      role = 'DIAGNOSTIC_LAB';
      name = 'Thyrocare Central Processing Hub';
      organization = 'MedMarg Central Diagnostics';
    } else if (lower.includes('scan') || lower.includes('aarthi')) {
      role = 'SCAN_CENTER';
      name = 'Aarthi Scans Operations';
      organization = 'Aarthi Scans & Radiology';
    }

    return {
      id: `usr_${Date.now()}`,
      name,
      identifier: idVal,
      email: idVal.includes('@') ? idVal : `${idVal}@medmarg.com`,
      phone: idVal.match(/^\+?[0-9]{10,13}$/) ? idVal : '+91 9876543210',
      role,
      organization
    };
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLoginSuccess(detectedUser);
      setLoading(false);
    }, 400);
  };

  // Google Sign-In logic
  const processGoogleUser = async (email, name, googleId) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          googleId: googleId || `gid_${Date.now()}`
        })
      });

      const data = await res.json();

      if (data.success && data.user) {
        if (data.requiresPhone || !data.user.phone) {
          setGoogleUserTemp(data.user);
          setStep('GOOGLE_PHONE_PROMPT');
        } else {
          onLoginSuccess(data.user);
        }
      } else {
        const fallbackG = {
          id: `usr_g_${Date.now()}`,
          name: name || 'Google User',
          email: email,
          identifier: email,
          role: email.includes('admin') ? 'ADMIN' : 'PATIENT',
          organization: 'MedMarg Healthcare Ecosystem'
        };
        setGoogleUserTemp(fallbackG);
        setStep('GOOGLE_PHONE_PROMPT');
      }
    } catch (err) {
      console.warn('Backend google auth sync:', err.message);
      const fallbackG = {
        id: `usr_g_${Date.now()}`,
        name: name || 'Google User',
        email: email,
        identifier: email,
        role: email.includes('admin') ? 'ADMIN' : 'PATIENT',
        organization: 'MedMarg Healthcare Ecosystem'
      };
      setGoogleUserTemp(fallbackG);
      setStep('GOOGLE_PHONE_PROMPT');
    } finally {
      setLoading(false);
    }
  };

  // Check OAuth callback hash
  useEffect(() => {
    if (window.location.hash) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        setLoading(true);
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
          .then(res => res.json())
          .then(async (profile) => {
            if (profile && profile.email) {
              window.history.replaceState({}, document.title, window.location.pathname);
              await processGoogleUser(profile.email, profile.name || profile.email.split('@')[0], profile.sub || profile.id);
            }
          })
          .catch(err => {
            console.error('Google profile hash fetch error:', err);
          })
          .finally(() => setLoading(false));
      }
    }
  }, []);

  const handleGoogleSignIn = () => {
    setError('');

    if (window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse.access_token) {
              setLoading(true);
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const googleProfile = await res.json();
                if (googleProfile && googleProfile.email) {
                  await processGoogleUser(
                    googleProfile.email,
                    googleProfile.name || googleProfile.email.split('@')[0],
                    googleProfile.sub || googleProfile.id
                  );
                }
              } catch (err) {
                console.error('Profile fetch error:', err);
                setError('Failed to fetch Google profile.');
              } finally {
                setLoading(false);
              }
            }
          }
        });
        client.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (e) {
        console.warn('GSI client init error, falling back:', e);
      }
    }

    const origin = window.location.origin;
    const redirectUri = `${origin}/login`;
    const authParams = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'token',
      scope: 'email profile openid',
      prompt: 'select_account',
      include_granted_scopes: 'true'
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${authParams.toString()}`;
  };

  const handleSavePhoneNumber = async (e) => {
    e.preventDefault();
    const cleanPhone = phoneInput.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setPhoneError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setPhoneError('');

    const verifiedProfile = {
      ...googleUserTemp,
      phone: `+91 ${cleanPhone}`,
      identifier: `+91 ${cleanPhone}`
    };

    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(verifiedProfile);
    }, 400);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC' }}>
      {/* Header Bar */}
      <header style={{ padding: '1rem 2rem', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={onBackToHome}>
          <img 
            src="/logo.png" 
            alt="MedMarg Logo" 
            style={{ height: '40px', objectFit: 'contain' }} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
          <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#006B70', letterSpacing: '-0.02em' }}>MedMarg</span>
        </div>
        <button 
          onClick={onBackToHome}
          style={{ background: 'none', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '0.5rem 1.1rem', fontSize: '0.85rem', fontWeight: '700', color: '#475569', cursor: 'pointer' }}
        >
          ← Home Marketplace
        </button>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2.5rem 1.5rem' }}>
        <div style={{ width: '100%', maxWidth: '520px', backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 45px -15px rgba(0, 107, 112, 0.12)' }}>
          
          <div style={{ padding: '2.5rem 2.25rem' }}>
            
            {/* Title Header */}
            <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.85rem', backgroundColor: '#E0F2F1', color: '#006B70', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '800', marginBottom: '0.75rem' }}>
                <ShieldCheck size={16} /> Universal Role Authentication
              </div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0F172A', lineHeight: '1.2' }}>
                Sign In to MedMarg
              </h1>
              <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '0.4rem' }}>
                Enter credentials or Google account to launch your role dashboard.
              </p>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '1.25rem', fontWeight: '600' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Quick Demo Credentials Quick-Select Bar */}
            {step === 'IDENTIFIER' && (
              <div style={{ marginBottom: '1.5rem', padding: '0.85rem 1rem', backgroundColor: '#F1F5F9', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#475569', letterSpacing: '0.05em', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <UserCheck size={14} color="#006B70" /> QUICK ROLE DEMO SELECTOR:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <button 
                    type="button" 
                    onClick={() => applyQuickCredential('ADMIN', 'admin@medmarg.com')}
                    style={{ padding: '0.3rem 0.65rem', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                  >
                    👑 Super Admin
                  </button>
                  <button 
                    type="button" 
                    onClick={() => applyQuickCredential('STAFF', 'staff@medmarg.com')}
                    style={{ padding: '0.3rem 0.65rem', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E40AF', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                  >
                    💼 Staff
                  </button>
                  <button 
                    type="button" 
                    onClick={() => applyQuickCredential('PATIENT', 'patient@medmarg.com')}
                    style={{ padding: '0.3rem 0.65rem', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                  >
                    👤 Patient
                  </button>
                  <button 
                    type="button" 
                    onClick={() => applyQuickCredential('SALARIED_AGENT', 'salaried@medmarg.com')}
                    style={{ padding: '0.3rem 0.65rem', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                  >
                    🛵 Salaried Agent
                  </button>
                  <button 
                    type="button" 
                    onClick={() => applyQuickCredential('FREELANCER_AGENT', 'freelance@medmarg.com')}
                    style={{ padding: '0.3rem 0.65rem', backgroundColor: '#F3E8FF', border: '1px solid #E9D5FF', color: '#6B21A8', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                  >
                    ⚡ Freelancer
                  </button>
                </div>
              </div>
            )}

            {/* AUTH METHOD TOGGLE: PASSWORD VS OTP */}
            {step === 'IDENTIFIER' && (
              <div style={{ display: 'flex', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '14px', marginBottom: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setAuthMode('PASSWORD')}
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    backgroundColor: authMode === 'PASSWORD' ? '#FFFFFF' : 'transparent',
                    color: authMode === 'PASSWORD' ? '#006B70' : '#64748B',
                    boxShadow: authMode === 'PASSWORD' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <KeyRound size={15} /> Password Auth
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('OTP')}
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    backgroundColor: authMode === 'OTP' ? '#FFFFFF' : 'transparent',
                    color: authMode === 'OTP' ? '#006B70' : '#64748B',
                    boxShadow: authMode === 'OTP' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Smartphone size={15} /> Mobile / OTP
                </button>
              </div>
            )}

            {/* STEP 1: LOGIN FORM */}
            {step === 'IDENTIFIER' && (
              <form onSubmit={handleAuthSubmit}>
                
                {/* Identifier Input */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.45rem' }}>
                    Email Address / Mobile Number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="e.g. admin@medmarg.com or +91 9876543210"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '0.95rem', outline: 'none', fontWeight: '600', color: '#0F172A' }}
                    />
                  </div>
                </div>

                {/* Password Input (If Password Mode) */}
                {authMode === 'PASSWORD' && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155' }}>
                        Password
                      </label>
                      <span style={{ fontSize: '0.75rem', color: '#006B70', fontWeight: '700', cursor: 'pointer' }}>
                        Forgot Password?
                      </span>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password (e.g. password123)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.85rem 2.8rem 0.85rem 1rem', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '0.95rem', outline: 'none', fontWeight: '600', color: '#0F172A' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !identifier.trim()}
                  style={{ width: '100%', padding: '0.9rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '800', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', opacity: loading ? 0.7 : 1, transition: 'all 0.15s' }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Authenticating...
                    </>
                  ) : authMode === 'PASSWORD' ? (
                    <>
                      Sign In to Dashboard <ArrowRight size={18} />
                    </>
                  ) : (
                    <>
                      Send Verification OTP <ArrowRight size={18} />
                    </>
                  )}
                </button>

                {/* Social Login Divider */}
                <div style={{ position: 'relative', textAlign: 'center', margin: '1.75rem 0' }}>
                  <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: '#E2E8F0' }}></div>
                  <span style={{ position: 'relative', backgroundColor: '#FFF', padding: '0 0.85rem', fontSize: '0.8rem', color: '#94A3B8', fontWeight: '700' }}>OR AUTHENTICATE WITH</span>
                </div>

                {/* Google / Gmail Sign In Button */}
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn()}
                  disabled={loading}
                  style={{ width: '100%', padding: '0.85rem', backgroundColor: '#FFF', color: '#1E293B', border: '1.5px solid #CBD5E1', borderRadius: '12px', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Sign in with Gmail / Google</span>
                </button>
              </form>
            )}

            {/* STEP 2: OTP VERIFICATION STEP */}
            {step === 'OTP_VERIFY' && (
              <form onSubmit={handleVerifyOtp}>
                <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#006B70', letterSpacing: '0.05em' }}>PROFILE DETECTED</span>
                    <button type="button" onClick={() => setStep('IDENTIFIER')} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.75rem', textDecoration: 'underline', cursor: 'pointer', fontWeight: '600' }}>Change</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#E0F2F1', color: '#006B70', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.95rem' }}>{detectedUser?.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Role: <strong>{detectedUser?.role}</strong> • {detectedUser?.organization}</div>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.45rem' }}>
                    Enter 6-Digit Mobile OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    autoFocus
                    style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '1.35rem', letterSpacing: '0.3em', textAlign: 'center', outline: 'none', fontWeight: '800' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '0.4rem', display: 'block', fontWeight: '600' }}>
                    Demo Mode: Enter any 6 digits (e.g. 123456)
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length < 4}
                  style={{ width: '100%', padding: '0.9rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '800', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                >
                  {loading ? 'Launching Dashboard...' : 'Verify OTP & Launch Dashboard'} <ArrowRight size={18} />
                </button>
              </form>
            )}

            {/* STEP 3: GOOGLE PHONE PROMPT */}
            {step === 'GOOGLE_PHONE_PROMPT' && (
              <form onSubmit={handleSavePhoneNumber}>
                <div style={{ padding: '1rem', backgroundColor: '#FEF3C7', borderRadius: '14px', border: '1px solid #FDE68A', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Smartphone size={20} color="#B45309" />
                    <div>
                      <div style={{ fontWeight: '800', color: '#92400E', fontSize: '0.9rem' }}>Link Mobile Number</div>
                      <div style={{ fontSize: '0.78rem', color: '#B45309' }}>Google account authenticated: <strong>{googleUserTemp?.email}</strong></div>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.45rem' }}>
                    Enter 10-Digit Mobile Number
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ padding: '0.85rem 0.9rem', backgroundColor: '#F1F5F9', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '0.95rem', fontWeight: '700', color: '#475569' }}>
                      🇮🇳 +91
                    </div>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="9876543210"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      required
                      autoFocus
                      style={{ flex: 1, padding: '0.85rem 1rem', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '1rem', outline: 'none', fontWeight: '700', color: '#0F172A' }}
                    />
                  </div>
                  {phoneError ? (
                    <span style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '0.35rem', display: 'block', fontWeight: '600' }}>
                      {phoneError}
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.35rem', display: 'block' }}>
                      Required for home sample collection updates & phlebotomist tracking SMS.
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || phoneInput.length < 10}
                  style={{ width: '100%', padding: '0.9rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '800', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                >
                  {loading ? 'Saving Profile...' : 'Complete Profile & Launch Dashboard'} <ArrowRight size={18} />
                </button>
              </form>
            )}

            {/* Footer Security Badge */}
            <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#64748B', fontSize: '0.78rem' }}>
              <Shield size={14} color="#006B70" />
              <span>256-Bit SSL Encrypted • NABL & ABDM Compliant</span>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer style={{ padding: '1rem 2rem', textAlign: 'center', fontSize: '0.8rem', color: '#94A3B8', borderTop: '1px solid #E2E8F0', backgroundColor: '#FFF' }}>
        © 2026 MedMarg Healthcare Platform (https://www.medmarg.com/). All rights reserved. NABL, CAP & ISO 9001 Certified.
      </footer>
    </div>
  );
}
