import React, { useState } from 'react';
import { 
  Building2, 
  Stethoscope, 
  Pill, 
  ArrowRight 
} from 'lucide-react';

export default function LandingEcosystemAndPartners({
  partnerType = 'DOCTOR',
  setPartnerType = () => {},
  partnerName = '',
  setPartnerName = () => {},
  partnerPhone = '',
  setPartnerPhone = () => {},
  partnerEmail = '',
  setPartnerEmail = () => {},
  partnerSuccess = false,
  handlePartnerSubmit = () => {}
}) {
  return (
    <>
      {/* 🔮 UPCOMING ECOSYSTEM EXTENSIONS */}
      <section id="upcoming" style={{ padding: '4.5rem 1.5rem', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ color: '#005F60', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.08em' }}>PHASE 3 EXPANSION</span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '900', color: '#0F172A', marginTop: '0.35rem' }}>
              Upcoming Healthcare Portals
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '0.5rem' }}>
              MedMarg is expanding to bring doctors, scan centers, pharmacy, and wellness coaches into a unified ecosystem.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            
            <div style={{ padding: '1.75rem', backgroundColor: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <Stethoscope size={36} color="#005F60" style={{ margin: '0 auto 1rem' }} />
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#005F60', marginBottom: '0.25rem' }}>COMING SOON</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>In-Clinic & Video Doctors</h4>
              <p style={{ color: '#64748B', fontSize: '0.82rem', marginTop: '0.4rem' }}>Book OPD consultations and e-prescriptions with verified medical specialists.</p>
            </div>

            <div style={{ padding: '1.75rem', backgroundColor: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <Building2 size={36} color="#005F60" style={{ margin: '0 auto 1rem' }} />
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#005F60', marginBottom: '0.25rem' }}>COMING SOON</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>Partner Scan & MRI Centers</h4>
              <p style={{ color: '#64748B', fontSize: '0.82rem', marginTop: '0.4rem' }}>Schedule diagnostic CT scans, Ultrasound, and X-Rays at accredited radiology centers.</p>
            </div>

            <div style={{ padding: '1.75rem', backgroundColor: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <Pill size={36} color="#005F60" style={{ margin: '0 auto 1rem' }} />
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#005F60', marginBottom: '0.25rem' }}>COMING SOON</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>Doorstep Pharmacy Delivery</h4>
              <p style={{ color: '#64748B', fontSize: '0.82rem', marginTop: '0.4rem' }}>Upload prescription to order verified genuine pharmaceuticals with doorstep courier delivery.</p>
            </div>

            <div style={{ padding: '1.75rem', backgroundColor: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <div style={{ width: '36px', height: '36px', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>🥗</div>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#005F60', marginBottom: '0.25rem' }}>COMING SOON</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>Dietitians & Health Coaches</h4>
              <p style={{ color: '#64748B', fontSize: '0.82rem', marginTop: '0.4rem' }}>Personalized lifestyle, diet, and diabetic reversal plans based on your lab biomarker radar.</p>
            </div>

          </div>

        </div>
      </section>

      {/* 🤝 SECTION 6: PARTNER ESTABLISHMENT PRE-REGISTRATION */}
      <section id="partner" style={{ padding: '5rem 1.5rem', backgroundColor: '#071F1A', color: '#FFFFFF' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '3rem', alignItems: 'center', backgroundColor: '#0F172A', padding: '3rem', borderRadius: '28px', border: '1.5px solid #005F60' }}>
            <div>
              <div style={{ display: 'inline-block', padding: '0.35rem 0.85rem', backgroundColor: 'rgba(0,95,96,0.3)', color: '#80CBC4', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '800', marginBottom: '0.85rem' }}>
                FOR HEALTHCARE PROVIDERS
              </div>
              <h3 style={{ fontSize: '2rem', fontWeight: '900', lineHeight: '1.25', marginBottom: '0.85rem' }}>
                Join the MedMarg Healthcare Network
              </h3>
              <p style={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Doctors, Partner Labs, Scan/MRI Centers, and Health Coaches can pre-register their establishment to receive early onboarding priority and live launch notifications.
              </p>
            </div>

            <div>
              {partnerSuccess ? (
                <div style={{ padding: '1.25rem', backgroundColor: '#065F46', color: '#A7F3D0', borderRadius: '16px', fontWeight: '800', textAlign: 'center' }}>
                  ✓ Facility Pre-Registered Successfully! Added to Launch Notification Queue.
                </div>
              ) : (
                <form onSubmit={handlePartnerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <select value={partnerType} onChange={e => setPartnerType(e.target.value)} style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid #475569', backgroundColor: '#0F172A', color: '#FFF', fontSize: '0.85rem', fontWeight: '700' }}>
                      <option value="DOCTOR">Doctor / OPD Practice</option>
                      <option value="DIAGNOSTIC_LAB">Partner Diagnostic Lab</option>
                      <option value="SCAN_CENTER">Radiology / MRI Center</option>
                      <option value="HEALTH_COACH">Health & Diet Coach</option>
                      <option value="HOSPITAL">Hospital / Clinic</option>
                    </select>

                    <input type="text" placeholder="Establishment / Doctor Name" value={partnerName} onChange={e => setPartnerName(e.target.value)} required style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid #475569', backgroundColor: '#0F172A', color: '#FFF', fontSize: '0.85rem' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <input type="tel" placeholder="Mobile Number" value={partnerPhone} onChange={e => setPartnerPhone(e.target.value)} required style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid #475569', backgroundColor: '#0F172A', color: '#FFF', fontSize: '0.85rem' }} />
                    <input type="email" placeholder="Email Address" value={partnerEmail} onChange={e => setPartnerEmail(e.target.value)} required style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid #475569', backgroundColor: '#0F172A', color: '#FFF', fontSize: '0.85rem' }} />
                  </div>

                  <button type="submit" style={{ padding: '0.85rem', backgroundColor: '#005F60', color: '#FFF', border: 'none', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '800', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                    Pre-Register Establishment <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
