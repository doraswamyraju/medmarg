import React from 'react';

export default function PartnerQueueTab({
  partnerQueue,
  setPartnerQueue,
  API_BASE,
  safeFetch
}) {
  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#FFF' }}>Healthcare Partner Pre-Registration Applications Desk</h2>
        <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Applications submitted by Doctors, Diagnostic Labs, Scan Centers, and Health Coaches via the Landing Page footer.</p>
      </div>

      <div style={{ backgroundColor: '#1E293B', borderRadius: '20px', border: '1px solid #334155', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#0F172A', borderBottom: '1px solid #334155', color: '#94A3B8', fontSize: '0.78rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '1rem 1.25rem' }}>Partner / Practice Name</th>
              <th style={{ padding: '1rem' }}>Category Type</th>
              <th style={{ padding: '1rem' }}>Location</th>
              <th style={{ padding: '1rem' }}>Contact Detail</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {partnerQueue.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '1rem 1.25rem', fontWeight: '800', color: '#FFF' }}>{p.name}</td>
                <td style={{ padding: '1rem', color: '#67E8F9', fontWeight: '700' }}>{p.type}</td>
                <td style={{ padding: '1rem', color: '#CBD5E1' }}>📍 {p.city}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ color: '#FFF' }}>{p.phone}</div>
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{p.email}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '800', backgroundColor: p.status === 'ONBOARDED' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', color: p.status === 'ONBOARDED' ? '#34D399' : '#FBBF24' }}>
                    {p.status}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                  {p.status === 'PRE_REGISTERED' ? (
                    <button
                      onClick={async () => {
                        try {
                          await safeFetch(`${API_BASE}/api/v1/admin/partners/onboard`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: p.id })
                          });
                        } catch (e) {}
                        setPartnerQueue(prev => prev.map(item => item.id === p.id ? { ...item, status: 'ONBOARDED' } : item));
                      }}
                      style={{ padding: '0.4rem 0.85rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}
                    >
                      Approve & Onboard
                    </button>
                  ) : (
                    <span style={{ color: '#34D399', fontSize: '0.8rem', fontWeight: '800' }}>✓ Active Partner</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
