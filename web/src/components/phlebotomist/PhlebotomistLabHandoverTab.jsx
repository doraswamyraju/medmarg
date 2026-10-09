import React, { useState } from 'react';
import { Building2, Thermometer, CheckCircle2, QrCode, ShieldCheck, MapPin, Clock, ArrowRight, FileCheck } from 'lucide-react';

export default function PhlebotomistLabHandoverTab({ onConfirmHandover }) {
  const [selectedLab, setSelectedLab] = useState('LAB-01');
  const [handoverOtp, setHandoverOtp] = useState('');
  const [handoverSuccess, setHandoverSuccess] = useState(false);
  const [samplesCount, setSamplesCount] = useState(6);
  const [bagTemp, setBagTemp] = useState('4.2°C');

  const labs = [
    {
      id: 'LAB-01',
      name: 'MedMarg Central NABL Reference Lab',
      address: 'Plot 104, Air Bypass Road, Tirupati - 517501',
      accreditation: 'NABL & ICMR Certified (Accreditation #MC-4190)',
      technicianOnDuty: 'Dr. Srinivasulu MLT / Lead Pathologist',
      sampleDropWindow: 'Open 24/7 (Access Gate 2)',
      distance: '1.8 km',
      samplesPending: 4
    },
    {
      id: 'LAB-02',
      name: 'Thyrocare Regional Diagnostic Hub',
      address: 'Door 18-3, Renigunta Road, Tirupati - 517506',
      accreditation: 'CAP & NABL Accredited Hub',
      technicianOnDuty: 'K. Rajesh (Senior Lab Technologist)',
      sampleDropWindow: '06:00 AM - 10:00 PM',
      distance: '3.5 km',
      samplesPending: 2
    }
  ];

  const handleHandover = (e) => {
    e.preventDefault();
    if (onConfirmHandover) {
      onConfirmHandover({
        labId: selectedLab,
        samplesCount,
        temp: bagTemp,
        otp: handoverOtp
      });
    }
    setHandoverSuccess(true);
    setTimeout(() => {
      setHandoverSuccess(false);
      setHandoverOtp('');
    }, 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Building2 size={14} /> NABL PROCESSING LAB HANDOVER
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700' }}>Cold Chain Handover Protocol</span>
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A', marginTop: '0.25rem' }}>
            Designated Diagnostic Labs Handover Desk
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.82rem', backgroundColor: '#ECFDF5', color: '#065F46', padding: '0.4rem 0.85rem', borderRadius: '10px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Thermometer size={16} color="#059669" /> Carry Bag Temp: {bagTemp} (Optimal 2-8°C)
          </span>
        </div>
      </div>

      {/* Labs List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {labs.map(lab => {
          const isSelected = selectedLab === lab.id;
          return (
            <div
              key={lab.id}
              onClick={() => setSelectedLab(lab.id)}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                padding: '1.5rem',
                border: isSelected ? '2px solid #006B70' : '1px solid #E2E8F0',
                boxShadow: isSelected ? '0 4px 16px rgba(0,107,112,0.12)' : '0 2px 8px rgba(0,0,0,0.02)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#F1F5F9', color: '#0F172A', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '900' }}>
                    {lab.id}
                  </span>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '900' }}>
                    {lab.samplesPending} Samples Queued
                  </span>
                </div>

                <h4 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A' }}>{lab.name}</h4>
                <div style={{ fontSize: '0.82rem', color: '#006B70', fontWeight: '800', marginTop: '0.25rem' }}>
                  ✓ {lab.accreditation}
                </div>

                <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={14} /> {lab.address}
                </div>

                <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={14} /> {lab.sampleDropWindow}
                </div>

                <div style={{ marginTop: '0.75rem', backgroundColor: '#F8FAFC', padding: '0.6rem 0.85rem', borderRadius: '10px', fontSize: '0.78rem', color: '#334155', fontWeight: '700' }}>
                  👨‍🔬 Lab Tech: {lab.technicianOnDuty}
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: isSelected ? '#006B70' : '#64748B' }}>
                  {isSelected ? '● SELECTED DESTINATION' : '○ Click to Select'}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700' }}>📍 {lab.distance}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Handover Verification Form */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '2rem', border: '1.5px solid #006B70', maxWidth: '640px' }}>
        <h4 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileCheck size={20} color="#006B70" /> Handover Confirmation & Cold Chain Sign-Off
        </h4>
        <p style={{ fontSize: '0.84rem', color: '#64748B', marginBottom: '1.25rem' }}>
          Transfer physical vacutainer tubes to the laboratory reception technician.
        </p>

        <form onSubmit={handleHandover}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '0.3rem' }}>Total Vacutainers Sealed</label>
              <input
                type="number"
                min="1"
                max="50"
                value={samplesCount}
                onChange={(e) => setSamplesCount(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.95rem', fontWeight: '800' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '0.3rem' }}>Recorded Temperature</label>
              <input
                type="text"
                value={bagTemp}
                onChange={(e) => setBagTemp(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.95rem', fontWeight: '800' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '0.3rem' }}>
              Lab Technician Reception Code / OTP (4-Digits)
            </label>
            <input
              type="text"
              maxLength="6"
              value={handoverOtp}
              onChange={(e) => setHandoverOtp(e.target.value)}
              placeholder="e.g. 5821"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '2px solid #006B70', fontSize: '1.1rem', fontWeight: '900', letterSpacing: '4px', textAlign: 'center' }}
            />
          </div>

          <button
            type="submit"
            disabled={handoverSuccess}
            style={{
              width: '100%',
              padding: '0.85rem',
              backgroundColor: handoverSuccess ? '#059669' : '#006B70',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '900',
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {handoverSuccess ? <CheckCircle2 size={18} /> : <ShieldCheck size={18} />}
            {handoverSuccess ? 'Samples Successfully Handed Over to Lab!' : 'Verify OTP & Complete Lab Handover'}
          </button>
        </form>
      </div>

    </div>
  );
}
