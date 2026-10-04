import React from 'react';
import { 
  Activity, 
  MapPin, 
  Thermometer, 
  PhoneCall, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Building2
} from 'lucide-react';
import RealMapView from '../RealMapView';

export default function PatientTrackingTab({ activeOrder, handleOrderCall }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Active Order Card Header */}
      <div style={{ backgroundColor: '#004D40', borderRadius: '22px', padding: '1.75rem', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 8px 24px -6px rgba(0,77,64,0.3)' }}>
        <div>
          <div style={{ fontSize: '0.78rem', color: '#80CBC4', fontWeight: '800' }}>ACTIVE ORDER ID: {activeOrder.id}</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginTop: '0.2rem' }}>Phlebotomist Enroute to Your Location</h2>
          <div style={{ fontSize: '0.85rem', color: '#E0F2F1', marginTop: '0.35rem' }}>📍 {activeOrder.address}</div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.75rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.25rem 0.65rem', borderRadius: '20px', fontWeight: '900', display: 'inline-block' }}>
            ● ETA: {activeOrder.eta}
          </span>
          <div style={{ fontSize: '0.82rem', color: '#80CBC4', marginTop: '0.35rem' }}>Slot: {activeOrder.slot}</div>
        </div>
      </div>

      {/* Real Geographic Map Tracker */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '22px', padding: '1.5rem', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A' }}>Live Phlebotomist Fleet GPS Radar Map</h3>
            <p style={{ fontSize: '0.82rem', color: '#64748B' }}>Real-time location, cold-chain temperature monitoring & route telemetry.</p>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#059669', backgroundColor: '#D1FAE5', padding: '0.25rem 0.65rem', borderRadius: '20px', fontWeight: '800' }}>
            ● IoT Cold-Chain: {activeOrder.tempTelemetry}
          </span>
        </div>

        <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
          <RealMapView height="360px" />
        </div>
      </div>

      {/* Phlebotomist Telemetry Card */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#E0F2F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
            👤
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>{activeOrder.phleboName}</h4>
            <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.15rem' }}>Paramedical Reg: AP-PMC-89102 • Certified Phlebotomist</div>
          </div>
        </div>

        <button
          onClick={handleOrderCall}
          style={{ padding: '0.75rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <PhoneCall size={18} /> Call Collector ({activeOrder.phleboPhone})
        </button>
      </div>

    </div>
  );
}
