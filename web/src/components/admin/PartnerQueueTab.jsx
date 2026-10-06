import React, { useState } from 'react';
import { 
  Stethoscope, 
  Building2, 
  Activity, 
  HeartHandshake, 
  ShieldCheck, 
  PlusCircle, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Percent, 
  CheckCircle2, 
  Clock, 
  FileText, 
  X, 
  Eye, 
  DollarSign,
  TrendingUp,
  Building
} from 'lucide-react';

const INITIAL_PARTNER_DATA = [
  { 
    id: 'P-101', 
    name: 'Dr. K. Sivasankar (MD General Medicine)', 
    category: 'DOCTORS_OPD',
    type: 'Doctor / OPD Practice', 
    city: 'Tirupati (Bairagipatteda)', 
    phone: '+91 94400 12345', 
    email: 'dr.siva@gmail.com', 
    experience: '14 Years',
    assignedMargin: '20%', 
    specialty: 'Internal Medicine & Diabetes Care',
    referredPatientsCount: 64,
    commissionEarned: '₹18,400',
    status: 'PRE_REGISTERED',
    appliedDate: 'Yesterday 04:30 PM',
    documents: 'KMC_Medical_Council_License_AP1902.pdf'
  },
  { 
    id: 'P-102', 
    name: 'Sri Diagnostics & High-Field MRI Center', 
    category: 'RADIOLOGY_MRI',
    type: 'Radiology / MRI & CT Scan Center', 
    city: 'Tirupati (Air Bypass Road)', 
    phone: '+91 98490 54321', 
    email: 'sridiag.mri@gmail.com', 
    experience: '8 Years',
    assignedMargin: '18%', 
    specialty: '1.5T MRI, 64-Slice CT, Ultrasound & 2D Echo',
    referredPatientsCount: 92,
    commissionEarned: '₹34,200',
    status: 'PRE_REGISTERED',
    appliedDate: 'Yesterday 02:15 PM',
    documents: 'AERB_Radiation_Safety_Cert_2026.pdf'
  },
  { 
    id: 'P-103', 
    name: 'Dr. Anita Roy (Certified Clinical Nutritionist)', 
    category: 'HEALTH_COACHES',
    type: 'Health, Diet & Nutrition Coach', 
    city: 'Bangalore & Tirupati Virtual OPD', 
    phone: '+91 98800 67890', 
    email: 'anita.health@gmail.com', 
    experience: '6 Years',
    assignedMargin: '15%', 
    specialty: 'PCOS / Thyroid Metabolic Nutrition & Diabetes Reversal',
    referredPatientsCount: 38,
    commissionEarned: '₹9,800',
    status: 'PRE_REGISTERED',
    appliedDate: 'Today 08:45 AM',
    documents: 'IDA_Clinical_Nutritionist_Registration.pdf'
  },
  { 
    id: 'P-104', 
    name: 'Balaji Micro-Pathology & Bio-Reference Lab', 
    category: 'DIAGNOSTIC_LABS',
    type: 'Standalone Pathology Hub', 
    city: 'Chittoor Town', 
    phone: '+91 94401 55667', 
    email: 'balaji.pathlab@gmail.com', 
    experience: '11 Years',
    assignedMargin: '22%', 
    specialty: 'Routine Hematology, Urine Micro & Clinical Biochemistry',
    referredPatientsCount: 110,
    commissionEarned: '₹41,000',
    status: 'ONBOARDED',
    appliedDate: '02 Oct 2026',
    documents: 'AP_Clinical_Establishment_Reg.pdf'
  },
  { 
    id: 'P-105', 
    name: 'Amaravati Industrial Employees Health Federation', 
    category: 'HOSPITAL_CORPORATE',
    type: 'Corporate Health / Factory Tie-up', 
    city: 'Renigunta Industrial Estate', 
    phone: '+91 98492 11002', 
    email: 'corp.wellness@amaravati-ind.com', 
    experience: 'Corporate Tie-up',
    assignedMargin: 'Flat B2B Net Rates', 
    specialty: 'Annual Factory Worker Medical Screenings (500+ Staff)',
    referredPatientsCount: 450,
    commissionEarned: '₹1,25,000',
    status: 'ONBOARDED',
    appliedDate: '28 Sep 2026',
    documents: 'Corporate_MoU_Contract_2026.pdf'
  }
];

