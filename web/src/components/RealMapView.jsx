import React, { useEffect, useRef, useState } from 'react';

// Real geographic Lat/Lng polygons for Tirupati Metro Regions
export const DEFAULT_TERRITORY_GEO = [
  {
    id: 'ZONE-01',
    name: 'Zone 1: Tirupati Central & Air Bypass Rd',
    color: '#38BDF8',
    primaryAgentId: 'AG-01',
    primaryAgentName: 'Ramesh Kumar',
    pincodes: ['517501', '517507'],
    polygon: [
      [13.6350, 79.4120],
      [13.6420, 79.4320],
      [13.6220, 79.4380],
      [13.6140, 79.4150]
    ]
  },
  {
    id: 'ZONE-02',
    name: 'Zone 2: Alipiri, Zoo Park & SVU Campus',
    color: '#10B981',
    primaryAgentId: 'AG-02',
    primaryAgentName: 'Suresh Babu',
    pincodes: ['517502'],
    polygon: [
      [13.6420, 79.3880],
      [13.6600, 79.4150],
      [13.6420, 79.4320],
      [13.6350, 79.4120]
    ]
  },
  {
    id: 'ZONE-03',
    name: 'Zone 3: Renigunta Rd & Tiruchanoor',
    color: '#F59E0B',
    primaryAgentId: 'AG-03',
    primaryAgentName: 'Mahesh V',
    pincodes: ['517503', '517506'],
    polygon: [
      [13.6220, 79.4380],
      [13.6420, 79.4320],
      [13.6320, 79.4820],
      [13.6020, 79.4700]
    ]
  },
  {
    id: 'ZONE-04',
    name: 'Zone 4: Chandragiri & Outer Suburbs',
    color: '#A855F7',
    primaryAgentId: 'FREELANCE_BROADCAST',
    primaryAgentName: 'Gig Freelancer Broadcast Zone',
    pincodes: ['517101'],
    polygon: [
      [13.6140, 79.3450],
      [13.6420, 79.3880],
      [13.6140, 79.4150],
      [13.5850, 79.3750]
    ]
  }
];

