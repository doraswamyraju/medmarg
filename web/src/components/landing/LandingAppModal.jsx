import React, { useState } from 'react';

export default function LandingAppModal({ isOpen, onClose }) {
  const [phone, setPhone] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  return (
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
            onClose();
            setIsSubmitted(false);
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
        {isSubmitted ? (
          <div style={{ padding: '0.85rem', backgroundColor: '#F0FDF4', color: '#15803D', borderRadius: '12px', fontSize: '0.84rem', fontWeight: '800', border: '1px solid #BBF7D0' }}>
            ✓ Thank you! We will ping you on WhatsApp as soon as our app is live on App Store & Google Play.
          </div>
        ) : (
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (phone.trim()) setIsSubmitted(true);
            }}
            style={{ display: 'flex', gap: '0.5rem' }}
          >
            <input
              type="tel"
              placeholder="Enter WhatsApp / Mobile Number..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
  );
}
