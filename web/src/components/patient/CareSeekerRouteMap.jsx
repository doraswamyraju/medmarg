import React, { useEffect, useRef } from 'react';

export default function CareSeekerRouteMap({
  height = '360px',
  phleboCoords = { lat: 13.6350, lng: 79.4230 },
  homeCoords = { lat: 13.6288, lng: 79.4192 },
  eta = '14 Mins',
  distanceKm = '1.8 km'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    const L = window.L;
    if (!L) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // High-resolution clean GIS street tiles without hospital icons or API key limits (Esri World Street Map)
    const map = L.map(mapContainerRef.current, {
      center: [(phleboCoords.lat + homeCoords.lat) / 2, (phleboCoords.lng + homeCoords.lng) / 2],
      zoom: 15,
      zoomControl: true,
      attributionControl: false
    });

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19
    }).addTo(map);

    // 1. Phlebotomist Live Rider Marker
    const riderIcon = L.divIcon({
      className: 'phlebo-rider-marker',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="background-color: #004D40; color: #FFFFFF; font-size: 10px; font-weight: 900; padding: 3px 8px; border-radius: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.25); white-space: nowrap; border: 1px solid #FBBF24; margin-bottom: 2px;">
            🏍️ Phlebotomist (ETA: ${eta})
          </div>
          <div style="width: 34px; height: 34px; background-color: #006B70; border: 3px solid #FBBF24; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,107,112,0.4); display: flex; align-items: center; justify-content: center; color: white; font-size: 16px;">
            👨‍⚕️
          </div>
        </div>
      `,
      iconSize: [40, 50],
      iconAnchor: [20, 50]
    });

    L.marker([phleboCoords.lat, phleboCoords.lng], { icon: riderIcon }).addTo(map);

    // 2. Care Seeker Home Destination Marker with Pulsing Radar
    const homeIcon = L.divIcon({
      className: 'care-seeker-home-marker',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="background-color: #059669; color: #FFFFFF; font-size: 10px; font-weight: 900; padding: 3px 8px; border-radius: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.25); white-space: nowrap; margin-bottom: 2px;">
            📍 Your Home Doorstep
          </div>
          <div style="width: 32px; height: 32px; background-color: #059669; border: 3px solid #FFFFFF; border-radius: 50%; box-shadow: 0 4px 12px rgba(5,150,105,0.4); display: flex; align-items: center; justify-content: center; color: white; font-size: 15px;">
            🏠
          </div>
        </div>
      `,
      iconSize: [36, 46],
      iconAnchor: [18, 46]
    });

    L.marker([homeCoords.lat, homeCoords.lng], { icon: homeIcon }).addTo(map);

    // 3. Real Road Route Polyline (Simulated turn-by-turn road route)
    const routePoints = [
      [phleboCoords.lat, phleboCoords.lng],
      [13.6335, 79.4225],
      [13.6315, 79.4210],
      [13.6300, 79.4200],
      [homeCoords.lat, homeCoords.lng]
    ];

    // Background Shadow Polyline
    L.polyline(routePoints, {
      color: '#003830',
      weight: 8,
      opacity: 0.35,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Main Glowing Navigation Route Polyline
    L.polyline(routePoints, {
      color: '#006B70',
      weight: 5,
      opacity: 0.9,
      dashArray: '8, 8',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Fit map bounds to view both points nicely
    const bounds = L.latLngBounds([
      [phleboCoords.lat, phleboCoords.lng],
      [homeCoords.lat, homeCoords.lng]
    ]);
    map.fitBounds(bounds, { padding: [50, 50] });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [phleboCoords.lat, phleboCoords.lng, homeCoords.lat, homeCoords.lng, eta]);

  return (
    <div style={{ position: 'relative', width: '100%', height: height, borderRadius: '18px', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
      <div 
        ref={mapContainerRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          borderRadius: '18px'
        }} 
      />

      {/* Floating Street Navigation Overlay HUD */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        right: '12px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        borderRadius: '14px',
        padding: '0.75rem 1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        border: '1px solid #E2E8F0',
        zIndex: 500
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#E0F2F1', color: '#006B70', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
            ⚡
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#0F172A' }}>
              Phlebotomist is {distanceKm} away
            </div>
            <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '700' }}>
              ● Moving on Air Bypass Road (Speed: ~24 km/h)
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800' }}>ESTIMATED TIME</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#006B70' }}>{eta}</div>
        </div>
      </div>
    </div>
  );
}
