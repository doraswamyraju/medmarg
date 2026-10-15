import React from 'react';
import { 
  Users, 
  Sparkles, 
  Tag, 
  UserCheck, 
  Percent, 
  Info,
  DollarSign,
  TrendingDown
} from 'lucide-react';
import { getDefaultTierPricing } from '../../../data/catalogStore';

/**
 * MultiPeopleTierPricingEditor
 * Allows Admin / Staff to configure tiered pricing for multiple people (1, 2, 5, 10+ people)
 * for family members, household groups, or corporate staff taking the test.
 */
export default function MultiPeopleTierPricingEditor({
  tierPricing = {},
  onChange = () => {},
  basePrice = 299,
  baseMrp = 499
}) {
  // Ensure we have a valid tierPricing structure with 1, 2, 5, 10
  const tiers = (tierPricing && typeof tierPricing === 'object' && tierPricing['1'])
    ? tierPricing
    : getDefaultTierPricing(basePrice, baseMrp);

  const tierKeys = [
    { key: '1', count: 1, label: 'Individual (1 Person)', defaultTag: 'Standard Single Rate', color: '#006B70', bg: '#F0FDF4', border: '#BBF7D0' },
    { key: '2', count: 2, label: 'Couple / Pair (2 People)', defaultTag: 'Family Duo ~15% Off', color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD' },
    { key: '5', count: 5, label: 'Family Pack (5 People)', defaultTag: 'Family Pack ~30% Off', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
    { key: '10', count: 10, label: 'Corporate Staff / Camp (10+ People)', defaultTag: 'Corporate Bulk ~45% Off', color: '#7E22CE', bg: '#FAF5FF', border: '#E9D5FF' }
  ];

  const updateTier = (tierKey, field, value) => {
    const updated = JSON.parse(JSON.stringify(tiers));
    if (!updated[tierKey]) {
      updated[tierKey] = { persons: Number(tierKey) };
    }
    
    updated[tierKey][field] = value;

    if (field === 'pricePerPerson' || field === 'offerPrice') {
      const numVal = Number(value) || 0;
      updated[tierKey].pricePerPerson = numVal;
      updated[tierKey].offerPrice = numVal;
      const m = Number(updated[tierKey].mrpPerPerson) || Number(baseMrp) || Math.round(numVal * 1.6);
      updated[tierKey].discountPercent = m > numVal ? Math.round(((m - numVal) / m) * 100) : 0;
    } else if (field === 'mrpPerPerson') {
      const numMrp = Number(value) || 0;
      updated[tierKey].mrpPerPerson = numMrp;
      const p = Number(updated[tierKey].pricePerPerson) || Number(basePrice) || 299;
      updated[tierKey].discountPercent = numMrp > p ? Math.round(((numMrp - p) / numMrp) * 100) : 0;
    }

    onChange(updated);
  };

  const handleAutoCalculateAll = () => {
    const fresh = getDefaultTierPricing(basePrice, baseMrp);
    onChange(fresh);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Banner */}
      <div style={{
        backgroundColor: '#F8FAFC',
        borderRadius: '16px',
        padding: '1.25rem',
        border: '1.5px solid #E2E8F0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            backgroundColor: '#006B70', 
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#FFFFFF'
          }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: '900', color: '#0F172A' }}>
              Multi-Person Volume & Slab Pricing (Family Members & Corporate Staff)
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.1rem' }}>
              Set customized rates when the same test or profile is ordered for 1, 2, 5, or 10+ individuals.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAutoCalculateAll}
          style={{
            padding: '0.5rem 0.95rem',
            backgroundColor: '#006B70',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            fontSize: '0.8rem',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 2px 8px rgba(0,107,112,0.2)'
          }}
        >
          <Sparkles size={15} /> Auto-Calculate Slabs (from Base ₹{basePrice})
        </button>
      </div>

      {/* Slabs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {tierKeys.map(tMeta => {
          const tier = tiers[tMeta.key] || {
            persons: tMeta.count,
            label: tMeta.label,
            tag: tMeta.defaultTag,
            pricePerPerson: basePrice,
            offerPrice: basePrice,
            mrpPerPerson: baseMrp,
            discountPercent: 30
          };

          const pPerPerson = Number(tier.pricePerPerson ?? tier.offerPrice ?? basePrice);
          const mrpPerPerson = Number(tier.mrpPerPerson ?? baseMrp ?? Math.round(pPerPerson * 1.6));
          const totalGroupPrice = pPerPerson * tMeta.count;
          const totalGroupMrp = mrpPerPerson * tMeta.count;
          const totalSavings = totalGroupMrp - totalGroupPrice;
          const savingsPct = totalGroupMrp > totalGroupPrice ? Math.round((totalSavings / totalGroupMrp) * 100) : 0;

          return (
            <div
              key={tMeta.key}
              style={{
                backgroundColor: tMeta.bg,
                borderRadius: '16px',
                border: `2px solid ${tMeta.border}`,
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              <div>
                {/* Slab Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <span style={{ 
                      fontSize: '0.72rem', 
                      backgroundColor: '#FFFFFF', 
                      color: tMeta.color, 
                      padding: '0.15rem 0.5rem', 
                      borderRadius: '4px', 
                      fontWeight: '900',
                      border: `1px solid ${tMeta.border}`
                    }}>
                      SLAB: {tMeta.count === 10 ? '10+ PEOPLE' : `${tMeta.count} ${tMeta.count === 1 ? 'PERSON' : 'PEOPLE'}`}
                    </span>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0F172A', marginTop: '0.35rem', marginBottom: 0 }}>
                      {tier.label || tMeta.label}
                    </h4>
                  </div>
                  <span style={{ 
                    fontSize: '0.72rem', 
                    fontWeight: '800', 
                    color: '#059669', 
                    backgroundColor: '#DCFCE7', 
                    padding: '0.2rem 0.5rem', 
                    borderRadius: '6px' 
                  }}>
                    {savingsPct}% OFF
                  </span>
                </div>

                {/* Subtag / description */}
                <input
                  type="text"
                  value={tier.tag || tMeta.defaultTag}
                  onChange={(e) => updateTier(tMeta.key, 'tag', e.target.value)}
                  placeholder="e.g. Family Pack ~30% Off"
                  style={{
                    width: '100%',
                    padding: '0.35rem 0.55rem',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: tMeta.color,
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    backgroundColor: '#FFFFFF',
                    marginBottom: '0.85rem'
                  }}
                />

                {/* Price Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: tMeta.color, fontWeight: '800', display: 'block', marginBottom: '0.2rem' }}>
                      Offer Price / Person (₹) *
                    </label>
                    <input
                      type="number"
                      value={pPerPerson}
                      onChange={(e) => updateTier(tMeta.key, 'pricePerPerson', e.target.value)}
                      min={1}
                      required
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.65rem',
                        border: `1.5px solid ${tMeta.color}`,
                        borderRadius: '8px',
                        fontWeight: '900',
                        fontSize: '0.95rem',
                        color: tMeta.color,
                        backgroundColor: '#FFFFFF'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '700', display: 'block', marginBottom: '0.2rem' }}>
                      Standard MRP / Person (₹)
                    </label>
                    <input
                      type="number"
                      value={mrpPerPerson}
                      onChange={(e) => updateTier(tMeta.key, 'mrpPerPerson', e.target.value)}
                      min={1}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.65rem',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        fontSize: '0.88rem',
                        color: '#64748B',
                        backgroundColor: '#FFFFFF'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Group Total Calculator Summary Box */}
              <div style={{ 
                backgroundColor: '#FFFFFF', 
                borderRadius: '12px', 
                padding: '0.75rem', 
                border: '1px solid #E2E8F0',
                fontSize: '0.76rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>Calculated for {tMeta.count} people:</span>
                  <span style={{ textDecoration: 'line-through', color: '#94A3B8' }}>₹{totalGroupMrp}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: '800', color: '#0F172A' }}>Total Booking Cost:</span>
                  <span style={{ fontSize: '1.05rem', fontWeight: '900', color: tMeta.color }}>₹{totalGroupPrice}</span>
                </div>
                {totalSavings > 0 && (
                  <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.1rem' }}>
                    <TrendingDown size={12} /> Family/Staff Saves ₹{totalSavings} in bulk
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
