import React, { useState } from 'react';
import { PlusCircle, Edit3, UserCheck, MapPin, Phone, Building2, CheckCircle, X } from 'lucide-react';

export default function LiveOrdersDispatchTab({
  orders = [],
  setOrders = () => {},
  salariedAgents = [],
  labPartners = []
}) {
  // Modal states
  const [reassigningOrder, setReassigningOrder] = useState(null);
  const [selectedAgentOption, setSelectedAgentOption] = useState('');
  
  const [editingOrder, setEditingOrder] = useState(null);
  const [editForm, setEditForm] = useState({
    patientName: '',
    phone: '',
    city: 'Tirupati',
    address: '',
    items: '',
    amount: '',
    status: 'PENDING_DISPATCH',
    assignedAgent: 'Unassigned',
    lab: '',
    otp: ''
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    id: `MM-${Math.floor(1000 + Math.random() * 9000)}`,
    patientName: '',
    phone: '',
    city: 'Tirupati',
    address: '',
    items: 'HbA1c + Complete Blood Count',
    amount: '899',
    status: 'PENDING_DISPATCH',
    assignedAgent: 'Unassigned',
    lab: labPartners[0]?.name || 'MedMarg Central Processing Lab',
    otp: Math.floor(1000 + Math.random() * 9000).toString()
  });

  // Open Reassign Modal
  const handleOpenReassign = (order) => {
    setReassigningOrder(order);
    setSelectedAgentOption(order.assignedAgent || 'Unassigned');
  };

  // Submit Reassign Agent
  const handleConfirmReassign = () => {
    if (!reassigningOrder) return;
    setOrders(prev => prev.map(o => {
      if (o.id === reassigningOrder.id) {
        return {
          ...o,
          assignedAgent: selectedAgentOption,
          status: selectedAgentOption.includes('Unassigned') ? 'PENDING_DISPATCH' : (o.status === 'PENDING_DISPATCH' ? 'EN_ROUTE' : o.status)
        };
      }
      return o;
    }));
    setReassigningOrder(null);
  };

  // Open Edit Modal
  const handleOpenEdit = (order) => {
    setEditingOrder(order);
    setEditForm({
      patientName: order.patientName || '',
      phone: order.phone || '',
      city: order.city || 'Tirupati',
      address: order.address || '',
      items: order.items || '',
      amount: order.amount || '',
      status: order.status || 'PENDING_DISPATCH',
      assignedAgent: order.assignedAgent || 'Unassigned',
      lab: order.lab || (labPartners[0]?.name || 'MedMarg Central Processing Lab'),
      otp: order.otp || '1234'
    });
  };

  // Submit Edit Order
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingOrder) return;
    setOrders(prev => prev.map(o => {
      if (o.id === editingOrder.id) {
        return {
          ...o,
          ...editForm,
          amount: Number(editForm.amount) || o.amount
        };
      }
      return o;
    }));
    setEditingOrder(null);
  };

  // Submit Create Order
  const handleCreateOrder = (e) => {
    e.preventDefault();
    const newOrd = {
      ...createForm,
      amount: Number(createForm.amount) || 899,
      createdAt: `Today ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    };
    setOrders(prev => [newOrd, ...prev]);
    setShowCreateModal(false);
    setCreateForm({
      id: `MM-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: '',
      phone: '',
      city: 'Tirupati',
      address: '',
      items: 'HbA1c + Complete Blood Count',
      amount: '899',
      status: 'PENDING_DISPATCH',
      assignedAgent: 'Unassigned',
      lab: labPartners[0]?.name || 'MedMarg Central Processing Lab',
      otp: Math.floor(1000 + Math.random() * 9000).toString()
    });
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'EN_ROUTE':
        return { bg: '#E0F2FE', color: '#0284C7', label: 'EN ROUTE' };
      case 'SAMPLE_COLLECTED':
        return { bg: '#D1FAE5', color: '#059669', label: 'SAMPLE COLLECTED' };
      case 'TRANSIT_TO_LAB':
        return { bg: '#F3E8FF', color: '#7E22CE', label: 'TRANSIT TO LAB' };
      case 'LAB_PROCESSING':
        return { bg: '#FCE7F3', color: '#DB2777', label: 'LAB PROCESSING' };
      case 'COMPLETED':
        return { bg: '#DCFCE7', color: '#16A34A', label: 'COMPLETED' };
      case 'CANCELLED':
        return { bg: '#FEE2E2', color: '#DC2626', label: 'CANCELLED' };
      default:
        return { bg: '#FEF3C7', color: '#D97706', label: 'PENDING DISPATCH' };
    }
  };

  return (
    <div>
      {/* Top Header & Actions */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A' }}>Live Orders & Auto-Dispatch Command Center</h2>
          <p style={{ color: '#64748B', fontSize: '0.85rem' }}>Monitor patient requests, reassign phlebotomists, doorstep OTPs, lab routing & manual overrides.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{ padding: '0.65rem 1.25rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem', boxShadow: '0 4px 14px rgba(0,107,112,0.2)' }}
        >
          <PlusCircle size={16} color="#FBBF24" /> Create Test Order
        </button>
      </div>

      {/* Orders Table Container */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '1rem 1.25rem' }}>Order ID</th>
              <th style={{ padding: '1rem' }}>Patient & Address</th>
              <th style={{ padding: '1rem' }}>Tests / Package</th>
              <th style={{ padding: '1rem' }}>Phlebotomist Agent</th>
              <th style={{ padding: '1rem' }}>Assigned Lab</th>
              <th style={{ padding: '1rem' }}>Doorstep OTP</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
                  No active live orders found. Click "Create Test Order" to add one.
                </td>
              </tr>
            ) : (
              orders.map(ord => {
                const statusBadge = getStatusBadgeStyle(ord.status);
                return (
                  <tr key={ord.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s' }}>
                    <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', color: '#006B70', fontWeight: '800' }}>
                      {ord.id}
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 'normal', fontFamily: 'sans-serif' }}>{ord.createdAt || 'Today'}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: '800', color: '#0F172A' }}>{ord.patientName}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                        <Phone size={12} color="#64748B" /> {ord.phone}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                        <MapPin size={12} color="#D97706" /> {ord.address}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: '#334155' }}>
                      <div style={{ fontWeight: '700', color: '#0F172A' }}>{ord.items}</div>
                      <div style={{ fontSize: '0.78rem', color: '#006B70', fontWeight: '800', marginTop: '0.15rem' }}>₹{ord.amount}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ color: ord.assignedAgent === 'Unassigned' ? '#DC2626' : '#B45309', fontWeight: '700', fontSize: '0.85rem' }}>
                        {ord.assignedAgent}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: '#64748B', fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#0284C7', fontWeight: '600' }}>
                        <Building2 size={13} /> {ord.lab || 'MedMarg Central Lab'}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontFamily: 'monospace', color: '#059669', fontWeight: '900' }}>
                      <span style={{ backgroundColor: '#ECFDF5', padding: '0.2rem 0.55rem', borderRadius: '6px', border: '1px solid #A7F3D0' }}>
                        🔑 {ord.otp}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontSize: '0.73rem', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: '800', backgroundColor: statusBadge.bg, color: statusBadge.color, display: 'inline-block' }}>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleOpenReassign(ord)}
                          style={{ padding: '0.4rem 0.75rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <UserCheck size={14} color="#FBBF24" /> Reassign
                        </button>
                        <button 
                          onClick={() => handleOpenEdit(ord)}
                          style={{ padding: '0.4rem 0.65rem', backgroundColor: '#F1F5F9', color: '#0284C7', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Edit3 size={14} /> Edit
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

      {/* MODAL 1: REASSIGN AGENT MODAL */}
      {reassigningOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '520px', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A' }}>Reassign Phlebotomist Agent</h3>
                <div style={{ fontSize: '0.8rem', color: '#006B70', fontWeight: '700' }}>Order ID: {reassigningOrder.id} ({reassigningOrder.patientName})</div>
              </div>
              <button onClick={() => setReassigningOrder(null)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#334155', marginBottom: '0.6rem' }}>
                Select Salaried Phlebotomist or FCM Broadcast Channel:
              </label>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {salariedAgents.map(ag => {
                  const agentLabel = `${ag.name} (${ag.id}) - Zone: ${ag.area}`;
                  const isSelected = selectedAgentOption === agentLabel;
                  return (
                    <div 
                      key={ag.id}
                      onClick={() => setSelectedAgentOption(agentLabel)}
                      style={{ padding: '0.9rem 1.1rem', backgroundColor: isSelected ? 'rgba(0,107,112,0.08)' : '#F8FAFC', border: isSelected ? '2px solid #006B70' : '1px solid #E2E8F0', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <div>
                        <div style={{ fontWeight: '800', color: isSelected ? '#006B70' : '#0F172A', fontSize: '0.9rem' }}>👨‍⚕️ {ag.name} ({ag.id})</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>📍 Area: {ag.area} • Quota: {ag.samplesToday || 0}/{ag.maxDailyQuota || 15}</div>
                      </div>
                      {isSelected && <CheckCircle size={18} color="#059669" />}
                    </div>
                  );
                })}

                {(() => {
                  const broadcastLabel = '🚀 FCM Freelancer Broadcast Network (Open Market Gig Phlebotomists)';
                  const isSelected = selectedAgentOption === broadcastLabel;
                  return (
                    <div 
                      onClick={() => setSelectedAgentOption(broadcastLabel)}
                      style={{ padding: '0.9rem 1.1rem', backgroundColor: isSelected ? '#FEF3C7' : '#F8FAFC', border: isSelected ? '2px solid #D97706' : '1px solid #E2E8F0', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <div>
                        <div style={{ fontWeight: '800', color: isSelected ? '#B45309' : '#D97706', fontSize: '0.9rem' }}>📢 FCM Freelancer Broadcast</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Broadcast collection push notification to all verified freelance agents in radius</div>
                      </div>
                      {isSelected && <CheckCircle size={18} color="#D97706" />}
                    </div>
                  );
                })()}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => setReassigningOrder(null)} 
                  style={{ padding: '0.65rem 1.25rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmReassign} 
                  style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Confirm Reassignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT / UPDATE ORDER MODAL */}
      {editingOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '600px', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', position: 'sticky', top: 0, zIndex: 10 }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A' }}>Edit / Update Order Details</h3>
                <div style={{ fontSize: '0.8rem', color: '#006B70', fontWeight: '700' }}>Order ID: {editingOrder.id}</div>
              </div>
              <button onClick={() => setEditingOrder(null)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Order Execution Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem', fontWeight: '700' }}
                >
                  <option value="PENDING_DISPATCH">PENDING_DISPATCH</option>
                  <option value="EN_ROUTE">EN_ROUTE</option>
                  <option value="SAMPLE_COLLECTED">SAMPLE_COLLECTED</option>
                  <option value="TRANSIT_TO_LAB">TRANSIT_TO_LAB</option>
                  <option value="LAB_PROCESSING">LAB_PROCESSING</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Patient Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.patientName}
                    onChange={(e) => setEditForm({ ...editForm, patientName: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Phone Number</label>
                  <input
                    type="text"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Doorstep Collection Address</label>
                <input
                  type="text"
                  required
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Tests / Package Included</label>
                  <input
                    type="text"
                    required
                    value={editForm.items}
                    onChange={(e) => setEditForm({ ...editForm, items: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Total Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={editForm.amount}
                    onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Designated Processing Lab</label>
                  <select
                    value={editForm.lab}
                    onChange={(e) => setEditForm({ ...editForm, lab: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  >
                    {labPartners.map(l => (
                      <option key={l.id} value={l.name}>{l.name}</option>
                    ))}
                    <option value="MedMarg Central Processing Lab">MedMarg Central Processing Lab</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Doorstep OTP Code</label>
                  <input
                    type="text"
                    required
                    value={editForm.otp}
                    onChange={(e) => setEditForm({ ...editForm, otp: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', color: '#059669', fontSize: '0.88rem', fontFamily: 'monospace', fontWeight: '900' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setEditingOrder(null)} 
                  style={{ padding: '0.65rem 1.25rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Save Order Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE TEST ORDER MODAL */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '580px', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A' }}>Create Manual Test Order</h3>
                <div style={{ fontSize: '0.8rem', color: '#006B70', fontWeight: '700' }}>Order ID: {createForm.id}</div>
              </div>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateOrder} style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Patient Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Reddy"
                    value={createForm.patientName}
                    onChange={(e) => setCreateForm({ ...createForm, patientName: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Doorstep Address & Landmark</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 302, Royal Towers, Air Bypass Rd, Tirupati"
                  value={createForm.address}
                  onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Test Package / Individual Tests</label>
                  <input
                    type="text"
                    required
                    value={createForm.items}
                    onChange={(e) => setCreateForm({ ...createForm, items: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={createForm.amount}
                    onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Assign Agent</label>
                  <select
                    value={createForm.assignedAgent}
                    onChange={(e) => setCreateForm({ ...createForm, assignedAgent: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  >
                    <option value="Unassigned">Unassigned (Auto-Dispatch)</option>
                    {salariedAgents.map(ag => (
                      <option key={ag.id} value={`${ag.name} (${ag.id})`}>{ag.name} ({ag.id})</option>
                    ))}
                    <option value="🚀 FCM Freelancer Broadcast Network">🚀 FCM Freelancer Broadcast Network</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Processing Lab</label>
                  <select
                    value={createForm.lab}
                    onChange={(e) => setCreateForm({ ...createForm, lab: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  >
                    {labPartners.map(l => (
                      <option key={l.id} value={l.name}>{l.name}</option>
                    ))}
                    <option value="MedMarg Central Processing Lab">MedMarg Central Processing Lab</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)} 
                  style={{ padding: '0.65rem 1.25rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Create Live Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
