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
  Activity
} from 'lucide-react';
import { THYROCARE_CATEGORIES, THYROCARE_TESTS } from '../data/thyrocareTests';

export default function PatientDashboard({ user, onSwitchRole, onLogout }) {
  const [activeTab, setActiveTab] = useState('TESTS'); // 'TESTS' | 'SCANS' | 'DOCTORS' | 'PHARMACY' | 'ABHA' | 'ORDERS'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Tests & Packages');
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
  const [activeOrder, setActiveOrder] = useState({
    id: 'MM-LAB-9842',
    date: '31 Aug 2026',
    slot: '07:30 AM - 08:30 AM',
    address: 'Plot 42, Air Bypass Road, Tirupati, AP',
    phleboName: 'Ramesh Kumar (Certified Phlebotomist)',
    phleboPhone: '+91 98765 11223',
    status: 'ASSIGNED', // 'CONFIRMED' | 'ASSIGNED' | 'COLLECTED' | 'PROCESSING' | 'COMPLETED'
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. TOP BRAND NAVIGATION BAR */}
      <nav style={{ backgroundColor: '#004D40', color: '#FFF', padding: '0.65rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          
          {/* Official Logo Container */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '4px 10px', borderRadius: '10px', display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setActiveTab('TESTS')}>
            <img 
              src="/logo.png" 
              alt="MedMarg" 
              style={{ height: '34px', objectFit: 'contain' }} 
            />
          </div>

          {/* Location Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(255,255,255,0.12)', padding: '0.4rem 0.85rem', borderRadius: '20px', fontSize: '0.82rem' }}>
            <MapPin size={15} color="#FBBF24" />
            <span style={{ color: '#E0F2F1' }}>Location:</span>
            <strong style={{ color: '#FFF' }}>Tirupati, Andhra Pradesh</strong>
          </div>
        </div>

        {/* User Role & Cart Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          
          {/* Cart Button */}
          <button
            onClick={() => setShowCheckoutModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#F59E0B', color: '#FFF', padding: '0.5rem 1rem', borderRadius: '12px', border: 'none', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(245,158,11,0.3)' }}
          >
            <ShoppingBag size={18} />
            <span>Cart ({cart.length})</span>
            {cart.length > 0 && <span style={{ backgroundColor: '#B45309', padding: '0.1rem 0.4rem', borderRadius: '6px', fontSize: '0.8rem' }}>₹{cartTotal}</span>}
          </button>

          <div style={{ fontSize: '0.85rem', color: '#E0F2F1' }}>
            Logged in as: <strong>{user?.name || 'Rahul Sharma'}</strong> ({user?.role || 'PATIENT'})
          </div>

          <button 
            onClick={onSwitchRole}
            style={{ padding: '0.4rem 0.8rem', backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFF', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: '700' }}
          >
            Switch Role
          </button>

          <button 
            onClick={onLogout}
            style={{ padding: '0.4rem 0.8rem', backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: '700' }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* 2. CUSTOMER SERVICES SUB-NAVIGATION */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1.5px solid #E2E8F0', padding: '0 2rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', gap: '2rem' }}>
          {[
            { key: 'TESTS', label: 'Multi-Lab Tests (Thyrocare)', icon: FlaskConical, count: '100+ Tests' },
            { key: 'SCANS', label: '3.0T MRI & Scans', icon: Building2, count: 'Hourly Slots' },
            { key: 'DOCTORS', label: 'In-Clinic Doctors', icon: Stethoscope, count: 'OPD Verified' },
            { key: 'PHARMACY', label: 'Generic Pharmacy (70% Off)', icon: Pill, count: 'OCR Scanner' },
            { key: 'ABHA', label: 'ABHA Health Locker & Trends', icon: FolderHeart, count: 'Drive Sync' },
            { key: 'ORDERS', label: 'My Bookings & Sample Track', icon: Activity, count: 'Live Track' }
          ].map(tab => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem 0.2rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? '3px solid #006B70' : '3px solid transparent',
                  color: isActive ? '#006B70' : '#64748B',
                  fontWeight: isActive ? '800' : '600',
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <IconComp size={18} color={isActive ? '#006B70' : '#94A3B8'} />
                <span>{tab.label}</span>
                <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '6px', backgroundColor: isActive ? '#E0F2F1' : '#F1F5F9', color: isActive ? '#006B70' : '#64748B', fontWeight: '700' }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN DASHBOARD CONTENT BY ACTIVE TAB */}
      <main style={{ flex: 1, maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '2rem 1.5rem' }}>
        
        {/* ===================== TAB 1: MULTI-LAB TESTS ===================== */}
        {activeTab === 'TESTS' && (
          <div>
            {/* Header + Search Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0F172A' }}>
                  Diagnostic Pathology Tests & Health Packages
                </h1>
                <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                  Compare rates across Thyrocare, Apollo Diagnostics, and Dr. Lal PathLabs in Tirupati.
                </p>
              </div>

              {/* Search Box */}
              <div style={{ position: 'relative', minWidth: '320px' }}>
                <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="text"
                  placeholder="Search tests (Aarogyam, Lipid, Thyroid, HbA1c)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.4rem', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
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
                          Free Home Sample
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
                        {isInCart ? (
                          <>
                            <Check size={16} /> Added to Cart
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={16} /> Add to Cart (₹{test.thyrocarePrice})
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===================== TAB 2: 3.0T MRI & SCANS ===================== */}
        {activeTab === 'SCANS' && (
          <div>
            <div style={{ marginBottom: '1.75rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0F172A' }}>
                Radiology & 3.0T Silent MRI Scans
              </h1>
              <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                Confirmed slot booking with certified imaging centers in Tirupati & partner network.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {[
                { name: 'MRI Brain (Plain + Angio)', center: 'Aarthi Scans & Labs (Tirupati Center)', spec: 'Siemens 3.0 Tesla Silent MRI', price: 3499, mrp: 6000, prep: '4h Fasting • No metallic objects', slots: ['Today 5:00 PM', 'Tomorrow 10:00 AM'] },
                { name: 'HRCT Chest (Low Radiation)', center: 'Focus Imaging Diagnostics', spec: '128-Slice Low Dose CT', price: 2499, mrp: 4500, prep: 'No Fasting • Creatinine report required for contrast', slots: ['Today 6:30 PM', 'Tomorrow 11:30 AM'] },
                { name: 'USG Whole Abdomen & Pelvis', center: 'Medall Diagnostics', spec: '4D Color Doppler Ultrasound', price: 1199, mrp: 2000, prep: 'Full Bladder • 6h Fasting', slots: ['Tomorrow 9:00 AM', 'Tomorrow 3:00 PM'] }
              ].map((scan, idx) => (
                <div key={idx} style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} className="card-interactive">
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', backgroundColor: '#CFFAFE', color: '#0891B2', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '800' }}>
                        RADIOLOGY SCAN
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#06B6D4', fontWeight: '700' }}>{scan.spec}</span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', marginTop: '0.5rem' }}>{scan.name}</h3>
                    <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.25rem' }}>{scan.center}</div>

                    <div style={{ fontSize: '0.8rem', color: '#475569', backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '10px', margin: '0.85rem 0', border: '1px solid #F1F5F9' }}>
                      <strong>Pre-Scan Protocol:</strong> {scan.prep}
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
                      onClick={() => alert(`Appointment Slot booked for ${scan.name} at ${scan.center} (${scan.slots[0]}). Appointment Pass sent to your WhatsApp!`)}
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

        {/* ===================== TAB 3: IN-CLINIC DOCTORS ===================== */}
        {activeTab === 'DOCTORS' && (
          <div>
            <div style={{ marginBottom: '1.75rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0F172A' }}>
                In-Clinic OPD Doctor Appointments
              </h1>
              <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                Book walk-in clinic consultation tokens with verified specialists (No video consultation).
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
              {[
                { name: 'Dr. Ananya Sharma', specialty: 'General Physician & Diabetologist', qual: 'MBBS, MD (Internal Medicine)', clinic: 'MedMarg Care Clinic, Air Bypass Road, Tirupati', fee: 499, exp: '14 yrs exp', slot: 'Today, 4:30 PM (Token #4)' },
                { name: 'Dr. Rajeshwar Rao', specialty: 'Cardiologist', qual: 'MBBS, MD, DM (Cardiology)', clinic: 'Heart Wellness Institute, SVIMS Road, Tirupati', fee: 800, exp: '22 yrs exp', slot: 'Tomorrow, 10:00 AM (Token #2)' },
                { name: 'Dr. Priya Deshmukh', specialty: 'Dermatologist & Trichologist', qual: 'MBBS, DVD, MD', clinic: 'Skin & Laser Clinic, Tiruchanoor Road, Tirupati', fee: 600, exp: '9 yrs exp', slot: 'Today, 5:30 PM (Token #7)' }
              ].map((doc, idx) => (
                <div key={idx} style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem' }} className="card-interactive">
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
                      onClick={() => alert(`In-Clinic OPD Appointment confirmed for ${doc.name} at ${doc.clinic}! ${doc.slot}. Please arrive 10 minutes prior.`)}
                      style={{ padding: '0.7rem 1.3rem', backgroundColor: '#8B5CF6', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer' }}
                    >
                      Book OPD Visit ({doc.slot.split('(')[0]})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== TAB 4: GENERIC PHARMACY ===================== */}
        {activeTab === 'PHARMACY' && (
          <div>
            <div style={{ marginBottom: '1.75rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#065F46' }}>
                Generic Pharmacy & 70% Prescription Cost-Saver
              </h1>
              <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                Upload prescription to automatically substitute branded medications with exact generic equivalents.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
              
              {/* Left Column: Prescription Uploader */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '2px dashed #10B981', padding: '2.5rem 2rem', textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#D1FAE5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <UploadCloud size={30} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A' }}>Upload Doctor's Prescription</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.4rem 0 1.5rem' }}>
                  Supports PDF, JPG, PNG or direct camera scan. Synced directly with Google Drive.
                </p>

                <button
                  onClick={() => setPrescriptionUploaded(true)}
                  style={{ padding: '0.8rem 1.6rem', backgroundColor: '#10B981', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '0.92rem', cursor: 'pointer' }}
                >
                  {prescriptionUploaded ? '✓ Prescription Analyzed (rx_tirupati.pdf)' : 'Select Prescription File'}
                </button>
              </div>

              {/* Right Column: OCR Auto-Substitution */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A', marginBottom: '1rem' }}>
                  {prescriptionUploaded ? 'Prescription OCR Results & Cost Comparison' : 'Sample Prescription Cost-Saver Preview'}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Branded Item */}
                  <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800' }}>PRESCRIBED BRANDED MEDICINE</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                      <div>
                        <strong>Lipaglyn 4mg Tablet (10 Tablets)</strong>
                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Active Salt: Saroglitazar 4mg</div>
                      </div>
                      <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#64748B' }}>₹289</span>
                    </div>
                  </div>

                  {/* Generic Substitution */}
                  <div style={{ padding: '1.25rem', backgroundColor: '#D1FAE5', borderRadius: '12px', border: '2px solid #10B981' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', backgroundColor: '#F59E0B', color: '#FFF', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '900' }}>
                        SAVE 53% WITH GENERIC
                      </span>
                      <span style={{ fontSize: '1.45rem', fontWeight: '900', color: '#065F46' }}>₹135</span>
                    </div>
                    <div style={{ marginTop: '0.4rem' }}>
                      <strong style={{ color: '#065F46' }}>Saroglitazar 4mg (MedMarg Generic Formulation)</strong>
                      <div style={{ fontSize: '0.8rem', color: '#047857' }}>100% CDSCO Approved • Identical Bioequivalence</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setGenericSwitched(true);
                      alert('Generic medicine added to cart! Saved ₹154 instantly. 2-Hour Doorstep Delivery active in Tirupati.');
                    }}
                    style={{ padding: '0.85rem', backgroundColor: '#065F46', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer' }}
                  >
                    {genericSwitched ? '✓ Generic Salt Added to Pharmacy Cart' : 'Switch to Generic & Order for ₹135'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ===================== TAB 5: ABHA HEALTH LOCKER & DRIVE ===================== */}
        {activeTab === 'ABHA' && (
          <div>
            <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0F172A' }}>
                  ABHA Digital Health Locker & Biomarker Trends
                </h1>
                <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                  All pathology lab reports & scans are securely unified under your Ayushman Bharat Digital ID with Google Drive shareable links.
                </p>
              </div>

              <div style={{ backgroundColor: '#0F172A', color: '#FFF', padding: '0.6rem 1rem', borderRadius: '12px', fontSize: '0.85rem' }}>
                <span style={{ color: '#94A3B8' }}>ABHA Address: </span>
                <strong style={{ color: '#FBBF24' }}>rahul.sharma@abdm</strong>
              </div>
            </div>

            {/* Historical Biomarker Analytics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              {[
                { title: 'HbA1c (Diabetes)', latest: '6.1%', prev: '6.8%', trend: 'Improving (-0.7%)', status: 'Optimal (<6.5%)', color: '#10B981' },
                { title: 'Total Cholesterol', latest: '185 mg/dL', prev: '210 mg/dL', trend: 'Improving (-25 mg/dL)', status: 'Desirable (<200)', color: '#10B981' },
                { title: 'Vitamin D3 (25-OH)', latest: '38 ng/mL', prev: '18 ng/mL', trend: 'Restored (+20 ng/mL)', status: 'Sufficient (30-100)', color: '#06B6D4' }
              ].map((bio, idx) => (
                <div key={idx} style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.4rem' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700' }}>{bio.title}</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.4rem 0' }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0F172A' }}>{bio.latest}</span>
                    <span style={{ fontSize: '0.8rem', color: bio.color, fontWeight: '800' }}>{bio.trend}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    Target: <strong>{bio.status}</strong>
                  </div>
                </div>
              ))}
            </div>

            {/* Google Drive Synced Reports Table */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A', marginBottom: '1rem' }}>
                Synced Diagnostic Reports (Google Drive PDF Links)
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { title: 'Thyrocare Aarogyam 1.3 Full Body Report (104 Tests)', date: '15 Aug 2026', lab: 'Thyrocare Central Processing Lab', driveLink: 'https://drive.google.com/file/d/1A2B3C4D_MedMarg_SampleReport_Aarogyam/view?usp=sharing' },
                  { title: 'Siemens 3.0T MRI Brain Scan DICOM & PDF', date: '02 Jul 2026', lab: 'Aarthi Scans & Labs', driveLink: 'https://drive.google.com/file/d/1X9Y8Z7W_MedMarg_MRI_Brain_Scan/view?usp=sharing' },
                  { title: 'Lipid Profile & HbA1c Quarterly Follow-up', date: '18 May 2026', lab: 'Apollo Diagnostics Indiranagar', driveLink: 'https://drive.google.com/file/d/1L5P6Q7R_MedMarg_Lipid_HbA1c/view?usp=sharing' }
                ].map((rep, idx) => (
                  <div key={idx} style={{ padding: '1rem 1.25rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>{rep.title}</strong>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>
                        {rep.lab} • Tested on {rep.date}
                      </div>
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

        {/* ===================== TAB 6: MY BOOKINGS & LIVE TRACKING ===================== */}
        {activeTab === 'ORDERS' && (
          <div>
            <div style={{ marginBottom: '1.75rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0F172A' }}>
                My Diagnostic Bookings & Real-Time Sample Tracking
              </h1>
              <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                Real-time phlebotomist sample collection tracking and processing timeline.
              </p>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>BOOKING ID</span>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#006B70' }}>{activeOrder.id}</h3>
                  <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.2rem' }}>
                    Scheduled Date: <strong>{activeOrder.date}</strong> ({activeOrder.slot})
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.25rem 0.65rem', borderRadius: '6px', fontWeight: '900' }}>
                    PHLEBOTOMIST ASSIGNED
                  </span>
                  <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0F172A', marginTop: '0.3rem' }}>
                    ₹{activeOrder.totalAmount}
                  </div>
                </div>
              </div>

              {/* Real-time Stepper */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem', textAlign: 'center' }}>
                {[
                  { title: 'Booking Confirmed', desc: '30 Aug, 6:00 PM', done: true },
                  { title: 'Phlebotomist Assigned', desc: 'Ramesh Kumar', done: true },
                  { title: 'On the Way (Tirupati)', desc: 'Tomorrow 7:30 AM', current: true },
                  { title: 'Sample Collected', desc: 'Cold Chain Stored', done: false },
                  { title: 'Report Ready (Drive)', desc: 'In 12 Hours', done: false }
                ].map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: step.done ? '#10B981' : step.current ? '#F59E0B' : '#E2E8F0',
                      color: '#FFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '0.9rem',
                      marginBottom: '0.5rem'
                    }}>
                      {step.done ? '✓' : idx + 1}
                    </div>
                    <strong style={{ fontSize: '0.82rem', color: '#0F172A' }}>{step.title}</strong>
                    <span style={{ fontSize: '0.72rem', color: '#64748B' }}>{step.desc}</span>
                  </div>
                ))}
              </div>

              {/* Phlebotomist Details Card */}
              <div style={{ backgroundColor: '#FFFBEB', borderRadius: '14px', border: '1.5px solid #FDE68A', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: '#B45309', fontSize: '1rem' }}>{activeOrder.phleboName}</strong>
                  <div style={{ fontSize: '0.82rem', color: '#92400E', marginTop: '0.2rem' }}>
                    📍 Sample Collection Address: {activeOrder.address}
                  </div>
                </div>

                <a
                  href={`tel:${activeOrder.phleboPhone}`}
                  style={{ padding: '0.6rem 1.1rem', backgroundColor: '#B45309', color: '#FFF', borderRadius: '8px', textDecoration: 'none', fontWeight: '800', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Phone size={15} /> Call Phlebotomist
                </a>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 4. CHECKOUT MODAL (MULTI-LAB CART) */}
      {showCheckoutModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 120, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', maxWidth: '650px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)', border: '2px solid #E2E8F0' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A' }}>
                Confirm Home Sample Collection
              </h2>
              <button onClick={() => setShowCheckoutModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748B' }}>✕</button>
            </div>

            {cart.length > 0 ? (
              <form onSubmit={handleCompleteBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Selected Tests in Cart */}
                <div style={{ backgroundColor: '#F8FAFC', borderRadius: '14px', padding: '1rem', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Selected Tests & Packages ({cart.length})
                  </div>
                  {cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid #F1F5F9' }}>
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>{item.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{item.lab} • {item.fasting}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontWeight: '800', color: '#B45309' }}>₹{item.price}</span>
                        <button type="button" onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Patient Information */}
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.5rem' }}>
                    Patient & Address Information
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '0.6rem', marginBottom: '0.6rem' }}>
                    <input
                      type="text"
                      placeholder="Patient Full Name"
                      value={patientForm.name}
                      onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                      required
                      style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                    />
                    <input
                      type="number"
                      placeholder="Age"
                      value={patientForm.age}
                      onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
                      required
                      style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                    />
                    <select
                      value={patientForm.gender}
                      onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                      style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <input
                    type="text"
                    placeholder="Home Sample Collection Address in Tirupati"
                    value={patientForm.address}
                    onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                  />
                </div>

                {/* Date & Slot Picker */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '0.6rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B' }}>Sample Collection Date</span>
                    <input
                      type="text"
                      value={patientForm.date}
                      onChange={(e) => setPatientForm({ ...patientForm, date: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem', marginTop: '0.2rem' }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B' }}>Preferred Fasting Slot</span>
                    <select
                      value={patientForm.slot}
                      onChange={(e) => setPatientForm({ ...patientForm, slot: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem', marginTop: '0.2rem' }}
                    >
                      <option value="06:30 AM - 07:30 AM (Early Fasting)">06:30 AM - 07:30 AM (Early Fasting)</option>
                      <option value="07:30 AM - 08:30 AM (Morning Fasting)">07:30 AM - 08:30 AM (Morning Fasting)</option>
                      <option value="08:30 AM - 09:30 AM (Standard Fasting)">08:30 AM - 09:30 AM (Standard Fasting)</option>
                      <option value="09:30 AM - 10:30 AM">09:30 AM - 10:30 AM</option>
                    </select>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div style={{ backgroundColor: '#FEF3C7', padding: '1rem', borderRadius: '12px', border: '1.5px solid #F59E0B' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#92400E' }}>
                    <span>Home Sample Collection Fee</span>
                    <strong style={{ color: '#10B981' }}>FREE (₹0)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#92400E', marginTop: '0.25rem' }}>
                    <span>Total Discount Saved</span>
                    <strong>₹{cartSavings}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '900', color: '#B45309', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed #F59E0B' }}>
                    <span>To Pay</span>
                    <span>₹{cartTotal}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  style={{ padding: '0.95rem', background: 'linear-gradient(135deg, #006B70 0%, #004D40 100%)', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,107,112,0.3)' }}
                >
                  Confirm & Schedule Phlebotomist (₹{cartTotal})
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <p style={{ fontWeight: '700', color: '#64748B' }}>Your cart is empty.</p>
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  style={{ marginTop: '1rem', padding: '0.6rem 1.2rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Browse Tests
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 5. BOOKING SUCCESS CONFIRMATION MODAL */}
      {showBookingSuccess && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 130, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', maxWidth: '520px', width: '100%', padding: '2.5rem 2rem', textAlign: 'center', boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)', border: '2px solid #10B981' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#D1FAE5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <CheckCircle2 size={36} />
            </div>
            
            <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0F172A' }}>
              Booking Confirmed!
            </h2>
            
            <p style={{ color: '#047857', fontWeight: '700', marginTop: '0.25rem' }}>
              Booking ID: MM-LAB-9842
            </p>
            
            <p style={{ fontSize: '0.88rem', color: '#64748B', margin: '1rem 0 1.5rem', lineHeight: 1.5 }}>
              Your Phlebotomist (Ramesh Kumar) has been assigned for <strong>Tomorrow morning ({patientForm.slot.split('(')[0]})</strong> at your address in Tirupati.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  setShowBookingSuccess(false);
                  setActiveTab('ORDERS');
                }}
                style={{ flex: 1, padding: '0.85rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '0.92rem', cursor: 'pointer' }}
              >
                Track Sample Collection
              </button>
              <button
                onClick={() => setShowBookingSuccess(false)}
                style={{ padding: '0.85rem 1.2rem', backgroundColor: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '0.92rem', cursor: 'pointer' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
