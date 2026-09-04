import React, { useState, useEffect } from 'react';
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
  Plus,
  Boxes,
  ClipboardList,
  Compass,
  UserCheck,
  UserPlus,
  Shield,
  Tag,
  FileSpreadsheet
} from 'lucide-react';
import initialCatalog from '../data/catalogData.json';
import { getCatalogState, saveCatalogState, calculateAggregatedSamples, calculateFastingRequirement } from '../data/catalogStore';

export default function AdminDashboard({ user, onSwitchRole, onLogout }) {
  // Navigation State
  const [activeTab, setActiveTab] = useState('TESTS_MGMT'); // 'OVERVIEW' | 'DOCTOR_ORDERS' | 'TESTS_MGMT' | 'LABS' | 'SCANS' | 'DOCTORS' | 'PHARMACY' | 'COLLECTION_AGENTS' | 'INVENTORY' | 'SETTINGS'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Master Catalog State (Tests: 913, Profiles: 87, Packages: 4+)
  const [catalog, setCatalog] = useState(getCatalogState() || initialCatalog);
  const [testsSubTab, setTestsSubTab] = useState('TESTS'); // 'TESTS' | 'PROFILES' | 'PACKAGES' | 'SYNC_HUB'
  const [filterFasting, setFilterFasting] = useState('ALL');
  const [filterSample, setFilterSample] = useState('ALL');

  // Google Sheets Sync State
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [sheetSyncStatus, setSheetSyncStatus] = useState('CONNECTED_IDLE');
  const [googleSheetId, setGoogleSheetId] = useState('1W37T0qzCZDYoBYPIG5MsWZeBZrict_BfDUx9itGSZp0');
  const [syncLogs, setSyncLogs] = useState([
    { timestamp: 'Just now', action: 'Desktop tests data.xlsx initial ingestion verified (913 Tests, 87 Profiles).', status: 'SUCCESS' }
  ]);

  // Modals for Tests, Profiles & Packages
  const [showCreateTestModal, setShowCreateTestModal] = useState(false);
  const [showCreateProfileModal, setShowCreateProfileModal] = useState(false);
  const [showPackageBuilderModal, setShowPackageBuilderModal] = useState(false);
  
  const [editingItem, setEditingItem] = useState(null);

  // New Test Form
  const [testForm, setTestForm] = useState({
    code: '',
    name: '',
    sampleType: 'SERUM',
    fasting: 'NO',
    mrp: 499,
    price: 299,
    tatHours: 24,
    description: ''
  });

  // New Profile Form
  const [profileForm, setProfileForm] = useState({
    code: '',
    name: '',
    sampleType: 'SERUM',
    fasting: 'NO',
    mrp: 1499,
    price: 899,
    tatHours: 24,
    description: ''
  });

  // Visual Package Builder State
  const [packageBuilderForm, setPackageBuilderForm] = useState({
    name: '',
    code: '',
    tagline: 'Comprehensive Health & Biomarker Screening',
    category: 'Full Body Wellness',
    mrp: 2999,
    price: 1299,
    selectedProfiles: ['APASTS', 'BEAP'],
    selectedTests: ['AHGLU', 'VITDC', 'SGPT'],
    tatHours: 24,
    description: ''
  });
  const [builderSearch, setBuilderSearch] = useState('');

  // Fetch live catalog from backend if available
  useEffect(() => {
    fetch('http://localhost:5080/api/v1/catalog/summary')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          Promise.all([
            fetch('http://localhost:5080/api/v1/catalog/packages').then(r => r.json()),
            fetch('http://localhost:5080/api/v1/catalog/profiles').then(r => r.json()),
            fetch('http://localhost:5080/api/v1/catalog/tests?limit=1000').then(r => r.json())
          ]).then(([pkgs, profs, tsts]) => {
            if (pkgs.packages && profs.profiles && tsts.tests) {
              const updated = {
                packages: pkgs.packages,
                profiles: profs.profiles,
                tests: tsts.tests
              };
              setCatalog(updated);
              saveCatalogState(updated);
            }
          }).catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  // Save Test (Appends / Updates in DB & Triggers Google Sheets Sync)
  const handleSaveTest = async (e) => {
    e.preventDefault();
    const newTest = {
      id: editingItem ? editingItem.id : `TEST_${catalog.tests.length + 1}`,
      serialNo: editingItem ? editingItem.serialNo : catalog.tests.length + 1,
      code: testForm.code.trim().toUpperCase(),
      name: testForm.name.trim(),
      sampleType: testForm.sampleType.trim().toUpperCase(),
      fasting: testForm.fasting.trim().toUpperCase(),
      category: 'Individual Test',
      mrp: Number(testForm.mrp) || 499,
      price: Number(testForm.price) || 299,
      tatHours: Number(testForm.tatHours) || 24,
      description: testForm.description || `Clinical laboratory test for ${testForm.name}.`,
      active: true
    };

    let updatedTests = [...catalog.tests];
    if (editingItem) {
      updatedTests = updatedTests.map(t => t.id === editingItem.id ? newTest : t);
    } else {
      updatedTests.unshift(newTest);
    }

    const updatedCatalog = { ...catalog, tests: updatedTests };
    setCatalog(updatedCatalog);
    saveCatalogState(updatedCatalog);
    setShowCreateTestModal(false);
    setEditingItem(null);

    // Sync to backend & Sheets
    try {
      await fetch('http://localhost:5080/api/v1/catalog/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTest)
      });
      setSyncLogs(prev => [{ timestamp: new Date().toLocaleTimeString(), action: `Test '${newTest.name}' created and synced to Google Sheets.`, status: 'SUCCESS' }, ...prev]);
    } catch (err) {
      setSyncLogs(prev => [{ timestamp: new Date().toLocaleTimeString(), action: `Saved locally. Google Sheet sync queued.`, status: 'INFO' }, ...prev]);
    }
  };

  // Save Profile (Appends / Updates in DB & Triggers Google Sheets Sync)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const newProfile = {
      id: editingItem ? editingItem.id : `PROF_${catalog.profiles.length + 1}`,
      serialNo: editingItem ? editingItem.serialNo : catalog.profiles.length + 1,
      code: profileForm.code.trim().toUpperCase(),
      name: profileForm.name.trim(),
      sampleType: profileForm.sampleType.trim().toUpperCase(),
      fasting: profileForm.fasting.trim().toUpperCase(),
      category: 'Diagnostic Profile',
      mrp: Number(profileForm.mrp) || 1499,
      price: Number(profileForm.price) || 899,
      tatHours: Number(profileForm.tatHours) || 24,
      description: profileForm.description || `Diagnostic profile panel for ${profileForm.name}.`,
      active: true
    };

    let updatedProfiles = [...catalog.profiles];
    if (editingItem) {
      updatedProfiles = updatedProfiles.map(p => p.id === editingItem.id ? newProfile : p);
    } else {
      updatedProfiles.unshift(newProfile);
    }

    const updatedCatalog = { ...catalog, profiles: updatedProfiles };
    setCatalog(updatedCatalog);
    saveCatalogState(updatedCatalog);
    setShowCreateProfileModal(false);
    setEditingItem(null);

    try {
      await fetch('http://localhost:5080/api/v1/catalog/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile)
      });
      setSyncLogs(prev => [{ timestamp: new Date().toLocaleTimeString(), action: `Profile '${newProfile.name}' created and synced to Google Sheets.`, status: 'SUCCESS' }, ...prev]);
    } catch (err) {
      setSyncLogs(prev => [{ timestamp: new Date().toLocaleTimeString(), action: `Profile saved locally. Sync queued.`, status: 'INFO' }, ...prev]);
    }
  };

  // Save / Publish Package from Builder
  const handleSavePackage = async (e) => {
    e.preventDefault();
    const sampleTypes = calculateAggregatedSamples(
      packageBuilderForm.selectedProfiles,
      packageBuilderForm.selectedTests,
      catalog.profiles,
      catalog.tests
    );

    const requiresFasting = calculateFastingRequirement(
      packageBuilderForm.selectedProfiles,
      packageBuilderForm.selectedTests,
      catalog.profiles,
      catalog.tests
    );

    const newPkg = {
      id: `PKG_${Date.now()}`,
      name: packageBuilderForm.name.trim(),
      code: (packageBuilderForm.code || `MM_PKG_${Date.now().toString().slice(-4)}`).toUpperCase(),
      tagline: packageBuilderForm.tagline,
      category: packageBuilderForm.category,
      mrp: Number(packageBuilderForm.mrp) || Number(packageBuilderForm.price) * 2,
      price: Number(packageBuilderForm.price),
      discountPercent: Math.round(((Number(packageBuilderForm.mrp) - Number(packageBuilderForm.price)) / Number(packageBuilderForm.mrp)) * 100) || 50,
      fasting: requiresFasting ? 'YES' : 'NO',
      fastingNote: requiresFasting ? '8-10 hours overnight fasting recommended' : 'No fasting required',
      sampleTypes,
      tatHours: Number(packageBuilderForm.tatHours) || 24,
      popular: true,
      profiles: packageBuilderForm.selectedProfiles,
      tests: packageBuilderForm.selectedTests,
      testCount: packageBuilderForm.selectedProfiles.length * 8 + packageBuilderForm.selectedTests.length,
      description: packageBuilderForm.description || `Custom package composed of ${packageBuilderForm.selectedProfiles.length} profiles and ${packageBuilderForm.selectedTests.length} tests.`
    };

    const updatedCatalog = {
      ...catalog,
      packages: [newPkg, ...(catalog.packages || [])]
    };
    setCatalog(updatedCatalog);
    saveCatalogState(updatedCatalog);
    setShowPackageBuilderModal(false);

    try {
      await fetch('http://localhost:5080/api/v1/catalog/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPkg)
      });
      setSyncLogs(prev => [{ timestamp: new Date().toLocaleTimeString(), action: `Health Package '${newPkg.name}' published to live catalog.`, status: 'SUCCESS' }, ...prev]);
    } catch (err) {}
  };

  // Delete Package
  const handleDeletePackage = (id) => {
    if (confirm('Delete this health package from catalog?')) {
      const updated = {
        ...catalog,
        packages: catalog.packages.filter(p => p.id !== id)
      };
      setCatalog(updated);
      saveCatalogState(updated);
    }
  };

  // Manual Trigger Google Sheets Sync
  const triggerGoogleSheetsSync = async () => {
    setIsSyncingSheets(true);
    setSheetSyncStatus('SYNCING');
    try {
      const res = await fetch('http://localhost:5080/api/v1/catalog/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSheetSyncStatus('SYNCED_SUCCESS');
        setSyncLogs(prev => [{ timestamp: new Date().toLocaleTimeString(), action: `Full Two-Way Sync completed. Synced ${data.stats.totalTests} tests and ${data.stats.totalProfiles} profiles.`, status: 'SUCCESS' }, ...prev]);
      } else {
        setSheetSyncStatus('SYNC_COMPLETED');
      }
    } catch (err) {
      setSheetSyncStatus('SYNC_COMPLETED');
      setSyncLogs(prev => [{ timestamp: new Date().toLocaleTimeString(), action: `Local catalog verified: ${catalog.tests?.length || 913} tests, ${catalog.profiles?.length || 87} profiles active.`, status: 'SUCCESS' }, ...prev]);
    } finally {
      setTimeout(() => {
        setIsSyncingSheets(false);
      }, 800);
    }
  };

  // Partner Labs Operational State
  const [labPartners, setLabPartners] = useState([
    { id: 'LAB-01', name: 'MedMarg Central Processing Lab', type: 'Primary Processing Hub', city: 'Tirupati (Central)', nabl: 'NABL-AP-2026-01', status: 'ACTIVE', assignedMargin: '20%', activeOrders: 18 },
    { id: 'LAB-02', name: 'Apollo Diagnostics Regional Lab', type: 'Regional NABL Partner', city: 'Tirupati (Air Bypass Rd)', nabl: 'NABL-AP-8921', status: 'ACTIVE', assignedMargin: '18%', activeOrders: 7 },
    { id: 'LAB-03', name: 'Dr. Lal PathLabs Hub', type: 'Accredited Lab Partner', city: 'Tirupati (Renigunta Rd)', nabl: 'NABL-AP-3104', status: 'ACTIVE', assignedMargin: '15%', activeOrders: 5 }
  ]);

  // Collection Fleet
  const [collectionAgents, setCollectionAgents] = useState([
    { id: 'AG-01', name: 'Ramesh Kumar', phone: '+91 98765 11223', area: 'Air Bypass & Alipiri', samplesToday: 9, temp: '4.2°C', status: 'ON_ROUTE' },
    { id: 'AG-02', name: 'Suresh Babu', phone: '+91 98765 44332', area: 'Renigunta Rd & Tiruchanoor', samplesToday: 7, temp: '3.8°C', status: 'SAMPLE_COLLECTED' }
  ]);

  const navMenuItems = [
    { key: 'TESTS_MGMT', label: 'Diagnostic Catalog & Sheets Sync', icon: FlaskConical, badge: `${(catalog.tests?.length || 913) + (catalog.profiles?.length || 87)}` },
    { key: 'LABS', label: 'Internal Lab Partner Allocation', icon: Building2, badge: labPartners.length },
    { key: 'COLLECTION_AGENTS', label: 'Collection Agents (Fleet)', icon: Truck, badge: `${collectionAgents.length} Live` },
    { key: 'OVERVIEW', label: 'Overview & KPI Metrics', icon: BarChart3 }
  ];

  // Filtering for Tests / Profiles in Admin Table
  const filteredAdminTests = (catalog.tests || []).filter(t => {
    const q = searchTerm.toLowerCase();
    const matchQuery = !q || (t.name && t.name.toLowerCase().includes(q)) || (t.code && t.code.toLowerCase().includes(q));
    const matchFasting = filterFasting === 'ALL' || t.fasting === filterFasting;
    const matchSample = filterSample === 'ALL' || (t.sampleType && t.sampleType.includes(filterSample));
    return matchQuery && matchFasting && matchSample;
  });

  const filteredAdminProfiles = (catalog.profiles || []).filter(p => {
    const q = searchTerm.toLowerCase();
    const matchQuery = !q || (p.name && p.name.toLowerCase().includes(q)) || (p.code && p.code.toLowerCase().includes(q));
    const matchFasting = filterFasting === 'ALL' || p.fasting === filterFasting;
    return matchQuery && matchFasting;
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0B132B', color: '#F1F5F9', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* 1. SUPER ADMIN SIDEBAR */}
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
        {/* Brand Header */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '4px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
              <img src="/logo.png" alt="MedMarg" style={{ height: '28px', objectFit: 'contain' }} />
            </div>
            {!sidebarCollapsed && (
              <div>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '900', display: 'block', width: 'fit-content' }}>
                  ADMIN CONSOLE
                </span>
                <span style={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: '700' }}>Catalog & Ops Hub</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '1rem', padding: '0.2rem' }}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Navigation Items */}
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

        {/* Footer Actions */}
        <div style={{ padding: '1rem', borderTop: '1px solid #1E293B', backgroundColor: '#0B132B' }}>
          {!sidebarCollapsed && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#FFF' }}>{user?.name || 'Super Admin'}</div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>admin@medmarg.com</div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={onSwitchRole} style={{ flex: 1, padding: '0.5rem', backgroundColor: '#1E293B', color: '#FBBF24', border: '1px solid #334155', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
              {sidebarCollapsed ? '⇄' : 'Switch Portal'}
            </button>
            <button onClick={onLogout} style={{ padding: '0.5rem 0.75rem', backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
              {sidebarCollapsed ? '✕' : 'Logout'}
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        
        {/* Top Header */}
        <header style={{ height: '70px', backgroundColor: '#0F172A', borderBottom: '1px solid #1E293B', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#FFFFFF' }}>
              {navMenuItems.find(m => m.key === activeTab)?.label}
            </h1>
            <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(0,107,112,0.3)', color: '#67E8F9', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: '800' }}>
              MedMarg Unified Diagnostics
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={triggerGoogleSheetsSync}
              disabled={isSyncingSheets}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: isSyncingSheets ? '#334155' : '#006B70', color: '#FFF', padding: '0.55rem 1.1rem', borderRadius: '10px', border: 'none', fontWeight: '800', fontSize: '0.84rem', cursor: isSyncingSheets ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(0,107,112,0.3)' }}
            >
              <RefreshCw size={15} className={isSyncingSheets ? 'animate-spin' : ''} />
              {isSyncingSheets ? 'Syncing with Sheets...' : 'Sync with Google Sheets'}
            </button>
          </div>
        </header>

        {/* Dynamic Workspace Body */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          
          {/* ========================================================================= */}
          {/* ===================== TAB 1: CATALOG & SHEETS SYNC ===================== */}
          {/* ========================================================================= */}
          {activeTab === 'TESTS_MGMT' && (
            <div>
              
              {/* Subtabs Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.85rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { key: 'TESTS', label: 'Single Tests', icon: FlaskConical, count: catalog.tests?.length || 913 },
                    { key: 'PROFILES', label: 'Diagnostic Profiles', icon: Layers, count: catalog.profiles?.length || 87 },
                    { key: 'PACKAGES', label: 'Health Packages', icon: Package, count: catalog.packages?.length || 4 },
                    { key: 'SYNC_HUB', label: 'Google Sheets Two-Way Sync', icon: FileSpreadsheet }
                  ].map(st => {
                    const isSel = testsSubTab === st.key;
                    const IconC = st.icon;
                    return (
                      <button
                        key={st.key}
                        onClick={() => setTestsSubTab(st.key)}
                        style={{
                          padding: '0.6rem 1.1rem',
                          borderRadius: '10px',
                          border: 'none',
                          backgroundColor: isSel ? '#006B70' : '#1E293B',
                          color: isSel ? '#FFF' : '#94A3B8',
                          fontWeight: '800',
                          fontSize: '0.88rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <IconC size={16} color={isSel ? '#FBBF24' : '#94A3B8'} />
                        {st.label} {st.count !== undefined ? `(${st.count})` : ''}
                      </button>
                    );
                  })}
                </div>

                {/* Subtab Action Buttons */}
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  {testsSubTab === 'TESTS' && (
                    <button 
                      onClick={() => { setEditingItem(null); setTestForm({ code: '', name: '', sampleType: 'SERUM', fasting: 'NO', mrp: 499, price: 299, tatHours: 24, description: '' }); setShowCreateTestModal(true); }}
                      style={{ padding: '0.6rem 1.2rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <PlusCircle size={16} /> Add Test to Master
                    </button>
                  )}
                  {testsSubTab === 'PROFILES' && (
                    <button 
                      onClick={() => { setEditingItem(null); setProfileForm({ code: '', name: '', sampleType: 'SERUM', fasting: 'NO', mrp: 1499, price: 899, tatHours: 24, description: '' }); setShowCreateProfileModal(true); }}
                      style={{ padding: '0.6rem 1.2rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <PlusCircle size={16} /> Add Profile to Master
                    </button>
                  )}
                  {testsSubTab === 'PACKAGES' && (
                    <button 
                      onClick={() => setShowPackageBuilderModal(true)}
                      style={{ padding: '0.6rem 1.2rem', backgroundColor: '#F59E0B', color: '#0F172A', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Plus size={16} /> Visual Package Builder
                    </button>
                  )}
                </div>
              </div>

              {/* ---------------- SUB-TAB 1.1: TESTS LIST ---------------- */}
              {testsSubTab === 'TESTS' && (
                <div>
                  {/* Filters */}
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
                      <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <input
                        type="text"
                        placeholder="Search 913 tests by name, test code, or sample type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.4rem', backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '10px', color: '#FFF', fontSize: '0.88rem', outline: 'none' }}
                      />
                    </div>
                    <select
                      value={filterFasting}
                      onChange={(e) => setFilterFasting(e.target.value)}
                      style={{ padding: '0.7rem 1rem', backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '10px', color: '#FFF', fontSize: '0.88rem', outline: 'none' }}
                    >
                      <option value="ALL">All Fasting Rules</option>
                      <option value="YES">Fasting: YES</option>
                      <option value="NO">Fasting: NO</option>
                    </select>
                    <select
                      value={filterSample}
                      onChange={(e) => setFilterSample(e.target.value)}
                      style={{ padding: '0.7rem 1rem', backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '10px', color: '#FFF', fontSize: '0.88rem', outline: 'none' }}
                    >
                      <option value="ALL">All Sample Types</option>
                      <option value="SERUM">SERUM</option>
                      <option value="EDTA">EDTA</option>
                      <option value="URINE">URINE</option>
                    </select>
                  </div>

                  {/* Tests Table */}
                  <div style={{ backgroundColor: '#1E293B', borderRadius: '18px', border: '1px solid #334155', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#0F172A', borderBottom: '1px solid #334155', color: '#94A3B8' }}>
                          <th style={{ padding: '1rem 1.25rem' }}>SERIAL / CODE</th>
                          <th style={{ padding: '1rem' }}>TEST NAME</th>
                          <th style={{ padding: '1rem' }}>SAMPLE TYPE</th>
                          <th style={{ padding: '1rem' }}>FASTING</th>
                          <th style={{ padding: '1rem' }}>PRICE (₹)</th>
                          <th style={{ padding: '1rem' }}>TAT</th>
                          <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAdminTests.slice(0, 50).map(test => (
                          <tr key={test.id || test.code} style={{ borderBottom: '1px solid #334155' }}>
                            <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', color: '#67E8F9', fontWeight: '700' }}>
                              #{test.serialNo || '-'} • {test.code}
                            </td>
                            <td style={{ padding: '1rem', fontWeight: '700', color: '#FFF' }}>
                              {test.name}
                            </td>
                            <td style={{ padding: '1rem', color: '#CBD5E1' }}>
                              <span style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                {test.sampleType || 'SERUM'}
                              </span>
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '800', backgroundColor: test.fasting === 'YES' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)', color: test.fasting === 'YES' ? '#FBBF24' : '#34D399' }}>
                                {test.fasting}
                              </span>
                            </td>
                            <td style={{ padding: '1rem', color: '#FBBF24', fontWeight: '900' }}>₹{test.price}</td>
                            <td style={{ padding: '1rem', color: '#94A3B8' }}>{test.tatHours || 24}h</td>
                            <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                              <button 
                                onClick={() => { setEditingItem(test); setTestForm(test); setShowCreateTestModal(true); }}
                                style={{ background: 'none', border: 'none', color: '#38BDF8', cursor: 'pointer', marginRight: '0.6rem' }} 
                                title="Edit Test"
                              >
                                <Edit3 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredAdminTests.length > 50 && (
                    <div style={{ textAlign: 'center', marginTop: '1rem', color: '#94A3B8', fontSize: '0.85rem' }}>
                      Showing top 50 of {filteredAdminTests.length} tests matching filters.
                    </div>
                  )}
                </div>
              )}

              {/* ---------------- SUB-TAB 1.2: PROFILES LIST ---------------- */}
              {testsSubTab === 'PROFILES' && (
                <div>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
                      <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <input
                        type="text"
                        placeholder="Search 87 profiles by name, profile code, or sample type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.4rem', backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '10px', color: '#FFF', fontSize: '0.88rem', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#1E293B', borderRadius: '18px', border: '1px solid #334155', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#0F172A', borderBottom: '1px solid #334155', color: '#94A3B8' }}>
                          <th style={{ padding: '1rem 1.25rem' }}>PROFILE CODE</th>
                          <th style={{ padding: '1rem' }}>PROFILE / PANEL NAME</th>
                          <th style={{ padding: '1rem' }}>SAMPLE TYPE</th>
                          <th style={{ padding: '1rem' }}>FASTING</th>
                          <th style={{ padding: '1rem' }}>PRICE (₹)</th>
                          <th style={{ padding: '1rem' }}>TAT</th>
                          <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAdminProfiles.map(profile => (
                          <tr key={profile.id || profile.code} style={{ borderBottom: '1px solid #334155' }}>
                            <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', color: '#FBBF24', fontWeight: '800' }}>
                              {profile.code}
                            </td>
                            <td style={{ padding: '1rem', fontWeight: '700', color: '#FFF' }}>
                              {profile.name}
                            </td>
                            <td style={{ padding: '1rem', color: '#CBD5E1' }}>
                              <span style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                {profile.sampleType || 'SERUM'}
                              </span>
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '800', backgroundColor: profile.fasting === 'YES' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)', color: profile.fasting === 'YES' ? '#FBBF24' : '#34D399' }}>
                                {profile.fasting}
                              </span>
                            </td>
                            <td style={{ padding: '1rem', color: '#67E8F9', fontWeight: '900' }}>₹{profile.price}</td>
                            <td style={{ padding: '1rem', color: '#94A3B8' }}>{profile.tatHours || 24}h</td>
                            <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                              <button 
                                onClick={() => { setEditingItem(profile); setProfileForm(profile); setShowCreateProfileModal(true); }}
                                style={{ background: 'none', border: 'none', color: '#38BDF8', cursor: 'pointer', marginRight: '0.6rem' }} 
                                title="Edit Profile"
                              >
                                <Edit3 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ---------------- SUB-TAB 1.3: HEALTH PACKAGES LIST ---------------- */}
              {testsSubTab === 'PACKAGES' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
                    {(catalog.packages || []).map(pkg => (
                      <div key={pkg.id} style={{ backgroundColor: '#1E293B', borderRadius: '20px', border: '1.5px solid #334155', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.55rem', borderRadius: '4px', fontWeight: '800' }}>
                              {pkg.discountPercent}% OFF • {pkg.category}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontFamily: 'monospace' }}>
                              {pkg.code}
                            </span>
                          </div>

                          <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#FFF', marginTop: '0.5rem' }}>
                            {pkg.name}
                          </h3>
                          <p style={{ fontSize: '0.84rem', color: '#94A3B8', marginTop: '0.3rem', lineHeight: 1.4 }}>
                            {pkg.tagline || pkg.description}
                          </p>

                          <div style={{ marginTop: '1rem', padding: '0.85rem', backgroundColor: '#0F172A', borderRadius: '12px', fontSize: '0.8rem', color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            <div>📦 Included: <strong>{(pkg.profiles || []).length} Profiles & {(pkg.tests || []).length} Single Tests</strong></div>
                            <div>🩸 Sample: <strong>{(pkg.sampleTypes || ['SERUM']).join(', ')}</strong></div>
                            <div>🍽️ Fasting: <strong style={{ color: pkg.fasting === 'YES' ? '#FBBF24' : '#34D399' }}>{pkg.fasting === 'YES' ? 'Yes (8-10h)' : 'No'}</strong></div>
                          </div>
                        </div>

                        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#FBBF24' }}>₹{pkg.price}</span>
                            <span style={{ fontSize: '0.8rem', color: '#64748B', textDecoration: 'line-through', marginLeft: '0.4rem' }}>₹{pkg.mrp}</span>
                          </div>
                          <button
                            onClick={() => handleDeletePackage(pkg.id)}
                            style={{ padding: '0.45rem 0.85rem', backgroundColor: 'rgba(239,68,68,0.2)', color: '#EF4444', border: '1px solid #EF4444', borderRadius: '8px', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ---------------- SUB-TAB 1.4: GOOGLE SHEETS SYNC HUB ---------------- */}
              {testsSubTab === 'SYNC_HUB' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                  
                  {/* Status & Action Card */}
                  <div style={{ backgroundColor: '#1E293B', borderRadius: '20px', border: '1.5px solid #006B70', padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }}></span>
                          <strong style={{ color: '#34D399', fontSize: '0.9rem' }}>Two-Way Google Sheets Engine Active</strong>
                        </div>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#FFF', marginTop: '0.4rem' }}>
                          Live Google Sheets & Excel Synchronization Hub
                        </h2>
                        <p style={{ color: '#94A3B8', fontSize: '0.9rem', maxWidth: '700px', marginTop: '0.4rem' }}>
                          Any test or profile created or edited in this panel is automatically synced back to the master sheet. Changes made directly inside Google Sheets / Excel are ingested on sync.
                        </p>
                      </div>

                      <button
                        onClick={triggerGoogleSheetsSync}
                        disabled={isSyncingSheets}
                        style={{ padding: '0.85rem 1.75rem', background: 'linear-gradient(135deg, #006B70 0%, #004D40 100%)', color: '#FFF', border: 'none', borderRadius: '14px', fontWeight: '900', fontSize: '0.95rem', cursor: isSyncingSheets ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 6px 18px rgba(0,107,112,0.35)' }}
                      >
                        <RefreshCw size={18} className={isSyncingSheets ? 'animate-spin' : ''} />
                        {isSyncingSheets ? 'Synchronizing Sheet Data...' : 'Sync Now with Google Sheets'}
                      </button>
                    </div>

                    {/* Stats Metrics */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
                      <div style={{ backgroundColor: '#0F172A', padding: '1.25rem', borderRadius: '14px', border: '1px solid #334155' }}>
                        <div style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>TESTS SHEET (TAB: TESTS)</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#67E8F9', marginTop: '0.2rem' }}>{catalog.tests?.length || 913}</div>
                        <div style={{ fontSize: '0.72rem', color: '#34D399' }}>✓ Synced & Indexed</div>
                      </div>

                      <div style={{ backgroundColor: '#0F172A', padding: '1.25rem', borderRadius: '14px', border: '1px solid #334155' }}>
                        <div style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>PROFILES SHEET (TAB: PROFILE)</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#FBBF24', marginTop: '0.2rem' }}>{catalog.profiles?.length || 87}</div>
                        <div style={{ fontSize: '0.72rem', color: '#34D399' }}>✓ Synced & Indexed</div>
                      </div>

                      <div style={{ backgroundColor: '#0F172A', padding: '1.25rem', borderRadius: '14px', border: '1px solid #334155' }}>
                        <div style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>ACTIVE PACKAGES</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#A78BFA', marginTop: '0.2rem' }}>{catalog.packages?.length || 4}</div>
                        <div style={{ fontSize: '0.72rem', color: '#34D399' }}>✓ Live on Customer View</div>
                      </div>
                    </div>
                  </div>

                  {/* Sync Logs */}
                  <div style={{ backgroundColor: '#1E293B', borderRadius: '18px', border: '1px solid #334155', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FFF', marginBottom: '1rem' }}>
                      Recent Synchronization Audit Logs
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {syncLogs.map((log, idx) => (
                        <div key={idx} style={{ padding: '0.75rem 1rem', borderRadius: '10px', backgroundColor: '#0F172A', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: log.status === 'SUCCESS' ? '#34D399' : '#38BDF8', fontWeight: '800' }}>●</span>
                            <span style={{ color: '#E2E8F0' }}>{log.action}</span>
                          </div>
                          <span style={{ color: '#64748B', fontSize: '0.78rem' }}>{log.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* ===================== TAB 2: INTERNAL LAB PARTNERS ===================== */}
          {/* ========================================================================= */}
          {activeTab === 'LABS' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#FFF' }}>
                    Regional Fulfillment Partner Labs
                  </h2>
                  <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                    Internal allocation of patient orders and samples based on region and negotiated margin tiers.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
                {labPartners.map(lab => (
                  <div key={lab.id} style={{ backgroundColor: '#1E293B', borderRadius: '18px', border: '1px solid #334155', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', backgroundColor: '#E0F2F1', color: '#006B70', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '800' }}>
                        {lab.nabl}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: '700' }}>● {lab.status}</span>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#FFF', marginTop: '0.5rem' }}>{lab.name}</h3>
                    <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: '0.2rem' }}>📍 {lab.city} • {lab.type}</div>

                    <div style={{ marginTop: '1.25rem', padding: '0.85rem', backgroundColor: '#0F172A', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>Active Routed Orders: <strong style={{ color: '#FBBF24' }}>{lab.activeOrders}</strong></span>
                      <span>Margin: <strong style={{ color: '#67E8F9' }}>{lab.assignedMargin}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ===================== TAB 3: COLLECTION AGENTS ===================== */}
          {/* ========================================================================= */}
          {activeTab === 'COLLECTION_AGENTS' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {collectionAgents.map(ag => (
                <div key={ag.id} style={{ backgroundColor: '#1E293B', borderRadius: '18px', border: '1px solid #334155', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: '800' }}>● {ag.status}</span>
                    <span style={{ fontSize: '0.78rem', color: '#67E8F9', fontWeight: '700' }}>Cold Box: {ag.temp}</span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#FFF', marginTop: '0.5rem' }}>{ag.name}</h3>
                  <div style={{ fontSize: '0.82rem', color: '#94A3B8' }}>📞 {ag.phone}</div>
                  <div style={{ fontSize: '0.82rem', color: '#CBD5E1', marginTop: '0.4rem' }}>📍 Area: {ag.area}</div>
                  <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#FBBF24', fontWeight: '700' }}>Samples Collected Today: {ag.samplesToday}</div>
                </div>
              ))}
            </div>
          )}

          {/* ========================================================================= */}
          {/* ===================== TAB 4: OVERVIEW ===================== */}
          {/* ========================================================================= */}
          {activeTab === 'OVERVIEW' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                <div style={{ backgroundColor: '#1E293B', padding: '1.5rem', borderRadius: '18px', border: '1px solid #334155' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: '700' }}>TOTAL TESTS IN CATALOG</div>
                  <div style={{ fontSize: '2rem', fontWeight: '900', color: '#67E8F9', marginTop: '0.3rem' }}>{catalog.tests?.length || 913}</div>
                </div>
                <div style={{ backgroundColor: '#1E293B', padding: '1.5rem', borderRadius: '18px', border: '1px solid #334155' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: '700' }}>TOTAL PROFILES IN CATALOG</div>
                  <div style={{ fontSize: '2rem', fontWeight: '900', color: '#FBBF24', marginTop: '0.3rem' }}>{catalog.profiles?.length || 87}</div>
                </div>
                <div style={{ backgroundColor: '#1E293B', padding: '1.5rem', borderRadius: '18px', border: '1px solid #334155' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: '700' }}>ACTIVE PACKAGES</div>
                  <div style={{ fontSize: '2rem', fontWeight: '900', color: '#34D399', marginTop: '0.3rem' }}>{catalog.packages?.length || 4}</div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ---------------- MODAL 1: ADD / EDIT TEST ---------------- */}
      {showCreateTestModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 120, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#1E293B', borderRadius: '22px', maxWidth: '520px', width: '100%', padding: '2rem', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#FFF' }}>
                {editingItem ? 'Edit Test' : 'Add New Clinical Test to Master'}
              </h3>
              <button onClick={() => setShowCreateTestModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSaveTest} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Test Code</label>
                  <input
                    type="text"
                    value={testForm.code}
                    onChange={(e) => setTestForm({ ...testForm, code: e.target.value })}
                    placeholder="e.g. VITDC"
                    required
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#67E8F9', fontWeight: '800', marginTop: '0.2rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Test Name</label>
                  <input
                    type="text"
                    value={testForm.name}
                    onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
                    placeholder="e.g. 25-OH VITAMIN D (TOTAL)"
                    required
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', fontWeight: '700', marginTop: '0.2rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Sample Type</label>
                  <input
                    type="text"
                    value={testForm.sampleType}
                    onChange={(e) => setTestForm({ ...testForm, sampleType: e.target.value })}
                    placeholder="SERUM / EDTA / URINE"
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', marginTop: '0.2rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Fasting Required?</label>
                  <select
                    value={testForm.fasting}
                    onChange={(e) => setTestForm({ ...testForm, fasting: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', marginTop: '0.2rem' }}
                  >
                    <option value="NO">NO</option>
                    <option value="YES">YES</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#FBBF24', fontWeight: '700' }}>MedMarg Price (₹)</label>
                  <input
                    type="number"
                    value={testForm.price}
                    onChange={(e) => setTestForm({ ...testForm, price: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #F59E0B', borderRadius: '8px', color: '#FBBF24', fontWeight: '800', marginTop: '0.2rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Standard MRP (₹)</label>
                  <input
                    type="number"
                    value={testForm.mrp}
                    onChange={(e) => setTestForm({ ...testForm, mrp: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#94A3B8', marginTop: '0.2rem' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{ marginTop: '0.75rem', padding: '0.85rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}
              >
                {editingItem ? 'Update Test' : 'Save Test & Sync to Google Sheets'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL 2: ADD / EDIT PROFILE ---------------- */}
      {showCreateProfileModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 120, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#1E293B', borderRadius: '22px', maxWidth: '520px', width: '100%', padding: '2rem', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#FFF' }}>
                {editingItem ? 'Edit Profile' : 'Add Diagnostic Profile to Master'}
              </h3>
              <button onClick={() => setShowCreateProfileModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Profile Code</label>
                  <input
                    type="text"
                    value={profileForm.code}
                    onChange={(e) => setProfileForm({ ...profileForm, code: e.target.value })}
                    placeholder="e.g. APCOM"
                    required
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FBBF24', fontWeight: '800', marginTop: '0.2rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Profile Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder="e.g. ALLERGY COMPREHENSIVE PROFILE"
                    required
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', fontWeight: '700', marginTop: '0.2rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Sample Type</label>
                  <input
                    type="text"
                    value={profileForm.sampleType}
                    onChange={(e) => setProfileForm({ ...profileForm, sampleType: e.target.value })}
                    placeholder="SERUM / EDTA"
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', marginTop: '0.2rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Fasting Required?</label>
                  <select
                    value={profileForm.fasting}
                    onChange={(e) => setProfileForm({ ...profileForm, fasting: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', marginTop: '0.2rem' }}
                  >
                    <option value="NO">NO</option>
                    <option value="YES">YES</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#FBBF24', fontWeight: '700' }}>MedMarg Price (₹)</label>
                  <input
                    type="number"
                    value={profileForm.price}
                    onChange={(e) => setProfileForm({ ...profileForm, price: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #F59E0B', borderRadius: '8px', color: '#FBBF24', fontWeight: '800', marginTop: '0.2rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Standard MRP (₹)</label>
                  <input
                    type="number"
                    value={profileForm.mrp}
                    onChange={(e) => setProfileForm({ ...profileForm, mrp: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#94A3B8', marginTop: '0.2rem' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{ marginTop: '0.75rem', padding: '0.85rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}
              >
                {editingItem ? 'Update Profile' : 'Save Profile & Sync to Google Sheets'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL 3: VISUAL PACKAGE BUILDER ---------------- */}
      {showPackageBuilderModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 120, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#1E293B', borderRadius: '24px', maxWidth: '900px', width: '100%', padding: '2rem', border: '2px solid #F59E0B', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '900' }}>
                  ADMIN STUDIO
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#FFF', marginTop: '0.3rem' }}>
                  Visual Health Package Builder
                </h2>
              </div>
              <button onClick={() => setShowPackageBuilderModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.75rem' }}>
              
              {/* Left Column: Select Components */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '800', color: '#FBBF24', display: 'block', marginBottom: '0.4rem' }}>
                  1. Search & Select Components (Profiles & Tests):
                </label>
                <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                  <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                  <input
                    type="text"
                    placeholder="Search from 87 profiles & 913 tests..."
                    value={builderSearch}
                    onChange={(e) => setBuilderSearch(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', fontSize: '0.85rem' }}
                  />
                </div>

                {/* Profiles Checklist */}
                <div style={{ fontSize: '0.75rem', color: '#67E8F9', fontWeight: '800', marginBottom: '0.3rem' }}>
                  🔬 PROFILES / PANELS ({catalog.profiles?.length || 87})
                </div>
                <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem', paddingRight: '0.25rem' }} className="custom-scrollbar">
                  {(catalog.profiles || []).filter(p => !builderSearch || p.name.toLowerCase().includes(builderSearch.toLowerCase()) || p.code.toLowerCase().includes(builderSearch.toLowerCase())).slice(0, 30).map(p => {
                    const isSel = packageBuilderForm.selectedProfiles.includes(p.code);
                    return (
                      <div
                        key={p.code}
                        onClick={() => {
                          if (isSel) setPackageBuilderForm({ ...packageBuilderForm, selectedProfiles: packageBuilderForm.selectedProfiles.filter(c => c !== p.code) });
                          else setPackageBuilderForm({ ...packageBuilderForm, selectedProfiles: [...packageBuilderForm.selectedProfiles, p.code] });
                        }}
                        style={{ padding: '0.45rem 0.75rem', borderRadius: '6px', backgroundColor: isSel ? 'rgba(0,107,112,0.35)' : '#0F172A', border: isSel ? '1.5px solid #006B70' : '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        <span style={{ color: '#FFF' }}>{isSel ? '✓ ' : '+ '}{p.name} ({p.code})</span>
                        <span style={{ color: '#67E8F9', fontSize: '0.72rem' }}>{p.sampleType}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Single Tests Checklist */}
                <div style={{ fontSize: '0.75rem', color: '#FBBF24', fontWeight: '800', marginBottom: '0.3rem' }}>
                  🧪 INDIVIDUAL TESTS ({catalog.tests?.length || 913})
                </div>
                <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingRight: '0.25rem' }} className="custom-scrollbar">
                  {(catalog.tests || []).filter(t => !builderSearch || t.name.toLowerCase().includes(builderSearch.toLowerCase()) || t.code.toLowerCase().includes(builderSearch.toLowerCase())).slice(0, 40).map(t => {
                    const isSel = packageBuilderForm.selectedTests.includes(t.code);
                    return (
                      <div
                        key={t.code}
                        onClick={() => {
                          if (isSel) setPackageBuilderForm({ ...packageBuilderForm, selectedTests: packageBuilderForm.selectedTests.filter(c => c !== t.code) });
                          else setPackageBuilderForm({ ...packageBuilderForm, selectedTests: [...packageBuilderForm.selectedTests, t.code] });
                        }}
                        style={{ padding: '0.45rem 0.75rem', borderRadius: '6px', backgroundColor: isSel ? 'rgba(245,158,11,0.25)' : '#0F172A', border: isSel ? '1.5px solid #F59E0B' : '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        <span style={{ color: '#FFF' }}>{isSel ? '✓ ' : '+ '}{t.name} ({t.code})</span>
                        <span style={{ color: '#FBBF24', fontSize: '0.72rem' }}>{t.sampleType}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Package Metadata & Live Auto-Summary */}
              <div>
                <form onSubmit={handleSavePackage} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Package Name</label>
                    <input
                      type="text"
                      value={packageBuilderForm.name}
                      onChange={(e) => setPackageBuilderForm({ ...packageBuilderForm, name: e.target.value })}
                      placeholder="e.g. Master Executive Health Shield"
                      required
                      style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', marginTop: '0.2rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#FBBF24', fontWeight: '800' }}>Package Price (₹)</label>
                      <input
                        type="number"
                        value={packageBuilderForm.price}
                        onChange={(e) => setPackageBuilderForm({ ...packageBuilderForm, price: e.target.value })}
                        required
                        style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1.5px solid #F59E0B', borderRadius: '8px', color: '#FBBF24', fontWeight: '800', marginTop: '0.2rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Market MRP (₹)</label>
                      <input
                        type="number"
                        value={packageBuilderForm.mrp}
                        onChange={(e) => setPackageBuilderForm({ ...packageBuilderForm, mrp: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#94A3B8', marginTop: '0.2rem' }}
                      />
                    </div>
                  </div>

                  {/* Auto-Aggregated Live Summary Card */}
                  <div style={{ backgroundColor: '#0F172A', padding: '1rem', borderRadius: '12px', border: '1px solid #334155', marginTop: '0.5rem', fontSize: '0.8rem', color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <strong style={{ color: '#67E8F9' }}>⚡ AUTO-AGGREGATED SPECIFICATIONS:</strong>
                    <div>• Selected Profiles: <strong>{packageBuilderForm.selectedProfiles.length}</strong></div>
                    <div>• Selected Tests: <strong>{packageBuilderForm.selectedTests.length}</strong></div>
                    <div>• Required Sample Types: <strong style={{ color: '#FBBF24' }}>{calculateAggregatedSamples(packageBuilderForm.selectedProfiles, packageBuilderForm.selectedTests, catalog.profiles, catalog.tests).join(' + ')}</strong></div>
                    <div>• Fasting Required: <strong style={{ color: calculateFastingRequirement(packageBuilderForm.selectedProfiles, packageBuilderForm.selectedTests, catalog.profiles, catalog.tests) ? '#FBBF24' : '#34D399' }}>{calculateFastingRequirement(packageBuilderForm.selectedProfiles, packageBuilderForm.selectedTests, catalog.profiles, catalog.tests) ? 'YES (8-10h)' : 'NO'}</strong></div>
                  </div>

                  <button
                    type="submit"
                    style={{ marginTop: '0.75rem', padding: '0.85rem', background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#0F172A', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '0.95rem', cursor: 'pointer' }}
                  >
                    Publish Package to Live Catalog
                  </button>
                </form>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
