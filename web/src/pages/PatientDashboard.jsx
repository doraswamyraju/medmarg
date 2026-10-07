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
  Sparkles
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

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState([
    { id: 'addr_1', label: 'Home', address: 'Plot 42, Air Bypass Road, Tirupati, AP - 517501', isDefault: true, city: 'Tirupati, AP', pincode: '517501' },
    { id: 'addr_2', label: 'Parents', address: 'Door 12-4/A, Gandhi Road, Tirupati, AP - 517502', isDefault: false, city: 'Tirupati, AP', pincode: '517502' }
  ]);

  // Selected Processing Laboratory (MedMarg, Thyrocare, Lalpath) with persistence
  const [selectedLabProvider, setSelectedLabProvider] = useState(getPreferredLab);

  // Cart State (Array of Base Items)
  const [cart, setCart] = useState([
    {
      id: 'MM_MASTER',
      baseId: 'MM_MASTER',
      code: 'MM_MASTER',
      name: 'MedMarg Master Health Checkup (Comprehensive)',
      itemType: 'PACKAGE',
      fasting: 'YES',
      sampleType: 'SERUM, EDTA, URINE',
      price: 1499,
      mrp: 3999,
      tatHours: 24
    }
  ]);

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
        labPricing: item.labPricing || null
      }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => (item.id !== id && item.code !== id && item.baseId !== id)));
  };

  const cartTotal = cart.reduce((sum, item) => {
    const p = getItemPriceForLab(item, selectedLabProvider);
    return sum + (p.price || item.price || 0);
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

  const navMenuItems = [
    { key: 'HOME', label: 'Home', icon: HomeIcon },
    { key: 'TESTS', label: 'Labs & Tests Matrix', icon: FlaskConical, badge: `${catalog.tests?.length || 913}+` },
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
                    {user?.name || 'Rahul Sharma'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#80CBC4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.phone || user?.identifier || '+91 98765 43210'}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
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
              {activeTab === 'TESTS' && 'Pathology Lab Tests Matrix & Packages'}
              {activeTab === 'VITALS' && 'Care Seeker Daily Vitals & Health Biometrics'}
              {activeTab === 'TRACK' && 'Live Phlebotomist Dispatch & Telemetry Radar'}
              {activeTab === 'REPORTS' && 'Digital Health Vault & Lab Reports'}
              {activeTab === 'REFER_CORP' && 'Referrals & Corporate Staff Wellness'}
              {activeTab === 'PROFILE' && 'Care Seeker Profile & Account Settings'}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
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
            user={user} 
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
            user={user} 
            onLogout={onLogout} 
            onOpenAddressModal={() => setShowAddressModal(true)}
            savedAddresses={savedAddresses}
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
        setSelectedLabProvider={setSelectedLabProvider}
      />

      {/* 2. Multi-step Checkout & Booking Modal */}
      <CareSeekerCheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        cart={cart}
        user={user}
        savedAddresses={savedAddresses}
        onOpenAddressModal={() => setShowAddressModal(true)}
        onOrderSuccess={handleOrderSuccess}
        selectedLabProvider={selectedLabProvider}
      />

      {/* 3. Universal Test/Package Detail Sheet */}
      <CareSeekerUniversalItemSheet
        item={selectedDetailItem}
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

    </div>
  );
}
