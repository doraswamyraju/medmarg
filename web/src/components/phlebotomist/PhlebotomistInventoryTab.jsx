import React, { useState } from 'react';
import { Package, Plus, AlertTriangle, CheckCircle2, Clock, Send, ShieldCheck, RefreshCw } from 'lucide-react';

export default function PhlebotomistInventoryTab({ 
  inventory = [], 
  indents = [], 
  onRaiseIndent,
  isSubmitting 
}) {
  const [showIndentModal, setShowIndentModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState({
    'Vacutainer Gold SST (Serum Gel)': 20,
    'Vacutainer Purple (EDTA Whole Blood)': 20,
    'Sterile Safety Syringes 5ml': 25,
    'Barcode Thermal Label Rolls': 2
  });
  const [urgency, setUrgency] = useState('NORMAL');
  const [notes, setNotes] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleItemCountChange = (name, delta) => {
    setSelectedItems(prev => {
      const current = prev[name] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      }
      return { ...prev, [name]: next };
    });
  };

  const handleSubmitIndent = (e) => {
    e.preventDefault();
    const itemsArray = Object.entries(selectedItems).map(([item, quantity]) => ({ item, quantity }));
    if (itemsArray.length === 0) return;

    if (onRaiseIndent) {
      onRaiseIndent({
        items: itemsArray,
        urgency,
        notes
      });
    }

    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      setShowIndentModal(false);
      setNotes('');
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Top Banner & Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ backgroundColor: '#E0F2FE', color: '#0369A1', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Package size={14} /> FIELD KIT INVENTORY
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700' }}>In-Hand Fleet Stock</span>
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A', marginTop: '0.25rem' }}>
            Collection Kit Supplies & Indents
          </h3>
        </div>

        <button
          onClick={() => setShowIndentModal(true)}
          style={{
            padding: '0.75rem 1.25rem',
            backgroundColor: '#006B70',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '900',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(0,107,112,0.2)'
          }}
        >
          <Plus size={18} /> + Raise Replenishment Indent
        </button>
      </div>

      {/* Inventory Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {inventory.map(item => {
          const isLow = item.stock <= item.minThreshold;
          return (
            <div
              key={item.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '1.25rem',
                border: isLow ? '1.5px solid #F59E0B' : '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800' }}>{item.code}</span>
                  {isLow ? (
                    <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertTriangle size={12} /> LOW STOCK
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.72rem', backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '900' }}>
                      ✓ OPTIMAL
                    </span>
                  )}
                </div>

                <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0F172A', marginBottom: '0.25rem' }}>
                  {item.name}
                </h4>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '700' }}>In Hand</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '900', color: isLow ? '#D97706' : '#006B70' }}>
                    {item.stock} <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748B' }}>{item.unit}</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700' }}>
                  Min: {item.minThreshold} {item.unit}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active & Past Indent Requests */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E2E8F0', marginTop: '0.5rem' }}>
        <h4 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={18} color="#006B70" /> Recent Indent Replenishment Requests
        </h4>

        {indents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748B', fontSize: '0.88rem' }}>
            No recent indent requests. Raise an indent above when supply is low.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {indents.map(ind => (
              <div
                key={ind.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem 1.25rem',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: '900', color: '#0F172A' }}>{ind.id}</span>
                    <span style={{ fontSize: '0.75rem', backgroundColor: ind.status === 'APPROVED_DISPATCHED' ? '#D1FAE5' : '#FEF3C7', color: ind.status === 'APPROVED_DISPATCHED' ? '#065F46' : '#B45309', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '900' }}>
                      {ind.status === 'APPROVED_DISPATCHED' ? '✓ DISPATCHED / READY' : '⏳ PENDING SUPER ADMIN APPROVAL'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.3rem' }}>
                    Items: {Array.isArray(ind.items) ? ind.items.map(i => `${i.quantity}x ${i.item || i.name}`).join(', ') : 'Supplies pack'}
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700' }}>
                  {new Date(ind.requestedAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Raise Indent Modal */}
      {showIndentModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 120, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', maxWidth: '540px', width: '100%', padding: '2rem', border: '2px solid #006B70' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A' }}>Raise Replenishment Indent</h3>
                <p style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.15rem' }}>Request vacutainers and collection supplies from MedMarg Central Hub</p>
              </div>
              <button onClick={() => setShowIndentModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B' }}>✕</button>
            </div>

            <form onSubmit={handleSubmitIndent}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '280px', overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1.25rem' }}>
                {inventory.map(item => {
                  const qty = selectedItems[item.name] || 0;
                  return (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.85rem', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#1E293B' }}>{item.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => handleItemCountChange(item.name, -5)}
                          style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#FFF', fontWeight: '900', cursor: 'pointer' }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: '0.9rem', fontWeight: '900', width: '32px', textAlign: 'center' }}>{qty}</span>
                        <button
                          type="button"
                          onClick={() => handleItemCountChange(item.name, 5)}
                          style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #006B70', backgroundColor: '#006B70', color: '#FFF', fontWeight: '900', cursor: 'pointer' }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Special Request / Delivery Instructions</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Urgent morning restock needed for Alipiri route"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || submittedSuccess}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  backgroundColor: submittedSuccess ? '#059669' : '#006B70',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '900',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {submittedSuccess ? <CheckCircle2 size={18} /> : <Send size={18} />}
                {submittedSuccess ? 'Indent Submitted Successfully!' : 'Submit Indent Request'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
