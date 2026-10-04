import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  FlaskConical, 
  Building2, 
  Stethoscope, 
  Pill, 
  ShieldCheck, 
  Shield,
  FolderHeart, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  Star, 
  Clock, 
  Home as HomeIcon, 
  Sparkles, 
  Award, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileCheck,
  Percent,
  Compass,
  Filter,
  Check,
  Layers,
  Package,
  Activity,
  AlertCircle,
  Thermometer,
  QrCode,
  Users,
  Smartphone,
  ChevronLeft,
  X,
  FileText,
  Share2,
  Heart,
  Droplet,
  CheckSquare,
  Lock,
  Zap,
  Navigation
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

  const [catalogTab, setCatalogTab] = useState('ALL'); // 'ALL' | 'HIS' | 'HER' | 'FULL_BODY' | 'DIABETES' | 'ORGAN'
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Active Modals
  const [activeItemModal, setActiveItemModal] = useState(null);
  const [partnerSuccess, setPartnerSuccess] = useState(false);

  // Partner Form Inputs
  const [partnerType, setPartnerType] = useState('DOCTOR');
  const [partnerName, setPartnerName] = useState('');
  const [partnerPhone, setPartnerPhone] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');

  // Hero Promotional Banners (Super Admin Configured)
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
      bgGradient: 'linear-gradient(135deg, #005F60 0%, #0F172A 100%)',
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
      bgGradient: 'linear-gradient(135deg, #0F766E 0%, #134E4A 100%)',
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
      bgGradient: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
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

  // Robust Catalog Fetching with Protocol Matching & Safe Fallback
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
        // Safe fallback to catalogData.json
      }
    }
    loadApiCatalog();
  }, []);

  // Filter Catalog Items for Live Search & Category Tabs
  const allTests = catalog.tests || initialCatalog.tests || [];
  const allPackages = catalog.packages || initialCatalog.packages || [];
  const allProfiles = catalog.profiles || initialCatalog.profiles || [];

  // Instant Live Auto-Complete Search Results (Tests, Profiles & Packages)
  const searchResults = searchQuery.trim() ? [
    ...allPackages.filter(p => (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) || (p.code && p.code.toLowerCase().includes(searchQuery.toLowerCase()))).map(p => ({ ...p, itemType: 'PACKAGE' })),
    ...allProfiles.filter(pr => (pr.name && pr.name.toLowerCase().includes(searchQuery.toLowerCase())) || (pr.code && pr.code.toLowerCase().includes(searchQuery.toLowerCase()))).map(pr => ({ ...pr, itemType: 'PROFILE' })),
    ...allTests.filter(t => (t.name && t.name.toLowerCase().includes(searchQuery.toLowerCase())) || (t.code && t.code.toLowerCase().includes(searchQuery.toLowerCase()))).map(t => ({ ...t, itemType: 'TEST' }))
  ].slice(0, 8) : [];

  // Filtered Cards Grid based on selected category tab
  const displayedPackages = allPackages.filter(pkg => {
    if (catalogTab === 'HIS') return pkg.category?.includes('Men') || pkg.name?.includes('His') || pkg.name?.includes('Men');
    if (catalogTab === 'HER') return pkg.category?.includes('Women') || pkg.name?.includes('Her') || pkg.name?.includes('Women');
    if (catalogTab === 'ORGAN') return pkg.category?.includes('Organ') || pkg.name?.includes('Liver') || pkg.name?.includes('Kidney');
    if (catalogTab === 'DIABETES') return pkg.category?.includes('Diabetes') || pkg.name?.includes('Sugar') || pkg.name?.includes('Glucose');
    return true;
  });

  const handlePartnerSubmit = (e) => {
    e.preventDefault();
    setPartnerSuccess(true);
    setTimeout(() => setPartnerSuccess(false), 4000);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* 🔝 DEDICATED HEADER COMPONENT (Single Logo, No Duplicate Text, City Dropdown, Sleek Nav) */}
      <Header onNavigateLogin={onNavigateLogin} />

      {/* 🖼️ SECTION 1: HERO SLIDER & VIBRANT SEARCH WITH INSTANT AUTO-COMPLETE */}
      <section style={{ backgroundColor: '#0F172A', padding: '3.5rem 1.5rem 4.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: '3rem', alignItems: 'center' }}>
          
          {/* Left Column: Carousel & Vibrant Search */}
          <div style={{ zIndex: 10 }}>
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
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.25rem' }}>
              {heroBanners.map((banner, index) => (
                <button
                  key={banner.id}
                  onClick={() => setCurrentSlide(index)}
                  style={{ width: index === currentSlide ? '32px' : '10px', height: '10px', borderRadius: '5px', border: 'none', backgroundColor: index === currentSlide ? '#005F60' : '#334155', cursor: 'pointer', transition: 'all 0.3s' }}
                />
              ))}
            </div>

            {/* 🌟 VIBRANT & UNIQUE LIVE AUTO-COMPLETE SEARCH BAR */}
            <div style={{ position: 'relative', maxWidth: '620px' }}>
              <div style={{ 
                backgroundColor: '#FFFFFF', 
                padding: '0.65rem 0.85rem', 
                borderRadius: '20px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                boxShadow: '0 20px 45px rgba(0,95,96,0.35)', 
                border: '3.5px solid #005F60',
                transition: 'all 0.2s ease-in-out'
              }}>
                <Search size={24} color="#005F60" />
                <input
                  type="text"
                  placeholder="Type to search 914+ tests (e.g. HbA1c, Thyroid, Lipid, CBC, Liver)..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchFocused(true);
                  }}
                  onFocus={() => setIsSearchFocused(true)}
                  style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1rem', fontWeight: '700', color: '#0F172A', backgroundColor: 'transparent' }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                    <X size={18} />
                  </button>
                )}
                <button onClick={onNavigateLogin} style={{ padding: '0.8rem 1.5rem', backgroundColor: '#005F60', color: '#FFF', border: 'none', borderRadius: '14px', fontSize: '0.92rem', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 14px rgba(0,95,96,0.3)' }}>
                  Search & Book <ArrowRight size={16} />
                </button>
              </div>

              {/* ⚡ INSTANT VIBRANT AUTO-COMPLETE DROPDOWN RESULTS */}
              {isSearchFocused && searchQuery.trim() && (
                <div style={{ 
                  position: 'absolute', 
                  top: '115%', 
                  left: 0, 
                  right: 0, 
                  backgroundColor: '#FFFFFF', 
                  borderRadius: '20px', 
                  border: '2px solid #005F60', 
                  boxShadow: '0 25px 60px rgba(0,0,0,0.4)', 
                  zIndex: 1000, 
                  overflow: 'hidden',
                  padding: '0.75rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', borderBottom: '1px solid #E2E8F0', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#005F60', letterSpacing: '0.05em' }}>
                      FOUND {searchResults.length} MATCHING DIAGNOSTIC TESTS & PACKAGES
                    </span>
                    <button onClick={() => setIsSearchFocused(false)} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '700' }}>Close ✕</button>
                  </div>

                  {searchResults.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '360px', overflowY: 'auto' }}>
                      {searchResults.map(item => (
                        <div 
                          key={item.id || item.code}
                          onClick={() => {
                            setActiveItemModal(item);
                            setIsSearchFocused(false);
                          }}
                          style={{ padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #F1F5F9', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.15s' }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: '800', padding: '0.15rem 0.45rem', backgroundColor: item.itemType === 'PACKAGE' ? '#FEF3C7' : '#E0F2F1', color: item.itemType === 'PACKAGE' ? '#92400E' : '#005F60', borderRadius: '6px' }}>
                                {item.itemType || 'TEST'}
                              </span>
                              <span style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.92rem' }}>{item.name}</span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>
                              {item.category || 'Pathology Test'} • {item.fasting === 'YES' || item.fastingRequiredHours > 0 ? '8-10h Fasting Required' : 'No Fasting Required'}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '1rem', fontWeight: '900', color: '#005F60' }}>₹{item.price}</div>
                              {item.mrp && <div style={{ fontSize: '0.75rem', color: '#94A3B8', textDecoration: 'line-through' }}>MRP ₹{item.mrp}</div>}
                            </div>
                            <button onClick={onNavigateLogin} style={{ padding: '0.4rem 0.85rem', backgroundColor: '#005F60', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}>
                              Book →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748B', fontSize: '0.88rem' }}>
                      No matching tests found. Showing master catalog below.
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

          {/* Right Column: Interactive Phlebotomist GPS & Cold-Chain Simulation Widget */}
          <div style={{ backgroundColor: '#1E293B', borderRadius: '24px', border: '1px solid #334155', padding: '1.75rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }}></span>
                <span style={{ color: '#E2E8F0', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.05em' }}>LIVE DELIVERY-STYLE TRACKER</span>
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
                    <div style={{ color: '#FFF', fontWeight: '800', fontSize: '0.95rem' }}>Ramesh Kumar (Agent AG-01)</div>
                    <div style={{ color: '#94A3B8', fontSize: '0.78rem' }}>4.9 ★ • Hero Electric Vehicle</div>
                  </div>
                </div>
                <div style={{ padding: '0.3rem 0.65rem', backgroundColor: '#0284C7', color: '#FFF', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800' }}>
                  28 km/h
                </div>
              </div>

              {/* OTP Security Box */}
              <div style={{ backgroundColor: '#1E293B', padding: '0.75rem 1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: '700' }}>Handover Security OTP:</span>
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
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ color: '#005F60', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.08em' }}>DIAGNOSTIC NETWORK</span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '900', color: '#0F172A', marginTop: '0.35rem' }}>
              Master Diagnostic Tests & Curated Packages
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '0.5rem', maxWidth: '650px', margin: '0.5rem auto 0' }}>
              Browse 914+ tests with 100% Free Home Collection, digital NABL reports on WhatsApp, and smart package savings.
            </p>
          </div>

          {/* Smart Package Upgrade Banner */}
          <div style={{ backgroundColor: '#ECFDF5', border: '2px solid #A7F3D0', borderRadius: '20px', padding: '1.5rem 2rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '14px', backgroundColor: '#10B981', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Percent size={26} />
              </div>
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#065F46' }}>Smart Upgrade Suggestion: Save ₹2,001 (57% OFF)</div>
                <div style={{ fontSize: '0.88rem', color: '#047857', marginTop: '0.2rem' }}>
                  Booking single tests? Upgrade to the <strong>MedMarg Master Full Body Profile (87 Parameters)</strong> for just ₹1,499.
                </div>
              </div>
            </div>
            <button onClick={onNavigateLogin} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#047857', color: '#FFF', border: 'none', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '800', cursor: 'pointer' }}>
              Upgrade & Book Package →
            </button>
          </div>

          {/* Category Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { id: 'ALL', label: 'All Packages (87+)' },
              { id: 'HIS', label: '👨 His Wellness' },
              { id: 'HER', label: '👩 Her Wellness' },
              { id: 'ORGAN', label: '🫀 Organ Health (LFT/KFT/Lipid)' },
              { id: 'DIABETES', label: '🩸 Diabetes & Glucose' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCatalogTab(tab.id)}
                style={{ padding: '0.65rem 1.25rem', borderRadius: '12px', border: 'none', fontSize: '0.9rem', fontWeight: '800', cursor: 'pointer', backgroundColor: catalogTab === tab.id ? '#005F60' : '#F1F5F9', color: catalogTab === tab.id ? '#FFFFFF' : '#475569', transition: 'all 0.15s' }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.75rem' }}>
            {displayedPackages.slice(0, 6).map(pkg => (
              <div key={pkg.id} style={{ backgroundColor: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                    <span style={{ padding: '0.3rem 0.75rem', backgroundColor: '#E0F2F1', color: '#005F60', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '800' }}>
                      {pkg.category || 'Wellness Package'}
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
                    <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A' }}>₹{pkg.price}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94A3B8', textDecoration: 'line-through' }}>MRP ₹{pkg.mrp}</div>
                  </div>
                  <button onClick={onNavigateLogin} style={{ padding: '0.65rem 1.25rem', backgroundColor: '#005F60', color: '#FFF', border: 'none', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer' }}>
                    Book Pickup →
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 🛵 SECTION 3: WHAT IS THE LIVE DELIVERY-STYLE PHLEBOTOMIST TRACKER? */}
      <section id="tracker" style={{ padding: '4.5rem 1.5rem', backgroundColor: '#0F172A', color: '#FFF' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ color: '#38BDF8', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.08em' }}>EXPLAINING MEDMARG LOGISTICS</span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '900', color: '#FFFFFF', marginTop: '0.35rem' }}>
              What is the Live Delivery-Style Tracker?
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '0.98rem', marginTop: '0.5rem', maxWidth: '720px', margin: '0.5rem auto 0', lineHeight: '1.5' }}>
              Just like tracking a ride or food delivery app (Swiggy / Uber), MedMarg provides real-time GPS visibility for your home sample collection phlebotomist!
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            
            <div style={{ backgroundColor: '#1E293B', padding: '2rem', borderRadius: '20px', border: '1px solid #334155' }}>
              <Navigation size={32} color="#38BDF8" style={{ marginBottom: '1rem' }} />
              <h4 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#FFF', marginBottom: '0.4rem' }}>1. Live Moving GPS Map</h4>
              <p style={{ color: '#94A3B8', fontSize: '0.88rem', lineHeight: '1.5' }}>
                Watch your assigned phlebotomist moving live on an interactive city map with speed telemetry (`28 km/h`) and precise ETA countdown (`12 mins`).
              </p>
            </div>

            <div style={{ backgroundColor: '#1E293B', padding: '2rem', borderRadius: '20px', border: '1px solid #334155' }}>
              <ShieldCheck size={32} color="#10B981" style={{ marginBottom: '1rem' }} />
              <h4 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#FFF', marginBottom: '0.4rem' }}>2. 4-Digit Security OTP</h4>
              <p style={{ color: '#94A3B8', fontSize: '0.88rem', lineHeight: '1.5' }}>
                Your app displays an encrypted 4-digit code (`OTP: 4892`). Share this code with your phlebotomist on arrival to verify identity before sample collection.
              </p>
            </div>

            <div style={{ backgroundColor: '#1E293B', padding: '2rem', borderRadius: '20px', border: '1px solid #334155' }}>
              <Thermometer size={32} color="#F59E0B" style={{ marginBottom: '1rem' }} />
              <h4 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#FFF', marginBottom: '0.4rem' }}>3. IoT Cold-Chain Monitoring</h4>
              <p style={{ color: '#94A3B8', fontSize: '0.88rem', lineHeight: '1.5' }}>
                View continuous temperature sensor readings (`4.2°C Active`) inside the agent's carry bag to ensure sample integrity during transit.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 📊 SECTION 4: HEALTH VITALS & BIOMARKER RADAR */}
      <section id="vitals" style={{ padding: '4.5rem 1.5rem', backgroundColor: '#F8FAFC' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ color: '#005F60', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.08em' }}>APPLICATION FEATURE SHOWCASE</span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '900', color: '#0F172A', marginTop: '0.35rem' }}>
              Health Vitals Radar & NABL Health Locker
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '0.5rem' }}>
              Track vitals, store digital NABL reports, manage family members, and share diagnostic history.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            
            <div style={{ backgroundColor: '#FFF', padding: '2rem', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#E0F2F1', color: '#005F60', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Activity size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A', marginBottom: '0.5rem' }}>Vitals & Graphical Curves</h3>
              <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: '1.5' }}>
                Track Blood Pressure, Blood Glucose, Heart Rate, SpO2, and BMI with Canvas-drawn curve graphs and normal reference zones.
              </p>
            </div>

            <div style={{ backgroundColor: '#FFF', padding: '2rem', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#E0F2F1', color: '#005F60', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <FolderHeart size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A', marginBottom: '0.5rem' }}>NABL Locker & Auto Sync</h3>
              <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: '1.5' }}>
                Lifetime secure Cloud storage for diagnostic PDF reports with automated WhatsApp & Google Drive delivery within 24 hours.
              </p>
            </div>

            <div style={{ backgroundColor: '#FFF', padding: '2rem', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#E0F2F1', color: '#005F60', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Users size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A', marginBottom: '0.5rem' }}>Linked Family Accounts</h3>
              <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: '1.5' }}>
                Book sample pickups and track health metrics for your spouse, children, and elderly parents under a single account.
              </p>
            </div>

            <div style={{ backgroundColor: '#FFF', padding: '2rem', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#E0F2F1', color: '#005F60', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Share2 size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A', marginBottom: '0.5rem' }}>1-Click Encrypted Sharing</h3>
              <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: '1.5' }}>
                Bundle diagnostic reports and vital history to generate encrypted links to share directly with consulting doctors.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 🔮 SECTION 5: UPCOMING ECOSYSTEM EXTENSIONS */}
      <section id="upcoming" style={{ padding: '4.5rem 1.5rem', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
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
            
            <div style={{ padding: '1.75rem', backgroundColor: '#F8FAFC', borderRadius: '20px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <Stethoscope size={36} color="#005F60" style={{ margin: '0 auto 1rem' }} />
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#005F60', marginBottom: '0.25rem' }}>COMING SOON</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>In-Clinic & Video Doctors</h4>
              <p style={{ color: '#64748B', fontSize: '0.82rem', marginTop: '0.4rem' }}>Book OPD consultations and e-prescriptions with verified medical specialists.</p>
            </div>

            <div style={{ padding: '1.75rem', backgroundColor: '#F8FAFC', borderRadius: '20px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <Building2 size={36} color="#005F60" style={{ margin: '0 auto 1rem' }} />
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#005F60', marginBottom: '0.25rem' }}>COMING SOON</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>3.0T MRI & CT Scan Centers</h4>
              <p style={{ color: '#64748B', fontSize: '0.82rem', marginTop: '0.4rem' }}>Reserve radiology slots and view DICOM scan reports directly in app.</p>
            </div>

            <div style={{ padding: '1.75rem', backgroundColor: '#F8FAFC', borderRadius: '20px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <Pill size={36} color="#005F60" style={{ margin: '0 auto 1rem' }} />
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#005F60', marginBottom: '0.25rem' }}>COMING SOON</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>Generic & Branded E-Pharmacy</h4>
              <p style={{ color: '#64748B', fontSize: '0.82rem', marginTop: '0.4rem' }}>Upload prescriptions for genuine medicines delivered straight to home.</p>
            </div>

            <div style={{ padding: '1.75rem', backgroundColor: '#F8FAFC', borderRadius: '20px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <Heart size={36} color="#005F60" style={{ margin: '0 auto 1rem' }} />
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#005F60', marginBottom: '0.25rem' }}>COMING SOON</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>Health & Diet Coaching</h4>
              <p style={{ color: '#64748B', fontSize: '0.82rem', marginTop: '0.4rem' }}>Personalized lifestyle, diet, and nutrition plans based on biomarker reports.</p>
            </div>

          </div>

        </div>
      </section>

      {/* 💼 SECTION 6: MULTI-PORTAL ENTERPRISE LOGIN GATEWAY */}
      <section style={{ padding: '4.5rem 1.5rem', backgroundColor: '#F8FAFC' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
          
          <span style={{ color: '#005F60', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.08em' }}>PORTAL ACCESS</span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '900', color: '#0F172A', marginTop: '0.35rem' }}>
            Single Sign-In for All Stakeholders
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '0.5rem', marginBottom: '3rem' }}>
            System automatically detects your user type and launches your designated portal upon login.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            
            <div onClick={onNavigateLogin} style={{ backgroundColor: '#FFF', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#ECFDF5', color: '#065F46', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', fontWeight: '800' }}>👤</div>
              <h4 style={{ fontWeight: '900', color: '#0F172A', fontSize: '1rem' }}>Patient Portal</h4>
              <span style={{ fontSize: '0.75rem', color: '#005F60', fontWeight: '700' }}>Book & Track →</span>
            </div>

            <div onClick={onNavigateLogin} style={{ backgroundColor: '#FFF', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#FEF2F2', color: '#991B1B', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', fontWeight: '800' }}>👑</div>
              <h4 style={{ fontWeight: '900', color: '#0F172A', fontSize: '1rem' }}>Super Admin</h4>
              <span style={{ fontSize: '0.75rem', color: '#005F60', fontWeight: '700' }}>Platform Control →</span>
            </div>

            <div onClick={onNavigateLogin} style={{ backgroundColor: '#FFF', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#EFF6FF', color: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', fontWeight: '800' }}>💼</div>
              <h4 style={{ fontWeight: '900', color: '#0F172A', fontSize: '1rem' }}>MedMarg Staff</h4>
              <span style={{ fontSize: '0.75rem', color: '#005F60', fontWeight: '700' }}>Dispatch & Reports →</span>
            </div>

            <div onClick={onNavigateLogin} style={{ backgroundColor: '#FFF', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#FFFBEB', color: '#92400E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', fontWeight: '800' }}>🛵</div>
              <h4 style={{ fontWeight: '900', color: '#0F172A', fontSize: '1rem' }}>Salaried Fleet</h4>
              <span style={{ fontSize: '0.75rem', color: '#005F60', fontWeight: '700' }}>In-House Roster →</span>
            </div>

            <div onClick={onNavigateLogin} style={{ backgroundColor: '#FFF', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#F3E8FF', color: '#6B21A8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', fontWeight: '800' }}>⚡</div>
              <h4 style={{ fontWeight: '900', color: '#0F172A', fontSize: '1rem' }}>Freelancers</h4>
              <span style={{ fontSize: '0.75rem', color: '#005F60', fontWeight: '700' }}>Gig Marketplace →</span>
            </div>

          </div>

        </div>
      </section>

      {/* 🦶 SECTION 7: FOOTER & PARTNER PRE-REGISTRATION PORTAL */}
      <footer style={{ backgroundColor: '#0F172A', color: '#94A3B8', paddingTop: '4.5rem', paddingBottom: '2.5rem', borderTop: '1px solid #1E293B' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
          
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
              <h5 style={{ color: '#FFF', fontSize: '0.9rem', fontWeight: '800', marginBottom: '1rem' }}>Platform Specs</h5>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                <li><a href="/backend_structure.md" style={{ color: 'inherit', textDecoration: 'none' }}>backend_structure.md</a></li>
                <li><a href="/overview.md" style={{ color: 'inherit', textDecoration: 'none' }}>overview.md Context Anchor</a></li>
                <li><a href="/super_admin.md" style={{ color: 'inherit', textDecoration: 'none' }}>super_admin.md Spec</a></li>
                <li><a href="/DEMO_CREDENTIALS.md" style={{ color: 'inherit', textDecoration: 'none' }}>DEMO_CREDENTIALS.md</a></li>
              </ul>
            </div>

            <div>
              <h5 style={{ color: '#FFF', fontSize: '0.9rem', fontWeight: '800', marginBottom: '1rem' }}>Accreditations</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', color: '#94A3B8' }}>
                <span>✓ NABL ISO 15189 Certified</span>
                <span>✓ CAP Accredited Central Hub</span>
                <span>✓ ABDM & Ayushman Bharat Compliant</span>
                <span>✓ 256-Bit SSL Encrypted Storage</span>
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
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
