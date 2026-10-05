import React from 'react';
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
  Award
} from 'lucide-react';

export default function CareSeekerUniversalItemSheet({
  item,
  onClose,
  onAddToCart,
  isInCart
}) {
  if (!item) return null;

  const isPackage = item.itemType === 'PACKAGE' || item.profiles || item.discountPercent;
  const isProfile = item.itemType === 'PROFILE' || (item.code && item.code.length <= 6 && !item.serialNo);

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
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 48px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem 1.75rem',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          backgroundColor: '#004D40',
          color: '#FFFFFF'
        }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '900' }}>
                {isPackage ? 'COMPREHENSIVE PACKAGE' : isProfile ? 'DIAGNOSTIC PROFILE' : 'INDIVIDUAL TEST'}
              </span>
              <span style={{ fontSize: '0.78rem', color: '#80CBC4', fontFamily: 'monospace', fontWeight: '700' }}>
                CODE: {item.code || item.id}
              </span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: '900', lineHeight: 1.25, margin: 0 }}>
              {item.name || item.title}
            </h2>
            <div style={{ fontSize: '0.82rem', color: '#80CBC4', marginTop: '0.35rem' }}>
              Processing Lab: {item.lab || 'MedMarg Central Hub (NABL Certified)'}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#80CBC4', cursor: 'pointer', padding: '0.4rem', borderRadius: '8px' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Sheet Content */}
        <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Quick Specifications Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
            <div style={{ padding: '0.85rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800' }}>SPECIMEN TUBE</div>
              <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0F172A', marginTop: '0.2rem' }}>
                🩸 {item.sampleType || item.sampleTypes?.join(', ') || 'SERUM (Gold SST)'}
              </div>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: item.fasting === 'YES' ? '#FEF3C7' : '#F0FDF4', borderRadius: '12px', border: item.fasting === 'YES' ? '1px solid #FDE68A' : '1px solid #BBF7D0' }}>
              <div style={{ fontSize: '0.72rem', color: item.fasting === 'YES' ? '#B45309' : '#15803D', fontWeight: '800' }}>FASTING REQUIRED</div>
              <div style={{ fontSize: '0.88rem', fontWeight: '800', color: item.fasting === 'YES' ? '#92400E' : '#166534', marginTop: '0.2rem' }}>
                ⏱ {item.fasting === 'YES' ? '10-12 Hrs Fasting' : 'No Fasting'}
              </div>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800' }}>REPORT TURNAROUND</div>
              <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0F172A', marginTop: '0.2rem' }}>
                ⚡ {item.tatHours || 24} Hours TAT
              </div>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800' }}>BIOMARKERS</div>
              <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0F172A', marginTop: '0.2rem' }}>
                🔬 {item.testCount || item.params || 1} Parameters
              </div>
            </div>
          </div>

          {/* Description & Clinical Significance */}
          {item.description && (
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.4rem' }}>
                About this Test & Clinical Overview
              </h4>
              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                {item.description}
              </p>
            </div>
          )}

          {/* Included Biomarkers Breakdown */}
          {item.includes && item.includes.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.6rem' }}>
                Biomarkers & Parameter Breakdown ({item.includes.length})
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.5rem' }}>
                {item.includes.map((param, pIdx) => (
                  <div key={pIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', color: '#334155', backgroundColor: '#F1F5F9', padding: '0.45rem 0.75rem', borderRadius: '8px' }}>
                    <CheckCircle2 size={14} color="#006B70" />
                    <span>{param}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quality Assurance */}
          <div style={{ backgroundColor: '#F8FAFC', borderRadius: '14px', padding: '1rem', border: '1px solid #E2E8F0', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Award size={28} color="#006B70" />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A' }}>
                Certified NABL / CAP Pathology Processing
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
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
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#006B70' }}>
              ₹{item.price || 499}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8', textDecoration: 'line-through' }}>
              ₹{item.mrp || (item.price ? Math.round(item.price * 1.6) : 999)}
            </div>
          </div>

          <button
            onClick={() => {
              onAddToCart(item);
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
            <span>{isInCart ? 'Added to Cart' : 'Add to Cart & Continue'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
