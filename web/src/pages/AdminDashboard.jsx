import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Users, 
  DollarSign, 
  FlaskConical, 
  Building2, 
  Stethoscope, 
  Pill, 
  Activity, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2, 
  PlusCircle, 
  DownloadCloud, 
  Server, 
  Clock, 
  MapPin, 
  Phone, 
  AlertTriangle, 
  Check, 
  ChevronRight, 
  ChevronDown, 
  Settings, 
  BarChart3, 
  CreditCard, 
  FileText,
  Thermometer,
  Truck,
  Sparkles,
  RefreshCw,
  LogOut,
  FolderHeart,
  Package,
  Layers,
  Percent,
  Plus,
  Boxes,
  ClipboardList,
  Compass,
  UserCheck,
  UserPlus,
  Shield,
  Tag
} from 'lucide-react';
import { THYROCARE_TESTS, THYROCARE_CATEGORIES } from '../data/thyrocareTests';

export default function AdminDashboard({ user, onSwitchRole, onLogout }) {
  // Navigation State
  const [activeTab, setActiveTab] = useState('TESTS_MGMT'); // 'OVERVIEW' | 'DOCTOR_ORDERS' | 'TESTS_MGMT' | 'LABS' | 'SCANS' | 'DOCTORS' | 'PHARMACY' | 'COLLECTION_AGENTS' | 'INVENTORY' | 'SETTINGS'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // ==================== 1. TESTS CATALOG & PRICING SUB-TABS ====================
  const [testsSubTab, setTestsSubTab] = useState('TESTS'); // 'TESTS' | 'PACKAGES' | 'CATEGORIES'
  const [testCategories, setTestCategories] = useState(THYROCARE_CATEGORIES);
  const [testsList, setTestsList] = useState(THYROCARE_TESTS);
  const [filterCategory, setFilterCategory] = useState('ALL');

  // Modals for Tests, Packages, Categories
  const [showCreateTestModal, setShowCreateTestModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [newTestForm, setNewTestForm] = useState({
    name: '',
    category: 'Thyroid & Hormones',
    params: 1,
    sample: 'Blood (Serum)',
    fasting: '10-12 hrs Fasting',
    tat: '12 Hours',
    thyrocarePrice: '',
    originalPrice: '',
    apolloPrice: '',
    lalPrice: '',
    yellowTag: 'SPECIAL RATE',
    description: ''
  });

  // Dynamic Packages State & Modals
  const [packagesList, setPackagesList] = useState([
    {
      id: 'pkg_aarogyam_comp_13',
      name: 'Aarogyam Complete 1.3 (Master Health Checkup)',
      category: 'Aarogyam Full Body Profiles',
      includedCount: 12,
      params: 104,
      thyrocarePrice: 1499,
      originalPrice: 3500,
      discountPercent: 57,
      yellowTag: 'MEGA 57% OFF',
      fasting: '10-12 hrs Fasting',
      tat: '24 Hours',
      description: 'Comprehensive health panel covering Liver, Kidney, Lipid, Thyroid, Vitamin D & B12, and Complete Hemogram.'
    },
    {
      id: 'pkg_aarogyam_basic_11',
      name: 'Aarogyam Basic 1.1 (Essential Health Profile)',
      category: 'Aarogyam Full Body Profiles',
      includedCount: 8,
      params: 63,
      thyrocarePrice: 899,
      originalPrice: 1800,
      discountPercent: 50,
      yellowTag: 'POPULAR',
      fasting: '10-12 hrs Fasting',
      tat: '12 Hours',
      description: 'Essential wellness checkup covering Complete Hemogram, Thyroid, Lipid Profile, and Liver Function.'
    }
  ]);
  const [editingPackage, setEditingPackage] = useState(null);
  const [packageBuilderForm, setPackageBuilderForm] = useState({
    name: '',
    yellowTag: 'MEGA 55% OFF',
    selectedTests: ['th_thyroid_total', 'th_lipid_profile', 'th_lft_11', 'th_kft_renal'],
    packagePrice: '',
    fasting: '10-12 hrs Overnight Fasting',
    tat: '24 Hours',
    description: ''
  });

  // Category Edit Modal
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  // ==================== 2. PARTNER LABS SUB-TABS ====================
  const [labsSubTab, setLabsSubTab] = useState('ACTIVE_LABS'); // 'ACTIVE_LABS' | 'ONBOARDING_REQUESTS' | 'COMMISSION_SLABS' | 'QUALITY_NABL'
  const [labPartners, setLabPartners] = useState([
    { id: 'LAB-01', name: 'Thyrocare Central Processing Lab', type: 'National Reference Lab', city: 'Mumbai / Pan-India', nabl: 'NABL-CC-4921', status: 'ACTIVE', margin: '15%', tests: 104, validity: 'Dec 2028' },
    { id: 'LAB-02', name: 'Apollo Diagnostics Tirupati', type: 'Regional Processing Lab', city: 'Tirupati (Air Bypass Rd)', nabl: 'NABL-AP-8921', status: 'ACTIVE', margin: '18%', tests: 85, validity: 'Aug 2027' },
    { id: 'LAB-03', name: 'Dr. Lal PathLabs Hub', type: 'Accredited Lab', city: 'Tirupati (Renigunta Rd)', nabl: 'NABL-AP-3104', status: 'ACTIVE', margin: '15%', tests: 92, validity: 'Nov 2027' }
  ]);
  const [labRequests, setLabRequests] = useState([
    { id: 'LAB-REQ-101', name: 'Star Diagnostics & Pathology Hub', applicant: 'Dr. K. Srinivas', city: 'Tirupati (Alipiri)', license: 'AP-MED-2026-89', phone: '+91 98765 99001', testsOffered: 45, date: '30 Aug 2026', status: 'UNDER_REVIEW' },
    { id: 'LAB-REQ-102', name: 'Srinivasa Bio-Pathology Care', applicant: 'Dr. R. Mohan', city: 'Chandragiri, Tirupati', license: 'AP-MED-2026-94', phone: '+91 98765 99002', testsOffered: 38, date: '29 Aug 2026', status: 'UNDER_REVIEW' }
  ]);
  const [commissionSlabs, setCommissionSlabs] = useState([
    { tier: 'Tier 1: National Reference Lab (Thyrocare / CAP)', margin: 15, payoutCycle: 'Weekly Automated', activeLabs: 1 },
    { tier: 'Tier 2: Regional NABL Hub (Apollo / Lal PathLabs)', margin: 18, payoutCycle: 'Weekly Automated', activeLabs: 2 },
    { tier: 'Tier 3: Local Tirupati Diagnostic Centers', margin: 12, payoutCycle: 'Bi-Weekly', activeLabs: 5 }
  ]);

  // ==================== 3. COLLECTION AGENTS (FLEET) SUB-TABS ====================
  const [agentsSubTab, setAgentsSubTab] = useState('LIVE_MAP'); // 'LIVE_MAP' | 'AGENT_REQUESTS' | 'INDIVIDUAL_TRACKER' | 'COLD_CHAIN_IOT'
  const [collectionAgents, setCollectionAgents] = useState([
    { id: 'AG-01', name: 'Ramesh Kumar', phone: '+91 98765 11223', area: 'Air Bypass & Alipiri, Tirupati', samplesToday: 9, temp: '4.2°C', battery: '88%', status: 'ON_ROUTE', lat: 13.6288, lng: 79.4192, rating: 4.9, completedOrders: 420 },
    { id: 'AG-02', name: 'Suresh Babu', phone: '+91 98765 44332', area: 'Renigunta Rd & Tiruchanoor', samplesToday: 7, temp: '3.8°C', battery: '76%', status: 'SAMPLE_COLLECTED', lat: 13.6350, lng: 79.4300, rating: 4.8, completedOrders: 310 },
    { id: 'AG-03', name: 'Venkat Reddy', phone: '+91 98765 99881', area: 'Chandragiri & SVIMS Area', samplesToday: 8, temp: '4.5°C', battery: '92%', status: 'AT_LAB_DESK', lat: 13.6420, lng: 79.4100, rating: 5.0, completedOrders: 540 }
  ]);
  const [agentRequests, setAgentRequests] = useState([
    { id: 'REQ-AG-201', name: 'K. Balaji', phone: '+91 98765 33445', qualification: 'DMLT / Certified Phlebotomist', experience: '3 Years (Apollo Tirupati)', dlNo: 'AP-03-2022-8899', policeClearance: true, date: '30 Aug 2026', status: 'PENDING_APPROVAL' },
    { id: 'REQ-AG-202', name: 'M. Hariprasad', phone: '+91 98765 55667', qualification: 'B.Sc MLT', experience: '4 Years (SVIMS Lab)', dlNo: 'AP-03-2021-4432', policeClearance: true, date: '29 Aug 2026', status: 'PENDING_APPROVAL' }
  ]);
  const [selectedAgentForTracking, setSelectedAgentForTracking] = useState(collectionAgents[0]);

  // ==================== 4. MEDICAL INVENTORY & SUPPLIES SUB-TABS ====================
  const [inventorySubTab, setInventorySubTab] = useState('STOCK_OVERVIEW'); // 'STOCK_OVERVIEW' | 'AGENT_DISPATCH' | 'PURCHASE_ORDERS' | 'USAGE_LOGS'
  const [inventoryStock, setInventoryStock] = useState([
    { id: 'INV-01', name: 'BD Vacutainer EDTA K2 Tubes (2ml Purple)', category: 'Blood Collection', currentQty: 1450, minThreshold: 300, unit: 'Tubes', unitCost: 8.5, supplier: 'Becton Dickinson India', status: 'IN_STOCK' },
    { id: 'INV-02', name: 'SST Gel & Clot Activator Tubes (Yellow Top)', category: 'Blood Collection', currentQty: 1800, minThreshold: 400, unit: 'Tubes', unitCost: 11.0, supplier: 'Becton Dickinson India', status: 'IN_STOCK' },
    { id: 'INV-03', name: 'Nitrile Examination Gloves (Powder-Free M)', category: 'PPE Supplies', currentQty: 240, minThreshold: 100, unit: 'Boxes (100/bx)', unitCost: 280, supplier: 'Safetouch Healthcare', status: 'IN_STOCK' },
    { id: 'INV-04', name: 'Sterile Syringes 5ml with 23G Needle', category: 'Consumables', currentQty: 950, minThreshold: 250, unit: 'Units', unitCost: 4.2, supplier: 'Dispovan India', status: 'IN_STOCK' },
    { id: 'INV-05', name: 'Isopropyl Alcohol Swabs 70% (Individually Foil Packed)', category: 'Sanitization', currentQty: 3200, minThreshold: 800, unit: 'Swabs', unitCost: 1.2, supplier: 'Steripack Pharma', status: 'IN_STOCK' },
    { id: 'INV-06', name: 'Cold-Chain Reusable Ice Gel Packs (-5°C)', category: 'Fleet Cold-Chain', currentQty: 85, minThreshold: 30, unit: 'Gel Packs', unitCost: 65, supplier: 'CoolChain Logistics', status: 'IN_STOCK' },
    { id: 'INV-07', name: 'Biohazard Yellow Disposal Bags (Autoclavable)', category: 'Waste Management', currentQty: 450, minThreshold: 150, unit: 'Bags', unitCost: 6.0, supplier: 'BioClean AP', status: 'IN_STOCK' }
  ]);
  const [inventoryDispatches, setInventoryDispatches] = useState([
    { id: 'DSP-881', agentName: 'Ramesh Kumar', date: '30 Aug 2026', itemsIssued: '50 EDTA Tubes, 50 SST Tubes, 1 Box Nitrile Gloves, 100 Alcohol Swabs, 2 Ice Gel Packs', receiverSign: 'Verified Digital PIN', status: 'DISPATCHED' },
    { id: 'DSP-880', agentName: 'Suresh Babu', date: '29 Aug 2026', itemsIssued: '40 EDTA Tubes, 40 SST Tubes, 1 Box Nitrile Gloves, 80 Alcohol Swabs, 2 Ice Gel Packs', receiverSign: 'Verified Digital PIN', status: 'DISPATCHED' }
  ]);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [newDispatchForm, setNewDispatchForm] = useState({
    agentName: 'Ramesh Kumar',
    edtaQty: 50,
    sstQty: 50,
    glovesBoxes: 1,
    swabsQty: 100,
    icePacks: 2
  });

  // Doctor Prescriptions in Admin Queue
  const [doctorOrdersQueue, setDoctorOrdersQueue] = useState([
    {
      orderId: 'DOC-ORD-8921',
      doctor: 'Dr. Ananya Sharma',
      clinic: 'MedMarg Care Clinic, Tirupati',
      patient: 'Rahul Sharma',
      address: 'Air Bypass Rd, Tirupati',
      tests: ['Thyroid Total (T3/T4/TSH)', 'Lipid Profile Comprehensive'],
      doctorPaid: 1000,
      patientCharged: 1000,
      sampleStatus: 'PHLEBO ASSIGNED (RAMESH KUMAR)',
      reportStatus: 'PROCESSING',
      date: '30 Aug 2026'
    },
    {
      orderId: 'DOC-ORD-8920',
      doctor: 'Dr. Rajeshwar Rao',
      clinic: 'Heart Wellness Institute',
      patient: 'K. Srinivasa Rao',
      address: 'SVIMS Road, Tirupati',
      tests: ['Cardiac Risk Profile (hsCRP, Apo-B)', 'HbA1c Diabetes'],
      doctorPaid: 1450,
      patientCharged: 1900,
      sampleStatus: 'SAMPLE IN LAB',
      reportStatus: 'REPORT_READY',
      date: '29 Aug 2026'
    }
  ]);

  // Overall stats
  const stats = {
    todayGmv: '₹1,42,850',
    totalBookings: '1,842',
    activeLabs: labPartners.length,
    activeAgents: collectionAgents.length,
    totalTests: testsList.length,
    totalPackages: packagesList.length,
    inventoryItems: inventoryStock.length
  };

  // Handle Save/Edit Test
  const handleSaveTest = (e) => {
    e.preventDefault();
    if (editingTest) {
      setTestsList(testsList.map(t => t.id === editingTest.id ? { ...editingTest, ...newTestForm } : t));
      setEditingTest(null);
      alert(`Test "${newTestForm.name}" updated successfully!`);
    } else {
      const created = {
        id: `th_custom_${Date.now()}`,
        ...newTestForm,
        params: Number(newTestForm.params) || 1,
        thyrocarePrice: Number(newTestForm.thyrocarePrice),
        originalPrice: Number(newTestForm.originalPrice || Number(newTestForm.thyrocarePrice) * 1.5),
        apolloPrice: Number(newTestForm.apolloPrice || Number(newTestForm.thyrocarePrice) * 1.4),
        lalPrice: Number(newTestForm.lalPrice || Number(newTestForm.thyrocarePrice) * 1.6)
      };
      setTestsList([created, ...testsList]);
      alert(`Test "${created.name}" created and published live!`);
    }
    setShowCreateTestModal(false);
    setNewTestForm({ name: '', category: 'Thyroid & Hormones', params: 1, sample: 'Blood (Serum)', fasting: '10-12 hrs Fasting', tat: '12 Hours', thyrocarePrice: '', originalPrice: '', apolloPrice: '', lalPrice: '', yellowTag: 'SPECIAL RATE', description: '' });
  };

  // Handle Save/Edit Package
  const handleSavePackage = (e) => {
    e.preventDefault();
    const selectedItems = testsList.filter(t => packageBuilderForm.selectedTests.includes(t.id));
    const totalMRP = selectedItems.reduce((sum, t) => sum + t.originalPrice, 0);
    const totalParams = selectedItems.reduce((sum, t) => sum + t.params, 0);
    const pkgPrice = Number(packageBuilderForm.packagePrice || 1499);
    const discount = totalMRP > 0 ? Math.round(((totalMRP - pkgPrice) / totalMRP) * 100) : 50;

    const newPkg = {
      id: editingPackage ? editingPackage.id : `pkg_custom_${Date.now()}`,
      name: packageBuilderForm.name,
      category: 'Aarogyam Full Body Profiles',
      includedCount: selectedItems.length,
      params: totalParams,
      thyrocarePrice: pkgPrice,
      originalPrice: totalMRP,
      discountPercent: discount,
      yellowTag: packageBuilderForm.yellowTag || `MEGA ${discount}% OFF`,
      fasting: packageBuilderForm.fasting,
      tat: packageBuilderForm.tat,
      description: packageBuilderForm.description || `Specialized health bundle combining ${selectedItems.length} core test profiles.`
    };

    if (editingPackage) {
      setPackagesList(packagesList.map(p => p.id === editingPackage.id ? newPkg : p));
      setEditingPackage(null);
      alert(`Package "${newPkg.name}" updated successfully!`);
    } else {
      setPackagesList([newPkg, ...packagesList]);
      alert(`Custom Package "${newPkg.name}" created with ${discount}% discount!`);
    }
    setPackageBuilderForm({ name: '', yellowTag: 'MEGA 55% OFF', selectedTests: ['th_thyroid_total', 'th_lipid_profile'], packagePrice: '', fasting: '10-12 hrs Overnight Fasting', tat: '24 Hours', description: '' });
    setTestsSubTab('PACKAGES');
  };

  // Handle Inventory Dispatch to Agent
  const handleDispatchSupplies = (e) => {
    e.preventDefault();
    const newDispatch = {
      id: `DSP-${Math.floor(100 + Math.random() * 900)}`,
      agentName: newDispatchForm.agentName,
      date: 'Today (30 Aug 2026)',
      itemsIssued: `${newDispatchForm.edtaQty} EDTA Tubes, ${newDispatchForm.sstQty} SST Tubes, ${newDispatchForm.glovesBoxes} Bx Nitrile Gloves, ${newDispatchForm.swabsQty} Alcohol Swabs, ${newDispatchForm.icePacks} Gel Packs`,
      receiverSign: 'Verified Mobile Token',
      status: 'DISPATCHED'
    };
    setInventoryDispatches([newDispatch, ...inventoryDispatches]);
    setShowDispatchModal(false);
    alert(`Medical supplies kit dispatched successfully to Collection Agent ${newDispatchForm.agentName}!`);
  };

  const navMenuItems = [
    { key: 'TESTS_MGMT', label: 'Tests Catalog & Pricing', icon: FlaskConical, badge: testsList.length },
    { key: 'DOCTOR_ORDERS', label: 'Doctor Orders & Prescriptions', icon: Stethoscope, badge: doctorOrdersQueue.length },
    { key: 'LABS', label: 'Partner Diagnostic Labs', icon: Building2, badge: labPartners.length },
    { key: 'COLLECTION_AGENTS', label: 'Collection Agents (Fleet)', icon: Truck, badge: `${collectionAgents.length} Live` },
    { key: 'INVENTORY', label: 'Medical Inventory & Supplies', icon: Boxes, badge: inventoryStock.length },
    { key: 'SCANS', label: '3.0T MRI & Radiology', icon: Layers, badge: 3 },
    { key: 'DOCTORS', label: 'In-Clinic Doctors', icon: Users, badge: 3 },
    { key: 'PHARMACY', label: 'Generic Pharmacy & Rx', icon: Pill, badge: 3 },
    { key: 'OVERVIEW', label: 'Overview & KPI Metrics', icon: BarChart3 },
    { key: 'SETTINGS', label: 'Platform & Hostinger VPS', icon: Settings }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0B132B', color: '#F1F5F9', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* 1. ENTERPRISE SUPER ADMIN SIDEBAR */}
      <aside style={{ 
        width: sidebarCollapsed ? '80px' : '280px', 
        backgroundColor: '#0F172A', 
        borderRight: '1px solid #1E293B', 
        display: 'flex', 
        flexDirection: 'column', 
        transition: 'width 0.2s ease',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100
      }}>
        {/* Brand Header */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '4px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
              <img src="/logo.png" alt="MedMarg" style={{ height: '28px', objectFit: 'contain' }} />
            </div>
            {!sidebarCollapsed && (
              <div>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '900', display: 'block', width: 'fit-content' }}>
                  SUPER ADMIN
                </span>
                <span style={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: '700' }}>Platform Governance</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '1rem', padding: '0.2rem' }}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Sidebar Nav */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto' }}>
          {navMenuItems.map((item) => {
            const IconComp = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: isActive ? '#006B70' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  fontWeight: isActive ? '800' : '600',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
                }}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <IconComp size={20} color={isActive ? '#FBBF24' : '#64748B'} />
                {!sidebarCollapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                {!sidebarCollapsed && item.badge !== undefined && (
                  <span style={{ fontSize: '0.72rem', backgroundColor: isActive ? 'rgba(0,0,0,0.25)' : '#1E293B', color: isActive ? '#FDE047' : '#94A3B8', padding: '0.15rem 0.45rem', borderRadius: '6px', fontWeight: '800' }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: '1rem', borderTop: '1px solid #1E293B', backgroundColor: '#0B132B' }}>
          {!sidebarCollapsed && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#FFF' }}>{user?.name || 'Super Admin (Central Lab)'}</div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>admin@medmarg.com</div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={onSwitchRole} style={{ flex: 1, padding: '0.5rem', backgroundColor: '#1E293B', color: '#FBBF24', border: '1px solid #334155', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
              {sidebarCollapsed ? '⇄' : 'Switch Role'}
            </button>
            <button onClick={onLogout} style={{ padding: '0.5rem 0.75rem', backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
              {sidebarCollapsed ? '✕' : 'Logout'}
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        
        {/* Top Header Bar */}
        <header style={{ height: '70px', backgroundColor: '#0F172A', borderBottom: '1px solid #1E293B', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#FFFFFF' }}>
              {navMenuItems.find(m => m.key === activeTab)?.label}
            </h1>
            <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(245,158,11,0.15)', color: '#FBBF24', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: '800' }}>
              Tirupati Central Lab Operational
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#1E293B', padding: '0.4rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></div>
              <span style={{ color: '#94A3B8' }}>Live Fleet:</span>
              <strong style={{ color: '#FDE047' }}>3 Agents Active</strong>
            </div>

            <button
              onClick={() => alert('Synced tests, package matrices, inventory stock, and collection agent GPS successfully!')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#006B70', color: '#FFF', padding: '0.45rem 0.85rem', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer' }}
            >
              <RefreshCw size={14} /> Sync Platform
            </button>
          </div>
        </header>

        {/* Dynamic Workspace */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          
          {/* ========================================================================= */}
          {/* ===================== TAB 1: TESTS CATALOG & PRICING ===================== */}
          {/* ========================================================================= */}
          {activeTab === 'TESTS_MGMT' && (
            <div>
              {/* Top Sub-tabs Navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.85rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[
                    { key: 'TESTS', label: 'Individual Tests', icon: FlaskConical, count: testsList.length },
                    { key: 'PACKAGES', label: 'Health Packages', icon: Package, count: packagesList.length },
                    { key: 'CATEGORIES', label: 'Test Categories', icon: Tag, count: testCategories.length }
                  ].map(st => {
                    const isSel = testsSubTab === st.key;
                    const IconC = st.icon;
                    return (
                      <button
                        key={st.key}
                        onClick={() => setTestsSubTab(st.key)}
                        style={{
                          padding: '0.6rem 1.1rem',
                          borderRadius: '10px',
                          border: 'none',
                          backgroundColor: isSel ? '#006B70' : '#1E293B',
                          color: isSel ? '#FFF' : '#94A3B8',
                          fontWeight: '800',
                          fontSize: '0.88rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <IconC size={16} color={isSel ? '#FBBF24' : '#94A3B8'} />
                        {st.label} ({st.count})
                      </button>
                    );
                  })}
                </div>

                {testsSubTab === 'TESTS' && (
                  <button onClick={() => { setEditingTest(null); setShowCreateTestModal(true); }} style={{ padding: '0.6rem 1.2rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <PlusCircle size={16} /> Add New Test
                  </button>
                )}
                {testsSubTab === 'PACKAGES' && (
                  <button onClick={() => { setEditingPackage(null); setPackageBuilderForm({ name: '', yellowTag: 'MEGA 55% OFF', selectedTests: ['th_thyroid_total', 'th_lipid_profile'], packagePrice: '', fasting: '10-12 hrs Overnight Fasting', tat: '24 Hours', description: '' }); }} style={{ padding: '0.6rem 1.2rem', backgroundColor: '#F59E0B', color: '#0F172A', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Plus size={16} /> Create New Package
                  </button>
                )}
                {testsSubTab === 'CATEGORIES' && (
                  <button onClick={() => setShowAddCategoryModal(true)} style={{ padding: '0.6rem 1.2rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <PlusCircle size={16} /> Add New Category
                  </button>
                )}
              </div>

              {/* --- SUB-TAB 1.1: INDIVIDUAL TESTS LIST & EDIT --- */}
              {testsSubTab === 'TESTS' && (
                <div>
                  {/* Filter & Search */}
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
                      <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <input
                        type="text"
                        placeholder="Search tests by name or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.4rem', backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '10px', color: '#FFF', fontSize: '0.88rem', outline: 'none' }}
                      />
                    </div>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      style={{ padding: '0.7rem 1rem', backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '10px', color: '#FFF', fontSize: '0.88rem', outline: 'none' }}
                    >
                      <option value="ALL">All Categories ({testCategories.length})</option>
                      {testCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  {/* Tests Table */}
                  <div style={{ backgroundColor: '#1E293B', borderRadius: '18px', border: '1px solid #334155', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#0F172A', borderBottom: '1px solid #334155', color: '#94A3B8' }}>
                          <th style={{ padding: '1rem 1.25rem' }}>TEST NAME</th>
                          <th style={{ padding: '1rem' }}>CATEGORY</th>
                          <th style={{ padding: '1rem' }}>BIOMARKERS</th>
                          <th style={{ padding: '1rem' }}>LAB BASE RATE</th>
                          <th style={{ padding: '1rem' }}>PUBLIC MRP</th>
                          <th style={{ padding: '1rem' }}>SAMPLE & TAT</th>
                          <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {testsList.filter(t => (filterCategory === 'ALL' || t.category === filterCategory) && (searchTerm === '' || t.name.toLowerCase().includes(searchTerm.toLowerCase()))).map(test => (
                          <tr key={test.id} style={{ borderBottom: '1px solid #334155' }}>
                            <td style={{ padding: '1rem 1.25rem' }}>
                              <strong style={{ color: '#FFFFFF' }}>{test.name}</strong>
                              <span style={{ fontSize: '0.7rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '800', marginLeft: '0.5rem' }}>{test.yellowTag}</span>
                            </td>
                            <td style={{ padding: '1rem', color: '#94A3B8' }}>{test.category}</td>
                            <td style={{ padding: '1rem', color: '#67E8F9', fontWeight: '700' }}>{test.params} Params</td>
                            <td style={{ padding: '1rem', color: '#FBBF24', fontWeight: '900' }}>₹{test.thyrocarePrice}</td>
                            <td style={{ padding: '1rem', color: '#94A3B8', textDecoration: 'line-through' }}>₹{test.originalPrice}</td>
                            <td style={{ padding: '1rem', color: '#CBD5E1', fontSize: '0.8rem' }}>{test.sample} • {test.tat}</td>
                            <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                              <button onClick={() => { setEditingTest(test); setNewTestForm(test); setShowCreateTestModal(true); }} style={{ background: 'none', border: 'none', color: '#38BDF8', cursor: 'pointer', marginRight: '0.6rem' }} title="Edit Test">
                                <Edit3 size={16} />
                              </button>
                              <button onClick={() => { if (confirm(`Delete test ${test.name}?`)) setTestsList(testsList.filter(t => t.id !== test.id)); }} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }} title="Delete Test">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* --- SUB-TAB 1.2: HEALTH PACKAGES LIST & BUILDER --- */}
              {testsSubTab === 'PACKAGES' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'start' }}>
                    
                    {/* Left: Package Builder / Editor Form */}
                    <div style={{ backgroundColor: '#1E293B', borderRadius: '20px', border: '1px solid #334155', padding: '1.75rem' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#FBBF24', marginBottom: '1rem' }}>
                        {editingPackage ? `Edit Package: ${editingPackage.name}` : 'Package Bundling Studio'}
                      </h3>

                      {/* Select tests checklist */}
                      <label style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: '700', display: 'block', marginBottom: '0.4rem' }}>
                        Select Diagnostic Tests to Include:
                      </label>
                      <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem', paddingRight: '0.4rem' }} className="custom-scrollbar">
                        {testsList.map(test => {
                          const isSel = packageBuilderForm.selectedTests.includes(test.id);
                          return (
                            <div
                              key={test.id}
                              onClick={() => {
                                if (isSel) setPackageBuilderForm({ ...packageBuilderForm, selectedTests: packageBuilderForm.selectedTests.filter(id => id !== test.id) });
                                else setPackageBuilderForm({ ...packageBuilderForm, selectedTests: [...packageBuilderForm.selectedTests, test.id] });
                              }}
                              style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', backgroundColor: isSel ? 'rgba(0,107,112,0.35)' : '#0F172A', border: isSel ? '1.5px solid #006B70' : '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '18px', height: '18px', borderRadius: '4px', backgroundColor: isSel ? '#006B70' : 'transparent', border: '1px solid #64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '0.75rem' }}>{isSel ? '✓' : ''}</div>
                                <span style={{ color: '#FFF', fontSize: '0.85rem', fontWeight: '700' }}>{test.name}</span>
                              </div>
                              <span style={{ color: '#FBBF24', fontSize: '0.82rem', fontWeight: '800' }}>₹{test.originalPrice}</span>
                            </div>
                          );
                        })}
                      </div>

                      <form onSubmit={handleSavePackage} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <div>
                          <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Package Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Aarogyam Senior Citizen Comprehensive"
                            value={packageBuilderForm.name}
                            onChange={(e) => setPackageBuilderForm({ ...packageBuilderForm, name: e.target.value })}
                            required
                            style={{ width: '100%', padding: '0.7rem 1rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '10px', color: '#FFF', fontSize: '0.88rem', marginTop: '0.2rem' }}
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                          <div>
                            <label style={{ fontSize: '0.78rem', color: '#FBBF24', fontWeight: '800' }}>Package Deal Price (₹)</label>
                            <input
                              type="number"
                              placeholder="1499"
                              value={packageBuilderForm.packagePrice}
                              onChange={(e) => setPackageBuilderForm({ ...packageBuilderForm, packagePrice: e.target.value })}
                              required
                              style={{ width: '100%', padding: '0.7rem 1rem', backgroundColor: '#0F172A', border: '1.5px solid #F59E0B', borderRadius: '10px', color: '#FBBF24', fontSize: '1.1rem', fontWeight: '900', marginTop: '0.2rem' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Highlight Tag</label>
                            <input
                              type="text"
                              value={packageBuilderForm.yellowTag}
                              onChange={(e) => setPackageBuilderForm({ ...packageBuilderForm, yellowTag: e.target.value })}
                              style={{ width: '100%', padding: '0.7rem 1rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '10px', color: '#FFF', fontSize: '0.88rem', marginTop: '0.2rem' }}
                            />
                          </div>
                        </div>

                        <button type="submit" style={{ padding: '0.85rem', background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#0F172A', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '0.95rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                          {editingPackage ? 'Update & Save Package' : 'Publish Health Package to Live Catalog'}
                        </button>
                      </form>
                    </div>

                    {/* Right: Published Packages List */}
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#FFF', marginBottom: '1rem' }}>Active Health Checkup Packages</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {packagesList.map(pkg => (
                          <div key={pkg.id} style={{ backgroundColor: '#1E293B', borderRadius: '16px', border: '1px solid #334155', padding: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '900' }}>{pkg.yellowTag}</span>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FFF', marginTop: '0.3rem' }}>{pkg.name}</h4>
                                <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{pkg.params} Biomarkers • {pkg.includedCount || 8} Test Profiles</div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#FBBF24' }}>₹{pkg.thyrocarePrice}</div>
                                <div style={{ fontSize: '0.75rem', color: '#94A3B8', textDecoration: 'line-through' }}>₹{pkg.originalPrice}</div>
                              </div>
                            </div>

                            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                              <button onClick={() => { setEditingPackage(pkg); setPackageBuilderForm({ name: pkg.name, yellowTag: pkg.yellowTag, selectedTests: ['th_thyroid_total', 'th_lipid_profile', 'th_lft_11'], packagePrice: pkg.thyrocarePrice, fasting: pkg.fasting, tat: pkg.tat, description: pkg.description }); }} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}>
                                Edit Package
                              </button>
                              <button onClick={() => { if (confirm(`Remove package ${pkg.name}?`)) setPackagesList(packagesList.filter(p => p.id !== pkg.id)); }} style={{ padding: '0.4rem 0.8rem', backgroundColor: 'rgba(239,68,68,0.2)', color: '#EF4444', border: 'none', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}>
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* --- SUB-TAB 1.3: TEST CATEGORIES MANAGER --- */}
              {testsSubTab === 'CATEGORIES' && (
                <div>
                  <div style={{ backgroundColor: '#1E293B', borderRadius: '18px', border: '1px solid #334155', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#0F172A', borderBottom: '1px solid #334155', color: '#94A3B8' }}>
                          <th style={{ padding: '1rem 1.25rem' }}>CATEGORY NAME</th>
                          <th style={{ padding: '1rem' }}>ASSOCIATED TESTS COUNT</th>
                          <th style={{ padding: '1rem' }}>VISIBILITY STATUS</th>
                          <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {testCategories.map((cat, idx) => {
                          const count = testsList.filter(t => t.category === cat).length;
                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid #334155' }}>
                              <td style={{ padding: '1rem 1.25rem', fontWeight: '800', color: '#FFF' }}>
                                <Tag size={15} color="#FBBF24" style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                {cat}
                              </td>
                              <td style={{ padding: '1rem', color: '#67E8F9', fontWeight: '700' }}>{count} Tests Listed</td>
                              <td style={{ padding: '1rem' }}><span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(16,185,129,0.2)', color: '#10B981', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>ACTIVE ON WEBSITE</span></td>
                              <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                                <button onClick={() => { const updated = prompt('Edit Category Name:', cat); if (updated) setTestCategories(testCategories.map(c => c === cat ? updated : c)); }} style={{ background: 'none', border: 'none', color: '#38BDF8', cursor: 'pointer', marginRight: '0.6rem' }}>
                                  <Edit3 size={16} />
                                </button>
                                <button onClick={() => { if (confirm(`Remove category "${cat}"?`)) setTestCategories(testCategories.filter(c => c !== cat)); }} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ===================================================================== */}
          {/* ===================== TAB 2: PARTNER DIAGNOSTIC LABS ================== */}
          {/* ===================================================================== */}
          {activeTab === 'LABS' && (
            <div>
              {/* Partner Labs Sub-Tabs */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.85rem' }}>
                {[
                  { key: 'ACTIVE_LABS', label: 'Active Partner Labs', count: labPartners.length },
                  { key: 'ONBOARDING_REQUESTS', label: 'Lab Signup Requests', count: labRequests.length },
                  { key: 'COMMISSION_SLABS', label: 'Commission Margins', count: commissionSlabs.length },
                  { key: 'QUALITY_NABL', label: 'NABL & QC Accreditation', count: labPartners.length }
                ].map(st => (
                  <button
                    key={st.key}
                    onClick={() => setLabsSubTab(st.key)}
                    style={{
                      padding: '0.6rem 1.1rem',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: labsSubTab === st.key ? '#006B70' : '#1E293B',
                      color: labsSubTab === st.key ? '#FFF' : '#94A3B8',
                      fontWeight: '800',
                      fontSize: '0.88rem',
                      cursor: 'pointer'
                    }}
                  >
                    {st.label} ({st.count})
                  </button>
                ))}
              </div>

              {labsSubTab === 'ACTIVE_LABS' && (
                <div style={{ backgroundColor: '#1E293B', borderRadius: '18px', border: '1px solid #334155', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#0F172A', borderBottom: '1px solid #334155', color: '#94A3B8' }}>
                        <th style={{ padding: '1rem 1.25rem' }}>LAB NAME</th>
                        <th style={{ padding: '1rem' }}>LOCATION / CITY</th>
                        <th style={{ padding: '1rem' }}>NABL CERT</th>
                        <th style={{ padding: '1rem' }}>MARGIN</th>
                        <th style={{ padding: '1rem' }}>STATUS</th>
                        <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {labPartners.map(lab => (
                        <tr key={lab.id} style={{ borderBottom: '1px solid #334155' }}>
                          <td style={{ padding: '1rem 1.25rem', fontWeight: '800', color: '#FFF' }}>{lab.name}</td>
                          <td style={{ padding: '1rem', color: '#94A3B8' }}>{lab.city}</td>
                          <td style={{ padding: '1rem', color: '#67E8F9', fontWeight: '700' }}>{lab.nabl}</td>
                          <td style={{ padding: '1rem', color: '#FBBF24', fontWeight: '800' }}>{lab.margin}</td>
                          <td style={{ padding: '1rem' }}><span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(16,185,129,0.2)', color: '#10B981', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>{lab.status}</span></td>
                          <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                            <button onClick={() => { const newMarg = prompt('Update Commission Margin %:', lab.margin); if (newMarg) setLabPartners(labPartners.map(l => l.id === lab.id ? { ...l, margin: newMarg } : l)); }} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}>
                              Edit Margin
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {labsSubTab === 'ONBOARDING_REQUESTS' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {labRequests.map(req => (
                    <div key={req.id} style={{ backgroundColor: '#1E293B', borderRadius: '16px', border: '1px solid #334155', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong style={{ color: '#FBBF24', fontSize: '1.1rem' }}>{req.name}</strong>
                          <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '800' }}>{req.status}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '0.25rem' }}>
                          Contact: <strong>{req.applicant}</strong> ({req.phone}) • License: {req.license} • {req.city}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.6rem' }}>
                        <button onClick={() => { setLabPartners([...labPartners, { id: `LAB-${Date.now()}`, name: req.name, type: 'Regional Processing Lab', city: req.city, nabl: req.license, status: 'ACTIVE', margin: '15%', tests: req.testsOffered, validity: '2028' }]); setLabRequests(labRequests.filter(r => r.id !== req.id)); alert(`Lab ${req.name} approved and activated on MedMarg Marketplace!`); }} style={{ padding: '0.6rem 1.1rem', backgroundColor: '#10B981', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}>
                          Approve & Activate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {labsSubTab === 'COMMISSION_SLABS' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {commissionSlabs.map((slab, idx) => (
                    <div key={idx} style={{ backgroundColor: '#1E293B', borderRadius: '16px', border: '1px solid #334155', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FFF' }}>{slab.tier}</h4>
                        <div style={{ fontSize: '0.82rem', color: '#94A3B8' }}>Payout Schedule: {slab.payoutCycle} • Labs enrolled: {slab.activeLabs}</div>
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#FBBF24' }}>{slab.margin}%</div>
                    </div>
                  ))}
                </div>
              )}

              {labsSubTab === 'QUALITY_NABL' && (
                <div style={{ backgroundColor: '#1E293B', borderRadius: '18px', border: '1px solid #334155', padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#FFF', marginBottom: '1rem' }}>NABL Accreditation & QC Audit Compliance</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {labPartners.map(lab => (
                      <div key={lab.id} style={{ padding: '1rem', backgroundColor: '#0F172A', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ color: '#FFF' }}>{lab.name}</strong>
                          <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Cert: {lab.nabl} • Valid until: {lab.validity}</div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '800' }}>✓ NABL Audited (Grade A)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* ===================== TAB 3: COLLECTION AGENTS (FLEET) ==================== */}
          {/* ========================================================================= */}
          {activeTab === 'COLLECTION_AGENTS' && (
            <div>
              {/* Fleet Sub-Tabs */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.85rem' }}>
                {[
                  { key: 'LIVE_MAP', label: 'Tirupati Live Fleet Map', icon: Compass, count: `${collectionAgents.length} Online` },
                  { key: 'AGENT_REQUESTS', label: 'Agent Signup Requests', icon: UserPlus, count: agentRequests.length },
                  { key: 'INDIVIDUAL_TRACKER', label: 'Individual Agent Audit', icon: UserCheck, count: collectionAgents.length },
                  { key: 'COLD_CHAIN_IOT', label: 'IoT Cold-Chain (2°-8°C)', icon: Thermometer }
                ].map(st => {
                  const isSel = agentsSubTab === st.key;
                  const IconC = st.icon;
                  return (
                    <button
                      key={st.key}
                      onClick={() => setAgentsSubTab(st.key)}
                      style={{
                        padding: '0.6rem 1.1rem',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: isSel ? '#006B70' : '#1E293B',
                        color: isSel ? '#FFF' : '#94A3B8',
                        fontWeight: '800',
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem'
                      }}
                    >
                      <IconC size={16} color={isSel ? '#FBBF24' : '#94A3B8'} />
                      {st.label} {st.count ? `(${st.count})` : ''}
                    </button>
                  );
                })}
              </div>

              {/* LIVE MAP TRACKER */}
              {agentsSubTab === 'LIVE_MAP' && (
                <div>
                  <div style={{ height: '420px', backgroundColor: '#0F172A', borderRadius: '20px', border: '2px solid #006B70', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem' }}>
                    {/* Simulated Live GPS Map View */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                      <span style={{ fontSize: '0.85rem', backgroundColor: 'rgba(0,107,112,0.8)', color: '#FFF', padding: '0.35rem 0.85rem', borderRadius: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></div>
                        Tirupati City Real-Time Fleet GPS Grid (13.6288° N, 79.4192° E)
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Map Updates: 2s Interval</span>
                    </div>

                    {/* Agent Live Markers on Map */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', zIndex: 10 }}>
                      {collectionAgents.map(ag => (
                        <div key={ag.id} style={{ backgroundColor: 'rgba(30,41,59,0.92)', backdropFilter: 'blur(8px)', borderRadius: '14px', border: '1.5px solid #F59E0B', padding: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ color: '#FFF', fontSize: '0.95rem' }}>📍 {ag.name}</strong>
                            <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: '900' }}>{ag.id}</span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#67E8F9', marginTop: '0.25rem' }}>Route: {ag.area}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.5rem', color: '#94A3B8' }}>
                            <span>Samples: <strong style={{ color: '#FFF' }}>{ag.samplesToday}</strong></span>
                            <span>Temp: <strong style={{ color: '#10B981' }}>{ag.temp}</strong></span>
                            <span>Batt: <strong style={{ color: '#FBBF24' }}>{ag.battery}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'radial-gradient(#006B70 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
                  </div>
                </div>
              )}

              {/* AGENT SIGNUP REQUESTS */}
              {agentsSubTab === 'AGENT_REQUESTS' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {agentRequests.map(req => (
                    <div key={req.id} style={{ backgroundColor: '#1E293B', borderRadius: '16px', border: '1px solid #334155', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong style={{ color: '#FFF', fontSize: '1.1rem' }}>{req.name}</strong>
                          <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '800' }}>{req.status}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '0.25rem' }}>
                          {req.qualification} • {req.experience} • 📞 {req.phone}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#10B981', marginTop: '0.2rem' }}>
                          ✓ Driving License: {req.dlNo} • Police Background Verification Cleared
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.6rem' }}>
                        <button onClick={() => { setCollectionAgents([...collectionAgents, { id: `AG-0${collectionAgents.length + 1}`, name: req.name, phone: req.phone, area: 'Tirupati Central Zone', samplesToday: 0, temp: '4.0°C', battery: '100%', status: 'ON_ROUTE', lat: 13.6288, lng: 79.4192, rating: 5.0, completedOrders: 0 }]); setAgentRequests(agentRequests.filter(r => r.id !== req.id)); alert(`Collection Agent ${req.name} onboarded to Tirupati fleet!`); }} style={{ padding: '0.6rem 1.2rem', backgroundColor: '#10B981', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}>
                          Approve & Onboard Agent
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* INDIVIDUAL AGENT TRACKER */}
              {agentsSubTab === 'INDIVIDUAL_TRACKER' && (
                <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {collectionAgents.map(ag => (
                      <div
                        key={ag.id}
                        onClick={() => setSelectedAgentForTracking(ag)}
                        style={{ padding: '1rem', borderRadius: '12px', backgroundColor: selectedAgentForTracking.id === ag.id ? '#006B70' : '#1E293B', border: '1px solid #334155', cursor: 'pointer' }}
                      >
                        <strong style={{ color: '#FFF' }}>{ag.name} ({ag.id})</strong>
                        <div style={{ fontSize: '0.78rem', color: selectedAgentForTracking.id === ag.id ? '#E0F2F1' : '#94A3B8' }}>{ag.area}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ backgroundColor: '#1E293B', borderRadius: '18px', border: '1px solid #334155', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFF' }}>Agent Audit: {selectedAgentForTracking.name}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', margin: '1rem 0' }}>
                      <div style={{ padding: '1rem', backgroundColor: '#0F172A', borderRadius: '10px' }}>
                        <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>TOTAL COMPLETED ORDERS</span>
                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#10B981' }}>{selectedAgentForTracking.completedOrders}</div>
                      </div>
                      <div style={{ padding: '1rem', backgroundColor: '#0F172A', borderRadius: '10px' }}>
                        <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>CUSTOMER RATING</span>
                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#FBBF24' }}>⭐ {selectedAgentForTracking.rating} / 5.0</div>
                      </div>
                      <div style={{ padding: '1rem', backgroundColor: '#0F172A', borderRadius: '10px' }}>
                        <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>COLD-BOX SENSOR</span>
                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#67E8F9' }}>{selectedAgentForTracking.temp} (Optimal)</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* COLD CHAIN IOT */}
              {agentsSubTab === 'COLD_CHAIN_IOT' && (
                <div style={{ backgroundColor: '#1E293B', borderRadius: '18px', border: '1px solid #334155', padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#10B981' }}>IoT Smart Cold-Chain Box Protocol (2.0°C - 8.0°C)</h3>
                  <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: '0.3rem 0 1.25rem' }}>All phlebotomy sample carrier boxes are equipped with BLE temperature loggers.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {collectionAgents.map(ag => (
                      <div key={ag.id} style={{ padding: '1.2rem', backgroundColor: '#0F172A', borderRadius: '12px', border: '1px solid #10B981' }}>
                        <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '800' }}>SENSOR ID: BLE-{ag.id}</div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FFF', margin: '0.4rem 0' }}>{ag.name}</h4>
                        <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#10B981' }}>{ag.temp}</div>
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Normal Range: 2.0°C - 8.0°C</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================================= */}
          {/* ===================== TAB 4: MEDICAL INVENTORY & SUPPLIES ===================== */}
          {/* ============================================================================= */}
          {activeTab === 'INVENTORY' && (
            <div>
              {/* Inventory Sub-Tabs */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.85rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[
                    { key: 'STOCK_OVERVIEW', label: 'Stock Levels & Supplies', icon: Boxes, count: inventoryStock.length },
                    { key: 'AGENT_DISPATCH', label: 'Agent Supplies Dispatch', icon: Truck, count: inventoryDispatches.length },
                    { key: 'PURCHASE_ORDERS', label: 'Supplier POs', icon: ClipboardList },
                    { key: 'USAGE_LOGS', label: 'Consumption Audit', icon: BarChart3 }
                  ].map(st => {
                    const isSel = inventorySubTab === st.key;
                    const IconC = st.icon;
                    return (
                      <button
                        key={st.key}
                        onClick={() => setInventorySubTab(st.key)}
                        style={{
                          padding: '0.6rem 1.1rem',
                          borderRadius: '10px',
                          border: 'none',
                          backgroundColor: isSel ? '#006B70' : '#1E293B',
                          color: isSel ? '#FFF' : '#94A3B8',
                          fontWeight: '800',
                          fontSize: '0.88rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem'
                        }}
                      >
                        <IconC size={16} color={isSel ? '#FBBF24' : '#94A3B8'} />
                        {st.label} {st.count ? `(${st.count})` : ''}
                      </button>
                    );
                  })}
                </div>

                {inventorySubTab === 'AGENT_DISPATCH' && (
                  <button onClick={() => setShowDispatchModal(true)} style={{ padding: '0.6rem 1.2rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Plus size={16} /> Issue Kit to Agent
                  </button>
                )}
              </div>

              {/* STOCK LEVELS TABLE */}
              {inventorySubTab === 'STOCK_OVERVIEW' && (
                <div style={{ backgroundColor: '#1E293B', borderRadius: '18px', border: '1px solid #334155', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#0F172A', borderBottom: '1px solid #334155', color: '#94A3B8' }}>
                        <th style={{ padding: '1rem 1.25rem' }}>ITEM DESCRIPTION</th>
                        <th style={{ padding: '1rem' }}>CATEGORY</th>
                        <th style={{ padding: '1rem' }}>CURRENT IN-STOCK</th>
                        <th style={{ padding: '1rem' }}>MIN THRESHOLD</th>
                        <th style={{ padding: '1rem' }}>UNIT COST</th>
                        <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryStock.map(item => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #334155' }}>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <strong style={{ color: '#FFF' }}>{item.name}</strong>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{item.id} • {item.supplier}</div>
                          </td>
                          <td style={{ padding: '1rem', color: '#94A3B8' }}>{item.category}</td>
                          <td style={{ padding: '1rem', color: item.currentQty > item.minThreshold ? '#10B981' : '#EF4444', fontWeight: '900', fontSize: '1rem' }}>
                            {item.currentQty} {item.unit}
                          </td>
                          <td style={{ padding: '1rem', color: '#94A3B8' }}>{item.minThreshold} {item.unit}</td>
                          <td style={{ padding: '1rem', color: '#FBBF24', fontWeight: '800' }}>₹{item.unitCost}</td>
                          <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                            <button onClick={() => { const addQty = prompt(`Add stock quantity for ${item.name}:`, '100'); if (addQty) setInventoryStock(inventoryStock.map(i => i.id === item.id ? { ...i, currentQty: i.currentQty + Number(addQty) } : i)); }} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}>
                              + Restock
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* AGENT DISPATCH LOG */}
              {inventorySubTab === 'AGENT_DISPATCH' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {inventoryDispatches.map(dsp => (
                    <div key={dsp.id} style={{ backgroundColor: '#1E293B', borderRadius: '16px', border: '1px solid #334155', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong style={{ color: '#FBBF24', fontSize: '1.05rem' }}>{dsp.id}</strong>
                          <span style={{ fontSize: '0.72rem', backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '900' }}>{dsp.status}</span>
                        </div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FFF', margin: '0.3rem 0' }}>Issued to: {dsp.agentName} ({dsp.date})</h4>
                        <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>{dsp.itemsIssued}</div>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: '800' }}>✓ {dsp.receiverSign}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* PURCHASE ORDERS */}
              {inventorySubTab === 'PURCHASE_ORDERS' && (
                <div style={{ backgroundColor: '#1E293B', borderRadius: '18px', border: '1px solid #334155', padding: '2rem', textAlign: 'center' }}>
                  <ClipboardList size={48} color="#006B70" style={{ margin: '0 auto 1rem' }} />
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Automated Medical Supplier Purchase Orders</h3>
                  <p style={{ color: '#94A3B8', fontSize: '0.88rem', margin: '0.5rem 0 1.5rem' }}>Integrated with Becton Dickinson & Dispovan medical supply chains.</p>
                </div>
              )}

              {/* USAGE LOGS */}
              {inventorySubTab === 'USAGE_LOGS' && (
                <div style={{ backgroundColor: '#1E293B', borderRadius: '18px', border: '1px solid #334155', padding: '2rem', textAlign: 'center' }}>
                  <BarChart3 size={48} color="#FBBF24" style={{ margin: '0 auto 1rem' }} />
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Daily Consumption & Waste Audit</h3>
                  <p style={{ color: '#94A3B8', fontSize: '0.88rem', margin: '0.5rem 0 1.5rem' }}>Tracks Central Lab consumption vs Fleet field phlebotomy usage.</p>
                </div>
              )}
            </div>
          )}

          {/* ============================================================================= */}
          {/* ===================== TAB 5: DOCTOR PRESCRIBED ORDERS QUEUE ================== */}
          {/* ============================================================================= */}
          {activeTab === 'DOCTOR_ORDERS' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#FFFFFF' }}>Doctor Prescribed Orders Queue (Central Lab)</h2>
                <p style={{ color: '#94A3B8', fontSize: '0.88rem' }}>Doctor orders with B2B payments. Verified reports auto-sync to both Doctor & Patient consoles.</p>
              </div>

              <div style={{ backgroundColor: '#1E293B', borderRadius: '18px', border: '1px solid #334155', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0F172A', borderBottom: '1px solid #334155', color: '#94A3B8' }}>
                      <th style={{ padding: '1rem 1.25rem' }}>ORDER ID / DATE</th>
                      <th style={{ padding: '1rem' }}>PRESCRIBING DOCTOR</th>
                      <th style={{ padding: '1rem' }}>PATIENT & CITY</th>
                      <th style={{ padding: '1rem' }}>TESTS ORDERED</th>
                      <th style={{ padding: '1rem' }}>DOCTOR PAID LAB</th>
                      <th style={{ padding: '1rem' }}>SAMPLE STATUS</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>DUAL REPORT DISPATCH</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctorOrdersQueue.map(ord => (
                      <tr key={ord.orderId} style={{ borderBottom: '1px solid #334155' }}>
                        <td style={{ padding: '1rem 1.25rem' }}><strong style={{ color: '#FDE047' }}>{ord.orderId}</strong></td>
                        <td style={{ padding: '1rem', color: '#C084FC', fontWeight: '700' }}>{ord.doctor}</td>
                        <td style={{ padding: '1rem', color: '#FFF' }}>{ord.patient}</td>
                        <td style={{ padding: '1rem', color: '#CBD5E1' }}>{ord.tests.join(', ')}</td>
                        <td style={{ padding: '1rem', color: '#10B981', fontWeight: '900' }}>₹{ord.doctorPaid} <span style={{ fontSize: '0.7rem' }}>✓ PAID</span></td>
                        <td style={{ padding: '1rem' }}><span style={{ fontSize: '0.72rem', backgroundColor: 'rgba(245,158,11,0.2)', color: '#FBBF24', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>{ord.sampleStatus}</span></td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          <button onClick={() => alert(`Report uploaded for ${ord.orderId}! Synced to Doctor & Patient app.`)} style={{ padding: '0.45rem 0.85rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer' }}>
                            <DownloadCloud size={14} style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: 'middle' }} /> Dual Sync
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================================= */}
          {/* ===================== OTHER TABS: SCANS / DOCTORS / PHARMACY ================= */}
          {/* ============================================================================= */}
          {(activeTab === 'SCANS' || activeTab === 'DOCTORS' || activeTab === 'PHARMACY' || activeTab === 'OVERVIEW' || activeTab === 'SETTINGS') && (
            <div style={{ backgroundColor: '#1E293B', borderRadius: '18px', border: '1px solid #334155', padding: '2.5rem', textAlign: 'center' }}>
              <Building2 size={48} color="#FBBF24" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#FFF' }}>{navMenuItems.find(m => m.key === activeTab)?.label} Console</h3>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '0.5rem' }}>Active and synced with Tirupati Central Processing Lab & Hostinger VPS.</p>
            </div>
          )}

        </main>
      </div>

      {/* MODAL: ADD / EDIT TEST */}
      {showCreateTestModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 150, backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', overflowY: 'auto' }}>
          <div style={{ backgroundColor: '#1E293B', borderRadius: '24px', maxWidth: '620px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', border: '2px solid #006B70' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#FFF' }}>{editingTest ? `Edit Test: ${editingTest.name}` : 'Add New Diagnostic Test'}</h3>
              <button onClick={() => setShowCreateTestModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSaveTest} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Test Name</label>
                <input type="text" value={newTestForm.name} onChange={(e) => setNewTestForm({ ...newTestForm, name: e.target.value })} required style={{ width: '100%', padding: '0.7rem 1rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '10px', color: '#FFF', fontSize: '0.9rem', marginTop: '0.2rem' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Category</label>
                  <select value={newTestForm.category} onChange={(e) => setNewTestForm({ ...newTestForm, category: e.target.value })} style={{ width: '100%', padding: '0.7rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '10px', color: '#FFF', fontSize: '0.88rem', marginTop: '0.2rem' }}>
                    {testCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Biomarkers Count</label>
                  <input type="number" value={newTestForm.params} onChange={(e) => setNewTestForm({ ...newTestForm, params: e.target.value })} style={{ width: '100%', padding: '0.7rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '10px', color: '#FFF', fontSize: '0.9rem', marginTop: '0.2rem' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '1rem', backgroundColor: '#0F172A', borderRadius: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#FBBF24', fontWeight: '800' }}>Lab Base Price (₹)</label>
                  <input type="number" value={newTestForm.thyrocarePrice} onChange={(e) => setNewTestForm({ ...newTestForm, thyrocarePrice: e.target.value })} required style={{ width: '100%', padding: '0.65rem', backgroundColor: '#1E293B', border: '1.5px solid #F59E0B', borderRadius: '8px', color: '#FBBF24', fontSize: '1rem', fontWeight: '900', marginTop: '0.2rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Public Market MRP (₹)</label>
                  <input type="number" value={newTestForm.originalPrice} onChange={(e) => setNewTestForm({ ...newTestForm, originalPrice: e.target.value })} style={{ width: '100%', padding: '0.65rem', backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', fontSize: '1rem', marginTop: '0.2rem' }} />
                </div>
              </div>

              <button type="submit" style={{ padding: '0.85rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                {editingTest ? 'Update Test in Catalog' : 'Save & Publish Test'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CATEGORY */}
      {showAddCategoryModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 150, backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#1E293B', borderRadius: '20px', maxWidth: '420px', width: '100%', padding: '2rem', border: '2px solid #006B70' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFF', marginBottom: '1rem' }}>Add Test Category</h3>
            <input
              type="text"
              placeholder="e.g. Allergy & Immunology"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '10px', color: '#FFF', fontSize: '0.9rem', marginBottom: '1rem' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => { if (newCategoryName) { setTestCategories([...testCategories, newCategoryName]); setNewCategoryName(''); setShowAddCategoryModal(false); } }} style={{ flex: 1, padding: '0.75rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}>
                Add Category
              </button>
              <button onClick={() => setShowAddCategoryModal(false)} style={{ padding: '0.75rem 1rem', backgroundColor: '#334155', color: '#FFF', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DISPATCH SUPPLIES TO AGENT */}
      {showDispatchModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 150, backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#1E293B', borderRadius: '24px', maxWidth: '500px', width: '100%', padding: '2rem', border: '2px solid #006B70' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#FFF' }}>Issue Supplies Kit to Agent</h3>
              <button onClick={() => setShowDispatchModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleDispatchSupplies} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Select Collection Agent</label>
                <select value={newDispatchForm.agentName} onChange={(e) => setNewDispatchForm({ ...newDispatchForm, agentName: e.target.value })} style={{ width: '100%', padding: '0.7rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '10px', color: '#FFF', fontSize: '0.88rem', marginTop: '0.2rem' }}>
                  {collectionAgents.map(ag => <option key={ag.id} value={ag.name}>{ag.name} ({ag.area})</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94A3B8' }}>EDTA Tubes (Purple)</label>
                  <input type="number" value={newDispatchForm.edtaQty} onChange={(e) => setNewDispatchForm({ ...newDispatchForm, edtaQty: Number(e.target.value) })} style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', marginTop: '0.2rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94A3B8' }}>SST Gel Tubes (Yellow)</label>
                  <input type="number" value={newDispatchForm.sstQty} onChange={(e) => setNewDispatchForm({ ...newDispatchForm, sstQty: Number(e.target.value) })} style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', marginTop: '0.2rem' }} />
                </div>
              </div>

              <button type="submit" style={{ padding: '0.85rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                Confirm & Dispatch Supplies
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
