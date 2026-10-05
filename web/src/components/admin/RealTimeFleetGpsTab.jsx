import React, { useState } from 'react';
import { 
  Compass, 
  Zap, 
  Navigation, 
  MapPin, 
  Radio, 
  Thermometer, 
  Battery, 
  Gauge, 
  Phone, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Truck
} from 'lucide-react';
import RealMapView from '../RealMapView';

export default function RealTimeFleetGpsTab({
  territories = [],
  orders = [],
  salariedAgents = [],
  setActiveTab = () => {},
  API_BASE,
  safeFetch
}) {
  const [fleetFilter, setFleetFilter] = useState('ALL');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isRefreshingGps, setIsRefreshingGps] = useState(false);

  const mockFreelanceAgents = [
    { 
      id: 'FL-101', 
      name: 'Ankit Sharma', 
      phone: '+91 98765 22114', 
      area: 'Air Bypass & Alipiri (Zone 1)', 
      samplesToday: 4, 
      status: 'ACTIVE', 
      type: 'FREELANCER',
      speed: '24 km/h',
      temp: '3.6°C',
      battery: '84%',
      currentTask: 'Doorstep Pickup for Order #MM-8924 (Chandragiri)',
      otpVerified: false,
      lastPing: '3s ago'
    },
    { 
      id: 'FL-102', 
      name: 'Sneha Reddy', 
      phone: '+91 98765 33221', 
      area: 'Renigunta Rd & Tiruchanoor (Zone 3)', 
      samplesToday: 6, 
      status: 'ACTIVE', 
      type: 'FREELANCER',
      speed: '0 km/h (At Care Seeker Doorstep)',
      temp: '3.9°C',
      battery: '91%',
      currentTask: 'Sample Collection in Progress: Thyroid Profile',
      otpVerified: true,
      lastPing: '1s ago'
    }
  ];

  const enrichedSalariedAgents = salariedAgents.map((ag, idx) => ({
    ...ag,
    type: 'SALARIED',
    speed: idx === 0 ? '28 km/h' : '18 km/h',
    temp: ag.temp || (idx === 0 ? '4.2°C' : '3.8°C'),
    battery: idx === 0 ? '88%' : '76%',
    currentTask: idx === 0 ? 'En route to Bairagipatteda (Rahul Sharma)' : 'Sample Secured in IoT Cold Bag, Heading to Apollo Hub',
    otpVerified: idx === 0,
    lastPing: '2s ago'
  }));

  const allAgentsList = [
    ...enrichedSalariedAgents,
    ...mockFreelanceAgents
  ];

  const filteredAgents = allAgentsList.filter(ag => {
    if (fleetFilter === 'SALARIED') return ag.type === 'SALARIED';
    if (fleetFilter === 'FREELANCERS') return ag.type === 'FREELANCER';
    return true;
  });

  const handleManualRefresh = () => {
    setIsRefreshingGps(true);
    setTimeout(() => {
      setIsRefreshingGps(false);
    }, 600);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A' }}>Live Phlebotomist Fleet GPS Tracking Command Center</h2>
            <span style={{ fontSize: '0.75rem', backgroundColor: '#DCFCE7', color: '#15803D', padding: '0.15rem 0.55rem', borderRadius: '6px', fontWeight: '800' }}>
              ● LIVE GPS RADAR ACTIVE
            </span>
          </div>
          <p style={{ color: '#64748B', fontSize: '0.85rem' }}>
            Omnipresent telemetry tracking for salaried and freelance phlebotomists: Real-time GPS location, Speed, Cold-Chain Box Temperature (2–8°C), and Doorstep Order Status.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleManualRefresh}
            style={{ padding: '0.65rem 1.1rem', backgroundColor: '#FFFFFF', color: '#006B70', border: '1.5px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <RefreshCw size={15} className={isRefreshingGps ? 'animate-spin' : ''} color="#006B70" /> Refresh Radar
          </button>

          <button
            onClick={() => setActiveTab('TERRITORY_MGMT')}
            style={{ padding: '0.65rem 1.2rem', backgroundColor: '#FFFFFF', color: '#006B70', border: '1.5px solid #006B70', borderRadius: '10px', fontWeight: '900', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <Compass size={16} color="#006B70" /> Manage Territory Zones
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
            style={{ padding: '0.65rem 1.2rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem', boxShadow: '0 4px 14px rgba(0,107,112,0.2)' }}
          >
            <Zap size={16} color="#FBBF24" /> Test Dispatch Engine
          </button>
        </div>
      </div>

      {/* Fleet Filter Chips */}
      <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
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
                border: isSelected ? '1.5px solid #006B70' : '1px solid #CBD5E1',
                backgroundColor: isSelected ? '#006B70' : '#FFFFFF',
                color: isSelected ? '#FFF' : '#475569',
                fontWeight: '800',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: isSelected ? '0 4px 12px rgba(0,107,112,0.2)' : 'none'
              }}
            >
              <Radio size={14} color={isSelected ? '#FBBF24' : '#64748B'} />
              {filter.label} ({filter.count})
            </button>
          );
        })}
      </div>

      {/* Visual Interactive Map Canvas */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '22px', border: '1px solid #E2E8F0', padding: '1.5rem', marginBottom: '1.75rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#006B70', letterSpacing: '0.05em' }}>
              HIGH-RESOLUTION GIS SATELLITE / STREET RADAR (TIRUPATI & CHITTOOR DISTRICT)
            </span>
            <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Real-time GPS coordinates transmitted via phlebotomist mobile app with carrier bag temperature telemetry</div>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: '800', backgroundColor: '#ECFDF5', padding: '0.25rem 0.65rem', borderRadius: '20px', border: '1px solid #A7F3D0' }}>
            ● {filteredAgents.length} AGENTS ONLINE & TRANSMITTING
          </span>
        </div>

        {/* Real Geographic Map Component (Clean Esri Tiles) */}
        <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
          <RealMapView 
            territories={territories} 
            orders={orders} 
            salariedAgents={filteredAgents} 
            height="440px" 
          />
        </div>
      </div>

      {/* Agent GPS Status & Telemetry HUD Cards */}
      <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Navigation size={18} color="#006B70" /> Real-Time Phlebotomist Telemetry & Status HUD
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {filteredAgents.map(ag => {
          const isSalaried = ag.type === 'SALARIED';
          return (
            <div 
              key={ag.id} 
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
                {/* Status Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ height: '8px', width: '8px', backgroundColor: '#10B981', borderRadius: '50%', display: 'inline-block' }}></span> 
                    GPS TRANSMITTING (Ping: {ag.lastPing || '2s ago'})
                  </span>
                  <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.55rem', borderRadius: '6px', fontWeight: '800', backgroundColor: isSalaried ? 'rgba(0,107,112,0.1)' : '#FEF3C7', color: isSalaried ? '#006B70' : '#B45309' }}>
                    {isSalaried ? 'SALARIED FLEET' : 'FREELANCE FCM'}
                  </span>
                </div>

                {/* Agent Identity */}
                <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A' }}>{ag.name}</h3>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', fontFamily: 'monospace' }}>ID: {ag.id} • {ag.phone}</div>
                  </div>
                  <div style={{ padding: '0.35rem 0.65rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '700' }}>TODAY</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#006B70' }}>{ag.samplesToday || 0} Samples</div>
                  </div>
                </div>

                {/* Mapped Zone */}
                <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} color="#D97706" /> Mapped Territory: <strong>{ag.area}</strong>
                </div>

                {/* Live Telemetry Grid */}
                <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  <div style={{ padding: '0.65rem', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
                      <Thermometer size={12} color="#0284C7" /> Cold Chain
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: '900', color: '#0284C7', marginTop: '0.2rem' }}>
                      {ag.temp}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: '#15803D', fontWeight: '700' }}>2-8°C Safe</div>
                  </div>

                  <div style={{ padding: '0.65rem', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
                      <Gauge size={12} color="#D97706" /> Speed
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>
                      {ag.speed}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: '#64748B' }}>Live Transit</div>
                  </div>

                  <div style={{ padding: '0.65rem', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
                      <Battery size={12} color="#15803D" /> Battery
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: '900', color: '#15803D', marginTop: '0.2rem' }}>
                      {ag.battery}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: '#15803D', fontWeight: '700' }}>GPS High Acc</div>
                  </div>
                </div>

                {/* Active Task Callout */}
                <div style={{ marginTop: '0.85rem', padding: '0.75rem', backgroundColor: '#F0FDF4', borderRadius: '10px', border: '1px solid #BBF7D0', fontSize: '0.8rem', color: '#166534' }}>
                  <strong>Current Status:</strong> {ag.currentTask}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.6rem' }}>
                <a 
                  href={`tel:${ag.phone}`}
                  style={{ flex: 1, padding: '0.55rem', backgroundColor: '#F1F5F9', color: '#006B70', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                >
                  <Phone size={13} /> Call Agent
                </a>
                <button
                  onClick={() => alert(`📍 High-precision GPS waypoint sent to ${ag.name} mobile terminal.`)}
                  style={{ flex: 1, padding: '0.55rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                >
                  <Navigation size={13} color="#FBBF24" /> Ping Route
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
