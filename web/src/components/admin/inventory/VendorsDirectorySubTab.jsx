import React from 'react';
import { ShoppingBag } from 'lucide-react';

export default function VendorsDirectorySubTab({
  vendors = [],
  onOpenCreatePo = () => {}
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
      {vendors.map(v => (
        <div key={v.code} style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#006B70', fontWeight: '800', fontFamily: 'monospace', backgroundColor: '#F0FDFA', padding: '0.15rem 0.45rem', borderRadius: '6px' }}>{v.code}</span>
            <span style={{ fontSize: '0.75rem', color: '#B45309', fontWeight: '800', backgroundColor: '#FEF3C7', padding: '0.15rem 0.45rem', borderRadius: '6px' }}>{v.rating}</span>
          </div>

          <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', marginTop: '0.5rem', marginBottom: '0.15rem' }}>{v.name}</h4>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{v.category}</div>

          <div style={{ marginTop: '0.85rem', padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '10px', fontSize: '0.78rem', display: 'grid', gap: '0.35rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>Contact Person:</span>
              <strong>{v.contactPerson}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>Phone:</span>
              <strong style={{ color: '#006B70' }}>{v.phone}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>Email:</span>
              <span>{v.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>Lead Time:</span>
              <strong>{v.leadTimeDays} Days</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>Payment Terms:</span>
              <strong>{v.paymentTerms}</strong>
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button
              onClick={() => onOpenCreatePo(v.name)}
              style={{ padding: '0.45rem 0.85rem', backgroundColor: '#0284C7', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <ShoppingBag size={13} /> Create Purchase Order
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
