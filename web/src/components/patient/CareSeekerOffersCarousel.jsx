import React, { useState, useEffect } from 'react';
import { Sparkles, Tag, ArrowRight, Clock, ShieldCheck, Heart, Award } from 'lucide-react';
import { API_BASE, safeFetch } from '../../data/apiConfig';

export default function CareSeekerOffersCarousel({
  onSelectOffer = () => {},
  catalog = {}
}) {
  const [offers, setOffers] = useState([
    {
      id: 'off_1',
      title: '⚡ 60-Minute Express Home Phlebotomy',
      subtitle: 'Flat 60% OFF on Aarogyam Full Body Checkup',
      code: 'EXPRESS60',
      price: '₹1,499',
      mrp: '₹3,500',
      gradient: 'linear-gradient(135deg, #004D40 0%, #006B70 100%)',
      badge: 'TOP CHOICE',
      tagColor: '#FEF3C7',
      tagText: '#B45309',
      packageId: 'pkg_aarogyam_13'
    },
    {
      id: 'off_2',
      title: '👵 Senior Citizen Diabetic & Cardiac Panel',
      subtitle: 'HbA1c + Fasting Blood Sugar + Lipid Profile',
      code: 'SENIORCARE',
      price: '₹599',
      mrp: '₹1,400',
      gradient: 'linear-gradient(135deg, #1E3A8A 0%, #0284C7 100%)',
      badge: 'POPULAR',
      tagColor: '#E0F2FE',
      tagText: '#0369A1',
      packageId: 'pkg_mm_cardio_diab'
    },
    {
      id: 'off_3',
      title: '🌸 Complete Women\'s Vitality & Hormone',
      subtitle: 'Thyroid (T3/T4/TSH), Iron, Calcium & Vitamins D3/B12',
      code: 'WOMENHEALTH',
      price: '₹999',
      mrp: '₹2,200',
      gradient: 'linear-gradient(135deg, #581C87 0%, #9333EA 100%)',
      badge: 'SPECIAL',
      tagColor: '#F3E8FF',
      tagText: '#6B21A8',
      packageId: 'pkg_mm_women_well'
    },
    {
      id: 'off_4',
      title: '👨‍👩‍👧 Family & Corporate Wellness Days',
      subtitle: 'Book for 2+ Members & Get ₹500 MedMarg Wallet Cashback',
      code: 'FAMILY500',
      price: '₹500 Cashback',
      mrp: 'Free Home Visit',
      gradient: 'linear-gradient(135deg, #065F46 0%, #059669 100%)',
      badge: 'CASHBACK',
      tagColor: '#D1FAE5',
      tagText: '#047857',
      packageId: 'pkg_mm_master'
    }
  ]);

  useEffect(() => {
    safeFetch(`${API_BASE}/api/v1/offers?active=true`, {}, 2500)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.offers && data.offers.length > 0) {
          setOffers(data.offers);
        }
      })
      .catch(() => {});
  }, []);

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
