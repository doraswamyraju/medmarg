import React, { useEffect, useRef, useState } from 'react';
import { 
  Navigation, 
  Thermometer, 
  Battery, 
  Gauge, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Radio, 
  RefreshCw, 
  Maximize2,
  Crosshair,
  Bike
} from 'lucide-react';

// Real Coordinates for Tirupati Phlebotomists and Key Hubs
const LIVE_FLEET_DATA = [
  {
    id: 'AG-01',
    name: 'Ramesh Kumar',
    type: 'SALARIED',
    phone: '+91 98765 11223',
    lat: 13.6385,
    lng: 79.4210,
    heading: 45,
    speed: '28 km/h',
    temp: '3.8°C',
    battery: '88%',
    status: 'EN_ROUTE_PICKUP',
    assignedOrder: 'MM-8921 (Rahul Sharma - Bairagipatteda)',
    destination: [13.6420, 79.4310],
    destinationName: 'Bairagipatteda Doorstep',
    bagTempStatus: 'OPTIMAL (2-8°C)',
    samplesCollectedToday: 9,
    avatarColor: '#006B70'
  },
  {
    id: 'AG-02',
    name: 'Suresh Babu',
    type: 'SALARIED',
    phone: '+91 98765 44332',
    lat: 13.6260,
    lng: 79.4350,
    heading: 120,
    speed: '0 km/h (At Doorstep)',
    temp: '4.1°C',
    battery: '76%',
    status: 'SAMPLE_COLLECTING',
    assignedOrder: 'MM-8922 (Priya Verma - Air Bypass Rd)',
    destination: [13.6260, 79.4350],
    destinationName: 'Air Bypass Road House #402',
    bagTempStatus: 'OPTIMAL (2-8°C)',
    samplesCollectedToday: 7,
    avatarColor: '#006B70'
  },
  {
    id: 'FL-101',
    name: 'Ankit Sharma',
    type: 'FREELANCE',
    phone: '+91 98765 22114',
    lat: 13.6190,
    lng: 79.3980,
    heading: 270,
    speed: '22 km/h',
    temp: '3.6°C',
    battery: '84%',
    status: 'TRANSIT_TO_LAB',
    assignedOrder: 'MM-8924 (Chandragiri High Road)',
    destination: [13.6320, 79.4190],
    destinationName: 'MedMarg Central Hub Lab',
    bagTempStatus: 'OPTIMAL (2-8°C)',
    samplesCollectedToday: 4,
    avatarColor: '#D97706'
  },
  {
    id: 'FL-102',
    name: 'Sneha Reddy',
    type: 'FREELANCE',
    phone: '+91 98765 33221',
    lat: 13.6110,
    lng: 79.4520,
    heading: 90,
    speed: '16 km/h',
    temp: '3.9°C',
    battery: '91%',
    status: 'EN_ROUTE_PICKUP',
    assignedOrder: 'MM-8923 (Renigunta Road & Suburbs)',
    destination: [13.6080, 79.4650],
    destinationName: 'Tiruchanoor Doorstep',
    bagTempStatus: 'OPTIMAL (2-8°C)',
    samplesCollectedToday: 6,
    avatarColor: '#D97706'
  }
];

// Lab Hubs on Map
const LAB_HUBS = [
  { id: 'HUB-01', name: 'MedMarg Central Processing Lab', lat: 13.6320, lng: 79.4190, type: 'PRIMARY_HUB' },
  { id: 'HUB-02', name: 'Apollo Diagnostics Regional Lab', lat: 13.6290, lng: 79.4380, type: 'PARTNER_HUB' },
  { id: 'HUB-03', name: 'Dr. Lal PathLabs Collection Hub', lat: 13.6195, lng: 79.4580, type: 'PARTNER_HUB' }
];

