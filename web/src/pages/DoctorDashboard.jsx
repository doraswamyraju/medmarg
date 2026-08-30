import React, { useState } from 'react';
import { 
  Stethoscope, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  CheckCircle, 
  MapPin,
  ExternalLink,
  Plus
} from 'lucide-react';

export default function DoctorDashboard({ user, onSwitchRole, onLogout }) {
  const [appointments, setAppointments] = useState([
    {
      id: 'APT-101',
      patient: 'Kavita Menon',
      ageGender: '42 / Female',
      time: 'Today, 04:30 PM',
      type: 'In-Clinic OPD Consultation',
      reason: 'Type-2 Diabetes 3-month review & Lipid check',
      status: 'Waiting in Clinic Lobby',
      reportsDriveUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view'
    },
    {
      id: 'APT-102',
      patient: 'Rajesh Varma',
      ageGender: '58 / Male',
      time: 'Today, 05:15 PM',
      type: 'In-Clinic OPD Consultation',
      reason: 'Hypertension follow-up',
      status: 'Scheduled',
      reportsDriveUrl: ''
    }
  ]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <nav style={{ backgroundColor: '#5B21B6', color: '#FFF', padding: '0.65rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={onLogout}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '3px 8px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="MedMarg" style={{ height: '30px', objectFit: 'contain' }} />
          </div>
          <span style={{ fontSize: '0.85rem', backgroundColor: 'rgba(255,255,255,0.15)', padding: '0.2rem 0.6rem', borderRadius: '6px', color: '#EDE9FE', fontWeight: '700' }}>
            Doctor OPD Clinic Console
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={onSwitchRole} style={{ background: '#8B5CF6', border: 'none', color: '#FFF', padding: '0.35rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}>
            Switch Role
          </button>
          <button onClick={onLogout} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: '#FFF', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ maxWidth: '1100px', margin: '2rem auto', width: '100%', padding: '0 1rem', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0F172A' }}>Today's In-Clinic Patient Appointments</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Walk-in OPD consultation queue and patient diagnostic history</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {appointments.map((apt) => (
            <div key={apt.id} style={{ backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <strong style={{ fontSize: '1.15rem', color: '#0F172A' }}>{apt.patient}</strong>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>({apt.ageGender})</span>
                  <span style={{ fontSize: '0.75rem', backgroundColor: apt.status.includes('Waiting') ? '#FEF3C7' : '#F1F5F9', color: apt.status.includes('Waiting') ? '#92400E' : '#475569', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '700' }}>
                    {apt.status}
                  </span>
                </div>
                <div style={{ color: '#6D28D9', fontWeight: '600', fontSize: '0.95rem', marginTop: '0.3rem' }}>{apt.reason}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', gap: '0.75rem', marginTop: '0.3rem' }}>
                  <span>⏰ Slot: <strong>{apt.time}</strong></span>
                  <span>• Type: <strong>{apt.type}</strong></span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {apt.reportsDriveUrl && (
                  <a
                    href={apt.reportsDriveUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 0.9rem', backgroundColor: '#EDE9FE', color: '#6D28D9', borderRadius: '8px', textDecoration: 'none', fontWeight: '700', fontSize: '0.85rem' }}
                  >
                    <FileText size={16} /> View Lab Reports (Drive) <ExternalLink size={14} />
                  </a>
                )}
                <button style={{ padding: '0.6rem 1.2rem', backgroundColor: '#6D28D9', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>
                  Open Rx Pad
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
