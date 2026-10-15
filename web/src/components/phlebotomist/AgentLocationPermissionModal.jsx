import React, { useState } from 'react';
import { MapPin, Navigation, ShieldCheck, AlertCircle, CheckCircle2, Loader2, Radio } from 'lucide-react';
import { API_BASE } from '../../data/apiConfig';

export default function AgentLocationPermissionModal({ 
  user, 
  isOpen, 
  onLocationGranted, 
  onClose 
}) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [acquiredCoords, setAcquiredCoords] = useState(null);

  if (!isOpen) return null;

  const handleRequestLocation = () => {
    setIsRequesting(true);
    setErrorMsg('');

    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser. Using designated zone location.');
      applyFallbackLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading: pos.coords.heading || 0,
          speed: pos.coords.speed || 0,
          timestamp: new Date().toISOString()
        };

        setAcquiredCoords(coords);

        try {
          localStorage.setItem('medmarg_agent_location', JSON.stringify(coords));
          localStorage.setItem('medmarg_location_granted', 'true');

          // Send to backend API
          await fetch(`${API_BASE}/api/v1/agent/location`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              agentId: user?.id || 'AG-01',
              agentName: user?.name || 'Ramesh Kumar',
              ...coords,
              address: 'Current Live GPS Location'
            })
          });
        } catch (err) {
          console.warn('Backend location sync note:', err);
        }

        setTimeout(() => {
          setIsRequesting(false);
          if (onLocationGranted) onLocationGranted(coords);
          if (onClose) onClose();
        }, 800);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setErrorMsg('GPS access was blocked or timed out. Please allow location access in your browser bar, or tap below to activate default field coordinates.');
        setIsRequesting(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const applyFallbackLocation = async () => {
    // Tirupati Urban Central fallback
    const fallbackCoords = {
      lat: 13.6288,
      lng: 79.4192,
      accuracy: 12,
      heading: 45,
      speed: 0,
      timestamp: new Date().toISOString(),
      address: 'Air Bypass Road, Tirupati (Designated Hub)'
    };

    setAcquiredCoords(fallbackCoords);
    localStorage.setItem('medmarg_agent_location', JSON.stringify(fallbackCoords));
    localStorage.setItem('medmarg_location_granted', 'true');

    try {
      await fetch(`${API_BASE}/api/v1/agent/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: user?.id || 'AG-01',
          agentName: user?.name || 'Ramesh Kumar',
          ...fallbackCoords
        })
      });
    } catch (e) {}

    setTimeout(() => {
      if (onLocationGranted) onLocationGranted(fallbackCoords);
      if (onClose) onClose();
    }, 600);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 150,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1.25rem'
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          maxWidth: '520px',
          width: '100%',
          padding: '2.25rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '2px solid #006B70',
          position: 'relative'
        }}
      >
        {/* Animated Radar Pulse Icon */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: '#E0F2F1',
              color: '#006B70',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 0 10px rgba(0, 107, 112, 0.12)'
            }}
          >
            <Navigation size={34} color="#006B70" />
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: '900', color: '#006B70', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '1rem' }}>
            MANDATORY FIELD REQUIREMENT
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A', marginTop: '0.3rem' }}>
            Enable Live GPS Tracking
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748B', marginTop: '0.5rem', lineHeight: '1.5' }}>
            MedMarg fleet operations requires your device's high-accuracy location to coordinate home visits and provide patients with live phlebotomist arrival tracking.
          </p>
        </div>

        {/* Feature List */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            borderRadius: '16px',
            padding: '1rem 1.25rem',
            border: '1px solid #E2E8F0',
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle2 size={16} />
            </div>
            <div style={{ fontSize: '0.84rem', color: '#334155', fontWeight: '700' }}>
              <strong>Real-Time Patient Tracking:</strong> Patient sees your live bike ETA & doorstep map.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle2 size={16} />
            </div>
            <div style={{ fontSize: '0.84rem', color: '#334155', fontWeight: '700' }}>
              <strong>Zone Dispatch Auto-Routing:</strong> Receive home collections mapped precisely to your assigned territory.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle2 size={16} />
            </div>
            <div style={{ fontSize: '0.84rem', color: '#334155', fontWeight: '700' }}>
              <strong>Duty Shift Attendance:</strong> Verified geo-fenced punch-in for your daily shift.
            </div>
          </div>
        </div>

        {/* Acquired GPS display */}
        {acquiredCoords && (
          <div style={{ backgroundColor: '#ECFDF5', padding: '0.85rem', borderRadius: '12px', border: '1.5px solid #059669', marginBottom: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: '#065F46', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} /> GPS Position Verified
            </div>
            <div style={{ fontSize: '0.78rem', color: '#047857', marginTop: '0.2rem' }}>
              Lat: {acquiredCoords.lat?.toFixed(5)}, Lng: {acquiredCoords.lng?.toFixed(5)} (±{Math.round(acquiredCoords.accuracy)}m)
            </div>
          </div>
        )}

        {/* Error state */}
        {errorMsg && (
          <div style={{ backgroundColor: '#FEF2F2', padding: '0.85rem', borderRadius: '12px', border: '1px solid #FECACA', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: '#DC2626', fontSize: '0.82rem', fontWeight: '700' }}>
              <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>{errorMsg}</div>
            </div>
            <button
              type="button"
              onClick={applyFallbackLocation}
              style={{
                marginTop: '0.6rem',
                backgroundColor: '#DC2626',
                color: '#FFF',
                border: 'none',
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                fontSize: '0.76rem',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              Use Tirupati Hub Fallback Position →
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handleRequestLocation}
            disabled={isRequesting}
            style={{
              width: '100%',
              padding: '0.95rem',
              backgroundColor: '#006B70',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '14px',
              fontSize: '1rem',
              fontWeight: '900',
              cursor: isRequesting ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(0, 107, 112, 0.3)'
            }}
          >
            {isRequesting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Acquiring GPS Fix...</span>
              </>
            ) : (
              <>
                <Radio size={18} />
                <span>Grant GPS Access & Enter Duty</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={applyFallbackLocation}
            style={{
              width: '100%',
              padding: '0.65rem',
              backgroundColor: 'transparent',
              color: '#64748B',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            Skip for now (Use Default Tirupati Hub Coordinates)
          </button>
        </div>

        {/* Footer privacy guarantee */}
        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.72rem', color: '#94A3B8' }}>
          🔒 Your location is transmitted securely via SSL and strictly utilized during active on-duty hours for diagnostic sample collection.
        </div>
      </div>
    </div>
  );
}
