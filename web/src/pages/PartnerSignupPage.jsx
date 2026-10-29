import React, { useState } from 'react';
import { 
  Building2, 
  Stethoscope, 
  Activity, 
  HeartHandshake, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  Phone, 
  Mail, 
  MapPin, 
  Award, 
  Percent, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Sparkles,
  Truck,
  Clock,
  X
} from 'lucide-react';
import { API_BASE, safeJson } from '../data/apiConfig';

export default function PartnerSignupPage({ onNavigateLogin, onNavigateHome }) {
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'DOCTORS_OPD',
    type: 'Doctor / In-Clinic OPD Practice',
    contactPerson: '',
    phone: '',
    email: '',
    city: 'Tirupati, AP',
    specialty: 'Internal Medicine / Family Physician',
    experience: '8+ Years',
    licenseNumber: '',
    address: '',
    notes: '',
    agreeTerms: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const categories = [
    { id: 'DOCTORS_OPD', label: 'Doctor / In-Clinic OPD', type: 'Doctor / OPD Practice', defaultMargin: '20%' },
    { id: 'DIAGNOSTIC_LABS', label: 'Standalone Diagnostic Lab', type: 'Pathology / Diagnostic Center', defaultMargin: '22%' },
    { id: 'RADIOLOGY_MRI', label: 'Radiology & Scan Center (MRI/CT)', type: 'Radiology / Scan Center', defaultMargin: '18%' },
    { id: 'HEALTH_COACHES', label: 'Health, Diet & Nutrition Coach', type: 'Wellness / Nutrition Consultant', defaultMargin: '15%' },
    { id: 'HOSPITAL_CORPORATE', label: 'Hospital / Corporate Health', type: 'Hospital / Factory Tie-up', defaultMargin: '20%' },
    { id: 'PHARMACY', label: 'Retail Chemist / Pharmacy', type: 'Pharmacy / Retail Dispenser', defaultMargin: '12%' }
  ];

  const handleCategoryChange = (catId) => {
    const selected = categories.find(c => c.id === catId);
    setFormData(prev => ({
      ...prev,
      category: catId,
      type: selected ? selected.type : 'Partner Organization'
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter your Clinic, Hospital or Doctor name.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.replace(/[^0-9]/g, '').length < 10) {
      setError('Please provide a valid 10-digit contact mobile number.');
      return;
    }
    if (!formData.agreeTerms) {
      setError('You must accept the MedMarg Partner Referral & Pre-Registration Terms.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/signup-partner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await safeJson(res);

      if (res.ok && data && data.success) {
        setSuccessData(data);
      } else {
        setError(data?.error || 'Partner registration could not be submitted. Please try again.');
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
            <span style={{ fontSize: '0.82rem', fontWeight: '800', backgroundColor: '#EFF6FF', color: '#1D4ED8', padding: '0.2rem 0.6rem', borderRadius: '16px', border: '1px solid #DBEAFE' }}>
              Healthcare Partner & Doctor Referral Onboarding
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
              onClick={() => {
                if (window.location) window.location.href = '/login';
              }}
              style={{ padding: '0.55rem 1.1rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <span>Partner & Doctor Login</span>
              <span style={{ fontSize: '0.65rem', backgroundColor: '#DCFCE7', color: '#166534', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: '900' }}>LIVE</span>
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
              PRE-REGISTRATION SUBMITTED
            </span>
            <h1 style={{ fontSize: '1.85rem', fontWeight: '900', color: '#0F172A', margin: '0.4rem 0 1rem' }}>
              Welcome to the MedMarg Network!
            </h1>
            <p style={{ color: '#64748B', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '2rem' }}>
              Thank you, <strong>{successData.partner?.name}</strong>! Your application has been logged with Partner Ref ID <strong>{successData.partner?.id}</strong>. MedMarg Partner Onboarding will review your practice details and assign your live referral code within 24 hours.
            </p>

            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', padding: '1.25rem', border: '1px solid #E2E8F0', textAlign: 'left', marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Application Summary:
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.88rem' }}>
                <span style={{ color: '#64748B' }}>Partner ID:</span>
                <strong style={{ color: '#0F172A' }}>{successData.partner?.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.88rem' }}>
                <span style={{ color: '#64748B' }}>Category:</span>
                <strong style={{ color: '#006B70' }}>{successData.partner?.type}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.88rem' }}>
                <span style={{ color: '#64748B' }}>Assigned Margin:</span>
                <strong style={{ color: '#16A34A' }}>{successData.partner?.assignedMargin || '20%'} Standard</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.88rem', borderTop: '1px dashed #CBD5E1', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                <span style={{ color: '#64748B' }}>Review Status:</span>
                <span style={{ color: '#D97706', fontWeight: '800' }}>● In Admin Approval Queue</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={onNavigateHome}
                style={{ padding: '0.85rem 1.75rem', backgroundColor: '#F1F5F9', color: '#334155', border: '1px solid #CBD5E1', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '800', cursor: 'pointer' }}
              >
                ← Back to Home
              </button>
              <button
                onClick={() => setShowComingSoon(true)}
                style={{ padding: '0.85rem 1.75rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 15px rgba(0,107,112,0.3)' }}
              >
                Go to Partner Sign In <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ) : (
          /* Main Partner Form Layout */
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.6fr', gap: '3rem', alignItems: 'start' }}>
            
            {/* Left Column: Why Partner with MedMarg */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', backgroundColor: '#EFF6FF', color: '#1D4ED8', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '900', marginBottom: '1rem' }}>
                <Sparkles size={14} /> ZERO UPFRONT CAPITAL INVESTMENT
              </div>

              <h1 style={{ fontSize: '2.25rem', fontWeight: '900', color: '#0F172A', lineHeight: '1.2', marginBottom: '1rem' }}>
                Expand Your Diagnostic Services & Patient Reach
              </h1>

              <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                Whether you are a consulting physician, independent clinic, standalone pathology lab, or wellness coach, MedMarg powers your practice with 916+ NABL tests and home blood sample collection.
              </p>

              {/* Partner Benefits */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#F0FDFA', color: '#006B70', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Percent size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0F172A' }}>15% - 25% Institutional Referral Margin</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
                      Automated digital ledger, real-time tracking of referred tests, and weekly direct bank/UPI payouts.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Truck size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0F172A' }}>Free Phlebotomist Doorstep Dispatch</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
                      Your patients get blood draws at home or your clinic premises via our GPS-tracked phlebotomy fleet.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0F172A' }}>100% NABL & ABDM Certified Results</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
                      Direct digital integration into patient health lockers with longitudinal trending charts and abnormal value alerts.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Registration Card */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '2.5rem', border: '1px solid #E2E8F0', boxShadow: '0 12px 36px rgba(0,0,0,0.05)' }}>
              
              <div style={{ marginBottom: '1.75rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                  Partner Pre-Registration Desk
                </h2>
                <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0.35rem 0 0 0' }}>
                  Register your medical entity or clinic for referral commissions and lab services.
                </p>
              </div>

              {error && (
                <div style={{ padding: '0.85rem 1rem', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px', color: '#DC2626', fontSize: '0.85rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                
                {/* Category Selection Pills */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '0.5rem' }}>
                    Select Your Practice Category *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    {categories.map(c => {
                      const isSel = formData.category === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleCategoryChange(c.id)}
                          style={{
                            padding: '0.65rem 0.85rem',
                            border: isSel ? '2px solid #006B70' : '1px solid #E2E8F0',
                            borderRadius: '10px',
                            backgroundColor: isSel ? '#F0FDFA' : '#FFFFFF',
                            color: isSel ? '#006B70' : '#475569',
                            fontWeight: isSel ? '900' : '700',
                            fontSize: '0.78rem',
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span>{c.label}</span>
                          <span style={{ fontSize: '0.7rem', backgroundColor: isSel ? '#006B70' : '#F1F5F9', color: isSel ? '#FFF' : '#64748B', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                            {c.defaultMargin}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Organization / Doctor Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '0.4rem' }}>
                    Clinic, Doctor or Organization Name *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. K. Sivasankar Clinic / Balaji Pathology"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.6rem', border: '1.5px solid #CBD5E1', borderRadius: '10px', fontSize: '0.9rem', color: '#0F172A', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Contact Person & Specialty */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '0.4rem' }}>
                      Primary Contact Person *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Sivasankar / Practice Manager"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #CBD5E1', borderRadius: '10px', fontSize: '0.9rem', color: '#0F172A', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '0.4rem' }}>
                      Clinical Specialty / Practice Scope
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Internal Medicine, Diabetology"
                      value={formData.specialty}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #CBD5E1', borderRadius: '10px', fontSize: '0.9rem', color: '#0F172A', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Mobile Phone & Email */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '0.4rem' }}>
                      Mobile / WhatsApp Number *
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
                      Email Address (for Reports & Ledgers) *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="email"
                        required
                        placeholder="partner@clinic.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.6rem', border: '1.5px solid #CBD5E1', borderRadius: '10px', fontSize: '0.9rem', color: '#0F172A', outline: 'none' }}
                      />
                    </div>
                  </div>
                </div>

                {/* City & Medical Registration Number */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '0.4rem' }}>
                      Practice City / Location *
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #CBD5E1', borderRadius: '10px', fontSize: '0.9rem', color: '#0F172A', outline: 'none', backgroundColor: '#FFF' }}
                    >
                      <option value="Tirupati, AP">Tirupati & Suburban, AP (Active)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '0.4rem' }}>
                      Council Reg / Establishment License
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. APMC-18492 / CEA Reg"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #CBD5E1', borderRadius: '10px', fontSize: '0.9rem', color: '#0F172A', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Clinic / Office Address */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '0.4rem' }}>
                    Clinic / Office Full Address (for Sample Drop / Center Link)
                  </label>
                  <textarea
                    rows="2"
                    placeholder="e.g. Door No. 12-4, Beside Union Bank, Air Bypass Road, Tirupati - 517501"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #CBD5E1', borderRadius: '10px', fontSize: '0.88rem', color: '#0F172A', outline: 'none', resize: 'vertical' }}
                  />
                </div>

                {/* Terms agreement */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginTop: '0.35rem' }}>
                  <input
                    type="checkbox"
                    id="agreeTermsPartner"
                    checked={formData.agreeTerms}
                    onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#006B70', marginTop: '0.15rem' }}
                  />
                  <label htmlFor="agreeTermsPartner" style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: '1.4', cursor: 'pointer' }}>
                    I agree to MedMarg Partner Referral Standards, Statutory Clinical Compliance, and consent to receiving a partner onboarding call from MedMarg Medical Liaison Officers.
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
                  {loading ? 'Submitting Partner Application...' : (
                    <>
                      Submit Partner Pre-Registration <ArrowRight size={18} />
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
        © 2026 MedMarg Medical Partner Network. Supporting Doctors, Clinics, Labs & Corporates across AP & Karnataka.
      </footer>

      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', maxWidth: '480px', width: '100%', padding: '2.5rem', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #E2E8F0', position: 'relative' }}>
            <button
              onClick={() => setShowComingSoon(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
            >
              <X size={18} />
            </button>

            <div style={{ width: '68px', height: '68px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <Clock size={36} />
            </div>

            <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#2563EB', letterSpacing: '0.08em', textTransform: 'uppercase', backgroundColor: '#DBEAFE', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
              PORTAL UNDER ACTIVE DEPLOYMENT
            </span>

            <h3 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#0F172A', margin: '0.8rem 0 0.5rem' }}>
              Partner Console Coming Soon!
            </h3>

            <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: '1.6', margin: '0 0 1.5rem' }}>
              The dedicated <strong>Healthcare Partner & Doctor Referral Dashboard</strong> is currently under final review and will be updated once the panel is live. Registered partners will receive SMS and WhatsApp notifications with instant access credentials.
            </p>

            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '14px', padding: '1rem', border: '1px solid #E2E8F0', textAlign: 'left', marginBottom: '1.5rem', fontSize: '0.82rem' }}>
              <div style={{ fontWeight: '800', color: '#0F172A', marginBottom: '0.3rem' }}>Next Steps:</div>
              <div style={{ color: '#64748B', lineHeight: '1.5' }}>
                • Fill out the pre-registration form below.<br />
                • Admin will review your practice and assign your referral code.<br />
                • Live login access will be activated directly on release.
              </div>
            </div>

            <button
              onClick={() => setShowComingSoon(false)}
              style={{ width: '100%', padding: '0.85rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontSize: '0.92rem', fontWeight: '800', cursor: 'pointer' }}
            >
              Got it, Continue Pre-Registration →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
