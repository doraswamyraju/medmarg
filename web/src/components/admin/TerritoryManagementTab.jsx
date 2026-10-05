import React, { useState } from 'react';
import { PlusCircle, Zap, CheckCircle, Edit3, Trash2, MapPin, RefreshCw, RotateCcw, Maximize2, Minimize2, LayoutGrid, List } from 'lucide-react';
import RealMapView, { DEFAULT_TERRITORY_GEO } from '../RealMapView';
import { API_BASE, safeFetch } from '../../data/apiConfig';

export default function TerritoryManagementTab({
  territories = [],
  setTerritories = () => {},
  salariedAgents = [],
  orders = []
}) {
  const [selectedZoneId, setSelectedZoneId] = useState('ZONE-01');
  const [showTerritoryModal, setShowTerritoryModal] = useState(false);
  const [editingTerritory, setEditingTerritory] = useState(null);
  const [viewMode, setViewMode] = useState('CARD_GRID'); // 'CARD_GRID' | 'LIST_TABLE'
  const [isFullScreenMap, setIsFullScreenMap] = useState(false);

  // Form & Drawing Mode State
  const [isDrawingMode, setIsDrawingMode] = useState(true);
  const [drawingPolygonPoints, setDrawingPolygonPoints] = useState([
    [13.6350, 79.4120],
    [13.6420, 79.4320],
    [13.6220, 79.4380],
    [13.6140, 79.4150]
  ]);

  const [territoryForm, setTerritoryForm] = useState({
    id: '',
    name: '',
    pincodes: '',
    primaryAgentId: 'AG-01',
    primaryAgentName: 'Ramesh Kumar',
    color: '#38BDF8',
    maxDailyQuota: 15,
    polygonCoords: '13.6350,79.4120 13.6420,79.4320 13.6220,79.4380 13.6140,79.4150'
  });

  const handleOpenCreateTerritory = () => {
    setEditingTerritory(null);
    const newId = `ZONE-${String(territories.length + 1).padStart(2, '0')}`;
    const defaultPts = [
      [13.6420, 79.4320],
      [13.6550, 79.4600],
      [13.6300, 79.4750],
      [13.6200, 79.4400]
    ];
    setDrawingPolygonPoints(defaultPts);
    setIsDrawingMode(true);
    setTerritoryForm({
      id: newId,
      name: `Zone ${territories.length + 1}: Tirupati Expansion Sector`,
      pincodes: '517505, 517508',
      primaryAgentId: salariedAgents[0]?.id || 'AG-01',
      primaryAgentName: salariedAgents[0]?.name || 'Ramesh Kumar',
      color: '#EC4899',
      maxDailyQuota: 15,
      polygonCoords: defaultPts.map(p => p.join(',')).join(' ')
    });
    setShowTerritoryModal(true);
  };

  const handleOpenEditTerritory = (t) => {
    setEditingTerritory(t);
    const polyPts = t.polygon || DEFAULT_TERRITORY_GEO.find(d => d.id === t.id)?.polygon || [
      [13.6350, 79.4120],
      [13.6420, 79.4320],
      [13.6220, 79.4380],
      [13.6140, 79.4150]
    ];
    setDrawingPolygonPoints(polyPts);
    setIsDrawingMode(true);
    setTerritoryForm({
      id: t.id,
      name: t.name,
      pincodes: Array.isArray(t.pincodes) ? t.pincodes.join(', ') : t.pincodes,
      primaryAgentId: t.primaryAgentId,
      primaryAgentName: t.primaryAgentName,
      color: t.color || '#38BDF8',
      maxDailyQuota: t.maxDailyQuota || 15,
      polygonCoords: polyPts.map(p => p.join(',')).join(' ')
    });
    setShowTerritoryModal(true);
  };

  const handlePointAdd = (newPoint) => {
    const updated = [...drawingPolygonPoints, newPoint];
    setDrawingPolygonPoints(updated);
    setTerritoryForm(prev => ({
      ...prev,
      polygonCoords: updated.map(p => p.join(',')).join(' ')
    }));
  };

  const handleUndoPoint = () => {
    if (drawingPolygonPoints.length === 0) return;
    const updated = drawingPolygonPoints.slice(0, -1);
    setDrawingPolygonPoints(updated);
    setTerritoryForm(prev => ({
      ...prev,
      polygonCoords: updated.map(p => p.join(',')).join(' ')
    }));
  };

  const handleClearPoints = () => {
    setDrawingPolygonPoints([]);
    setTerritoryForm(prev => ({ ...prev, polygonCoords: '' }));
  };

  const handleSaveTerritory = async (e) => {
    e.preventDefault();
    const pincodeArr = territoryForm.pincodes.split(',').map(p => p.trim()).filter(Boolean);
    const selectedAgentObj = salariedAgents.find(a => a.id === territoryForm.primaryAgentId) || { 
      name: territoryForm.primaryAgentId === 'FREELANCE_BROADCAST' ? 'Gig Freelancer Broadcast Zone' : territoryForm.primaryAgentId 
    };

    const finalPolygon = drawingPolygonPoints.length >= 3 ? drawingPolygonPoints : [
      [13.6350, 79.4120],
      [13.6420, 79.4320],
      [13.6220, 79.4380],
      [13.6140, 79.4150]
    ];
    
    const payload = {
      ...territoryForm,
      pincodes: pincodeArr,
      primaryAgentName: selectedAgentObj.name,
      maxDailyQuota: Number(territoryForm.maxDailyQuota),
      polygon: finalPolygon
    };

    try {
      const res = await safeFetch(`${API_BASE}/api/v1/admin/territories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.territory) {
        setTerritories(prev => {
          const idx = prev.findIndex(t => t.id === data.territory.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = data.territory;
            return next;
          }
          return [...prev, data.territory];
        });
      } else {
        setTerritories(prev => {
          const idx = prev.findIndex(t => t.id === payload.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = payload;
            return next;
          }
          return [...prev, payload];
        });
      }
    } catch (err) {
      setTerritories(prev => {
        const idx = prev.findIndex(t => t.id === payload.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = payload;
          return next;
        }
        return [...prev, payload];
      });
    }
    setShowTerritoryModal(false);
  };

  const handleQuickAllotAgent = async (zoneId, agentId) => {
    const ag = salariedAgents.find(a => a.id === agentId) || { name: agentId === 'FREELANCE_BROADCAST' ? 'Gig Freelancer Broadcast Zone' : agentId };
    setTerritories(prev => prev.map(t => t.id === zoneId ? { ...t, primaryAgentId: agentId, primaryAgentName: ag.name } : t));
    try {
      await safeFetch(`${API_BASE}/api/v1/admin/territories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: zoneId, primaryAgentId: agentId, primaryAgentName: ag.name })
      });
    } catch (e) {}
  };

  const handleDeleteTerritory = async (zoneId) => {
    if (!window.confirm(`Are you sure you want to delete Territory Zone ${zoneId}?`)) return;
    setTerritories(prev => prev.filter(t => t.id !== zoneId));
    try {
      await safeFetch(`${API_BASE}/api/v1/admin/territories/${zoneId}`, { method: 'DELETE' });
    } catch (e) {}
  };

  return (
    <div>
      {/* Top Title & Actions */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#FFF' }}>Territory Polygon Marking & Phlebotomist Allotment Studio</h2>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Mark city zones directly on real maps, bind pincode clusters, allot phlebotomist agents, and set 3-Tier auto-dispatch cascades.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* View Mode Toggle: Cards Grid vs List Table */}
          <div style={{ display: 'flex', backgroundColor: '#0F172A', padding: '0.2rem', borderRadius: '8px', border: '1px solid #334155' }}>
            <button
              onClick={() => setViewMode('CARD_GRID')}
              style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: 'none', backgroundColor: viewMode === 'CARD_GRID' ? '#006B70' : 'transparent', color: viewMode === 'CARD_GRID' ? '#FFF' : '#94A3B8', cursor: 'pointer', fontWeight: '800', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <LayoutGrid size={14} /> Cards
            </button>
            <button
              onClick={() => setViewMode('LIST_TABLE')}
              style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: 'none', backgroundColor: viewMode === 'LIST_TABLE' ? '#006B70' : 'transparent', color: viewMode === 'LIST_TABLE' ? '#FFF' : '#94A3B8', cursor: 'pointer', fontWeight: '800', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <List size={14} /> List View
            </button>
          </div>

          <button
            onClick={handleOpenCreateTerritory}
            style={{ padding: '0.65rem 1.25rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <PlusCircle size={16} color="#FBBF24" /> Create & Mark New Territory Zone
          </button>
        </div>
      </div>

      {/* Real Geographic Map Visualizer (With Full-Screen Toggle) */}
      <div style={{ 
        backgroundColor: '#1E293B', 
        borderRadius: isFullScreenMap ? '0' : '22px', 
        border: isFullScreenMap ? 'none' : '1.5px solid #334155', 
        padding: isFullScreenMap ? '1rem' : '1.5rem', 
        marginBottom: '1.75rem',
        position: isFullScreenMap ? 'fixed' : 'relative',
        inset: isFullScreenMap ? '0' : 'auto',
        zIndex: isFullScreenMap ? 99999 : 1,
        height: isFullScreenMap ? '100vh' : 'auto',
        width: isFullScreenMap ? '100vw' : 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#67E8F9', letterSpacing: '0.05em' }}>
              INTERACTIVE CITY MAP CANVAS — {territories.length} ACTIVE ZONES CONFIGURED
            </span>
            <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Select a zone chip or click a map polygon to inspect and re-allot phlebotomists</div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#FBBF24', fontWeight: '800', backgroundColor: 'rgba(245,158,11,0.15)', padding: '0.25rem 0.65rem', borderRadius: '20px' }}>
              ⚡ 3-Tier Dispatch Connected
            </span>

            {/* Full-Screen Map Mode Toggle Button */}
            <button
              onClick={() => setIsFullScreenMap(!isFullScreenMap)}
              style={{ padding: '0.45rem 0.85rem', backgroundColor: '#0F172A', color: '#67E8F9', border: '1px solid #334155', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              {isFullScreenMap ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              {isFullScreenMap ? 'Exit Full Screen' : 'Full Screen Map'}
            </button>
          </div>
        </div>

        {/* Real Geographic Map Component */}
        <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #334155', flex: 1, minHeight: isFullScreenMap ? 'calc(100vh - 80px)' : '400px' }}>
          <RealMapView 
            territories={territories} 
            orders={orders} 
            salariedAgents={salariedAgents} 
            height={isFullScreenMap ? 'calc(100vh - 80px)' : '400px'} 
          />
        </div>
      </div>

      {/* View Mode 1: Territory Management Cards Grid */}
      {viewMode === 'CARD_GRID' && (
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
                      style={{ padding: '0.25rem 0.55rem', backgroundColor: '#0F172A', color: '#67E8F9', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      ✏️ Mark / Edit Map
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
      )}

      {/* View Mode 2: List View Table for Zones Created */}
      {viewMode === 'LIST_TABLE' && (
        <div style={{ backgroundColor: '#1E293B', borderRadius: '18px', border: '1px solid #334155', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#0F172A', borderBottom: '1px solid #334155', color: '#94A3B8', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '1rem 1.25rem' }}>Zone ID</th>
                <th style={{ padding: '1rem' }}>Territory Sector Name</th>
                <th style={{ padding: '1rem' }}>Covered Pincodes</th>
                <th style={{ padding: '1rem' }}>Primary Allotted Agent</th>
                <th style={{ padding: '1rem' }}>Daily Quota</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {territories.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', color: t.color || '#38BDF8', fontWeight: '800' }}>
                    {t.id}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '800', color: '#FFF' }}>
                    {t.name}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {(Array.isArray(t.pincodes) ? t.pincodes : [t.pincodes]).map(p => (
                      <span key={p} style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', backgroundColor: '#0F172A', color: '#FBBF24', borderRadius: '4px', fontWeight: '800', marginRight: '0.3rem' }}>
                        {p}
                      </span>
                    ))}
                  </td>
                  <td style={{ padding: '1rem', color: '#67E8F9', fontWeight: '700' }}>
                    👤 {t.primaryAgentName}
                  </td>
                  <td style={{ padding: '1rem', color: '#34D399', fontWeight: '800' }}>
                    {t.activeOrders || 0} / {t.maxDailyQuota || 15} Orders
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <button
                      onClick={() => handleOpenEditTerritory(t)}
                      style={{ padding: '0.35rem 0.65rem', backgroundColor: '#0F172A', color: '#67E8F9', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', marginRight: '0.4rem' }}
                    >
                      ✏️ Edit Map
                    </button>
                    <button
                      onClick={() => handleDeleteTerritory(t.id)}
                      style={{ padding: '0.35rem 0.65rem', backgroundColor: '#451A1A', color: '#FCA5A5', border: '1px solid #7F1D1D', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE / EDIT TERRITORY ZONE MODAL */}
      {showTerritoryModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#1E293B', borderRadius: '24px', maxWidth: '780px', width: '100%', padding: '1.75rem', border: '2px solid #006B70', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', backgroundColor: 'rgba(0,107,112,0.3)', color: '#67E8F9', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '900' }}>
                  MAP POLYGON MARKING STUDIO
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#FFF', marginTop: '0.3rem' }}>
                  {editingTerritory ? `Edit & Mark Territory: ${editingTerritory.id}` : 'Create & Mark New Territory Zone'}
                </h2>
              </div>
              <button onClick={() => setShowTerritoryModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSaveTerritory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Zone ID</label>
                  <input
                    type="text"
                    value={territoryForm.id}
                    onChange={(e) => setTerritoryForm({ ...territoryForm, id: e.target.value })}
                    placeholder="ZONE-05"
                    required
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#67E8F9', fontWeight: '800', marginTop: '0.2rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Zone Name & Sector Description</label>
                  <input
                    type="text"
                    value={territoryForm.name}
                    onChange={(e) => setTerritoryForm({ ...territoryForm, name: e.target.value })}
                    placeholder="e.g. Zone 5: Tiruchanoor & Outer South"
                    required
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', marginTop: '0.2rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#FBBF24', fontWeight: '800' }}>📌 Covered Pincodes (Comma Separated)</label>
                <input
                  type="text"
                  value={territoryForm.pincodes}
                  onChange={(e) => setTerritoryForm({ ...territoryForm, pincodes: e.target.value })}
                  placeholder="517501, 517507, 517505"
                  required
                  style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1.5px solid #F59E0B', borderRadius: '8px', color: '#FFF', fontWeight: '800', marginTop: '0.2rem' }}
                />
              </div>

              {/* 🗺️ INTERACTIVE MAP DRAWING STUDIO */}
              <div style={{ backgroundColor: '#0F172A', borderRadius: '16px', border: '1.5px solid #006B70', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', color: '#FBBF24', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={16} /> CLICK ON MAP TO MARK BOUNDARY CORNER VERTICES
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                      Place 3 or more points on the map to define the exact geographic polygon boundary.
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={handleUndoPoint}
                      disabled={drawingPolygonPoints.length === 0}
                      style={{ padding: '0.35rem 0.75rem', backgroundColor: '#1E293B', color: '#67E8F9', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <RotateCcw size={12} /> Undo Point
                    </button>
                    <button
                      type="button"
                      onClick={handleClearPoints}
                      style={{ padding: '0.35rem 0.75rem', backgroundColor: '#451A1A', color: '#FCA5A5', border: '1px solid #7F1D1D', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <RefreshCw size={12} /> Reset Boundary
                    </button>
                  </div>
                </div>

                {/* Map Canvas bounded inside modal */}
                <div style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155', position: 'relative', zIndex: 1 }}>
                  <RealMapView 
                    territories={territories} 
                    salariedAgents={salariedAgents} 
                    isDrawingMode={isDrawingMode}
                    drawingPolygonPoints={drawingPolygonPoints}
                    onPointAdd={handlePointAdd}
                    height="300px" 
                  />
                </div>

                {/* Drawing Points Telemetry Bar */}
                <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#94A3B8' }}>
                  <span>
                    Marked Coordinates ({drawingPolygonPoints.length} Vertices):
                    <strong style={{ color: '#67E8F9', marginLeft: '0.4rem', fontFamily: 'monospace' }}>
                      {drawingPolygonPoints.length >= 3 ? '✓ Valid Closed Polygon' : '⚠️ Click map to add at least 3 points'}
                    </strong>
                  </span>
                  <span style={{ color: '#FBBF24', fontWeight: '800' }}>
                    {drawingPolygonPoints.slice(0, 3).map(p => `[${p[0]},${p[1]}]`).join(' ')} {drawingPolygonPoints.length > 3 ? '...' : ''}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#67E8F9', fontWeight: '800' }}>👤 Primary Allotted Phlebotomist</label>
                  <select
                    value={territoryForm.primaryAgentId}
                    onChange={(e) => {
                      const selId = e.target.value;
                      const ag = salariedAgents.find(a => a.id === selId) || { name: selId === 'FREELANCE_BROADCAST' ? 'Gig Freelancer Broadcast Zone' : selId };
                      setTerritoryForm({ ...territoryForm, primaryAgentId: selId, primaryAgentName: ag.name });
                    }}
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1.5px solid #006B70', borderRadius: '8px', color: '#FFF', fontWeight: '800', marginTop: '0.2rem' }}
                  >
                    <optgroup label="Salaried Phlebotomist Fleet">
                      {salariedAgents.map(ag => (
                        <option key={ag.id} value={ag.id}>{ag.name} ({ag.id})</option>
                      ))}
                    </optgroup>
                    <optgroup label="Gig / Freelance Broadcast">
                      <option value="FREELANCE_BROADCAST">📡 Gig Freelancer Broadcast Zone</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Max Daily Quota</label>
                  <input
                    type="number"
                    value={territoryForm.maxDailyQuota}
                    onChange={(e) => setTerritoryForm({ ...territoryForm, maxDailyQuota: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FBBF24', fontWeight: '800', marginTop: '0.2rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Zone Color Accent</label>
                <input
                  type="color"
                  value={territoryForm.color}
                  onChange={(e) => setTerritoryForm({ ...territoryForm, color: e.target.value })}
                  style={{ width: '100%', height: '42px', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', marginTop: '0.2rem' }}
                />
              </div>

              <button
                type="submit"
                style={{ marginTop: '0.5rem', padding: '0.85rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <CheckCircle size={18} color="#34D399" /> Save Territory Polygon & Activate Allotment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
