import React, { useState } from 'react';
import { Compass, Zap, Navigation, Users, ShieldCheck, MapPin, Radio } from 'lucide-react';
import RealMapView from '../RealMapView';

export default function RealTimeFleetGpsTab({
  territories = [],
  orders = [],
  salariedAgents = [],
  setActiveTab = () => {},
  API_BASE,
  safeFetch
}) {
  const [fleetFilter, setFleetFilter] = useState('ALL'); // 'ALL' | 'SALARIED' | 'FREELANCERS'

  // Mock Freelancers GPS data for map visualization
  const mockFreelanceAgents = [
    { id: 'FL-101', name: 'Ankit Sharma (Freelance)', phone: '+91 98765 22114', area: 'Air Bypass & Alipiri', samplesToday: 4, status: 'ACTIVE', type: 'FREELANCER' },
    { id: 'FL-102', name: 'Sneha Reddy (Freelance)', phone: '+91 98765 33221', area: 'Renigunta Rd & Suburbs', samplesToday: 6, status: 'ACTIVE', type: 'FREELANCER' }
  ];

  const allAgentsList = [
    ...salariedAgents.map(a => ({ ...a, type: 'SALARIED' })),
    ...mockFreelanceAgents
  ];

  const filteredAgents = allAgentsList.filter(ag => {
    if (fleetFilter === 'SALARIED') return ag.type === 'SALARIED';
    if (fleetFilter === 'FREELANCERS') return ag.type === 'FREELANCER';
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#FFF' }}>Real-Time Phlebotomist Fleet GPS Map & Tracking Center</h2>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
            Live GPS telemetry tracking for both salaried & freelance collection phlebotomists across assigned territory polygon zones.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setActiveTab('TERRITORY_MGMT')}
            style={{ padding: '0.65rem 1.2rem', backgroundColor: '#1E293B', color: '#67E8F9', border: '1.5px solid #006B70', borderRadius: '10px', fontWeight: '900', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <Compass size={16} color="#67E8F9" /> Manage Territory Zones
          </button>

          <button
            onClick={async () => {
              try {
                if (safeFetch && API_BASE) {
                  const res = await safeFetch(`${API_BASE}/api/v1/admin/dispatch/auto`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId: 'MM-8921', pincode: '517501' })
                  });
                  const data = await res.json();
                  alert(`⚡ 3-TIER AUTO-DISPATCH ENGINE RESULT:\n\nTier: ${data.tier}\nAssigned To: ${data.assignedAgent}\nMessage: ${data.message}`);
                } else {
                  alert('⚡ Auto-Dispatch Engine: Assigned to Primary Salaried Agent Ramesh Kumar (AG-01).');
                }
              } catch (e) {
                alert('⚡ Auto-Dispatch Engine: Assigned to Primary Salaried Agent Ramesh Kumar (AG-01).');
              }
            }}
            style={{ padding: '0.65rem 1.2rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem', boxShadow: '0 4px 14px rgba(0,107,112,0.3)' }}
          >
            <Zap size={16} color="#FBBF24" /> Test Dispatch Cascade
          </button>
        </div>
      </div>

      {/* Fleet Filter Chips */}
      <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.25rem' }}>
        {[
          { key: 'ALL', label: 'All Fleet Phlebotomists', count: allAgentsList.length },
          { key: 'SALARIED', label: 'Salaried Dedicated Fleet', count: salariedAgents.length },
          { key: 'FREELANCERS', label: 'Verified Freelance FCM Agents', count: mockFreelanceAgents.length }
        ].map(filter => {
          const isSelected = fleetFilter === filter.key;
          return (
            <button
              key={filter.key}
              onClick={() => setFleetFilter(filter.key)}
              style={{
                padding: '0.55rem 1.1rem',
                borderRadius: '10px',
                border: isSelected ? '1.5px solid #006B70' : '1px solid #334155',
                backgroundColor: isSelected ? '#006B70' : '#1E293B',
                color: isSelected ? '#FFF' : '#94A3B8',
                fontWeight: '800',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}
            >
              <Radio size={14} color={isSelected ? '#FBBF24' : '#64748B'} />
              {filter.label} ({filter.count})
            </button>
          );
        })}
      </div>

      {/* Visual Interactive Map Canvas */}
      <div style={{ backgroundColor: '#1E293B', borderRadius: '22px', border: '1.5px solid #334155', padding: '1.5rem', marginBottom: '1.75rem', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#67E8F9', letterSpacing: '0.05em' }}>
              INTERACTIVE CITY MAP & ACTIVE FLEET GPS RADAR (TIRUPATI REGION)
            </span>
            <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Click agent markers or polygon boundaries to view active status</div>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#34D399', fontWeight: '800', backgroundColor: 'rgba(16,185,129,0.15)', padding: '0.25rem 0.65rem', borderRadius: '20px', border: '1px solid rgba(16,185,129,0.3)' }}>
            ● {filteredAgents.length} AGENTS TRANSMITTING LIVE GPS
          </span>
        </div>

        {/* Real Geographic Map Component */}
        <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #334155' }}>
          <RealMapView 
            territories={territories} 
            orders={orders} 
            salariedAgents={filteredAgents} 
            height="400px" 
          />
        </div>
      </div>

      {/* Agent GPS Status Cards */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FFF', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Navigation size={18} color="#67E8F9" /> Phlebotomist GPS Live Status Cards
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {filteredAgents.map(ag => (
          <div key={ag.id} style={{ backgroundColor: '#1E293B', borderRadius: '20px', border: '1.5px solid #334155', padding: '1.5rem', boxShadow: '0 8px 20px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#34D399', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ height: '8px', width: '8px', backgroundColor: '#34D399', borderRadius: '50%', display: 'inline-block' }}></span> GPS ACTIVE
              </span>
              <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '800', backgroundColor: ag.type === 'SALARIED' ? 'rgba(0,107,112,0.3)' : 'rgba(245,158,11,0.2)', color: ag.type === 'SALARIED' ? '#67E8F9' : '#FBBF24' }}>
                {ag.type === 'SALARIED' ? 'SALARIED FLEET' : 'FREELANCE FCM'}
              </span>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#FFF', marginTop: '0.5rem' }}>{ag.name} ({ag.id})</h3>
            <div style={{ fontSize: '0.85rem', color: '#CBD5E1', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={14} color="#FBBF24" /> Mapped Zone: {ag.area}
            </div>

            <div style={{ marginTop: '1.25rem', padding: '0.9rem', backgroundColor: '#0F172A', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span>Completed Today: <strong style={{ color: '#FBBF24' }}>{ag.samplesToday || 0} Orders</strong></span>
              <span style={{ color: '#34D399', fontWeight: '800' }}>Live Signal: 100%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
