import React, { useState } from 'react';
import { 
  Building2, 
  Calendar, 
  Clock, 
  CheckCircle, 
  FileText, 
  Upload, 
  ExternalLink,
  Plus
} from 'lucide-react';

export default function ScanCenterDashboard({ user, onSwitchRole, onLogout }) {
  const [bookings, setBookings] = useState([
    {
      id: 'SC-501',
      patient: 'Karan Mehra',
      scan: 'MRI Brain (Plain + Angio)',
      machine: 'Siemens 3.0 Tesla Silent MRI',
      slot: 'Today, 05:00 PM',
      prepStatus: 'Metal checklist cleared • Fasting verified',
      status: 'Ready for Scan Room',
      driveLink: ''
    }
  ]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ backgroundColor: '#155E75', color: '#FFF', padding: '0.85rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#06B6D4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            <Building2 size={20} color="#FFF" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', lineHeight: 1.1 }}>Radiology & Scanning Center Console</h2>
            <span style={{ fontSize: '0.75rem', color: '#CFFAFE' }}>{user?.org || 'Aarthi Scans & Labs (3.0T MRI Center)'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={onSwitchRole} style={{ background: '#06B6D4', border: 'none', color: '#FFF', padding: '0.35rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}>
            Switch Role
          </button>
          <button onClick={onLogout} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: '#FFF', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: '1100px', margin: '2rem auto', width: '100%', padding: '0 1rem', flex: 1 }}>
        <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.3rem' }}>Machine Slot Allocation & Appointments</h3>
        <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.5rem' }}>Schedule 3.0T MRI, CT Scan & Ultrasound slots with patient safety checklists</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {bookings.map((b) => (
            <div key={b.id} style={{ backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <strong style={{ fontSize: '1.15rem', color: '#0F172A' }}>{b.patient}</strong>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#CFFAFE', color: '#0E7490', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '700' }}>{b.id}</span>
                </div>
                <div style={{ color: '#0E7490', fontWeight: '700', fontSize: '1rem', marginTop: '0.3rem' }}>{b.scan}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Machine: <strong>{b.machine}</strong> • Slot: <strong>{b.slot}</strong></div>
                <div style={{ fontSize: '0.8rem', color: '#10B981', marginTop: '0.3rem', fontWeight: '600' }}>✓ {b.prepStatus}</div>
              </div>

              <div>
                <button style={{ padding: '0.6rem 1.2rem', backgroundColor: '#0E7490', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>
                  Upload DICOM / Scan Report (Drive)
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
