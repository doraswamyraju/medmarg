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

  return (
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

          {/* 🌟 VIBRANT LIVE AUTO-COMPLETE SEARCH BAR */}
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

            {/* Auto-Complete Dropdown */}
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
                          onSelectSearchItem(item);
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
  );
}
