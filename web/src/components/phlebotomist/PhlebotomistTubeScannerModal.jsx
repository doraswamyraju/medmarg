import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  CheckCircle2, 
  QrCode, 
  ShieldCheck, 
  Star, 
  X, 
  Upload, 
  Smartphone, 
  MapPin, 
  Clock, 
  Check, 
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { API_BASE, safeFetch, safeJson } from '../../data/apiConfig';

export default function PhlebotomistTubeScannerModal({ 
  activePickupModal, 
  setActivePickupModal, 
  onCompleteCollection 
}) {
  const [step, setStep] = useState(1); // 1: First Pic (Arrival), 2: Samples & Optional Pics, 3: Payment (if postpaid), 4: Close Request
  const [arrivalPhoto, setArrivalPhoto] = useState(null);
  const [samplePhotos, setSamplePhotos] = useState([]);
  const [paymentDone, setPaymentDone] = useState(false);
  const [liveQrData, setLiveQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bedside Patient Vitals Checkup State (Recorded by Phlebo upon sample draw)
  const [recordVitalsCheckup, setRecordVitalsCheckup] = useState(false);
  const [phleboBp, setPhleboBp] = useState('120/80');
  const [phleboPulse, setPhleboPulse] = useState('74');
  const [phleboSpo2, setPhleboSpo2] = useState('98');
  const [phleboSugar, setPhleboSugar] = useState('');
  const [phleboTemp, setPhleboTemp] = useState('98.4');

  // Check if prepaid
  const isPrepaid = activePickupModal?.paymentStatus === 'PAID_ONLINE' || 
    activePickupModal?.paymentStatus === 'PAID_DOORSTEP_QR' ||
    (typeof activePickupModal?.paymentStatus === 'string' && activePickupModal.paymentStatus.toLowerCase().includes('paid'));

  const orderAmount = activePickupModal?.amount || activePickupModal?.totalAmount || 899;

  // Auto-generate QR if on payment step
  useEffect(() => {
    if (step === 3 && !isPrepaid && activePickupModal) {
      setQrLoading(true);
      safeFetch(`${API_BASE}/api/v1/payments/generate-doorstep-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: activePickupModal.id,
          amount: orderAmount,
          patientName: activePickupModal.patientName || activePickupModal.patient,
          patientPhone: activePickupModal.phone
        })
      })
        .then(r => safeJson(r))
        .then(data => {
          if (data && data.success && data.data) {
            setLiveQrData(data.data);
          }
        })
        .catch(err => console.warn('QR fetch error:', err))
        .finally(() => setQrLoading(false));
    }
  }, [step, isPrepaid, activePickupModal, orderAmount]);

  if (!activePickupModal) return null;

  // Helper for First Pic simulation / upload
  const handleSnapArrivalPhoto = () => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setArrivalPhoto(`https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80#doorstep-${timestamp}`);
  };

  const handleArrivalFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setArrivalPhoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Helper for Optional Sample Photos
  const handleAddSamplePhoto = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSamplePhotos(prev => [...prev, reader.result]);
      reader.readAsDataURL(file);
    } else {
      setSamplePhotos(prev => [...prev, `https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=400&q=80#sample-${Date.now()}`]);
    }
  };

  // Step transition after sample collection
  const handleSamplesCollected = () => {
    if (isPrepaid || paymentDone) {
      setStep(4); // Skip payment step, proceed directly to Close Request
    } else {
      setStep(3); // Show Razorpay QR
    }
  };

  // Final Close Request Handler
  const handleCloseRequest = async (sendReviewRequest) => {
    setIsSubmitting(true);
    try {
      if (onCompleteCollection) {
        await onCompleteCollection(activePickupModal.id, {
          arrivalPhoto,
          samplePhotos,
          paymentDone: isPrepaid || paymentDone,
          sendReviewRequest,
          vitals: recordVitalsCheckup ? {
            bp: phleboBp,
            pulse: phleboPulse,
            spo2: phleboSpo2,
            sugar: phleboSugar || null,
            temp: phleboTemp
          } : null
        });
      }
      setActivePickupModal(null);
    } catch (err) {
      console.warn('Error closing visit:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const requiredTubes = activePickupModal.tubes || [
    'Yellow SST (Serum Gel)', 
    'Lavender (EDTA Whole Blood)'
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 140,
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '1.25rem'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        maxWidth: '560px',
        width: '100%',
        padding: '2rem',
        border: '2px solid #006B70',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
        position: 'relative'
      }}>
        
        {/* Header & Step Tracker */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', backgroundColor: '#E0F2F1', color: '#006B70', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '900' }}>
                DOORSTEP VISIT WORKFLOW
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>
                Order #{activePickupModal.id}
              </span>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0F172A', marginTop: '0.25rem' }}>
              {step === 1 && '1. Reached Location: First Pic'}
              {step === 2 && '2. Collect Samples (Draw & Seal)'}
              {step === 3 && '3. Collect Payment (Razorpay QR)'}
              {step === 4 && '4. Visit Complete: Close Request'}
            </h3>
          </div>
          <button 
            onClick={() => setActivePickupModal(null)} 
            style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#94A3B8' }}
          >
            ✕
          </button>
        </div>

        {/* Patient Dossier Banner */}
        <div style={{ backgroundColor: '#F8FAFC', padding: '0.9rem 1.1rem', borderRadius: '14px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: '900', color: '#0F172A' }}>
                {activePickupModal.patientName} ({activePickupModal.age || '32M'})
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.15rem' }}>
                📍 {activePickupModal.address}
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '900', backgroundColor: isPrepaid ? '#ECFDF5' : '#FEF3C7', color: isPrepaid ? '#059669' : '#B45309' }}>
              {isPrepaid ? `Prepaid (₹${orderAmount})` : `Post-Paid (₹${orderAmount})`}
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: FIRST PIC UPON REACHING CLIENT LOCATION                           */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div>
            <div style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '700', marginBottom: '1rem' }}>
              Capture or upload the <strong>First Pic</strong> upon reaching the client location (doorstep entrance / house gate proof):
            </div>

            {arrivalPhoto ? (
              <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
                <div style={{ position: 'relative', width: '100%', height: '220px', borderRadius: '16px', overflow: 'hidden', border: '2px solid #059669', boxShadow: '0 4px 12px rgba(5,150,105,0.15)' }}>
                  <img 
                    src={arrivalPhoto} 
                    alt="First Pic Arrival Proof" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', color: '#FFFFFF', padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.72rem', textAlign: 'left' }}>
                    ✓ First Pic Verified • 📍 {activePickupModal.address?.split(',')[0]} • GPS Tagged
                  </div>
                </div>

                <button
                  onClick={() => setArrivalPhoto(null)}
                  style={{ marginTop: '0.5rem', background: 'none', border: 'none', color: '#EF4444', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}
                >
                  Retake / Replace Photo
                </button>
              </div>
            ) : (
              <div style={{
                border: '2px dashed #006B70',
                borderRadius: '16px',
                padding: '2rem 1.5rem',
                textAlign: 'center',
                backgroundColor: '#F0FDFA',
                marginBottom: '1.25rem'
              }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#CCFBF1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                  <Camera size={28} color="#006B70" />
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#0F172A' }}>
                  Send First Pic Proof
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.25rem', maxWidth: '320px', margin: '0.25rem auto 1rem' }}>
                  Take a photo of patient's entrance or doorstep to verify arrival before sample collection.
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  <button
                    onClick={handleSnapArrivalPhoto}
                    style={{
                      padding: '0.65rem 1.25rem',
                      backgroundColor: '#006B70',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: '900',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <Camera size={15} /> Take Photo Now
                  </button>

                  <label style={{
                    padding: '0.65rem 1.25rem',
                    backgroundColor: '#FFFFFF',
                    color: '#006B70',
                    border: '1.5px solid #006B70',
                    borderRadius: '10px',
                    fontWeight: '900',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}>
                    <Upload size={15} /> Upload Pic
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleArrivalFileUpload} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>
              </div>
            )}

            <button
              disabled={!arrivalPhoto}
              onClick={() => setStep(2)}
              style={{
                width: '100%',
                padding: '0.85rem',
                backgroundColor: arrivalPhoto ? '#006B70' : '#CBD5E1',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '900',
                fontSize: '0.95rem',
                cursor: arrivalPhoto ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              Arrival Verified → Proceed to Sample Draw <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: SAMPLE COLLECTION (+ OPTIONAL SAMPLE PICS)                        */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div>
            <div style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '700', marginBottom: '0.75rem' }}>
              Required Vacutainer Specimens for Ordered Tests:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
              {requiredTubes.map((tube, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', backgroundColor: '#F0FDF4', borderRadius: '12px', border: '1.5px solid #86EFAC' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>🧪</span>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: '900', color: '#0F172A' }}>{tube}</div>
                      <div style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: '800' }}>Assigned from In-Hand Kit • Barcode Linked</div>
                    </div>
                  </div>
                  <CheckCircle2 size={20} color="#16A34A" />
                </div>
              ))}
            </div>

            {/* Optional Sample Pictures Upload */}
            <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '900', color: '#0F172A' }}>
                  📸 Pics of Drawn Samples
                </span>
                <span style={{ fontSize: '0.7rem', color: '#64748B', backgroundColor: '#E2E8F0', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>
                  Optional / Not Mandatory
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748B', marginBottom: '0.75rem' }}>
                Add picture of sealed tubes or barcode labels if needed for audit or lab reference.
              </div>

              {samplePhotos.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', overflowX: 'auto' }}>
                  {samplePhotos.map((img, idx) => (
                    <img 
                      key={idx} 
                      src={img} 
                      alt="Sample Tube" 
                      style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover', border: '1.5px solid #006B70' }} 
                    />
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleAddSamplePhoto()}
                  style={{
                    padding: '0.45rem 0.85rem',
                    backgroundColor: '#FFFFFF',
                    color: '#006B70',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Camera size={13} /> + Add Sample Pic
                </button>
              </div>
            </div>

            {/* Bedside Patient Vitals Checkup (Free Clinical Value-Add) */}
            <div style={{ backgroundColor: '#F0FDFA', padding: '1rem', borderRadius: '14px', border: '1.5px solid #99F6E4', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '1rem' }}>🩺</span>
                  <span style={{ fontSize: '0.84rem', fontWeight: '900', color: '#006B70' }}>
                    Record Patient Vitals (Doorstep Clinical Checkup)
                  </span>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '800', color: '#0F172A' }}>
                  <input 
                    type="checkbox" 
                    checked={recordVitalsCheckup} 
                    onChange={(e) => setRecordVitalsCheckup(e.target.checked)} 
                    style={{ width: '16px', height: '16px', accentColor: '#006B70' }}
                  />
                  <span>Record Vitals</span>
                </label>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B', marginBottom: recordVitalsCheckup ? '0.75rem' : '0' }}>
                Optional: Measure patient's BP, Pulse or SpO₂ during blood draw to automatically sync into their Health Vault and Admin records.
              </div>

              {recordVitalsCheckup && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.5rem', marginTop: '0.6rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: '800', color: '#475569', marginBottom: '0.2rem' }}>Blood Pressure (mmHg)</label>
                    <input 
                      type="text" 
                      placeholder="120/80" 
                      value={phleboBp} 
                      onChange={(e) => setPhleboBp(e.target.value)}
                      style={{ width: '100%', padding: '0.4rem 0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontWeight: '700' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: '800', color: '#475569', marginBottom: '0.2rem' }}>Pulse (BPM)</label>
                    <input 
                      type="number" 
                      placeholder="74" 
                      value={phleboPulse} 
                      onChange={(e) => setPhleboPulse(e.target.value)}
                      style={{ width: '100%', padding: '0.4rem 0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontWeight: '700' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: '800', color: '#475569', marginBottom: '0.2rem' }}>SpO₂ (%)</label>
                    <input 
                      type="number" 
                      placeholder="98" 
                      value={phleboSpo2} 
                      onChange={(e) => setPhleboSpo2(e.target.value)}
                      style={{ width: '100%', padding: '0.4rem 0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontWeight: '700' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: '800', color: '#475569', marginBottom: '0.2rem' }}>Sugar (mg/dL)</label>
                    <input 
                      type="number" 
                      placeholder="Fasting / Post" 
                      value={phleboSugar} 
                      onChange={(e) => setPhleboSugar(e.target.value)}
                      style={{ width: '100%', padding: '0.4rem 0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontWeight: '700' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: '800', color: '#475569', marginBottom: '0.2rem' }}>Temp (°F)</label>
                    <input 
                      type="text" 
                      placeholder="98.4" 
                      value={phleboTemp} 
                      onChange={(e) => setPhleboTemp(e.target.value)}
                      style={{ width: '100%', padding: '0.4rem 0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontWeight: '700' }}
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleSamplesCollected}
              style={{
                width: '100%',
                padding: '0.85rem',
                backgroundColor: '#006B70',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '900',
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              <CheckCircle2 size={17} /> Samples Drawn & Sealed in Cold Bag →
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: POST-PAID RAZORPAY UPI QR CODE (IF ORDER NOT PREPAID)             */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '1.25rem', borderRadius: '16px', border: '1.5px solid #006B70', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.72rem', backgroundColor: '#ECFDF5', color: '#065F46', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: '900' }}>
                DOORSTEP RAZORPAY UPI SCAN TO PAY
              </span>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: '#0F172A', marginTop: '0.4rem' }}>
                ₹{orderAmount}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                Order #{activePickupModal.id} • Cashless Doorstep Collection
              </div>

              {/* Dynamic QR */}
              <div style={{ margin: '1rem auto', width: '200px', height: '200px', backgroundColor: '#FFFFFF', padding: '10px', borderRadius: '14px', border: '2px dashed #006B70', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                {qrLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <Loader2 size={32} color="#006B70" className="animate-spin" />
                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>Generating QR...</span>
                  </div>
                ) : liveQrData?.qrImageUrl ? (
                  <img src={liveQrData.qrImageUrl} alt="Doorstep UPI QR" style={{ width: '160px', height: '160px', objectFit: 'contain' }} />
                ) : (
                  <QrCode size={140} color="#004D40" />
                )}
                <div style={{ fontSize: '0.65rem', fontWeight: '900', color: '#004D40', marginTop: '4px' }}>
                  SCAN WITH ANY UPI APP
                </div>
              </div>

              <div style={{ fontSize: '0.76rem', color: '#475569', fontWeight: '800' }}>
                Google Pay • PhonePe • Paytm • BHIM • CRED UPI
              </div>
            </div>

            <button
              onClick={() => {
                setPaymentDone(true);
                setStep(4);
              }}
              style={{
                width: '100%',
                padding: '0.85rem',
                backgroundColor: '#059669',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '900',
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 12px rgba(5,150,105,0.2)'
              }}
            >
              <CheckCircle2 size={18} /> Confirm ₹{orderAmount} Payment Received via UPI
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: CLOSE REQUEST (WITH REVIEW REQUEST / WITHOUT REVIEW REQUEST)      */}
        {/* ========================================================================= */}
        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <div style={{ width: '68px', height: '68px', borderRadius: '50%', backgroundColor: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <CheckCircle2 size={40} color="#059669" />
            </div>

            <h4 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0F172A' }}>
              Sample Collection Complete!
            </h4>
            <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '0.35rem', maxWidth: '360px', margin: '0.35rem auto 1.25rem' }}>
              Specimens safely sealed in IoT cold carrier at 4.2°C. Payment status: <strong>{isPrepaid || paymentDone ? 'Paid (100% Cashless)' : 'Pending'}</strong>.
            </p>

            <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0', marginBottom: '1.5rem', textAlign: 'left', fontSize: '0.82rem' }}>
              <div style={{ fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>VISIT CLOSURE OPTIONS:</div>
              <div style={{ color: '#0F172A' }}>
                You can close this visit and automatically trigger a patient experience review request, or close directly without asking for a review.
              </div>
            </div>

            {/* The 2 distinct Close Request choices specified by user */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                disabled={isSubmitting}
                onClick={() => handleCloseRequest(true)}
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  backgroundColor: '#006B70',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '900',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(0,107,112,0.25)'
                }}
              >
                <Star size={18} color="#FBBF24" fill="#FBBF24" /> 
                {isSubmitting ? 'Closing Visit...' : 'Close & Send Review Request to Patient'}
              </button>

              <button
                disabled={isSubmitting}
                onClick={() => handleCloseRequest(false)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#F1F5F9',
                  color: '#475569',
                  border: '1px solid #CBD5E1',
                  borderRadius: '12px',
                  fontWeight: '800',
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Close Without Review Request
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
