import React, { useState } from 'react';
import { 
  FlaskConical, 
  Upload, 
  CheckCircle, 
  Clock, 
  UserCheck, 
  Plus, 
  ExternalLink,
  MapPin,
  TrendingUp,
  FileCheck,
  Building2,
  DownloadCloud,
  CreditCard,
  Settings
} from 'lucide-react';

export default function LabPartnerDashboard({ user, onSwitchRole, onLogout }) {
  const [activeTab, setActiveTab] = useState('ORDERS'); // 'ORDERS' | 'CATALOG' | 'UPLOAD_REPORT' | 'EARNINGS'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [generatedDriveLink, setGeneratedDriveLink] = useState('');

  const [orders, setOrders] = useState([
    {
      id: 'ORD-8921',
      patient: 'Rahul Sharma',
      test: 'Aarogyam Complete 1.3 (104 Tests)',
      type: 'Home Collection (Air Bypass Rd, Tirupati)',
      slot: 'Today, 07:30 AM',
      status: 'Sample Processing',
      collector: 'Ramesh Kumar (Phlebotomist)',
      barcode: 'MED-BC-9921',
      driveReport: 'https://drive.google.com/file/d/1A2B3C4D_MedMarg_SampleReport_Aarogyam/view?usp=sharing'
    },
    {
      id: 'ORD-8922',
      patient: 'K. Srinivasa Rao',
      test: 'Lipid Profile & Thyroid Total',
      type: 'Home Collection (SVIMS Rd, Tirupati)',
      slot: 'Today, 08:30 AM',
      status: 'Sample Analyzing',
      collector: 'Suresh Babu (Phlebotomist)',
      barcode: 'MED-BC-9922',
      driveReport: ''
    }
  ]);

  const [catalog, setCatalog] = useState([
    { id: '1', name: 'Aarogyam Complete 1.3 Profile', price: 1499, mrp: 3500, tatHours: 12, nablCertified: true },
    { id: '2', name: 'Thyroid Profile Total (T3/T4/TSH)', price: 349, mrp: 600, tatHours: 6, nablCertified: true },
    { id: '3', name: 'Complete Lipid Profile (8 Params)', price: 449, mrp: 850, tatHours: 6, nablCertified: true }
  ]);

  const handleSimulateDriveUpload = (orderId) => {
    setUploadStatus('Uploading report PDF to Google Drive...');
    setTimeout(() => {
      const mockDriveLink = `https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing`;
      setGeneratedDriveLink(mockDriveLink);
      setUploadStatus('Report uploaded successfully to Google Drive & auto-synced to Patient & Doctor!');
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Report Ready', driveReport: mockDriveLink } : o));
    }, 800);
  };

  const navMenuItems = [
    { key: 'ORDERS', label: 'Sample Processing Queue', icon: FlaskConical, badge: orders.length },
    { key: 'CATALOG', label: 'Lab Test Catalog & Rates', icon: FileCheck, badge: catalog.length },
    { key: 'UPLOAD_REPORT', label: 'Google Drive Report Sync', icon: Upload },
    { key: 'EARNINGS', label: 'B2B Payouts & Invoices', icon: CreditCard }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* 1. ENTERPRISE LAB SIDEBAR */}
      <aside style={{ 
        width: sidebarCollapsed ? '80px' : '280px', 
        backgroundColor: '#1E3A8A', 
        borderRight: '1px solid #1E40AF', 
        display: 'flex', 
        flexDirection: 'column', 
        transition: 'width 0.2s ease',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100
      }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #1E40AF', display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '4px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
              <img src="/logo.png" alt="MedMarg" style={{ height: '28px', objectFit: 'contain' }} />
            </div>
            {!sidebarCollapsed && (
              <div>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '900', display: 'block', width: 'fit-content' }}>
                  LAB PARTNER
                </span>
                <span style={{ fontSize: '0.82rem', color: '#BFDBFE', fontWeight: '700' }}>Processing Center</span>
              </div>
            )}
          </div>
          
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ background: 'none', border: 'none', color: '#93C5FD', cursor: 'pointer', fontSize: '1rem' }}>
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
                  backgroundColor: isActive ? '#2563EB' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#BFDBFE',
                  fontWeight: isActive ? '800' : '600',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
                }}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <IconComp size={20} color={isActive ? '#FDE047' : '#93C5FD'} />
                {!sidebarCollapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                {!sidebarCollapsed && item.badge !== undefined && (
                  <span style={{ fontSize: '0.72rem', backgroundColor: isActive ? 'rgba(0,0,0,0.25)' : '#1E40AF', color: isActive ? '#FDE047' : '#BFDBFE', padding: '0.15rem 0.45rem', borderRadius: '6px', fontWeight: '800' }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid #1E40AF', backgroundColor: '#172554' }}>
          {!sidebarCollapsed && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#FFF' }}>{user?.name || 'Dr. Lal PathLabs Hub'}</div>
              <div style={{ fontSize: '0.72rem', color: '#93C5FD' }}>NABL Accredited • Tirupati Hub</div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={onSwitchRole} style={{ flex: 1, padding: '0.5rem', backgroundColor: '#1E40AF', color: '#FDE047', border: '1px solid #2563EB', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
              {sidebarCollapsed ? '⇄' : 'Switch Role'}
            </button>
            <button onClick={onLogout} style={{ padding: '0.5rem 0.75rem', backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
              {sidebarCollapsed ? '✕' : 'Logout'}
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN LAB WORKSPACE */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        <header style={{ height: '70px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A' }}>
            {navMenuItems.find(m => m.key === activeTab)?.label}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '800' }}>
            NABL Quality Assured Lab
          </div>
        </header>

        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          {activeTab === 'ORDERS' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A', marginBottom: '1.25rem' }}>Active Sample Processing Queue</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {orders.map((ord) => (
                  <div key={ord.id} style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ color: '#2563EB', fontSize: '0.95rem' }}>{ord.id}</strong>
                        <span style={{ fontSize: '0.75rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '800' }}>{ord.status}</span>
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A', margin: '0.3rem 0 0.1rem' }}>{ord.test}</h3>
                      <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Patient: <strong>{ord.patient}</strong> • {ord.type} • Collector: {ord.collector}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      {ord.driveReport ? (
                        <a href={ord.driveReport} target="_blank" rel="noopener noreferrer" style={{ padding: '0.6rem 1.1rem', backgroundColor: '#006B70', color: '#FFF', borderRadius: '8px', textDecoration: 'none', fontWeight: '800', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          Report in Drive <ExternalLink size={14} />
                        </a>
                      ) : (
                        <button onClick={() => handleSimulateDriveUpload(ord.id)} style={{ padding: '0.6rem 1.1rem', backgroundColor: '#2563EB', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Upload size={15} /> Upload PDF to Drive
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'CATALOG' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A', marginBottom: '1.25rem' }}>Listed Pathology Catalog</h2>
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                      <th style={{ padding: '1rem 1.25rem' }}>TEST NAME</th>
                      <th style={{ padding: '1rem' }}>MEDMARG RATE</th>
                      <th style={{ padding: '1rem' }}>MRP</th>
                      <th style={{ padding: '1rem' }}>TAT</th>
                      <th style={{ padding: '1rem' }}>ACCREDITATION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catalog.map(t => (
                      <tr key={t.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: '800' }}>{t.name}</td>
                        <td style={{ padding: '1rem', color: '#B45309', fontWeight: '900' }}>₹{t.price}</td>
                        <td style={{ padding: '1rem', color: '#94A3B8', textDecoration: 'line-through' }}>₹{t.mrp}</td>
                        <td style={{ padding: '1rem' }}>{t.tatHours} Hours</td>
                        <td style={{ padding: '1rem', color: '#10B981', fontWeight: '700' }}>✓ NABL Certified</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'UPLOAD_REPORT' && (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '2rem', textAlign: 'center' }}>
              <Upload size={48} color="#2563EB" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Diagnostic Report Google Drive Integration</h3>
              <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '0.5rem 0 1.5rem' }}>Reports uploaded here are stored in your Google Drive and synced to Doctor & Patient consoles.</p>
              {uploadStatus && <div style={{ color: '#10B981', fontWeight: '800', marginBottom: '1rem' }}>{uploadStatus}</div>}
            </div>
          )}

          {activeTab === 'EARNINGS' && (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '2.5rem', textAlign: 'center' }}>
              <CreditCard size={48} color="#2563EB" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Lab Payouts & Invoices</h3>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#10B981', marginTop: '0.5rem' }}>₹48,250</div>
              <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Settled this week to Lab Bank Account</span>
            </div>
          )}
        </main>
      </div>

    </div>
  );
}
