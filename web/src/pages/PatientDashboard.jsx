import React, { useState } from 'react';
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
  UserCheck
} from 'lucide-react';
import { THYROCARE_CATEGORIES, THYROCARE_TESTS } from '../data/thyrocareTests';

export default function PatientDashboard({ user, onSwitchRole, onLogout }) {
  const [activeTab, setActiveTab] = useState('TESTS'); // 'TESTS' | 'DOCTOR_PRESCRIPTIONS' | 'SCANS' | 'DOCTORS' | 'PHARMACY' | 'RECORDS' | 'ORDERS'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Tests & Packages');
  
  // Cart
  const [cart, setCart] = useState([
    {
      id: 'th_aarogyam_complete',
      name: 'Aarogyam Complete 1.3 (Full Body Checkup)',
      lab: 'Thyrocare Central Lab',
      price: 1499,
      mrp: 3500,
      params: 104,
      fasting: '10-12 hrs Fasting'
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
    items: ['Aarogyam Complete 1.3 (104 Tests)', 'Thyroid Profile Total (T3/T4/TSH)'],
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

  // Filtered tests
  const filteredTests = THYROCARE_TESTS.filter(test => {
    const matchesCategory = selectedCategory === 'All Tests & Packages' || test.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      test.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (test) => {
    if (!cart.some(item => item.id === test.id)) {
      setCart([...cart, {
        id: test.id,
        name: test.name,
        lab: 'Thyrocare Central Lab',
        price: test.thyrocarePrice,
        mrp: test.originalPrice,
        params: test.params,
        fasting: test.fasting
      }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);
  const cartSavings = cart.reduce((sum, item) => sum + (item.mrp - item.price), 0);

  const handleCompleteBooking = (e) => {
    e.preventDefault();
    setShowCheckoutModal(false);
    setShowBookingSuccess(true);
    setCart([]);
  };

  const navMenuItems = [
    { key: 'TESTS', label: 'Diagnostic Pathology (Thyrocare)', icon: FlaskConical, badge: '100+ Tests' },
    { key: 'DOCTOR_PRESCRIPTIONS', label: 'Doctor Prescriptions', icon: UserCheck, badge: `${doctorPrescriptions.length} Active` },
    { key: 'SCANS', label: '3.0T MRI & Scans', icon: Building2, badge: 'Hourly Slots' },
    { key: 'DOCTORS', label: 'In-Clinic OPD Doctors', icon: Stethoscope },
    { key: 'PHARMACY', label: 'Generic Pharmacy (70% Off)', icon: Pill },
    { key: 'RECORDS', label: 'Health Records & Trends', icon: FolderHeart, badge: 'Drive Sync' },
    { key: 'ORDERS', label: 'My Bookings & Sample Track', icon: Activity, badge: 'Live' }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* 1. ENTERPRISE PATIENT SIDEBAR */}
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
                  gap: '0.85rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: isActive ? '#006B70' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#B2DFDB',
                  fontWeight: isActive ? '800' : '600',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
                }}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <IconComp size={20} color={isActive ? '#FDE047' : '#80CBC4'} />
                {!sidebarCollapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                {!sidebarCollapsed && item.badge !== undefined && (
                  <span style={{ fontSize: '0.72rem', backgroundColor: isActive ? 'rgba(0,0,0,0.25)' : '#00332C', color: isActive ? '#FDE047' : '#B2DFDB', padding: '0.15rem 0.45rem', borderRadius: '6px', fontWeight: '800' }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: '1rem', borderTop: '1px solid #003830', backgroundColor: '#00332C' }}>
          {!sidebarCollapsed && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#FFF' }}>{user?.name || 'Rahul Sharma'}</div>
              <div style={{ fontSize: '0.72rem', color: '#80CBC4' }}>Tirupati, Andhra Pradesh</div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={onSwitchRole} style={{ flex: 1, padding: '0.5rem', backgroundColor: '#004D40', color: '#FDE047', border: '1px solid #006B70', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
              {sidebarCollapsed ? '⇄' : 'Switch Role'}
            </button>
            <button onClick={onLogout} style={{ padding: '0.5rem 0.75rem', backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
              {sidebarCollapsed ? '✕' : 'Logout'}
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN PATIENT WORKSPACE CONTAINER */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        
        {/* Top Header Bar */}
        <header style={{ height: '70px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A' }}>
              {navMenuItems.find(m => m.key === activeTab)?.label}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#E0F2F1', padding: '0.3rem 0.7rem', borderRadius: '20px', fontSize: '0.8rem' }}>
              <MapPin size={14} color="#006B70" />
              <span style={{ color: '#006B70', fontWeight: '700' }}>Tirupati, Andhra Pradesh</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setShowCheckoutModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#F59E0B', color: '#0F172A', padding: '0.55rem 1.1rem', borderRadius: '12px', border: 'none', fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(245,158,11,0.3)' }}
            >
              <ShoppingBag size={18} />
              <span>Cart ({cart.length})</span>
              {cart.length > 0 && <span style={{ backgroundColor: '#B45309', color: '#FFF', padding: '0.1rem 0.4rem', borderRadius: '6px', fontSize: '0.78rem' }}>₹{cartTotal}</span>}
            </button>
          </div>
        </header>

        {/* Dynamic Main Content */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          
          {/* ===================== TAB 1: DIAGNOSTIC TESTS (THYROCARE) ===================== */}
          {activeTab === 'TESTS' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A' }}>
                    Pathology Tests & Full-Body Packages ({filteredTests.length} Tests)
                  </h2>
                  <p style={{ color: '#64748B', fontSize: '0.88rem' }}>
                    Compare negotiated Thyrocare rates against Apollo & Dr. Lal PathLabs. Free home sample collection in Tirupati.
                  </p>
                </div>

                <div style={{ position: 'relative', minWidth: '300px' }}>
                  <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="text"
                    placeholder="Search tests (Aarogyam, Thyroid, Lipid)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.4rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Category Filter Pills */}
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.85rem', marginBottom: '1.5rem' }} className="custom-scrollbar">
                {THYROCARE_CATEGORIES.map(cat => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        padding: '0.45rem 0.9rem',
                        borderRadius: '10px',
                        border: isSelected ? '1.5px solid #F59E0B' : '1px solid #E2E8F0',
                        backgroundColor: isSelected ? '#FEF3C7' : '#FFFFFF',
                        color: isSelected ? '#B45309' : '#475569',
                        fontWeight: isSelected ? '800' : '600',
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Test Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {filteredTests.map(test => {
                  const isInCart = cart.some(item => item.id === test.id);
                  return (
                    <div key={test.id} style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.4rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} className="card-interactive">
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>
                            {test.yellowTag}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#006B70', fontWeight: '700', backgroundColor: '#E0F2F1', padding: '0.15rem 0.45rem', borderRadius: '6px' }}>
                            {test.params} Parameters
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A', lineHeight: 1.3 }}>
                          {test.name}
                        </h3>

                        <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.4rem 0 0.85rem', lineHeight: 1.4, minHeight: '38px' }}>
                          {test.description}
                        </p>

                        <div style={{ fontSize: '0.78rem', color: '#475569', backgroundColor: '#F8FAFC', padding: '0.6rem 0.75rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid #F1F5F9' }}>
                          <div>🩸 Sample: <strong>{test.sample}</strong></div>
                          <div style={{ marginTop: '0.2rem' }}>⏰ Fasting: <strong>{test.fasting}</strong> • TAT: <strong>{test.tat}</strong></div>
                        </div>
                      </div>

                      <div style={{ paddingTop: '0.85rem', borderTop: '1px solid #F1F5F9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block' }}>Thyrocare Rate</span>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                              <span style={{ fontSize: '1.35rem', fontWeight: '900', color: '#B45309' }}>₹{test.thyrocarePrice}</span>
                              <span style={{ fontSize: '0.8rem', color: '#94A3B8', textDecoration: 'line-through' }}>₹{test.originalPrice}</span>
                            </div>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: '800', backgroundColor: '#D1FAE5', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                            Free Home Visit
                          </div>
                        </div>

                        <button
                          onClick={() => addToCart(test)}
                          disabled={isInCart}
                          style={{
                            width: '100%',
                            padding: '0.7rem',
                            background: isInCart ? '#E2E8F0' : 'linear-gradient(135deg, #006B70 0%, #004D40 100%)',
                            color: isInCart ? '#64748B' : '#FFF',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: '800',
                            fontSize: '0.88rem',
                            cursor: isInCart ? 'default' : 'pointer',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '0.4rem'
                          }}
                        >
                          {isInCart ? <><Check size={16} /> Added to Cart</> : <><ShoppingBag size={16} /> Add to Cart (₹{test.thyrocarePrice})</>}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===================== TAB 2: DOCTOR PRESCRIBED TESTS ===================== */}
          {activeTab === 'DOCTOR_PRESCRIPTIONS' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A' }}>Doctor Prescriptions & Prescribed Tests</h2>
                <p style={{ color: '#64748B', fontSize: '0.88rem' }}>
                  Diagnostic tests prescribed directly by your consulting doctor with customized pricing and shared report sync.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {doctorPrescriptions.map(rx => (
                  <div key={rx.prescriptionId} style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '2px solid #6366F1', padding: '1.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', backgroundColor: '#EDE9FE', color: '#6D28D9', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '900' }}>
                          PRESCRIBED BY YOUR DOCTOR
                        </span>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0F172A', marginTop: '0.4rem' }}>{rx.doctorName}</h3>
                        <div style={{ fontSize: '0.85rem', color: '#64748B' }}>{rx.clinic} • Prescribed on {rx.date}</div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Prescription Fee Total:</span>
                        <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#4338CA' }}>₹{rx.totalDoctorPrice}</div>
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
                      <strong style={{ fontSize: '0.82rem', color: '#334155' }}>Doctor's Clinical Notes:</strong>
                      <p style={{ fontSize: '0.88rem', color: '#475569', marginTop: '0.2rem' }}>{rx.notes}</p>
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                      <strong style={{ fontSize: '0.85rem', color: '#0F172A', display: 'block', marginBottom: '0.5rem' }}>Prescribed Tests Checklist:</strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {rx.tests.map((t, idx) => (
                          <div key={idx} style={{ padding: '0.75rem 1rem', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <strong style={{ fontSize: '0.92rem', color: '#0F172A' }}>{t.name}</strong>
                              <span style={{ fontSize: '0.75rem', color: '#64748B', marginLeft: '0.5rem' }}>({t.params} Biomarkers)</span>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.8rem', color: '#94A3B8', textDecoration: 'line-through', marginRight: '0.5rem' }}>₹{t.standardMRP}</span>
                              <strong style={{ fontSize: '1.1rem', color: '#4338CA' }}>₹{t.doctorPrice}</strong>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.85rem', color: '#006B70', fontWeight: '700' }}>
                        📍 Free Home Sample Collection at Plot 42, Air Bypass Road, Tirupati
                      </div>
                      <button
                        onClick={() => alert(`Home sample collection confirmed for Dr. Ananya Sharma's prescription! Phlebotomist Ramesh Kumar dispatched.`)}
                        style={{ padding: '0.75rem 1.5rem', backgroundColor: '#6366F1', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer' }}
                      >
                        Confirm Sample Collection Slot (₹{rx.totalDoctorPrice})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== TAB 3: 3.0T MRI & SCANS ===================== */}
          {activeTab === 'SCANS' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A' }}>Radiology & 3.0T Silent MRI Scans</h2>
                <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Confirmed slot booking with certified imaging centers in Tirupati.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
                {[
                  { name: 'MRI Brain (Plain + Angio)', center: 'Aarthi Scans & Labs (Tirupati Center)', spec: 'Siemens 3.0 Tesla Silent MRI', price: 3499, mrp: 6000, prep: '4h Fasting • No metallic objects', slots: ['Today 5:00 PM', 'Tomorrow 10:00 AM'] },
                  { name: 'HRCT Chest (Low Radiation)', center: 'Focus Imaging Diagnostics', spec: '128-Slice Low Dose CT', price: 2499, mrp: 4500, prep: 'Creatinine report required for contrast', slots: ['Today 6:30 PM', 'Tomorrow 11:30 AM'] },
                  { name: 'USG Whole Abdomen & Pelvis', center: 'Medall Diagnostics', spec: '4D Color Doppler Ultrasound', price: 1199, mrp: 2000, prep: 'Full Bladder • 6h Fasting', slots: ['Tomorrow 9:00 AM', 'Tomorrow 3:00 PM'] }
                ].map((scan, idx) => (
                  <div key={idx} style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} className="card-interactive">
                    <div>
                      <span style={{ fontSize: '0.72rem', backgroundColor: '#CFFAFE', color: '#0891B2', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '800' }}>
                        {scan.spec}
                      </span>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', marginTop: '0.5rem' }}>{scan.name}</h3>
                      <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.25rem' }}>{scan.center}</div>
                      <div style={{ fontSize: '0.8rem', color: '#475569', backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '10px', margin: '0.85rem 0' }}>
                        <strong>Protocol:</strong> {scan.prep}
                      </div>
                    </div>

                    <div style={{ paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: '#64748B' }}>MedMarg Rate</span>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                            <span style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0F172A' }}>₹{scan.price}</span>
                            <span style={{ fontSize: '0.8rem', color: '#94A3B8', textDecoration: 'line-through' }}>₹{scan.mrp}</span>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '800' }}>Save {Math.round(((scan.mrp - scan.price) / scan.mrp) * 100)}%</span>
                      </div>

                      <button
                        onClick={() => alert(`Appointment Slot reserved for ${scan.name} at ${scan.center} (${scan.slots[0]}). Appointment Pass sent to your WhatsApp!`)}
                        style={{ width: '100%', padding: '0.75rem', backgroundColor: '#06B6D4', color: '#0F172A', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer' }}
                      >
                        Reserve Slot ({scan.slots[0]})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== TAB 4: IN-CLINIC DOCTORS ===================== */}
          {activeTab === 'DOCTORS' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A' }}>In-Clinic OPD Doctor Appointments</h2>
                <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Book walk-in clinic consultation tokens with verified specialists in Tirupati.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
                {[
                  { name: 'Dr. Ananya Sharma', specialty: 'General Physician & Diabetologist', qual: 'MBBS, MD (Internal Medicine)', clinic: 'MedMarg Care Clinic, Air Bypass Road, Tirupati', fee: 499, exp: '14 yrs exp', slot: 'Today, 4:30 PM (Token #4)' },
                  { name: 'Dr. Rajeshwar Rao', specialty: 'Cardiologist', qual: 'MBBS, MD, DM (Cardiology)', clinic: 'Heart Wellness Institute, SVIMS Road, Tirupati', fee: 800, exp: '22 yrs exp', slot: 'Tomorrow, 10:00 AM (Token #2)' }
                ].map((doc, idx) => (
                  <div key={idx} style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#EDE9FE', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Stethoscope size={28} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A' }}>{doc.name}</h3>
                        <div style={{ color: '#8B5CF6', fontWeight: '700', fontSize: '0.88rem' }}>{doc.specialty}</div>
                        <div style={{ color: '#64748B', fontSize: '0.8rem' }}>{doc.qual} • {doc.exp}</div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.25rem' }}>
                      <MapPin size={16} color="#8B5CF6" /> {doc.clinic}
                    </div>

                    <div style={{ paddingTop: '1rem', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Consultation Fee</span>
                        <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0F172A' }}>₹{doc.fee}</div>
                      </div>
                      <button
                        onClick={() => alert(`In-Clinic OPD Appointment confirmed for ${doc.name}! ${doc.slot}.`)}
                        style={{ padding: '0.7rem 1.3rem', backgroundColor: '#8B5CF6', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer' }}
                      >
                        Book OPD Token
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== TAB 5: GENERIC PHARMACY ===================== */}
          {activeTab === 'PHARMACY' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#065F46' }}>Generic Pharmacy & 70% Cost-Saver</h2>
                <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Upload prescription to substitute branded medications with exact generic equivalents.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '2px dashed #10B981', padding: '2.5rem 2rem', textAlign: 'center' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#D1FAE5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <UploadCloud size={30} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A' }}>Upload Doctor's Prescription</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.4rem 0 1.5rem' }}>
                    Supports PDF, JPG or camera scan.
                  </p>
                  <button
                    onClick={() => setPrescriptionUploaded(true)}
                    style={{ padding: '0.8rem 1.6rem', backgroundColor: '#10B981', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '0.92rem', cursor: 'pointer' }}
                  >
                    {prescriptionUploaded ? '✓ Prescription Analyzed (rx_tirupati.pdf)' : 'Select Prescription File'}
                  </button>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '1.75rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A', marginBottom: '1rem' }}>Cost Comparison</h3>
                  <div style={{ padding: '1.25rem', backgroundColor: '#D1FAE5', borderRadius: '12px', border: '2px solid #10B981' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', backgroundColor: '#F59E0B', color: '#FFF', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '900' }}>SAVE 53%</span>
                      <span style={{ fontSize: '1.45rem', fontWeight: '900', color: '#065F46' }}>₹135</span>
                    </div>
                    <div style={{ marginTop: '0.4rem' }}>
                      <strong style={{ color: '#065F46' }}>Saroglitazar 4mg (Generic Equivalent)</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 6: HEALTH RECORDS ===================== */}
          {activeTab === 'RECORDS' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A' }}>Digital Health Records & Google Drive Reports</h2>
                <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Direct Google Drive shareable links to all diagnostic lab and radiology reports.</p>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { title: 'Thyrocare Aarogyam 1.3 Full Body Report (104 Tests)', date: '15 Aug 2026', lab: 'Thyrocare Central Processing Lab', driveLink: 'https://drive.google.com/file/d/1A2B3C4D_MedMarg_SampleReport_Aarogyam/view?usp=sharing' },
                    { title: 'Siemens 3.0T MRI Brain Scan DICOM & PDF', date: '02 Jul 2026', lab: 'Aarthi Scans & Labs', driveLink: 'https://drive.google.com/file/d/1X9Y8Z7W_MedMarg_MRI_Brain_Scan/view?usp=sharing' }
                  ].map((rep, idx) => (
                    <div key={idx} style={{ padding: '1rem 1.25rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>{rep.title}</strong>
                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{rep.lab} • {rep.date}</div>
                      </div>
                      <a
                        href={rep.driveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ padding: '0.5rem 1rem', backgroundColor: '#006B70', color: '#FFF', borderRadius: '8px', textDecoration: 'none', fontSize: '0.82rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        Open in Google Drive <ExternalLink size={14} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 7: MY BOOKINGS ===================== */}
          {activeTab === 'ORDERS' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A' }}>My Diagnostic Bookings & Real-Time Tracking</h2>
                <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Live phlebotomist home collection status in Tirupati.</p>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>BOOKING ID</span>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#006B70' }}>{activeOrder.id}</h3>
                    <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Scheduled Date: <strong>{activeOrder.date}</strong> ({activeOrder.slot})</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.25rem 0.65rem', borderRadius: '6px', fontWeight: '900' }}>PHLEBOTOMIST ASSIGNED</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0F172A', marginTop: '0.3rem' }}>₹{activeOrder.totalAmount}</div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#FFFBEB', borderRadius: '14px', border: '1.5px solid #FDE68A', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: '#B45309' }}>{activeOrder.phleboName}</strong>
                    <div style={{ fontSize: '0.82rem', color: '#92400E' }}>📍 Address: {activeOrder.address}</div>
                  </div>
                  <a href={`tel:${activeOrder.phleboPhone}`} style={{ padding: '0.6rem 1.1rem', backgroundColor: '#B45309', color: '#FFF', borderRadius: '8px', textDecoration: 'none', fontWeight: '800', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Phone size={15} /> Call Phlebotomist
                  </a>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* CHECKOUT MODAL */}
      {showCheckoutModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 120, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', maxWidth: '600px', width: '100%', padding: '2rem', border: '2px solid #006B70' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A' }}>Confirm Home Sample Collection</h2>
              <button onClick={() => setShowCheckoutModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleCompleteBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '12px' }}>
                {cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0' }}>
                    <span>{item.name}</span>
                    <strong>₹{item.price}</strong>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', color: '#006B70', borderTop: '1px solid #E2E8F0', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                  <span>Total Payable:</span>
                  <span>₹{cartTotal}</span>
                </div>
              </div>

              <button type="submit" style={{ padding: '0.9rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '1rem', cursor: 'pointer' }}>
                Schedule Phlebotomist (₹{cartTotal})
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BOOKING SUCCESS */}
      {showBookingSuccess && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 130, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', maxWidth: '480px', width: '100%', padding: '2.5rem 2rem', textAlign: 'center', border: '2px solid #10B981' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#D1FAE5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <CheckCircle2 size={36} />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0F172A' }}>Booking Confirmed!</h2>
            <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '0.75rem 0 1.5rem' }}>
              Phlebotomist assigned for tomorrow morning at your address in Tirupati.
            </p>
            <button onClick={() => { setShowBookingSuccess(false); setActiveTab('ORDERS'); }} style={{ padding: '0.8rem 1.6rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}>
              Track Phlebotomist
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
