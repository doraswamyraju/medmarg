import React from 'react';
import { ShoppingBag, Plus, CheckCircle } from 'lucide-react';

export default function PurchasesInwardSubTab({
  purchases = [],
  onOpenAddPurchase = () => {}
}) {
  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShoppingBag size={18} color="#0284C7" /> Inward Goods & Purchase Receipts (GRN)
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
            Every inward entry automatically increases central inventory quantities and logs manufacturer batch expiry dates.
          </p>
        </div>

        <button
          onClick={onOpenAddPurchase}
          style={{ padding: '0.55rem 1.1rem', backgroundColor: '#0284C7', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={15} /> Record Inward Delivery (GRN)
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
            <th style={{ padding: '0.85rem 1.25rem' }}>GRN / PO ID</th>
            <th style={{ padding: '0.85rem' }}>Vendor / Manufacturer</th>
            <th style={{ padding: '0.85rem' }}>Inward Details & Quantities</th>
            <th style={{ padding: '0.85rem' }}>Batch & Expiry</th>
            <th style={{ padding: '0.85rem' }}>Total Amount</th>
            <th style={{ padding: '0.85rem' }}>Received By</th>
            <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>QC Status</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map(p => (
            <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
              <td style={{ padding: '1rem 1.25rem' }}>
                <div style={{ fontWeight: '800', color: '#0284C7', fontFamily: 'monospace' }}>{p.id}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>PO: {p.poNumber}</div>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{p.inwardDate}</div>
              </td>
              <td style={{ padding: '1rem' }}>
                <div style={{ fontWeight: '800', color: '#0F172A' }}>{p.vendor}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Invoice: {p.invoiceNo}</div>
              </td>
              <td style={{ padding: '1rem', color: '#334155', fontWeight: '700' }}>
                {p.details}
              </td>
              <td style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.78rem', color: '#0F172A', fontWeight: '800', fontFamily: 'monospace' }}>Batch: {p.batchNo}</div>
                <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '700' }}>Exp: {p.expDate}</div>
              </td>
              <td style={{ padding: '1rem', fontWeight: '900', color: '#0F172A' }}>
                ₹{p.totalAmount.toLocaleString()}
              </td>
              <td style={{ padding: '1rem', color: '#475569', fontSize: '0.8rem' }}>
                {p.receivedBy}
              </td>
              <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                <span style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: '800', backgroundColor: '#DCFCE7', color: '#15803D', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <CheckCircle size={12} /> {p.qcStatus}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
