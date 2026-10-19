import React, { useState } from 'react';
import { 
  Percent, 
  Droplet, 
  Clock, 
  Award, 
  Search 
} from 'lucide-react';

export default function LandingCatalogSection({
  catalog = { tests: [], profiles: [], packages: [] },
  onNavigateLogin,
  onSelectItemModal = () => {}
}) {
  const [catalogTab, setCatalogTab] = useState('ALL'); // 'ALL' | 'HIS' | 'HER' | 'ORGAN' | 'DIABETES'
  const [catalogViewType, setCatalogViewType] = useState('PACKAGES'); // 'PACKAGES' | 'PROFILES' | 'TESTS'
  const [catalogSectionSearch, setCatalogSectionSearch] = useState('');
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [hoveredTabId, setHoveredTabId] = useState(null);

  const allTests = catalog.tests || [];
  const allPackages = catalog.packages || [];
  const allProfiles = catalog.profiles || [];

  const displayedPackages = allPackages.filter(pkg => {
    if (catalogTab === 'HIS') return pkg.category?.includes('Men') || pkg.name?.includes('His') || pkg.name?.includes('Men');
    if (catalogTab === 'HER') return pkg.category?.includes('Women') || pkg.name?.includes('Her') || pkg.name?.includes('Women');
    if (catalogTab === 'ORGAN') return pkg.category?.includes('Organ') || pkg.name?.includes('Liver') || pkg.name?.includes('Kidney');
    if (catalogTab === 'DIABETES') return pkg.category?.includes('Diabetes') || pkg.name?.includes('Sugar') || pkg.name?.includes('Glucose');
    return true;
  });

  return (
    <section id="catalog" style={{ padding: '3.5rem 1.5rem 5.5rem', backgroundColor: '#FFFFFF', position: 'relative' }}>
      <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.95rem',
            borderRadius: '20px',
            backgroundColor: '#E0F2F1',
            color: '#005F60',
            fontSize: '0.82rem',
            fontWeight: '900',
            letterSpacing: '0.06em',
            marginBottom: '0.65rem'
          }}>
            DIAGNOSTIC NETWORK
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Master Diagnostic Tests & Curated Health Packages
          </h2>
          <p style={{ color: '#64748B', fontSize: '1.02rem', marginTop: '0.6rem', maxWidth: '680px', margin: '0.6rem auto 0', lineHeight: 1.5 }}>
            Browse {allTests.length}+ tests with 100% Free Home Collection, digital NABL reports on WhatsApp, and smart package savings.
          </p>
        </div>

        {/* Smart Package Upgrade Banner with Hover Glow */}
        <div style={{ 
          background: 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)', 
          border: '2px solid #A7F3D0', 
          borderRadius: '22px', 
          padding: '1.5rem 2.2rem', 
          marginBottom: '2.5rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '1.25rem',
          boxShadow: '0 10px 30px -10px rgba(16, 185, 129, 0.15)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', backgroundColor: '#10B981', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 6px 16px rgba(16,185,129,0.3)' }}>
              <Percent size={28} />
            </div>
            <div>
              <div style={{ fontSize: '1.18rem', fontWeight: '900', color: '#065F46' }}>Smart Upgrade Suggestion: Save ₹2,001 (57% OFF)</div>
              <div style={{ fontSize: '0.9rem', color: '#047857', marginTop: '0.2rem', fontWeight: '500' }}>
                Booking single tests? Upgrade to the <strong>MedMarg Master Full Body Profile (87 Parameters)</strong> for just ₹1,499.
              </div>
            </div>
          </div>
          <button 
            onClick={onNavigateLogin} 
            style={{ 
              padding: '0.85rem 1.75rem', 
              backgroundColor: '#047857', 
              color: '#FFF', 
              border: 'none', 
              borderRadius: '14px', 
              fontSize: '0.92rem', 
              fontWeight: '900', 
              cursor: 'pointer', 
              whiteSpace: 'nowrap',
              boxShadow: '0 6px 18px rgba(4,120,87,0.3)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#065F46';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(4,120,87,0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#047857';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(4,120,87,0.3)';
            }}
          >
            Upgrade & Book Package →
          </button>
        </div>

        {/* Master View Switcher (Packages / Profiles / Single Tests) */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
          {[
            { id: 'PACKAGES', label: `📦 Health Packages (${allPackages.length})`, count: allPackages.length },
            { id: 'PROFILES', label: `🫀 Organ Profiles & Panels (${allProfiles.length})`, count: allProfiles.length },
            { id: 'TESTS', label: `🧪 Single Diagnostic Tests (${allTests.length}+)`, count: allTests.length }
          ].map(type => {
            const isSelected = catalogViewType === type.id;
            const isHovered = hoveredTabId === type.id;
            return (
              <button
                key={type.id}
                onClick={() => {
                  setCatalogViewType(type.id);
                  setCatalogSectionSearch('');
                }}
                onMouseEnter={() => setHoveredTabId(type.id)}
                onMouseLeave={() => setHoveredTabId(null)}
                style={{
                  padding: '0.85rem 1.85rem',
                  borderRadius: '16px',
                  border: isSelected ? '2px solid #005F60' : isHovered ? '2px solid #14B8A6' : '1px solid #E2E8F0',
                  backgroundColor: isSelected ? '#005F60' : isHovered ? '#F0FDFA' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : isHovered ? '#005F60' : '#334155',
                  fontSize: '0.96rem',
                  fontWeight: '900',
                  cursor: 'pointer',
                  boxShadow: isSelected 
                    ? '0 8px 20px rgba(0,95,96,0.25)' 
                    : isHovered 
                      ? '0 6px 18px rgba(20,184,166,0.15)' 
                      : '0 2px 6px rgba(0,0,0,0.03)',
                  transform: isSelected || isHovered ? 'translateY(-2px)' : 'translateY(0)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {type.label}
              </button>
            );
          })}
        </div>

        {/* Section Search Bar & Category Filter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.25rem' }}>
          {catalogViewType === 'PACKAGES' ? (
            <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
              {[
                { id: 'ALL', label: 'All Packages' },
                { id: 'HIS', label: '👨 His Wellness' },
                { id: 'HER', label: '👩 Her Wellness' },
                { id: 'ORGAN', label: '🫀 Organ Health' },
                { id: 'DIABETES', label: '🩸 Diabetes' }
              ].map(tab => {
                const isActive = catalogTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setCatalogTab(tab.id)}
                    style={{ 
                      padding: '0.55rem 1.15rem', 
                      borderRadius: '12px', 
                      border: isActive ? '1px solid #14B8A6' : '1px solid transparent', 
                      fontSize: '0.86rem', 
                      fontWeight: '800', 
                      cursor: 'pointer', 
                      backgroundColor: isActive ? '#E0F2F1' : '#F8FAFC', 
                      color: isActive ? '#005F60' : '#475569',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#F1F5F9';
                        e.currentTarget.style.color = '#0F172A';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#F8FAFC';
                        e.currentTarget.style.color = '#475569';
                      }
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          ) : <div />}

          {/* Quick Filter Search inside Grid */}
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={17} color="#64748B" style={{ position: 'absolute', left: '14px', top: '12px' }} />
            <input
              type="text"
              placeholder={`Quick search ${catalogViewType.toLowerCase()}...`}
              value={catalogSectionSearch}
              onChange={(e) => setCatalogSectionSearch(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.68rem 1rem 0.68rem 2.6rem', 
                borderRadius: '12px', 
                border: '1.5px solid #CBD5E1', 
                fontSize: '0.88rem', 
                fontWeight: '600',
                outline: 'none',
                backgroundColor: '#FAFAFA',
                transition: 'border-color 0.2s, background-color 0.2s, box-shadow 0.2s'
              }}
              onFocus={e => {
                e.target.style.borderColor = '#005F60';
                e.target.style.backgroundColor = '#FFFFFF';
                e.target.style.boxShadow = '0 0 0 3px rgba(0,95,96,0.12)';
              }}
              onBlur={e => {
                e.target.style.borderColor = '#CBD5E1';
                e.target.style.backgroundColor = '#FAFAFA';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* 1. HEALTH PACKAGES GRID WITH VIBRANT HOVER LIFT */}
        {catalogViewType === 'PACKAGES' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
            {displayedPackages
              .filter(p => !catalogSectionSearch || p.name.toLowerCase().includes(catalogSectionSearch.toLowerCase()))
              .slice(0, 9)
              .map(pkg => {
                const isHovered = hoveredCardId === `pkg-${pkg.id}`;
                return (
                  <div 
                    key={pkg.id} 
                    onMouseEnter={() => setHoveredCardId(`pkg-${pkg.id}`)}
                    onMouseLeave={() => setHoveredCardId(null)}
                    style={{ 
                      backgroundColor: '#FFFFFF', 
                      borderRadius: '24px', 
                      border: isHovered ? '1.5px solid #00A896' : '1px solid #E2E8F0', 
                      padding: '1.85rem', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between', 
                      boxShadow: isHovered 
                        ? '0 24px 50px -10px rgba(0, 95, 96, 0.18), 0 0 20px rgba(0, 168, 150, 0.12)' 
                        : '0 8px 24px -6px rgba(0,0,0,0.05)',
                      transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
                      transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <span style={{ 
                          padding: '0.35rem 0.85rem', 
                          backgroundColor: isHovered ? '#005F60' : '#E0F2F1', 
                          color: isHovered ? '#FFFFFF' : '#005F60', 
                          borderRadius: '20px', 
                          fontSize: '0.78rem', 
                          fontWeight: '800',
                          transition: 'all 0.2s ease'
                        }}>
                          {pkg.category || 'Comprehensive Package'}
                        </span>
                        <span style={{ 
                          padding: '0.35rem 0.75rem', 
                          backgroundColor: '#FEF3C7', 
                          color: '#92400E', 
                          borderRadius: '10px', 
                          fontSize: '0.78rem', 
                          fontWeight: '900',
                          boxShadow: '0 2px 6px rgba(245,158,11,0.2)'
                        }}>
                          {pkg.discountPercent || 50}% OFF
                        </span>
                      </div>

                      <h3 style={{ 
                        fontSize: '1.3rem', 
                        fontWeight: '900', 
                        color: isHovered ? '#005F60' : '#0F172A', 
                        lineHeight: '1.3', 
                        marginBottom: '0.65rem',
                        transition: 'color 0.2s ease'
                      }}>
                        {pkg.name}
                      </h3>
                      <p style={{ color: '#64748B', fontSize: '0.88rem', marginBottom: '1.4rem', lineHeight: '1.5' }}>
                        {pkg.description || pkg.tagline}
                      </p>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem', marginBottom: '1.6rem' }}>
                        <span style={{ padding: '0.3rem 0.7rem', backgroundColor: '#F8FAFC', color: '#475569', borderRadius: '8px', fontSize: '0.76rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem', border: '1px solid #E2E8F0' }}>
                          <Droplet size={14} color="#0284C7" /> Serum SST / EDTA
                        </span>
                        <span style={{ padding: '0.3rem 0.7rem', backgroundColor: '#F8FAFC', color: '#475569', borderRadius: '8px', fontSize: '0.76rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem', border: '1px solid #E2E8F0' }}>
                          <Clock size={14} color="#D97706" /> {pkg.fasting === 'YES' ? '8-10h Fasting' : 'No Fasting'}
                        </span>
                        <span style={{ padding: '0.3rem 0.7rem', backgroundColor: '#F8FAFC', color: '#475569', borderRadius: '8px', fontSize: '0.76rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem', border: '1px solid #E2E8F0' }}>
                          <Award size={14} color="#10B981" /> TAT: 24 Hours
                        </span>
                      </div>
                    </div>

                    <div style={{ paddingTop: '1.15rem', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '800', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Starts From</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem', marginTop: '0.1rem' }}>
                          <span style={{ fontSize: '1.55rem', fontWeight: '900', color: '#005F60' }}>₹{pkg.price}</span>
                          <span style={{ fontSize: '0.85rem', color: '#94A3B8', textDecoration: 'line-through', fontWeight: '700' }}>₹{pkg.mrp}</span>
                        </div>
                      </div>
                      <button 
                        onClick={onNavigateLogin} 
                        style={{ 
                          padding: '0.75rem 1.4rem', 
                          backgroundColor: isHovered ? '#007A7C' : '#005F60', 
                          color: '#FFF', 
                          border: 'none', 
                          borderRadius: '12px', 
                          fontSize: '0.88rem', 
                          fontWeight: '900', 
                          cursor: 'pointer',
                          boxShadow: isHovered ? '0 6px 18px rgba(0,95,96,0.35)' : 'none',
                          transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Book Pickup →
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* 2. ORGAN PROFILES & PANELS GRID */}
        {catalogViewType === 'PROFILES' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.75rem' }}>
            {allProfiles
              .filter(p => !catalogSectionSearch || p.name.toLowerCase().includes(catalogSectionSearch.toLowerCase()) || p.code?.toLowerCase().includes(catalogSectionSearch.toLowerCase()))
              .slice(0, 12)
              .map(prof => {
                const isHovered = hoveredCardId === `prof-${prof.id}`;
                return (
                  <div 
                    key={prof.id} 
                    onMouseEnter={() => setHoveredCardId(`prof-${prof.id}`)}
                    onMouseLeave={() => setHoveredCardId(null)}
                    style={{ 
                      backgroundColor: '#FFF', 
                      borderRadius: '22px', 
                      border: isHovered ? '1.5px solid #0284C7' : '1px solid #E2E8F0', 
                      padding: '1.65rem', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between', 
                      boxShadow: isHovered 
                        ? '0 20px 45px -10px rgba(2, 132, 199, 0.18)' 
                        : '0 6px 20px rgba(0,0,0,0.03)',
                      transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ padding: '0.25rem 0.7rem', backgroundColor: '#E0F2FE', color: '#0369A1', borderRadius: '8px', fontSize: '0.76rem', fontWeight: '800' }}>
                          {prof.testsIncluded?.length || prof.testCount || 8} Biomarkers Panel
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'monospace', fontWeight: '800' }}>
                          {prof.code}
                        </span>
                      </div>

                      <h3 style={{ 
                        fontSize: '1.2rem', 
                        fontWeight: '900', 
                        color: isHovered ? '#0284C7' : '#0F172A', 
                        marginBottom: '0.45rem',
                        transition: 'color 0.2s ease'
                      }}>
                        {prof.name}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.4, marginBottom: '1.25rem' }}>
                        {prof.description || 'Comprehensive clinical panel for deep organ assessment.'}
                      </p>
                    </div>

                    <div style={{ paddingTop: '1rem', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Starts From</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.1rem' }}>
                          <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#005F60' }}>₹{prof.price || 499}</span>
                          <span style={{ fontSize: '0.8rem', color: '#94A3B8', textDecoration: 'line-through', fontWeight: '700' }}>₹{prof.mrp || 1200}</span>
                        </div>
                      </div>
                      <button 
                        onClick={onNavigateLogin} 
                        style={{ 
                          padding: '0.65rem 1.25rem', 
                          backgroundColor: isHovered ? '#0284C7' : '#005F60', 
                          color: '#FFF', 
                          border: 'none', 
                          borderRadius: '12px', 
                          fontSize: '0.85rem', 
                          fontWeight: '900', 
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          transform: isHovered ? 'scale(1.02)' : 'scale(1)'
                        }}
                      >
                        Book Profile →
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* 3. INDIVIDUAL TESTS GRID (916+ Tests) WITH HOVER GLOW */}
        {catalogViewType === 'TESTS' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.4rem' }}>
            {allTests
              .filter(t => !catalogSectionSearch || t.name.toLowerCase().includes(catalogSectionSearch.toLowerCase()) || t.code?.toLowerCase().includes(catalogSectionSearch.toLowerCase()))
              .slice(0, 18)
              .map(tst => {
                const isHovered = hoveredCardId === `test-${tst.id}`;
                return (
                  <div 
                    key={tst.id} 
                    onMouseEnter={() => setHoveredCardId(`test-${tst.id}`)}
                    onMouseLeave={() => setHoveredCardId(null)}
                    style={{ 
                      backgroundColor: '#FFF', 
                      borderRadius: '18px', 
                      border: isHovered ? '1.5px solid #14B8A6' : '1px solid #E2E8F0', 
                      padding: '1.4rem', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between', 
                      boxShadow: isHovered 
                        ? '0 16px 36px -8px rgba(0, 95, 96, 0.16)' 
                        : '0 4px 12px rgba(0,0,0,0.02)',
                      transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                      transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.74rem', backgroundColor: '#F1F5F9', color: '#475569', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: '800' }}>
                          🧪 {tst.sampleType || 'Serum / EDTA'}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: '#005F60', fontWeight: '800' }}>
                          {tst.fasting === 'YES' ? 'Fasting Required' : 'No Fasting'}
                        </span>
                      </div>

                      <h4 style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: '900', 
                        color: isHovered ? '#005F60' : '#0F172A', 
                        margin: '0.3rem 0 0.4rem 0',
                        transition: 'color 0.2s ease'
                      }}>
                        {tst.name}
                      </h4>
                      <div style={{ fontSize: '0.76rem', color: '#64748B', fontFamily: 'monospace', fontWeight: '700' }}>Code: {tst.code}</div>
                    </div>

                    <div style={{ marginTop: '1.15rem', paddingTop: '0.85rem', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Starts From</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.1rem' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A' }}>₹{tst.price || 199}</span>
                          <span style={{ fontSize: '0.78rem', color: '#94A3B8', textDecoration: 'line-through', fontWeight: '700' }}>₹{tst.mrp || 450}</span>
                        </div>
                      </div>
                      <button 
                        onClick={onNavigateLogin} 
                        style={{ 
                          padding: '0.55rem 1.1rem', 
                          backgroundColor: isHovered ? '#005F60' : '#F1F5F9', 
                          color: isHovered ? '#FFF' : '#005F60', 
                          border: 'none', 
                          borderRadius: '10px', 
                          fontSize: '0.82rem', 
                          fontWeight: '800', 
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        + Add Test
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

      </div>
    </section>
  );
}
