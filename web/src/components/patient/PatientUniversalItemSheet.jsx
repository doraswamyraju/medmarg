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
  CheckCircle
} from 'lucide-react';
import { getItemLabPricing } from '../../data/catalogStore';

export default function PatientUniversalItemSheet({
  item,
  onClose,
  onAddToCart,
  isInCart
}) {
  if (!item) return null;

  const isPackage = item.itemType === 'PACKAGE' || item.profiles || item.discountPercent;
  const isProfile = item.itemType === 'PROFILE' || (item.code && item.code.length <= 6 && !item.serialNo);

  const labOptions = getItemLabPricing(item);
  const [selectedLab, setSelectedLab] = useState(() => {
    return labOptions.find(l => l.isRecommended) || labOptions[0];
  });

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
        maxWidth: '720px',
        maxHeight: '92vh',
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
              Select from certified NABL partner laboratories below
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
                ⚡ {selectedLab?.tatHours || item.tatHours || 24} Hours TAT
              </div>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800' }}>BIOMARKERS</div>
              <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0F172A', marginTop: '0.2rem' }}>
                🔬 {item.testCount || item.params || 1} Parameters
              </div>
            </div>
          </div>

          {/* 3-LAB PROVIDER CHOICE SECTION */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '900', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Building2 size={18} color="#006B70" />
                Select Laboratory & Price
              </h4>
              <span style={{ fontSize: '0.76rem', color: '#059669', fontWeight: '800' }}>
                ⚡ 100% NABL Accredited Rates
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {labOptions.map((lab, idx) => {
                const isSelected = selectedLab?.labId === lab.labId;
                const isMedmarg = lab.isMedmargSuggested;

                return (
                  <div
                    key={lab.labId || idx}
                    onClick={() => setSelectedLab(lab)}
                    style={{
                      border: isSelected ? '2.5px solid #006B70' : '1.5px solid #E2E8F0',
                      borderRadius: '16px',
                      padding: '1.25rem',
                      backgroundColor: isSelected ? (isMedmarg ? '#F0FDF4' : '#F8FAFC') : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 4px 14px rgba(0,107,112,0.12)' : 'none',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                      <div style={{ marginTop: '0.2rem' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: isSelected ? '6px solid #006B70' : '2px solid #CBD5E1', backgroundColor: '#FFF' }} />
                      </div>

                      <div>
                        {isMedmarg ? (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '1.45rem', fontWeight: '900', color: '#006B70', letterSpacing: '-0.3px' }}>
                                MedMarg
                              </span>
                              <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: '900' }}>
                                ⭐ MedMarg Smart Pick
                              </span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '700', marginTop: '0.2rem' }}>
                              Suggested Lab: <span style={{ color: '#004D40', fontWeight: '800' }}>{lab.suggestedLabName || item.suggestedLab || 'Central Processing Partner Lab'}</span>
                            </div>
                            <div style={{ fontSize: '0.76rem', color: '#059669', fontWeight: '800', marginTop: '0.3rem' }}>
                              ✓ Free Home Sample Collection • Quality Verified
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '1.15rem', fontWeight: '900', color: lab.labId === 'thyrocare' ? '#B91C1C' : '#D97706' }}>
                                {lab.labName}
                              </span>
                              <span style={{ fontSize: '0.72rem', backgroundColor: '#F1F5F9', color: '#475569', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '800' }}>
                                {lab.tag || 'Certified Laboratory'}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>
                              TAT: <strong>{lab.tatHours || 24} Hours</strong> • Direct Sample Fulfillment
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: '900', color: isMedmarg ? '#006B70' : '#0F172A' }}>
                        ₹{lab.price}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                        ₹{lab.mrp}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: '800', marginTop: '0.15rem' }}>
                        Save {lab.discountPercent || 35}%
                      </div>
                    </div>
                  </div>
                );
              })}
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

        {/* Footer with Chosen Price and Add to Cart */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderTop: '1px solid #E2E8F0',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>
              Selected Provider: <strong style={{ color: '#0F172A' }}>{selectedLab?.labName}</strong> {selectedLab?.isMedmargSuggested && `(${selectedLab.suggestedLabName})`}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#006B70' }}>
                ₹{selectedLab?.price || item.price || 499}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                ₹{selectedLab?.mrp || item.mrp || 999}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              onAddToCart(item, selectedLab);
              onClose();
            }}
            style={{
              padding: '0.75rem 1.8rem',
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
            <span>{isInCart ? 'Added to Cart' : `Add to Cart (${selectedLab?.labName})`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

