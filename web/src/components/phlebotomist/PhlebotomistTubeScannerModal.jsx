import React from 'react';
import { QrCode, CheckCircle2, Thermometer } from 'lucide-react';

export default function PhlebotomistTubeScannerModal({ 
  activePickupModal, 
  setActivePickupModal, 
  scanStep, 
  setScanStep, 
  scannedBarcode, 
  setScannedBarcode, 
  completedPickups, 
  setCompletedPickups 
}) {
  if (!activePickupModal) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 120, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', maxWidth: '520px', width: '100%', padding: '2rem', border: '2px solid #006B70' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0F172A' }}>
            {scanStep === 1 && 'Step 1: Patient & Fasting Verification'}
            {scanStep === 2 && 'Step 2: Scan Vacutainer Barcode'}
            {scanStep === 3 && 'Step 3: Sample Collection Complete!'}
          </h3>
          <button onClick={() => setActivePickupModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B' }}>✕</button>
        </div>

        {scanStep === 1 && (
          <div>
            <div style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1rem' }}>
              Verify identity: <strong>{activePickupModal.patientName}</strong> ({activePickupModal.age})
            </div>
            <button
              onClick={() => setScanStep(2)}
              style={{ width: '100%', padding: '0.85rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' }}
            >
              Verify Patient & Proceed to Scan
            </button>
          </div>
        )}

        {scanStep === 2 && (
          <div>
            <label style={{ fontSize: '0.82rem', color: '#475569', fontWeight: '800', display: 'block', marginBottom: '0.35rem' }}>
              Scan / Enter Vacutainer Tube Barcode (e.g. MM-89102-SST):
            </label>
            <input
              type="text"
              value={scannedBarcode}
              onChange={(e) => setScannedBarcode(e.target.value)}
              placeholder="MM-89102-SST"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '2px solid #006B70', fontSize: '1rem', fontWeight: '800', outline: 'none', marginBottom: '1rem' }}
            />
            <button
              onClick={() => {
                setCompletedPickups(new Set([...completedPickups, activePickupModal.id]));
                setScanStep(3);
              }}
              style={{ width: '100%', padding: '0.85rem', backgroundColor: '#059669', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' }}
            >
              Confirm Barcode & Seal Sample
            </button>
          </div>
        )}

        {scanStep === 3 && (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle2 size={48} color="#059669" style={{ margin: '0 auto 1rem' }} />
            <h4 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A' }}>Collection Completed!</h4>
            <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '0.3rem' }}>
              Sample sealed and logged into IoT Cold Carry Bag (2-8°C telemetry active).
            </p>
            <button
              onClick={() => setActivePickupModal(null)}
              style={{ marginTop: '1.25rem', padding: '0.75rem 1.5rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
            >
              Done & Return to Queue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
