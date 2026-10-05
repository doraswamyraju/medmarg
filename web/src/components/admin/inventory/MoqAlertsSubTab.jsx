import React from 'react';
import { Bell, Mail, Check, Send, ShoppingBag } from 'lucide-react';

export default function MoqAlertsSubTab({
  inventoryStock = [],
  onSendMoqAlert = () => {},
  onOpenRaisePo = () => {}
}) {
  const lowStockItems = inventoryStock.filter(s => s.stock <= s.reorderLevel);

  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', backgroundColor: '#FEF3C7' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={20} color="#B45309" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#78350F', margin: 0 }}>
            Minimum Order Quantity (MOQ) & Store In-Charge Push/Email Alerts
          </h3>
        </div>
        <p style={{ fontSize: '0.82rem', color: '#92400E', margin: '0.35rem 0 0 0' }}>
          When inventory drops below the defined MOQ threshold, automated Push & Email notifications are dispatched immediately to the designated Store In-Charge.
        </p>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
            <th style={{ padding: '0.85rem 1.25rem' }}>Item Code & Name</th>
            <th style={{ padding: '0.85rem' }}>Current Available Stock</th>
            <th style={{ padding: '0.85rem' }}>Reorder Level (MOQ)</th>
            <th style={{ padding: '0.85rem' }}>Designated Store In-Charge</th>
            <th style={{ padding: '0.85rem' }}>Notification Status</th>
            <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {lowStockItems.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#059669', fontWeight: '700' }}>
                🎉 All consumable stock items and kits are well above Minimum Order Quantity (MOQ) thresholds!
              </td>
            </tr>
          ) : (
            lowStockItems.map(stk => (
              <tr key={stk.code} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ fontWeight: '800', color: '#0F172A' }}>{stk.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#006B70', fontWeight: '800' }}>{stk.code} • {stk.category}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#DC2626' }}>
                    {stk.stock.toLocaleString()} {stk.unit}
                  </div>
                </td>
                <td style={{ padding: '1rem', fontWeight: '800', color: '#D97706' }}>
                  {stk.reorderLevel.toLocaleString()} {stk.unit}
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: '700', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Mail size={13} color="#006B70" /> {stk.incharge}
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  {stk.alertSent ? (
                    <span style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', borderRadius: '6px', fontWeight: '800', backgroundColor: '#DCFCE7', color: '#15803D', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Check size={12} /> Push & Email Sent
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', borderRadius: '6px', fontWeight: '800', backgroundColor: '#FEE2E2', color: '#991B1B' }}>
                      Pending Notification
                    </span>
                  )}
                </td>
                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => onSendMoqAlert(stk)}
                      style={{ padding: '0.4rem 0.75rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Send size={12} /> Resend Alert
                    </button>
                    <button
                      onClick={() => onOpenRaisePo(stk.code)}
                      style={{ padding: '0.4rem 0.75rem', backgroundColor: '#0284C7', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <ShoppingBag size={12} /> Raise PO
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
