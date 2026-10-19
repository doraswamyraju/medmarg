import React, { useState } from 'react';
import { 
  PackageCheck, 
  Clock, 
  MapPin, 
  Phone, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  FlaskConical, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  Calendar, 
  CreditCard, 
  QrCode, 
  Navigation, 
  Sparkles,
  Building2,
  RefreshCw,
  Search,
  Users,
  Repeat,
  Receipt,
  RotateCcw,
  Ban,
  Activity,
  AlertTriangle
} from 'lucide-react';
import OrderGstInvoiceModal from './OrderGstInvoiceModal';
import OrderRescheduleModal from './OrderRescheduleModal';
import OrderCancelModal from './OrderCancelModal';

export const getSafeOrderItems = (rawItems, totalAmount = 0) => {
  if (Array.isArray(rawItems)) {
    return rawItems.map(it => {
      if (typeof it === 'string') return { name: it, price: Math.round(totalAmount / (rawItems.length || 1)), sampleType: 'SERUM', fasting: 'NO' };
      return {
        name: it?.name || it?.title || 'Diagnostic Test',
        price: it?.price || (totalAmount ? Math.round(totalAmount / (rawItems.length || 1)) : 499),
        sampleType: it?.sampleType || 'SERUM',
        fasting: it?.fasting || 'NO',
        code: it?.code || it?.id || null
      };
    });
  }
  if (typeof rawItems === 'string' && rawItems.trim()) {
    const parts = rawItems.split(/[+,]/).map(s => s.trim()).filter(Boolean);
    return parts.map(name => ({
      name,
      price: totalAmount ? Math.round(totalAmount / (parts.length || 1)) : 499,
      sampleType: 'SERUM',
      fasting: 'NO'
    }));
  }
  return [{ name: 'Comprehensive Pathology Test', price: totalAmount || 499, sampleType: 'SERUM', fasting: 'NO' }];
};

