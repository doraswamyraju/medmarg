import React, { useState, useEffect } from 'react';
import { 
  Bike, 
  Thermometer, 
  Calendar, 
  Package, 
  Wallet, 
  Building2, 
  Zap, 
  Activity, 
  ShieldCheck, 
  RefreshCw, 
  MapPin, 
  Clock, 
  Power,
  BatteryCharging,
  Sparkles
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
      // 1. Fetch Roster
      const rRes = await safeFetch(`${API_BASE}/api/v1/agent/roster`);
      const rData = await safeJson(rRes);
      if (rData && rData.roster && rData.roster.length > 0) {
        setPickups(rData.roster);
      }

      // 2. Fetch Broadcast Jobs
      const bRes = await safeFetch(`${API_BASE}/api/v1/agent/broadcast-jobs`);
      const bData = await safeJson(bRes);
      if (bData && bData.jobs && bData.jobs.length > 0) {
        setBroadcastJobs(bData.jobs);
      }

      // 3. Fetch Inventory
      const iRes = await safeFetch(`${API_BASE}/api/v1/agent/inventory`);
      const iData = await safeJson(iRes);
      if (iData && iData.inventory) {
        setInventory(iData.inventory);
      }

      // 4. Fetch Wallet
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
    
    // Update wallet stats
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Top Navigation Header */}
      <header style={{ backgroundColor: '#004D40', color: '#FFF', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '4px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="MedMarg" style={{ height: '28px', objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '900' }}>
                {agentType === 'FREELANCE' ? '⚡ FREELANCE GIG AGENT' : '🛵 IN-HOUSE PHLEBOTOMIST FLEET'}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#80CBC4', fontWeight: '700' }}>Hero Electric EV (AP 04 EZ 9182)</span>
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '900', marginTop: '0.1rem' }}>
              {user?.name || 'Ramesh Kumar'} <span style={{ fontSize: '0.85rem', color: '#80CBC4', fontWeight: '700' }}>({user?.id || 'AG-01'})</span>
            </h2>
          </div>
        </div>

        {/* Telemetry & Quick Action Badges */}
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

          {/* Cold-Bag IoT Telemetry */}
          <span style={{ fontSize: '0.8rem', backgroundColor: 'rgba(255,255,255,0.15)', color: '#80CBC4', padding: '0.45rem 0.85rem', borderRadius: '8px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Thermometer size={15} /> Cold-Bag: 4.2°C (Optimal)
          </span>

          <button onClick={onSwitchRole} style={{ padding: '0.45rem 0.85rem', backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFF', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}>
            Switch Portal
          </button>
          
          <button onClick={onLogout} style={{ padding: '0.45rem 0.85rem', backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </header>

      {/* Real-Time Duty & Fleet HUD Banner */}
      <div style={{ backgroundColor: '#00382E', color: '#FFF', padding: '0.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.82rem', fontWeight: '700' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#A7F3D0' }}>
            <MapPin size={15} /> Zone: <strong>Tirupati Urban & Bypass (Zone 1)</strong>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#FEF08A' }}>
            <Sparkles size={15} /> Daily Target: <strong>{wallet.completedTripsToday || 6} / 12 Pickups Completed</strong>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#80CBC4' }}>
            <BatteryCharging size={15} /> IoT Carrier Bag Battery: <strong>94% (Charging)</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={refreshAgentData}
            disabled={isRefreshing}
            style={{
              padding: '0.35rem 0.75rem',
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: '#FFF',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <RefreshCw size={13} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} /> Sync Fleet
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0 2rem', display: 'flex', gap: '1rem', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('ROSTER')}
          style={{
            padding: '1rem 0.5rem',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'ROSTER' ? '3px solid #006B70' : '3px solid transparent',
            color: activeTab === 'ROSTER' ? '#006B70' : '#64748B',
            fontWeight: '900',
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap'
          }}
        >
          <Bike size={18} /> Assigned Pickups ({pickups.length})
        </button>

        <button
          onClick={() => setActiveTab('BROADCAST')}
          style={{
            padding: '1rem 0.5rem',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'BROADCAST' ? '3px solid #006B70' : '3px solid transparent',
            color: activeTab === 'BROADCAST' ? '#006B70' : '#64748B',
            fontWeight: '900',
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap'
          }}
        >
          <Zap size={18} color="#F59E0B" /> Broadcast Overflow Jobs ({broadcastJobs.length})
        </button>

        <button
          onClick={() => setActiveTab('INVENTORY')}
          style={{
            padding: '1rem 0.5rem',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'INVENTORY' ? '3px solid #006B70' : '3px solid transparent',
            color: activeTab === 'INVENTORY' ? '#006B70' : '#64748B',
            fontWeight: '900',
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap'
          }}
        >
          <Package size={18} /> In-Hand Supplies & Indents
        </button>

        <button
          onClick={() => setActiveTab('WALLET')}
          style={{
            padding: '1rem 0.5rem',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'WALLET' ? '3px solid #006B70' : '3px solid transparent',
            color: activeTab === 'WALLET' ? '#006B70' : '#64748B',
            fontWeight: '900',
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap'
          }}
        >
          <Wallet size={18} /> Earnings & Payout Wallet (₹{wallet.availableCashoutBalance?.toLocaleString('en-IN')})
        </button>

        <button
          onClick={() => setActiveTab('LAB_HANDOVER')}
          style={{
            padding: '1rem 0.5rem',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'LAB_HANDOVER' ? '3px solid #006B70' : '3px solid transparent',
            color: activeTab === 'LAB_HANDOVER' ? '#006B70' : '#64748B',
            fontWeight: '900',
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap'
          }}
        >
          <Building2 size={18} /> NABL Lab Handover
        </button>
      </div>

      {/* Main Container */}
      <main style={{ padding: '2rem', maxWidth: '1280px', margin: '0 auto' }}>
        
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

      {/* Multi-Step Tube Scanner & OTP Modal */}
      <PhlebotomistTubeScannerModal 
        activePickupModal={activePickupModal} 
        setActivePickupModal={setActivePickupModal} 
        onCompleteCollection={handleCompleteCollection}
      />

    </div>
  );
}
