import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  ShoppingCart, 
  FolderHeart, 
  ShieldAlert, 
  Calendar, 
  Clock, 
  Star, 
  CheckCircle, 
  ArrowRight, 
  ExternalLink,
  ChevronDown,
  Sparkles,
  Award,
  FileText
} from 'lucide-react';

export default function PatientDashboard({ user, onSwitchRole, onLogout }) {
  const [activeTab, setActiveTab] = useState('DIAGNOSTICS'); // 'DIAGNOSTICS' | 'SCANS' | 'DOCTORS' | 'PHARMACY' | 'LOCKER'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [cartItems, setCartItems] = useState([
    {
      id: 'c1',
      title: 'Lipid Profile (Complete Cholesterol)',
      lab: 'Apollo Diagnostics',
      price: 499,
      mrp: 850,
      isHomeCollection: true
    }
  ]);

  const diagnosticTests = [
    {
      id: 't_lipid',
      name: 'Lipid Profile (Complete Cholesterol)',
      category: 'Heart Health',
      sample: 'Blood (12h Fasting)',
      params: 8,
      labs: [
        { name: 'Apollo Diagnostics', price: 499, mrp: 850, tat: '6 hrs', nabl: true, rating: 4.8, dist: '1.8 km', freeHome: true },
        { name: 'Dr. Lal PathLabs', price: 549, mrp: 900, tat: '8 hrs', nabl: true, rating: 4.7, dist: '2.4 km', freeHome: false },
        { name: 'Thyrocare Central Lab', price: 399, mrp: 750, tat: '12 hrs', nabl: true, rating: 4.6, dist: '3.2 km', freeHome: true }
      ]
    },
    {
      id: 't_hba1c',
      name: 'HbA1c (Glycosylated Hemoglobin)',
      category: 'Diabetes Care',
      sample: 'Blood (No Fasting)',
      params: 2,
      labs: [
        { name: 'Thyrocare Central Lab', price: 299, mrp: 600, tat: '6 hrs', nabl: true, rating: 4.6, dist: '3.2 km', freeHome: true },
        { name: 'Apollo Diagnostics', price: 349, mrp: 650, tat: '4 hrs', nabl: true, rating: 4.8, dist: '1.8 km', freeHome: true },
        { name: 'Dr. Lal PathLabs', price: 399, mrp: 700, tat: '6 hrs', nabl: true, rating: 4.7, dist: '2.4 km', freeHome: false }
      ]
    }
  ];

  const radiologyScans = [
    {
      id: 's_mri',
      name: 'MRI Brain (Plain + Angio)',
      modality: 'MRI (Magnetic Resonance)',
      centers: [
        { name: 'Aarthi Scans & Labs', spec: 'Siemens 3.0 Tesla Silent MRI', price: 3499, mrp: 6000, slot: 'Today, 5:00 PM', rating: 4.8, dist: '2.1 km' },
        { name: 'Medall Diagnostic Center', spec: 'GE 1.5T Wide Bore', price: 2999, mrp: 5200, slot: 'Today, 6:30 PM', rating: 4.6, dist: '3.5 km' }
      ]
    }
  ];

  const doctorsList = [
    {
      id: 'd1',
      name: 'Dr. Ananya Sharma',
      specialty: 'General Physician & Diabetologist',
      qual: 'MBBS, MD (Internal Medicine)',
      clinic: 'MedMarg Care Clinic, Indiranagar',
      fee: 499,
      slot: 'Today, 4:30 PM (Clinic Visit)'
    },
    {
      id: 'd2',
      name: 'Dr. Rajeshwar Rao',
      specialty: 'Cardiologist',
      qual: 'MBBS, MD, DM (Cardiology)',
      clinic: 'Heart Wellness Institute, Koramangala',
      fee: 800,
      slot: 'Tomorrow, 10:00 AM (Clinic Visit)'
    }
  ];

  const healthRecords = [
    {
      title: 'Complete Lipid Profile Report',
      lab: 'Apollo Diagnostics',
      date: '24 Aug 2026',
      // Google Drive link integration
      driveUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view',
      biomarkers: [
        { name: 'Total Cholesterol', val: '215 mg/dL', status: 'High', ref: '< 200' },
        { name: 'HDL (Good)', val: '52 mg/dL', status: 'Normal', ref: '> 40' },
        { name: 'LDL (Bad)', val: '138 mg/dL', status: 'High', ref: '< 100' }
      ]
    }
  ];

  const addToCart = (item) => {
    setCartItems([...cartItems, item]);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <nav style={{ backgroundColor: '#004D40', color: '#FFF', padding: '0.85rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>M</div>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em' }}>MedMarg</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(255,255,255,0.12)', padding: '0.4rem 0.85rem', borderRadius: '20px', fontSize: '0.85rem' }}>
            <MapPin size={16} color="#10B981" />
            <span style={{ color: '#E0F2F1' }}>Delivering to:</span>
            <strong style={{ color: '#FFF' }}>Indiranagar, Bangalore</strong>
            <ChevronDown size={14} color="#E0F2F1" />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.35rem 0.75rem', borderRadius: '20px' }}>
            <span style={{ fontSize: '0.85rem' }}>Logged in as: <strong>{user?.name || 'Patient'}</strong></span>
            <button onClick={onSwitchRole} style={{ background: '#10B981', border: 'none', color: '#FFF', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}>Switch Role</button>
          </div>

          <button onClick={onLogout} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: '#FFF', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </nav>

      {/* Hero Banner & Search */}
      <div style={{ backgroundColor: '#006B70', padding: '2rem 2rem 2.5rem', color: '#FFF' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            Compare Labs & Diagnostic Centers Near You
          </h2>
          <p style={{ color: '#E0F2F1', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
            NABL Accredited Pathology Labs • 3.0T MRI & CT Centers • In-Clinic Doctor Appointments • Generic Medicines
          </p>

          <div style={{ position: 'relative', maxWidth: '750px' }}>
            <Search size={22} color="#006B70" style={{ position: 'absolute', top: '15px', left: '16px' }} />
            <input
              type="text"
              placeholder="Search tests (e.g. Lipid Profile, HbA1c, Thyroid), Scans (MRI Brain), or Doctors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '1rem 1rem 1rem 3.2rem', borderRadius: '16px', border: 'none', fontSize: '1rem', outline: 'none', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ backgroundColor: '#FFF', borderBottom: '1px solid #E2E8F0', padding: '0 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '2rem' }}>
          {[
            { id: 'DIAGNOSTICS', label: 'Multi-Lab Tests', count: '500+ Tests' },
            { id: 'SCANS', label: 'MRI & Radiology Scans', count: 'Partner Centers' },
            { id: 'DOCTORS', label: 'Book Doctor (In-Clinic)', count: 'Verified OPD' },
            { id: 'LOCKER', label: 'ABHA Health Locker & Reports', count: 'Google Drive Sync' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '1rem 0.5rem',
                border: 'none',
                background: 'none',
                borderBottom: activeTab === tab.id ? '3px solid #006B70' : '3px solid transparent',
                color: activeTab === tab.id ? '#006B70' : '#64748B',
                fontWeight: activeTab === tab.id ? '700' : '500',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              {tab.label} <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.4rem', backgroundColor: '#F1F5F9', borderRadius: '10px', color: '#64748B', marginLeft: '0.3rem' }}>{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1100px', margin: '2rem auto', width: '100%', padding: '0 1rem', flex: 1 }}>
        
        {/* TAB 1: DIAGNOSTICS MULTI-LAB COMPARISON */}
        {activeTab === 'DIAGNOSTICS' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0F172A' }}>Available Diagnostic Tests</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Compare accredited pathology labs on price, turnaround time & distance</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {diagnosticTests.map((test) => (
                <div key={test.id} style={{ backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0F172A' }}>{test.name}</h4>
                        <span style={{ fontSize: '0.75rem', backgroundColor: '#E0F2F1', color: '#006B70', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '700' }}>{test.category}</span>
                      </div>
                      <span style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.25rem', display: 'block' }}>{test.params} Parameters • {test.sample}</span>
                    </div>
                  </div>

                  {/* Labs Comparison Rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {test.labs.map((lab, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <strong style={{ color: '#0F172A', fontSize: '1rem' }}>{lab.name}</strong>
                            {lab.nabl && <span style={{ fontSize: '0.7rem', backgroundColor: '#DBEAFE', color: '#2563EB', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: '700' }}>NABL</span>}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                            <span>⭐ {lab.rating}</span>
                            <span>• {lab.dist} away</span>
                            <span style={{ color: '#006B70', fontWeight: '600' }}>• TAT: {lab.tat}</span>
                            {lab.freeHome && <span style={{ color: '#10B981', fontWeight: '600' }}>• Free Home Collection</span>}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#006B70' }}>₹{lab.price}</div>
                            <div style={{ fontSize: '0.8rem', color: '#94A3B8', textDecoration: 'line-through' }}>₹{lab.mrp}</div>
                          </div>
                          <button
                            onClick={() => addToCart({ id: `${test.id}_${lab.name}`, title: test.name, lab: lab.name, price: lab.price, mrp: lab.mrp, isHomeCollection: lab.freeHome })}
                            style={{ padding: '0.6rem 1.2rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                          >
                            Select Lab
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: RADIOLOGY SCANS */}
        {activeTab === 'SCANS' && (
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0F172A', marginBottom: '1.5rem' }}>Radiology & Advanced Scan Centers</h3>
            {radiologyScans.map((scan) => (
              <div key={scan.id} style={{ backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0F172A' }}>{scan.name}</h4>
                <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1rem' }}>{scan.modality}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {scan.centers.map((center, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <div>
                        <strong style={{ fontSize: '1rem', color: '#0F172A' }}>{center.name}</strong>
                        <div style={{ fontSize: '0.85rem', color: '#006B70', fontWeight: '600' }}>{center.spec}</div>
                        <div style={{ fontSize: '0.8rem', color: '#10B981', marginTop: '0.2rem' }}>Next Available Slot: {center.slot}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#006B70' }}>₹{center.price}</div>
                          <div style={{ fontSize: '0.8rem', color: '#94A3B8', textDecoration: 'line-through' }}>₹{center.mrp}</div>
                        </div>
                        <button style={{ padding: '0.6rem 1.2rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>
                          Book Slot
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: IN-CLINIC DOCTOR APPOINTMENTS */}
        {activeTab === 'DOCTORS' && (
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.4rem' }}>Book In-Clinic Doctor Appointments</h3>
            <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Walk-in OPD consultation slots with verified specialists (No video calls)</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: '1.25rem' }}>
              {doctorsList.map((doc) => (
                <div key={doc.id} style={{ backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0F172A' }}>{doc.name}</h4>
                  <div style={{ color: '#006B70', fontWeight: '600', fontSize: '0.9rem' }}>{doc.specialty}</div>
                  <div style={{ color: '#64748B', fontSize: '0.85rem' }}>{doc.qual}</div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={15} color="#006B70" /> {doc.clinic}
                  </div>
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Consultation Fee</span>
                      <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A' }}>₹{doc.fee}</div>
                    </div>
                    <button style={{ padding: '0.6rem 1.2rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={16} /> Book Clinic Visit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ABHA HEALTH LOCKER & GOOGLE DRIVE REPORTS */}
        {activeTab === 'LOCKER' && (
          <div>
            <div style={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', backgroundColor: '#10B981', color: '#FFF', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '700' }}>ABHA LINKED</span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginTop: '0.4rem' }}>Ayushman Bharat Health Locker (ABDM)</h3>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>ABHA ID: rahul.sharma@abdm • 14 Diagnostic Labs Connected</p>
              </div>
              <Award size={48} color="#10B981" />
            </div>

            <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0F172A', marginBottom: '1rem' }}>Your Diagnostic Reports & Google Drive Links</h4>

            {healthRecords.map((rec, i) => (
              <div key={i} style={{ backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h5 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0F172A' }}>{rec.title}</h5>
                    <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Issued by {rec.lab} • {rec.date}</span>
                  </div>

                  {/* Google Drive Link Opener */}
                  <a
                    href={rec.driveUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', backgroundColor: '#E0F2F1', color: '#006B70', borderRadius: '8px', textDecoration: 'none', fontWeight: '700', fontSize: '0.85rem' }}
                  >
                    <FileText size={16} /> Open Google Drive PDF <ExternalLink size={14} />
                  </a>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  {rec.biomarkers.map((bio, j) => (
                    <div key={j} style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{bio.name}</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '800', color: bio.status === 'High' ? '#EF4444' : '#10B981' }}>{bio.val}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Ref: {bio.ref}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
