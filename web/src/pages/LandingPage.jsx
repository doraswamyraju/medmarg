import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import initialCatalog from '../data/catalogData.json';
import { getCatalogState } from '../data/catalogStore';
import { API_BASE, safeFetch } from '../data/apiConfig';

// Modular Landing Page Components
import LandingHeader from '../components/landing/LandingHeader';
import LandingHeroSection from '../components/landing/LandingHeroSection';
import LandingCatalogSection from '../components/landing/LandingCatalogSection';
import LandingQualitySection from '../components/landing/LandingQualitySection';
import LandingFeaturesShowcase from '../components/landing/LandingFeaturesShowcase';
import LandingEcosystemAndPartners from '../components/landing/LandingEcosystemAndPartners';
import LandingFooter from '../components/landing/LandingFooter';
import LandingAppModal from '../components/landing/LandingAppModal';

export default function LandingPage({ onNavigateLogin }) {
  // Master Catalog State
  const [catalog, setCatalog] = useState(() => {
    const localState = getCatalogState();
    return (localState && localState.tests && localState.tests.length > 0) ? localState : initialCatalog;
  });

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeItemModal, setActiveItemModal] = useState(null);
  const [showAppModal, setShowAppModal] = useState(false);

  // Partner Pre-Registration Form Inputs
  const [partnerType, setPartnerType] = useState('DOCTOR');
  const [partnerName, setPartnerName] = useState('');
  const [partnerPhone, setPartnerPhone] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerSuccess, setPartnerSuccess] = useState(false);

  // Concurrently fetch Live API Catalog (Tests, Profiles, and Packages)
  useEffect(() => {
    async function loadApiCatalog() {
      try {
        const [pkgRes, profRes, testRes] = await Promise.all([
          safeFetch(`${API_BASE}/api/v1/catalog/packages`, {}, 4000).catch(() => null),
          safeFetch(`${API_BASE}/api/v1/catalog/profiles`, {}, 4000).catch(() => null),
          safeFetch(`${API_BASE}/api/v1/catalog/tests?limit=1000`, {}, 4000).catch(() => null)
        ]);

        const [pkgData, profData, testData] = await Promise.all([
          pkgRes ? pkgRes.json().catch(() => null) : null,
          profRes ? profRes.json().catch(() => null) : null,
          testRes ? testRes.json().catch(() => null) : null
        ]);

        setCatalog(prev => ({
          tests: (testData && testData.tests && testData.tests.length > 0) ? testData.tests : (prev.tests || initialCatalog.tests || []),
          profiles: (profData && profData.profiles && profData.profiles.length > 0) ? profData.profiles : (prev.profiles || initialCatalog.profiles || []),
          packages: (pkgData && pkgData.packages && pkgData.packages.length > 0) ? pkgData.packages : (prev.packages || initialCatalog.packages || []),
          lastSynced: new Date().toISOString()
        }));
      } catch (err) {
        console.warn('Catalog live sync error, retaining active cache:', err);
      }
    }
    loadApiCatalog();
  }, []);

  // Filter Catalog Items for Live Global Search
  const allTests = catalog.tests || initialCatalog.tests || [];
  const allPackages = catalog.packages || initialCatalog.packages || [];
  const allProfiles = catalog.profiles || initialCatalog.profiles || [];

  const searchResults = searchQuery.trim() ? [
    ...allPackages.filter(p => (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) || (p.code && p.code.toLowerCase().includes(searchQuery.toLowerCase()))).map(p => ({ ...p, itemType: 'PACKAGE' })),
    ...allProfiles.filter(pr => (pr.name && pr.name.toLowerCase().includes(searchQuery.toLowerCase())) || (pr.code && pr.code.toLowerCase().includes(searchQuery.toLowerCase()))).map(pr => ({ ...pr, itemType: 'PROFILE' })),
    ...allTests.filter(t => (t.name && t.name.toLowerCase().includes(searchQuery.toLowerCase())) || (t.code && t.code.toLowerCase().includes(searchQuery.toLowerCase()))).map(t => ({ ...t, itemType: 'TEST' }))
  ].slice(0, 10) : [];

  const handlePartnerSubmit = async (e) => {
    e.preventDefault();
    setPartnerSuccess(true);
    try {
      await fetch(`${API_BASE}/api/v1/partner/pre-register`, {
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
      
      {/* 1. Header */}
      <LandingHeader 
        onNavigateLogin={onNavigateLogin} 
        onOpenAppModal={() => setShowAppModal(true)} 
      />

      {/* 2. Hero Section */}
      <LandingHeroSection 
        onNavigateLogin={onNavigateLogin}
        searchResults={searchResults}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelectSearchItem={(item) => setActiveItemModal(item)}
      />

      {/* 3. Master Diagnostic Catalog */}
      <LandingCatalogSection 
        catalog={catalog}
        onNavigateLogin={onNavigateLogin}
        onSelectItemModal={(item) => setActiveItemModal(item)}
      />

      {/* 4. Quality & Doorstep Phlebotomy Showcase */}
      <LandingQualitySection />

      {/* 5. Deep Features Showcase (Fleet Radar, Vitals Curves, NABL Locker) */}
      <LandingFeaturesShowcase />

      {/* 6. Upcoming Portals & Partner Pre-Registration */}
      <LandingEcosystemAndPartners 
        partnerType={partnerType}
        setPartnerType={setPartnerType}
        partnerName={partnerName}
        setPartnerName={setPartnerName}
        partnerPhone={partnerPhone}
        setPartnerPhone={setPartnerPhone}
        partnerEmail={partnerEmail}
        setPartnerEmail={setPartnerEmail}
        partnerSuccess={partnerSuccess}
        handlePartnerSubmit={handlePartnerSubmit}
      />

      {/* 7. Footer */}
      <LandingFooter 
        onNavigateLogin={onNavigateLogin}
        onOpenAppModal={() => setShowAppModal(true)}
      />

      {/* 📑 Global Item Specification Modal */}
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

      {/* 📲 Native Mobile App Coming Soon Modal */}
      <LandingAppModal 
        isOpen={showAppModal} 
        onClose={() => setShowAppModal(false)} 
      />

    </div>
  );
}