// Helper: Point-in-polygon Ray Casting algorithm for Lat/Lng matching
export function isPointInPolygon(point, vs) {
  const x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export default function RealMapView({ 
  territories = DEFAULT_TERRITORY_GEO, 
  orders = [], 
  salariedAgents = [], 
  onLocationSelect, 
  selectedLocation, 
  height = '360px' 
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activePin, setActivePin] = useState(selectedLocation || null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Check Leaflet global availability
    const L = window.L;
    if (!L) {
      console.warn('Leaflet map library loading...');
      return;
    }

    if (mapInstanceRef.current) return; // Map already initialized

    // Center on Tirupati, AP
    const map = L.map(mapContainerRef.current, {
      center: [13.6288, 79.4192],
      zoom: 13,
      zoomControl: true,
      attributionControl: false
    });

    // OpenStreetMap Standard Free Tiles (No API key, No watermark)
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Apply smooth dark mode styling to OpenStreetMap tiles
    const tileContainer = tileLayer.getContainer();
    if (tileContainer) {
      tileContainer.style.filter = 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)';
    }

    markersGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    setMapLoaded(true);

    // Click handler for location assignment pin drop
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      const clickedPt = [lat, lng];

      // Find matching territory zone
      let matchedZone = null;
      for (const t of (territories.length ? territories : DEFAULT_TERRITORY_GEO)) {
        const polyCoords = t.polygon || DEFAULT_TERRITORY_GEO.find(d => d.id === t.id)?.polygon;
        if (polyCoords && isPointInPolygon(clickedPt, polyCoords)) {
          matchedZone = t;
          break;
        }
      }

      const pinData = {
        lat: lat.toFixed(5),
        lng: lng.toFixed(5),
        zoneId: matchedZone ? matchedZone.id : 'ZONE-01 (Default Central)',
        zoneName: matchedZone ? matchedZone.name : 'Central Tirupati Area',
        assignedAgent: matchedZone ? (matchedZone.primaryAgentName || 'Ramesh Kumar') : 'Ramesh Kumar (AG-01)',
        color: matchedZone ? matchedZone.color : '#38BDF8'
      };

      setActivePin(pinData);
      if (onLocationSelect) {
        onLocationSelect(pinData);
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Polygons & Markers when data changes
  useEffect(() => {
    const L = window.L;
    const map = mapInstanceRef.current;
    if (!L || !map || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    // 1. Draw Real Territory Polygons
    const activeTerritories = territories.length ? territories : DEFAULT_TERRITORY_GEO;
    activeTerritories.forEach(t => {
      const polyCoords = t.polygon || DEFAULT_TERRITORY_GEO.find(d => d.id === t.id)?.polygon || [
        [13.6350, 79.4120], [13.6420, 79.4320], [13.6220, 79.4380], [13.6140, 79.4150]
      ];

      const poly = L.polygon(polyCoords, {
        color: t.color || '#38BDF8',
        weight: 2.5,
        dashArray: '5, 5',
        fillColor: t.color || '#38BDF8',
        fillOpacity: 0.18
      }).addTo(markersGroupRef.current);

      poly.bindPopup(`
        <div style="color: #0F172A; font-family: sans-serif; font-size: 13px; line-height: 1.4;">
          <strong style="color: #006B70; font-size: 14px;">${t.name}</strong><br/>
          <strong>Allotted Agent:</strong> ${t.primaryAgentName || 'Unassigned'}<br/>
          <strong>Pincodes:</strong> ${(Array.isArray(t.pincodes) ? t.pincodes : [t.pincodes]).join(', ')}<br/>
          <span style="color: #10B981; font-weight: bold;">● 3-Tier Auto-Dispatch Active</span>
        </div>
      `);
    });

    // 2. Draw Patient Order Markers
    const sampleOrders = orders.length ? orders : [
      { id: 'MM-8921', name: 'Rahul Sharma', address: 'Bairagipatteda, Tirupati', lat: 13.6288, lng: 79.4192, item: 'HbA1c + CBC' },
      { id: 'MM-8922', name: 'Priya Verma', address: 'Air Bypass Rd, Tirupati', lat: 13.6380, lng: 79.4280, item: 'Master Full Body' }
    ];

    sampleOrders.forEach(ord => {
      if (ord.lat && ord.lng) {
        const marker = L.circleMarker([ord.lat, ord.lng], {
          radius: 8,
          fillColor: '#EF4444',
          color: '#FFFFFF',
          weight: 2,
          fillOpacity: 0.9
        }).addTo(markersGroupRef.current);

        marker.bindPopup(`
          <div style="color:#0F172A; font-family:sans-serif; font-size:12px;">
            <strong style="color:#EF4444;">📍 Order #${ord.id}</strong><br/>
            <strong>Patient:</strong> ${ord.name || ord.patientName}<br/>
            <strong>Address:</strong> ${ord.address}<br/>
            <strong>Tests:</strong> ${ord.items || ord.item}
          </div>
        `);
      }
    });

    // 3. Draw Active Agent GPS Markers
    const agents = salariedAgents.length ? salariedAgents : [
      { id: 'AG-01', name: 'Ramesh Kumar', lat: 13.6320, lng: 79.4200, temp: '4.2°C', speed: '28 km/h' },
      { id: 'AG-02', name: 'Suresh Babu', lat: 13.6480, lng: 79.4100, temp: '3.8°C', speed: '31 km/h' }
    ];

    agents.forEach(ag => {
      if (ag.lat && ag.lng) {
        const agentMarker = L.circleMarker([ag.lat, ag.lng], {
          radius: 9,
          fillColor: '#34D399',
          color: '#FFFFFF',
          weight: 2.5,
          fillOpacity: 1
        }).addTo(markersGroupRef.current);

        agentMarker.bindPopup(`
          <div style="color:#0F172A; font-family:sans-serif; font-size:12px;">
            <strong style="color:#006B70;">🛵 Phlebotomist ${ag.name} (${ag.id})</strong><br/>
            <strong>Live GPS Speed:</strong> ${ag.speed || '25 km/h'}<br/>
            <strong>IoT Carry Bag Temp:</strong> <span style="color:#0284C7; font-weight:bold;">${ag.temp || '4.0°C'}</span><br/>
            <span style="color:#059669; font-weight:bold;">● GPS Telemetry Signal Normal</span>
          </div>
        `);
      }
    });

    // 4. Draw Selected Custom Pin if active
    if (activePin && activePin.lat && activePin.lng) {
      const pinMarker = L.marker([activePin.lat, activePin.lng]).addTo(markersGroupRef.current);
      pinMarker.bindPopup(`
        <div style="color:#0F172A; font-family:sans-serif; font-size:12px;">
          <strong style="color:#006B70;">📍 Selected Customer/Marked Pin</strong><br/>
          <strong>Coords:</strong> ${activePin.lat}° N, ${activePin.lng}° E<br/>
          <strong>Assigned Zone:</strong> ${activePin.zoneName}<br/>
          <strong>Mapped Phlebotomist:</strong> ${activePin.assignedAgent}
        </div>
      `).openPopup();
    }

  }, [territories, orders, salariedAgents, activePin]);

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: '16px', overflow: 'hidden', border: '1px solid #334155' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', backgroundColor: '#0F172A' }} />
      
      {/* Banner overlay showing clicked location & assigned agent */}
      {activePin && (
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          right: '12px',
          backgroundColor: 'rgba(15,23,42,0.92)',
          backdropFilter: 'blur(8px)',
          border: '1.5px solid #006B70',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          zIndex: 1000,
          color: '#FFF',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#67E8F9', fontWeight: '800' }}>
              📍 MARKED LOCATION PIN: {activePin.lat}° N, {activePin.lng}° E
            </div>
            <div style={{ fontSize: '0.84rem', fontWeight: '900', color: '#FFF' }}>
              Matched Coverage Zone: <span style={{ color: activePin.color || '#FBBF24' }}>{activePin.zoneName}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block' }}>Auto-Assigned Phlebotomist</span>
            <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#34D399', backgroundColor: 'rgba(16,185,129,0.2)', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
              👤 {activePin.assignedAgent}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
