import React from 'react';
import { PlusCircle } from 'lucide-react';

export default function LiveOrdersDispatchTab({
  orders,
  setShowCreateOrderModal
}) {
  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#FFF' }}>Live Orders & Auto-Dispatch Command Center</h2>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Monitor real-time patient requests, assigned phlebotomists, doorstep collection OTPs, and manual dispatch overrides.</p>
        </div>
        <button
          onClick={() => setShowCreateOrderModal(true)}
          style={{ padding: '0.65rem 1.25rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <PlusCircle size={16} color="#FBBF24" /> Create Test Order
        </button>
      </div>

      <div style={{ backgroundColor: '#1E293B', borderRadius: '20px', border: '1px solid #334155', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#0F172A', borderBottom: '1px solid #334155', color: '#94A3B8', fontSize: '0.78rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '1rem 1.25rem' }}>Order ID</th>
              <th style={{ padding: '1rem' }}>Patient & Location</th>
              <th style={{ padding: '1rem' }}>Tests / Packages</th>
              <th style={{ padding: '1rem' }}>Assigned Agent</th>
              <th style={{ padding: '1rem' }}>Doorstep OTP</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(ord => (
              <tr key={ord.id} style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', color: '#67E8F9', fontWeight: '800' }}>{ord.id}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: '800', color: '#FFF' }}>{ord.patientName}</div>
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>📍 {ord.address}</div>
                </td>
                <td style={{ padding: '1rem', color: '#CBD5E1' }}>{ord.items}</td>
                <td style={{ padding: '1rem', color: '#FBBF24', fontWeight: '700' }}>{ord.assignedAgent}</td>
                <td style={{ padding: '1rem', fontFamily: 'monospace', color: '#34D399', fontWeight: '900' }}>OTP: {ord.otp}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '800', backgroundColor: ord.status === 'EN_ROUTE' ? 'rgba(56,189,248,0.2)' : ord.status === 'SAMPLE_COLLECTED' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', color: ord.status === 'EN_ROUTE' ? '#38BDF8' : ord.status === 'SAMPLE_COLLECTED' ? '#34D399' : '#FBBF24' }}>
                    {ord.status}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                  <button 
                    onClick={() => alert(`Reassigning Order ${ord.id}...`)}
                    style={{ padding: '0.35rem 0.75rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}
                  >
                    Reassign Agent
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
