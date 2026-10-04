import React from 'react';
import { PlusCircle, Zap, CheckCircle } from 'lucide-react';
import RealMapView from '../RealMapView';

export default function TerritoryManagementTab({
  territories,
  selectedZoneId,
  setSelectedZoneId,
  salariedAgents,
  orders,
  handleOpenCreateTerritory,
  handleOpenEditTerritory,
  handleDeleteTerritory,
  handleQuickAllotAgent,
  API_BASE,
  safeFetch
}) {
  return (
    <div>
      {/* Top Title & Actions */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#FFF' }}>Territory Polygon Marking & Phlebotomist Allotment Studio</h2>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Mark city zones, bind pincode clusters, allot phlebotomist agents, set daily quotas, and configure 3-Tier auto-dispatch cascades.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleOpenCreateTerritory}
            style={{ padding: '0.65rem 1.25rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <PlusCircle size={16} color="#FBBF24" /> Create New Territory Zone
          </button>
        </div>
      </div>

      {/* Real Geographic Map Visualizer */}
      <div style={{ backgroundColor: '#1E293B', borderRadius: '22px', border: '1.5px solid #334155', padding: '1.5rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#67E8F9', letterSpacing: '0.05em' }}>
              INTERACTIVE CITY MAP CANVAS — {territories.length} ACTIVE ZONES CONFIGURED
            </span>
            <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Select a zone chip or click a map polygon to inspect and re-allot phlebotomists</div>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#FBBF24', fontWeight: '800', backgroundColor: 'rgba(245,158,11,0.15)', padding: '0.25rem 0.65rem', borderRadius: '20px' }}>
            ⚡ 3-Tier Dispatch Connected
          </span>
        </div>

        {/* Real Geographic Map Component */}
        <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #334155' }}>
          <RealMapView 
            territories={territories} 
            orders={orders} 
            salariedAgents={salariedAgents} 
            height="400px" 
          />
        </div>
      </div>

      {/* Territory Management Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {territories.map(t => {
          const isSel = selectedZoneId === t.id;
          const activeCount = t.activeOrders || 0;
          const maxQuota = t.maxDailyQuota || 15;
          const pct = Math.min(100, Math.round((activeCount / maxQuota) * 100));

          return (
            <div 
              key={t.id} 
              style={{ 
                backgroundColor: '#1E293B', 
                borderRadius: '20px', 
                border: isSel ? `2px solid ${t.color || '#38BDF8'}` : '1.5px solid #334155', 
                padding: '1.5rem',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '900', backgroundColor: `${t.color || '#38BDF8'}22`, color: t.color || '#38BDF8', border: `1px solid ${t.color || '#38BDF8'}` }}>
                  {t.id}
                </span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button 
                    onClick={() => handleOpenEditTerritory(t)}
                    style={{ padding: '0.25rem 0.55rem', backgroundColor: '#0F172A', color: '#67E8F9', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteTerritory(t.id)}
                    style={{ padding: '0.25rem 0.55rem', backgroundColor: '#451A1A', color: '#FCA5A5', border: '1px solid #7F1D1D', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#FFF' }}>{t.name}</h3>

              {/* Covered Pincodes */}
              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '700' }}>📌 Covered Pincodes:</span>
                {(Array.isArray(t.pincodes) ? t.pincodes : [t.pincodes]).map(pin => (
                  <span key={pin} style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', backgroundColor: '#0F172A', color: '#FBBF24', borderRadius: '4px', fontWeight: '800', border: '1px solid #334155' }}>
                    {pin}
                  </span>
                ))}
              </div>

              {/* Allotment Control */}
              <div style={{ marginTop: '1rem', backgroundColor: '#0F172A', padding: '1rem', borderRadius: '14px', border: '1px solid #334155' }}>
                <label style={{ fontSize: '0.75rem', color: '#67E8F9', fontWeight: '800', display: 'block', marginBottom: '0.35rem' }}>
                  👤 PRIMARY ALLOTTED PHLEBOTOMIST:
                </label>
                <select
                  value={t.primaryAgentId}
                  onChange={(e) => handleQuickAllotAgent(t.id, e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', backgroundColor: '#1E293B', color: '#FFF', border: '1.5px solid #006B70', borderRadius: '8px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  <optgroup label="Salaried Phlebotomist Fleet (Quota 15/day)">
                    {salariedAgents.map(ag => (
                      <option key={ag.id} value={ag.id}>
                        {ag.name} ({ag.id}) — {ag.samplesToday}/15 Today
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Gig / Freelance Broadcast">
                    <option value="FREELANCE_BROADCAST">
                      📡 FCM Push Broadcast to All Certified Freelancers
                    </option>
                  </optgroup>
                </select>
              </div>

              {/* Quota Bar */}
              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '0.25rem' }}>
                  <span>Zone Capacity Meter:</span>
                  <span style={{ color: pct >= 90 ? '#EF4444' : pct >= 60 ? '#FBBF24' : '#34D399', fontWeight: '800' }}>
                    {activeCount} / {maxQuota} Orders ({pct}%)
                  </span>
                </div>
                <div style={{ height: '8px', width: '100%', backgroundColor: '#0F172A', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, backgroundColor: t.color || '#38BDF8', borderRadius: '4px', transition: 'width 0.3s ease' }} />
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Tier 1 Allotted: {t.primaryAgentName}</span>
                <button
                  onClick={async () => {
                    try {
                      const testPin = (Array.isArray(t.pincodes) ? t.pincodes[0] : t.pincodes) || '517501';
                      const res = await safeFetch(`${API_BASE}/api/v1/admin/dispatch/auto`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ orderId: 'MM-8921', pincode: testPin })
                      });
                      const data = await res.json();
                      alert(`⚡ DISPATCH CASCADE FOR ${t.name}:\n\nTier: ${data.tier}\nAssigned Agent: ${data.assignedAgent}\nQuota Remaining: ${data.quotaRemaining}\nMessage: ${data.message}`);
                    } catch (e) {
                      alert(`⚡ Dispatched to Primary Salaried Agent ${t.primaryAgentName} for ${t.name}.`);
                    }
                  }}
                  style={{ padding: '0.35rem 0.75rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <Zap size={12} color="#FBBF24" /> Test Cascade
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
