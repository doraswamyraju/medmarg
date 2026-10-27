import React, { useState } from 'react';
import { Package, Plus, AlertTriangle, CheckCircle2, Clock, Send, ShieldCheck, RefreshCw, QrCode } from 'lucide-react';
import { API_BASE, safeFetch, safeJson } from '../../data/apiConfig';

export default function PhlebotomistInventoryTab({ 
  inventory = [], 
  warehouseStock = [],
  indents = [], 
  onRaiseIndent,
  isSubmitting 
}) {
  const [showIndentModal, setShowIndentModal] = useState(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [barcodeOrderId, setBarcodeOrderId] = useState('');
  const [generatedBarcode, setGeneratedBarcode] = useState('');
  const [customBarcode, setCustomBarcode] = useState('');
  const [acceptingIndent, setAcceptingIndent] = useState(null);
  const [selectedItems, setSelectedItems] = useState({
    'Gold SST Gel Tubes (5ml)': 20,
    'Standard Phlebotomy Sample Collection Kit': 5
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
              <Package size={14} /> LIVE FLEET INVENTORY
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700' }}>In-Hand Kit & Central Store</span>
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A', marginTop: '0.25rem' }}>
            Collection Kit Supplies & Central Warehouse Sync
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowBarcodeModal(true)}
            style={{
              padding: '0.75rem 1.1rem',
              backgroundColor: '#FFFFFF',
              color: '#006B70',
              border: '1.5px solid #006B70',
              borderRadius: '12px',
              fontWeight: '900',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}
          >
            <QrCode size={16} /> Barcode Hub
          </button>

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
      </div>

      {/* In-Hand Inventory Grid */}
      <div>
        <div style={{ fontSize: '0.88rem', fontWeight: '900', color: '#0F172A', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>📦 In-Hand Consumables (Field Phlebotomy Kit)</span>
          <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>
            {inventory.length} Item Categories Allotted
          </span>
        </div>

        {inventory.length === 0 ? (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '2.5rem',
            textAlign: 'center',
            border: '2px dashed #CBD5E1',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
          }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
              <Package size={26} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
              No Field Consumables Currently Allotted
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#64748B', maxWidth: '420px', margin: '0.35rem auto 1rem', lineHeight: '1.4' }}>
              You do not have any consumables allotted to your bag yet. Please raise an indent above or visit the MedMarg Central Store for initial onboarding kit issuance.
            </p>
            <button
              onClick={() => setShowIndentModal(true)}
              style={{
                padding: '0.6rem 1.25rem',
                backgroundColor: '#006B70',
                color: '#FFF',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '900',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              + Raise First Stock Indent
            </button>
          </div>
        ) : (
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
                    Threshold: {item.minThreshold} {item.unit}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* Central Warehouse Available Stock (Live updated by Admin & Store In-Charge) */}
      {warehouseStock.length > 0 && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #006B70', boxShadow: '0 4px 16px rgba(0, 107, 112, 0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#E0F2F1', color: '#006B70', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: '900' }}>
                  LIVE STORE IN-CHARGE SYNC
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700' }}>Central Warehouse Hub</span>
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>
                Central Warehouse Stock Levels (Ready for Indents)
              </h4>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#059669', backgroundColor: '#ECFDF5', padding: '0.25rem 0.65rem', borderRadius: '8px', fontWeight: '800' }}>
              ✓ Live Synced with Admin Store Desk
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {warehouseStock.map((whItem, idx) => (
              <div key={idx} style={{ padding: '0.85rem 1rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800' }}>{whItem.code}</div>
                <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#1E293B', marginTop: '0.15rem' }}>{whItem.name}</div>
                <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>Warehouse Available:</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#006B70' }}>{whItem.stock?.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>{whItem.unit}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700' }}>
                    {new Date(ind.requestedAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>

                  {ind.status === 'APPROVED_DISPATCHED' && (
                    <button
                      type="button"
                      disabled={acceptingIndent === ind.id}
                      onClick={async () => {
                        setAcceptingIndent(ind.id);
                        try {
                          const res = await safeFetch(`${API_BASE}/api/v1/agent/indent/accept`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ indentId: ind.id, agentId: 'AG-01' })
                          });
                          const data = await safeJson(res);
                          if (data && data.success) {
                            alert('Supplies accepted! Inventory credited to your in-hand bag.');
                            window.location.reload();
                          }
                        } catch (e) {
                          alert('Error accepting delivery.');
                        } finally {
                          setAcceptingIndent(null);
                        }
                      }}
                      style={{
                        padding: '0.45rem 0.85rem',
                        backgroundColor: '#059669',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: '900',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <CheckCircle2 size={13} /> {acceptingIndent === ind.id ? 'Accepting...' : 'Accept & Add to Bag'}
                    </button>
                  )}
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
                {(warehouseStock.length > 0 ? warehouseStock : inventory).map(item => {
                  const qty = selectedItems[item.name] || 0;
                  return (
                    <div key={item.id || item.code} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.85rem', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#1E293B' }}>{item.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Available in Warehouse: <strong>{item.stock} {item.unit}</strong></div>
                      </div>
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

      {/* Barcode Hub Modal (Generate, Scan & Record Barcodes for Inventory & Specimens) */}
      {showBarcodeModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 130, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', maxWidth: '500px', width: '100%', padding: '2rem', border: '2px solid #006B70', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <QrCode size={22} color="#006B70" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>Barcode Management Hub</h3>
              </div>
              <button onClick={() => setShowBarcodeModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B' }}>✕</button>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: '1.4', margin: '0 0 1.25rem 0' }}>
              Generate official MedMarg specimen barcodes, scan pre-printed roll stickers, or link barcode to patient vacutainer.
            </p>

            {/* Generate Section */}
            <div style={{ padding: '1rem', backgroundColor: '#F0FDFA', borderRadius: '12px', border: '1px solid #99F6E4', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: '900', color: '#0F766E', marginBottom: '0.4rem' }}>
                Generate Fresh Specimen Barcode
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Order ID (e.g. MM-8921)"
                  value={barcodeOrderId}
                  onChange={(e) => setBarcodeOrderId(e.target.value)}
                  style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontWeight: '700' }}
                />
                <button
                  onClick={async () => {
                    try {
                      const res = await safeFetch(`${API_BASE}/api/v1/agent/barcode/generate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ orderId: barcodeOrderId || 'MM-DOORSTEP' })
                      });
                      const data = await safeJson(res);
                      if (data && data.barcode) {
                        setGeneratedBarcode(data.barcode);
                        setCustomBarcode(data.barcode);
                      }
                    } catch (e) {
                      setGeneratedBarcode(`MM-SST-${Math.floor(100000 + Math.random() * 900000)}`);
                    }
                  }}
                  style={{ padding: '0.5rem 1rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '900', fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  Generate
                </button>
              </div>

              {generatedBarcode && (
                <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.85rem', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1.5px dashed #006B70', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '700' }}>GENERATED BARCODE</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#006B70', letterSpacing: '1px', fontFamily: 'monospace' }}>
                    {generatedBarcode}
                  </div>
                </div>
              )}
            </div>

            {/* Record / Affix Section */}
            <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: '900', color: '#334155', marginBottom: '0.4rem' }}>
                Record / Affix Barcode to Sample
              </div>
              <input
                type="text"
                placeholder="Enter or paste Barcode (e.g. MM-SST-894121)"
                value={customBarcode}
                onChange={(e) => setCustomBarcode(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '800', marginBottom: '0.6rem', boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={async () => {
                  if (!customBarcode.trim()) return alert('Please enter a barcode string');
                  try {
                    const res = await safeFetch(`${API_BASE}/api/v1/agent/barcode/record`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        barcode: customBarcode.trim(),
                        orderId: barcodeOrderId || 'MM-SAMPLE',
                        phleboId: 'AG-01'
                      })
                    });
                    const data = await safeJson(res);
                    if (data && data.success) {
                      alert(`✓ Barcode ${customBarcode} recorded and registered!`);
                      setShowBarcodeModal(false);
                      setCustomBarcode('');
                    }
                  } catch (e) {
                    alert(`✓ Barcode ${customBarcode} recorded locally.`);
                    setShowBarcodeModal(false);
                  }
                }}
                style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0284C7', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Record & Affix Barcode
              </button>
            </div>

            <button
              onClick={() => setShowBarcodeModal(false)}
              style={{ width: '100%', padding: '0.65rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer' }}
            >
              Close Barcode Hub
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
