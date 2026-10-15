import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Home as HomeIcon, 
  Activity, 
  FolderHeart, 
  User, 
  ShoppingBag, 
  Gift, 
  HeartPulse,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  PackageCheck,
  Bell,
  Clock,
  FileText,
  Download,
  ShieldCheck
} from 'lucide-react';
import initialCatalog from '../data/catalogData.json';
import { 
  getCatalogState, 
  filterCatalogItems, 
  getItemLabPricing,
  getPreferredLab,
  savePreferredLab,
  getItemPriceForLab,
  getStartingPrice
} from '../data/catalogStore';
import { API_BASE } from '../data/apiConfig';


// Role-Specific Modular Subcomponents (src/components/patient/)
import CareSeekerHomeTab from '../components/patient/CareSeekerHomeTab';
import CareSeekerOrdersTab from '../components/patient/CareSeekerOrdersTab';
import PatientCatalogMatrixTab from '../components/patient/PatientCatalogMatrixTab';
import CareSeekerVitalsModule from '../components/patient/CareSeekerVitalsModule';
import CareSeekerTrackingTab from '../components/patient/CareSeekerTrackingTab';
import PatientReportsTab from '../components/patient/PatientReportsTab';
import PatientProfileTab from '../components/patient/PatientProfileTab';
import PatientReferralAndCorporate from '../components/patient/PatientReferralAndCorporate';
import CareSeekerAddressModal from '../components/patient/CareSeekerAddressModal';
import PatientCartDrawer from '../components/patient/PatientCartDrawer';
import CareSeekerCheckoutModal from '../components/patient/CareSeekerCheckoutModal';
import CareSeekerUniversalItemSheet from '../components/patient/CareSeekerUniversalItemSheet';
import CareSeekerPrescriptionModal from '../components/patient/CareSeekerPrescriptionModal';
import CareSeekerFloatingActionBar from '../components/patient/CareSeekerFloatingActionBar';
import FloatingCartButton from '../components/patient/FloatingCartButton';
import CareSeekerPhoneModal from '../components/patient/CareSeekerPhoneModal';

