import React from 'react';
import { X } from 'lucide-react';

export function AddStockModal({
  show,
  onClose,
  stockForm,
  setStockForm,
  onSave
}) {
  if (!show) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
      <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '520px', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>Add Single Consumable or Combo Kit</h3>
            <div style={{ fontSize: '0.8rem', color: '#006B70', fontWeight: '700' }}>Item Code: {stockForm.code}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <form onSubmit={onSave} style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Item Type</label>
              <select
                value={stockForm.type}
                onChange={(e) => setStockForm({ ...stockForm, type: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
              >
                <option value="SINGLE">Single Consumable Item</option>
                <option value="KIT">Combo Pre-Packaged Kit</option>
              </select>
            </div>
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
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Item / Kit Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Light Blue Sodium Citrate Tubes 2.7ml"
              value={stockForm.name}
              onChange={(e) => setStockForm({ ...stockForm, name: e.target.value })}
              style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Initial Stock</label>
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
            <button type="submit" style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}>Save & Register SKU</button>
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
