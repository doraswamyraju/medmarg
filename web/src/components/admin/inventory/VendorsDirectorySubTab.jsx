import React, { useState } from 'react';
import { ShoppingBag, Search, Plus, Edit3, Trash2, Building2, Phone, Mail } from 'lucide-react';

export default function VendorsDirectorySubTab({
  vendors = [],
  onOpenCreatePo = () => {},
  onOpenAddVendor = () => {},
  onOpenEditVendor = () => {},
  onDeleteVendor = () => {}
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVendors = vendors.filter(v => {
    const q = (searchTerm || '').toLowerCase();
    return (
      !q ||
      (v.name && v.name.toLowerCase().includes(q)) ||
      (v.code && v.code.toLowerCase().includes(q)) ||
      (v.category && v.category.toLowerCase().includes(q)) ||
      (v.contactPerson && v.contactPerson.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Search & Actions Bar */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search suppliers by name, code, contact or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.55rem 0.85rem 0.55rem 2.4rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
          />
        </div>

        <button
          onClick={onOpenAddVendor}
          style={{ padding: '0.55rem 1.1rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 4px 12px rgba(0,107,112,0.2)' }}
        >
          <Plus size={15} /> + Add Supplier / Vendor
        </button>
      </div>

      {/* Tabular Directory */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '0.85rem 1.25rem' }}>Code</th>
              <th style={{ padding: '0.85rem' }}>Vendor / Manufacturer</th>
              <th style={{ padding: '0.85rem' }}>Category</th>
              <th style={{ padding: '0.85rem' }}>Contact & Communication</th>
              <th style={{ padding: '0.85rem' }}>Lead Time & Terms</th>
              <th style={{ padding: '0.85rem' }}>Rating</th>
              <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontWeight: '700' }}>
                  No suppliers found matching your search.
                </td>
              </tr>
            ) : (
              filteredVendors.map(v => (
                <tr key={v.code} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', color: '#006B70', fontWeight: '800' }}>
                    {v.code}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Building2 size={15} color="#006B70" /> {v.name}
                    </div>
                    {v.gstin && (
                      <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.15rem' }}>
                        GSTIN: <strong>{v.gstin}</strong>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#334155', backgroundColor: '#F1F5F9', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '700' }}>
                      {v.category}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '700', color: '#0F172A' }}>{v.contactPerson}</div>
                    <div style={{ fontSize: '0.74rem', color: '#006B70', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                      <Phone size={11} /> {v.phone}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.1rem' }}>
                      <Mail size={11} /> {v.email}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.78rem', color: '#0F172A', fontWeight: '800' }}>
                      {v.leadTimeDays} Days Lead Time
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                      Terms: {v.paymentTerms}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#B45309', fontWeight: '800', backgroundColor: '#FEF3C7', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                      {v.rating}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button
                        onClick={() => onOpenCreatePo(v.name)}
                        title="Create Purchase Order"
                        style={{ padding: '0.35rem 0.65rem', backgroundColor: '#E0F2FE', color: '#0369A1', border: '1px solid #BAE6FD', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <ShoppingBag size={12} /> PO
                      </button>
                      <button
                        onClick={() => onOpenEditVendor(v)}
                        title="Edit Supplier"
                        style={{ padding: '0.35rem 0.65rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <Edit3 size={12} /> Edit
                      </button>
                      <button
                        onClick={() => onDeleteVendor(v.code)}
                        title="Delete Supplier"
                        style={{ padding: '0.35rem 0.55rem', backgroundColor: '#FEE2E2', color: '#991B1B', border: 'none', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
