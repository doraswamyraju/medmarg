import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Search, 
  MessageCircle, 
  PhoneCall, 
  FlaskConical, 
  Building2, 
  Stethoscope, 
  Pill, 
  FolderHeart, 
  ArrowRight,
  Shield,
  Award,
  Zap,
  Star,
  CheckCircle2,
  UploadCloud,
  FileText,
  Activity,
  HeartPulse,
  HeartHandshake,
  Check,
  Plus,
  Navigation,
  MapPin,
  Bike,
  Heart,
  Droplets,
  Scale,
  Wind,
  Download,
  Bell,
  Clock,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import CareSeekerOffersCarousel from './CareSeekerOffersCarousel';

export default function CareSeekerHomeTab({ 
  user, 
  setActiveTab = () => {}, 
  setCatalogSubTab = () => {}, 
  setSelectedDetailItem = () => {}, 
  handleOrderWhatsApp = () => {}, 
  handleOrderCall = () => {},
  onOpenPrescriptionModal = () => {},
  onOpenAddressModal = () => {},
  addToCart = () => {},
  catalog = {},
  liveOrdersCount = 0,
  activeOrder = null,
  allOrders = []
}) {
  const [homeSearchQuery, setHomeSearchQuery] = useState('');
  const [activeSearchScope, setActiveSearchScope] = useState('TESTS'); // 'TESTS' | 'DOCTORS' | 'MEDICINES'
  const [activeSnapshotTab, setActiveSnapshotTab] = useState('Vitals'); // 'Vitals' | 'Activity' | 'Sleep' | 'Weight & BMI' | 'Trends'
  const searchInputRef = useRef(null);

  // Active Ongoing Order Data (matching live order or demo tracking)
  const ongoingOrder = activeOrder || (allOrders && allOrders.find(o => o.status === 'ENROUTE' || o.status === 'ASSIGNED' || o.status === 'SAMPLE_COLLECTED')) || {
    id: 'MM-LAB-4054',
    phleboName: 'Ajay Kumar',
    phleboPhone: '+91 98765 11223',
    phleboRating: '4.8 (320+ collections)',
    eta: '8 minutes',
    status: 'ENROUTE'
  };

  const topPackage = (catalog.packages && catalog.packages[0]) || {
    id: 'pkg_aarogyam_13',
    name: 'Thyrocare Aarogyam Complete 1.3 Full Body',
    lab: 'MedMarg / Thyrocare Processing Hub',
    price: 1499,
    mrp: 3500,
    params: 104,
    fasting: 'YES',
    sampleType: 'SERUM, EDTA',
    description: 'Comprehensive 104 biomarker assessment: Thyroid, Lipids, Liver LFT, Kidney KFT, Vitamins D3/B12 & CBC hemogram.',
    includes: ['Thyroid Profile Total (T3, T4, TSH)', 'Lipid Profile (7 Biomarkers)', 'Liver Function Test LFT (11 Params)', 'Kidney Function Test KFT (6 Params)', 'Vitamin D3 & B12', 'Complete Hemogram CBC (24 Params)']
  };

  const multiLabPartners = [
    { name: 'Thyrocare Technologies', badge: '104+ Biomarker Panels', discount: 'Up to 65% OFF', accreditation: 'NABL & CAP' },
    { name: 'MedMarg Central Hub', badge: '60-Min Express Phlebo', discount: 'Same-Day Fast TAT', accreditation: 'ISO 15189' },
    { name: 'Apollo Diagnostics', badge: 'Specialty Histopathology', discount: 'NABL Certified', accreditation: 'NABL' },
    { name: 'Metropolis Healthcare', badge: 'Advanced Genomic & Hormonal', discount: 'B2B Integrated', accreditation: 'CAP Accredited' }
  ];

  // Autocomplete live search matches across tests, profiles, packages
  const searchResults = homeSearchQuery.trim() ? [
    ...(catalog.packages || []).map(p => ({ ...p, itemType: 'PACKAGE' })),
    ...(catalog.profiles || []).map(p => ({ ...p, itemType: 'PROFILE' })),
    ...(catalog.tests || []).map(t => ({ ...t, itemType: 'TEST' }))
  ].filter(item => (item.name || item.title || '').toLowerCase().includes(homeSearchQuery.toLowerCase())).slice(0, 6) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* 1. UNIVERSAL HEALTHCARE SEARCH BAR */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '1.5rem 1.75rem',
        border: '1.5px solid #E2E8F0',
        boxShadow: '0 10px 30px rgba(0,77,64,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        position: 'relative'
      }}>
        
        {/* Scope Switcher Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { key: 'TESTS', label: 'Diagnostic Tests & Profiles (913+ Live)', active: true, icon: FlaskConical },
              { key: 'DOCTORS', label: 'Doctors & Clinics (Coming Soon)', active: false, icon: Stethoscope },
              { key: 'MEDICINES', label: 'Medicines & Pharmacy (Coming Soon)', active: false, icon: Pill }
            ].map(scope => {
              const IconC = scope.icon;
              const isSel = activeSearchScope === scope.key;
              return (
                <button
                  key={scope.key}
                  onClick={() => {
                    if (scope.active) setActiveSearchScope(scope.key);
                  }}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '10px',
                    border: isSel ? '1.5px solid #006B70' : '1px solid #E2E8F0',
                    backgroundColor: isSel ? '#006B70' : '#F8FAFC',
                    color: isSel ? '#FFFFFF' : scope.active ? '#334155' : '#94A3B8',
                    fontWeight: '800',
                    fontSize: '0.8rem',
                    cursor: scope.active ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <IconC size={14} color={isSel ? '#FBBF24' : '#64748B'} />
                  <span>{scope.label}</span>
                </button>
              );
            })}
          </div>

          <div style={{ fontSize: '0.74rem', color: '#006B70', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Sparkles size={14} color="#006B70" />
            <span>Smart Universal Search</span>
          </div>
        </div>

        {/* Search Input Box with Action Buttons */}
        <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
          <div style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: '#E0F2F1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}>
            <Search size={18} color="#006B70" />
          </div>

          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search 913+ lab tests, health packages, or organs (e.g. Thyroid, Vitamin D, HbA1c, Liver LFT, CBC)..."
            value={homeSearchQuery}
            onChange={(e) => setHomeSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.95rem 7.5rem 0.95rem 3.4rem',
              borderRadius: '16px',
              border: '2px solid #006B70',
              fontSize: '0.96rem',
              outline: 'none',
              color: '#0F172A',
              fontWeight: '600',
              backgroundColor: '#FAFCFC',
              boxShadow: '0 4px 14px rgba(0,107,112,0.08)'
            }}
          />

          <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {homeSearchQuery && (
              <button
                onClick={() => setHomeSearchQuery('')}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748B',
                  fontWeight: '900',
                  fontSize: '12px'
                }}
              >
                ✕
              </button>
            )}
            <button
              onClick={() => {
                setActiveTab('TESTS');
                setCatalogSubTab('ALL_TESTS');
              }}
              style={{
                backgroundColor: '#006B70',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.5rem 0.9rem',
                borderRadius: '10px',
                fontWeight: '800',
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <span>Explore Matrix</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Popular Quick Search Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', paddingTop: '0.2rem' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#64748B' }}>Popular Searches:</span>
          {[
            { label: '🩸 Complete Blood Count (CBC)', q: 'Complete Blood Count' },
            { label: '⚡ Thyroid Profile (T3/T4/TSH)', q: 'Thyroid' },
            { label: '🌿 HbA1c Diabetes', q: 'HbA1c' },
            { label: '☀️ Vitamin D3 & B12', q: 'Vitamin' },
            { label: '🛡️ Aarogyam Full Body', q: 'Aarogyam' },
            { label: '🧪 Lipid Cholesterol', q: 'Lipid' }
          ].map(chip => (
            <button
              key={chip.q}
              onClick={() => setHomeSearchQuery(chip.q)}
              style={{
                padding: '0.25rem 0.65rem',
                borderRadius: '20px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                color: '#334155',
                fontSize: '0.74rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E0F2F1';
                e.currentTarget.style.borderColor = '#006B70';
                e.currentTarget.style.color = '#006B70';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F8FAFC';
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.color = '#334155';
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Live Search Autocomplete Dropdown */}
        {searchResults.length > 0 && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% - 10px)',
            left: '1.5rem',
            right: '1.5rem',
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1.5px solid #006B70',
            boxShadow: '0 20px 45px -10px rgba(0,77,64,0.25)',
            zIndex: 1100,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ padding: '0.75rem 1.25rem', backgroundColor: '#F0FDF4', borderBottom: '1px solid #E2E8F0', fontSize: '0.78rem', fontWeight: '900', color: '#006B70', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>MATCHING DIAGNOSTIC TESTS & PANELS ({searchResults.length})</span>
              <span style={{ fontSize: '0.72rem', color: '#059669' }}>Click to view details or add instantly</span>
            </div>
            {searchResults.map((res, rIdx) => (
              <div
                key={(res.id || res.code) + '_' + rIdx}
                style={{
                  padding: '0.95rem 1.25rem',
                  borderBottom: '1px solid #F1F5F9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0FDF4'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
              >
                <div 
                  onClick={() => {
                    setSelectedDetailItem(res);
                    setHomeSearchQuery('');
                  }}
                  style={{ flex: 1 }}
                >
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.68rem', backgroundColor: '#006B70', color: '#FFFFFF', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '900' }}>
                      {res.itemType}
                    </span>
                    <span style={{ fontWeight: '900', color: '#0F172A', fontSize: '0.95rem' }}>
                      {res.name || res.title}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <span>🔬 {res.lab || 'MedMarg Central Hub'}</span>
                    <span>• Fasting: {res.fasting || 'NO'}</span>
                    <span>• 🩸 {res.sampleType || 'SERUM'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#006B70' }}>₹{res.price || 499}</div>
                    <div style={{ fontSize: '0.74rem', color: '#94A3B8', textDecoration: 'line-through' }}>₹{res.mrp || 999}</div>
                  </div>
                  <button
                    onClick={() => {
                      addToCart(res);
                      setHomeSearchQuery('');
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#006B70',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      boxShadow: '0 2px 8px rgba(0,107,112,0.2)'
                    }}
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. ONGOING ORDER TRACKING WIDGET (MATCHING USER'S IMAGE 4) */}
      {ongoingOrder && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '1.5rem 1.75rem',
          border: '1.5px solid #E2E8F0',
          boxShadow: '0 8px 24px rgba(0, 107, 112, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
              Ongoing Order
            </h3>
            <button
              onClick={() => setActiveTab('ORDERS')}
              style={{
                background: 'none',
                border: 'none',
                color: '#006B70',
                fontWeight: '800',
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              View Details <ChevronRight size={16} />
            </button>
          </div>

          {/* Phlebotomist and Arrival Status */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Phlebotomist Avatar with Phone Call Overlay */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #006B70 0%, #004D40 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFF',
                  fontWeight: '900',
                  fontSize: '1.5rem',
                  border: '3px solid #E0F2F1',
                  boxShadow: '0 4px 12px rgba(0,107,112,0.2)'
                }}>
                  👨‍⚕️
                </div>
                {ongoingOrder.phleboPhone && (
                  <button
                    onClick={() => handleOrderCall(ongoingOrder.phleboPhone)}
                    title="Call Phlebotomist"
                    style={{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                      backgroundColor: '#10B981',
                      color: '#FFF',
                      border: '2px solid #FFF',
                      borderRadius: '50%',
                      width: '26px',
                      height: '26px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                    }}
                  >
                    <PhoneCall size={13} />
                  </button>
                )}
              </div>

              <div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                  {ongoingOrder.phleboName || 'Ajay Kumar'}
                </h4>
                <div style={{ fontSize: '0.84rem', color: '#64748B', marginTop: '0.15rem' }}>
                  Your Phlebotomist
                </div>
                <div style={{ fontSize: '0.8rem', color: '#F59E0B', fontWeight: '800', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  ★ {ongoingOrder.phleboRating || '4.8 (320+ collections)'}
                </div>
              </div>
            </div>

            {/* Arrival & Live Tracking Button */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
              <div style={{
                backgroundColor: '#ECFDF5',
                color: '#065F46',
                border: '1px solid #A7F3D0',
                padding: '0.45rem 0.95rem',
                borderRadius: '20px',
                fontSize: '0.88rem',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
                Arriving in {ongoingOrder.eta || '8 minutes'}
              </div>

              <button
                onClick={() => setActiveTab('TRACK')}
                style={{
                  padding: '0.45rem 1rem',
                  backgroundColor: '#006B70',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 3px 10px rgba(0,107,112,0.2)'
                }}
              >
                <Navigation size={14} /> Live Tracking
              </button>
            </div>
          </div>

          {/* 4-Step Progress Line with Animated Scooter Icon */}
          <div style={{ position: 'relative', margin: '0.75rem 0' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              position: 'relative'
            }}>
              {/* Connector line */}
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '12%',
                right: '12%',
                height: '4px',
                backgroundColor: '#E2E8F0',
                zIndex: 1
              }}>
                <div style={{
                  height: '100%',
                  width: '68%',
                  backgroundColor: '#006B70',
                  borderRadius: '2px'
                }} />
              </div>

              {/* Steps */}
              {[
                { title: 'Order Confirmed', time: '9:10 AM', done: true },
                { title: 'Phlebotomist Assigned', time: '9:15 AM', done: true },
                { title: 'On the Way', time: '9:25 AM', done: true, current: true },
                { title: 'Sample Collection Pending', time: 'Pending', done: false }
              ].map((step, idx) => (
                <div key={idx} style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: step.current ? '#006B70' : (step.done ? '#006B70' : '#E2E8F0'),
                    color: step.done ? '#FFF' : '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.5rem',
                    boxShadow: step.current ? '0 0 0 4px rgba(0,107,112,0.2)' : 'none',
                    border: step.current ? '2px solid #FFF' : 'none'
                  }}>
                    {step.current ? '🛵' : (step.done ? <Check size={16} /> : (idx + 1))}
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: step.current ? '900' : '700', color: step.current ? '#006B70' : '#1E293B' }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.1rem' }}>
                    {step.time}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mini Road Map Snippet with Route & ETA Pill */}
          <div style={{
            height: '105px',
            borderRadius: '16px',
            backgroundColor: '#F8FAFC',
            border: '1.5px solid #E2E8F0',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
            backgroundSize: '16px 16px'
          }}>
            {/* SVG Road Route */}
            <svg style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}>
              <path
                d="M 100 75 Q 250 20 450 65 T 800 40"
                fill="none"
                stroke="#006B70"
                strokeWidth="4"
                strokeDasharray="6 4"
              />
            </svg>

            {/* Scooter Marker & ETA Pill */}
            <div style={{
              position: 'absolute',
              left: '46%',
              top: '25px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 3
            }}>
              <div style={{
                backgroundColor: '#006B70',
                color: '#FFF',
                fontSize: '0.72rem',
                fontWeight: '800',
                padding: '0.2rem 0.55rem',
                borderRadius: '10px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                whiteSpace: 'nowrap',
                marginBottom: '4px'
              }}>
                8 mins
              </div>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: '#FFF',
                border: '2px solid #006B70',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
              }}>
                🛵
              </div>
            </div>

            {/* Destination Home Pin */}
            <div style={{
              position: 'absolute',
              right: '15%',
              top: '25px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 3
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(16,185,129,0.3)'
              }}>
                <MapPin size={18} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. HORIZONTAL SCROLLABLE OFFERS CAROUSEL */}
      <CareSeekerOffersCarousel 
        onSelectOffer={setSelectedDetailItem}
        catalog={catalog}
      />

      {/* 4. MY HEALTH SNAPSHOT SECTION (MATCHING USER'S IMAGE 5) */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '1.75rem',
        border: '1.5px solid #E2E8F0',
        boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        {/* Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
              My Health Snapshot
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
              Last updated: 12 Oct 2026, 8:45 AM
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => alert('Apple Health Sync: Connected to HealthKit sandbox.')}
              style={{
                backgroundColor: '#FFF1F2',
                color: '#BE123C',
                border: '1px solid #FECDD3',
                padding: '0.45rem 0.85rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer'
              }}
            >
              ❤️ Sync with Apple Health
            </button>

            <button
              onClick={() => setActiveTab('VITALS')}
              style={{
                background: 'none',
                border: 'none',
                color: '#006B70',
                fontWeight: '800',
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              View Details <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Sub-tabs Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['Vitals', 'Activity', 'Sleep', 'Weight & BMI', 'Trends'].map(tab => {
              const isSelected = activeSnapshotTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveSnapshotTab(tab)}
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: isSelected ? '#006B70' : '#F1F5F9',
                    color: isSelected ? '#FFFFFF' : '#475569',
                    fontWeight: '800',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setActiveTab('VITALS')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '10px',
              border: '1.5px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#006B70',
              fontWeight: '800',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              cursor: 'pointer'
            }}
          >
            <Plus size={15} /> Add Reading
          </button>
        </div>

        {/* 6 Biometric Cards with Sparklines */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.9rem' }}>
          
          {/* 1. Blood Pressure */}
          <div style={{
            backgroundColor: '#FFF5F5',
            borderRadius: '18px',
            padding: '1.15rem 1rem',
            border: '1px solid #FFE4E6',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#E11D48', fontSize: '0.78rem', fontWeight: '800' }}>
                <Heart size={15} /> Blood Pressure
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: '900', color: '#0F172A', marginTop: '0.4rem' }}>
                120/80
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B' }}>mmHg</div>
            </div>

            {/* Sparkline curve */}
            <svg viewBox="0 0 100 25" style={{ width: '100%', height: '26px' }}>
              <path d="M 0 18 Q 20 12 40 16 T 70 8 T 100 12" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
            </svg>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', backgroundColor: '#DCFCE7', color: '#15803D', padding: '0.15rem 0.55rem', borderRadius: '6px', fontWeight: '800' }}>
                Normal
              </span>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>2 days ago</span>
            </div>
          </div>

          {/* 2. Blood Sugar (Fasting) */}
          <div style={{
            backgroundColor: '#F0F9FF',
            borderRadius: '18px',
            padding: '1.15rem 1rem',
            border: '1px solid #E0F2FE',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0284C7', fontSize: '0.78rem', fontWeight: '800' }}>
                <Droplets size={15} /> Blood Sugar (Fasting)
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: '900', color: '#0F172A', marginTop: '0.4rem' }}>
                92
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B' }}>mg/dL</div>
            </div>

            {/* Sparkline curve */}
            <svg viewBox="0 0 100 25" style={{ width: '100%', height: '26px' }}>
              <path d="M 0 20 Q 30 16 55 18 T 85 10 T 100 8" fill="none" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
            </svg>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', backgroundColor: '#DCFCE7', color: '#15803D', padding: '0.15rem 0.55rem', borderRadius: '6px', fontWeight: '800' }}>
                Normal
              </span>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Yesterday</span>
            </div>
          </div>

          {/* 3. Heart Rate */}
          <div style={{
            backgroundColor: '#FFF7ED',
            borderRadius: '18px',
            padding: '1.15rem 1rem',
            border: '1px solid #FFEDD5',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#EA580C', fontSize: '0.78rem', fontWeight: '800' }}>
                <Activity size={15} /> Heart Rate
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: '900', color: '#0F172A', marginTop: '0.4rem' }}>
                76
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B' }}>bpm</div>
            </div>

            {/* Sparkline curve */}
            <svg viewBox="0 0 100 25" style={{ width: '100%', height: '26px' }}>
              <path d="M 0 18 Q 25 15 50 16 T 75 8 T 100 9" fill="none" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
            </svg>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', backgroundColor: '#DCFCE7', color: '#15803D', padding: '0.15rem 0.55rem', borderRadius: '6px', fontWeight: '800' }}>
                Normal
              </span>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>2 days ago</span>
            </div>
          </div>

          {/* 4. Weight */}
          <div style={{
            backgroundColor: '#F0FDF4',
            borderRadius: '18px',
            padding: '1.15rem 1rem',
            border: '1px solid #DCFCE7',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#16A34A', fontSize: '0.78rem', fontWeight: '800' }}>
                <Scale size={15} /> Weight
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: '900', color: '#0F172A', marginTop: '0.4rem' }}>
                72
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B' }}>kg</div>
            </div>

            {/* Sparkline curve */}
            <svg viewBox="0 0 100 25" style={{ width: '100%', height: '26px' }}>
              <path d="M 0 18 Q 30 14 60 17 T 90 9 T 100 7" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" />
            </svg>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', backgroundColor: '#DCFCE7', color: '#15803D', padding: '0.15rem 0.55rem', borderRadius: '6px', fontWeight: '800' }}>
                ↓ 1.5 kg
              </span>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>3 days ago</span>
            </div>
          </div>

          {/* 5. BMI */}
          <div style={{
            backgroundColor: '#FAF5FF',
            borderRadius: '18px',
            padding: '1.15rem 1rem',
            border: '1px solid #F3E8FF',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#9333EA', fontSize: '0.78rem', fontWeight: '800' }}>
                <Sparkles size={15} /> BMI
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: '900', color: '#0F172A', marginTop: '0.4rem' }}>
                23.4
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B' }}>kg/m²</div>
            </div>

            {/* Sparkline curve */}
            <svg viewBox="0 0 100 25" style={{ width: '100%', height: '26px' }}>
              <path d="M 0 18 Q 30 16 60 14 T 85 9 T 100 6" fill="none" stroke="#9333EA" strokeWidth="2.5" strokeLinecap="round" />
            </svg>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', backgroundColor: '#DCFCE7', color: '#15803D', padding: '0.15rem 0.55rem', borderRadius: '6px', fontWeight: '800' }}>
                Normal
              </span>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>3 days ago</span>
            </div>
          </div>

          {/* 6. SpO2 */}
          <div style={{
            backgroundColor: '#F0FDFA',
            borderRadius: '18px',
            padding: '1.15rem 1rem',
            border: '1px solid #CCFBF1',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0D9488', fontSize: '0.78rem', fontWeight: '800' }}>
                <Wind size={15} /> SpO₂
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: '900', color: '#0F172A', marginTop: '0.4rem' }}>
                98
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B' }}>%</div>
            </div>

            {/* Sparkline curve */}
            <svg viewBox="0 0 100 25" style={{ width: '100%', height: '26px' }}>
              <path d="M 0 19 Q 30 15 65 17 T 90 10 T 100 8" fill="none" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" />
            </svg>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', backgroundColor: '#DCFCE7', color: '#15803D', padding: '0.15rem 0.55rem', borderRadius: '6px', fontWeight: '800' }}>
                Normal
              </span>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>3 days ago</span>
            </div>
          </div>

        </div>
      </div>

      {/* 5. RECENT LAB REPORTS & CLINICAL INSIGHTS SPLIT ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Recent Reports Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '1.75rem',
          border: '1.5px solid #E2E8F0',
          boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} color="#006B70" />
                <h4 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                  Recent Lab Reports
                </h4>
              </div>
              <button
                onClick={() => setActiveTab('REPORTS')}
                style={{ background: 'none', border: 'none', color: '#006B70', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
              >
                Health Vault <ChevronRight size={15} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {[
                { title: 'Complete Blood Count (CBC)', date: '28 Sep 2026', lab: 'Thyrocare NABL Lab', status: 'Verified' },
                { title: 'Thyroid Profile Total (T3/T4/TSH)', date: '15 Aug 2026', lab: 'Thyrocare NABL Lab', status: 'Verified' },
                { title: 'HbA1c Glycated Hemoglobin', date: '02 Jul 2026', lab: 'MedMarg Processing Hub', status: 'Verified' }
              ].map((rep, rIdx) => (
                <div
                  key={rIdx}
                  style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '14px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0F172A' }}>{rep.title}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.15rem' }}>
                      📅 {rep.date} • {rep.lab}
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('REPORTS')}
                    style={{
                      padding: '0.4rem 0.75rem',
                      backgroundColor: '#E0F2F1',
                      color: '#006B70',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <Download size={13} /> PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reminders & Insights Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '1.75rem',
          border: '1.5px solid #E2E8F0',
          boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <Bell size={20} color="#D97706" />
              <h4 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                Reminders & Clinical Insights
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{
                padding: '0.85rem 1rem',
                backgroundColor: '#FFFBEB',
                borderRadius: '14px',
                border: '1px solid #FDE68A',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start'
              }}>
                <Clock size={18} color="#D97706" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: '900', color: '#92400E' }}>
                    Fasting Protocol Reminder
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#B45309', marginTop: '0.15rem', lineHeight: 1.4 }}>
                    Your upcoming order includes Fasting Glucose & Lipids. Please maintain 8-10 hours water-only fasting before your phlebotomist arrives.
                  </div>
                </div>
              </div>

              <div style={{
                padding: '0.85rem 1rem',
                backgroundColor: '#F0FDF4',
                borderRadius: '14px',
                border: '1px solid #BBF7D0',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start'
              }}>
                <ShieldCheck size={18} color="#15803D" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: '900', color: '#166534' }}>
                    Optimal Cold-Chain Guaranteed
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#15803D', marginTop: '0.15rem', lineHeight: 1.4 }}>
                    Your samples will be transported in IoT digital thermal gel carriers at strictly 2°C - 8°C directly to Thyrocare / MedMarg testing labs.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 6. STREAMLINED COMPACT 1-TAP HERO BLOCK */}
      <div style={{
        backgroundColor: '#004D40',
        borderRadius: '20px',
        padding: '1.5rem 1.75rem',
        color: '#FFFFFF',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        alignItems: 'center',
        boxShadow: '0 12px 28px -6px rgba(0,77,64,0.3)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.6rem', borderRadius: '16px', fontSize: '0.72rem', fontWeight: '900', marginBottom: '0.4rem' }}>
            <Sparkles size={13} /> 60-MIN EXPRESS HOME PHLEBOTOMY
          </div>
          <h3 style={{ fontSize: '1.45rem', fontWeight: '900', lineHeight: 1.25, margin: 0 }}>
            Book Diagnostic Tests or Upload Prescription
          </h3>
          <p style={{ color: '#80CBC4', fontSize: '0.84rem', marginTop: '0.35rem', lineHeight: 1.4 }}>
            Certified phlebotomists with IoT cold-chain telemetry (`2°C - 8°C`) across Tirupati.
          </p>

          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleOrderWhatsApp()}
              style={{ padding: '0.6rem 1rem', backgroundColor: '#25D366', color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <MessageCircle size={16} /> WhatsApp
            </button>

            <button
              onClick={handleOrderCall}
              style={{ padding: '0.6rem 1rem', backgroundColor: '#0284C7', color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <PhoneCall size={16} /> Call Us
            </button>

            <button
              onClick={onOpenPrescriptionModal}
              style={{ padding: '0.6rem 1rem', backgroundColor: '#F59E0B', color: '#0F172A', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <UploadCloud size={16} /> Upload Prescription
            </button>
          </div>
        </div>

        {/* Featured Smart Package Mini Card */}
        <div 
          onClick={() => setSelectedDetailItem(topPackage)}
          style={{ backgroundColor: '#003830', borderRadius: '16px', padding: '1.25rem', border: '1.5px solid #006B70', cursor: 'pointer', transition: 'all 0.2s ease' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '900' }}>
              MOST POPULAR • {topPackage.params || 104} PARAMS
            </span>
            <span style={{ fontSize: '0.74rem', color: '#FBBF24', fontWeight: '800' }}>★ 4.9</span>
          </div>

          <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#FFF', marginTop: '0.5rem', lineHeight: 1.3 }}>
            {topPackage.name || topPackage.title}
          </h4>

          <div style={{ marginTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '1.35rem', fontWeight: '900', color: '#FBBF24' }}>₹{topPackage.price || 1499}</span>
              <span style={{ fontSize: '0.8rem', color: '#80CBC4', textDecoration: 'line-through', marginLeft: '0.4rem' }}>₹{topPackage.mrp || 3500}</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#FFF', fontWeight: '800', backgroundColor: '#006B70', padding: '0.35rem 0.75rem', borderRadius: '8px' }}>
              View Details →
            </span>
          </div>
        </div>
      </div>

      {/* 4. MULTI-LAB PARTNER AGGREGATOR GRID */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
              Integrated Multi-Lab Processing Network
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.15rem 0 0 0' }}>
              Compare tests, B2B pricing, and TAT across leading accredited pathology networks.
            </p>
          </div>
          <button
            onClick={() => {
              setActiveTab('TESTS');
              setCatalogSubTab('ALL');
            }}
            style={{ background: 'none', border: 'none', color: '#006B70', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            Browse All 913+ Tests Matrix <ArrowRight size={15} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
          {multiLabPartners.map((lab, idx) => (
            <div
              key={idx}
              onClick={() => {
                setActiveTab('TESTS');
                setCatalogSubTab('ALL');
              }}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '18px',
                padding: '1.25rem',
                border: '1.5px solid #E2E8F0',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.75rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', backgroundColor: '#E0F2F1', color: '#006B70', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: '800' }}>
                    {lab.accreditation}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#D97706', fontWeight: '800' }}>
                    {lab.discount}
                  </span>
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0F172A', marginTop: '0.5rem' }}>{lab.name}</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>{lab.badge}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: '#006B70', fontWeight: '800' }}>
                <span>View Lab Tests</span>
                <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. HEALTH RISK SCREENING PANELS */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '22px', padding: '1.75rem', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#006B70', fontWeight: '800' }}>
              <HeartPulse size={16} /> TARGETED HEALTH CHECKS
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', margin: '0.2rem 0 0 0' }}>
              Specialty Organ & Lifestyle Panels
            </h3>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {[
            { title: 'Diabetic & Glycemic Panel', desc: 'Fasting Blood Sugar, HbA1c 3-Month Average, Microalbumin & C-Peptide.', price: 799, mrp: 1600, tag: 'FASTING REQUIRED' },
            { title: 'Executive Cardiac Risk Panel', desc: 'Lipid Profile (Cholesterol, LDL, HDL, Triglycerides), Apolipoproteins & hsCRP.', price: 999, mrp: 2200, tag: 'CARDIO RISK' },
            { title: 'Vitamin & Bone Health Panel', desc: '25-OH Vitamin D3, Vitamin B12 Active, Calcium & Phosphorus.', price: 899, mrp: 1900, tag: 'ENERGY & IMMUNITY' },
            { title: 'Liver & Renal Health (LFT+KFT)', desc: 'Bilirubin, SGOT, SGPT, Creatinine, Urea, Uric Acid & Electrolytes.', price: 699, mrp: 1500, tag: 'ORGAN FUNCTION' }
          ].map((panel, idx) => (
            <div
              key={idx}
              onClick={() => {
                setActiveTab('TESTS');
                setCatalogSubTab('PROFILES');
              }}
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '16px',
                padding: '1.25rem',
                border: '1px solid #E2E8F0',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.75rem'
              }}
            >
              <div>
                <span style={{ fontSize: '0.7rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '800' }}>
                  {panel.tag}
                </span>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0F172A', marginTop: '0.4rem' }}>{panel.title}</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem', lineHeight: 1.4 }}>{panel.desc}</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#006B70' }}>₹{panel.price}</span>
                  <span style={{ fontSize: '0.78rem', color: '#94A3B8', textDecoration: 'line-through', marginLeft: '0.4rem' }}>₹{panel.mrp}</span>
                </div>
                <span style={{ fontSize: '0.82rem', color: '#006B70', fontWeight: '800' }}>Book Panel →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
