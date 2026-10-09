import React, { useState } from 'react';
import { QrCode, CheckCircle2, Thermometer, ShieldCheck, AlertCircle, Phone, Lock, Sparkles, Check } from 'lucide-react';

export default function PhlebotomistTubeScannerModal({ 
  activePickupModal, 
  setActivePickupModal, 
  onCompleteCollection 
}) {
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('4821');
  const [fastingChecked, setFastingChecked] = useState(true);
  const [paymentDone, setPaymentDone] = useState(false);
  const [scannedTubes, setScannedTubes] = useState({
    'Yellow SST (Serum)': 'MM-SST-8921',
    'Lavender (EDTA Blood)': 'MM-EDTA-3391'
  });
  const [manualBarcode, setManualBarcode] = useState('');
  const [selectedTubeType, setSelectedTubeType] = useState('Grey (Fluoride Sugar)');
  const [coldTemp, setColdTemp] = useState('4.2°C');

  if (!activePickupModal) return null;

  const isUnpaid = activePickupModal.paymentStatus === 'PAY_AT_DOORSTEP' || 
    (typeof activePickupModal.amount === 'string' && activePickupModal.amount.includes('Collect'));

  const requiredTubes = activePickupModal.tubes || [
    'Yellow SST (Serum)', 
    'Lavender (EDTA Blood)'
  ];

  const handleAddBarcode = (e) => {
    e.preventDefault();
    if (!manualBarcode.trim()) return;
    setScannedTubes(prev => ({
      ...prev,
      [selectedTubeType]: manualBarcode.trim().toUpperCase()
    }));
    setManualBarcode('');
  };

  const handleFinalSubmit = () => {
    if (onCompleteCollection) {
      onCompleteCollection(activePickupModal.id, {
        otp,
        scannedTubes,
        coldTemp,
        paymentDone
      });
    }
    setStep(4);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 120, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', maxWidth: '560px', width: '100%', padding: '2rem', border: '2px solid #006B70', maxHeight: '90vh', overflowY: 'auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: '900' }}>
              STEP {step} OF 4 • SAMPLE COLLECTION
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>
              {step === 1 && '1. Patient OTP & Fasting Verification'}
              {step === 2 && '2. Dynamic Razorpay Doorstep QR'}
              {step === 3 && '3. Scan Vacutainer Tube Barcodes'}
              {step === 4 && '4. Cold Chain Carrier Sealed!'}
            </h3>
          </div>
          <button onClick={() => setActivePickupModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B' }}>✕</button>
        </div>

        {/* Step 1: Patient Verification & Handover OTP */}
        {step === 1 && (
          <div>
            <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '800' }}>PATIENT DOSSIER</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>
                {activePickupModal.patientName} ({activePickupModal.age || '32'})
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.2rem' }}>
                📍 {activePickupModal.address}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#006B70', fontWeight: '800', marginTop: '0.4rem' }}>
                🧪 Tests: {activePickupModal.tests || 'Complete Blood Profile'}
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '0.35rem' }}>
                Enter 4-Digit Patient Security Handover OTP:
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="text"
                  maxLength="4"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="4821"
                  style={{ width: '140px', padding: '0.75rem', borderRadius: '10px', border: '2px solid #006B70', fontSize: '1.3rem', fontWeight: '900', letterSpacing: '6px', textAlign: 'center', outline: 'none' }}
                />
                <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <ShieldCheck size={16} /> OTP Verified
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem', backgroundColor: '#FFFBEB', padding: '0.85rem', borderRadius: '12px', border: '1px solid #FDE68A' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '800', color: '#92400E' }}>
                <input
                  type="checkbox"
                  checked={fastingChecked}
                  onChange={(e) => setFastingChecked(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#006B70' }}
                />
                Confirmed: Patient is 10-12 hours fasting (Water only consumed).
              </label>
            </div>

            <button
              onClick={() => setStep(isUnpaid && !paymentDone ? 2 : 3)}
              style={{ width: '100%', padding: '0.85rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '0.95rem', cursor: 'pointer' }}
            >
              Verify Patient & Proceed →
            </button>
          </div>
        )}

        {/* Step 2: Dynamic Razorpay Doorstep QR (if unpaid) */}
        {step === 2 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', backgroundColor: '#ECFDF5', color: '#065F46', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: '900' }}>
                DYNAMIC RAZORPAY UPI QR
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0F172A', marginTop: '0.5rem' }}>
                ₹{activePickupModal.amount || 899}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Order Ref: {activePickupModal.id} • MedMarg PayPOS</div>

              {/* Dynamic QR Display */}
              <div style={{ margin: '1rem auto', width: '180px', height: '180px', backgroundColor: '#FFF', padding: '10px', borderRadius: '12px', border: '2px dashed #006B70', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <QrCode size={140} color="#004D40" />
                <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#004D40', marginTop: '4px' }}>SCAN WITH ANY UPI APP</div>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '700' }}>
                Supports Google Pay • PhonePe • Paytm • BHIM • Cred UPI
              </div>
            </div>

            <button
              onClick={() => {
                setPaymentDone(true);
                setStep(3);
              }}
              style={{ width: '100%', padding: '0.85rem', backgroundColor: '#059669', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <CheckCircle2 size={18} /> Confirm ₹{activePickupModal.amount || 899} Payment Received
            </button>
          </div>
        )}

        {/* Step 3: Vacutainer Barcode Scanning */}
        {step === 3 && (
          <div>
            <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem', fontWeight: '700' }}>
              Scan and bind each required tube barcode to this patient order:
            </div>

            {/* Required Tubes Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
              {requiredTubes.map((tube, i) => {
                const scanned = scannedTubes[tube];
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: scanned ? '#ECFDF5' : '#F8FAFC', borderRadius: '10px', border: scanned ? '1.5px solid #059669' : '1px solid #CBD5E1' }}>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: '900', color: '#0F172A' }}>🧪 {tube}</div>
                      <div style={{ fontSize: '0.75rem', color: scanned ? '#059669' : '#64748B', fontWeight: '800', marginTop: '0.15rem' }}>
                        {scanned ? `✓ Barcode: ${scanned}` : '⏳ Pending Barcode Scan'}
                      </div>
                    </div>
                    {scanned && <CheckCircle2 size={20} color="#059669" />}
                  </div>
                );
              })}
            </div>

            {/* Quick Barcode Scanner simulator */}
            <form onSubmit={handleAddBarcode} style={{ backgroundColor: '#F1F5F9', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                Scan / Enter Vacutainer Barcode:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  placeholder="e.g. MM-SST-9912"
                  style={{ flex: 1, padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', fontWeight: '800', outline: 'none' }}
                />
                <button
                  type="submit"
                  style={{ padding: '0.65rem 1rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '900', cursor: 'pointer' }}
                >
                  + Add
                </button>
              </div>
            </form>

            <button
              onClick={handleFinalSubmit}
              style={{ width: '100%', padding: '0.85rem', backgroundColor: '#059669', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <CheckCircle2 size={18} /> Seal Tubes & Log Cold-Chain (4.2°C)
            </button>
          </div>
        )}

        {/* Step 4: Collection Complete */}
        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <CheckCircle2 size={44} color="#059669" />
            </div>
            
            <h4 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0F172A' }}>
              Sample Collected & Sealed!
            </h4>
            
            <p style={{ color: '#475569', fontSize: '0.88rem', marginTop: '0.4rem', maxWidth: '380px', margin: '0.4rem auto 1.5rem' }}>
              Vacutainer barcodes linked to order <strong>{activePickupModal.id}</strong>. Placed into IoT Cold-Chain bag at <strong>{coldTemp}</strong>.
            </p>

            <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1.5rem', textAlign: 'left' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '800' }}>DISPATCH SUMMARY</div>
              <div style={{ fontSize: '0.85rem', color: '#0F172A', fontWeight: '800', marginTop: '0.2rem' }}>
                • Patient: {activePickupModal.patientName}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#059669', fontWeight: '800' }}>
                • Payment: {isUnpaid ? 'Paid at Doorstep (₹' + (activePickupModal.amount || 899) + ')' : 'Paid Online'}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#006B70', fontWeight: '800' }}>
                • Destination: MedMarg Central NABL Reference Lab
              </div>
            </div>

            <button
              onClick={() => setActivePickupModal(null)}
              style={{ width: '100%', padding: '0.85rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '0.95rem', cursor: 'pointer' }}
            >
              Done & Return to Dispatch Queue
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
