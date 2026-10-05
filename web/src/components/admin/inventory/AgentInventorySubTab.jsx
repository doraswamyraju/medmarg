import React from 'react';
import { Truck, Plus, AlertTriangle } from 'lucide-react';

export default function AgentInventorySubTab({
  agentInventories = [],
  onOpenDirectAllocate = () => {}
}) {
  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Truck size={18} color="#006B70" /> Agent-Wise In-Hand Inventory & Bag Balances
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
            Real-time stock held by field phlebotomists. Monitor cold bag temps, tube reserves, and dispatch direct replenishments.
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
            <th style={{ padding: '0.85rem' }}>Assigned Zone / Territory</th>
            <th style={{ padding: '0.85rem' }}>Vacutainer Tubes (SST / EDTA / Fluoride)</th>
            <th style={{ padding: '0.85rem' }}>Needles & Kits</th>
            <th style={{ padding: '0.85rem' }}>IoT Cold Bag Temp</th>
            <th style={{ padding: '0.85rem' }}>Alerts / Status</th>
            <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {agentInventories.map(ag => (
            <tr key={ag.agentId} style={{ borderBottom: '1px solid #F1F5F9' }}>
              <td style={{ padding: '1rem 1.25rem' }}>
                <div style={{ fontWeight: '800', color: '#0F172A' }}>{ag.agentName}</div>
                <div style={{ fontSize: '0.72rem', color: '#006B70', fontWeight: '800' }}>{ag.agentId} • {ag.agentType}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{ag.phone}</div>
              </td>
              <td style={{ padding: '1rem', color: '#334155', fontWeight: '700' }}>
                {ag.zone}
              </td>
              <td style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.45rem', borderRadius: '4px', fontWeight: '800' }}>
                    🟡 SST: {ag.inHandStock.sstTubes}
                  </span>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#F3E8FF', color: '#7E22CE', padding: '0.2rem 0.45rem', borderRadius: '4px', fontWeight: '800' }}>
                    🟣 EDTA: {ag.inHandStock.edtaTubes}
                  </span>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#F1F5F9', color: '#475569', padding: '0.2rem 0.45rem', borderRadius: '4px', fontWeight: '800' }}>
                    ⚪ GLU: {ag.inHandStock.fluorideTubes}
                  </span>
                </div>
              </td>
              <td style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.78rem', color: '#0F172A', fontWeight: '700' }}>
                  21G Needles: <strong>{ag.inHandStock.needles21g}</strong> | Swabs: <strong>{ag.inHandStock.swabs}</strong>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#006B70', fontWeight: '800' }}>
                  Full Body Kits: {ag.inHandStock.fullBodyKits}
                </div>
              </td>
              <td style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '900', color: '#059669', backgroundColor: '#DCFCE7', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                  ❄️ {ag.inHandStock.coldBagTemp}
                </span>
              </td>
              <td style={{ padding: '1rem' }}>
                {ag.warning ? (
                  <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF2F2', color: '#DC2626', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <AlertTriangle size={12} /> {ag.warning}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.72rem', backgroundColor: '#F0FDF4', color: '#16A34A', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '800' }}>
                    ✓ Sufficient Stock
                  </span>
                )}
              </td>
              <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                <button
                  onClick={() => onOpenDirectAllocate(ag.agentId)}
                  style={{ padding: '0.4rem 0.75rem', backgroundColor: '#F1F5F9', color: '#006B70', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}
                >
                  + Top Up Bag
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
