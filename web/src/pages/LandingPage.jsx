import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  FlaskConical, 
  Building2, 
  Stethoscope, 
  Pill, 
  ShieldCheck, 
  FolderHeart, 
  MapPin, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  Award, 
  Percent, 
  Activity, 
  Thermometer, 
  X, 
  FileText, 
  Share2, 
  Heart, 
  Droplet, 
  Navigation, 
  CheckCircle,
  Shield,
  Zap,
  PhoneCall,
  UserCheck,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import Header from '../components/Header';
import initialCatalog from '../data/catalogData.json';
import { getCatalogState } from '../data/catalogStore';
import { API_BASE, safeFetch } from '../data/apiConfig';

export default function LandingPage({ onNavigateLogin }) {
  const [catalog, setCatalog] = useState(() => {
    const localState = getCatalogState();
    return (localState && localState.tests && localState.tests.length > 0) ? localState : initialCatalog;
  });

  const [catalogTab, setCatalogTab] = useState('ALL'); // 'ALL' | 'HIS' | 'HER' | 'ORGAN' | 'DIABETES'
  const [catalogViewType, setCatalogViewType] = useState('PACKAGES'); // 'PACKAGES' | 'PROFILES' | 'TESTS'
  const [catalogSectionSearch, setCatalogSectionSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Active Modals & Tabs
  const [activeItemModal, setActiveItemModal] = useState(null);
  const [partnerSuccess, setPartnerSuccess] = useState(false);
  const [activeVitalTab, setActiveVitalTab] = useState('SUGAR'); // 'SUGAR' | 'BP' | 'LIPID'

  // Ref for search outside click detection
  const searchContainerRef = useRef(null);

  // Partner Form Inputs
  const [partnerType, setPartnerType] = useState('DOCTOR');
  const [partnerName, setPartnerName] = useState('');
  const [partnerPhone, setPartnerPhone] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');

  // Hero Banners
  const heroBanners = [
    {
      id: 1,
      tag: '🔥 SUPER ADMIN FEATURED PROMOTION',
      title: 'MedMarg Master Full Body Screening',
      subtitle: 'Includes 87 Essential Biomarkers • Hemogram, Lipid Profile, LFT, KFT, Thyroid TSH & HbA1c',
      mrp: '₹3,500',
      price: '₹1,499',
      savings: 'SAVE 57% (₹2,001 OFF)',
      badge: 'Free Home Pickup Included',
      accentColor: '#38BDF8'
    },
    {
      id: 2,
      tag: '🛡️ SEASONAL FEVER & VIRAL SHIELD',
      title: 'Dengue & Complete Fever Panel',
      subtitle: 'Dengue NS1 Antigen, IgG/IgM, Malarial Antigen, Complete Blood Count (CBC) & Urine Culture',
      mrp: '₹1,200',
      price: '₹499',
      savings: 'SAVE 58% (₹701 OFF)',
      badge: '60-Min Express Pickup',
      accentColor: '#F59E0B'
    },
    {
      id: 3,
      tag: '🫀 CARDIAC & METABOLIC CHECK',
      title: 'Advanced Heart Risk & Diabetic Profile',
      subtitle: 'High Sensitivity CRP, ApoB, HbA1c, Fasting Sugar, Lipid Profile & Renal Check',
      mrp: '₹2,800',
      price: '₹1,199',
      savings: 'SAVE 57% (₹1,601 OFF)',
      badge: 'Fasting Slot Tomorrow 7 AM',
      accentColor: '#10B981'
    }
  ];

  // Auto Slider Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroBanners.length]);

  // Click Outside Listener for Search Dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch API Catalog safely
  useEffect(() => {
    async function loadApiCatalog() {
      try {
        const res = await safeFetch(`${API_BASE}/api/v1/catalog/tests?limit=1000`, {}, 3000);
        const data = await res.json();
        if (data.success && data.tests && data.tests.length > 0) {
          setCatalog(prev => ({
            ...prev,
            tests: data.tests,
            packages: prev.packages && prev.packages.length > 0 ? prev.packages : initialCatalog.packages,
            profiles: prev.profiles && prev.profiles.length > 0 ? prev.profiles : initialCatalog.profiles
          }));
        }
      } catch (err) {
        // Fallback to initialCatalog
      }
    }
    loadApiCatalog();
  }, []);

  // Filter Catalog Items for Search & Categories
  const allTests = catalog.tests || initialCatalog.tests || [];
  const allPackages = catalog.packages || initialCatalog.packages || [];
  const allProfiles = catalog.profiles || initialCatalog.profiles || [];

  const searchResults = searchQuery.trim() ? [
    ...allPackages.filter(p => (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) || (p.code && p.code.toLowerCase().includes(searchQuery.toLowerCase()))).map(p => ({ ...p, itemType: 'PACKAGE' })),
    ...allProfiles.filter(pr => (pr.name && pr.name.toLowerCase().includes(searchQuery.toLowerCase())) || (pr.code && pr.code.toLowerCase().includes(searchQuery.toLowerCase()))).map(pr => ({ ...pr, itemType: 'PROFILE' })),
    ...allTests.filter(t => (t.name && t.name.toLowerCase().includes(searchQuery.toLowerCase())) || (t.code && t.code.toLowerCase().includes(searchQuery.toLowerCase()))).map(t => ({ ...t, itemType: 'TEST' }))
  ].slice(0, 10) : [];

  const displayedPackages = allPackages.filter(pkg => {
    if (catalogTab === 'HIS') return pkg.category?.includes('Men') || pkg.name?.includes('His') || pkg.name?.includes('Men');
    if (catalogTab === 'HER') return pkg.category?.includes('Women') || pkg.name?.includes('Her') || pkg.name?.includes('Women');
    if (catalogTab === 'ORGAN') return pkg.category?.includes('Organ') || pkg.name?.includes('Liver') || pkg.name?.includes('Kidney');
    if (catalogTab === 'DIABETES') return pkg.category?.includes('Diabetes') || pkg.name?.includes('Sugar') || pkg.name?.includes('Glucose');
    return true;
  });

  const handlePartnerSubmit = async (e) => {
    e.preventDefault();
    setPartnerSuccess(true);
    try {
      await safeFetch(`${API_BASE}/api/v1/admin/partners/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: partnerName,
          type: partnerType,
          phone: partnerPhone,
          email: partnerEmail,
          city: 'Tirupati'
        })
      });
    } catch (err) {}
    setTimeout(() => setPartnerSuccess(false), 4000);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* 🔝 DEDICATED HEADER COMPONENT */}
      <Header onNavigateLogin={onNavigateLogin} />

      {/* 🖼️ SECTION 1: HERO SLIDER & VIBRANT SEARCH WITH PROPER Z-INDEX OVERLAY */}
      <section style={{ backgroundColor: '#0F172A', padding: '3.5rem 1.5rem 4.5rem', position: 'relative', zIndex: 100, overflow: 'visible' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: '3rem', alignItems: 'center' }}>
          
          {/* Left Column: Carousel & Vibrant Search */}
          <div style={{ position: 'relative', zIndex: 101 }}>
            {/* Active Banner Slide */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.85rem', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: heroBanners[currentSlide].accentColor, borderRadius: '20px', fontSize: '0.8rem', fontWeight: '800', marginBottom: '1rem', border: `1px solid ${heroBanners[currentSlide].accentColor}40` }}>
                <Sparkles size={14} /> {heroBanners[currentSlide].tag}
              </div>

              <h1 style={{ fontSize: '2.75rem', fontWeight: '900', color: '#FFFFFF', lineHeight: '1.15', letterSpacing: '-0.02em', marginBottom: '0.85rem' }}>
                {heroBanners[currentSlide].title}
              </h1>

              <p style={{ color: '#94A3B8', fontSize: '1.05rem', lineHeight: '1.5', marginBottom: '1.5rem', maxWidth: '580px' }}>
                {heroBanners[currentSlide].subtitle}
              </p>

              {/* Price & Savings Pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: '900', color: '#FFFFFF' }}>{heroBanners[currentSlide].price}</span>
                  <span style={{ fontSize: '1.1rem', color: '#64748B', textDecoration: 'line-through', fontWeight: '700' }}>{heroBanners[currentSlide].mrp}</span>
                </div>
                <div style={{ padding: '0.4rem 0.85rem', backgroundColor: '#10B981', color: '#FFF', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '800' }}>
                  {heroBanners[currentSlide].savings}
                </div>
              </div>
            </div>

            {/* Slider Navigation Dots */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
              {heroBanners.map((banner, index) => (
                <button
                  key={banner.id}
                  onClick={() => setCurrentSlide(index)}
                  style={{ width: index === currentSlide ? '32px' : '10px', height: '10px', borderRadius: '5px', border: 'none', backgroundColor: index === currentSlide ? '#005F60' : '#334155', cursor: 'pointer', transition: 'all 0.3s' }}
                />
              ))}
            </div>

            {/* 🌟 VIBRANT & UNIQUE LIVE AUTO-COMPLETE SEARCH BAR WITH PROPER OVERLAY Z-INDEX */}
            <div ref={searchContainerRef} style={{ position: 'relative', maxWidth: '620px', zIndex: 102 }}>
              <div style={{ 
                backgroundColor: '#FFFFFF', 
                padding: '0.65rem 0.85rem', 
                borderRadius: '20px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                boxShadow: '0 20px 45px rgba(0,95,96,0.4)', 
                border: '3.5px solid #005F60',
                position: 'relative',
                zIndex: 103
              }}>
                <Search size={24} color="#005F60" />
                <input
                  type="text"
                  placeholder="Type test name (e.g. HbA1c, Thyroid, Lipid, CBC, Liver)..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchFocused(true);
                  }}
                  onFocus={() => setIsSearchFocused(true)}
                  style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1rem', fontWeight: '700', color: '#0F172A', backgroundColor: 'transparent' }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}>
                    <X size={18} />
                  </button>
                )}
                <button onClick={onNavigateLogin} style={{ padding: '0.8rem 1.5rem', backgroundColor: '#005F60', color: '#FFF', border: 'none', borderRadius: '14px', fontSize: '0.92rem', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 14px rgba(0,95,96,0.3)', whiteSpace: 'nowrap' }}>
                  Search & Book <ArrowRight size={16} />
                </button>
              </div>

              {/* ⚡ INSTANT HIGH-CONTRAST AUTO-COMPLETE DROPDOWN RESULTS */}
              {isSearchFocused && searchQuery.trim() && (
                <div style={{ 
                  position: 'absolute', 
                  top: 'calc(100% + 10px)', 
                  left: 0, 
                  right: 0, 
                  backgroundColor: '#FFFFFF', 
                  borderRadius: '20px', 
                  border: '2.5px solid #005F60', 
                  boxShadow: '0 30px 80px rgba(0,0,0,0.6)', 
                  zIndex: 99999, 
                  overflow: 'hidden',
                  padding: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.6rem', borderBottom: '1px solid #E2E8F0', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#005F60', letterSpacing: '0.05em' }}>
                      FOUND {searchResults.length} MATCHING DIAGNOSTIC TESTS & PACKAGES
                    </span>
                    <button onClick={() => setIsSearchFocused(false)} style={{ background: '#F1F5F9', border: 'none', color: '#64748B', fontSize: '0.78rem', cursor: 'pointer', fontWeight: '800', padding: '0.25rem 0.65rem', borderRadius: '6px' }}>
                      Close ✕
                    </button>
                  </div>

                  {searchResults.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
                      {searchResults.map(item => (
                        <div 
                          key={item.id || item.code}
                          onClick={() => {
                            setActiveItemModal(item);
                            setIsSearchFocused(false);
                          }}
                          style={{ padding: '0.85rem 1rem', borderRadius: '14px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.15s' }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: '800', padding: '0.15rem 0.55rem', backgroundColor: item.itemType === 'PACKAGE' ? '#FEF3C7' : '#E0F2F1', color: item.itemType === 'PACKAGE' ? '#92400E' : '#005F60', borderRadius: '6px' }}>
                                {item.itemType || 'TEST'}
                              </span>
                              <span style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.95rem' }}>{item.name}</span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.25rem' }}>
                              {item.category || 'Pathology Test'} • {item.fasting === 'YES' || item.fastingRequiredHours > 0 ? '8-10h Fasting Required' : 'No Fasting Required'}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#005F60' }}>₹{item.price}</div>
                              {item.mrp && <div style={{ fontSize: '0.75rem', color: '#94A3B8', textDecoration: 'line-through' }}>MRP ₹{item.mrp}</div>}
                            </div>
                            <button onClick={onNavigateLogin} style={{ padding: '0.45rem 0.95rem', backgroundColor: '#005F60', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}>
                              Book →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748B', fontSize: '0.88rem' }}>
                      No matching tests found. Try searching "HbA1c", "Lipid", or "CBC".
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Category Chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700' }}>POPULAR:</span>
              {['His Wellness', 'Her Wellness', 'Family Screening', 'Senior Citizen', 'Diabetes Check', 'Cardiac Risk'].map(chip => (
                <button
                  key={chip}
                  onClick={() => { setSearchQuery(chip); window.location.hash = '#catalog'; }}
                  style={{ padding: '0.35rem 0.75rem', backgroundColor: '#1E293B', color: '#E2E8F0', border: '1px solid #334155', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}
                >
                  {chip}
                </button>
              ))}
            </div>

          </div>

          {/* Right Column: Live Delivery-Style Tracker Widget */}
          <div style={{ backgroundColor: '#1E293B', borderRadius: '24px', border: '1px solid #334155', padding: '1.75rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }}></span>
                <span style={{ color: '#E2E8F0', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.05em' }}>REAL-TIME LOGISTICS RADAR TRACKER</span>
              </div>
              <span style={{ color: '#F59E0B', fontSize: '0.8rem', fontWeight: '800' }}>ETA: 12 MINS</span>
            </div>

            {/* Phlebotomist HUD Card */}
            <div style={{ backgroundColor: '#0F172A', padding: '1.25rem', borderRadius: '16px', border: '1px solid #334155', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#005F60', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.1rem' }}>
                    RK
                  </div>
                  <div>
                    <div style={{ color: '#FFF', fontWeight: '800', fontSize: '0.95rem' }}>Ramesh Kumar (Phlebo AG-01)</div>
                    <div style={{ color: '#94A3B8', fontSize: '0.78rem' }}>4.9 ★ • Hero Electric Vehicle</div>
                  </div>
                </div>
                <div style={{ padding: '0.3rem 0.65rem', backgroundColor: '#0284C7', color: '#FFF', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800' }}>
                  28 km/h
                </div>
              </div>

              {/* OTP Security Box */}
              <div style={{ backgroundColor: '#1E293B', padding: '0.75rem 1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: '700' }}>Doorstep Handover OTP:</span>
                <span style={{ color: '#10B981', fontSize: '1.1rem', fontWeight: '900', letterSpacing: '0.2em' }}>OTP: 4892</span>
              </div>
            </div>

            {/* IoT Cold-Chain Telemetry Box */}
            <div style={{ backgroundColor: '#0F172A', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Thermometer size={22} color="#38BDF8" />
                <div>
                  <div style={{ color: '#38BDF8', fontSize: '0.85rem', fontWeight: '800' }}>IoT Cold-Chain Telemetry</div>
                  <div style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Sample Carry Bag Temp (Optimal 2°C - 8°C)</div>
                </div>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#10B981' }}>4.2°C Active</div>
            </div>
          </div>

        </div>
      </section>

      {/* 🧪 SECTION 2: MASTER DIAGNOSTIC CATALOG & ORGAN HEALTH CARDS */}
      <section id="catalog" style={{ padding: '4.5rem 1.5rem', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ color: '#005F60', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.08em' }}>DIAGNOSTIC NETWORK</span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '900', color: '#0F172A', marginTop: '0.35rem' }}>
              Master Diagnostic Tests & Curated Health Packages
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '0.5rem', maxWidth: '650px', margin: '0.5rem auto 0' }}>
              Browse 914+ tests with 100% Free Home Collection, digital NABL reports on WhatsApp, and smart package savings.
            </p>
          </div>

          {/* Smart Package Upgrade Banner */}
          <div style={{ backgroundColor: '#ECFDF5', border: '2px solid #A7F3D0', borderRadius: '20px', padding: '1.5rem 2rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '14px', backgroundColor: '#10B981', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Percent size={26} />
              </div>
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#065F46' }}>Smart Upgrade Suggestion: Save ₹2,001 (57% OFF)</div>
                <div style={{ fontSize: '0.88rem', color: '#047857', marginTop: '0.2rem' }}>
                  Booking single tests? Upgrade to the <strong>MedMarg Master Full Body Profile (87 Parameters)</strong> for just ₹1,499.
                </div>
              </div>
            </div>
            <button onClick={onNavigateLogin} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#047857', color: '#FFF', border: 'none', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '800', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Upgrade & Book Package →
            </button>
          </div>

          {/* Master View Switcher (Packages / Profiles / Single Tests) */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'PACKAGES', label: `📦 Health Packages (${allPackages.length})`, count: allPackages.length },
              { id: 'PROFILES', label: `🫀 Organ Profiles & Panels (${allProfiles.length})`, count: allProfiles.length },
              { id: 'TESTS', label: `🧪 Single Diagnostic Tests (${allTests.length}+)`, count: allTests.length }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => {
                  setCatalogViewType(type.id);
                  setCatalogSectionSearch('');
                }}
                style={{
                  padding: '0.75rem 1.6rem',
                  borderRadius: '14px',
                  border: catalogViewType === type.id ? '2px solid #005F60' : '1px solid #CBD5E1',
                  backgroundColor: catalogViewType === type.id ? '#005F60' : '#FFFFFF',
                  color: catalogViewType === type.id ? '#FFFFFF' : '#334155',
                  fontSize: '0.95rem',
                  fontWeight: '900',
                  cursor: 'pointer',
                  boxShadow: catalogViewType === type.id ? '0 4px 14px rgba(0,95,96,0.25)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Section Search Bar & Category Filter */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
            {catalogViewType === 'PACKAGES' ? (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'ALL', label: 'All Packages' },
                  { id: 'HIS', label: '👨 His Wellness' },
                  { id: 'HER', label: '👩 Her Wellness' },
                  { id: 'ORGAN', label: '🫀 Organ Health' },
                  { id: 'DIABETES', label: '🩸 Diabetes' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setCatalogTab(tab.id)}
                    style={{ padding: '0.5rem 1rem', borderRadius: '10px', border: 'none', fontSize: '0.84rem', fontWeight: '800', cursor: 'pointer', backgroundColor: catalogTab === tab.id ? '#E0F2F1' : '#F1F5F9', color: catalogTab === tab.id ? '#005F60' : '#475569' }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#005F60' }}>
                {catalogViewType === 'PROFILES' ? `Showing Curated Multi-Biomarker Organ Profiles` : `Showing 100% NABL Accredited Individual Tests`}
              </div>
            )}

            <div style={{ position: 'relative', width: '320px' }}>
              <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
              <input
                type="text"
                placeholder={catalogViewType === 'TESTS' ? `Search ${allTests.length}+ single tests...` : catalogViewType === 'PROFILES' ? `Search ${allProfiles.length} profiles...` : 'Search health packages...'}
                value={catalogSectionSearch}
                onChange={(e) => setCatalogSectionSearch(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.85rem 0.6rem 2.25rem', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '0.85rem', backgroundColor: '#FFFFFF', outline: 'none' }}
              />
            </div>
          </div>

          {/* 1. HEALTH PACKAGES GRID */}
          {catalogViewType === 'PACKAGES' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.75rem' }}>
              {displayedPackages
                .filter(p => !catalogSectionSearch || p.name.toLowerCase().includes(catalogSectionSearch.toLowerCase()))
                .slice(0, 9)
                .map(pkg => (
                  <div key={pkg.id} style={{ backgroundColor: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                        <span style={{ padding: '0.3rem 0.75rem', backgroundColor: '#E0F2F1', color: '#005F60', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '800' }}>
                          {pkg.category || 'Comprehensive Package'}
                        </span>
                        <span style={{ padding: '0.3rem 0.65rem', backgroundColor: '#FEF3C7', color: '#92400E', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800' }}>
                          {pkg.discountPercent || 50}% OFF
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', lineHeight: '1.3', marginBottom: '0.5rem' }}>
                        {pkg.name}
                      </h3>
                      <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: '1.4' }}>
                        {pkg.description || pkg.tagline}
                      </p>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <span style={{ padding: '0.25rem 0.6rem', backgroundColor: '#F1F5F9', color: '#475569', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Droplet size={13} color="#0284C7" /> Serum SST / EDTA
                        </span>
                        <span style={{ padding: '0.25rem 0.6rem', backgroundColor: '#F1F5F9', color: '#475569', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Clock size={13} color="#D97706" /> {pkg.fasting === 'YES' ? '8-10h Fasting' : 'No Fasting'}
                        </span>
                        <span style={{ padding: '0.25rem 0.6rem', backgroundColor: '#F1F5F9', color: '#475569', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Award size={13} color="#10B981" /> TAT: 24 Hours
                        </span>
                      </div>
                    </div>

                    <div style={{ paddingTop: '1rem', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Starts From</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                          <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#005F60' }}>₹{pkg.price}</span>
                          <span style={{ fontSize: '0.8rem', color: '#94A3B8', textDecoration: 'line-through' }}>₹{pkg.mrp}</span>
                        </div>
                      </div>
                      <button onClick={onNavigateLogin} style={{ padding: '0.65rem 1.25rem', backgroundColor: '#005F60', color: '#FFF', border: 'none', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer' }}>
                        Book Pickup →
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* 2. ORGAN PROFILES & PANELS GRID */}
          {catalogViewType === 'PROFILES' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {allProfiles
                .filter(p => !catalogSectionSearch || p.name.toLowerCase().includes(catalogSectionSearch.toLowerCase()) || p.code?.toLowerCase().includes(catalogSectionSearch.toLowerCase()))
                .slice(0, 12)
                .map(prof => (
                  <div key={prof.id} style={{ backgroundColor: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                        <span style={{ padding: '0.2rem 0.6rem', backgroundColor: '#E0F2FE', color: '#0369A1', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>
                          {prof.testsIncluded?.length || prof.testCount || 8} Biomarkers Panel
                        </span>
                        <span style={{ fontSize: '0.74rem', color: '#64748B', fontFamily: 'monospace', fontWeight: '700' }}>
                          {prof.code}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', marginBottom: '0.35rem' }}>
                        {prof.name}
                      </h3>
                      <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.3, marginBottom: '1rem' }}>
                        {prof.description || 'Comprehensive clinical panel for deep organ assessment.'}
                      </p>
                    </div>

                    <div style={{ paddingTop: '0.85rem', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Starts From</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                          <span style={{ fontSize: '1.3rem', fontWeight: '900', color: '#005F60' }}>₹{prof.price || 499}</span>
                          <span style={{ fontSize: '0.78rem', color: '#94A3B8', textDecoration: 'line-through' }}>₹{prof.mrp || 1200}</span>
                        </div>
                      </div>
                      <button onClick={onNavigateLogin} style={{ padding: '0.55rem 1.1rem', backgroundColor: '#005F60', color: '#FFF', border: 'none', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer' }}>
                        Book Profile →
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* 3. INDIVIDUAL TESTS GRID (914+ Tests) */}
          {catalogViewType === 'TESTS' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {allTests
                .filter(t => !catalogSectionSearch || t.name.toLowerCase().includes(catalogSectionSearch.toLowerCase()) || t.code?.toLowerCase().includes(catalogSectionSearch.toLowerCase()))
                .slice(0, 18)
                .map(tst => (
                  <div key={tst.id} style={{ backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.72rem', backgroundColor: '#F1F5F9', color: '#475569', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>
                          🧪 {tst.sampleType || 'Serum / EDTA'}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#005F60', fontWeight: '800' }}>
                          {tst.fasting === 'YES' ? 'Fasting Required' : 'No Fasting'}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0F172A', margin: '0.2rem 0 0.35rem 0' }}>
                        {tst.name}
                      </h4>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'monospace' }}>Code: {tst.code}</div>
                    </div>

                    <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Starts From</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                          <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A' }}>₹{tst.price || 199}</span>
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', textDecoration: 'line-through' }}>₹{tst.mrp || 450}</span>
                        </div>
                      </div>
                      <button onClick={onNavigateLogin} style={{ padding: '0.5rem 0.95rem', backgroundColor: '#005F60', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}>
                        + Add Test
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}

        </div>
      </section>

      {/* 🚀 FEATURE SHOWCASE A: LIVE PHLEBOTOMIST MAP TRACKER & IOT COLD-CHAIN TELEMETRY */}
      <section id="tracker-feature" style={{ padding: '5rem 1.5rem', backgroundColor: '#0F172A', color: '#FFFFFF' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            
            {/* Left Column: Deep Feature Explanation */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.85rem', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '800', marginBottom: '1rem', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                <Navigation size={16} /> CORE PLATFORM INNOVATION
              </div>

              <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#FFFFFF', lineHeight: '1.18', marginBottom: '1rem' }}>
                State-of-the-Art Precision GPS Map Tracking & 4°C Cold-Chain Telemetry
              </h2>

              <p style={{ color: '#94A3B8', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                Never wonder when your lab technician will arrive. MedMarg brings live GPS tracking, doorstep OTP verification, and smart temperature sensors to home sample collection.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#1E293B', color: '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #334155' }}>
                    <Navigation size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: '800', color: '#FFFFFF', fontSize: '1.05rem' }}>Real-Time Phlebotomist Live Map</h4>
                    <p style={{ color: '#94A3B8', fontSize: '0.88rem', marginTop: '0.25rem', lineHeight: '1.4' }}>
                      Watch your assigned phlebotomist move on the map with estimated arrival time (ETA), phone contact, and vehicle details.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#1E293B', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #334155' }}>
                    <UserCheck size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: '800', color: '#FFFFFF', fontSize: '1.05rem' }}>4-Digit Handover Security OTP</h4>
                    <p style={{ color: '#94A3B8', fontSize: '0.88rem', marginTop: '0.25rem', lineHeight: '1.4' }}>
                      Verify the identity of your lab technician at your doorstep using a secure 4-digit code to prevent unauthorized impersonation.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#1E293B', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #334155' }}>
                    <Thermometer size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: '800', color: '#FFFFFF', fontSize: '1.05rem' }}>IoT Cold-Chain Telemetry (2°C - 8°C)</h4>
                    <p style={{ color: '#94A3B8', fontSize: '0.88rem', marginTop: '0.25rem', lineHeight: '1.4' }}>
                      Blood samples are stored inside temperature-monitored carry bags linked to our IoT cloud—ensuring zero sample hemolysis or degradation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Tracking Visual Flow HUD */}
            <div style={{ backgroundColor: '#1E293B', borderRadius: '24px', border: '1px solid #334155', padding: '2rem', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>
              
              {/* Interactive Pipeline Steps */}
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#38BDF8', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
                SAMPLE FULFILLMENT TIMELINE
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.75rem' }}>
                <div style={{ backgroundColor: '#0F172A', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid #10B981', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CheckCircle size={20} color="#10B981" />
                    <div>
                      <div style={{ fontWeight: '800', color: '#FFF', fontSize: '0.9rem' }}>1. Slot Confirmed & Technician Assigned</div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Phlebo: Ramesh Kumar (ID: AG-01)</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#10B981' }}>COMPLETED</span>
                </div>

                <div style={{ backgroundColor: '#0F172A', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid #38BDF8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Navigation size={20} color="#38BDF8" />
                    <div>
                      <div style={{ fontWeight: '800', color: '#FFF', fontSize: '0.9rem' }}>2. Live En-Route to Patient Home</div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Distance: 1.8 km • ETA 12 mins</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#38BDF8' }}>IN PROGRESS</span>
                </div>

                <div style={{ backgroundColor: '#0F172A', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.7 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Shield size={20} color="#F59E0B" />
                    <div>
                      <div style={{ fontWeight: '800', color: '#FFF', fontSize: '0.9rem' }}>3. OTP Handover & Cold Box Storage</div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Doorstep Security OTP: 4892</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B' }}>NEXT</span>
                </div>

                <div style={{ backgroundColor: '#0F172A', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Award size={20} color="#A855F7" />
                    <div>
                      <div style={{ fontWeight: '800', color: '#FFF', fontSize: '0.9rem' }}>4. NABL Lab Processing & WhatsApp Sync</div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Digital PDF Report Auto-Sent</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B' }}>PENDING</span>
                </div>
              </div>

              {/* Bottom Sensor Telemetry Meter */}
              <div style={{ backgroundColor: '#0F172A', padding: '1rem', borderRadius: '14px', border: '1px solid #38BDF8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Thermometer size={20} color="#38BDF8" />
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#E2E8F0' }}>Live Container Temp Sensor</span>
                </div>
                <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#10B981' }}>4.2°C (Optimal)</span>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 📊 FEATURE SHOWCASE B: INTERACTIVE HEALTH VITALS RADAR & TREND CURVES */}
      <section id="vitals-feature" style={{ padding: '5rem 1.5rem', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            
            {/* Left Column: Feature Explanation */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.85rem', backgroundColor: '#E0F2F1', color: '#005F60', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '800', marginBottom: '1rem' }}>
                <Activity size={16} /> PATIENT HEALTH MONITORING
              </div>

              <h2 style={{ fontSize: '2.4rem', fontWeight: '900', color: '#0F172A', lineHeight: '1.2', marginBottom: '1rem' }}>
                Interactive Health Vitals & Biomarker Trend Radar
              </h2>

              <p style={{ color: '#475569', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
                MedMarg goes beyond delivering raw test numbers. Our intelligent health engine automatically plots your blood metrics, blood pressure, fasting glucose, and lipid trends into graphical curve graphs—helping you detect risk early.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ECFDF5', color: '#065F46', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '900' }}>✓</div>
                  <div>
                    <h4 style={{ fontWeight: '800', color: '#0F172A', fontSize: '1rem' }}>Longitudinal 7-Day & 30-Day Trend Curve Graphs</h4>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '0.2rem' }}>Canvas-drawn spline curves visualizing Systolic/Diastolic BP and Fasting Sugar levels over time.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ECFDF5', color: '#065F46', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '900' }}>✓</div>
                  <div>
                    <h4 style={{ fontWeight: '800', color: '#0F172A', fontSize: '1rem' }}>Normal Reference Range Meters</h4>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '0.2rem' }}>Instant green/amber/red indicators comparing your results against NABL clinical benchmarks.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ECFDF5', color: '#065F46', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '900' }}>✓</div>
                  <div>
                    <h4 style={{ fontWeight: '800', color: '#0F172A', fontSize: '1rem' }}>Linked Family Health Sync</h4>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '0.2rem' }}>Monitor vitals for elderly parents or family members from a single unified master dashboard.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Vitals Dashboard Card Mockup */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 20px 45px -10px rgba(0,95,96,0.12)' }}>
              
              {/* Header inside Mockup */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #F1F5F9' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#005F60' }}>PATIENT VITALS RADAR</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>Rahul Sharma • 32 Yrs (Male)</div>
                </div>
                <span style={{ padding: '0.3rem 0.75rem', backgroundColor: '#D1FAE5', color: '#065F46', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '800' }}>
                  Optimal Vitals
                </span>
              </div>

              {/* Interactive Tabs */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <button 
                  onClick={() => setActiveVitalTab('SUGAR')}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: 'none', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', backgroundColor: activeVitalTab === 'SUGAR' ? '#005F60' : '#F1F5F9', color: activeVitalTab === 'SUGAR' ? '#FFF' : '#475569' }}
                >
                  Blood Glucose
                </button>
                <button 
                  onClick={() => setActiveVitalTab('BP')}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: 'none', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', backgroundColor: activeVitalTab === 'BP' ? '#005F60' : '#F1F5F9', color: activeVitalTab === 'BP' ? '#FFF' : '#475569' }}
                >
                  Blood Pressure
                </button>
                <button 
                  onClick={() => setActiveVitalTab('LIPID')}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: 'none', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', backgroundColor: activeVitalTab === 'LIPID' ? '#005F60' : '#F1F5F9', color: activeVitalTab === 'LIPID' ? '#FFF' : '#475569' }}
                >
                  Lipid Profile
                </button>
              </div>

              {/* Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>
                    {activeVitalTab === 'SUGAR' ? 'FASTING GLUCOSE' : activeVitalTab === 'BP' ? 'BLOOD PRESSURE' : 'TOTAL CHOLESTEROL'}
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>
                    {activeVitalTab === 'SUGAR' ? '94 mg/dL' : activeVitalTab === 'BP' ? '118/78 mmHg' : '172 mg/dL'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: '800', marginTop: '0.3rem' }}>
                    ✓ Normal Range
                  </div>
                </div>

                <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>
                    {activeVitalTab === 'SUGAR' ? 'HbA1c (3-MONTH AVG)' : activeVitalTab === 'BP' ? 'PULSE RATE' : 'TRIGLYCERIDES'}
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>
                    {activeVitalTab === 'SUGAR' ? '5.4%' : activeVitalTab === 'BP' ? '72 bpm' : '128 mg/dL'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: '800', marginTop: '0.3rem' }}>
                    ✓ Non-Diabetic Tier
                  </div>
                </div>
              </div>

              {/* Dynamic Curve Graph Graphic Box */}
              <div style={{ backgroundColor: '#0F172A', borderRadius: '16px', padding: '1.25rem', color: '#FFF' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#38BDF8' }}>
                    {activeVitalTab === 'SUGAR' ? '7-DAY FASTING GLUCOSE TREND CURVE' : activeVitalTab === 'BP' ? 'BLOOD PRESSURE VARIATION' : 'LIPID BIOMARKER SPECTRUM'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Verified NABL Lab Data</span>
                </div>

                {/* SVG Spline Graph */}
                <svg viewBox="0 0 300 70" style={{ width: '100%', height: '65px' }}>
                  <path d="M0 50 Q 60 15, 120 40 T 240 25 T 300 45" fill="none" stroke="#10B981" strokeWidth="3" />
                  <circle cx="120" cy="40" r="4" fill="#38BDF8" />
                  <circle cx="240" cy="25" r="4" fill="#38BDF8" />
                </svg>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 📂 FEATURE SHOWCASE C: NABL HEALTH LOCKER & REPORT SYNC */}
      <section id="locker-feature" style={{ padding: '5rem 1.5rem', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            
            {/* Left Column: Locker Preview Box */}
            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FolderHeart size={26} color="#005F60" />
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>NABL Digital Health Locker</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>ABDM Health ID Verified • Encrypted Cloud</div>
                  </div>
                </div>
                <span style={{ padding: '0.3rem 0.65rem', backgroundColor: '#E0F2F1', color: '#005F60', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800' }}>
                  256-Bit SSL
                </span>
              </div>

              {/* Sample PDF Report Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ backgroundColor: '#FFF', padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FileText size={22} color="#005F60" />
                    <div>
                      <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.9rem' }}>NABL_CBC_Report_Rahul.pdf</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Complete Blood Count • 2 Oct 2026</div>
                    </div>
                  </div>
                  <span style={{ padding: '0.35rem 0.75rem', backgroundColor: '#10B981', color: '#FFF', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800' }}>
                    Download PDF
                  </span>
                </div>

                <div style={{ backgroundColor: '#FFF', padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FileText size={22} color="#005F60" />
                    <div>
                      <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.9rem' }}>Full_Body_Wellness_Report.pdf</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>87 Parameters • 18 Sep 2026</div>
                    </div>
                  </div>
                  <span style={{ padding: '0.35rem 0.75rem', backgroundColor: '#10B981', color: '#FFF', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800' }}>
                    Download PDF
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Feature Explanation */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.85rem', backgroundColor: '#E0F2F1', color: '#005F60', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '800', marginBottom: '1rem' }}>
                <FolderHeart size={16} /> LIFETIME DIGITAL STORAGE
              </div>

              <h2 style={{ fontSize: '2.4rem', fontWeight: '900', color: '#0F172A', lineHeight: '1.2', marginBottom: '1rem' }}>
                NABL Certified Reports & Automated WhatsApp Sync
              </h2>

              <p style={{ color: '#475569', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
                Never lose a paper lab report again. Every diagnostic test completed with MedMarg is digitally signed by NABL certified pathologists and stored permanently in your secure account.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ECFDF5', color: '#065F46', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '900' }}>✓</div>
                  <div>
                    <h4 style={{ fontWeight: '800', color: '#0F172A', fontSize: '1rem' }}>Automated WhatsApp & Google Drive Delivery</h4>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '0.2rem' }}>Reports automatically land in your WhatsApp inbox and Google Drive as soon as verified by lab pathologists.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ECFDF5', color: '#065F46', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '900' }}>✓</div>
                  <div>
                    <h4 style={{ fontWeight: '800', color: '#0F172A', fontSize: '1rem' }}>1-Click Encrypted Doctor Sharing</h4>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '0.2rem' }}>Generate password-protected secure share links to send test result bundles directly to consulting doctors.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 🔮 SECTION 5: UPCOMING ECOSYSTEM EXTENSIONS */}
      <section id="upcoming" style={{ padding: '4.5rem 1.5rem', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ color: '#005F60', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.08em' }}>PHASE 3 EXPANSION</span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '900', color: '#0F172A', marginTop: '0.35rem' }}>
              Upcoming Healthcare Portals
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '0.5rem' }}>
              MedMarg is expanding to bring doctors, scan centers, pharmacy, and wellness coaches into a unified ecosystem.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            
            <div style={{ padding: '1.75rem', backgroundColor: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <Stethoscope size={36} color="#005F60" style={{ margin: '0 auto 1rem' }} />
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#005F60', marginBottom: '0.25rem' }}>COMING SOON</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>In-Clinic & Video Doctors</h4>
              <p style={{ color: '#64748B', fontSize: '0.82rem', marginTop: '0.4rem' }}>Book OPD consultations and e-prescriptions with verified medical specialists.</p>
            </div>

            <div style={{ padding: '1.75rem', backgroundColor: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <Building2 size={36} color="#005F60" style={{ margin: '0 auto 1rem' }} />
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#005F60', marginBottom: '0.25rem' }}>COMING SOON</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>3.0T MRI & CT Scan Centers</h4>
              <p style={{ color: '#64748B', fontSize: '0.82rem', marginTop: '0.4rem' }}>Reserve radiology slots and view DICOM scan reports directly in app.</p>
            </div>

            <div style={{ padding: '1.75rem', backgroundColor: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <Pill size={36} color="#005F60" style={{ margin: '0 auto 1rem' }} />
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#005F60', marginBottom: '0.25rem' }}>COMING SOON</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>Generic & Branded E-Pharmacy</h4>
              <p style={{ color: '#64748B', fontSize: '0.82rem', marginTop: '0.4rem' }}>Upload prescriptions for genuine medicines delivered straight to home.</p>
            </div>

            <div style={{ padding: '1.75rem', backgroundColor: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <Heart size={36} color="#005F60" style={{ margin: '0 auto 1rem' }} />
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#005F60', marginBottom: '0.25rem' }}>COMING SOON</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>Health & Diet Coaching</h4>
              <p style={{ color: '#64748B', fontSize: '0.82rem', marginTop: '0.4rem' }}>Personalized lifestyle, diet, and nutrition plans based on biomarker reports.</p>
            </div>

          </div>

        </div>
      </section>

      {/* 🛡️ SECTION 6: TRUST FACTORS & ACCREDITATION */}
      <section id="trust" style={{ padding: '4.5rem 1.5rem', backgroundColor: '#0F172A', color: '#FFF' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', textAlign: 'center' }}>
          
          <span style={{ color: '#38BDF8', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.08em' }}>QUALITY ASSURANCE</span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '900', color: '#FFFFFF', marginTop: '0.35rem' }}>
            Why Patients & Doctors Trust MedMarg
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginTop: '3.5rem', textAlign: 'left' }}>
            
            <div style={{ backgroundColor: '#1E293B', padding: '2rem', borderRadius: '20px', border: '1px solid #334155' }}>
              <Award size={32} color="#10B981" style={{ marginBottom: '1rem' }} />
              <h4 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#FFF', marginBottom: '0.4rem' }}>100% NABL & ISO Certified</h4>
              <p style={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: '1.5' }}>
                All samples are processed in NABL accredited central diagnostic laboratories adhering to strict international precision standards.
              </p>
            </div>

            <div style={{ backgroundColor: '#1E293B', padding: '2rem', borderRadius: '20px', border: '1px solid #334155' }}>
              <Thermometer size={32} color="#38BDF8" style={{ marginBottom: '1rem' }} />
              <h4 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#FFF', marginBottom: '0.4rem' }}>IoT Cold-Chain Security</h4>
              <p style={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: '1.5' }}>
                Continuous temperature telemetry maintains sample carry bags within the optimal 2°C–8°C range from sample pickup to lab delivery.
              </p>
            </div>

            <div style={{ backgroundColor: '#1E293B', padding: '2rem', borderRadius: '20px', border: '1px solid #334155' }}>
              <ShieldCheck size={32} color="#F59E0B" style={{ marginBottom: '1rem' }} />
              <h4 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#FFF', marginBottom: '0.4rem' }}>4-Digit Handover OTP</h4>
              <p style={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: '1.5' }}>
                Verify identity at your doorstep using an encrypted 4-digit security code before handing over samples to our certified phlebotomist.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 🦶 SECTION 7: FOOTER & PARTNER PRE-REGISTRATION PORTAL */}
      <footer style={{ backgroundColor: '#0F172A', color: '#94A3B8', paddingTop: '4.5rem', paddingBottom: '2.5rem', borderTop: '1px solid #1E293B' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          {/* Partner Pre-Registration Callout Box inside Footer */}
          <div style={{ backgroundColor: '#1E293B', borderRadius: '24px', border: '1px solid #334155', padding: '2.5rem', marginBottom: '4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '800', marginBottom: '0.75rem' }}>
                🩺 HEALTHCARE PARTNER NETWORK
              </div>
              <h3 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#FFF', lineHeight: '1.2', marginBottom: '0.5rem' }}>
                Pre-Register Your Clinic, Diagnostic Lab, or Scan Center
              </h3>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Doctors, Partner Labs, Scan/MRI Centers, and Health Coaches can pre-register their establishment to receive early onboarding priority and live launch notifications.
              </p>
            </div>

            <div>
              {partnerSuccess ? (
                <div style={{ padding: '1.25rem', backgroundColor: '#065F46', color: '#A7F3D0', borderRadius: '16px', fontWeight: '800', textAlign: 'center' }}>
                  ✓ Facility Pre-Registered Successfully! Added to Launch Notification Queue.
                </div>
              ) : (
                <form onSubmit={handlePartnerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <select value={partnerType} onChange={e => setPartnerType(e.target.value)} style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid #475569', backgroundColor: '#0F172A', color: '#FFF', fontSize: '0.85rem', fontWeight: '700' }}>
                      <option value="DOCTOR">Doctor / OPD Practice</option>
                      <option value="DIAGNOSTIC_LAB">Partner Diagnostic Lab</option>
                      <option value="SCAN_CENTER">Radiology / MRI Center</option>
                      <option value="HEALTH_COACH">Health & Diet Coach</option>
                      <option value="HOSPITAL">Hospital / Clinic</option>
                    </select>

                    <input type="text" placeholder="Establishment / Doctor Name" value={partnerName} onChange={e => setPartnerName(e.target.value)} required style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid #475569', backgroundColor: '#0F172A', color: '#FFF', fontSize: '0.85rem' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <input type="tel" placeholder="Mobile Number" value={partnerPhone} onChange={e => setPartnerPhone(e.target.value)} required style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid #475569', backgroundColor: '#0F172A', color: '#FFF', fontSize: '0.85rem' }} />
                    <input type="email" placeholder="Email Address" value={partnerEmail} onChange={e => setPartnerEmail(e.target.value)} required style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid #475569', backgroundColor: '#0F172A', color: '#FFF', fontSize: '0.85rem' }} />
                  </div>

                  <button type="submit" style={{ padding: '0.85rem', backgroundColor: '#005F60', color: '#FFF', border: 'none', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '800', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                    Pre-Register Establishment <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Multi-Column Footer Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '3rem', marginBottom: '3.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <img src="/logo.png" alt="MedMarg" style={{ height: '36px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
              <p style={{ color: '#94A3B8', fontSize: '0.88rem', lineHeight: '1.6', maxWidth: '340px' }}>
                Single-provider trusted healthcare diagnostic network and phlebotomy logistics platform. Operating 100% NABL certified lab quality.
              </p>
            </div>

            <div>
              <h5 style={{ color: '#FFF', fontSize: '0.9rem', fontWeight: '800', marginBottom: '1rem' }}>Catalog & Services</h5>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                <li><a href="#catalog" style={{ color: 'inherit', textDecoration: 'none' }}>914+ Pathology Tests</a></li>
                <li><a href="#catalog" style={{ color: 'inherit', textDecoration: 'none' }}>His & Her Wellness Profiles</a></li>
                <li><a href="#catalog" style={{ color: 'inherit', textDecoration: 'none' }}>Full Body Health Packages</a></li>
                <li><a href="#catalog" style={{ color: 'inherit', textDecoration: 'none' }}>Free Home Sample Collection</a></li>
              </ul>
            </div>

            <div>
              <h5 style={{ color: '#FFF', fontSize: '0.9rem', fontWeight: '800', marginBottom: '1rem' }}>Platform Features</h5>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                <li><a href="#tracker-feature" style={{ color: 'inherit', textDecoration: 'none' }}>Live GPS Phlebotomist Map</a></li>
                <li><a href="#tracker-feature" style={{ color: 'inherit', textDecoration: 'none' }}>IoT Cold-Chain Telemetry</a></li>
                <li><a href="#vitals-feature" style={{ color: 'inherit', textDecoration: 'none' }}>Health Vitals Curve Charts</a></li>
                <li><a href="#locker-feature" style={{ color: 'inherit', textDecoration: 'none' }}>NABL Digital Locker</a></li>
              </ul>
            </div>

            <div>
              <h5 style={{ color: '#FFF', fontSize: '0.9rem', fontWeight: '800', marginBottom: '1rem' }}>Portal Access</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                <button onClick={onNavigateLogin} style={{ background: 'none', border: 'none', color: '#38BDF8', textAlign: 'left', padding: 0, cursor: 'pointer', fontWeight: '700' }}>
                  Admin / Staff / Fleet Sign In →
                </button>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #1E293B', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#64748B' }}>
            <div>© 2026 MedMarg Healthcare Ecosystem (https://medmarg.sriddha.com). All rights reserved.</div>
            <div>Built for Web, Android & iOS Multi-Platform Fulfillment</div>
          </div>

        </div>
      </footer>

      {/* 📑 ITEM SPECIFICATION DETAILS MODAL */}
      {activeItemModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', zIndex: 20000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', maxWidth: '580px', width: '100%', padding: '2rem', border: '1px solid #E2E8F0', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', position: 'relative' }}>
            <button onClick={() => setActiveItemModal(null)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
              <X size={22} />
            </button>

            <div style={{ display: 'inline-block', padding: '0.25rem 0.65rem', backgroundColor: '#E0F2F1', color: '#005F60', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '800', marginBottom: '0.85rem' }}>
              {activeItemModal.itemType || 'DIAGNOSTIC TEST'}
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0F172A', marginBottom: '0.5rem' }}>
              {activeItemModal.name}
            </h2>

            <p style={{ color: '#64748B', fontSize: '0.92rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              {activeItemModal.description || `Comprehensive diagnostic test panel for ${activeItemModal.name}. Includes free home sample collection and digital NABL report sync.`}
            </p>

            <div style={{ backgroundColor: '#F8FAFC', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B' }}>CONTAINER TYPE</span>
                <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0F172A', marginTop: '0.2rem' }}>{activeItemModal.sampleType || 'Serum SST Tube'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B' }}>FASTING REQUIREMENT</span>
                <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0F172A', marginTop: '0.2rem' }}>{activeItemModal.fasting === 'YES' || activeItemModal.fastingRequiredHours > 0 ? '8-10 Hours Fasting' : 'No Fasting Required'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B' }}>TURNAROUND TIME</span>
                <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0F172A', marginTop: '0.2rem' }}>{activeItemModal.tatHours || 24} Hours</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B' }}>REPORT DELIVERY</span>
                <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#10B981', marginTop: '0.2rem' }}>WhatsApp & Drive PDF</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#005F60' }}>₹{activeItemModal.price}</div>
                {activeItemModal.mrp && <div style={{ fontSize: '0.82rem', color: '#94A3B8', textDecoration: 'line-through' }}>MRP ₹{activeItemModal.mrp}</div>}
              </div>
              <button onClick={() => { setActiveItemModal(null); onNavigateLogin(); }} style={{ padding: '0.85rem 1.75rem', backgroundColor: '#005F60', color: '#FFF', border: 'none', borderRadius: '12px', fontSize: '0.95rem', fontWeight: '800', cursor: 'pointer' }}>
                Proceed to Book Pickup →
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
