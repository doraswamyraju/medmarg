import React from 'react';

export default function OverviewKpiTab({ catalog, partnerQueue }) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: '#1E293B', padding: '1.5rem', borderRadius: '18px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: '700' }}>TOTAL TESTS IN CATALOG</div>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: '#67E8F9', marginTop: '0.3rem' }}>{catalog.tests?.length || 913}</div>
        </div>
        <div style={{ backgroundColor: '#1E293B', padding: '1.5rem', borderRadius: '18px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: '700' }}>TOTAL PROFILES IN CATALOG</div>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: '#FBBF24', marginTop: '0.3rem' }}>{catalog.profiles?.length || 87}</div>
        </div>
        <div style={{ backgroundColor: '#1E293B', padding: '1.5rem', borderRadius: '18px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: '700' }}>ACTIVE PACKAGES</div>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: '#34D399', marginTop: '0.3rem' }}>{catalog.packages?.length || 4}</div>
        </div>
        <div style={{ backgroundColor: '#1E293B', padding: '1.5rem', borderRadius: '18px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: '700' }}>HEALTHCARE PARTNERS QUEUE</div>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: '#A78BFA', marginTop: '0.3rem' }}>{partnerQueue?.length || 0}</div>
        </div>
      </div>
    </div>
  );
}
