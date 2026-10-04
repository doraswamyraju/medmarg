import React from 'react';

export default function LabsManagementTab({ labPartners }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#FFF' }}>Regional NABL Processing Labs</h2>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Internal routing of diagnostic samples based on lab accreditation and region.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {labPartners.map(lab => (
          <div key={lab.id} style={{ backgroundColor: '#1E293B', borderRadius: '18px', border: '1px solid #334155', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', backgroundColor: '#E0F2F1', color: '#006B70', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '800' }}>
                {lab.nabl}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: '700' }}>● {lab.status}</span>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#FFF', marginTop: '0.5rem' }}>{lab.name}</h3>
            <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: '0.2rem' }}>📍 {lab.city} • {lab.type}</div>

            <div style={{ marginTop: '1.25rem', padding: '0.85rem', backgroundColor: '#0F172A', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span>Active Routed Orders: <strong style={{ color: '#FBBF24' }}>{lab.activeOrders}</strong></span>
              <span>Margin: <strong style={{ color: '#67E8F9' }}>{lab.assignedMargin}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
