import React, { useState } from 'react';
import { 
  Briefcase, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Truck, 
  Award, 
  DollarSign, 
  Clock, 
  Lock, 
  CreditCard,
  FileText,
  AlertCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { API_BASE, safeJson } from '../data/apiConfig';

export default function FreelanceSignupPage({ onNavigateLogin, onNavigateHome }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    city: 'Tirupati, AP',
    experience: '2-4 Years',
    qualification: 'DMLT (Diploma in Medical Lab Technology)',
    vehicleType: 'Two Wheeler (Motorcycle / Scooter)',
    hasColdBag: true,
    aadhaarNo: '',
    panNo: '',
    agreeTerms: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.replace(/[^0-9]/g, '').length < 10) {
      setError('Please provide a valid 10-digit mobile number.');
      return;
    }
    if (!formData.agreeTerms) {
      setError('You must accept the MedMarg Partner Code of Conduct and Service Terms.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/signup-freelancer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await safeJson(res);

      if (res.ok && data && data.success) {
        setSuccessData(data);
      } else {
        setError(data?.error || 'Registration could not be completed. Please try again.');
      }
    } catch (err) {
      setError('Network connection error. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Top Header */}
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '1rem 2rem', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={onNavigateHome}>
            <img src="/logo.png" alt="MedMarg" style={{ height: '36px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
            <span style={{ fontSize: '0.82rem', fontWeight: '800', backgroundColor: '#F0FDFA', color: '#006B70', padding: '0.2rem 0.6rem', borderRadius: '16px', border: '1px solid #CCFBF1' }}>
              Gig & Freelance Phlebotomy Partner Portal
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={onNavigateHome}
              style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <ArrowLeft size={16} /> Back to Home
            </button>
            <button
              onClick={onNavigateLogin}
              style={{ padding: '0.55rem 1.1rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer' }}
            >
              Existing Agent? Sign In →
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1160px', margin: '2.5rem auto', padding: '0 1.5rem 4rem' }}>
        
        {successData ? (
          /* Success Screen */
          <div style={{ maxWidth: '640px', margin: '3rem auto', backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '3rem 2.5rem', border: '1px solid #E2E8F0', boxShadow: '0 20px 40px rgba(0,0,0,0.06)', textAlign: 'center' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 8px 20px rgba(22,163,74,0.2)' }}>
              <CheckCircle size={40} />
            </div>

            <span style={{ fontSize: '0.78rem', fontWeight: '900', color: '#006B70', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              ONBOARDING REGISTRATION COMPLETE
            </span>
            <h1 style={{ fontSize: '1.85rem', fontWeight: '900', color: '#0F172A', margin: '0.4rem 0 1rem' }}>
              Welcome to the MedMarg Fleet!
            </h1>
            <p style={{ color: '#64748B', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '2rem' }}>
              Congratulations <strong>{successData.freelancer?.name}</strong>! Your account has been provisioned with Phlebotomist Partner ID <strong>{successData.freelancer?.id}</strong>.
            </p>

            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', padding: '1.25rem', border: '1px solid #E2E8F0', textAlign: 'left', marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Your Login Credentials:
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.88rem' }}>
                <span style={{ color: '#64748B' }}>Identifier:</span>
                <strong style={{ color: '#0F172A' }}>{successData.freelancer?.phone || successData.freelancer?.email}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.88rem' }}>
                <span style={{ color: '#64748B' }}>Initial Password:</span>
                <strong style={{ color: '#006B70' }}>{formData.password || 'MedMarg@2026'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.88rem', borderTop: '1px dashed #CBD5E1', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                <span style={{ color: '#64748B' }}>Opening Wallet Balance:</span>
                <strong style={{ color: '#16A34A' }}>₹{successData.freelancer?.walletBalance || 2000} (Instant Credit)</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={onNavigateLogin}
                style={{ padding: '0.9rem 2rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontSize: '0.95rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(0,107,112,0.3)' }}
              >
                Sign In to Phlebotomist Dashboard <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ) : (
          /* Signup Form Grid */
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.6fr', gap: '3rem', alignItems: 'start' }}>
            
            {/* Left Column: Why Join MedMarg */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', backgroundColor: '#E0F2F1', color: '#006B70', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '900', marginBottom: '1rem' }}>
                <Sparkles size={14} /> EARN UP TO ₹35,000 / MONTH
              </div>

              <h1 style={{ fontSize: '2.25rem', fontWeight: '900', color: '#0F172A', lineHeight: '1.2', marginBottom: '1rem' }}>
                Join India's Fastest Growing Diagnostic Home Collection Fleet
              </h1>

              <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                MedMarg enables certified lab technicians (DMLT/BSc MLT) to earn top-tier pay per blood sample pickup with 100% digital route navigation and weekly payouts.
              </p>

              {/* Benefits Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#F0FDFA', color: '#006B70', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <DollarSign size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0F172A' }}>₹250 - ₹450 per Patient Visit</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
                      Transparent per-pickup incentives + distance allowances + 100% customer tips credited to your in-app wallet.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0F172A' }}>Total Working Hour Flexibility</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
                      Accept open broadcast orders that fit your schedule. Toggle online/offline mode anytime from your mobile app.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0F172A' }}>Central Consumables & Lab Kits Backing</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
                      Never worry about tubes or needles. MedMarg Central Store provides BD vacutainers, alcohol prep swabs, and 4°C cold boxes.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Registration Card */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '2.5rem', border: '1px solid #E2E8F0', boxShadow: '0 12px 36px rgba(0,0,0,0.05)' }}>
              
              <div style={{ marginBottom: '1.75rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                  Freelancer Registration Form
                </h2>
                <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0.35rem 0 0 0' }}>
                  Takes only 2 minutes. Instant account creation with verified KYC workflow.
                </p>
              </div>

              {error && (
                <div style={{ padding: '0.85rem 1rem', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px', color: '#DC2626', fontSize: '0.85rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                
                {/* Full Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '0.4rem' }}>
                    Full Legal Name (as per Aadhaar / Certificate) *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Suresh Kumar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.6rem', border: '1.5px solid #CBD5E1', borderRadius: '10px', fontSize: '0.9rem', color: '#0F172A', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Mobile Phone & Email */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '0.4rem' }}>
                      Mobile Number (for OTP & Job Alerts) *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="tel"
                        required
                        placeholder="10-digit number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.6rem', border: '1.5px solid #CBD5E1', borderRadius: '10px', fontSize: '0.9rem', color: '#0F172A', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '0.4rem' }}>
                      Email Address (Optional)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="email"
                        placeholder="phlebo@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.6rem', border: '1.5px solid #CBD5E1', borderRadius: '10px', fontSize: '0.9rem', color: '#0F172A', outline: 'none' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Password & City */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '0.4rem' }}>
                      Choose Account Password *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="password"
                        required
                        placeholder="Min 6 characters"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.6rem', border: '1.5px solid #CBD5E1', borderRadius: '10px', fontSize: '0.9rem', color: '#0F172A', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '0.4rem' }}>
                      Base Operating City *
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #CBD5E1', borderRadius: '10px', fontSize: '0.9rem', color: '#0F172A', outline: 'none', backgroundColor: '#FFF' }}
                    >
                      <option value="Tirupati, AP">Tirupati & Suburban, AP</option>
                      <option value="Chittoor, AP">Chittoor Town, AP</option>
                      <option value="Renigunta, AP">Renigunta / Chandragiri, AP</option>
                      <option value="Nellore, AP">Nellore, AP</option>
                      <option value="Bangalore, KA">Bangalore South / East, KA</option>
                    </select>
                  </div>
                </div>

                {/* Technical Qualifications */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '0.4rem' }}>
                      Medical Qualification *
                    </label>
                    <select
                      value={formData.qualification}
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #CBD5E1', borderRadius: '10px', fontSize: '0.88rem', color: '#0F172A', outline: 'none', backgroundColor: '#FFF' }}
                    >
                      <option value="DMLT (Diploma in Medical Lab Technology)">DMLT (Diploma in Medical Lab Tech)</option>
                      <option value="B.Sc MLT (Medical Laboratory Technology)">B.Sc MLT (Graduate)</option>
                      <option value="General Nursing / GNM">General Nursing / GNM</option>
                      <option value="Experienced Phlebotomy Certification">Certified Phlebotomist (Hospital / Lab)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '0.4rem' }}>
                      Venipuncture Experience
                    </label>
                    <select
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #CBD5E1', borderRadius: '10px', fontSize: '0.88rem', color: '#0F172A', outline: 'none', backgroundColor: '#FFF' }}
                    >
                      <option value="1-2 Years">1-2 Years (Junior)</option>
                      <option value="2-4 Years">2-4 Years (Experienced)</option>
                      <option value="5+ Years">5+ Years (Senior Phlebo)</option>
                    </select>
                  </div>
                </div>

                {/* Vehicle & Equipment */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '0.4rem' }}>
                      Mode of Conveyance *
                    </label>
                    <select
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #CBD5E1', borderRadius: '10px', fontSize: '0.88rem', color: '#0F172A', outline: 'none', backgroundColor: '#FFF' }}
                    >
                      <option value="Two Wheeler (Motorcycle / Scooter)">Two Wheeler (Bike / Scooter)</option>
                      <option value="Electric Scooter / EV">Electric Vehicle (EV)</option>
                      <option value="Car / Four Wheeler">Four Wheeler</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '0.4rem' }}>
                      Cold Storage Gear
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', height: '42px', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        id="hasColdBag"
                        checked={formData.hasColdBag}
                        onChange={(e) => setFormData({ ...formData, hasColdBag: e.target.checked })}
                        style={{ width: '18px', height: '18px', accentColor: '#006B70' }}
                      />
                      <label htmlFor="hasColdBag" style={{ fontSize: '0.82rem', color: '#334155', fontWeight: '700', cursor: 'pointer' }}>
                        I have an insulated sample box with gel packs
                      </label>
                    </div>
                  </div>
                </div>

                {/* Statutory IDs (Aadhaar / PAN) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '0.4rem' }}>
                      Aadhaar Number (Last 4 Digits or Full)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 5421 9876 1234"
                      value={formData.aadhaarNo}
                      onChange={(e) => setFormData({ ...formData, aadhaarNo: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #CBD5E1', borderRadius: '10px', fontSize: '0.9rem', color: '#0F172A', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '0.4rem' }}>
                      PAN Card Number (for Bank Payouts)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ABCDE1234F"
                      value={formData.panNo}
                      onChange={(e) => setFormData({ ...formData, panNo: e.target.value.toUpperCase() })}
                      style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #CBD5E1', borderRadius: '10px', fontSize: '0.9rem', color: '#0F172A', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Terms agreement */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginTop: '0.35rem' }}>
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#006B70', marginTop: '0.15rem' }}
                  />
                  <label htmlFor="agreeTerms" style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: '1.4', cursor: 'pointer' }}>
                    I certify that my lab technical certifications are genuine and agree to abide by MedMarg Cold-Chain Pre-Analytical Guidelines, Patient Privacy Standards, and Payout Terms.
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '0.95rem',
                    backgroundColor: '#006B70',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: '900',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 14px rgba(0,107,112,0.25)',
                    marginTop: '0.5rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {loading ? 'Submitting & Provisioning Agent Account...' : (
                    <>
                      Register as Freelance Phlebotomist <ArrowRight size={18} />
                    </>
                  )}
                </button>

              </form>
            </div>

          </div>
        )}

      </main>

      {/* Footer Note */}
      <footer style={{ padding: '1.5rem 2rem', textAlign: 'center', fontSize: '0.8rem', color: '#94A3B8', borderTop: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
        © 2026 MedMarg Phlebotomy Operations Network. All phlebotomists are verified under NABL Pre-Analytical ISO 15189 Standards.
      </footer>
    </div>
  );
}
