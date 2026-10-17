import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCog, 
  ShieldCheck, 
  PlusCircle, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Award, 
  Key, 
  Layers, 
  TrendingUp, 
  Activity, 
  Check, 
  X, 
  Phone, 
  Mail, 
  Building, 
  Calendar,
  Lock,
  Unlock,
  AlertCircle
} from 'lucide-react';

const INITIAL_STAFF_MEMBERS = [
  {
    id: 'STF-101',
    name: 'M. Venkat Raman',
    role: 'Home Collection In-Charge',
    roleCategory: 'HOME_COLLECTION_INCHARGE',
    department: 'Home Collection & Fleet Logistics',
    phone: '+91 98492 88771',
    email: 'venkat.collection@medmarg.com',
    branch: 'Tirupati Central Hub',
    shift: 'General Shift (08:00 AM - 05:00 PM)',
    status: 'ON_DUTY',
    tasksCompletedToday: 28,
    accuracyScore: '100%',
    tatAvg: '12 mins',
    permissions: ['MANAGE_ORDERS', 'MANAGE_INVENTORY', 'PAYMENT_RECON', 'AGENT_ASSIGN_TRACK', 'APPROVE_INDENTS', 'DISPATCH_FLEET_KITS']
  },
  {
    id: 'STF-102',
    name: 'P. Bhavani',
    role: 'Front Desk Receptionist',
    roleCategory: 'RECEPTIONIST',
    department: 'Care Seeker Desk & Tests Catalog',
    phone: '+91 98765 44112',
    email: 'bhavani.reception@medmarg.com',
    branch: 'Tirupati Central Reception Desk',
    shift: 'General Shift (08:00 AM - 04:00 PM)',
    status: 'ON_DUTY',
    tasksCompletedToday: 42,
    accuracyScore: '99.2%',
    tatAvg: '4 mins',
    permissions: ['MANAGE_CATALOG', 'MANAGE_OFFERS', 'BOOK_ORDERS', 'CUSTOMER_QUERIES', 'LABS_REPORTS', 'AGENT_HANDOVERS']
  }
];

const ROLE_CATEGORIES = [
  {
    id: 'HOME_COLLECTION_INCHARGE',
    name: 'Home Collection In-Charge',
    icon: '🛵',
    desc: 'Orders management, inventory & kits management, payment reconciliation, and phlebotomist agent assignment & tracking.',
    memberCount: 2,
    color: '#006B70',
    defaultPermissions: ['MANAGE_ORDERS', 'MANAGE_INVENTORY', 'PAYMENT_RECON', 'AGENT_ASSIGN_TRACK', 'APPROVE_INDENTS', 'DISPATCH_FLEET_KITS']
  },
  {
    id: 'RECEPTIONIST',
    name: 'Receptionist',
    icon: '🎧',
    desc: 'Tests/profiles/packages catalog, offers zone promo management, care seeker booking, customer query desk, lab management & report handovers.',
    memberCount: 2,
    color: '#0284C7',
    defaultPermissions: ['MANAGE_CATALOG', 'MANAGE_OFFERS', 'BOOK_ORDERS', 'CUSTOMER_QUERIES', 'LABS_REPORTS', 'AGENT_HANDOVERS']
  }
];

const ALL_PERMISSION_KEYS = [
  { key: 'VIEW_LAB_QUEUE', label: 'View Lab Queue & Samples' },
  { key: 'INPUT_TEST_VALUES', label: 'Enter Diagnostic Test Biomarker Values' },
  { key: 'DIGITAL_SIGN_OFF', label: 'Digital Pathologist Signature on Reports' },
  { key: 'MANAGE_STOCK', label: 'Manage Stock & Reagents Catalog' },
  { key: 'APPROVE_INDENTS', label: 'Approve Phlebotomist Bag Indents' },
  { key: 'BOOK_APPOINTMENTS', label: 'Create Care Seeker Doorstep Bookings' },
  { key: 'REASSIGN_FLEET', label: 'Manual Phlebotomist Override & Dispatch' },
  { key: 'BROADCAST_FREELANCERS', label: 'Send FCM Broadcast to Freelancers' },
  { key: 'VIEW_FINANCIALS', label: 'Access Razorpay Financials & Payouts' },
  { key: 'MANAGE_STAFF', label: 'Create Staff Accounts & Access Matrix' }
];

