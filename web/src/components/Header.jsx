import React, { useState } from 'react';
import { 
  FlaskConical, 
  Activity, 
  ShieldCheck, 
  Stethoscope, 
  MapPin, 
  Sparkles, 
  ArrowRight,
  ChevronDown,
  User,
  PhoneCall,
  Navigation,
  FolderHeart
} from 'lucide-react';

export default function Header({ onNavigateLogin }) {
  const [selectedCity, setSelectedCity] = useState('Tirupati, AP');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showAppModal, setShowAppModal] = useState(false);
  const [appNotifyPhone, setAppNotifyPhone] = useState('');
  const [appNotifySuccess, setAppNotifySuccess] = useState(false);

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
                zIndex: 1001 
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', padding: '0.35rem 0.5rem' }}>SELECT CITY</div>
                {availableCities.map(city => (
                  <div
                    key={city}
                    onClick={() => { setSelectedCity(city); setShowCityDropdown(false); }}
                    style={{ 
                      padding: '0.5rem', 
                      borderRadius: '6px', 
                      fontSize: '0.85rem', 
                      fontWeight: '700', 
                      color: '#1E293B', 
                      cursor: 'pointer', 
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
            onClick={() => setShowAppModal(true)}
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

      {/* 📲 APP DOWNLOAD COMING SOON MODAL */}
      {showAppModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 20000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            maxWidth: '480px',
            width: '100%',
            padding: '2rem',
            border: '1px solid #E2E8F0',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            position: 'relative',
            textAlign: 'center'
          }}>
            <button 
              onClick={() => {
                setShowAppModal(false);
                setAppNotifySuccess(false);
              }}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '1.2rem' }}
            >
              ✕
            </button>

            <div style={{ width: '60px', height: '60px', borderRadius: '18px', backgroundColor: '#E0F2F1', color: '#005F60', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.8rem' }}>
              📱
            </div>

            <span style={{ fontSize: '0.74rem', fontWeight: '900', backgroundColor: '#FEF3C7', color: '#92400E', padding: '0.2rem 0.65rem', borderRadius: '12px', letterSpacing: '0.5px' }}>
              IN FINAL REVIEW • COMING SOON
            </span>

            <h3 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#0F172A', marginTop: '0.75rem', marginBottom: '0.4rem' }}>
              MedMarg for iOS & Android
            </h3>

            <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Experience instant phlebotomist tracking, 1-click test re-orders, smartwatch vitals syncing, and offline medical reports in our upcoming native mobile app.
            </p>

            {/* App Store / Play Store Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.85rem', backgroundColor: '#0F172A', color: '#FFFFFF', borderRadius: '14px', textAlign: 'left', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '1.8rem' }}>🍎</span>
                <div>
                  <div style={{ fontSize: '0.62rem', color: '#94A3B8', textTransform: 'uppercase' }}>Available on</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '900' }}>Apple App Store</div>
                  <div style={{ fontSize: '0.68rem', color: '#FBBF24', fontWeight: '800' }}>Coming Soon</div>
                </div>
              </div>

              <div style={{ padding: '0.85rem', backgroundColor: '#0F172A', color: '#FFFFFF', borderRadius: '14px', textAlign: 'left', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '1.8rem' }}>🤖</span>
                <div>
                  <div style={{ fontSize: '0.62rem', color: '#94A3B8', textTransform: 'uppercase' }}>Get it on</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '900' }}>Google Play</div>
                  <div style={{ fontSize: '0.68rem', color: '#FBBF24', fontWeight: '800' }}>Coming Soon</div>
                </div>
              </div>
            </div>

            {/* Notification Subscription */}
            {appNotifySuccess ? (
              <div style={{ padding: '0.85rem', backgroundColor: '#F0FDF4', color: '#15803D', borderRadius: '12px', fontSize: '0.84rem', fontWeight: '800', border: '1px solid #BBF7D0' }}>
                ✓ Thank you! We will ping you on WhatsApp as soon as our app is live on App Store & Google Play.
              </div>
            ) : (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (appNotifyPhone.trim()) setAppNotifySuccess(true);
                }}
                style={{ display: 'flex', gap: '0.5rem' }}
              >
                <input
                  type="tel"
                  placeholder="Enter WhatsApp / Mobile Number..."
                  value={appNotifyPhone}
                  onChange={(e) => setAppNotifyPhone(e.target.value)}
                  style={{ flex: 1, padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.85rem', outline: 'none' }}
                  required
                />
                <button
                  type="submit"
                  style={{ padding: '0.6rem 1rem', backgroundColor: '#005F60', color: '#FFF', border: 'none', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  Notify Me
                </button>
              </form>
            )}

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9', fontSize: '0.78rem', color: '#64748B' }}>
              💡 Meanwhile, you can book tests directly through this portal with 100% full features!
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
