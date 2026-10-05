import React, { useState } from 'react';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. UNIVERSAL HEALTHCARE SEARCH BAR */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '1.75rem', border: '1.5px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
        
        {/* Scope Switcher Tabs */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {[
            { key: 'TESTS', label: 'Diagnostic Tests & Packages (913+ Live)', active: true, icon: FlaskConical },
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
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: isSel ? '#006B70' : '#F1F5F9',
                  color: isSel ? '#FFFFFF' : scope.active ? '#334155' : '#94A3B8',
                  fontWeight: '800',
                  fontSize: '0.84rem',
                  cursor: scope.active ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem'
                }}
              >
                <IconC size={15} color={isSel ? '#FBBF24' : '#64748B'} />
                <span>{scope.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input Box */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={22} color="#006B70" style={{ position: 'absolute', left: '16px', top: '16px' }} />
          <input
            type="text"
            placeholder="Search for any lab test, profile, or package (e.g. Vitamin D, Thyroid, Diabetes, CBC, Lipid Profile)..."
            value={homeSearchQuery}
            onChange={(e) => setHomeSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.95rem 1rem 0.95rem 3.2rem',
              borderRadius: '14px',
              border: '2px solid #006B70',
              fontSize: '1rem',
              outline: 'none',
              color: '#0F172A',
              fontWeight: '600',
              boxShadow: '0 4px 14px rgba(0,107,112,0.1)'
            }}
          />
        </div>

        {/* Live Search Autocomplete Dropdown */}
        {searchResults.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '1.75rem',
            right: '1.75rem',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid #CBD5E1',
            boxShadow: '0 16px 36px rgba(0,0,0,0.15)',
            zIndex: 1100,
            overflow: 'hidden',
            marginTop: '0.5rem',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ padding: '0.75rem 1rem', backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: '0.78rem', fontWeight: '800', color: '#64748B' }}>
              MATCHING DIAGNOSTIC TESTS ({searchResults.length})
            </div>
            {searchResults.map((res, rIdx) => (
              <div
                key={(res.id || res.code) + '_' + rIdx}
                style={{
                  padding: '0.85rem 1.25rem',
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
                    <span style={{ fontSize: '0.7rem', backgroundColor: '#E0F2F1', color: '#006B70', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '800' }}>
                      {res.itemType}
                    </span>
                    <span style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.92rem' }}>
                      {res.name || res.title}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '0.15rem' }}>
                    {res.lab || 'MedMarg Central Hub'} • Fasting: {res.fasting || 'NO'} • 🩸 {res.sampleType || 'SERUM'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#006B70' }}>₹{res.price || 499}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8', textDecoration: 'line-through' }}>₹{res.mrp || 999}</div>
                  </div>
                  <button
                    onClick={() => {
                      addToCart(res);
                      setHomeSearchQuery('');
                    }}
                    style={{ padding: '0.45rem 0.95rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. HERO DIRECT ORDER CHANNELS (WhatsApp, Call, 60-min Express & Prescription Upload) */}
      <div style={{
        backgroundColor: '#004D40',
        borderRadius: '24px',
        padding: '2.25rem',
        color: '#FFFFFF',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem',
        alignItems: 'center',
        boxShadow: '0 16px 36px -10px rgba(0,77,64,0.35)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '900', marginBottom: '0.75rem' }}>
            <Sparkles size={14} /> MULTI-LAB AGGREGATOR • 100% NABL ACCREDITED
          </div>
          <h2 style={{ fontSize: '1.95rem', fontWeight: '900', lineHeight: 1.25, margin: 0 }}>
            Book Diagnostic Tests or Upload Prescription in 1-Tap
          </h2>
          <p style={{ color: '#80CBC4', fontSize: '0.92rem', marginTop: '0.6rem', lineHeight: 1.5 }}>
            Certified phlebotomists at your doorstep in 60 minutes across Tirupati with IoT cold-chain temperature telemetry (`2°C - 8°C`). Compare rates across Thyrocare, Apollo & MedMarg Central Hub.
          </p>

          {/* Direct Order Channel Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleOrderWhatsApp()}
              style={{ padding: '0.75rem 1.25rem', backgroundColor: '#25D366', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(37,211,102,0.3)' }}
            >
              <MessageCircle size={18} /> Order on WhatsApp
            </button>

            <button
              onClick={handleOrderCall}
              style={{ padding: '0.75rem 1.25rem', backgroundColor: '#0284C7', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <PhoneCall size={18} /> Call to Book
            </button>

            <button
              onClick={onOpenPrescriptionModal}
              style={{ padding: '0.75rem 1.25rem', backgroundColor: '#F59E0B', color: '#0F172A', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(245,158,11,0.25)' }}
            >
              <UploadCloud size={18} /> Upload Prescription
            </button>
          </div>
        </div>

        {/* Featured Smart Package Card with Standalone Savings Breakdown */}
        <div 
          onClick={() => setSelectedDetailItem(topPackage)}
          style={{ backgroundColor: '#003830', borderRadius: '22px', padding: '1.75rem', border: '1.5px solid #006B70', cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: '900' }}>
              MOST POPULAR • {topPackage.params || 104} PARAMS
            </span>
            <span style={{ fontSize: '0.78rem', color: '#FBBF24', fontWeight: '800' }}>★ 4.9 (1.8k+ Reviews)</span>
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#FFF', marginTop: '0.75rem', lineHeight: 1.3 }}>
            {topPackage.name || topPackage.title}
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#80CBC4', marginTop: '0.35rem', lineHeight: 1.4 }}>
            {topPackage.description || 'Full body health assessment with thyroid, cholesterol, liver, kidney, vitamins & CBC.'}
          </p>

          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.7rem', backgroundColor: 'rgba(255,255,255,0.1)', color: '#E0F2F1', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
              ✓ Thyroid (T3/T4/TSH)
            </span>
            <span style={{ fontSize: '0.7rem', backgroundColor: 'rgba(255,255,255,0.1)', color: '#E0F2F1', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
              ✓ Lipid Profile
            </span>
            <span style={{ fontSize: '0.7rem', backgroundColor: 'rgba(255,255,255,0.1)', color: '#E0F2F1', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
              ✓ Liver LFT & Kidney KFT
            </span>
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #004D40', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#FBBF24' }}>₹{topPackage.price || 1499}</span>
              <span style={{ fontSize: '0.85rem', color: '#80CBC4', textDecoration: 'line-through', marginLeft: '0.5rem' }}>₹{topPackage.mrp || 3500}</span>
              <span style={{ fontSize: '0.72rem', color: '#4ADE80', fontWeight: '800', marginLeft: '0.4rem' }}>(Save ₹2,001)</span>
            </div>
            <span style={{ fontSize: '0.84rem', color: '#FFF', fontWeight: '800', backgroundColor: '#006B70', padding: '0.45rem 0.95rem', borderRadius: '10px' }}>
              View Details →
            </span>
          </div>
        </div>
      </div>

      {/* 3. MULTI-LAB PARTNER AGGREGATOR GRID */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
              Integrated Multi-Lab Processing Network
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
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

      {/* 4. HEALTH RISK SCREENING PANELS */}
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

      {/* 5. TRUST & ACCREDITATION BANNER */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.75rem', border: '1.5px solid #E2E8F0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Shield size={32} color="#006B70" />
          <div>
            <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.95rem' }}>100% NABL & CAP Accredited</div>
            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Certified processing pathology laboratories</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Award size={32} color="#0284C7" />
          <div>
            <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.95rem' }}>IoT Cold-Chain Telemetry</div>
            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Live container temperature 2°C - 8°C</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Zap size={32} color="#F59E0B" />
          <div>
            <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.95rem' }}>60-Min Fast Home Pickup</div>
            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Tirupati city-wide phlebotomist fleet</div>
          </div>
        </div>
      </div>

    </div>
  );
}
