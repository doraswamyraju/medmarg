import React, { useState, useEffect } from 'react';
import { Sparkles, Tag, ArrowRight, Clock, ShieldCheck, Heart, Award } from 'lucide-react';
import { API_BASE, safeFetch } from '../../data/apiConfig';

export default function CareSeekerOffersCarousel({
  onSelectOffer = () => {},
  catalog = {}
}) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    safeFetch(`${API_BASE}/api/v1/offers?active=true`, {}, 3500)
      .then(async (res) => {
        if (res && res.ok) {
          const text = await res.text();
          try {
            const data = JSON.parse(text);
            if (data.success && Array.isArray(data.offers)) {
              setOffers(data.offers);
            }
          } catch (e) {}
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && offers.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: '900', color: '#0F172A' }}>
          <Sparkles size={16} color="#006B70" />
          <span>Exclusive Diagnostic Offers & Health Packages</span>
        </div>
        <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '700' }}>
          ← Scroll horizontally →
        </span>
      </div>

      {/* Horizontal Scroll Track */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
        scrollbarWidth: 'thin'
      }}>
        {offers.map((offer) => (
          <div
            key={offer.id}
            onClick={() => {
              const pkg = (catalog.packages || []).find(p => p.id === offer.packageId) || catalog.packages?.[0];
              if (pkg) onSelectOffer(pkg);
            }}
            style={{
              minWidth: '290px',
              maxWidth: '320px',
              flex: '0 0 auto',
              background: offer.gradient,
              borderRadius: '20px',
              padding: '1.25rem',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.85rem',
              boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.68rem', backgroundColor: offer.tagColor, color: offer.tagText, padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '900' }}>
                  {offer.badge}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#FEF3C7', fontFamily: 'monospace', fontWeight: '800' }}>
                  USE: {offer.code}
                </span>
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '900', margin: '0.2rem 0', lineHeight: 1.3 }}>
                {offer.title}
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)', margin: '0.2rem 0 0 0', lineHeight: 1.35 }}>
                {offer.subtitle}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '0.65rem' }}>
              <div>
                <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#FBBF24' }}>{offer.price}</span>
                <span style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.7)', textDecoration: 'line-through', marginLeft: '0.4rem' }}>{offer.mrp}</span>
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <span>Claim</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
