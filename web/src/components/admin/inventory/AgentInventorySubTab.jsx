import React from 'react';
import { Truck, Plus, AlertTriangle, RotateCcw } from 'lucide-react';

export default function AgentInventorySubTab({
  agentInventories = [],
  onOpenDirectAllocate = () => {},
  onOpenReturnStock = () => {}
}) {
  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Truck size={18} color="#006B70" /> Agent-Wise In-Hand Inventory & Bag Balances
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
            Real-time stock held by field phlebotomists. Monitor cold bag temps, allocated tubes, and perform direct handovers or returns.
          </p>
        </div>

        <button
          onClick={() => onOpenDirectAllocate()}
          style={{ padding: '0.55rem 1.1rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={15} /> Direct Handover to Agent
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
            <th style={{ padding: '0.85rem 1.25rem' }}>Phlebotomist</th>
            <th style={{ padding: '0.85rem' }}>Assigned Zone</th>
            <th style={{ padding: '0.85rem' }}>Live Bag Consumables</th>
            <th style={{ padding: '0.85rem' }}>IoT Cold Bag Temp</th>
            <th style={{ padding: '0.85rem' }}>Bag Status</th>
            <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {agentInventories.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ padding: '2.5rem', textAlign: 'center', color: '#64748B' }}>
                No phlebotomist bag balances found.
              </td>
            </tr>
          ) : (
            agentInventories.map(ag => {
              const items = Array.isArray(ag.items) ? ag.items : [];
              const totalItemsCount = items.reduce((sum, itm) => sum + (Number(itm.quantity) || 0), 0);
              const hasItems = totalItemsCount > 0;

              return (
                <tr key={ag.agentId} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontWeight: '800', color: '#0F172A' }}>{ag.agentName}</div>
                    <div style={{ fontSize: '0.72rem', color: '#006B70', fontWeight: '800' }}>
                      {ag.agentId} • <span style={{ backgroundColor: '#F0FDFA', color: '#0F766E', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>{ag.agentType}</span>
                    </div>
                    {ag.phone && <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{ag.phone}</div>}
                  </td>

                  <td style={{ padding: '1rem', color: '#334155', fontWeight: '700' }}>
                    {ag.zone || 'Tirupati Central'}
                  </td>

                  <td style={{ padding: '1rem' }}>
                    {!hasItems ? (
                      <span style={{ fontSize: '0.75rem', backgroundColor: '#F1F5F9', color: '#64748B', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: '700', border: '1px dashed #CBD5E1' }}>
                        🎒 0 Consumables (Empty Bag)
                      </span>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', maxWidth: '380px' }}>
                        {items.map((it, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '0.75rem',
                              backgroundColor: '#EFF6FF',
                              color: '#1D4ED8',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '6px',
                              fontWeight: '800',
                              border: '1px solid #BFDBFE'
                            }}
                          >
                            📦 {it.name || it.itemCode}: <strong>{it.quantity}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </td>

                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: '900', color: '#059669', backgroundColor: '#DCFCE7', padding: '0.25rem 0.55rem', borderRadius: '6px' }}>
                      ❄️ {ag.coldBagTemp || '4.2°C'}
                    </span>
                  </td>

                  <td style={{ padding: '1rem' }}>
                    {ag.warning ? (
                      <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF2F2', color: '#DC2626', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <AlertTriangle size={12} /> {ag.warning}
                      </span>
                    ) : hasItems ? (
                      <span style={{ fontSize: '0.72rem', backgroundColor: '#F0FDF4', color: '#16A34A', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '800' }}>
                        ✓ Stocked ({totalItemsCount} units)
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.72rem', backgroundColor: '#FFFBEB', color: '#B45309', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '800' }}>
                        ⚠️ Needs Refill
                      </span>
                    )}
                  </td>

                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => onOpenDirectAllocate(ag.agentId)}
                        style={{ padding: '0.4rem 0.75rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}
                      >
                        + Handover
                      </button>
                      <button
                        onClick={() => onOpenReturnStock(ag)}
                        disabled={!hasItems}
                        style={{
                          padding: '0.4rem 0.75rem',
                          backgroundColor: hasItems ? '#F1F5F9' : '#F8FAFC',
                          color: hasItems ? '#475569' : '#94A3B8',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: '800',
                          cursor: hasItems ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <RotateCcw size={12} /> Return
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
