import React, { useState, useEffect } from 'react';
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
  Droplet
} from 'lucide-react';
import initialCatalog from '../data/catalogData.json';
import { getCatalogState } from '../data/catalogStore';
import { API_BASE } from '../data/apiConfig';

export default function LandingPage({ onNavigateLogin }) {
  const [catalog, setCatalog] = useState(getCatalogState() || initialCatalog);
  const [catalogTab, setCatalogTab] = useState('ALL'); // 'ALL' | 'HIS' | 'HER' | 'FAMILY' | 'ORGAN' | 'DIABETES'
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Active Modals
  const [activeItemModal, setActiveItemModal] = useState(null);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [partnerType, setPartnerType] = useState('DOCTOR');
  const [partnerSuccess, setPartnerSuccess] = useState(false);

  // Partner Form Inputs
  const [partnerName, setPartnerName] = useState('');
  const [partnerEst, setPartnerEst] = useState('');
  const [partnerPhone, setPartnerPhone] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerCity, setPartnerCity] = useState('Tirupati');
  const [partnerLicense, setPartnerLicense] = useState('');

  // Featured Hero Banners (Super Admin Updated Promotions)
  const heroBanners = [
    {
      id: 1,
      tag: '🔥 SUPER ADMIN FEATURED PACKAGE',
      title: 'MedMarg Master Full Body Wellness Profile',
      subtitle: 'Includes 87 Essential Biomarkers • Complete Hemogram, Lipid, LFT, KFT, Thyroid & HbA1c',
      mrp: '₹3,500',
      price: '₹1,499',
      savings: 'SAVE 57% (₹2,001 OFF)',
      badge: 'Free Home Pickup Included',
      bgGradient: 'linear-gradient(135deg, #005F60 0%, #0F172A 100%)',
      accentColor: '#38BDF8'
    },
    {
      id: 2,
      tag: '🛡️ SEASONAL HEALTH ASSESSMENT',
      title: 'Fever & Dengue Complete Diagnostic Shield',
      subtitle: 'Rapid Dengue NS1, IgG/IgM, Malarial Antigen, Complete Blood Count & Urine Analysis',
      mrp: '₹1,200',
      price: '₹499',
      savings: 'SAVE 58% (₹701 OFF)',
      badge: '60-Min Fast Track Pickup',
      bgGradient: 'linear-gradient(135deg, #0F766E 0%, #134E4A 100%)',
      accentColor: '#F59E0B'
    },
    {
      id: 3,
      tag: '🫀 SPECIALIZED CARDIAC & DIABETES CHECK',
      title: 'Advanced Heart & Metabolic Screening',
      subtitle: 'High Sensitivity CRP, ApoB, HbA1c, Fasting Blood Sugar, Lipid Profile & Kidney Check',
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

  // Sync Live Catalog from API if available
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

  const handlePartnerSubmit = (e) => {
    e.preventDefault();
    setPartnerSuccess(true);
    setTimeout(() => {
      setPartnerSuccess(false);
      setShowPartnerModal(false);
    }, 4000);
  };

  // Filter Catalog Items
  const allPackages = catalog.packages || [];
  const filteredPackages = allPackages.filter(pkg => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || 
      (pkg.name && pkg.name.toLowerCase().includes(query)) ||
      (pkg.category && pkg.category.toLowerCase().includes(query));

    if (!matchesSearch) return false;
    if (catalogTab === 'HIS') return pkg.category?.includes('Men') || pkg.name?.includes('His') || pkg.name?.includes('Men');
    if (catalogTab === 'HER') return pkg.category?.includes('Women') || pkg.name?.includes('Her') || pkg.name?.includes('Women');
    if (catalogTab === 'ORGAN') return pkg.category?.includes('Organ') || pkg.name?.includes('Liver') || pkg.name?.includes('Kidney');
    if (catalogTab === 'DIABETES') return pkg.category?.includes('Diabetes') || pkg.name?.includes('Sugar') || pkg.name?.includes('Glucose');
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* 🔝 TOP ANNOUNCEMENT & HEADER BAR */}
      <div style={{ backgroundColor: '#005F60', color: '#FFFFFF', padding: '0.45rem 1.5rem', fontSize: '0.82rem', fontWeight: '700', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={15} color="#F59E0B" />
          <span>MedMarg Central Diagnostics: 914+ Pathology Tests & Full Body Profiles | Free Home Sample Collection Included</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.78rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={13} /> Tirupati, Andhra Pradesh</span>
        </div>
      </div>

      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '1rem 2rem', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/logo.png" alt="MedMarg" style={{ height: '40px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
            <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#005F60', letterSpacing: '-0.02em' }}>MedMarg</span>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', fontWeight: '700', fontSize: '0.9rem', color: '#334155' }}>
            <a href="#catalog" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <FlaskConical size={16} color="#005F60" /> Diagnostics & Tests ({filteredPackages.length + 900}+)
            </a>
            <a href="#features" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Activity size={16} color="#005F60" /> Health Vitals & Locker
            </a>
            <a href="#upcoming" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Stethoscope size={16} color="#005F60" /> Upcoming Doctors & MRI
            </a>
            <a href="#trust" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={16} color="#005F60" /> Trust & Safety
            </a>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <button
              onClick={onNavigateLogin}
              style={{ padding: '0.65rem 1.35rem', backgroundColor: '#005F60', color: '#FFF', border: 'none', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(0,95,96,0.25)', transition: 'transform 0.15s' }}
            >
              Sign In / Book Now <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* 🖼️ SECTION 1: HERO CAROUSEL & UNIVERSAL SEARCH */}
      <section style={{ backgroundColor: '#0F172A', padding: '3.5rem 1.5rem 4.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '3rem', alignItems: 'center' }}>
          
          {/* Left Column: Carousel & Tagline */}
          <div>
            {/* Active Banner Slide */}
            <div style={{ transition: 'all 0.5s ease-in-out' }}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
                  <span style={{ fontSize: '2.1rem', fontWeight: '900', color: '#FFFFFF' }}>{heroBanners[currentSlide].price}</span>
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

            {/* Universal Multi-Filter Search Bar */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '0.65rem 0.85rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '2px solid #005F60' }}>
              <Search size={22} color="#005F60" />
              <input
                type="text"
                placeholder="Search 914+ tests (Thyroid, Lipid, HbA1c, Vitamin D, Dengue, Complete Blood Count)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.98rem', fontWeight: '600', color: '#0F172A' }}
              />
              <a href="#catalog" style={{ textDecoration: 'none', padding: '0.75rem 1.4rem', backgroundColor: '#005F60', color: '#FFF', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '800', cursor: 'pointer' }}>
                Search & Book
              </a>
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

      {/* 🧪 SECTION 2: LIVE CATALOG & SMART PACKAGE UPGRADE SHOWCASE */}
      <section id="catalog" style={{ padding: '4.5rem 1.5rem', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ color: '#005F60', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.08em' }}>MASTER DIAGNOSTIC CATALOG</span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '900', color: '#0F172A', marginTop: '0.35rem' }}>
              Explore 914+ Tests & Curated Health Packages
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '0.5rem', maxWidth: '650px', margin: '0.5rem auto 0' }}>
              All tests include 100% Free Home Sample Collection, digital NABL reports on WhatsApp, and smart package savings.
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
            {filteredPackages.slice(0, 6).map(pkg => (
              <div key={pkg.id} style={{ backgroundColor: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', position: 'relative' }}>
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

                  {/* Spec Tags */}
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

                {/* Card Footer Price & Action */}
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

      {/* 📱 SECTION 3: CORE MEDMARG APP FEATURES SHOWCASE */}
      <section id="features" style={{ padding: '4.5rem 1.5rem', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ color: '#005F60', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.08em' }}>APPLICATION HIGHLIGHTS</span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '900', color: '#0F172A', marginTop: '0.35rem' }}>
              Built for Complete Health Monitoring
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '0.5rem' }}>
              Track vitals, store digital NABL reports, manage family members, and share diagnostic history.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            
            {/* Feature 1: Vitals & Graphical Trends */}
            <div style={{ backgroundColor: '#FFF', padding: '2rem', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#E0F2F1', color: '#005F60', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Activity size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A', marginBottom: '0.5rem' }}>Vitals & Biomarker Trends</h3>
              <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: '1.5' }}>
                Track Blood Pressure, Blood Glucose, Heart Rate, SpO2, and BMI with Canvas-drawn curve graphs and normal reference zones.
              </p>
            </div>

            {/* Feature 2: NABL Health Locker */}
            <div style={{ backgroundColor: '#FFF', padding: '2rem', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#E0F2F1', color: '#005F60', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <FolderHeart size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A', marginBottom: '0.5rem' }}>NABL Locker & Auto Sync</h3>
              <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: '1.5' }}>
                Lifetime secure Cloud storage for diagnostic PDF reports with automated WhatsApp & Google Drive delivery within 24 hours.
              </p>
            </div>

            {/* Feature 3: Linked Family Manager */}
            <div style={{ backgroundColor: '#FFF', padding: '2rem', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#E0F2F1', color: '#005F60', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Users size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A', marginBottom: '0.5rem' }}>Linked Family Accounts</h3>
              <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: '1.5' }}>
                Book sample pickups and track health metrics for your spouse, children, and elderly parents under a single account.
              </p>
            </div>

            {/* Feature 4: 1-Click Doctor Sharing */}
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

      {/* 🔮 SECTION 4: UPCOMING ECOSYSTEM EXTENSIONS */}
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

      {/* 🛡️ SECTION 5: TRUST FACTORS & ACCREDITATION */}
      <section id="trust" style={{ padding: '4.5rem 1.5rem', backgroundColor: '#0F172A', color: '#FFF' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
          
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

      {/* 💼 SECTION 6: MULTI-PORTAL SYSTEM LOGIN GATEWAY */}
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
                <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#FFF' }}>MedMarg</span>
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
              <h5 style={{ color: '#FFF', fontSize: '0.9rem', fontWeight: '800', marginBottom: '1rem' }}>Platform Architecture</h5>
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

    </div>
  );
}
