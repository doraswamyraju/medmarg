import React from 'react';
import { 
  Sparkles, 
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
  FileText
} from 'lucide-react';

export default function PatientHomeTab({ 
  user, 
  setActiveTab = () => {}, 
  setCatalogSubTab = () => {}, 
  setSelectedDetailItem = () => {}, 
  handleOrderWhatsApp = () => {}, 
  handleOrderCall = () => {},
  onOpenPrescriptionModal = () => {},
  catalog = {},
  liveOrdersCount = 0
}) {
  const topPackage = (catalog.packages && catalog.packages[0]) || {
    id: 'pkg_aarogyam_13',
    name: 'Thyrocare Aarogyam Complete 1.3 Full Body',
    lab: 'MedMarg / Thyrocare Central Hub',
    price: 1499,
    mrp: 3500,
    params: 104,
    fasting: 'YES',
    sampleType: 'SERUM, EDTA',
    description: 'Comprehensive 104 biomarker organ health: Thyroid, Lipids, Liver LFT, Kidney KFT, Vitamins D3/B12 & CBC hemogram.',
    includes: ['Thyroid Profile Total (T3, T4, TSH)', 'Lipid Profile (7 Biomarkers)', 'Liver Function Test LFT (11 Params)', 'Kidney Function Test KFT (6 Params)', 'Vitamin D3 & B12', 'Complete Hemogram CBC (24 Params)']
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. HERO DIRECT ORDER CHANNELS (WhatsApp, Call, Instant Booking & Prescription Upload) */}
      <div style={{ backgroundColor: '#004D40', borderRadius: '24px', padding: '2.25rem', color: '#FFFFFF', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'center', boxShadow: '0 16px 36px -10px rgba(0,77,64,0.35)' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '900', marginBottom: '0.75rem' }}>
            <Sparkles size={14} /> INSTANT HOME PHLEBOTOMY & DIAGNOSTICS
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: '900', lineHeight: 1.25 }}>
            Book Diagnostic Tests or Upload Prescription in 1-Tap
          </h2>
          <p style={{ color: '#80CBC4', fontSize: '0.92rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
            Certified phlebotomists at your doorstep in 60 minutes with IoT cold-chain temperature telemetry (`2°C - 8°C`). 100% NABL verified reports.
          </p>

          {/* Direct Order Channel Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleOrderWhatsApp()}
              style={{ padding: '0.75rem 1.25rem', backgroundColor: '#25D366', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(37,211,102,0.3)' }}
            >
              <MessageCircle size={18} /> Order on WhatsApp
            </button>

            <button
              onClick={handleOrderCall}
              style={{ padding: '0.75rem 1.25rem', backgroundColor: '#0284C7', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
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

        {/* Featured Smart Package Card */}
        <div 
          onClick={() => setSelectedDetailItem(topPackage)}
          style={{ backgroundColor: '#003830', borderRadius: '20px', padding: '1.75rem', border: '1.5px solid #006B70', cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: '900' }}>
              MOST POPULAR • {topPackage.params || 104} PARAMS
            </span>
            <span style={{ fontSize: '0.78rem', color: '#FBBF24', fontWeight: '800' }}>★ 4.9 (1.8k+ Reviews)</span>
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#FFF', marginTop: '0.75rem' }}>
            {topPackage.name || topPackage.title}
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#80CBC4', marginTop: '0.35rem', lineHeight: 1.4 }}>
            {topPackage.description || 'Full body health assessment with thyroid, cholesterol, liver, kidney, vitamins & CBC.'}
          </p>

          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #004D40', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#FBBF24' }}>₹{topPackage.price || 1499}</span>
              <span style={{ fontSize: '0.85rem', color: '#80CBC4', textDecoration: 'line-through', marginLeft: '0.5rem' }}>₹{topPackage.mrp || 3500}</span>
            </div>
            <span style={{ fontSize: '0.84rem', color: '#FFF', fontWeight: '800', backgroundColor: '#006B70', padding: '0.45rem 0.95rem', borderRadius: '10px' }}>
              View Details →
            </span>
          </div>
        </div>
      </div>

      {/* 2. CORE HEALTHCARE CATEGORY TILES */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
            Explore Healthcare & Diagnostic Services
          </h3>
          <button
            onClick={() => {
              setActiveTab('TESTS');
              setCatalogSubTab('ALL');
            }}
            style={{ background: 'none', border: 'none', color: '#006B70', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            Browse All 913+ Tests <ArrowRight size={15} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem' }}>
          {[
            { title: 'Pathology Diagnostics', desc: `${catalog.tests?.length || 913}+ Blood & Urine Tests`, icon: FlaskConical, color: '#006B70', bg: '#E0F2F1', tab: 'TESTS', sub: 'TESTS' },
            { title: 'Full Body Health Kits', desc: `${catalog.packages?.length || 4}+ Comprehensive Packages`, icon: Award, color: '#0284C7', bg: '#E0F2FE', tab: 'TESTS', sub: 'PACKAGES' },
            { title: 'Organ Profiles', desc: `${catalog.profiles?.length || 87}+ Specialty Diagnostic Panels`, icon: Zap, color: '#7C3AED', bg: '#F3E8FF', tab: 'TESTS', sub: 'PROFILES' },
            { title: 'Live GPS Tracking', desc: liveOrdersCount > 0 ? `${liveOrdersCount} Active Order Enroute` : 'Track Phlebotomist Live', icon: CheckCircle2, color: '#059669', bg: '#D1FAE5', tab: 'TRACK' },
            { title: 'Digital Health Vault', desc: 'NABL Verified PDF Reports', icon: FolderHeart, color: '#D97706', bg: '#FEF3C7', tab: 'REPORTS' }
          ].map((cat, idx) => {
            const IconC = cat.icon;
            return (
              <div
                key={idx}
                onClick={() => {
                  setActiveTab(cat.tab);
                  if (cat.sub) setCatalogSubTab(cat.sub);
                }}
                style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
              >
                <div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                    <IconC size={24} color={cat.color} />
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0F172A' }}>{cat.title}</h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.25rem' }}>{cat.desc}</p>
                </div>

                <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.84rem', color: cat.color, fontWeight: '800' }}>
                  <span>Open Module</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. TRUST & ACCREDITATION BANNER */}
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
