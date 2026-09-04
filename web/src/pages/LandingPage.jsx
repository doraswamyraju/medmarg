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
  AlertCircle
} from 'lucide-react';
import initialCatalog from '../data/catalogData.json';
import { getCatalogState, filterCatalogItems } from '../data/catalogStore';

export default function LandingPage({ onNavigateLogin }) {
  const [catalog, setCatalog] = useState(getCatalogState() || initialCatalog);
  const [catalogTab, setCatalogTab] = useState('ALL'); // 'ALL' | 'PACKAGES' | 'PROFILES' | 'TESTS'
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [fastingFilter, setFastingFilter] = useState('ALL'); // 'ALL' | 'YES' | 'NO'
  const [sampleFilter, setSampleFilter] = useState('ALL'); // 'ALL' | 'SERUM' | 'EDTA' | 'URINE'
  const [userCity, setUserCity] = useState('Tirupati, Andhra Pradesh');
  const [isLocating, setIsLocating] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [activeItemModal, setActiveItemModal] = useState(null);
  
  // Partner Onboarding Modal
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [partnerType, setPartnerType] = useState('DIAGNOSTIC_LAB');
  const [partnerSuccessToken, setPartnerSuccessToken] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Sync catalog from backend API if running
  useEffect(() => {
    fetch('http://localhost:5080/api/v1/catalog/summary')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Fetch packages and tests if available
          Promise.all([
            fetch('http://localhost:5080/api/v1/catalog/packages').then(r => r.json()),
            fetch('http://localhost:5080/api/v1/catalog/profiles').then(r => r.json()),
            fetch('http://localhost:5080/api/v1/catalog/tests?limit=1000').then(r => r.json())
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

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto GPS Location
  useEffect(() => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          setUserCity('Tirupati, Andhra Pradesh (Auto-Detected GPS)');
        },
        () => {
          setIsLocating(false);
          setUserCity('Tirupati, Andhra Pradesh');
        },
        { timeout: 8000 }
      );
    }
  }, []);

  // Filter items based on active subtab & search
  const getDisplayItems = () => {
    let items = [];
    if (catalogTab === 'ALL') {
      items = [
        ...(catalog.packages || []).map(p => ({ ...p, itemType: 'PACKAGE' })),
        ...(catalog.profiles || []).map(p => ({ ...p, itemType: 'PROFILE' })),
        ...(catalog.tests || []).map(t => ({ ...t, itemType: 'TEST' }))
      ];
    } else if (catalogTab === 'PACKAGES') {
      items = (catalog.packages || []).map(p => ({ ...p, itemType: 'PACKAGE' }));
    } else if (catalogTab === 'PROFILES') {
      items = (catalog.profiles || []).map(p => ({ ...p, itemType: 'PROFILE' }));
    } else if (catalogTab === 'TESTS') {
      items = (catalog.tests || []).map(t => ({ ...t, itemType: 'TEST' }));
    }

    return filterCatalogItems(items, searchQuery, fastingFilter, sampleFilter);
  };

  const filteredItems = getDisplayItems();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', overflowX: 'hidden' }}>
      
      {/* TOP NOTIFICATION BAR */}
      <div style={{ background: 'linear-gradient(90deg, #006B70 0%, #004D40 100%)', color: '#FFFFFF', padding: '0.45rem 1rem', fontSize: '0.82rem', fontWeight: '700', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={15} color="#FBBF24" />
            <span>✨ <strong>MedMarg Central Diagnostics:</strong> 1,000+ Pathology Tests & Full Body Profiles | Free Home Sample Collection</span>
          </div>
          
          <div 
            onClick={() => setShowLocationModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.15)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}
          >
            <MapPin size={14} />
            <span>{isLocating ? 'Detecting Location...' : userCity}</span>
            <span style={{ textDecoration: 'underline', fontSize: '0.75rem', marginLeft: '0.2rem' }}>Change</span>
          </div>
        </div>
      </div>

      {/* 1. LUXURY STICKY HEADER */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'rgba(255, 255, 255, 0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #E2E8F0', boxShadow: '0 4px 20px -4px rgba(0, 77, 64, 0.08)' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '0.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Logo on Left */}
          <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '6px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0' }}>
              <img 
                src="/logo.png" 
                alt="MedMarg" 
                style={{ height: '38px', objectFit: 'contain', display: 'block' }} 
              />
            </div>
          </div>

          {/* Navigation Links in Center */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#F8FAFC', padding: '0.35rem 0.6rem', borderRadius: '30px', border: '1px solid #E2E8F0' }}>
            <a 
              href="#diagnostics" 
              style={{ textDecoration: 'none', color: '#0F172A', fontWeight: '700', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.45rem 1rem', borderRadius: '20px', transition: 'all 0.15s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E0F2F1'; e.currentTarget.style.color = '#006B70'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#0F172A'; }}
            >
              <FlaskConical size={16} color="#006B70" /> Diagnostics & Tests ({catalog.tests?.length || 913})
            </a>
            
            <a 
              href="#scans" 
              style={{ textDecoration: 'none', color: '#0F172A', fontWeight: '700', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.45rem 1rem', borderRadius: '20px', transition: 'all 0.15s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#CFFAFE'; e.currentTarget.style.color = '#0891B2'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#0F172A'; }}
            >
              <Building2 size={16} color="#06B6D4" /> 3.0T MRI Scans
            </a>
            
            <a 
              href="#doctors" 
              style={{ textDecoration: 'none', color: '#0F172A', fontWeight: '700', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.45rem 1rem', borderRadius: '20px', transition: 'all 0.15s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#EDE9FE'; e.currentTarget.style.color = '#8B5CF6'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#0F172A'; }}
            >
              <Stethoscope size={16} color="#8B5CF6" /> In-Clinic Doctors
            </a>

            <a 
              href="#pharmacy" 
              style={{ textDecoration: 'none', color: '#0F172A', fontWeight: '700', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.45rem 1rem', borderRadius: '20px', transition: 'all 0.15s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#D1FAE5'; e.currentTarget.style.color = '#10B981'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#0F172A'; }}
            >
              <Pill size={16} color="#10B981" /> Generic Pharmacy
            </a>
          </nav>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => onNavigateLogin('PATIENT')}
              style={{ padding: '0.55rem 1.25rem', backgroundColor: '#006B70', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(0, 107, 112, 0.25)' }}
            >
              Sign In / Book Now <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="gradient-hero" style={{ color: '#FFFFFF', padding: '4.5rem 1.5rem 6.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 10 }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1.1rem', backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(251,191,36,0.4)', borderRadius: '24px', fontSize: '0.88rem', fontWeight: '700', marginBottom: '1.25rem', backdropFilter: 'blur(10px)' }}>
            <span style={{ color: '#FBBF24', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ShieldCheck size={16} /> MedMarg Central Diagnostics
            </span>
            <span style={{ color: '#E0F2F1' }}>• 100% NABL Accredited & Certified Precision</span>
          </div>

          <h1 style={{ fontSize: '3.2rem', fontWeight: '900', lineHeight: 1.15, maxWidth: '1000px', margin: '0 auto 1.25rem', letterSpacing: '-0.03em' }}>
            Complete Blood Tests & Health Packages with <span style={{ color: '#FBBF24', textDecoration: 'underline', textDecorationColor: '#F59E0B' }}>Free Home Collection</span>
          </h1>

          <p style={{ fontSize: '1.15rem', color: '#E0F2F1', maxWidth: '850px', margin: '0 auto 2.25rem', lineHeight: 1.6 }}>
            Browse {catalog.tests?.length || 913}+ single tests, {catalog.profiles?.length || 87}+ specialized profiles, and master full-body packages. Accurate digital reports delivered straight to your WhatsApp & Google Drive within 24 hours.
          </p>

          {/* Unified Location + Search Bar Widget */}
          <div style={{ maxWidth: '920px', margin: '0 auto', position: 'relative' }}>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '22px', padding: '0.55rem', display: 'flex', alignItems: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)', border: '2px solid rgba(0,107,112,0.35)' }}>
              
              <div 
                onClick={() => setShowLocationModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 1.25rem', borderRight: '1.5px solid #E2E8F0', cursor: 'pointer' }}
              >
                <MapPin size={22} color="#006B70" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700' }}>LOCATION</div>
                  <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.92rem' }}>{userCity.split(',')[0]}</div>
                </div>
              </div>

              <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={22} color="#94A3B8" style={{ position: 'absolute', left: '16px' }} />
                <input
                  type="text"
                  placeholder={`Search across ${catalog.tests?.length || 913}+ tests (Thyroid, Lipid, Vitamin D, HbA1c, Allergy, Liver)...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  style={{ width: '100%', padding: '1rem 1rem 1rem 3.4rem', border: 'none', fontSize: '1rem', outline: 'none', color: '#0F172A', fontWeight: '600' }}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: '#94A3B8', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  const firstMatch = filteredItems[0];
                  if (firstMatch) {
                    setActiveItemModal(firstMatch);
                  } else {
                    document.getElementById('diagnostics')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                style={{ padding: '0.95rem 1.9rem', background: 'linear-gradient(135deg, #006B70 0%, #004D40 100%)', color: '#FFF', border: 'none', borderRadius: '16px', fontWeight: '900', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(0,107,112,0.4)', flexShrink: 0 }}
              >
                Search & Book <ArrowRight size={18} />
              </button>
            </div>

            {/* LIVE AUTOCOMPLETE SUGGESTIONS DROPDOWN */}
            {searchQuery.trim().length > 0 && (
              <div 
                style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', zIndex: 100, backgroundColor: '#FFFFFF', borderRadius: '20px', boxShadow: '0 25px 60px -10px rgba(0,0,0,0.3)', border: '1.5px solid #E2E8F0', maxHeight: '380px', overflowY: 'auto', textAlign: 'left', padding: '0.75rem' }}
                className="custom-scrollbar"
              >
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', padding: '0.35rem 0.65rem', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Matching Items ({filteredItems.length})</span>
                  <span>Click to View Details</span>
                </div>

                {filteredItems.length > 0 ? (
                  filteredItems.slice(0, 8).map((item) => (
                    <div
                      key={item.id || item.code}
                      onClick={() => {
                        setActiveItemModal(item);
                        setSearchQuery('');
                      }}
                      style={{ padding: '0.85rem 1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'background 0.15s', borderBottom: '1px solid #F1F5F9' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E0F2F1'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong style={{ color: '#0F172A', fontSize: '0.95rem' }}>{item.name}</strong>
                          <span style={{ fontSize: '0.7rem', backgroundColor: item.itemType === 'PACKAGE' ? '#FEF3C7' : (item.itemType === 'PROFILE' ? '#CFFAFE' : '#E2E8F0'), color: item.itemType === 'PACKAGE' ? '#B45309' : (item.itemType === 'PROFILE' ? '#0891B2' : '#334155'), padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '800' }}>
                            {item.itemType || 'TEST'} {item.code ? `• ${item.code}` : ''}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>
                          Sample: <strong>{item.sampleType || item.sampleTypes?.join(', ') || 'SERUM'}</strong> • Fasting: <strong>{item.fasting}</strong>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#006B70' }}>
                          ₹{item.price}
                        </div>
                        {item.mrp && (
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                            ₹{item.mrp}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748B' }}>
                    <p style={{ fontWeight: '700' }}>No exact test or profile match found for "{searchQuery}"</p>
                    <span style={{ fontSize: '0.82rem' }}>Try searching "Vitamin", "Thyroid", "Lipid", "Allergy", or "Sugar"</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Trust Badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', marginTop: '2.75rem', flexWrap: 'wrap' }}>
            {[
              { text: 'MedMarg Unified Diagnostic Network', color: '#FBBF24' },
              { text: '100% Free Home Sample Collection', color: '#10B981' },
              { text: 'NABL & ISO 9001 Certified Laboratory', color: '#67E8F9' },
              { text: 'Digital Reports Synced to Google Drive & WhatsApp', color: '#FDE047' }
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#FFFFFF', fontWeight: '600' }}>
                <CheckCircle2 size={18} color={item.color} />
                <span>{item.text}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 3. CORE CATEGORIES */}
      <section style={{ maxWidth: '1240px', margin: '-3.5rem auto 4rem', padding: '0 1.5rem', position: 'relative', zIndex: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {[
            { title: 'MedMarg Diagnostics', desc: `${catalog.tests?.length || 913}+ Tests, ${catalog.profiles?.length || 87}+ Profiles & Packages`, icon: FlaskConical, color: '#006B70', bg: '#E0F2F1', target: '#diagnostics' },
            { title: '3.0T MRI & Scans', desc: 'Silent MRI, CT Scan & 4D Ultrasound Slots', icon: Building2, color: '#06B6D4', bg: '#CFFAFE', target: '#scans' },
            { title: 'In-Clinic Doctors', desc: 'Book Walk-in OPD Specialist Appointments', icon: Stethoscope, color: '#8B5CF6', bg: '#EDE9FE', target: '#doctors' },
            { title: 'Generic Pharmacy', desc: 'Save Up to 70% with Quality Generic Salts', icon: Pill, color: '#10B981', bg: '#D1FAE5', target: '#pharmacy' },
            { title: 'Digital Health Records', desc: 'Biomarker Trends & Google Drive Sync', icon: FolderHeart, color: '#EC4899', bg: '#FCE7F3', target: '#records' }
          ].map((cat, i) => {
            const IconComp = cat.icon;
            return (
              <a
                key={i}
                href={cat.target}
                style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.6rem', border: '1px solid #E2E8F0', textDecoration: 'none', color: 'inherit', boxShadow: '0 12px 24px -6px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                className="card-interactive"
              >
                <div style={{ width: '50px', height: '50px', borderRadius: '14px', backgroundColor: cat.bg, color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconComp size={26} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>{cat.title}</h3>
                  <p style={{ fontSize: '0.84rem', color: '#64748B', marginTop: '0.25rem', lineHeight: 1.4 }}>{cat.desc}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.84rem', fontWeight: '800', color: cat.color, marginTop: 'auto' }}>
                  Explore Catalog <ChevronRight size={15} />
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* 4. MASTER DIAGNOSTIC CATALOG (PACKAGES, PROFILES & TESTS) */}
      <section id="diagnostics" style={{ maxWidth: '1240px', margin: '0 auto 5rem', padding: '0 1.5rem' }}>
        
        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.65rem', backgroundColor: '#E0F2F1', color: '#006B70', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '800', marginBottom: '0.4rem' }}>
              ⭐ MASTER PATHOLOGY CATALOG • MEDMARG UNIFIED LAB
            </div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.02em' }}>
              Pathology Tests, Profiles & Full Body Packages
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.95rem', maxWidth: '780px' }}>
              Unified single-lab standard under MedMarg Central Diagnostics. Verified NABL processing with 100% Free Home Sample Collection.
            </p>
          </div>

          {/* Scroll Navigation */}
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              onClick={() => {
                const track = document.getElementById('catalog-track');
                if (track) track.scrollBy({ left: -360, behavior: 'smooth' });
              }}
              style={{ width: '42px', height: '42px', borderRadius: '12px', border: '1.5px solid #E2E8F0', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', fontSize: '1.1rem', fontWeight: 'bold' }}
              title="Previous"
            >
              ←
            </button>
            <button
              onClick={() => {
                const track = document.getElementById('catalog-track');
                if (track) track.scrollBy({ left: 360, behavior: 'smooth' });
              }}
              style={{ width: '42px', height: '42px', borderRadius: '12px', border: '1.5px solid #006B70', backgroundColor: '#006B70', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,107,112,0.25)', fontSize: '1.1rem', fontWeight: 'bold' }}
              title="Next"
            >
              →
            </button>
          </div>
        </div>

        {/* TABS & FILTERS BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', backgroundColor: '#FFFFFF', padding: '0.85rem 1.25rem', borderRadius: '18px', border: '1px solid #E2E8F0' }}>
          
          {/* Main Category Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { key: 'ALL', label: `All Items (${(catalog.packages?.length || 0) + (catalog.profiles?.length || 0) + (catalog.tests?.length || 0)})` },
              { key: 'PACKAGES', label: `✨ Health Packages (${catalog.packages?.length || 4})` },
              { key: 'PROFILES', label: `🔬 Diagnostic Profiles (${catalog.profiles?.length || 87})` },
              { key: 'TESTS', label: `🧪 Individual Tests (${catalog.tests?.length || 913})` }
            ].map(tab => {
              const isSel = catalogTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setCatalogTab(tab.key)}
                  style={{
                    padding: '0.55rem 1.1rem',
                    borderRadius: '12px',
                    border: isSel ? '2px solid #006B70' : '1px solid #E2E8F0',
                    backgroundColor: isSel ? '#006B70' : '#F8FAFC',
                    color: isSel ? '#FFFFFF' : '#475569',
                    fontWeight: isSel ? '800' : '600',
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Quick Filter: Fasting & Sample */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: '700', color: '#64748B' }}>
              <Filter size={15} /> Fasting:
              <select
                value={fastingFilter}
                onChange={(e) => setFastingFilter(e.target.value)}
                style={{ padding: '0.35rem 0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontWeight: '700', color: '#0F172A', outline: 'none' }}
              >
                <option value="ALL">All Rules</option>
                <option value="YES">Fasting Required</option>
                <option value="NO">No Fasting</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: '700', color: '#64748B' }}>
              Sample:
              <select
                value={sampleFilter}
                onChange={(e) => setSampleFilter(e.target.value)}
                style={{ padding: '0.35rem 0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontWeight: '700', color: '#0F172A', outline: 'none' }}
              >
                <option value="ALL">All Types</option>
                <option value="SERUM">Serum (Blood)</option>
                <option value="EDTA">EDTA (Whole Blood)</option>
                <option value="URINE">Urine</option>
              </select>
            </div>
          </div>
        </div>

        {/* HORIZONTAL CATALOG TRACK */}
        <div 
          id="catalog-track"
          style={{ display: 'flex', gap: '1.25rem', overflowX: 'auto', scrollSnapType: 'x mandatory', padding: '0.5rem 0.25rem 1.5rem', scrollBehavior: 'smooth' }}
          className="custom-scrollbar"
        >
          {filteredItems.slice(0, 100).map((item) => (
            <div 
              key={item.id || item.code} 
              onClick={() => setActiveItemModal(item)}
              style={{ minWidth: '320px', maxWidth: '320px', flexShrink: 0, scrollSnapAlign: 'start', backgroundColor: '#FFFFFF', borderRadius: '20px', border: item.itemType === 'PACKAGE' ? '2px solid #F59E0B' : '1.5px solid #E2E8F0', padding: '1.4rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
              className="card-interactive"
            >
              {/* Card Header */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <span style={{ 
                    fontSize: '0.72rem', 
                    backgroundColor: item.itemType === 'PACKAGE' ? '#FEF3C7' : (item.itemType === 'PROFILE' ? '#CFFAFE' : '#E0F2F1'), 
                    color: item.itemType === 'PACKAGE' ? '#B45309' : (item.itemType === 'PROFILE' ? '#0891B2' : '#006B70'), 
                    padding: '0.2rem 0.55rem', 
                    borderRadius: '6px', 
                    fontWeight: '800' 
                  }}>
                    {item.itemType === 'PACKAGE' ? 'HEALTH PACKAGE' : (item.itemType === 'PROFILE' ? 'PROFILE PANEL' : 'SINGLE TEST')}
                  </span>
                  
                  {item.code && (
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '700', fontFamily: 'monospace' }}>
                      {item.code}
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.12rem', fontWeight: '800', color: '#0F172A', lineHeight: 1.3, minHeight: '44px' }}>
                  {item.name}
                </h3>
                
                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.5rem 0 0.85rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.tagline || item.description || `Diagnostic testing analyzing ${item.name} biomarkers.`}
                </p>

                {/* Sample and Fasting Metadata */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.78rem', color: '#475569', backgroundColor: '#F8FAFC', padding: '0.65rem 0.8rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>🩸 Sample:</span> <strong style={{ color: '#0F172A' }}>{item.sampleType || item.sampleTypes?.join(', ') || 'SERUM'}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>🍽️ Fasting:</span> <strong style={{ color: item.fasting === 'YES' ? '#D97706' : '#10B981' }}>{item.fasting === 'YES' ? 'Yes (8-10h)' : 'Not Required'}</strong>
                  </div>
                </div>
              </div>

              {/* Card Bottom: Price & Details Action */}
              <div style={{ paddingTop: '0.85rem', borderTop: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', fontWeight: '600' }}>MedMarg Price</span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                      <span style={{ fontSize: '1.45rem', fontWeight: '900', color: '#006B70' }}>₹{item.price}</span>
                      {item.mrp && (
                        <span style={{ fontSize: '0.8rem', color: '#94A3B8', textDecoration: 'line-through' }}>₹{item.mrp}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: '800', backgroundColor: '#D1FAE5', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                    Free Home Visit
                  </div>
                </div>

                <button
                  style={{ width: '100%', padding: '0.65rem', background: 'linear-gradient(135deg, #006B70 0%, #004D40 100%)', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem' }}
                >
                  View Details & Book <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length > 100 && (
          <div style={{ textAlign: 'center', marginTop: '1rem', color: '#64748B', fontSize: '0.85rem', fontWeight: '600' }}>
            Showing top 100 of {filteredItems.length} matching items. Use the search bar above to instantly find any specific test or profile code.
          </div>
        )}
      </section>

      {/* 5. RADIOLOGY & 3.0T MRI SCANS */}
      <section id="scans" style={{ backgroundColor: '#0F172A', color: '#FFFFFF', padding: '5.5rem 1.5rem', marginBottom: '5rem', position: 'relative' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ maxWidth: '750px', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#FBBF24', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Advanced Imaging & Diagnostics
            </span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: '900', marginTop: '0.3rem' }}>
              Book 3.0T Silent MRI, CT & Ultrasound Slots
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem', marginTop: '0.5rem', lineHeight: 1.6 }}>
              Direct hourly slot reservation with accredited scanning centers. Transparent machine specifications (Siemens 3.0T / 128-Slice Low Radiation CT) and pre-scan fasting checklists.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {[
              { name: 'MRI Brain (Plain + Angio)', spec: 'Siemens 3.0 Tesla Silent MRI', price: '₹3,499', mrp: '₹6,000', slot: 'Today, 5:00 PM', yellowTag: '42% SAVINGS' },
              { name: 'HRCT Chest (Low Dose Protocol)', spec: '128-Slice Low Dose CT', price: '₹2,499', mrp: '₹4,500', slot: 'Today, 6:30 PM', yellowTag: 'LOW DOSE' },
              { name: 'USG Whole Abdomen & Pelvis', spec: '4D Color Doppler Ultrasound', price: '₹1,199', mrp: '₹2,000', slot: 'Tomorrow, 9:30 AM', yellowTag: 'ZERO RADIATION' }
            ].map((scan, i) => (
              <div key={i} style={{ backgroundColor: '#1E293B', borderRadius: '20px', border: '1px solid #334155', padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>
                      {scan.yellowTag}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#06B6D4', fontWeight: '700' }}>{scan.spec}</span>
                  </div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#FFF', marginTop: '0.6rem' }}>{scan.name}</h3>
                  <div style={{ fontSize: '0.85rem', color: '#10B981', marginTop: '0.5rem', fontWeight: '700' }}>⏰ Confirmed Slot: {scan.slot}</div>
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '1.45rem', fontWeight: '900', color: '#FFF' }}>{scan.price}</span>
                    <span style={{ fontSize: '0.85rem', color: '#64748B', textDecoration: 'line-through', marginLeft: '0.4rem' }}>{scan.mrp}</span>
                  </div>
                  <button
                    onClick={() => onNavigateLogin('PATIENT')}
                    style={{ padding: '0.7rem 1.3rem', background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)', color: '#0F172A', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer' }}
                  >
                    Reserve Slot
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. IN-CLINIC DOCTOR APPOINTMENTS */}
      <section id="doctors" style={{ maxWidth: '1240px', margin: '0 auto 5rem', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 3rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Verified OPD Clinics
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '900', color: '#0F172A', marginTop: '0.25rem' }}>
            Book In-Clinic OPD Doctor Appointments
          </h2>
          <p style={{ color: '#64748B', fontSize: '1rem', marginTop: '0.4rem' }}>
            Confirmed walk-in appointment slots with verified specialists (No video calls). Transparent consultation fees.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {[
            { name: 'Dr. Ananya Sharma', specialty: 'General Physician & Diabetologist', qual: 'MBBS, MD (Internal Medicine)', clinic: 'MedMarg Care Clinic, Indiranagar', fee: '₹499', exp: '14 yrs exp', slot: 'Today, 4:30 PM' },
            { name: 'Dr. Rajeshwar Rao', specialty: 'Cardiologist', qual: 'MBBS, MD, DM (Cardiology)', clinic: 'Heart Wellness Institute, Koramangala', fee: '₹800', exp: '22 yrs exp', slot: 'Tomorrow, 10:00 AM' },
            { name: 'Dr. Priya Deshmukh', specialty: 'Dermatologist & Trichologist', qual: 'MBBS, DVD, MD', clinic: 'Skin & Aesthetic Clinic, HSR Layout', fee: '₹600', exp: '9 yrs exp', slot: 'Today, 5:30 PM' }
          ].map((doc, i) => (
            <div key={i} style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '1.6rem' }} className="card-interactive">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#EDE9FE', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  <Stethoscope size={28} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A' }}>{doc.name}</h3>
                  <div style={{ fontSize: '0.85rem', color: '#8B5CF6', fontWeight: '700' }}>{doc.specialty}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{doc.qual} • {doc.exp}</div>
                </div>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '12px', fontSize: '0.82rem', color: '#475569', marginBottom: '1.25rem' }}>
                📍 {doc.clinic}
                <div style={{ color: '#10B981', fontWeight: '700', marginTop: '0.2rem' }}>Next Token: {doc.slot}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Consultation Fee</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0F172A' }}>{doc.fee}</div>
                </div>
                <button
                  onClick={() => onNavigateLogin('PATIENT')}
                  style={{ padding: '0.65rem 1.25rem', backgroundColor: '#8B5CF6', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
                >
                  Book Token
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. GENERIC PHARMACY */}
      <section id="pharmacy" style={{ maxWidth: '1240px', margin: '0 auto 5rem', padding: '0 1.5rem' }}>
        <div style={{ backgroundColor: '#ECFDF5', borderRadius: '28px', padding: '3.5rem 2.5rem', border: '2px solid #A7F3D0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ maxWidth: '650px' }}>
            <span style={{ fontSize: '0.8rem', backgroundColor: '#D1FAE5', color: '#047857', padding: '0.25rem 0.65rem', borderRadius: '6px', fontWeight: '800' }}>
              PHARMACEUTICAL COST TRANSPARENCY
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '900', color: '#064E3B', marginTop: '0.4rem' }}>
              Save Up to 70% on Prescriptions with Verified Generic Substitutes
            </h2>
            <p style={{ color: '#065F46', fontSize: '1.05rem', marginTop: '0.5rem', lineHeight: 1.6 }}>
              Upload your doctor's prescription. Our certified pharmacists will map exact chemical salt compositions to WHO-GMP certified generic equivalents.
            </p>
          </div>
          <button
            onClick={() => onNavigateLogin('PATIENT')}
            style={{ padding: '1rem 2rem', backgroundColor: '#059669', color: '#FFF', border: 'none', borderRadius: '16px', fontWeight: '900', fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 8px 20px rgba(5,150,105,0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            Upload Prescription <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* DETAIL MODAL (FOR PACKAGES, PROFILES & TESTS) */}
      {activeItemModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 110, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', maxWidth: '560px', width: '100%', padding: '2rem', boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)', border: '2px solid #006B70', position: 'relative' }}>
            
            <button 
              onClick={() => setActiveItemModal(null)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#F1F5F9', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#64748B', fontWeight: 'bold' }}
            >
              ✕
            </button>

            {/* Modal Header */}
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', backgroundColor: activeItemModal.itemType === 'PACKAGE' ? '#FEF3C7' : (activeItemModal.itemType === 'PROFILE' ? '#CFFAFE' : '#E0F2F1'), color: activeItemModal.itemType === 'PACKAGE' ? '#B45309' : (activeItemModal.itemType === 'PROFILE' ? '#0891B2' : '#006B70'), padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: '900' }}>
                {activeItemModal.itemType === 'PACKAGE' ? 'MEDMARG HEALTH PACKAGE' : (activeItemModal.itemType === 'PROFILE' ? 'MEDMARG PROFILE PANEL' : 'MEDMARG CLINICAL TEST')}
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A', marginTop: '0.4rem', lineHeight: 1.25 }}>
                {activeItemModal.name}
              </h2>
              {activeItemModal.code && (
                <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.2rem', fontFamily: 'monospace' }}>
                  Test Code: <strong>{activeItemModal.code}</strong>
                </div>
              )}
            </div>

            {/* Attributes Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#F1F5F9', fontSize: '0.82rem' }}>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem', fontWeight: '700' }}>SAMPLE TYPE REQUIRED</span>
                <strong style={{ color: '#0F172A' }}>{activeItemModal.sampleType || activeItemModal.sampleTypes?.join(', ') || 'SERUM'}</strong>
              </div>
              <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#F1F5F9', fontSize: '0.82rem' }}>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem', fontWeight: '700' }}>FASTING GUIDELINE</span>
                <strong style={{ color: activeItemModal.fasting === 'YES' ? '#D97706' : '#10B981' }}>
                  {activeItemModal.fasting === 'YES' ? '8-10 Hours Fasting' : 'No Fasting Needed'}
                </strong>
              </div>
              <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#F1F5F9', fontSize: '0.82rem' }}>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem', fontWeight: '700' }}>REPORT TURNAROUND</span>
                <strong style={{ color: '#006B70' }}>{activeItemModal.tatHours || 24} Hours (Digital Sync)</strong>
              </div>
              <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#F1F5F9', fontSize: '0.82rem' }}>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem', fontWeight: '700' }}>HOME SAMPLE COLLECTION</span>
                <strong style={{ color: '#10B981' }}>100% Free at Home</strong>
              </div>
            </div>

            {/* Price Box */}
            <div style={{ padding: '1.25rem', borderRadius: '14px', backgroundColor: '#E0F2F1', border: '1.5px solid #006B70', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <strong style={{ color: '#006B70', fontSize: '1rem' }}>MedMarg Guaranteed Price</strong>
                <div style={{ fontSize: '0.78rem', color: '#004D40', marginTop: '0.2rem' }}>
                  Includes certified phlebotomist visit & digital reports
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.75rem', fontWeight: '900', color: '#006B70' }}>₹{activeItemModal.price}</span>
                {activeItemModal.mrp && (
                  <div style={{ fontSize: '0.82rem', color: '#64748B', textDecoration: 'line-through' }}>₹{activeItemModal.mrp}</div>
                )}
              </div>
            </div>

            {/* Modal CTA */}
            <button
              onClick={() => {
                setActiveItemModal(null);
                onNavigateLogin('PATIENT');
              }}
              style={{ width: '100%', padding: '0.95rem', background: 'linear-gradient(135deg, #006B70 0%, #004D40 100%)', color: '#FFF', border: 'none', borderRadius: '14px', fontWeight: '900', fontSize: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', boxShadow: '0 6px 18px rgba(0,107,112,0.35)' }}
            >
              Book Now with Free Home Collection <ArrowRight size={18} />
            </button>

          </div>
        </div>
      )}

      {/* LOCATION SELECTION MODAL */}
      {showLocationModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '2rem', maxWidth: '480px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0F172A' }}>Select Your Location</h3>
              <button onClick={() => setShowLocationModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748B' }}>✕</button>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '1.25rem' }}>
              Home collection slots and scanning centers will be filtered based on your area.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto' }} className="custom-scrollbar">
              {[
                'Tirupati, Andhra Pradesh (All Areas)',
                'Tiruchanoor Road, Tirupati',
                'Alipiri / SVIMS Area, Tirupati',
                'Renigunta Road, Tirupati',
                'Air Bypass Road, Tirupati',
                'Chandragiri, Tirupati Dist',
                'Nellore, Andhra Pradesh',
                'Vijayawada, Andhra Pradesh',
                'Visakhapatnam, Andhra Pradesh',
                'Indiranagar, Bangalore',
                'Jubilee Hills, Hyderabad',
                'Chennai Central, Tamil Nadu'
              ].map((city) => (
                <div
                  key={city}
                  onClick={() => {
                    setUserCity(city);
                    setShowLocationModal(false);
                  }}
                  style={{ padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span style={{ fontWeight: '700', color: '#0F172A' }}>{city}</span>
                  <ChevronRight size={16} color="#94A3B8" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#0F172A', color: '#94A3B8', padding: '4rem 1.5rem 2rem', borderTop: '1px solid #1E293B' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ backgroundColor: '#FFFFFF', padding: '4px 12px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', marginBottom: '0.75rem' }}>
              <img src="/logo.png" alt="MedMarg" style={{ height: '30px' }} />
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748B', maxWidth: '400px' }}>
              MedMarg Unified Healthcare Ecosystem. ISO 9001:2015 & NABL accredited diagnostic operations.
            </p>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
            © {new Date().getFullYear()} MedMarg Diagnostics & Healthcare. All Rights Reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
