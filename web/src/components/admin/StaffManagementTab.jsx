import React, { useState } from 'react';
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
    name: 'K. Suneetha Devi',
    role: 'Senior Lab Assistant & Patho-Tech',
    roleCategory: 'LAB_ASSISTANT',
    department: 'Central Pathology & Biochemistry Hub',
    phone: '+91 94401 22334',
    email: 'suneetha.lab@medmarg.com',
    branch: 'MedMarg Central Processing Lab (Tirupati)',
    shift: 'Morning Shift (06:00 AM - 02:00 PM)',
    status: 'ON_DUTY',
    tasksCompletedToday: 38,
    accuracyScore: '99.6%',
    tatAvg: '24 mins',
    permissions: ['VIEW_LAB_QUEUE', 'PROCESS_SAMPLES', 'INPUT_TEST_VALUES', 'INDENT_REAGENTS']
  },
  {
    id: 'STF-102',
    name: 'M. Venkat Raman',
    role: 'Central Store In-Charge',
    roleCategory: 'STORE_INCHARGE',
    department: 'Inventory & Cold-Chain Logistics',
    phone: '+91 98492 88771',
    email: 'venkat.store@medmarg.com',
    branch: 'Central Warehouse (Air Bypass Road)',
    shift: 'General Shift (09:00 AM - 05:00 PM)',
    status: 'ON_DUTY',
    tasksCompletedToday: 14,
    accuracyScore: '100%',
    tatAvg: '15 mins',
    permissions: ['MANAGE_STOCK', 'APPROVE_INDENTS', 'GENERATE_GRN', 'AUDIT_EXPIRY', 'DISPATCH_FLEET_KITS']
  },
  {
    id: 'STF-103',
    name: 'P. Bhavani',
    role: 'Front Desk Care Coordinator & Receptionist',
    roleCategory: 'RECEPTIONIST',
    department: 'Care Seeker Support & Front Office',
    phone: '+91 98765 44112',
    email: 'bhavani.care@medmarg.com',
    branch: 'Tirupati Central Reception & Collection Desk',
    shift: 'General Shift (08:00 AM - 04:00 PM)',
    status: 'ON_DUTY',
    tasksCompletedToday: 42,
    accuracyScore: '98.8%',
    tatAvg: '4 mins',
    permissions: ['BOOK_APPOINTMENTS', 'CALL_CARE_SEEKERS', 'VIEW_ORDERS', 'GENERATE_INVOICES', 'WHATSAPP_SUPPORT']
  },
  {
    id: 'STF-104',
    name: 'Dr. A. Madhav Rao (MD)',
    role: 'Consultant Pathologist & NABL Sign-off',
    roleCategory: 'PATHOLOGIST',
    department: 'Clinical Pathology & Quality Assurance',
    phone: '+91 94405 99881',
    email: 'dr.madhav@medmarg.com',
    branch: 'MedMarg Central Processing Lab',
    shift: 'Consulting Shift (10:00 AM - 06:00 PM)',
    status: 'ON_DUTY',
    tasksCompletedToday: 65,
    accuracyScore: '100%',
    tatAvg: '12 mins',
    permissions: ['ALL_ACCESS', 'DIGITAL_SIGN_OFF', 'CRITICAL_PANIC_ALERTS', 'WESTGARD_QC_AUDIT']
  },
  {
    id: 'STF-105',
    name: 'R. Rajesh',
    role: 'Live Dispatch & Fleet Supervisor',
    roleCategory: 'DISPATCH_COORDINATOR',
    department: 'Fleet Operations & GIS Routing',
    phone: '+91 98765 11009',
    email: 'rajesh.fleet@medmarg.com',
    branch: 'Central Dispatch Command Hub',
    shift: 'Morning Shift (06:00 AM - 02:00 PM)',
    status: 'ON_DUTY',
    tasksCompletedToday: 29,
    accuracyScore: '99.1%',
    tatAvg: '8 mins',
    permissions: ['VIEW_ORDERS', 'REASSIGN_FLEET', 'BROADCAST_FREELANCERS', 'LIVE_RADAR_MONITOR']
  }
];

