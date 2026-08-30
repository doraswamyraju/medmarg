import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Users, 
  DollarSign, 
  FlaskConical, 
  Building2, 
  Stethoscope, 
  Pill, 
  Activity, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2, 
  PlusCircle, 
  DownloadCloud, 
  Server, 
  Clock, 
  MapPin, 
  Phone, 
  AlertTriangle, 
  Check, 
  ChevronRight, 
  ChevronDown, 
  Settings, 
  BarChart3, 
  CreditCard, 
  FileText,
  Thermometer,
  Truck,
  Sparkles,
  RefreshCw,
  LogOut,
  FolderHeart
} from 'lucide-react';
import { THYROCARE_TESTS, THYROCARE_CATEGORIES } from '../data/thyrocareTests';

export default function AdminDashboard({ user, onSwitchRole, onLogout }) {
  // Navigation State
  const [activeTab, setActiveTab] = useState('OVERVIEW'); // 'OVERVIEW' | 'LABS' | 'SCANS' | 'DOCTORS' | 'PHARMACY' | 'FLEET' | 'PATIENTS' | 'FINANCIALS' | 'SETTINGS'
  const [subTab, setSubTab] = useState('DEFAULT');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Sample dynamic data for Super Admin
  const [stats, setStats] = useState({
    todayGmv: '₹1,42,850',
    totalBookings: '1,842',
    activeLabs: '42',
    activeScans: '18',
    activeDoctors: '36',
    activePhlebotomists: '28',
    fleetCity: 'Tirupati & AP Cluster'
  });

  // Lab Partners Queue
  const [labPartners, setLabPartners] = useState([
    { id: 'LAB-01', name: 'Thyrocare Central Processing Lab', type: 'National Reference Lab', city: 'Mumbai / Pan-India', nabl: 'NABL-CC-4921', status: 'ACTIVE', margin: '15%', tests: 104 },
    { id: 'LAB-02', name: 'Apollo Diagnostics Tirupati', type: 'Regional Processing Lab', city: 'Tirupati (Air Bypass Rd)', nabl: 'NABL-AP-8921', status: 'ACTIVE', margin: '18%', tests: 85 },
    { id: 'LAB-03', name: 'Dr. Lal PathLabs Hub', type: 'Accredited Lab', city: 'Tirupati (Renigunta Rd)', nabl: 'NABL-AP-3104', status: 'ACTIVE', margin: '15%', tests: 92 },
    { id: 'LAB-04', name: 'Star Diagnostics & Pathology Hub', type: 'Local Center', city: 'Tirupati (Alipiri Rd)', nabl: 'NABL-PENDING', status: 'PENDING_APPROVAL', margin: '12%', tests: 40 }
  ]);

  // Scan Centers Queue
  const [scanCenters, setScanCenters] = useState([
    { id: 'SC-01', name: 'Aarthi Scans & Labs', modality: 'Siemens 3.0T Silent MRI & 128-CT', city: 'Tirupati Center', slotsPerDay: 32, bookedToday: 24, status: 'ACTIVE' },
    { id: 'SC-02', name: 'Focus Imaging Diagnostics', modality: '128-Slice Low Dose CT', city: 'SVIMS Road, Tirupati', slotsPerDay: 20, bookedToday: 15, status: 'ACTIVE' },
    { id: 'SC-03', name: 'Medall Care Imaging', modality: '4D Color Doppler Ultrasound', city: 'Tiruchanoor Road, Tirupati', slotsPerDay: 25, bookedToday: 19, status: 'ACTIVE' }
  ]);

  // In-Clinic Doctors Queue
  const [doctorsList, setDoctorsList] = useState([
    { id: 'DOC-01', name: 'Dr. Ananya Sharma', specialty: 'General Physician & Diabetologist', qual: 'MBBS, MD', clinic: 'MedMarg Care Clinic, Tirupati', fee: 499, status: 'VERIFIED', tokensToday: 18 },
    { id: 'DOC-02', name: 'Dr. Rajeshwar Rao', specialty: 'Cardiologist', qual: 'MBBS, MD, DM', clinic: 'Heart Wellness Institute, Tirupati', fee: 800, status: 'VERIFIED', tokensToday: 12 },
    { id: 'DOC-03', name: 'Dr. Priya Deshmukh', specialty: 'Dermatologist', qual: 'MBBS, DVD, MD', clinic: 'Skin & Laser Clinic, Tirupati', fee: 600, status: 'VERIFIED', tokensToday: 14 }
  ]);

  // Phlebotomist Fleet (Tirupati)
  const [phleboFleet, setPhleboFleet] = useState([
    { id: 'PH-01', name: 'Ramesh Kumar', phone: '+91 98765 11223', area: 'Air Bypass & Alipiri', samplesToday: 9, temp: '4.2°C', status: 'ON_ROUTE', rating: 4.9 },
    { id: 'PH-02', name: 'Suresh Babu', phone: '+91 98765 44332', area: 'Renigunta Rd & Tiruchanoor', samplesToday: 7, temp: '3.8°C', status: 'COLLECTED', rating: 4.8 },
    { id: 'PH-03', name: 'Venkat Reddy', phone: '+91 98765 99881', area: 'Chandragiri & SVIMS', samplesToday: 8, temp: '4.5°C', status: 'AT_LAB', rating: 5.0 }
  ]);

  // Generic Pharmacy Formulary
  const [genericFormulary, setGenericFormulary] = useState([
    { brand: 'Lipaglyn 4mg', generic: 'Saroglitazar 4mg', brandPrice: 289, genericPrice: 135, margin: '22%', cdsco: 'APPROVED' },
    { brand: 'Augmentin 625mg', generic: 'Amoxicillin + Clavulanic Acid 625mg', brandPrice: 210, genericPrice: 75, margin: '28%', cdsco: 'APPROVED' },
    { brand: 'Januvia 100mg', generic: 'Sitagliptin Phosphate 100mg', brandPrice: 340, genericPrice: 110, margin: '30%', cdsco: 'APPROVED' }
  ]);

  // Helper actions
  const approveLab = (id) => {
    setLabPartners(labPartners.map(l => l.id === id ? { ...l, status: 'ACTIVE' } : l));
    alert('Lab accreditation verified and activated on MedMarg Marketplace!');
  };

  const navMenuItems = [
    { key: 'OVERVIEW', label: 'Overview & KPI Metrics', icon: BarChart3 },
    { key: 'LABS', label: 'Pathology & Labs Hub', icon: FlaskConical, badge: labPartners.length },
    { key: 'SCANS', label: '3.0T MRI & Radiology', icon: Building2, badge: scanCenters.length },
    { key: 'DOCTORS', label: 'In-Clinic Doctors', icon: Stethoscope, badge: doctorsList.length },
    { key: 'PHARMACY', label: 'Generic Pharmacy & Rx', icon: Pill, badge: genericFormulary.length },
    { key: 'FLEET', label: 'Tirupati Phlebo Fleet', icon: Truck, badge: phleboFleet.length },
    { key: 'PATIENTS', label: 'Patients & Health Logs', icon: Users },
    { key: 'FINANCIALS', label: 'Settlements & Revenue', icon: CreditCard },
    { key: 'SETTINGS', label: 'Platform & Hostinger VPS', icon: Settings }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0B132B', color: '#F1F5F9', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* 1. ENTERPRISE SIDEBAR */}
      <aside style={{ 
        width: sidebarCollapsed ? '80px' : '280px', 
        backgroundColor: '#0F172A', 
        borderRight: '1px solid #1E293B', 
        display: 'flex', 
        flexDirection: 'column', 
        transition: 'width 0.2s ease',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100
      }}>
        {/* Sidebar Brand Header */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '4px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
              <img src="/logo.png" alt="MedMarg" style={{ height: '28px', objectFit: 'contain' }} />
            </div>
            {!sidebarCollapsed && (
              <div>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '900', display: 'block', width: 'fit-content' }}>
                  SUPER ADMIN
                </span>
                <span style={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: '700' }}>Control Center</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '1rem', padding: '0.2rem' }}
            title="Toggle Sidebar"
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Sidebar Navigation Items */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto' }}>
          {navMenuItems.map((item) => {
            const IconComp = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActiveTab(item.key);
                  setSubTab('DEFAULT');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: isActive ? '#006B70' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  fontWeight: isActive ? '800' : '600',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
                }}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <IconComp size={20} color={isActive ? '#FBBF24' : '#64748B'} />
                {!sidebarCollapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                {!sidebarCollapsed && item.badge !== undefined && (
                  <span style={{ fontSize: '0.72rem', backgroundColor: isActive ? 'rgba(0,0,0,0.25)' : '#1E293B', color: isActive ? '#FDE047' : '#94A3B8', padding: '0.15rem 0.45rem', borderRadius: '6px', fontWeight: '800' }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer (User & Logout) */}
        <div style={{ padding: '1rem', borderTop: '1px solid #1E293B', backgroundColor: '#0B132B' }}>
          {!sidebarCollapsed && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#FFF' }}>{user?.name || 'Super Admin'}</div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>admin@medmarg.com</div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={onSwitchRole}
              style={{ flex: 1, padding: '0.5rem', backgroundColor: '#1E293B', color: '#FBBF24', border: '1px solid #334155', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
            >
              {sidebarCollapsed ? '⇄' : 'Switch Role'}
            </button>
            <button
              onClick={onLogout}
              style={{ padding: '0.5rem 0.75rem', backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
            >
              {sidebarCollapsed ? '✕' : 'Logout'}
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN ADMIN CONTENT WORKSPACE */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        
        {/* Top Header Workspace Bar */}
        <header style={{ height: '70px', backgroundColor: '#0F172A', borderBottom: '1px solid #1E293B', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#FFFFFF', letterSpacing: '-0.01em' }}>
              {navMenuItems.find(m => m.key === activeTab)?.label}
            </h1>
            <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(245,158,11,0.15)', color: '#FBBF24', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: '800' }}>
              Hostinger VPS • Port 5085 Live
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#1E293B', padding: '0.4rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></div>
              <span style={{ color: '#94A3B8' }}>Primary Region:</span>
              <strong style={{ color: '#FDE047' }}>Tirupati, AP</strong>
            </div>

            <button
              onClick={() => alert('Refreshing real-time platform metrics from Hostinger VPS 147.93.107.21...')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#006B70', color: '#FFF', padding: '0.45rem 0.85rem', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer' }}
            >
              <RefreshCw size={14} /> Refresh Logs
            </button>
          </div>
        </header>

        {/* Dynamic Workspace Container */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          
          {/* ===================== TAB 1: OVERVIEW & KPI METRICS ===================== */}
          {activeTab === 'OVERVIEW' && (
            <div>
              {/* Top Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                {[
                  { title: "Today's Gross GMV", val: stats.todayGmv, sub: '+24.5% vs yesterday', icon: DollarSign, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
                  { title: 'Total Bookings', val: stats.totalBookings, sub: 'Pathology & Radiology', icon: Activity, color: '#06B6D4', bg: 'rgba(6,182,212,0.1)' },
                  { title: 'Active Phlebotomists', val: stats.activePhlebotomists, sub: 'Tirupati Local Fleet', icon: Truck, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
                  { title: 'Connected Healthcare Labs', val: stats.activeLabs, sub: 'Thyrocare, Apollo, Dr. Lal', icon: FlaskConical, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' }
                ].map((stat, idx) => {
                  const StatIcon = stat.icon;
                  return (
                    <div key={idx} style={{ backgroundColor: '#1E293B', borderRadius: '18px', border: '1px solid #334155', padding: '1.4rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: '700' }}>{stat.title}</span>
                          <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#FFFFFF', marginTop: '0.25rem' }}>{stat.val}</h2>
                        </div>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <StatIcon size={22} />
                        </div>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: stat.color, fontWeight: '700', marginTop: '0.75rem' }}>{stat.sub}</div>
                    </div>
                  );
                })}
              </div>

              {/* Grid with Live Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
                
                {/* Real-time Order Stream */}
                <div style={{ backgroundColor: '#1E293B', borderRadius: '20px', border: '1px solid #334155', padding: '1.75rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '1.25rem' }}>
                    Live Diagnostic Orders Stream (Tirupati & AP)
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[
                      { id: 'MM-LAB-9842', test: 'Aarogyam Complete 1.3 (104 Tests)', patient: 'Rahul Sharma', city: 'Air Bypass Rd, Tirupati', lab: 'Thyrocare Central', status: 'PHLEBO ASSIGNED', amount: '₹1,499' },
                      { id: 'MM-RAD-4102', test: 'Siemens 3.0T MRI Brain (Plain)', patient: 'K. Srinivasa Rao', city: 'SVIMS Road, Tirupati', lab: 'Aarthi Scans', status: 'SLOT CONFIRMED', amount: '₹3,499' },
                      { id: 'MM-LAB-9841', test: 'Thyroid Total (T3/T4/TSH) + Lipid', patient: 'Lakshmi Narayana', city: 'Renigunta Rd, Tirupati', lab: 'Thyrocare Central', status: 'SAMPLE COLLECTED', amount: '₹799' }
                    ].map((order, idx) => (
                      <div key={idx} style={{ padding: '1rem 1.2rem', backgroundColor: '#0F172A', borderRadius: '14px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <strong style={{ color: '#FDE047', fontSize: '0.92rem' }}>{order.id}</strong>
                            <span style={{ fontSize: '0.72rem', backgroundColor: '#10B981', color: '#FFF', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '800' }}>{order.status}</span>
                          </div>
                          <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#FFFFFF', marginTop: '0.25rem' }}>{order.test}</div>
                          <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{order.patient} • {order.city} • {order.lab}</div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#FBBF24' }}>{order.amount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Platform Health & Server Status */}
                <div style={{ backgroundColor: '#1E293B', borderRadius: '20px', border: '1px solid #334155', padding: '1.75rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '1.25rem' }}>
                    Server & Microservices Infrastructure
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ padding: '0.85rem 1rem', backgroundColor: '#0F172A', borderRadius: '12px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ color: '#FFFFFF', fontSize: '0.9rem' }}>Web Frontend (PM2 SPA)</strong>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Port 5085 • Hostinger VPS (147.93.107.21)</div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '900', backgroundColor: 'rgba(16,185,129,0.2)', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>ONLINE (99.9%)</span>
                    </div>

                    <div style={{ padding: '0.85rem 1rem', backgroundColor: '#0F172A', borderRadius: '12px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ color: '#FFFFFF', fontSize: '0.9rem' }}>Backend API & Gateway</strong>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Port 5080 • Node.js / Express Server</div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '900', backgroundColor: 'rgba(16,185,129,0.2)', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>ONLINE (0 errors)</span>
                    </div>

                    <div style={{ padding: '0.85rem 1rem', backgroundColor: '#0F172A', borderRadius: '12px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ color: '#FFFFFF', fontSize: '0.9rem' }}>Cold-Chain IoT Temperature Tracker</strong>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>28 Active Vials in Tirupati Range</div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#FBBF24', fontWeight: '900', backgroundColor: 'rgba(245,158,11,0.2)', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>OPTIMAL (2°-8°C)</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ===================== TAB 2: PATHOLOGY & LABS HUB ===================== */}
          {activeTab === 'LABS' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#FFFFFF' }}>Diagnostic Lab Partners & Test Matrix</h2>
                  <p style={{ color: '#94A3B8', fontSize: '0.88rem' }}>Manage NABL accreditations, Thyrocare API sync, and marketplace margins.</p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => alert('New Partner Lab onboarding modal triggered')} style={{ padding: '0.65rem 1.1rem', backgroundColor: '#F59E0B', color: '#0F172A', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <PlusCircle size={16} /> Onboard New Lab
                  </button>
                </div>
              </div>

              {/* Lab Partners Table */}
              <div style={{ backgroundColor: '#1E293B', borderRadius: '18px', border: '1px solid #334155', overflow: 'hidden', marginBottom: '2rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0F172A', borderBottom: '1px solid #334155', color: '#94A3B8' }}>
                      <th style={{ padding: '1rem 1.25rem' }}>LAB PARTNER</th>
                      <th style={{ padding: '1rem' }}>TYPE / REGION</th>
                      <th style={{ padding: '1rem' }}>NABL CERT</th>
                      <th style={{ padding: '1rem' }}>TESTS LISTED</th>
                      <th style={{ padding: '1rem' }}>COMMISSION</th>
                      <th style={{ padding: '1rem' }}>STATUS</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labPartners.map((lab) => (
                      <tr key={lab.id} style={{ borderBottom: '1px solid #334155' }}>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: '800', color: '#FFFFFF' }}>{lab.name}</td>
                        <td style={{ padding: '1rem', color: '#94A3B8' }}>{lab.type} ({lab.city})</td>
                        <td style={{ padding: '1rem', color: '#67E8F9', fontWeight: '700' }}>{lab.nabl}</td>
                        <td style={{ padding: '1rem', color: '#FFFFFF', fontWeight: '700' }}>{lab.tests} Tests</td>
                        <td style={{ padding: '1rem', color: '#FBBF24', fontWeight: '800' }}>{lab.margin}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ fontSize: '0.72rem', backgroundColor: lab.status === 'ACTIVE' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: lab.status === 'ACTIVE' ? '#10B981' : '#EF4444', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>
                            {lab.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          {lab.status === 'PENDING_APPROVAL' ? (
                            <button onClick={() => approveLab(lab.id)} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#10B981', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}>
                              Approve NABL
                            </button>
                          ) : (
                            <button onClick={() => alert(`Editing catalog for ${lab.name}`)} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#334155', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}>
                              Manage Catalog
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================== TAB 3: RADIOLOGY & SCANS ===================== */}
          {activeTab === 'SCANS' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#FFFFFF' }}>3.0T Silent MRI & Radiology Centers</h2>
                <p style={{ color: '#94A3B8', fontSize: '0.88rem' }}>Manage scan center machines, hourly slot capacity, and patient reporting turnarounds.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
                {scanCenters.map(center => (
                  <div key={center.id} style={{ backgroundColor: '#1E293B', borderRadius: '18px', border: '1px solid #334155', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', backgroundColor: 'rgba(6,182,212,0.2)', color: '#06B6D4', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>
                        RADIOLOGY PARTNER
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: '800' }}>{center.status}</span>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#FFF', marginTop: '0.5rem' }}>{center.name}</h3>
                    <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '0.2rem' }}>{center.city}</div>
                    <div style={{ fontSize: '0.85rem', color: '#FBBF24', marginTop: '0.4rem', fontWeight: '700' }}>{center.modality}</div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', margin: '1rem 0', padding: '0.75rem', backgroundColor: '#0F172A', borderRadius: '10px' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>DAILY SLOTS</span>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FFF' }}>{center.slotsPerDay} Slots</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>BOOKED TODAY</span>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#10B981' }}>{center.bookedToday} Booked</div>
                      </div>
                    </div>

                    <button onClick={() => alert(`Configuring slot calendar for ${center.name}`)} style={{ width: '100%', padding: '0.65rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}>
                      Configure Machine Slots
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== TAB 4: IN-CLINIC DOCTORS ===================== */}
          {activeTab === 'DOCTORS' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#FFFFFF' }}>In-Clinic OPD Doctors & Tokens</h2>
                <p style={{ color: '#94A3B8', fontSize: '0.88rem' }}>Verified specialist doctors, clinic OPD hours, and real-time consultation queue management.</p>
              </div>

              <div style={{ backgroundColor: '#1E293B', borderRadius: '18px', border: '1px solid #334155', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0F172A', borderBottom: '1px solid #334155', color: '#94A3B8' }}>
                      <th style={{ padding: '1rem 1.25rem' }}>DOCTOR NAME</th>
                      <th style={{ padding: '1rem' }}>SPECIALTY</th>
                      <th style={{ padding: '1rem' }}>OPD CLINIC LOCATION</th>
                      <th style={{ padding: '1rem' }}>FEE</th>
                      <th style={{ padding: '1rem' }}>TOKENS TODAY</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctorsList.map((doc) => (
                      <tr key={doc.id} style={{ borderBottom: '1px solid #334155' }}>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: '800', color: '#FFFFFF' }}>{doc.name} ({doc.qual})</td>
                        <td style={{ padding: '1rem', color: '#C084FC', fontWeight: '700' }}>{doc.specialty}</td>
                        <td style={{ padding: '1rem', color: '#94A3B8' }}>{doc.clinic}</td>
                        <td style={{ padding: '1rem', color: '#FBBF24', fontWeight: '800' }}>₹{doc.fee}</td>
                        <td style={{ padding: '1rem', color: '#10B981', fontWeight: '800' }}>{doc.tokensToday} Tokens</td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          <span style={{ fontSize: '0.72rem', backgroundColor: 'rgba(16,185,129,0.2)', color: '#10B981', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>
                            {doc.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================== TAB 5: GENERIC PHARMACY ===================== */}
          {activeTab === 'PHARMACY' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#FFFFFF' }}>Generic Formulary & Prescription Cost-Saver</h2>
                <p style={{ color: '#94A3B8', fontSize: '0.88rem' }}>CDSCO approved generic substitutions saving patients up to 70%.</p>
              </div>

              <div style={{ backgroundColor: '#1E293B', borderRadius: '18px', border: '1px solid #334155', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0F172A', borderBottom: '1px solid #334155', color: '#94A3B8' }}>
                      <th style={{ padding: '1rem 1.25rem' }}>PRESCRIBED BRANDED DRUG</th>
                      <th style={{ padding: '1rem' }}>GENERIC EQUIVALENT SALT</th>
                      <th style={{ padding: '1rem' }}>BRAND MRP</th>
                      <th style={{ padding: '1rem' }}>MEDMARG GENERIC</th>
                      <th style={{ padding: '1rem' }}>PATIENT SAVINGS</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>CDSCO STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {genericFormulary.map((drug, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #334155' }}>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: '700', color: '#EF4444' }}>{drug.brand}</td>
                        <td style={{ padding: '1rem', fontWeight: '800', color: '#10B981' }}>{drug.generic}</td>
                        <td style={{ padding: '1rem', color: '#94A3B8', textDecoration: 'line-through' }}>₹{drug.brandPrice}</td>
                        <td style={{ padding: '1rem', fontWeight: '900', color: '#FBBF24' }}>₹{drug.genericPrice}</td>
                        <td style={{ padding: '1rem', color: '#10B981', fontWeight: '800' }}>Save {Math.round(((drug.brandPrice - drug.genericPrice) / drug.brandPrice) * 100)}%</td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          <span style={{ fontSize: '0.72rem', backgroundColor: 'rgba(16,185,129,0.2)', color: '#10B981', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>
                            {drug.cdsco}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================== TAB 6: PHLEBOTOMIST FLEET ===================== */}
          {activeTab === 'FLEET' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#FFFFFF' }}>Tirupati Phlebotomist Fleet & Cold-Chain IoT</h2>
                <p style={{ color: '#94A3B8', fontSize: '0.88rem' }}>Live home sample collection routes and temperature controlled sample boxes (2°-8°C).</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {phleboFleet.map((phlebo) => (
                  <div key={phlebo.id} style={{ backgroundColor: '#1E293B', borderRadius: '18px', border: '1px solid #334155', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(245,158,11,0.2)', color: '#FBBF24', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>
                        {phlebo.id}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '800' }}>⭐ {phlebo.rating}</span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFF', marginTop: '0.5rem' }}>{phlebo.name}</h3>
                    <div style={{ fontSize: '0.82rem', color: '#94A3B8' }}>📞 {phlebo.phone}</div>
                    <div style={{ fontSize: '0.85rem', color: '#67E8F9', marginTop: '0.3rem', fontWeight: '700' }}>📍 Route: {phlebo.area}</div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', margin: '1rem 0', padding: '0.75rem', backgroundColor: '#0F172A', borderRadius: '10px' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>SAMPLES TODAY</span>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FFF' }}>{phlebo.samplesToday} Collected</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>BOX TEMPERATURE</span>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#10B981' }}>{phlebo.temp}</div>
                      </div>
                    </div>

                    <button onClick={() => alert(`Opening live GPS tracker for ${phlebo.name}`)} style={{ width: '100%', padding: '0.65rem', backgroundColor: '#F59E0B', color: '#0F172A', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}>
                      Live GPS Tracking
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== TAB 7: SETTINGS & HOSTINGER VPS ===================== */}
          {activeTab === 'SETTINGS' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#FFFFFF' }}>Platform Settings & Hostinger VPS Configuration</h2>
                <p style={{ color: '#94A3B8', fontSize: '0.88rem' }}>Hostinger VPS 147.93.107.21 server environment, ports, and deployment governance.</p>
              </div>

              <div style={{ backgroundColor: '#1E293B', borderRadius: '18px', border: '1px solid #334155', padding: '2rem', maxWidth: '800px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FBBF24', marginBottom: '1rem' }}>VPS Server Specifications</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid #334155' }}>
                    <span style={{ color: '#94A3B8' }}>Server IP Address:</span>
                    <strong>147.93.107.21 (Hostinger KVM VPS)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid #334155' }}>
                    <span style={{ color: '#94A3B8' }}>Web Application Port:</span>
                    <strong style={{ color: '#10B981' }}>Port 5085 (PM2 medmarg-web)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid #334155' }}>
                    <span style={{ color: '#94A3B8' }}>Backend API Port:</span>
                    <strong style={{ color: '#10B981' }}>Port 5080 (PM2 medmarg-api)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid #334155' }}>
                    <span style={{ color: '#94A3B8' }}>Primary Region:</span>
                    <strong style={{ color: '#FBBF24' }}>Tirupati, Andhra Pradesh</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== OTHER TABS FALLBACK ===================== */}
          {(activeTab === 'PATIENTS' || activeTab === 'FINANCIALS') && (
            <div style={{ backgroundColor: '#1E293B', borderRadius: '18px', border: '1px solid #334155', padding: '2.5rem', textAlign: 'center' }}>
              <Users size={48} color="#FBBF24" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#FFF' }}>{navMenuItems.find(m => m.key === activeTab)?.label} Console Active</h3>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Synced directly with Hostinger VPS database and Google Drive report repositories.
              </p>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
