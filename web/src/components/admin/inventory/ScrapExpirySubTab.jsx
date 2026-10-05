import React from 'react';
import { Trash2, Plus } from 'lucide-react';

export default function ScrapExpirySubTab({
  scrapLogs = [],
  onOpenScrapModal = () => {}
}) {
  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Trash2 size={18} color="#EF4444" /> Central Scrap, Expired & Damaged Consumables Log
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
            Document broken tubes, temperature excursion write-offs, and expired chemical additives for audit and compliance.
          </p>
        </div>

        <button
          onClick={onOpenScrapModal}
          style={{ padding: '0.55rem 1.1rem', backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={15} /> Log Scrap / Loss
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
            <th style={{ padding: '0.85rem 1.25rem' }}>Scrap ID & Date</th>
            <th style={{ padding: '0.85rem' }}>Item & Batch No</th>
            <th style={{ padding: '0.85rem' }}>Quantity Written Off</th>
            <th style={{ padding: '0.85rem' }}>Reason for Scrap</th>
            <th style={{ padding: '0.85rem' }}>Total Financial Loss</th>
            <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Disposal Action</th>
          </tr>
        </thead>
        <tbody>
          {scrapLogs.map(sc => (
            <tr key={sc.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
              <td style={{ padding: '1rem 1.25rem' }}>
                <div style={{ fontWeight: '800', color: '#EF4444', fontFamily: 'monospace' }}>{sc.id}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{sc.date}</div>
              </td>
              <td style={{ padding: '1rem' }}>
                <div style={{ fontWeight: '800', color: '#0F172A' }}>{sc.itemName}</div>
                <div style={{ fontSize: '0.72rem', color: '#006B70', fontWeight: '800' }}>{sc.itemCode} • Batch: {sc.batchNo}</div>
              </td>
              <td style={{ padding: '1rem', fontWeight: '800', color: '#B91C1C' }}>
                {sc.quantity} Units
              </td>
              <td style={{ padding: '1rem', color: '#334155', fontSize: '0.8rem' }}>
                {sc.reason}
              </td>
              <td style={{ padding: '1rem', fontWeight: '900', color: '#0F172A' }}>
                ₹{sc.lossValue.toLocaleString()}
              </td>
              <td style={{ padding: '1rem 1.25rem', textAlign: 'right', color: '#64748B', fontSize: '0.78rem' }}>
                {sc.actionTaken}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
