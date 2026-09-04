import React, { useState, useEffect } from 'react';
import { 
  Search, 
  FlaskConical, 
  Building2, 
  Stethoscope, 
  Pill, 
  FolderHeart, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  Star, 
  Clock, 
  Home as HomeIcon, 
  Sparkles, 
  Shield, 
  Award, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileCheck,
  Percent,
  Calendar,
  User,
  ShoppingBag,
  Trash2,
  Phone,
  UploadCloud,
  Check,
  AlertCircle,
  FileText,
  Activity,
  UserCheck,
  Layers,
  Filter
} from 'lucide-react';
import initialCatalog from '../data/catalogData.json';
import { getCatalogState, filterCatalogItems } from '../data/catalogStore';

export default function PatientDashboard({ user, onSwitchRole, onLogout }) {
  const [activeTab, setActiveTab] = useState('TESTS'); // 'TESTS' | 'DOCTOR_PRESCRIPTIONS' | 'SCANS' | 'DOCTORS' | 'PHARMACY' | 'RECORDS' | 'ORDERS'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogSubTab, setCatalogSubTab] = useState('ALL'); // 'ALL' | 'PACKAGES' | 'PROFILES' | 'TESTS'
  const [fastingFilter, setFastingFilter] = useState('ALL');
  const [sampleFilter, setSampleFilter] = useState('ALL');
  
  const [catalog, setCatalog] = useState(getCatalogState() || initialCatalog);

  // Cart
  const [cart, setCart] = useState([
    {
      id: 'pkg_mm_master',
      name: 'MedMarg Master Health Checkup (Comprehensive)',
      lab: 'MedMarg Central Diagnostics',
      price: 1499,
      mrp: 3999,
      params: 92,
      fasting: 'YES',
      sampleType: 'SERUM, EDTA, URINE'
    }
  ]);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);

  // Doctor-prescribed tests for this patient
  const [doctorPrescriptions, setDoctorPrescriptions] = useState([
    {
      prescriptionId: 'DOC-RX-8921',
      doctorName: 'Dr. Ananya Sharma',
      clinic: 'MedMarg Care Clinic, Air Bypass Road, Tirupati',
      date: '30 Aug 2026',
      notes: 'Quarterly diabetic follow-up & lipid panel. Please maintain 10h fasting.',
      tests: [
        { name: 'Thyroid Profile Total (T3/T4/TSH)', params: 3, doctorPrice: 450, standardMRP: 600 },
        { name: 'Lipid Profile Comprehensive', params: 8, doctorPrice: 550, standardMRP: 800 }
      ],
      totalDoctorPrice: 1000,
      phleboStatus: 'ASSIGNED_RAMESH_KUMAR',
      reportReady: false
    }
  ]);

  const [activeOrder, setActiveOrder] = useState({
    id: 'MM-LAB-9842',
    date: '31 Aug 2026',
    slot: '07:30 AM - 08:30 AM',
    address: 'Plot 42, Air Bypass Road, Tirupati, AP',
    phleboName: 'Ramesh Kumar (Certified Phlebotomist)',
    phleboPhone: '+91 98765 11223',
    status: 'ASSIGNED',
    items: ['MedMarg Master Health Checkup', 'Thyroid Profile Total (T3/T4/TSH)'],
    totalAmount: 1798
  });

  // Patient details for checkout
  const [patientForm, setPatientForm] = useState({
    name: user?.name || 'Rahul Sharma',
    age: '34',
    gender: 'Male',
    phone: user?.identifier || '+91 98765 43210',
    address: 'Plot 42, Air Bypass Road, Tirupati, Andhra Pradesh',
    date: 'Tomorrow (31 Aug 2026)',
    slot: '07:00 AM - 08:00 AM (Morning Fasting)',
    paymentMethod: 'CASH_ON_COLLECTION'
  });

  // Generic Pharmacy Demo
  const [prescriptionUploaded, setPrescriptionUploaded] = useState(false);
  const [genericSwitched, setGenericSwitched] = useState(false);

  // Sync catalog from backend API if available
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
              setCatalog({
                packages: pkgs.packages,
                profiles: profs.profiles,
                tests: tsts.tests
              });
            }
          }).catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  const getFilteredItems = () => {
    let items = [];
    if (catalogSubTab === 'ALL') {
      items = [
        ...(catalog.packages || []).map(p => ({ ...p, itemType: 'PACKAGE' })),
        ...(catalog.profiles || []).map(p => ({ ...p, itemType: 'PROFILE' })),
        ...(catalog.tests || []).map(t => ({ ...t, itemType: 'TEST' }))
      ];
    } else if (catalogSubTab === 'PACKAGES') {
      items = (catalog.packages || []).map(p => ({ ...p, itemType: 'PACKAGE' }));
    } else if (catalogSubTab === 'PROFILES') {
      items = (catalog.profiles || []).map(p => ({ ...p, itemType: 'PROFILE' }));
    } else if (catalogSubTab === 'TESTS') {
      items = (catalog.tests || []).map(t => ({ ...t, itemType: 'TEST' }));
    }

    return filterCatalogItems(items, searchQuery, fastingFilter, sampleFilter);
  };

  const displayCatalogItems = getFilteredItems();

  const addToCart = (item) => {
    if (!cart.some(cartItem => cartItem.id === (item.id || item.code))) {
      setCart([...cart, {
        id: item.id || item.code,
        name: item.name,
        lab: 'MedMarg Central Diagnostics',
        price: item.price,
        mrp: item.mrp || item.price * 1.5,
        params: item.testCount || 1,
        fasting: item.fasting || 'NO',
        sampleType: item.sampleType || item.sampleTypes?.join(', ') || 'SERUM'
      }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);
  const cartSavings = cart.reduce((sum, item) => sum + ((item.mrp || item.price * 1.5) - item.price), 0);

  const handleCompleteBooking = (e) => {
    e.preventDefault();
    setShowCheckoutModal(false);
    setShowBookingSuccess(true);
    setCart([]);
  };

  const navMenuItems = [
    { key: 'TESTS', label: 'Diagnostic Pathology', icon: FlaskConical, badge: `${(catalog.tests?.length || 913) + (catalog.profiles?.length || 87)} Items` },
    { key: 'DOCTOR_PRESCRIPTIONS', label: 'Doctor Prescriptions', icon: UserCheck, badge: `${doctorPrescriptions.length} Active` },
    { key: 'SCANS', label: '3.0T MRI & Scans', icon: Building2, badge: 'Hourly Slots' },
    { key: 'DOCTORS', label: 'In-Clinic OPD Doctors', icon: Stethoscope },
    { key: 'PHARMACY', label: 'Generic Pharmacy (70% Off)', icon: Pill },
    { key: 'RECORDS', label: 'Health Records & Trends', icon: FolderHeart, badge: 'Drive Sync' },
    { key: 'ORDERS', label: 'My Bookings & Sample Track', icon: Activity, badge: 'Live' }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* 1. PATIENT SIDEBAR */}
      <aside style={{ 
        width: sidebarCollapsed ? '80px' : '280px', 
        backgroundColor: '#004D40', 
        borderRight: '1px solid #00332C', 
        display: 'flex', 
        flexDirection: 'column', 
        transition: 'width 0.2s ease',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100
      }}>
        {/* Brand Header */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #003830', display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '4px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
              <img src="/logo.png" alt="MedMarg" style={{ height: '28px', objectFit: 'contain' }} />
            </div>
            {!sidebarCollapsed && (
              <div>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '900', display: 'block', width: 'fit-content' }}>
                  PATIENT PORTAL
                </span>
                <span style={{ fontSize: '0.82rem', color: '#E0F2F1', fontWeight: '700' }}>Healthcare Console</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{ background: 'none', border: 'none', color: '#80CBC4', cursor: 'pointer', fontSize: '1rem', padding: '0.2rem' }}
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
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: isActive ? '#006B70' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#B2DFDB',
                  fontWeight: isActive ? '800' : '600',
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <IconComp size={18} color={isActive ? '#FBBF24' : '#80CBC4'} />
                {!sidebarCollapsed && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: '6px', backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', color: isActive ? '#FFF' : '#80CBC4' }}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info & Switch */}
        <div style={{ padding: '1rem', borderTop: '1px solid #003830' }}>
          {!sidebarCollapsed ? (
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#FFF' }}>{user?.name || 'Rahul Sharma'}</div>
              <div style={{ fontSize: '0.72rem', color: '#80CBC4' }}>{user?.identifier || '+91 98765 43210'}</div>
              <button
                onClick={onLogout}
                style={{ marginTop: '0.65rem', width: '100%', padding: '0.45rem', backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFF', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', fontSize: '0.76rem', fontWeight: '700', cursor: 'pointer' }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button onClick={onLogout} style={{ width: '100%', background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}>⏻</button>
          )}
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '2rem 2.5rem', maxHeight: '100vh' }} className="custom-scrollbar">
        
        {/* Top Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0F172A' }}>
              {activeTab === 'TESTS' && 'Diagnostic Pathology & Lab Tests'}
              {activeTab === 'DOCTOR_PRESCRIPTIONS' && 'Doctor Prescriptions & Recommended Tests'}
              {activeTab === 'SCANS' && '3.0T MRI & Radiology Slots'}
              {activeTab === 'DOCTORS' && 'In-Clinic OPD Specialist Appointments'}
              {activeTab === 'PHARMACY' && 'Generic Medicine Cost Optimizer'}
              {activeTab === 'RECORDS' && 'Digital Health Locker & Biomarker Trends'}
              {activeTab === 'ORDERS' && 'Live Booking Tracker & Phlebotomist Status'}
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.2rem' }}>
              MedMarg Unified Healthcare • NABL Certified Pathology with Free Home Collection
            </p>
          </div>

          {/* Cart Floating Button */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={() => setShowCheckoutModal(true)}
              style={{ padding: '0.65rem 1.25rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 4px 12px rgba(0,107,112,0.25)' }}
            >
              <ShoppingBag size={18} color="#FBBF24" />
              <span>Cart ({cart.length}) • ₹{cartTotal}</span>
            </button>
          </div>
        </div>

        {/* ---------------- ACTIVE TAB 1: DIAGNOSTIC TESTS (UNIFIED MEDMARG LAB) ---------------- */}
        {activeTab === 'TESTS' && (
          <div>
            
            {/* Search & Sub-tabs Bar */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '18px', border: '1px solid #E2E8F0', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Search Box */}
              <div style={{ position: 'relative' }}>
                <Search size={20} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '12px' }} />
                <input
                  type="text"
                  placeholder={`Search ${catalog.tests?.length || 913}+ tests (Thyroid, HbA1c, Vitamin D, Allergy, Liver, CBC)...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem', borderRadius: '12px', border: '1.5px solid #E2E8F0', fontSize: '0.92rem', outline: 'none', color: '#0F172A', fontWeight: '600' }}
                />
              </div>

              {/* Subtabs & Filters */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { key: 'ALL', label: `All Items (${(catalog.packages?.length || 0) + (catalog.profiles?.length || 0) + (catalog.tests?.length || 0)})` },
                    { key: 'PACKAGES', label: `✨ Health Packages (${catalog.packages?.length || 4})` },
                    { key: 'PROFILES', label: `🔬 Diagnostic Profiles (${catalog.profiles?.length || 87})` },
                    { key: 'TESTS', label: `🧪 Individual Tests (${catalog.tests?.length || 913})` }
                  ].map(tab => {
                    const isSel = catalogSubTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setCatalogSubTab(tab.key)}
                        style={{
                          padding: '0.45rem 0.95rem',
                          borderRadius: '10px',
                          border: isSel ? '1.5px solid #006B70' : '1px solid #E2E8F0',
                          backgroundColor: isSel ? '#006B70' : '#F8FAFC',
                          color: isSel ? '#FFFFFF' : '#475569',
                          fontWeight: isSel ? '800' : '600',
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748B' }}>
                  <span>Fasting:</span>
                  <select 
                    value={fastingFilter} 
                    onChange={(e) => setFastingFilter(e.target.value)}
                    style={{ padding: '0.3rem 0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', outline: 'none' }}
                  >
                    <option value="ALL">All</option>
                    <option value="YES">Required</option>
                    <option value="NO">Not Required</option>
                  </select>

                  <span style={{ marginLeft: '0.5rem' }}>Sample:</span>
                  <select 
                    value={sampleFilter} 
                    onChange={(e) => setSampleFilter(e.target.value)}
                    style={{ padding: '0.3rem 0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', outline: 'none' }}
                  >
                    <option value="ALL">All</option>
                    <option value="SERUM">Serum</option>
                    <option value="EDTA">EDTA</option>
                    <option value="URINE">Urine</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Test Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {displayCatalogItems.slice(0, 80).map((item) => {
                const inCart = cart.some(c => c.id === (item.id || item.code));
                return (
                  <div
                    key={item.id || item.code}
                    style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: item.itemType === 'PACKAGE' ? '2px solid #F59E0B' : '1.5px solid #E2E8F0', padding: '1.35rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ 
                          fontSize: '0.7rem', 
                          backgroundColor: item.itemType === 'PACKAGE' ? '#FEF3C7' : (item.itemType === 'PROFILE' ? '#CFFAFE' : '#E0F2F1'), 
                          color: item.itemType === 'PACKAGE' ? '#B45309' : (item.itemType === 'PROFILE' ? '#0891B2' : '#006B70'), 
                          padding: '0.15rem 0.45rem', 
                          borderRadius: '4px', 
                          fontWeight: '800' 
                        }}>
                          {item.itemType || 'TEST'} {item.code ? `• ${item.code}` : ''}
                        </span>
                        
                        <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: '700', backgroundColor: '#D1FAE5', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                          Free Home Pickup
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', lineHeight: 1.3 }}>
                        {item.name}
                      </h3>

                      <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <div>🩸 Sample: <strong>{item.sampleType || item.sampleTypes?.join(', ') || 'SERUM'}</strong></div>
                        <div>🍽️ Fasting: <strong style={{ color: item.fasting === 'YES' ? '#D97706' : '#10B981' }}>{item.fasting === 'YES' ? 'Yes (8-10 Hours)' : 'No Fasting'}</strong></div>
                        <div>⏱️ Turnaround: <strong>{item.tatHours || 24} Hours</strong></div>
                      </div>
                    </div>

                    <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#006B70' }}>₹{item.price}</div>
                        {item.mrp && (
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8', textDecoration: 'line-through' }}>₹{item.mrp}</div>
                        )}
                      </div>

                      <button
                        onClick={() => inCart ? removeFromCart(item.id || item.code) : addToCart(item)}
                        style={{
                          padding: '0.55rem 1.1rem',
                          backgroundColor: inCart ? '#EF4444' : '#006B70',
                          color: '#FFF',
                          border: 'none',
                          borderRadius: '10px',
                          fontWeight: '800',
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        {inCart ? 'Remove' : '+ Add Test'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {displayCatalogItems.length > 80 && (
              <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#64748B', fontSize: '0.85rem' }}>
                Showing 80 of {displayCatalogItems.length} matching items. Use the search bar above to narrow down results.
              </div>
            )}

          </div>
        )}

        {/* ---------------- ACTIVE TAB 2: DOCTOR PRESCRIPTIONS ---------------- */}
        {activeTab === 'DOCTOR_PRESCRIPTIONS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {doctorPrescriptions.map((rx) => (
              <div key={rx.prescriptionId} style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1.5px solid #CBD5E1', padding: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', backgroundColor: '#EDE9FE', color: '#8B5CF6', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: '800' }}>
                      IN-CLINIC DOCTOR PRESCRIPTION #{rx.prescriptionId}
                    </span>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0F172A', marginTop: '0.4rem' }}>
                      Prescribed by {rx.doctorName}
                    </h2>
                    <div style={{ fontSize: '0.85rem', color: '#64748B' }}>{rx.clinic} • {rx.date}</div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: '800', backgroundColor: '#D1FAE5', padding: '0.25rem 0.65rem', borderRadius: '6px' }}>
                      Phlebotomist Assigned
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '1.25rem', padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.5rem' }}>DOCTOR'S CLINICAL NOTE:</div>
                  <p style={{ fontSize: '0.88rem', color: '#334155', margin: 0 }}>"{rx.notes}"</p>
                </div>

                <div style={{ marginTop: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.75rem' }}>Recommended Lab Tests:</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {rx.tests.map((t, idx) => (
                      <div key={idx} style={{ padding: '0.75rem 1rem', borderRadius: '10px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '0.92rem', color: '#0F172A' }}>{t.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#64748B', marginLeft: '0.5rem' }}>({t.params} Parameters)</span>
                        </div>
                        <div style={{ fontWeight: '800', color: '#006B70' }}>₹{t.doctorPrice}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Total Test Amount</span>
                    <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#006B70' }}>₹{rx.totalDoctorPrice}</div>
                  </div>
                  <button
                    onClick={() => {
                      rx.tests.forEach(t => addToCart({ name: t.name, price: t.doctorPrice, mrp: t.standardMRP, id: t.name }));
                      setShowCheckoutModal(true);
                    }}
                    style={{ padding: '0.75rem 1.5rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}
                  >
                    Schedule Home Sample Pickup
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ---------------- ACTIVE TAB 3: SCANS ---------------- */}
        {activeTab === 'SCANS' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {[
              { name: 'MRI Brain (Plain + Angio)', spec: 'Siemens 3.0 Tesla Silent MRI', price: 3499, mrp: 6000, slot: 'Today, 5:00 PM' },
              { name: 'HRCT Chest (Low Dose Protocol)', spec: '128-Slice Low Dose CT', price: 2499, mrp: 4500, slot: 'Today, 6:30 PM' },
              { name: 'USG Whole Abdomen & Pelvis', spec: '4D Color Doppler Ultrasound', price: 1199, mrp: 2000, slot: 'Tomorrow, 9:30 AM' }
            ].map((scan, i) => (
              <div key={i} style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', backgroundColor: '#CFFAFE', color: '#0891B2', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>
                  {scan.spec}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A', marginTop: '0.6rem' }}>{scan.name}</h3>
                <div style={{ fontSize: '0.85rem', color: '#10B981', fontWeight: '700', marginTop: '0.4rem' }}>⏰ Confirmed Slot: {scan.slot}</div>
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.35rem', fontWeight: '900', color: '#006B70' }}>₹{scan.price}</span>
                  <button 
                    onClick={() => alert('Slot reserved! Center address and token sent via WhatsApp.')}
                    style={{ padding: '0.6rem 1.2rem', backgroundColor: '#06B6D4', color: '#0F172A', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
                  >
                    Reserve Slot
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ---------------- ACTIVE TAB 4: DOCTORS ---------------- */}
        {activeTab === 'DOCTORS' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {[
              { name: 'Dr. Ananya Sharma', specialty: 'General Physician & Diabetologist', qual: 'MBBS, MD', clinic: 'MedMarg Care Clinic, Air Bypass Road', fee: '₹499', slot: 'Today, 4:30 PM' },
              { name: 'Dr. Rajeshwar Rao', specialty: 'Cardiologist', qual: 'MBBS, MD, DM', clinic: 'Heart Wellness Institute, Tirupati', fee: '₹800', slot: 'Tomorrow, 10:00 AM' }
            ].map((doc, i) => (
              <div key={i} style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>{doc.name}</h3>
                <div style={{ fontSize: '0.85rem', color: '#8B5CF6', fontWeight: '700' }}>{doc.specialty}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>{doc.clinic}</div>
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A' }}>{doc.fee}</span>
                  <button 
                    onClick={() => alert(`In-Clinic Token Confirmed for ${doc.name} at ${doc.slot}`)}
                    style={{ padding: '0.6rem 1.2rem', backgroundColor: '#8B5CF6', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
                  >
                    Book Token
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ---------------- ACTIVE TAB 5: PHARMACY ---------------- */}
        {activeTab === 'PHARMACY' && (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '2rem', border: '1.5px solid #A7F3D0' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#065F46' }}>Generic Medicine Salt Matcher</h2>
            <p style={{ fontSize: '0.88rem', color: '#64748B', marginTop: '0.2rem' }}>Save up to 70% by matching branded prescription drugs to WHO-GMP certified generic equivalents.</p>
            
            <div style={{ marginTop: '1.5rem', padding: '1.5rem', borderRadius: '14px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: '#064E3B' }}>Upload Doctor's Prescription PDF / Image</strong>
                  <div style={{ fontSize: '0.78rem', color: '#047857' }}>Auto-synced to Google Drive for secure pharmacist review</div>
                </div>
                <button 
                  onClick={() => setPrescriptionUploaded(true)}
                  style={{ padding: '0.65rem 1.25rem', backgroundColor: '#059669', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
                >
                  {prescriptionUploaded ? '✓ Prescription Uploaded' : 'Upload Rx'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- ACTIVE TAB 6: HEALTH RECORDS ---------------- */}
        {activeTab === 'RECORDS' && (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '2rem', border: '1px solid #E2E8F0' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A' }}>Digital Health Locker & Biomarker Trends</h2>
            <p style={{ fontSize: '0.88rem', color: '#64748B', marginTop: '0.2rem' }}>All lab test PDF reports and doctor prescriptions are automatically organized and backed up to Google Drive.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
              {[
                { title: 'Master Health Checkup Report', date: '15 Aug 2026', size: '1.8 MB PDF', id: 'REP-8821' },
                { title: 'Lipid & HbA1c Profile Report', date: '02 June 2026', size: '1.2 MB PDF', id: 'REP-7412' }
              ].map((doc, idx) => (
                <div key={idx} style={{ padding: '1.25rem', borderRadius: '14px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <FileText size={22} color="#006B70" />
                    <div>
                      <strong style={{ fontSize: '0.92rem', color: '#0F172A' }}>{doc.title}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{doc.date} • {doc.size}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => alert(`Opening Google Drive PDF for ${doc.id}...`)}
                    style={{ marginTop: '1rem', width: '100%', padding: '0.45rem', backgroundColor: '#E0F2F1', color: '#006B70', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    View on Google Drive
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- ACTIVE TAB 7: LIVE ORDERS ---------------- */}
        {activeTab === 'ORDERS' && (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '2rem', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', backgroundColor: '#E0F2F1', color: '#006B70', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: '800' }}>
                  LIVE BOOKING #{activeOrder.id}
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A', marginTop: '0.35rem' }}>
                  Home Sample Collection Scheduled
                </h2>
              </div>
              <span style={{ padding: '0.35rem 0.85rem', backgroundColor: '#FEF3C7', color: '#B45309', borderRadius: '20px', fontWeight: '800', fontSize: '0.85rem' }}>
                Phlebotomist On Route
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginTop: '1.5rem' }}>
              <div style={{ padding: '1.25rem', borderRadius: '14px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700' }}>ASSIGNED PHLEBOTOMIST</div>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', marginTop: '0.25rem' }}>{activeOrder.phleboName}</div>
                <div style={{ fontSize: '0.85rem', color: '#006B70', marginTop: '0.2rem' }}>📞 {activeOrder.phleboPhone}</div>
              </div>

              <div style={{ padding: '1.25rem', borderRadius: '14px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700' }}>COLLECTION SLOT & ADDRESS</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A', marginTop: '0.25rem' }}>{activeOrder.slot}</div>
                <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.2rem' }}>📍 {activeOrder.address}</div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* CHECKOUT MODAL */}
      {showCheckoutModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 120, backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', maxWidth: '540px', width: '100%', padding: '2rem', boxShadow: '0 25px 60px -15px rgba(0,0,0,0.35)', border: '2px solid #006B70', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A' }}>Confirm Home Sample Booking</h2>
              <button onClick={() => setShowCheckoutModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B' }}>✕</button>
            </div>

            {/* Selected items */}
            <div style={{ marginBottom: '1.25rem', padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748B', marginBottom: '0.6rem' }}>SELECTED TESTS & PROFILES ({cart.length})</div>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid #F1F5F9' }}>
                  <div>
                    <strong style={{ fontSize: '0.88rem', color: '#0F172A' }}>{item.name}</strong>
                    <div style={{ fontSize: '0.74rem', color: '#64748B' }}>Sample: {item.sampleType} • Fasting: {item.fasting}</div>
                  </div>
                  <div style={{ fontWeight: '800', color: '#006B70' }}>₹{item.price}</div>
                </div>
              ))}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.6rem', borderTop: '1.5px solid #CBD5E1', fontSize: '1.1rem', fontWeight: '900' }}>
                <span>Total Amount:</span>
                <span style={{ color: '#006B70' }}>₹{cartTotal}</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCompleteBooking} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Patient Full Name</label>
                <input 
                  type="text" 
                  value={patientForm.name} 
                  onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', marginTop: '0.25rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Home Collection Address</label>
                <textarea 
                  value={patientForm.address} 
                  onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })}
                  rows={2}
                  required
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', marginTop: '0.25rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Preferred Time Slot</label>
                <select 
                  value={patientForm.slot} 
                  onChange={(e) => setPatientForm({ ...patientForm, slot: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', marginTop: '0.25rem' }}
                >
                  <option>06:30 AM - 07:30 AM (Early Fasting)</option>
                  <option>07:30 AM - 08:30 AM (Standard Fasting)</option>
                  <option>08:30 AM - 09:30 AM (Morning Fasting)</option>
                  <option>10:00 AM - 12:00 PM (Non-Fasting)</option>
                </select>
              </div>

              <button
                type="submit"
                style={{ marginTop: '0.75rem', padding: '0.85rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '1rem', cursor: 'pointer' }}
              >
                Confirm Free Home Collection (₹{cartTotal})
              </button>
            </form>

          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showBookingSuccess && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 130, backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', maxWidth: '460px', width: '100%', padding: '2.5rem 2rem', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <CheckCircle2 size={36} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A' }}>Booking Confirmed!</h2>
            <p style={{ fontSize: '0.88rem', color: '#64748B', marginTop: '0.4rem', lineHeight: 1.5 }}>
              Your MedMarg diagnostic order has been assigned to a certified phlebotomist. Live status updates have been sent to your WhatsApp.
            </p>
            <button
              onClick={() => setShowBookingSuccess(false)}
              style={{ marginTop: '1.5rem', padding: '0.75rem 2rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
