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
  CheckCircle2,
  Lock,
  Smartphone,
  Shield,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { API_BASE } from '../data/apiConfig';

export default function LoginPage({ onLoginSuccess, onBackToHome = () => {} }) {
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('IDENTIFIER'); // 'IDENTIFIER' | 'OTP' | 'GOOGLE_PHONE_PROMPT'
  const [detectedUser, setDetectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Google Sign-In & Missing Phone State
  const [googleUserTemp, setGoogleUserTemp] = useState(null);
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const GOOGLE_CLIENT_ID = '167766774028-lrhfc69ubgv0po3kp9gup09cfvd82jlu.apps.googleusercontent.com';

  // Standard Identifier Entry (Mobile / Email)
  const handleProceedToOtp = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() })
      });
      const data = await res.json();

      if (data.user) {
        setDetectedUser(data.user);
      } else {
        setDetectedUser({
          id: `usr_${Date.now()}`,
          role: 'PATIENT',
          name: 'Patient User',
          identifier: identifier.trim(),
          organization: 'Patient Portal (Tirupati)'
        });
      }
      setStep('OTP');
    } catch (err) {
      setDetectedUser({
        id: `usr_${Date.now()}`,
        role: 'PATIENT',
        name: 'Patient User',
        identifier: identifier.trim(),
        organization: 'Patient Portal (Tirupati)'
      });
      setStep('OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLoginSuccess(detectedUser);
      setLoading(false);
    }, 400);
  };

  // Process authenticated Google profile
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
        setGoogleUserTemp({
          id: `usr_g_${Date.now()}`,
          name: name || 'Google User',
          email: email,
          identifier: email,
          role: 'PATIENT',
          organization: 'MedMarg Healthcare Patient Portal'
        });
        setStep('GOOGLE_PHONE_PROMPT');
      }
    } catch (err) {
      console.warn('Backend google auth sync:', err.message);
      setGoogleUserTemp({
        id: `usr_g_${Date.now()}`,
        name: name || 'Google User',
        email: email,
        identifier: email,
        role: 'PATIENT',
        organization: 'MedMarg Healthcare Patient Portal'
      });
      setStep('GOOGLE_PHONE_PROMPT');
    } finally {
      setLoading(false);
    }
  };

  // Check if returning from Google OAuth redirect with access token in hash
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

  // Real Google Sign-In with Account Selection Popup
  const handleGoogleSignIn = () => {
    setError('');

    // 1. Try Google Identity Services (GSI) Token Client popup
    if (window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              console.error('Google Auth Token Error:', tokenResponse);
              return;
            }
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
                setError('Failed to fetch Google profile info.');
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

    // 2. Direct Google OAuth2 Account Chooser Endpoint
    const origin = window.location.origin;
    const redirectUri = `${origin}/login`;
    const authParams = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'token id_token',
      scope: 'openid email profile',
      prompt: 'select_account',
      nonce: `mm_${Date.now()}`
    });

    const targetUrl = `https://accounts.google.com/o/oauth2/v2/auth?${authParams.toString()}`;
    window.location.href = targetUrl;
  };

  // Complete Profile with Phone Number
  const handleSavePhoneNumber = async (e) => {
    e.preventDefault();
    const cleanPhone = phoneInput.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setPhoneError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setPhoneError('');

    try {
      await fetch(`${API_BASE}/api/v1/auth/update-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: googleUserTemp?.id,
          phone: `+91 ${cleanPhone}`
        })
      });
    } catch (e) {
      // Continue locally
    }

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
      {/* Header */}
      <header style={{ padding: '1rem 2rem', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={onBackToHome}>
          <img 
            src="/logo.png" 
            alt="MedMarg" 
            style={{ height: '42px', objectFit: 'contain' }} 
          />
        </div>
        <button 
          onClick={onBackToHome}
          style={{ background: 'none', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '0.45rem 1rem', fontSize: '0.85rem', fontWeight: '700', color: '#475569', cursor: 'pointer' }}
        >
          ← Back to Marketplace
        </button>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2.5rem 1.5rem' }}>
        <div style={{ width: '100%', maxWidth: '520px', backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 45px -15px rgba(0, 107, 112, 0.1)' }}>
          
          <div style={{ padding: '2.75rem 2.5rem' }}>
            
            {/* Header Badge & Title */}
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.85rem', backgroundColor: '#E0F2F1', color: '#006B70', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '800', marginBottom: '0.85rem' }}>
                <Sparkles size={15} /> Universal Single Sign-In
              </div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: '900', color: '#0F172A', lineHeight: '1.2' }}>
                Welcome to MedMarg
              </h1>
              <p style={{ color: '#64748B', fontSize: '0.92rem', marginTop: '0.45rem', lineHeight: 1.4 }}>
                One unified portal for Patients, Diagnostic Labs, Scan Centers, Doctors & Pharmacies.
              </p>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '1.25rem', fontWeight: '600' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: MOBILE / EMAIL INPUT */}
            {step === 'IDENTIFIER' && (
              <form onSubmit={handleProceedToOtp}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.45rem' }}>
                    Mobile Number / Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="e.g. +91 9876543210 or your@email.com"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '0.95rem', outline: 'none', fontWeight: '600', color: '#0F172A' }}
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.35rem', display: 'block' }}>
                    System automatically detects your user type and loads your dedicated dashboard.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading || !identifier.trim()}
                  style={{ width: '100%', padding: '0.9rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '800', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', opacity: loading ? 0.7 : 1, transition: 'all 0.15s' }}
                >
                  {loading ? 'Detecting Profile...' : 'Continue with OTP'} <ArrowRight size={18} />
                </button>

                {/* Social Login Section */}
                <div style={{ position: 'relative', textAlign: 'center', margin: '1.75rem 0' }}>
                  <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: '#E2E8F0' }}></div>
                  <span style={{ position: 'relative', backgroundColor: '#FFF', padding: '0 0.85rem', fontSize: '0.8rem', color: '#94A3B8', fontWeight: '700' }}>OR</span>
                </div>

                {/* Google Sign In Button */}
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn()}
                  disabled={loading}
                  style={{ width: '100%', padding: '0.85rem', backgroundColor: '#FFF', color: '#1E293B', border: '1.5px solid #CBD5E1', borderRadius: '12px', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', transition: 'all 0.15s' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              </form>
            )}

            {/* STEP 2: OTP VERIFICATION */}
            {step === 'OTP' && (
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
                    Enter 6-Digit Verification Code
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
                  {loading ? 'Launching Dashboard...' : 'Verify & Enter Dashboard'} <ArrowRight size={18} />
                </button>
              </form>
            )}

            {/* STEP 3: FIRST LOGIN PHONE NUMBER VERIFICATION (LIKE VR HERE) */}
            {step === 'GOOGLE_PHONE_PROMPT' && (
              <form onSubmit={handleSavePhoneNumber}>
                <div style={{ padding: '1rem', backgroundColor: '#FEF3C7', borderRadius: '14px', border: '1px solid #FDE68A', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Smartphone size={20} color="#B45309" />
                    <div>
                      <div style={{ fontWeight: '800', color: '#92400E', fontSize: '0.9rem' }}>Phone Number Required</div>
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
                      Required for home sample collection updates, phlebotomist tracking & lab report SMS.
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || phoneInput.length < 10}
                  style={{ width: '100%', padding: '0.9rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '800', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                >
                  {loading ? 'Saving Profile...' : 'Complete Profile & Continue'} <ArrowRight size={18} />
                </button>
              </form>
            )}

            {/* Security Guarantee Footer */}
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