const ROLE_CATEGORIES = [
  {
    id: 'LAB_ASSISTANT',
    name: 'Lab Assistant & Biochemist Tech',
    icon: '🔬',
    desc: 'Sample handling, analyzer loading, reagent preparation & test value logging.',
    memberCount: 3,
    color: '#006B70',
    defaultPermissions: ['VIEW_LAB_QUEUE', 'PROCESS_SAMPLES', 'INPUT_TEST_VALUES', 'INDENT_REAGENTS']
  },
  {
    id: 'STORE_INCHARGE',
    name: 'Store In-Charge & Materials Manager',
    icon: '📦',
    desc: 'Stock control, Purchase Orders / GRN, Phlebotomist kit replenishment & expiry auditing.',
    memberCount: 2,
    color: '#D97706',
    defaultPermissions: ['MANAGE_STOCK', 'APPROVE_INDENTS', 'GENERATE_GRN', 'AUDIT_EXPIRY', 'DISPATCH_FLEET_KITS']
  },
  {
    id: 'RECEPTIONIST',
    name: 'Receptionist & Front Desk Coordinator',
    icon: '🎧',
    desc: 'Doorstep test booking, patient registration, call handling & test result handovers.',
    memberCount: 2,
    color: '#0284C7',
    defaultPermissions: ['BOOK_APPOINTMENTS', 'CALL_CARE_SEEKERS', 'VIEW_ORDERS', 'GENERATE_INVOICES', 'WHATSAPP_SUPPORT']
  },
  {
    id: 'DISPATCH_COORDINATOR',
    name: 'Dispatch & Fleet Operations Supervisor',
    icon: '🚚',
    desc: 'Monitoring GPS tracking radar, Tier-3 overflow broadcast tasks & reassignments.',
    memberCount: 1,
    color: '#7C3AED',
    defaultPermissions: ['VIEW_ORDERS', 'REASSIGN_FLEET', 'BROADCAST_FREELANCERS', 'LIVE_RADAR_MONITOR']
  },
  {
    id: 'PATHOLOGIST',
    name: 'Consultant Pathologist (NABL Signer)',
    icon: '🩺',
    desc: 'Authorizing lab reports, verifying critical abnormal values & daily QC audits.',
    memberCount: 1,
    color: '#059669',
    defaultPermissions: ['ALL_ACCESS', 'DIGITAL_SIGN_OFF', 'CRITICAL_PANIC_ALERTS', 'WESTGARD_QC_AUDIT']
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

  // New Staff Form State
  const [newStaffForm, setNewStaffForm] = useState({
    id: `STF-${Math.floor(106 + Math.random() * 90)}`,
    name: '',
    role: '',
    roleCategory: 'LAB_ASSISTANT',
    department: 'Central Pathology & Biochemistry Hub',
    phone: '',
    email: '',
    branch: 'MedMarg Central Processing Lab (Tirupati)',
    shift: 'General Shift (09:00 AM - 05:00 PM)',
    status: 'ON_DUTY',
    permissions: ['VIEW_LAB_QUEUE', 'PROCESS_SAMPLES']
  });

  // Filtered staff
  const filteredStaff = staffList.filter(stf => {
    const matchesCategory = selectedRoleFilter === 'ALL' || stf.roleCategory === selectedRoleFilter;
    const matchesSearch = stf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          stf.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          stf.phone.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const handleAddStaffSubmit = (e) => {
    e.preventDefault();
    const newMember = {
      ...newStaffForm,
      tasksCompletedToday: 0,
      accuracyScore: '100%',
      tatAvg: 'N/A'
    };
    setStaffList(prev => [newMember, ...prev]);
    setShowAddStaffModal(false);
    alert(`✅ Staff Account Created: ${newMember.name} (${newMember.id}) assigned as ${newMember.role}`);
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

          {/* Staff Roster Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {filteredStaff.map(stf => {
              const catObj = roleCategories.find(c => c.id === stf.roleCategory) || roleCategories[0];
              return (
                <div 
                  key={stf.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '20px',
                    border: '1px solid #E2E8F0',
                    padding: '1.5rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    {/* Header with Status & Category Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.74rem', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: '800', backgroundColor: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }}></span> ON DUTY
                      </span>
                      <span style={{ fontSize: '0.76rem', color: catObj.color, fontWeight: '800', backgroundColor: 'rgba(0,107,112,0.08)', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                        {catObj.icon} {catObj.name.split(' ')[0]}
                      </span>
                    </div>

                    {/* Member Info */}
                    <div style={{ marginTop: '0.85rem' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>{stf.name}</h3>
                      <div style={{ fontSize: '0.82rem', color: '#006B70', fontWeight: '800', marginTop: '0.15rem' }}>{stf.role}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'monospace' }}>ID: {stf.id} • {stf.department}</div>
                    </div>

                    {/* Shift & Branch */}
                    <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', color: '#475569' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Building size={14} color="#64748B" /> {stf.branch}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={14} color="#D97706" /> {stf.shift}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Phone size={14} color="#006B70" /> {stf.phone} • {stf.email}
                      </div>
                    </div>

                    {/* Quick Stats Pill */}
                    <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '700' }}>TASKS TODAY</div>
                        <div style={{ fontSize: '1rem', fontWeight: '900', color: '#0F172A' }}>{stf.tasksCompletedToday} Processed</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '700' }}>ACCURACY</div>
                        <div style={{ fontSize: '1rem', fontWeight: '900', color: '#15803D' }}>{stf.accuracyScore}</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.6rem' }}>
                    <button
                      onClick={() => setSelectedStaffProfile(stf)}
                      style={{ flex: 1, padding: '0.55rem', backgroundColor: '#F1F5F9', color: '#006B70', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                    >
                      <Key size={14} /> Edit Access & Controls ({stf.permissions.length})
                    </button>
                    <a
                      href={`tel:${stf.phone}`}
                      style={{ padding: '0.55rem 0.85rem', backgroundColor: '#006B70', color: '#FFF', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Phone size={14} />
                    </a>
                  </div>
                </div>
              );
            })}
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
