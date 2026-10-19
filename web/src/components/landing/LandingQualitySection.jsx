import React, { useState } from 'react';

export default function LandingQualitySection() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredStep, setHoveredStep] = useState(null);

  return (
    <section id="quality-guarantee" style={{ padding: '5.5rem 1.5rem', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
      <div style={{ maxWidth: '1320px', margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ color: '#005F60', fontSize: '0.85rem', fontWeight: '900', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            ✓ CLINICAL EXCELLENCE & ZERO-COMPROMISE PROTOCOLS
          </span>
          <h2 style={{ fontSize: '2.4rem', fontWeight: '900', color: '#0F172A', marginTop: '0.4rem', letterSpacing: '-0.02em' }}>
            Why Over 15,000+ Families Rely on MedMarg Diagnostics
          </h2>
          <p style={{ color: '#64748B', fontSize: '1rem', maxWidth: '720px', margin: '0.5rem auto 0', lineHeight: 1.6 }}>
            From painless doorstep blood draws by DMLT-certified phlebotomists to automated robotic analyzers in NABL accredited partner laboratories, we deliver clinical precision every single time.
          </p>
        </div>

        {/* 2-Column Photo & Feature Showcase */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '2.5rem', marginBottom: '3.5rem' }}>
          
          {/* Card 1: Certified Doorstep Phlebotomy */}
          <div 
            onMouseEnter={() => setHoveredCard('phlebo')}
            onMouseLeave={() => setHoveredCard(null)}
            className="landing-image-container"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: hoveredCard === 'phlebo' ? '1.5px solid #00A896' : '1.5px solid #E2E8F0',
              overflow: 'hidden',
              boxShadow: hoveredCard === 'phlebo' 
                ? '0 25px 60px -12px rgba(0, 95, 96, 0.22), 0 0 25px rgba(0, 168, 150, 0.12)' 
                : '0 12px 30px -10px rgba(0,95,96,0.1)',
              display: 'flex',
              flexDirection: 'column',
              transform: hoveredCard === 'phlebo' ? 'translateY(-8px)' : 'translateY(0)',
              transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div style={{ position: 'relative', height: '310px', overflow: 'hidden' }}>
              <img 
                src="/phlebo_home_collection.jpg" 
                alt="Certified MedMarg Phlebotomist at Patient Doorstep" 
                className="landing-image-zoom"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                backgroundColor: 'rgba(0,95,96,0.92)',
                color: '#FFFFFF',
                padding: '0.35rem 0.85rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '800',
                backdropFilter: 'blur(4px)'
              }}>
                ✓ DMLT / Paramedical Certified
              </div>
              <div style={{
                position: 'absolute',
                bottom: '1rem',
                right: '1rem',
                backgroundColor: '#0F172A',
                color: '#10B981',
                padding: '0.4rem 0.85rem',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: '900',
                border: '1px solid #334155'
              }}>
                ❄️ Active 4.2°C Cold Carrier Box
              </div>
            </div>

            <div style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#0F172A', marginBottom: '0.65rem' }}>
                Doorstep Phlebotomy by Trained Medical Professionals
              </h3>
              <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Our phlebotomists are verified DMLT graduates. Every single blood collection uses pre-sealed, sterile BD Vacutainer® needles opened right in front of the patient with zero-pain capillary technique.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '700' }}>SAFETY FIRST</div>
                  <div style={{ fontSize: '0.86rem', fontWeight: '800', color: '#0F172A', marginTop: '0.15rem' }}>100% Single-Use Sterile Kits</div>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '700' }}>IDENTITY VERIFICATION</div>
                  <div style={{ fontSize: '0.86rem', fontWeight: '800', color: '#0F172A', marginTop: '0.15rem' }}>4-Digit Handover Security OTP</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: High-Throughput Robotic Analyzers */}
          <div 
            onMouseEnter={() => setHoveredCard('lab')}
            onMouseLeave={() => setHoveredCard(null)}
            className="landing-image-container"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: hoveredCard === 'lab' ? '1.5px solid #0284C7' : '1.5px solid #E2E8F0',
              overflow: 'hidden',
              boxShadow: hoveredCard === 'lab' 
                ? '0 25px 60px -12px rgba(2, 132, 199, 0.22), 0 0 25px rgba(56, 189, 248, 0.12)' 
                : '0 12px 30px -10px rgba(0,95,96,0.1)',
              display: 'flex',
              flexDirection: 'column',
              transform: hoveredCard === 'lab' ? 'translateY(-8px)' : 'translateY(0)',
              transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div style={{ position: 'relative', height: '310px', overflow: 'hidden' }}>
              <img 
                src="/nabl_lab_testing.jpg" 
                alt="NABL Accredited Clinical Testing Lab" 
                className="landing-image-zoom"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                backgroundColor: 'rgba(21,128,61,0.92)',
                color: '#FFFFFF',
                padding: '0.35rem 0.85rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '800',
                backdropFilter: 'blur(4px)'
              }}>
                ✓ NABL & ISO 15189 Certified
              </div>
              <div style={{
                position: 'absolute',
                bottom: '1rem',
                right: '1rem',
                backgroundColor: '#0F172A',
                color: '#38BDF8',
                padding: '0.4rem 0.85rem',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: '900',
                border: '1px solid #334155'
              }}>
                🔬 Automated Beckman / Roche Analyzers
              </div>
            </div>

            <div style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.45rem', fontWeight: '900', color: hoveredCard === 'lab' ? '#0284C7' : '#0F172A', marginBottom: '0.65rem', transition: 'color 0.2s ease' }}>
                Multi-Lab Quality Processing (Thyrocare, Lalpath & Hub)
              </h3>
              <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                All samples are tested on internationally calibrated robotic analyzers with dual internal quality checks (IQC) and external quality assurance schemes (EQAS), guaranteeing gold-standard accuracy.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '700' }}>SAMPLE SECURITY</div>
                  <div style={{ fontSize: '0.86rem', fontWeight: '800', color: '#0F172A', marginTop: '0.15rem' }}>Barcoded Tube Tracking</div>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '700' }}>REPORT DELIVERY</div>
                  <div style={{ fontSize: '0.86rem', fontWeight: '800', color: '#0F172A', marginTop: '0.15rem' }}>Signed Digital PDF on WhatsApp</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 4-Step Patient Journey with Interactive Hover */}
        <div style={{
          backgroundColor: '#071F1A',
          borderRadius: '24px',
          padding: '2.5rem',
          color: '#FFFFFF',
          border: '1px solid #005F60'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#FBBF24', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              SEAMLESS CARE SEEKER EXPERIENCE
            </span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '900', marginTop: '0.35rem', color: '#FFFFFF' }}>
              How MedMarg Works in 4 Effortless Steps
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {[
              { step: '01', title: 'Choose Tests or Prescription', desc: 'Search 916+ individual tests, packages, or upload doctor prescription for instant item selection.' },
              { step: '02', title: 'Phlebotomist Dispatched', desc: 'Track your assigned phlebotomist on the real-time live map with estimated arrival time (ETA).' },
              { step: '03', title: 'Safe Doorstep Handover', desc: 'Verify via 4-digit OTP. Painless blood collection sealed inside our IoT cold carry box (2°C - 8°C).' },
              { step: '04', title: 'Smart Digital Reports', desc: 'Verified by MD pathologists. Download signed reports on WhatsApp & sync with your Digital Health Vault.' }
            ].map((item, iIdx) => {
              const isHovered = hoveredStep === item.step;
              return (
                <div 
                  key={iIdx} 
                  onMouseEnter={() => setHoveredStep(item.step)}
                  onMouseLeave={() => setHoveredStep(null)}
                  style={{ 
                    backgroundColor: isHovered ? 'rgba(0, 168, 150, 0.15)' : 'rgba(255,255,255,0.05)', 
                    borderRadius: '16px', 
                    padding: '1.5rem', 
                    border: isHovered ? '1px solid #14B8A6' : '1px solid rgba(255,255,255,0.1)',
                    transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
                    boxShadow: isHovered ? '0 12px 25px rgba(0,0,0,0.4)' : 'none',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    cursor: 'default'
                  }}
                >
                  <div style={{ fontSize: '1.6rem', fontWeight: '900', color: isHovered ? '#2DD4BF' : '#80CBC4', marginBottom: '0.5rem', transition: 'color 0.2s' }}>{item.step}</div>
                  <div style={{ fontSize: '1rem', fontWeight: '900', color: '#FFFFFF', marginBottom: '0.35rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
