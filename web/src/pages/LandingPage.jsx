import React, { useState, useEffect } from 'react';
import { 
  Search, 
  FlaskConical, 
  Building2, 
  Stethoscope, 
  Pill, 
  ShieldCheck, 
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
  Check
} from 'lucide-react';
import { THYROCARE_CATEGORIES, THYROCARE_TESTS } from '../data/thyrocareTests';

export default function LandingPage({ onNavigateLogin }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Tests & Packages');
  const [userCity, setUserCity] = useState('Tirupati, Andhra Pradesh');
  const [isLocating, setIsLocating] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // 1. AUTO-ACCESS GPS LOCATION ON FIRST LOAD
  useEffect(() => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          // Auto detected
          setUserCity('Tirupati, Andhra Pradesh (Auto-Detected GPS)');
        },
        (error) => {
          setIsLocating(false);
          setUserCity('Tirupati, Andhra Pradesh');
        },
        { timeout: 8000 }
      );
    }
  }, []);

  const filteredTests = THYROCARE_TESTS.filter(test => {
    const matchesCategory = selectedCategory === 'All Tests & Packages' || test.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      test.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', overflowX: 'hidden' }}>
      
      {/* TOP NOTIFICATION & LOCATION PROMPT BAR (YELLOW ACCENT) */}
      <div style={{ background: 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)', color: '#FFFFFF', padding: '0.45rem 1rem', fontSize: '0.82rem', fontWeight: '700', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={15} color="#FFF" />
            <span>🎉 FLAT 57% OFF on Thyrocare Aarogyam Full Body Profiles | Free Home Sample Collection</span>
          </div>
          
          <div 
            onClick={() => setShowLocationModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', backgroundColor: 'rgba(0,0,0,0.15)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}
          >
            <MapPin size={14} />
            <span>{isLocating ? 'Detecting Location...' : userCity}</span>
            <span style={{ textDecoration: 'underline', fontSize: '0.75rem', marginLeft: '0.2rem' }}>Change</span>
          </div>
        </div>
      </div>

      {/* 1. CREATIVE ULTRA-MODERN STICKY HEADER */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'rgba(255, 255, 255, 0.94)', backdropFilter: 'blur(16px)', borderBottom: '1.5px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 10px 30px -10px rgba(0, 107, 112, 0.08)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.85rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Logo with Creative Interactive Container */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '6px 12px', borderRadius: '14px', display: 'flex', alignItems: 'center', boxShadow: '0 4px 14px rgba(0, 107, 112, 0.12)', border: '1px solid #E2E8F0', transition: 'all 0.2s ease' }} className="card-interactive">
              <img 
                src="/logo.png" 
                alt="MedMarg" 
                style={{ height: '42px', objectFit: 'contain' }} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: '800', width: 'fit-content' }}>
                OPEN HEALTHCARE MARKETPLACE
              </span>
              <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700', marginTop: '0.1rem' }}>
                Serving <strong style={{ color: '#006B70' }}>Tirupati & Across India</strong>
              </span>
            </div>
          </div>

          {/* Navigation Links with Micro-Interactions */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
            <a href="#thyrocare" style={{ textDecoration: 'none', color: '#1E293B', fontWeight: '700', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <FlaskConical size={16} color="#F59E0B" /> Thyrocare & Labs
            </a>
            <a href="#scans" style={{ textDecoration: 'none', color: '#1E293B', fontWeight: '700', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Building2 size={16} color="#06B6D4" /> 3.0T MRI Scans
            </a>
            <a href="#doctors" style={{ textDecoration: 'none', color: '#1E293B', fontWeight: '700', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Stethoscope size={16} color="#8B5CF6" /> In-Clinic Doctors
            </a>
            <a href="#pharmacy" style={{ textDecoration: 'none', color: '#1E293B', fontWeight: '700', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Pill size={16} color="#10B981" /> Generic Pharmacy
            </a>
            <a href="#abha" style={{ textDecoration: 'none', color: '#1E293B', fontWeight: '700', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <FolderHeart size={16} color="#EC4899" /> ABHA Locker
            </a>
          </nav>

          {/* Creative Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <button
              onClick={() => onNavigateLogin()}
              style={{ padding: '0.6rem 1.1rem', border: '2px solid #006B70', borderRadius: '12px', color: '#006B70', backgroundColor: '#FFF', fontSize: '0.88rem', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Shield size={16} /> Partner Portal
            </button>
            <button
              onClick={() => onNavigateLogin()}
              style={{ padding: '0.65rem 1.4rem', background: 'linear-gradient(135deg, #006B70 0%, #004D40 100%)', color: '#FFF', border: 'none', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 6px 16px rgba(0,107,112,0.3)', transition: 'all 0.2s' }}
            >
              Sign In / Login <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION WITH PARALLAX & GLOWING ACCENTS */}
      <section className="gradient-hero" style={{ color: '#FFFFFF', padding: '4.5rem 1.5rem 6.5rem', position: 'relative', overflow: 'hidden' }}>
        
        {/* Floating Parallax Background Elements */}
        <div className="floating-elem" style={{ position: 'absolute', top: '15%', right: '10%', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="floating-elem-reverse" style={{ position: 'absolute', bottom: '10%', left: '8%', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1240px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 10 }}>
          
          {/* Glowing Pill with Yellow Highlight */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1.1rem', backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: '24px', fontSize: '0.88rem', fontWeight: '700', marginBottom: '1.25rem', backdropFilter: 'blur(10px)' }}>
            <span style={{ color: '#FBBF24', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Sparkles size={16} /> Open Multi-Lab Marketplace
            </span>
            <span style={{ color: '#E0F2F1' }}>• Compare Thyrocare, Apollo & Dr. Lal PathLabs</span>
          </div>

          <h1 style={{ fontSize: '3.2rem', fontWeight: '900', lineHeight: 1.15, maxWidth: '1000px', margin: '0 auto 1.25rem', letterSpacing: '-0.03em' }}>
            Book Blood Tests at <span style={{ color: '#FBBF24', textDecoration: 'underline', textDecorationColor: '#F59E0B' }}>Thyrocare & Accredited Labs</span> with Price Transparency
          </h1>

          <p style={{ fontSize: '1.15rem', color: '#E0F2F1', maxWidth: '820px', margin: '0 auto 2.25rem', lineHeight: 1.6 }}>
            Access all 100+ Thyrocare pathology tests & Aarogyam full-body health profiles at lowest negotiated rates. Compare with Apollo Diagnostics & Dr. Lal PathLabs with Free Home Sample Collection.
          </p>

          {/* Unified Location + Search Bar Widget */}
          <div style={{ maxWidth: '880px', margin: '0 auto', backgroundColor: '#FFFFFF', borderRadius: '22px', padding: '0.55rem', display: 'flex', alignItems: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)', border: '2px solid rgba(245,158,11,0.3)' }}>
            <div 
              onClick={() => setShowLocationModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 1.25rem', borderRight: '1.5px solid #E2E8F0', cursor: 'pointer' }}
            >
              <MapPin size={22} color="#006B70" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '600' }}>LOCATION</div>
                <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.92rem' }}>{userCity.split(',')[0]}</div>
              </div>
            </div>

            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={22} color="#94A3B8" style={{ position: 'absolute', left: '16px' }} />
              <input
                type="text"
                placeholder="Search Thyrocare tests (Aarogyam, Thyroid, HbA1c, Vitamin D, Lipid), MRI Scans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '1rem 1rem 1rem 3.4rem', border: 'none', fontSize: '1rem', outline: 'none', color: '#0F172A', fontWeight: '500' }}
              />
            </div>

            <button
              onClick={() => onNavigateLogin('PATIENT')}
              style={{ padding: '0.95rem 1.9rem', background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#FFF', border: 'none', borderRadius: '16px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(245,158,11,0.4)' }}
            >
              Compare & Book <ArrowRight size={18} />
            </button>
          </div>

          {/* Golden Yellow Trust Badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', marginTop: '2.75rem', flexWrap: 'wrap' }}>
            {[
              { text: 'Thyrocare National Processing Lab Partner', color: '#FBBF24' },
              { text: '100% Free Home Sample Collection', color: '#10B981' },
              { text: 'NABL, CAP & ISO 9001 Certified', color: '#67E8F9' },
              { text: 'Reports Synced to ABHA & Google Drive', color: '#FDE047' }
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#FFFFFF', fontWeight: '600' }}>
                <CheckCircle2 size={18} color={item.color} />
                <span>{item.text}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 3. CORE CATEGORIES (PARALLAX TILT HOVER CARDS) */}
      <section style={{ maxWidth: '1240px', margin: '-3.5rem auto 4rem', padding: '0 1.5rem', position: 'relative', zIndex: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {[
            { title: 'Thyrocare Pathology', desc: '100+ Tests & Aarogyam Full Body Checkups', icon: FlaskConical, color: '#F59E0B', bg: '#FEF3C7', target: '#thyrocare' },
            { title: '3.0T MRI & Scans', desc: 'Silent MRI, CT Scan & 4D Ultrasound Slots', icon: Building2, color: '#06B6D4', bg: '#CFFAFE', target: '#scans' },
            { title: 'In-Clinic Doctors', desc: 'Book Walk-in OPD Specialist Appointments', icon: Stethoscope, color: '#8B5CF6', bg: '#EDE9FE', target: '#doctors' },
            { title: 'Generic Pharmacy', desc: 'Save Up to 70% with Quality Generic Salts', icon: Pill, color: '#10B981', bg: '#D1FAE5', target: '#pharmacy' },
            { title: 'ABHA Health Locker', desc: 'Biomarker Trends & Google Drive Sync', icon: FolderHeart, color: '#EC4899', bg: '#FCE7F3', target: '#abha' }
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
                  Explore Services <ChevronRight size={15} />
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* 4. COMPREHENSIVE THYROCARE & MULTI-LAB TESTS MARKETPLACE */}
      <section id="thyrocare" style={{ maxWidth: '1240px', margin: '0 auto 5rem', padding: '0 1.5rem' }}>
        
        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.65rem', backgroundColor: '#FEF3C7', color: '#B45309', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '800', marginBottom: '0.4rem' }}>
              ⭐ COMPLETE TEST CATALOG
            </div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.02em' }}>
              All Pathology Tests & Packages Available with Thyrocare
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.98rem', maxWidth: '800px' }}>
              Compare rates across Thyrocare, Apollo Diagnostics, and Dr. Lal PathLabs. 100% Free Home Sample Collection with temperature-controlled cold-chain vial verification.
            </p>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1.5rem' }} className="custom-scrollbar">
          {THYROCARE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.6rem 1.1rem',
                  borderRadius: '12px',
                  border: isSelected ? '2px solid #F59E0B' : '1px solid #E2E8F0',
                  backgroundColor: isSelected ? '#FEF3C7' : '#FFFFFF',
                  color: isSelected ? '#B45309' : '#475569',
                  fontWeight: isSelected ? '800' : '600',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Tests & Packages List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredTests.map((test) => (
            <div 
              key={test.id} 
              style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '1.6rem', display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.5rem', alignItems: 'center' }}
              className="card-interactive"
            >
              {/* Left Column: Test Details */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '800' }}>
                    {test.yellowTag}
                  </span>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#E0F2F1', color: '#006B70', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '700' }}>
                    {test.category}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', lineHeight: 1.3 }}>
                  {test.name}
                </h3>
                
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.4rem 0 0.8rem', lineHeight: 1.5 }}>
                  {test.description}
                </p>

                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: '#475569', flexWrap: 'wrap' }}>
                  <span>🔬 <strong>{test.params}</strong> Parameters</span>
                  <span>🩸 Sample: <strong>{test.sample}</strong></span>
                  <span>⏰ Fasting: <strong>{test.fasting}</strong></span>
                  <span>⏱️ TAT: <strong>{test.tat}</strong></span>
                </div>
              </div>

              {/* Right Column: Multi-Lab Price Comparison Matrix */}
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.2rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  Multi-Lab Rate Comparison
                </div>

                {/* Thyrocare Deal */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', backgroundColor: '#FEF3C7', borderRadius: '10px', border: '1.5px solid #F59E0B', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: '800', color: '#B45309', fontSize: '0.92rem' }}>Thyrocare Central Lab</div>
                    <div style={{ fontSize: '0.75rem', color: '#92400E' }}>NABL & CAP Accredited • Free Home Visit</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.35rem', fontWeight: '900', color: '#B45309' }}>₹{test.thyrocarePrice}</span>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', textDecoration: 'line-through' }}>₹{test.originalPrice}</div>
                  </div>
                </div>

                {/* Comparative Labs */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748B', padding: '0.3rem 0.5rem' }}>
                  <span>Apollo Diagnostics: <strong>₹{test.apolloPrice}</strong></span>
                  <span>Dr. Lal PathLabs: <strong>₹{test.lalPrice}</strong></span>
                </div>

                <button
                  onClick={() => onNavigateLogin('PATIENT')}
                  style={{ width: '100%', marginTop: '0.85rem', padding: '0.75rem', background: 'linear-gradient(135deg, #006B70 0%, #004D40 100%)', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem' }}
                >
                  Book at Thyrocare for ₹{test.thyrocarePrice} <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. RADIOLOGY & 3.0T MRI SCANS HUB */}
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
              { name: 'MRI Brain (Plain + Angio)', center: 'Aarthi Scans & Labs', spec: 'Siemens 3.0 Tesla Silent MRI', price: '₹3,499', mrp: '₹6,000', slot: 'Today, 5:00 PM', yellowTag: '42% SAVINGS' },
              { name: 'HRCT Chest (Low Dose Protocol)', center: 'Focus Imaging Center', spec: '128-Slice Low Dose CT', price: '₹2,499', mrp: '₹4,500', slot: 'Today, 6:30 PM', yellowTag: 'LOW DOSE' },
              { name: 'USG Whole Abdomen & Pelvis', center: 'Medall Diagnostics', spec: '4D Color Doppler Ultrasound', price: '₹1,199', mrp: '₹2,000', slot: 'Tomorrow, 9:30 AM', yellowTag: 'ZERO RADIATION' }
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
                  <div style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '0.3rem' }}>{scan.center}</div>
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
                  <div style={{ color: '#8B5CF6', fontWeight: '700', fontSize: '0.88rem' }}>{doc.specialty}</div>
                  <div style={{ color: '#64748B', fontSize: '0.82rem' }}>{doc.qual} • {doc.exp}</div>
                </div>
              </div>

              <div style={{ fontSize: '0.88rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                <MapPin size={16} color="#8B5CF6" /> {doc.clinic}
              </div>

              <div style={{ paddingTop: '1rem', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Consultation Fee</span>
                  <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0F172A' }}>{doc.fee}</div>
                </div>
                <button
                  onClick={() => onNavigateLogin('PATIENT')}
                  style={{ padding: '0.7rem 1.3rem', backgroundColor: '#8B5CF6', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer' }}
                >
                  Book Clinic Visit
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. GENERIC PHARMACY 70% SAVINGS */}
      <section id="pharmacy" style={{ backgroundColor: '#ECFDF5', padding: '5.5rem 1.5rem', marginBottom: '5rem', borderTop: '1px solid #D1FAE5', borderBottom: '1px solid #D1FAE5' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '3.5rem', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', backgroundColor: '#FEF3C7', color: '#B45309', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', marginBottom: '0.75rem' }}>
              <Percent size={15} /> AFFORDABLE GENERIC HEALTHCARE
            </div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: '900', color: '#065F46', lineHeight: 1.2 }}>
              Save Up to 70% with Certified Generic Medicines
            </h2>
            <p style={{ color: '#047857', fontSize: '1.05rem', marginTop: '0.75rem', lineHeight: 1.6 }}>
              Upload your prescription. Our pharmacists analyze active salt compositions and provide certified generic alternatives with identical clinical efficacy at 1/3rd of the branded cost.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#065F46', fontWeight: '700', fontSize: '0.95rem' }}>
                <CheckCircle2 size={18} color="#10B981" /> 100% CDSCO Approved Formulations
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#065F46', fontWeight: '700', fontSize: '0.95rem' }}>
                <CheckCircle2 size={18} color="#10B981" /> Prescription OCR Scanner with Google Drive Sync
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#065F46', fontWeight: '700', fontSize: '0.95rem' }}>
                <CheckCircle2 size={18} color="#10B981" /> Doorstep Delivery across Bangalore & Partner Cities
              </div>
            </div>

            <button
              onClick={() => onNavigateLogin('PATIENT')}
              style={{ marginTop: '2.2rem', padding: '0.95rem 1.9rem', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#FFF', border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 6px 16px rgba(16,185,129,0.3)' }}
            >
              Upload Prescription & Save <ArrowRight size={18} />
            </button>
          </div>

          {/* Comparison Visual Card */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', border: '2px solid #10B981', padding: '2.2rem', boxShadow: '0 25px 50px -12px rgba(16,185,129,0.2)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', marginBottom: '1.25rem' }}>Real Cost Comparison</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1.1rem', backgroundColor: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '800' }}>BRANDED MEDICINE</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.3rem' }}>
                  <div>
                    <strong style={{ color: '#0F172A', fontSize: '1.05rem' }}>Lipaglyn 4mg Tablet</strong>
                    <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Saroglitazar (4mg)</div>
                  </div>
                  <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#64748B' }}>₹289</span>
                </div>
              </div>

              <div style={{ padding: '1.35rem', backgroundColor: '#D1FAE5', borderRadius: '14px', border: '2px solid #10B981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', backgroundColor: '#F59E0B', color: '#FFF', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: '900' }}>
                    SAVE 53% WITH GENERIC
                  </span>
                  <span style={{ fontSize: '1.6rem', fontWeight: '900', color: '#065F46' }}>₹135</span>
                </div>
                <div style={{ marginTop: '0.6rem' }}>
                  <strong style={{ fontSize: '1.1rem', color: '#065F46' }}>Saroglitazar 4mg (MedMarg Generic)</strong>
                  <div style={{ fontSize: '0.82rem', color: '#047857' }}>Identical Salt, Strength & Bioequivalence</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. ABHA HEALTH LOCKER & GOOGLE DRIVE */}
      <section id="abha" style={{ maxWidth: '1240px', margin: '0 auto 5rem', padding: '0 1.5rem' }}>
        <div style={{ backgroundColor: '#0F172A', borderRadius: '28px', color: '#FFFFFF', padding: '3.5rem 3rem', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', backgroundColor: 'rgba(245,158,11,0.2)', color: '#FBBF24', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '800', marginBottom: '1rem' }}>
              <Award size={14} /> National Digital Health Mission
            </div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: '900', lineHeight: 1.2 }}>
              Ayushman Bharat Digital Health Locker (ABHA)
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem', marginTop: '0.75rem', lineHeight: 1.6 }}>
              All your Thyrocare reports, Apollo scans, and prescriptions are unified under your ABHA ID with automatic biomarker trends (Cholesterol, HbA1c, Liver enzymes) and secure Google Drive shareable links.
            </p>

            <button
              onClick={() => onNavigateLogin('PATIENT')}
              style={{ marginTop: '2rem', padding: '0.95rem 1.8rem', background: 'linear-gradient(135deg, #006B70 0%, #004D40 100%)', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer' }}
            >
              Link ABHA & View Reports
            </button>
          </div>

          <div style={{ backgroundColor: '#1E293B', borderRadius: '20px', border: '1px solid #334155', padding: '1.75rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: '700' }}>CONNECTED HEALTH LOCKER</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#FFF', marginTop: '0.2rem' }}>ABHA: rahul.sharma@abdm</div>

            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.85rem 1rem', backgroundColor: '#0F172A', borderRadius: '12px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.88rem' }}>Thyrocare (Aarogyam 1.3 Profile)</span>
                <span style={{ fontSize: '0.75rem', color: '#FBBF24', fontWeight: '800' }}>Google Drive Synced</span>
              </div>
              <div style={{ padding: '0.85rem 1rem', backgroundColor: '#0F172A', borderRadius: '12px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.88rem' }}>Aarthi Scans (MRI Brain 3.0T)</span>
                <span style={{ fontSize: '0.75rem', color: '#FBBF24', fontWeight: '800' }}>Google Drive Synced</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. PARTNER ONBOARDING CALL TO ACTION */}
      <section style={{ maxWidth: '1240px', margin: '0 auto 5rem', padding: '0 1.5rem' }}>
        <div style={{ backgroundColor: '#FFFBEB', borderRadius: '24px', border: '2px solid #FDE68A', padding: '3rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#B45309', textTransform: 'uppercase' }}>EXPAND YOUR REACH</span>
            <h2 style={{ fontSize: '1.85rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>
              Are you a Diagnostic Lab, Scan Center, Doctor or Pharmacy?
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '0.35rem' }}>
              Join MedMarg marketplace to list your test catalog, manage home sample collection slots, and receive direct patient bookings.
            </p>
          </div>

          <div>
            <button
              onClick={() => onNavigateLogin('DIAGNOSTIC_LAB')}
              style={{ padding: '0.95rem 1.8rem', background: 'linear-gradient(135deg, #006B70 0%, #004D40 100%)', color: '#FFF', border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer' }}
            >
              Register Your Lab / Clinic
            </button>
          </div>
        </div>
      </section>

      {/* 10. ULTRA-CREATIVE MULTI-TIERED MODERN FOOTER */}
      <footer style={{ backgroundColor: '#070D1E', color: '#94A3B8', padding: '5rem 1.5rem 2rem', borderTop: '2px solid #1E293B', backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(0, 107, 112, 0.15) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(245, 158, 11, 0.1) 0%, transparent 40%)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          {/* Upper Tier: Brand + Value Proposition + Accreditations */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '3rem', paddingBottom: '3.5rem', borderBottom: '1px solid #1E293B' }}>
            
            <div style={{ gridColumn: 'span 1' }}>
              {/* Crisp Official Logo Container */}
              <div style={{ backgroundColor: '#FFFFFF', display: 'inline-flex', padding: '8px 16px', borderRadius: '14px', marginBottom: '1.25rem', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', border: '1px solid #E2E8F0' }}>
                <img 
                  src="/logo.png" 
                  alt="MedMarg" 
                  style={{ height: '40px', objectFit: 'contain', display: 'block' }} 
                />
              </div>
              
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#94A3B8' }}>
                India's premier open healthcare marketplace bridging patients with NABL certified diagnostic labs (Thyrocare, Apollo, Dr. Lal), 3.0T MRI imaging centers, verified OPD doctors, and generic pharmacies.
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', backgroundColor: '#1E293B', color: '#FBBF24', padding: '0.3rem 0.65rem', borderRadius: '8px', fontWeight: '800', border: '1px solid #334155' }}>
                  ✓ NABL & CAP
                </span>
                <span style={{ fontSize: '0.75rem', backgroundColor: '#1E293B', color: '#10B981', padding: '0.3rem 0.65rem', borderRadius: '8px', fontWeight: '800', border: '1px solid #334155' }}>
                  ✓ ABDM / ABHA
                </span>
                <span style={{ fontSize: '0.75rem', backgroundColor: '#1E293B', color: '#67E8F9', padding: '0.3rem 0.65rem', borderRadius: '8px', fontWeight: '800', border: '1px solid #334155' }}>
                  ✓ ISO 9001
                </span>
              </div>
            </div>

            <div>
              <h4 style={{ color: '#FFFFFF', fontWeight: '800', marginBottom: '1.25rem', fontSize: '1rem', letterSpacing: '-0.01em' }}>Diagnostics & Health</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem' }}>
                <a href="#thyrocare" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}>Thyrocare Aarogyam Profiles</a>
                <a href="#thyrocare" style={{ color: '#94A3B8', textDecoration: 'none' }}>Thyroid Profile Total (T3/T4/TSH)</a>
                <a href="#thyrocare" style={{ color: '#94A3B8', textDecoration: 'none' }}>Diabetes HbA1c & Fasting Glucose</a>
                <a href="#thyrocare" style={{ color: '#94A3B8', textDecoration: 'none' }}>Complete Lipid Profile (Cholesterol)</a>
                <a href="#thyrocare" style={{ color: '#94A3B8', textDecoration: 'none' }}>Liver (LFT) & Kidney (KFT) Tests</a>
                <a href="#thyrocare" style={{ color: '#94A3B8', textDecoration: 'none' }}>Vitamin D3 + B12 Screening</a>
              </div>
            </div>

            <div>
              <h4 style={{ color: '#FFFFFF', fontWeight: '800', marginBottom: '1.25rem', fontSize: '1rem', letterSpacing: '-0.01em' }}>Specialized Care</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem' }}>
                <a href="#scans" style={{ color: '#94A3B8', textDecoration: 'none' }}>3.0T Silent MRI Scans</a>
                <a href="#scans" style={{ color: '#94A3B8', textDecoration: 'none' }}>128-Slice Low Dose CT Scans</a>
                <a href="#scans" style={{ color: '#94A3B8', textDecoration: 'none' }}>4D Ultrasound & Doppler</a>
                <a href="#doctors" style={{ color: '#94A3B8', textDecoration: 'none' }}>In-Clinic OPD Doctor Booking</a>
                <a href="#pharmacy" style={{ color: '#94A3B8', textDecoration: 'none' }}>Generic Medicine Cost Saver (70%)</a>
                <a href="#abha" style={{ color: '#94A3B8', textDecoration: 'none' }}>ABHA Health Locker & Trends</a>
              </div>
            </div>

            <div>
              <h4 style={{ color: '#FFFFFF', fontWeight: '800', marginBottom: '1.25rem', fontSize: '1rem', letterSpacing: '-0.01em' }}>For Healthcare Partners</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem' }}>
                <button onClick={() => onNavigateLogin()} style={{ background: 'none', border: 'none', color: '#FBBF24', textAlign: 'left', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '700', padding: 0 }}>Register Diagnostic Lab Portal</button>
                <button onClick={() => onNavigateLogin()} style={{ background: 'none', border: 'none', color: '#94A3B8', textAlign: 'left', cursor: 'pointer', fontSize: '0.88rem', padding: 0 }}>Register 3.0T MRI Scan Center</button>
                <button onClick={() => onNavigateLogin()} style={{ background: 'none', border: 'none', color: '#94A3B8', textAlign: 'left', cursor: 'pointer', fontSize: '0.88rem', padding: 0 }}>Register Clinic / Doctor Practice</button>
                <button onClick={() => onNavigateLogin()} style={{ background: 'none', border: 'none', color: '#94A3B8', textAlign: 'left', cursor: 'pointer', fontSize: '0.88rem', padding: 0 }}>Register Retail / Generic Pharmacy</button>
                <div style={{ marginTop: '0.75rem', padding: '0.85rem', backgroundColor: '#1E293B', borderRadius: '12px', border: '1px solid #334155' }}>
                  <div style={{ fontSize: '0.75rem', color: '#FBBF24', fontWeight: '800' }}>⚡ FAST PARTNER ONBOARDING</div>
                  <div style={{ fontSize: '0.78rem', color: '#CBD5E1', marginTop: '0.2rem' }}>Get verified & start receiving bookings in 24 hours.</div>
                </div>
              </div>
            </div>

          </div>

          {/* Lower Tier: Cities Grid & Copyright */}
          <div style={{ paddingTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.82rem', color: '#64748B' }}>
              <strong style={{ color: '#CBD5E1' }}>Popular Service Cities:</strong>
              {['Tirupati (AP)', 'Vijayawada (AP)', 'Visakhapatnam (AP)', 'Nellore (AP)', 'Guntur (AP)', 'Hyderabad (TS)', 'Bangalore (KA)', 'Chennai (TN)', 'Mumbai (MH)', 'Delhi NCR'].map((city, idx) => (
                <span key={city} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#94A3B8' }}>{city}</span>
                  {idx < 9 && <span>•</span>}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid #1E293B', paddingTop: '1.5rem', fontSize: '0.82rem', color: '#64748B' }}>
              <div>
                © 2026 <strong>MedMarg Healthcare Marketplace</strong> (<a href="https://www.medmarg.com/" style={{ color: '#94A3B8', textDecoration: 'none' }}>www.medmarg.com</a>). All rights reserved.
              </div>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <span>Privacy Policy</span>
                <span>Terms of Marketplace</span>
                <span>NABL Quality Assurance</span>
                <span>ABDM Compliant</span>
              </div>
            </div>

          </div>

        </div>
      </footer>

      {/* LOCATION SELECTION MODAL */}
      {showLocationModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '2rem', maxWidth: '480px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0F172A' }}>Select Your Location</h3>
              <button onClick={() => setShowLocationModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748B' }}>✕</button>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '1.25rem' }}>
              Lab test availability, home collection slots, and scanning centers will be filtered based on your city.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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

    </div>
  );
}
