import React, { useState } from 'react';
import { FlaskConical, Building2, Upload, CreditCard } from 'lucide-react';
import LabOrdersTab from '../components/lab/LabOrdersTab';

export default function LabPartnerDashboard({ user, onSwitchRole, onLogout }) {
  const [activeTab, setActiveTab] = useState('ORDERS');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [generatedDriveLink, setGeneratedDriveLink] = useState('');

  const [orders, setOrders] = useState([
    { id: 'ORD-8921', patient: 'Rahul Sharma', test: 'Aarogyam Complete 1.3 (104 Tests)', type: 'Home Collection (Air Bypass Rd, Tirupati)', slot: 'Today, 07:30 AM', status: 'Sample Processing', collector: 'Ramesh Kumar (Phlebotomist)', barcode: 'MED-BC-9921', driveReport: 'https://drive.google.com/file/d/1A2B3C4D_MedMarg_SampleReport_Aarogyam/view?usp=sharing' },
    { id: 'ORD-8922', patient: 'K. Srinivasa Rao', test: 'Lipid Profile & Thyroid Total', type: 'Home Collection (SVIMS Rd, Tirupati)', slot: 'Today, 08:30 AM', status: 'Sample Analyzing', collector: 'Suresh Babu (Phlebotomist)', barcode: 'MED-BC-9922', driveReport: '' }
  ]);

  const handleSimulateDriveUpload = (orderId) => {
    setUploadStatus('Uploading report PDF to Google Drive...');
    setTimeout(() => {
      const mockDriveLink = `https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing`;
      setGeneratedDriveLink(mockDriveLink);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Report Uploaded', driveReport: mockDriveLink } : o));
      setUploadStatus('✓ Report PDF successfully synced to Google Drive & Patient Health Locker!');
    }, 1200);
  };

  const navMenuItems = [
    { key: 'ORDERS', label: 'Processing Samples Queue', icon: FlaskConical, badge: `${orders.length}` },
    { key: 'EARNINGS', label: 'B2B Settlements & Revenue', icon: CreditCard }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Sidebar */}
      <aside style={{ width: sidebarCollapsed ? '80px' : '270px', backgroundColor: '#004D40', borderRight: '1px solid #00332C', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #003830', display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '4px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
              <img src="/logo.png" alt="MedMarg" style={{ height: '28px', objectFit: 'contain' }} />
            </div>
            {!sidebarCollapsed && (
              <div>
                <span style={{ fontSize: '0.7rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '900', display: 'block', width: 'fit-content' }}>
                  LAB PARTNER HUB
                </span>
                <span style={{ fontSize: '0.82rem', color: '#E0F2F1', fontWeight: '700' }}>NABL Diagnostic Lab</span>
              </div>
            )}
          </div>
        </div>

        <nav style={{ flex: 1, padding: '1.25rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navMenuItems.map((item) => {
            const IconComp = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button key={item.key} onClick={() => setActiveTab(item.key)} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.85rem 1rem', borderRadius: '12px', border: 'none', backgroundColor: isActive ? '#006B70' : 'transparent', color: isActive ? '#FFFFFF' : '#B2DFDB', fontWeight: isActive ? '800' : '600', fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left' }}>
                <IconComp size={20} color={isActive ? '#FBBF24' : '#80CBC4'} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid #003830' }}>
          <button onClick={onSwitchRole} style={{ width: '100%', padding: '0.45rem', backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFF', border: 'none', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>Switch Portal</button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0F172A', marginBottom: '1.5rem' }}>
          MedMarg Designated NABL Processing Lab Portal
        </h1>

        {activeTab === 'ORDERS' && (
          <LabOrdersTab orders={orders} handleSimulateDriveUpload={handleSimulateDriveUpload} />
        )}

        {activeTab === 'EARNINGS' && (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A' }}>B2B Financial Settlements</h3>
            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#006B70', marginTop: '0.5rem' }}>₹12,450 Transferred</div>
          </div>
        )}
      </main>

    </div>
  );
}