export default function StaffManagementTab({
  initialSubTab = 'STAFF_ROSTER',
  API_BASE,
  safeFetch
}) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);
  const [staffList, setStaffList] = useState(INITIAL_STAFF_MEMBERS);
  const [roleCategories, setRoleCategories] = useState(ROLE_CATEGORIES);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [selectedStaffProfile, setSelectedStaffProfile] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);

  // Live Sync with Backend Staff API
  useEffect(() => {
    if (API_BASE && safeFetch) {
      safeFetch(`${API_BASE}/api/v1/admin/staff`)
        .then(res => res.json())
        .then(data => {
          if (data && data.success && Array.isArray(data.staff) && data.staff.length > 0) {
            setStaffList(data.staff);
          }
        })
        .catch(() => {});
    }
  }, [API_BASE, safeFetch]);

  // New Staff Form State
  const [newStaffForm, setNewStaffForm] = useState({
    id: `STF-${Math.floor(106 + Math.random() * 90)}`,
    name: '',
    role: 'Senior Lab Assistant & Patho-Tech',
    roleCategory: 'HOME_COLLECTION_INCHARGE',
    department: 'Central Pathology & Biochemistry Hub',
    phone: '',
    email: '',
    password: 'medmarg@staff123',
    branch: 'MedMarg Central Processing Lab (Tirupati)',
    shift: 'General Shift (09:00 AM - 05:00 PM)',
    status: 'ON_DUTY',
    permissions: ['VIEW_LAB_QUEUE', 'PROCESS_SAMPLES']
  });

  // Filtered staff
  const filteredStaff = staffList.filter(stf => {
    const matchesCategory = selectedRoleFilter === 'ALL' || stf.roleCategory === selectedRoleFilter;
    const matchesSearch = (stf.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (stf.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (stf.phone || '').includes(searchQuery) ||
                          (stf.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    const newMember = {
      ...newStaffForm,
      email: newStaffForm.email || `${newStaffForm.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@medmarg.com`,
      tasksCompletedToday: 0,
      accuracyScore: '100%',
      tatAvg: 'N/A'
    };

    try {
      if (safeFetch && API_BASE) {
        const res = await safeFetch(`${API_BASE}/api/v1/admin/staff`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMember)
        });
        const data = await res.json();
        if (data && data.success && data.staff) {
          setStaffList(prev => [data.staff, ...prev]);
        } else {
          setStaffList(prev => [newMember, ...prev]);
        }
      } else {
        setStaffList(prev => [newMember, ...prev]);
      }
    } catch (err) {
      setStaffList(prev => [newMember, ...prev]);
    }

    setShowAddStaffModal(false);
    alert(`✅ Staff Account Created: ${newMember.name} (${newMember.id})\nLogin Email: ${newMember.email}`);
    setNewStaffForm({
      id: `STF-${Math.floor(106 + Math.random() * 90)}`,
      name: '',
      role: 'Senior Lab Assistant & Patho-Tech',
      roleCategory: 'HOME_COLLECTION_INCHARGE',
      department: 'Central Pathology & Biochemistry Hub',
      phone: '',
      email: '',
      password: 'medmarg@staff123',
      branch: 'MedMarg Central Processing Lab (Tirupati)',
      shift: 'General Shift (09:00 AM - 05:00 PM)',
      status: 'ON_DUTY',
      permissions: ['VIEW_LAB_QUEUE', 'PROCESS_SAMPLES']
    });
  };

  const handleUpdateStaffSubmit = async (e) => {
    e.preventDefault();
    if (!editingStaff) return;

    try {
      if (safeFetch && API_BASE) {
        await safeFetch(`${API_BASE}/api/v1/admin/staff/${editingStaff.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingStaff)
        });
      }
    } catch (err) {}

    setStaffList(prev => prev.map(s => s.id === editingStaff.id ? { ...s, ...editingStaff } : s));
    setEditingStaff(null);
    alert(`✅ Staff profile for ${editingStaff.name} (${editingStaff.id}) updated successfully.`);
  };

  const handleDeleteStaff = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete staff member ${name} (${id})? This will deactivate their portal access.`)) {
      return;
    }

    try {
      if (safeFetch && API_BASE) {
        await safeFetch(`${API_BASE}/api/v1/admin/staff/${id}`, {
          method: 'DELETE'
        });
      }
    } catch (err) {}

    setStaffList(prev => prev.filter(s => s.id !== id));
    alert(`🗑️ Staff member ${name} (${id}) has been removed.`);
  };

  const toggleStaffPermission = (staffId, permKey) => {
    setStaffList(prev => prev.map(stf => {
      if (stf.id === staffId) {
        const has = stf.permissions.includes(permKey);
        const updatedPerms = has 
          ? stf.permissions.filter(p => p !== permKey)
          : [...stf.permissions, permKey];
        return { ...stf, permissions: updatedPerms };
      }
      return stf;
    }));
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A' }}>Staff & Internal Access Control Hub</h2>
            <span style={{ fontSize: '0.75rem', backgroundColor: '#E0F2FE', color: '#0369A1', padding: '0.15rem 0.55rem', borderRadius: '6px', fontWeight: '800' }}>
              {staffList.length} Active Personnel
            </span>
          </div>
          <p style={{ color: '#64748B', fontSize: '0.85rem' }}>
            Manage Lab Assistants, Store In-Charges, Receptionists, and Pathologists: Role Categories, Granular Control Permissions, and Individual Performance KPIs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setShowAddRoleModal(true)}
            style={{ padding: '0.65rem 1.1rem', backgroundColor: '#FFFFFF', color: '#006B70', border: '1.5px solid #006B70', borderRadius: '10px', fontWeight: '900', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Key size={15} /> Add Custom Role Category
          </button>
          <button
            onClick={() => setShowAddStaffModal(true)}
            style={{ padding: '0.65rem 1.25rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem', boxShadow: '0 4px 14px rgba(0,107,112,0.2)' }}
          >
            <PlusCircle size={16} color="#FBBF24" /> Onboard Staff Member
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs Bar */}
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
        {[
          { key: 'STAFF_ROSTER', label: '1. Staff Directory & Profiles', icon: Users, badge: `${staffList.length} Staff` },
          { key: 'ROLES_PERMISSIONS', label: '2. Role Categories & Control Matrix', icon: ShieldCheck, badge: `${roleCategories.length} Roles` },
          { key: 'PERFORMANCE_KPIS', label: '3. Individual Performance KPIs', icon: TrendingUp, badge: 'Daily TAT' },
          { key: 'SHIFTS_ATTENDANCE', label: '4. Shift Rostering & Attendance', icon: Clock, badge: 'Live Roster' }
        ].map(tab => {
          const TabIcon = tab.icon;
          const isActive = activeSubTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key)}
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
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <TabIcon size={16} color={isActive ? '#FBBF24' : '#64748B'} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span style={{ 
                  fontSize: '0.7rem', 
                  backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#F1F5F9', 
                  color: isActive ? '#FFF' : '#475569', 
                  padding: '0.1rem 0.45rem', 
                  borderRadius: '6px', 
                  fontWeight: '800' 
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: STAFF DIRECTORY & PROFILES                                     */}
      {/* ========================================================================= */}
      {activeSubTab === 'STAFF_ROSTER' && (
        <div>
          {/* Category Filter Chips & Search Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSelectedRoleFilter('ALL')}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '8px',
                  border: selectedRoleFilter === 'ALL' ? '1.5px solid #006B70' : '1px solid #CBD5E1',
                  backgroundColor: selectedRoleFilter === 'ALL' ? '#006B70' : '#FFFFFF',
                  color: selectedRoleFilter === 'ALL' ? '#FFF' : '#475569',
                  fontWeight: '800',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                All Departments ({staffList.length})
              </button>
              {roleCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedRoleFilter(cat.id)}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '8px',
                    border: selectedRoleFilter === cat.id ? '1.5px solid #006B70' : '1px solid #CBD5E1',
                    backgroundColor: selectedRoleFilter === cat.id ? 'rgba(0,107,112,0.08)' : '#FFFFFF',
                    color: selectedRoleFilter === cat.id ? '#006B70' : '#475569',
                    fontWeight: '800',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <span>{cat.icon}</span> {cat.name.split(' ')[0]} ({staffList.filter(s => s.roleCategory === cat.id).length})
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input
                type="text"
                placeholder="Search staff by name/phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.82rem', backgroundColor: '#FFFFFF' }}
              />
            </div>
          </div>

          {/* Staff Roster Tabular View */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: '800', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '0.9rem 1rem' }}>Staff Member</th>
                    <th style={{ padding: '0.9rem 1rem' }}>Role & Dept</th>
                    <th style={{ padding: '0.9rem 1rem' }}>Contact & Login</th>
                    <th style={{ padding: '0.9rem 1rem' }}>Branch & Shift</th>
                    <th style={{ padding: '0.9rem 1rem' }}>Performance</th>
                    <th style={{ padding: '0.9rem 1rem' }}>Duty Status</th>
                    <th style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: '#94A3B8', fontWeight: '600' }}>
                        No staff members found matching filter.
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((stf, idx) => {
                      const catObj = roleCategories.find(c => c.id === stf.roleCategory) || roleCategories[0];
                      const isOnDuty = stf.status === 'ON_DUTY' || !stf.status;

                      return (
                        <tr 
                          key={stf.id}
                          style={{ 
                            borderBottom: idx === filteredStaff.length - 1 ? 'none' : '1px solid #F1F5F9',
                            backgroundColor: '#FFFFFF',
                            transition: 'background-color 0.15s ease'
                          }}
                        >
                          {/* Staff Name & ID */}
                          <td style={{ padding: '0.9rem 1rem', verticalAlign: 'middle' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(0,107,112,0.1)', color: '#006B70', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.88rem', flexShrink: 0 }}>
                                {stf.name ? stf.name.charAt(0).toUpperCase() : 'S'}
                              </div>
                              <div>
                                <div style={{ fontWeight: '900', color: '#0F172A', fontSize: '0.9rem' }}>{stf.name}</div>
                                <span style={{ fontSize: '0.72rem', color: '#006B70', fontFamily: 'monospace', fontWeight: '800', backgroundColor: 'rgba(0,107,112,0.08)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                  {stf.id}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Role & Dept */}
                          <td style={{ padding: '0.9rem 1rem', verticalAlign: 'middle' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.82rem' }}>{stf.role}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <span style={{ fontSize: '0.7rem', color: catObj.color, fontWeight: '800', backgroundColor: 'rgba(0,107,112,0.08)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                  {catObj.icon} {catObj.name.split(' ')[0]}
                                </span>
                                <span style={{ fontSize: '0.72rem', color: '#64748B' }}>{stf.department}</span>
                              </div>
                            </div>
                          </td>

                          {/* Contact & Login */}
                          <td style={{ padding: '0.9rem 1rem', verticalAlign: 'middle' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.8rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#334155' }}>
                                <Phone size={13} color="#006B70" />
                                <span>{stf.phone || 'N/A'}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748B' }}>
                                <Mail size={13} color="#64748B" />
                                <span>{stf.email || `${stf.id.toLowerCase()}@medmarg.com`}</span>
                              </div>
                            </div>
                          </td>

                          {/* Branch & Shift */}
                          <td style={{ padding: '0.9rem 1rem', verticalAlign: 'middle' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.78rem' }}>
                              <div style={{ color: '#334155', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Building size={13} color="#64748B" /> {stf.branch}
                              </div>
                              <div style={{ color: '#D97706', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Clock size={13} /> {stf.shift}
                              </div>
                            </div>
                          </td>

                          {/* Performance Stats */}
                          <td style={{ padding: '0.9rem 1rem', verticalAlign: 'middle' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                              <span style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.82rem' }}>
                                {stf.tasksCompletedToday || 0} tasks today
                              </span>
                              <span style={{ fontSize: '0.72rem', color: '#15803D', fontWeight: '700' }}>
                                Accuracy: {stf.accuracyScore || '100%'}
                              </span>
                            </div>
                          </td>

                          {/* Duty Status */}
                          <td style={{ padding: '0.9rem 1rem', verticalAlign: 'middle' }}>
                            <span style={{ 
                              fontSize: '0.74rem', 
                              padding: '0.2rem 0.55rem', 
                              borderRadius: '6px', 
                              fontWeight: '800', 
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              backgroundColor: isOnDuty ? '#DCFCE7' : '#F1F5F9', 
                              color: isOnDuty ? '#15803D' : '#64748B' 
                            }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isOnDuty ? '#10B981' : '#94A3B8', display: 'inline-block' }}></span>
                              {isOnDuty ? 'ON DUTY' : 'OFF DUTY'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '0.9rem 1rem', verticalAlign: 'middle', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem', flexWrap: 'nowrap' }}>
                              <button
                                onClick={() => setSelectedStaffProfile(stf)}
                                title="Edit Permissions & Access"
                                style={{ padding: '0.4rem 0.55rem', backgroundColor: '#F1F5F9', color: '#006B70', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.76rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                              >
                                <Key size={13} /> Access
                              </button>

                              <button
                                onClick={() => setEditingStaff({ ...stf })}
                                title="Edit / Update Staff Details"
                                style={{ padding: '0.4rem 0.55rem', backgroundColor: '#F8FAFC', color: '#006B70', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.76rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                              >
                                <Edit3 size={13} /> Edit
                              </button>

                              <button
                                onClick={() => handleDeleteStaff(stf.id, stf.name)}
                                title="Delete Staff Member"
                                style={{ padding: '0.4rem 0.55rem', backgroundColor: '#FFF', color: '#EF4444', border: '1px solid #FECACA', borderRadius: '8px', fontSize: '0.76rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: ROLE CATEGORIES & GRANULAR CONTROL MATRIX                     */}
      {/* ========================================================================= */}
      {activeSubTab === 'ROLES_PERMISSIONS' && (
        <div>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={20} color="#006B70" /> Internal Role Categories & Permission Control Matrix
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
              Assign granular capability flags to each role category. Any change immediately reflects on the logged-in staff console.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {roleCategories.map(cat => (
                <div key={cat.id} style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1.5px solid #E2E8F0', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '1.3rem' }}>{cat.icon}</span>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>{cat.name}</h4>
                      </div>
                      <span style={{ fontSize: '0.72rem', backgroundColor: '#E0F2FE', color: '#0369A1', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: '800' }}>
                        {staffList.filter(s => s.roleCategory === cat.id).length} Members
                      </span>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.4rem', lineHeight: 1.3 }}>
                      {cat.desc}
                    </p>

                    <div style={{ marginTop: '0.85rem' }}>
                      <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#475569', marginBottom: '0.4rem' }}>ENABLED ACCESS FLAGS:</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {cat.defaultPermissions.map((perm, idx) => (
                          <span key={idx} style={{ fontSize: '0.7rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '700', color: '#006B70' }}>
                            ✓ {perm.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => alert(`Access Control Editor for role: ${cat.name}`)}
                      style={{ padding: '0.4rem 0.8rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                    >
                      Modify Role Permissions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: INDIVIDUAL PERFORMANCE & KPI SCORECARDS                        */}
      {/* ========================================================================= */}
      {activeSubTab === 'PERFORMANCE_KPIS' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingUp size={20} color="#006B70" /> Staff Operational KPI & Turnaround Time (TAT) Analytics
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
            Individual efficiency tracking: sample processing volume, TAT benchmark adherence, and accuracy ratings.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Staff Member</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Role Category</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Tasks Today</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Average TAT</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Accuracy Score</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Performance Grade</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map(stf => (
                  <tr key={stf.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: '800', color: '#0F172A' }}>{stf.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{stf.id} • {stf.phone}</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#006B70', fontWeight: '700' }}>
                      {stf.role}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>
                      {stf.tasksCompletedToday} tasks
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#D97706' }}>
                      ⏱ {stf.tatAvg}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#15803D' }}>
                      {stf.accuracyScore}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <span style={{ fontSize: '0.74rem', backgroundColor: '#DCFCE7', color: '#15803D', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '900' }}>
                        ⭐ TOP PERFORMER (Grade A)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: SHIFT ROSTERING & ATTENDANCE TRACKER                           */}
      {/* ========================================================================= */}
      {activeSubTab === 'SHIFTS_ATTENDANCE' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={20} color="#006B70" /> Daily Shift Rostering & Live Attendance Punch Log
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
            Live attendance status across Morning (06:00 AM), General (09:00 AM), and Evening shifts.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {staffList.map(stf => (
              <div key={stf.id} style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', backgroundColor: '#DCFCE7', color: '#15803D', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>
                    PUNCHED IN (06:02 AM)
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700' }}>
                    Active 5h 22m
                  </span>
                </div>

                <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A', marginTop: '0.6rem', marginBottom: '0.15rem' }}>
                  {stf.name}
                </h4>
                <div style={{ fontSize: '0.8rem', color: '#006B70', fontWeight: '700' }}>{stf.role}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.35rem' }}>
                  Shift: <strong>{stf.shift}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: EDIT STAFF PERMISSIONS & CONTROLS MODAL */}
      {selectedStaffProfile && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '580px', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>Staff Access & Controls Matrix</h3>
                <div style={{ fontSize: '0.8rem', color: '#006B70', fontWeight: '700' }}>{selectedStaffProfile.name} ({selectedStaffProfile.id})</div>
              </div>
              <button onClick={() => setSelectedStaffProfile(null)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '0.84rem', color: '#475569' }}>
                Toggle individual permissions for this staff member:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {ALL_PERMISSION_KEYS.map(perm => {
                  const isEnabled = selectedStaffProfile.permissions.includes(perm.key);
                  return (
                    <div 
                      key={perm.key}
                      onClick={() => toggleStaffPermission(selectedStaffProfile.id, perm.key)}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        border: isEnabled ? '1.5px solid #006B70' : '1px solid #E2E8F0',
                        backgroundColor: isEnabled ? '#E0F2FE' : '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.1s ease'
                      }}
                    >
                      <div style={{ fontSize: '0.84rem', fontWeight: isEnabled ? '800' : '600', color: isEnabled ? '#006B70' : '#334155' }}>
                        {perm.label}
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '900', color: isEnabled ? '#006B70' : '#94A3B8' }}>
                        {isEnabled ? 'ENABLED ✓' : 'DISABLED ✕'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  onClick={() => setSelectedStaffProfile(null)}
                  style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Save & Apply Controls
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ONBOARD NEW STAFF MODAL */}
      {showAddStaffModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '540px', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>Onboard New Staff Member</h3>
                <div style={{ fontSize: '0.8rem', color: '#006B70', fontWeight: '700' }}>Auto ID: {newStaffForm.id}</div>
              </div>
              <button onClick={() => setShowAddStaffModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleAddStaffSubmit} style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Staff Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Radhika Sharma"
                    value={newStaffForm.name}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Department Role Category *</label>
                  <select
                    value={newStaffForm.roleCategory}
                    onChange={(e) => {
                      const cat = roleCategories.find(c => c.id === e.target.value);
                      setNewStaffForm({
                        ...newStaffForm,
                        roleCategory: e.target.value,
                        role: cat?.name || e.target.value,
                        permissions: cat?.defaultPermissions || []
                      });
                    }}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                  >
                    {roleCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Designation Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Pathology Technician"
                  value={newStaffForm.role}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, role: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                />
              </div>

              {/* Login Credentials: Email & Password */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: '#F8FAFC', padding: '0.85rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#006B70', marginBottom: '0.3rem' }}>Staff Login Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="staff.member@medmarg.com"
                    value={newStaffForm.email}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#006B70', marginBottom: '0.3rem' }}>Portal Password *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. medmarg@staff123"
                    value={newStaffForm.password}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, password: e.target.value })}
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
                    placeholder="+91 98765 00000"
                    value={newStaffForm.phone}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Shift Schedule</label>
                  <select
                    value={newStaffForm.shift}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, shift: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                  >
                    <option value="Morning Shift (06:00 AM - 02:00 PM)">Morning Shift (06:00 AM - 02:00 PM)</option>
                    <option value="General Shift (09:00 AM - 05:00 PM)">General Shift (09:00 AM - 05:00 PM)</option>
                    <option value="Evening Shift (02:00 PM - 10:00 PM)">Evening Shift (02:00 PM - 10:00 PM)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  style={{ padding: '0.65rem 1.25rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Save & Issue Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2.5: EDIT / UPDATE STAFF MEMBER MODAL */}
      {editingStaff && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '560px', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>Edit Staff Member</h3>
                <div style={{ fontSize: '0.8rem', color: '#006B70', fontWeight: '700' }}>ID: {editingStaff.id}</div>
              </div>
              <button onClick={() => setEditingStaff(null)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleUpdateStaffSubmit} style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Staff Name *</label>
                  <input
                    type="text"
                    required
                    value={editingStaff.name || ''}
                    onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Role Category</label>
                  <select
                    value={editingStaff.roleCategory || 'HOME_COLLECTION_INCHARGE'}
                    onChange={(e) => setEditingStaff({ ...editingStaff, roleCategory: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                  >
                    {roleCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Designation Title *</label>
                <input
                  type="text"
                  required
                  value={editingStaff.role || ''}
                  onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: '#F8FAFC', padding: '0.85rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#006B70', marginBottom: '0.3rem' }}>Staff Email *</label>
                  <input
                    type="email"
                    required
                    value={editingStaff.email || ''}
                    onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#006B70', marginBottom: '0.3rem' }}>New Password (Optional)</label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep unchanged"
                    value={editingStaff.password || ''}
                    onChange={(e) => setEditingStaff({ ...editingStaff, password: e.target.value })}
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
                    value={editingStaff.phone || ''}
                    onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Shift Schedule</label>
                  <select
                    value={editingStaff.shift || 'General Shift (09:00 AM - 05:00 PM)'}
                    onChange={(e) => setEditingStaff({ ...editingStaff, shift: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                  >
                    <option value="Morning Shift (06:00 AM - 02:00 PM)">Morning Shift (06:00 AM - 02:00 PM)</option>
                    <option value="General Shift (09:00 AM - 05:00 PM)">General Shift (09:00 AM - 05:00 PM)</option>
                    <option value="Evening Shift (02:00 PM - 10:00 PM)">Evening Shift (02:00 PM - 10:00 PM)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Branch Location</label>
                  <input
                    type="text"
                    value={editingStaff.branch || ''}
                    onChange={(e) => setEditingStaff({ ...editingStaff, branch: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Duty Status</label>
                  <select
                    value={editingStaff.status || 'ON_DUTY'}
                    onChange={(e) => setEditingStaff({ ...editingStaff, status: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                  >
                    <option value="ON_DUTY">ON DUTY</option>
                    <option value="OFF_DUTY">OFF DUTY</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  style={{ padding: '0.65rem 1.25rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD CUSTOM ROLE CATEGORY MODAL */}
      {showAddRoleModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '480px', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', marginBottom: '0.5rem' }}>
              Create New Staff Role Category
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '1rem' }}>
              Define a new internal designation type with customized permission capabilities.
            </p>
            <input
              type="text"
              placeholder="e.g. Quality Auditor / Westgard Supervisor"
              id="newRoleName"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem', marginBottom: '1rem' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                onClick={() => setShowAddRoleModal(false)}
                style={{ padding: '0.55rem 1rem', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', fontSize: '0.82rem' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const val = document.getElementById('newRoleName')?.value;
                  if (val) {
                    setRoleCategories(prev => [
                      ...prev,
                      {
                        id: val.toUpperCase().replace(/\s+/g, '_'),
                        name: val,
                        icon: '⭐',
                        desc: 'Custom staff role category',
                        memberCount: 0,
                        color: '#006B70',
                        defaultPermissions: ['VIEW_LAB_QUEUE']
                      }
                    ]);
                    setShowAddRoleModal(false);
                    alert(`✅ Role Category '${val}' Created.`);
                  }
                }}
                style={{ padding: '0.55rem 1.2rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '900', cursor: 'pointer', fontSize: '0.82rem' }}
              >
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
