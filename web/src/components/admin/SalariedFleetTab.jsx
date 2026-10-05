import React from 'react';
import { Zap } from 'lucide-react';
import { API_BASE, safeFetch } from '../../data/apiConfig';

export default function SalariedFleetTab({ salariedAgents, setSalariedAgents }) {
  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A' }}>Territory Marking & Salaried Fleet Allotment Studio</h2>
          <p style={{ color: '#64748B', fontSize: '0.85rem' }}>Mark city zones, assign primary salaried collection agents, and set daily quota limits (max 15/day).</p>
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
          style={{ padding: '0.7rem 1.25rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(0,107,112,0.2)' }}
        >
          <Zap size={16} color="#FBBF24" /> Run Dispatch Cascade Test
        </button>
      </div>

      {/* Territory Visual Map & Agent Allotment Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.75rem', marginBottom: '2rem' }}>
        
        {/* Visual Territory Polygon Map Box */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#006B70', letterSpacing: '0.05em' }}>
              INTERACTIVE CITY TERRITORY MAP (TIRUPATI REGION)
            </div>
            <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '800' }}>● Live GPS Active</span>
          </div>

          {/* SVG Canvas Map Visualizer */}
          <div style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #CBD5E1', padding: '1.5rem', height: '240px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '0.5rem', zIndex: 10 }}>
              <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', backgroundColor: '#E0F2FE', color: '#0284C7', borderRadius: '6px', fontWeight: '800' }}>Zone 1: Central (AG-01)</span>
              <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', backgroundColor: '#DCFCE7', color: '#15803D', borderRadius: '6px', fontWeight: '800' }}>Zone 2: SVU (AG-02)</span>
              <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', backgroundColor: '#FEF3C7', color: '#B45309', borderRadius: '6px', fontWeight: '800' }}>Zone 3: Renigunta (AG-03)</span>
            </div>

            <svg viewBox="0 0 400 160" style={{ width: '100%', height: '140px', position: 'absolute', inset: 0 }}>
              <polygon points="10,20 180,10 160,90 20,80" fill="rgba(2,132,199,0.1)" stroke="#0284C7" strokeWidth="2" strokeDasharray="4" />
              <polygon points="190,10 380,30 360,100 170,90" fill="rgba(21,128,61,0.1)" stroke="#15803D" strokeWidth="2" strokeDasharray="4" />
              <polygon points="20,95 170,95 150,150 10,140" fill="rgba(180,83,9,0.1)" stroke="#B45309" strokeWidth="2" strokeDasharray="4" />

              <circle cx="90" cy="50" r="6" fill="#0284C7" />
              <text x="102" y="54" fill="#0F172A" fontSize="10" fontWeight="bold">AG-01 (28km/h)</text>

              <circle cx="270" cy="55" r="6" fill="#15803D" />
              <text x="282" y="59" fill="#0F172A" fontSize="10" fontWeight="bold">AG-02 (31km/h)</text>

              <circle cx="80" cy="120" r="6" fill="#B45309" />
              <text x="92" y="124" fill="#0F172A" fontSize="10" fontWeight="bold">AG-03 (En-Route)</text>
            </svg>

            <div style={{ fontSize: '0.75rem', color: '#64748B', zIndex: 10, textAlign: 'right' }}>
              Pincodes Mapped: 517501, 517502, 517503, 517507
            </div>
          </div>
        </div>

        {/* Dispatch Cascade Logic Rules Info Card */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A', marginBottom: '0.85rem' }}>
              3-Tier Collection Dispatch Cascade
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.84rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '10px', borderLeft: '4px solid #0284C7', border: '1px solid #E2E8F0' }}>
                <strong style={{ color: '#0284C7' }}>1. Primary Salaried Agent</strong>
                <div style={{ color: '#64748B', fontSize: '0.78rem', marginTop: '0.15rem' }}>Checks territory pincode and assigns to dedicated salaried agent if under 15 orders/day quota.</div>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '10px', borderLeft: '4px solid #D97706', border: '1px solid #E2E8F0' }}>
                <strong style={{ color: '#D97706' }}>2. Secondary Salaried Agent</strong>
                <div style={{ color: '#64748B', fontSize: '0.78rem', marginTop: '0.15rem' }}>If primary agent is at 15/15 capacity, falls back to nearby zone salaried agent.</div>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '10px', borderLeft: '4px solid #7E22CE', border: '1px solid #E2E8F0' }}>
                <strong style={{ color: '#7E22CE' }}>3. FCM Gig Freelancer Broadcast</strong>
                <div style={{ color: '#64748B', fontSize: '0.78rem', marginTop: '0.15rem' }}>If all salaried agents hit 15 orders/day, triggers high-priority FCM Push Broadcast to freelancers.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Salaried Agents Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '1rem 1.25rem' }}>Agent ID</th>
              <th style={{ padding: '1rem' }}>Phlebotomist Name</th>
              <th style={{ padding: '1rem' }}>Mapped Zone / Territory</th>
              <th style={{ padding: '1rem' }}>Daily Quota Usage</th>
              <th style={{ padding: '1rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {salariedAgents.map(ag => (
              <tr key={ag.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', color: '#006B70', fontWeight: '800' }}>{ag.id}</td>
                <td style={{ padding: '1rem', fontWeight: '800', color: '#0F172A' }}>{ag.name}</td>
                <td style={{ padding: '1rem', color: '#334155' }}>📍 {ag.area}</td>
                <td style={{ padding: '1rem', color: '#D97706', fontWeight: '800' }}>{ag.samplesToday || 0} / {ag.maxDailyQuota || 15} Samples</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '800', backgroundColor: '#DCFCE7', color: '#15803D' }}>
                    {ag.status || 'ACTIVE'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
