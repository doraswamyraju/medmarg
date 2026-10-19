import React, { useState } from 'react';
import { 
  FlaskConical, 
  Activity, 
  ShieldCheck, 
  MapPin, 
  Sparkles, 
  ArrowRight,
  ChevronDown,
  User,
  PhoneCall,
  Navigation,
  FolderHeart
} from 'lucide-react';

export default function LandingHeader({ onNavigateLogin, onOpenAppModal }) {
  const [selectedCity, setSelectedCity] = useState('Tirupati, AP');
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const availableCities = [
    'Tirupati, AP',
    'Bangalore, KA',
    'Chennai, TN',
    'Hyderabad, TS',
    'Vijayawada, AP',
    'Nellore, AP'
  ];

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', boxShadow: '0 4px 20px -5px rgba(0, 95, 96, 0.08)' }}>
      
      {/* Top Notification Bar */}
      <div style={{ backgroundColor: '#005F60', color: '#FFFFFF', padding: '0.45rem 2rem', fontSize: '0.8rem', fontWeight: '700', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={14} color="#F59E0B" />
          <span>MedMarg Diagnostics: 100% NABL Certified | Free Doorstep Sample Pickup</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.78rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#E0F2F1' }}>
            <PhoneCall size={13} color="#F59E0B" /> Helpline: <strong>+91 98765 43210</strong>
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0.85rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
        
        {/* Brand Logo & Location Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
          <div 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img 
              src="/logo.png" 
              alt="MedMarg Diagnostic Network" 
              style={{ height: '42px', width: 'auto', objectFit: 'contain' }} 
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
          </div>

          {/* Location Selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowCityDropdown(!showCityDropdown)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.4rem', 
                padding: '0.45rem 0.85rem', 
                backgroundColor: '#F1F5F9', 
                border: '1px solid #CBD5E1', 
                borderRadius: '20px', 
                fontSize: '0.82rem', 
                fontWeight: '700', 
                color: '#334155', 
                cursor: 'pointer', 
                whiteSpace: 'nowrap' 
              }}
            >
              <MapPin size={14} color="#005F60" />
              <span>{selectedCity}</span>
              <ChevronDown size={14} color="#64748B" />
            </button>

            {showCityDropdown && (
              <div style={{ 
                position: 'absolute', 
                top: '115%', 
                left: 0, 
                backgroundColor: '#FFF', 
                border: '1px solid #E2E8F0', 
                borderRadius: '12px', 
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)', 
                width: '180px', 
                padding: '0.5rem', 
                zIndex: 1100 
              }}>
                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800', padding: '0.3rem 0.6rem', borderBottom: '1px solid #F1F5F9' }}>
                  ACTIVE SERVICE CITIES
                </div>
                {availableCities.map(city => (
                  <div
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                      setShowCityDropdown(false);
                    }}
                    style={{ 
                      padding: '0.45rem 0.6rem', 
                      fontSize: '0.82rem', 
                      fontWeight: '700', 
                      color: selectedCity === city ? '#005F60' : '#334155', 
                      cursor: 'pointer', 
                      borderRadius: '8px', 
                      backgroundColor: selectedCity === city ? '#E0F2F1' : 'transparent' 
                    }}
                  >
                    {city}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.35rem', fontWeight: '800', fontSize: '0.86rem', color: '#334155', whiteSpace: 'nowrap' }}>
          <a href="#catalog" style={{ textDecoration: 'none', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <FlaskConical size={15} color="#005F60" /> Tests & Packages
          </a>
          <a href="#quality-guarantee" style={{ textDecoration: 'none', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={15} color="#005F60" /> Lab Quality
          </a>
          <a href="#tracker-feature" style={{ textDecoration: 'none', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Navigation size={15} color="#005F60" /> Live Tracker
          </a>
          <a href="#vitals-feature" style={{ textDecoration: 'none', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Activity size={15} color="#005F60" /> Vitals Radar
          </a>
          <a href="#locker-feature" style={{ textDecoration: 'none', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <FolderHeart size={15} color="#005F60" /> NABL Locker
          </a>
        </nav>

        {/* User CTA & App Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <button
            onClick={onOpenAppModal}
            style={{
              padding: '0.48rem 0.85rem',
              backgroundColor: '#F1F5F9',
              color: '#0F172A',
              border: '1.5px solid #CBD5E1',
              borderRadius: '12px',
              fontSize: '0.78rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease'
            }}
            title="Download MedMarg iOS & Android Mobile Apps"
          >
            <span>📱</span>
            <span>Get App</span>
            <span style={{ fontSize: '0.65rem', backgroundColor: '#FEF3C7', color: '#92400E', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '900' }}>SOON</span>
          </button>

          <button
            onClick={onNavigateLogin}
            style={{ 
              padding: '0.6rem 1.35rem', 
              backgroundColor: '#005F60', 
              color: '#FFF', 
              border: 'none', 
              borderRadius: '12px', 
              fontSize: '0.88rem', 
              fontWeight: '800', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.45rem', 
              boxShadow: '0 4px 14px rgba(0,95,96,0.25)', 
              transition: 'transform 0.15s' 
            }}
          >
            <User size={16} /> Sign In / Book Now <ArrowRight size={15} />
          </button>
        </div>

      </div>
    </header>
  );
}
