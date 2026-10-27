import React from 'react';
import { X } from 'lucide-react';

export function AddStockModal({
  show,
  onClose,
  stockForm,
  setStockForm,
  isEditing = false,
  onSave
}) {
  if (!show) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
      <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '540px', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
              {isEditing ? 'Edit Inventory Item / Kit' : 'Add Single Consumable or Combo Kit'}
            </h3>
            <div style={{ fontSize: '0.8rem', color: '#006B70', fontWeight: '700' }}>Item Code: {stockForm.code}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <form onSubmit={onSave} style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Item Code (SKU)</label>
              <input
                type="text"
                required
                value={stockForm.code}
                onChange={(e) => setStockForm({ ...stockForm, code: e.target.value.toUpperCase() })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem', fontFamily: 'monospace', fontWeight: '800' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Item Type</label>
              <select
                value={stockForm.type}
                onChange={(e) => setStockForm({ ...stockForm, type: e.target.value, unit: e.target.value === 'KIT' ? 'Kits' : stockForm.unit })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem', fontWeight: '700' }}
              >
                <option value="SINGLE">Single Consumable Item</option>
                <option value="KIT">Combo Pre-Packaged Kit</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Category</label>
              <select
                value={stockForm.category}
                onChange={(e) => setStockForm({ ...stockForm, category: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
              >
                <option value="Blood Containers">Blood Containers (Vacutainers)</option>
                <option value="Phlebotomy Supplies">Phlebotomy Supplies & Needles</option>
                <option value="Cold Chain Equipment">Cold Chain Equipment</option>
                <option value="Pre-Packaged Kits">Pre-Packaged Kits</option>
                <option value="Disinfectants & Swabs">Disinfectants & Swabs</option>
                <option value="Waste Management">Waste Management (Biohazard)</option>
                <option value="Barcodes & Stationery">Barcodes & Stationery</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Unit of Measure</label>
              <input
                type="text"
                required
                placeholder="e.g. Tubes, Needles, Kits, Bags"
                value={stockForm.unit || 'Units'}
                onChange={(e) => setStockForm({ ...stockForm, unit: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Item / Kit Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Gold SST Gel Tubes (5ml)"
              value={stockForm.name}
              onChange={(e) => setStockForm({ ...stockForm, name: e.target.value })}
              style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
            />
          </div>

          {stockForm.type === 'KIT' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#006B70', marginBottom: '0.35rem' }}>
                📦 Kit Bundle Components (Comma Separated)
              </label>
              <input
                type="text"
                placeholder="e.g. 2x Gold SST Tubes, 1x Purple EDTA Tube, 1x Vacutainer Needle 21G"
                value={stockForm.componentsText || ''}
                onChange={(e) => setStockForm({ ...stockForm, componentsText: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#F8FAFC', border: '1.5px solid #006B70', borderRadius: '8px', color: '#0F172A', fontSize: '0.85rem' }}
              />
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.25rem' }}>
                Specify item counts and descriptions bundled inside this phlebotomy kit.
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Current Stock</label>
              <input
                type="number"
                required
                value={stockForm.stock}
                onChange={(e) => setStockForm({ ...stockForm, stock: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#059669', fontSize: '0.88rem', fontWeight: '900' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>MOQ Reorder Level</label>
              <input
                type="number"
                required
                value={stockForm.reorderLevel}
                onChange={(e) => setStockForm({ ...stockForm, reorderLevel: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#D97706', fontSize: '0.88rem', fontWeight: '900' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Est. Cost (₹)</label>
              <input
                type="number"
                required
                value={stockForm.unitCost}
                onChange={(e) => setStockForm({ ...stockForm, unitCost: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem', fontWeight: '900' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Designated Store In-Charge (For Push/Email Alerts)</label>
            <input
              type="text"
              required
              value={stockForm.incharge}
              onChange={(e) => setStockForm({ ...stockForm, incharge: e.target.value })}
              style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
            />
          </div>

          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.65rem 1.25rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
            <button type="submit" style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}>
              {isEditing ? 'Update Inventory SKU' : 'Save & Register SKU'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddPurchaseModal({
  show,
  onClose,
  purchaseForm,
  setPurchaseForm,
  vendors = [],
  inventoryStock = [],
  onSave
}) {
  if (!show) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
      <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '540px', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>Record Inward Goods Receipt (GRN)</h3>
            <div style={{ fontSize: '0.8rem', color: '#0284C7', fontWeight: '700' }}>PO: {purchaseForm.poNumber}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <form onSubmit={onSave} style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Supplier / Vendor</label>
            <select
              value={purchaseForm.vendor}
              onChange={(e) => setPurchaseForm({ ...purchaseForm, vendor: e.target.value })}
              style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
            >
              {vendors.map(v => (
                <option key={v.code} value={v.name}>{v.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Select Inward Consumable Item</label>
            <select
              value={purchaseForm.itemCode}
              onChange={(e) => setPurchaseForm({ ...purchaseForm, itemCode: e.target.value })}
              style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
            >
              {inventoryStock.map(s => (
                <option key={s.code} value={s.code}>{s.code} - {s.name} ({s.unit})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Vendor Invoice No</label>
              <input
                type="text"
                required
                placeholder="e.g. INV-BD-88401"
                value={purchaseForm.invoiceNo}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, invoiceNo: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Batch Number</label>
              <input
                type="text"
                required
                placeholder="e.g. BATCH-2026-N12"
                value={purchaseForm.batchNo}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, batchNo: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Expiry Date</label>
              <input
                type="date"
                required
                value={purchaseForm.expDate}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, expDate: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Quantity Received</label>
              <input
                type="number"
                required
                value={purchaseForm.quantity}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#059669', fontSize: '0.88rem', fontWeight: '900' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Unit Purchase Cost (₹)</label>
              <input
                type="number"
                required
                value={purchaseForm.unitCost}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, unitCost: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem', fontWeight: '900' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Received & Verified By</label>
              <input
                type="text"
                required
                value={purchaseForm.receivedBy}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, receivedBy: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.65rem 1.25rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
            <button type="submit" style={{ padding: '0.65rem 1.4rem', backgroundColor: '#0284C7', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}>Inward & Update Stock</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CreateIndentModal({
  show,
  onClose,
  indentForm,
  setIndentForm,
  onSubmit
}) {
  if (!show) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
      <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '520px', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>Record Phlebotomist Supply Indent</h3>
            <div style={{ fontSize: '0.8rem', color: '#006B70', fontWeight: '700' }}>Indent ID: {indentForm.id}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <form onSubmit={onSubmit} style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Phlebotomist Name</label>
              <input
                type="text"
                required
                value={indentForm.agentName}
                onChange={(e) => setIndentForm({ ...indentForm, agentName: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Agent Category</label>
              <select
                value={indentForm.agentType}
                onChange={(e) => setIndentForm({ ...indentForm, agentType: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
              >
                <option value="SALARIED_AGENT">Salaried Phlebotomist</option>
                <option value="FREELANCE_AGENT">Gig Freelancer (Wallet Deduction)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Requested Consumables & Quantities</label>
            <textarea
              required
              rows={3}
              value={indentForm.requestedItems}
              onChange={(e) => setIndentForm({ ...indentForm, requestedItems: e.target.value })}
              style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
            />
          </div>

          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.65rem 1.25rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
            <button type="submit" style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}>Submit Indent</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DirectAllocateModal({
  show,
  onClose,
  allocateForm,
  setAllocateForm,
  agentInventories = [],
  inventoryStock = [],
  onSave
}) {
  if (!show) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
      <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '480px', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>Direct Stock Handover to Agent</h3>
            <div style={{ fontSize: '0.8rem', color: '#006B70', fontWeight: '700' }}>Immediate Shift Dispatch</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <form onSubmit={onSave} style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Select Phlebotomist</label>
            <select
              value={allocateForm.agentId}
              onChange={(e) => setAllocateForm({ ...allocateForm, agentId: e.target.value })}
              style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
            >
              {agentInventories.map(ag => (
                <option key={ag.agentId} value={ag.agentId}>{ag.agentName} ({ag.agentId}) - {ag.agentType}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Select Consumable</label>
            <select
              value={allocateForm.itemCode}
              onChange={(e) => setAllocateForm({ ...allocateForm, itemCode: e.target.value })}
              style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
            >
              {inventoryStock.map(s => (
                <option key={s.code} value={s.code}>{s.code} - {s.name} (Avail: {s.stock})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Quantity to Handover</label>
            <input
              type="number"
              required
              value={allocateForm.quantity}
              onChange={(e) => setAllocateForm({ ...allocateForm, quantity: e.target.value })}
              style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#059669', fontSize: '0.95rem', fontWeight: '900' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Dispatch Purpose / Shift Notes</label>
            <input
              type="text"
              value={allocateForm.notes}
              onChange={(e) => setAllocateForm({ ...allocateForm, notes: e.target.value })}
              style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
            />
          </div>

          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.65rem 1.25rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
            <button type="submit" style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}>Handover & Update Bag</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ScrapModal({
  show,
  onClose,
  scrapForm,
  setScrapForm,
  inventoryStock = [],
  onSave
}) {
  if (!show) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
      <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '480px', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FEF2F2' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#991B1B', margin: 0 }}>Log Inventory Scrap / Damage</h3>
            <div style={{ fontSize: '0.8rem', color: '#B91C1C', fontWeight: '700' }}>Compliance Write-Off</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <form onSubmit={onSave} style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Select Damaged / Expired Item</label>
            <select
              value={scrapForm.itemCode}
              onChange={(e) => setScrapForm({ ...scrapForm, itemCode: e.target.value })}
              style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
            >
              {inventoryStock.map(s => (
                <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Batch Number</label>
              <input
                type="text"
                required
                value={scrapForm.batchNo}
                onChange={(e) => setScrapForm({ ...scrapForm, batchNo: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Scrap Quantity</label>
              <input
                type="number"
                required
                value={scrapForm.quantity}
                onChange={(e) => setScrapForm({ ...scrapForm, quantity: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#DC2626', fontSize: '0.95rem', fontWeight: '900' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Scrap Reason / Incident</label>
            <select
              value={scrapForm.reason}
              onChange={(e) => setScrapForm({ ...scrapForm, reason: e.target.value })}
              style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
            >
              <option value="Defective Vacuum / Damaged Stopper">Defective Vacuum / Damaged Stopper</option>
              <option value="Batch Expiry Reached (Anticoagulant degradation)">Batch Expiry Reached (Anticoagulant degradation)</option>
              <option value="Transit Vibration Hemolysis / Broken Tubes">Transit Vibration Hemolysis / Broken Tubes</option>
              <option value="Temperature Excursion > 8°C in Field Bag">Temperature Excursion &gt; 8°C in Field Bag</option>
              <option value="Sterile Packaging Punctured / Contaminated">Sterile Packaging Punctured / Contaminated</option>
            </select>
          </div>

          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.65rem 1.25rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
            <button type="submit" style={{ padding: '0.65rem 1.4rem', backgroundColor: '#DC2626', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}>Write Off & Scrap</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function MoqConfigModal({
  show,
  onClose,
  selectedStock,
  setSelectedStock,
  onSave
}) {
  if (!show || !selectedStock) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
      <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '480px', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>Configure SKU & MOQ Alerts</h3>
            <div style={{ fontSize: '0.8rem', color: '#006B70', fontWeight: '700' }}>{selectedStock.code} - {selectedStock.name}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <form onSubmit={onSave} style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Current Stock Qty</label>
            <input
              type="number"
              required
              value={selectedStock.stock}
              onChange={(e) => setSelectedStock({ ...selectedStock, stock: Number(e.target.value) })}
              style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#059669', fontSize: '0.95rem', fontWeight: '900' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Minimum Order Quantity (MOQ Threshold)</label>
            <input
              type="number"
              required
              value={selectedStock.reorderLevel}
              onChange={(e) => setSelectedStock({ ...selectedStock, reorderLevel: Number(e.target.value) })}
              style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#D97706', fontSize: '0.95rem', fontWeight: '900' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Designated Store In-Charge Name & Email</label>
            <input
              type="text"
              required
              value={selectedStock.incharge}
              onChange={(e) => setSelectedStock({ ...selectedStock, incharge: e.target.value })}
              style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
            />
          </div>

          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.65rem 1.25rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
            <button type="submit" style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}>Update Thresholds</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function VendorModal({
  show,
  onClose,
  vendorForm,
  setVendorForm,
  isEditing = false,
  onSave
}) {
  if (!show) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
      <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '520px', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
              {isEditing ? 'Edit Supplier / Vendor' : 'Add New Supplier / Vendor'}
            </h3>
            <div style={{ fontSize: '0.8rem', color: '#006B70', fontWeight: '700' }}>Vendor Code: {vendorForm?.code}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <form onSubmit={onSave} style={{ padding: '1.5rem', display: 'grid', gap: '0.9rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Code</label>
              <input
                type="text"
                required
                value={vendorForm?.code || ''}
                onChange={(e) => setVendorForm({ ...vendorForm, code: e.target.value.toUpperCase() })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '800', fontFamily: 'monospace' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Company / Vendor Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Becton Dickinson (BD India)"
                value={vendorForm?.name || ''}
                onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '700' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Supply Category</label>
            <input
              type="text"
              required
              placeholder="e.g. Vacutainers & Needles, IoT Carry Bags"
              value={vendorForm?.category || ''}
              onChange={(e) => setVendorForm({ ...vendorForm, category: e.target.value })}
              style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.88rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Contact Person</label>
              <input
                type="text"
                required
                placeholder="e.g. Rajesh Mehra"
                value={vendorForm?.contactPerson || ''}
                onChange={(e) => setVendorForm({ ...vendorForm, contactPerson: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.88rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Phone Number</label>
              <input
                type="text"
                required
                placeholder="+91 98110 55443"
                value={vendorForm?.phone || ''}
                onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Email Address</label>
              <input
                type="email"
                required
                placeholder="orders@bd.com"
                value={vendorForm?.email || ''}
                onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.88rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>GSTIN</label>
              <input
                type="text"
                placeholder="37AABCB1234F1Z8"
                value={vendorForm?.gstin || ''}
                onChange={(e) => setVendorForm({ ...vendorForm, gstin: e.target.value.toUpperCase() })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Lead Time (Days)</label>
              <input
                type="number"
                min="1"
                value={vendorForm?.leadTimeDays ?? 3}
                onChange={(e) => setVendorForm({ ...vendorForm, leadTimeDays: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.88rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Payment Terms</label>
              <input
                type="text"
                placeholder="Net 30 Days"
                value={vendorForm?.paymentTerms || 'Net 30 Days'}
                onChange={(e) => setVendorForm({ ...vendorForm, paymentTerms: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.88rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Rating</label>
              <input
                type="text"
                placeholder="4.9 ★"
                value={vendorForm?.rating || '4.8 ★'}
                onChange={(e) => setVendorForm({ ...vendorForm, rating: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.65rem 1.25rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
            <button type="submit" style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}>
              {isEditing ? 'Update Supplier' : 'Save Supplier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =========================================================================
// BARCODE & QR GENERATION MODAL FOR INVENTORY SKUs & KITS
// =========================================================================
export function BarcodeLabelModal({
  show,
  onClose,
  item
}) {
  const [labelQty, setLabelQty] = React.useState(10);
  const [lotNumber, setLotNumber] = React.useState('');

  React.useEffect(() => {
    if (item) {
      setLotNumber(`LOT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
    }
  }, [item]);

  if (!show || !item) return null;

  const barcodeValue = `${item.code}-${lotNumber || 'BATCH01'}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
      <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '520px', borderRadius: '22px', border: '1px solid #CBD5E1', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F0FDFA' }}>
          <div>
            <span style={{ fontSize: '0.72rem', backgroundColor: '#CCFBF1', color: '#0F766E', padding: '0.15rem 0.5rem', borderRadius: '5px', fontWeight: '900' }}>
              THERMAL BARCODE LABEL SYSTEM
            </span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A', margin: '0.25rem 0 0' }}>
              Generate SKU Barcode & Label
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Label Preview Card (Thermal Sticker Format) */}
          <div style={{
            border: '2px dashed #006B70',
            borderRadius: '14px',
            padding: '1.25rem',
            backgroundColor: '#FAFCFC',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.65rem'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '900', color: '#004D40', letterSpacing: '0.5px' }}>
              MEDMARG CENTRAL PHLEBOTOMY LOGISTICS
            </div>

            <div style={{ fontSize: '1rem', fontWeight: '900', color: '#0F172A' }}>
              {item.name}
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.75rem', color: '#475569', fontWeight: '700' }}>
              <span>SKU: <strong style={{ color: '#006B70', fontFamily: 'monospace' }}>{item.code}</strong></span>
              <span>•</span>
              <span>Unit: <strong>{item.unit}</strong></span>
              <span>•</span>
              <span>{item.type === 'KIT' ? 'COMBO KIT' : 'SINGLE'}</span>
            </div>

            {/* Stylized Barcode Simulator */}
            <div style={{
              backgroundColor: '#FFFFFF',
              padding: '0.85rem 1.25rem',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '85%'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', height: '42px', width: '100%' }}>
                {Array.from({ length: 48 }).map((_, idx) => (
                  <div
                    key={idx}
                    style={{
                      height: '100%',
                      width: (idx % 3 === 0 || idx % 7 === 0) ? '3px' : (idx % 2 === 0 ? '1.5px' : '2px'),
                      backgroundColor: (idx % 5 === 0) ? '#FFFFFF' : '#0F172A'
                    }}
                  />
                ))}
              </div>
              <div style={{ fontFamily: 'monospace', fontWeight: '900', fontSize: '0.85rem', color: '#0F172A', letterSpacing: '2px', marginTop: '0.35rem' }}>
                *{barcodeValue}*
              </div>
            </div>

            <div style={{ fontSize: '0.72rem', color: '#64748B', display: 'flex', gap: '0.75rem' }}>
              <span>Batch/Lot: <strong>{lotNumber}</strong></span>
              <span>Storage: <strong>{item.category}</strong></span>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>
                Batch / Lot Number
              </label>
              <input
                type="text"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value.toUpperCase())}
                style={{ width: '100%', padding: '0.6rem 0.85rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800', fontFamily: 'monospace' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>
                Sticker Print Quantity
              </label>
              <select
                value={labelQty}
                onChange={(e) => setLabelQty(Number(e.target.value))}
                style={{ width: '100%', padding: '0.6rem 0.85rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800', backgroundColor: '#FFFFFF' }}
              >
                <option value={1}>1 Label (Sample / Bin)</option>
                <option value={10}>10 Labels</option>
                <option value={50}>50 Labels (Batch)</option>
                <option value={100}>100 Labels (Full Roll)</option>
                <option value={500}>500 Labels (Bulk Case)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '0.65rem 1.25rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                padding: '0.65rem 1.4rem',
                backgroundColor: '#006B70',
                color: '#FFF',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '900',
                cursor: 'pointer',
                fontSize: '0.85rem',
                boxShadow: '0 4px 12px rgba(0,107,112,0.25)'
              }}
            >
              🖨️ Print {labelQty} Barcode Labels
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// PACK / ASSEMBLE COMBO KIT MODAL
// =========================================================================
export function AssembleKitModal({
  show,
  onClose,
  kitItem,
  inventoryStock = [],
  onAssemble
}) {
  const [quantity, setQuantity] = React.useState(10);

  if (!show || !kitItem) return null;

  const components = kitItem.components || [];

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
      <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '520px', borderRadius: '22px', border: '1px solid #CBD5E1', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#EEF2FF' }}>
          <div>
            <span style={{ fontSize: '0.72rem', backgroundColor: '#E0E7FF', color: '#4338CA', padding: '0.15rem 0.5rem', borderRadius: '5px', fontWeight: '900' }}>
              COMBO KIT PACKAGING DESK
            </span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#1E1B4B', margin: '0.25rem 0 0' }}>
              Pack & Assemble Combo Kits
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700' }}>Target Kit to Pack:</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>{kitItem.name} ({kitItem.code})</div>
            <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '800', marginTop: '0.2rem' }}>Current Kit Stock: {kitItem.stock} Kits</div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>
              How many kits to assemble/pack now?
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1.5px solid #6366F1', borderRadius: '10px', fontSize: '1rem', fontWeight: '900', color: '#1E1B4B' }}
            />
          </div>

          {/* Component Deduction Preview */}
          <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '1rem', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '900', color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Components Deducted from Warehouse:
            </div>
            {components.length === 0 ? (
              <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
                No component specification configured for this kit yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {components.map((c, idx) => {
                  const neededTotal = (c.qty || 1) * quantity;
                  const match = inventoryStock.find(s => s.code === c.itemCode || s.name.toLowerCase().includes(c.name.toLowerCase()));
                  const available = match ? match.stock : 0;
                  const isSufficient = available >= neededTotal;

                  return (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', padding: '0.25rem 0', borderBottom: '1px dashed #E2E8F0' }}>
                      <span>• <strong>{c.name}</strong> ({c.qty} per kit)</span>
                      <span style={{ fontWeight: '800', color: isSufficient ? '#059669' : '#DC2626' }}>
                        Deduct: {neededTotal} (Available: {available})
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '0.65rem 1.25rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onAssemble(kitItem, quantity)}
              style={{
                padding: '0.65rem 1.4rem',
                backgroundColor: '#4F46E5',
                color: '#FFF',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '900',
                cursor: 'pointer',
                fontSize: '0.85rem',
                boxShadow: '0 4px 12px rgba(79,70,229,0.25)'
              }}
            >
              ✓ Confirm Assembly & Add to Stock
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 10. Return Stock from Agent Bag to Warehouse Modal
// -------------------------------------------------------------
export function ReturnStockModal({
  show,
  onClose,
  agent,
  inventoryStock = [],
  onConfirmReturn
}) {
  const [selectedItemCode, setSelectedItemCode] = useState('');
  const [returnQty, setReturnQty] = useState(1);
  const [returnReason, setReturnReason] = useState('Unused Surplus / Shift End');

  useEffect(() => {
    if (agent && Array.isArray(agent.items) && agent.items.length > 0) {
      setSelectedItemCode(agent.items[0].itemCode);
      setReturnQty(Math.min(1, agent.items[0].quantity || 1));
    }
  }, [agent]);

  if (!show || !agent) return null;

  const agentItems = Array.isArray(agent.items) ? agent.items : [];
  const currentItem = agentItems.find(i => i.itemCode === selectedItemCode) || agentItems[0];
  const maxAvailable = currentItem ? (currentItem.quantity || 0) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentItem) return;
    if (returnQty <= 0 || returnQty > maxAvailable) {
      alert(`Invalid quantity. Agent has ${maxAvailable} in hand.`);
      return;
    }
    onConfirmReturn({
      agentId: agent.agentId,
      itemCode: currentItem.itemCode,
      quantity: Number(returnQty),
      reason: returnReason
    });
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem', backdropFilter: 'blur(3px)' }}>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '520px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        <div style={{ padding: '1.25rem 1.5rem', backgroundColor: '#006B70', color: '#FFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              ↩️ Return Stock to Warehouse
            </h3>
            <div style={{ fontSize: '0.78rem', opacity: 0.9, marginTop: '0.15rem' }}>
              Phlebotomist: <strong>{agent.agentName}</strong> ({agent.agentId})
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {agentItems.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', color: '#64748B' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>🎒</div>
              <div style={{ fontWeight: '800', color: '#0F172A' }}>Agent Bag is Currently Empty</div>
              <div style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>There are no allocated consumables in this phlebotomist's in-hand inventory to return.</div>
            </div>
          ) : (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>
                  Select Item to Return
                </label>
                <select
                  value={selectedItemCode}
                  onChange={(e) => {
                    setSelectedItemCode(e.target.value);
                    const itm = agentItems.find(i => i.itemCode === e.target.value);
                    if (itm) setReturnQty(Math.min(1, itm.quantity));
                  }}
                  style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                >
                  {agentItems.map(i => (
                    <option key={i.itemCode} value={i.itemCode}>
                      {i.name || i.itemCode} (In Hand: {i.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>
                    Return Quantity (Max: {maxAvailable})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={maxAvailable}
                    value={returnQty}
                    onChange={(e) => setReturnQty(Math.max(1, Math.min(maxAvailable, Number(e.target.value))))}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#006B70', fontSize: '0.95rem', fontWeight: '900' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>
                    Reason for Return
                  </label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  >
                    <option value="Unused Surplus / Shift End">Unused Surplus / Shift End</option>
                    <option value="Near Expiry Batch Swap">Near Expiry Batch Swap</option>
                    <option value="Damaged / Compromised Seal">Damaged / Compromised Seal</option>
                    <option value="Resigned / Territory Handover">Resigned / Territory Handover</option>
                  </select>
                </div>
              </div>

              <div style={{ padding: '0.85rem', backgroundColor: '#F0FDFA', borderRadius: '10px', border: '1px solid #99F6E4', fontSize: '0.8rem', color: '#0f766e' }}>
                ℹ️ Returning this consumable will deduct <strong>{returnQty} units</strong> from {agent.agentName}'s in-hand bag balance and credit them back into Central Warehouse inventory instantly.
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '0.65rem 1.25rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Cancel
            </button>
            {agentItems.length > 0 && (
              <button
                type="submit"
                style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(0,107,112,0.25)' }}
              >
                ✓ Confirm Return to Warehouse
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

