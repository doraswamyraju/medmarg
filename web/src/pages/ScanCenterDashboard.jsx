import React, { useState } from 'react';
import ScanCenterAppointmentsTab from '../components/scancenter/ScanCenterAppointmentsTab';

export default function ScanCenterDashboard({ user, onSwitchRole, onLogout }) {
  const [scanAppointments, setScanAppointments] = useState([
    { id: 'SCAN-201', patient: 'Rahul Sharma', phone: '+91 98765 43210', scanType: 'Chest HRCT Scan (16-Slice)', slot: 'Today, 11:30 AM', amount: 2499, status: 'Confirmed Appointment' },
    { id: 'SCAN-202', patient: 'K. Srinivasa Rao', phone: '+91 98765 88990', scanType: 'Brain MRI 1.5T with Contrast', slot: 'Today, 02:00 PM', amount: 5500, status: 'Slot Booked' }
  ]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header style={{ backgroundColor: '#004D40', color: '#FFF', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '4px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="MedMarg" style={{ height: '28px', objectFit: 'contain' }} />
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '900' }}>RADIOLOGY & SCAN HUB</span>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '900' }}>Sri Diagnostics & Imaging Center</h2>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={onSwitchRole} style={{ padding: '0.45rem 0.85rem', backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFF', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}>Switch Portal</button>
          <button onClick={onLogout} style={{ padding: '0.45rem 0.85rem', backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}>Logout</button>
        </div>
      </header>

      <main style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <ScanCenterAppointmentsTab scanAppointments={scanAppointments} />
      </main>
    </div>
  );
}
