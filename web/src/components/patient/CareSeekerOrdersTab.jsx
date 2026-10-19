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
  Users
} from 'lucide-react';

export const getSafeOrderItems = (rawItems, totalAmount = 0) => {
  if (Array.isArray(rawItems)) {
    return rawItems.map(it => {
      if (typeof it === 'string') return { name: it, price: Math.round(totalAmount / (rawItems.length || 1)), sampleType: 'SERUM', fasting: 'NO' };
      return {
        name: it?.name || it?.title || 'Diagnostic Test',
        price: it?.price || (totalAmount ? Math.round(totalAmount / (rawItems.length || 1)) : 499),
        sampleType: it?.sampleType || 'SERUM',
        fasting: it?.fasting || 'NO'
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
  handleOrderCall = () => {}
}) {
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'COMPLETED'
  const [searchTerm, setSearchTerm] = useState('');

  // Strictly Live Orders from Server (No Dummy Fallback)
  const displayOrders = Array.isArray(orders) ? orders : [];



  const filteredOrders = displayOrders.filter(ord => {
    const isAct = ord.status === 'ASSIGNED' || ord.status === 'ENROUTE' || ord.status === 'EN_ROUTE' || ord.status === 'SAMPLE_COLLECTED';
    const isComp = ord.status === 'COMPLETED' || ord.status === 'DELIVERED';

    if (activeFilter === 'ACTIVE' && !isAct) return false;
    if (activeFilter === 'COMPLETED' && !isComp) return false;

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

  const activeCount = displayOrders.filter(o => o.status === 'ASSIGNED' || o.status === 'ENROUTE' || o.status === 'SAMPLE_COLLECTED').length;
  const completedCount = displayOrders.filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      
      {/* Top Banner & Stats */}
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
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
            My Diagnostic Orders & History
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>
            Track live phlebotomist telemetry, verify doorstep OTPs, and access digital lab reports.
          </p>
        </div>

        {/* Quick Stats Pills */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ backgroundColor: '#F0FDF4', border: '1.5px solid #BBF7D0', padding: '0.7rem 1.1rem', borderRadius: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#15803D' }}>{activeCount}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#166534' }}>Ongoing Orders</div>
          </div>

          <div style={{ backgroundColor: '#EFF6FF', border: '1.5px solid #BFDBFE', padding: '0.7rem 1.1rem', borderRadius: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#1D4ED8' }}>{completedCount}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#1E40AF' }}>Completed Reports</div>
          </div>
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
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { id: 'ALL', label: `All Orders (${displayOrders.length})` },
            { id: 'ACTIVE', label: `Ongoing (${activeCount})` },
            { id: 'COMPLETED', label: `Completed Reports (${completedCount})` }
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
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by Order ID or Test..."
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
          padding: '3rem 2rem',
          textAlign: 'center',
          border: '1px solid #E2E8F0'
        }}>
          <FlaskConical size={48} color="#CBD5E1" style={{ margin: '0 auto 0.75rem' }} />
          <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>No Orders Found</h4>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.35rem' }}>
            {searchTerm ? `No orders matching "${searchTerm}". Try a different keyword.` : 'You do not have any orders in this tab yet.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredOrders.map(order => {
            const isOngoing = order.status === 'ASSIGNED' || order.status === 'ENROUTE' || order.status === 'SAMPLE_COLLECTED';
            const isDelivered = order.status === 'COMPLETED' || order.status === 'DELIVERED';

            return (
              <div
                key={order.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  border: isOngoing ? '2px solid #006B70' : '1.5px solid #E2E8F0',
                  boxShadow: isOngoing ? '0 10px 25px rgba(0,107,112,0.1)' : '0 4px 12px rgba(0,0,0,0.02)',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Order Card Header */}
                <div style={{
                  padding: '1.15rem 1.5rem',
                  backgroundColor: isOngoing ? '#F0FDF4' : '#F8FAFC',
                  borderBottom: '1px solid #E2E8F0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.85rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: isOngoing ? '#006B70' : '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFF'
                    }}>
                      <FlaskConical size={20} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>
                          Order #{order.id}
                        </span>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          padding: '0.15rem 0.55rem',
                          borderRadius: '6px',
                          backgroundColor: isOngoing ? '#006B70' : (isDelivered ? '#DCFCE7' : '#FEF3C7'),
                          color: isOngoing ? '#FFF' : (isDelivered ? '#15803D' : '#B45309')
                        }}>
                          {order.status === 'ENROUTE' && '🚀 PHLEBOTOMIST ENROUTE'}
                          {order.status === 'ASSIGNED' && '👤 PHLEBOTOMIST ASSIGNED'}
                          {order.status === 'SAMPLE_COLLECTED' && '🧪 SAMPLE COLLECTED (LAB BOUND)'}
                          {order.status === 'COMPLETED' && '✓ REPORT PUBLISHED'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.2rem' }}>
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

                  {/* Ongoing OTP Highlight */}
                  {isOngoing && order.handoverOtp && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      backgroundColor: '#FEF3C7',
                      border: '1.5px solid #F59E0B',
                      padding: '0.5rem 1rem',
                      borderRadius: '12px'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.68rem', fontWeight: '800', color: '#92400E', textTransform: 'uppercase' }}>
                          DOORSTEP HANDOVER OTP
                        </div>
                        <div style={{ fontSize: '1.35rem', fontWeight: '900', letterSpacing: '3px', color: '#78350F' }}>
                          {order.handoverOtp}
                        </div>
                      </div>
                      <ShieldCheck size={26} color="#D97706" />
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
                          <h5 style={{ fontSize: '0.84rem', fontWeight: '900', color: '#475569', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                            Diagnostic Tests & Profiles ({safeItems.length})
                          </h5>
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
                                  <div style={{ fontSize: '0.74rem', color: '#64748B', display: 'flex', gap: '0.5rem', marginTop: '0.15rem' }}>
                                    <span>🩸 {it.sampleType || 'SERUM'}</span>
                                    {it.fasting === 'YES' && (
                                      <span style={{ color: '#D97706', fontWeight: '700' }}>⚠️ 8-10h Fasting Required</span>
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
                    <div style={{ backgroundColor: '#F8FAFC', padding: '1rem 1.15rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>
                        Assigned Phlebotomist
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

                        {order.phleboPhone && (
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
                            <Phone size={14} /> Call
                          </button>
                        )}
                      </div>

                      {isOngoing && order.tempTelemetry && (
                        <div style={{ marginTop: '0.75rem', fontSize: '0.76rem', color: '#006B70', backgroundColor: '#E0F2F1', padding: '0.35rem 0.65rem', borderRadius: '8px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <CheckCircle2 size={13} /> IoT Cold-Chain: {order.tempTelemetry}
                        </div>
                      )}
                    </div>

                    {/* Payment Summary */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', backgroundColor: '#F1F5F9', borderRadius: '12px' }}>
                      <div>
                        <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '700' }}>PAYMENT METHOD: </span>
                        <span style={{ fontSize: '0.82rem', fontWeight: '900', color: '#0F172A' }}>
                          {order.paymentMode === 'PREPAID_UPI' ? '💳 Prepaid Online (UPI)' : '📱 Doorstep UPI QR'}
                        </span>
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#006B70' }}>
                        ₹{order.totalAmount}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Footer Action Bar */}
                <div style={{
                  padding: '1rem 1.5rem',
                  backgroundColor: '#FFFFFF',
                  borderTop: '1px solid #E2E8F0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                    Need assistance with this order? Call MedMarg Support at <strong>+91 91799 79911</strong>
                  </div>

                  <div style={{ display: 'flex', gap: '0.65rem' }}>
                    {isOngoing && (
                      <button
                        onClick={() => {
                          onSelectOrder(order);
                          onNavigateToTracking();
                        }}
                        style={{
                          padding: '0.6rem 1.2rem',
                          backgroundColor: '#006B70',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '10px',
                          fontWeight: '800',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          boxShadow: '0 4px 12px rgba(0,107,112,0.2)'
                        }}
                      >
                        <Navigation size={16} /> Track Live Phlebotomist
                      </button>
                    )}

                    {isDelivered && (
                      <a
                        href={order.reportUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          padding: '0.6rem 1.2rem',
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
                          gap: '0.5rem',
                          boxShadow: '0 4px 12px rgba(21,128,61,0.2)'
                        }}
                      >
                        <Download size={16} /> Download NABL Report
                      </a>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
