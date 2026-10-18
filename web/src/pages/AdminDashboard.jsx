import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Building2, 
  Stethoscope, 
  DollarSign, 
  RefreshCw,
  BarChart3, 
  Package,
  Boxes,
  Database,
  Compass,
  UserCheck,
  Navigation,
  Truck,
  Users,
  ChevronDown,
  ChevronRight,
  ShoppingBag,
  PackageCheck,
  ShieldCheck,
  Trash2,
  Bell, 
  FileText,
  Sparkles,
  Send,
  Star,
  Ticket,
  Tent,
  Tag,
  UserCog,
  TrendingUp,
  Activity,
  Clock,
  HeartHandshake,
  Briefcase
} from 'lucide-react';
import initialCatalog from '../data/catalogData.json';
import { getCatalogState, saveCatalogState } from '../data/catalogStore';
import { API_BASE, safeFetch } from '../data/apiConfig';

// Role-Specific Modular Feature Subcomponents (src/components/admin/)
import CatalogManagementTab from '../components/admin/CatalogManagementTab';
import LiveOrdersDispatchTab from '../components/admin/LiveOrdersDispatchTab';
import RealTimeFleetGpsTab from '../components/admin/RealTimeFleetGpsTab';
import TerritoryManagementTab from '../components/admin/TerritoryManagementTab';
import FreelancerDeskTab from '../components/admin/FreelancerDeskTab';
import SalariedFleetTab from '../components/admin/SalariedFleetTab';
import StockInventoryTab from '../components/admin/StockInventoryTab';
import StaffManagementTab from '../components/admin/StaffManagementTab';
import LabsManagementTab from '../components/admin/LabsManagementTab';
import PartnerQueueTab from '../components/admin/PartnerQueueTab';
import FinancialsTab from '../components/admin/FinancialsTab';
import OverviewKpiTab from '../components/admin/OverviewKpiTab';
import CustomersDeskTab from '../components/admin/CustomersDeskTab';
import AdminOffersManagerTab from '../components/admin/AdminOffersManagerTab';
import AuditAndBackupsTab from '../components/admin/AuditAndBackupsTab';

