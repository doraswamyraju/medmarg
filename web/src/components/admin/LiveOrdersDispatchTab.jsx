import React, { useState, useMemo } from 'react';
import { 
  PlusCircle, 
  Edit3, 
  UserCheck, 
  MapPin, 
  Phone, 
  Building2, 
  CheckCircle, 
  X, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  Download, 
  Printer, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  Eye,
  FileText,
  Activity,
  Send,
  Check,
  Ban,
  ShieldCheck,
  User,
  CreditCard
} from 'lucide-react';
import CreateManualOrderModal from './orders/CreateManualOrderModal';

export default function LiveOrdersDispatchTab({
  orders = [],
  setOrders = () => {},
  salariedAgents = [],
  freelancers = [],
  labPartners = [],
  catalog = { tests: [], profiles: [], packages: [] },
  API_BASE = '',
  safeFetch = fetch
}) {
  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState('ALL'); // 'ALL', 'PENDING_DISPATCH', 'EN_ROUTE', 'SAMPLE_COLLECTED', 'LAB_PROCESSING', 'COMPLETED', 'CANCELLED'
  const [selectedLabFilter, setSelectedLabFilter] = useState('ALL');
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState('ALL');
  const [selectedDateFilter, setSelectedDateFilter] = useState('ALL'); // 'ALL', 'TODAY'
  
  // Modal / Drawer states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null); // Detail drawer / modal
  const [reassigningOrder, setReassigningOrder] = useState(null);
  const [selectedAgentOption, setSelectedAgentOption] = useState('');
  const [reschedulingOrder, setReschedulingOrder] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({ date: '', slot: '07:30 AM - 08:30 AM', reason: 'Customer requested reschedule' });
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Customer cancelled request');
  const [deletingOrder, setDeletingOrder] = useState(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionNotification, setActionNotification] = useState('');

  // Edit Order State
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

  const showToast = (msg) => {
    setActionNotification(msg);
    setTimeout(() => setActionNotification(''), 4000);
  };

  // Helper for status badges
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'EN_ROUTE':
      case 'ENROUTE':
        return { bg: '#E0F2FE', color: '#0284C7', border: '#BAE6FD', label: 'EN ROUTE' };
      case 'SAMPLE_COLLECTED':
        return { bg: '#D1FAE5', color: '#059669', border: '#A7F3D0', label: 'SAMPLE COLLECTED' };
      case 'TRANSIT_TO_LAB':
        return { bg: '#F3E8FF', color: '#7E22CE', border: '#E9D5FF', label: 'TRANSIT TO LAB' };
      case 'LAB_PROCESSING':
        return { bg: '#FCE7F3', color: '#DB2777', border: '#FBCFE8', label: 'LAB PROCESSING' };
      case 'COMPLETED':
        return { bg: '#DCFCE7', color: '#16A34A', border: '#BBF7D0', label: 'COMPLETED' };
      case 'CANCELLED':
        return { bg: '#FEE2E2', color: '#DC2626', border: '#FECACA', label: 'CANCELLED' };
      default:
        return { bg: '#FEF3C7', color: '#D97706', border: '#FDE68A', label: 'PENDING DISPATCH' };
    }
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => !o.status || o.status === 'PENDING_DISPATCH' || o.status === 'BOOKED').length;
    const activeTransit = orders.filter(o => o.status === 'EN_ROUTE' || o.status === 'ENROUTE' || o.status === 'SAMPLE_COLLECTED' || o.status === 'TRANSIT_TO_LAB').length;
    const inLab = orders.filter(o => o.status === 'LAB_PROCESSING').length;
    const completed = orders.filter(o => o.status === 'COMPLETED').length;
    const totalRevenue = orders
      .filter(o => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + (Number(o.amount || o.totalAmount) || 0), 0);
    return { total, pending, activeTransit, inLab, completed, totalRevenue };
  }, [orders]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(ord => {
      // Tab filter
      if (selectedStatusTab === 'PENDING_DISPATCH' && !(ord.status === 'PENDING_DISPATCH' || ord.status === 'BOOKED' || !ord.status)) return false;
      if (selectedStatusTab === 'EN_ROUTE' && !(ord.status === 'EN_ROUTE' || ord.status === 'ENROUTE')) return false;
      if (selectedStatusTab === 'SAMPLE_COLLECTED' && ord.status !== 'SAMPLE_COLLECTED') return false;
      if (selectedStatusTab === 'LAB_PROCESSING' && ord.status !== 'LAB_PROCESSING') return false;
      if (selectedStatusTab === 'COMPLETED' && ord.status !== 'COMPLETED') return false;
      if (selectedStatusTab === 'CANCELLED' && ord.status !== 'CANCELLED') return false;

      // Lab filter
      if (selectedLabFilter !== 'ALL' && ord.lab !== selectedLabFilter) return false;

      // Payment filter
      if (selectedPaymentFilter !== 'ALL') {
        const mode = (ord.paymentMode || '').toUpperCase();
        if (selectedPaymentFilter === 'ONLINE' && !mode.includes('ONLINE') && !mode.includes('PREPAID')) return false;
        if (selectedPaymentFilter === 'DOORSTEP' && !mode.includes('DOORSTEP') && !mode.includes('CASH') && !mode.includes('QR')) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const itemsStr = Array.isArray(ord.items) ? ord.items.map(i => i.name || i.title || i).join(' ') : String(ord.items || '');
        const matchId = (ord.id || '').toLowerCase().includes(q);
        const matchPatient = (ord.patientName || ord.careSeekerName || '').toLowerCase().includes(q);
        const matchPhone = (ord.phone || ord.patientPhone || '').includes(q);
        const matchAgent = (ord.assignedAgent || ord.phleboName || '').toLowerCase().includes(q);
        const matchOtp = (ord.otp || ord.handoverOtp || '').includes(q);
        const matchItems = itemsStr.toLowerCase().includes(q);
        const matchAddress = (ord.address || '').toLowerCase().includes(q);
        if (!matchId && !matchPatient && !matchPhone && !matchAgent && !matchOtp && !matchItems && !matchAddress) {
          return false;
        }
      }

      return true;
    });
  }, [orders, selectedStatusTab, selectedLabFilter, selectedPaymentFilter, searchQuery]);

  // Open Reassign Modal
  const handleOpenReassign = (order) => {
    setReassigningOrder(order);
    setSelectedAgentOption(order.assignedAgent || 'Unassigned');
  };

  // Submit Reassign Agent
  const handleConfirmReassign = async () => {
    if (!reassigningOrder) return;
    setIsSubmittingAction(true);
    try {
      const nextStatus = selectedAgentOption.includes('Unassigned') 
        ? 'PENDING_DISPATCH' 
        : (reassigningOrder.status === 'PENDING_DISPATCH' || reassigningOrder.status === 'BOOKED' ? 'EN_ROUTE' : reassigningOrder.status);

      // Backend API sync
      if (API_BASE) {
        await safeFetch(`${API_BASE}/api/v1/admin/orders/assign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: reassigningOrder.id,
            assignedAgent: selectedAgentOption
          })
        }, 3000).catch(() => {});
      }

      setOrders(prev => prev.map(o => {
        if (o.id === reassigningOrder.id) {
          return {
            ...o,
            assignedAgent: selectedAgentOption,
            status: nextStatus
          };
        }
        return o;
      }));

      showToast(`Order #${reassigningOrder.id} successfully reassigned to ${selectedAgentOption}.`);
      setReassigningOrder(null);
    } catch (e) {
      showToast('Error updating assignment.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (order) => {
    setEditingOrder(order);
    setEditForm({
      patientName: order.patientName || order.careSeekerName || '',
      phone: order.phone || order.patientPhone || '',
      city: order.city || 'Tirupati',
      address: order.address || '',
      items: Array.isArray(order.items) ? order.items.map(i => i.name || i.title || i).join(', ') : (order.items || ''),
      amount: order.amount || order.totalAmount || '',
      status: order.status || 'PENDING_DISPATCH',
      assignedAgent: order.assignedAgent || 'Unassigned',
      lab: order.lab || (labPartners[0]?.name || 'MedMarg Central Processing Lab'),
      otp: order.otp || order.handoverOtp || '1234'
    });
  };

  // Submit Edit Order
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingOrder) return;
    setIsSubmittingAction(true);
    try {
      const updatedPayload = {
        ...editingOrder,
        ...editForm,
        amount: Number(editForm.amount) || editingOrder.amount || 499
      };

      if (API_BASE) {
        await safeFetch(`${API_BASE}/api/v1/admin/orders/${editingOrder.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedPayload)
        }, 3000).catch(() => {});
      }

      setOrders(prev => prev.map(o => o.id === editingOrder.id ? updatedPayload : o));
      showToast(`Order #${editingOrder.id} updated successfully.`);
      setEditingOrder(null);
    } catch (err) {
      showToast('Error updating order details.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Handle Quick Status Change from Table/Drawer
  const handleQuickStatusChange = async (orderId, newStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (viewingOrder && viewingOrder.id === orderId) {
      setViewingOrder(prev => ({ ...prev, status: newStatus }));
    }

    if (API_BASE) {
      safeFetch(`${API_BASE}/api/v1/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      }, 3000).catch(() => {});
    }

    showToast(`Order #${orderId} marked as ${newStatus}.`);
  };

  // Handle Reschedule Order
  const handleConfirmReschedule = async () => {
    if (!reschedulingOrder) return;
    setIsSubmittingAction(true);
    try {
      if (API_BASE) {
        await safeFetch(`${API_BASE}/api/v1/admin/orders/${reschedulingOrder.id}/reschedule`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rescheduleData)
        }, 3000).catch(() => {});
      }

      setOrders(prev => prev.map(o => {
        if (o.id === reschedulingOrder.id) {
          return {
            ...o,
            date: rescheduleData.date || o.date,
            slot: rescheduleData.slot || o.slot,
            rescheduleReason: rescheduleData.reason
          };
        }
        return o;
      }));

      showToast(`Order #${reschedulingOrder.id} rescheduled to ${rescheduleData.date || 'new date'} (${rescheduleData.slot}).`);
      setReschedulingOrder(null);
    } catch (e) {
      showToast('Error rescheduling order.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Handle Cancel Order
  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;
    setIsSubmittingAction(true);
    try {
      if (API_BASE) {
        await safeFetch(`${API_BASE}/api/v1/admin/orders/${cancellingOrder.id}/cancel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: cancelReason })
        }, 3000).catch(() => {});
      }

      setOrders(prev => prev.map(o => {
        if (o.id === cancellingOrder.id) {
          return {
            ...o,
            status: 'CANCELLED',
            cancellationReason: cancelReason
          };
        }
        return o;
      }));

      showToast(`Order #${cancellingOrder.id} has been cancelled.`);
      setCancellingOrder(null);
    } catch (e) {
      showToast('Error cancelling order.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Handle Delete Order Permanently
  const handleConfirmDelete = async () => {
    if (!deletingOrder) return;
    setIsSubmittingAction(true);
    try {
      if (API_BASE) {
        await safeFetch(`${API_BASE}/api/v1/admin/orders/${deletingOrder.id}`, {
          method: 'DELETE'
        }, 3000).catch(() => {});
      }

      setOrders(prev => prev.filter(o => o.id !== deletingOrder.id));
      if (viewingOrder && viewingOrder.id === deletingOrder.id) {
        setViewingOrder(null);
      }
      showToast(`Order #${deletingOrder.id} permanently deleted.`);
      setDeletingOrder(null);
    } catch (e) {
      showToast('Error deleting order.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Export Orders as CSV
  const handleExportCSV = () => {
    if (orders.length === 0) return;
    const headers = ['Order ID', 'Patient Name', 'Phone', 'Address', 'Items', 'Amount', 'Status', 'Assigned Agent', 'Lab', 'Doorstep OTP', 'Created At'];
    const rows = orders.map(o => [
      `"${o.id}"`,
      `"${o.patientName || o.careSeekerName || ''}"`,
      `"${o.phone || ''}"`,
      `"${(o.address || '').replace(/"/g, '""')}"`,
      `"${(Array.isArray(o.items) ? o.items.map(i => i.name || i).join(', ') : (o.items || '')).replace(/"/g, '""')}"`,
      o.amount || o.totalAmount || 0,
      `"${o.status || 'PENDING_DISPATCH'}"`,
      `"${(o.assignedAgent || 'Unassigned').replace(/"/g, '""')}"`,
      `"${(o.lab || 'MedMarg Central Lab').replace(/"/g, '""')}"`,
      `"${o.otp || o.handoverOtp || ''}"`,
      `"${o.createdAt || o.date || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `medmarg_orders_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Orders exported successfully.');
  };

  return (
    <div>
      {/* Toast Notification Alert */}
      {actionNotification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          zIndex: 10000,
          backgroundColor: '#0F172A',
          color: '#F8FAFC',
          padding: '0.85rem 1.4rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          fontSize: '0.88rem',
          fontWeight: '700',
          border: '1px solid #334155',
          animation: 'fadeIn 0.2s ease-in'
        }}>
          <CheckCircle size={18} color="#10B981" />
          <span>{actionNotification}</span>
        </div>
      )}

      {/* Top Header & Overview */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#0F172A' }}>Live Orders & Auto-Dispatch Command Center</h2>
            <span style={{ fontSize: '0.72rem', backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '2px 8px', borderRadius: '12px', fontWeight: '900' }}>
              LIVE SYNC
            </span>
          </div>
          <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Omnipresent monitoring of patient diagnostic requests, phlebotomist dispatch, OTP verification, lab routing & instant rescheduling.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <button
            onClick={handleExportCSV}
            title="Export orders as CSV"
            style={{ padding: '0.65rem 1rem', backgroundColor: '#FFFFFF', color: '#334155', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}
          >
            <Download size={15} color="#475569" /> Export CSV
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{ padding: '0.65rem 1.25rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem', boxShadow: '0 4px 14px rgba(0,107,112,0.25)' }}
          >
            <PlusCircle size={16} color="#FBBF24" /> Create Test Order
          </button>
        </div>
      </div>

      {/* KPI Stats Cards Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.1rem 1.25rem', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Orders</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A', marginTop: '0.3rem' }}>{stats.total}</div>
          <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '700', marginTop: '0.15rem' }}>₹{stats.totalRevenue.toLocaleString()} Revenue</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '1.1rem 1.25rem', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pending Dispatch</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#D97706', marginTop: '0.3rem' }}>{stats.pending}</div>
          <div style={{ fontSize: '0.72rem', color: '#B45309', fontWeight: '700', marginTop: '0.15rem' }}>Awaiting agent assignment</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '1.1rem 1.25rem', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#0284C7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Fleet En Route</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0284C7', marginTop: '0.3rem' }}>{stats.activeTransit}</div>
          <div style={{ fontSize: '0.72rem', color: '#0369A1', fontWeight: '700', marginTop: '0.15rem' }}>Active doorstep runs</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '1.1rem 1.25rem', borderRadius: '14px', border: '1px solid #DB2777', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#DB2777', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Lab Processing</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#DB2777', marginTop: '0.3rem' }}>{stats.inLab}</div>
          <div style={{ fontSize: '0.72rem', color: '#BE185D', fontWeight: '700', marginTop: '0.15rem' }}>Samples in diagnostic analyzer</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '1.1rem 1.25rem', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#16A34A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Completed</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#16A34A', marginTop: '0.3rem' }}>{stats.completed}</div>
          <div style={{ fontSize: '0.72rem', color: '#15803D', fontWeight: '700', marginTop: '0.15rem' }}>Reports published</div>
        </div>
      </div>

      {/* Control Bar: Search & Status Filter Tabs */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1rem 1.25rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        {/* Status Tab Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.8rem', borderBottom: '1px solid #F1F5F9' }}>
          {[
            { id: 'ALL', label: 'All Orders', count: stats.total },
            { id: 'PENDING_DISPATCH', label: 'Pending Dispatch', count: stats.pending },
            { id: 'EN_ROUTE', label: 'En Route', count: orders.filter(o => o.status === 'EN_ROUTE' || o.status === 'ENROUTE').length },
            { id: 'SAMPLE_COLLECTED', label: 'Collected', count: orders.filter(o => o.status === 'SAMPLE_COLLECTED').length },
            { id: 'LAB_PROCESSING', label: 'Lab Processing', count: stats.inLab },
            { id: 'COMPLETED', label: 'Completed', count: stats.completed },
            { id: 'CANCELLED', label: 'Cancelled', count: orders.filter(o => o.status === 'CANCELLED').length }
          ].map(tab => {
            const isActive = selectedStatusTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedStatusTab(tab.id)}
                style={{
                  padding: '0.45rem 0.95rem',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: isActive ? '#006B70' : '#F1F5F9',
                  color: isActive ? '#FFFFFF' : '#475569',
                  fontWeight: '800',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{tab.label}</span>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
                  color: isActive ? '#FFFFFF' : '#334155',
                  fontWeight: '900'
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Secondary Filter Dropdowns */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.85rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by Order ID, Patient, Phone, Phlebotomist, Test name, OTP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.9rem 0.6rem 2.25rem',
                backgroundColor: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                fontSize: '0.84rem',
                color: '#0F172A',
                outline: 'none'
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            {/* Lab Filter */}
            <select
              value={selectedLabFilter}
              onChange={(e) => setSelectedLabFilter(e.target.value)}
              style={{ padding: '0.58rem 0.85rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.8rem', color: '#334155', fontWeight: '700' }}
            >
              <option value="ALL">All Partner Labs</option>
              {labPartners.map(l => (
                <option key={l.id} value={l.name}>{l.name}</option>
              ))}
              <option value="MedMarg Central Processing Lab">MedMarg Central Processing Lab</option>
            </select>

            {/* Payment Filter */}
            <select
              value={selectedPaymentFilter}
              onChange={(e) => setSelectedPaymentFilter(e.target.value)}
              style={{ padding: '0.58rem 0.85rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.8rem', color: '#334155', fontWeight: '700' }}
            >
              <option value="ALL">All Payment Types</option>
              <option value="ONLINE">Prepaid Online</option>
              <option value="DOORSTEP">Doorstep Pay / QR</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table Container */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '1rem 1.25rem' }}>Order ID</th>
                <th style={{ padding: '1rem' }}>Patient & Address</th>
                <th style={{ padding: '1rem' }}>Tests / Package Included</th>
                <th style={{ padding: '1rem' }}>Phlebotomist Agent</th>
                <th style={{ padding: '1rem' }}>Assigned Lab</th>
                <th style={{ padding: '1rem' }}>Doorstep OTP</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3.5rem', textAlign: 'center', color: '#64748B' }}>
                    <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', backgroundColor: '#F1F5F9', color: '#94A3B8', marginBottom: '0.75rem' }}>
                      <AlertCircle size={32} />
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#334155' }}>No orders found matching filters</div>
                    <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                      Try adjusting the search query, clearing filters, or click "Create Test Order".
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(ord => {
                  const statusBadge = getStatusBadgeStyle(ord.status);
                  const isUnassigned = !ord.assignedAgent || ord.assignedAgent === 'Unassigned';

                  return (
                    <tr 
                      key={ord.id} 
                      style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                    >
                      {/* Order ID & Creation Time */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontFamily: 'monospace', color: '#006B70', fontWeight: '900', fontSize: '0.88rem' }}>
                          {ord.id}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '500', marginTop: '0.15rem' }}>
                          {ord.createdAt || ord.date || 'Today'}
                        </div>
                      </td>

                      {/* Patient & Address */}
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>{ord.patientName || ord.careSeekerName || 'Anonymous Patient'}</span>
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                          <Phone size={12} color="#64748B" /> {ord.phone || ord.patientPhone || 'No Phone'}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={ord.address}>
                          <MapPin size={12} color="#D97706" style={{ flexShrink: 0 }} /> {ord.address || 'Tirupati, AP'}
                        </div>
                      </td>

                      {/* Tests & Pricing */}
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '700', color: '#0F172A', maxWidth: '230px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={Array.isArray(ord.items) ? ord.items.map(i => i.name || i.title || i).join(', ') : ord.items}>
                          {Array.isArray(ord.items) ? ord.items.map(i => i.name || i.title || i).join(', ') : (ord.items || 'Diagnostic Tests')}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                          <span style={{ fontSize: '0.82rem', color: '#006B70', fontWeight: '900' }}>
                            ₹{ord.amount || ord.totalAmount || 0}
                          </span>
                          <span style={{ fontSize: '0.68rem', backgroundColor: '#F1F5F9', color: '#475569', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                            {ord.paymentMode || 'DOORSTEP_QR'}
                          </span>
                        </div>
                      </td>

                      {/* Phlebotomist Agent */}
                      <td style={{ padding: '1rem' }}>
                        <div style={{ color: isUnassigned ? '#DC2626' : '#0F172A', fontWeight: '800', fontSize: '0.84rem' }}>
                          {isUnassigned ? '⚠️ Unassigned' : (ord.assignedAgent || ord.phleboName)}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.1rem' }}>
                          {ord.slot ? `Slot: ${ord.slot}` : 'Standard Slot'}
                        </div>
                      </td>

                      {/* Assigned Lab */}
                      <td style={{ padding: '1rem', color: '#64748B', fontSize: '0.82rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#0284C7', fontWeight: '700' }}>
                          <Building2 size={13} /> 
                          <span style={{ maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ord.lab || ord.labName || 'MedMarg Central Lab'}
                          </span>
                        </div>
                      </td>

                      {/* Doorstep OTP */}
                      <td style={{ padding: '1rem', fontFamily: 'monospace', color: '#059669', fontWeight: '900' }}>
                        <span style={{ backgroundColor: '#ECFDF5', padding: '0.25rem 0.55rem', borderRadius: '6px', border: '1px solid #A7F3D0', fontSize: '0.85rem' }}>
                          🔑 {ord.otp || ord.handoverOtp || '----'}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '6px',
                          fontWeight: '800',
                          backgroundColor: statusBadge.bg,
                          color: statusBadge.color,
                          border: `1px solid ${statusBadge.border}`,
                          display: 'inline-block',
                          whiteSpace: 'nowrap'
                        }}>
                          {statusBadge.label}
                        </span>
                      </td>

                      {/* Quick Actions Dropdown / Group */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                          {/* Quick View */}
                          <button
                            onClick={() => setViewingOrder(ord)}
                            title="View Full Order Dossier"
                            style={{ padding: '0.4rem 0.55rem', backgroundColor: '#FFFFFF', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '8px', cursor: 'pointer' }}
                          >
                            <Eye size={14} />
                          </button>

                          {/* Reassign Agent */}
                          <button 
                            onClick={() => handleOpenReassign(ord)}
                            title="Reassign phlebotomist"
                            style={{ padding: '0.4rem 0.65rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.76rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <UserCheck size={13} color="#FBBF24" /> Reassign
                          </button>

                          {/* Edit Details */}
                          <button 
                            onClick={() => handleOpenEdit(ord)}
                            title="Edit patient/test information"
                            style={{ padding: '0.4rem 0.55rem', backgroundColor: '#F1F5F9', color: '#0284C7', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.76rem', fontWeight: '800', cursor: 'pointer' }}
                          >
                            <Edit3 size={13} />
                          </button>

                          {/* Quick Reschedule */}
                          <button 
                            onClick={() => {
                              setReschedulingOrder(ord);
                              setRescheduleData({ date: ord.date || '', slot: ord.slot || '07:30 AM - 08:30 AM', reason: 'Customer requested reschedule' });
                            }}
                            title="Reschedule booking slot"
                            style={{ padding: '0.4rem 0.55rem', backgroundColor: '#F8FAFC', color: '#D97706', border: '1px solid #FDE68A', borderRadius: '8px', cursor: 'pointer' }}
                          >
                            <Calendar size={13} />
                          </button>

                          {/* Delete Order */}
                          <button 
                            onClick={() => setDeletingOrder(ord)}
                            title="Delete Order Permanently"
                            style={{ padding: '0.4rem 0.55rem', backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: '8px', cursor: 'pointer' }}
                          >
                            <Trash2 size={13} />
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
      </div>

      {/* =========================================================================
          MODAL 1: ORDER DOSSIER & DETAIL DRAWER
          ========================================================================= */}
      {viewingOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '640px', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.18)', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A' }}>Order Dossier: {viewingOrder.id}</h3>
                  <span style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontWeight: '800',
                    backgroundColor: getStatusBadgeStyle(viewingOrder.status).bg,
                    color: getStatusBadgeStyle(viewingOrder.status).color
                  }}>
                    {getStatusBadgeStyle(viewingOrder.status).label}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
                  Booked on {viewingOrder.createdAt || viewingOrder.date || 'Today'} • City: {viewingOrder.city || 'Tirupati'}
                </div>
              </div>
              <button onClick={() => setViewingOrder(null)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {/* Content Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Patient Card */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '1.1rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#006B70', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Patient & Doorstep Address
                </div>
                <div style={{ fontSize: '1rem', fontWeight: '900', color: '#0F172A' }}>{viewingOrder.patientName || viewingOrder.careSeekerName}</div>
                <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '0.2rem' }}>Phone: {viewingOrder.phone || viewingOrder.patientPhone}</div>
                <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '0.2rem', display: 'flex', alignItems: 'flex-start', gap: '0.35rem' }}>
                  <MapPin size={15} color="#D97706" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>{viewingOrder.address}</span>
                </div>
              </div>

              {/* Tests & Samples Breakdown */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.1rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
                  Prescribed Tests & Package Contents
                </div>
                {Array.isArray(viewingOrder.items) ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {viewingOrder.items.map((it, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', padding: '0.3rem 0', borderBottom: idx !== viewingOrder.items.length - 1 ? '1px dashed #F1F5F9' : 'none' }}>
                        <span style={{ fontWeight: '700', color: '#1E293B' }}>{it.name || it.title || it}</span>
                        {it.price && <span style={{ color: '#006B70', fontWeight: '800' }}>₹{it.price}</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#1E293B' }}>{viewingOrder.items || 'Standard Diagnostic Suite'}</div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #E2E8F0', marginTop: '0.8rem', paddingTop: '0.6rem', fontWeight: '900', fontSize: '0.95rem' }}>
                  <span>Total Amount Paid / Payable</span>
                  <span style={{ color: '#006B70' }}>₹{viewingOrder.amount || viewingOrder.totalAmount || 0}</span>
                </div>
              </div>

              {/* Execution & Cold-Chain Telemetry */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div style={{ backgroundColor: '#F0FDF4', padding: '0.9rem', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#16A34A', textTransform: 'uppercase' }}>Doorstep OTP Code</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#15803D', fontFamily: 'monospace', marginTop: '0.2rem' }}>
                    🔑 {viewingOrder.otp || viewingOrder.handoverOtp || '1234'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#166534', marginTop: '0.2rem' }}>Must be verified by Phlebotomist on arrival</div>
                </div>

                <div style={{ backgroundColor: '#EFF6FF', padding: '0.9rem', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#2563EB', textTransform: 'uppercase' }}>Processing Partner Lab</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#1E40AF', marginTop: '0.2rem' }}>
                    {viewingOrder.lab || 'MedMarg Central Hub'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#3B82F6', marginTop: '0.2rem' }}>NABL Accredited Diagnostics</div>
                </div>
              </div>

              {/* Status Update Quick Toggles */}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Quick Override Execution Status:
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['PENDING_DISPATCH', 'EN_ROUTE', 'SAMPLE_COLLECTED', 'LAB_PROCESSING', 'COMPLETED'].map(st => (
                    <button
                      key={st}
                      onClick={() => handleQuickStatusChange(viewingOrder.id, st)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: '8px',
                        border: viewingOrder.status === st ? '2px solid #006B70' : '1px solid #CBD5E1',
                        backgroundColor: viewingOrder.status === st ? 'rgba(0,107,112,0.1)' : '#FFFFFF',
                        color: viewingOrder.status === st ? '#006B70' : '#475569',
                        fontWeight: '800',
                        fontSize: '0.76rem',
                        cursor: 'pointer'
                      }}
                    >
                      {st.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    setCancellingOrder(viewingOrder);
                    setViewingOrder(null);
                  }}
                  style={{ padding: '0.55rem 0.9rem', backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <Ban size={14} /> Cancel Order
                </button>
                <button
                  onClick={() => {
                    setDeletingOrder(viewingOrder);
                    setViewingOrder(null);
                  }}
                  style={{ padding: '0.55rem 0.9rem', backgroundColor: '#DC2626', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  onClick={() => {
                    handleOpenEdit(viewingOrder);
                    setViewingOrder(null);
                  }}
                  style={{ padding: '0.55rem 1rem', backgroundColor: '#FFFFFF', color: '#006B70', border: '1px solid #006B70', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  Edit Order
                </button>
                <button
                  onClick={() => setViewingOrder(null)}
                  style={{ padding: '0.55rem 1.25rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: REASSIGN PHLEBOTOMIST AGENT MODAL
          ========================================================================= */}
      {reassigningOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '540px', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A' }}>Reassign Phlebotomist Agent</h3>
                <div style={{ fontSize: '0.8rem', color: '#006B70', fontWeight: '700' }}>Order ID: {reassigningOrder.id} ({reassigningOrder.patientName || reassigningOrder.careSeekerName})</div>
              </div>
              <button onClick={() => setReassigningOrder(null)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#334155', marginBottom: '0.6rem' }}>
                Select Salaried Phlebotomist or FCM Gig Broadcast Network:
              </label>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {/* Unassign option */}
                <div 
                  onClick={() => setSelectedAgentOption('Unassigned')}
                  style={{ padding: '0.85rem 1.1rem', backgroundColor: selectedAgentOption === 'Unassigned' ? '#FEE2E2' : '#F8FAFC', border: selectedAgentOption === 'Unassigned' ? '2px solid #DC2626' : '1px solid #E2E8F0', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <div style={{ fontWeight: '800', color: selectedAgentOption === 'Unassigned' ? '#DC2626' : '#0F172A', fontSize: '0.88rem' }}>⚠️ Leave Unassigned</div>
                    <div style={{ fontSize: '0.76rem', color: '#64748B' }}>Move order back to pending dispatch queue</div>
                  </div>
                  {selectedAgentOption === 'Unassigned' && <CheckCircle size={18} color="#DC2626" />}
                </div>

                {/* Salaried In-House Agents */}
                {salariedAgents.map(ag => {
                  const agentLabel = `${ag.name} (${ag.id}) - Zone: ${ag.area}`;
                  const isSelected = selectedAgentOption === agentLabel || selectedAgentOption.includes(ag.id);
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

                {/* Freelancer Agents */}
                {freelancers.filter(f => f.status === 'APPROVED').map(fl => {
                  const flLabel = `${fl.name} (${fl.id}) - Freelance Phlebotomist`;
                  const isSelected = selectedAgentOption === flLabel || selectedAgentOption.includes(fl.id);
                  return (
                    <div 
                      key={fl.id}
                      onClick={() => setSelectedAgentOption(flLabel)}
                      style={{ padding: '0.9rem 1.1rem', backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC', border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <div>
                        <div style={{ fontWeight: '800', color: isSelected ? '#2563EB' : '#0F172A', fontSize: '0.9rem' }}>🛵 {fl.name} ({fl.id})</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Zone: {fl.assignedZone || 'All Zones'} • Rating: ⭐ {fl.rating || 5.0}</div>
                      </div>
                      {isSelected && <CheckCircle size={18} color="#2563EB" />}
                    </div>
                  );
                })}

                {/* FCM Broadcast Network */}
                {(() => {
                  const broadcastLabel = '🚀 FCM Freelancer Broadcast Network (Open Market Gig Phlebotomists)';
                  const isSelected = selectedAgentOption === broadcastLabel;
                  return (
                    <div 
                      onClick={() => setSelectedAgentOption(broadcastLabel)}
                      style={{ padding: '0.9rem 1.1rem', backgroundColor: isSelected ? '#FEF3C7' : '#F8FAFC', border: isSelected ? '2px solid #D97706' : '1px solid #E2E8F0', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <div>
                        <div style={{ fontWeight: '800', color: isSelected ? '#B45309' : '#D97706', fontSize: '0.9rem' }}>📢 FCM Freelancer Broadcast Network</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Broadcast instant push notification to all qualified freelance agents in zone</div>
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
                  disabled={isSubmittingAction}
                  onClick={handleConfirmReassign} 
                  style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  {isSubmittingAction ? 'Updating...' : 'Confirm Reassignment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: EDIT / UPDATE ORDER MODAL
          ========================================================================= */}
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
                  disabled={isSubmittingAction}
                  style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  {isSubmittingAction ? 'Saving...' : 'Save Order Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: RESCHEDULE ORDER MODAL
          ========================================================================= */}
      {reschedulingOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '480px', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A' }}>Reschedule Order</h3>
                <div style={{ fontSize: '0.8rem', color: '#006B70', fontWeight: '700' }}>Order #{reschedulingOrder.id}</div>
              </div>
              <button onClick={() => setReschedulingOrder(null)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Select New Scheduled Date</label>
                <input
                  type="date"
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Select Time Slot</label>
                <select
                  value={rescheduleData.slot}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, slot: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                >
                  <option value="06:30 AM - 07:30 AM">06:30 AM - 07:30 AM (Early Fasting)</option>
                  <option value="07:30 AM - 08:30 AM">07:30 AM - 08:30 AM</option>
                  <option value="08:30 AM - 09:30 AM">08:30 AM - 09:30 AM</option>
                  <option value="09:30 AM - 10:30 AM">09:30 AM - 10:30 AM</option>
                  <option value="10:30 AM - 11:30 AM">10:30 AM - 11:30 AM</option>
                  <option value="04:30 PM - 05:30 PM">04:30 PM - 05:30 PM (Evening)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Reason for Rescheduling</label>
                <input
                  type="text"
                  placeholder="e.g. Patient requested new morning slot"
                  value={rescheduleData.reason}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setReschedulingOrder(null)}
                  style={{ padding: '0.65rem 1.25rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmittingAction}
                  onClick={handleConfirmReschedule}
                  style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  {isSubmittingAction ? 'Rescheduling...' : 'Confirm Reschedule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: CANCEL ORDER CONFIRMATION
          ========================================================================= */}
      {cancellingOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '440px', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #FEE2E2', backgroundColor: '#FEF2F2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Ban size={20} color="#DC2626" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#991B1B' }}>Cancel Order #{cancellingOrder.id}</h3>
              </div>
              <button onClick={() => setCancellingOrder(null)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0 }}>
                Are you sure you want to cancel the collection order for <strong>{cancellingOrder.patientName || cancellingOrder.careSeekerName}</strong>?
              </p>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Cancellation Reason</label>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setCancellingOrder(null)}
                  style={{ padding: '0.65rem 1.25rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  disabled={isSubmittingAction}
                  onClick={handleConfirmCancel}
                  style={{ padding: '0.65rem 1.4rem', backgroundColor: '#DC2626', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  {isSubmittingAction ? 'Cancelling...' : 'Confirm Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5.5: DELETE ORDER PERMANENTLY CONFIRMATION
          ========================================================================= */}
      {deletingOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '440px', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(220, 38, 38, 0.25)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #FEE2E2', backgroundColor: '#FEF2F2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trash2 size={20} color="#DC2626" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#991B1B', margin: 0 }}>Delete Order #{deletingOrder.id}</h3>
              </div>
              <button onClick={() => setDeletingOrder(null)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.88rem', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                Are you sure you want to <strong>permanently delete</strong> order <strong>#{deletingOrder.id}</strong> for <strong>{deletingOrder.patientName || deletingOrder.careSeekerName}</strong>?
              </p>
              <div style={{ fontSize: '0.78rem', color: '#DC2626', backgroundColor: '#FEF2F2', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #FECACA', fontWeight: '700' }}>
                ⚠️ This action is immediate and will remove this order from all live agent, staff, and admin dashboards.
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setDeletingOrder(null)}
                  style={{ padding: '0.65rem 1.25rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmittingAction}
                  onClick={handleConfirmDelete}
                  style={{ padding: '0.65rem 1.4rem', backgroundColor: '#DC2626', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  {isSubmittingAction ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 6: STANDALONE MANUAL TEST ORDER MODULE
          ========================================================================= */}
      <CreateManualOrderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        catalog={catalog}
        salariedAgents={salariedAgents}
        labPartners={labPartners}
        onOrderCreated={(newOrder) => {
          setOrders(prev => [newOrder, ...prev]);
          showToast(`New manual order #${newOrder.id} created successfully!`);
        }}
      />
    </div>
  );
}
