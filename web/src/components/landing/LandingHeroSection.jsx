import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  Thermometer, 
  X 
} from 'lucide-react';

export default function LandingHeroSection({
  onNavigateLogin,
  searchResults = [],
  searchQuery = '',
  setSearchQuery = () => {},
  onSelectSearchItem = () => {}
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);

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

  const [hoveredPill, setHoveredPill] = useState(null);
  const [isCardHovered, setIsCardHovered] = useState(false);

  return (
    <section style={{ 
      backgroundColor: '#071A17', 
      backgroundImage: 'linear-gradient(135deg, rgba(7, 26, 23, 0.90) 0%, rgba(10, 38, 34, 0.88) 100%), url("/hero_medical_bg.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      padding: '4rem 1.5rem 6.5rem', 
      position: 'relative', 
      zIndex: 100, 
      overflow: 'visible',
      boxShadow: 'inset 0 -20px 40px rgba(0,0,0,0.4)'
    }}>
      {/* Decorative Ambient Radial Glow */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0, 191, 165, 0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
        filter: 'blur(40px)'
      }} />

      <div style={{ maxWidth: '1320px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: '3.5rem', alignItems: 'start', position: 'relative', zIndex: 101 }}>
        
        {/* Left Column: Carousel & Vibrant Search */}
        <div style={{ position: 'relative', zIndex: 102 }}>
          {/* Banner Slides Carousel with CSS Grid Stack:
              By stacking all slides in the same grid cell (grid-area: 1/1), 
              the container naturally sizes to accommodate any title without cutting off text, 
              and switching slides NEVER causes any height jump or layout shift! */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridTemplateRows: '1fr', marginBottom: '1.25rem' }}>
            {heroBanners.map((banner, index) => {
              const isActive = index === currentSlide;
              return (
                <div 
                  key={banner.id} 
                  style={{ 
                    gridArea: '1 / 1', 
                    opacity: isActive ? 1 : 0, 
                    pointerEvents: isActive ? 'auto' : 'none',
                    transform: isActive ? 'translateY(0)' : 'translateY(6px)',
                    transition: 'opacity 0.35s ease, transform 0.35s ease',
                    visibility: isActive ? 'visible' : 'hidden'
                  }}
                >
                  <div style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.45rem', 
                    padding: '0.4rem 0.95rem', 
                    backgroundColor: 'rgba(56, 189, 248, 0.18)', 
                    color: banner.accentColor, 
                    borderRadius: '20px', 
                    fontSize: '0.82rem', 
                    fontWeight: '900', 
                    marginBottom: '1rem', 
                    border: `1.5px solid ${banner.accentColor}50`,
                    backdropFilter: 'blur(8px)',
                    boxShadow: `0 4px 16px ${banner.accentColor}25`
                  }}>
                    <Sparkles size={15} /> {banner.tag}
                  </div>

                  <h1 style={{ 
                    fontSize: '2.75rem', 
                    fontWeight: '900', 
                    color: '#FFFFFF', 
                    lineHeight: '1.18', 
                    letterSpacing: '-0.02em', 
                    marginBottom: '0.85rem',
                    textShadow: '0 4px 20px rgba(0,0,0,0.5)'
                  }}>
                    {banner.title}
                  </h1>

                  <p style={{ 
                    color: '#94A3B8', 
                    fontSize: '1.05rem', 
                    lineHeight: '1.55', 
                    marginBottom: '1.4rem', 
                    maxWidth: '620px'
                  }}>
                    {banner.subtitle}
                  </p>

                  {/* Price & Savings Pill */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.15rem' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.65rem' }}>
                      <span style={{ fontSize: '2.4rem', fontWeight: '900', color: '#FFFFFF', letterSpacing: '-0.02em' }}>{banner.price}</span>
                      <span style={{ fontSize: '1.15rem', color: '#64748B', textDecoration: 'line-through', fontWeight: '700' }}>{banner.mrp}</span>
                    </div>
                    <div style={{ 
                      padding: '0.45rem 0.95rem', 
                      backgroundColor: '#10B981', 
                      color: '#FFF', 
                      borderRadius: '12px', 
                      fontSize: '0.86rem', 
                      fontWeight: '900',
                      boxShadow: '0 4px 14px rgba(16,185,129,0.35)'
                    }}>
                      {banner.savings}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Slider Navigation Dots */}
          <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '2.25rem' }}>
            {heroBanners.map((banner, index) => (
              <button
                key={banner.id}
                onClick={() => setCurrentSlide(index)}
                style={{ 
                  width: index === currentSlide ? '36px' : '10px', 
                  height: '10px', 
                  borderRadius: '5px', 
                  border: 'none', 
                  backgroundColor: index === currentSlide ? '#00A896' : '#334155', 
                  cursor: 'pointer', 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: index === currentSlide ? '0 0 12px #00A896' : 'none'
                }}
              />
            ))}
          </div>

          {/* 🌟 VIBRANT LIVE AUTO-COMPLETE SEARCH BAR */}
          <div ref={searchContainerRef} style={{ position: 'relative', maxWidth: '640px', zIndex: 103 }}>
            <div style={{ 
              backgroundColor: '#FFFFFF', 
              padding: '0.65rem 0.85rem', 
              borderRadius: '22px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 3.5px #005F60', 
              border: 'none',
              position: 'relative',
              zIndex: 104,
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
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
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1.02rem', fontWeight: '700', color: '#0F172A', backgroundColor: 'transparent' }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}>
                  <X size={18} />
                </button>
              )}
              <button 
                onClick={onNavigateLogin} 
                style={{ 
                  padding: '0.85rem 1.6rem', 
                  backgroundColor: '#005F60', 
                  color: '#FFF', 
                  border: 'none', 
                  borderRadius: '16px', 
                  fontSize: '0.92rem', 
                  fontWeight: '900', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.45rem', 
                  boxShadow: '0 6px 20px rgba(0,95,96,0.4)', 
                  whiteSpace: 'nowrap',
                  transition: 'transform 0.15s ease, background-color 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#007A7C';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#005F60';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Search & Book <ArrowRight size={16} />
              </button>
            </div>

            {/* Auto-Complete Dropdown */}
            {isSearchFocused && searchQuery.trim() && (
              <div style={{ 
                position: 'absolute', 
                top: 'calc(100% + 12px)', 
                left: 0, 
                right: 0, 
                backgroundColor: '#FFFFFF', 
                borderRadius: '22px', 
                border: '2.5px solid #005F60', 
                boxShadow: '0 30px 80px rgba(0,0,0,0.6)', 
                zIndex: 99999, 
                overflow: 'hidden',
                padding: '1.15rem'
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
                          onSelectSearchItem(item);
                          setIsSearchFocused(false);
                        }}
                        style={{ padding: '0.85rem 1rem', borderRadius: '14px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.15s ease' }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = '#E0F2F1';
                          e.currentTarget.style.borderColor = '#005F60';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = '#F8FAFC';
                          e.currentTarget.style.borderColor = '#E2E8F0';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
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

          {/* Quick Category Chips with Hover Zoom */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: '800' }}>POPULAR:</span>
            {['His Wellness', 'Her Wellness', 'Family Screening', 'Senior Citizen', 'Diabetes Check', 'Cardiac Risk'].map(chip => (
              <button
                key={chip}
                onClick={() => { setSearchQuery(chip); window.location.hash = '#catalog'; }}
                onMouseEnter={() => setHoveredPill(chip)}
                onMouseLeave={() => setHoveredPill(null)}
                style={{ 
                  padding: '0.4rem 0.85rem', 
                  backgroundColor: hoveredPill === chip ? '#005F60' : 'rgba(255, 255, 255, 0.08)', 
                  color: hoveredPill === chip ? '#FFFFFF' : '#E2E8F0', 
                  border: hoveredPill === chip ? '1px solid #14B8A6' : '1px solid rgba(255, 255, 255, 0.15)', 
                  borderRadius: '20px', 
                  fontSize: '0.8rem', 
                  fontWeight: '700', 
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: hoveredPill === chip ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: hoveredPill === chip ? '0 4px 12px rgba(0,95,96,0.4)' : 'none',
                  backdropFilter: 'blur(4px)'
                }}
              >
                {chip}
              </button>
            ))}
          </div>

        </div>

        {/* Right Column: Live Delivery-Style Tracker Widget with Interactive Card Hover Effect */}
        <div 
          onMouseEnter={() => setIsCardHovered(true)}
          onMouseLeave={() => setIsCardHovered(false)}
          style={{ 
            backgroundColor: 'rgba(30, 41, 59, 0.85)', 
            backdropFilter: 'blur(16px)',
            borderRadius: '26px', 
            border: isCardHovered ? '1.5px solid #14B8A6' : '1px solid rgba(255, 255, 255, 0.12)', 
            padding: '2rem', 
            boxShadow: isCardHovered 
              ? '0 30px 70px -10px rgba(0, 168, 150, 0.35), 0 0 25px rgba(20, 184, 166, 0.25)' 
              : '0 25px 60px -12px rgba(0,0,0,0.6)',
            transform: isCardHovered ? 'translateY(-4px)' : 'translateY(0)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <span style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                backgroundColor: '#10B981', 
                display: 'inline-block',
                boxShadow: '0 0 10px #10B981'
              }}></span>
              <span style={{ color: '#E2E8F0', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.05em' }}>REAL-TIME LOGISTICS RADAR TRACKER</span>
            </div>
            <span style={{ color: '#F59E0B', fontSize: '0.8rem', fontWeight: '900', backgroundColor: 'rgba(245, 158, 11, 0.15)', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
              ETA: 12 MINS
            </span>
          </div>

          {/* Phlebotomist HUD Card */}
          <div style={{ 
            backgroundColor: 'rgba(15, 23, 42, 0.85)', 
            padding: '1.25rem', 
            borderRadius: '18px', 
            border: '1px solid rgba(255,255,255,0.08)', 
            marginBottom: '1.25rem',
            transition: 'border-color 0.2s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: '#005F60', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.15rem', boxShadow: '0 4px 12px rgba(0,95,96,0.3)' }}>
                  RK
                </div>
                <div>
                  <div style={{ color: '#FFF', fontWeight: '900', fontSize: '0.98rem' }}>Ramesh Kumar (Phlebo AG-01)</div>
                  <div style={{ color: '#94A3B8', fontSize: '0.78rem', marginTop: '0.1rem' }}>4.9 ★ • Hero Electric Vehicle</div>
                </div>
              </div>
              <div style={{ padding: '0.35rem 0.7rem', backgroundColor: '#0284C7', color: '#FFF', borderRadius: '10px', fontSize: '0.78rem', fontWeight: '800', boxShadow: '0 2px 8px rgba(2,132,199,0.3)' }}>
                28 km/h
              </div>
            </div>

            {/* OTP Security Box */}
            <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.75)', padding: '0.75rem 1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: '700' }}>Doorstep Handover OTP:</span>
              <span style={{ color: '#10B981', fontSize: '1.15rem', fontWeight: '900', letterSpacing: '0.2em' }}>OTP: 4892</span>
            </div>
          </div>

          {/* IoT Cold-Chain Telemetry Box */}
          <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', padding: '1rem 1.25rem', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Thermometer size={22} color="#38BDF8" />
              <div>
                <div style={{ color: '#38BDF8', fontSize: '0.85rem', fontWeight: '800' }}>IoT Cold-Chain Telemetry</div>
                <div style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Sample Carry Bag Temp (Optimal 2°C - 8°C)</div>
              </div>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }}></span>
              4.2°C Active
            </div>
          </div>
        </div>

      </div>

      {/* 🌊 Organic Curved Bottom Wave Divider */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        overflow: 'hidden',
        lineHeight: 0,
        transform: 'translateY(1px)',
        zIndex: 105,
        pointerEvents: 'none'
      }}>
        <svg 
          viewBox="0 0 1440 96" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{ width: '100%', height: '56px', display: 'block' }}
        >
          <path 
            d="M0,32 C240,85 480,96 720,70 C960,44 1200,68 1440,32 L1440,96 L0,96 Z" 
            fill="#FFFFFF"
          />
        </svg>
      </div>
    </section>
  );
}
