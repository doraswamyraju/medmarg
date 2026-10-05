import React from 'react';

export default function PartnerQueueTab({
  partnerQueue = [],
  setPartnerQueue = () => {},
  API_BASE,
  safeFetch
}) {
  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A' }}>Healthcare Partner Pre-Registration Applications Desk</h2>
        <p style={{ color: '#64748B', fontSize: '0.85rem' }}>Applications submitted by Doctors, Diagnostic Labs, Scan Centers, and Health Coaches via the Landing Page footer.</p>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>
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
              <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '1rem 1.25rem', fontWeight: '800', color: '#0F172A' }}>{p.name}</td>
                <td style={{ padding: '1rem', color: '#006B70', fontWeight: '700' }}>{p.type}</td>
                <td style={{ padding: '1rem', color: '#334155' }}>📍 {p.city}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ color: '#0F172A', fontWeight: '600' }}>{p.phone}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{p.email}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '800', backgroundColor: p.status === 'ONBOARDED' ? '#DCFCE7' : '#FEF3C7', color: p.status === 'ONBOARDED' ? '#15803D' : '#B45309' }}>
                    {p.status}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                  {p.status === 'PRE_REGISTERED' ? (
                    <button
                      onClick={async () => {
                        try {
                          if (safeFetch && API_BASE) {
                            await safeFetch(`${API_BASE}/api/v1/admin/partners/onboard`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: p.id })
                            });
                          }
                        } catch (e) {}
                        setPartnerQueue(prev => prev.map(item => item.id === p.id ? { ...item, status: 'ONBOARDED' } : item));
                      }}
                      style={{ padding: '0.4rem 0.85rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,107,112,0.2)' }}
                    >
                      Approve & Onboard
                    </button>
                  ) : (
                    <span style={{ color: '#059669', fontSize: '0.8rem', fontWeight: '800' }}>✓ Active Partner</span>
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
