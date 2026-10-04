import React from 'react';
import { Building2 } from 'lucide-react';

export default function ScanCenterAppointmentsTab({ scanAppointments }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A' }}>Radiology & MRI Scan Appointments Queue</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {scanAppointments.map(app => (
          <div key={app.id} style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', padding: '1.5rem', border: '1.5px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#0284C7', fontWeight: '800' }}>{app.id} • {app.patient} ({app.phone})</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>🩻 {app.scanType}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.15rem' }}>Slot: {app.slot}</div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#006B70' }}>₹{app.amount}</div>
              <span style={{ fontSize: '0.75rem', backgroundColor: '#E0F2FE', color: '#0369A1', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '800', marginTop: '0.3rem', display: 'inline-block' }}>
                {app.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
