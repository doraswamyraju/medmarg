import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  MapPin, 
  Phone, 
  User, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  Plus, 
  Filter,
  DollarSign,
  ChevronRight,
  ExternalLink,
  Navigation,
  Check
} from 'lucide-react';
import { API_BASE, safeFetch } from '../../data/apiConfig';
import CreateManualOrderModal from '../admin/orders/CreateManualOrderModal';

export default function StaffDispatchDesk({ catalog = {}, user }) {
  const [orders, setOrders] = useState([]);
  const [salariedAgents, setSalariedAgents] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [labPartners, setLabPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showManualModal, setShowManualModal] = useState(false);
  const [assigningOrder, setAssigningOrder] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (text) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const fetchDispatchData = async () => {
    setLoading(true);
    try {
      const [ordRes, salRes, flRes, labRes] = await Promise.all([
        safeFetch(`${API_BASE}/api/v1/admin/orders`).then(r => r.json()),
        safeFetch(`${API_BASE}/api/v1/admin/fleet`).then(r => r.json()).catch(() => ({})),
        safeFetch(`${API_BASE}/api/v1/admin/freelancers`).then(r => r.json()).catch(() => ({})),
        safeFetch(`${API_BASE}/api/v1/admin/labs`).then(r => r.json()).catch(() => ({}))
      ]);

      if (ordRes && Array.isArray(ordRes.orders)) setOrders(ordRes.orders);
      if (salRes && Array.isArray(salRes.fleet)) setSalariedAgents(salRes.fleet);
      if (flRes && Array.isArray(flRes.freelancers)) setFreelancers(flRes.freelancers);
      if (labRes && Array.isArray(labRes.labs)) setLabPartners(labRes.labs);
    } catch (e) {
      console.warn('Dispatch data fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDispatchData();
  }, []);

  const handleReassignAgent = async (orderId, agentIdentifier) => {
    try {
      await safeFetch(`${API_BASE}/api/v1/admin/orders/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          assignedAgent: agentIdentifier
        })
      });

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, assignedAgent: agentIdentifier, status: 'EN_ROUTE' } : o));
      showToast(`Order #${orderId} assigned to ${agentIdentifier}!`);
      setAssigningOrder(null);
    } catch (err) {
      showToast(`Order assigned locally.`);
    }
  };

  const filteredOrders = orders.filter(o => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      (o.patientName && o.patientName.toLowerCase().includes(q)) ||
      (o.id && o.id.toLowerCase().includes(q)) ||
      (o.phone && o.phone.includes(q)) ||
      (o.address && o.address.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 99999,
          backgroundColor: '#ECFDF5',
          border: '1.5px solid #34D399',
          color: '#065F46',
          padding: '0.85rem 1.4rem',
          borderRadius: '12px',
          fontWeight: '800',
          fontSize: '0.88rem',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
        }}>
          ✓ {toastMsg}
        </div>
      )}

      {/* Control Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '0.72rem', backgroundColor: '#E0F2FE', color: '#0369A1', padding: '0.2rem 0.55rem', borderRadius: '4px', fontWeight: '900' }}>
              OPERATIONS DESK
            </span>
            <span style={{ fontSize: '0.72rem', backgroundColor: '#DCFCE7', color: '#15803D', padding: '0.2rem 0.55rem', borderRadius: '4px', fontWeight: '800' }}>
              Tirupati Central Fleet
            </span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
            Live Diagnostic Orders & Dispatch Control
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
            Receive patient calls, book manual door-collection visits, assign phlebotomists, and route blood samples to partner labs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={fetchDispatchData}
            disabled={loading}
            style={{ padding: '0.65rem 1rem', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button
            onClick={() => setShowManualModal(true)}
            style={{ padding: '0.65rem 1.25rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 14px rgba(0,107,112,0.2)' }}
          >
            <Plus size={16} color="#FBBF24" /> Create Manual Order
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <Search size={18} color="#64748B" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search orders by patient name, phone, address, or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.4rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.88rem', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { key: 'ALL', label: `All Orders (${orders.length})` },
            { key: 'BOOKED', label: 'Pending Dispatch' },
            { key: 'EN_ROUTE', label: 'Phlebo En-Route' },
            { key: 'SAMPLE_COLLECTED', label: 'Samples Collected' },
            { key: 'REPORT_READY', label: 'Report Ready' }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: '10px',
                border: statusFilter === f.key ? 'none' : '1px solid #CBD5E1',
                backgroundColor: statusFilter === f.key ? '#006B70' : '#FFFFFF',
                color: statusFilter === f.key ? '#FFF' : '#475569',
                fontWeight: '800',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '1rem 1.25rem' }}>Order Details</th>
              <th style={{ padding: '1rem' }}>Patient & Address</th>
              <th style={{ padding: '1rem' }}>Tests Ordered</th>
              <th style={{ padding: '1rem' }}>Assigned Phlebotomist</th>
              <th style={{ padding: '1rem' }}>Amount / Mode</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '3.5rem', textAlign: 'center', color: '#64748B' }}>
                  <Package size={36} color="#CBD5E1" style={{ marginBottom: '0.5rem' }} />
                  <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>No orders found in this category</div>
                </td>
              </tr>
            ) : (
              filteredOrders.map(ord => (
                <tr key={ord.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontWeight: '800', color: '#006B70', fontFamily: 'monospace' }}>{ord.id}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.1rem' }}>Slot: {ord.slot || ord.createdAt || 'Today'}</div>
                    {ord.otp && (
                      <span style={{ fontSize: '0.7rem', backgroundColor: '#F0FDFA', color: '#0F766E', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '800', border: '1px solid #99F6E4', display: 'inline-block', marginTop: '0.2rem' }}>
                        OTP: {ord.otp}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '800', color: '#0F172A' }}>{ord.patientName || ord.careSeekerName}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{ord.phone || ord.patientPhone}</div>
                    <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '0.15rem', maxWidth: '220px' }}>{ord.address}</div>
                  </td>
                  <td style={{ padding: '1rem', color: '#006B70', fontWeight: '700', maxWidth: '220px' }}>
                    {ord.items}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Truck size={14} color="#059669" />
                      <strong style={{ color: '#0F172A', fontSize: '0.84rem' }}>{ord.assignedAgent || 'Unassigned'}</strong>
                    </div>
                    <button
                      onClick={() => setAssigningOrder(ord)}
                      style={{ background: 'none', border: 'none', color: '#0284C7', fontSize: '0.74rem', fontWeight: '800', cursor: 'pointer', padding: 0, marginTop: '0.2rem', textDecoration: 'underline' }}
                    >
                      Re-assign Fleet →
                    </button>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '900', color: '#059669' }}>₹{ord.amount}</div>
                    <span style={{ fontSize: '0.7rem', backgroundColor: '#F1F5F9', color: '#475569', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '800' }}>
                      {ord.paymentMode || 'Prepaid'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      fontSize: '0.74rem', 
                      padding: '0.2rem 0.55rem', 
                      borderRadius: '6px', 
                      fontWeight: '800',
                      backgroundColor: ord.status === 'REPORT_READY' ? '#DCFCE7' : ord.status === 'EN_ROUTE' ? '#FEF3C7' : '#EFF6FF',
                      color: ord.status === 'REPORT_READY' ? '#15803D' : ord.status === 'EN_ROUTE' ? '#B45309' : '#1D4ED8'
                    }}>
                      {ord.status || 'BOOKED'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <a
                      href={`${API_BASE}/api/v1/reports/${ord.id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ padding: '0.45rem 0.85rem', backgroundColor: '#006B70', color: '#FFF', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      Report PDF <ExternalLink size={12} />
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Manual Order Creation Modal */}
      <CreateManualOrderModal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
        catalog={catalog}
        salariedAgents={salariedAgents}
        labPartners={labPartners}
        onOrderCreated={(newOrd) => {
          setOrders(prev => [newOrd, ...prev]);
          showToast(`Manual Order #${newOrd.id} created & booked!`);
        }}
      />

      {/* Reassign Phlebotomist Modal */}
      {assigningOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '480px', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A', margin: '0 0 0.5rem 0' }}>
              Assign Phlebotomist to Order #{assigningOrder.id}
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 1rem 0' }}>
              Select an active salaried or freelance phlebotomist operating in the client's territory:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '300px', overflowY: 'auto' }}>
              {[
                { name: 'Ramesh Kumar', id: 'AG-01', phone: '+91 98765 11223', type: 'Salaried Agent (Zone 1 - Tirupati)' },
                { name: 'Ajay Varma', id: 'AG-02', phone: '+91 98765 22334', type: 'Salaried Agent (Zone 2 - Bypass)' },
                { name: 'Siva Phlebo', id: 'FL-101', phone: '+91 94400 12345', type: 'Freelance Certified MLT' },
                ...freelancers.map(f => ({ name: f.name, id: f.id, phone: f.phone, type: 'Freelancer Partner' }))
              ].map(ag => (
                <div 
                  key={ag.id} 
                  onClick={() => handleReassignAgent(assigningOrder.id, `${ag.name} (${ag.id})`)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', cursor: 'pointer', transition: 'all 0.15s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E0F2FE'; e.currentTarget.style.borderColor = '#0284C7'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
                >
                  <div>
                    <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.88rem' }}>{ag.name}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{ag.type} • {ag.phone}</div>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#006B70', fontWeight: '800' }}>Select →</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
              <button
                onClick={() => setAssigningOrder(null)}
                style={{ padding: '0.55rem 1.1rem', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
