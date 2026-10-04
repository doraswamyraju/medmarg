import React from 'react';

export default function StockInventoryTab({
  inventoryStock,
  indents,
  setIndents,
  API_BASE,
  safeFetch
}) {
  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#FFF' }}>Central Phlebotomy Stock & Tube Indent Approvals</h2>
        <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Monitor Vacutainer SST/EDTA blood collection tubes, biohazard bags, and approve agent supply indents.</p>
      </div>

      {/* Stock Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {inventoryStock.map(stk => (
          <div key={stk.code} style={{ backgroundColor: '#1E293B', borderRadius: '16px', border: '1px solid #334155', padding: '1.25rem' }}>
            <span style={{ fontSize: '0.72rem', color: '#67E8F9', fontWeight: '800' }}>{stk.code} • {stk.category}</span>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#FFF', marginTop: '0.35rem' }}>{stk.name}</h4>
            <div style={{ marginTop: '0.75rem', fontSize: '1.4rem', fontWeight: '900', color: stk.stock <= stk.reorderLevel ? '#F59E0B' : '#34D399' }}>
              {stk.stock.toLocaleString()} <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{stk.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Indents Table */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FFF', marginBottom: '1rem' }}>📦 Phlebotomist Supply Indent Requests</h3>
      <div style={{ backgroundColor: '#1E293B', borderRadius: '20px', border: '1px solid #334155', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#0F172A', borderBottom: '1px solid #334155', color: '#94A3B8', fontSize: '0.78rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '1rem 1.25rem' }}>Indent ID</th>
              <th style={{ padding: '1rem' }}>Phlebotomist Agent</th>
              <th style={{ padding: '1rem' }}>Requested Items</th>
              <th style={{ padding: '1rem' }}>Request Date</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {indents.map(ind => (
              <tr key={ind.id} style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', color: '#67E8F9', fontWeight: '800' }}>{ind.id}</td>
                <td style={{ padding: '1rem', fontWeight: '800', color: '#FFF' }}>{ind.agentName}</td>
                <td style={{ padding: '1rem', color: '#CBD5E1' }}>{ind.requestedItems}</td>
                <td style={{ padding: '1rem', color: '#94A3B8' }}>{ind.date}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '800', backgroundColor: ind.status === 'APPROVED_DISPATCHED' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', color: ind.status === 'APPROVED_DISPATCHED' ? '#34D399' : '#FBBF24' }}>
                    {ind.status}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                  {ind.status === 'PENDING_APPROVAL' ? (
                    <button
                      onClick={async () => {
                        try {
                          await safeFetch(`${API_BASE}/api/v1/admin/indents/approve`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: ind.id })
                          });
                        } catch (e) {}
                        setIndents(prev => prev.map(i => i.id === ind.id ? { ...i, status: 'APPROVED_DISPATCHED' } : i));
                      }}
                      style={{ padding: '0.4rem 0.85rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}
                    >
                      Approve & Dispatch
                    </button>
                  ) : (
                    <span style={{ color: '#34D399', fontSize: '0.8rem', fontWeight: '800' }}>✓ Dispatched</span>
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
