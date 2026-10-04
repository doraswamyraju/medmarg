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
  CheckCircle2
} from 'lucide-react';

export default function PatientHomeTab({ 
  user, 
  setActiveTab, 
  setCatalogSubTab, 
  setSelectedDetailItem, 
  handleOrderWhatsApp, 
  handleOrderCall,
  catalog 
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. HERO DIRECT ORDER CHANNELS (WhatsApp, Call & Instant Booking) */}
      <div style={{ backgroundColor: '#004D40', borderRadius: '24px', padding: '2rem', color: '#FFFFFF', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'center', boxShadow: '0 12px 30px -10px rgba(0,77,64,0.3)' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '900', marginBottom: '0.75rem' }}>
            <Sparkles size={14} /> INSTANT DIAGNOSTIC ASSISTANCE
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '900', lineHeight: 1.2 }}>
            Book Diagnostics or Upload Prescription in 1 Tap
          </h2>
          <p style={{ color: '#80CBC4', fontSize: '0.9rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
            Get certified phlebotomists at your doorstep within 60 minutes. 100% NABL & CAP accredited testing.
          </p>

          {/* Direct Order Channel Buttons */}
          <div style={{ display: 'flex', gap: '0.85rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleOrderWhatsApp()}
              style={{ padding: '0.75rem 1.25rem', backgroundColor: '#25D366', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(37,211,102,0.3)' }}
            >
              <MessageCircle size={18} /> Order on WhatsApp
            </button>

            <button
              onClick={handleOrderCall}
              style={{ padding: '0.75rem 1.25rem', backgroundColor: '#0284C7', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <PhoneCall size={18} /> Order via Call
            </button>

            <button
              onClick={() => {
                setActiveTab('TESTS');
                setCatalogSubTab('PACKAGES');
              }}
              style={{ padding: '0.75rem 1.25rem', backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '12px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer' }}
            >
              Explore Packages →
            </button>
          </div>
        </div>

        {/* Promo Package Card */}
        <div 
          onClick={() => setSelectedDetailItem({
            id: 'pkg_aarogyam_13',
            name: 'Thyrocare Aarogyam Complete 1.3',
            lab: 'MedMarg / Thyrocare Central Hub',
            price: 1499,
            mrp: 3500,
            params: 104,
            fasting: 'YES',
            sampleType: 'SERUM, EDTA',
            description: 'Top recommendation: Comprehensive organ health, thyroid total, lipids, liver, kidney, CBC & vitamins.',
            includes: ['Thyroid Profile Total', 'Lipid Panel (7 Parameters)', 'Liver Function Test (LFT)', 'Kidney Function Test (KFT)', 'Vitamin D3 & B12', 'Complete Hemogram (CBC 24 Params)']
          })}
          style={{ backgroundColor: '#003830', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #006B70', cursor: 'pointer', transition: 'all 0.2s ease' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: '900' }}>
              MOST POPULAR • 104 PARAMS
            </span>
            <span style={{ fontSize: '0.78rem', color: '#FBBF24', fontWeight: '800' }}>★ 4.9 (1.2k+ Reviews)</span>
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#FFF', marginTop: '0.6rem' }}>
            Thyrocare Aarogyam 1.3 Full Body
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#80CBC4', marginTop: '0.25rem' }}>
            Includes Thyroid, Lipid, Liver, Kidney, Vitamins & CBC. Free Home Collection.
          </p>

          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #004D40', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#FBBF24' }}>₹1,499</span>
              <span style={{ fontSize: '0.8rem', color: '#80CBC4', textDecoration: 'line-through', marginLeft: '0.4rem' }}>₹3,500</span>
            </div>
            <span style={{ fontSize: '0.84rem', color: '#FFF', fontWeight: '800', backgroundColor: '#006B70', padding: '0.4rem 0.85rem', borderRadius: '8px' }}>
              View Details →
            </span>
          </div>
        </div>
      </div>

      {/* 2. CORE HEALTHCARE CATEGORY TILES */}
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', marginBottom: '1rem' }}>
          Explore MedMarg Healthcare Services
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {[
            { title: 'Pathology Diagnostics', desc: `${catalog.tests?.length || 913}+ Blood & Urine Tests`, icon: FlaskConical, color: '#006B70', bg: '#E0F2F1', tab: 'TESTS' },
            { title: 'Radiology & MRI Scans', desc: 'Scan Centers & X-Ray Hubs', icon: Building2, color: '#0284C7', bg: '#E0F2FE', tab: 'TESTS' },
            { title: 'Doctor E-Consultation', desc: 'Specialist OPD Appointments', icon: Stethoscope, color: '#7C3AED', bg: '#F3E8FF', tab: 'TESTS' },
            { title: 'Pharmacy & Medicines', desc: 'Doorstep Medicine Delivery', icon: Pill, color: '#D97706', bg: '#FEF3C7', tab: 'TESTS' },
            { title: 'Digital Health Locker', desc: 'Secure Reports & PDF Vault', icon: FolderHeart, color: '#059669', bg: '#D1FAE5', tab: 'REPORTS' }
          ].map((cat, idx) => {
            const IconC = cat.icon;
            return (
              <div
                key={idx}
                onClick={() => setActiveTab(cat.tab)}
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
                  <span>Book Now</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. WHY CHOOSE MEDMARG (Accreditations & Trust Badges) */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.75rem', border: '1.5px solid #E2E8F0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Shield size={32} color="#006B70" />
          <div>
            <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.95rem' }}>100% NABL & CAP Accredited</div>
            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Certified processing diagnostic hubs</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Award size={32} color="#0284C7" />
          <div>
            <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.95rem' }}>IoT Cold-Chain Telemetry</div>
            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Sample temperature maintained at 2-8°C</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Zap size={32} color="#F59E0B" />
          <div>
            <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.95rem' }}>60-Min Fast Home Pickup</div>
            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Tirupati city-wide phlebotomy fleet</div>
          </div>
        </div>
      </div>

    </div>
  );
}
