import React, { useState } from 'react';
import { 
  Building2, 
  Calendar, 
  Clock, 
  CheckCircle, 
  FileText, 
  Upload, 
  ExternalLink,
  Plus,
  Layers,
  Activity,
  CreditCard,
  Settings
} from 'lucide-react';

export default function ScanCenterDashboard({ user, onSwitchRole, onLogout }) {
  const [activeTab, setActiveTab] = useState('SLOTS'); // 'SLOTS' | 'MACHINES' | 'REPORTS' | 'FINANCIALS'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [bookings, setBookings] = useState([
    {
      id: 'SC-501',
      patient: 'Karan Mehra',
      scan: 'MRI Brain (Plain + Angio)',
      machine: 'Siemens 3.0 Tesla Silent MRI (Unit 1)',
      slot: 'Today, 05:00 PM',
      prepStatus: 'Metallic checklist cleared • 4h Fasting verified',
      status: 'Ready for Scan Room',
      driveLink: 'https://drive.google.com/file/d/1X9Y8Z7W_MedMarg_MRI_Brain_Scan/view?usp=sharing'
    },
    {
      id: 'SC-502',
      patient: 'Venkatesh Rao',
      scan: 'HRCT Chest (Low Dose)',
      machine: '128-Slice Low Dose CT (Unit 2)',
      slot: 'Today, 06:30 PM',
      prepStatus: 'Serum Creatinine 0.9 mg/dL (Normal)',
      status: 'Scheduled',
      driveLink: ''
    }
  ]);

  const navMenuItems = [
    { key: 'SLOTS', label: 'Patient Scan Appointments', icon: Calendar, badge: bookings.length },
    { key: 'MACHINES', label: 'Machine Modalities & Slots', icon: Layers, badge: 3 },
    { key: 'REPORTS', label: 'DICOM & PDF Reports Sync', icon: Upload },
    { key: 'FINANCIALS', label: 'Settlements & Revenue', icon: CreditCard }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* 1. ENTERPRISE RADIOLOGY SIDEBAR */}
      <aside style={{ 
        width: sidebarCollapsed ? '80px' : '280px', 
        backgroundColor: '#0E7490', 
        borderRight: '1px solid #155E75', 
        display: 'flex', 
        flexDirection: 'column', 
        transition: 'width 0.2s ease',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100
      }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #155E75', display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '4px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
              <img src="/logo.png" alt="MedMarg" style={{ height: '28px', objectFit: 'contain' }} />
            </div>
            {!sidebarCollapsed && (
              <div>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#CFFAFE', color: '#0E7490', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '900', display: 'block', width: 'fit-content' }}>
                  3.0T RADIOLOGY
                </span>
                <span style={{ fontSize: '0.82rem', color: '#E0F2FE', fontWeight: '700' }}>Scan Hub</span>
              </div>
            )}
          </div>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ background: 'none', border: 'none', color: '#BAE6FD', cursor: 'pointer', fontSize: '1rem' }}>
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
                  backgroundColor: isActive ? '#0891B2' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#BAE6FD',
                  fontWeight: isActive ? '800' : '600',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
                }}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <IconComp size={20} color={isActive ? '#FDE047' : '#BAE6FD'} />
                {!sidebarCollapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                {!sidebarCollapsed && item.badge !== undefined && (
                  <span style={{ fontSize: '0.72rem', backgroundColor: isActive ? 'rgba(0,0,0,0.25)' : '#155E75', color: isActive ? '#FDE047' : '#BAE6FD', padding: '0.15rem 0.45rem', borderRadius: '6px', fontWeight: '800' }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid #155E75', backgroundColor: '#164E63' }}>
          {!sidebarCollapsed && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#FFF' }}>{user?.name || 'Aarthi Scans & Labs'}</div>
              <div style={{ fontSize: '0.72rem', color: '#BAE6FD' }}>Siemens 3.0T • Tirupati Center</div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={onSwitchRole} style={{ flex: 1, padding: '0.5rem', backgroundColor: '#155E75', color: '#FDE047', border: '1px solid #0891B2', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
              {sidebarCollapsed ? '⇄' : 'Switch Role'}
            </button>
            <button onClick={onLogout} style={{ padding: '0.5rem 0.75rem', backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
              {sidebarCollapsed ? '✕' : 'Logout'}
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN RADIOLOGY WORKSPACE */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        <header style={{ height: '70px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A' }}>
            {navMenuItems.find(m => m.key === activeTab)?.label}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#CFFAFE', color: '#0E7490', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '800' }}>
            Siemens 3.0T MRI Operational
          </div>
        </header>

        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          {activeTab === 'SLOTS' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A', marginBottom: '1.25rem' }}>Today's Scan Slot Schedule</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {bookings.map(b => (
                  <div key={b.id} style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ color: '#0891B2', fontSize: '0.95rem' }}>{b.id}</strong>
                        <span style={{ fontSize: '0.75rem', backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '800' }}>{b.status}</span>
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A', margin: '0.3rem 0 0.1rem' }}>{b.scan}</h3>
                      <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Patient: <strong>{b.patient}</strong> • Machine: {b.machine} • Slot: <strong>{b.slot}</strong></div>
                      <div style={{ fontSize: '0.8rem', color: '#0E7490', marginTop: '0.25rem' }}>✓ {b.prepStatus}</div>
                    </div>

                    <div>
                      {b.driveLink ? (
                        <a href={b.driveLink} target="_blank" rel="noopener noreferrer" style={{ padding: '0.6rem 1.1rem', backgroundColor: '#006B70', color: '#FFF', borderRadius: '8px', textDecoration: 'none', fontWeight: '800', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          View DICOM <ExternalLink size={14} />
                        </a>
                      ) : (
                        <button onClick={() => alert(`Uploading DICOM report for ${b.id}...`)} style={{ padding: '0.6rem 1.1rem', backgroundColor: '#0891B2', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}>
                          Upload DICOM Report
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'MACHINES' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {[
                { name: 'Siemens Magnetom 3.0T Silent MRI', slots: 32, booked: 24, status: 'RUNNING' },
                { name: 'GE Revolution 128-Slice Low Dose CT', slots: 20, booked: 15, status: 'RUNNING' },
                { name: 'Samsung 4D Color Doppler USG', slots: 25, booked: 19, status: 'RUNNING' }
              ].map((m, idx) => (
                <div key={idx} style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>{m.status}</span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginTop: '0.5rem' }}>{m.name}</h3>
                  <div style={{ fontSize: '0.88rem', color: '#64748B', marginTop: '0.3rem' }}>{m.booked} of {m.slots} slots filled today</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'REPORTS' && (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '2.5rem', textAlign: 'center' }}>
              <Upload size={48} color="#0891B2" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Radiology DICOM & Report Drive Repository</h3>
              <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '0.5rem 0' }}>All 3.0T MRI and CT images are processed and archived with Google Drive sync.</p>
            </div>
          )}

          {activeTab === 'FINANCIALS' && (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '2.5rem', textAlign: 'center' }}>
              <CreditCard size={48} color="#0891B2" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Radiology Revenue Settlements</h3>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#10B981', marginTop: '0.5rem' }}>₹96,400</div>
              <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Settled this week</span>
            </div>
          )}
        </main>
      </div>

    </div>
  );
}
