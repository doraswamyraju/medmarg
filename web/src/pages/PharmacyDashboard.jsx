import React, { useState } from 'react';
import { Pill, CheckCircle, ExternalLink, Package, ArrowRight } from 'lucide-react';

export default function PharmacyDashboard({ user, onSwitchRole, onLogout }) {
  const [orders, setOrders] = useState([
    {
      id: 'RX-9901',
      patient: 'Anil Gupta',
      driveRxUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view',
      originalMed: 'Lipaglyn 4mg (Saroglitazar)',
      genericMed: 'Saroglitazar 4mg (MedMarg Generic)',
      savings: '53% Savings',
      price: 135,
      status: 'Generic Substituted & Verified'
    }
  ]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ backgroundColor: '#065F46', color: '#FFF', padding: '0.85rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            <Pill size={20} color="#FFF" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', lineHeight: 1.1 }}>Pharmacy & Generic Dispensing Hub</h2>
            <span style={{ fontSize: '0.75rem', color: '#A7F3D0' }}>{user?.org || 'MedPlus Chemist (Generic Certified Partner)'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={onSwitchRole} style={{ background: '#10B981', border: 'none', color: '#FFF', padding: '0.35rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}>
            Switch Role
          </button>
          <button onClick={onLogout} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: '#FFF', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: '1100px', margin: '2rem auto', width: '100%', padding: '0 1rem', flex: 1 }}>
        <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.3rem' }}>Prescription Verification & Generic Substitutions</h3>
        <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.5rem' }}>View patient prescriptions from Google Drive, map generic cost-saving salts, and dispatch packages</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map((ord) => (
            <div key={ord.id} style={{ backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <strong style={{ fontSize: '1.15rem', color: '#0F172A' }}>{ord.patient}</strong>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '700' }}>{ord.id}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                  <span style={{ color: '#64748B', textDecoration: 'line-through', fontSize: '0.9rem' }}>{ord.originalMed}</span>
                  <ArrowRight size={14} color="#10B981" />
                  <span style={{ color: '#065F46', fontWeight: '700', fontSize: '0.95rem' }}>{ord.genericMed}</span>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#10B981', color: '#FFF', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: '700' }}>{ord.savings}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <a
                  href={ord.driveRxUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 0.9rem', backgroundColor: '#D1FAE5', color: '#065F46', borderRadius: '8px', textDecoration: 'none', fontWeight: '700', fontSize: '0.85rem' }}
                >
                  View Rx (Drive) <ExternalLink size={14} />
                </a>
                <button style={{ padding: '0.6rem 1.2rem', backgroundColor: '#065F46', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>
                  Dispatch Package
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
