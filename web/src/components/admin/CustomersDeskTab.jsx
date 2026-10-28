import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  MapPin, 
  Phone, 
  Mail,
  UserCheck, 
  ShieldCheck, 
  Heart, 
  FileText, 
  Calendar, 
  Plus, 
  X, 
  ChevronRight, 
  Activity, 
  RefreshCw,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Download,
  Building,
  Home,
  Briefcase
} from 'lucide-react';
import { API_BASE, safeFetch, safeJson } from '../../data/apiConfig';

export default function CustomersDeskTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'ABDM_LINKED' | 'FAMILY_LINKED' | 'HAS_ORDERS'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [dossierTab, setDossierTab] = useState('PERSONAL'); // 'PERSONAL' | 'LOCATIONS' | 'FAMILY' | 'ORDERS'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Modal Controls
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [showAddFamilyModal, setShowAddFamilyModal] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);

  // Form States
  const [customerForm, setCustomerForm] = useState({
    id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
    name: '',
    phone: '',
    email: '',
    city: 'Tirupati',
    abhaId: `ABHA-${Math.floor(1000 + Math.random() * 9000)}-2026`,
    age: 32,
    gender: 'Male',
    bloodGroup: 'O+',
    chronicConditions: 'None',
    allergies: 'None'
  });

  const [editCustomerForm, setEditCustomerForm] = useState(null);

  const [familyForm, setFamilyForm] = useState({
    name: '',
    relation: 'Father',
    age: 58,
    gender: 'Male',
    bloodGroup: 'O+',
    chronicConditions: 'Diabetes (Type 2)'
  });

  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    fullAddress: '',
    pincode: '517501',
    landmark: '',
    isPrimary: false
  });

  // Customers Data strictly from backend API
  const [customers, setCustomers] = useState([]);

  const showToast = (text, type = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const fetchCustomers = async () => {
    setIsRefreshing(true);
    try {
      const res = await safeFetch(`${API_BASE}/api/v1/customers`);
      const data = await safeJson(res);
      if (data && data.customers && data.customers.length > 0) {
        setCustomers(data.customers);
        // Sync selectedCustomer if currently opened
        if (selectedCustomer) {
          const fresh = data.customers.find(c => c.id === selectedCustomer.id);
          if (fresh) setSelectedCustomer(fresh);
        }
      }
    } catch (err) {
      console.warn('Could not fetch real-time customers from backend:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => {
    const q = searchTerm.toLowerCase();
    const matchesQuery = !q || 
      (c.name && c.name.toLowerCase().includes(q)) || 
      (c.phone && c.phone.includes(q)) || 
      (c.city && c.city.toLowerCase().includes(q)) || 
      (c.abhaId && c.abhaId.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q));

    if (filterType === 'ABDM_LINKED') return matchesQuery && Boolean(c.abhaId);
    if (filterType === 'FAMILY_LINKED') return matchesQuery && c.familyMembers && c.familyMembers.length > 0;
    if (filterType === 'HAS_ORDERS') return matchesQuery && c.orderHistory && c.orderHistory.length > 0;
    return matchesQuery;
  });

  // 1. CREATE NEW CUSTOMER
  const handleSaveNewCustomer = async (e) => {
    e.preventDefault();
    const newCust = {
      ...customerForm,
      memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      locations: [
        { id: `LOC-${Date.now()}`, label: 'Home Address', fullAddress: `Plot 42, Air Bypass Road, ${customerForm.city || 'Tirupati'}`, pincode: '517501', isPrimary: true }
      ],
      familyMembers: [],
      orderHistory: []
    };

    try {
      const res = await safeFetch(`${API_BASE}/api/v1/admin/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCust)
      });
      const data = await res.json();
      if (data && data.customer) {
        setCustomers(prev => [data.customer, ...prev]);
      } else {
        setCustomers(prev => [newCust, ...prev]);
      }
      showToast(`Customer ${newCust.name} registered successfully!`);
    } catch (err) {
      setCustomers(prev => [newCust, ...prev]);
      showToast(`Customer ${newCust.name} added locally.`);
    }

    setShowAddCustomerModal(false);
    setCustomerForm({
      id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      phone: '',
      email: '',
      city: 'Tirupati',
      abhaId: `ABHA-${Math.floor(1000 + Math.random() * 9000)}-2026`,
      age: 32,
      gender: 'Male',
      bloodGroup: 'O+',
      chronicConditions: 'None',
      allergies: 'None'
    });
  };

  // 2. EDIT CUSTOMER
  const handleOpenEditCustomer = (cust) => {
    setEditCustomerForm({ ...cust });
    setShowEditCustomerModal(true);
  };

  const handleSaveEditCustomer = async (e) => {
    e.preventDefault();
    if (!editCustomerForm) return;

    try {
      await safeFetch(`${API_BASE}/api/v1/admin/customers/${editCustomerForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editCustomerForm)
      });
      showToast(`Customer ${editCustomerForm.name} updated successfully!`);
    } catch (err) {
      showToast(`Customer ${editCustomerForm.name} updated locally.`);
    }

    setCustomers(prev => prev.map(c => c.id === editCustomerForm.id ? editCustomerForm : c));
    if (selectedCustomer && selectedCustomer.id === editCustomerForm.id) {
      setSelectedCustomer(editCustomerForm);
    }
    setShowEditCustomerModal(false);
  };

  // 3. DELETE CUSTOMER
  const handleDeleteCustomer = async (cust) => {
    if (!window.confirm(`Are you sure you want to delete customer record for ${cust.name} (${cust.id})?`)) {
      return;
    }

    try {
      await safeFetch(`${API_BASE}/api/v1/admin/customers/${cust.id}`, {
        method: 'DELETE'
      });
      showToast(`Customer ${cust.name} deleted.`);
    } catch (err) {
      showToast(`Customer ${cust.name} removed.`);
    }

    setCustomers(prev => prev.filter(c => c.id !== cust.id));
    if (selectedCustomer && selectedCustomer.id === cust.id) {
      setSelectedCustomer(null);
    }
  };

  // 4. ADD FAMILY MEMBER
  const handleSaveFamilyMember = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const newFam = {
      id: `FAM-${Date.now()}`,
      name: familyForm.name,
      relation: familyForm.relation,
      age: Number(familyForm.age) || 30,
      gender: familyForm.gender,
      bloodGroup: familyForm.bloodGroup,
      chronicConditions: familyForm.chronicConditions || 'None'
    };

    const updatedFamily = [...(selectedCustomer.familyMembers || []), newFam];
    const updatedCust = { ...selectedCustomer, familyMembers: updatedFamily };

    try {
      await safeFetch(`${API_BASE}/api/v1/customers/family-members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: selectedCustomer.email,
          phone: selectedCustomer.phone,
          member: newFam
        })
      });
      showToast(`Family member ${newFam.name} added.`);
    } catch (err) {
      showToast(`Family member ${newFam.name} added locally.`);
    }

    setSelectedCustomer(updatedCust);
    setCustomers(prev => prev.map(c => c.id === updatedCust.id ? updatedCust : c));
    setShowAddFamilyModal(false);
    setFamilyForm({
      name: '',
      relation: 'Father',
      age: 58,
      gender: 'Male',
      bloodGroup: 'O+',
      chronicConditions: 'None'
    });
  };

  // 5. DELETE FAMILY MEMBER
  const handleDeleteFamilyMember = async (famId) => {
    if (!selectedCustomer) return;
    const updatedFamily = (selectedCustomer.familyMembers || []).filter(f => f.id !== famId);
    const updatedCust = { ...selectedCustomer, familyMembers: updatedFamily };

    try {
      await safeFetch(`${API_BASE}/api/v1/admin/customers/${selectedCustomer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyMembers: updatedFamily })
      });
    } catch (err) {}

    setSelectedCustomer(updatedCust);
    setCustomers(prev => prev.map(c => c.id === updatedCust.id ? updatedCust : c));
    showToast('Family member removed.');
  };

  // 6. ADD DELIVERY ADDRESS
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const newLoc = {
      id: `LOC-${Date.now()}`,
      label: addressForm.label,
      fullAddress: addressForm.fullAddress,
      pincode: addressForm.pincode,
      landmark: addressForm.landmark || '',
      isPrimary: Boolean(addressForm.isPrimary)
    };

    let updatedLocations = (selectedCustomer.locations || []);
    if (newLoc.isPrimary) {
      updatedLocations = updatedLocations.map(l => ({ ...l, isPrimary: false }));
    }
    updatedLocations = [...updatedLocations, newLoc];
    const updatedCust = { ...selectedCustomer, locations: updatedLocations };

    try {
      await safeFetch(`${API_BASE}/api/v1/customers/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: selectedCustomer.email,
          phone: selectedCustomer.phone,
          location: newLoc
        })
      });
      showToast(`Address '${newLoc.label}' added.`);
    } catch (err) {
      showToast(`Address saved.`);
    }

    setSelectedCustomer(updatedCust);
    setCustomers(prev => prev.map(c => c.id === updatedCust.id ? updatedCust : c));
    setShowAddAddressModal(false);
    setAddressForm({
      label: 'Home',
      fullAddress: '',
      pincode: '517501',
      landmark: '',
      isPrimary: false
    });
  };

  // 7. DELETE SAVED ADDRESS
  const handleDeleteAddress = async (locId) => {
    if (!selectedCustomer) return;
    const updatedLocations = (selectedCustomer.locations || []).filter(l => l.id !== locId);
    const updatedCust = { ...selectedCustomer, locations: updatedLocations };

    try {
      await safeFetch(`${API_BASE}/api/v1/customers/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: selectedCustomer.email,
          phone: selectedCustomer.phone,
          location: { id: locId },
          action: 'DELETE'
        })
      });
    } catch (err) {}

    setSelectedCustomer(updatedCust);
    setCustomers(prev => prev.map(c => c.id === updatedCust.id ? updatedCust : c));
    showToast('Saved address removed.');
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 99999,
          backgroundColor: toastMsg.type === 'error' ? '#FEF2F2' : '#ECFDF5',
          border: `1.5px solid ${toastMsg.type === 'error' ? '#F87171' : '#34D399'}`,
          color: toastMsg.type === 'error' ? '#991B1B' : '#065F46',
          padding: '0.85rem 1.4rem',
          borderRadius: '12px',
          fontWeight: '800',
          fontSize: '0.88rem',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          {toastMsg.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Top Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.55rem', borderRadius: '4px', fontWeight: '900' }}>
              CARE SEEKER MASTER REPOSITORY
            </span>
            <span style={{ fontSize: '0.72rem', backgroundColor: '#DCFCE7', color: '#15803D', padding: '0.15rem 0.55rem', borderRadius: '4px', fontWeight: '800' }}>
              ✓ ABHA / ABDM Digital Records Integrated
            </span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
            Registered Patient Customers & Health Profiles Desk
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
            Manage patient demographic dossiers, multi-point sample collection locations, family dependencies, and ABHA clinical profiles.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={fetchCustomers}
            disabled={isRefreshing}
            style={{ padding: '0.65rem 1rem', backgroundColor: '#F1F5F9', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} /> {isRefreshing ? 'Syncing...' : 'Sync Customers'}
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
            placeholder="Search customers by name, mobile, email, city, or ABHA ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.4rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#0F172A', fontSize: '0.88rem', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { key: 'ALL', label: `All Patients (${customers.length})` },
            { key: 'ABDM_LINKED', label: 'ABHA / ABDM Linked' },
            { key: 'FAMILY_LINKED', label: 'Family Members Linked' },
            { key: 'HAS_ORDERS', label: 'Active Diagnostic Bookings' }
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
                <td colSpan={6} style={{ padding: '3.5rem', textAlign: 'center', color: '#64748B' }}>
                  <Users size={38} color="#CBD5E1" style={{ marginBottom: '0.5rem' }} />
                  <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#334155' }}>No customer records match your filter</div>
                  <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: '0.2rem' }}>Click "Register New Customer" to add your first patient profile.</div>
                </td>
              </tr>
            ) : (
              filteredCustomers.map(cust => (
                <tr key={cust.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s' }}>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.88rem' }}>
                        {cust.name ? cust.name.charAt(0).toUpperCase() : 'P'}
                      </div>
                      <div>
                        <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.92rem' }}>{cust.name}</div>
                        <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '0.1rem' }}>
                          {cust.phone} • {cust.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: '800', backgroundColor: 'rgba(0,107,112,0.1)', color: '#006B70', border: '1px solid rgba(0,107,112,0.2)', fontFamily: 'monospace' }}>
                      🆔 {cust.abhaId || 'ABHA-NOT-SET'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: '#334155' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={14} color="#006B70" />
                      <span>{cust.city || 'Tirupati'}</span>
                      <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                        ({(cust.locations || []).length} Saved {(cust.locations || []).length === 1 ? 'Address' : 'Addresses'})
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#B45309', backgroundColor: '#FEF3C7', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                      👨‍👩‍👧 {(cust.familyMembers || []).length} Members
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '900', color: '#059669' }}>
                    📦 {(cust.orderHistory || []).length} Orders Booked
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.45rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button
                        onClick={() => handleOpenEditCustomer(cust)}
                        title="Edit Patient Details"
                        style={{ padding: '0.45rem 0.65rem', backgroundColor: '#F1F5F9', color: '#334155', border: '1px solid #CBD5E1', borderRadius: '8px', cursor: 'pointer' }}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(cust)}
                        title="Delete Patient Record"
                        style={{ padding: '0.45rem 0.65rem', backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: '8px', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        onClick={() => { setSelectedCustomer(cust); setDossierTab('PERSONAL'); }}
                        style={{ padding: '0.45rem 0.85rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', boxShadow: '0 4px 12px rgba(0,107,112,0.2)' }}
                      >
                        View Dossier <ChevronRight size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: COMPLETE CUSTOMER DOSSIER MODAL                                 */}
      {/* ========================================================================= */}
      {selectedCustomer && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '780px', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
            
            {/* Dossier Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                    {selectedCustomer.name}
                  </h3>
                  <span style={{ fontSize: '0.72rem', backgroundColor: '#E0F2FE', color: '#0369A1', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '800' }}>
                    PATIENT DOSSIER
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>
                  Customer ID: <strong style={{ color: '#006B70' }}>{selectedCustomer.id}</strong> • Member Since {selectedCustomer.memberSince || '2026'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  onClick={() => handleOpenEditCustomer(selectedCustomer)}
                  style={{ padding: '0.4rem 0.8rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '700', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <Edit3 size={13} /> Edit Profile
                </button>
                <button onClick={() => setSelectedCustomer(null)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '0.25rem' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Sub-Nav Tabs inside Dossier */}
            <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', padding: '0 1.5rem' }}>
              {[
                { key: 'PERSONAL', label: 'Health Profile & Vitals' },
                { key: 'LOCATIONS', label: `Saved Addresses (${(selectedCustomer.locations || []).length})` },
                { key: 'FAMILY', label: `Family Members (${(selectedCustomer.familyMembers || []).length})` },
                { key: 'ORDERS', label: `Diagnostic Orders (${(selectedCustomer.orderHistory || []).length})` }
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: '#F8FAFC', padding: '1.25rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800' }}>FULL NAME</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A', marginTop: '0.15rem' }}>{selectedCustomer.name}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800' }}>PHONE NUMBER</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A', marginTop: '0.15rem' }}>{selectedCustomer.phone}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800' }}>EMAIL ADDRESS</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A', marginTop: '0.15rem' }}>{selectedCustomer.email || '—'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800' }}>ABHA DIGITAL HEALTH ID</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#006B70', fontFamily: 'monospace', marginTop: '0.15rem' }}>
                        {selectedCustomer.abhaId || 'ABHA-NOT-SET'}
                      </div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#ECFDF5', padding: '1.25rem', borderRadius: '14px', border: '1px solid #A7F3D0' }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#059669', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Activity size={16} /> Clinical Vitals & Demographic Baseline
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', fontSize: '0.85rem' }}>
                      <div>Age / Gender: <strong style={{ color: '#0F172A' }}>{selectedCustomer.age || 32}y / {selectedCustomer.gender || 'Male'}</strong></div>
                      <div>Blood Group: <strong style={{ color: '#DC2626' }}>{selectedCustomer.bloodGroup || 'O+'}</strong></div>
                      <div>Allergies: <strong style={{ color: '#B45309' }}>{selectedCustomer.allergies || 'None'}</strong></div>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#334155', marginTop: '0.6rem' }}>
                      Chronic Health Conditions: <strong>{selectedCustomer.chronicConditions || 'None Reported'}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SAVED LOCATIONS */}
              {dossierTab === 'LOCATIONS' && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A' }}>
                      Registered Doorstep Phlebotomy Locations
                    </span>
                    <button
                      onClick={() => setShowAddAddressModal(true)}
                      style={{ padding: '0.45rem 0.85rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Plus size={14} /> Add Address
                    </button>
                  </div>

                  {(selectedCustomer.locations || []).map(loc => (
                    <div key={loc.id} style={{ backgroundColor: '#F8FAFC', padding: '1.1rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <MapPin size={16} color="#006B70" /> {loc.label}
                          {loc.isPrimary && (
                            <span style={{ fontSize: '0.68rem', backgroundColor: '#DCFCE7', color: '#15803D', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: '900' }}>
                              PRIMARY
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.25rem' }}>{loc.fullAddress}</div>
                        {loc.landmark && <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '0.15rem' }}>Landmark: {loc.landmark}</div>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.78rem', color: '#006B70', fontWeight: '800', fontFamily: 'monospace' }}>
                          PIN: {loc.pincode}
                        </span>
                        <button
                          onClick={() => handleDeleteAddress(loc.id)}
                          title="Remove Address"
                          style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '0.25rem' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!selectedCustomer.locations || selectedCustomer.locations.length === 0) && (
                    <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                      <MapPin size={32} color="#CBD5E1" style={{ marginBottom: '0.5rem' }} />
                      <div>No saved addresses on file. Add one using the button above.</div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: LINKED FAMILY MEMBERS */}
              {dossierTab === 'FAMILY' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A' }}>
                      Connected Family Members & Dependents
                    </span>
                    <button
                      onClick={() => setShowAddFamilyModal(true)}
                      style={{ padding: '0.45rem 0.85rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Plus size={14} /> Add Family Member
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    {(selectedCustomer.familyMembers || []).map(fam => (
                      <div key={fam.id} style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.92rem' }}>{fam.name}</div>
                            <span style={{ fontSize: '0.72rem', color: '#006B70', fontWeight: '800', backgroundColor: '#E0F2FE', padding: '0.15rem 0.45rem', borderRadius: '4px', display: 'inline-block', marginTop: '0.2rem' }}>
                              {fam.relation}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteFamilyMember(fam.id)}
                            title="Remove family member"
                            style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '0.2rem' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.6rem' }}>
                          {fam.age}y • {fam.gender} • Blood Group: <strong style={{ color: '#DC2626' }}>{fam.bloodGroup || 'O+'}</strong>
                        </div>
                        {fam.chronicConditions && fam.chronicConditions !== 'None' && (
                          <div style={{ fontSize: '0.74rem', color: '#B45309', marginTop: '0.3rem', backgroundColor: '#FEF3C7', padding: '0.2rem 0.45rem', borderRadius: '4px' }}>
                            Conditions: {fam.chronicConditions}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {(!selectedCustomer.familyMembers || selectedCustomer.familyMembers.length === 0) && (
                    <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                      <Users size={32} color="#CBD5E1" style={{ marginBottom: '0.5rem' }} />
                      <div>No linked family members. Click "Add Family Member" above to register dependents.</div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: DIAGNOSTIC ORDER HISTORY */}
              {dossierTab === 'ORDERS' && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {(selectedCustomer.orderHistory || []).map(ord => (
                    <div key={ord.id} style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '800', color: '#006B70', fontFamily: 'monospace' }}>{ord.id} • {ord.date || 'Recent'}</div>
                        <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0F172A', marginTop: '0.2rem' }}>
                          {Array.isArray(ord.items) ? ord.items.map(i => i.name || i.title || i).join(', ') : (ord.items || 'Diagnostic Tests')}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.1rem' }}>Lab Hub: {ord.lab || 'MedMarg Central Processing Lab'}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '900', color: '#059669', fontSize: '0.95rem' }}>₹{ord.amount}</div>
                        <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '800', backgroundColor: '#DCFCE7', color: '#15803D' }}>
                          {ord.status || 'COMPLETED'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {(!selectedCustomer.orderHistory || selectedCustomer.orderHistory.length === 0) && (
                    <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                      <FileText size={32} color="#CBD5E1" style={{ marginBottom: '0.5rem' }} />
                      <div>No historical diagnostic orders recorded for this patient.</div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: REGISTER NEW CUSTOMER MODAL                                     */}
      {/* ========================================================================= */}
      {showAddCustomerModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '580px', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>Register Patient Customer</h3>
                <div style={{ fontSize: '0.78rem', color: '#006B70', fontWeight: '700' }}>Customer ID: {customerForm.id}</div>
              </div>
              <button onClick={() => setShowAddCustomerModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveNewCustomer} style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Patient Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Chandra"
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Phone Number *</label>
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
                    value={customerForm.bloodGroup}
                    onChange={(e) => setCustomerForm({ ...customerForm, bloodGroup: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#DC2626', fontSize: '0.88rem', fontWeight: '800' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddCustomerModal(false)} style={{ padding: '0.65rem 1.25rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}>Save Patient Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EDIT CUSTOMER MODAL                                             */}
      {/* ========================================================================= */}
      {showEditCustomerModal && editCustomerForm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '580px', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>Edit Patient Details</h3>
                <div style={{ fontSize: '0.78rem', color: '#006B70', fontWeight: '700' }}>Customer ID: {editCustomerForm.id}</div>
              </div>
              <button onClick={() => setShowEditCustomerModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveEditCustomer} style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Full Name</label>
                  <input
                    type="text"
                    required
                    value={editCustomerForm.name}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, name: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Phone Number</label>
                  <input
                    type="text"
                    required
                    value={editCustomerForm.phone}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Email Address</label>
                  <input
                    type="email"
                    value={editCustomerForm.email || ''}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, email: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>ABHA Digital Health ID</label>
                  <input
                    type="text"
                    value={editCustomerForm.abhaId || ''}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, abhaId: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#006B70', fontSize: '0.88rem', fontWeight: '800' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Age</label>
                  <input
                    type="number"
                    value={editCustomerForm.age || 30}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, age: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Gender</label>
                  <select
                    value={editCustomerForm.gender || 'Male'}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, gender: e.target.value })}
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
                    value={editCustomerForm.bloodGroup || 'O+'}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, bloodGroup: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#DC2626', fontSize: '0.88rem', fontWeight: '800' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowEditCustomerModal(false)} style={{ padding: '0.65rem 1.25rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ADD FAMILY MEMBER MODAL                                         */}
      {/* ========================================================================= */}
      {showAddFamilyModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '480px', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>Add Family Member</h3>
                <div style={{ fontSize: '0.78rem', color: '#006B70', fontWeight: '700' }}>For Patient: {selectedCustomer?.name}</div>
              </div>
              <button onClick={() => setShowAddFamilyModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveFamilyMember} style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meesala Venkataramana"
                  value={familyForm.name}
                  onChange={(e) => setFamilyForm({ ...familyForm, name: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Relation *</label>
                  <select
                    value={familyForm.relation}
                    onChange={(e) => setFamilyForm({ ...familyForm, relation: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Age</label>
                  <input
                    type="number"
                    value={familyForm.age}
                    onChange={(e) => setFamilyForm({ ...familyForm, age: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Gender</label>
                  <select
                    value={familyForm.gender}
                    onChange={(e) => setFamilyForm({ ...familyForm, gender: e.target.value })}
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
                    value={familyForm.bloodGroup}
                    onChange={(e) => setFamilyForm({ ...familyForm, bloodGroup: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#DC2626', fontSize: '0.88rem', fontWeight: '800' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Chronic Health Conditions</label>
                <input
                  type="text"
                  placeholder="e.g. Hypertension, Diabetes, Thyroid"
                  value={familyForm.chronicConditions}
                  onChange={(e) => setFamilyForm({ ...familyForm, chronicConditions: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddFamilyModal(false)} style={{ padding: '0.65rem 1.25rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}>Add Family Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: ADD DELIVERY ADDRESS MODAL                                      */}
      {/* ========================================================================= */}
      {showAddAddressModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '480px', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>Add Sample Collection Address</h3>
                <div style={{ fontSize: '0.78rem', color: '#006B70', fontWeight: '700' }}>For Patient: {selectedCustomer?.name}</div>
              </div>
              <button onClick={() => setShowAddAddressModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveAddress} style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Address Label</label>
                <select
                  value={addressForm.label}
                  onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                >
                  <option value="Home">Home Address</option>
                  <option value="Office / Work">Office / Work</option>
                  <option value="Parents House">Parents House</option>
                  <option value="Clinic / Hospital">Clinic / Hospital</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Complete Doorstep Address *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="House/Flat number, Street name, Area, City"
                  value={addressForm.fullAddress}
                  onChange={(e) => setAddressForm({ ...addressForm, fullAddress: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Pincode *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Landmark</label>
                  <input
                    type="text"
                    placeholder="Near Temple / School"
                    value={addressForm.landmark}
                    onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <input
                  type="checkbox"
                  id="isPrimaryCheckbox"
                  checked={addressForm.isPrimary}
                  onChange={(e) => setAddressForm({ ...addressForm, isPrimary: e.target.checked })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="isPrimaryCheckbox" style={{ fontSize: '0.84rem', color: '#334155', fontWeight: '700', cursor: 'pointer' }}>
                  Set as default primary home collection address
                </label>
              </div>

              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddAddressModal(false)} style={{ padding: '0.65rem 1.25rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}>Save Address</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
