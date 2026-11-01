import React, { useState, useMemo } from 'react';
import { 
  Search, 
  FlaskConical, 
  Layers, 
  Plus, 
  Check, 
  X, 
  AlertTriangle, 
  Sparkles, 
  Filter, 
  Info,
  DollarSign
} from 'lucide-react';

/**
 * SharedComponentSelector
 * Unified component picker for assembling Test Profiles and Health Packages.
 * Mode: 'TESTS_ONLY' (for Profiles) or 'TESTS_AND_PROFILES' (for Packages)
 */
export default function SharedComponentSelector({
  mode = 'TESTS_AND_PROFILES', // 'TESTS_ONLY' | 'TESTS_AND_PROFILES'
  availableTests = [],
  availableProfiles = [],
  selectedTestCodes = [],
  selectedProfileCodes = [],
  onChange = () => {},
  onContextualCreateTest = null,
  onContextualCreateProfile = null,
  onApplySuggestedPricing = null
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL' | 'TESTS' | 'PROFILES'
  const [fastingFilter, setFastingFilter] = useState('ALL');
  const [sampleFilter, setSampleFilter] = useState('ALL');

  // Filter available items
  const filteredItems = useMemo(() => {
    const q = (searchTerm || '').trim().toLowerCase();

    const matchesFilter = (item) => {
      const matchSearch = !q || 
        (item.name && item.name.toLowerCase().includes(q)) || 
        (item.code && item.code.toLowerCase().includes(q)) ||
        (item.sampleType && item.sampleType.toLowerCase().includes(q));

      const matchFasting = fastingFilter === 'ALL' || item.fasting === fastingFilter;
      const matchSample = sampleFilter === 'ALL' || (item.sampleType && item.sampleType.toUpperCase().includes(sampleFilter));

      return matchSearch && matchFasting && matchSample;
    };

    let items = [];
    if (mode === 'TESTS_ONLY' || typeFilter === 'TESTS' || typeFilter === 'ALL') {
      const tests = (availableTests || []).filter(matchesFilter).map(t => ({ ...t, _kind: 'TEST' }));
      items = items.concat(tests);
    }

    if (mode === 'TESTS_AND_PROFILES' && (typeFilter === 'PROFILES' || typeFilter === 'ALL')) {
      const profiles = (availableProfiles || []).filter(matchesFilter).map(p => ({ ...p, _kind: 'PROFILE' }));
      items = items.concat(profiles);
    }

    return items;
  }, [availableTests, availableProfiles, mode, searchTerm, typeFilter, fastingFilter, sampleFilter]);

  // Selected item objects
  const selectedTests = useMemo(() => {
    const set = new Set(selectedTestCodes);
    return (availableTests || []).filter(t => set.has(t.code) || set.has(t.id));
  }, [availableTests, selectedTestCodes]);

  const selectedProfiles = useMemo(() => {
    const set = new Set(selectedProfileCodes);
    return (availableProfiles || []).filter(p => set.has(p.code) || set.has(p.id));
  }, [availableProfiles, selectedProfileCodes]);

  // Overlap and Duplication Analysis
  const overlapAnalysis = useMemo(() => {
    const usage = new Map(); // testCode -> Array of sources

    selectedTestCodes.forEach(code => {
      const upper = (code || '').trim().toUpperCase();
      if (!usage.has(upper)) usage.set(upper, []);
      usage.get(upper).push('Single Test');
    });

    selectedProfiles.forEach(prof => {
      (prof.tests || []).forEach(testCode => {
        const upper = (testCode || '').trim().toUpperCase();
        if (!usage.has(upper)) usage.set(upper, []);
        usage.get(upper).push(`Profile: ${prof.name} (${prof.code})`);
      });
    });

    const duplicates = [];
    usage.forEach((sources, testCode) => {
      if (sources.length > 1) {
        const tObj = availableTests.find(t => t.code === testCode);
        duplicates.push({
          code: testCode,
          name: tObj ? tObj.name : testCode,
          sources
        });
      }
    });

    const allResolvedTestCodes = Array.from(usage.keys());
    return {
      hasOverlaps: duplicates.length > 0,
      duplicates,
      resolvedTestCodes: allResolvedTestCodes,
      totalResolvedCount: allResolvedTestCodes.length
    };
  }, [selectedTestCodes, selectedProfiles, availableTests]);

  // Price calculations
  const priceTotals = useMemo(() => {
    const testsPriceSum = selectedTests.reduce((sum, t) => sum + (Number(t.price) || 299), 0);
    const testsMrpSum = selectedTests.reduce((sum, t) => sum + (Number(t.mrp) || 499), 0);
    const profilesPriceSum = selectedProfiles.reduce((sum, p) => sum + (Number(p.price) || 899), 0);
    const profilesMrpSum = selectedProfiles.reduce((sum, p) => sum + (Number(p.mrp) || 1499), 0);

    const componentTotalOffer = testsPriceSum + profilesPriceSum;
    const componentTotalMrp = testsMrpSum + profilesMrpSum;

    // Recommended package/profile bundle price (~25-30% bundle discount)
    const suggestedPrice = componentTotalOffer > 0 ? Math.max(299, Math.round((componentTotalOffer * 0.75) / 10) * 10 - 1) : 0;
    const suggestedMrp = componentTotalMrp > 0 ? Math.round(componentTotalMrp / 10) * 10 : 0;

    return {
      testsPriceSum,
      testsMrpSum,
      profilesPriceSum,
      profilesMrpSum,
      componentTotalOffer,
      componentTotalMrp,
      suggestedPrice,
      suggestedMrp
    };
  }, [selectedTests, selectedProfiles]);

  // Aggregated sample and fasting
  const aggregatedSpecs = useMemo(() => {
    const sampleSet = new Set();
    [...selectedTests, ...selectedProfiles].forEach(item => {
      if (item.sampleType) {
        item.sampleType.split(',').forEach(s => sampleSet.add(s.trim().toUpperCase()));
      }
    });
    const samples = Array.from(sampleSet);
    const requiresFasting = [...selectedTests, ...selectedProfiles].some(item => item.fasting === 'YES');
    return {
      samples: samples.length > 0 ? samples.join(', ') : 'SERUM',
      fasting: requiresFasting ? 'YES' : 'NO'
    };
  }, [selectedTests, selectedProfiles]);

  const toggleTest = (code) => {
    const upper = code.trim().toUpperCase();
    let newTests = [...selectedTestCodes];
    if (newTests.includes(upper)) {
      newTests = newTests.filter(c => c !== upper);
    } else {
      newTests.push(upper);
    }
    onChange({ selectedTestCodes: newTests, selectedProfileCodes });
  };

  const toggleProfile = (code) => {
    const upper = code.trim().toUpperCase();
    let newProfiles = [...selectedProfileCodes];
    if (newProfiles.includes(upper)) {
      newProfiles = newProfiles.filter(c => c !== upper);
    } else {
      newProfiles.push(upper);
    }
    onChange({ selectedTestCodes, selectedProfileCodes: newProfiles });
  };

  const removeComponent = (kind, code) => {
    if (kind === 'TEST') {
      onChange({
        selectedTestCodes: selectedTestCodes.filter(c => c !== code),
        selectedProfileCodes
      });
    } else {
      onChange({
        selectedTestCodes,
        selectedProfileCodes: selectedProfileCodes.filter(c => c !== code)
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. Selected Basket & Overlap Banner */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '2px solid #006B70',
        padding: '1.25rem',
        boxShadow: '0 4px 16px rgba(0,107,112,0.06)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
              Included Components ({selectedTestCodes.length} Tests{mode === 'TESTS_AND_PROFILES' ? `, ${selectedProfileCodes.length} Profiles` : ''} · {overlapAnalysis.totalResolvedCount} Total Resolved Investigations)
            </h4>
            <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
              Sample Specimen: <strong>{aggregatedSpecs.samples}</strong> | Fasting: <strong>{aggregatedSpecs.fasting}</strong>
            </p>
          </div>

          {onApplySuggestedPricing && priceTotals.suggestedPrice > 0 && (
            <button
              type="button"
              onClick={() => onApplySuggestedPricing({
                price: priceTotals.suggestedPrice,
                mrp: priceTotals.suggestedMrp,
                sampleType: aggregatedSpecs.samples,
                fasting: aggregatedSpecs.fasting,
                resolvedCount: overlapAnalysis.totalResolvedCount
              })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#006B70',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <Sparkles size={14} /> Apply Bundle Pricing (₹{priceTotals.suggestedPrice} / ₹{priceTotals.suggestedMrp})
            </button>
          )}
        </div>

        {/* Overlap Warning Box if Duplicates Detected */}
        {overlapAnalysis.hasOverlaps && (
          <div style={{
            backgroundColor: '#FFFBEB',
            border: '1.5px solid #F59E0B',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            marginBottom: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} color="#D97706" />
              <strong style={{ fontSize: '0.85rem', color: '#B45309' }}>
                Overlap Detected: {overlapAnalysis.duplicates.length} tests appear across multiple selected components!
              </strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '1.5rem' }}>
              {overlapAnalysis.duplicates.map(dup => (
                <div key={dup.code} style={{ fontSize: '0.75rem', color: '#92400E' }}>
                  • <strong>{dup.name} ({dup.code})</strong> is included in: {dup.sources.join(' AND ')}
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.7rem', color: '#B45309', margin: 0, fontStyle: 'italic' }}>
              Review these components to ensure patients are not double-charged or confused by overlapping investigations.
            </p>
          </div>
        )}

        {/* Selected Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '160px', overflowY: 'auto' }}>
          {selectedProfiles.map(prof => (
            <span
              key={`prof_${prof.code}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#F3E8FF',
                border: '1.5px solid #A855F7',
                color: '#6B21A8',
                borderRadius: '8px',
                padding: '0.35rem 0.65rem',
                fontSize: '0.8rem',
                fontWeight: '700'
              }}
            >
              <Layers size={13} color="#7E22CE" />
              Profile: {prof.name} (₹{prof.price})
              <button
                type="button"
                onClick={() => removeComponent('PROFILE', prof.code)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#7E22CE' }}
              >
                <X size={14} />
              </button>
            </span>
          ))}

          {selectedTests.map(test => (
            <span
              key={`test_${test.code}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#E0F2FE',
                border: '1.5px solid #0284C7',
                color: '#0369A1',
                borderRadius: '8px',
                padding: '0.35rem 0.65rem',
                fontSize: '0.8rem',
                fontWeight: '700'
              }}
            >
              <FlaskConical size={13} color="#0284C7" />
              {test.name} (₹{test.price})
              <button
                type="button"
                onClick={() => removeComponent('TEST', test.code)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#0369A1' }}
              >
                <X size={14} />
              </button>
            </span>
          ))}

          {selectedTestCodes.length === 0 && selectedProfileCodes.length === 0 && (
            <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontStyle: 'italic', padding: '0.5rem 0' }}>
              No diagnostic tests or profiles selected yet. Search and select from the list below.
            </div>
          )}
        </div>

        {/* Pricing Summary Footer */}
        {(selectedTestCodes.length > 0 || selectedProfileCodes.length > 0) && (
          <div style={{
            marginTop: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px dashed #CBD5E1',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            color: '#475569'
          }}>
            <span>
              Component Sum: <strong>₹{priceTotals.componentTotalOffer}</strong> (MRP: ₹{priceTotals.componentTotalMrp})
            </span>
            <span style={{ color: '#006B70', fontWeight: '700' }}>
              Suggested Bundle: ₹{priceTotals.suggestedPrice}
            </span>
          </div>
        )}
      </div>

      {/* 2. Search, Filter & Quick Contextual Creation Toolbar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F8FAFC',
        padding: '0.75rem 1rem',
        borderRadius: '12px',
        border: '1px solid #E2E8F0'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by test/profile name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem 0.5rem 2rem',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '0.85rem'
            }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {mode === 'TESTS_AND_PROFILES' && (
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', fontWeight: '600' }}
            >
              <option value="ALL">All Types</option>
              <option value="TESTS">Single Tests Only</option>
              <option value="PROFILES">Profiles Only</option>
            </select>
          )}

          <select
            value={fastingFilter}
            onChange={(e) => setFastingFilter(e.target.value)}
            style={{ padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }}
          >
            <option value="ALL">All Fasting</option>
            <option value="YES">Fasting Required</option>
            <option value="NO">No Fasting</option>
          </select>
        </div>

        {/* Contextual Create Buttons (Draft-Safe!) */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {onContextualCreateTest && (
            <button
              type="button"
              onClick={onContextualCreateTest}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                backgroundColor: '#E0F2FE',
                color: '#0369A1',
                border: '1px solid #0284C7',
                borderRadius: '8px',
                padding: '0.45rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <Plus size={14} /> Create Test
            </button>
          )}

          {mode === 'TESTS_AND_PROFILES' && onContextualCreateProfile && (
            <button
              type="button"
              onClick={onContextualCreateProfile}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                backgroundColor: '#F3E8FF',
                color: '#6B21A8',
                border: '1px solid #A855F7',
                borderRadius: '8px',
                padding: '0.45rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <Plus size={14} /> Create Profile
            </button>
          )}
        </div>
      </div>

      {/* 3. Items Selection Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '0.75rem',
        maxHeight: '340px',
        overflowY: 'auto',
        padding: '0.25rem'
      }}>
        {filteredItems.map(item => {
          const isTest = item._kind === 'TEST';
          const isSelected = isTest 
            ? selectedTestCodes.includes(item.code) 
            : selectedProfileCodes.includes(item.code);

          return (
            <div
              key={`${item._kind}_${item.code}`}
              onClick={() => isTest ? toggleTest(item.code) : toggleProfile(item.code)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '0.85rem',
                borderRadius: '10px',
                border: isSelected 
                  ? (isTest ? '2px solid #0284C7' : '2px solid #A855F7')
                  : '1px solid #E2E8F0',
                backgroundColor: isSelected 
                  ? (isTest ? '#F0F9FF' : '#FAF5FF')
                  : '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative'
              }}
            >
              {/* Header: Kind Badge + Checkmark */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.7rem',
                  fontWeight: '800',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  backgroundColor: isTest ? '#E0F2FE' : '#F3E8FF',
                  color: isTest ? '#0369A1' : '#7E22CE'
                }}>
                  {isTest ? <FlaskConical size={11} /> : <Layers size={11} />}
                  {isTest ? 'SINGLE TEST' : `PROFILE (${(item.tests || []).length} Tests)`}
                </span>

                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '6px',
                  border: isSelected ? 'none' : '1.5px solid #CBD5E1',
                  backgroundColor: isSelected ? (isTest ? '#0284C7' : '#9333EA') : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {isSelected && <Check size={14} color="#FFFFFF" />}
                </div>
              </div>

              {/* Title & Code */}
              <div>
                <h5 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0F172A', margin: '0 0 0.2rem 0', lineHeight: 1.3 }}>
                  {item.name}
                </h5>
                <span style={{ fontSize: '0.7rem', color: '#64748B', fontFamily: 'monospace' }}>
                  CODE: {item.code}
                </span>
              </div>

              {/* Metadata & Price */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.6rem', paddingTop: '0.4rem', borderTop: '1px solid #F1F5F9', fontSize: '0.75rem' }}>
                <span style={{ color: '#64748B' }}>
                  {item.sampleType || 'SERUM'} · {item.fasting === 'YES' ? 'Fasting Req' : 'No Fasting'}
                </span>
                <span style={{ fontWeight: '800', color: '#006B70' }}>
                  ₹{item.price || 299}
                </span>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>
            No diagnostic items match your filter. Use the buttons above to create a new test or profile.
          </div>
        )}
      </div>

    </div>
  );
}