export default function CareSeekerOrdersTab({
  orders = [],
  onSelectOrder = () => {},
  onNavigateToTracking = () => {},
  handleOrderCall = () => {},
  onReorder = () => {},
  onOrderUpdated = () => {}
}) {
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dedicated Modal States
  const [invoiceModalOrder, setInvoiceModalOrder] = useState(null);
  const [rescheduleModalOrder, setRescheduleModalOrder] = useState(null);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [reorderSuccessMsg, setReorderSuccessMsg] = useState('');

  // Strictly Live Orders from Server (No Dummy Fallback)
  const displayOrders = Array.isArray(orders) ? orders : [];

  const filteredOrders = displayOrders.filter(ord => {
    const isAct = ord.status === 'ASSIGNED' || ord.status === 'ENROUTE' || ord.status === 'EN_ROUTE' || ord.status === 'SAMPLE_COLLECTED' || ord.status === 'BOOKED';
    const isComp = ord.status === 'COMPLETED' || ord.status === 'DELIVERED';
    const isCanc = ord.status === 'CANCELLED';

    if (activeFilter === 'ACTIVE' && !isAct) return false;
    if (activeFilter === 'COMPLETED' && !isComp) return false;
    if (activeFilter === 'CANCELLED' && !isCanc) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchId = (ord.id || '').toLowerCase().includes(q);
      const matchPhlebo = (ord.phleboName || '').toLowerCase().includes(q);
      const orderItems = getSafeOrderItems(ord.items, ord.totalAmount);
      const matchItems = orderItems.some(i => (i.name || '').toLowerCase().includes(q));
      return matchId || matchPhlebo || matchItems;
    }
    return true;
  });

  const activeCount = displayOrders.filter(o => o.status === 'ASSIGNED' || o.status === 'ENROUTE' || o.status === 'EN_ROUTE' || o.status === 'SAMPLE_COLLECTED' || o.status === 'BOOKED').length;
  const completedCount = displayOrders.filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED').length;
  const cancelledCount = displayOrders.filter(o => o.status === 'CANCELLED').length;

  const handleTriggerReorder = (order) => {
    const safeItems = getSafeOrderItems(order.items, order.totalAmount);
    if (typeof onReorder === 'function') {
      onReorder(safeItems, order);
      setReorderSuccessMsg(`Added ${safeItems.length} test(s) from Order #${order.id} back to your cart!`);
      setTimeout(() => setReorderSuccessMsg(''), 5000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      
      {/* Toast Alert Banner for Reorder or Updates */}
      {reorderSuccessMsg && (
        <div style={{
          backgroundColor: '#D1FAE5',
          border: '1.5px solid #34D399',
          color: '#065F46',
          borderRadius: '16px',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 14px rgba(16,185,129,0.15)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontWeight: '800' }}>
            <CheckCircle2 size={20} color="#059669" />
            <span>{reorderSuccessMsg}</span>
          </div>
          <button
            onClick={() => setReorderSuccessMsg('')}
            style={{ background: 'none', border: 'none', color: '#065F46', fontWeight: '900', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner & Stats Overview */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '1.75rem 2rem',
        border: '1.5px solid #E2E8F0',
        boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.74rem', backgroundColor: '#E0F2F1', color: '#006B70', padding: '0.2rem 0.65rem', borderRadius: '6px', fontWeight: '900' }}>
              MEDMARG CARE SEEKER PORTAL
            </span>
            <span style={{ fontSize: '0.74rem', backgroundColor: '#DCFCE7', color: '#15803D', padding: '0.2rem 0.65rem', borderRadius: '6px', fontWeight: '800' }}>
              ✓ 100% NABL Accredited Labs
            </span>
            <span style={{ fontSize: '0.74rem', backgroundColor: '#FEF3C7', color: '#92400E', padding: '0.2rem 0.65rem', borderRadius: '6px', fontWeight: '800' }}>
              ⚡ GPS Live Radar Active
            </span>
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
            My Diagnostic Orders & History
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>
            Monitor real-time phlebotomist radar, verify doorstep OTPs, generate official GST invoices, and access reports.
          </p>
        </div>

        {/* Quick Stats Pills */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ backgroundColor: '#F0FDF4', border: '1.5px solid #BBF7D0', padding: '0.7rem 1.1rem', borderRadius: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#15803D' }}>{activeCount}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#166534' }}>Ongoing Dispatch</div>
          </div>

          <div style={{ backgroundColor: '#EFF6FF', border: '1.5px solid #BFDBFE', padding: '0.7rem 1.1rem', borderRadius: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#1D4ED8' }}>{completedCount}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#1E40AF' }}>Completed Reports</div>
          </div>

          {cancelledCount > 0 && (
            <div style={{ backgroundColor: '#FEF2F2', border: '1.5px solid #FECACA', padding: '0.7rem 1.1rem', borderRadius: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#DC2626' }}>{cancelledCount}</div>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#991B1B' }}>Cancelled</div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        backgroundColor: '#FFFFFF',
        padding: '0.85rem 1.25rem',
        borderRadius: '16px',
        border: '1px solid #E2E8F0'
      }}>
        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: `All Orders (${displayOrders.length})` },
            { id: 'ACTIVE', label: `Ongoing (${activeCount})` },
            { id: 'COMPLETED', label: `Completed Reports (${completedCount})` },
            ...(cancelledCount > 0 ? [{ id: 'CANCELLED', label: `Cancelled (${cancelledCount})` }] : [])
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              style={{
                padding: '0.55rem 1.1rem',
                borderRadius: '10px',
                border: 'none',
                fontWeight: '800',
                fontSize: '0.84rem',
                cursor: 'pointer',
                backgroundColor: activeFilter === tab.id ? '#006B70' : '#F1F5F9',
                color: activeFilter === tab.id ? '#FFFFFF' : '#475569',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by Order ID, test, or phlebotomist..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem 0.55rem 2.25rem',
              borderRadius: '10px',
              border: '1.5px solid #CBD5E1',
              fontSize: '0.84rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '3.5rem 2rem',
          textAlign: 'center',
          border: '1px solid #E2E8F0'
        }}>
          <FlaskConical size={48} color="#CBD5E1" style={{ margin: '0 auto 0.75rem' }} />
          <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>No Orders Found</h4>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.35rem' }}>
            {searchTerm ? `No orders matching "${searchTerm}". Try a different keyword.` : 'You do not have any orders in this view.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
          {filteredOrders.map(order => {
            const isOngoing = order.status === 'ASSIGNED' || order.status === 'ENROUTE' || order.status === 'EN_ROUTE' || order.status === 'SAMPLE_COLLECTED' || order.status === 'BOOKED';
            const isDelivered = order.status === 'COMPLETED' || order.status === 'DELIVERED';
            const isCancelled = order.status === 'CANCELLED';

            return (
              <div
                key={order.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  border: isOngoing ? '2px solid #006B70' : (isCancelled ? '1.5px solid #FECACA' : '1.5px solid #E2E8F0'),
                  boxShadow: isOngoing ? '0 10px 25px rgba(0,107,112,0.1)' : '0 4px 12px rgba(0,0,0,0.02)',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Order Card Header */}
                <div style={{
                  padding: '1.15rem 1.5rem',
                  backgroundColor: isOngoing ? '#F0FDF4' : (isCancelled ? '#FEF2F2' : '#F8FAFC'),
                  borderBottom: '1px solid #E2E8F0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.85rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      backgroundColor: isOngoing ? '#006B70' : (isCancelled ? '#DC2626' : '#475569'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFF'
                    }}>
                      <FlaskConical size={20} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A' }}>
                          Order #{order.id}
                        </span>

                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          backgroundColor: isOngoing ? '#006B70' : (isDelivered ? '#DCFCE7' : (isCancelled ? '#FEE2E2' : '#FEF3C7')),
                          color: isOngoing ? '#FFF' : (isDelivered ? '#15803D' : (isCancelled ? '#991B1B' : '#B45309'))
                        }}>
                          {(order.status === 'ENROUTE' || order.status === 'EN_ROUTE') && '🚀 PHLEBOTOMIST ENROUTE (LIVE)'}
                          {order.status === 'ASSIGNED' && '👤 PHLEBOTOMIST DISPATCHED'}
                          {order.status === 'BOOKED' && '✓ ORDER CONFIRMED'}
                          {order.status === 'SAMPLE_COLLECTED' && '🧪 SAMPLE COLLECTED (LAB BOUND)'}
                          {order.status === 'COMPLETED' && '✓ REPORT PUBLISHED'}
                          {order.status === 'CANCELLED' && '✕ CANCELLED'}
                        </span>

                        {/* LIVE TRACKING QUICK LINK BADGE */}
                        {isOngoing && (
                          <button
                            onClick={() => {
                              onSelectOrder(order);
                              onNavigateToTracking();
                            }}
                            style={{
                              padding: '0.2rem 0.65rem',
                              backgroundColor: '#E0F2F1',
                              color: '#006B70',
                              border: '1px solid #99F6E4',
                              borderRadius: '6px',
                              fontWeight: '900',
                              fontSize: '0.72rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              boxShadow: '0 2px 6px rgba(0,107,112,0.1)'
                            }}
                          >
                            <Navigation size={12} />
                            <span>Live Radar →</span>
                          </button>
                        )}
                      </div>

                      <div style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                        <span>📅 {order.date}</span>
                        <span>⏰ {order.slot}</span>
                        {order.labProvider && (
                          <span style={{ fontWeight: '700', color: '#006B70' }}>
                            🏥 {order.labProvider}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ongoing OTP Highlight & Telemetry */}
                  {isOngoing && order.handoverOtp && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        backgroundColor: '#FEF3C7',
                        border: '1.5px solid #F59E0B',
                        padding: '0.45rem 0.95rem',
                        borderRadius: '12px'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#92400E', textTransform: 'uppercase' }}>
                            DOORSTEP HANDOVER OTP
                          </div>
                          <div style={{ fontSize: '1.3rem', fontWeight: '900', letterSpacing: '3px', color: '#78350F' }}>
                            {order.handoverOtp}
                          </div>
                        </div>
                        <ShieldCheck size={24} color="#D97706" />
                      </div>
                    </div>
                  )}

                  {isCancelled && (
                    <div style={{ fontSize: '0.78rem', color: '#991B1B', fontWeight: '700', backgroundColor: '#FEE2E2', padding: '0.35rem 0.75rem', borderRadius: '8px' }}>
                      Reason: {order.cancellationReason || 'Cancelled upon customer request'}
                    </div>
                  )}
                </div>

                {/* Order Details Body */}
                <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  
                  {/* Left: Tests Included */}
                  <div>
                    {(() => {
                      const safeItems = getSafeOrderItems(order.items, order.totalAmount);
                      return (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <h5 style={{ fontSize: '0.84rem', fontWeight: '900', color: '#475569', textTransform: 'uppercase', margin: 0 }}>
                              Diagnostic Tests & Profiles ({safeItems.length})
                            </h5>
                            <span style={{ fontSize: '0.72rem', color: '#006B70', fontWeight: '800' }}>
                              NABL Verified Protocols
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {safeItems.map((it, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  padding: '0.75rem 1rem',
                                  backgroundColor: '#F8FAFC',
                                  borderRadius: '12px',
                                  border: '1px solid #E2E8F0'
                                }}
                              >
                                <div>
                                  <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0F172A' }}>{it.name}</div>
                                  <div style={{ fontSize: '0.74rem', color: '#64748B', display: 'flex', gap: '0.65rem', marginTop: '0.15rem' }}>
                                    <span>🩸 {it.sampleType || 'SERUM'}</span>
                                    {it.fasting === 'YES' ? (
                                      <span style={{ color: '#D97706', fontWeight: '700' }}>⚠️ 8-10h Fasting Required</span>
                                    ) : (
                                      <span style={{ color: '#15803D', fontWeight: '700' }}>✓ Non-Fasting Test</span>
                                    )}
                                  </div>
                                </div>
                                <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#0F172A' }}>
                                  ₹{it.price || order.totalAmount}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    })()}

                    <div style={{ marginTop: '0.85rem', fontSize: '0.82rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <MapPin size={16} color="#006B70" style={{ flexShrink: 0 }} />
                      <span>{order.address}</span>
                    </div>

                    {order.beneficiaries && order.beneficiaries.length > 1 && (
                      <div style={{ marginTop: '0.85rem', backgroundColor: '#F0FDF4', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #86EFAC' }}>
                        <div style={{ fontSize: '0.74rem', fontWeight: '900', color: '#166534', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Users size={14} /> Tested Beneficiaries ({order.beneficiaries.length} Individuals)
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {order.beneficiaries.map((b, bIdx) => (
                            <span key={bIdx} style={{ fontSize: '0.74rem', backgroundColor: '#FFFFFF', color: '#0F172A', padding: '0.25rem 0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontWeight: '700' }}>
                              #{b.personNumber || bIdx + 1}: {b.name} ({b.relation || 'Member'}, {b.age}y/{b.gender})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Phlebotomist Assigned & Status */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                    
                    {/* Phlebotomist Card */}
                    <div style={{ backgroundColor: '#F8FAFC', padding: '1rem 1.15rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>
                          Assigned Phlebotomist
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#006B70', fontWeight: '800', backgroundColor: '#E0F2F1', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                          Certified & Vaccinated
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                        <div>
                          <div style={{ fontSize: '1rem', fontWeight: '900', color: '#0F172A' }}>
                            {order.phleboName || 'Ajay Kumar (Certified Phlebotomist)'}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#15803D', fontWeight: '800', marginTop: '0.15rem' }}>
                            ⭐ {order.phleboRating || '4.8 (320+ collections)'}
                          </div>
                        </div>

                        {order.phleboPhone && !isCancelled && (
                          <button
                            onClick={() => handleOrderCall(order.phleboPhone)}
                            style={{
                              padding: '0.5rem 0.85rem',
                              backgroundColor: '#DCFCE7',
                              color: '#15803D',
                              border: '1px solid #86EFAC',
                              borderRadius: '10px',
                              fontWeight: '800',
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem'
                            }}
                          >
                            <Phone size={14} /> Call Phlebo
                          </button>
                        )}
                      </div>

                      {isOngoing && order.tempTelemetry && (
                        <div style={{ marginTop: '0.75rem', fontSize: '0.76rem', color: '#006B70', backgroundColor: '#E0F2F1', padding: '0.35rem 0.65rem', borderRadius: '8px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <CheckCircle2 size={13} /> IoT Cold-Chain: {order.tempTelemetry}
                        </div>
                      )}
                    </div>

                    {/* Payment Summary */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.15rem', backgroundColor: '#F1F5F9', borderRadius: '12px' }}>
                      <div>
                        <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '700' }}>PAYMENT METHOD: </span>
                        <div style={{ fontSize: '0.86rem', fontWeight: '900', color: '#0F172A', marginTop: '0.1rem' }}>
                          {order.paymentMode === 'PREPAID_UPI' ? '💳 Prepaid Online (UPI)' : '📱 Doorstep UPI QR'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700' }}>TOTAL AMOUNT</div>
                        <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#006B70' }}>
                          ₹{order.totalAmount}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Footer Action Bar with Complete Action Suite */}
                <div style={{
                  padding: '1rem 1.5rem',
                  backgroundColor: '#FFFFFF',
                  borderTop: '1px solid #E2E8F0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.85rem'
                }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                    Need assistance? Call MedMarg Support at <strong>+91 91799 79911</strong>
                  </div>

                  <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    
                    {/* 1. Official GST Tax Invoice Button */}
                    <button
                      onClick={() => setInvoiceModalOrder(order)}
                      style={{
                        padding: '0.55rem 1rem',
                        backgroundColor: '#FFFFFF',
                        color: '#0F172A',
                        border: '1.5px solid #CBD5E1',
                        borderRadius: '10px',
                        fontWeight: '800',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.15s ease'
                      }}
                      title="Generate Official GST Tax Invoice (SAC 999312 format)"
                    >
                      <Receipt size={15} color="#006B70" /> Tax Invoice (GST)
                    </button>

                    {/* 2. 1-Click Repeat Test Button */}
                    <button
                      onClick={() => handleTriggerReorder(order)}
                      style={{
                        padding: '0.55rem 1rem',
                        backgroundColor: '#FEF3C7',
                        color: '#92400E',
                        border: '1.5px solid #FCD34D',
                        borderRadius: '10px',
                        fontWeight: '800',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.15s ease'
                      }}
                      title="Rebook the same test package with 1 click"
                    >
                      <Repeat size={15} /> Repeat Test
                    </button>

                    {/* 3. Reschedule Slot Button (Only for Ongoing Orders) */}
                    {isOngoing && (
                      <button
                        onClick={() => setRescheduleModalOrder(order)}
                        style={{
                          padding: '0.55rem 1rem',
                          backgroundColor: '#F1F5F9',
                          color: '#334155',
                          border: '1.5px solid #CBD5E1',
                          borderRadius: '10px',
                          fontWeight: '800',
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}
                      >
                        <Calendar size={15} /> Reschedule
                      </button>
                    )}

                    {/* 4. Cancel Order Button (Only for Ongoing Orders) */}
                    {isOngoing && (
                      <button
                        onClick={() => setCancelModalOrder(order)}
                        style={{
                          padding: '0.55rem 0.85rem',
                          backgroundColor: 'rgba(239, 68, 68, 0.08)',
                          color: '#DC2626',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          borderRadius: '10px',
                          fontWeight: '800',
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <Ban size={14} /> Cancel
                      </button>
                    )}

                    {/* 5. Live Tracking Button */}
                    {isOngoing && (
                      <button
                        onClick={() => {
                          onSelectOrder(order);
                          onNavigateToTracking();
                        }}
                        style={{
                          padding: '0.55rem 1.15rem',
                          backgroundColor: '#006B70',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '10px',
                          fontWeight: '800',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          boxShadow: '0 4px 12px rgba(0,107,112,0.25)'
                        }}
                      >
                        <Navigation size={15} /> Track Live Radar
                      </button>
                    )}

                    {/* 6. Download Report Button */}
                    {isDelivered && (
                      <a
                        href={order.reportUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          padding: '0.55rem 1.15rem',
                          backgroundColor: '#15803D',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '10px',
                          fontWeight: '800',
                          fontSize: '0.85rem',
                          textDecoration: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          boxShadow: '0 4px 12px rgba(21,128,61,0.2)'
                        }}
                      >
                        <Download size={15} /> Download Report
                      </a>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* DEDICATED MODALS */}

      {/* 1. Official GST Tax Invoice Modal */}
      {invoiceModalOrder && (
        <OrderGstInvoiceModal
          isOpen={!!invoiceModalOrder}
          onClose={() => setInvoiceModalOrder(null)}
          order={invoiceModalOrder}
        />
      )}

      {/* 2. Reschedule Pickup Modal */}
      {rescheduleModalOrder && (
        <OrderRescheduleModal
          isOpen={!!rescheduleModalOrder}
          onClose={() => setRescheduleModalOrder(null)}
          order={rescheduleModalOrder}
          onRescheduleSuccess={(updatedOrder) => {
            onOrderUpdated(updatedOrder);
            setReorderSuccessMsg(`Order #${updatedOrder.id} successfully rescheduled to ${updatedOrder.date} (${updatedOrder.slot})!`);
            setTimeout(() => setReorderSuccessMsg(''), 6000);
          }}
        />
      )}

      {/* 3. Order Cancellation Modal */}
      {cancelModalOrder && (
        <OrderCancelModal
          isOpen={!!cancelModalOrder}
          onClose={() => setCancelModalOrder(null)}
          order={cancelModalOrder}
          onCancelSuccess={(updatedOrder) => {
            onOrderUpdated(updatedOrder);
            setReorderSuccessMsg(`Order #${updatedOrder.id} has been cancelled.`);
            setTimeout(() => setReorderSuccessMsg(''), 6000);
          }}
        />
      )}

    </div>
  );
}
