import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  CheckCircle, 
  PlusCircle, 
  Award, 
  Eye, 
  X, 
  Phone, 
  Send, 
  DollarSign, 
  Star, 
  Clock, 
  Radio, 
  CheckCheck, 
  ArrowUpRight, 
  Thermometer, 
  AlertCircle,
  TrendingUp,
  CreditCard,
  Layers,
  MapPin
} from 'lucide-react';

export default function FreelancerDeskTab({
  freelancers = [],
  setFreelancers = () => {},
  initialSubTab = 'KYC_VERIFICATION',
  onSubTabChange,
  API_BASE,
  safeFetch
}) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const [selectedDocFreelancer, setSelectedDocFreelancer] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [filterKyc, setFilterKyc] = useState('ALL');

  // New Freelancer Form State
  const [addForm, setAddForm] = useState({
    id: `FL-${Math.floor(100 + Math.random() * 900)}`,
    name: '',
    phone: '',
    city: 'Tirupati',
    qualification: 'DMLT (Diploma Medical Lab Tech)',
    paramedicalCert: 'AP-PMC-',
    experience: '3 Years',
    regFeePaid: true,
    feeAmount: 2000,
    walletBalance: 2000,
    status: 'PENDING_VERIFICATION',
    rating: 4.9,
    completedOrders: 0,
    hemolysisRate: '0%',
    coldChainScore: '100%',
    earnings: 0,
    payoutPending: 2000
  });

  // Broadcast Tasks / Gigs (Sub-Tab 2)
  const [broadcastTasks, setBroadcastTasks] = useState([
    {
      id: 'TASK-8901',
      orderId: 'MM-8923',
      patientName: 'Venkatesh R',
      area: 'Gandhi Road, Chittoor (Outer Zone 4)',
      tests: 'Diabetic & Renal Health Check (8 Tests)',
      payoutAmount: 250,
      urgency: 'HIGH',
      status: 'OPEN_BROADCAST',
      broadcastTime: '10 mins ago',
      claimedBy: null
    },
    {
      id: 'TASK-8902',
      orderId: 'MM-8924',
      patientName: 'Lakshmi Narayana',
      area: 'Chandragiri High Road, Tirupati Suburbs',
      tests: 'Complete Blood Count (CBC) + ESR',
      payoutAmount: 180,
      urgency: 'NORMAL',
      status: 'CLAIMED',
      broadcastTime: '25 mins ago',
      claimedBy: 'Ankit Sharma (FL-101)'
    },
    {
      id: 'TASK-8899',
      orderId: 'MM-8919',
      patientName: 'Radhika Devi',
      area: 'Air Bypass Rd, Tirupati',
      tests: 'Thyroid Panel (T3, T4, TSH Ultra-Sensitive)',
      payoutAmount: 200,
      urgency: 'COMPLETED',
      status: 'DELIVERED_TO_LAB',
      broadcastTime: '2 hours ago',
      claimedBy: 'Sneha Reddy (FL-102)'
    }
  ]);

  // Wallet & Payout Ledger (Sub-Tab 3)
  const [ledgerEntries, setLedgerEntries] = useState([
    {
      id: 'TX-901',
      date: 'Today 09:15 AM',
      freelancerId: 'FL-102',
      freelancerName: 'Sneha Reddy',
      orderRef: 'MM-8919',
      type: 'COLLECTION_COMMISSION',
      desc: 'Doorstep Collection Commission: Thyroid Profile',
      amount: 200,
      status: 'CREDITED_TO_WALLET',
      payoutMode: 'WALLET_BALANCE'
    },
    {
      id: 'TX-900',
      date: 'Yesterday 06:40 PM',
      freelancerId: 'FL-102',
      freelancerName: 'Sneha Reddy',
      orderRef: 'PAYOUT-OCT-05',
      type: 'UPI_PAYOUT_SETTLEMENT',
      desc: 'Instant UPI Settlement to Sneha Reddy (sneha@oksbi)',
      amount: -1500,
      status: 'SETTLED_SUCCESS',
      payoutMode: 'UPI_INSTANT'
    },
    {
      id: 'TX-899',
      date: 'Yesterday 11:20 AM',
      freelancerId: 'FL-101',
      freelancerName: 'Ankit Sharma',
      orderRef: 'ONBOARD-SEC-101',
      type: 'SECURITY_DEPOSIT_CREDIT',
      desc: 'Onboarding Security Deposit Credit upon Paramedical KYC',
      amount: 2000,
      status: 'ACTIVE_INVENTORY_WALLET',
      payoutMode: 'SYSTEM_WALLET'
    }
  ]);

  // Handle KYC Approval
  const handleApprove = async (fl) => {
    try {
      if (safeFetch && API_BASE) {
        await safeFetch(`${API_BASE}/api/v1/admin/freelancers/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: fl.id, action: 'APPROVE' })
        });
      }
    } catch (e) {}

    setFreelancers(prev => prev.map(f => f.id === fl.id ? { 
      ...f, 
      status: 'APPROVED', 
      walletBalance: (f.walletBalance || 0) || 2000,
      payoutPending: (f.payoutPending || 0) || 2000
    } : f));
  };

  // Handle KYC Rejection
  const handleReject = async (fl) => {
    try {
      if (safeFetch && API_BASE) {
        await safeFetch(`${API_BASE}/api/v1/admin/freelancers/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: fl.id, action: 'REJECT' })
        });
      }
    } catch (e) {}

    setFreelancers(prev => prev.map(f => f.id === fl.id ? { ...f, status: 'REJECTED' } : f));
  };

  // Broadcast a new gig to FCM freelancers
  const handleBroadcastGig = (taskId) => {
    setBroadcastTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'OPEN_BROADCAST', broadcastTime: 'Just now (FCM Broadcast Sent)' } : t));
    alert('📡 Push Notification broadcasted to all approved freelance phlebotomists in Tirupati / Chittoor district.');
  };

  // Release instant payout via UPI
  const handleReleasePayout = (fl) => {
    const payoutAmt = fl.payoutPending || fl.walletBalance || 1000;
    if (payoutAmt <= 0) {
      alert('No pending payout balance for this freelancer.');
      return;
    }

    const newTx = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      date: 'Just now',
      freelancerId: fl.id,
      freelancerName: fl.name,
      orderRef: `PAYOUT-${Date.now().toString().slice(-6)}`,
      type: 'UPI_PAYOUT_SETTLEMENT',
      desc: `Instant UPI Settlement to ${fl.name} (${fl.phone})`,
      amount: -payoutAmt,
      status: 'SETTLED_SUCCESS',
      payoutMode: 'UPI_INSTANT'
    };

    setLedgerEntries(prev => [newTx, ...prev]);
    setFreelancers(prev => prev.map(f => f.id === fl.id ? { ...f, payoutPending: 0 } : f));
    setSelectedPayout(null);
    alert(`✅ ₹${payoutAmt} successfully released via UPI Gateway to ${fl.name}. Transaction ID: ${newTx.id}`);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    setFreelancers(prev => [addForm, ...prev]);
    setShowAddModal(false);
    setAddForm({
      id: `FL-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      phone: '',
      city: 'Tirupati',
      qualification: 'DMLT (Diploma Medical Lab Tech)',
      paramedicalCert: 'AP-PMC-',
      experience: '3 Years',
      regFeePaid: true,
      feeAmount: 2000,
      walletBalance: 2000,
      status: 'PENDING_VERIFICATION',
      rating: 4.9,
      completedOrders: 0,
      hemolysisRate: '0%',
      coldChainScore: '100%',
      earnings: 0,
      payoutPending: 2000
    });
  };

  const filteredFreelancers = freelancers.filter(f => {
    if (filterKyc === 'PENDING') return f.status === 'PENDING_VERIFICATION';
    if (filterKyc === 'APPROVED') return f.status === 'APPROVED';
    return true;
  });

  return (
    <div>
      {/* Top Header Banner */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A' }}>Freelancer Partner Management Hub</h2>
            <span style={{ fontSize: '0.75rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.55rem', borderRadius: '6px', fontWeight: '800' }}>
              Tier-3 FCM Contractor Network
            </span>
          </div>
          <p style={{ color: '#64748B', fontSize: '0.85rem' }}>
            End-to-end management for freelance phlebotomists: Paramedical Council KYC, Gig Broadcasts, Wallet Ledgers & Quality SLAs.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{ padding: '0.65rem 1.25rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem', boxShadow: '0 4px 14px rgba(0,107,112,0.2)' }}
        >
          <PlusCircle size={16} color="#FBBF24" /> Register New Freelancer
        </button>
      </div>

      {/* Sub-Navigation Tabs Bar (VR Here Style) */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        backgroundColor: '#FFFFFF', 
        padding: '0.5rem', 
        borderRadius: '14px', 
        border: '1px solid #E2E8F0', 
        marginBottom: '1.5rem',
        overflowX: 'auto',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        {[
          { key: 'KYC_VERIFICATION', label: '1. Verification & KYC Desk', icon: ShieldCheck, badge: `${freelancers.filter(f => f.status === 'PENDING_VERIFICATION').length} Pending` },
          { key: 'BROADCAST_ORDERS', label: '2. Broadcast Tasks & Gigs', icon: Send, badge: `${broadcastTasks.filter(t => t.status === 'OPEN_BROADCAST').length} Open` },
          { key: 'WALLET_PAYOUTS', label: '3. Wallet & Payout Ledger', icon: DollarSign, badge: 'UPI 1-Tap' },
          { key: 'PERFORMANCE_SLA', label: '4. Ratings & Quality SLA', icon: Star, badge: 'Zero Hemolysis' }
        ].map(tab => {
          const TabIcon = tab.icon;
          const isActive = activeSubTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.65rem 1.1rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: isActive ? '#006B70' : 'transparent',
                color: isActive ? '#FFFFFF' : '#64748B',
                fontWeight: isActive ? '800' : '600',
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <TabIcon size={16} color={isActive ? '#FBBF24' : '#64748B'} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span style={{ 
                  fontSize: '0.7rem', 
                  backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#F1F5F9', 
                  color: isActive ? '#FFF' : '#475569', 
                  padding: '0.1rem 0.45rem', 
                  borderRadius: '6px', 
                  fontWeight: '800' 
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: VERIFICATION & KYC DESK                                       */}
      {/* ========================================================================= */}
      {activeSubTab === 'KYC_VERIFICATION' && (
        <div>
          {/* KYC Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {[
              { key: 'ALL', label: 'All Applicants', count: freelancers.length },
              { key: 'PENDING', label: 'Pending Verification', count: freelancers.filter(f => f.status === 'PENDING_VERIFICATION').length },
              { key: 'APPROVED', label: 'Approved Freelancers', count: freelancers.filter(f => f.status === 'APPROVED').length }
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilterKyc(f.key)}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '8px',
                  border: filterKyc === f.key ? '1.5px solid #006B70' : '1px solid #CBD5E1',
                  backgroundColor: filterKyc === f.key ? 'rgba(0,107,112,0.08)' : '#FFFFFF',
                  color: filterKyc === f.key ? '#006B70' : '#475569',
                  fontWeight: '800',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {filteredFreelancers.map(fl => {
              const isPending = fl.status === 'PENDING_VERIFICATION';
              const isApproved = fl.status === 'APPROVED';

              return (
                <div 
                  key={fl.id} 
                  style={{ 
                    backgroundColor: '#FFFFFF', 
                    borderRadius: '20px', 
                    border: isPending ? '1.5px solid #F59E0B' : isApproved ? '1px solid #10B981' : '1px solid #E2E8F0', 
                    padding: '1.5rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: '800', backgroundColor: isApproved ? '#DCFCE7' : isPending ? '#FEF3C7' : '#FEE2E2', color: isApproved ? '#15803D' : isPending ? '#B45309' : '#DC2626' }}>
                        {fl.status}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#006B70', fontWeight: '800', backgroundColor: 'rgba(0,107,112,0.08)', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                        ₹{fl.feeAmount || 2000} REG FEE PAID
                      </span>
                    </div>

                    <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A' }}>{fl.name}</h3>
                        <div style={{ fontSize: '0.8rem', color: '#64748B', fontFamily: 'monospace', marginTop: '0.1rem' }}>ID: {fl.id}</div>
                      </div>
                      <button
                        onClick={() => setSelectedDocFreelancer(fl)}
                        style={{ padding: '0.35rem 0.75rem', backgroundColor: '#F1F5F9', color: '#0284C7', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <Eye size={14} /> View Dossier
                      </button>
                    </div>

                    <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem' }}>
                      <div style={{ color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Award size={15} color="#D97706" /> <strong>Qualification:</strong> {fl.qualification}
                      </div>
                      <div style={{ color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <FileText size={15} color="#006B70" /> <strong>Paramedical Council:</strong> {fl.paramedicalCert}
                      </div>
                      <div style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Phone size={14} /> {fl.phone || '+91 98765 00000'} • 📍 {fl.city || 'Tirupati'}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '1.25rem' }}>
                    {isPending ? (
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button 
                          onClick={() => handleApprove(fl)}
                          style={{ flex: 1, padding: '0.65rem', backgroundColor: '#10B981', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(16,185,129,0.2)' }}
                        >
                          <CheckCircle size={16} /> Approve & Credit ₹2,000
                        </button>
                        <button 
                          onClick={() => handleReject(fl)}
                          style={{ padding: '0.65rem 1rem', backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer' }}
                        >
                          Reject
                        </button>
                      </div>
                    ) : isApproved ? (
                      <div style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#F8FAFC', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem', border: '1px solid #E2E8F0' }}>
                        <span style={{ color: '#059669', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <ShieldCheck size={18} /> Verified Freelancer
                        </span>
                        <span style={{ color: '#D97706', fontWeight: '900', fontSize: '0.9rem' }}>
                          Wallet: ₹{fl.walletBalance || 2000}
                        </span>
                      </div>
                    ) : (
                      <div style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#FEF2F2', borderRadius: '10px', color: '#DC2626', fontWeight: '800', fontSize: '0.84rem', textAlign: 'center' }}>
                        Application Rejected
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: BROADCAST TASKS & GIG ORDERS (VR Here Order System)           */}
      {/* ========================================================================= */}
      {activeSubTab === 'BROADCAST_ORDERS' && (
        <div>
          <div style={{ marginBottom: '1.25rem', backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Send size={18} color="#006B70" /> Live FCM Gig Broadcast Queue
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                When salaried phlebotomist quota exceeds 15 samples/day, Tier-3 overflow orders are broadcasted to verified freelance FCM phlebotomists.
              </p>
            </div>
            <button
              onClick={() => {
                const newTask = {
                  id: `TASK-${Math.floor(8900 + Math.random() * 90)}`,
                  orderId: `MM-${Math.floor(8930 + Math.random() * 50)}`,
                  patientName: 'K. Mohan Reddy',
                  area: 'Alipiri Footpath Road, Tirupati',
                  tests: 'HbA1c + Lipid Profile (6 Biomarkers)',
                  payoutAmount: 220,
                  urgency: 'HIGH',
                  status: 'OPEN_BROADCAST',
                  broadcastTime: 'Just now',
                  claimedBy: null
                };
                setBroadcastTasks(prev => [newTask, ...prev]);
                alert('⚡ New Doorstep Sample Collection Task broadcasted to Freelancers!');
              }}
              style={{ padding: '0.6rem 1.1rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <PlusCircle size={15} color="#FBBF24" /> Broadcast Urgent Task
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {broadcastTasks.map(task => {
              const isOpen = task.status === 'OPEN_BROADCAST';
              const isClaimed = task.status === 'CLAIMED';
              const isDone = task.status === 'DELIVERED_TO_LAB';

              return (
                <div 
                  key={task.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: isOpen ? '1.5px solid #F59E0B' : '1px solid #E2E8F0',
                    padding: '1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ 
                      height: '44px', 
                      width: '44px', 
                      borderRadius: '12px', 
                      backgroundColor: isOpen ? '#FEF3C7' : isClaimed ? '#E0F2FE' : '#DCFCE7', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Send size={22} color={isOpen ? '#B45309' : isClaimed ? '#0284C7' : '#15803D'} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '900', color: '#0F172A', fontSize: '1rem' }}>{task.orderId} • {task.patientName}</span>
                        <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '800', backgroundColor: isOpen ? '#FEF3C7' : isClaimed ? '#E0F2FE' : '#DCFCE7', color: isOpen ? '#B45309' : isClaimed ? '#0369A1' : '#15803D' }}>
                          {task.status}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#64748B' }}>⏱ Broadcast: {task.broadcastTime}</span>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.25rem' }}>
                        <strong>Tests:</strong> {task.tests}
                      </div>

                      <div style={{ fontSize: '0.82rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                        <MapPin size={13} color="#006B70" /> {task.area}
                        {task.claimedBy && (
                          <span style={{ marginLeft: '0.5rem', color: '#006B70', fontWeight: '800' }}>
                            • 👤 Claimed by: {task.claimedBy}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '700' }}>COMMISSION PAYOUT</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#006B70' }}>₹{task.payoutAmount}</div>
                    </div>

                    {isOpen ? (
                      <button
                        onClick={() => handleBroadcastGig(task.id)}
                        style={{ padding: '0.6rem 1rem', backgroundColor: '#F59E0B', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Radio size={14} /> Re-Broadcast FCM
                      </button>
                    ) : isClaimed ? (
                      <button
                        onClick={() => {
                          setBroadcastTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'DELIVERED_TO_LAB' } : t));
                          alert('✅ Sample marked as received at MedMarg Central Lab. Freelancer commission credited.');
                        }}
                        style={{ padding: '0.6rem 1rem', backgroundColor: '#10B981', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <CheckCheck size={14} /> Confirm Lab Intake
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.82rem', color: '#059669', fontWeight: '800', backgroundColor: '#ECFDF5', padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid #A7F3D0' }}>
                        ✓ Sample Processed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: WALLET & PAYOUT LEDGER (VR Here Ledger System)                */}
      {/* ========================================================================= */}
      {activeSubTab === 'WALLET_PAYOUTS' && (
        <div>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700' }}>TOTAL CONTRACTOR COMMISSIONS</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#006B70', marginTop: '0.35rem' }}>₹27,800</div>
              <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '700', marginTop: '0.2rem' }}>↑ 138 Doorstep Samples Collected</div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700' }}>PENDING UPI PAYOUTS</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#D97706', marginTop: '0.35rem' }}>₹6,250</div>
              <div style={{ fontSize: '0.72rem', color: '#B45309', fontWeight: '700', marginTop: '0.2rem' }}>2 Freelancers Awaiting Payout Release</div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700' }}>ONBOARDING SECURITY HELD</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0F172A', marginTop: '0.35rem' }}>₹6,000</div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '700', marginTop: '0.2rem' }}>₹2,000 / active freelancer inventory kit</div>
            </div>
          </div>

          {/* Quick 1-Tap Payout Release Table */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.25rem', marginBottom: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CreditCard size={18} color="#006B70" /> 1-Tap UPI / Bank Payout Release Terminal
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Freelancer</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Paramedical License</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Completed Samples</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Wallet Balance</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Pending Payout</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {freelancers.filter(f => f.status === 'APPROVED').map(fl => (
                    <tr key={fl.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontWeight: '800', color: '#0F172A' }}>{fl.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{fl.id} • {fl.phone}</div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#006B70', fontWeight: '700' }}>
                        {fl.paramedicalCert}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: '700' }}>
                        {fl.completedOrders || 42} samples
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#0F172A' }}>
                        ₹{fl.walletBalance || 2000}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: '900', color: '#D97706' }}>
                        ₹{fl.payoutPending !== undefined ? fl.payoutPending : fl.walletBalance || 2000}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => handleReleasePayout(fl)}
                          style={{ padding: '0.45rem 0.9rem', backgroundColor: '#10B981', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <ArrowUpRight size={14} /> Release UPI Payout
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Trail Ledger Table */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.25rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Layers size={18} color="#006B70" /> Transaction Audit Ledger
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Tx ID</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Date & Time</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Freelancer</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Description & Order Ref</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Mode</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerEntries.map(entry => (
                    <tr key={entry.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontWeight: '700', color: '#64748B' }}>{entry.id}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#64748B' }}>{entry.date}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#0F172A' }}>{entry.freelancerName}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ color: '#334155' }}>{entry.desc}</div>
                        <div style={{ fontSize: '0.75rem', color: '#006B70', fontWeight: '700' }}>Ref: {entry.orderRef}</div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ fontSize: '0.72rem', backgroundColor: '#F1F5F9', color: '#475569', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '700' }}>
                          {entry.payoutMode}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '900', color: entry.amount > 0 ? '#15803D' : '#DC2626' }}>
                        {entry.amount > 0 ? `+₹${entry.amount}` : `-₹${Math.abs(entry.amount)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: PERFORMANCE & QUALITY SLA SCORECARD                           */}
      {/* ========================================================================= */}
      {activeSubTab === 'PERFORMANCE_SLA' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {freelancers.filter(f => f.status === 'APPROVED').map(fl => (
              <div 
                key={fl.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid #E2E8F0',
                  padding: '1.5rem',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Star size={18} color="#F59E0B" fill="#F59E0B" />
                    <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>{fl.rating || '5.0'} / 5.0</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#DCFCE7', color: '#15803D', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '800' }}>
                    GOLD TIER PHLEBOTOMIST
                  </span>
                </div>

                <div style={{ marginTop: '0.85rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A' }}>{fl.name}</h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Paramedical License: {fl.paramedicalCert}</div>
                </div>

                {/* Metrics Breakdown */}
                <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem', border: '1px solid #E2E8F0' }}>
                    <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <TrendingUp size={15} color="#006B70" /> Sample Rejection / Hemolysis Rate:
                    </span>
                    <strong style={{ color: '#15803D' }}>{fl.hemolysisRate || '0.0%'} (Perfect)</strong>
                  </div>

                  <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem', border: '1px solid #E2E8F0' }}>
                    <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Thermometer size={15} color="#0284C7" /> Cold-Chain SLA Compliance (2-8°C):
                    </span>
                    <strong style={{ color: '#0284C7' }}>{fl.coldChainScore || '99.8%'}</strong>
                  </div>

                  <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem', border: '1px solid #E2E8F0' }}>
                    <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={15} color="#D97706" /> On-Time Arrival TAT:
                    </span>
                    <strong style={{ color: '#D97706' }}>96.4% on-time (&lt; 25 mins)</strong>
                  </div>
                </div>

                {/* Patient Reviews Snippet */}
                <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#FEFCE8', borderRadius: '10px', border: '1px solid #FEF08A', fontSize: '0.78rem', color: '#854D0E' }}>
                  💬 <em>"Very gentle blood draw. Phlebotomist verified barcode tube and temperature bag right in front of us."</em> — Care Seeker in Tirupati
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: QUALIFICATION DOCUMENTS VIEWER MODAL                            */}
      {/* ========================================================================= */}
      {selectedDocFreelancer && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '650px', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', position: 'sticky', top: 0, zIndex: 10 }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A' }}>Qualification Verification Dossier</h3>
                <div style={{ fontSize: '0.8rem', color: '#006B70', fontWeight: '700' }}>{selectedDocFreelancer.name} ({selectedDocFreelancer.id})</div>
              </div>
              <button onClick={() => setSelectedDocFreelancer(null)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '1rem', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    🎓 {selectedDocFreelancer.qualification} Certificate
                  </div>
                  <span style={{ fontSize: '0.72rem', backgroundColor: '#DCFCE7', color: '#15803D', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>VERIFIED FORMAT</span>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', height: '120px', borderRadius: '8px', border: '1px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.3rem' }}>
                  <FileText size={32} color="#006B70" />
                  <span style={{ fontSize: '0.8rem', color: '#0F172A', fontWeight: '700' }}>DMLT_Degree_Certificate_{selectedDocFreelancer.id}.pdf</span>
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>State Board of Technical Education & Training • 1.2 MB</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '1rem', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    📜 Paramedical Council Registration ({selectedDocFreelancer.paramedicalCert})
                  </div>
                  <span style={{ fontSize: '0.72rem', backgroundColor: '#E0F2FE', color: '#0369A1', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>ACTIVE LICENSE</span>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', height: '100px', borderRadius: '8px', border: '1px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.3rem' }}>
                  <Award size={28} color="#D97706" />
                  <span style={{ fontSize: '0.8rem', color: '#0F172A', fontWeight: '700' }}>AP_Paramedical_Registration_Card.jpg</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '1rem', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    💳 Registration Fee Payment Proof (₹{selectedDocFreelancer.feeAmount || 2000})
                  </div>
                  <span style={{ fontSize: '0.72rem', backgroundColor: '#DCFCE7', color: '#15803D', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>PAID VIA RAZORPAY</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
                  Txn Ref: <strong style={{ color: '#006B70', fontFamily: 'monospace' }}>PAY_FL_908123490</strong> • Verified by MedMarg Accounting System
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button 
                  onClick={() => setSelectedDocFreelancer(null)} 
                  style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: REGISTER NEW FREELANCER MODAL                                   */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '540px', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A' }}>Register Freelance Phlebotomist</h3>
                <div style={{ fontSize: '0.8rem', color: '#006B70', fontWeight: '700' }}>Assign ID: {addForm.id}</div>
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Phlebotomist Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand V"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 00000"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Qualification Degree</label>
                  <select
                    value={addForm.qualification}
                    onChange={(e) => setAddForm({ ...addForm, qualification: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  >
                    <option value="DMLT (Diploma Medical Lab Tech)">DMLT (Diploma Medical Lab Tech)</option>
                    <option value="BSc MLT (Bachelor MLT)">BSc MLT (Bachelor MLT)</option>
                    <option value="Vocational Phlebotomy Cert">Vocational Phlebotomy Cert</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Paramedical Reg #</label>
                  <input
                    type="text"
                    required
                    placeholder="AP-PMC-XXXXX"
                    value={addForm.paramedicalCert}
                    onChange={(e) => setAddForm({ ...addForm, paramedicalCert: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Experience</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 4 Years"
                    value={addForm.experience}
                    onChange={(e) => setAddForm({ ...addForm, experience: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Primary City</label>
                  <input
                    type="text"
                    required
                    value={addForm.city}
                    onChange={(e) => setAddForm({ ...addForm, city: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  style={{ padding: '0.65rem 1.25rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Save & Add Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
