import React, { useState } from 'react';
import { 
  Pill, 
  CheckCircle, 
  ExternalLink, 
  Package, 
  ArrowRight,
  Upload,
  FileCheck,
  CreditCard,
  Settings,
  ShoppingBag
} from 'lucide-react';

export default function PharmacyDashboard({ user, onSwitchRole, onLogout }) {
  const [activeTab, setActiveTab] = useState('RX_ORDERS'); // 'RX_ORDERS' | 'FORMULARY' | 'DISPATCH' | 'EARNINGS'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [orders, setOrders] = useState([
    {
      id: 'RX-9901',
      patient: 'Anil Gupta',
      phone: '+91 98765 22334',
      driveRxUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view',
      originalMed: 'Lipaglyn 4mg (Saroglitazar)',
      genericMed: 'Saroglitazar 4mg (MedMarg Generic)',
      savings: '53% Savings',
      price: 135,
      mrp: 290,
      status: 'Generic Substituted & Verified'
    },
    {
      id: 'RX-9902',
      patient: 'Sunita Reddy',
      phone: '+91 98765 77889',
      driveRxUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view',
      originalMed: 'Galvus Met 50/500 (Vildagliptin + Metformin)',
      genericMed: 'Vildagliptin 50mg + Metformin 500mg IP',
      savings: '70% Savings',
      price: 110,
      mrp: 370,
      status: 'Ready for Home Delivery'
    }
  ]);

  const navMenuItems = [
    { key: 'RX_ORDERS', label: 'Prescription Orders Queue', icon: Pill, badge: orders.length },
    { key: 'FORMULARY', label: 'Generic Salt Formulary', icon: FileCheck, badge: 140 },
    { key: 'DISPATCH', label: 'Tirupati Home Delivery', icon: Package },
    { key: 'EARNINGS', label: 'Pharmacy Revenue Ledger', icon: CreditCard }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* 1. ENTERPRISE PHARMACY SIDEBAR */}
      <aside style={{ 
        width: sidebarCollapsed ? '80px' : '280px', 
        backgroundColor: '#064E3B', 
        borderRight: '1px solid #065F46', 
        display: 'flex', 
        flexDirection: 'column', 
        transition: 'width 0.2s ease',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100
      }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #065F46', display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '4px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
              <img src="/logo.png" alt="MedMarg" style={{ height: '28px', objectFit: 'contain' }} />
            </div>
            {!sidebarCollapsed && (
              <div>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '900', display: 'block', width: 'fit-content' }}>
                  GENERIC PHARMACY
                </span>
                <span style={{ fontSize: '0.82rem', color: '#A7F3D0', fontWeight: '700' }}>Chemist Portal</span>
              </div>
            )}
          </div>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ background: 'none', border: 'none', color: '#6EE7B7', cursor: 'pointer', fontSize: '1rem' }}>
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto' }}>
          {navMenuItems.map((item) => {
            const IconComp = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: isActive ? '#059669' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#A7F3D0',
                  fontWeight: isActive ? '800' : '600',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
                }}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <IconComp size={20} color={isActive ? '#FDE047' : '#6EE7B7'} />
                {!sidebarCollapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                {!sidebarCollapsed && item.badge !== undefined && (
                  <span style={{ fontSize: '0.72rem', backgroundColor: isActive ? 'rgba(0,0,0,0.25)' : '#065F46', color: isActive ? '#FDE047' : '#A7F3D0', padding: '0.15rem 0.45rem', borderRadius: '6px', fontWeight: '800' }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid #065F46', backgroundColor: '#022C22' }}>
          {!sidebarCollapsed && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#FFF' }}>{user?.name || 'MedPlus Generic Chemist'}</div>
              <div style={{ fontSize: '0.72rem', color: '#6EE7B7' }}>Tirupati Retail Dispenser</div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={onSwitchRole} style={{ flex: 1, padding: '0.5rem', backgroundColor: '#065F46', color: '#FDE047', border: '1px solid #059669', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
              {sidebarCollapsed ? '⇄' : 'Switch Role'}
            </button>
            <button onClick={onLogout} style={{ padding: '0.5rem 0.75rem', backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
              {sidebarCollapsed ? '✕' : 'Logout'}
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN PHARMACY WORKSPACE */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        <header style={{ height: '70px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A' }}>
            {navMenuItems.find(m => m.key === activeTab)?.label}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '800' }}>
            Generic 70% Cost-Saver Active
          </div>
        </header>

        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          {activeTab === 'RX_ORDERS' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A', marginBottom: '1.25rem' }}>Incoming Prescription Queue</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {orders.map((ord) => (
                  <div key={ord.id} style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ color: '#059669', fontSize: '0.95rem' }}>{ord.id}</strong>
                        <span style={{ fontSize: '0.75rem', backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '800' }}>{ord.status}</span>
                      </div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A', margin: '0.3rem 0 0.1rem' }}>Patient: {ord.patient} ({ord.phone})</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                        <span style={{ color: '#64748B', textDecoration: 'line-through', fontSize: '0.88rem' }}>{ord.originalMed}</span>
                        <ArrowRight size={14} color="#10B981" />
                        <span style={{ color: '#065F46', fontWeight: '800', fontSize: '0.92rem' }}>{ord.genericMed}</span>
                        <span style={{ fontSize: '0.75rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '800' }}>{ord.savings}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#059669' }}>₹{ord.price}</div>
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8', textDecoration: 'line-through' }}>₹{ord.mrp}</span>
                      </div>
                      <button onClick={() => alert(`Order ${ord.id} dispatched for home delivery in Tirupati!`)} style={{ padding: '0.65rem 1.2rem', backgroundColor: '#059669', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}>
                        Dispatch Medicine
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'FORMULARY' && (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '2rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0F172A', marginBottom: '1rem' }}>Active Salt Equivalents Formulary</h3>
              <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Mapped with CDSCO and WHO essential medicines lists.</p>
            </div>
          )}

          {activeTab === 'DISPATCH' && (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '2.5rem', textAlign: 'center' }}>
              <Package size={48} color="#059669" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Tirupati Medicine Home Delivery Dispatch</h3>
              <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Same-day delivery across Tirupati urban & rural areas.</p>
            </div>
          )}

          {activeTab === 'EARNINGS' && (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '2.5rem', textAlign: 'center' }}>
              <CreditCard size={48} color="#059669" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Chemist Revenue & Settlements</h3>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#10B981', marginTop: '0.5rem' }}>₹32,600</div>
              <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Settled this week</span>
            </div>
          )}
        </main>
      </div>

    </div>
  );
}
