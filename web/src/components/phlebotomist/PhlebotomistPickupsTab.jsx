import React, { useState } from 'react';
import { 
  Phone, 
  Navigation, 
  QrCode, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Search, 
  ArrowRight, 
  CreditCard, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Package,
  AlertTriangle,
  Camera,
  Star
} from 'lucide-react';
import { API_BASE, safeFetch } from '../../data/apiConfig';

export default function PhlebotomistPickupsTab({ 
  pickups = [], 
  setPickups,
  completedPickups = new Set(), 
  inventory = [],
  setInventory,
  onStartTrip,
  onArriveDoorstep,
  onOpenScanModal,
  onOpenPaymentModal,
  onNavigateToIndent
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ASSIGNED' | 'EN_ROUTE' | 'ARRIVED' | 'DONE'
  const [shortageModal, setShortageModal] = useState(null); // Shortage alert modal state
  const [assignKitModal, setAssignKitModal] = useState(null); // Modal to view agent inventory and assign kit
  const [selectedKitItems, setSelectedKitItems] = useState({}); // Custom selections per item in modal

  // Enforce Rule: Accepts ONE order at a time
  const activeTripOrder = pickups.find(p => p.status === 'EN_ROUTE' || p.status === 'ARRIVED');

  // Kit Requirements Helper for an order based on tests and tubes
  const getRequiredKit = (pk) => {
    const list = [];
    const testStr = `${pk.tests || ''} ${pk.testName || ''} ${pk.packageName || ''}`.toLowerCase();
    const tubes = pk.tubes || [];

    // Analyze tubes or tests to deduce exact requirements
    const hasSST = tubes.some(t => /yellow|sst|serum|gold/i.test(t)) || /lipid|thyroid|liver|lft|kft|kidney|crp|vitamin|biochem|panel/i.test(testStr);
    const hasEDTA = tubes.some(t => /lavender|edta|purple|whole blood/i.test(t)) || /cbc|hemogram|hba1c|blood count|esr/i.test(testStr);
    const hasFluoride = tubes.some(t => /grey|gray|fluoride|sugar|glucose/i.test(t)) || /glucose|fbs|ppbs|sugar/i.test(testStr);
    const hasCitrate = tubes.some(t => /blue|citrate|coagulation|pt|inr/i.test(t)) || /coagulation|prothrombin|inr/i.test(testStr);

    if (hasSST || (!hasEDTA && !hasFluoride && !hasCitrate)) {
      list.push({ name: 'Vacutainer Gold SST (Serum Gel)', code: 'TUBE-SST', qty: 1 });
    }
    if (hasEDTA) {
      list.push({ name: 'Vacutainer Purple (EDTA Whole Blood)', code: 'TUBE-EDTA', qty: 1 });
    }
    if (hasFluoride) {
      list.push({ name: 'Vacutainer Grey (Fluoride Sugar)', code: 'TUBE-FLR', qty: 1 });
    }
    if (hasCitrate) {
      list.push({ name: 'Vacutainer Light Blue (Citrate)', code: 'TUBE-CIT', qty: 1 });
    }

    // Standard Doorstep Draw Consumables
    list.push({ name: 'Sterile Safety Syringes 5ml', code: 'SYR-5ML', qty: 1 });
    list.push({ name: 'Barcode Thermal Label Rolls', code: 'LBL-ROLL', qty: 1 });

    return list;
  };

  // Helper to find matching inventory item
  const findInventoryMatch = (req, invList) => {
    return invList.find(i => {
      if (req.code && i.code === req.code) return true;
      const iName = (i.name || '').toLowerCase();
      const rName = (req.name || '').toLowerCase();
      if (req.code === 'LBL-ROLL' && (iName.includes('barcode') || iName.includes('label'))) return true;
      if (req.code === 'SYR-5ML' && iName.includes('5ml')) return true;
      if (req.code === 'TUBE-SST' && (iName.includes('sst') || iName.includes('gold') || iName.includes('serum'))) return true;
      if (req.code === 'TUBE-EDTA' && (iName.includes('edta') || iName.includes('purple'))) return true;
      if (req.code === 'TUBE-FLR' && (iName.includes('fluoride') || iName.includes('grey') || iName.includes('gray'))) return true;
      if (req.code === 'TUBE-CIT' && (iName.includes('citrate') || iName.includes('blue'))) return true;
      return iName.includes(rName) || rName.includes(iName);
    });
  };

  // Open interactive Inventory Assessment & Assignment Modal
  const handleOpenAssignKitModal = (pk) => {
    const requiredKit = getRequiredKit(pk);
    // Initialize selected counts strictly capped by current available stock!
    const initialSelections = {};
    requiredKit.forEach(req => {
      const match = findInventoryMatch(req, inventory);
      if (match) {
        // Capped by available stock so 0-stock items don't falsely show selected: 1!
        initialSelections[match.id] = Math.min(req.qty, match.stock || 0);
      }
    });
    setSelectedKitItems(initialSelections);
    setAssignKitModal({ order: pk, requiredKit });
  };

  // Confirm Assignment from Modal
  const handleConfirmKitAssignment = () => {
    if (!assignKitModal) return;
    const { order: pk, requiredKit } = assignKitModal;

    // Check for shortages against what is selected
    const shortages = [];
    requiredKit.forEach(req => {
      const match = findInventoryMatch(req, inventory);
      const selectedQty = match ? (selectedKitItems[match.id] || 0) : 0;
      if (selectedQty < req.qty) {
        shortages.push({
          name: req.name,
          needed: req.qty,
          inHand: match ? match.stock : 0,
          selected: selectedQty
        });
      }
    });

    if (shortages.length > 0) {
      setAssignKitModal(null);
      setShortageModal({ order: pk, shortages });
      return;
    }

    // Deduct assigned items from agent's inventory
    if (setInventory) {
      setInventory(prev => prev.map(inv => {
        const deducted = selectedKitItems[inv.id] || 0;
        if (deducted > 0) {
          return { ...inv, stock: Math.max(0, inv.stock - deducted) };
        }
        return inv;
      }));
    }

    // Mark kit assigned on the pickup
    if (setPickups) {
      setPickups(prev => prev.map(p => p.id === pk.id ? { ...p, kitAssigned: true } : p));
    }

    // Persist to backend
    safeFetch(`${API_BASE}/api/v1/agent/order/assign-kit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: pk.id,
        kitItems: Object.entries(selectedKitItems).map(([id, qty]) => {
          const inv = inventory.find(i => i.id === id);
          return { id, name: inv?.name, code: inv?.code, qty };
        })
      })
    }).catch(() => {});

    setAssignKitModal(null);
  };

  // Filtered List
  const filteredPickups = pickups.filter(pk => {
    const isDone = completedPickups.has(pk.id) || pk.status === 'SAMPLE_COLLECTED' || pk.status === 'TRANSFERRED_TO_LAB';
    const isEnRoute = pk.status === 'EN_ROUTE';
    const isArrived = pk.status === 'ARRIVED';
    const isAssigned = !isDone && !isEnRoute && !isArrived;

    if (statusFilter === 'ASSIGNED' && !isAssigned) return false;
    if (statusFilter === 'EN_ROUTE' && !isEnRoute) return false;
    if (statusFilter === 'ARRIVED' && !isArrived) return false;
    if (statusFilter === 'DONE' && !isDone) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = pk.patientName?.toLowerCase().includes(q);
      const matchId = pk.id?.toLowerCase().includes(q);
      const matchPhone = pk.phone?.includes(q);
      const matchAddress = pk.address?.toLowerCase().includes(q);
      return matchName || matchId || matchPhone || matchAddress;
    }

    return true;
  });

  const completedCount = pickups.filter(pk => 
    completedPickups.has(pk.id) || pk.status === 'SAMPLE_COLLECTED' || pk.status === 'TRANSFERRED_TO_LAB'
  ).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Controls Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={14} /> LIVE DISPATCH ROSTER
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700' }}>Doorstep Collections</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A', marginTop: '0.25rem' }}>
            Today's Assigned Doorstep Sample Pickups ({pickups.length})
          </h2>
        </div>

        {/* Active trip indicator pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {activeTripOrder ? (
            <span style={{ fontSize: '0.8rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.45rem 0.85rem', borderRadius: '10px', border: '1.5px solid #FCD34D', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Navigation size={14} className="animate-spin" /> Active Trip: Order #{activeTripOrder.id}
            </span>
          ) : (
            <span style={{ fontSize: '0.8rem', backgroundColor: '#ECFDF5', color: '#059669', padding: '0.45rem 0.85rem', borderRadius: '10px', border: '1px solid #A7F3D0', fontWeight: '800' }}>
              Ready for Next Trip
            </span>
          )}
          <span style={{ fontSize: '0.82rem', backgroundColor: '#FFFFFF', color: '#006B70', padding: '0.45rem 0.85rem', borderRadius: '10px', border: '1.5px solid #006B70', fontWeight: '900' }}>
            Completed: {completedCount} / {pickups.length} Visits
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by patient name, phone, address, or order ID..."
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem 0.65rem 2.4rem',
              borderRadius: '10px',
              border: '1px solid #CBD5E1',
              fontSize: '0.85rem',
              fontWeight: '600',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { key: 'ALL', label: 'All', count: pickups.length },
            { key: 'ASSIGNED', label: 'Scheduled', count: pickups.filter(p => !completedPickups.has(p.id) && p.status !== 'SAMPLE_COLLECTED' && p.status !== 'EN_ROUTE' && p.status !== 'ARRIVED').length },
            { key: 'EN_ROUTE', label: 'En Route', count: pickups.filter(p => p.status === 'EN_ROUTE').length },
            { key: 'ARRIVED', label: 'Arrived', count: pickups.filter(p => p.status === 'ARRIVED').length },
            { key: 'DONE', label: 'Completed', count: completedCount }
          ].map(btn => (
            <button
              key={btn.key}
              onClick={() => setStatusFilter(btn.key)}
              style={{
                padding: '0.5rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: statusFilter === btn.key ? '#006B70' : '#F1F5F9',
                color: statusFilter === btn.key ? '#FFFFFF' : '#475569',
                fontSize: '0.78rem',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {btn.label} ({btn.count})
            </button>
          ))}
        </div>
      </div>

      {/* Modern High-Efficiency List View */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filteredPickups.length === 0 ? (
          <div style={{ backgroundColor: '#FFFFFF', padding: '3rem', borderRadius: '16px', border: '1px dashed #CBD5E1', textAlign: 'center', color: '#64748B' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A' }}>No Pickups Found</div>
            <div style={{ fontSize: '0.82rem', marginTop: '0.35rem' }}>Try clearing filters or search query</div>
          </div>
        ) : (
          filteredPickups.map((pk) => {
            const isDone = completedPickups.has(pk.id) || pk.status === 'SAMPLE_COLLECTED' || pk.status === 'TRANSFERRED_TO_LAB';
            const isEnRoute = pk.status === 'EN_ROUTE';
            const isArrived = pk.status === 'ARRIVED';
            const isUnpaid = pk.paymentStatus === 'PAY_AT_DOORSTEP' || (typeof pk.paymentStatus === 'string' && pk.paymentStatus.includes('DOORSTEP'));
            const amountValue = pk.amount || pk.totalAmount || 899;
            const kitAssigned = pk.kitAssigned || isDone;

            // Single active trip enforcement
            const isAnotherTripActive = activeTripOrder && activeTripOrder.id !== pk.id;

            return (
              <div
                key={pk.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: isEnRoute ? '2px solid #0284C7' : isArrived ? '2px solid #006B70' : isDone ? '1px solid #BBF7D0' : '1px solid #E2E8F0',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1.25rem',
                  boxShadow: isEnRoute || isArrived ? '0 8px 24px rgba(0, 107, 112, 0.08)' : '0 2px 6px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s ease'
                }}
              >
                
                {/* 1. Time Slot & Status Pill */}
                <div style={{ minWidth: '150px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: '900',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '6px',
                      backgroundColor: isDone ? '#DCFCE7' : isArrived ? '#FEF3C7' : isEnRoute ? '#E0F2FE' : '#F1F5F9',
                      color: isDone ? '#166534' : isArrived ? '#B45309' : isEnRoute ? '#0369A1' : '#475569'
                    }}>
                      {isDone ? '✓ COMPLETED' : isArrived ? '📍 ARRIVED' : isEnRoute ? '🛵 EN ROUTE' : '⏱ SCHEDULED'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '900', color: '#0F172A' }}>
                    {pk.timeSlot || pk.time || '08:00 AM - 09:00 AM'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B', fontFamily: 'monospace', marginTop: '2px' }}>
                    ID: {pk.id}
                  </div>
                </div>

                {/* 2. Patient Profile & Address Column */}
                <div style={{ flex: 1.5, minWidth: '220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                      {pk.patientName || pk.patient}
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800', backgroundColor: '#F1F5F9', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                      {pk.age || '32M'}
                    </span>
                    {pk.fastingVerified && (
                      <span style={{ fontSize: '0.68rem', backgroundColor: '#FEF3C7', color: '#92400E', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '800' }}>
                        Fasting Required
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.35rem', display: 'flex', alignItems: 'flex-start', gap: '0.35rem', lineHeight: '1.3' }}>
                    <MapPin size={14} color="#64748B" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{pk.address || 'Air Bypass Road, Tirupati'}</span>
                  </div>

                  {/* Contact & Navigation links */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem' }}>
                    <a
                      href={`tel:${pk.phone}`}
                      style={{
                        padding: '0.25rem 0.6rem',
                        backgroundColor: '#F8FAFC',
                        color: '#006B70',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <Phone size={11} /> {pk.phone || 'Call'}
                    </a>

                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(pk.address || 'Tirupati')}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: '0.25rem 0.6rem',
                        backgroundColor: '#F8FAFC',
                        color: '#0284C7',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <Navigation size={11} /> Maps
                    </a>

                    {/* Doorstep Patient Verification OTP */}
                    {pk.otp && (
                      <span
                        title="Doorstep verification code shared with patient"
                        style={{
                          padding: '0.25rem 0.6rem',
                          backgroundColor: '#F0FDFA',
                          color: '#0F766E',
                          borderRadius: '6px',
                          border: '1px solid #99F6E4',
                          fontSize: '0.75rem',
                          fontWeight: '900',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontFamily: 'monospace'
                        }}
                      >
                        🔑 OTP: {pk.otp}
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. Kit Assessment & Required Supplies Column */}
                <div style={{ flex: 1.5, minWidth: '220px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>
                      Required Kit & Tubes
                    </div>
                    {kitAssigned ? (
                      <span style={{ fontSize: '0.68rem', backgroundColor: '#ECFDF5', color: '#059669', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '900' }}>
                        ✓ Kit Assigned
                      </span>
                    ) : (
                      <button
                        onClick={() => handleOpenAssignKitModal(pk)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#006B70',
                          fontSize: '0.72rem',
                          fontWeight: '900',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        Assess & Assign Kit →
                      </button>
                    )}
                  </div>

                  <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#004D40', marginTop: '0.15rem', lineHeight: '1.3' }}>
                    {pk.tests || 'Complete Blood Profile'}
                  </div>

                  {/* Required Vacutainer Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.4rem' }}>
                    {(pk.tubes || ['Yellow SST (Serum)', 'Lavender (EDTA Blood)']).map((tube, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.68rem',
                          backgroundColor: tube.includes('Yellow') || tube.includes('SST') ? '#FEF3C7' : tube.includes('Lavender') || tube.includes('EDTA') ? '#F3E8FF' : '#E0F2FE',
                          color: tube.includes('Yellow') || tube.includes('SST') ? '#92400E' : tube.includes('Lavender') || tube.includes('EDTA') ? '#6B21A8' : '#0369A1',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          fontWeight: '800'
                        }}
                      >
                        🧪 {tube}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 4. Payment Column */}
                <div style={{ minWidth: '150px', textAlign: 'center' }}>
                  {isUnpaid ? (
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>
                        ₹{amountValue}
                      </div>
                      <span style={{ fontSize: '0.7rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '800', display: 'inline-block', marginTop: '2px' }}>
                        Post-Paid (Doorstep QR)
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span style={{ fontSize: '0.78rem', backgroundColor: '#ECFDF5', color: '#059669', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: '900', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CheckCircle2 size={13} /> Paid Online (₹{amountValue})
                      </span>
                      <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '700', marginTop: '2px' }}>
                        Prepaid via Razorpay
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Sequential Progression Buttons (One Order at a Time) */}
                <div style={{ minWidth: '190px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {!isDone ? (
                    <>
                      {/* State 1: Scheduled / Not Started */}
                      {!isEnRoute && !isArrived && (
                        <div>
                          {isAnotherTripActive ? (
                            <button
                              disabled
                              style={{
                                width: '100%',
                                padding: '0.55rem',
                                backgroundColor: '#F1F5F9',
                                color: '#94A3B8',
                                border: '1px solid #E2E8F0',
                                borderRadius: '8px',
                                fontWeight: '800',
                                fontSize: '0.75rem',
                                cursor: 'not-allowed'
                              }}
                            >
                              Locked (Trip Active: #{activeTripOrder.id})
                            </button>
                          ) : !kitAssigned ? (
                            <button
                              onClick={() => handleOpenAssignKitModal(pk)}
                              style={{
                                width: '100%',
                                padding: '0.55rem',
                                backgroundColor: '#FEF3C7',
                                color: '#92400E',
                                border: '1px solid #FCD34D',
                                borderRadius: '8px',
                                fontWeight: '900',
                                fontSize: '0.78rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.35rem'
                              }}
                            >
                              <Package size={13} /> Assess & Assign Kit First
                            </button>
                          ) : (
                            <button
                              onClick={() => onStartTrip && onStartTrip(pk.id)}
                              style={{
                                width: '100%',
                                padding: '0.6rem',
                                backgroundColor: '#006B70',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '900',
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.4rem',
                                boxShadow: '0 2px 8px rgba(0,107,112,0.2)'
                              }}
                            >
                              <Navigation size={13} /> Accept & Start Trip
                            </button>
                          )}
                        </div>
                      )}

                      {/* State 2: En Route -> Mark Arrived */}
                      {isEnRoute && !isArrived && (
                        <button
                          onClick={() => {
                            if (onArriveDoorstep) onArriveDoorstep(pk.id);
                            onOpenScanModal(pk);
                          }}
                          style={{
                            width: '100%',
                            padding: '0.65rem',
                            backgroundColor: '#0284C7',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '900',
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            boxShadow: '0 2px 8px rgba(2,132,199,0.25)'
                          }}
                        >
                          <MapPin size={14} /> Reached Location (Send First Pic)
                        </button>
                      )}

                      {/* State 3: Arrived -> Open Doorstep Visit */}
                      {isArrived && (
                        <button
                          onClick={() => onOpenScanModal(pk)}
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.85rem',
                            backgroundColor: '#006B70',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '900',
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            boxShadow: '0 2px 8px rgba(0,107,112,0.25)'
                          }}
                        >
                          <Camera size={14} /> Open Visit (First Pic & Draw)
                        </button>
                      )}
                    </>
                  ) : (
                    <div style={{ padding: '0.6rem 0.8rem', backgroundColor: '#ECFDF5', borderRadius: '8px', textAlign: 'center', border: '1px solid #BBF7D0' }}>
                      <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                        <CheckCircle2 size={15} /> Visit Complete
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#065F46', marginTop: '2px', fontWeight: '700' }}>
                        {pk.reviewRequestSent ? '⭐ Review Requested' : 'Closed Without Review'}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE ASSESS & ASSIGN INVENTORY MODAL                             */}
      {/* ========================================================================= */}
      {assignKitModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 150,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1.25rem'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '22px',
            maxWidth: '560px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            border: '1.5px solid #CCFBF1'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#F0FDFA'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#006B70',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Package size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                    Assess & Assign Field Kit
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#0F766E', fontWeight: '700' }}>
                    Order #{assignKitModal.order.id} • {assignKitModal.order.patientName}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setAssignKitModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: '0.35rem',
                  fontSize: '1.2rem',
                  lineHeight: 1
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body: In-Hand Inventory List */}
            <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#334155', marginBottom: '0.25rem' }}>
                  Required Diagnostic Consumables for this Order:
                </div>
                <div style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  fontSize: '0.78rem',
                  color: '#475569'
                }}>
                  <div style={{ fontWeight: '800', color: '#004D40', marginBottom: '0.2rem' }}>
                    {assignKitModal.order.tests}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.35rem' }}>
                    {assignKitModal.requiredKit.map((req, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.72rem',
                          backgroundColor: '#CCFBF1',
                          color: '#0F766E',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '6px',
                          fontWeight: '800'
                        }}
                      >
                        {req.name} ×{req.qty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.82rem', fontWeight: '900', color: '#1E293B', marginBottom: '0.6rem' }}>
                Your In-Hand Field Kit Inventory (Review & Adjust):
              </div>

              {inventory.length === 0 ? (
                <div style={{
                  padding: '1.25rem',
                  backgroundColor: '#FFFBEB',
                  borderRadius: '12px',
                  border: '1.5px solid #FCD34D',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <div style={{ color: '#D97706', fontWeight: '900', fontSize: '0.92rem' }}>
                    ⚠️ In-Hand Bag Empty (0 Supplies Allotted)
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#78350F', margin: 0, maxWidth: '380px', lineHeight: 1.35 }}>
                    You do not have any consumables allotted in your field kit to fulfill this order yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAssignKitModal(null);
                      if (onNavigateToIndent) onNavigateToIndent();
                    }}
                    style={{
                      marginTop: '0.35rem',
                      padding: '0.55rem 1.1rem',
                      backgroundColor: '#006B70',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '900',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 2px 6px rgba(0,107,112,0.2)'
                    }}
                  >
                    ⚡ Raise Replenishment Indent Now
                  </button>
                </div>
              ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {inventory.map((inv) => {
                  const requiredMatch = assignKitModal.requiredKit.find(r => {
                    const match = findInventoryMatch(r, [inv]);
                    return !!match;
                  });
                  const isRequired = !!requiredMatch;
                  const currentSelected = selectedKitItems[inv.id] || 0;
                  const isOutOfStock = inv.stock <= 0;

                  return (
                    <div
                      key={inv.id}
                      style={{
                        padding: '0.75rem 0.9rem',
                        borderRadius: '12px',
                        border: isOutOfStock && isRequired
                          ? '1.5px solid #FCA5A5'
                          : isRequired 
                            ? (currentSelected > 0 ? '1.5px solid #006B70' : '1.5px solid #FCD34D')
                            : '1px solid #E2E8F0',
                        backgroundColor: isOutOfStock && isRequired
                          ? '#FEF2F2'
                          : isRequired ? (currentSelected > 0 ? '#F0FDFA' : '#FFFBEB') : '#FFFFFF',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.84rem', fontWeight: '800', color: '#0F172A' }}>
                            {inv.name}
                          </span>
                          {isRequired && (
                            <span style={{
                              fontSize: '0.65rem',
                              backgroundColor: isOutOfStock ? '#DC2626' : '#006B70',
                              color: '#FFFFFF',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '4px',
                              fontWeight: '900'
                            }}>
                              REQUIRED ({requiredMatch.qty})
                            </span>
                          )}
                          {isOutOfStock && (
                            <span style={{ fontSize: '0.65rem', backgroundColor: '#FEE2E2', color: '#991B1B', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '800' }}>
                              ⚠️ 0 In-Hand Stock
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.15rem' }}>
                          In-Hand Bag Stock: <strong style={{ color: inv.stock > 0 ? '#059669' : '#DC2626' }}>{inv.stock} {inv.unit || 'units'}</strong>
                          {inv.code && ` • Code: ${inv.code}`}
                        </div>
                      </div>

                      {/* Quantity Stepper for Assignment */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedKitItems(prev => ({
                              ...prev,
                              [inv.id]: Math.max(0, (prev[inv.id] || 0) - 1)
                            }));
                          }}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            backgroundColor: '#FFFFFF',
                            color: '#334155',
                            fontWeight: '900',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          -
                        </button>
                        <span style={{
                          minWidth: '24px',
                          textAlign: 'center',
                          fontSize: '0.9rem',
                          fontWeight: '900',
                          color: currentSelected > 0 ? '#006B70' : '#94A3B8'
                        }}>
                          {currentSelected}
                        </span>
                        <button
                          type="button"
                          disabled={currentSelected >= inv.stock}
                          onClick={() => {
                            setSelectedKitItems(prev => ({
                              ...prev,
                              [inv.id]: Math.min(inv.stock, (prev[inv.id] || 0) + 1)
                            }));
                          }}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            backgroundColor: currentSelected >= inv.stock ? '#F1F5F9' : '#006B70',
                            color: currentSelected >= inv.stock ? '#94A3B8' : '#FFFFFF',
                            fontWeight: '900',
                            fontSize: '0.9rem',
                            cursor: currentSelected >= inv.stock ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <button
                type="button"
                onClick={() => setAssignKitModal(null)}
                style={{
                  padding: '0.65rem 1.1rem',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  border: '1px solid #CBD5E1',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmKitAssignment}
                style={{
                  padding: '0.65rem 1.4rem',
                  backgroundColor: '#006B70',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '900',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 4px 12px rgba(0, 107, 112, 0.25)'
                }}
              >
                <CheckCircle2 size={16} /> Confirm & Assign Kit to Visit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SHORTAGE MODAL (PROMPTS INDENT & VISIT TO MEDMARG STORE)                 */}
      {/* ========================================================================= */}
      {shortageModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 150,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1.25rem'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '22px',
            maxWidth: '460px',
            width: '100%',
            padding: '1.75rem',
            border: '2px solid #F59E0B',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#D97706', marginBottom: '0.5rem' }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', margin: 0, color: '#0F172A' }}>
                Insufficient In-Hand Supplies!
              </h3>
            </div>
            
            <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: '1.4', marginTop: '0.25rem' }}>
              You do not have enough consumables in your field kit to fulfill Order <strong>#{shortageModal.order.id}</strong>.
            </p>

            <div style={{ backgroundColor: '#FFFBEB', padding: '1rem', borderRadius: '12px', border: '1px solid #FDE68A', margin: '1rem 0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#92400E', marginBottom: '0.4rem' }}>
                SHORTAGE BREAKDOWN:
              </div>
              {shortageModal.shortages.map((s, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.2rem 0', color: '#78350F' }}>
                  <span>• {s.name}</span>
                  <strong>Needs {s.needed} (Have {s.inHand})</strong>
                </div>
              ))}
            </div>

            <p style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: '1.4', marginBottom: '1.25rem' }}>
              💡 <strong>Next Step:</strong> Place a replenishment indent now and visit the <strong>MedMarg Store</strong> to collect your supplies from the Store In-Charge before starting this trip.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShortageModal(null)}
                style={{
                  flex: 1,
                  padding: '0.7rem',
                  backgroundColor: '#F1F5F9',
                  color: '#475569',
                  border: '1px solid #CBD5E1',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShortageModal(null);
                  if (onNavigateToIndent) onNavigateToIndent();
                }}
                style={{
                  flex: 2,
                  padding: '0.7rem',
                  backgroundColor: '#006B70',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '900',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}
              >
                <Package size={15} /> Raise Indent & Visit Store
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
