import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, TrendingUp, Users, DollarSign } from 'lucide-react';

export default function AdminDashboard({ user, onSwitchRole, onLogout }) {
  const [pendingLabs, setPendingLabs] = useState([
    {
      id: 'LAB-REG-104',
      name: 'Star Diagnostics & Pathology Hub',
      city: 'Bangalore (Whitefield)',
      nablCertNo: 'NABL-BLR-2026-981',
      status: 'Pending NABL Verification'
    }
  ]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ backgroundColor: '#991B1B', color: '#FFF', padding: '0.85rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            <ShieldCheck size={20} color="#FFF" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', lineHeight: 1.1 }}>MedMarg Super Admin Console</h2>
            <span style={{ fontSize: '0.75rem', color: '#FECACA' }}>Platform Governance, Lab Audits & Commission Settlements</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={onSwitchRole} style={{ background: '#EF4444', border: 'none', color: '#FFF', padding: '0.35rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}>
            Switch Role
          </button>
          <button onClick={onLogout} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: '#FFF', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: '1100px', margin: '2rem auto', width: '100%', padding: '0 1rem', flex: 1 }}>
        <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0F172A', marginBottom: '1.5rem' }}>Partner Lab Accreditation & Verification Queue</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pendingLabs.map((lab) => (
            <div key={lab.id} style={{ backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <strong style={{ fontSize: '1.15rem', color: '#0F172A' }}>{lab.name}</strong>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#FEE2E2', color: '#991B1B', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '700' }}>{lab.status}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.25rem' }}>Location: {lab.city} • NABL Cert No: <strong>{lab.nablCertNo}</strong></div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={{ padding: '0.6rem 1.2rem', backgroundColor: '#10B981', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={16} /> Approve & Onboard Lab
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
