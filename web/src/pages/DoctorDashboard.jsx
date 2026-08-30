import React, { useState } from 'react';
import { 
  Stethoscope, 
  Users, 
  FlaskConical, 
  FileText, 
  CreditCard, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Phone, 
  MapPin, 
  DollarSign, 
  ExternalLink, 
  Calendar, 
  Activity, 
  Check, 
  AlertCircle,
  FolderHeart,
  ChevronRight,
  TrendingUp,
  UserCheck,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import { THYROCARE_TESTS, THYROCARE_CATEGORIES } from '../data/thyrocareTests';

export default function DoctorDashboard({ user, onSwitchRole, onLogout }) {
  const [activeTab, setActiveTab] = useState('PATIENTS'); // 'PATIENTS' | 'PRESCRIBE' | 'REPORTS' | 'OPD_QUEUE' | 'EARNINGS'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Doctor's Patient Registry
  const [patients, setPatients] = useState([
    {
      id: 'PAT-101',
      name: 'Rahul Sharma',
      age: 34,
      gender: 'Male',
      phone: '+91 98765 43210',
      address: 'Plot 42, Air Bypass Road, Tirupati, AP',
      lastVisit: '30 Aug 2026',
      appAccessGranted: true,
      pendingTestsCount: 1,
      totalVisits: 4
    },
    {
      id: 'PAT-102',
      name: 'K. Srinivasa Rao',
      age: 58,
      gender: 'Male',
      phone: '+91 98765 88990',
      address: 'SVIMS Staff Quarters, Tirupati, AP',
      lastVisit: '28 Aug 2026',
      appAccessGranted: true,
      pendingTestsCount: 0,
      totalVisits: 6
    },
    {
      id: 'PAT-103',
      name: 'Lakshmi Narayana',
      age: 46,
      gender: 'Female',
      phone: '+91 98765 11223',
      address: 'Near Padmavathi Temple, Tiruchanoor Rd, Tirupati',
      lastVisit: '29 Aug 2026',
      appAccessGranted: false,
      pendingTestsCount: 2,
      totalVisits: 2
    }
  ]);

  // Modal: Add New Patient
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    address: 'Tirupati, Andhra Pradesh',
    appAccessGranted: true
  });

  // Prescription & Custom Pricing State
  const [selectedPatientForTest, setSelectedPatientForTest] = useState(patients[0]);
  const [prescribedTestIds, setPrescribedTestIds] = useState(['th_thyroid_total', 'th_lipid_profile']);
  const [doctorCustomPrices, setDoctorCustomPrices] = useState({
    th_thyroid_total: 450,
    th_lipid_profile: 550
  });
  const [allowPatientAppLogin, setAllowPatientAppLogin] = useState(true);
  const [orderSuccessModal, setOrderSuccessModal] = useState(null);

  // Completed Orders & Reports List
  const [doctorOrders, setDoctorOrders] = useState([
    {
      orderId: 'DOC-ORD-8921',
      patientName: 'Rahul Sharma',
      phone: '+91 98765 43210',
      tests: ['Aarogyam Complete 1.3 (104 Tests)'],
      labCostToDoc: 1499,
      doctorPriceToPatient: 1800,
      doctorMargin: 301,
      paymentToLabStatus: 'PAID_TO_LAB',
      sampleStatus: 'PHLEBO_ASSIGNED',
      reportStatus: 'PROCESSING',
      reportDriveLink: 'https://drive.google.com/file/d/1A2B3C4D_MedMarg_SampleReport_Aarogyam/view?usp=sharing',
      date: '30 Aug 2026'
    },
    {
      orderId: 'DOC-ORD-8920',
      patientName: 'K. Srinivasa Rao',
      phone: '+91 98765 88990',
      tests: ['Lipid Profile Complete', 'HbA1c Glycated Hemoglobin'],
      labCostToDoc: 750,
      doctorPriceToPatient: 950,
      doctorMargin: 200,
      paymentToLabStatus: 'PAID_TO_LAB',
      sampleStatus: 'COLLECTED',
      reportStatus: 'REPORT_READY',
      reportDriveLink: 'https://drive.google.com/file/d/1L5P6Q7R_MedMarg_Lipid_HbA1c/view?usp=sharing',
      date: '28 Aug 2026'
    }
  ]);

  // Handle Add New Patient
  const handleSavePatient = (e) => {
    e.preventDefault();
    const created = {
      id: `PAT-${Math.floor(100 + Math.random() * 900)}`,
      name: newPatientForm.name,
      age: Number(newPatientForm.age) || 30,
      gender: newPatientForm.gender,
      phone: newPatientForm.phone,
      address: newPatientForm.address,
      lastVisit: 'Today (30 Aug 2026)',
      appAccessGranted: newPatientForm.appAccessGranted,
      pendingTestsCount: 0,
      totalVisits: 1
    };
    setPatients([created, ...patients]);
    setShowAddPatientModal(false);
    setNewPatientForm({ name: '', age: '', gender: 'Male', phone: '', address: 'Tirupati, Andhra Pradesh', appAccessGranted: true });
    alert(`Patient ${created.name} added to your clinic registry!`);
  };

  // Calculate prescription financials
  const selectedTestsObj = THYROCARE_TESTS.filter(t => prescribedTestIds.includes(t.id));
  const totalLabBaseCost = selectedTestsObj.reduce((sum, t) => sum + t.thyrocarePrice, 0);
  const totalStandardMRP = selectedTestsObj.reduce((sum, t) => sum + t.originalPrice, 0);
  const totalDoctorCustomPrice = selectedTestsObj.reduce((sum, t) => {
    const custom = doctorCustomPrices[t.id];
    return sum + (custom !== undefined ? Number(custom) : t.thyrocarePrice);
  }, 0);
  const totalDoctorMargin = totalDoctorCustomPrice - totalLabBaseCost;

  // Handle Prescription Submission
  const handleSubmitDoctorOrder = (e) => {
    e.preventDefault();
    if (!selectedPatientForTest || prescribedTestIds.length === 0) return;

    const newOrder = {
      orderId: `DOC-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: selectedPatientForTest.name,
      phone: selectedPatientForTest.phone,
      tests: selectedTestsObj.map(t => t.name),
      labCostToDoc: totalLabBaseCost,
      doctorPriceToPatient: totalDoctorCustomPrice,
      doctorMargin: totalDoctorMargin,
      paymentToLabStatus: 'PAID_TO_LAB',
      sampleStatus: 'SCHEDULED_HOME_COLLECTION',
      reportStatus: 'QUEUED_AT_LAB',
      reportDriveLink: 'https://drive.google.com/file/d/1_PendingReport_SuperAdminLab/view?usp=sharing',
      date: 'Today (30 Aug 2026)'
    };

    setDoctorOrders([newOrder, ...doctorOrders]);
    setOrderSuccessModal(newOrder);
  };

  const navMenuItems = [
    { key: 'PATIENTS', label: 'My Patients Directory', icon: Users, badge: patients.length },
    { key: 'PRESCRIBE', label: 'Prescribe Diagnostic Tests', icon: FlaskConical },
    { key: 'REPORTS', label: 'Patient Reports & Orders', icon: FileText, badge: doctorOrders.length },
    { key: 'OPD_QUEUE', label: 'In-Clinic OPD Queue', icon: Stethoscope, badge: '5 Today' },
    { key: 'EARNINGS', label: 'Revenue & Settlements', icon: CreditCard }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* 1. ENTERPRISE DOCTOR SIDEBAR */}
      <aside style={{ 
        width: sidebarCollapsed ? '80px' : '280px', 
        backgroundColor: '#1E1B4B', 
        borderRight: '1px solid #312E81', 
        display: 'flex', 
        flexDirection: 'column', 
        transition: 'width 0.2s ease',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100
      }}>
        {/* Brand Header */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #312E81', display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '4px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
              <img src="/logo.png" alt="MedMarg" style={{ height: '28px', objectFit: 'contain' }} />
            </div>
            {!sidebarCollapsed && (
              <div>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#EDE9FE', color: '#6D28D9', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '900', display: 'block', width: 'fit-content' }}>
                  DOCTOR PORTAL
                </span>
                <span style={{ fontSize: '0.82rem', color: '#C7D2FE', fontWeight: '700' }}>OPD & Diagnostic Desk</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{ background: 'none', border: 'none', color: '#818CF8', cursor: 'pointer', fontSize: '1rem', padding: '0.2rem' }}
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
                  backgroundColor: isActive ? '#6366F1' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#C7D2FE',
                  fontWeight: isActive ? '800' : '600',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
                }}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <IconComp size={20} color={isActive ? '#FDE047' : '#818CF8'} />
                {!sidebarCollapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                {!sidebarCollapsed && item.badge !== undefined && (
                  <span style={{ fontSize: '0.72rem', backgroundColor: isActive ? 'rgba(0,0,0,0.25)' : '#312E81', color: isActive ? '#FDE047' : '#C7D2FE', padding: '0.15rem 0.45rem', borderRadius: '6px', fontWeight: '800' }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: '1rem', borderTop: '1px solid #312E81', backgroundColor: '#131131' }}>
          {!sidebarCollapsed && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#FFF' }}>{user?.name || 'Dr. Ananya Sharma'}</div>
              <div style={{ fontSize: '0.72rem', color: '#A5B4FC' }}>MBBS, MD • Diabetology</div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={onSwitchRole} style={{ flex: 1, padding: '0.5rem', backgroundColor: '#312E81', color: '#FDE047', border: '1px solid #4338CA', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
              {sidebarCollapsed ? '⇄' : 'Switch Role'}
            </button>
            <button onClick={onLogout} style={{ padding: '0.5rem 0.75rem', backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
              {sidebarCollapsed ? '✕' : 'Logout'}
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        
        {/* Top Header Bar */}
        <header style={{ height: '70px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A' }}>
              {navMenuItems.find(m => m.key === activeTab)?.label}
            </h1>
            <span style={{ fontSize: '0.75rem', backgroundColor: '#EDE9FE', color: '#6D28D9', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: '800' }}>
              Verified In-Clinic Doctor Desk
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#F1F5F9', padding: '0.4rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem' }}>
              <MapPin size={15} color="#8B5CF6" />
              <span style={{ color: '#64748B' }}>Clinic:</span>
              <strong style={{ color: '#0F172A' }}>MedMarg Care Clinic, Air Bypass Road, Tirupati</strong>
            </div>

            <button
              onClick={() => setActiveTab('PRESCRIBE')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#6366F1', color: '#FFF', padding: '0.5rem 1rem', borderRadius: '10px', border: 'none', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
            >
              <Plus size={16} /> Prescribe Tests for Patient
            </button>
          </div>
        </header>

        {/* Dynamic Main Content */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          
          {/* ===================== TAB 1: MY PATIENTS DIRECTORY ===================== */}
          {activeTab === 'PATIENTS' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A' }}>My Clinic Patients ({patients.length})</h2>
                  <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Manage your patient records, grant mobile app access, and prescribe customized diagnostic tests.</p>
                </div>

                <button
                  onClick={() => setShowAddPatientModal(true)}
                  style={{ padding: '0.65rem 1.2rem', backgroundColor: '#6366F1', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Plus size={16} /> Add New Patient
                </button>
              </div>

              {/* Patient Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
                {patients.map(patient => (
                  <div key={patient.id} style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} className="card-interactive">
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', backgroundColor: '#EDE9FE', color: '#6D28D9', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '800' }}>
                          {patient.id}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: patient.appAccessGranted ? '#10B981' : '#64748B', fontWeight: '800', backgroundColor: patient.appAccessGranted ? '#D1FAE5' : '#F1F5F9', padding: '0.15rem 0.45rem', borderRadius: '6px' }}>
                          {patient.appAccessGranted ? '✓ App Access Active' : 'Offline Managed'}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A' }}>{patient.name}</h3>
                      <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.2rem' }}>
                        {patient.age} yrs • {patient.gender} • 📞 {patient.phone}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={14} color="#8B5CF6" /> {patient.address}
                      </div>
                    </div>

                    <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => {
                          setSelectedPatientForTest(patient);
                          setActiveTab('PRESCRIBE');
                        }}
                        style={{ flex: 1, padding: '0.65rem', backgroundColor: '#6366F1', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <FlaskConical size={16} /> Prescribe Tests
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== TAB 2: PRESCRIBE DIAGNOSTIC TESTS & CUSTOM PRICING ===================== */}
          {activeTab === 'PRESCRIBE' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A' }}>Prescribe Pathology Tests for Patient</h2>
                <p style={{ color: '#64748B', fontSize: '0.88rem' }}>
                  Select patient, pick tests from Master Lab Catalog, enter your customized price to charge the patient, and submit to Super Admin Central Lab.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'start' }}>
                
                {/* Left: Test Selector & Custom Price Matrix */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '1.75rem' }}>
                  
                  {/* Selected Patient Selector */}
                  <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '14px', border: '1.5px solid #E2E8F0' }}>
                    <label style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '800', display: 'block', marginBottom: '0.4rem' }}>
                      SELECT PATIENT
                    </label>
                    <select
                      value={selectedPatientForTest?.id || ''}
                      onChange={(e) => {
                        const pat = patients.find(p => p.id === e.target.value);
                        setSelectedPatientForTest(pat);
                      }}
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.92rem', fontWeight: '700', outline: 'none' }}
                    >
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.age}y, {p.gender}) - {p.phone}
                        </option>
                      ))}
                    </select>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A', marginBottom: '1rem' }}>
                    Select Tests & Enter Custom Patient Price
                  </h3>

                  {/* Multi-Test Selector List */}
                  <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', paddingRight: '0.4rem' }} className="custom-scrollbar">
                    {THYROCARE_TESTS.slice(0, 15).map(test => {
                      const isSelected = prescribedTestIds.includes(test.id);
                      const currentCustomPrice = doctorCustomPrices[test.id] !== undefined ? doctorCustomPrices[test.id] : test.thyrocarePrice;
                      return (
                        <div
                          key={test.id}
                          style={{
                            padding: '1rem',
                            borderRadius: '12px',
                            backgroundColor: isSelected ? '#EEF2FF' : '#F8FAFC',
                            border: isSelected ? '2px solid #6366F1' : '1px solid #E2E8F0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '1rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setPrescribedTestIds([...prescribedTestIds, test.id]);
                                  if (!doctorCustomPrices[test.id]) {
                                    setDoctorCustomPrices({ ...doctorCustomPrices, [test.id]: test.thyrocarePrice });
                                  }
                                } else {
                                  setPrescribedTestIds(prescribedTestIds.filter(id => id !== test.id));
                                }
                              }}
                              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <div>
                              <strong style={{ color: '#0F172A', fontSize: '0.92rem' }}>{test.name}</strong>
                              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                                Lab Cost: <span style={{ color: '#B45309', fontWeight: '800' }}>₹{test.thyrocarePrice}</span> • Market MRP: <span style={{ textDecoration: 'line-through' }}>₹{test.originalPrice}</span>
                              </div>
                            </div>
                          </div>

                          {/* Doctor Custom Price Input */}
                          {isSelected && (
                            <div style={{ textAlign: 'right' }}>
                              <label style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '800', display: 'block' }}>YOUR PRICE TO PATIENT (₹)</label>
                              <input
                                type="number"
                                value={currentCustomPrice}
                                onChange={(e) => {
                                  setDoctorCustomPrices({
                                    ...doctorCustomPrices,
                                    [test.id]: Number(e.target.value)
                                  });
                                }}
                                style={{ width: '100px', padding: '0.4rem 0.6rem', borderRadius: '8px', border: '1.5px solid #6366F1', fontWeight: '900', color: '#4338CA', fontSize: '0.95rem', textAlign: 'right', outline: 'none' }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Patient App Access Permission Toggle */}
                  <div style={{ padding: '1rem 1.25rem', backgroundColor: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                      <strong style={{ fontSize: '0.92rem', color: '#0F172A', display: 'block' }}>
                        Allow Patient App Login & Direct Report Access
                      </strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                        Patient will be sent an SMS/WhatsApp invite to view this order and download reports in their app.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={allowPatientAppLogin}
                      onChange={(e) => setAllowPatientAppLogin(e.target.checked)}
                      style={{ width: '22px', height: '22px', cursor: 'pointer', accentColor: '#6366F1' }}
                    />
                  </div>

                  <button
                    onClick={handleSubmitDoctorOrder}
                    disabled={prescribedTestIds.length === 0}
                    style={{ width: '100%', padding: '0.95rem', background: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)', color: '#FFF', border: 'none', borderRadius: '14px', fontWeight: '900', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}
                  >
                    Submit Order to Central Lab & Pay Lab Cost (₹{totalLabBaseCost})
                  </button>
                </div>

                {/* Right: Financial & Order Summary Card */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '2px solid #6366F1', padding: '1.75rem', position: 'sticky', top: '90px' }}>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#EDE9FE', color: '#6D28D9', padding: '0.2rem 0.55rem', borderRadius: '4px', fontWeight: '900' }}>
                    DOCTOR ORDER SUMMARY
                  </span>

                  <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0F172A', margin: '0.6rem 0 0.2rem' }}>
                    Patient: {selectedPatientForTest?.name}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '1.25rem' }}>
                    📍 Sample Collection: {selectedPatientForTest?.address}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '12px', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                      <span style={{ color: '#64748B' }}>Total Lab Base Cost (You Pay Lab):</span>
                      <strong style={{ color: '#B45309' }}>₹{totalLabBaseCost}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                      <span style={{ color: '#64748B' }}>Public Market MRP:</span>
                      <strong style={{ color: '#94A3B8', textDecoration: 'line-through' }}>₹{totalStandardMRP}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '900', color: '#4338CA', paddingTop: '0.5rem', borderTop: '1px dashed #CBD5E1' }}>
                      <span>Your Custom Patient Price:</span>
                      <span>₹{totalDoctorCustomPrice}</span>
                    </div>
                  </div>

                  <div style={{ padding: '0.85rem', backgroundColor: '#D1FAE5', border: '1px solid #10B981', borderRadius: '12px', textAlign: 'center', marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#065F46', fontWeight: '800' }}>
                      Your Doctor Clinic Margin: ₹{totalDoctorMargin}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                    <strong>Selected Prescriptions ({selectedTestsObj.length}):</strong>
                    <ul style={{ paddingLeft: '1.2rem', marginTop: '0.35rem', lineHeight: 1.5 }}>
                      {selectedTestsObj.map(t => (
                        <li key={t.id}>{t.name} (Custom: ₹{doctorCustomPrices[t.id] || t.thyrocarePrice})</li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ===================== TAB 3: PATIENT DIAGNOSTIC REPORTS & ORDERS ===================== */}
          {activeTab === 'REPORTS' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A' }}>Prescribed Orders & Diagnostic Reports</h2>
                <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Live processing status from Super Admin Central Lab with instant Google Drive report preview.</p>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                      <th style={{ padding: '1rem 1.25rem' }}>ORDER ID / DATE</th>
                      <th style={{ padding: '1rem' }}>PATIENT NAME</th>
                      <th style={{ padding: '1rem' }}>TESTS PRESCRIBED</th>
                      <th style={{ padding: '1rem' }}>LAB COST (PAID)</th>
                      <th style={{ padding: '1rem' }}>PATIENT PRICE</th>
                      <th style={{ padding: '1rem' }}>SAMPLE STATUS</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>REPORT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctorOrders.map(order => (
                      <tr key={order.orderId} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <strong style={{ color: '#4338CA' }}>{order.orderId}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{order.date}</div>
                        </td>
                        <td style={{ padding: '1rem', fontWeight: '800', color: '#0F172A' }}>
                          {order.patientName}
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{order.phone}</div>
                        </td>
                        <td style={{ padding: '1rem', color: '#334155' }}>
                          {order.tests.join(', ')}
                        </td>
                        <td style={{ padding: '1rem', color: '#B45309', fontWeight: '800' }}>
                          ₹{order.labCostToDoc}
                        </td>
                        <td style={{ padding: '1rem', color: '#006B70', fontWeight: '900' }}>
                          ₹{order.doctorPriceToPatient}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>
                            {order.sampleStatus}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          <a
                            href={order.reportDriveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ padding: '0.45rem 0.85rem', backgroundColor: '#006B70', color: '#FFF', borderRadius: '8px', textDecoration: 'none', fontSize: '0.78rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            View Report <ExternalLink size={13} />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================== TAB 4: OPD CLINIC QUEUE ===================== */}
          {activeTab === 'OPD_QUEUE' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A' }}>In-Clinic OPD Consultation Queue</h2>
                <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Live walk-in token queue for MedMarg Care Clinic, Air Bypass Road, Tirupati.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {[
                  { token: '#1', patient: 'Rahul Sharma', status: 'IN_CONSULTATION', reason: 'HbA1c & Fasting Glucose Follow-up', time: '4:30 PM' },
                  { token: '#2', patient: 'K. Srinivasa Rao', status: 'WAITING', reason: 'Lipid & Cardiac Risk Assessment', time: '4:45 PM' },
                  { token: '#3', patient: 'Venkatamma G.', status: 'WAITING', reason: 'Thyroid Hypo Management', time: '5:00 PM' }
                ].map(tok => (
                  <div key={tok.token} style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#EDE9FE', color: '#6D28D9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.1rem' }}>
                        {tok.token}
                      </div>
                      <div>
                        <strong style={{ fontSize: '1.05rem', color: '#0F172A' }}>{tok.patient}</strong>
                        <div style={{ fontSize: '0.82rem', color: '#64748B' }}>{tok.reason} • Scheduled for {tok.time}</div>
                      </div>
                    </div>

                    <span style={{ fontSize: '0.75rem', backgroundColor: tok.status === 'IN_CONSULTATION' ? '#D1FAE5' : '#F1F5F9', color: tok.status === 'IN_CONSULTATION' ? '#065F46' : '#64748B', padding: '0.3rem 0.7rem', borderRadius: '6px', fontWeight: '800' }}>
                      {tok.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== TAB 5: EARNINGS & SETTLEMENTS ===================== */}
          {activeTab === 'EARNINGS' && (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '2.5rem', textAlign: 'center' }}>
              <CreditCard size={48} color="#6366F1" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A' }}>Doctor Clinic Earnings Ledger</h3>
              <p style={{ color: '#64748B', fontSize: '0.9rem', maxWidth: '500px', margin: '0.5rem auto 1.5rem' }}>
                Your markup margins and consultation fees are automatically settled to your registered bank account weekly.
              </p>
              <div style={{ display: 'inline-flex', gap: '2rem', padding: '1rem 2rem', backgroundColor: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Total Tests Commission</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#10B981' }}>₹14,850</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>OPD Consultation Revenue</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#4338CA' }}>₹24,500</div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL: ADD NEW CLINIC PATIENT */}
      {showAddPatientModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 150, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', maxWidth: '520px', width: '100%', padding: '2rem', border: '2px solid #6366F1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0F172A' }}>Add Patient to Clinic Registry</h3>
              <button onClick={() => setShowAddPatientModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSavePatient} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155' }}>Patient Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Reddy"
                  value={newPatientForm.name}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.9rem', marginTop: '0.2rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155' }}>Age</label>
                  <input
                    type="number"
                    placeholder="45"
                    value={newPatientForm.age}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, age: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.9rem', marginTop: '0.2rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155' }}>Gender</label>
                  <select
                    value={newPatientForm.gender}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, gender: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.9rem', marginTop: '0.2rem' }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155' }}>Mobile Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 00000"
                  value={newPatientForm.phone}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, phone: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.9rem', marginTop: '0.2rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155' }}>Home Sample Collection Address in Tirupati</label>
                <input
                  type="text"
                  placeholder="Plot / Street / Area, Tirupati, AP"
                  value={newPatientForm.address}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, address: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.9rem', marginTop: '0.2rem' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <input
                  type="checkbox"
                  checked={newPatientForm.appAccessGranted}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, appAccessGranted: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '600' }}>
                  Send invite and enable patient mobile app login access
                </span>
              </div>

              <button
                type="submit"
                style={{ padding: '0.85rem', backgroundColor: '#6366F1', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', marginTop: '0.5rem' }}
              >
                Save Patient to Registry
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ORDER CONFIRMED SUCCESS */}
      {orderSuccessModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 150, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', maxWidth: '520px', width: '100%', padding: '2.5rem 2rem', textAlign: 'center', border: '2px solid #10B981' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#D1FAE5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A' }}>
              Order Submitted to Central Lab!
            </h2>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#6366F1', margin: '0.35rem 0' }}>
              Order ID: {orderSuccessModal.orderId}
            </div>

            <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '0.75rem 0 1.5rem', lineHeight: 1.5 }}>
              Lab cost of <strong>₹{orderSuccessModal.labCostToDoc}</strong> has been debited. Phlebotomist will collect samples from <strong>{orderSuccessModal.patientName}</strong> in Tirupati. Reports will sync directly to you and the patient's app!
            </p>

            <button
              onClick={() => {
                setOrderSuccessModal(null);
                setActiveTab('REPORTS');
              }}
              style={{ padding: '0.85rem 1.8rem', backgroundColor: '#6366F1', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}
            >
              View Order Tracking
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
