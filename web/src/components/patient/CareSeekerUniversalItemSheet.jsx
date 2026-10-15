import React, { useState } from 'react';
import { 
  X, 
  FlaskConical, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  Plus, 
  Check, 
  Sparkles,
  Award,
  Building2,
  Users,
  TrendingDown
} from 'lucide-react';
import { 
  getStartingPrice, 
  getItemLabPricing, 
  getItemTierPricing, 
  getItemPriceForPeople 
} from '../../data/catalogStore';

export default function CareSeekerUniversalItemSheet({
  item,
  onClose,
  onAddToCart,
  isInCart
}) {
  const [selectedPersonCount, setSelectedPersonCount] = useState(1);

  if (!item) return null;

  const isPackage = item.itemType === 'PACKAGE' || item.profiles || item.discountPercent;
  const isProfile = item.itemType === 'PROFILE' || (item.code && item.code.length <= 6 && !item.serialNo);
  const startPricing = getStartingPrice(item);
  const labPricingList = getItemLabPricing(item);
  const tierPricing = getItemTierPricing(item);
  const currentTierInfo = getItemPriceForPeople(item, selectedPersonCount);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      zIndex: 1100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.25rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        maxWidth: '680px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1.5px solid #E2E8F0'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem 1.75rem',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          backgroundColor: '#F8FAFC'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: '900',
                padding: '0.2rem 0.55rem',
                borderRadius: '6px',
                backgroundColor: isPackage ? '#FEF3C7' : isProfile ? '#E0F2FE' : '#E0F2F1',
                color: isPackage ? '#B45309' : isProfile ? '#0369A1' : '#006B70',
                letterSpacing: '0.04em'
              }}>
                {isPackage ? 'HEALTH PACKAGE' : isProfile ? 'DIAGNOSTIC PROFILE' : 'INDIVIDUAL TEST'}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748B', fontFamily: 'monospace', fontWeight: '700' }}>
                {item.code || item.id}
              </span>
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0F172A', margin: 0, lineHeight: 1.25 }}>
              {item.name || item.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Sheet Content */}
        <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
          
          {/* Quick Specifications Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem' }}>
            <div style={{ padding: '0.8rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '800' }}>SPECIMEN TUBE</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A', marginTop: '0.2rem' }}>
                🩸 {item.sampleType || item.sampleTypes?.join(', ') || 'SERUM (Gold SST)'}
              </div>
            </div>

            <div style={{ padding: '0.8rem', backgroundColor: item.fasting === 'YES' ? '#FEF3C7' : '#F0FDF4', borderRadius: '12px', border: item.fasting === 'YES' ? '1px solid #FDE68A' : '1px solid #BBF7D0' }}>
              <div style={{ fontSize: '0.7rem', color: item.fasting === 'YES' ? '#B45309' : '#15803D', fontWeight: '800' }}>FASTING REQUIRED</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: item.fasting === 'YES' ? '#92400E' : '#166534', marginTop: '0.2rem' }}>
                ⏱ {item.fasting === 'YES' ? '10-12 Hrs Fasting' : 'No Fasting'}
              </div>
            </div>

            <div style={{ padding: '0.8rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '800' }}>REPORT TAT</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A', marginTop: '0.2rem' }}>
                ⚡ {item.tatHours || 24} Hours
              </div>
            </div>

            <div style={{ padding: '0.8rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '800' }}>BIOMARKERS</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A', marginTop: '0.2rem' }}>
                🔬 {item.testCount || item.params || 1} Parameters
              </div>
            </div>
          </div>

          {/* MULTI-PERSON VOLUME SLABS SELECTOR (FAMILY MEMBERS & STAFF) */}
          <div style={{ 
            backgroundColor: '#F0FDF4', 
            borderRadius: '16px', 
            border: '2px solid #006B70', 
            padding: '1.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Users size={18} color="#006B70" />
                <span style={{ fontSize: '0.9rem', fontWeight: '900', color: '#004D40' }}>
                  Booking for Multiple People? (Family or Staff)
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '900' }}>
                TIERED VOLUME SAVINGS
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {[
                { count: 1, label: '1 Person', tag: 'Single' },
                { count: 2, label: '2 People', tag: 'Duo ~15% off' },
                { count: 5, label: '5 People', tag: 'Family ~30% off' },
                { count: 10, label: '10+ People', tag: 'Staff ~45% off' }
              ].map(s => {
                const isSelected = selectedPersonCount === s.count;
                const tierInfo = getItemPriceForPeople(item, s.count);

                return (
                  <div
                    key={s.count}
                    onClick={() => setSelectedPersonCount(s.count)}
                    style={{
                      padding: '0.65rem 0.5rem',
                      borderRadius: '10px',
                      backgroundColor: isSelected ? '#006B70' : '#FFFFFF',
                      border: isSelected ? '2px solid #004D40' : '1px solid #CBD5E1',
                      color: isSelected ? '#FFFFFF' : '#0F172A',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontSize: '0.78rem', fontWeight: '800' }}>{s.label}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '900', marginTop: '0.2rem' }}>
                      ₹{tierInfo.pricePerPerson}
                      <span style={{ fontSize: '0.65rem', fontWeight: '600', opacity: 0.85 }}>/p</span>
                    </div>
                    <div style={{ fontSize: '0.65rem', color: isSelected ? '#FEF3C7' : '#059669', fontWeight: '800', marginTop: '0.15rem' }}>
                      {tierInfo.discountPercent}% OFF
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedPersonCount > 1 && (
              <div style={{ fontSize: '0.78rem', color: '#166534', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <TrendingDown size={14} /> Group Total: ₹{currentTierInfo.totalPrice} for {selectedPersonCount} individuals (₹{currentTierInfo.pricePerPerson}/person)
              </div>
            )}
          </div>

          {/* MULTI-LAB PROCESSING NOTICE */}
          <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.86rem', fontWeight: '800', color: '#0F172A' }}>
              <Building2 size={16} color="#006B70" />
              <span>Multi-Laboratory Choice at Checkout</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.76rem', marginTop: '0.2rem' }}>
              <span style={{ backgroundColor: '#E0F2F1', color: '#006B70', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '800' }}>
                MedMarg Smart Pick: ₹{labPricingList[0]?.price || item.price}
              </span>
              <span style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '800' }}>
                Thyrocare: ₹{labPricingList[1]?.price || Math.round((item.price || 299) * 1.15)}
              </span>
              <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '800' }}>
                Dr. Lal PathLabs: ₹{labPricingList[2]?.price || Math.round((item.price || 299) * 1.30)}
              </span>
            </div>
          </div>

          {/* Description & Clinical Significance */}
          {item.description && (
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.35rem' }}>
                About this Test & Clinical Overview
              </h4>
              <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                {item.description}
              </p>
            </div>
          )}

          {/* Included Biomarkers Breakdown */}
          {item.includes && item.includes.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.5rem' }}>
                Biomarkers & Parameter Breakdown ({item.includes.length})
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.45rem' }}>
                {item.includes.map((param, pIdx) => (
                  <div key={pIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: '#334155', backgroundColor: '#F1F5F9', padding: '0.45rem 0.65rem', borderRadius: '8px' }}>
                    <CheckCircle2 size={13} color="#006B70" />
                    <span>{param}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quality Assurance */}
          <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '0.85rem', border: '1px solid #E2E8F0', display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
            <Award size={24} color="#006B70" />
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F172A' }}>
                Certified NABL / CAP Pathology Processing
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                Verified by MD Pathologists. Strict cold-chain telemetry during sample transit.
              </div>
            </div>
          </div>

        </div>

        {/* Footer with Price and Add to Cart */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderTop: '1px solid #E2E8F0',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
              {selectedPersonCount > 1 ? `Total for ${selectedPersonCount} People` : 'Single Person Booking'}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#006B70' }}>
                ₹{currentTierInfo.totalPrice}
              </div>
              {selectedPersonCount > 1 && (
                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700' }}>
                  (₹{currentTierInfo.pricePerPerson}/person)
                </div>
              )}
              <div style={{ fontSize: '0.8rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                ₹{currentTierInfo.mrpPerPerson * selectedPersonCount}
              </div>
              {currentTierInfo.discountPercent > 0 && (
                <span style={{ fontSize: '0.72rem', color: '#059669', backgroundColor: '#DCFCE7', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '800' }}>
                  {currentTierInfo.discountPercent}% OFF
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              onAddToCart({
                ...item,
                personsCount: selectedPersonCount,
                price: currentTierInfo.pricePerPerson,
                totalTierPrice: currentTierInfo.totalPrice
              });
              onClose();
            }}
            style={{
              padding: '0.75rem 1.75rem',
              backgroundColor: isInCart ? '#059669' : '#006B70',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '900',
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(0,107,112,0.25)'
            }}
          >
            {isInCart ? <Check size={18} /> : <Plus size={18} />}
            <span>{isInCart ? 'Added to Cart' : `Add for ${selectedPersonCount} ${selectedPersonCount === 1 ? 'Person' : 'People'}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
