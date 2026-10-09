import React, { useState, useEffect } from 'react';
import { 
  Bike, 
  Zap, 
  Package, 
  Wallet, 
  Building2, 
  Power, 
  Thermometer, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  MapPin,
  Sparkles,
  ShieldCheck,
  BatteryCharging,
  Clock,
  ArrowRight
} from 'lucide-react';

import PhlebotomistPickupsTab from '../components/phlebotomist/PhlebotomistPickupsTab';
import PhlebotomistBroadcastJobsTab from '../components/phlebotomist/PhlebotomistBroadcastJobsTab';
import PhlebotomistInventoryTab from '../components/phlebotomist/PhlebotomistInventoryTab';
import PhlebotomistWalletTab from '../components/phlebotomist/PhlebotomistWalletTab';
import PhlebotomistLabHandoverTab from '../components/phlebotomist/PhlebotomistLabHandoverTab';
import PhlebotomistTubeScannerModal from '../components/phlebotomist/PhlebotomistTubeScannerModal';

import { API_BASE, safeFetch, safeJson } from '../data/apiConfig';

export default function PhlebotomistDashboard({ user, agentType = 'SALARIED', onSwitchRole, onLogout }) {
  const [activeTab, setActiveTab] = useState('ROSTER'); // 'ROSTER' | 'BROADCAST' | 'INVENTORY' | 'WALLET' | 'LAB_HANDOVER'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [completedPickups, setCompletedPickups] = useState(new Set());
  const [activePickupModal, setActivePickupModal] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pickups State
  const [pickups, setPickups] = useState([
    { 
      id: 'MM-8921', 
      patientName: 'Rahul Sharma', 
      age: '36M', 
      timeSlot: '07:30 AM - 08:30 AM (Fasting)', 
      address: 'Plot 42, Air Bypass Road, Tirupati, AP - 517501', 
      phone: '+91 98765 43210', 
      tests: 'Thyrocare Aarogyam 1.3 (104 Parameters) + HbA1c', 
      tubes: ['Yellow SST (Serum)', 'Lavender (EDTA Blood)', 'Grey (Fluoride Sugar)'], 
      fastingVerified: true, 
      paymentStatus: 'PAID_ONLINE',
      amount: 1499,
      status: 'ASSIGNED'
    },
    { 
      id: 'MM-8922', 
      patientName: 'Priya Verma', 
      age: '29F', 
      timeSlot: '08:45 AM - 09:30 AM (Fasting)', 
      address: 'Door 12-4, Gandhi Road, Tirupati - 517501', 
      phone: '+91 98765 88990', 
      tests: 'Thyroid Profile Total + Lipid Comprehensive', 
      tubes: ['Yellow SST (Serum)', 'Lavender (EDTA Blood)'], 
      fastingVerified: true, 
      paymentStatus: 'PAY_AT_DOORSTEP',
      amount: 1000,
      status: 'ARRIVED'
    },
    { 
      id: 'MM-8923', 
      patientName: 'Venkatesh R', 
      age: '42M', 
      timeSlot: '10:00 AM - 11:00 AM (Non-Fasting)', 
      address: 'Near Alipiri Gate, Tirupati - 517507', 
      phone: '+91 94400 55667', 
      tests: 'HbA1c & Blood Sugar Random + CBC', 
      tubes: ['Lavender (EDTA Blood)', 'Grey (Fluoride Sugar)'], 
      fastingVerified: false, 
      paymentStatus: 'PAID_ONLINE',
      amount: 499,
      status: 'ASSIGNED'
    }
  ]);

  // Broadcast Jobs State
  const [broadcastJobs, setBroadcastJobs] = useState([
    {
      id: 'BJ-901',
      patientName: 'Kavitha R',
      age: '45F',
      timeSlot: '11:30 AM - 12:30 PM (Fasting)',
      address: 'Door 5-112, Bhavani Nagar, Tirupati - 517501',
      phone: '+91 94400 88991',
      tests: 'Comprehensive Diabetic Health Panel (88 Tests)',
      tubes: ['Yellow SST (Serum)', 'Grey (Fluoride Sugar)', 'Lavender (EDTA)'],
      payout: 350,
      distance: '2.4 km away',
      fastingRequired: true
    },
    {
      id: 'BJ-902',
      patientName: 'Subramanyam Naidu',
      age: '62M',
      timeSlot: '01:00 PM - 02:00 PM (Non-Fasting)',
      address: 'Plot 18, Renigunta Road, Tirupati - 517506',
      phone: '+91 98855 22441',
      tests: 'Cardiac Risk Profile + Lipid + Electrolytes',
      tubes: ['Yellow SST (Serum)', 'Green (Heparin)'],
      payout: 420,
      distance: '4.1 km away',
      fastingRequired: false
    }
  ]);

  // Inventory State
  const [inventory, setInventory] = useState([
    { id: 'INV-01', name: 'Vacutainer Gold SST (Serum Gel)', code: 'TUBE-SST', stock: 18, unit: 'Tubes', minThreshold: 10 },
    { id: 'INV-02', name: 'Vacutainer Purple (EDTA Whole Blood)', code: 'TUBE-EDTA', stock: 24, unit: 'Tubes', minThreshold: 10 },
    { id: 'INV-03', name: 'Vacutainer Grey (Fluoride Sugar)', code: 'TUBE-FLR', stock: 6, unit: 'Tubes', minThreshold: 10 },
    { id: 'INV-04', name: 'Vacutainer Light Blue (Citrate)', code: 'TUBE-CIT', stock: 8, unit: 'Tubes', minThreshold: 5 },
    { id: 'INV-05', name: 'Sterile Safety Syringes 5ml', code: 'SYR-5ML', stock: 30, unit: 'Units', minThreshold: 15 },
    { id: 'INV-06', name: 'Barcode Thermal Label Rolls', code: 'LBL-ROLL', stock: 2, unit: 'Rolls', minThreshold: 2 },
    { id: 'INV-07', name: 'Biohazard Seal Bags (A4)', code: 'BIO-BAG', stock: 40, unit: 'Bags', minThreshold: 20 },
    { id: 'INV-08', name: 'Cold-Chain Ice Gel Freeze Packs', code: 'ICE-GEL', stock: 4, unit: 'Packs', minThreshold: 2 }
  ]);

  // Indents State
  const [indents, setIndents] = useState([
    {
      id: 'IND-8012',
      status: 'APPROVED_DISPATCHED',
      requestedAt: '2026-10-08T10:30:00.000Z',
      items: [{ item: 'Vacutainer Gold SST', quantity: 20 }, { item: 'Vacutainer Purple EDTA', quantity: 20 }]
    }
  ]);

  // Wallet State
  const [wallet, setWallet] = useState({
    totalLifetimeEarnings: 18450,
    todayEarnings: 2450,
    availableCashoutBalance: 4850,
    completedTripsToday: 6,
    distancePayout: 650,
    tipsBonus: 300,
    recentPayouts: [
      { id: 'PO-108', date: 'Yesterday 06:30 PM', amount: 3200, method: 'UPI (9876543210@upi)', status: 'SETTLED' },
      { id: 'PO-107', date: '04 Oct 2026', amount: 4500, method: 'Bank Transfer (HDFC ***412)', status: 'SETTLED' }
    ]
  });

  // Fetch initial data from backend API
  const refreshAgentData = async () => {
    setIsRefreshing(true);
    try {
      const rRes = await safeFetch(`${API_BASE}/api/v1/agent/roster`);
      const rData = await safeJson(rRes);
      if (rData && rData.roster && rData.roster.length > 0) {
        setPickups(rData.roster);
      }

      const bRes = await safeFetch(`${API_BASE}/api/v1/agent/broadcast-jobs`);
      const bData = await safeJson(bRes);
      if (bData && bData.jobs && bData.jobs.length > 0) {
        setBroadcastJobs(bData.jobs);
      }

      const iRes = await safeFetch(`${API_BASE}/api/v1/agent/inventory`);
      const iData = await safeJson(iRes);
      if (iData && iData.inventory) {
        setInventory(iData.inventory);
      }

      const wRes = await safeFetch(`${API_BASE}/api/v1/agent/wallet`);
      const wData = await safeJson(wRes);
      if (wData && wData.wallet) {
        setWallet(wData.wallet);
      }
    } catch (e) {
      console.warn('Agent data live fetch fallback:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshAgentData();
  }, []);

  // Action Handlers
  const handleStartTrip = (orderId) => {
    setPickups(prev => prev.map(p => p.id === orderId ? { ...p, status: 'EN_ROUTE' } : p));
    safeFetch(`${API_BASE}/api/v1/agent/pickup/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status: 'EN_ROUTE' })
    }).catch(() => {});
  };

  const handleArriveDoorstep = (orderId) => {
    setPickups(prev => prev.map(p => p.id === orderId ? { ...p, status: 'ARRIVED' } : p));
    safeFetch(`${API_BASE}/api/v1/agent/pickup/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status: 'ARRIVED' })
    }).catch(() => {});
  };

  const handleCompleteCollection = (orderId, details) => {
    setCompletedPickups(prev => new Set([...prev, orderId]));
    setPickups(prev => prev.map(p => p.id === orderId ? { ...p, status: 'SAMPLE_COLLECTED', paymentStatus: 'PAID_DOORSTEP_QR' } : p));
    
    setWallet(prev => ({
      ...prev,
      todayEarnings: prev.todayEarnings + 350,
      availableCashoutBalance: prev.availableCashoutBalance + 350,
      completedTripsToday: prev.completedTripsToday + 1
    }));

    safeFetch(`${API_BASE}/api/v1/agent/pickup/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        status: 'SAMPLE_COLLECTED',
        barcode: Object.values(details.scannedTubes || {}).join(','),
        otp: details.otp,
        paymentCollected: details.paymentDone
      })
    }).catch(() => {});
  };

  const handleClaimJob = (job) => {
    const claimedPickup = {
      id: job.id,
      patientName: job.patientName,
      age: job.age,
      timeSlot: job.timeSlot,
      address: job.address,
      phone: job.phone,
      tests: job.tests,
      tubes: job.tubes || ['Yellow SST (Serum)', 'Lavender (EDTA Blood)'],
      fastingVerified: job.fastingRequired,
      paymentStatus: 'PAID_ONLINE',
      amount: job.payout * 2,
      status: 'ASSIGNED'
    };

    setPickups(prev => [claimedPickup, ...prev]);
    setBroadcastJobs(prev => prev.filter(j => j.id !== job.id));

    safeFetch(`${API_BASE}/api/v1/agent/broadcast-jobs/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId: job.id,
        agentName: user?.name || 'Ramesh Kumar (AG-01)',
        ...job
      })
    }).catch(() => {});
  };

  const handleRaiseIndent = (indentData) => {
    const newIndent = {
      id: `IND-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'PENDING_APPROVAL',
      requestedAt: new Date().toISOString(),
      items: indentData.items
    };
    setIndents(prev => [newIndent, ...prev]);

    safeFetch(`${API_BASE}/api/v1/agent/indent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentName: user?.name || 'Ramesh Kumar',
        agentId: user?.id || 'AG-01',
        ...indentData
      })
    }).catch(() => {});
  };

  const handleRequestPayout = (payoutData) => {
    const newPayout = {
      id: `PO-${Math.floor(100 + Math.random() * 900)}`,
      date: 'Just Now',
      amount: Number(payoutData.amount),
      method: `${payoutData.method} (${payoutData.vpaOrAccount})`,
      status: 'PROCESSING'
    };

    setWallet(prev => ({
      ...prev,
      availableCashoutBalance: Math.max(0, prev.availableCashoutBalance - Number(payoutData.amount)),
      recentPayouts: [newPayout, ...prev.recentPayouts]
    }));

    safeFetch(`${API_BASE}/api/v1/agent/wallet/payout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payoutData)
    }).catch(() => {});
  };

  const handleConfirmLabHandover = (handoverDetails) => {
    setPickups(prev => prev.map(p => ({ ...p, status: 'TRANSFERRED_TO_LAB' })));
  };

  const navigationItems = [
    { key: 'ROSTER', label: 'Assigned Pickups', icon: Bike, badge: pickups.length },
    { key: 'BROADCAST', label: 'Broadcast Overflow', icon: Zap, badge: `${broadcastJobs.length} Live` },
    { key: 'INVENTORY', label: 'In-Hand Supplies', icon: Package, badge: `${inventory.length}` },
    { key: 'WALLET', label: 'Earnings & Wallet', icon: Wallet, badge: `₹${wallet.availableCashoutBalance?.toLocaleString('en-IN')}` },
    { key: 'LAB_HANDOVER', label: 'NABL Lab Handover', icon: Building2, badge: '2 Labs' }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* STANDARD MEDMARG LEFT SIDEBAR */}
      <aside
        style={{
          width: sidebarCollapsed ? '80px' : '260px',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'width 0.2s ease',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 40,
          flexShrink: 0
        }}
      >
        <div>
          {/* Top Logo & Role Badge */}
          <div style={{ padding: '1.25rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '2px 4px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                <img src="/logo.png" alt="MedMarg" style={{ height: '28px', objectFit: 'contain' }} />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <div style={{ fontSize: '0.7rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '900', display: 'inline-block' }}>
                    {agentType === 'FREELANCE' ? 'FREELANCE AGENT' : 'COLLECTION AGENT'}
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748B', marginTop: '2px' }}>
                    Fleet Console
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px'
              }}
            >
              {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          {/* Navigation Menu */}
          <nav style={{ padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {navigationItems.map(item => {
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
                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                    width: '100%'
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
        </div>

        {/* User Card & Logout Bottom of Sidebar */}
        <div style={{ padding: '1rem', borderTop: '1px solid #F1F5F9', backgroundColor: '#FFFFFF' }}>
          {!sidebarCollapsed && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: '900', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Ramesh Kumar'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.id || 'AG-01'} • Hero Electric EV
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={onSwitchRole}
              style={{
                flex: 1,
                padding: '0.45rem',
                backgroundColor: '#F1F5F9',
                color: '#475569',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              {sidebarCollapsed ? '⇄' : 'Switch Portal'}
            </button>
            <button
              onClick={onLogout}
              style={{
                padding: '0.45rem 0.75rem',
                backgroundColor: '#EF4444',
                color: '#FFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              {sidebarCollapsed ? '✕' : 'Logout'}
            </button>
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN WORKSPACE AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        
        {/* Top Header Bar */}
        <header
          style={{
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            padding: '1.25rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 30,
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                {activeTab === 'ROSTER' && 'Assigned Doorstep Pickups'}
                {activeTab === 'BROADCAST' && 'Broadcast Overflow Marketplace'}
                {activeTab === 'INVENTORY' && 'In-Hand Supplies & Indents'}
                {activeTab === 'WALLET' && 'Earnings & Payout Wallet'}
                {activeTab === 'LAB_HANDOVER' && 'Designated Diagnostic Labs Handover'}
              </h1>
              <span style={{ fontSize: '0.75rem', backgroundColor: '#ECFDF5', color: '#065F46', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '900' }}>
                Omnipresent Fleet Desk
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.2rem' }}>
              Zone: <strong>Tirupati Urban & Bypass (Zone 1)</strong> • Progress: <strong>{wallet.completedTripsToday || 6} / 12 Pickups Done</strong>
            </div>
          </div>

          {/* Right Header Badges & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            
            {/* Duty Status Switch */}
            <button
              onClick={() => setIsOnDuty(!isOnDuty)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isOnDuty ? '#059669' : '#475569',
                color: '#FFF',
                fontWeight: '900',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Power size={14} /> {isOnDuty ? '● ON DUTY (ACTIVE)' : '○ OFF DUTY'}
            </button>

            {/* IoT Cold-Bag Telemetry */}
            <span style={{ fontSize: '0.8rem', backgroundColor: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', padding: '0.45rem 0.85rem', borderRadius: '8px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Thermometer size={15} color="#16a34a" /> Cold-Bag: 4.2°C (Optimal)
            </span>

            {/* Sync Fleet Action */}
            <button
              onClick={refreshAgentData}
              disabled={isRefreshing}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#006B70',
                color: '#FFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 2px 6px rgba(0,107,112,0.15)'
              }}
            >
              <RefreshCw size={14} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} /> Sync Fleet
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main style={{ padding: '2rem', maxWidth: '1400px', width: '100%', boxSizing: 'border-box' }}>
          
          {activeTab === 'ROSTER' && (
            <PhlebotomistPickupsTab 
              pickups={pickups} 
              completedPickups={completedPickups} 
              onStartTrip={handleStartTrip}
              onArriveDoorstep={handleArriveDoorstep}
              onOpenScanModal={(pk) => setActivePickupModal(pk)} 
            />
          )}

          {activeTab === 'BROADCAST' && (
            <PhlebotomistBroadcastJobsTab
              jobs={broadcastJobs}
              onClaimJob={handleClaimJob}
            />
          )}

          {activeTab === 'INVENTORY' && (
            <PhlebotomistInventoryTab
              inventory={inventory}
              indents={indents}
              onRaiseIndent={handleRaiseIndent}
            />
          )}

          {activeTab === 'WALLET' && (
            <PhlebotomistWalletTab
              wallet={wallet}
              onRequestPayout={handleRequestPayout}
            />
          )}

          {activeTab === 'LAB_HANDOVER' && (
            <PhlebotomistLabHandoverTab
              onConfirmHandover={handleConfirmLabHandover}
            />
          )}

        </main>

      </div>

      {/* Multi-Step Tube Scanner & OTP Modal */}
      <PhlebotomistTubeScannerModal 
        activePickupModal={activePickupModal} 
        setActivePickupModal={setActivePickupModal} 
        onCompleteCollection={handleCompleteCollection}
      />

    </div>
  );
}
