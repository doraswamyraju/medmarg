import React, { useState } from 'react';
import { 
  FlaskConical, 
  Activity, 
  Stethoscope, 
  ShieldCheck, 
  MapPin, 
  Sparkles, 
  ArrowRight,
  ChevronDown,
  ShoppingBag,
  User,
  PhoneCall
} from 'lucide-react';

export default function Header({ onNavigateLogin, cartItemCount = 0 }) {
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
      <div style={{ backgroundColor: '#005F60', color: '#FFFFFF', padding: '0.4rem 2rem', fontSize: '0.8rem', fontWeight: '700', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={14} color="#F59E0B" />
          <span>MedMarg Central Diagnostics: 100% NABL Accredited | Free Home Sample Collection Included</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.78rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <PhoneCall size={13} /> Helpline: +91 98765 43210
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '0.85rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Brand Logo & Location Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img 
              src="/logo.png" 
              alt="MedMarg Diagnostic Network" 
              style={{ height: '42px', objectFit: 'contain' }} 
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
            {/* Display single clean logo text only if image logo fails */}
          </div>

          {/* Location Selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowCityDropdown(!showCityDropdown)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '700', color: '#334155', cursor: 'pointer' }}
            >
              <MapPin size={14} color="#005F60" />
              <span>{selectedCity}</span>
              <ChevronDown size={14} color="#64748B" />
            </button>

            {showCityDropdown && (
              <div style={{ position: 'absolute', top: '110%', left: 0, backgroundColor: '#FFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', width: '180px', padding: '0.5rem', zIndex: 1001 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', padding: '0.35rem 0.5rem' }}>SELECT CITY</div>
                {availableCities.map(city => (
                  <div
                    key={city}
                    onClick={() => { setSelectedCity(city); setShowCityDropdown(false); }}
                    style={{ padding: '0.5rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700', color: '#1E293B', cursor: 'pointer', backgroundColor: selectedCity === city ? '#E0F2F1' : 'transparent' }}
                  >
                    {city}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', fontWeight: '800', fontSize: '0.88rem', color: '#334155' }}>
          <a href="#catalog" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FlaskConical size={16} color="#005F60" /> Diagnostics & Tests (914+)
          </a>
          <a href="#vitals" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Activity size={16} color="#005F60" /> Health Vitals Radar
          </a>
          <a href="#tracker" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={16} color="#005F60" /> Live Phlebo Tracker
          </a>
          <a href="#upcoming" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Stethoscope size={16} color="#005F60" /> Upcoming Doctors & MRI
          </a>
          <a href="#trust" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={16} color="#005F60" /> NABL Trust
          </a>
        </nav>

        {/* User CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            onClick={onNavigateLogin}
            style={{ padding: '0.65rem 1.35rem', backgroundColor: '#005F60', color: '#FFF', border: 'none', borderRadius: '12px', fontSize: '0.88rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(0,95,96,0.25)', transition: 'all 0.15s' }}
          >
            <User size={16} /> Sign In / Book Now <ArrowRight size={15} />
          </button>
        </div>

      </div>
    </header>
  );
}