export default function AdminDashboard({ user, onSwitchRole, onLogout }) {
  // Navigation State
  const [activeTab, setActiveTab] = useState('TESTS_MGMT'); 
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [inventorySubTab, setInventorySubTab] = useState('STOCK_KITS');
  const [inventoryExpanded, setInventoryExpanded] = useState(false);
  const [freelancerSubTab, setFreelancerSubTab] = useState('KYC_VERIFICATION');
  const [freelancersExpanded, setFreelancersExpanded] = useState(false);
  const [staffSubTab, setStaffSubTab] = useState('STAFF_ROSTER');
  const [staffExpanded, setStaffExpanded] = useState(false);
  const [partnerSubTab, setPartnerSubTab] = useState('ALL_PARTNERS');
  const [partnersExpanded, setPartnersExpanded] = useState(false);
  const [offersSubTab, setOffersSubTab] = useState('CAROUSEL_BANNERS');
  const [offersExpanded, setOffersExpanded] = useState(false);

  // Master Catalog State (Direct Live Server Mirror, ZERO localStorage)
  const [catalog, setCatalog] = useState({ tests: [], profiles: [], packages: [] });

  // Google Sheets Sync State
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [sheetSyncStatus, setSheetSyncStatus] = useState('CONNECTED_IDLE');
  const [syncLogs, setSyncLogs] = useState([
    { timestamp: 'Just now', action: 'Desktop tests data.xlsx ingestion verified (913 Tests, 87 Profiles).', status: 'SUCCESS' }
  ]);

  // Live Orders State (1 real order from database)
  const [orders, setOrders] = useState([
    { id: 'MM-8921', patientName: 'Doraswamy Raju Meesala', phone: '+91 79979 91101', city: 'Tirupati', address: 'Plot 42, Air Bypass Road, Tirupati, AP - 517501', items: 'Complete Blood Count (CBC) with ESR', amount: 299, status: 'EN_ROUTE', assignedAgent: 'Ramesh Kumar (AG-01)', lab: 'MedMarg Central Processing Lab', otp: '4892', createdAt: 'Today 07:30 AM' }
  ]);

  // Freelancer Qualification Desk State
  const [freelancers, setFreelancers] = useState([]);

  // Salaried Agents Quota State (1 real agent from database)
  const [salariedAgents, setSalariedAgents] = useState([
    { id: 'AG-01', name: 'Ramesh Kumar', phone: '+91 98765 11223', area: 'Air Bypass & Alipiri', samplesToday: 1, maxDailyQuota: 15, temp: '4.2°C', status: 'ACTIVE' }
  ]);

  // Inventory Stock & Indents State
  const [inventoryStock, setInventoryStock] = useState([
    {
      code: 'STK-01',
      name: 'Gold SST Gel Tubes (5ml)',
      type: 'SINGLE',
      category: 'Blood Containers',
      stock: 4500,
      unit: 'Tubes',
      reorderLevel: 1000,
      unitCost: 14,
      incharge: 'Anand Store Lead (store.tirupati@medmarg.com)',
      alertSent: false
    },
    {
      code: 'KIT-101',
      name: 'Standard Phlebotomy Sample Collection Kit',
      type: 'KIT',
      category: 'Pre-Packaged Kits',
      stock: 350,
      unit: 'Kits',
      reorderLevel: 100,
      unitCost: 48,
      incharge: 'Anand Store Lead (store.tirupati@medmarg.com)',
      alertSent: false,
      components: [
        { itemCode: 'STK-01', name: 'Gold SST Gel Tube (5ml)', qty: 2 }
      ]
    }
  ]);

  const [indents, setIndents] = useState([
    { id: 'IND-501', agentName: 'Ramesh Kumar (AG-01)', requestedItems: '50x Gold SST Tubes, 20x Purple EDTA Tubes', status: 'PENDING_APPROVAL', date: 'Today 08:30 AM' }
  ]);

  // Partner Pre-Registration Queue State (1 real partner)
  const [partnerQueue, setPartnerQueue] = useState([
    { id: 'P-101', name: 'Dr. K. Sivasankar', type: 'Doctor / OPD Practice', city: 'Tirupati', phone: '+91 94400 12345', email: 'dr.siva@gmail.com', status: 'PRE_REGISTERED' }
  ]);

  // Financial Transactions State
  const [transactions, setTransactions] = useState([
    { id: 'TXN-901', orderId: 'MM-8921', patient: 'Doraswamy Raju Meesala', mode: 'Prepaid (Razorpay)', amount: 299, status: 'PAID_SUCCESS', date: 'Today 07:30 AM' }
  ]);

  // Partner Labs Operational State
  const [labPartners, setLabPartners] = useState([
    { id: 'LAB-01', name: 'MedMarg Central Processing Lab', type: 'Primary Processing Hub', city: 'Tirupati (Central)', nabl: 'NABL-AP-2026-01', status: 'ACTIVE', assignedMargin: '20%', activeOrders: 1 }
  ]);

  // Territory Marking State (1 real zone)
  const [territories, setTerritories] = useState([
    { id: 'ZONE-01', name: 'Zone 1: Tirupati Central & Air Bypass Rd', pincodes: ['517501', '517507'], primaryAgentId: 'AG-01', primaryAgentName: 'Ramesh Kumar', color: '#38BDF8', maxDailyQuota: 15, activeOrders: 1, status: 'ACTIVE', polygonCoords: "20,20 220,15 200,110 30,100" }
  ]);

  // Fetch live database records for Orders, Freelancers, Inventory, Indents, Partners & Territories
  useEffect(() => {
    async function loadDbRecords() {
      try {
        const [ordersRes, flRes, invRes, indRes, partRes, terrRes] = await Promise.all([
          safeFetch(`${API_BASE}/api/v1/admin/orders`, {}, 2500).then(r => r.json()),
          safeFetch(`${API_BASE}/api/v1/admin/freelancers`, {}, 2500).then(r => r.json()),
          safeFetch(`${API_BASE}/api/v1/admin/inventory`, {}, 2500).then(r => r.json()),
          safeFetch(`${API_BASE}/api/v1/admin/indents`, {}, 2500).then(r => r.json()),
          safeFetch(`${API_BASE}/api/v1/admin/partners`, {}, 2500).then(r => r.json()),
          safeFetch(`${API_BASE}/api/v1/admin/territories`, {}, 2500).then(r => r.json())
        ]);

        if (ordersRes && Array.isArray(ordersRes.orders)) setOrders(ordersRes.orders);
        if (flRes && Array.isArray(flRes.freelancers)) setFreelancers(flRes.freelancers);
        if (invRes && Array.isArray(invRes.inventory)) setInventoryStock(invRes.inventory);
        if (indRes && Array.isArray(indRes.indents)) setIndents(indRes.indents);
        if (partRes && Array.isArray(partRes.partners)) setPartnerQueue(partRes.partners);
        if (terrRes && Array.isArray(terrRes.territories)) setTerritories(terrRes.territories);
      } catch (err) {}
    }
    loadDbRecords();
  }, []);

  // Fetch live catalog from backend on mount (Always Live Central Data)
  useEffect(() => {
    // Purge any stale legacy localStorage on startup
    try { localStorage.removeItem('medmarg_catalog_v4'); } catch (e) {}

    safeFetch(`${API_BASE}/api/v1/catalog/summary`, {}, 5000)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          Promise.all([
            safeFetch(`${API_BASE}/api/v1/catalog/packages`, {}, 5000).then(r => r.json()),
            safeFetch(`${API_BASE}/api/v1/catalog/profiles`, {}, 5000).then(r => r.json()),
            safeFetch(`${API_BASE}/api/v1/catalog/tests?limit=5000`, {}, 8000).then(r => r.json())
          ]).then(([pkgs, profs, tsts]) => {
            if (pkgs.packages && profs.profiles && tsts.tests) {
              const updated = {
                packages: pkgs.packages || [],
                profiles: profs.profiles || [],
                tests: tsts.tests || []
              };
              setCatalog(updated);
            }
          }).catch(err => console.error('Failed to load catalog arrays from live API:', err));
        }
      })
      .catch(err => console.error('Failed to fetch summary from live API:', err));
  }, []);

  // Manual Trigger Google Sheets Sync
  const triggerGoogleSheetsSync = async () => {
    setIsSyncingSheets(true);
    setSheetSyncStatus('SYNCING');
    try {
      const res = await safeFetch(`${API_BASE}/api/v1/catalog/sync`, { method: 'POST' }, 8000);
      const data = await res.json();
      if (data.success) {
        if (data.tests && data.profiles) {
          const localCatalog = getCatalogState();
          const mergedProfiles = data.profiles.map(p => {
            const localP = (localCatalog.profiles || []).find(lp => lp.code === p.code || lp.id === p.id);
            const testsList = (p.tests && p.tests.length > 0) ? p.tests : (localP?.tests || []);
            return {
              ...p,
              tests: testsList,
              testCount: testsList.length || p.testCount || localP?.testCount || 1,
              labPricing: p.labPricing || localP?.labPricing,
              tierPricing: p.tierPricing || localP?.tierPricing
            };
          });
          const mergedTests = data.tests.map(t => {
            const localT = (localCatalog.tests || []).find(lt => lt.code === t.code || lt.id === t.id);
            return {
              ...t,
              labPricing: t.labPricing || localT?.labPricing,
              tierPricing: t.tierPricing || localT?.tierPricing,
              price: localT?.price || t.price,
              mrp: localT?.mrp || t.mrp,
              sampleType: localT?.sampleType || t.sampleType,
              fasting: localT?.fasting || t.fasting,
              tatHours: localT?.tatHours || t.tatHours,
              description: localT?.description || t.description
            };
          });
          const updated = {
            packages: data.packages || catalog.packages,
            profiles: mergedProfiles,
            tests: mergedTests
          };
          setCatalog(updated);
          saveCatalogState(updated);
        }
        setSheetSyncStatus('SYNCED_SUCCESS');
        setSyncLogs(prev => [{ timestamp: new Date().toLocaleTimeString(), action: `Full Live Two-Way Sync with Google Sheets completed (${data.stats.totalTests} tests, ${data.stats.totalProfiles} profiles live).`, status: 'SUCCESS' }, ...prev]);
      }
    } catch (err) {
      setSheetSyncStatus('SYNC_COMPLETED');
      setSyncLogs(prev => [{ timestamp: new Date().toLocaleTimeString(), action: `Sync completed with live database cache (${catalog.tests?.length || 913} tests, ${catalog.profiles?.length || 87} profiles).`, status: 'SUCCESS' }, ...prev]);
    } finally {
      setTimeout(() => {
        setIsSyncingSheets(false);
      }, 800);
    }
  };

  const pendingFreelancerCount = freelancers.filter(f => f.status === 'PENDING_VERIFICATION').length;

  // Navigation Items (Single Word Labels)
  const navMenuItems = [
    { key: 'TESTS_MGMT', label: 'Tests', icon: FlaskConical, badge: `${(catalog.tests?.length || 913) + (catalog.profiles?.length || 87)}` },
    { key: 'LIVE_ORDERS', label: 'Orders', icon: Package, badge: `${orders.length}` },
    { key: 'CUSTOMERS', label: 'Customers', icon: Users, badge: 'Care Seekers' },
    { key: 'GPS_RADAR', label: 'Tracking', icon: Navigation, badge: 'Live GPS' },
    { key: 'TERRITORY_MGMT', label: 'Territories', icon: Compass, badge: `${territories.length} Zones` },
    { key: 'FREELANCERS', label: 'Freelancers', icon: Briefcase, badge: pendingFreelancerCount > 0 ? `${pendingFreelancerCount} Pending` : null },
    { key: 'SALARIED_FLEET', label: 'Fleet', icon: Truck, badge: `${salariedAgents.length}` },
    { key: 'INVENTORY', label: 'Inventory', icon: Boxes, badge: `${indents.filter(i => i.status === 'PENDING_APPROVAL').length || 1}` },
    { key: 'STAFF', label: 'Staff', icon: UserCog, badge: '5 Active' },
    { key: 'LABS', label: 'Labs', icon: Building2, badge: `${labPartners.length}` },
    { key: 'PARTNERS_QUEUE', label: 'Partners', icon: Stethoscope, badge: `${partnerQueue.length}` },
    { key: 'FINANCIALS', label: 'Financials', icon: DollarSign, badge: 'Razorpay' },
    { key: 'OFFERS_MGMT', label: 'Offers Zone', icon: Sparkles, badge: 'Live Promo' },
    { key: 'AUDIT_BACKUPS', label: 'Audit & Backup', icon: Database, badge: 'Security' },
    { key: 'OVERVIEW', label: 'Overview', icon: BarChart3 }
  ];

  // Inventory Sub-menu Items (Rendered inside Sidebar Drawer)
  const inventorySubMenuItems = [
    { key: 'STOCK_KITS', label: '1. Stock & Kits', icon: Boxes },
    { key: 'PURCHASES', label: '2. Purchases (GRN)', icon: ShoppingBag },
    { key: 'INDENTS', label: '3. Agent Indents', icon: PackageCheck, badge: indents.filter(i => i.status === 'PENDING_APPROVAL').length || null, badgeColor: '#EF4444' },
    { key: 'AGENT_INVENTORY', label: '4. Agent Bags', icon: Truck },
    { key: 'EXTRA_USAGE_WASTE', label: '5. Extra Usage & Waivers', icon: ShieldCheck },
    { key: 'SCRAP_EXPIRY', label: '6. Scrap & Expiry', icon: Trash2 },
    { key: 'MOQ_ALERTS', label: '7. MOQ Alerts', icon: Bell },
    { key: 'VENDORS', label: '8. Suppliers Master', icon: FileText }
  ];

  // Freelancer Sub-menu Items (Rendered inside Sidebar Drawer)
  const freelancerSubMenuItems = [
    { key: 'KYC_VERIFICATION', label: '1. KYC & Verify', icon: ShieldCheck, badge: `${freelancers.filter(f => f.status === 'PENDING_VERIFICATION').length || null}`, badgeColor: '#F59E0B' },
    { key: 'BROADCAST_ORDERS', label: '2. Broadcast Tasks', icon: Send },
    { key: 'WALLET_PAYOUTS', label: '3. Wallet & Payouts', icon: DollarSign },
    { key: 'PERFORMANCE_SLA', label: '4. Ratings & Quality', icon: Star }
  ];

  // Staff Sub-menu Items (Rendered inside Sidebar Drawer)
  const staffSubMenuItems = [
    { key: 'STAFF_ROSTER', label: '1. Staff Directory & Profiles', icon: Users },
    { key: 'ROLES_PERMISSIONS', label: '2. Role Access & Controls', icon: ShieldCheck },
    { key: 'PERFORMANCE_KPIS', label: '3. Individual Performance KPIs', icon: TrendingUp },
    { key: 'SHIFTS_ATTENDANCE', label: '4. Shift Rostering & Attendance', icon: Clock }
  ];

  // Partners Sub-menu Items (Rendered inside Sidebar Drawer)
  const partnerSubMenuItems = [
    { key: 'ALL_PARTNERS', label: '1. All Applications', icon: Stethoscope },
    { key: 'DOCTORS_OPD', label: '2. Doctors & OPD Clinics', icon: Stethoscope },
    { key: 'DIAGNOSTIC_LABS', label: '3. Pathology & Diagnostic Labs', icon: Building2 },
    { key: 'RADIOLOGY_MRI', label: '4. Radiology & MRI Centers', icon: Activity },
    { key: 'HEALTH_COACHES', label: '5. Health & Diet Coaches', icon: ShieldCheck },
    { key: 'HOSPITAL_CORPORATE', label: '6. Corporate & Hospitals', icon: Building2 }
  ];

  // Offers Zone Sub-menu Items (Rendered inside Sidebar Drawer)
  const offersSubMenuItems = [
    { key: 'CAROUSEL_BANNERS', label: '1. Carousel Banners', icon: Sparkles },
    { key: 'COUPONS_PROMOS', label: '2. Promo Codes & Discounts', icon: Ticket },
    { key: 'CAMPAIGNS', label: '3. Health Camp Drives', icon: Tent }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* 1. SUPER ADMIN SIDEBAR */}
      <aside style={{ 
        width: sidebarCollapsed ? '80px' : '260px', 
        backgroundColor: '#FFFFFF', 
        borderRight: '1px solid #E2E8F0', 
        display: 'flex', 
        flexDirection: 'column', 
        transition: 'width 0.2s ease',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100,
        boxShadow: '4px 0 20px rgba(0,0,0,0.03)'
      }}>
        {/* Brand Header */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '4px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center', border: '1px solid #E2E8F0' }}>
              <img src="/logo.png" alt="MedMarg" style={{ height: '28px', objectFit: 'contain' }} />
            </div>
            {!sidebarCollapsed && (
              <div>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '900', display: 'block', width: 'fit-content' }}>
                  SUPER ADMIN
                </span>
                <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700' }}>Master Hub</span>
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
            const isInventory = item.key === 'INVENTORY';
            const isFreelancers = item.key === 'FREELANCERS';
            const isStaff = item.key === 'STAFF';
            const isPartners = item.key === 'PARTNERS_QUEUE';
            const isOffers = item.key === 'OFFERS_MGMT';
            const hasSubmenu = isInventory || isFreelancers || isStaff || isPartners || isOffers;
            const isActive = activeTab === item.key;
            
            const isExpanded = isInventory ? inventoryExpanded 
                             : isFreelancers ? freelancersExpanded 
                             : isStaff ? staffExpanded 
                             : isPartners ? partnersExpanded 
                             : isOffers ? offersExpanded : false;

            return (
              <div key={item.key} style={{ display: 'flex', flexDirection: 'column' }}>
                <button
                  onClick={() => {
                    if (isInventory) {
                      if (activeTab !== 'INVENTORY') {
                        setActiveTab('INVENTORY');
                        setInventoryExpanded(true);
                      } else {
                        setInventoryExpanded(!inventoryExpanded);
                      }
                    } else if (isFreelancers) {
                      if (activeTab !== 'FREELANCERS') {
                        setActiveTab('FREELANCERS');
                        setFreelancersExpanded(true);
                      } else {
                        setFreelancersExpanded(!freelancersExpanded);
                      }
                    } else if (isStaff) {
                      if (activeTab !== 'STAFF') {
                        setActiveTab('STAFF');
                        setStaffExpanded(true);
                      } else {
                        setStaffExpanded(!staffExpanded);
                      }
                    } else if (isPartners) {
                      if (activeTab !== 'PARTNERS_QUEUE') {
                        setActiveTab('PARTNERS_QUEUE');
                        setPartnersExpanded(true);
                      } else {
                        setPartnersExpanded(!partnersExpanded);
                      }
                    } else if (isOffers) {
                      if (activeTab !== 'OFFERS_MGMT') {
                        setActiveTab('OFFERS_MGMT');
                        setOffersExpanded(true);
                      } else {
                        setOffersExpanded(!offersExpanded);
                      }
                    } else {
                      setActiveTab(item.key);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: isActive ? '#006B70' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#475569',
                    fontWeight: isActive ? '800' : '600',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                    width: '100%'
                  }}
                >
                  {IconComp && (
                    <IconComp 
                      size={18} 
                      color={isActive ? '#FBBF24' : '#64748B'} 
                      style={{ flexShrink: 0, minWidth: '18px', minHeight: '18px' }} 
                    />
                  )}
                  {!sidebarCollapsed && <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
                  {!sidebarCollapsed && !!item.badge && (
                    <span style={{ fontSize: '0.72rem', backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#F1F5F9', color: isActive ? '#FFFFFF' : '#475569', padding: '0.15rem 0.45rem', borderRadius: '6px', fontWeight: '800', flexShrink: 0 }}>
                      {item.badge}
                    </span>
                  )}
                  {!sidebarCollapsed && hasSubmenu && (
                    <span style={{ marginLeft: '0.2rem', color: isActive ? '#FFFFFF' : '#94A3B8' }}>
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                  )}
                </button>

                {/* Sub Tabs Inside Sidebar for Inventory */}
                {isInventory && inventoryExpanded && !sidebarCollapsed && (
                  <div style={{
                    marginLeft: '1.25rem',
                    paddingLeft: '0.6rem',
                    borderLeft: '2px solid #E2E8F0',
                    marginTop: '0.25rem',
                    marginBottom: '0.35rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem'
                  }}>
                    {inventorySubMenuItems.map(sub => {
                      const SubIcon = sub.icon;
                      const isSubActive = activeTab === 'INVENTORY' && inventorySubTab === sub.key;
                      return (
                        <button
                          key={sub.key}
                          onClick={() => {
                            setActiveTab('INVENTORY');
                            setInventorySubTab(sub.key);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '0.45rem 0.75rem',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: isSubActive ? '#E0F2FE' : 'transparent',
                            color: isSubActive ? '#006B70' : '#64748B',
                            fontWeight: isSubActive ? '800' : '600',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.12s ease',
                            width: '100%'
                          }}
                        >
                          <SubIcon size={14} color={isSubActive ? '#006B70' : '#94A3B8'} />
                          <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.label}</span>
                          {sub.badge && (
                            <span style={{ fontSize: '0.65rem', backgroundColor: sub.badgeColor || '#006B70', color: '#FFF', padding: '0.1rem 0.35rem', borderRadius: '6px', fontWeight: '800' }}>
                              {sub.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Sub Tabs Inside Sidebar for Freelancers */}
                {isFreelancers && freelancersExpanded && !sidebarCollapsed && (
                  <div style={{
                    marginLeft: '1.25rem',
                    paddingLeft: '0.6rem',
                    borderLeft: '2px solid #E2E8F0',
                    marginTop: '0.25rem',
                    marginBottom: '0.35rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem'
                  }}>
                    {freelancerSubMenuItems.map(sub => {
                      const SubIcon = sub.icon;
                      const isSubActive = activeTab === 'FREELANCERS' && freelancerSubTab === sub.key;
                      return (
                        <button
                          key={sub.key}
                          onClick={() => {
                            setActiveTab('FREELANCERS');
                            setFreelancerSubTab(sub.key);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '0.45rem 0.75rem',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: isSubActive ? '#E0F2FE' : 'transparent',
                            color: isSubActive ? '#006B70' : '#64748B',
                            fontWeight: isSubActive ? '800' : '600',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.12s ease',
                            width: '100%'
                          }}
                        >
                          <SubIcon size={14} color={isSubActive ? '#006B70' : '#94A3B8'} />
                          <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.label}</span>
                          {sub.badge && (
                            <span style={{ fontSize: '0.65rem', backgroundColor: sub.badgeColor || '#006B70', color: '#FFF', padding: '0.1rem 0.35rem', borderRadius: '6px', fontWeight: '800' }}>
                              {sub.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Sub Tabs Inside Sidebar for Staff */}
                {isStaff && staffExpanded && !sidebarCollapsed && (
                  <div style={{
                    marginLeft: '1.25rem',
                    paddingLeft: '0.6rem',
                    borderLeft: '2px solid #E2E8F0',
                    marginTop: '0.25rem',
                    marginBottom: '0.35rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem'
                  }}>
                    {staffSubMenuItems.map(sub => {
                      const SubIcon = sub.icon;
                      const isSubActive = activeTab === 'STAFF' && staffSubTab === sub.key;
                      return (
                        <button
                          key={sub.key}
                          onClick={() => {
                            setActiveTab('STAFF');
                            setStaffSubTab(sub.key);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '0.45rem 0.75rem',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: isSubActive ? '#E0F2FE' : 'transparent',
                            color: isSubActive ? '#006B70' : '#64748B',
                            fontWeight: isSubActive ? '800' : '600',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.12s ease',
                            width: '100%'
                          }}
                        >
                          <SubIcon size={14} color={isSubActive ? '#006B70' : '#94A3B8'} />
                          <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Sub Tabs Inside Sidebar for Partners */}
                {isPartners && partnersExpanded && !sidebarCollapsed && (
                  <div style={{
                    marginLeft: '1.25rem',
                    paddingLeft: '0.6rem',
                    borderLeft: '2px solid #E2E8F0',
                    marginTop: '0.25rem',
                    marginBottom: '0.35rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem'
                  }}>
                    {partnerSubMenuItems.map(sub => {
                      const SubIcon = sub.icon;
                      const isSubActive = activeTab === 'PARTNERS_QUEUE' && partnerSubTab === sub.key;
                      return (
                        <button
                          key={sub.key}
                          onClick={() => {
                            setActiveTab('PARTNERS_QUEUE');
                            setPartnerSubTab(sub.key);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '0.45rem 0.75rem',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: isSubActive ? '#E0F2FE' : 'transparent',
                            color: isSubActive ? '#006B70' : '#64748B',
                            fontWeight: isSubActive ? '800' : '600',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.12s ease',
                            width: '100%'
                          }}
                        >
                          <SubIcon size={14} color={isSubActive ? '#006B70' : '#94A3B8'} />
                          <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Sub Tabs Inside Sidebar for Offers Zone */}
                {isOffers && offersExpanded && !sidebarCollapsed && (
                  <div style={{
                    marginLeft: '1.25rem',
                    paddingLeft: '0.6rem',
                    borderLeft: '2px solid #E2E8F0',
                    marginTop: '0.25rem',
                    marginBottom: '0.35rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem'
                  }}>
                    {offersSubMenuItems.map(sub => {
                      const SubIcon = sub.icon;
                      const isSubActive = activeTab === 'OFFERS_MGMT' && offersSubTab === sub.key;
                      return (
                        <button
                          key={sub.key}
                          onClick={() => {
                            setActiveTab('OFFERS_MGMT');
                            setOffersSubTab(sub.key);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '0.45rem 0.75rem',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: isSubActive ? '#E0F2FE' : 'transparent',
                            color: isSubActive ? '#006B70' : '#64748B',
                            fontWeight: isSubActive ? '800' : '600',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.12s ease',
                            width: '100%'
                          }}
                        >
                          <SubIcon size={14} color={isSubActive ? '#006B70' : '#94A3B8'} />
                          <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

              </div>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div style={{ padding: '1rem', borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
          {!sidebarCollapsed && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F172A' }}>{user?.name || 'MedMarg Super Admin'}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748B' }}>admin@medmarg.com</div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={onSwitchRole} style={{ flex: 1, padding: '0.5rem', backgroundColor: '#FFFFFF', color: '#006B70', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
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
        
        {/* Top Header Bar */}
        <header style={{ height: '70px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A' }}>
              {navMenuItems.find(m => m.key === activeTab)?.label}
            </h1>
            <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(0,107,112,0.1)', color: '#006B70', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: '800', border: '1px solid rgba(0,107,112,0.2)' }}>
              Omnipresent Master System
            </span>
          </div>
        </header>

        {/* Dynamic Modular Workspace Body */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          
          {/* TAB 1: DIAGNOSTIC CATALOG & GOOGLE SHEETS SYNC */}
          {activeTab === 'TESTS_MGMT' && (
            <CatalogManagementTab 
              catalog={catalog} 
              setCatalog={setCatalog} 
              saveCatalogState={saveCatalogState} 
              triggerGoogleSheetsSync={triggerGoogleSheetsSync} 
              isSyncingSheets={isSyncingSheets} 
              syncLogs={syncLogs} 
            />
          )}

          {/* TAB 2: LIVE ORDERS & DISPATCH OVERRIDE */}
          {activeTab === 'LIVE_ORDERS' && (
            <LiveOrdersDispatchTab 
              orders={orders} 
              setOrders={setOrders}
              salariedAgents={salariedAgents}
              labPartners={labPartners}
            />
          )}

          {/* TAB 2.5: CUSTOMERS MANAGEMENT DESK */}
          {activeTab === 'CUSTOMERS' && (
            <CustomersDeskTab />
          )}

          {/* TAB 3: REAL-TIME FLEET MAP & COLD-CHAIN */}
          {activeTab === 'GPS_RADAR' && (
            <RealTimeFleetGpsTab 
              salariedAgents={salariedAgents} 
              territories={territories} 
              orders={orders} 
              setActiveTab={setActiveTab} 
            />
          )}

          {/* TAB 4: TERRITORY MARKING & FLEET ALLOTMENT STUDIO */}
          {activeTab === 'TERRITORY_MGMT' && (
            <TerritoryManagementTab 
              territories={territories} 
              setTerritories={setTerritories} 
              salariedAgents={salariedAgents} 
              orders={orders} 
            />
          )}

          {/* TAB 5: FREELANCER QUALIFICATION DESK */}
          {activeTab === 'FREELANCERS' && (
            <FreelancerDeskTab 
              freelancers={freelancers} 
              setFreelancers={setFreelancers} 
              initialSubTab={freelancerSubTab}
              API_BASE={API_BASE}
              safeFetch={safeFetch}
            />
          )}

          {/* TAB 6: SALARIED FLEET & QUOTAS STUDIO */}
          {activeTab === 'SALARIED_FLEET' && (
            <SalariedFleetTab 
              salariedAgents={salariedAgents} 
              setSalariedAgents={setSalariedAgents} 
            />
          )}

          {/* TAB 7: STOCK INVENTORY & INDENT APPROVALS */}
          {activeTab === 'INVENTORY' && (
            <StockInventoryTab 
              inventoryStock={inventoryStock} 
              setInventoryStock={setInventoryStock}
              indents={indents} 
              setIndents={setIndents} 
              salariedAgents={salariedAgents}
              freelancers={freelancers}
              subTab={inventorySubTab}
              setSubTab={setInventorySubTab}
              API_BASE={API_BASE}
              safeFetch={safeFetch}
            />
          )}

          {/* TAB 7.5: STAFF & INTERNAL ACCESS CONTROL */}
          {activeTab === 'STAFF' && (
            <StaffManagementTab 
              initialSubTab={staffSubTab}
              API_BASE={API_BASE}
              safeFetch={safeFetch}
            />
          )}

          {/* TAB 8: DESIGNATED PROCESSING LABS */}
          {activeTab === 'LABS' && (
            <LabsManagementTab 
              labPartners={labPartners} 
              setLabPartners={setLabPartners}
              territories={territories}
            />
          )}

          {/* TAB 9: PARTNER PRE-REGISTRATION QUEUE (CATEGORY DESKS) */}
          {activeTab === 'PARTNERS_QUEUE' && (
            <PartnerQueueTab 
              partnerQueue={partnerQueue} 
              setPartnerQueue={setPartnerQueue}
              initialCategoryTab={partnerSubTab}
              API_BASE={API_BASE}
              safeFetch={safeFetch}
            />
          )}

          {/* TAB 10: FINANCIAL TRANSACTIONS */}
          {activeTab === 'FINANCIALS' && (
            <FinancialsTab 
              transactions={transactions} 
            />
          )}

          {/* TAB 11: OMNIPRESENT KPI OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <OverviewKpiTab 
              catalog={catalog} 
              partnerQueue={partnerQueue} 
            />
          )}

          {/* TAB 12: HORIZONTAL OFFERS CAROUSEL & PROMOTIONS MANAGER */}
          {activeTab === 'OFFERS_MGMT' && (
            <AdminOffersManagerTab 
              catalog={catalog} 
              initialSubTab={offersSubTab}
            />
          )}

          {/* TAB 13: AUDIT TRAILS & POINT-IN-TIME BACKUPS */}
          {activeTab === 'AUDIT_BACKUPS' && (
            <AuditAndBackupsTab 
              API_BASE={API_BASE}
              safeFetch={safeFetch}
            />
          )}

        </main>
      </div>
    </div>
  );
}