export default function PartnerQueueTab({
  partnerQueue = INITIAL_PARTNER_DATA,
  setPartnerQueue = () => {},
  initialCategoryTab = 'ALL_PARTNERS',
  API_BASE,
  safeFetch
}) {
  const [activeCategoryTab, setActiveCategoryTab] = useState(initialCategoryTab);
  const [partners, setPartners] = useState(partnerQueue.length > 0 ? partnerQueue : INITIAL_PARTNER_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocPartner, setSelectedDocPartner] = useState(null);
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);

  // New Partner Modal Form
  const [addPartnerForm, setAddPartnerForm] = useState({
    id: `P-${Math.floor(106 + Math.random() * 90)}`,
    name: '',
    category: 'DOCTORS_OPD',
    type: 'Doctor / OPD Practice',
    city: 'Tirupati',
    phone: '',
    email: '',
    specialty: '',
    assignedMargin: '20%',
    status: 'PRE_REGISTERED',
    appliedDate: 'Just now',
    documents: 'Medical_Registration_Certificate.pdf'
  });

  const categories = [
    { key: 'ALL_PARTNERS', label: 'All Applications', icon: HeartHandshake, badge: `${partners.length}` },
    { key: 'DOCTORS_OPD', label: 'Doctors & OPD Clinics', icon: Stethoscope, badge: `${partners.filter(p => p.category === 'DOCTORS_OPD').length}` },
    { key: 'DIAGNOSTIC_LABS', label: 'Pathology & Diagnostic Labs', icon: Building2, badge: `${partners.filter(p => p.category === 'DIAGNOSTIC_LABS').length}` },
    { key: 'RADIOLOGY_MRI', label: 'Radiology & MRI Centers', icon: Activity, badge: `${partners.filter(p => p.category === 'RADIOLOGY_MRI').length}` },
    { key: 'HEALTH_COACHES', label: 'Dietitians & Health Coaches', icon: ShieldCheck, badge: `${partners.filter(p => p.category === 'HEALTH_COACHES').length}` },
    { key: 'HOSPITAL_CORPORATE', label: 'Corporate & Hospitals', icon: Building, badge: `${partners.filter(p => p.category === 'HOSPITAL_CORPORATE').length}` }
  ];

  const filteredPartners = partners.filter(p => {
    const matchesCategory = activeCategoryTab === 'ALL_PARTNERS' || p.category === activeCategoryTab;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.phone.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const handleApprovePartner = async (partnerId) => {
    try {
      if (safeFetch && API_BASE) {
        await safeFetch(`${API_BASE}/api/v1/admin/partners/onboard`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: partnerId })
        });
      }
    } catch (e) {}

    const updated = partners.map(p => p.id === partnerId ? { ...p, status: 'ONBOARDED' } : p);
    setPartners(updated);
    setPartnerQueue(updated);
    alert('✅ Healthcare Partner approved & onboarded to MedMarg Master Hub!');
  };

  const handleAddPartnerSubmit = (e) => {
    e.preventDefault();
    const newPartner = { ...addPartnerForm };
    const updated = [newPartner, ...partners];
    setPartners(updated);
    setPartnerQueue(updated);
    setShowAddPartnerModal(false);
    alert(`✅ Application Registered: ${newPartner.name} added to ${newPartner.type} desk.`);
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A' }}>Healthcare Partner Intake & Registration Desk</h2>
            <span style={{ fontSize: '0.75rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.55rem', borderRadius: '6px', fontWeight: '800' }}>
              B2B Healthcare Network
            </span>
          </div>
          <p style={{ color: '#64748B', fontSize: '0.85rem' }}>
            Category-specific intake desks for Doctors, Pathology Labs, Radiology Centers, and Corporate Tie-ups with referral margin assignments.
          </p>
        </div>

        <button
          onClick={() => setShowAddPartnerModal(true)}
          style={{ padding: '0.65rem 1.25rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem', boxShadow: '0 4px 14px rgba(0,107,112,0.2)' }}
        >
          <PlusCircle size={16} color="#FBBF24" /> Pre-Register Partner
        </button>
      </div>

      {/* Category Sub-Tabs Bar */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        backgroundColor: '#FFFFFF', 
        padding: '0.5rem', 
        borderRadius: '14px', 
        border: '1px solid #E2E8F0', 
        marginBottom: '1.5rem',
        overflowX: 'auto',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        {categories.map(cat => {
          const CatIcon = cat.icon;
          const isActive = activeCategoryTab === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategoryTab(cat.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.65rem 1.1rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: isActive ? '#006B70' : 'transparent',
                color: isActive ? '#FFFFFF' : '#64748B',
                fontWeight: isActive ? '800' : '600',
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <CatIcon size={16} color={isActive ? '#FBBF24' : '#64748B'} />
              <span>{cat.label}</span>
              <span style={{ 
                fontSize: '0.7rem', 
                backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#F1F5F9', 
                color: isActive ? '#FFF' : '#475569', 
                padding: '0.1rem 0.45rem', 
                borderRadius: '6px', 
                fontWeight: '800' 
              }}>
                {cat.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Stats Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0F172A' }}>
          Showing <strong>{filteredPartners.length}</strong> Partner Applications in this Category
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          <input
            type="text"
            placeholder="Search partner by name, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.82rem', backgroundColor: '#FFFFFF' }}
          />
        </div>
      </div>

      {/* Main Partners Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '1rem 1.25rem' }}>Partner / Practice Name</th>
                <th style={{ padding: '1rem' }}>Category & Specialty</th>
                <th style={{ padding: '1rem' }}>Location</th>
                <th style={{ padding: '1rem' }}>Contact Details</th>
                <th style={{ padding: '1rem' }}>Margin / Tie-up</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPartners.map(p => {
                const isPending = p.status === 'PRE_REGISTERED';
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: '800', color: '#0F172A' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'monospace' }}>ID: {p.id} • Applied: {p.appliedDate}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ color: '#006B70', fontWeight: '800', fontSize: '0.84rem' }}>{p.type}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{p.specialty}</div>
                    </td>
                    <td style={{ padding: '1rem', color: '#334155' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={13} color="#006B70" /> {p.city}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ color: '#0F172A', fontWeight: '700', fontSize: '0.84rem' }}>{p.phone}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{p.email}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontSize: '0.78rem', backgroundColor: '#E0F2FE', color: '#0369A1', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '800' }}>
                        {p.assignedMargin}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '800', backgroundColor: isPending ? '#FEF3C7' : '#DCFCE7', color: isPending ? '#B45309' : '#15803D' }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button
                          onClick={() => setSelectedDocPartner(p)}
                          style={{ padding: '0.4rem 0.75rem', backgroundColor: '#F1F5F9', color: '#006B70', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Eye size={13} /> View Docs
                        </button>
                        {isPending ? (
                          <button
                            onClick={() => handleApprovePartner(p.id)}
                            style={{ padding: '0.4rem 0.85rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,107,112,0.2)' }}
                          >
                            Approve & Onboard
                          </button>
                        ) : (
                          <span style={{ color: '#059669', fontSize: '0.8rem', fontWeight: '800' }}>✓ Active</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: VIEW PARTNER DOCUMENTS MODAL */}
      {selectedDocPartner && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '580px', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>Partner Verification Dossier</h3>
                <div style={{ fontSize: '0.8rem', color: '#006B70', fontWeight: '700' }}>{selectedDocPartner.name}</div>
              </div>
              <button onClick={() => setSelectedDocPartner(null)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.3rem' }}>
                  📜 Registration / Medical License Document
                </div>
                <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px dashed #CBD5E1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={24} color="#006B70" />
                  <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0F172A' }}>{selectedDocPartner.documents}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.84rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700' }}>ASSIGNED MARGIN</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#006B70' }}>{selectedDocPartner.assignedMargin}</div>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700' }}>TOTAL PATIENTS SENT</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>{selectedDocPartner.referredPatientsCount || 0}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  onClick={() => setSelectedDocPartner(null)}
                  style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW PARTNER MODAL */}
      {showAddPartnerModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '540px', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>Pre-Register Healthcare Partner</h3>
                <div style={{ fontSize: '0.8rem', color: '#006B70', fontWeight: '700' }}>Auto ID: {addPartnerForm.id}</div>
              </div>
              <button onClick={() => setShowAddPartnerModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleAddPartnerSubmit} style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Partner / Practice Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. R. Krishna Reddy (Diabetologist)"
                  value={addPartnerForm.name}
                  onChange={(e) => setAddPartnerForm({ ...addPartnerForm, name: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Category *</label>
                  <select
                    value={addPartnerForm.category}
                    onChange={(e) => {
                      const typeMap = {
                        DOCTORS_OPD: 'Doctor / OPD Practice',
                        DIAGNOSTIC_LABS: 'Standalone Pathology Hub',
                        RADIOLOGY_MRI: 'Radiology / MRI & CT Scan Center',
                        HEALTH_COACHES: 'Health, Diet & Nutrition Coach',
                        HOSPITAL_CORPORATE: 'Corporate Health / Factory Tie-up'
                      };
                      setAddPartnerForm({
                        ...addPartnerForm,
                        category: e.target.value,
                        type: typeMap[e.target.value] || 'Healthcare Partner'
                      });
                    }}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                  >
                    <option value="DOCTORS_OPD">Doctor / OPD Practice</option>
                    <option value="DIAGNOSTIC_LABS">Pathology & Diagnostic Lab</option>
                    <option value="RADIOLOGY_MRI">Radiology & MRI Scan Center</option>
                    <option value="HEALTH_COACHES">Dietitian & Health Coach</option>
                    <option value="HOSPITAL_CORPORATE">Corporate & Hospital Tie-up</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Assigned Commission %</label>
                  <input
                    type="text"
                    required
                    value={addPartnerForm.assignedMargin}
                    onChange={(e) => setAddPartnerForm({ ...addPartnerForm, assignedMargin: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 94400 00000"
                    value={addPartnerForm.phone}
                    onChange={(e) => setAddPartnerForm({ ...addPartnerForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>City / Location *</label>
                  <input
                    type="text"
                    required
                    value={addPartnerForm.city}
                    onChange={(e) => setAddPartnerForm({ ...addPartnerForm, city: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAddPartnerModal(false)}
                  style={{ padding: '0.65rem 1.25rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Submit Pre-Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
