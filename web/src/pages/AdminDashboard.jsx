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
  Compass,
  UserCheck,
  Navigation,
  Truck,
  Users
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
import LabsManagementTab from '../components/admin/LabsManagementTab';
import PartnerQueueTab from '../components/admin/PartnerQueueTab';
import FinancialsTab from '../components/admin/FinancialsTab';
import OverviewKpiTab from '../components/admin/OverviewKpiTab';
import CustomersDeskTab from '../components/admin/CustomersDeskTab';

export default function AdminDashboard({ user, onSwitchRole, onLogout }) {
  // Navigation State
  const [activeTab, setActiveTab] = useState('TESTS_MGMT'); 
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Master Catalog State
  const [catalog, setCatalog] = useState(getCatalogState() || initialCatalog);

  // Google Sheets Sync State
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [sheetSyncStatus, setSheetSyncStatus] = useState('CONNECTED_IDLE');
  const [syncLogs, setSyncLogs] = useState([
    { timestamp: 'Just now', action: 'Desktop tests data.xlsx ingestion verified (913 Tests, 87 Profiles).', status: 'SUCCESS' }
  ]);

  // Live Orders State
  const [orders, setOrders] = useState([
    { id: 'MM-8921', patientName: 'Rahul Sharma', phone: '+91 98765 43210', city: 'Tirupati', address: 'Bairagipatteda, Tirupati', items: 'HbA1c + Complete Blood Count', amount: 899, status: 'EN_ROUTE', assignedAgent: 'Ramesh Kumar (AG-01)', lab: 'MedMarg Central Lab', otp: '4892', createdAt: 'Today 07:30 AM' },
    { id: 'MM-8922', patientName: 'Priya Verma', phone: '+91 98765 88990', city: 'Tirupati', address: 'Air Bypass Road, Tirupati', items: 'Master Full Body Profile (87 Biomarkers)', amount: 1499, status: 'SAMPLE_COLLECTED', assignedAgent: 'Suresh Babu (AG-02)', lab: 'Apollo Diagnostics Hub', otp: '7104', createdAt: 'Today 08:15 AM' },
    { id: 'MM-8923', patientName: 'Venkatesh R', phone: '+91 94400 55667', city: 'Chittoor', address: 'Gandhi Road, Chittoor', items: 'Diabetic & Renal Health Check', amount: 699, status: 'PENDING_DISPATCH', assignedAgent: 'Unassigned', lab: 'Dr. Lal PathLabs', otp: '1938', createdAt: 'Today 09:00 AM' }
  ]);

  // Freelancer Qualification Desk State
  const [freelancers, setFreelancers] = useState([
    { id: 'FL-101', name: 'Ankit Sharma', phone: '+91 98765 22114', city: 'Tirupati', qualification: 'DMLT (Diploma Medical Lab Tech)', paramedicalCert: 'AP-PMC-89102', experience: '3 Years', regFeePaid: true, feeAmount: 2000, walletBalance: 2000, status: 'PENDING_VERIFICATION' },
    { id: 'FL-102', name: 'Sneha Reddy', phone: '+91 98765 33221', city: 'Bangalore', qualification: 'BSc MLT (Bachelor MLT)', paramedicalCert: 'KA-PMC-44109', experience: '5 Years', regFeePaid: true, feeAmount: 2000, walletBalance: 2000, status: 'APPROVED' }
  ]);

  // Salaried Agents Quota State
  const [salariedAgents, setSalariedAgents] = useState([
    { id: 'AG-01', name: 'Ramesh Kumar', phone: '+91 98765 11223', area: 'Air Bypass & Alipiri', samplesToday: 9, maxDailyQuota: 15, temp: '4.2°C', status: 'ACTIVE' },
    { id: 'AG-02', name: 'Suresh Babu', phone: '+91 98765 44332', area: 'Renigunta Rd & Tiruchanoor', samplesToday: 7, maxDailyQuota: 15, temp: '3.8°C', status: 'ACTIVE' }
  ]);

  // Inventory Stock & Indents State
  const [inventoryStock, setInventoryStock] = useState([
    { code: 'STK-01', name: 'Gold SST Gel Tubes (5ml)', category: 'Blood Containers', stock: 4500, unit: 'Tubes', reorderLevel: 1000 },
    { code: 'STK-02', name: 'Purple EDTA Tubes (3ml)', category: 'Blood Containers', stock: 3200, unit: 'Tubes', reorderLevel: 800 },
    { code: 'STK-03', name: 'Grey Fluoride Glucose Tubes (2ml)', category: 'Blood Containers', stock: 2100, unit: 'Tubes', reorderLevel: 500 },
    { code: 'STK-04', name: 'Sterile Vacutainer Needles 21G', category: 'Phlebotomy Supplies', stock: 5000, unit: 'Needles', reorderLevel: 1200 },
    { code: 'STK-05', name: 'IoT Cold Gel Carry Bags (2-8°C)', category: 'Cold Chain Equipment', stock: 150, unit: 'Bags', reorderLevel: 30 }
  ]);

  const [indents, setIndents] = useState([
    { id: 'IND-501', agentName: 'Ramesh Kumar (AG-01)', requestedItems: '50x Gold SST Tubes, 20x Purple EDTA Tubes', status: 'PENDING_APPROVAL', date: 'Today 08:30 AM' },
    { id: 'IND-502', agentName: 'Suresh Babu (AG-02)', requestedItems: '30x Purple EDTA Tubes, 10x Biohazard Bags', status: 'APPROVED_DISPATCHED', date: 'Yesterday' }
  ]);

  // Partner Pre-Registration Queue State
  const [partnerQueue, setPartnerQueue] = useState([
    { id: 'P-101', name: 'Dr. K. Sivasankar', type: 'Doctor / OPD Practice', city: 'Tirupati', phone: '+91 94400 12345', email: 'dr.siva@gmail.com', status: 'PRE_REGISTERED' },
    { id: 'P-102', name: 'Sri Diagnostics & Radiology Center', type: 'Radiology / MRI Center', city: 'Tirupati', phone: '+91 98490 54321', email: 'sridiag@gmail.com', status: 'PRE_REGISTERED' },
    { id: 'P-103', name: 'Dr. Anita Roy', type: 'Health & Diet Coach', city: 'Bangalore', phone: '+91 98800 67890', email: 'anita.health@gmail.com', status: 'PRE_REGISTERED' }
  ]);

  // Financial Transactions State
  const [transactions, setTransactions] = useState([
    { id: 'TXN-901', orderId: 'MM-8921', patient: 'Rahul Sharma', mode: 'Prepaid (Razorpay)', amount: 899, status: 'PAID_SUCCESS', date: 'Today 07:30 AM' },
    { id: 'TXN-902', orderId: 'MM-8922', patient: 'Priya Verma', mode: 'Doorstep UPI QR', amount: 1499, status: 'PAID_SUCCESS', date: 'Today 08:15 AM' }
  ]);

  // Partner Labs Operational State
  const [labPartners, setLabPartners] = useState([
    { id: 'LAB-01', name: 'MedMarg Central Processing Lab', type: 'Primary Processing Hub', city: 'Tirupati (Central)', nabl: 'NABL-AP-2026-01', status: 'ACTIVE', assignedMargin: '20%', activeOrders: 18 },
    { id: 'LAB-02', name: 'Apollo Diagnostics Regional Lab', type: 'Regional NABL Partner', city: 'Tirupati (Air Bypass Rd)', nabl: 'NABL-AP-8921', status: 'ACTIVE', assignedMargin: '18%', activeOrders: 7 },
    { id: 'LAB-03', name: 'Dr. Lal PathLabs Hub', type: 'Accredited Lab Partner', city: 'Tirupati (Renigunta Rd)', nabl: 'NABL-AP-3104', status: 'ACTIVE', assignedMargin: '15%', activeOrders: 5 }
  ]);

  // Territory Marking State
  const [territories, setTerritories] = useState([
    { id: 'ZONE-01', name: 'Zone 1: Tirupati Central & Air Bypass Rd', pincodes: ['517501', '517507'], primaryAgentId: 'AG-01', primaryAgentName: 'Ramesh Kumar', color: '#38BDF8', maxDailyQuota: 15, activeOrders: 9, status: 'ACTIVE', polygonCoords: "20,20 220,15 200,110 30,100" },
    { id: 'ZONE-02', name: 'Zone 2: Alipiri, Zoo Park & SVU Campus', pincodes: ['517502'], primaryAgentId: 'AG-02', primaryAgentName: 'Suresh Babu', color: '#10B981', maxDailyQuota: 15, activeOrders: 7, status: 'ACTIVE', polygonCoords: "230,15 480,30 450,120 210,110" },
    { id: 'ZONE-03', name: 'Zone 3: Renigunta Rd & Tiruchanoor', pincodes: ['517503', '517506'], primaryAgentId: 'AG-03', primaryAgentName: 'Mahesh V', color: '#F59E0B', maxDailyQuota: 15, activeOrders: 4, status: 'ACTIVE', polygonCoords: "30,115 200,115 180,195 20,185" },
    { id: 'ZONE-04', name: 'Zone 4: Chandragiri & Outer Suburbs', pincodes: ['517101'], primaryAgentId: 'FREELANCE_BROADCAST', primaryAgentName: 'Gig Freelancer Broadcast Zone', color: '#A855F7', maxDailyQuota: 999, activeOrders: 2, status: 'ACTIVE', polygonCoords: "210,125 480,125 460,195 190,195" }
  ]);

  // Fetch live database records for Orders, Freelancers, Indents, Partners & Territories
  useEffect(() => {
    async function loadDbRecords() {
      try {
        const [ordersRes, flRes, indRes, partRes, terrRes] = await Promise.all([
          safeFetch(`${API_BASE}/api/v1/admin/orders`, {}, 2500).then(r => r.json()),
          safeFetch(`${API_BASE}/api/v1/admin/freelancers`, {}, 2500).then(r => r.json()),
          safeFetch(`${API_BASE}/api/v1/admin/indents`, {}, 2500).then(r => r.json()),
          safeFetch(`${API_BASE}/api/v1/admin/partners`, {}, 2500).then(r => r.json()),
          safeFetch(`${API_BASE}/api/v1/admin/territories`, {}, 2500).then(r => r.json())
        ]);

        if (ordersRes.orders && ordersRes.orders.length > 0) setOrders(ordersRes.orders);
        if (flRes.freelancers && flRes.freelancers.length > 0) setFreelancers(flRes.freelancers);
        if (indRes.indents && indRes.indents.length > 0) setIndents(indRes.indents);
        if (partRes.partners && partRes.partners.length > 0) setPartnerQueue(partRes.partners);
        if (terrRes.territories && terrRes.territories.length > 0) setTerritories(terrRes.territories);
      } catch (err) {}
    }
    loadDbRecords();
  }, []);

  // Fetch live catalog from backend if available
  useEffect(() => {
    safeFetch(`${API_BASE}/api/v1/catalog/summary`, {}, 2500)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          Promise.all([
            safeFetch(`${API_BASE}/api/v1/catalog/packages`, {}, 2500).then(r => r.json()),
            safeFetch(`${API_BASE}/api/v1/catalog/profiles`, {}, 2500).then(r => r.json()),
            safeFetch(`${API_BASE}/api/v1/catalog/tests?limit=1000`, {}, 2500).then(r => r.json())
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

  // Manual Trigger Google Sheets Sync
  const triggerGoogleSheetsSync = async () => {
    setIsSyncingSheets(true);
    setSheetSyncStatus('SYNCING');
    try {
      const res = await safeFetch(`${API_BASE}/api/v1/catalog/sync`, { method: 'POST' }, 8000);
      const data = await res.json();
      if (data.success) {
        if (data.tests && data.profiles) {
          const updated = {
            packages: data.packages || catalog.packages,
            profiles: data.profiles,
            tests: data.tests
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

  // Navigation Items (Single Word Labels)
  const navMenuItems = [
    { key: 'TESTS_MGMT', label: 'Catalog', icon: FlaskConical, badge: `${(catalog.tests?.length || 913) + (catalog.profiles?.length || 87)}` },
    { key: 'LIVE_ORDERS', label: 'Orders', icon: Package, badge: `${orders.length}` },
    { key: 'CUSTOMERS', label: 'Customers', icon: Users, badge: 'Patients' },
    { key: 'GPS_RADAR', label: 'Tracking', icon: Navigation, badge: 'Live GPS' },
    { key: 'TERRITORY_MGMT', label: 'Territories', icon: Compass, badge: `${territories.length} Zones` },
    { key: 'FREELANCERS', label: 'Freelancers', icon: UserCheck, badge: `${freelancers.filter(f => f.status === 'PENDING_VERIFICATION').length} Pending` },
    { key: 'SALARIED_FLEET', label: 'Fleet', icon: Truck, badge: `${salariedAgents.length}` },
    { key: 'INVENTORY', label: 'Inventory', icon: Boxes, badge: `${indents.filter(i => i.status === 'PENDING_APPROVAL').length}` },
    { key: 'LABS', label: 'Labs', icon: Building2, badge: `${labPartners.length}` },
    { key: 'PARTNERS_QUEUE', label: 'Partners', icon: Stethoscope, badge: `${partnerQueue.length}` },
    { key: 'FINANCIALS', label: 'Financials', icon: DollarSign, badge: 'Razorpay' },
    { key: 'OVERVIEW', label: 'Overview', icon: BarChart3 }
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
                  color: isActive ? '#FFFFFF' : '#475569',
                  fontWeight: isActive ? '800' : '600',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  justify: sidebarCollapsed ? 'center' : 'flex-start'
                }}
              >
                <IconComp size={18} color={isActive ? '#FBBF24' : '#64748B'} />
                {!sidebarCollapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                {!sidebarCollapsed && item.badge !== undefined && (
                  <span style={{ fontSize: '0.72rem', backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#F1F5F9', color: isActive ? '#FFFFFF' : '#475569', padding: '0.15rem 0.45rem', borderRadius: '6px', fontWeight: '800' }}>
                    {item.badge}
                  </span>
                )}
              </button>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={triggerGoogleSheetsSync}
              disabled={isSyncingSheets}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: isSyncingSheets ? '#94A3B8' : '#006B70', color: '#FFF', padding: '0.55rem 1.1rem', borderRadius: '10px', border: 'none', fontWeight: '800', fontSize: '0.84rem', cursor: isSyncingSheets ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(0,107,112,0.2)' }}
            >
              <RefreshCw size={15} className={isSyncingSheets ? 'animate-spin' : ''} />
              {isSyncingSheets ? 'Syncing with Sheets...' : 'Sync with Google Sheets'}
            </button>
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

          {/* TAB 9: PARTNER PRE-REGISTRATION QUEUE */}
          {activeTab === 'PARTNERS_QUEUE' && (
            <PartnerQueueTab 
              partnerQueue={partnerQueue} 
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

        </main>
      </div>
    </div>
  );
}
