import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Search, 
  MessageCircle, 
  PhoneCall, 
  FlaskConical, 
  Building2, 
  Stethoscope, 
  Pill, 
  FolderHeart, 
  ArrowRight,
  Shield,
  Award,
  Zap,
  Star,
  CheckCircle2,
  UploadCloud,
  FileText,
  Activity,
  HeartPulse,
  HeartHandshake,
  Check,
  Plus
} from 'lucide-react';
import CareSeekerOffersCarousel from './CareSeekerOffersCarousel';

export default function CareSeekerHomeTab({ 
  user, 
  setActiveTab = () => {}, 
  setCatalogSubTab = () => {}, 
  setSelectedDetailItem = () => {}, 
  handleOrderWhatsApp = () => {}, 
  handleOrderCall = () => {},
  onOpenPrescriptionModal = () => {},
  onOpenAddressModal = () => {},
  addToCart = () => {},
  catalog = {},
  liveOrdersCount = 0
}) {
  const [homeSearchQuery, setHomeSearchQuery] = useState('');
  const [activeSearchScope, setActiveSearchScope] = useState('TESTS'); // 'TESTS' | 'DOCTORS' | 'MEDICINES'
  const searchInputRef = useRef(null);

  const topPackage = (catalog.packages && catalog.packages[0]) || {
    id: 'pkg_aarogyam_13',
    name: 'Thyrocare Aarogyam Complete 1.3 Full Body',
    lab: 'MedMarg / Thyrocare Processing Hub',
    price: 1499,
    mrp: 3500,
    params: 104,
    fasting: 'YES',
    sampleType: 'SERUM, EDTA',
    description: 'Comprehensive 104 biomarker assessment: Thyroid, Lipids, Liver LFT, Kidney KFT, Vitamins D3/B12 & CBC hemogram.',
    includes: ['Thyroid Profile Total (T3, T4, TSH)', 'Lipid Profile (7 Biomarkers)', 'Liver Function Test LFT (11 Params)', 'Kidney Function Test KFT (6 Params)', 'Vitamin D3 & B12', 'Complete Hemogram CBC (24 Params)']
  };

  const multiLabPartners = [
    { name: 'Thyrocare Technologies', badge: '104+ Biomarker Panels', discount: 'Up to 65% OFF', accreditation: 'NABL & CAP' },
    { name: 'MedMarg Central Hub', badge: '60-Min Express Phlebo', discount: 'Same-Day Fast TAT', accreditation: 'ISO 15189' },
    { name: 'Apollo Diagnostics', badge: 'Specialty Histopathology', discount: 'NABL Certified', accreditation: 'NABL' },
    { name: 'Metropolis Healthcare', badge: 'Advanced Genomic & Hormonal', discount: 'B2B Integrated', accreditation: 'CAP Accredited' }
  ];

  // Autocomplete live search matches across tests, profiles, packages
  const searchResults = homeSearchQuery.trim() ? [
    ...(catalog.packages || []).map(p => ({ ...p, itemType: 'PACKAGE' })),
    ...(catalog.profiles || []).map(p => ({ ...p, itemType: 'PROFILE' })),
    ...(catalog.tests || []).map(t => ({ ...t, itemType: 'TEST' }))
  ].filter(item => (item.name || item.title || '').toLowerCase().includes(homeSearchQuery.toLowerCase())).slice(0, 6) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* 1. UNIVERSAL HEALTHCARE SEARCH BAR */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '1.5rem 1.75rem',
        border: '1.5px solid #E2E8F0',
        boxShadow: '0 10px 30px rgba(0,77,64,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        position: 'relative'
      }}>
        
        {/* Scope Switcher Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { key: 'TESTS', label: 'Diagnostic Tests & Profiles (913+ Live)', active: true, icon: FlaskConical },
              { key: 'DOCTORS', label: 'Doctors & Clinics (Coming Soon)', active: false, icon: Stethoscope },
              { key: 'MEDICINES', label: 'Medicines & Pharmacy (Coming Soon)', active: false, icon: Pill }
            ].map(scope => {
              const IconC = scope.icon;
              const isSel = activeSearchScope === scope.key;
              return (
                <button
                  key={scope.key}
                  onClick={() => {
                    if (scope.active) setActiveSearchScope(scope.key);
                  }}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '10px',
                    border: isSel ? '1.5px solid #006B70' : '1px solid #E2E8F0',
                    backgroundColor: isSel ? '#006B70' : '#F8FAFC',
                    color: isSel ? '#FFFFFF' : scope.active ? '#334155' : '#94A3B8',
                    fontWeight: '800',
                    fontSize: '0.8rem',
                    cursor: scope.active ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <IconC size={14} color={isSel ? '#FBBF24' : '#64748B'} />
                  <span>{scope.label}</span>
                </button>
              );
            })}
          </div>

          <div style={{ fontSize: '0.74rem', color: '#006B70', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Sparkles size={14} color="#006B70" />
            <span>AI Universal Search</span>
          </div>
        </div>

        {/* Search Input Box with Action Buttons */}
        <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
          <div style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: '#E0F2F1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}>
            <Search size={18} color="#006B70" />
          </div>

          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search 913+ lab tests, health packages, or organs (e.g. Thyroid, Vitamin D, HbA1c, Liver LFT, CBC)..."
            value={homeSearchQuery}
            onChange={(e) => setHomeSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.95rem 7.5rem 0.95rem 3.4rem',
              borderRadius: '16px',
              border: '2px solid #006B70',
              fontSize: '0.96rem',
              outline: 'none',
              color: '#0F172A',
              fontWeight: '600',
              backgroundColor: '#FAFCFC',
              boxShadow: '0 4px 14px rgba(0,107,112,0.08)'
            }}
          />

          <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {homeSearchQuery && (
              <button
                onClick={() => setHomeSearchQuery('')}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748B',
                  fontWeight: '900',
                  fontSize: '12px'
                }}
              >
                ✕
              </button>
            )}
            <button
              onClick={() => {
                setActiveTab('TESTS');
                setCatalogSubTab('ALL_TESTS');
              }}
              style={{
                backgroundColor: '#006B70',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.5rem 0.9rem',
                borderRadius: '10px',
                fontWeight: '800',
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <span>Explore Matrix</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Popular Quick Search Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', paddingTop: '0.2rem' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#64748B' }}>Popular Searches:</span>
          {[
            { label: '🩸 Complete Blood Count (CBC)', q: 'Complete Blood Count' },
            { label: '⚡ Thyroid Profile (T3/T4/TSH)', q: 'Thyroid' },
            { label: '🌿 HbA1c Diabetes', q: 'HbA1c' },
            { label: '☀️ Vitamin D3 & B12', q: 'Vitamin' },
            { label: '🛡️ Aarogyam Full Body', q: 'Aarogyam' },
            { label: '🧪 Lipid Cholesterol', q: 'Lipid' }
          ].map(chip => (
            <button
              key={chip.q}
              onClick={() => setHomeSearchQuery(chip.q)}
              style={{
                padding: '0.25rem 0.65rem',
                borderRadius: '20px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                color: '#334155',
                fontSize: '0.74rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E0F2F1';
                e.currentTarget.style.borderColor = '#006B70';
                e.currentTarget.style.color = '#006B70';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F8FAFC';
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.color = '#334155';
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Live Search Autocomplete Dropdown */}
        {searchResults.length > 0 && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% - 10px)',
            left: '1.5rem',
            right: '1.5rem',
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1.5px solid #006B70',
            boxShadow: '0 20px 45px -10px rgba(0,77,64,0.25)',
            zIndex: 1100,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ padding: '0.75rem 1.25rem', backgroundColor: '#F0FDF4', borderBottom: '1px solid #E2E8F0', fontSize: '0.78rem', fontWeight: '900', color: '#006B70', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>MATCHING DIAGNOSTIC TESTS & PANELS ({searchResults.length})</span>
              <span style={{ fontSize: '0.72rem', color: '#059669' }}>Click to view details or add instantly</span>
            </div>
            {searchResults.map((res, rIdx) => (
              <div
                key={(res.id || res.code) + '_' + rIdx}
                style={{
                  padding: '0.95rem 1.25rem',
                  borderBottom: '1px solid #F1F5F9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0FDF4'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
              >
                <div 
                  onClick={() => {
                    setSelectedDetailItem(res);
                    setHomeSearchQuery('');
                  }}
                  style={{ flex: 1 }}
                >
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.68rem', backgroundColor: '#006B70', color: '#FFFFFF', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '900' }}>
                      {res.itemType}
                    </span>
                    <span style={{ fontWeight: '900', color: '#0F172A', fontSize: '0.95rem' }}>
                      {res.name || res.title}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <span>🔬 {res.lab || 'MedMarg Central Hub'}</span>
                    <span>• Fasting: {res.fasting || 'NO'}</span>
                    <span>• 🩸 {res.sampleType || 'SERUM'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#006B70' }}>₹{res.price || 499}</div>
                    <div style={{ fontSize: '0.74rem', color: '#94A3B8', textDecoration: 'line-through' }}>₹{res.mrp || 999}</div>
                  </div>
                  <button
                    onClick={() => {
                      addToCart(res);
                      setHomeSearchQuery('');
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#006B70',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      boxShadow: '0 2px 8px rgba(0,107,112,0.2)'
                    }}
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. HORIZONTAL SCROLLABLE OFFERS CAROUSEL */}
      <CareSeekerOffersCarousel 
        onSelectOffer={setSelectedDetailItem}
        catalog={catalog}
      />

      {/* 3. STREAMLINED COMPACT 1-TAP HERO BLOCK */}
      <div style={{
        backgroundColor: '#004D40',
        borderRadius: '20px',
        padding: '1.5rem 1.75rem',
        color: '#FFFFFF',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        alignItems: 'center',
        boxShadow: '0 12px 28px -6px rgba(0,77,64,0.3)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.6rem', borderRadius: '16px', fontSize: '0.72rem', fontWeight: '900', marginBottom: '0.4rem' }}>
            <Sparkles size={13} /> 60-MIN EXPRESS HOME PHLEBOTOMY
          </div>
          <h3 style={{ fontSize: '1.45rem', fontWeight: '900', lineHeight: 1.25, margin: 0 }}>
            Book Diagnostic Tests or Upload Prescription
          </h3>
          <p style={{ color: '#80CBC4', fontSize: '0.84rem', marginTop: '0.35rem', lineHeight: 1.4 }}>
            Certified phlebotomists with IoT cold-chain telemetry (`2°C - 8°C`) across Tirupati.
          </p>

          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleOrderWhatsApp()}
              style={{ padding: '0.6rem 1rem', backgroundColor: '#25D366', color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <MessageCircle size={16} /> WhatsApp
            </button>

            <button
              onClick={handleOrderCall}
              style={{ padding: '0.6rem 1rem', backgroundColor: '#0284C7', color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <PhoneCall size={16} /> Call Us
            </button>

            <button
              onClick={onOpenPrescriptionModal}
              style={{ padding: '0.6rem 1rem', backgroundColor: '#F59E0B', color: '#0F172A', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <UploadCloud size={16} /> Upload Prescription
            </button>
          </div>
        </div>

        {/* Featured Smart Package Mini Card */}
        <div 
          onClick={() => setSelectedDetailItem(topPackage)}
          style={{ backgroundColor: '#003830', borderRadius: '16px', padding: '1.25rem', border: '1.5px solid #006B70', cursor: 'pointer', transition: 'all 0.2s ease' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '900' }}>
              MOST POPULAR • {topPackage.params || 104} PARAMS
            </span>
            <span style={{ fontSize: '0.74rem', color: '#FBBF24', fontWeight: '800' }}>★ 4.9</span>
          </div>

          <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#FFF', marginTop: '0.5rem', lineHeight: 1.3 }}>
            {topPackage.name || topPackage.title}
          </h4>

          <div style={{ marginTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '1.35rem', fontWeight: '900', color: '#FBBF24' }}>₹{topPackage.price || 1499}</span>
              <span style={{ fontSize: '0.8rem', color: '#80CBC4', textDecoration: 'line-through', marginLeft: '0.4rem' }}>₹{topPackage.mrp || 3500}</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#FFF', fontWeight: '800', backgroundColor: '#006B70', padding: '0.35rem 0.75rem', borderRadius: '8px' }}>
              View Details →
            </span>
          </div>
        </div>
      </div>

      {/* 4. MULTI-LAB PARTNER AGGREGATOR GRID */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
              Integrated Multi-Lab Processing Network
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.15rem 0 0 0' }}>
              Compare tests, B2B pricing, and TAT across leading accredited pathology networks.
            </p>
          </div>
          <button
            onClick={() => {
              setActiveTab('TESTS');
              setCatalogSubTab('ALL');
            }}
            style={{ background: 'none', border: 'none', color: '#006B70', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            Browse All 913+ Tests Matrix <ArrowRight size={15} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
          {multiLabPartners.map((lab, idx) => (
            <div
              key={idx}
              onClick={() => {
                setActiveTab('TESTS');
                setCatalogSubTab('ALL');
              }}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '18px',
                padding: '1.25rem',
                border: '1.5px solid #E2E8F0',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.75rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', backgroundColor: '#E0F2F1', color: '#006B70', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: '800' }}>
                    {lab.accreditation}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#D97706', fontWeight: '800' }}>
                    {lab.discount}
                  </span>
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0F172A', marginTop: '0.5rem' }}>{lab.name}</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>{lab.badge}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: '#006B70', fontWeight: '800' }}>
                <span>View Lab Tests</span>
                <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. HEALTH RISK SCREENING PANELS */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '22px', padding: '1.75rem', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#006B70', fontWeight: '800' }}>
              <HeartPulse size={16} /> TARGETED HEALTH CHECKS
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', margin: '0.2rem 0 0 0' }}>
              Specialty Organ & Lifestyle Panels
            </h3>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {[
            { title: 'Diabetic & Glycemic Panel', desc: 'Fasting Blood Sugar, HbA1c 3-Month Average, Microalbumin & C-Peptide.', price: 799, mrp: 1600, tag: 'FASTING REQUIRED' },
            { title: 'Executive Cardiac Risk Panel', desc: 'Lipid Profile (Cholesterol, LDL, HDL, Triglycerides), Apolipoproteins & hsCRP.', price: 999, mrp: 2200, tag: 'CARDIO RISK' },
            { title: 'Vitamin & Bone Health Panel', desc: '25-OH Vitamin D3, Vitamin B12 Active, Calcium & Phosphorus.', price: 899, mrp: 1900, tag: 'ENERGY & IMMUNITY' },
            { title: 'Liver & Renal Health (LFT+KFT)', desc: 'Bilirubin, SGOT, SGPT, Creatinine, Urea, Uric Acid & Electrolytes.', price: 699, mrp: 1500, tag: 'ORGAN FUNCTION' }
          ].map((panel, idx) => (
            <div
              key={idx}
              onClick={() => {
                setActiveTab('TESTS');
                setCatalogSubTab('PROFILES');
              }}
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '16px',
                padding: '1.25rem',
                border: '1px solid #E2E8F0',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.75rem'
              }}
            >
              <div>
                <span style={{ fontSize: '0.7rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '800' }}>
                  {panel.tag}
                </span>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0F172A', marginTop: '0.4rem' }}>{panel.title}</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem', lineHeight: 1.4 }}>{panel.desc}</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#006B70' }}>₹{panel.price}</span>
                  <span style={{ fontSize: '0.78rem', color: '#94A3B8', textDecoration: 'line-through', marginLeft: '0.4rem' }}>₹{panel.mrp}</span>
                </div>
                <span style={{ fontSize: '0.82rem', color: '#006B70', fontWeight: '800' }}>Book Panel →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