export default function PatientDashboard({ user, onSwitchRole, onLogout }) {
  // 7 CORE NAVIGATION TABS: HOME, TESTS, VITALS, TRACK, REPORTS, REFER_CORP, PROFILE
  const [activeTab, setActiveTab] = useState('HOME');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogSubTab, setCatalogSubTab] = useState('ALL'); // 'ALL' | 'PACKAGES' | 'PROFILES' | 'TESTS'
  const [fastingFilter, setFastingFilter] = useState('ALL');
  const [sampleFilter, setSampleFilter] = useState('ALL');
  
  // Master Catalog State
  const [catalog, setCatalog] = useState(getCatalogState() || initialCatalog);

  // Modular Modals & Sheets State
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [orderSuccessBanner, setOrderSuccessBanner] = useState(null);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [offersNotifySubmitted, setOffersNotifySubmitted] = useState(false);
  const getUserEmailKey = () => {
    return (user?.email || 'patient').toLowerCase().replace(/[^a-z0-9]/g, '_');
  };

  const getEffectiveUserPhone = () => {
    try {
      const emailKey = getUserEmailKey();
      const stored = localStorage.getItem(`medmarg_phone_${emailKey}`) || localStorage.getItem('medmarg_user_phone');
      if (stored && stored.replace(/[^0-9]/g, '').length >= 10) return stored;
      if (user?.phone && user.phone.replace(/[^0-9]/g, '').length >= 10) return user.phone;
    } catch (e) {}
    return '';
  };

  const [currentUserProfile, setCurrentUserProfile] = useState(() => {
    if (!user) return null;
    const phone = getEffectiveUserPhone() || user.phone || '';
    const updated = { ...user, phone, identifier: phone || user.email || user.identifier };
    try {
      localStorage.setItem('medmarg_user', JSON.stringify(updated));
    } catch (e) {}
    return updated;
  });

  const [showPhoneModal, setShowPhoneModal] = useState(() => {
    try {
      const emailKey = getUserEmailKey();
      const isCompleted = localStorage.getItem('medmarg_phone_completed') === 'true' ||
                          localStorage.getItem(`medmarg_phone_completed_${emailKey}`) === 'true';
      if (isCompleted) return false;
      const phone = getEffectiveUserPhone();
      const digits = (phone || '').replace(/[^0-9]/g, '');
      return !!(user && user.email && digits.length < 10);
    } catch (e) {
      return false;
    }
  });

  const handlePhoneSaved = (newPhone) => {
    const emailKey = getUserEmailKey();
    try {
      localStorage.setItem('medmarg_phone_completed', 'true');
      localStorage.setItem(`medmarg_phone_completed_${emailKey}`, 'true');
      localStorage.setItem('medmarg_user_phone', newPhone);
      localStorage.setItem(`medmarg_phone_${emailKey}`, newPhone);
    } catch (e) {}
    const updated = { ...currentUserProfile, phone: newPhone, identifier: newPhone };
    setCurrentUserProfile(updated);
    try {
      localStorage.setItem('medmarg_user', JSON.stringify(updated));
    } catch (e) {}
    setShowPhoneModal(false);
  };

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState([
    { id: 'addr_1', label: 'Home', address: 'Plot 42, Air Bypass Road, Tirupati, AP - 517501', isDefault: true, city: 'Tirupati, AP', pincode: '517501' },
    { id: 'addr_2', label: 'Parents', address: 'Door 12-4/A, Gandhi Road, Tirupati, AP - 517502', isDefault: false, city: 'Tirupati, AP', pincode: '517502' }
  ]);

  // Selected Processing Laboratory (MedMarg, Thyrocare, Lalpath) with persistence
  const [selectedLabProvider, setSelectedLabProvider] = useState(getPreferredLab);

  const handleLabChange = (newLab) => {
    if (newLab) {
      setSelectedLabProvider(newLab);
      savePreferredLab(newLab);
    }
  };

  // Cart State (Array of Base Items)
  const [cart, setCart] = useState([]);

  // Live Orders State
  const [allOrders, setAllOrders] = useState([
    {
      id: 'MM-LAB-9842',
      date: '31 Aug 2026',
      slot: '07:30 AM - 08:30 AM',
      address: 'Plot 42, Air Bypass Road, Tirupati, AP - 517501',
      phleboName: 'Ramesh Kumar (Certified Phlebotomist)',
      phleboPhone: '+91 98765 11223',
      status: 'ENROUTE',
      eta: '14 Mins',
      tempTelemetry: '3.8°C (Optimal Cold-Chain)',
      handoverOtp: '4821',
      items: [
        { name: 'MedMarg Master Health Checkup', price: 1499 },
        { name: 'Thyroid Profile Total (T3/T4/TSH)', price: 299 }
      ],
      totalAmount: 1798,
      paymentStatus: 'PAID'
    }
  ]);

  const [activeOrder, setActiveOrder] = useState(allOrders[0]);

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

  // Fetch live orders from backend
  useEffect(() => {
    fetch(`${API_BASE}/api/v1/patient/orders`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.orders && data.orders.length > 0) {
          setAllOrders(data.orders);
          setActiveOrder(data.orders[0]);
        }
      })
      .catch(() => {});
  }, []);

  // Sync preferred lab across window events
  useEffect(() => {
    const handleLabChange = (e) => {
      const newLab = e.detail?.labId || e.detail?.lab;
      if (newLab) {
        setSelectedLabProvider(newLab);
      }
    };
    window.addEventListener('medmarg_lab_changed', handleLabChange);
    return () => window.removeEventListener('medmarg_lab_changed', handleLabChange);
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
    const rawId = item.id || item.code || item.name;
    if (!cart.some(cartItem => (cartItem.baseId || cartItem.id) === rawId || cartItem.code === item.code)) {
      setCart([...cart, {
        id: rawId,
        baseId: rawId,
        code: item.code || item.id,
        name: item.name || item.title,
        itemType: item.itemType || 'TEST',
        fasting: item.fasting || 'NO',
        sampleType: item.sampleType || item.sampleTypes?.join(', ') || 'SERUM',
        price: item.price || 499,
        mrp: item.mrp || 999,
        tatHours: item.tatHours || 24,
        labPricing: item.labPricing || null,
        tierPricing: item.tierPricing || null,
        personsCount: item.personsCount || 1
      }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => (item.id !== id && item.code !== id && item.baseId !== id)));
  };

  const cartTotal = cart.reduce((sum, item) => {
    const p = getItemPriceForLab(item, selectedLabProvider);
    const count = item.personsCount || 1;
    return sum + ((p.price || item.price || 0) * count);
  }, 0);

  const handleOrderWhatsApp = (customText = '') => {
    const defaultMsg = encodeURIComponent(
      `Hello MedMarg, I would like to book a Diagnostic Health Checkup / Home Sample Collection.\n\nCare Seeker Name: ${user?.name || 'Rahul Sharma'}\nContact: ${user?.phone || user?.identifier || '+91 98765 43210'}\nLocation: Tirupati, AP\n${customText ? `Requested Test: ${customText}` : ''}`
    );
    window.open(`https://wa.me/919876543210?text=${defaultMsg}`, '_blank');
  };

  const handleOrderCall = () => {
    window.open('tel:+919876543210', '_self');
  };

  const handleOrderSuccess = (newOrder) => {
    setAllOrders([newOrder, ...allOrders]);
    setActiveOrder(newOrder);
    setCart([]);
    setOrderSuccessBanner(`Order #${newOrder.id} confirmed! Phlebotomist assigned.`);
    setActiveTab('TRACK');
    setTimeout(() => {
      setOrderSuccessBanner(null);
    }, 6000);
  };

  const handleSaveAddress = (newAddr) => {
    setSavedAddresses([newAddr, ...savedAddresses]);
  };

  const activeOrdersCount = allOrders.filter(o => o.status === 'ASSIGNED' || o.status === 'ENROUTE' || o.status === 'SAMPLE_COLLECTED').length;

  const navMenuItems = [
    { key: 'HOME', label: 'Home', icon: HomeIcon },
    { key: 'ORDERS', label: 'My Orders', icon: PackageCheck, badge: activeOrdersCount > 0 ? `${activeOrdersCount} Active` : `${allOrders.length} Orders` },
    { key: 'TESTS', label: 'Labs & Tests Matrix', icon: FlaskConical, badge: `${catalog.tests?.length || 913}+` },
    { key: 'OFFERS_ZONE', label: 'Offers Zone', icon: Sparkles, badge: 'Coming Soon' },
    { key: 'VITALS', label: 'Daily Vitals Log', icon: HeartPulse, badge: 'Live' },
    { key: 'TRACK', label: 'Live Tracking', icon: Activity, badge: `${allOrders.length} Active` },
    { key: 'REPORTS', label: 'Health Vault', icon: FolderHeart, badge: 'NABL' },
    { key: 'REFER_CORP', label: 'Refer & Corporate', icon: Gift, badge: '₹400' },
    { key: 'PROFILE', label: 'Care Seeker Profile', icon: User }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* 1. REDESIGNED ULTRA-PREMIUM DEEP EMERALD SIDEBAR */}
      <aside style={{ 
        width: sidebarCollapsed ? '78px' : '260px', 
        backgroundColor: '#071F1A', 
        borderRight: '1px solid #0F332C', 
        display: 'flex', 
        flexDirection: 'column', 
        transition: 'all 0.25s ease',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100,
        boxShadow: '4px 0 24px rgba(0,0,0,0.15)'
      }}>
        {/* Sidebar Header Brand */}
        <div style={{ padding: '1.25rem 1.15rem', borderBottom: '1px solid #0F332C', display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '4px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
              <img src="/logo.png" alt="MedMarg" style={{ height: '26px', objectFit: 'contain' }} />
            </div>
            {!sidebarCollapsed && (
              <div>
                <div style={{ fontSize: '0.68rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.12rem 0.45rem', borderRadius: '4px', fontWeight: '900', display: 'block', width: 'fit-content', letterSpacing: '0.5px' }}>
                  CARE SEEKER
                </div>
                <div style={{ fontSize: '0.8rem', color: '#E0F2F1', fontWeight: '700', marginTop: '2px' }}>Healthcare Portal</div>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{ background: '#0F332C', border: 'none', color: '#80CBC4', cursor: 'pointer', borderRadius: '8px', padding: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '1rem 0.65rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto' }}>
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
                  padding: sidebarCollapsed ? '0.85rem' : '0.75rem 1rem',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: isActive ? '#006B70' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#80CBC4',
                  fontWeight: isActive ? '800' : '600',
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 4px 14px rgba(0,107,112,0.4)' : 'none'
                }}
              >
                <IconComp size={18} color={isActive ? '#FBBF24' : '#80CBC4'} />
                {!sidebarCollapsed && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem', borderRadius: '6px', backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.25)', color: isActive ? '#FFF' : '#80CBC4', fontWeight: '800' }}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Profile Card Footer */}
        <div style={{ padding: '0.85rem', borderTop: '1px solid #0F332C', backgroundColor: 'rgba(0,0,0,0.2)' }}>
          {!sidebarCollapsed ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {user?.picture || user?.avatar ? (
                  <img src={user?.picture || user?.avatar} alt={user?.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #006B70' }} />
                ) : (
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#006B70', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.9rem' }}>
                    {user?.name ? user.name[0].toUpperCase() : 'C'}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#FFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentUserProfile?.name || 'Rahul Sharma'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#80CBC4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentUserProfile?.phone || currentUserProfile?.identifier || '+91 98765 43210'}
                  </div>
                </div>
              </div>

              <button
                onClick={onLogout}
                style={{ width: '100%', padding: '0.45rem', backgroundColor: 'rgba(239,68,68,0.15)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
              >
                <LogOut size={13} /> Sign Out
              </button>
            </div>
          ) : (
            <button onClick={onLogout} style={{ width: '100%', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}>
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '1.75rem 2.25rem', maxHeight: '100vh', position: 'relative' }}>
        
        {/* Success Alert Banner */}
        {orderSuccessBanner && (
          <div style={{
            backgroundColor: '#D1FAE5',
            border: '1.5px solid #34D399',
            color: '#065F46',
            borderRadius: '16px',
            padding: '1rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(16,185,129,0.15)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '800', fontSize: '0.95rem' }}>
              <CheckCircle2 size={22} color="#059669" />
              <span>{orderSuccessBanner}</span>
            </div>
            <button
              onClick={() => setOrderSuccessBanner(null)}
              style={{ background: 'none', border: 'none', color: '#065F46', fontWeight: '900', cursor: 'pointer', fontSize: '1rem' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Top Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', position: 'relative' }}>
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
              {activeTab === 'ORDERS' && 'My Diagnostic Orders & History'}
              {activeTab === 'TESTS' && 'Pathology Lab Tests Matrix & Packages'}
              {activeTab === 'OFFERS_ZONE' && 'Exclusive Offers & Healthcare Privilege Zone'}
              {activeTab === 'VITALS' && 'Care Seeker Daily Vitals & Health Biometrics'}
              {activeTab === 'TRACK' && 'Live Phlebotomist Dispatch & Telemetry Radar'}
              {activeTab === 'REPORTS' && 'Digital Health Vault & Lab Reports'}
              {activeTab === 'REFER_CORP' && 'Referrals & Corporate Staff Wellness'}
              {activeTab === 'PROFILE' && 'Care Seeker Profile & Account Settings'}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', position: 'relative' }}>
            {/* Bell Icon for Notifications & Clinical Insights & Reports */}
            <div style={{ position: 'relative' }}>
              <button
                id="medmarg-notification-bell-btn"
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: showNotificationsDropdown ? '#E0F2F1' : '#FFFFFF',
                  border: showNotificationsDropdown ? '1.5px solid #006B70' : '1.5px solid #E2E8F0',
                  color: '#006B70',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s ease'
                }}
                title="Notifications, Clinical Reminders & Reports"
              >
                <Bell size={20} color="#006B70" />
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '18px',
                  height: '18px',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  fontSize: '0.68rem',
                  fontWeight: '900',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(239,68,68,0.4)',
                  border: '2px solid #FFFFFF'
                }}>
                  3
                </span>
              </button>

              {/* Notifications Dropdown Drawer */}
              {showNotificationsDropdown && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  width: '380px',
                  maxWidth: '90vw',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1.5px solid #006B70',
                  boxShadow: '0 16px 40px -10px rgba(0,77,64,0.3)',
                  zIndex: 1200,
                  overflow: 'hidden',
                  animation: 'fadeIn 0.15s ease-out'
                }}>
                  {/* Dropdown Header */}
                  <div style={{
                    padding: '0.95rem 1.15rem',
                    backgroundColor: '#071F1A',
                    color: '#FFFFFF',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Bell size={17} color="#FBBF24" />
                      <span style={{ fontWeight: '900', fontSize: '0.88rem' }}>Health Alerts & Reports</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.68rem', backgroundColor: 'rgba(251,191,36,0.2)', color: '#FBBF24', padding: '0.15rem 0.5rem', borderRadius: '12px', fontWeight: '900' }}>
                        3 Unread
                      </span>
                      <button
                        onClick={() => setShowNotificationsDropdown(false)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#80CBC4',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          fontWeight: '900',
                          padding: 0,
                          lineHeight: 1
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Dropdown Body */}
                  <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {/* Clinical Reminders Section */}
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: '900', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={13} color="#D97706" /> Clinical Reminders
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        <div style={{
                          padding: '0.75rem 0.85rem',
                          backgroundColor: '#FFFBEB',
                          borderRadius: '12px',
                          border: '1px solid #FDE68A'
                        }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: '900', color: '#92400E' }}>
                            Fasting Protocol Reminder
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#B45309', marginTop: '0.2rem', lineHeight: 1.35 }}>
                            Upcoming order includes Fasting Glucose & Lipids. Maintain 8-10h water-only fasting before phlebotomist arrives.
                          </div>
                        </div>

                        <div style={{
                          padding: '0.75rem 0.85rem',
                          backgroundColor: '#F0FDF4',
                          borderRadius: '12px',
                          border: '1px solid #BBF7D0'
                        }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: '900', color: '#166534' }}>
                            Optimal Cold-Chain Guaranteed
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#15803D', marginTop: '0.2rem', lineHeight: 1.35 }}>
                            Samples transported in IoT digital thermal gel carriers at strictly 2°C - 8°C.
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Verified Lab Reports Section */}
                    <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.65rem' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: '900', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <FileText size={13} color="#006B70" /> Recent Lab Reports
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        {[
                          { title: 'Complete Blood Count (CBC)', date: '28 Sep 2026', lab: 'Thyrocare NABL Lab' },
                          { title: 'Thyroid Profile Total (T3/T4/TSH)', date: '15 Aug 2026', lab: 'Thyrocare NABL Lab' },
                          { title: 'HbA1c Glycated Hemoglobin', date: '02 Jul 2026', lab: 'MedMarg Hub' }
                        ].map((rep, rIdx) => (
                          <div
                            key={rIdx}
                            style={{
                              padding: '0.65rem 0.8rem',
                              backgroundColor: '#F8FAFC',
                              borderRadius: '12px',
                              border: '1px solid #E2E8F0',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0, paddingRight: '0.5rem' }}>
                              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {rep.title}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.1rem' }}>
                                📅 {rep.date} • {rep.lab}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                alert(`Downloading official PDF for ${rep.title}`);
                              }}
                              style={{
                                padding: '0.32rem 0.6rem',
                                backgroundColor: '#E0F2F1',
                                color: '#006B70',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.74rem',
                                fontWeight: '800',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                flexShrink: 0
                              }}
                            >
                              <Download size={12} /> PDF
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dropdown Footer Action */}
                  <div style={{ padding: '0.75rem 1rem', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      onClick={() => {
                        setActiveTab('REPORTS');
                        setShowNotificationsDropdown(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: '#006B70',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: '800',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <FolderHeart size={14} /> Open Digital Health Vault →
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowCartDrawer(true)}
              style={{
                padding: '0.65rem 1.25rem',
                backgroundColor: '#006B70',
                color: '#FFF',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                boxShadow: '0 4px 12px rgba(0,107,112,0.25)'
              }}
            >
              <ShoppingBag size={18} color="#FBBF24" />
              <span>Cart ({cart.length}) • ₹{cartTotal}</span>
            </button>
          </div>
        </div>

        {/* MODULAR FEATURE SUBCOMPONENTS */}
        {activeTab === 'HOME' && (
          <CareSeekerHomeTab 
            user={currentUserProfile || user} 
            setActiveTab={setActiveTab} 
            setCatalogSubTab={setCatalogSubTab} 
            setSelectedDetailItem={setSelectedDetailItem} 
            handleOrderWhatsApp={handleOrderWhatsApp} 
            handleOrderCall={handleOrderCall} 
            onOpenPrescriptionModal={() => setShowPrescriptionModal(true)}
            onOpenAddressModal={() => setShowAddressModal(true)}
            addToCart={addToCart}
            catalog={catalog} 
            liveOrdersCount={allOrders.length}
            activeOrder={activeOrder}
            allOrders={allOrders}
          />
        )}

        {activeTab === 'ORDERS' && (
          <CareSeekerOrdersTab 
            orders={allOrders}
            onSelectOrder={(ord) => {
              setActiveOrder(ord);
            }}
            onNavigateToTracking={() => {
              setActiveTab('TRACK');
            }}
            handleOrderCall={handleOrderCall}
          />
        )}

        {activeTab === 'TESTS' && (
          <PatientCatalogMatrixTab 
            catalog={catalog} 
            catalogSubTab={catalogSubTab} 
            setCatalogSubTab={setCatalogSubTab} 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            fastingFilter={fastingFilter} 
            setFastingFilter={setFastingFilter} 
            sampleFilter={sampleFilter} 
            setSampleFilter={setSampleFilter} 
            displayCatalogItems={displayCatalogItems} 
            addToCart={addToCart} 
            cart={cart} 
            setSelectedDetailItem={setSelectedDetailItem} 
          />
        )}

        {activeTab === 'OFFERS_ZONE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Hero Showcase Card with Coming Soon Ribbon */}
            <div style={{
              background: 'linear-gradient(135deg, #071F1A 0%, #004D40 60%, #006B70 100%)',
              borderRadius: '24px',
              padding: '2.5rem',
              color: '#FFFFFF',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 12px 32px rgba(0,77,64,0.25)'
            }}>
              {/* Subtle background circular glow */}
              <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '260px',
                height: '260px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(251,191,36,0.22) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} />

              <div style={{ maxWidth: '680px', position: 'relative', zIndex: 2 }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: '#FEF3C7',
                  color: '#92400E',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: '900',
                  letterSpacing: '0.5px',
                  marginBottom: '1rem'
                }}>
                  <Sparkles size={14} color="#D97706" />
                  <span>MEDMARG OFFERS ZONE • COMING SOON</span>
                </div>

                <h2 style={{ fontSize: '2.2rem', fontWeight: '900', lineHeight: 1.2, margin: 0 }}>
                  Exclusive Diagnostic Privilege Passes & Cashbacks
                </h2>
                <p style={{ color: '#80CBC4', fontSize: '0.96rem', marginTop: '0.75rem', lineHeight: 1.6 }}>
                  We are crafting Tirupati's most rewarding healthcare membership. Unlock direct pathology subsidies, annual family checkup discounts, and instant CareCoin rewards on every diagnostic test.
                </p>

                {/* Priority Waitlist / Notify Box */}
                <div style={{ marginTop: '1.75rem', display: 'flex', gap: '0.85rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  {!offersNotifySubmitted ? (
                    <button
                      onClick={() => setOffersNotifySubmitted(true)}
                      style={{
                        padding: '0.75rem 1.4rem',
                        backgroundColor: '#F59E0B',
                        color: '#0F172A',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '900',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 14px rgba(245,158,11,0.35)'
                      }}
                    >
                      <Sparkles size={16} /> Get Early Access / Notify Me
                    </button>
                  ) : (
                    <div style={{
                      padding: '0.75rem 1.25rem',
                      backgroundColor: '#D1FAE5',
                      color: '#065F46',
                      borderRadius: '12px',
                      fontWeight: '800',
                      fontSize: '0.88rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      border: '1.5px solid #34D399'
                    }}>
                      <CheckCircle2 size={18} color="#059669" />
                      <span>✓ You are on the VIP waitlist! We will notify you first.</span>
                    </div>
                  )}

                  <button
                    onClick={() => setActiveTab('HOME')}
                    style={{
                      padding: '0.75rem 1.25rem',
                      backgroundColor: 'rgba(255,255,255,0.12)',
                      color: '#FFFFFF',
                      border: '1px solid rgba(255,255,255,0.25)',
                      borderRadius: '12px',
                      fontWeight: '800',
                      fontSize: '0.88rem',
                      cursor: 'pointer'
                    }}
                  >
                    Explore Current Home Offers →
                  </button>
                </div>
              </div>
            </div>

            {/* Preview of Upcoming Privileges Grid */}
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                  Privileges Coming Soon to Your Offers Zone
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
                  Preview what our healthcare privilege programs will unlock for your family.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {[
                  {
                    icon: '💎',
                    badge: 'TIER PASS',
                    title: 'MedMarg Annual Family Pass',
                    desc: 'Flat 70% discount on 913+ diagnostic tests for up to 4 family members with zero collection charges all year.',
                    tag: 'Launch: Q4 2026'
                  },
                  {
                    icon: '👵',
                    badge: 'SENIOR CARE',
                    title: 'Senior Citizen Quarterly Subsidy',
                    desc: 'Instant ₹500 discount vouchers on vital Diabetic, Cardiac, and Liver panels every 90 days for 60+ age group.',
                    tag: 'Auto-Applied'
                  },
                  {
                    icon: '🪙',
                    badge: 'CARECOINS',
                    title: '10% Cashback on Phlebotomy Visits',
                    desc: 'Earn MedMarg CareCoins with every home sample collection. Redeem instantly against pharmacy or upcoming tests.',
                    tag: '1 Coin = ₹1'
                  },
                  {
                    icon: '⚡',
                    badge: 'FLASH HOURS',
                    title: 'Express 60-Min Priority Dispatch',
                    desc: 'Complimentary priority phlebotomist slots during morning fasting windows (6:00 AM – 9:00 AM).',
                    tag: 'Zero Wait TAT'
                  }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '20px',
                      padding: '1.5rem',
                      border: '1.5px solid #E2E8F0',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '1rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.75rem' }}>{item.icon}</span>
                        <span style={{ fontSize: '0.68rem', backgroundColor: '#E0F2F1', color: '#006B70', padding: '0.18rem 0.55rem', borderRadius: '6px', fontWeight: '900' }}>
                          {item.badge}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A', marginTop: '0.75rem', lineHeight: 1.3 }}>
                        {item.title}
                      </h4>
                      <p style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.35rem', lineHeight: 1.5 }}>
                        {item.desc}
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem' }}>
                      <span style={{ fontSize: '0.74rem', color: '#D97706', fontWeight: '800' }}>
                        {item.tag}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '700' }}>
                        Coming Soon
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'VITALS' && (
          <CareSeekerVitalsModule 
            user={user} 
          />
        )}

        {activeTab === 'TRACK' && (
          <CareSeekerTrackingTab 
            activeOrder={activeOrder} 
            allOrders={allOrders}
            onSelectOrder={(ord) => setActiveOrder(ord)}
            handleOrderCall={handleOrderCall} 
          />
        )}

        {activeTab === 'REPORTS' && (
          <PatientReportsTab 
            user={user} 
          />
        )}

        {activeTab === 'REFER_CORP' && (
          <PatientReferralAndCorporate
            user={user}
            cart={cart}
            addToCart={addToCart}
            setSelectedDetailItem={setSelectedDetailItem}
          />
        )}

        {activeTab === 'PROFILE' && (
          <PatientProfileTab 
            user={currentUserProfile || user} 
            onLogout={onLogout} 
            onOpenAddressModal={() => setShowAddressModal(true)}
            savedAddresses={savedAddresses}
            onUpdateUser={(updated) => {
              setCurrentUserProfile(updated);
            }}
          />
        )}

      </main>

      {/* 3. FLOATING ACTION DOCK (WHATSAPP, CALL, INSTANT SEARCH) */}
      <CareSeekerFloatingActionBar
        onOpenSearch={() => {
          setActiveTab('HOME');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        handleOrderWhatsApp={handleOrderWhatsApp}
        handleOrderCall={handleOrderCall}
      />

      {/* 4. FLOATING VIEW CART BAR (DYNAMIC MODULE ON CART > 0) */}
      {!showCartDrawer && cart.length > 0 && (
        <FloatingCartButton
          cart={cart}
          cartTotal={cartTotal}
          onOpenCart={() => setShowCartDrawer(true)}
          selectedLabProvider={selectedLabProvider}
        />
      )}

      {/* MODULAR OVERLAYS */}
      
      {/* 1. Slide-over Cart Drawer with In-Cart Test Browser */}
      <PatientCartDrawer
        isOpen={showCartDrawer}
        onClose={() => setShowCartDrawer(false)}
        cart={cart}
        removeFromCart={removeFromCart}
        addToCart={addToCart}
        onProceedToCheckout={() => setShowCheckoutModal(true)}
        catalog={catalog}
        selectedLabProvider={selectedLabProvider}
        setSelectedLabProvider={handleLabChange}
      />

      {/* 2. Multi-step Checkout & Booking Modal */}
      <CareSeekerCheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        cart={cart}
        user={currentUserProfile || user}
        savedAddresses={savedAddresses}
        onOpenAddressModal={() => setShowAddressModal(true)}
        onOrderSuccess={handleOrderSuccess}
        selectedLabProvider={selectedLabProvider}
      />

      {/* 3. Universal Test/Package Detail Sheet */}
      <CareSeekerUniversalItemSheet
        item={selectedDetailItem}
        catalog={catalog}
        selectedLabProvider={selectedLabProvider}
        setSelectedLabProvider={handleLabChange}
        onClose={() => setSelectedDetailItem(null)}
        onAddToCart={addToCart}
        isInCart={selectedDetailItem ? cart.some(c => (c.baseId || c.id) === (selectedDetailItem.id || selectedDetailItem.code || selectedDetailItem.name) || c.code === selectedDetailItem.code) : false}
      />

      {/* 4. Prescription Upload Modal */}
      <CareSeekerPrescriptionModal
        isOpen={showPrescriptionModal}
        onClose={() => setShowPrescriptionModal(false)}
        user={user}
      />

      {/* 5. Address Manager Modal with Draggable Pinpoint Map */}
      <CareSeekerAddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSaveAddress={handleSaveAddress}
      />

      {/* 6. Contact Number Verification for Care Seekers */}
      <CareSeekerPhoneModal
        isOpen={showPhoneModal}
        user={currentUserProfile}
        onPhoneSaved={handlePhoneSaved}
      />

    </div>
  );
}
