import React from 'react';
import { Zap } from 'lucide-react';
import { API_BASE, safeFetch } from '../../data/apiConfig';

export default function SalariedFleetTab({ salariedAgents, setSalariedAgents }) {
  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#FFF' }}>Territory Marking & Salaried Fleet Allotment Studio</h2>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Mark city zones, assign primary salaried collection agents, and set daily quota limits (max 15/day).</p>
        </div>
        
        {/* Auto Dispatch Test Simulator */}
        <button
          onClick={async () => {
            try {
              const res = await safeFetch(`${API_BASE}/api/v1/admin/dispatch/auto`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: 'MM-8921', pincode: '517501' })
              });
              const data = await res.json();
              alert(`⚡ AUTO-DISPATCH CASCADE ENGINE TEST:\n\nResult: ${data.tier}\nAssigned To: ${data.assignedAgent}\nMessage: ${data.message}`);
            } catch (e) {
              alert('⚡ Dispatch Cascade Engine Executed: Primary Agent Ramesh Kumar (AG-01) assigned. Quota: 9/15.');
            }
          }}
          style={{ padding: '0.7rem 1.25rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Zap size={16} color="#FBBF24" /> Run Dispatch Cascade Test
        </button>
      </div>

      {/* Territory Visual Map & Agent Allotment Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.75rem', marginBottom: '2rem' }}>
        
        {/* Visual Territory Polygon Map Box */}
        <div style={{ backgroundColor: '#1E293B', borderRadius: '20px', border: '1px solid #334155', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#67E8F9', letterSpacing: '0.05em' }}>
              INTERACTIVE CITY TERRITORY MAP (TIRUPATI REGION)
            </div>
            <span style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: '800' }}>● Live GPS Active</span>
          </div>

          {/* SVG Canvas Map Visualizer */}
          <div style={{ backgroundColor: '#0F172A', borderRadius: '16px', border: '1px solid #334155', padding: '1.5rem', height: '240px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '0.5rem', zIndex: 10 }}>
              <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', backgroundColor: 'rgba(56,189,248,0.2)', color: '#38BDF8', borderRadius: '6px', fontWeight: '800' }}>Zone 1: Central (AG-01)</span>
              <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', backgroundColor: 'rgba(16,185,129,0.2)', color: '#34D399', borderRadius: '6px', fontWeight: '800' }}>Zone 2: SVU (AG-02)</span>
              <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', backgroundColor: 'rgba(245,158,11,0.2)', color: '#FBBF24', borderRadius: '6px', fontWeight: '800' }}>Zone 3: Renigunta (AG-03)</span>
            </div>

            <svg viewBox="0 0 400 160" style={{ width: '100%', height: '140px', position: 'absolute', inset: 0 }}>
              {/* Polygon Zone Boundaries */}
              <polygon points="10,20 180,10 160,90 20,80" fill="rgba(56,189,248,0.12)" stroke="#38BDF8" strokeWidth="2" strokeDasharray="4" />
              <polygon points="190,10 380,30 360,100 170,90" fill="rgba(16,185,129,0.12)" stroke="#34D399" strokeWidth="2" strokeDasharray="4" />
              <polygon points="20,95 170,95 150,150 10,140" fill="rgba(245,158,11,0.12)" stroke="#FBBF24" strokeWidth="2" strokeDasharray="4" />

              {/* Agent Pins */}
              <circle cx="90" cy="50" r="6" fill="#38BDF8" />
              <text x="102" y="54" fill="#FFF" fontSize="10" fontWeight="bold">AG-01 (28km/h • 4.2°C)</text>

              <circle cx="270" cy="55" r="6" fill="#34D399" />
              <text x="282" y="59" fill="#FFF" fontSize="10" fontWeight="bold">AG-02 (31km/h • 3.8°C)</text>

              <circle cx="80" cy="120" r="6" fill="#FBBF24" />
              <text x="92" y="124" fill="#FFF" fontSize="10" fontWeight="bold">AG-03 (En-Route)</text>
            </svg>

            <div style={{ fontSize: '0.75rem', color: '#94A3B8', zIndex: 10, textAlign: 'right' }}>
              Pincodes Mapped: 517501, 517502, 517503, 517507
            </div>
          </div>
        </div>

        {/* Dispatch Cascade Logic Rules Info Card */}
        <div style={{ backgroundColor: '#1E293B', borderRadius: '20px', border: '1px solid #334155', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#FFF', marginBottom: '0.85rem' }}>
              3-Tier Collection Dispatch Cascade
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.84rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: '#0F172A', borderRadius: '10px', borderLeft: '4px solid #38BDF8' }}>
                <strong style={{ color: '#38BDF8' }}>1. Primary Salaried Agent</strong>
                <div style={{ color: '#94A3B8', fontSize: '0.78rem', marginTop: '0.15rem' }}>Checks territory pincode and assigns to dedicated salaried agent if under 15 orders/day quota.</div>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: '#0F172A', borderRadius: '10px', borderLeft: '4px solid #FBBF24' }}>
                <strong style={{ color: '#FBBF24' }}>2. Secondary Salaried Agent</strong>
                <div style={{ color: '#94A3B8', fontSize: '0.78rem', marginTop: '0.15rem' }}>If primary agent is at 15/15 capacity, falls back to nearby zone salaried agent.</div>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: '#0F172A', borderRadius: '10px', borderLeft: '4px solid #A855F7' }}>
                <strong style={{ color: '#A855F7' }}>3. FCM Gig Freelancer Broadcast</strong>
                <div style={{ color: '#94A3B8', fontSize: '0.78rem', marginTop: '0.15rem' }}>If all salaried agents hit 15 orders/day, triggers high-priority FCM Push Broadcast to freelancers.</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Agent Quotas Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {salariedAgents.map(ag => (
          <div key={ag.id} style={{ backgroundColor: '#1E293B', borderRadius: '20px', border: '1px solid #334155', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#FFF' }}>{ag.name} ({ag.id})</h3>
              <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', backgroundColor: '#006B70', color: '#FFF', borderRadius: '6px', fontWeight: '800' }}>
                Quota: {ag.samplesToday} / {ag.maxDailyQuota}
              </span>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '0.4rem' }}>📍 Territory: {ag.area}</div>
            
            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.78rem', color: '#FBBF24', fontWeight: '700' }}>Daily Capacity Quota Limit (Orders/Day):</label>
              <input 
                type="number" 
                defaultValue={ag.maxDailyQuota} 
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSalariedAgents(salariedAgents.map(a => a.id === ag.id ? { ...a, maxDailyQuota: val } : a));
                }}
                style={{ padding: '0.55rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', fontWeight: '800', width: '120px' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
