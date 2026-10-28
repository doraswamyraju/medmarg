import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Upload,
  Check,
  FileCheck,
  Building,
  ShieldAlert
} from 'lucide-react';
import { API_BASE, safeJson, safeFetch } from '../data/apiConfig';

export default function FreelanceSignupPage({ onNavigateLogin, onNavigateHome }) {
  // Step 1: Registration & KYC Documents, Step 2: Payment Gateway, Step 3: Confirmation
  const [currentStep, setCurrentStep] = useState(1);

  // Dynamic Onboarding Fee from Admin settings (Defaults to ₹2,000)
  const [onboardingFee, setOnboardingFee] = useState(2000);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    city: 'Tirupati, AP',
    // Medical Qualifications: DMLT, Occasional MLT, Paramedical Board Certificate, BSc MLT
    qualification: 'DMLT (Diploma in Medical Lab Technology)',
    paramedicalRegNo: '',
    // Experience Selection
    experienceType: 'EXPERIENCED', // 'EXPERIENCED' | 'NO_EXPERIENCE'
    experienceYears: '2-4 Years',
    // Fleet Conveyance & Cold Chain
    vehicleType: 'Two Wheeler (Motorcycle / Scooter)',
    hasColdBag: true,
    // Statutory Identifiers
    aadhaarNo: '',
    panNo: '',
    agreeTerms: true
  });

  // KYC Document Uploads state (Base64 or file metadata)
  const [documents, setDocuments] = useState({
    aadhaar: null,
    pan: null,
    qualificationCert: null,
    paramedicalBoardCert: null,
    experienceCert: null
  });

  // Mock upload progress indicators
  const [uploadStatus, setUploadStatus] = useState({});

  // Payment Processing State
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'CARD' | 'NETBANKING'
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [txnRef, setTxnRef] = useState('');

  // General Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  // Fetch admin configured onboarding fee
  useEffect(() => {
    fetch(`${API_BASE}/api/v1/admin/settings/onboarding-fee`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.onboardingFee) {
          setOnboardingFee(Number(data.onboardingFee));
        }
      })
      .catch(() => {});
  }, []);

  // Handle Document File Selection
  const handleFileChange = (docKey, file) => {
    if (!file) return;
    setUploadStatus(prev => ({ ...prev, [docKey]: 'UPLOADING' }));
    
    // Read file as Data URL / metadata
    const reader = new FileReader();
    reader.onload = () => {
      setTimeout(() => {
        setDocuments(prev => ({
          ...prev,
          [docKey]: {
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            type: file.type,
            dataUrl: reader.result
          }
        }));
        setUploadStatus(prev => ({ ...prev, [docKey]: 'DONE' }));
      }, 400);
    };
    reader.readAsDataURL(file);
  };

  // Validate Step 1 (Personal Details & Mandatory KYC Uploads)
  const handleProceedToPayment = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter your full legal name as per government records.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.replace(/[^0-9]/g, '').length < 10) {
      setError('Please provide a valid 10-digit mobile number.');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Please choose a secure account password (minimum 6 characters).');
      return;
    }
    if (!formData.paramedicalRegNo.trim()) {
      setError('Paramedical Board Registration Number is required (e.g. AP-PMC-18492).');
      return;
    }
    if (!formData.aadhaarNo.trim() || formData.aadhaarNo.replace(/\s+/g, '').length < 12) {
      setError('Please provide your complete 12-digit Aadhaar Card number.');
      return;
    }
    if (!formData.panNo.trim() || formData.panNo.length < 10) {
      setError('Please provide your valid 10-character PAN Card number.');
      return;
    }

    // Validate Mandatory KYC Document Uploads
    if (!documents.aadhaar) {
      setError('Mandatory KYC: Please upload your Aadhaar Card copy (PDF or Photo).');
      return;
    }
    if (!documents.pan) {
      setError('Mandatory KYC: Please upload your PAN Card copy (PDF or Photo).');
      return;
    }
    if (!documents.qualificationCert) {
      setError('Mandatory Technical KYC: Please upload your DMLT / Occasional MLT / BSc MLT Certificate.');
      return;
    }
    if (!documents.paramedicalBoardCert) {
      setError('Mandatory Technical KYC: Please upload your State Paramedical Board Certificate.');
      return;
    }
    if (formData.experienceType === 'EXPERIENCED' && !documents.experienceCert) {
      setError('Experience Certificate is required since you selected prior experience. If you are a fresher, please select "No Prior Experience".');
      return;
    }
    if (!formData.agreeTerms) {
      setError('You must accept the MedMarg Partner Code of Conduct and Service Terms.');
      return;
    }

    // Scroll to top and switch to Step 2
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep(2);
  };

  // Step 2: Handle Payment & Final Submission
  const handleSimulatePaymentAndSubmit = async () => {
    setPaymentLoading(true);
    setError('');

    const generatedTxn = `PAY_MM_RZP_${Math.floor(10000000 + Math.random() * 90000000)}`;
    setTxnRef(generatedTxn);

    try {
      // Simulate Razorpay Gateway Transaction Authorization
      await new Promise(resolve => setTimeout(resolve, 1400));
      setPaymentSuccess(true);

      // Submit complete onboarding dossier to backend
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        city: formData.city,
        hasExperience: formData.experienceType === 'EXPERIENCED',
        experience: formData.experienceType === 'EXPERIENCED' ? formData.experienceYears : 'NO_EXPERIENCE',
        vehicleType: formData.vehicleType,
        hasColdBag: formData.hasColdBag,
        qualification: formData.qualification,
        paramedicalRegNo: formData.paramedicalRegNo,
        aadhaarNo: formData.aadhaarNo,
        panNo: formData.panNo,
        documents: {
          aadhaar: documents.aadhaar?.name || 'Aadhaar_Document.pdf',
          pan: documents.pan?.name || 'PAN_Document.jpg',
          qualificationCert: documents.qualificationCert?.name || 'Degree_Diploma_Cert.pdf',
          paramedicalBoardCert: documents.paramedicalBoardCert?.name || 'Paramedical_Board_Registration.jpg',
          experienceCert: formData.experienceType === 'EXPERIENCED' ? (documents.experienceCert?.name || 'Experience_Relieving_Letter.pdf') : null
        },
        paymentDetails: {
          amount: onboardingFee,
          paymentId: generatedTxn,
          method: paymentMethod,
          status: 'SUCCESS'
        }
      };

      const res = await fetch(`${API_BASE}/api/v1/auth/signup-freelancer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await safeJson(res);

      if (res.ok && data && data.success) {
        setSuccessData(data);
        setCurrentStep(3);
      } else {
        setError(data?.error || 'Registration could not be completed. Please contact support.');
      }
    } catch (err) {
      setError('Payment gateway error. Please verify your connection.');
    } finally {
      setPaymentLoading(false);
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

      {/* Stepper Progress Bar */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0.9rem 2rem' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {[
            { num: 1, title: 'KYC & Qualifications', sub: 'Certificates & Details' },
            { num: 2, title: 'Onboarding Fee Payment', sub: `₹${onboardingFee.toLocaleString()} (Refundable/Wallet)` },
            { num: 3, title: 'Admin Verification', sub: 'Under Review Desk' }
          ].map((s) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: isCompleted ? '#10B981' : isCurrent ? '#006B70' : '#F1F5F9',
                  color: isCompleted || isCurrent ? '#FFFFFF' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '900',
                  fontSize: '0.85rem'
                }}>
                  {isCompleted ? <Check size={18} /> : s.num}
                </div>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: isCurrent ? '900' : '700', color: isCurrent ? '#0F172A' : '#64748B' }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{s.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Container */}
      <main style={{ maxWidth: '1160px', margin: '2.5rem auto', padding: '0 1.5rem 4rem' }}>
        
        {/* ========================================================================= */}
        {/* STEP 3: SUBMISSION COMPLETE & UNDER REVIEW                                 */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div style={{ maxWidth: '680px', margin: '1.5rem auto', backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '3rem 2.5rem', border: '1px solid #E2E8F0', boxShadow: '0 20px 40px rgba(0,0,0,0.06)', textAlign: 'center' }}>
            <div style={{ width: '76px', height: '76px', borderRadius: '50%', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 8px 20px rgba(217,119,6,0.15)' }}>
              <Clock size={40} />
            </div>

            <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#D97706', letterSpacing: '0.06em', textTransform: 'uppercase', backgroundColor: '#FEF3C7', padding: '0.25rem 0.75rem', borderRadius: '12px' }}>
              APPLICATION UNDER REVIEW IN ADMIN PANEL
            </span>
            <h1 style={{ fontSize: '1.85rem', fontWeight: '900', color: '#0F172A', margin: '0.8rem 0 0.5rem' }}>
              Payment Received! Welcome, {formData.name}
            </h1>
            <p style={{ color: '#64748B', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '2rem' }}>
              Your ₹{onboardingFee.toLocaleString()} onboarding fee payment has been confirmed (Ref: <code style={{ backgroundColor: '#F1F5F9', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '800', color: '#006B70' }}>{txnRef}</code>). Your full technical qualification dossier is now in the <strong>Admin Verification Queue</strong>.
            </p>

            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', padding: '1.25rem', border: '1px solid #E2E8F0', textAlign: 'left', marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Application Summary & Login Credentials:
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.88rem' }}>
                <span style={{ color: '#64748B' }}>Assigned Partner ID:</span>
                <strong style={{ color: '#0F172A' }}>{successData?.freelancer?.id || 'FL-Pending'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.88rem' }}>
                <span style={{ color: '#64748B' }}>Login Mobile / Email:</span>
                <strong style={{ color: '#0F172A' }}>{formData.phone} / {formData.email || 'N/A'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.88rem' }}>
                <span style={{ color: '#64748B' }}>Password:</span>
                <strong style={{ color: '#006B70' }}>{formData.password}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.88rem', borderTop: '1px dashed #CBD5E1', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                <span style={{ color: '#64748B' }}>Current Status:</span>
                <span style={{ color: '#D97706', fontWeight: '900' }}>● Under Review (Admin Approval Pending)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.88rem' }}>
                <span style={{ color: '#64748B' }}>Onboarding Fee Credit:</span>
                <strong style={{ color: '#16A34A' }}>₹{onboardingFee.toLocaleString()} (Instant Wallet Balance on Approval)</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={onNavigateLogin}
                style={{ padding: '0.9rem 2rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontSize: '0.95rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(0,107,112,0.3)' }}
              >
                Go to Sign In Portal <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: ONBOARDING FEE PAYMENT GATEWAY                                    */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div style={{ maxWidth: '640px', margin: '1rem auto' }}>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '2.5rem', border: '1px solid #E2E8F0', boxShadow: '0 16px 40px rgba(0,0,0,0.06)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#006B70', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    STEP 2 OF 2 • SECURE CHECKOUT
                  </span>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A', margin: '0.3rem 0 0.2rem' }}>
                    Freelance Fleet Onboarding Fee
                  </h2>
                  <p style={{ color: '#64748B', fontSize: '0.86rem', margin: 0 }}>
                    Set by MedMarg Admin Governance for phlebotomist activation & starter consumables.
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0F172A' }}>₹{onboardingFee.toLocaleString()}</div>
                  <span style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: '800', backgroundColor: '#DCFCE7', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                    100% CREDITED TO WALLET
                  </span>
                </div>
              </div>

              {error && (
                <div style={{ padding: '0.85rem 1rem', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px', color: '#DC2626', fontSize: '0.85rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              {/* Fee Breakdown Info */}
              <div style={{ backgroundColor: '#F0FDFA', border: '1px solid #CCFBF1', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: '800', color: '#0F766E', fontSize: '0.88rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldCheck size={18} color="#0D9488" /> Why is this fee required?
                </div>
                <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: '1.5' }}>
                  • <strong>Anti-Spam Verification:</strong> Prevents non-serious registrations and guarantees genuine NABL technicians.<br />
                  • <strong>Opening Wallet Balance:</strong> The entire ₹{onboardingFee.toLocaleString()} is credited directly into your in-app cashout wallet once admin approves your KYC documents.<br />
                  • <strong>Starter Consumables Kit:</strong> Covers vacutainer needle holders, tourniquets, and temperature-controlled sample bag.
                </div>
              </div>

              {/* Payment Methods */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '0.6rem' }}>
                  Select Payment Gateway Mode:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  {[
                    { id: 'UPI', label: 'UPI / QR', desc: 'GPay, PhonePe, Paytm' },
                    { id: 'CARD', label: 'Debit / Credit', desc: 'Visa, Master, RuPay' },
                    { id: 'NETBANKING', label: 'Net Banking', desc: 'All Indian Banks' }
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      style={{
                        padding: '0.85rem 0.5rem',
                        borderRadius: '12px',
                        border: paymentMethod === m.id ? '2px solid #006B70' : '1px solid #CBD5E1',
                        backgroundColor: paymentMethod === m.id ? '#F0FDFA' : '#FFFFFF',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontWeight: '900', color: paymentMethod === m.id ? '#006B70' : '#0F172A', fontSize: '0.88rem' }}>
                        {m.label}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.15rem' }}>{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Simulation Note */}
              <div style={{ padding: '0.85rem 1rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.8rem', color: '#64748B', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={18} color="#006B70" />
                <span>Powered by Razorpay 256-Bit SSL Encrypted Healthcare Gateway</span>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  disabled={paymentLoading}
                  style={{ flex: 1, padding: '0.9rem', backgroundColor: '#F1F5F9', color: '#334155', border: '1px solid #CBD5E1', borderRadius: '12px', fontSize: '0.92rem', fontWeight: '800', cursor: 'pointer' }}
                >
                  ← Edit KYC & Details
                </button>
                <button
                  type="button"
                  onClick={handleSimulatePaymentAndSubmit}
                  disabled={paymentLoading}
                  style={{
                    flex: 2,
                    padding: '0.9rem',
                    backgroundColor: '#006B70',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    fontWeight: '900',
                    cursor: paymentLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 14px rgba(0,107,112,0.25)'
                  }}
                >
                  {paymentLoading ? 'Authorizing Payment & Dossier Submission...' : `Pay ₹${onboardingFee.toLocaleString()} & Submit KYC →`}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: PERSONAL DETAILS & MANDATORY TECHNICAL KYC UPLOADS                */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.6fr', gap: '3rem', alignItems: 'start' }}>
            
            {/* Left Column: Benefits & Requirements */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', backgroundColor: '#E0F2F1', color: '#006B70', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '900', marginBottom: '1rem' }}>
                <Sparkles size={14} /> EARN UP TO ₹35,000 / MONTH
              </div>

              <h1 style={{ fontSize: '2.25rem', fontWeight: '900', color: '#0F172A', lineHeight: '1.2', marginBottom: '1rem' }}>
                Join India's Fastest Growing Diagnostic Home Collection Fleet
              </h1>

              <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                MedMarg enables certified lab technicians (DMLT, Occasional MLT, BSc MLT) to earn top-tier pay per blood sample pickup with 100% digital route navigation and instant wallet credits.
              </p>

              {/* Requirement Checklist */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ fontWeight: '900', fontSize: '0.95rem', color: '#0F172A', marginBottom: '0.75rem' }}>
                  Mandatory Qualifications Checklist:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.84rem', color: '#334155' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={16} color="#10B981" /> DMLT, Occasional MLT or B.Sc MLT Degree
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={16} color="#10B981" /> State Paramedical Board Registration Card
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={16} color="#10B981" /> Aadhaar & PAN Card for direct bank payouts
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={16} color="#10B981" /> Hospital / Lab Experience Certificate (or Fresher)
                  </div>
                </div>
              </div>

              {/* Benefits Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#F0FDFA', color: '#006B70', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <DollarSign size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0F172A' }}>₹250 - ₹450 per Patient Visit</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
                      Transparent per-pickup incentives + distance allowances credited directly to your wallet.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0F172A' }}>Total Working Hour Flexibility</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
                      Accept open broadcast orders that fit your schedule. Toggle online/offline anytime.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Registration & KYC Upload Form */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '2.5rem', border: '1px solid #E2E8F0', boxShadow: '0 12px 36px rgba(0,0,0,0.05)' }}>
              
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                    Freelance Phlebotomist Registration
                  </h2>
                  <span style={{ fontSize: '0.72rem', backgroundColor: '#F0FDFA', color: '#006B70', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '800' }}>
                    STEP 1 OF 2
                  </span>
                </div>
                <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0.35rem 0 0 0' }}>
                  Instant account setup. Complete personal details and upload required KYC certifications.
                </p>
              </div>

              {error && (
                <div style={{ padding: '0.85rem 1rem', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px', color: '#DC2626', fontSize: '0.85rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <form onSubmit={handleProceedToPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                
                {/* Full Legal Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '0.4rem' }}>
                    Full Legal Name (as per Certificate / Aadhaar) *
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
                      Mobile Number (for OTP & Job Broadcasts) *
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

                {/* Password & Base Operating City */}
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
                      <option value="Tirupati, AP">Tirupati & Suburban, AP (Active)</option>
                    </select>
                  </div>
                </div>

                {/* Medical Technical Qualification */}
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
                      <option value="DMLT (Diploma in Medical Lab Technology)">DMLT (Diploma in Medical Lab Technology)</option>
                      <option value="Occasional MLT (Short-term Laboratory Certification)">Occasional MLT (Vocational / Intermediate MLT)</option>
                      <option value="B.Sc MLT (Medical Laboratory Technology Graduate)">B.Sc MLT (Graduate Laboratory Technology)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '0.4rem' }}>
                      Paramedical Board Reg No *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AP-PMC-18492"
                      value={formData.paramedicalRegNo}
                      onChange={(e) => setFormData({ ...formData, paramedicalRegNo: e.target.value.toUpperCase() })}
                      style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #CBD5E1', borderRadius: '10px', fontSize: '0.9rem', color: '#0F172A', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Experience Option: Experienced OR No Experience */}
                <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '0.5rem' }}>
                    Phlebotomy & Venipuncture Experience *
                  </label>
                  <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.75rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', color: '#0F172A' }}>
                      <input
                        type="radio"
                        name="experienceType"
                        value="EXPERIENCED"
                        checked={formData.experienceType === 'EXPERIENCED'}
                        onChange={() => setFormData({ ...formData, experienceType: 'EXPERIENCED' })}
                        style={{ accentColor: '#006B70' }}
                      />
                      I have Hospital / Lab Experience (Certificate required)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', color: '#0F172A' }}>
                      <input
                        type="radio"
                        name="experienceType"
                        value="NO_EXPERIENCE"
                        checked={formData.experienceType === 'NO_EXPERIENCE'}
                        onChange={() => setFormData({ ...formData, experienceType: 'NO_EXPERIENCE' })}
                        style={{ accentColor: '#006B70' }}
                      />
                      No Experience (Fresher Phlebotomist)
                    </label>
                  </div>

                  {formData.experienceType === 'EXPERIENCED' && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#64748B', marginBottom: '0.3rem' }}>
                        Years of Venipuncture Experience:
                      </label>
                      <select
                        value={formData.experienceYears}
                        onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1.5px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A', outline: 'none', backgroundColor: '#FFF' }}
                      >
                        <option value="1-2 Years">1-2 Years (Junior Phlebotomist)</option>
                        <option value="2-4 Years">2-4 Years (Experienced Technician)</option>
                        <option value="5+ Years">5+ Years (Senior Phlebotomy Specialist)</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Mode of Conveyance & Cold Bag */}
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

                {/* Statutory Numbers: Aadhaar & PAN */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '0.4rem' }}>
                      Aadhaar Card Number (12 Digits) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 5421 9876 1234"
                      value={formData.aadhaarNo}
                      onChange={(e) => setFormData({ ...formData, aadhaarNo: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #CBD5E1', borderRadius: '10px', fontSize: '0.9rem', color: '#0F172A', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '0.4rem' }}>
                      PAN Card Number (for Payouts) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ABCDE1234F"
                      value={formData.panNo}
                      onChange={(e) => setFormData({ ...formData, panNo: e.target.value.toUpperCase() })}
                      style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #CBD5E1', borderRadius: '10px', fontSize: '0.9rem', color: '#0F172A', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* ================================================================= */}
                {/* MANDATORY KYC & TECHNICAL CERTIFICATE UPLOADS SECTION            */}
                {/* ================================================================= */}
                <div style={{ backgroundColor: '#F0FDFA', border: '1.5px dashed #0D9488', borderRadius: '16px', padding: '1.5rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <ShieldCheck size={20} color="#006B70" />
                    <h3 style={{ fontSize: '1rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                      Mandatory KYC Document Uploads (PDF / JPG / PNG)
                    </h3>
                  </div>
                  <p style={{ color: '#64748B', fontSize: '0.8rem', margin: '0 0 1.25rem' }}>
                    All certificates are reviewed by the MedMarg Operations Admin under NABL ISO 15189 Standards before activating broadcast tasks.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    
                    {/* 1. Aadhaar Card Copy */}
                    <div style={{ backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F172A' }}>1. Aadhaar Card *</span>
                        {documents.aadhaar && <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: '800' }}>✓ Attached</span>}
                      </div>
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        id="aadhaar-upload"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileChange('aadhaar', e.target.files[0])}
                      />
                      <label
                        htmlFor="aadhaar-upload"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.6rem', border: '1px dashed #CBD5E1', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '700', color: '#006B70', cursor: 'pointer', backgroundColor: '#F8FAFC' }}
                      >
                        <Upload size={14} /> {documents.aadhaar ? documents.aadhaar.name : 'Upload Aadhaar PDF / Photo'}
                      </label>
                    </div>

                    {/* 2. PAN Card Copy */}
                    <div style={{ backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F172A' }}>2. PAN Card *</span>
                        {documents.pan && <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: '800' }}>✓ Attached</span>}
                      </div>
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        id="pan-upload"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileChange('pan', e.target.files[0])}
                      />
                      <label
                        htmlFor="pan-upload"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.6rem', border: '1px dashed #CBD5E1', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '700', color: '#006B70', cursor: 'pointer', backgroundColor: '#F8FAFC' }}
                      >
                        <Upload size={14} /> {documents.pan ? documents.pan.name : 'Upload PAN Card PDF / Photo'}
                      </label>
                    </div>

                    {/* 3. DMLT / Occasional MLT / BSc MLT Certificate */}
                    <div style={{ backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F172A' }}>3. MLT Degree / Diploma *</span>
                        {documents.qualificationCert && <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: '800' }}>✓ Attached</span>}
                      </div>
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        id="mlt-upload"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileChange('qualificationCert', e.target.files[0])}
                      />
                      <label
                        htmlFor="mlt-upload"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.6rem', border: '1px dashed #CBD5E1', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '700', color: '#006B70', cursor: 'pointer', backgroundColor: '#F8FAFC' }}
                      >
                        <Upload size={14} /> {documents.qualificationCert ? documents.qualificationCert.name : 'Upload DMLT / BSc MLT Cert'}
                      </label>
                    </div>

                    {/* 4. Paramedical Board Certificate */}
                    <div style={{ backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F172A' }}>4. Paramedical Board Cert *</span>
                        {documents.paramedicalBoardCert && <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: '800' }}>✓ Attached</span>}
                      </div>
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        id="paramedical-upload"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileChange('paramedicalBoardCert', e.target.files[0])}
                      />
                      <label
                        htmlFor="paramedical-upload"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.6rem', border: '1px dashed #CBD5E1', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '700', color: '#006B70', cursor: 'pointer', backgroundColor: '#F8FAFC' }}
                      >
                        <Upload size={14} /> {documents.paramedicalBoardCert ? documents.paramedicalBoardCert.name : 'Upload Board License Copy'}
                      </label>
                    </div>

                  </div>

                  {/* 5. Experience Certificate (Conditional on Experienced selection) */}
                  {formData.experienceType === 'EXPERIENCED' && (
                    <div style={{ backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginTop: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F172A' }}>
                          5. Hospital / Lab Experience Certificate *
                        </span>
                        {documents.experienceCert && <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: '800' }}>✓ Attached</span>}
                      </div>
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        id="experience-upload"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileChange('experienceCert', e.target.files[0])}
                      />
                      <label
                        htmlFor="experience-upload"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.7rem', border: '1px dashed #CBD5E1', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', color: '#2563EB', cursor: 'pointer', backgroundColor: '#EFF6FF' }}
                      >
                        <Upload size={15} /> {documents.experienceCert ? documents.experienceCert.name : 'Upload Diagnostic Center / Hospital Experience Certificate'}
                      </label>
                    </div>
                  )}

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
                    I certify that my technical MLT qualifications and Paramedical Board registration are genuine. I agree to pay the refundable ₹{onboardingFee.toLocaleString()} onboarding fee to proceed to Admin Review.
                  </label>
                </div>

                {/* Proceed to Payment Button */}
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
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 14px rgba(0,107,112,0.25)',
                    marginTop: '0.5rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Proceed to Onboarding Fee Payment (₹{onboardingFee.toLocaleString()}) <ArrowRight size={18} />
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
