import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  Check, 
  Home, 
  Briefcase, 
  Users, 
  Building2, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import RealMapView from '../RealMapView';

export default function PatientAddressModal({
  isOpen,
  onClose,
  onSaveAddress,
  existingAddress = null
}) {
  if (!isOpen) return null;

  const [addressTag, setAddressTag] = useState('Home');
  const [flatNo, setFlatNo] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [areaStreet, setAreaStreet] = useState('Air Bypass Road, Tirupati');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('517501');
  const [city, setCity] = useState('Tirupati, AP');
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [mapCoords, setMapCoords] = useState({ lat: 13.6288, lng: 79.4192 });

  useEffect(() => {
    if (existingAddress) {
      setAddressTag(existingAddress.label || 'Home');
      setFlatNo(existingAddress.flatNo || '');
      setBuildingName(existingAddress.buildingName || '');
      setAreaStreet(existingAddress.areaStreet || existingAddress.address || '');
      setLandmark(existingAddress.landmark || '');
      setPincode(existingAddress.pincode || '517501');
    }
  }, [existingAddress]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Detecting high-accuracy GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setMapCoords({ lat: latitude, lng: longitude });

        try {
          // Reverse geocoding
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          if (data && data.display_name) {
            setAreaStreet(data.address?.suburb || data.address?.neighbourhood || data.address?.road || 'Air Bypass Road');
            setCity(`${data.address?.city || data.address?.town || 'Tirupati'}, ${data.address?.state || 'Andhra Pradesh'}`);
            if (data.address?.postcode) setPincode(data.address.postcode);
            setLocationStatus('📍 Location detected accurately!');
          } else {
            setLocationStatus('📍 GPS coordinates captured.');
          }
        } catch (e) {
          setLocationStatus('📍 GPS coordinates captured.');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        setLocationStatus('Could not retrieve GPS location. You can enter details manually.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSave = (e) => {
    e.preventDefault();
    const fullAddress = `${flatNo ? `${flatNo}, ` : ''}${buildingName ? `${buildingName}, ` : ''}${areaStreet}${landmark ? `, Near ${landmark}` : ''}, ${city} - ${pincode}`;

    onSaveAddress({
      id: existingAddress?.id || 'addr_' + Date.now(),
      label: addressTag,
      flatNo,
      buildingName,
      areaStreet,
      landmark,
      city,
      pincode,
      address: fullAddress,
      coords: mapCoords,
      isDefault: existingAddress?.isDefault || false
    });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(5px)',
      zIndex: 1200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '720px',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 24px 54px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#004D40',
          color: '#FFFFFF'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#80CBC4', fontWeight: '800' }}>
              <MapPin size={16} /> EXPRESS HOME COLLECTION LOCATION
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '900', margin: '0.15rem 0 0 0' }}>
              Select & Confirm Collection Address
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#80CBC4', cursor: 'pointer', padding: '0.4rem', borderRadius: '8px' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Interactive Map & GPS Section */}
        <div style={{ padding: '1.25rem 1.75rem 0.5rem 1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A' }}>
              Pinpoint on Map (Tirupati Hub)
            </span>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#E0F2F1',
                color: '#006B70',
                border: '1px solid #80CBC4',
                borderRadius: '10px',
                fontWeight: '800',
                fontSize: '0.82rem',
                cursor: isLocating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Navigation size={15} />
              {isLocating ? 'Detecting GPS...' : 'Use Current Location'}
            </button>
          </div>

          {locationStatus && (
            <div style={{ fontSize: '0.78rem', color: '#006B70', fontWeight: '700', marginBottom: '0.5rem' }}>
              {locationStatus}
            </div>
          )}

          <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1.5px solid #CBD5E1', height: '220px', position: 'relative' }}>
            <RealMapView height="220px" />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -100%)',
              zIndex: 900,
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{ backgroundColor: '#004D40', color: '#FFF', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', boxShadow: '0 2px 8px rgba(0,0,0,0.25)', whiteSpace: 'nowrap', marginBottom: '2px' }}>
                📍 Sample Collection Point
              </div>
              <div style={{ width: '16px', height: '16px', backgroundColor: '#059669', border: '3px solid #FFF', borderRadius: '50%', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }} />
            </div>
          </div>
        </div>

        {/* Address Form Details */}
        <form onSubmit={handleSave} style={{ padding: '1.25rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Tag Selector */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '0.4rem' }}>
              Save Address As
            </label>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {[
                { label: 'Home', icon: Home },
                { label: 'Work', icon: Briefcase },
                { label: 'Parents', icon: Users },
                { label: 'Other', icon: MapPin }
              ].map((tag) => {
                const IconC = tag.icon;
                const isSel = addressTag === tag.label;
                return (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={() => setAddressTag(tag.label)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '10px',
                      border: isSel ? '2px solid #006B70' : '1px solid #CBD5E1',
                      backgroundColor: isSel ? '#E0F2F1' : '#F8FAFC',
                      color: isSel ? '#006B70' : '#475569',
                      fontWeight: '800',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <IconC size={15} />
                    <span>{tag.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Door / Flat & Building Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Flat / House / Door No. *</label>
              <input
                type="text"
                placeholder="e.g. Flat 302 / Door 42"
                value={flatNo}
                onChange={(e) => setFlatNo(e.target.value)}
                required
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Apartment / Building Name</label>
              <input
                type="text"
                placeholder="e.g. Sri Balaji Enclave"
                value={buildingName}
                onChange={(e) => setBuildingName(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Area / Street & Landmark */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Area / Street / Colony *</label>
              <input
                type="text"
                placeholder="e.g. Air Bypass Road, Korlagunta"
                value={areaStreet}
                onChange={(e) => setAreaStreet(e.target.value)}
                required
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Landmark for Phlebotomist</label>
              <input
                type="text"
                placeholder="e.g. Opp. Apollo Pharmacy"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* City & Pincode */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>City & State</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Pincode *</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                required
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Footer Controls */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #E2E8F0' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '0.65rem 1.25rem', backgroundColor: '#E2E8F0', color: '#334155', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '0.65rem 1.5rem',
                backgroundColor: '#006B70',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '900',
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 12px rgba(0,107,112,0.25)'
              }}
            >
              <Check size={16} /> Save Address & Select
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
