import React, { useState } from 'react';
import { Pill } from 'lucide-react';
import PharmacyOrdersTab from '../components/pharmacy/PharmacyOrdersTab';

export default function PharmacyDashboard({ user, onSwitchRole, onLogout }) {
  const [pharmacyOrders, setPharmacyOrders] = useState([
    { id: 'PHARM-101', patient: 'Rahul Sharma', medicines: 'Metformin 500mg, Atorvastatin 10mg', address: 'Plot 42, Air Bypass Rd, Tirupati', amount: 340, status: 'Packing Dispense' },
    { id: 'PHARM-102', patient: 'Lakshmi Devi', medicines: 'Thyronorm 50mcg, Calcium D3', address: 'Gandhi Rd, Tirupati', amount: 280, status: 'Dispatched Rider' }
  ]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header style={{ backgroundColor: '#004D40', color: '#FFF', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '4px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="MedMarg" style={{ height: '28px', objectFit: 'contain' }} />
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '900' }}>PHARMACY PORTAL</span>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '900' }}>MedMarg Partner Retail Pharmacy</h2>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={onSwitchRole} style={{ padding: '0.45rem 0.85rem', backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFF', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}>Switch Portal</button>
          <button onClick={onLogout} style={{ padding: '0.45rem 0.85rem', backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}>Logout</button>
        </div>
      </header>

      <main style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <PharmacyOrdersTab pharmacyOrders={pharmacyOrders} />
      </main>
    </div>
  );
}
