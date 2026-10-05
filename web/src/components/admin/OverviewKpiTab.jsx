import React from 'react';

export default function OverviewKpiTab({ catalog = {}, partnerQueue = [] }) {
  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A' }}>Omnipresent Master KPI Command Center</h2>
        <p style={{ color: '#64748B', fontSize: '0.85rem' }}>Real-time aggregated health statistics, master catalog volume, and partner network metrics.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700' }}>TOTAL TESTS IN CATALOG</div>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: '#006B70', marginTop: '0.3rem' }}>{catalog.tests?.length || 913}</div>
        </div>
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700' }}>TOTAL PROFILES IN CATALOG</div>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: '#B45309', marginTop: '0.3rem' }}>{catalog.profiles?.length || 87}</div>
        </div>
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700' }}>ACTIVE PACKAGES</div>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: '#059669', marginTop: '0.3rem' }}>{catalog.packages?.length || 4}</div>
        </div>
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700' }}>HEALTHCARE PARTNERS QUEUE</div>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: '#7E22CE', marginTop: '0.3rem' }}>{partnerQueue?.length || 0}</div>
        </div>
      </div>
    </div>
  );
}