export default function LiveFleetTrackerMapView({
  selectedAgentId = null,
  onSelectAgent = () => {},
  fleetFilter = 'ALL',
  height = '500px'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const [activeAgent, setActiveAgent] = useState(null);
  const [isLiveSimulating, setIsLiveSimulating] = useState(true);
  const [liveAgents, setLiveAgents] = useState(LIVE_FLEET_DATA);
  const [gpsPingCounter, setGpsPingCounter] = useState(1);

  // Filter agents by type
  const displayedAgents = liveAgents.filter(ag => {
    if (fleetFilter === 'SALARIED') return ag.type === 'SALARIED';
    if (fleetFilter === 'FREELANCE' || fleetFilter === 'FREELANCERS') return ag.type === 'FREELANCE';
    return true;
  });

  // Initialize Leaflet Live Radar Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const L = window.L;
    if (!L) return;

    if (!mapInstanceRef.current) {
      // Create high-clarity street map centered on Tirupati
      const map = L.map(mapContainerRef.current, {
        center: [13.6288, 79.4260],
        zoom: 13,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Clean Esri World Street Map tiles (crisp road names, high contrast, zero hospital badges)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;
    }

    return () => {};
  }, []);

  // Sync Selected Agent from outside props
  useEffect(() => {
    if (selectedAgentId) {
      const found = liveAgents.find(a => a.id === selectedAgentId);
      if (found) {
        setActiveAgent(found);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([found.lat, found.lng], 15, { animate: true, duration: 1 });
        }
      }
    }
  }, [selectedAgentId, liveAgents]);

  // Render Live Agent Markers, Lab Hubs, and Route Trails
  useEffect(() => {
    const L = window.L;
    if (!L || !mapInstanceRef.current || !markersLayerRef.current) return;

    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    layer.clearLayers();

    // 1. Render Lab Hub Markers
    LAB_HUBS.forEach(hub => {
      const hubIcon = L.divIcon({
        className: 'custom-hub-pin',
        html: `
          <div style="
            background: #0F172A;
            color: #FFFFFF;
            border: 2px solid #38BDF8;
            border-radius: 8px;
            padding: 4px 8px;
            font-size: 11px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            white-space: nowrap;
          ">
            <span>🔬</span> ${hub.name.split(' ')[0]} Hub
          </div>
        `,
        iconSize: [120, 30],
        iconAnchor: [60, 15]
      });

      L.marker([hub.lat, hub.lng], { icon: hubIcon })
        .bindPopup(`<strong>🏥 ${hub.name}</strong><br/><span style="font-size:11px;color:#64748B">Central NABL Processing Destination</span>`)
        .addTo(layer);
    });

    // 2. Render Live Phlebotomist Markers with Pulse
    displayedAgents.forEach(ag => {
      const isSalaried = ag.type === 'SALARIED';
      const isFocused = activeAgent?.id === ag.id;
      const themeColor = isSalaried ? '#006B70' : '#D97706';
      const pulseColor = isSalaried ? 'rgba(0,107,112,0.35)' : 'rgba(217,119,6,0.35)';

      const agentIcon = L.divIcon({
        className: 'custom-live-agent-pin',
        html: `
          <div style="position: relative; cursor: pointer;">
            <!-- Live Radar Pulse Wave -->
            <div style="
              position: absolute;
              top: -12px;
              left: -12px;
              width: 56px;
              height: 56px;
              border-radius: 50%;
              background: ${pulseColor};
              animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
              z-index: 1;
            "></div>

            <!-- Main Agent Avatar Pin -->
            <div style="
              position: relative;
              z-index: 2;
              background: #FFFFFF;
              border: 3px solid ${themeColor};
              border-radius: 20px;
              padding: 4px 10px;
              display: flex;
              align-items: center;
              gap: 6px;
              box-shadow: 0 6px 18px rgba(0,0,0,0.25);
              font-family: Inter, sans-serif;
              transform: ${isFocused ? 'scale(1.1)' : 'scale(1)'};
              transition: transform 0.2s ease;
            ">
              <span style="font-size: 14px;">🏍️</span>
              <div>
                <div style="font-size: 11px; font-weight: 900; color: #0F172A; white-space: nowrap; line-height: 1.1;">
                  ${ag.name}
                </div>
                <div style="font-size: 9px; font-weight: 800; color: ${themeColor}; display: flex; gap: 4px;">
                  <span>${ag.speed}</span> • <span>${ag.temp}</span>
                </div>
              </div>
            </div>
          </div>
        `,
        iconSize: [120, 44],
        iconAnchor: [60, 22]
      });

      const marker = L.marker([ag.lat, ag.lng], { icon: agentIcon }).addTo(layer);

      marker.on('click', () => {
        setActiveAgent(ag);
        onSelectAgent(ag.id);
        map.flyTo([ag.lat, ag.lng], 15, { animate: true, duration: 0.8 });
      });

      // 3. If focused, draw active doorstep destination path & polyline
      if (isFocused && ag.destination) {
        // Draw Destination Pin
        const destIcon = L.divIcon({
          className: 'custom-dest-pin',
          html: `
            <div style="
              background: #EF4444;
              color: #FFFFFF;
              padding: 4px 8px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 800;
              box-shadow: 0 4px 10px rgba(239,68,68,0.4);
              white-space: nowrap;
            ">
              📍 ${ag.destinationName}
            </div>
          `,
          iconSize: [120, 26],
          iconAnchor: [60, 13]
        });

        L.marker(ag.destination, { icon: destIcon }).addTo(layer);

        // Draw animated dashed route connecting agent to doorstep
        L.polyline([[ag.lat, ag.lng], ag.destination], {
          color: themeColor,
          weight: 4,
          dashArray: '8, 8',
          opacity: 0.85
        }).addTo(layer);
      }
    });

  }, [displayedAgents, activeAgent, fleetFilter]);

  // Subtle real-time GPS telemetry tick simulation (micro-movements)
  useEffect(() => {
    if (!isLiveSimulating) return;

    const interval = setInterval(() => {
      setLiveAgents(prev => prev.map(ag => {
        const dLat = (Math.random() - 0.5) * 0.0004;
        const dLng = (Math.random() - 0.5) * 0.0004;
        return {
          ...ag,
          lat: ag.lat + dLat,
          lng: ag.lng + dLng,
          lastPing: 'Just now'
        };
      }));
      setGpsPingCounter(c => c + 1);
    }, 3500);

    return () => clearInterval(interval);
  }, [isLiveSimulating]);

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: '20px', overflow: 'hidden', border: '1.5px solid #CBD5E1', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
      {/* Map Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Top Floating Control HUD */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(8px)',
        padding: '0.6rem 1rem',
        borderRadius: '14px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 8px #10B981', display: 'inline-block' }}></span>
          <span style={{ fontSize: '0.82rem', fontWeight: '900', color: '#0F172A' }}>
            LIVE GPS SATELLITE RADAR
          </span>
        </div>
        <span style={{ fontSize: '0.74rem', color: '#006B70', fontWeight: '800', backgroundColor: '#E0F2F1', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
          {displayedAgents.length} Agents Transmitting
        </span>
        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo([13.6288, 79.4260], 13, { duration: 0.8 });
              setActiveAgent(null);
            }
          }}
          style={{ padding: '0.3rem 0.6rem', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
        >
          <Crosshair size={12} /> Reset View
        </button>
      </div>

      {/* Bottom Floating Active Agent Telemetry Card */}
      {activeAgent && (
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          right: '16px',
          maxWidth: '520px',
          zIndex: 1000,
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1.5px solid #006B70',
          padding: '1.25rem',
          boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h4 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                  {activeAgent.name} ({activeAgent.id})
                </h4>
                <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '800', backgroundColor: activeAgent.type === 'SALARIED' ? '#E0F2F1' : '#FEF3C7', color: activeAgent.type === 'SALARIED' ? '#006B70' : '#B45309' }}>
                  {activeAgent.type === 'SALARIED' ? 'DEDICATED SALARIED FLEET' : 'FREELANCE FCM CONTRACTOR'}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>
                Task: <strong style={{ color: '#0F172A' }}>{activeAgent.assignedOrder}</strong>
              </div>
            </div>

            <button
              onClick={() => setActiveAgent(null)}
              style={{ background: 'none', border: 'none', fontSize: '1rem', color: '#94A3B8', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>

          {/* Telemetry Metrics Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
            <div style={{ padding: '0.5rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: '700' }}>SPEED</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '900', color: '#0F172A' }}>{activeAgent.speed}</div>
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: '#0284C7', fontWeight: '700' }}>COLD CHAIN</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '900', color: '#0284C7' }}>{activeAgent.temp}</div>
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: '#15803D', fontWeight: '700' }}>BATTERY</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '900', color: '#15803D' }}>{activeAgent.battery}</div>
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: '#D97706', fontWeight: '700' }}>TODAY SAMPLES</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '900', color: '#D97706' }}>{activeAgent.samplesCollectedToday}</div>
            </div>
          </div>

          {/* Quick Action Footer */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <a
              href={`tel:${activeAgent.phone}`}
              style={{ padding: '0.45rem 0.9rem', backgroundColor: '#F1F5F9', color: '#006B70', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <Phone size={12} /> Call Phlebotomist
            </a>
            <button
              onClick={() => alert(`📍 High priority dispatch waypoint transmitted to ${activeAgent.name}.`)}
              style={{ padding: '0.45rem 1rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <Navigation size={12} color="#FBBF24" /> Re-route Waypoint
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
