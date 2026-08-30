import React, { useState } from 'react';
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
  Shield, 
  Award, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileCheck,
  UserCheck
} from 'lucide-react';

export default function LandingPage({ onNavigateLogin, onSelectCategory }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTestTab, setActiveTestTab] = useState('ALL');

  const popularTests = [
    {
      id: 'lipid',
      name: 'Lipid Profile (Complete Cholesterol)',
      params: 8,
      sample: 'Blood (12h Fasting)',
      popular: true,
      labs: [
        { name: 'Apollo Diagnostics', price: 499, mrp: 850, tat: '6 hrs', nabl: true, freeHome: true, rating: 4.8 },
        { name: 'Dr. Lal PathLabs', price: 549, mrp: 900, tat: '8 hrs', nabl: true, freeHome: false, rating: 4.7 },
        { name: 'Thyrocare Central', price: 399, mrp: 750, tat: '12 hrs', nabl: true, freeHome: true, rating: 4.6 }
      ]
    },
    {
      id: 'hba1c',
      name: 'HbA1c (Glycated Hemoglobin)',
      params: 2,
      sample: 'Blood (No Fasting)',
      popular: true,
      labs: [
        { name: 'Thyrocare Central', price: 299, mrp: 600, tat: '6 hrs', nabl: true, freeHome: true, rating: 4.6 },
        { name: 'Apollo Diagnostics', price: 349, mrp: 650, tat: '4 hrs', nabl: true, freeHome: true, rating: 4.8 },
        { name: 'Dr. Lal PathLabs', price: 399, mrp: 700, tat: '6 hrs', nabl: true, freeHome: false, rating: 4.7 }
      ]
    },
    {
      id: 'thyroid',
      name: 'Thyroid Total (T3, T4, TSH)',
      params: 3,
      sample: 'Blood (Morning)',
      popular: false,
      labs: [
        { name: 'Thyrocare Central', price: 299, mrp: 650, tat: '10 hrs', nabl: true, freeHome: true, rating: 4.6 },
        { name: 'Apollo Diagnostics', price: 449, mrp: 750, tat: '6 hrs', nabl: true, freeHome: true, rating: 4.8 }
      ]
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A' }}>
      {/* 1. TOP HEADER & NAVIGATION */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0.85rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#006B70', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: '800', fontSize: '1.35rem', boxShadow: '0 4px 10px rgba(0,107,112,0.3)' }}>
              M
            </div>
            <div>
              <span style={{ fontSize: '1.35rem', fontWeight: '800', color: '#006B70', letterSpacing: '-0.02em', display: 'block', lineHeight: 1 }}>MedMarg</span>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>Multi-Lab Healthcare Marketplace</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
            <a href="#diagnostics" style={{ textDecoration: 'none', color: '#334155', fontWeight: '600', fontSize: '0.92rem' }}>Lab Tests</a>
            <a href="#scans" style={{ textDecoration: 'none', color: '#334155', fontWeight: '600', fontSize: '0.92rem' }}>MRI & Scans</a>
            <a href="#doctors" style={{ textDecoration: 'none', color: '#334155', fontWeight: '600', fontSize: '0.92rem' }}>Doctors (Clinic)</a>
            <a href="#pharmacy" style={{ textDecoration: 'none', color: '#334155', fontWeight: '600', fontSize: '0.92rem' }}>Generic Medicines</a>
            <a href="#abha" style={{ textDecoration: 'none', color: '#334155', fontWeight: '600', fontSize: '0.92rem' }}>ABHA Locker</a>
          </nav>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <button
              onClick={() => onNavigateLogin('DIAGNOSTIC_LAB')}
              style={{ padding: '0.55rem 1rem', border: '1.5px solid #006B70', borderRadius: '10px', color: '#006B70', backgroundColor: '#FFF', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer' }}
            >
              Partner Portal
            </button>
            <button
              onClick={() => onNavigateLogin('PATIENT')}
              style={{ padding: '0.6rem 1.3rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(0,107,112,0.25)' }}
            >
              Sign In / Login <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section style={{ backgroundColor: '#006B70', color: '#FFFFFF', padding: '4rem 1.5rem 5rem', backgroundImage: 'radial-gradient(circle at top right, #004D40 0%, #006B70 60%, #00565B 100%)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', textAlign: 'center' }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700', marginBottom: '1.25rem', backdropFilter: 'blur(8px)' }}>
            <Sparkles size={16} color="#10B981" /> India's First Open Multi-Lab Diagnostic Marketplace
          </div>

          <h1 style={{ fontSize: '3rem', fontWeight: '800', lineHeight: 1.15, maxWidth: '950px', margin: '0 auto 1.25rem', letterSpacing: '-0.03em' }}>
            Compare Diagnostic Labs by Price, Turnaround Time & NABL Ratings
          </h1>

          <p style={{ fontSize: '1.15rem', color: '#E0F2F1', maxWidth: '780px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
            Empowering patients to choose from registered pathology labs for home blood sample collection, book 3.0T MRI/CT scans, schedule in-clinic doctor appointments, and save up to 70% with generic medicines.
          </p>

          {/* Unified Search Widget */}
          <div style={{ maxWidth: '820px', margin: '0 auto', backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '0.5rem', display: 'flex', alignItems: 'center', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 1rem', borderRight: '1.5px solid #E2E8F0' }}>
              <MapPin size={20} color="#006B70" />
              <span style={{ fontWeight: '700', color: '#0F172A', fontSize: '0.92rem' }}>Bangalore</span>
            </div>
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={22} color="#94A3B8" style={{ position: 'absolute', left: '16px' }} />
              <input
                type="text"
                placeholder="Search 500+ blood tests (Lipid, HbA1c), Scans (MRI Brain), or Doctors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '1rem 1rem 1rem 3.2rem', border: 'none', fontSize: '1rem', outline: 'none', color: '#0F172A' }}
              />
            </div>
            <button
              onClick={() => onNavigateLogin('PATIENT')}
              style={{ padding: '0.9rem 1.8rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              Compare Labs <ArrowRight size={18} />
            </button>
          </div>

          {/* Trust Highlights */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
            {[
              { icon: ShieldCheck, text: '100% NABL / CAP Certified Labs' },
              { icon: HomeIcon, text: 'Free Home Sample Collection' },
              { icon: Award, text: 'Ayushman Bharat (ABHA) Integrated' },
              { icon: TrendingUp, text: 'Up to 70% Generic Medicine Savings' }
            ].map((item, i) => {
              const IconComp = item.icon;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#E0F2F1' }}>
                  <IconComp size={18} color="#10B981" />
                  <span>{item.text}</span>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 3. CORE HEALTHCARE CATEGORIES */}
      <section style={{ maxWidth: '1240px', margin: '-2.5rem auto 4rem', padding: '0 1.5rem', position: 'relative', zIndex: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {[
            { title: 'Pathology Labs', desc: 'Price comparison across accredited labs', icon: FlaskConical, color: '#006B70', bg: '#E0F2F1', target: '#diagnostics' },
            { title: 'MRI & CT Scans', desc: '3.0T Silent MRI & Radiology slot booking', icon: Building2, color: '#06B6D4', bg: '#CFFAFE', target: '#scans' },
            { title: 'In-Clinic Doctors', desc: 'Walk-in OPD specialist appointments', icon: Stethoscope, color: '#8B5CF6', bg: '#EDE9FE', target: '#doctors' },
            { title: 'Generic Pharmacy', desc: 'Same salt composition, 1/3rd the cost', icon: Pill, color: '#10B981', bg: '#D1FAE5', target: '#pharmacy' },
            { title: 'ABHA Health Locker', desc: 'Smart biomarker trend analytics & reports', icon: FolderHeart, color: '#EC4899', bg: '#FCE7F3', target: '#abha' }
          ].map((cat, i) => {
            const IconComp = cat.icon;
            return (
              <a
                key={i}
                href={cat.target}
                style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', padding: '1.5rem', border: '1px solid #E2E8F0', textDecoration: 'none', color: 'inherit', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '0.75rem', transition: 'all 0.2s ease' }}
                className="card-hover"
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: cat.bg, color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconComp size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A' }}>{cat.title}</h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.2rem', lineHeight: 1.4 }}>{cat.desc}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', fontWeight: '700', color: cat.color, marginTop: 'auto' }}>
                  Explore <ChevronRight size={14} />
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* 4. MULTI-LAB COMPARISON SHOWCASE (FEATURE 1) */}
      <section id="diagnostics" style={{ maxWidth: '1240px', margin: '0 auto 5rem', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#006B70', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Transparency In Healthcare
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#0F172A', marginTop: '0.25rem' }}>
              How Multi-Lab Price Comparison Works
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.95rem' }}>
              Any accredited pathology lab can register. You choose based on price, turnaround time, distance, and verified patient reviews.
            </p>
          </div>
          <button
            onClick={() => onNavigateLogin('PATIENT')}
            style={{ padding: '0.65rem 1.25rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}
          >
            View All 500+ Tests
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {popularTests.map((test) => (
            <div key={test.id} style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '1.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A' }}>{test.name}</h3>
                    {test.popular && <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#92400E', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '700' }}>Most Booked</span>}
                  </div>
                  <span style={{ fontSize: '0.85rem', color: '#64748B' }}>{test.params} Clinical Parameters • {test.sample}</span>
                </div>
              </div>

              {/* Lab Options Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                {test.labs.map((lab, j) => (
                  <div key={j} style={{ backgroundColor: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <strong style={{ fontSize: '1.05rem', color: '#0F172A' }}>{lab.name}</strong>
                          {lab.nabl && <div style={{ fontSize: '0.72rem', color: '#2563EB', fontWeight: '700', marginTop: '0.15rem' }}>✓ NABL Accredited</div>}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#006B70' }}>₹{lab.price}</span>
                          <div style={{ fontSize: '0.78rem', color: '#94A3B8', textDecoration: 'line-through' }}>₹{lab.mrp}</div>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div>⏱️ Report TAT: <strong style={{ color: '#006B70' }}>{lab.tat}</strong></div>
                        <div>⭐ Rating: <strong>{lab.rating} / 5.0</strong></div>
                        <div>🏠 Home Collection: <strong style={{ color: lab.freeHome ? '#10B981' : '#64748B' }}>{lab.freeHome ? 'Free' : 'Standard'}</strong></div>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigateLogin('PATIENT')}
                      style={{ width: '100%', marginTop: '1rem', padding: '0.65rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      Book at {lab.name}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. RADIOLOGY & MRI SCANS (FEATURE 2) */}
      <section id="scans" style={{ backgroundColor: '#0F172A', color: '#FFFFFF', padding: '5rem 1.5rem', marginBottom: '5rem' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ maxWidth: '700px', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#06B6D4', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Advanced Imaging Hub
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '800', marginTop: '0.3rem' }}>
              Book 3.0T Silent MRI, CT & Ultrasound
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '1rem', marginTop: '0.5rem' }}>
              Direct hourly slot reservation with certified radiology centers. View machine specifications, low-radiation protocols, and pre-scan fasting instructions before booking.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {[
              { name: 'MRI Brain (Plain + Angio)', center: 'Aarthi Scans & Labs', spec: 'Siemens 3.0 Tesla Silent MRI', price: '₹3,499', mrp: '₹6,000', slot: 'Today, 5:00 PM' },
              { name: 'HRCT Chest (Low Dose)', center: 'Focus Imaging Center', spec: '128-Slice Low Dose CT', price: '₹2,499', mrp: '₹4,500', slot: 'Today, 6:30 PM' },
              { name: 'USG Whole Abdomen & Pelvis', center: 'Medall Diagnostics', spec: '4D Color Doppler Ultrasound', price: '₹1,199', mrp: '₹2,000', slot: 'Tomorrow, 9:30 AM' }
            ].map((scan, i) => (
              <div key={i} style={{ backgroundColor: '#1E293B', borderRadius: '18px', border: '1px solid #334155', padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#06B6D4', fontWeight: '700', textTransform: 'uppercase' }}>RADIOLOGY SCAN</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFF', marginTop: '0.2rem' }}>{scan.name}</h3>
                  <div style={{ fontSize: '0.88rem', color: '#94A3B8', marginTop: '0.4rem' }}>{scan.center}</div>
                  <div style={{ fontSize: '0.85rem', color: '#06B6D4', fontWeight: '600', marginTop: '0.2rem' }}>{scan.spec}</div>
                  <div style={{ fontSize: '0.82rem', color: '#10B981', marginTop: '0.5rem', fontWeight: '600' }}>⏰ Next Slot: {scan.slot}</div>
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#FFF' }}>{scan.price}</span>
                    <span style={{ fontSize: '0.85rem', color: '#64748B', textDecoration: 'line-through', marginLeft: '0.4rem' }}>{scan.mrp}</span>
                  </div>
                  <button
                    onClick={() => onNavigateLogin('PATIENT')}
                    style={{ padding: '0.65rem 1.25rem', backgroundColor: '#06B6D4', color: '#0F172A', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer' }}
                  >
                    Book Slot
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. IN-CLINIC DOCTOR APPOINTMENTS (FEATURE 3) */}
      <section id="doctors" style={{ maxWidth: '1240px', margin: '0 auto 5rem', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 3rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Verified Specialist Network
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#0F172A', marginTop: '0.25rem' }}>
            Book In-Clinic OPD Doctor Appointments
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.95rem' }}>
            Skip waiting lines at clinics. Book confirmed walk-in consultation slots with verified doctors and transparent fees.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {[
            { name: 'Dr. Ananya Sharma', specialty: 'General Physician & Diabetologist', qual: 'MBBS, MD (Internal Medicine)', clinic: 'MedMarg Care Clinic, Indiranagar', fee: '₹499', exp: '14 yrs exp', slot: 'Today, 4:30 PM' },
            { name: 'Dr. Rajeshwar Rao', specialty: 'Cardiologist', qual: 'MBBS, MD, DM (Cardiology)', clinic: 'Heart Wellness Institute, Koramangala', fee: '₹800', exp: '22 yrs exp', slot: 'Tomorrow, 10:00 AM' },
            { name: 'Dr. Priya Deshmukh', specialty: 'Dermatologist & Trichologist', qual: 'MBBS, DVD, MD', clinic: 'Skin & Aesthetic Clinic, HSR', fee: '₹600', exp: '9 yrs exp', slot: 'Today, 5:30 PM' }
          ].map((doc, i) => (
            <div key={i} style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: '#EDE9FE', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  <Stethoscope size={28} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>{doc.name}</h3>
                  <div style={{ color: '#8B5CF6', fontWeight: '600', fontSize: '0.88rem' }}>{doc.specialty}</div>
                  <div style={{ color: '#64748B', fontSize: '0.8rem' }}>{doc.qual} • {doc.exp}</div>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                <MapPin size={16} color="#8B5CF6" /> {doc.clinic}
              </div>

              <div style={{ paddingTop: '1rem', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Consultation Fee</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A' }}>{doc.fee}</div>
                </div>
                <button
                  onClick={() => onNavigateLogin('PATIENT')}
                  style={{ padding: '0.65rem 1.25rem', backgroundColor: '#8B5CF6', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Book Clinic Visit
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. GENERIC PHARMACY COST SAVER (FEATURE 4) */}
      <section id="pharmacy" style={{ backgroundColor: '#ECFDF5', padding: '5rem 1.5rem', marginBottom: '5rem', borderTop: '1px solid #D1FAE5', borderBottom: '1px solid #D1FAE5' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Affordable Medicine Revolution
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#065F46', marginTop: '0.3rem', lineHeight: 1.2 }}>
              Save Up to 70% with Quality Generic Medicines
            </h2>
            <p style={{ color: '#047857', fontSize: '1rem', marginTop: '0.75rem', lineHeight: 1.6 }}>
              Upload your prescription. Our pharmacists analyze active salt compositions and provide certified generic alternatives with identical clinical efficacy at 1/3rd of the branded cost.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#065F46', fontWeight: '600', fontSize: '0.95rem' }}>
                <CheckCircle2 size={18} color="#10B981" /> 100% CDSCO Approved Formulations
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#065F46', fontWeight: '600', fontSize: '0.95rem' }}>
                <CheckCircle2 size={18} color="#10B981" /> Prescription OCR Scanner with Google Drive Sync
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#065F46', fontWeight: '600', fontSize: '0.95rem' }}>
                <CheckCircle2 size={18} color="#10B981" /> Doorstep Delivery across Bangalore & Partner Cities
              </div>
            </div>

            <button
              onClick={() => onNavigateLogin('PATIENT')}
              style={{ marginTop: '2rem', padding: '0.9rem 1.8rem', backgroundColor: '#10B981', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              Upload Prescription & Save <ArrowRight size={18} />
            </button>
          </div>

          {/* Comparison Visual Card */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid #A7F3D0', padding: '2rem', boxShadow: '0 20px 40px -10px rgba(16,185,129,0.15)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A', marginBottom: '1.25rem' }}>Real Patient Cost-Comparison Example</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>BRANDED MEDICINE</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                  <div>
                    <strong style={{ color: '#0F172A' }}>Lipaglyn 4mg Tablet</strong>
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Saroglitazar (4mg)</div>
                  </div>
                  <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#64748B' }}>₹289</span>
                </div>
              </div>

              <div style={{ padding: '1.25rem', backgroundColor: '#D1FAE5', borderRadius: '14px', border: '2px solid #10B981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#10B981', color: '#FFF', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '800' }}>SAVE 53%</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#065F46' }}>₹135</span>
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <strong style={{ fontSize: '1.05rem', color: '#065F46' }}>Saroglitazar 4mg (MedMarg Generic)</strong>
                  <div style={{ fontSize: '0.8rem', color: '#047857' }}>Identical Salt, Strength & Quality Standard</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. ABHA HEALTH LOCKER & GOOGLE DRIVE INTEGRATION (FEATURE 5) */}
      <section id="abha" style={{ maxWidth: '1240px', margin: '0 auto 5rem', padding: '0 1.5rem' }}>
        <div style={{ backgroundColor: '#0F172A', borderRadius: '28px', color: '#FFFFFF', padding: '3.5rem 3rem', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', backgroundColor: 'rgba(16,185,129,0.2)', color: '#10B981', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', marginBottom: '1rem' }}>
              <Award size={14} /> National Digital Health Ecosystem
            </div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '800', lineHeight: 1.2 }}>
              Ayushman Bharat Digital Health Locker (ABHA)
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '1rem', marginTop: '0.75rem', lineHeight: 1.6 }}>
              All your diagnostic reports, scan images, and prescriptions from different labs are unified under your ABHA ID with automatic biomarker trends (Cholesterol, HbA1c, Liver enzymes) and secure Google Drive shareable links.
            </p>

            <button
              onClick={() => onNavigateLogin('PATIENT')}
              style={{ marginTop: '2rem', padding: '0.85rem 1.6rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' }}
            >
              Link ABHA & View Reports
            </button>
          </div>

          <div style={{ backgroundColor: '#1E293B', borderRadius: '20px', border: '1px solid #334155', padding: '1.75rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: '600' }}>CONNECTED HEALTH LOCKER</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FFF', marginTop: '0.2rem' }}>ABHA: rahul.sharma@abdm</div>

            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem 1rem', backgroundColor: '#0F172A', borderRadius: '10px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem' }}>Apollo Diagnostics (Lipid Profile)</span>
                <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '700' }}>Google Drive Synced</span>
              </div>
              <div style={{ padding: '0.75rem 1rem', backgroundColor: '#0F172A', borderRadius: '10px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem' }}>Aarthi Scans (MRI Brain 3.0T)</span>
                <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '700' }}>Google Drive Synced</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. PARTNER ONBOARDING CALL TO ACTION */}
      <section style={{ maxWidth: '1240px', margin: '0 auto 5rem', padding: '0 1.5rem' }}>
        <div style={{ backgroundColor: '#F1F5F9', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '3rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0F172A' }}>
              Are you a Diagnostic Lab, Scan Center, Doctor or Pharmacy?
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '0.4rem' }}>
              Join MedMarg marketplace to expand your reach, manage home collection slots, and receive direct patient bookings.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => onNavigateLogin('DIAGNOSTIC_LAB')}
              style={{ padding: '0.85rem 1.6rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' }}
            >
              Register Your Lab / Clinic
            </button>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer style={{ backgroundColor: '#0F172A', color: '#94A3B8', padding: '4rem 1.5rem 2rem', borderTop: '1px solid #1E293B' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#FFF', fontWeight: '800', fontSize: '1.25rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#006B70', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>M</div>
              MedMarg
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
              India's transparent multi-lab diagnostic marketplace and healthcare ecosystem.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#FFF', fontWeight: '700', marginBottom: '1rem', fontSize: '0.95rem' }}>For Patients</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <a href="#diagnostics" style={{ color: '#94A3B8', textDecoration: 'none' }}>Compare Pathology Labs</a>
              <a href="#scans" style={{ color: '#94A3B8', textDecoration: 'none' }}>MRI & CT Scans</a>
              <a href="#doctors" style={{ color: '#94A3B8', textDecoration: 'none' }}>Book In-Clinic Doctor</a>
              <a href="#pharmacy" style={{ color: '#94A3B8', textDecoration: 'none' }}>Generic Medicines</a>
              <a href="#abha" style={{ color: '#94A3B8', textDecoration: 'none' }}>ABHA Health Locker</a>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#FFF', fontWeight: '700', marginBottom: '1rem', fontSize: '0.95rem' }}>For Healthcare Partners</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <button onClick={() => onNavigateLogin('DIAGNOSTIC_LAB')} style={{ background: 'none', border: 'none', color: '#94A3B8', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}>Register Diagnostic Lab</button>
              <button onClick={() => onNavigateLogin('SCAN_CENTER')} style={{ background: 'none', border: 'none', color: '#94A3B8', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}>Register Scan Center</button>
              <button onClick={() => onNavigateLogin('DOCTOR')} style={{ background: 'none', border: 'none', color: '#94A3B8', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}>Register Clinic / Doctor</button>
              <button onClick={() => onNavigateLogin('PHARMACY')} style={{ background: 'none', border: 'none', color: '#94A3B8', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}>Register Pharmacy</button>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#FFF', fontWeight: '700', marginBottom: '1rem', fontSize: '0.95rem' }}>Mobile Apps</h4>
            <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>Download MedMarg for Android (Kotlin) & iOS (Swift)</p>
            <div style={{ fontSize: '0.75rem', backgroundColor: '#1E293B', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #334155' }}>
              📱 Android APK & iOS IPA in Build Pipeline
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1240px', margin: '0 auto', paddingTop: '2rem', borderTop: '1px solid #1E293B', textAlign: 'center', fontSize: '0.8rem' }}>
          © 2026 MedMarg Healthcare Platform (https://www.medmarg.com/). NABL, CAP & ABHA Certified. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
