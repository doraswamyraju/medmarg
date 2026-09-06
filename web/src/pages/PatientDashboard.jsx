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
  Filter,
  Bell,
  MessageCircle,
  PhoneCall,
  Heart,
  Zap,
  Users,
  Smile,
  Thermometer,
  ShieldCheck,
  X,
  Info
} from 'lucide-react';
import initialCatalog from '../data/catalogData.json';
import { getCatalogState, filterCatalogItems } from '../data/catalogStore';
import { API_BASE } from '../data/apiConfig';

export default function PatientDashboard({ user, onSwitchRole, onLogout }) {
  // 5 CORE NAVIGATION TABS: HOME, TESTS (Labs & Tests), TRACK, REPORTS, PROFILE
  const [activeTab, setActiveTab] = useState('HOME');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogSubTab, setCatalogSubTab] = useState('ALL'); // 'ALL' | 'PACKAGES' | 'PROFILES' | 'TESTS'
  const [fastingFilter, setFastingFilter] = useState('ALL');
  const [sampleFilter, setSampleFilter] = useState('ALL');
  
  // Master Catalog
  const [catalog, setCatalog] = useState(getCatalogState() || initialCatalog);

  // Selected Detail Item for Modal with Connected Packages & Savings
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);

  // Notification Center State
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState('ALL');
  const [notifications, setNotifications] = useState([
    { id: 'n1', title: 'Home Sample Collector Assigned', message: 'Phlebotomist Ramesh Kumar is enroute to Plot 42, Air Bypass Road, Tirupati.', time: '12 mins ago', category: 'ORDERS', unread: true, icon: 'location' },
    { id: 'n2', title: 'Thyrocare NABL Sync Completed', message: '104 test parameters & B2B rates updated across Tirupati processing hub.', time: '45 mins ago', category: 'SYNC', unread: true, icon: 'check' },
    { id: 'n3', title: 'Master Health Report Ready', message: 'Your comprehensive lab report PDF (REP-8821) is uploaded to Google Drive.', time: '2 hours ago', category: 'REPORTS', unread: false, icon: 'doc' },
    { id: 'n4', title: 'Doctor E-Prescription Active', message: 'Dr. Ananya Sharma prescribed Thyroid Profile & Lipid Comprehensive for follow-up.', time: '1 day ago', category: 'ACCESS', unread: false, icon: 'doctor' }
  ]);

  // Cart State
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

  // Active Order Live Tracking
  const [activeOrder, setActiveOrder] = useState({
    id: 'MM-LAB-9842',
    date: '31 Aug 2026',
    slot: '07:30 AM - 08:30 AM',
    address: 'Plot 42, Air Bypass Road, Tirupati, AP',
    phleboName: 'Ramesh Kumar (Certified Phlebotomist)',
    phleboPhone: '+91 98765 11223',
    status: 'ENROUTE',
    eta: '25 Mins',
    tempTelemetry: '4.2°C (Optimal Cold-Chain)',
    items: ['MedMarg Master Health Checkup', 'Thyroid Profile Total (T3/T4/TSH)'],
    totalAmount: 1798
  });

  // Patient checkout form
  const [patientForm, setPatientForm] = useState({
    name: user?.name || 'Rahul Sharma',
    age: '34',
    gender: 'Male',
    phone: user?.phone || user?.identifier || '+91 98765 43210',
    address: 'Plot 42, Air Bypass Road, Tirupati, Andhra Pradesh',
    date: 'Tomorrow (31 Aug 2026)',
    slot: '07:00 AM - 08:00 AM (Morning Fasting)',
    paymentMethod: 'CASH_ON_COLLECTION'
  });

  // Sync catalog from backend
  useEffect(() => {
    fetch(`${API_BASE}/api/v1/catalog/summary`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          Promise.all([
            fetch(`${API_BASE}/api/v1/catalog/packages`).then(r => r.json()),
            fetch(`${API_BASE}/api/v1/catalog/profiles`).then(r => r.json()),
            fetch(`${API_BASE}/api/v1/catalog/tests?limit=1000`).then(r => r.json())
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
    const itemId = item.id || item.code || item.name;
    if (!cart.some(cartItem => cartItem.id === itemId)) {
      setCart([...cart, {
        id: itemId,
        name: item.name || item.title,
        lab: item.lab || 'MedMarg Central Diagnostics',
        price: item.price || 499,
        mrp: item.mrp || (item.price ? Math.round(item.price * 1.6) : 999),
        params: item.testCount || item.params || 1,
        fasting: item.fasting || 'NO',
        sampleType: item.sampleType || item.sampleTypes?.join(', ') || 'SERUM'
      }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);
  const cartMrpTotal = cart.reduce((sum, item) => sum + (item.mrp || item.price * 1.5), 0);
  const cartSavings = Math.max(0, cartMrpTotal - cartTotal);

  const handleCompleteBooking = (e) => {
    e.preventDefault();
    setShowCheckoutModal(false);
    setShowBookingSuccess(true);
    setCart([]);
  };

  const markAllNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const unreadNotificationCount = notifications.filter(n => n.unread).length;

  // Direct Channels
  const handleOrderWhatsApp = (customText = '') => {
    const defaultMsg = encodeURIComponent(
      `Hello MedMarg, I would like to book a Diagnostic Health Test / Home Sample Collection.\n\nPatient Name: ${user?.name || 'Rahul Sharma'}\nContact: ${user?.phone || user?.identifier || '+91 98765 43210'}\nLocation: Tirupati, AP\n${customText ? `Requested Test: ${customText}` : ''}`
    );
    window.open(`https://wa.me/919876543210?text=${defaultMsg}`, '_blank');
  };

  const handleOrderCall = () => {
    window.open('tel:+919876543210', '_self');
  };

  // Connected Packages Helper
  const getConnectedPackages = (item) => {
    if (!item) return [];
    const pkgs = [
      {
        id: 'pkg_aarogyam_13',
        name: 'Thyrocare Aarogyam Complete 1.3',
        price: 1499,
        mrp: 3500,
        params: 104,
        includes: ['Thyroid Profile Total', 'Lipid Panel', 'Liver Function', 'Kidney Function', 'Vitamin D3 & B12', 'CBC 24 Params'],
        highlight: 'Most Popular Full Body Screen'
      },
      {
        id: 'pkg_mm_master',
        name: 'MedMarg Master Health Checkup (Executive)',
        price: 1799,
        mrp: 4200,
        params: 92,
        includes: ['Cardiac Risk Profile', 'HbA1c & Fasting Glucose', 'Electrolytes Panel', 'Urine Routine Complete', 'Complete Hemogram'],
        highlight: 'Comprehensive Organ Scan'
      }
    ];
    return pkgs;
  };

  // 5 CORE NAVBAR ITEMS
  const navMenuItems = [
    { key: 'HOME', label: 'Home', icon: HomeIcon },
    { key: 'TESTS', label: 'Labs & Tests', icon: FlaskConical, badge: `${catalog.tests?.length || 913}+` },
    { key: 'TRACK', label: 'Track', icon: Activity, badge: 'LIVE' },
    { key: 'REPORTS', label: 'Reports', icon: FolderHeart, badge: 'Drive' },
    { key: 'PROFILE', label: 'Profile', icon: User }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: 'Inter, system-ui, sans-serif', paddingBottom: cart.length > 0 ? '80px' : '0' }}>
      
      {/* 1. PATIENT SIDEBAR */}
      <aside style={{ 
        width: sidebarCollapsed ? '80px' : '270px', 
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
                <span style={{ fontSize: '0.7rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '900', display: 'block', width: 'fit-content' }}>
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

        {/* 5 Core Navigation Items */}
        <nav style={{ flex: 1, padding: '1.25rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: isActive ? '#006B70' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#B2DFDB',
                  fontWeight: isActive ? '800' : '600',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <IconComp size={20} color={isActive ? '#FBBF24' : '#80CBC4'} />
                {!sidebarCollapsed && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem', borderRadius: '6px', backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', color: isActive ? '#FFF' : '#80CBC4', fontWeight: '800' }}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card */}
        <div style={{ padding: '1rem', borderTop: '1px solid #003830' }}>
          {!sidebarCollapsed ? (
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#FFF' }}>{user?.name || 'Rahul Sharma'}</div>
              <div style={{ fontSize: '0.74rem', color: '#80CBC4' }}>{user?.phone || user?.identifier || '+91 98765 43210'}</div>
              <button
                onClick={onLogout}
                style={{ marginTop: '0.75rem', width: '100%', padding: '0.45rem', backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFF', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', fontSize: '0.76rem', fontWeight: '700', cursor: 'pointer' }}
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
      <main style={{ flex: 1, overflowY: 'auto', padding: '1.75rem 2.5rem', maxHeight: '100vh' }} className="custom-scrollbar">
        
        {/* Top Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#006B70', backgroundColor: '#E0F2F1', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: '800' }}>
                📍 Serving in Tirupati, AP
              </span>
              <span style={{ fontSize: '0.75rem', color: '#059669', backgroundColor: '#D1FAE5', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: '800' }}>
                ⚡ 60-Min Phlebotomy Available
              </span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: '900', color: '#0F172A', marginTop: '0.35rem' }}>
              {activeTab === 'HOME' && 'MedMarg Healthcare & Wellness Hub'}
              {activeTab === 'TESTS' && 'Pathology Lab Tests & Health Packages'}
              {activeTab === 'TRACK' && 'Live Sample Tracker & Telemetry'}
              {activeTab === 'REPORTS' && 'Digital Health Locker & Reports'}
              {activeTab === 'PROFILE' && 'Patient Profile & Account Settings'}
            </h1>
          </div>

          {/* Action Buttons: Notifications + Cart */}
          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
            
            {/* Notification Bell Button */}
            <button
              onClick={() => setShowNotificationCenter(true)}
              style={{ position: 'relative', width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1.5px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}
            >
              <Bell size={20} color="#006B70" />
              {unreadNotificationCount > 0 && (
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#EF4444', color: '#FFF', fontSize: '0.68rem', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #FFF' }}>
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Cart Header Button */}
            <button
              onClick={() => setShowCheckoutModal(true)}
              style={{ padding: '0.65rem 1.25rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 4px 12px rgba(0,107,112,0.25)' }}
            >
              <ShoppingBag size={18} color="#FBBF24" />
              <span>Cart ({cart.length}) • ₹{cartTotal}</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: HOME (RICH CATEGORIES & WHATSAPP / CALL ORDERING)                  */}
        {/* ========================================================================= */}
        {activeTab === 'HOME' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* 1. HERO DIRECT ORDER CHANNELS (WhatsApp, Call & Instant Booking) */}
            <div style={{ backgroundColor: '#004D40', borderRadius: '24px', padding: '2rem', color: '#FFFFFF', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'center', boxShadow: '0 12px 30px -10px rgba(0,77,64,0.3)' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '900', marginBottom: '0.75rem' }}>
                  <Sparkles size={14} /> INSTANT DIAGNOSTIC ASSISTANCE
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '900', lineHeight: 1.2 }}>
                  Book Diagnostics or Upload Prescription in 1 Tap
                </h2>
                <p style={{ color: '#80CBC4', fontSize: '0.9rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
                  Get certified phlebotomists at your doorstep within 60 minutes. 100% NABL & CAP accredited testing.
                </p>

                {/* Direct Order Channel Buttons */}
                <div style={{ display: 'flex', gap: '0.85rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleOrderWhatsApp()}
                    style={{ padding: '0.75rem 1.25rem', backgroundColor: '#25D366', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(37,211,102,0.3)' }}
                  >
                    <MessageCircle size={18} /> Order on WhatsApp
                  </button>

                  <button
                    onClick={handleOrderCall}
                    style={{ padding: '0.75rem 1.25rem', backgroundColor: '#0284C7', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <PhoneCall size={18} /> Order via Call
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('TESTS');
                      setCatalogSubTab('PACKAGES');
                    }}
                    style={{ padding: '0.75rem 1.25rem', backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '12px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer' }}
                  >
                    Explore Packages →
                  </button>
                </div>
              </div>

              {/* Promo Package Card (Clickable to Details) */}
              <div 
                onClick={() => setSelectedDetailItem({
                  id: 'pkg_aarogyam_13',
                  name: 'Thyrocare Aarogyam Complete 1.3',
                  itemType: 'PACKAGE',
                  price: 1499,
                  mrp: 3500,
                  params: 104,
                  fasting: 'YES',
                  sampleType: 'SERUM, EDTA, URINE',
                  tatHours: 24,
                  description: 'Comprehensive 104-parameter full body wellness checkup covering Thyroid, Lipid, Liver Enzymes, Kidney Function, Complete Hemogram, Vitamin D3, and Vitamin B12.'
                })}
                style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', padding: '1.5rem', color: '#0F172A', border: '2px solid #F59E0B', cursor: 'pointer', transition: 'transform 0.15s ease' }}
              >
                <span style={{ fontSize: '0.7rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '900' }}>
                  FEATURED FULL BODY PACKAGE • 57% OFF
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginTop: '0.5rem' }}>
                  Thyrocare Aarogyam Complete 1.3
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.3rem' }}>
                  104 Vital Biomarkers • Thyroid, Lipid, Liver, Kidney, Vitamin D & CBC
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid #E2E8F0' }}>
                  <div>
                    <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#006B70' }}>₹1,499</span>
                    <span style={{ fontSize: '0.8rem', color: '#94A3B8', textDecoration: 'line-through', marginLeft: '0.5rem' }}>₹3,500</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart({ id: 'pkg_aarogyam_13', name: 'Thyrocare Aarogyam Complete 1.3 (104 Tests)', price: 1499, mrp: 3500, params: 104, fasting: 'YES', sampleType: 'SERUM, EDTA' });
                    }}
                    style={{ padding: '0.55rem 1rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    + Book Package
                  </button>
                </div>
              </div>
            </div>

            {/* 2. WELLNESS & LIFE-STAGE CATEGORIES (His Wellness, Her Wellness, Family Wellness) */}
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#006B70', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Curated Wellness Plans
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A', marginTop: '0.15rem' }}>
                  Tailored Wellness for You & Your Family
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                
                {/* HIS WELLNESS */}
                <div 
                  onClick={() => setSelectedDetailItem({
                    id: 'pkg_his_wellness',
                    name: 'His Wellness Comprehensive',
                    itemType: 'PACKAGE',
                    price: 1699,
                    mrp: 3800,
                    params: 78,
                    fasting: 'YES',
                    sampleType: 'SERUM, EDTA',
                    tatHours: 24,
                    description: 'Customized male health panel checking Testosterone levels, Prostate PSA, Cardiac Lipids, Liver Enzyme Panel, Vitamin D3 & Vital Stamina Markers.'
                  })}
                  style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1.5px solid #DBEAFE', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 15px rgba(37,99,235,0.05)', cursor: 'pointer' }}
                >
                  <div>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
                      <Zap size={24} />
                    </div>
                    <span style={{ fontSize: '0.72rem', backgroundColor: '#DBEAFE', color: '#1D4ED8', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '800' }}>
                      MEN'S HEALTH
                    </span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', marginTop: '0.5rem' }}>
                      His Wellness Comprehensive
                    </h3>
                    <p style={{ fontSize: '0.84rem', color: '#64748B', marginTop: '0.35rem', lineHeight: 1.4 }}>
                      Testosterone levels, Prostate PSA, Cardiac Lipids, Liver Enzyme Panel, Vitamin D3 & Vital Stamina Markers.
                    </p>
                    <div style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: '700', marginTop: '0.75rem' }}>
                      ✓ 78 Parameters • Fasting Required • Details →
                    </div>
                  </div>

                  <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '1.35rem', fontWeight: '900', color: '#2563EB' }}>₹1,699</span>
                      <span style={{ fontSize: '0.78rem', color: '#94A3B8', textDecoration: 'line-through', marginLeft: '0.4rem' }}>₹3,800</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart({ id: 'pkg_his_wellness', name: 'His Wellness Comprehensive (78 Tests)', price: 1699, mrp: 3800, params: 78, fasting: 'YES', sampleType: 'SERUM' });
                      }}
                      style={{ padding: '0.55rem 1.1rem', backgroundColor: '#2563EB', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer' }}
                    >
                      + Add Plan
                    </button>
                  </div>
                </div>

                {/* HER WELLNESS */}
                <div 
                  onClick={() => setSelectedDetailItem({
                    id: 'pkg_her_wellness',
                    name: 'Her Wellness & Hormone Harmony',
                    itemType: 'PACKAGE',
                    price: 1799,
                    mrp: 4000,
                    params: 84,
                    fasting: 'YES',
                    sampleType: 'SERUM, EDTA',
                    tatHours: 24,
                    description: 'Comprehensive female health panel with PCOS / PCOD hormone panel, Thyroid Ultra-sensitive, Complete Iron/Ferritin, Bone Calcium & Vitamin B12.'
                  })}
                  style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1.5px solid #FCE7F3', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 15px rgba(219,39,119,0.05)', cursor: 'pointer' }}
                >
                  <div>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#FDF2F8', color: '#DB2777', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
                      <Heart size={24} />
                    </div>
                    <span style={{ fontSize: '0.72rem', backgroundColor: '#FCE7F3', color: '#BE185D', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '800' }}>
                      WOMEN'S HEALTH
                    </span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', marginTop: '0.5rem' }}>
                      Her Wellness & Hormone Harmony
                    </h3>
                    <p style={{ fontSize: '0.84rem', color: '#64748B', marginTop: '0.35rem', lineHeight: 1.4 }}>
                      PCOS / PCOD hormone panel, Thyroid Ultra-sensitive, Complete Iron/Ferritin, Bone Calcium & Vitamin B12.
                    </p>
                    <div style={{ fontSize: '0.8rem', color: '#DB2777', fontWeight: '700', marginTop: '0.75rem' }}>
                      ✓ 84 Parameters • Free Home Sample Pickup • Details →
                    </div>
                  </div>

                  <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '1.35rem', fontWeight: '900', color: '#DB2777' }}>₹1,799</span>
                      <span style={{ fontSize: '0.78rem', color: '#94A3B8', textDecoration: 'line-through', marginLeft: '0.4rem' }}>₹4,000</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart({ id: 'pkg_her_wellness', name: 'Her Wellness & Hormone Harmony (84 Tests)', price: 1799, mrp: 4000, params: 84, fasting: 'YES', sampleType: 'SERUM' });
                      }}
                      style={{ padding: '0.55rem 1.1rem', backgroundColor: '#DB2777', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer' }}
                    >
                      + Add Plan
                    </button>
                  </div>
                </div>

                {/* FAMILY WELLNESS */}
                <div 
                  onClick={() => setSelectedDetailItem({
                    id: 'pkg_family_wellness',
                    name: 'Family Complete Health Shield',
                    itemType: 'PACKAGE',
                    price: 4499,
                    mrp: 11000,
                    params: 110,
                    fasting: 'YES',
                    sampleType: 'SERUM, EDTA, URINE',
                    tatHours: 24,
                    description: 'Comprehensive family checkup covering up to 4 members. Senior citizen parent screening, pediatric immunity indicators, and full metabolic panels for couple.'
                  })}
                  style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1.5px solid #E0E7FF', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 15px rgba(79,70,229,0.05)', cursor: 'pointer' }}
                >
                  <div>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
                      <Users size={24} />
                    </div>
                    <span style={{ fontSize: '0.72rem', backgroundColor: '#E0E7FF', color: '#4338CA', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '800' }}>
                      WHOLE FAMILY (4 MEMBERS)
                    </span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', marginTop: '0.5rem' }}>
                      Family Complete Health Shield
                    </h3>
                    <p style={{ fontSize: '0.84rem', color: '#64748B', marginTop: '0.35rem', lineHeight: 1.4 }}>
                      Senior citizen parent screening, pediatric immunity indicators, and full metabolic panels for couple.
                    </p>
                    <div style={{ fontSize: '0.8rem', color: '#4F46E5', fontWeight: '700', marginTop: '0.75rem' }}>
                      ✓ Covers 4 Members • 110+ Tests Each • Details →
                    </div>
                  </div>

                  <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '1.35rem', fontWeight: '900', color: '#4F46E5' }}>₹4,499</span>
                      <span style={{ fontSize: '0.78rem', color: '#94A3B8', textDecoration: 'line-through', marginLeft: '0.4rem' }}>₹11,000</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart({ id: 'pkg_family_wellness', name: 'Family Complete Health Shield (4 Members)', price: 4499, mrp: 11000, params: 110, fasting: 'YES', sampleType: 'SERUM' });
                      }}
                      style={{ padding: '0.55rem 1.1rem', backgroundColor: '#4F46E5', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer' }}
                    >
                      + Add Family Plan
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* 3. DISEASE-BASED & VITAL-BASED SCREENING */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              
              {/* Disease-Based Tests */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <ShieldCheck size={20} color="#006B70" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>Disease-Based Screening</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { name: 'Diabetes Comprehensive (HbA1c + Fasting Blood Sugar + Microalbumin)', price: 499, mrp: 900, tag: 'Diabetes', sampleType: 'EDTA, FLUORIDE', fasting: 'YES', tatHours: 12, params: 3 },
                    { name: 'Cardiac & Lipid Health Risk Panel (Cholesterol, HDL, LDL, Triglycerides)', price: 549, mrp: 1100, tag: 'Heart', sampleType: 'SERUM', fasting: 'YES', tatHours: 12, params: 7 },
                    { name: 'Liver Function Test (LFT 11 Parameters + Enzymes)', price: 399, mrp: 800, tag: 'Liver', sampleType: 'SERUM', fasting: 'NO', tatHours: 12, params: 11 },
                    { name: 'Kidney Renal Function Panel (KFT/RFT + Electrolytes)', price: 449, mrp: 850, tag: 'Kidney', sampleType: 'SERUM', fasting: 'NO', tatHours: 12, params: 8 },
                    { name: 'Comprehensive Allergy & Food Intolerance Screen', price: 1299, mrp: 2800, tag: 'Allergy', sampleType: 'SERUM', fasting: 'NO', tatHours: 48, params: 45 }
                  ].map((test, i) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedDetailItem({
                        id: `test_disease_${i}`,
                        name: test.name,
                        itemType: 'PROFILE',
                        price: test.price,
                        mrp: test.mrp,
                        params: test.params,
                        fasting: test.fasting,
                        sampleType: test.sampleType,
                        tatHours: test.tatHours,
                        description: `Specialized diagnostic profile for ${test.tag} screening with NABL accredited analysis.`
                      })}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'background-color 0.15s' }}
                    >
                      <div style={{ flex: 1, paddingRight: '0.75rem' }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0F172A' }}>{test.name}</div>
                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
                          <span style={{ fontSize: '0.68rem', backgroundColor: '#E0F2F1', color: '#006B70', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '800' }}>
                            {test.tag}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: '#64748B' }}>
                            {test.params} Tests • View Details →
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#006B70' }}>₹{test.price}</div>
                          <div style={{ fontSize: '0.7rem', color: '#94A3B8', textDecoration: 'line-through' }}>₹{test.mrp}</div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart({ id: `test_disease_${i}`, name: test.name, price: test.price, mrp: test.mrp, params: test.params, fasting: test.fasting, sampleType: test.sampleType });
                          }}
                          style={{ padding: '0.4rem 0.75rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vital-Based Tests */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Thermometer size={20} color="#0891B2" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>Vital-Based Biomarkers</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { name: 'Vitamin D3 & Vitamin B12 Essential Pair', price: 799, mrp: 1800, tag: 'Vitamins', sampleType: 'SERUM', fasting: 'NO', tatHours: 24, params: 2 },
                    { name: 'Complete Blood Count (CBC + ESR 24 Parameters)', price: 299, mrp: 500, tag: 'Blood Cell', sampleType: 'EDTA', fasting: 'NO', tatHours: 6, params: 24 },
                    { name: 'Thyroid Profile Total (T3, T4, TSH Ultra)', price: 349, mrp: 700, tag: 'Hormone', sampleType: 'SERUM', fasting: 'NO', tatHours: 12, params: 3 },
                    { name: 'Complete Iron Deficiency & Ferritin Panel', price: 599, mrp: 1200, tag: 'Anemia', sampleType: 'SERUM', fasting: 'YES', tatHours: 12, params: 4 },
                    { name: 'Electrolytes & Bone Mineral Profile (Calcium, Phos)', price: 399, mrp: 750, tag: 'Minerals', sampleType: 'SERUM', fasting: 'NO', tatHours: 12, params: 5 }
                  ].map((test, i) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedDetailItem({
                        id: `test_vital_${i}`,
                        name: test.name,
                        itemType: 'PROFILE',
                        price: test.price,
                        mrp: test.mrp,
                        params: test.params,
                        fasting: test.fasting,
                        sampleType: test.sampleType,
                        tatHours: test.tatHours,
                        description: `Vital health checkup indicator focusing on ${test.tag} biomarkers for optimal metabolic health.`
                      })}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'background-color 0.15s' }}
                    >
                      <div style={{ flex: 1, paddingRight: '0.75rem' }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0F172A' }}>{test.name}</div>
                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
                          <span style={{ fontSize: '0.68rem', backgroundColor: '#CFFAFE', color: '#0891B2', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '800' }}>
                            {test.tag}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: '#64748B' }}>
                            {test.params} Tests • View Details →
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#0891B2' }}>₹{test.price}</div>
                          <div style={{ fontSize: '0.7rem', color: '#94A3B8', textDecoration: 'line-through' }}>₹{test.mrp}</div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart({ id: `test_vital_${i}`, name: test.name, price: test.price, mrp: test.mrp, params: test.params, fasting: test.fasting, sampleType: test.sampleType });
                          }}
                          style={{ padding: '0.4rem 0.75rem', backgroundColor: '#0891B2', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* 4. AGE-BASED RECOMMENDATIONS & HEALTH CONCERNS */}
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Smart Health AI Recommender
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A', marginTop: '0.15rem' }}>
                  Age-Based Recommendations & Health Concern Finder
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                {[
                  { title: 'Men & Women (20–35 Yrs)', subtitle: 'Baseline Fitness, Energy & Vitamin Pack', price: 999, mrp: 2200, icon: '⚡', color: '#10B981', params: 54 },
                  { title: 'Men & Women (35–50 Yrs)', subtitle: 'Cardiac + Diabetes + Metabolic Shield', price: 1499, mrp: 3400, icon: '🩺', color: '#2563EB', params: 76 },
                  { title: 'Senior Citizens (50+ Yrs)', subtitle: 'Geriatric Vitality, Arthritis & Organ Scan', price: 1899, mrp: 4500, icon: '👵', color: '#8B5CF6', params: 88 },
                  { title: 'Hair Fall & Skin Health', subtitle: 'Biotin, Iron, Ferritin & Thyroid Screen', price: 799, mrp: 1900, icon: '✨', color: '#EC4899', params: 12 },
                  { title: 'Fatigue & Gut Wellness', subtitle: 'B12, D3, HbA1c & Digestive Biomarkers', price: 899, mrp: 2100, icon: '🌱', color: '#F59E0B', params: 16 }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedDetailItem({
                      id: `rec_${idx}`,
                      name: `${item.title}`,
                      itemType: 'PACKAGE',
                      price: item.price,
                      mrp: item.mrp,
                      params: item.params,
                      fasting: 'YES',
                      sampleType: 'SERUM, EDTA',
                      tatHours: 24,
                      description: `Targeted wellness checkup designed specifically for ${item.title}. Includes ${item.subtitle} to proactively safeguard your vital health.`
                    })}
                    style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}
                  >
                    <div>
                      <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0F172A' }}>{item.title}</h4>
                      <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.3rem', lineHeight: 1.4 }}>{item.subtitle}</p>
                      <div style={{ fontSize: '0.72rem', color: '#006B70', fontWeight: '700', marginTop: '0.4rem' }}>{item.params} Parameters • View Details →</div>
                    </div>
                    <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: '900', color: '#006B70' }}>₹{item.price}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart({ id: `rec_${idx}`, name: `${item.title} (${item.subtitle})`, price: item.price, mrp: item.mrp, params: item.params, fasting: 'YES', sampleType: 'SERUM' });
                        }}
                        style={{ padding: '0.4rem 0.85rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        Book Test
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: LABS & TESTS (FULL 913+ PATHOLOGY CATALOG & PACKAGES)              */}
        {/* ========================================================================= */}
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

            {/* Test Cards Grid (Clickable to open Detail Sheet) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {displayCatalogItems.slice(0, 80).map((item) => {
                const inCart = cart.some(c => c.id === (item.id || item.code));
                return (
                  <div
                    key={item.id || item.code}
                    onClick={() => setSelectedDetailItem(item)}
                    style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: item.itemType === 'PACKAGE' ? '2px solid #F59E0B' : '1.5px solid #E2E8F0', padding: '1.35rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
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
                        <div style={{ color: '#006B70', fontWeight: '700', marginTop: '0.2rem' }}>🔍 Tap to view details & package savings →</div>
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
                        onClick={(e) => {
                          e.stopPropagation();
                          inCart ? removeFromCart(item.id || item.code) : addToCart(item);
                        }}
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
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: TRACK (LIVE PHLEBOTOMIST & SAMPLE TELEMETRY TRACKER)                */}
        {/* ========================================================================= */}
        {activeTab === 'TRACK' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '2rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#E0F2F1', color: '#006B70', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: '800' }}>
                    BOOKING #{activeOrder.id} • LIVE PHLEBO TRACKING
                  </span>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A', marginTop: '0.35rem' }}>
                    Phlebotomist En Route for Home Collection
                  </h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: '800', fontSize: '0.88rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981', animation: 'pulse 1.5s infinite' }}></span>
                  <span>ETA: {activeOrder.eta}</span>
                </div>
              </div>

              {/* Progress Milestones */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '2rem', marginBottom: '2rem' }}>
                {[
                  { step: '1', title: 'Order Confirmed', sub: '06:30 AM', done: true },
                  { step: '2', title: 'Phlebo Assigned', sub: 'Ramesh Kumar', done: true },
                  { step: '3', title: 'Sample Collection', sub: 'Plot 42, Air Bypass Rd', done: false, active: true },
                  { step: '4', title: 'NABL Lab Analysis', sub: 'Report within 24h', done: false }
                ].map((s, idx) => (
                  <div key={idx} style={{ textAlign: 'center', position: 'relative' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: s.done ? '#006B70' : (s.active ? '#F59E0B' : '#E2E8F0'), color: s.done || s.active ? '#FFF' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', fontWeight: '900' }}>
                      {s.done ? '✓' : s.step}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A' }}>{s.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Live Phlebo & Telemetry Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div style={{ padding: '1.25rem', borderRadius: '16px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '800' }}>ASSIGNED SAMPLE COLLECTOR</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A', marginTop: '0.35rem' }}>{activeOrder.phleboName}</div>
                  <div style={{ fontSize: '0.88rem', color: '#006B70', fontWeight: '700', marginTop: '0.2rem' }}>📞 {activeOrder.phleboPhone}</div>
                  <button 
                    onClick={() => window.open(`tel:${activeOrder.phleboPhone}`, '_self')}
                    style={{ marginTop: '0.85rem', padding: '0.45rem 1rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}
                  >
                    Call Phlebotomist
                  </button>
                </div>

                <div style={{ padding: '1.25rem', borderRadius: '16px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '800' }}>IOT COLD-CHAIN TELEMETRY</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#059669', marginTop: '0.35rem' }}>{activeOrder.tempTelemetry}</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.2rem' }}>Preserves serum biomarkers integrity from home to analyzer</div>
                  <div style={{ fontSize: '0.78rem', color: '#006B70', fontWeight: '700', marginTop: '0.5rem' }}>📍 Destination Hub: Renigunta NABL Lab</div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: REPORTS (DIGITAL HEALTH LOCKER & LAB PDF ARCHIVE)                  */}
        {/* ========================================================================= */}
        {activeTab === 'REPORTS' && (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '2rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A' }}>Digital Health Locker & Reports</h2>
                <p style={{ fontSize: '0.88rem', color: '#64748B', marginTop: '0.2rem' }}>All your verified diagnostic reports are encrypted and synced to Google Drive.</p>
              </div>
              <button 
                onClick={() => handleOrderWhatsApp('Prescription Verification')}
                style={{ padding: '0.65rem 1.25rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                + Upload New Doctor Rx
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {[
                { title: 'Thyrocare Aarogyam Master Report', date: '15 Aug 2026', size: '1.8 MB PDF', id: 'REP-8821', lab: 'Thyrocare Central Hub', status: 'VERIFIED_NABL' },
                { title: 'HbA1c & Fasting Glucose Panel', date: '02 Jun 2026', size: '1.1 MB PDF', id: 'REP-7412', lab: 'MedMarg Diagnostics', status: 'VERIFIED_NABL' },
                { title: 'Lipid Profile & Liver Enzymes', date: '10 Jan 2026', size: '1.4 MB PDF', id: 'REP-6109', lab: 'Dr. Lal PathLabs', status: 'VERIFIED_NABL' }
              ].map((doc, idx) => (
                <div key={idx} style={{ padding: '1.5rem', borderRadius: '18px', border: '1.5px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.7rem', backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>
                        {doc.status}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{doc.size}</span>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A' }}>{doc.title}</h3>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.25rem' }}>{doc.lab} • {doc.date}</div>
                  </div>

                  <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => alert(`Opening Google Drive PDF for ${doc.id}...`)}
                      style={{ flex: 1, padding: '0.6rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer' }}
                    >
                      View on Drive
                    </button>
                    <button 
                      onClick={() => handleOrderWhatsApp(`Question about Report ${doc.id}`)}
                      style={{ padding: '0.6rem 0.85rem', backgroundColor: '#E0F2F1', color: '#006B70', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer' }}
                    >
                      Share
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: PROFILE (USER PROFILE, PHONE NUMBER, ADDRESSES & SWITCH ROLE)       */}
        {/* ========================================================================= */}
        {activeTab === 'PROFILE' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.5rem' }}>
            
            {/* Left Column: Account Details */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '2rem', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#006B70', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '900' }}>
                  {user?.name?.charAt(0) || 'R'}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0F172A' }}>{user?.name || 'Rahul Sharma'}</h2>
                  <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Role: <strong>{user?.role || 'PATIENT'}</strong></div>
                  <span style={{ fontSize: '0.72rem', backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '800', display: 'inline-block', marginTop: '0.25rem' }}>
                    ✓ Mobile Verified
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '0.85rem 1rem', borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>PRIMARY MOBILE NUMBER</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A', marginTop: '0.2rem' }}>
                    {user?.phone || user?.identifier || '+91 98765 43210'}
                  </div>
                </div>

                <div style={{ padding: '0.85rem 1rem', borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>DEFAULT HOME COLLECTION ADDRESS</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A', marginTop: '0.2rem' }}>
                    Plot 42, Air Bypass Road, Tirupati, Andhra Pradesh - 517501
                  </div>
                </div>

                <div style={{ padding: '0.85rem 1rem', borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>LINKED FAMILY PROFILES</div>
                  <div style={{ fontSize: '0.9rem', color: '#334155', marginTop: '0.2rem' }}>
                    • Rahul Sharma (Self, 34M)<br />
                    • Priya Sharma (Spouse, 31F)<br />
                    • K. Sharma (Father, 62M)
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Platform Controls & Quick Role Switch */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '2rem', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A', marginBottom: '0.4rem' }}>
                  Platform Switcher & Access
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.25rem' }}>
                  Switch roles to explore Doctor, Lab Partner, Scan Center, Phlebotomist, or Admin portals.
                </p>

                <button
                  onClick={onSwitchRole}
                  style={{ width: '100%', padding: '0.85rem', backgroundColor: '#F1F5F9', color: '#0F172A', border: '1.5px solid #CBD5E1', borderRadius: '12px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', marginBottom: '1rem' }}
                >
                  ⇄ Switch Role / Universal Sign-In
                </button>

                <button
                  onClick={onLogout}
                  style={{ width: '100%', padding: '0.85rem', backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer' }}
                >
                  Sign Out from Patient Account
                </button>
              </div>

              <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#E0F2F1', borderRadius: '14px', border: '1px solid #B2DFDB', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#006B70' }}>
                  MedMarg Healthcare Support Helpline
                </span>
                <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#004D40', marginTop: '0.25rem' }}>
                  📞 +91 98765 43210
                </div>
                <div style={{ fontSize: '0.75rem', color: '#006B70', marginTop: '0.15rem' }}>24/7 Home Collection & Lab Assistance</div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* 3. FLOATING STICKY BOTTOM ADD TO CART & CHECKOUT BAR                      */}
      {/* ========================================================================= */}
      {cart.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 110,
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          borderRadius: '20px',
          padding: '0.85rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.75rem',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)',
          maxWidth: '650px',
          width: 'calc(100% - 40px)',
          animation: 'slideUp 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#006B70', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShoppingBag size={20} color="#FBBF24" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <strong style={{ fontSize: '0.95rem', color: '#FFF' }}>{cart.length} {cart.length === 1 ? 'Test' : 'Tests'} in Cart</strong>
                {cartSavings > 0 && (
                  <span style={{ fontSize: '0.72rem', backgroundColor: '#10B981', color: '#FFF', padding: '0.1rem 0.45rem', borderRadius: '6px', fontWeight: '900' }}>
                    Save ₹{cartSavings}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {cart.map(c => c.name).join(', ')}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#FBBF24' }}>₹{cartTotal}</div>
              <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Free Home Pickup</div>
            </div>

            <button
              onClick={() => setShowCheckoutModal(true)}
              style={{
                padding: '0.65rem 1.25rem',
                backgroundColor: '#006B70',
                color: '#FFF',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '900',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 12px rgba(0,107,112,0.4)'
              }}
            >
              Checkout <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ITEM DETAILS MODAL WITH CONNECTED PACKAGES & HIGHLIGHTED SAVINGS       */}
      {/* ========================================================================= */}
      {selectedDetailItem && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 135, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1.25rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', maxWidth: '640px', width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)', border: '1.5px solid #CBD5E1' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.72rem', backgroundColor: selectedDetailItem.itemType === 'PACKAGE' ? '#FEF3C7' : '#E0F2F1', color: selectedDetailItem.itemType === 'PACKAGE' ? '#B45309' : '#006B70', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '800' }}>
                    {selectedDetailItem.itemType || 'TEST'} {selectedDetailItem.code ? `• ${selectedDetailItem.code}` : ''}
                  </span>
                  <span style={{ fontSize: '0.72rem', backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '800' }}>
                    ✓ 100% NABL & CAP Accredited
                  </span>
                </div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#0F172A', lineHeight: 1.25 }}>
                  {selectedDetailItem.name}
                </h2>
              </div>
              <button onClick={() => setSelectedDetailItem(null)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#64748B' }}>
                <X size={22} />
              </button>
            </div>

            {/* Pricing & Key Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700' }}>PRICE / MRP</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#006B70' }}>₹{selectedDetailItem.price}</div>
                {selectedDetailItem.mrp && (
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', textDecoration: 'line-through' }}>₹{selectedDetailItem.mrp}</div>
                )}
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700' }}>SAMPLE TYPE</div>
                <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0F172A', marginTop: '0.2rem' }}>{selectedDetailItem.sampleType || 'SERUM'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700' }}>FASTING REQ.</div>
                <div style={{ fontSize: '0.88rem', fontWeight: '800', color: selectedDetailItem.fasting === 'YES' ? '#D97706' : '#10B981', marginTop: '0.2rem' }}>
                  {selectedDetailItem.fasting === 'YES' ? '8-10 Hours' : 'Not Required'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700' }}>TURNAROUND</div>
                <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0F172A', marginTop: '0.2rem' }}>{selectedDetailItem.tatHours || 24} Hours</div>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>DESCRIPTION & BIOMARKER OVERVIEW</div>
              <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
                {selectedDetailItem.description || `Diagnostic testing for ${selectedDetailItem.name}. Standardized high-throughput analysis processed at accredited central lab with barcode verification and cold-chain sample preservation.`}
              </p>
            </div>

            {/* CONNECTED SMART PACKAGES WITH HIGHLIGHTED SAVINGS */}
            {selectedDetailItem.itemType !== 'PACKAGE' && (
              <div style={{ marginBottom: '1.5rem', padding: '1.25rem', borderRadius: '18px', backgroundColor: '#FEF3C7', border: '1.5px solid #F59E0B' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Sparkles size={18} color="#B45309" />
                  <strong style={{ fontSize: '0.95rem', color: '#92400E' }}>Upgrade to a Full Body Package & Save Up to 60%!</strong>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#78350F', lineHeight: 1.4, marginBottom: '0.85rem' }}>
                  This test is already included in comprehensive health packages. You can get 100+ vital biomarkers for just a small price difference!
                </p>

                {getConnectedPackages(selectedDetailItem).map((pkg) => {
                  const packageSavings = pkg.mrp - pkg.price;
                  const discountPercent = Math.round((packageSavings / pkg.mrp) * 100);
                  return (
                    <div key={pkg.id} style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '0.85rem 1rem', border: '1px solid #FDE68A', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>{pkg.name}</strong>
                          <span style={{ fontSize: '0.68rem', backgroundColor: '#DCFCE7', color: '#166534', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: '800' }}>
                            {pkg.params} Tests
                          </span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#B45309', fontWeight: '700', marginTop: '0.15rem' }}>
                          Save ₹{packageSavings} ({discountPercent}% OFF) • {pkg.includes.slice(0, 3).join(', ')}...
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          addToCart({ id: pkg.id, name: pkg.name, price: pkg.price, mrp: pkg.mrp, params: pkg.params, fasting: 'YES', sampleType: 'SERUM, EDTA' });
                          setSelectedDetailItem(null);
                        }}
                        style={{ padding: '0.45rem 0.85rem', backgroundColor: '#B45309', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', flexShrink: 0 }}
                      >
                        + Upgrade to Package (₹{pkg.price})
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                onClick={() => {
                  addToCart(selectedDetailItem);
                  setSelectedDetailItem(null);
                }}
                style={{ flex: 1, padding: '0.85rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              >
                + Add "{selectedDetailItem.name}" to Cart (₹{selectedDetailItem.price})
              </button>
              
              <button
                onClick={() => handleOrderWhatsApp(`Inquiry regarding ${selectedDetailItem.name}`)}
                style={{ padding: '0.85rem 1.25rem', backgroundColor: '#25D366', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <MessageCircle size={18} /> WhatsApp
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* NOTIFICATION CENTER SLIDE-OUT DRAWER / MODAL                             */}
      {/* ========================================================================= */}
      {showNotificationCenter && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 140, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '440px', height: '100vh', padding: '1.75rem', display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 30px rgba(0,0,0,0.15)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Bell size={22} color="#006B70" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A' }}>Notification Center</h2>
              </div>
              <button onClick={() => setShowNotificationCenter(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{unreadNotificationCount} unread system alerts</span>
              <button onClick={markAllNotificationsRead} style={{ background: 'none', border: 'none', color: '#006B70', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}>
                Mark All Read
              </button>
            </div>

            {/* Notification Filter Pills */}
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
              {['ALL', 'ORDERS', 'REPORTS', 'SYNC'].map(f => (
                <button
                  key={f}
                  onClick={() => setNotificationFilter(f)}
                  style={{ padding: '0.35rem 0.75rem', borderRadius: '16px', border: notificationFilter === f ? '1px solid #006B70' : '1px solid #E2E8F0', backgroundColor: notificationFilter === f ? '#006B70' : '#F8FAFC', color: notificationFilter === f ? '#FFF' : '#475569', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {notifications
                .filter(n => notificationFilter === 'ALL' || n.category === notificationFilter)
                .map(n => (
                  <div key={n.id} style={{ padding: '1rem', borderRadius: '14px', backgroundColor: n.unread ? '#E0F2F1' : '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <strong style={{ fontSize: '0.88rem', color: '#0F172A' }}>{n.title}</strong>
                      <span style={{ fontSize: '0.7rem', color: '#64748B' }}>{n.time}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#334155', marginTop: '0.35rem', lineHeight: 1.4 }}>{n.message}</p>
                  </div>
                ))}
            </div>

          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {showCheckoutModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 145, backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
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
                    <div style={{ fontSize: '0.74rem', color: '#64748B' }}>Sample: {item.sampleType || 'SERUM'} • Fasting: {item.fasting || 'NO'}</div>
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
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Contact Mobile Number</label>
                <input 
                  type="tel" 
                  value={patientForm.phone} 
                  onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 150, backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', maxWidth: '460px', width: '100%', padding: '2.5rem 2rem', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <CheckCircle2 size={36} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A' }}>Booking Confirmed!</h2>
            <p style={{ fontSize: '0.88rem', color: '#64748B', marginTop: '0.4rem', lineHeight: 1.5 }}>
              Your MedMarg diagnostic order has been assigned to a certified phlebotomist. Live status updates have been sent to your WhatsApp.
            </p>
            <button
              onClick={() => {
                setShowBookingSuccess(false);
                setActiveTab('TRACK');
              }}
              style={{ marginTop: '1.5rem', padding: '0.75rem 2rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}
            >
              Track Live Phlebotomist
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
