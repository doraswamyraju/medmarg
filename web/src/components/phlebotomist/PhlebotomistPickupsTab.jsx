import React, { useState } from 'react';
import { 
  Phone, 
  Navigation, 
  QrCode, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Search, 
  ArrowRight, 
  CreditCard, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function PhlebotomistPickupsTab({ 
  pickups = [], 
  completedPickups = new Set(), 
  onStartTrip,
  onArriveDoorstep,
  onOpenScanModal,
  onOpenPaymentModal
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ASSIGNED' | 'EN_ROUTE' | 'ARRIVED' | 'DONE'

  // Filtered List
  const filteredPickups = pickups.filter(pk => {
    const isDone = completedPickups.has(pk.id) || pk.status === 'SAMPLE_COLLECTED' || pk.status === 'TRANSFERRED_TO_LAB';
    const isEnRoute = pk.status === 'EN_ROUTE';
    const isArrived = pk.status === 'ARRIVED';
    const isAssigned = !isDone && !isEnRoute && !isArrived;

    if (statusFilter === 'ASSIGNED' && !isAssigned) return false;
    if (statusFilter === 'EN_ROUTE' && !isEnRoute) return false;
    if (statusFilter === 'ARRIVED' && !isArrived) return false;
    if (statusFilter === 'DONE' && !isDone) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = pk.patientName?.toLowerCase().includes(q);
      const matchId = pk.id?.toLowerCase().includes(q);
      const matchPhone = pk.phone?.includes(q);
      const matchAddress = pk.address?.toLowerCase().includes(q);
      return matchName || matchId || matchPhone || matchAddress;
    }

    return true;
  });

  const completedCount = pickups.filter(pk => 
    completedPickups.has(pk.id) || pk.status === 'SAMPLE_COLLECTED' || pk.status === 'TRANSFERRED_TO_LAB'
  ).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Controls Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={14} /> LIVE DISPATCH ROSTER
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700' }}>Doorstep Collections</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A', marginTop: '0.25rem' }}>
            Today's Assigned Doorstep Sample Pickups ({pickups.length})
          </h2>
        </div>

        {/* Progress pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.82rem', backgroundColor: '#FFFFFF', color: '#006B70', padding: '0.45rem 0.85rem', borderRadius: '10px', border: '1.5px solid #006B70', fontWeight: '900' }}>
            Completed: {completedCount} / {pickups.length} Visits
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by patient name, phone, address, or order ID..."
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem 0.65rem 2.4rem',
              borderRadius: '10px',
              border: '1px solid #CBD5E1',
              fontSize: '0.85rem',
              fontWeight: '600',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { key: 'ALL', label: 'All', count: pickups.length },
            { key: 'ASSIGNED', label: 'Scheduled', count: pickups.filter(p => !completedPickups.has(p.id) && p.status !== 'SAMPLE_COLLECTED' && p.status !== 'EN_ROUTE' && p.status !== 'ARRIVED').length },
            { key: 'EN_ROUTE', label: 'En Route', count: pickups.filter(p => p.status === 'EN_ROUTE').length },
            { key: 'ARRIVED', label: 'Arrived', count: pickups.filter(p => p.status === 'ARRIVED').length },
            { key: 'DONE', label: 'Completed', count: completedCount }
          ].map(btn => (
            <button
              key={btn.key}
              onClick={() => setStatusFilter(btn.key)}
              style={{
                padding: '0.5rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: statusFilter === btn.key ? '#006B70' : '#F1F5F9',
                color: statusFilter === btn.key ? '#FFFFFF' : '#475569',
                fontSize: '0.78rem',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {btn.label} ({btn.count})
            </button>
          ))}
        </div>
      </div>

      {/* Modern High-Efficiency List View */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filteredPickups.length === 0 ? (
          <div style={{ backgroundColor: '#FFFFFF', padding: '3rem', borderRadius: '16px', border: '1px dashed #CBD5E1', textAlign: 'center', color: '#64748B' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A' }}>No Pickups Found</div>
            <div style={{ fontSize: '0.85rem', marginTop: '0.35rem' }}>No orders match your search or filter selection.</div>
          </div>
        ) : (
          filteredPickups.map(pk => {
            const isDone = completedPickups.has(pk.id) || pk.status === 'SAMPLE_COLLECTED' || pk.status === 'TRANSFERRED_TO_LAB';
            const isEnRoute = pk.status === 'EN_ROUTE';
            const isArrived = pk.status === 'ARRIVED';
            const isUnpaid = pk.paymentStatus === 'PAY_AT_DOORSTEP' || 
              (typeof pk.amount === 'string' && pk.amount.includes('Collect')) ||
              pk.paymentStatus === 'PENDING_DOORSTEP';

            const amountValue = Number(pk.amount || pk.totalAmount) || 899;

            return (
              <div
                key={pk.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '1.25rem 1.5rem',
                  border: isDone ? '1.5px solid #059669' : isArrived ? '2px solid #006B70' : '1px solid #E2E8F0',
                  boxShadow: isArrived ? '0 4px 16px rgba(0,107,112,0.1)' : '0 2px 6px rgba(0,0,0,0.02)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1.25rem',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* 1. Time Slot & Status Column */}
                <div style={{ minWidth: '150px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: '900',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '6px',
                      backgroundColor: isDone ? '#D1FAE5' : isArrived ? '#E0F2FE' : isEnRoute ? '#FEF3C7' : '#F1F5F9',
                      color: isDone ? '#059669' : isArrived ? '#0284C7' : isEnRoute ? '#D97706' : '#475569'
                    }}>
                      {isDone ? '✓ SEALED' : isArrived ? '📍 ARRIVED' : isEnRoute ? '🛵 EN ROUTE' : 'SCHEDULED'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.92rem', fontWeight: '900', color: '#0F172A' }}>
                    {pk.time || pk.timeSlot || '08:00 AM - 09:00 AM'}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700', marginTop: '0.15rem' }}>
                    Ref: <strong>{pk.id}</strong>
                  </div>

                  <div style={{ fontSize: '0.7rem', color: pk.fastingVerified ? '#059669' : '#B45309', fontWeight: '800', marginTop: '0.25rem' }}>
                    {pk.fastingVerified ? '🍽️ Fasting Compliant' : '☕ Non-Fasting / Random'}
                  </div>
                </div>

                {/* 2. Patient Dossier & Contact Column */}
                <div style={{ flex: 1.5, minWidth: '220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                      {pk.patientName}
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700' }}>
                      ({pk.age || '32M'})
                    </span>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.35rem' }}>
                    <MapPin size={14} color="#006B70" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ lineHeight: '1.3' }}>{pk.address}</span>
                  </div>

                  {/* Call & Maps Action Links */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <a
                      href={`tel:${pk.phone || '+919876543210'}`}
                      style={{
                        padding: '0.3rem 0.65rem',
                        backgroundColor: '#F8FAFC',
                        color: '#006B70',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <Phone size={12} /> {pk.phone || 'Call Patient'}
                    </a>

                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(pk.address || 'Tirupati')}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: '0.3rem 0.65rem',
                        backgroundColor: '#F8FAFC',
                        color: '#0284C7',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <Navigation size={12} /> Google Maps
                    </a>
                  </div>
                </div>

                {/* 3. Tests & Required Vacutainers Column */}
                <div style={{ flex: 1.5, minWidth: '220px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>
                    Tests Ordered
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#004D40', marginTop: '0.15rem', lineHeight: '1.3' }}>
                    {pk.tests || 'Thyrocare Aarogyam Full Body Profile'}
                  </div>

                  {/* Required Vacutainer Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.4rem' }}>
                    {(pk.tubes || ['Yellow SST (Serum)', 'Lavender (EDTA Blood)']).map((tube, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.68rem',
                          backgroundColor: tube.includes('Yellow') || tube.includes('SST') ? '#FEF3C7' : tube.includes('Lavender') || tube.includes('EDTA') ? '#F3E8FF' : '#E0F2FE',
                          color: tube.includes('Yellow') || tube.includes('SST') ? '#92400E' : tube.includes('Lavender') || tube.includes('EDTA') ? '#6B21A8' : '#0369A1',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          fontWeight: '800'
                        }}
                      >
                        🧪 {tube}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 4. Payment Column & Instant Scan to Pay */}
                <div style={{ minWidth: '160px', textAlign: 'center' }}>
                  {isUnpaid ? (
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>
                        ₹{amountValue}
                      </div>
                      <button
                        onClick={() => onOpenPaymentModal && onOpenPaymentModal(pk)}
                        style={{
                          marginTop: '0.35rem',
                          padding: '0.45rem 0.85rem',
                          backgroundColor: '#059669',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: '900',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          boxShadow: '0 2px 6px rgba(5,150,105,0.25)'
                        }}
                      >
                        <QrCode size={13} /> ⚡ Scan to Pay (QR)
                      </button>
                    </div>
                  ) : (
                    <div>
                      <span style={{ fontSize: '0.78rem', backgroundColor: '#ECFDF5', color: '#059669', padding: '0.3rem 0.65rem', borderRadius: '6px', fontWeight: '900', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CheckCircle2 size={14} /> Paid Online (₹{amountValue})
                      </span>
                      <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700', marginTop: '0.25rem' }}>
                        Razorpay Verified
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Field Action Progression Button */}
                <div style={{ minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {!isDone ? (
                    <>
                      {/* Step 1: Start Trip */}
                      {!isEnRoute && !isArrived && (
                        <button
                          onClick={() => onStartTrip && onStartTrip(pk.id)}
                          style={{
                            width: '100%',
                            padding: '0.55rem',
                            backgroundColor: '#F1F5F9',
                            color: '#0F172A',
                            border: '1px solid #CBD5E1',
                            borderRadius: '8px',
                            fontWeight: '800',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem'
                          }}
                        >
                          <Navigation size={13} /> Start Trip
                        </button>
                      )}

                      {/* Step 2: Arrived at Doorstep */}
                      {isEnRoute && !isArrived && (
                        <button
                          onClick={() => onArriveDoorstep && onArriveDoorstep(pk.id)}
                          style={{
                            width: '100%',
                            padding: '0.55rem',
                            backgroundColor: '#E0F2FE',
                            color: '#0369A1',
                            border: '1px solid #BAE6FD',
                            borderRadius: '8px',
                            fontWeight: '900',
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem'
                          }}
                        >
                          <MapPin size={14} /> Mark Arrived at Door
                        </button>
                      )}

                      {/* Step 3: Scan Tubes & OTP Handover */}
                      <button
                        onClick={() => onOpenScanModal(pk)}
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          backgroundColor: '#006B70',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: '900',
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          boxShadow: '0 2px 8px rgba(0,107,112,0.2)'
                        }}
                      >
                        <QrCode size={14} /> Collect & Scan Tubes
                      </button>
                    </>
                  ) : (
                    <div style={{ padding: '0.6rem 0.8rem', backgroundColor: '#ECFDF5', borderRadius: '8px', textAlign: 'center', border: '1px solid #BBF7D0' }}>
                      <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                        <CheckCircle2 size={15} /> Sample Sealed
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#065F46', marginTop: '2px', fontWeight: '700' }}>
                        Cold-Chain 2-8°C Active
                      </div>
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
