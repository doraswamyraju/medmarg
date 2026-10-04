import React from 'react';
import { Phone, Navigation, QrCode, CheckCircle2, Clock } from 'lucide-react';

export default function PhlebotomistPickupsTab({ 
  pickups, 
  completedPickups, 
  setActivePickupModal, 
  setScanStep, 
  setScannedBarcode 
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A' }}>Assigned Doorstep Collection Queue</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {pickups.map(pk => {
          const isDone = completedPickups.has(pk.id);

          return (
            <div key={pk.id} style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.5rem', border: isDone ? '1.5px solid #059669' : '1.5px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', backgroundColor: isDone ? '#D1FAE5' : '#FEF3C7', color: isDone ? '#059669' : '#B45309', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: '900' }}>
                    {isDone ? '✓ SAMPLE COLLECTED & SEALED' : `SLOT: ${pk.timeSlot}`}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700' }}>{pk.id}</span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', marginTop: '0.3rem' }}>
                  {pk.patientName} ({pk.age})
                </h3>
                <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '0.2rem' }}>📍 {pk.address}</div>
                <div style={{ fontSize: '0.84rem', color: '#006B70', fontWeight: '800', marginTop: '0.5rem' }}>🧪 Tests: {pk.tests}</div>
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '0.5rem' }}>
                {!isDone ? (
                  <button
                    onClick={() => {
                      setActivePickupModal(pk);
                      setScanStep(1);
                      setScannedBarcode('');
                    }}
                    style={{ flex: 1, padding: '0.7rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                  >
                    <QrCode size={16} /> Scan Tubes & Collect
                  </button>
                ) : (
                  <div style={{ fontSize: '0.88rem', color: '#059669', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={18} /> Barcodes Sealed & Transferred
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
