import React from 'react';

export default function LandingFooter({ 
  onNavigateLogin, 
  onOpenAppModal,
  onNavigateFreelancerSignup = () => {},
  onNavigatePartnerSignup = () => {}
}) {
  return (
    <footer style={{ backgroundColor: '#071F1A', color: '#94A3B8', padding: '4.5rem 1.5rem 2.5rem', borderTop: '1px solid #005F60' }}>
      <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
        
        {/* Multi-Column Footer Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '3rem', marginBottom: '3.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <img src="/logo.png" alt="MedMarg" style={{ height: '36px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
            <p style={{ color: '#94A3B8', fontSize: '0.88rem', lineHeight: '1.6', maxWidth: '340px' }}>
              Single-provider trusted healthcare diagnostic network and phlebotomy logistics platform. Operating 100% NABL certified lab quality.
            </p>
          </div>

          <div>
            <h5 style={{ color: '#FFF', fontSize: '0.9rem', fontWeight: '800', marginBottom: '1rem' }}>Catalog & Services</h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <li><a href="#catalog" style={{ color: 'inherit', textDecoration: 'none' }}>916+ Pathology Tests</a></li>
              <li><a href="#catalog" style={{ color: 'inherit', textDecoration: 'none' }}>His & Her Wellness Profiles</a></li>
              <li><a href="#catalog" style={{ color: 'inherit', textDecoration: 'none' }}>Full Body Health Packages</a></li>
              <li><a href="#catalog" style={{ color: 'inherit', textDecoration: 'none' }}>Free Home Sample Collection</a></li>
            </ul>
          </div>

          <div>
            <h5 style={{ color: '#FFF', fontSize: '0.9rem', fontWeight: '800', marginBottom: '1rem' }}>Platform Features</h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <li><a href="#tracker-feature" style={{ color: 'inherit', textDecoration: 'none' }}>Live GPS Phlebotomist Map</a></li>
              <li><a href="#tracker-feature" style={{ color: 'inherit', textDecoration: 'none' }}>IoT Cold-Chain Telemetry</a></li>
              <li><a href="#vitals-feature" style={{ color: 'inherit', textDecoration: 'none' }}>Health Vitals Curve Charts</a></li>
              <li><a href="#locker-feature" style={{ color: 'inherit', textDecoration: 'none' }}>NABL Digital Locker</a></li>
            </ul>
          </div>

          <div>
            <h5 style={{ color: '#FFF', fontSize: '0.9rem', fontWeight: '800', marginBottom: '1rem' }}>Mobile Apps</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <button
                onClick={onOpenAppModal}
                style={{
                  backgroundColor: '#0F172A',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  padding: '0.5rem 0.85rem',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span style={{ fontSize: '1.4rem' }}>🍎</span>
                <div>
                  <div style={{ fontSize: '0.62rem', color: '#94A3B8', textTransform: 'uppercase' }}>Download on the</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '900' }}>App Store</div>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: '0.65rem', backgroundColor: '#FEF3C7', color: '#92400E', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: '900' }}>SOON</span>
              </button>

              <button
                onClick={onOpenAppModal}
                style={{
                  backgroundColor: '#0F172A',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  padding: '0.5rem 0.85rem',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span style={{ fontSize: '1.4rem' }}>🤖</span>
                <div>
                  <div style={{ fontSize: '0.62rem', color: '#94A3B8', textTransform: 'uppercase' }}>Get it on</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '900' }}>Google Play</div>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: '0.65rem', backgroundColor: '#FEF3C7', color: '#92400E', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: '900' }}>SOON</span>
              </button>
            </div>
          </div>

          <div>
            <h5 style={{ color: '#FFF', fontSize: '0.9rem', fontWeight: '800', marginBottom: '1rem' }}>Partner With Us</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
              <button 
                onClick={onNavigateFreelancerSignup} 
                style={{ background: 'none', border: 'none', color: '#5EEAD4', textAlign: 'left', padding: 0, cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                🚴 Freelance Phlebotomist Sign Up →
              </button>
              <button 
                onClick={onNavigatePartnerSignup} 
                style={{ background: 'none', border: 'none', color: '#93C5FD', textAlign: 'left', padding: 0, cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                🏥 Partner / Clinic Pre-Registration →
              </button>
              <button 
                onClick={onNavigateLogin} 
                style={{ background: 'none', border: 'none', color: '#94A3B8', textAlign: 'left', padding: 0, cursor: 'pointer', fontWeight: '700', marginTop: '0.4rem' }}
              >
                Admin / Staff / Fleet Sign In →
              </button>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #1E293B', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#64748B', flexWrap: 'wrap', gap: '1rem' }}>
          <div>© 2026 MedMarg Healthcare Ecosystem (https://medmarg.sriddha.com). All rights reserved.</div>
          <div>Built for Web, Android & iOS Multi-Platform Fulfillment</div>
        </div>

      </div>
    </footer>
  );
}
