import React from 'react';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Sparkles, 
  Clock, 
  Percent,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { getDefaultLabPricing } from '../../../data/catalogStore';

/**
 * MultiLabPricingEditor
 * Allows Admin / Staff to configure pricing across multiple certified pathology labs
 * (MedMarg Smart Pick, Thyrocare, Dr. Lal PathLabs, + Custom Signed-up Labs).
 */
export default function MultiLabPricingEditor({
  labPricing = [],
  onChange = () => {},
  basePrice = 299,
  baseMrp = 499,
  tatHours = 24
}) {
  // Ensure we have a valid array with at least 3 default labs
  const labs = (Array.isArray(labPricing) && labPricing.length > 0)
    ? labPricing
    : getDefaultLabPricing(basePrice, baseMrp, tatHours);

  const updateLab = (index, field, value) => {
    const updated = JSON.parse(JSON.stringify(labs));
    if (!updated[index]) return;
    
    updated[index][field] = value;
    
    // Auto-update discount percent when price or mrp changes
    if (field === 'price' || field === 'mrp') {
      const p = Number(updated[index].price) || 0;
      const m = Number(updated[index].mrp) || Math.round(p * 1.6);
      updated[index].discountPercent = m > p ? Math.round(((m - p) / m) * 100) : 0;
    }
    
    onChange(updated);
  };

  const addCustomLab = () => {
    const nextLabNumber = labs.length + 1;
    const newLab = {
      labId: `lab_custom_${Date.now()}`,
      labName: `Partner Lab #${nextLabNumber}`,
      suggestedLabName: null,
      isMedmargSuggested: false,
      price: Math.round(Number(basePrice) * 1.1) || 329,
      mrp: Number(baseMrp) || 549,
      discountPercent: 40,
      tatHours: Number(tatHours) || 24,
      tag: 'Custom Partner Lab',
      isCustom: true
    };
    onChange([...labs, newLab]);
  };

  const removeLab = (index) => {
    if (labs.length <= 1) return; // Keep at least MedMarg
    const updated = labs.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleAutoPopulate = () => {
    const fresh = getDefaultLabPricing(basePrice, baseMrp, tatHours);
    // If there were custom labs, preserve them with updated pricing
    const customLabs = labs.filter(l => l.isCustom).map(l => ({
      ...l,
      price: Math.round(Number(basePrice) * 1.2),
      mrp: Number(baseMrp) || Math.round(Number(basePrice) * 1.8),
      tatHours: Number(tatHours) || 24
    }));
    onChange([...fresh, ...customLabs]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Helper Banner */}
      <div style={{ 
        backgroundColor: '#F0FDF4', 
        borderRadius: '16px', 
        padding: '1rem 1.25rem', 
        border: '1.5px solid #BBF7D0', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Building2 size={22} color="#006B70" />
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#166534' }}>
              Multi-Laboratory Price Differentiation Matrix
            </div>
            <div style={{ fontSize: '0.76rem', color: '#15803D', marginTop: '0.1rem' }}>
              Admin and assigned staff can configure, rename, add, or remove certified pathology lab partners.
            </div>
          </div>
        </div>
      </div>

      {/* Lab Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {labs.map((lab, idx) => {
          const isMedmarg = !!lab.isMedmargSuggested || idx === 0;
          const isThyrocare = lab.labId === 'thyrocare' || (idx === 1 && !isMedmarg);
          const isLalpath = lab.labId === 'lalpath' || (idx === 2 && !isMedmarg && !isThyrocare);
          const isCustom = lab.isCustom || idx > 2;

          let cardBorder = '#CBD5E1';
          let cardBg = '#F8FAFC';
          let brandColor = '#0F172A';
          let badgeText = 'PARTNER LAB';
          let badgeBg = '#E2E8F0';
          let badgeColor = '#475569';

          if (isMedmarg) {
            cardBorder = '#006B70';
            cardBg = '#F0FDF4';
            brandColor = '#006B70';
            badgeText = '⭐ MEDMARG SMART PICK / SUGGESTED';
            badgeBg = '#FEF3C7';
            badgeColor = '#B45309';
          } else if (isThyrocare) {
            cardBorder = '#FECACA';
            cardBg = '#FEF2F2';
            brandColor = '#B91C1C';
            badgeText = 'AUTOMATED DIRECT LAB';
            badgeBg = '#FEE2E2';
            badgeColor = '#991B1B';
          } else if (isLalpath) {
            cardBorder = '#FDE68A';
            cardBg = '#FFFBEB';
            brandColor = '#D97706';
            badgeText = 'NATIONAL REFERENCE LAB';
            badgeBg = '#FEF3C7';
            badgeColor = '#92400E';
          } else {
            cardBorder = '#E0E7FF';
            cardBg = '#EEF2FF';
            brandColor = '#4338CA';
            badgeText = 'CUSTOM SIGNED-UP LAB';
            badgeBg = '#E0E7FF';
            badgeColor = '#3730A3';
          }

          return (
            <div 
              key={lab.labId || idx}
              style={{
                backgroundColor: cardBg,
                borderRadius: '16px',
                border: `2px solid ${cardBorder}`,
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                boxShadow: isMedmarg ? '0 4px 14px rgba(0,107,112,0.08)' : 'none'
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: '900', color: brandColor }}>
                    #{idx + 1} {lab.labName || `Lab Partner #${idx + 1}`}
                  </span>
                  <span style={{ fontSize: '0.7rem', backgroundColor: badgeBg, color: badgeColor, padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '900' }}>
                    {badgeText}
                  </span>
                </div>

                {labs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLab(idx)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#EF4444',
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <Trash2 size={14} /> Remove Lab
                  </button>
                )}
              </div>

              {/* Grid of Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 0.9fr', gap: '0.75rem', alignItems: 'end' }}>
                
                {/* Lab Name (Editable for all labs) */}
                <div>
                  <label style={{ fontSize: '0.74rem', color: brandColor, fontWeight: '800', display: 'block', marginBottom: '0.25rem' }}>
                    Lab Brand Name *
                  </label>
                  <input
                    type="text"
                    value={lab.labName || ''}
                    onChange={(e) => updateLab(idx, 'labName', e.target.value)}
                    placeholder="e.g. MedMarg Processing Lab / Thyrocare / Dr. Lal PathLabs"
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      border: `1.5px solid ${cardBorder}`,
                      borderRadius: '8px',
                      color: '#0F172A',
                      fontWeight: '800',
                      fontSize: '0.84rem',
                      backgroundColor: '#FFFFFF'
                    }}
                  />
                </div>

                {/* Offer Price */}
                <div>
                  <label style={{ fontSize: '0.74rem', color: brandColor, fontWeight: '800', display: 'block', marginBottom: '0.25rem' }}>
                    Offer Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={lab.price ?? ''}
                    onChange={(e) => updateLab(idx, 'price', Number(e.target.value))}
                    required
                    min={1}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      border: `1.5px solid ${brandColor}`,
                      borderRadius: '8px',
                      color: brandColor,
                      fontWeight: '900',
                      fontSize: '0.92rem',
                      backgroundColor: '#FFFFFF'
                    }}
                  />
                </div>

                {/* Standard MRP */}
                <div>
                  <label style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '700', display: 'block', marginBottom: '0.25rem' }}>
                    Standard MRP (₹)
                  </label>
                  <input
                    type="number"
                    value={lab.mrp ?? ''}
                    onChange={(e) => updateLab(idx, 'mrp', Number(e.target.value))}
                    min={1}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      color: '#64748B',
                      fontSize: '0.86rem',
                      backgroundColor: '#FFFFFF'
                    }}
                  />
                </div>

                {/* TAT Hours */}
                <div>
                  <label style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '700', display: 'block', marginBottom: '0.25rem' }}>
                    TAT (Hours)
                  </label>
                  <input
                    type="number"
                    value={lab.tatHours ?? 24}
                    onChange={(e) => updateLab(idx, 'tatHours', Number(e.target.value))}
                    min={1}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      color: '#0F172A',
                      fontSize: '0.86rem',
                      backgroundColor: '#FFFFFF'
                    }}
                  />
                </div>

              </div>

              {/* Discount Summary Tag */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.74rem' }}>
                <span style={{ 
                  backgroundColor: lab.discountPercent > 0 ? '#DCFCE7' : '#F1F5F9', 
                  color: lab.discountPercent > 0 ? '#15803D' : '#64748B', 
                  padding: '0.15rem 0.45rem', 
                  borderRadius: '4px', 
                  fontWeight: '800' 
                }}>
                  {lab.discountPercent || 0}% Patient Savings
                </span>
                <span style={{ color: '#64748B' }}>
                  Patient pays <strong>₹{lab.price}</strong> instead of <strong>₹{lab.mrp}</strong> (Delivered in {lab.tatHours || 24} hrs)
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Button to Add More Custom Labs */}
      <button
        type="button"
        onClick={addCustomLab}
        style={{
          padding: '0.75rem 1rem',
          backgroundColor: '#FFFFFF',
          border: '2px dashed #006B70',
          borderRadius: '14px',
          color: '#006B70',
          fontWeight: '900',
          fontSize: '0.88rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          transition: 'all 0.15s ease'
        }}
      >
        <Plus size={18} /> + Add Another Certified Pathology Lab Partner
      </button>

    </div>
  );
}
