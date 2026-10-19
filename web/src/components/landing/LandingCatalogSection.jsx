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
    <section id="catalog" style={{ padding: '4.5rem 1.5rem', backgroundColor: '#FFFFFF' }}>
      <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ color: '#005F60', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.08em' }}>DIAGNOSTIC NETWORK</span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '900', color: '#0F172A', marginTop: '0.35rem' }}>
            Master Diagnostic Tests & Curated Health Packages
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '0.5rem', maxWidth: '650px', margin: '0.5rem auto 0' }}>
            Browse {allTests.length}+ tests with 100% Free Home Collection, digital NABL reports on WhatsApp, and smart package savings.
          </p>
        </div>

        {/* Smart Package Upgrade Banner */}
        <div style={{ backgroundColor: '#ECFDF5', border: '2px solid #A7F3D0', borderRadius: '20px', padding: '1.5rem 2rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
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
          ) : <div />}

          {/* Quick Filter Search inside Grid */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              placeholder={`Filter in ${catalogViewType.toLowerCase()}...`}
              value={catalogSectionSearch}
              onChange={(e) => setCatalogSectionSearch(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.4rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none' }}
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

        {/* 3. INDIVIDUAL TESTS GRID (916+ Tests) */}
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
  );
}
