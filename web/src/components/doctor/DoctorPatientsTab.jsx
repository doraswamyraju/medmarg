import React from 'react';
import { Search, Plus, UserCheck } from 'lucide-react';

export default function DoctorPatientsTab({ 
  patients, 
  searchTerm, 
  setSearchTerm, 
  setShowAddPatientModal, 
  setSelectedPatientForTest, 
  setActiveTab 
}) {
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.phone.includes(searchTerm) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Search & Actions Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', minWidth: '320px', flex: 1 }}>
          <Search size={18} color="#64748B" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search patients by name, phone (+91), or Patient ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '0.9rem' }}
          />
        </div>

        <button
          onClick={() => setShowAddPatientModal(true)}
          style={{ padding: '0.65rem 1.25rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={18} /> Register New Patient
        </button>
      </div>

      {/* Patient Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {filteredPatients.map(patient => (
          <div key={patient.id} style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', backgroundColor: '#E0F2F1', color: '#006B70', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '800' }}>
                  {patient.id}
                </span>
                <span style={{ fontSize: '0.75rem', color: patient.appAccessGranted ? '#059669' : '#D97706', fontWeight: '800', backgroundColor: patient.appAccessGranted ? '#D1FAE5' : '#FEF3C7', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                  {patient.appAccessGranted ? '✓ App Access Live' : 'App Access Pending'}
                </span>
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A' }}>{patient.name}</h3>
              <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.25rem' }}>
                {patient.age} yrs • {patient.gender} • 📞 {patient.phone}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.35rem' }}>
                📍 {patient.address}
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => {
                  setSelectedPatientForTest(patient);
                  setActiveTab('PRESCRIBE');
                }}
                style={{ flex: 1, padding: '0.6rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.84rem', cursor: 'pointer' }}
              >
                🔬 Prescribe Labs
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
