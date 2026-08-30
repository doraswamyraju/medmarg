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
  FolderHeart,
  Package,
  Layers,
  Percent,
  Plus
} from 'lucide-react';
import { THYROCARE_TESTS, THYROCARE_CATEGORIES } from '../data/thyrocareTests';

export default function AdminDashboard({ user, onSwitchRole, onLogout }) {
  // Navigation State
  const [activeTab, setActiveTab] = useState('OVERVIEW'); // 'OVERVIEW' | 'LABS' | 'TESTS_MGMT' | 'PACKAGE_BUILDER' | 'SCANS' | 'DOCTORS' | 'PHARMACY' | 'FLEET' | 'PATIENTS' | 'FINANCIALS' | 'SETTINGS'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  // Dynamic Test Catalog State (Supports in-memory creation/editing)
  const [testsList, setTestsList] = useState(THYROCARE_TESTS);

  // Dynamic Packages State
  const [packagesList, setPackagesList] = useState([
    {
      id: 'pkg_aarogyam_comp_13',
      name: 'Aarogyam Complete 1.3 (Master Health Checkup)',
      category: 'Aarogyam Full Body Profiles',
      includedCount: 12,
      params: 104,
      thyrocarePrice: 1499,
      originalPrice: 3500,
      discountPercent: 57,
      yellowTag: 'MEGA 57% OFF',
      fasting: '10-12 hrs Fasting',
      tat: '24 Hours',
      description: 'Comprehensive health panel covering Liver (11), Kidney (8), Lipid (8), Thyroid Total (3), Iron (4), Vitamin D & B12, Cardiac Risk (5), and Complete Hemogram (28).'
    },
    {
      id: 'pkg_aarogyam_basic_11',
      name: 'Aarogyam Basic 1.1 (Essential Health Profile)',
      category: 'Aarogyam Full Body Profiles',
      includedCount: 8,
      params: 63,
      thyrocarePrice: 899,
      originalPrice: 1800,
      discountPercent: 50,
      yellowTag: 'POPULAR',
      fasting: '10-12 hrs Fasting',
      tat: '12 Hours',
      description: 'Essential wellness checkup covering Complete Hemogram, Thyroid Total, Lipid Profile, Liver Function, and Kidney Screen.'
    }
  ]);

  // Modal State for New Single Test Creation
  const [showCreateTestModal, setShowCreateTestModal] = useState(false);
  const [newTestForm, setNewTestForm] = useState({
    name: '',
    category: 'Thyroid & Hormones',
    params: 1,
    sample: 'Blood (Serum)',
    fasting: '10-12 hrs Fasting',
    tat: '12 Hours',
    thyrocarePrice: '',
    originalPrice: '',
    apolloPrice: '',
    lalPrice: '',
    yellowTag: 'SPECIAL RATE',
    description: ''
  });

  // Package Builder State
  const [packageBuilderForm, setPackageBuilderForm] = useState({
    name: '',
    yellowTag: 'MEGA 55% OFF',
    selectedTests: [
      'th_thyroid_total',
      'th_lipid_profile',
      'th_lft_11',
      'th_kft_renal'
    ],
    packagePrice: '',
    fasting: '10-12 hrs Overnight Fasting',
    tat: '24 Hours',
    description: ''
  });

  // Sample dynamic data for Super Admin
  const [stats, setStats] = useState({
    todayGmv: '₹1,42,850',
    totalBookings: '1,842',
    activeLabs: '42',
    activeScans: '18',
    activeDoctors: '36',
    activePhlebotomists: '28',
    totalTests: testsList.length,
    totalPackages: packagesList.length
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

  // Handle Single Test Creation
  const handleSaveNewTest = (e) => {
    e.preventDefault();
    const created = {
      id: `th_custom_${Date.now()}`,
      name: newTestForm.name,
      category: newTestForm.category,
      params: Number(newTestForm.params) || 1,
      sample: newTestForm.sample,
      fasting: newTestForm.fasting,
      tat: newTestForm.tat,
      thyrocarePrice: Number(newTestForm.thyrocarePrice),
      originalPrice: Number(newTestForm.originalPrice || Number(newTestForm.thyrocarePrice) * 1.5),
      apolloPrice: Number(newTestForm.apolloPrice || Number(newTestForm.thyrocarePrice) * 1.4),
      lalPrice: Number(newTestForm.lalPrice || Number(newTestForm.thyrocarePrice) * 1.6),
      yellowTag: newTestForm.yellowTag,
      description: newTestForm.description || `${newTestForm.name} diagnostic biomarker profile.`
    };

    setTestsList([created, ...testsList]);
    setShowCreateTestModal(false);
    setNewTestForm({
      name: '',
      category: 'Thyroid & Hormones',
      params: 1,
      sample: 'Blood (Serum)',
      fasting: '10-12 hrs Fasting',
      tat: '12 Hours',
      thyrocarePrice: '',
      originalPrice: '',
      apolloPrice: '',
      lalPrice: '',
      yellowTag: 'SPECIAL RATE',
      description: ''
    });
    alert(`Test "${created.name}" created successfully and published to Live Marketplace!`);
  };

  // Handle Package Builder Save
  const handleSavePackage = (e) => {
    e.preventDefault();
    const selectedItems = testsList.filter(t => packageBuilderForm.selectedTests.includes(t.id));
    const totalIndividualMRP = selectedItems.reduce((sum, item) => sum + item.originalPrice, 0);
    const totalParamsCount = selectedItems.reduce((sum, item) => sum + item.params, 0);
    const pkgPrice = Number(packageBuilderForm.packagePrice || 1499);
    const discount = totalIndividualMRP > 0 ? Math.round(((totalIndividualMRP - pkgPrice) / totalIndividualMRP) * 100) : 50;

    const newPkg = {
      id: `pkg_custom_${Date.now()}`,
      name: packageBuilderForm.name,
      category: 'Aarogyam Full Body Profiles',
      includedCount: selectedItems.length,
      params: totalParamsCount,
      thyrocarePrice: pkgPrice,
      originalPrice: totalIndividualMRP,
      discountPercent: discount,
      yellowTag: packageBuilderForm.yellowTag || `MEGA ${discount}% OFF`,
      fasting: packageBuilderForm.fasting,
      tat: packageBuilderForm.tat,
      description: packageBuilderForm.description || `Specialized health bundle combining ${selectedItems.length} core test profiles (${totalParamsCount} parameters).`
    };

    setPackagesList([newPkg, ...packagesList]);
    alert(`Custom Package "${newPkg.name}" created successfully with ${discount}% discount and published to Marketplace!`);
    setActiveTab('TESTS_MGMT');
  };

  const deleteTest = (id) => {
    if (confirm('Are you sure you want to remove this test from the catalog?')) {
      setTestsList(testsList.filter(t => t.id !== id));
    }
  };

  const deletePackage = (id) => {
    if (confirm('Are you sure you want to remove this package?')) {
      setPackagesList(packagesList.filter(p => p.id !== id));
    }
  };

  // Filtered Tests
  const displayedTests = testsList.filter(t => {
    const matchesCat = filterCategory === 'ALL' || t.category === filterCategory;
    const matchesSearch = searchTerm === '' || t.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Package builder calculations
  const selectedTestsObjects = testsList.filter(t => packageBuilderForm.selectedTests.includes(t.id));
  const cumulativeIndividualMRP = selectedTestsObjects.reduce((sum, t) => sum + t.originalPrice, 0);
  const cumulativeParams = selectedTestsObjects.reduce((sum, t) => sum + t.params, 0);
  const enteredPackagePrice = Number(packageBuilderForm.packagePrice) || 0;
  const calculatedSavings = cumulativeIndividualMRP > enteredPackagePrice ? cumulativeIndividualMRP - enteredPackagePrice : 0;
  const calculatedDiscountPercent = cumulativeIndividualMRP > 0 && enteredPackagePrice > 0 
    ? Math.round(((cumulativeIndividualMRP - enteredPackagePrice) / cumulativeIndividualMRP) * 100)
    : 0;

  const navMenuItems = [
    { key: 'OVERVIEW', label: 'Overview & KPI Metrics', icon: BarChart3 },
    { key: 'TESTS_MGMT', label: 'Tests Catalog & Pricing', icon: FlaskConical, badge: testsList.length },
    { key: 'PACKAGE_BUILDER', label: 'Health Package Builder', icon: Package, badge: packagesList.length },
    { key: 'LABS', label: 'Partner Labs Directory', icon: Building2, badge: labPartners.length },
    { key: 'SCANS', label: '3.0T MRI & Radiology', icon: Layers, badge: scanCenters.length },
    { key: 'DOCTORS', label: 'In-Clinic Doctors', icon: Stethoscope, badge: doctorsList.length },
    { key: 'PHARMACY', label: 'Generic Pharmacy & Rx', icon: Pill, badge: 3 },
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
                onClick={() => setActiveTab(item.key)}
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
              onClick={() => alert('Refreshing live test catalog and package matrix from database...')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#006B70', color: '#FFF', padding: '0.45rem 0.85rem', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer' }}
            >
              <RefreshCw size={14} /> Sync Catalog
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
                  { title: 'Pathology Tests Catalog', val: `${testsList.length} Tests`, sub: `${packagesList.length} Health Bundles`, icon: FlaskConical, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
                  { title: 'Active Phlebotomists', val: stats.activePhlebotomists, sub: 'Tirupati Local Fleet', icon: Truck, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' }
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

              {/* Quick Action Hub */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ backgroundColor: '#1E293B', borderRadius: '18px', border: '2px dashed #006B70', padding: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#FFF' }}>Create Individual Pathology Test</h3>
                    <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '0.25rem' }}>Add new diagnostic biomarker, sample requirements, and multi-lab price matrix.</p>
                  </div>
                  <button onClick={() => setShowCreateTestModal(true)} style={{ padding: '0.75rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                    <Plus size={16} /> Add Test
                  </button>
                </div>

                <div style={{ backgroundColor: '#1E293B', borderRadius: '18px', border: '2px dashed #F59E0B', padding: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#FFF' }}>Create Health Checkup Package</h3>
                    <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '0.25rem' }}>Bundle multiple individual tests into discounted master profiles (Aarogyam, Senior, Diabetes).</p>
                  </div>
                  <button onClick={() => setActiveTab('PACKAGE_BUILDER')} style={{ padding: '0.75rem 1.4rem', backgroundColor: '#F59E0B', color: '#0F172A', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                    <Package size={16} /> Package Builder
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 2: TESTS CATALOG & PRICING MANAGEMENT ===================== */}
          {activeTab === 'TESTS_MGMT' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#FFFFFF' }}>Pathology Tests Catalog ({testsList.length} Tests)</h2>
                  <p style={{ color: '#94A3B8', fontSize: '0.88rem' }}>Create, update pricing, configure sample types, and manage live marketplace visibility.</p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => setShowCreateTestModal(true)} style={{ padding: '0.65rem 1.2rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <PlusCircle size={16} /> Create New Test
                  </button>
                  <button onClick={() => setActiveTab('PACKAGE_BUILDER')} style={{ padding: '0.65rem 1.2rem', backgroundColor: '#F59E0B', color: '#0F172A', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Package size={16} /> Package Studio
                  </button>
                </div>
              </div>

              {/* Filters Bar */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
                  <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="text"
                    placeholder="Search test name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.4rem', backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '10px', color: '#FFF', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  style={{ padding: '0.7rem 1rem', backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '10px', color: '#FFF', fontSize: '0.88rem', outline: 'none' }}
                >
                  <option value="ALL">All Categories ({THYROCARE_CATEGORIES.length})</option>
                  {THYROCARE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Tests Table */}
              <div style={{ backgroundColor: '#1E293B', borderRadius: '18px', border: '1px solid #334155', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0F172A', borderBottom: '1px solid #334155', color: '#94A3B8' }}>
                      <th style={{ padding: '1rem 1.25rem' }}>TEST NAME</th>
                      <th style={{ padding: '1rem' }}>CATEGORY</th>
                      <th style={{ padding: '1rem' }}>PARAMS</th>
                      <th style={{ padding: '1rem' }}>THYROCARE DEAL</th>
                      <th style={{ padding: '1rem' }}>APOLLO RATE</th>
                      <th style={{ padding: '1rem' }}>DR. LAL RATE</th>
                      <th style={{ padding: '1rem' }}>SAMPLE & TAT</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedTests.map((test) => (
                      <tr key={test.id} style={{ borderBottom: '1px solid #334155' }}>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <strong style={{ color: '#FFFFFF', fontSize: '0.92rem' }}>{test.name}</strong>
                          <span style={{ fontSize: '0.7rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '800', marginLeft: '0.5rem' }}>
                            {test.yellowTag}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', color: '#94A3B8' }}>{test.category}</td>
                        <td style={{ padding: '1rem', color: '#67E8F9', fontWeight: '700' }}>{test.params} Biomarkers</td>
                        <td style={{ padding: '1rem', color: '#FBBF24', fontWeight: '900' }}>₹{test.thyrocarePrice} <span style={{ fontSize: '0.75rem', color: '#64748B', textDecoration: 'line-through' }}>₹{test.originalPrice}</span></td>
                        <td style={{ padding: '1rem', color: '#94A3B8' }}>₹{test.apolloPrice}</td>
                        <td style={{ padding: '1rem', color: '#94A3B8' }}>₹{test.lalPrice}</td>
                        <td style={{ padding: '1rem', color: '#CBD5E1', fontSize: '0.8rem' }}>{test.sample} • {test.tat}</td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          <button onClick={() => deleteTest(test.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.3rem' }} title="Delete Test">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================== TAB 3: HEALTH PACKAGE BUILDER (BUNDLE CREATOR) ===================== */}
          {activeTab === 'PACKAGE_BUILDER' && (
            <div>
              <div style={{ marginBottom: '1.75rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#FFFFFF' }}>Health Checkup Package Builder Studio</h2>
                <p style={{ color: '#94A3B8', fontSize: '0.88rem' }}>
                  Select from available individual tests, auto-compute biomarker counts & cumulative MRP, and set custom package deal prices.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'start' }}>
                
                {/* Left Form: Select Tests & Package Configurations */}
                <div style={{ backgroundColor: '#1E293B', borderRadius: '20px', border: '1px solid #334155', padding: '1.75rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#FBBF24', marginBottom: '1.25rem' }}>
                    1. Select Tests to Include in Bundle
                  </h3>

                  {/* Search individual tests */}
                  <div style={{ marginBottom: '1rem' }}>
                    <input
                      type="text"
                      placeholder="Search tests to include..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 1rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', fontSize: '0.85rem' }}
                    />
                  </div>

                  {/* Multi-select checklist */}
                  <div style={{ maxHeight: '340px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem', marginBottom: '1.5rem' }} className="custom-scrollbar">
                    {testsList.map(test => {
                      const isSelected = packageBuilderForm.selectedTests.includes(test.id);
                      return (
                        <div
                          key={test.id}
                          onClick={() => {
                            if (isSelected) {
                              setPackageBuilderForm({
                                ...packageBuilderForm,
                                selectedTests: packageBuilderForm.selectedTests.filter(id => id !== test.id)
                              });
                            } else {
                              setPackageBuilderForm({
                                ...packageBuilderForm,
                                selectedTests: [...packageBuilderForm.selectedTests, test.id]
                              });
                            }
                          }}
                          style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            backgroundColor: isSelected ? 'rgba(0,107,112,0.3)' : '#0F172A',
                            border: isSelected ? '1.5px solid #006B70' : '1px solid #334155',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '5px', border: isSelected ? '2px solid #006B70' : '1.5px solid #64748B', backgroundColor: isSelected ? '#006B70' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '0.75rem', fontWeight: 'bold' }}>
                              {isSelected ? '✓' : ''}
                            </div>
                            <div>
                              <strong style={{ color: '#FFF', fontSize: '0.88rem' }}>{test.name}</strong>
                              <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>{test.category} • {test.params} Params</div>
                            </div>
                          </div>
                          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#FBBF24' }}>₹{test.originalPrice}</span>
                        </div>
                      );
                    })}
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#FBBF24', marginBottom: '1rem' }}>
                    2. Package Details & Pricing
                  </h3>

                  <form onSubmit={handleSavePackage} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: '700' }}>Package Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Aarogyam Executive Health Check (104 Tests)"
                        value={packageBuilderForm.name}
                        onChange={(e) => setPackageBuilderForm({ ...packageBuilderForm, name: e.target.value })}
                        required
                        style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '10px', color: '#FFF', fontSize: '0.9rem', marginTop: '0.25rem' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: '700' }}>Package Deal Price (₹)</label>
                        <input
                          type="number"
                          placeholder="e.g. 1499"
                          value={packageBuilderForm.packagePrice}
                          onChange={(e) => setPackageBuilderForm({ ...packageBuilderForm, packagePrice: e.target.value })}
                          required
                          style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#0F172A', border: '1.5px solid #F59E0B', borderRadius: '10px', color: '#FBBF24', fontSize: '1.1rem', fontWeight: '900', marginTop: '0.25rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: '700' }}>Highlight Tag Badge</label>
                        <input
                          type="text"
                          value={packageBuilderForm.yellowTag}
                          onChange={(e) => setPackageBuilderForm({ ...packageBuilderForm, yellowTag: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '10px', color: '#FFF', fontSize: '0.9rem', marginTop: '0.25rem' }}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={packageBuilderForm.selectedTests.length === 0 || !packageBuilderForm.name || !packageBuilderForm.packagePrice}
                      style={{ padding: '0.9rem', background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#0F172A', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem', boxShadow: '0 4px 14px rgba(245,158,11,0.3)' }}
                    >
                      Publish Package to Live Marketplace (₹{packageBuilderForm.packagePrice || 0})
                    </button>
                  </form>
                </div>

                {/* Right: Live Package Preview & Discount Calculation */}
                <div>
                  <div style={{ backgroundColor: '#1E293B', borderRadius: '20px', border: '2px solid #F59E0B', padding: '1.75rem', position: 'sticky', top: '90px' }}>
                    <span style={{ fontSize: '0.75rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.55rem', borderRadius: '4px', fontWeight: '900' }}>
                      {packageBuilderForm.yellowTag || 'LIVE PREVIEW'}
                    </span>
                    
                    <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#FFF', margin: '0.6rem 0 0.4rem' }}>
                      {packageBuilderForm.name || 'New Health Checkup Package'}
                    </h3>

                    <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '1.25rem' }}>
                      Contains {packageBuilderForm.selectedTests.length} major profiles with <strong>{cumulativeParams} total clinical biomarkers</strong>.
                    </p>

                    {/* Calculated Metrics Summary */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '1rem', backgroundColor: '#0F172A', borderRadius: '14px', marginBottom: '1.25rem' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>CUMULATIVE MRP</span>
                        <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#94A3B8', textDecoration: 'line-through' }}>
                          ₹{cumulativeIndividualMRP}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: '#FBBF24' }}>PACKAGE OFFER PRICE</span>
                        <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#FBBF24' }}>
                          ₹{enteredPackagePrice}
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: '0.85rem', backgroundColor: 'rgba(16,185,129,0.15)', border: '1px solid #10B981', borderRadius: '12px', textAlign: 'center', marginBottom: '1.25rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: '800' }}>
                        PATIENT SAVINGS: ₹{calculatedSavings} ({calculatedDiscountPercent}% OFF)
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#94A3B8', borderTop: '1px solid #334155', paddingTop: '1rem' }}>
                      <strong>Included Profiles ({packageBuilderForm.selectedTests.length}):</strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.4rem' }}>
                        {selectedTestsObjects.map(t => (
                          <span key={t.id} style={{ fontSize: '0.72rem', backgroundColor: '#0F172A', padding: '0.2rem 0.5rem', borderRadius: '6px', color: '#CBD5E1' }}>
                            {t.name}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ===================== TAB 4: PARTNER LABS DIRECTORY ===================== */}
          {activeTab === 'LABS' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#FFFFFF' }}>Partner Diagnostic Labs ({labPartners.length})</h2>
                  <p style={{ color: '#94A3B8', fontSize: '0.88rem' }}>Accredited reference labs and processing hubs connected across Tirupati and Pan-India.</p>
                </div>
              </div>

              <div style={{ backgroundColor: '#1E293B', borderRadius: '18px', border: '1px solid #334155', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0F172A', borderBottom: '1px solid #334155', color: '#94A3B8' }}>
                      <th style={{ padding: '1rem 1.25rem' }}>LAB PARTNER</th>
                      <th style={{ padding: '1rem' }}>TYPE / REGION</th>
                      <th style={{ padding: '1rem' }}>NABL CERT</th>
                      <th style={{ padding: '1rem' }}>TESTS LISTED</th>
                      <th style={{ padding: '1rem' }}>COMMISSION</th>
                      <th style={{ padding: '1rem' }}>STATUS</th>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================== TAB 5: RADIOLOGY & SCANS ===================== */}
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

          {/* ===================== TAB 6: IN-CLINIC DOCTORS ===================== */}
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

          {/* ===================== TAB 7: PHLEBOTOMIST FLEET ===================== */}
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

          {/* ===================== TAB 8: SETTINGS & HOSTINGER VPS ===================== */}
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
          {(activeTab === 'PHARMACY' || activeTab === 'PATIENTS' || activeTab === 'FINANCIALS') && (
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

      {/* MODAL: CREATE NEW SINGLE PATHOLOGY TEST */}
      {showCreateTestModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 150, backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', overflowY: 'auto' }}>
          <div style={{ backgroundColor: '#1E293B', borderRadius: '24px', maxWidth: '620px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', border: '2px solid #006B70', boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', backgroundColor: '#006B70', color: '#FFF', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>
                  CATALOG CREATOR
                </span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#FFF', marginTop: '0.3rem' }}>
                  Add New Pathology Test
                </h3>
              </div>
              <button onClick={() => setShowCreateTestModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSaveNewTest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: '700' }}>Test Name</label>
                <input
                  type="text"
                  placeholder="e.g. Vitamin B12 Serum Analysis"
                  value={newTestForm.name}
                  onChange={(e) => setNewTestForm({ ...newTestForm, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.7rem 1rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '10px', color: '#FFF', fontSize: '0.9rem', marginTop: '0.25rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: '700' }}>Category</label>
                  <select
                    value={newTestForm.category}
                    onChange={(e) => setNewTestForm({ ...newTestForm, category: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem 1rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '10px', color: '#FFF', fontSize: '0.88rem', marginTop: '0.25rem' }}
                  >
                    {THYROCARE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: '700' }}>Biomarkers (Count)</label>
                  <input
                    type="number"
                    value={newTestForm.params}
                    onChange={(e) => setNewTestForm({ ...newTestForm, params: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem 1rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '10px', color: '#FFF', fontSize: '0.9rem', marginTop: '0.25rem' }}
                  />
                </div>
              </div>

              {/* Pricing Matrix */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '1rem', backgroundColor: '#0F172A', borderRadius: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#FBBF24', fontWeight: '800' }}>Thyrocare Deal Price (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 499"
                    value={newTestForm.thyrocarePrice}
                    onChange={(e) => setNewTestForm({ ...newTestForm, thyrocarePrice: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.65rem 0.85rem', backgroundColor: '#1E293B', border: '1.5px solid #F59E0B', borderRadius: '8px', color: '#FBBF24', fontSize: '1rem', fontWeight: '900', marginTop: '0.2rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Market MRP (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 900"
                    value={newTestForm.originalPrice}
                    onChange={(e) => setNewTestForm({ ...newTestForm, originalPrice: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', fontSize: '1rem', marginTop: '0.2rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Apollo Diagnostics (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 750"
                    value={newTestForm.apolloPrice}
                    onChange={(e) => setNewTestForm({ ...newTestForm, apolloPrice: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', fontSize: '0.9rem', marginTop: '0.2rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Dr. Lal PathLabs (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 800"
                    value={newTestForm.lalPrice}
                    onChange={(e) => setNewTestForm({ ...newTestForm, lalPrice: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', fontSize: '0.9rem', marginTop: '0.2rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Sample Type</label>
                  <input
                    type="text"
                    value={newTestForm.sample}
                    onChange={(e) => setNewTestForm({ ...newTestForm, sample: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', fontSize: '0.85rem', marginTop: '0.2rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Fasting</label>
                  <input
                    type="text"
                    value={newTestForm.fasting}
                    onChange={(e) => setNewTestForm({ ...newTestForm, fasting: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', fontSize: '0.85rem', marginTop: '0.2rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Report TAT</label>
                  <input
                    type="text"
                    value={newTestForm.tat}
                    onChange={(e) => setNewTestForm({ ...newTestForm, tat: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', fontSize: '0.85rem', marginTop: '0.2rem' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{ padding: '0.9rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem' }}
              >
                Save & Publish Test to Catalog
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
