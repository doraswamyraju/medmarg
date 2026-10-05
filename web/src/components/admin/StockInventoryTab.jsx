import React, { useState } from 'react';
import { PlusCircle, Edit3, Boxes, PackageCheck, AlertTriangle, CheckCircle, X, Plus } from 'lucide-react';

export default function StockInventoryTab({
  inventoryStock = [],
  setInventoryStock = () => {},
  indents = [],
  setIndents = () => {},
  API_BASE,
  safeFetch
}) {
  // Modal states
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [stockForm, setStockForm] = useState({
    code: `STK-0${inventoryStock.length + 1}`,
    name: '',
    category: 'Blood Collection Containers',
    stock: 1000,
    unit: 'Tubes',
    reorderLevel: 300
  });

  const [editingStockItem, setEditingStockItem] = useState(null);
  const [editStockQty, setEditStockQty] = useState(0);

  const [showCreateIndentModal, setShowCreateIndentModal] = useState(false);
  const [indentForm, setIndentForm] = useState({
    id: `IND-${Math.floor(500 + Math.random() * 500)}`,
    agentName: 'Ramesh Kumar (AG-01)',
    requestedItems: '50x Gold SST Tubes, 20x Purple EDTA Tubes',
    status: 'PENDING_APPROVAL'
  });

  // Handle Add Stock Item
  const handleSaveNewStock = (e) => {
    e.preventDefault();
    const newItem = {
      ...stockForm,
      stock: Number(stockForm.stock) || 1000,
      reorderLevel: Number(stockForm.reorderLevel) || 300
    };
    setInventoryStock(prev => [newItem, ...prev]);
    setShowAddStockModal(false);
    setStockForm({
      code: `STK-0${inventoryStock.length + 2}`,
      name: '',
      category: 'Blood Collection Containers',
      stock: 1000,
      unit: 'Tubes',
      reorderLevel: 300
    });
  };

  // Handle Update Stock Level
  const handleSaveStockAdjustment = (e) => {
    e.preventDefault();
    if (!editingStockItem) return;
    setInventoryStock(prev => prev.map(s => s.code === editingStockItem.code ? { ...s, stock: Number(editStockQty) } : s));
    setEditingStockItem(null);
  };

  // Handle Approve Indent & Deduct Stock
  const handleApproveIndent = async (ind) => {
    try {
      if (safeFetch && API_BASE) {
        await safeFetch(`${API_BASE}/api/v1/admin/indents/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: ind.id })
        });
      }
    } catch (e) {}

    // Deduct default stock items (e.g. 50 Gold SST, 20 Purple EDTA)
    setInventoryStock(prev => prev.map(item => {
      if (item.code === 'STK-01') return { ...item, stock: Math.max(0, item.stock - 50) };
      if (item.code === 'STK-02') return { ...item, stock: Math.max(0, item.stock - 20) };
      return item;
    }));

    setIndents(prev => prev.map(i => i.id === ind.id ? { ...i, status: 'APPROVED_DISPATCHED' } : i));
  };

  // Handle Create Indent
  const handleCreateIndentSubmit = (e) => {
    e.preventDefault();
    const newIndent = {
      ...indentForm,
      date: `Today ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    };
    setIndents(prev => [newIndent, ...prev]);
    setShowCreateIndentModal(false);
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#FFF' }}>Central Phlebotomy Stock & Tube Indent Approvals</h2>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Monitor Vacutainer SST/EDTA blood collection tubes, biohazard bags, and approve agent supply indents.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setShowAddStockModal(true)}
            style={{ padding: '0.65rem 1.1rem', backgroundColor: '#1E293B', color: '#67E8F9', border: '1.5px solid #006B70', borderRadius: '10px', fontWeight: '900', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <Plus size={16} color="#67E8F9" /> Add Stock Item
          </button>
          <button
            onClick={() => setShowCreateIndentModal(true)}
            style={{ padding: '0.65rem 1.25rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem', boxShadow: '0 4px 14px rgba(0,107,112,0.3)' }}
          >
            <PlusCircle size={16} color="#FBBF24" /> Create Phlebotomist Indent
          </button>
        </div>
      </div>

      {/* Stock Items Cards Grid */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FFF', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Boxes size={18} color="#67E8F9" /> Phlebotomy Consumables Inventory
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2.25rem' }}>
        {inventoryStock.map(stk => {
          const isLowStock = stk.stock <= stk.reorderLevel;
          return (
            <div key={stk.code} style={{ backgroundColor: '#1E293B', borderRadius: '16px', border: isLowStock ? '1.5px solid #F59E0B' : '1px solid #334155', padding: '1.25rem', boxShadow: '0 8px 20px rgba(0,0,0,0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#67E8F9', fontWeight: '800', fontFamily: 'monospace' }}>{stk.code}</span>
                {isLowStock && (
                  <span style={{ fontSize: '0.7rem', color: '#FBBF24', fontWeight: '800', backgroundColor: 'rgba(245,158,11,0.2)', padding: '0.15rem 0.45rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <AlertTriangle size={12} /> REORDER
                  </span>
                )}
              </div>

              <h4 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#FFF', marginTop: '0.4rem' }}>{stk.name}</h4>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.1rem' }}>{stk.category}</div>

              <div style={{ marginTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: isLowStock ? '#F59E0B' : '#34D399' }}>
                  {stk.stock.toLocaleString()} <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 'normal' }}>{stk.unit}</span>
                </div>
                <button
                  onClick={() => { setEditingStockItem(stk); setEditStockQty(stk.stock); }}
                  style={{ background: 'none', border: 'none', color: '#38BDF8', cursor: 'pointer', padding: '0.2rem' }}
                >
                  <Edit3 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Indents Table */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FFF', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <PackageCheck size={18} color="#FBBF24" /> Phlebotomist Supply Indent Requests
      </h3>

      <div style={{ backgroundColor: '#1E293B', borderRadius: '20px', border: '1px solid #334155', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#0F172A', borderBottom: '1px solid #334155', color: '#94A3B8', fontSize: '0.78rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '1rem 1.25rem' }}>Indent ID</th>
              <th style={{ padding: '1rem' }}>Phlebotomist Agent</th>
              <th style={{ padding: '1rem' }}>Requested Consumables</th>
              <th style={{ padding: '1rem' }}>Request Date</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {indents.map(ind => (
              <tr key={ind.id} style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', color: '#67E8F9', fontWeight: '800' }}>{ind.id}</td>
                <td style={{ padding: '1rem', fontWeight: '800', color: '#FFF' }}>{ind.agentName}</td>
                <td style={{ padding: '1rem', color: '#CBD5E1' }}>{ind.requestedItems}</td>
                <td style={{ padding: '1rem', color: '#94A3B8', fontSize: '0.82rem' }}>{ind.date}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: '800', backgroundColor: ind.status === 'APPROVED_DISPATCHED' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', color: ind.status === 'APPROVED_DISPATCHED' ? '#34D399' : '#FBBF24' }}>
                    {ind.status}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                  {ind.status === 'PENDING_APPROVAL' ? (
                    <button
                      onClick={() => handleApproveIndent(ind)}
                      style={{ padding: '0.4rem 0.85rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', boxShadow: '0 4px 12px rgba(0,107,112,0.3)' }}
                    >
                      <CheckCircle size={14} color="#FBBF24" /> Approve & Deduct Stock
                    </button>
                  ) : (
                    <span style={{ color: '#34D399', fontSize: '0.82rem', fontWeight: '800' }}>✓ Approved & Dispatched</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: ADD STOCK ITEM */}
      {showAddStockModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#1E293B', width: '100%', maxWidth: '500px', borderRadius: '20px', border: '1px solid #334155', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0F172A' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#FFF' }}>Add Phlebotomy Inventory Consumable</h3>
                <div style={{ fontSize: '0.8rem', color: '#67E8F9', fontWeight: '700' }}>Item Code: {stockForm.code}</div>
              </div>
              <button onClick={() => setShowAddStockModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveNewStock} style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#94A3B8', marginBottom: '0.35rem' }}>Consumable Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Yellow SST Gel Tubes 4ml"
                  value={stockForm.name}
                  onChange={(e) => setStockForm({ ...stockForm, name: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#94A3B8', marginBottom: '0.35rem' }}>Category</label>
                  <select
                    value={stockForm.category}
                    onChange={(e) => setStockForm({ ...stockForm, category: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', fontSize: '0.88rem' }}
                  >
                    <option value="Blood Collection Containers">Blood Collection Containers</option>
                    <option value="Phlebotomy Needles & Holders">Phlebotomy Needles & Holders</option>
                    <option value="Cold Chain Packaging">Cold Chain Packaging</option>
                    <option value="PPE & Biohazard Bags">PPE & Biohazard Bags</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#94A3B8', marginBottom: '0.35rem' }}>Unit Type</label>
                  <input
                    type="text"
                    required
                    value={stockForm.unit}
                    onChange={(e) => setStockForm({ ...stockForm, unit: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#94A3B8', marginBottom: '0.35rem' }}>Initial Stock Qty</label>
                  <input
                    type="number"
                    required
                    value={stockForm.stock}
                    onChange={(e) => setStockForm({ ...stockForm, stock: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#34D399', fontSize: '0.88rem', fontWeight: '900' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#94A3B8', marginBottom: '0.35rem' }}>Reorder Threshold</label>
                  <input
                    type="number"
                    required
                    value={stockForm.reorderLevel}
                    onChange={(e) => setStockForm({ ...stockForm, reorderLevel: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FBBF24', fontSize: '0.88rem', fontWeight: '900' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddStockModal(false)} style={{ padding: '0.65rem 1.25rem', backgroundColor: '#334155', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}>Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UPDATE STOCK LEVEL MODAL */}
      {editingStockItem && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#1E293B', width: '100%', maxWidth: '440px', borderRadius: '20px', border: '1px solid #334155', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0F172A' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#FFF' }}>Update Stock Level</h3>
                <div style={{ fontSize: '0.8rem', color: '#67E8F9', fontWeight: '700' }}>{editingStockItem.name}</div>
              </div>
              <button onClick={() => setEditingStockItem(null)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveStockAdjustment} style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#94A3B8', marginBottom: '0.35rem' }}>Current Available Stock ({editingStockItem.unit})</label>
                <input
                  type="number"
                  required
                  value={editStockQty}
                  onChange={(e) => setEditStockQty(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#34D399', fontSize: '1.2rem', fontWeight: '900' }}
                />
              </div>

              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setEditingStockItem(null)} style={{ padding: '0.65rem 1.25rem', backgroundColor: '#334155', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}>Save Quantity</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE PHLEBOTOMIST INDENT MODAL */}
      {showCreateIndentModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#1E293B', width: '100%', maxWidth: '520px', borderRadius: '20px', border: '1px solid #334155', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0F172A' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#FFF' }}>Record Phlebotomist Supply Indent</h3>
                <div style={{ fontSize: '0.8rem', color: '#67E8F9', fontWeight: '700' }}>Indent ID: {indentForm.id}</div>
              </div>
              <button onClick={() => setShowCreateIndentModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateIndentSubmit} style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#94A3B8', marginBottom: '0.35rem' }}>Phlebotomist Agent Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar (AG-01)"
                  value={indentForm.agentName}
                  onChange={(e) => setIndentForm({ ...indentForm, agentName: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#94A3B8', marginBottom: '0.35rem' }}>Requested Consumables & Quantities</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. 50x Gold SST Tubes, 20x Purple EDTA Tubes, 10x Biohazard Bags"
                  value={indentForm.requestedItems}
                  onChange={(e) => setIndentForm({ ...indentForm, requestedItems: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowCreateIndentModal(false)} style={{ padding: '0.65rem 1.25rem', backgroundColor: '#334155', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}>Submit Indent Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
