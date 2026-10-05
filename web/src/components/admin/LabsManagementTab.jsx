import React, { useState } from 'react';
import { Building2, PlusCircle, Edit3, X } from 'lucide-react';

export default function LabsManagementTab({
  labPartners = [],
  setLabPartners = () => {},
  territories = []
}) {
  const [showAddLabModal, setShowAddLabModal] = useState(false);
  const [labForm, setLabForm] = useState({
    id: `LAB-0${labPartners.length + 1}`,
    name: '',
    type: 'Regional NABL Partner',
    city: 'Tirupati',
    nabl: 'NABL-AP-2026-',
    status: 'ACTIVE',
    assignedMargin: '18%',
    activeOrders: 0
  });

  const [editingLab, setEditingLab] = useState(null);
  const [editLabForm, setEditLabForm] = useState({
    name: '',
    type: '',
    city: '',
    nabl: '',
    status: 'ACTIVE',
    assignedMargin: ''
  });

  const handleSaveNewLab = (e) => {
    e.preventDefault();
    setLabPartners(prev => [...prev, labForm]);
    setShowAddLabModal(false);
    setLabForm({
      id: `LAB-0${labPartners.length + 2}`,
      name: '',
      type: 'Regional NABL Partner',
      city: 'Tirupati',
      nabl: 'NABL-AP-2026-',
      status: 'ACTIVE',
      assignedMargin: '18%',
      activeOrders: 0
    });
  };

  const handleSaveEditLab = (e) => {
    e.preventDefault();
    if (!editingLab) return;
    setLabPartners(prev => prev.map(l => l.id === editingLab.id ? { ...l, ...editLabForm } : l));
    setEditingLab(null);
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A' }}>Regional NABL Processing Labs & Routing Engine</h2>
          <p style={{ color: '#64748B', fontSize: '0.85rem' }}>Configure accredited laboratory partners, commercial margin percentages, and automated sample routing by zone.</p>
        </div>
        <button
          onClick={() => setShowAddLabModal(true)}
          style={{ padding: '0.65rem 1.25rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem', boxShadow: '0 4px 14px rgba(0,107,112,0.2)' }}
        >
          <PlusCircle size={16} color="#FBBF24" /> Add NABL Lab Partner
        </button>
      </div>

      {/* Lab Partners Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2.25rem' }}>
        {labPartners.map(lab => (
          <div key={lab.id} style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', backgroundColor: 'rgba(0,107,112,0.1)', color: '#006B70', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '800', fontFamily: 'monospace', border: '1px solid rgba(0,107,112,0.2)' }}>
                {lab.nabl}
              </span>
              <span style={{ fontSize: '0.75rem', color: lab.status === 'ACTIVE' ? '#059669' : '#D97706', fontWeight: '800' }}>
                ● {lab.status}
              </span>
            </div>

            <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A' }}>{lab.name}</h3>
                <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.2rem' }}>📍 {lab.city} • {lab.type}</div>
              </div>
              <button
                onClick={() => { setEditingLab(lab); setEditLabForm({ name: lab.name, type: lab.type, city: lab.city, nabl: lab.nabl, status: lab.status, assignedMargin: lab.assignedMargin }); }}
                style={{ background: 'none', border: 'none', color: '#0284C7', cursor: 'pointer', padding: '0.2rem' }}
              >
                <Edit3 size={16} />
              </button>
            </div>

            <div style={{ marginTop: '1.25rem', padding: '0.9rem 1rem', backgroundColor: '#F8FAFC', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', border: '1px solid #E2E8F0' }}>
              <span>Active Routed Orders: <strong style={{ color: '#D97706' }}>{lab.activeOrders || 0}</strong></span>
              <span>Margin Share: <strong style={{ color: '#006B70', fontWeight: '900' }}>{lab.assignedMargin}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Lab Routing Rules Summary */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Building2 size={18} color="#006B70" /> Automated Territory Sample Routing Matrix
      </h3>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '1rem 1.25rem' }}>Territory Zone</th>
              <th style={{ padding: '1rem' }}>Covered Pincodes</th>
              <th style={{ padding: '1rem' }}>Assigned Primary Processing Lab</th>
              <th style={{ padding: '1rem' }}>Routing Status</th>
            </tr>
          </thead>
          <tbody>
            {territories.map((zone, idx) => {
              const assignedLabName = idx === 0 ? 'MedMarg Central Processing Lab' : idx === 1 ? 'Apollo Diagnostics Regional Lab' : 'Dr. Lal PathLabs Hub';
              return (
                <tr key={zone.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: '800', color: '#0F172A' }}>{zone.name}</td>
                  <td style={{ padding: '1rem', fontFamily: 'monospace', color: '#006B70' }}>{(zone.pincodes || []).join(', ')}</td>
                  <td style={{ padding: '1rem', color: '#B45309', fontWeight: '700' }}>🏥 {assignedLabName}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '800', backgroundColor: '#DCFCE7', color: '#15803D' }}>
                      ACTIVE AUTO-ROUTING
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: ADD LAB PARTNER MODAL */}
      {showAddLabModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '540px', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A' }}>Add NABL Diagnostic Lab Partner</h3>
                <div style={{ fontSize: '0.8rem', color: '#006B70', fontWeight: '700' }}>Lab ID: {labForm.id}</div>
              </div>
              <button onClick={() => setShowAddLabModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveNewLab} style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Laboratory Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vijaya Diagnostic Hub"
                  value={labForm.name}
                  onChange={(e) => setLabForm({ ...labForm, name: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Lab Type</label>
                  <select
                    value={labForm.type}
                    onChange={(e) => setLabForm({ ...labForm, type: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  >
                    <option value="Primary Processing Hub">Primary Processing Hub</option>
                    <option value="Regional NABL Partner">Regional NABL Partner</option>
                    <option value="Accredited Lab Partner">Accredited Lab Partner</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>NABL Accreditation Code</label>
                  <input
                    type="text"
                    required
                    placeholder="NABL-AP-XXXX"
                    value={labForm.nabl}
                    onChange={(e) => setLabForm({ ...labForm, nabl: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Commercial Margin %</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 20%"
                    value={labForm.assignedMargin}
                    onChange={(e) => setLabForm({ ...labForm, assignedMargin: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#006B70', fontSize: '0.88rem', fontWeight: '900' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Location / City</label>
                  <input
                    type="text"
                    required
                    value={labForm.city}
                    onChange={(e) => setLabForm({ ...labForm, city: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddLabModal(false)} style={{ padding: '0.65rem 1.25rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}>Save Lab Partner</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT LAB PARTNER MODAL */}
      {editingLab && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '540px', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A' }}>Edit NABL Lab Configuration</h3>
                <div style={{ fontSize: '0.8rem', color: '#006B70', fontWeight: '700' }}>{editingLab.id}</div>
              </div>
              <button onClick={() => setEditingLab(null)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveEditLab} style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Lab Name</label>
                <input
                  type="text"
                  required
                  value={editLabForm.name}
                  onChange={(e) => setEditLabForm({ ...editLabForm, name: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Commercial Margin %</label>
                  <input
                    type="text"
                    required
                    value={editLabForm.assignedMargin}
                    onChange={(e) => setEditLabForm({ ...editLabForm, assignedMargin: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#006B70', fontSize: '0.88rem', fontWeight: '900' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Operational Status</label>
                  <select
                    value={editLabForm.status}
                    onChange={(e) => setEditLabForm({ ...editLabForm, status: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setEditingLab(null)} style={{ padding: '0.65rem 1.25rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
