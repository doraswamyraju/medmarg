import React from 'react';
import { Phone, Navigation, QrCode, CheckCircle2, Clock, MapPin, AlertCircle, Sparkles, DollarSign, ShieldCheck } from 'lucide-react';

export default function PhlebotomistPickupsTab({ 
  pickups = [], 
  completedPickups, 
  onStartTrip,
  onArriveDoorstep,
  onOpenScanModal,
  onOpenPaymentModal
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={14} /> ACTIVE DISPATCH ROSTER
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700' }}>Doorstep Collections</span>
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A', marginTop: '0.25rem' }}>
            Today's Assigned Doorstep Sample Pickups ({pickups.length})
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.82rem', backgroundColor: '#F1F5F9', color: '#334155', padding: '0.4rem 0.85rem', borderRadius: '10px', fontWeight: '800' }}>
            Completed: {completedPickups.size} / {pickups.length}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {pickups.map(pk => {
          const isDone = completedPickups.has(pk.id) || pk.status === 'SAMPLE_COLLECTED' || pk.status === 'TRANSFERRED_TO_LAB';
          const isEnRoute = pk.status === 'EN_ROUTE';
          const isArrived = pk.status === 'ARRIVED';
          const isUnpaid = pk.paymentStatus === 'PAY_AT_DOORSTEP' || (typeof pk.amount === 'string' && pk.amount.includes('Collect'));

          return (
            <div 
              key={pk.id} 
              style={{ 
                backgroundColor: '#FFFFFF', 
                borderRadius: '20px', 
                padding: '1.5rem', 
                border: isDone ? '2px solid #059669' : isArrived ? '2px solid #006B70' : '1.5px solid #E2E8F0', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between', 
                boxShadow: isArrived ? '0 6px 20px rgba(0,107,112,0.12)' : '0 4px 12px rgba(0,0,0,0.03)',
                position: 'relative'
              }}
            >
              <div>
                {/* Status Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    backgroundColor: isDone ? '#D1FAE5' : isArrived ? '#E0F2FE' : isEnRoute ? '#FEF3C7' : '#F1F5F9', 
                    color: isDone ? '#059669' : isArrived ? '#0284C7' : isEnRoute ? '#D97706' : '#475569', 
                    padding: '0.25rem 0.65rem', 
                    borderRadius: '6px', 
                    fontWeight: '900',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}>
                    {isDone ? '✓ SAMPLE COLLECTED & SEALED' : isArrived ? '📍 ARRIVED AT DOORSTEP' : isEnRoute ? '🛵 EN ROUTE TO PATIENT' : `SLOT: ${pk.time || pk.timeSlot || '08:00 AM'}`}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '800' }}>{pk.id}</span>
                </div>

                {/* Patient Information */}
                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A' }}>
                  {pk.patientName} <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '700' }}>({pk.age || '32'})</span>
                </h3>

                <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.35rem', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                  <MapPin size={15} color="#006B70" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>{pk.address}</span>
                </div>

                {/* Contact & Navigation links */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <a
                    href={`tel:${pk.phone || '+919876543210'}`}
                    style={{
                      flex: 1,
                      padding: '0.45rem 0.65rem',
                      backgroundColor: '#F8FAFC',
                      color: '#006B70',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <Phone size={13} /> {pk.phone || 'Call Patient'}
                  </a>

                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(pk.address || 'Tirupati')}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '0.45rem 0.75rem',
                      backgroundColor: '#F8FAFC',
                      color: '#0284C7',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <Navigation size={13} /> Maps
                  </a>
                </div>

                {/* Test details & Tubes */}
                <div style={{ marginTop: '0.85rem', backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Tests Ordered</div>
                  <div style={{ fontSize: '0.84rem', color: '#004D40', fontWeight: '900', marginTop: '0.15rem' }}>
                    {pk.tests || 'Thyrocare Aarogyam 1.3 (104 Parameters)'}
                  </div>

                  {/* Required Vacutainers */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
                    {(pk.tubes || ['Yellow SST (Serum)', 'Lavender (EDTA Blood)']).map((tube, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.7rem',
                          backgroundColor: tube.includes('Yellow') || tube.includes('SST') ? '#FEF3C7' : tube.includes('Lavender') || tube.includes('EDTA') ? '#F3E8FF' : '#E0F2FE',
                          color: tube.includes('Yellow') || tube.includes('SST') ? '#92400E' : tube.includes('Lavender') || tube.includes('EDTA') ? '#6B21A8' : '#0369A1',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          fontWeight: '800'
                        }}
                      >
                        🧪 {tube}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Payment & Fasting Indicators */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', fontSize: '0.78rem' }}>
                  <span style={{ 
                    color: isUnpaid ? '#B45309' : '#059669', 
                    fontWeight: '800', 
                    backgroundColor: isUnpaid ? '#FEF3C7' : '#ECFDF5', 
                    padding: '0.2rem 0.5rem', 
                    borderRadius: '6px' 
                  }}>
                    {isUnpaid ? '💳 Collect via Razorpay QR' : '✓ Paid Online (₹' + (pk.amount || 899) + ')'}
                  </span>

                  {pk.fastingVerified !== undefined && (
                    <span style={{ color: '#64748B', fontWeight: '700' }}>
                      {pk.fastingVerified ? '🍽️ Fasting Compliant' : '☕ Random / Non-Fasting'}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {!isDone ? (
                  <>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {!isEnRoute && !isArrived && (
                        <button
                          onClick={() => onStartTrip && onStartTrip(pk.id)}
                          style={{
                            flex: 1,
                            padding: '0.65rem',
                            backgroundColor: '#F1F5F9',
                            color: '#0F172A',
                            border: '1px solid #CBD5E1',
                            borderRadius: '10px',
                            fontWeight: '800',
                            fontSize: '0.84rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <Navigation size={14} /> Start Trip
                        </button>
                      )}

                      {!isArrived && (
                        <button
                          onClick={() => onArriveDoorstep && onArriveDoorstep(pk.id)}
                          style={{
                            flex: 1,
                            padding: '0.65rem',
                            backgroundColor: '#E0F2FE',
                            color: '#0369A1',
                            border: '1px solid #BAE6FD',
                            borderRadius: '10px',
                            fontWeight: '900',
                            fontSize: '0.84rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <MapPin size={14} /> Arrived at Door
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => onOpenScanModal(pk)}
                      style={{ 
                        width: '100%', 
                        padding: '0.75rem', 
                        backgroundColor: '#006B70', 
                        color: '#FFF', 
                        border: 'none', 
                        borderRadius: '10px', 
                        fontWeight: '900', 
                        fontSize: '0.9rem', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '0.4rem',
                        boxShadow: '0 4px 12px rgba(0,107,112,0.2)'
                      }}
                    >
                      <QrCode size={17} /> Scan Vacutainers & OTP Handover
                    </button>
                  </>
                ) : (
                  <div style={{ fontSize: '0.88rem', color: '#059669', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.5rem', backgroundColor: '#ECFDF5', borderRadius: '10px' }}>
                    <CheckCircle2 size={18} /> Sample Sealed & IoT Cold Chain Active
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
