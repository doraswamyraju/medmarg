import React from 'react';
import { User, Phone, MapPin, Shield, CheckCircle2 } from 'lucide-react';

export default function PatientProfileTab({ user, onLogout }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '700px' }}>
      
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '22px', padding: '2rem', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#004D40', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: '900' }}>
            {user?.name ? user.name[0].toUpperCase() : 'R'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A' }}>{user?.name || 'Rahul Sharma'}</h2>
            <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.2rem' }}>📞 {user?.phone || user?.identifier || '+91 98765 43210'} • Patient Account</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700', display: 'block', marginBottom: '0.3rem' }}>Default Home Address</label>
            <div style={{ padding: '0.85rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.9rem', color: '#0F172A', fontWeight: '600' }}>
              📍 Plot 42, Air Bypass Road, Tirupati, Andhra Pradesh - 517501
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700', display: 'block', marginBottom: '0.3rem' }}>Age & Gender</label>
            <div style={{ padding: '0.85rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.9rem', color: '#0F172A', fontWeight: '600' }}>
              34 Years • Male
            </div>
          </div>

          <button
            onClick={onLogout}
            style={{ marginTop: '1rem', padding: '0.85rem', backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            Sign Out of MedMarg Patient Console
          </button>
        </div>
      </div>

    </div>
  );
}
