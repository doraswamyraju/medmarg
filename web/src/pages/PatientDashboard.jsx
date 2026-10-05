import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Home as HomeIcon, 
  Activity, 
  FolderHeart, 
  User, 
  ShoppingBag, 
  Gift, 
  Building2,
  CheckCircle2
} from 'lucide-react';
import initialCatalog from '../data/catalogData.json';
import { getCatalogState, filterCatalogItems } from '../data/catalogStore';
import { API_BASE } from '../data/apiConfig';

// Role-Specific Modular Subcomponents (src/components/patient/)
import PatientHomeTab from '../components/patient/PatientHomeTab';
import PatientCatalogMatrixTab from '../components/patient/PatientCatalogMatrixTab';
import PatientTrackingTab from '../components/patient/PatientTrackingTab';
import PatientReportsTab from '../components/patient/PatientReportsTab';
import PatientProfileTab from '../components/patient/PatientProfileTab';
import PatientReferralAndCorporate from '../components/patient/PatientReferralAndCorporate';
import PatientAddressModal from '../components/patient/PatientAddressModal';
import PatientCartDrawer from '../components/patient/PatientCartDrawer';
import PatientCheckoutModal from '../components/patient/PatientCheckoutModal';
import PatientUniversalItemSheet from '../components/patient/PatientUniversalItemSheet';
import PatientPrescriptionModal from '../components/patient/PatientPrescriptionModal';

export default function PatientDashboard({ user, onSwitchRole, onLogout }) {
  // 6 CORE NAVIGATION TABS: HOME, TESTS, TRACK, REPORTS, REFER_CORP, PROFILE
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

  // Cart State
  const [cart, setCart] = useState([
    {
      id: 'pkg_mm_master',
      name: 'MedMarg Master Health Checkup (Comprehensive)',
      lab: 'MedMarg Central Processing Hub',
      price: 1499,
      mrp: 3999,
      params: 92,
      fasting: 'YES',
      sampleType: 'SERUM, EDTA, URINE'
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
      eta: '25 Mins',
      tempTelemetry: '4.2°C (Optimal Cold-Chain)',
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

  // Fetch live patient orders from backend
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
    const itemId = item.id || item.code || item.name;
    if (!cart.some(cartItem => cartItem.id === itemId)) {
      setCart([...cart, {
        id: itemId,
        name: item.name || item.title,
        lab: item.lab || 'MedMarg Central Processing Hub',
        price: item.price || 499,
        mrp: item.mrp || (item.price ? Math.round(item.price * 1.6) : 999),
        params: item.testCount || item.params || 1,
        fasting: item.fasting || 'NO',
        sampleType: item.sampleType || item.sampleTypes?.join(', ') || 'SERUM'
      }]);
    }
    setShowCartDrawer(true);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  const handleOrderWhatsApp = (customText = '') => {
    const defaultMsg = encodeURIComponent(
      `Hello MedMarg, I would like to book a Diagnostic Health Test / Home Sample Collection.\n\nPatient Name: ${user?.name || 'Rahul Sharma'}\nContact: ${user?.phone || user?.identifier || '+91 98765 43210'}\nLocation: Tirupati, AP\n${customText ? `Requested Test: ${customText}` : ''}`
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
    { key: 'TRACK', label: 'Live Tracking', icon: Activity, badge: `${allOrders.length} Active` },
    { key: 'REPORTS', label: 'Health Vault', icon: FolderHeart, badge: 'NABL' },
    { key: 'REFER_CORP', label: 'Refer & Corporate', icon: Gift, badge: '₹400' },
    { key: 'PROFILE', label: 'Patient Profile', icon: User }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* 1. SIDEBAR */}
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

        <div style={{ padding: '1rem', borderTop: '1px solid #003830' }}>
          {!sidebarCollapsed ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {user?.picture || user?.avatar ? (
                  <img src={user?.picture || user?.avatar} alt={user?.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#006B70', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.85rem' }}>
                    {user?.name ? user.name[0].toUpperCase() : 'R'}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#FFF' }}>{user?.name || 'Rahul Sharma'}</div>
                  <div style={{ fontSize: '0.72rem', color: '#80CBC4' }}>{user?.phone || user?.identifier || '+91 98765 43210'}</div>
                </div>
              </div>
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
      <main style={{ flex: 1, overflowY: 'auto', padding: '1.75rem 2.5rem', maxHeight: '100vh' }}>
        
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
              {activeTab === 'TESTS' && 'Pathology Lab Tests Matrix & Packages'}
              {activeTab === 'TRACK' && 'Live Sample Tracker & Telemetry'}
              {activeTab === 'REPORTS' && 'Digital Health Locker & Reports'}
              {activeTab === 'REFER_CORP' && 'Referrals & Corporate Staff Wellness'}
              {activeTab === 'PROFILE' && 'Patient Profile & Account Settings'}
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
          <PatientHomeTab 
            user={user} 
            setActiveTab={setActiveTab} 
            setCatalogSubTab={setCatalogSubTab} 
            setSelectedDetailItem={setSelectedDetailItem} 
            handleOrderWhatsApp={handleOrderWhatsApp} 
            handleOrderCall={handleOrderCall} 
            onOpenPrescriptionModal={() => setShowPrescriptionModal(true)}
            onOpenAddressModal={() => setShowAddressModal(true)}
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

        {activeTab === 'TRACK' && (
          <PatientTrackingTab 
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
      />

      {/* 2. Multi-step Checkout & Booking Modal */}
      <PatientCheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        cart={cart}
        user={user}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* 3. Universal Test/Package Detail Sheet */}
      <PatientUniversalItemSheet
        item={selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
        onAddToCart={addToCart}
        isInCart={selectedDetailItem ? cart.some(c => c.id === (selectedDetailItem.id || selectedDetailItem.code || selectedDetailItem.name)) : false}
      />

      {/* 4. Prescription Upload Modal */}
      <PatientPrescriptionModal
        isOpen={showPrescriptionModal}
        onClose={() => setShowPrescriptionModal(false)}
        user={user}
      />

      {/* 5. Address Manager Modal */}
      <PatientAddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSaveAddress={handleSaveAddress}
      />

    </div>
  );
}
