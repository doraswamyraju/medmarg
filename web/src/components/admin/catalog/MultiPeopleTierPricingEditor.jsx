import React, { useState } from 'react';
import { 
  Users, 
  Sparkles, 
  Tag, 
  Plus, 
  Trash2, 
  Percent, 
  BadgePercent,
  TrendingDown,
  Coins
} from 'lucide-react';
import { getDefaultTierPricing } from '../../../data/catalogStore';

/**
 * MultiPeopleTierPricingEditor
 * Allows Admin / Staff to dynamically configure tiered pricing for multiple people (1, 2, 5, 10+ people or custom),
 * with support for editing, adding, updating, and deleting slabs, and selecting Fixed Discount (₹) or Percentage Discount (%).
 */
export default function MultiPeopleTierPricingEditor({
  tierPricing = {},
  onChange = () => {},
  basePrice = 299,
  baseMrp = 499
}) {
  const tiers = (tierPricing && typeof tierPricing === 'object' && Object.keys(tierPricing).length > 0)
    ? tierPricing
    : getDefaultTierPricing(basePrice, baseMrp);

  // Sorted keys
  const sortedKeys = Object.keys(tiers).sort((a, b) => (Number(a) || 0) - (Number(b) || 0));

  // Visual themes for slabs based on count
  const getTheme = (count) => {
    const num = Number(count);
    if (num <= 1) return { color: '#006B70', bg: '#F0FDF4', border: '#BBF7D0' };
    if (num <= 2) return { color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD' };
    if (num <= 5) return { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' };
    return { color: '#7E22CE', bg: '#FAF5FF', border: '#E9D5FF' };
  };

  const updateTierField = (key, field, val) => {
    const updated = JSON.parse(JSON.stringify(tiers));
    if (!updated[key]) return;

    updated[key][field] = val;

    const bPrice = Number(basePrice) || 299;
    const bMrp = Number(baseMrp) || Math.round(bPrice * 1.6);
    const mode = updated[key].discountMode || 'PERCENT';

    if (field === 'discountMode' || field === 'discountValue') {
      const dVal = Number(updated[key].discountValue) || 0;
      if (mode === 'PERCENT') {
        const calcPrice = Math.max(1, Math.round(bPrice * (1 - dVal / 100)));
        updated[key].pricePerPerson = calcPrice;
        updated[key].offerPrice = calcPrice;
      } else if (mode === 'FIXED') {
        const calcPrice = Math.max(1, bPrice - dVal);
        updated[key].pricePerPerson = calcPrice;
        updated[key].offerPrice = calcPrice;
      }
      const mrp = Number(updated[key].mrpPerPerson) || bMrp;
      const p = updated[key].pricePerPerson;
      updated[key].discountPercent = mrp > p ? Math.round(((mrp - p) / mrp) * 100) : 0;
    } else if (field === 'pricePerPerson' || field === 'offerPrice') {
      const numVal = Number(val) || 0;
      updated[key].pricePerPerson = numVal;
      updated[key].offerPrice = numVal;
      const m = Number(updated[key].mrpPerPerson) || bMrp;
      updated[key].discountPercent = m > numVal ? Math.round(((m - numVal) / m) * 100) : 0;
    } else if (field === 'mrpPerPerson') {
      const numMrp = Number(val) || 0;
      updated[key].mrpPerPerson = numMrp;
      const p = Number(updated[key].pricePerPerson) || bPrice;
      updated[key].discountPercent = numMrp > p ? Math.round(((numMrp - p) / numMrp) * 100) : 0;
    }

    onChange(updated);
  };

  const handleAddCustomSlab = () => {
    const existingCounts = sortedKeys.map(k => Number(k)).filter(n => !isNaN(n));
    let nextCount = 3;
    while (existingCounts.includes(nextCount)) {
      nextCount++;
    }

    const defaultPct = nextCount >= 10 ? 45 : nextCount >= 5 ? 30 : nextCount >= 3 ? 20 : 15;
    const calcPrice = Math.max(1, Math.round(Number(basePrice) * (1 - defaultPct / 100)));

    const newKey = String(nextCount);
    const updated = {
      ...tiers,
      [newKey]: {
        persons: nextCount,
        label: `Group Tier (${nextCount} People)`,
        tag: `Volume ~${defaultPct}% Off`,
        discountMode: 'PERCENT',
        discountValue: defaultPct,
        pricePerPerson: calcPrice,
        offerPrice: calcPrice,
        mrpPerPerson: Number(baseMrp) || Math.round(Number(basePrice) * 1.6),
        discountPercent: defaultPct
      }
    };
    onChange(updated);
  };

  const handleDeleteSlab = (key) => {
    if (sortedKeys.length <= 1) {
      alert("At least 1 individual slab (1 person) must be retained.");
      return;
    }
    const updated = { ...tiers };
    delete updated[key];
    onChange(updated);
  };

  const handleResetDefaultSlabs = () => {
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
              Configure flexible rates, custom person counts, and apply Fixed (₹) or Percentage (%) discounts off base price (₹{basePrice}).
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleAddCustomSlab}
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
            <Plus size={15} /> Add Custom Slab
          </button>

          <button
            type="button"
            onClick={handleResetDefaultSlabs}
            style={{
              padding: '0.5rem 0.85rem',
              backgroundColor: '#FFFFFF',
              color: '#475569',
              border: '1px solid #CBD5E1',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Sparkles size={14} color="#006B70" /> Reset Default (1, 2, 5, 10P)
          </button>
        </div>
      </div>

      {/* Dynamic Slabs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        {sortedKeys.map((key) => {
          const tier = tiers[key] || {};
          const personsCount = Number(tier.persons || key) || 1;
          const theme = getTheme(personsCount);
          const pPerPerson = Number(tier.pricePerPerson ?? tier.offerPrice ?? basePrice);
          const mrpPerPerson = Number(tier.mrpPerPerson ?? baseMrp ?? Math.round(pPerPerson * 1.6));
          const totalGroupPrice = pPerPerson * personsCount;
          const totalGroupMrp = mrpPerPerson * personsCount;
          const totalSavings = totalGroupMrp - totalGroupPrice;
          const savingsPct = totalGroupMrp > totalGroupPrice ? Math.round((totalSavings / totalGroupMrp) * 100) : 0;
          const currentMode = tier.discountMode || (personsCount === 1 ? 'DIRECT' : 'PERCENT');

          return (
            <div
              key={key}
              style={{
                backgroundColor: theme.bg,
                borderRadius: '16px',
                border: `2px solid ${theme.border}`,
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              <div>
                {/* Slab Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ 
                      fontSize: '0.72rem', 
                      backgroundColor: '#FFFFFF', 
                      color: theme.color, 
                      padding: '0.2rem 0.55rem', 
                      borderRadius: '6px', 
                      fontWeight: '900',
                      border: `1px solid ${theme.border}`
                    }}>
                      SLAB: {personsCount >= 10 ? `${personsCount}+ PEOPLE` : `${personsCount} ${personsCount === 1 ? 'PERSON' : 'PEOPLE'}`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ 
                      fontSize: '0.74rem', 
                      fontWeight: '800', 
                      color: '#059669', 
                      backgroundColor: '#DCFCE7', 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: '6px' 
                    }}>
                      {savingsPct}% OFF
                    </span>

                    {sortedKeys.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSlab(key)}
                        title="Delete Slab"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#EF4444',
                          cursor: 'pointer',
                          padding: '0.2rem',
                          borderRadius: '4px'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Person Count & Label Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '0.5rem', marginBottom: '0.65rem' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#475569', fontWeight: '800', display: 'block', marginBottom: '0.2rem' }}>Persons</label>
                    <input
                      type="number"
                      min={1}
                      value={personsCount}
                      onChange={(e) => updateTierField(key, 'persons', Number(e.target.value))}
                      style={{ width: '100%', padding: '0.45rem', fontSize: '0.82rem', fontWeight: '800', border: '1px solid #CBD5E1', borderRadius: '6px', backgroundColor: '#FFFFFF' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#475569', fontWeight: '800', display: 'block', marginBottom: '0.2rem' }}>Slab Name / Title</label>
                    <input
                      type="text"
                      value={tier.label || (personsCount === 1 ? 'Individual' : `${personsCount} People Group`)}
                      onChange={(e) => updateTierField(key, 'label', e.target.value)}
                      placeholder="e.g. Couple / Family Trio"
                      style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.82rem', fontWeight: '800', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '6px', backgroundColor: '#FFFFFF' }}
                    />
                  </div>
                </div>

                {/* Subtag / Promo Note */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700', display: 'block', marginBottom: '0.2rem' }}>Promo Subtag</label>
                  <input
                    type="text"
                    value={tier.tag || ''}
                    onChange={(e) => updateTierField(key, 'tag', e.target.value)}
                    placeholder="e.g. Family Duo ~15% Off / Corporate Bulk"
                    style={{ width: '100%', padding: '0.38rem 0.55rem', fontSize: '0.75rem', fontWeight: '700', color: theme.color, border: '1px solid #CBD5E1', borderRadius: '6px', backgroundColor: '#FFFFFF' }}
                  />
                </div>

                {/* Discount Mode Selector (Fixed vs Percentage vs Direct Price) */}
                <div style={{ backgroundColor: '#FFFFFF', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.72rem', color: '#475569', fontWeight: '800', display: 'block', marginBottom: '0.35rem' }}>
                    Pricing / Discount Strategy
                  </label>
                  <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.5rem' }}>
                    {[
                      { id: 'PERCENT', label: '% Discount', icon: Percent },
                      { id: 'FIXED', label: '₹ Flat Off', icon: Coins },
                      { id: 'DIRECT', label: 'Custom Price', icon: Tag }
                    ].map(m => (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => updateTierField(key, 'discountMode', m.id)}
                        style={{
                          flex: 1,
                          padding: '0.35rem 0.45rem',
                          borderRadius: '6px',
                          border: currentMode === m.id ? `1.5px solid ${theme.color}` : '1px solid #E2E8F0',
                          backgroundColor: currentMode === m.id ? theme.bg : '#F8FAFC',
                          color: currentMode === m.id ? theme.color : '#64748B',
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <m.icon size={12} />
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {/* Discount Value Input (when in PERCENT or FIXED mode) */}
                  {currentMode === 'PERCENT' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#475569', fontWeight: '700', marginBottom: '0.2rem' }}>
                        <span>Percentage Discount Off Base Rate (₹{basePrice})</span>
                        <span style={{ fontWeight: '900', color: theme.color }}>{tier.discountValue || 0}% Off</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="number"
                          min={0}
                          max={90}
                          value={tier.discountValue ?? 15}
                          onChange={(e) => updateTierField(key, 'discountValue', Number(e.target.value))}
                          style={{ width: '80px', padding: '0.4rem 0.5rem', border: `1.5px solid ${theme.color}`, borderRadius: '6px', fontWeight: '900', fontSize: '0.85rem', color: theme.color }}
                        />
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          → Yields ₹{Math.max(1, Math.round(basePrice * (1 - (tier.discountValue || 0) / 100)))} / person
                        </span>
                      </div>
                    </div>
                  )}

                  {currentMode === 'FIXED' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#475569', fontWeight: '700', marginBottom: '0.2rem' }}>
                        <span>Flat ₹ Discount Per Person (Off Base ₹{basePrice})</span>
                        <span style={{ fontWeight: '900', color: theme.color }}>-₹{tier.discountValue || 0}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="number"
                          min={0}
                          max={basePrice}
                          value={tier.discountValue ?? 50}
                          onChange={(e) => updateTierField(key, 'discountValue', Number(e.target.value))}
                          style={{ width: '90px', padding: '0.4rem 0.5rem', border: `1.5px solid ${theme.color}`, borderRadius: '6px', fontWeight: '900', fontSize: '0.85rem', color: theme.color }}
                        />
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          → Yields ₹{Math.max(1, basePrice - (tier.discountValue || 0))} / person
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Final Price Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: theme.color, fontWeight: '800', display: 'block', marginBottom: '0.2rem' }}>
                      Offer Price / Person (₹) *
                    </label>
                    <input
                      type="number"
                      value={pPerPerson}
                      onChange={(e) => updateTierField(key, 'pricePerPerson', e.target.value)}
                      min={1}
                      required
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.65rem',
                        border: `1.5px solid ${theme.color}`,
                        borderRadius: '8px',
                        fontWeight: '900',
                        fontSize: '0.95rem',
                        color: theme.color,
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
                      onChange={(e) => updateTierField(key, 'mrpPerPerson', e.target.value)}
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
                  <span>Calculated for {personsCount} {personsCount === 1 ? 'person' : 'people'}:</span>
                  <span style={{ textDecoration: 'line-through', color: '#94A3B8' }}>₹{totalGroupMrp}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: '800', color: '#0F172A' }}>Total Booking Cost:</span>
                  <span style={{ fontSize: '1.05rem', fontWeight: '900', color: theme.color }}>₹{totalGroupPrice}</span>
                </div>
                {totalSavings > 0 && (
                  <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.1rem' }}>
                    <TrendingDown size={12} /> Saves ₹{totalSavings} in bulk ({savingsPct}% Off)
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
