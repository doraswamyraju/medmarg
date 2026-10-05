import React, { useState } from 'react';
import { Search, Boxes, Layers, AlertTriangle, Bell } from 'lucide-react';

export default function StockAndKitsSubTab({
  inventoryStock = [],
  onOpenAddModal = () => {},
  onOpenConfigModal = () => {},
  onSendMoqAlert = () => {}
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [itemTypeFilter, setItemTypeFilter] = useState('ALL');

  const filteredStock = inventoryStock.filter(stk => {
    const matchSearch = stk.name.toLowerCase().includes(searchTerm.toLowerCase()) || stk.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'ALL' || stk.category === categoryFilter;
    const matchType = itemTypeFilter === 'ALL' || stk.type === itemTypeFilter;
    return matchSearch && matchCat && matchType;
  });

  return (
    <div>
      {/* Search & Filter Bar */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by SKU, tube type, needle size, kit name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.55rem 0.85rem 0.55rem 2.4rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
            />
          </div>

          <select
            value={itemTypeFilter}
            onChange={(e) => setItemTypeFilter(e.target.value)}
            style={{ padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', backgroundColor: '#FFF', fontWeight: '700', color: '#0F172A' }}
          >
            <option value="ALL">All Types (Single & Kits)</option>
            <option value="SINGLE">Single Consumables Only</option>
            <option value="KIT">Combo Kits Only</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', backgroundColor: '#FFF', fontWeight: '700', color: '#0F172A' }}
          >
            <option value="ALL">All Categories</option>
            <option value="Blood Containers">Blood Containers (Vacutainers)</option>
            <option value="Phlebotomy Supplies">Phlebotomy Supplies & Needles</option>
            <option value="Cold Chain Equipment">Cold Chain Equipment</option>
            <option value="Pre-Packaged Kits">Pre-Packaged Kits</option>
            <option value="Disinfectants & Swabs">Disinfectants & Swabs</option>
            <option value="Waste Management">Waste Management (Biohazard)</option>
            <option value="Barcodes & Stationery">Barcodes & Stationery</option>
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.2rem' }}>
        {filteredStock.map(stk => {
          const isLowStock = stk.stock <= stk.reorderLevel;
          const isKit = stk.type === 'KIT';

          return (
            <div 
              key={stk.code} 
              style={{ 
                backgroundColor: '#FFFFFF', 
                borderRadius: '16px', 
                border: isLowStock ? '1.5px solid #F59E0B' : '1px solid #E2E8F0', 
                padding: '1.25rem', 
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.72rem', color: '#006B70', fontWeight: '800', fontFamily: 'monospace', backgroundColor: '#F0FDFA', padding: '0.15rem 0.45rem', borderRadius: '6px' }}>
                      {stk.code}
                    </span>
                    {isKit && (
                      <span style={{ fontSize: '0.68rem', backgroundColor: '#EEF2FF', color: '#4F46E5', fontWeight: '800', padding: '0.15rem 0.45rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Layers size={11} /> COMBO KIT
                      </span>
                    )}
                  </div>

                  {isLowStock ? (
                    <span style={{ fontSize: '0.68rem', color: '#B45309', fontWeight: '800', backgroundColor: '#FEF3C7', padding: '0.15rem 0.5rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertTriangle size={12} /> BELOW MOQ
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.68rem', color: '#15803D', fontWeight: '800', backgroundColor: '#DCFCE7', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                      IN STOCK
                    </span>
                  )}
                </div>

                <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', marginTop: '0.6rem', marginBottom: '0.15rem' }}>{stk.name}</h4>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{stk.category}</div>

                {isKit && stk.components && (
                  <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.75rem', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.75rem' }}>
                    <div style={{ fontWeight: '800', color: '#475569', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Layers size={12} color="#006B70" /> Bundle Contents:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.1rem', color: '#334155' }}>
                      {stk.components.map((c, idx) => (
                        <li key={idx} style={{ marginBottom: '0.15rem' }}>
                          <span style={{ fontWeight: '700' }}>{c.qty}x</span> {c.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div style={{ marginTop: '0.75rem', padding: '0.5rem', backgroundColor: '#F1F5F9', borderRadius: '8px', fontSize: '0.72rem', color: '#475569' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Minimum Order Level (MOQ):</span>
                    <strong style={{ color: '#0F172A' }}>{stk.reorderLevel} {stk.unit}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                    <span>Est. Unit Purchase Cost:</span>
                    <strong style={{ color: '#006B70' }}>₹{stk.unitCost}</strong>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700' }}>AVAILABLE CENTRAL STOCK</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '900', color: isLowStock ? '#D97706' : '#059669' }}>
                    {stk.stock.toLocaleString()} <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 'normal' }}>{stk.unit}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {isLowStock && (
                    <button
                      onClick={() => onSendMoqAlert(stk)}
                      title="Trigger Push/Email Alert to Store In-Charge"
                      style={{ padding: '0.4rem 0.6rem', backgroundColor: stk.alertSent ? '#FEF3C7' : '#F59E0B', color: stk.alertSent ? '#B45309' : '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <Bell size={13} /> {stk.alertSent ? 'Alert Dispatched' : 'Alert In-Charge'}
                    </button>
                  )}

                  <button
                    onClick={() => onOpenConfigModal(stk)}
                    style={{ padding: '0.4rem 0.6rem', backgroundColor: '#F1F5F9', color: '#334155', border: '1px solid #CBD5E1', borderRadius: '8px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '700' }}
                  >
                    Edit MOQ
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
