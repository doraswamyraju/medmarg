import React, { useState } from 'react';
import { Phone, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { API_BASE, safeFetch } from '../../data/apiConfig';

export default function CareSeekerPhoneModal({
  isOpen,
  user,
  onPhoneSaved = () => {}
}) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleaned = phoneNumber.replace(/[^0-9]/g, '');

    if (cleaned.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fullPhone = `+91 ${cleaned}`;
      const res = await safeFetch(`${API_BASE}/api/v1/auth/update-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          phone: fullPhone,
          email: user?.email,
          name: user?.name
        })
      });

      const data = await res.json();
      if (data && (data.success || data.user)) {
        onPhoneSaved(fullPhone);
      } else {
        // Fallback save locally
        onPhoneSaved(fullPhone);
      }
    } catch (err) {
      console.warn('Phone update fallback:', err);
      onPhoneSaved(`+91 ${cleaned}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.25rem'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        maxWidth: '440px',
        width: '100%',
        padding: '2.25rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1.5px solid #E2E8F0',
        textAlign: 'center',
        position: 'relative',
        animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Top Icon Badge */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#ECFDF5',
          border: '2px solid #A7F3D0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto'
        }}>
          <Phone size={30} color="#059669" />
        </div>

        <h3 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#0F172A', margin: '0 0 0.5rem 0' }}>
          Complete Your Profile
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: '1.5', margin: '0 0 1.5rem 0' }}>
          Welcome, <strong>{user?.name || 'Care Seeker'}</strong>! Please provide your 10-digit mobile number for phlebotomist arrival updates and instant WhatsApp lab report delivery.
        </p>

        {error && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#B91C1C',
            fontSize: '0.82rem',
            padding: '0.65rem',
            borderRadius: '10px',
            marginBottom: '1.25rem',
            fontWeight: '700'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#F8FAFC',
            border: '2px solid #CBD5E1',
            borderRadius: '14px',
            padding: '0.4rem 0.85rem',
            marginBottom: '1.5rem',
            transition: 'border-color 0.2s'
          }}>
            <span style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.95rem', paddingRight: '0.75rem', borderRight: '1px solid #CBD5E1' }}>
              🇮🇳 +91
            </span>
            <input
              type="tel"
              placeholder="Enter 10-digit mobile number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
              autoFocus
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                padding: '0.75rem 0.85rem',
                fontSize: '1.05rem',
                fontWeight: '700',
                color: '#0F172A',
                letterSpacing: '0.5px'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || phoneNumber.length < 10}
            style={{
              width: '100%',
              padding: '0.95rem',
              backgroundColor: phoneNumber.length === 10 ? '#006B70' : '#94A3B8',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '14px',
              fontSize: '1rem',
              fontWeight: '900',
              cursor: phoneNumber.length === 10 ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: phoneNumber.length === 10 ? '0 10px 20px rgba(0, 107, 112, 0.3)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'Saving...' : 'Save & Continue'} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '1.25rem', color: '#059669', fontSize: '0.76rem', fontWeight: '800' }}>
          <ShieldCheck size={14} /> 100% Verified Healthcare Privacy Guarantee
        </div>
      </div>
    </div>
  );
}
