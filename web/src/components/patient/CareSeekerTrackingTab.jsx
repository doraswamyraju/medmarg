import React from 'react';
import { 
  Activity, 
  MapPin, 
  Thermometer, 
  PhoneCall, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Building2,
  Lock,
  Sparkles,
  AlertCircle,
  MessageCircle,
  Navigation
} from 'lucide-react';
import CareSeekerRouteMap from './CareSeekerRouteMap';

export default function CareSeekerTrackingTab({ 
  activeOrder, 
  allOrders = [], 
  onSelectOrder = () => {},
  handleOrderCall = () => {} 
}) {
  const currentOrder = activeOrder || allOrders[0] || {
    id: 'MM-LAB-9842',
    date: '31 Aug 2026',
    slot: '07:30 AM - 08:30 AM',
    address: 'Plot 42, Air Bypass Road, Tirupati, AP - 517501',
    phleboName: 'Ramesh Kumar (Certified Phlebotomist)',
    phleboPhone: '+91 98765 11223',
    status: 'ENROUTE',
    eta: '14 Mins',
    tempTelemetry: '3.8°C (Optimal Cold-Chain)',
    handoverOtp: '4821',
    items: [
      { name: 'MedMarg Master Health Checkup (Comprehensive)', price: 1499 },
      { name: 'Thyroid Profile Total (T3/T4/TSH)', price: 299 }
    ],
    totalAmount: 1798,
    paymentStatus: 'PAID'
  };

  const steps = [
    { key: 'BOOKED', label: 'Order Booked', desc: 'Confirmed by Lab Hub', done: true },
    { key: 'ASSIGNED', label: 'Phlebotomist Assigned', desc: 'Vaccinated & Certified', done: true },
    { key: 'ENROUTE', label: 'Enroute to Doorstep', desc: currentOrder.eta ? `ETA: ${currentOrder.eta}` : 'On the way', done: ['ENROUTE', 'SAMPLE_COLLECTED', 'IN_LAB', 'COMPLETED'].includes(currentOrder.status) },
    { key: 'SAMPLE_COLLECTED', label: 'Sample Collected', desc: 'Barcoded vacutainers', done: ['SAMPLE_COLLECTED', 'IN_LAB', 'COMPLETED'].includes(currentOrder.status) },
    { key: 'IN_LAB', label: 'Processing in Lab', desc: 'NABL Certified Hub', done: ['IN_LAB', 'COMPLETED'].includes(currentOrder.status) },
    { key: 'COMPLETED', label: 'Report Generated', desc: 'PDF in Health Vault', done: currentOrder.status === 'COMPLETED' }
  ];

  const handleWhatsAppPhlebo = () => {
    const msg = encodeURIComponent(`Hello Ramesh Kumar, I am tracking my MedMarg diagnostic order #${currentOrder.id}. My location is ${currentOrder.address}.`);
    window.open(`https://wa.me/919876511223?text=${msg}`, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Multi-Order Selector */}
      {allOrders.length > 1 && (
        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {allOrders.map((ord) => {
            const isSel = ord.id === currentOrder.id;
            return (
              <button
                key={ord.id}
                onClick={() => onSelectOrder(ord)}
                style={{
                  padding: '0.6rem 1.1rem',
                  borderRadius: '12px',
                  border: isSel ? '2px solid #006B70' : '1.5px solid #CBD5E1',
                  backgroundColor: isSel ? '#006B70' : '#FFFFFF',
                  color: isSel ? '#FFFFFF' : '#334155',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>Order #{ord.id}</span>
                <span style={{ fontSize: '0.72rem', padding: '0.1rem 0.45rem', borderRadius: '6px', backgroundColor: isSel ? 'rgba(255,255,255,0.2)' : '#F1F5F9', color: isSel ? '#FFF' : '#64748B' }}>
                  {ord.status || 'ACTIVE'}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Top Banner with Handover Security OTP */}
      <div style={{
        backgroundColor: '#004D40',
        borderRadius: '24px',
        padding: '2rem',
        color: '#FFFFFF',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        alignItems: 'center',
        boxShadow: '0 16px 36px -10px rgba(0,77,64,0.35)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '900', marginBottom: '0.5rem' }}>
            <Sparkles size={14} /> LIVE DISPATCH RADAR • {currentOrder.id}
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: '900', margin: 0, lineHeight: 1.25 }}>
            {currentOrder.status === 'COMPLETED' ? 'Sample Processed & Reports Ready' : 'Phlebotomist Enroute to Your Doorstep'}
          </h2>
          <div style={{ fontSize: '0.88rem', color: '#80CBC4', marginTop: '0.4rem', lineHeight: 1.4 }}>
            📍 {currentOrder.address}
          </div>
          <div style={{ fontSize: '0.82rem', color: '#E0F2F1', marginTop: '0.25rem' }}>
            Scheduled Slot: <strong>{currentOrder.slot}</strong>
          </div>
        </div>

        {/* 4-Digit Doorstep Handover Security OTP Card */}
        <div style={{
          backgroundColor: '#003830',
          borderRadius: '18px',
          padding: '1.25rem 1.5rem',
          border: '1.5px solid #006B70',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '0.35rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#FBBF24', fontWeight: '800' }}>
            <Lock size={14} /> DOORSTEP HANDOVER OTP
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '900', letterSpacing: '6px', color: '#FFFFFF', fontFamily: 'monospace' }}>
            {currentOrder.handoverOtp || '4821'}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#80CBC4' }}>
            Share this 4-digit OTP with your phlebotomist at doorstep to verify sample collection
          </div>
        </div>
      </div>

      {/* DEDICATED LIVE PHLEBOTOMIST ROUTE MAP (NO ADMIN POLYGONS) */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '22px', padding: '1.5rem', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
              Live GPS Radar & Phlebotomist Navigation
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
              Real-time street location, route mapping & cold-chain container telemetry.
            </p>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#059669', backgroundColor: '#D1FAE5', padding: '0.3rem 0.75rem', borderRadius: '20px', fontWeight: '800' }}>
            ● IoT Cold-Chain: {currentOrder.tempTelemetry || '3.8°C (Optimal 2°C - 8°C)'}
          </span>
        </div>

        {/* Clean dedicated turn-by-turn map */}
        <CareSeekerRouteMap
          height="380px"
          eta={currentOrder.eta || '14 Mins'}
          distanceKm="1.8 km"
        />
      </div>

      {/* Live Order Stepper */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '22px', padding: '1.75rem', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', marginBottom: '1.25rem' }}>
          Diagnostic Pipeline Telemetry
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', position: 'relative' }}>
          {steps.map((st, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', opacity: st.done ? 1 : 0.4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: st.done ? '#006B70' : '#E2E8F0',
                  color: st.done ? '#FFF' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: '900'
                }}>
                  {st.done ? <CheckCircle2 size={16} /> : idx + 1}
                </div>
                <div style={{ flex: 1, height: '2px', backgroundColor: st.done ? '#006B70' : '#E2E8F0' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: '800', color: st.done ? '#0F172A' : '#64748B' }}>
                  {st.label}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.1rem' }}>
                  {st.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phlebotomist & Order Summary Bottom Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        
        {/* Phlebotomist Card */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#E0F2F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>
              👨‍⚕️
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#006B70', fontWeight: '800' }}>ASSIGNED PHLEBOTOMIST</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A', marginTop: '0.1rem' }}>
                {currentOrder.phleboName}
              </h4>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.15rem' }}>
                Govt Reg: AP-PMC-89102 • Double Vaccinated • 4.9★
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                if (currentOrder.phleboPhone) {
                  window.open(`tel:${currentOrder.phleboPhone.replace(/[^0-9+]/g, '')}`, '_self');
                } else {
                  handleOrderCall();
                }
              }}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                backgroundColor: '#006B70',
                color: '#FFF',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 12px rgba(0,107,112,0.2)'
              }}
            >
              <PhoneCall size={16} /> Call Collector
            </button>

            <button
              onClick={handleWhatsAppPhlebo}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                backgroundColor: '#25D366',
                color: '#FFF',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 12px rgba(37,211,102,0.2)'
              }}
            >
              <MessageCircle size={16} /> WhatsApp
            </button>
          </div>
        </div>

        {/* Order Items & Payment Info */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0F172A' }}>Ordered Tests ({currentOrder.items?.length || 1})</span>
              <span style={{ fontSize: '0.72rem', backgroundColor: '#D1FAE5', color: '#047857', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: '800' }}>
                {currentOrder.paymentStatus || 'PAID'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {(currentOrder.items || []).map((itm, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#475569' }}>
                  <span>{typeof itm === 'string' ? itm : itm.name}</span>
                  <span style={{ fontWeight: '700', color: '#0F172A' }}>₹{itm.price || (currentOrder.totalAmount ? Math.round(currentOrder.totalAmount / (currentOrder.items.length || 1)) : 999)}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.65rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748B' }}>Total Amount</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#006B70' }}>₹{currentOrder.totalAmount || 1798}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
