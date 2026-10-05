import React, { useEffect, useRef } from 'react';

export default function CareSeekerPinpointMap({
  center = { lat: 13.6288, lng: 79.4192 },
  onPinMove = () => {},
  height = '240px'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    const L = window.L;
    if (!L) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Clean, high-contrast OpenStreetMap street tiles (No dark satellite / No admin polygons)
    const map = L.map(mapContainerRef.current, {
      center: [center.lat, center.lng],
      zoom: 15,
      zoomControl: true,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    // Custom Clean Doorstep Pin Marker
    const pinIcon = L.divIcon({
      className: 'custom-pinpoint-marker',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
          <div style="background-color: #004D40; color: #FFFFFF; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); white-space: nowrap; border: 1.5px solid #80CBC4; margin-bottom: 4px;">
            📍 Drag Pin to Exact Doorstep
          </div>
          <div style="width: 28px; height: 28px; background-color: #059669; border: 3px solid #FFFFFF; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">
            🏠
          </div>
        </div>
      `,
      iconSize: [30, 42],
      iconAnchor: [15, 42]
    });

    const marker = L.marker([center.lat, center.lng], {
      icon: pinIcon,
      draggable: true
    }).addTo(map);

    marker.on('dragend', async (e) => {
      const position = marker.getLatLng();
      onPinMove({ lat: position.lat, lng: position.lng });
    });

    map.on('click', (e) => {
      marker.setLatLng(e.latlng);
      onPinMove({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center if props change
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && center) {
      mapInstanceRef.current.setView([center.lat, center.lng], 15);
      markerRef.current.setLatLng([center.lat, center.lng]);
    }
  }, [center.lat, center.lng]);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ 
        width: '100%', 
        height: height, 
        borderRadius: '16px', 
        overflow: 'hidden',
        border: '1.5px solid #CBD5E1',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
        zIndex: 1
      }} 
    />
  );
}
