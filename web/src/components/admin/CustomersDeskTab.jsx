import React, { useState, useEffect } from 'react';
import { Users, Search, MapPin, Phone, UserCheck, ShieldCheck, Heart, FileText, Calendar, Plus, X, ChevronRight, Activity, RefreshCw } from 'lucide-react';
import { API_BASE, safeFetch } from '../../data/apiConfig';

export default function CustomersDeskTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'ABDM_LINKED' | 'FAMILY_LINKED'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [dossierTab, setDossierTab] = useState('PERSONAL'); // 'PERSONAL' | 'LOCATIONS' | 'FAMILY' | 'ORDERS'
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
    name: '',
    phone: '',
    email: '',
    city: 'Tirupati',
    abhaId: 'ABHA-9081-2026',
    age: 34,
    gender: 'Male',
    bloodGroup: 'O+',
    chronicConditions: 'None',
    allergies: 'Penicillin'
  });

  // Customers Data with dynamic backend sync
  const [customers, setCustomers] = useState([
    {
      id: 'CUST-1004',
      name: 'Doraswamy Raju Meesala',
      phone: '+91 83745 42478',
      email: 'doraswamyraju.ca@gmail.com',
      city: 'Tirupati',
      abhaId: 'ABHA-8374-2026',
      memberSince: 'Oct 2026',
      age: 30,
      gender: 'Male',
      bloodGroup: 'O+',
      chronicConditions: 'None',
      allergies: 'None',
      locations: [
        { id: 'LOC-101', label: 'Home Address', fullAddress: 'Plot 42, Air Bypass Road, Tirupati, AP - 517501', pincode: '517501', isPrimary: true }
      ],
      familyMembers: [],
      orderHistory: []
    },
    {
      id: 'CUST-1001',
      name: 'Rahul Sharma',
      phone: '+91 98765 43210',
      email: 'rahul.sharma@gmail.com',
      city: 'Tirupati',
      abhaId: 'ABHA-3109-8812',
      memberSince: 'Jan 2025',
      age: 36,
      gender: 'Male',
      bloodGroup: 'B+',
      chronicConditions: 'Type-2 Pre-Diabetic',
      allergies: 'Dust Mites',
      locations: [
        { id: 'LOC-1', label: 'Home Address', fullAddress: 'Flat 402, Sri Sai Towers, Bairagipatteda, Tirupati', pincode: '517501', isPrimary: true },
        { id: 'LOC-2', label: 'Office Address', fullAddress: 'Floor 2, Tech Park, Renigunta Rd, Tirupati', pincode: '517506', isPrimary: false }
      ],
      familyMembers: [
        { id: 'FAM-1', name: 'Ananya Sharma', relation: 'Spouse', age: 33, gender: 'Female', bloodGroup: 'B+' },
        { id: 'FAM-2', name: 'Aarav Sharma', relation: 'Son', age: 7, gender: 'Male', bloodGroup: 'O+' },
        { id: 'FAM-3', name: 'Savitri Sharma', relation: 'Mother', age: 62, gender: 'Female', bloodGroup: 'A+' }
      ],
      orderHistory: [
        { id: 'MM-8921', date: 'Today 07:30 AM', items: 'HbA1c + Complete Blood Count', amount: 899, status: 'EN_ROUTE', lab: 'MedMarg Central Lab' },
        { id: 'MM-7810', date: '15 Aug 2026', items: 'Full Body Lipid & Diabetic Profile', amount: 1499, status: 'COMPLETED', lab: 'Apollo Diagnostics Hub' }
      ]
    },
    {
      id: 'CUST-1002',
      name: 'Priya Verma',
      phone: '+91 98765 88990',
      email: 'priya.v@gmail.com',
      city: 'Tirupati',
      abhaId: 'ABHA-4410-9920',
      memberSince: 'Mar 2025',
      age: 29,
      gender: 'Female',
      bloodGroup: 'O+',
      chronicConditions: 'Thyroid (Hypothyroidism)',
      allergies: 'None',
      locations: [
        { id: 'LOC-1', label: 'Home Address', fullAddress: 'House #12, Air Bypass Road, Tirupati', pincode: '517507', isPrimary: true }
      ],
      familyMembers: [
        { id: 'FAM-1', name: 'Vikram Verma', relation: 'Spouse', age: 32, gender: 'Male', bloodGroup: 'O+' }
      ],
      orderHistory: [
        { id: 'MM-8922', date: 'Today 08:15 AM', items: 'Master Full Body Profile (87 Biomarkers)', amount: 1499, status: 'SAMPLE_COLLECTED', lab: 'Apollo Diagnostics Hub' }
      ]
    },
    {
      id: 'CUST-1003',
      name: 'Venkatesh R',
      phone: '+91 94400 55667',
      email: 'venkatesh.r@yahoo.com',
      city: 'Chittoor',
      abhaId: 'ABHA-1102-4411',
      memberSince: 'Jun 2025',
      age: 52,
      gender: 'Male',
      bloodGroup: 'A+',
      chronicConditions: 'Hypertension & Elevated Triglycerides',
      allergies: 'Sulfa Drugs',
      locations: [
        { id: 'LOC-1', label: 'Residency Address', fullAddress: 'Door #5-81, Gandhi Road, Chittoor', pincode: '517001', isPrimary: true }
      ],
      familyMembers: [
        { id: 'FAM-1', name: 'Padma R', relation: 'Spouse', age: 48, gender: 'Female', bloodGroup: 'A+' },
        { id: 'FAM-2', name: 'Karthik R', relation: 'Son', age: 24, gender: 'Male', bloodGroup: 'A+' }
      ],
      orderHistory: [
        { id: 'MM-8923', date: 'Today 09:00 AM', items: 'Diabetic & Renal Health Check', amount: 699, status: 'PENDING_DISPATCH', lab: 'Dr. Lal PathLabs' }
      ]
    }
  ]);

  const fetchCustomers = async () => {
    setIsRefreshing(true);
    try {
      const res = await safeFetch(`${API_BASE}/api/v1/customers`);
      if (res.ok) {
        const data = await res.json();
        if (data.customers && data.customers.length > 0) {
          setCustomers(data.customers);
        }
      }
    } catch (err) {
      console.warn('Could not fetch real-time customers from backend, using active cache:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    const interval = setInterval(fetchCustomers, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredCustomers = customers.filter(c => {
    const q = searchTerm.toLowerCase();
    const matchesQuery = !q || c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q)) || (c.city && c.city.toLowerCase().includes(q)) || (c.abhaId && c.abhaId.toLowerCase().includes(q));
    if (filterType === 'ABDM_LINKED') return matchesQuery && Boolean(c.abhaId);
    if (filterType === 'FAMILY_LINKED') return matchesQuery && c.familyMembers && c.familyMembers.length > 0;
    return matchesQuery;
  });

  const handleSaveNewCustomer = async (e) => {
    e.preventDefault();
    const newCust = {
      ...customerForm,
      memberSince: 'Just Now',
      locations: [
        { id: `LOC-${Date.now()}`, label: 'Primary Home Address', fullAddress: `Main Street, ${customerForm.city}`, pincode: '517501', isPrimary: true }
      ],
      familyMembers: [],
      orderHistory: []
    };
    try {
      await fetch(`${API_BASE}/api/v1/admin/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCust)
      });
    } catch (err) {
      console.warn('Backend save error:', err);
    }
    setCustomers(prev => [newCust, ...prev]);
    setShowAddCustomerModal(false);
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A' }}>Registered Patient Customers & Health Profiles Desk</h2>
          <p style={{ color: '#64748B', fontSize: '0.85rem' }}>Manage complete customer records, delivery locations, linked family members, ABHA digital IDs, and historical diagnostic tests.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={fetchCustomers}
            disabled={isRefreshing}
            style={{ padding: '0.65rem 1rem', backgroundColor: '#F1F5F9', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} /> {isRefreshing ? 'Syncing...' : 'Sync Customers'}
          </button>
          <button
            onClick={() => setShowAddCustomerModal(true)}
            style={{ padding: '0.65rem 1.25rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem', boxShadow: '0 4px 14px rgba(0,107,112,0.2)' }}
          >
            <Plus size={16} color="#FBBF24" /> Register New Customer
          </button>
        </div>
      </div>

      {/* Filter Chips & Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <Search size={18} color="#64748B" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search customers by name, mobile, city, or ABHA ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.4rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#0F172A', fontSize: '0.88rem', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { key: 'ALL', label: `All Patients (${customers.length})` },
            { key: 'ABDM_LINKED', label: 'ABHA / ABDM Linked' },
            { key: 'FAMILY_LINKED', label: 'Family Members Linked' }
          ].map(f => {
            const isSel = filterType === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilterType(f.key)}
                style={{
                  padding: '0.6rem 1rem',
                  borderRadius: '10px',
                  border: isSel ? 'none' : '1px solid #CBD5E1',
                  backgroundColor: isSel ? '#006B70' : '#FFFFFF',
                  color: isSel ? '#FFF' : '#475569',
                  fontWeight: '800',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Customers Table List */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '1rem 1.25rem' }}>Customer Details</th>
              <th style={{ padding: '1rem' }}>ABHA Digital ID</th>
              <th style={{ padding: '1rem' }}>City / Location</th>
              <th style={{ padding: '1rem' }}>Family Members</th>
              <th style={{ padding: '1rem' }}>Total Orders</th>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
                  No customer records match your search criteria.
                </td>
              </tr>
            ) : (
              filteredCustomers.map(cust => (
                <tr key={cust.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.92rem' }}>{cust.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.1rem' }}>{cust.phone} • {cust.email}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '800', backgroundColor: 'rgba(0,107,112,0.1)', color: '#006B70', border: '1px solid rgba(0,107,112,0.2)', fontFamily: 'monospace' }}>
                      🆔 {cust.abhaId}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: '#334155' }}>
                    📍 {cust.city} ({cust.locations.length} Saved Address)
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#B45309', backgroundColor: '#FEF3C7', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                      👨‍👩‍👧 {cust.familyMembers.length} Members
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '900', color: '#059669' }}>
                    📦 {cust.orderHistory.length} Orders Booked
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <button
                      onClick={() => { setSelectedCustomer(cust); setDossierTab('PERSONAL'); }}
                      style={{ padding: '0.45rem 0.85rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', boxShadow: '0 4px 12px rgba(0,107,112,0.2)' }}
                    >
                      View Dossier <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: COMPLETE CUSTOMER DOSSIER MODAL */}
      {selectedCustomer && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '720px', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            {/* Dossier Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A' }}>{selectedCustomer.name} — Customer Dossier</h3>
                <div style={{ fontSize: '0.8rem', color: '#006B70', fontWeight: '700' }}>ID: {selectedCustomer.id} • Member Since {selectedCustomer.memberSince}</div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {/* Sub-Nav Tabs inside Dossier */}
            <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', padding: '0 1.5rem' }}>
              {[
                { key: 'PERSONAL', label: 'Health Profile' },
                { key: 'LOCATIONS', label: `Saved Addresses (${selectedCustomer.locations.length})` },
                { key: 'FAMILY', label: `Family Members (${selectedCustomer.familyMembers.length})` },
                { key: 'ORDERS', label: `Diagnostic History (${selectedCustomer.orderHistory.length})` }
              ].map(t => {
                const isSel = dossierTab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setDossierTab(t.key)}
                    style={{
                      padding: '0.85rem 1rem',
                      border: 'none',
                      borderBottom: isSel ? '3px solid #006B70' : '3px solid transparent',
                      backgroundColor: 'transparent',
                      color: isSel ? '#006B70' : '#64748B',
                      fontWeight: isSel ? '900' : '600',
                      fontSize: '0.84rem',
                      cursor: 'pointer'
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Dossier Body Content */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {/* TAB 1: PERSONAL & HEALTH */}
              {dossierTab === 'PERSONAL' && (
                <div style={{ display: 'grid', gap: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700' }}>FULL NAME</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A' }}>{selectedCustomer.name}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700' }}>PHONE NUMBER</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A' }}>{selectedCustomer.phone}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700' }}>EMAIL ADDRESS</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A' }}>{selectedCustomer.email}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700' }}>ABHA DIGITAL HEALTH ID</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#006B70', fontFamily: 'monospace' }}>{selectedCustomer.abhaId}</div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#ECFDF5', padding: '1.25rem', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#059669', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Activity size={16} /> Clinical Vitals & Profile Summary
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', fontSize: '0.84rem' }}>
                      <div>Age / Gender: <strong style={{ color: '#0F172A' }}>{selectedCustomer.age}y / {selectedCustomer.gender}</strong></div>
                      <div>Blood Group: <strong style={{ color: '#DC2626' }}>{selectedCustomer.bloodGroup}</strong></div>
                      <div>Allergies: <strong style={{ color: '#B45309' }}>{selectedCustomer.allergies}</strong></div>
                    </div>
                    <div style={{ fontSize: '0.84rem', color: '#334155', marginTop: '0.5rem' }}>
                      Chronic Conditions: <strong>{selectedCustomer.chronicConditions}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SAVED LOCATIONS */}
              {dossierTab === 'LOCATIONS' && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {selectedCustomer.locations.map(loc => (
                    <div key={loc.id} style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <MapPin size={16} color="#006B70" /> {loc.label}
                          {loc.isPrimary && <span style={{ fontSize: '0.7rem', backgroundColor: '#DCFCE7', color: '#15803D', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>PRIMARY</span>}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.2rem' }}>{loc.fullAddress}</div>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#006B70', fontWeight: '800', fontFamily: 'monospace' }}>Pincode: {loc.pincode}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: LINKED FAMILY MEMBERS */}
              {dossierTab === 'FAMILY' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  {selectedCustomer.familyMembers.map(fam => (
                    <div key={fam.id} style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontWeight: '800', color: '#0F172A' }}>{fam.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#006B70', fontWeight: '800', marginTop: '0.1rem' }}>{fam.relation}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.35rem' }}>
                        {fam.age} Years • {fam.gender} • Blood Group: <strong style={{ color: '#DC2626' }}>{fam.bloodGroup}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: DIAGNOSTIC ORDER HISTORY */}
              {dossierTab === 'ORDERS' && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {selectedCustomer.orderHistory.map(ord => (
                    <div key={ord.id} style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '800', color: '#006B70', fontFamily: 'monospace' }}>{ord.id} • {ord.date}</div>
                        <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0F172A', marginTop: '0.2rem' }}>{ord.items}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.1rem' }}>Lab: {ord.lab}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '900', color: '#059669', fontSize: '0.95rem' }}>₹{ord.amount}</div>
                        <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '800', backgroundColor: '#DCFCE7', color: '#15803D' }}>
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REGISTER NEW CUSTOMER MODAL */}
      {showAddCustomerModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '540px', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A' }}>Register Patient Customer</h3>
                <div style={{ fontSize: '0.8rem', color: '#006B70', fontWeight: '700' }}>ID: {customerForm.id}</div>
              </div>
              <button onClick={() => setShowAddCustomerModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveNewCustomer} style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Patient Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Sharma"
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 00000"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="patient@gmail.com"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>ABHA Digital Health ID</label>
                  <input
                    type="text"
                    required
                    value={customerForm.abhaId}
                    onChange={(e) => setCustomerForm({ ...customerForm, abhaId: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#006B70', fontSize: '0.88rem', fontWeight: '800' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Age</label>
                  <input
                    type="number"
                    required
                    value={customerForm.age}
                    onChange={(e) => setCustomerForm({ ...customerForm, age: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Gender</label>
                  <select
                    value={customerForm.gender}
                    onChange={(e) => setCustomerForm({ ...customerForm, gender: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Blood Group</label>
                  <input
                    type="text"
                    required
                    value={customerForm.bloodGroup}
                    onChange={(e) => setCustomerForm({ ...customerForm, bloodGroup: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#DC2626', fontSize: '0.88rem', fontWeight: '800' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddCustomerModal(false)} style={{ padding: '0.65rem 1.25rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}>Save Customer Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
