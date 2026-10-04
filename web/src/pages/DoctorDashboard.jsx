import React, { useState } from 'react';
import { 
  Stethoscope, 
  Users, 
  FlaskConical, 
  FileText, 
  CreditCard, 
  Plus, 
  Calendar,
  X
} from 'lucide-react';

// Subcomponents
import DoctorPatientsTab from '../components/doctor/DoctorPatientsTab';
import DoctorPrescribeTab from '../components/doctor/DoctorPrescribeTab';
import DoctorReportsTab from '../components/doctor/DoctorReportsTab';
import DoctorOpdQueueTab from '../components/doctor/DoctorOpdQueueTab';
import DoctorEarningsTab from '../components/doctor/DoctorEarningsTab';

export default function DoctorDashboard({ user, onSwitchRole, onLogout }) {
  const [activeTab, setActiveTab] = useState('PATIENTS');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Doctor's Patient Registry
  const [patients, setPatients] = useState([
    { id: 'PAT-101', name: 'Rahul Sharma', age: 34, gender: 'Male', phone: '+91 98765 43210', address: 'Plot 42, Air Bypass Road, Tirupati, AP', lastVisit: '30 Aug 2026', appAccessGranted: true, pendingTestsCount: 1, totalVisits: 4 },
    { id: 'PAT-102', name: 'K. Srinivasa Rao', age: 58, gender: 'Male', phone: '+91 98765 88990', address: 'SVIMS Staff Quarters, Tirupati, AP', lastVisit: '28 Aug 2026', appAccessGranted: true, pendingTestsCount: 0, totalVisits: 6 },
    { id: 'PAT-103', name: 'Lakshmi Narayana', age: 46, gender: 'Female', phone: '+91 98765 11223', address: 'Near Padmavathi Temple, Tiruchanoor Rd, Tirupati', lastVisit: '29 Aug 2026', appAccessGranted: false, pendingTestsCount: 2, totalVisits: 2 }
  ]);

  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    address: 'Tirupati, Andhra Pradesh',
    appAccessGranted: true
  });

  const [selectedPatientForTest, setSelectedPatientForTest] = useState(patients[0]);
  const [prescribedTestIds, setPrescribedTestIds] = useState(['th_thyroid_total', 'th_lipid_profile']);
  const [doctorCustomPrices, setDoctorCustomPrices] = useState({
    th_thyroid_total: 450,
    th_lipid_profile: 550
  });
  const [allowPatientAppLogin, setAllowPatientAppLogin] = useState(true);
  const [orderSuccessModal, setOrderSuccessModal] = useState(null);

  const [doctorOrders, setDoctorOrders] = useState([
    { orderId: 'DOC-ORD-8921', patientName: 'Rahul Sharma', patientPhone: '+91 98765 43210', items: ['Thyroid Profile Total', 'Lipid Panel'], patientPrice: 1000, b2bCost: 550, doctorMargin: 450, status: 'COLLECTED', date: '30 Aug 2026' }
  ]);

  const handleAddPatientSubmit = (e) => {
    e.preventDefault();
    const created = {
      id: `PAT-${Math.floor(100 + Math.random() * 900)}`,
      name: newPatientForm.name.trim(),
      age: Number(newPatientForm.age) || 30,
      gender: newPatientForm.gender,
      phone: newPatientForm.phone.trim(),
      address: newPatientForm.address.trim(),
      lastVisit: 'Today',
      appAccessGranted: newPatientForm.appAccessGranted,
      pendingTestsCount: 0,
      totalVisits: 1
    };

    setPatients([created, ...patients]);
    setSelectedPatientForTest(created);
    setShowAddPatientModal(false);
    setNewPatientForm({ name: '', age: '', gender: 'Male', phone: '', address: 'Tirupati, Andhra Pradesh', appAccessGranted: true });
  };

  const navMenuItems = [
    { key: 'PATIENTS', label: 'My Patients', icon: Users, badge: `${patients.length}` },
    { key: 'PRESCRIBE', label: 'Prescribe Labs & Pricing', icon: FlaskConical },
    { key: 'REPORTS', label: 'Patient Reports Vault', icon: FileText, badge: `${doctorOrders.length}` },
    { key: 'OPD_QUEUE', label: 'OPD Queue', icon: Calendar, badge: 'Live' },
    { key: 'EARNINGS', label: 'Doctor Earnings & Margins', icon: CreditCard }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Sidebar */}
      <aside style={{ 
        width: sidebarCollapsed ? '80px' : '270px', 
        backgroundColor: '#004D40', 
        borderRight: '1px solid #00332C', 
        display: 'flex', 
        flexDirection: 'column', 
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100
      }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #003830', display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '4px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
              <img src="/logo.png" alt="MedMarg" style={{ height: '28px', objectFit: 'contain' }} />
            </div>
            {!sidebarCollapsed && (
              <div>
                <span style={{ fontSize: '0.7rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '900', display: 'block', width: 'fit-content' }}>
                  DOCTOR CONSOLE
                </span>
                <span style={{ fontSize: '0.82rem', color: '#E0F2F1', fontWeight: '700' }}>Clinical Practice Hub</span>
              </div>
            )}
          </div>
          
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ background: 'none', border: 'none', color: '#80CBC4', cursor: 'pointer' }}>
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <nav style={{ flex: 1, padding: '1.25rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: isActive ? '#006B70' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#B2DFDB',
                  fontWeight: isActive ? '800' : '600',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <IconComp size={20} color={isActive ? '#FBBF24' : '#80CBC4'} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid #003830' }}>
          {!sidebarCollapsed && (
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#FFF' }}>{user?.name || 'Dr. K. Sivasankar'}</div>
              <button onClick={onSwitchRole} style={{ marginTop: '0.5rem', padding: '0.35rem 0.75rem', backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFF', border: 'none', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>Switch Portal</button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '1.75rem 2.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0F172A', marginBottom: '1.5rem' }}>
          {navMenuItems.find(m => m.key === activeTab)?.label}
        </h1>

        {activeTab === 'PATIENTS' && (
          <DoctorPatientsTab 
            patients={patients} 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            setShowAddPatientModal={setShowAddPatientModal} 
            setSelectedPatientForTest={setSelectedPatientForTest} 
            setActiveTab={setActiveTab} 
          />
        )}

        {activeTab === 'PRESCRIBE' && (
          <DoctorPrescribeTab 
            patients={patients} 
            selectedPatientForTest={selectedPatientForTest} 
            setSelectedPatientForTest={setSelectedPatientForTest} 
            prescribedTestIds={prescribedTestIds} 
            setPrescribedTestIds={setPrescribedTestIds} 
            doctorCustomPrices={doctorCustomPrices} 
            setDoctorCustomPrices={setDoctorCustomPrices} 
            allowPatientAppLogin={allowPatientAppLogin} 
            setAllowPatientAppLogin={setAllowPatientAppLogin} 
            setOrderSuccessModal={setOrderSuccessModal} 
          />
        )}

        {activeTab === 'REPORTS' && (
          <DoctorReportsTab doctorOrders={doctorOrders} />
        )}

        {activeTab === 'OPD_QUEUE' && (
          <DoctorOpdQueueTab patients={patients} />
        )}

        {activeTab === 'EARNINGS' && (
          <DoctorEarningsTab doctorOrders={doctorOrders} />
        )}
      </main>

      {/* Add Patient Modal */}
      {showAddPatientModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 120, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '22px', maxWidth: '480px', width: '100%', padding: '1.75rem', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A' }}>Register New OPD Patient</h3>
              <button onClick={() => setShowAddPatientModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B' }}>✕</button>
            </div>

            <form onSubmit={handleAddPatientSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <input type="text" placeholder="Patient Full Name" value={newPatientForm.name} onChange={(e) => setNewPatientForm({ ...newPatientForm, name: e.target.value })} required style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
              <input type="text" placeholder="Phone Number (+91)" value={newPatientForm.phone} onChange={(e) => setNewPatientForm({ ...newPatientForm, phone: e.target.value })} required style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
              <button type="submit" style={{ padding: '0.85rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}>Register Patient & Start Prescription</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
