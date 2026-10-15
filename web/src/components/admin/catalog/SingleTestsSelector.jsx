import React, { useState, useMemo } from 'react';
import { 
  Search, 
  FlaskConical, 
  Plus, 
  Check, 
  X, 
  Sparkles, 
  Filter, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { calculateAggregatedSamples, calculateFastingRequirement } from '../../../data/catalogStore';

/**
 * SingleTestsSelector
 * Dedicated biomarker test picker for composing Diagnostic Profiles from Single Tests.
 * "profiles are combination of tests"
 */
export default function SingleTestsSelector({
  allTests = [],
  selectedTestCodes = [],
  onChange = () => {},
  onAutoCalculateProfile = null
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sampleFilter, setSampleFilter] = useState('ALL');
  const [fastingFilter, setFastingFilter] = useState('ALL');

  // Filter available tests
  const filteredTests = useMemo(() => {
    return (allTests || []).filter(t => {
      const q = (searchTerm || '').trim().toLowerCase();
      const matchSearch = !q || 
        (t.name && t.name.toLowerCase().includes(q)) || 
        (t.code && t.code.toLowerCase().includes(q)) ||
        (t.sampleType && t.sampleType.toLowerCase().includes(q));

      const matchSample = sampleFilter === 'ALL' || (t.sampleType && t.sampleType.toUpperCase().includes(sampleFilter));
      const matchFasting = fastingFilter === 'ALL' || t.fasting === fastingFilter;

      return matchSearch && matchSample && matchFasting;
    });
  }, [allTests, searchTerm, sampleFilter, fastingFilter]);

  // Map selected codes to full test objects for fast inspection
  const selectedTestsList = useMemo(() => {
    const set = new Set(selectedTestCodes);
    return (allTests || []).filter(t => set.has(t.code) || set.has(t.id));
  }, [allTests, selectedTestCodes]);

  // Aggregate clinical metrics
  const aggregatedSamples = useMemo(() => {
    const list = calculateAggregatedSamples([], selectedTestCodes, [], allTests);
    return list.join(', ');
  }, [selectedTestCodes, allTests]);

  const requiresFasting = useMemo(() => {
    return calculateFastingRequirement([], selectedTestCodes, [], allTests);
  }, [selectedTestCodes, allTests]);

  // Price calculations from sum of tests
  const individualTestsSum = useMemo(() => {
    return selectedTestsList.reduce((sum, t) => sum + (Number(t.price) || 299), 0);
  }, [selectedTestsList]);

  const individualMrpSum = useMemo(() => {
    return selectedTestsList.reduce((sum, t) => sum + (Number(t.mrp) || Math.round((Number(t.price) || 299) * 1.6)), 0);
  }, [selectedTestsList]);

  // Recommended profile bundle price (~25-30% off sum of tests)
  const suggestedProfilePrice = useMemo(() => {
    if (individualTestsSum === 0) return 899;
    const discounted = Math.round((individualTestsSum * 0.72) / 10) * 10 - 1; // e.g. 749
    return Math.max(299, discounted);
  }, [individualTestsSum]);

  const suggestedProfileMrp = useMemo(() => {
    if (individualMrpSum === 0) return 1499;
    return Math.round(individualMrpSum / 10) * 10;
  }, [individualMrpSum]);

  // Toggle selection of a test
  const toggleTest = (code) => {
    if (selectedTestCodes.includes(code)) {
      onChange(selectedTestCodes.filter(c => c !== code));
    } else {
      onChange([...selectedTestCodes, code]);
    }
  };

  const removeTest = (code) => {
    onChange(selectedTestCodes.filter(c => c !== code));
  };

  const handleApplySuggestedPricing = () => {
    if (onAutoCalculateProfile) {
      onAutoCalculateProfile({
        suggestedPrice: suggestedProfilePrice,
        suggestedMrp: suggestedProfileMrp,
        sampleType: aggregatedSamples,
        fasting: requiresFasting ? 'YES' : 'NO',
        testCount: selectedTestCodes.length
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. Selected Tests Basket & Aggregation Bar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '2px solid #006B70',
        padding: '1.25rem',
        boxShadow: '0 4px 16px rgba(0,107,112,0.06)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={20} color="#006B70" />
            <h4 style={{ fontSize: '1rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
              Included Single Tests ({selectedTestCodes.length} Biomarkers Selected)
            </h4>
          </div>

          {selectedTestCodes.length > 0 && onAutoCalculateProfile && (
            <button
              type="button"
              onClick={handleApplySuggestedPricing}
              style={{
                padding: '0.45rem 0.85rem',
                backgroundColor: '#006B70',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Sparkles size={14} /> Apply Bundle Rate (₹{suggestedProfilePrice}) & Samples
            </button>
          )}
        </div>

        {/* Aggregated Metrics Pills */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.85rem', fontSize: '0.78rem' }}>
          <span style={{ backgroundColor: '#E0F2FE', color: '#0369A1', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '800' }}>
            🩸 Derived Tubes: {aggregatedSamples || 'SERUM'}
          </span>
          <span style={{ backgroundColor: requiresFasting ? '#FEF3C7' : '#DCFCE7', color: requiresFasting ? '#B45309' : '#15803D', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '800' }}>
            ⏱ Fasting Requirement: {requiresFasting ? 'YES (8-10 Hours)' : 'NO'}
          </span>
          <span style={{ backgroundColor: '#F1F5F9', color: '#475569', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '800' }}>
            Sum of Tests: ₹{individualTestsSum}
          </span>
          <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '800' }}>
            Profile Bundle Offer: ₹{suggestedProfilePrice} (Save ~28%)
          </span>
        </div>

        {/* Chips Basket */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.45rem',
          maxHeight: '120px',
          overflowY: 'auto',
          backgroundColor: '#F8FAFC',
          borderRadius: '10px',
          padding: '0.65rem',
          border: '1px solid #E2E8F0'
        }}>
          {selectedTestsList.map(t => (
            <span
              key={t.code || t.id}
              style={{
                fontSize: '0.76rem',
                backgroundColor: '#006B70',
                color: '#FFFFFF',
                padding: '0.25rem 0.6rem',
                borderRadius: '8px',
                fontWeight: '800',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: '0 2px 6px rgba(0,107,112,0.2)'
              }}
            >
              🧪 {t.name} ({t.code})
              <button
                type="button"
                onClick={() => removeTest(t.code)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                ✕
              </button>
            </span>
          ))}

          {selectedTestsList.length === 0 && (
            <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontStyle: 'italic', padding: '0.4rem' }}>
              No single tests selected yet. Search and check tests below to compose this profile panel.
            </div>
          )}
        </div>
      </div>

      {/* 2. Search & Filters Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search from 913+ single biomarker tests by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.75rem 0.65rem 2.4rem',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #CBD5E1',
              borderRadius: '10px',
              fontSize: '0.85rem',
              color: '#0F172A',
              outline: 'none'
            }}
          />
        </div>

        {/* Sample Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#475569', fontWeight: '800' }}>
          <span>Tube:</span>
          {['ALL', 'SERUM', 'EDTA', 'FLUORIDE'].map(s => (
            <button
              type="button"
              key={s}
              onClick={() => setSampleFilter(s)}
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                border: sampleFilter === s ? 'none' : '1px solid #CBD5E1',
                backgroundColor: sampleFilter === s ? '#006B70' : '#FFFFFF',
                color: sampleFilter === s ? '#FFFFFF' : '#475569',
                fontWeight: '800',
                cursor: 'pointer',
                fontSize: '0.74rem'
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Fasting Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#475569', fontWeight: '800' }}>
          <span>Fasting:</span>
          {['ALL', 'YES', 'NO'].map(f => (
            <button
              type="button"
              key={f}
              onClick={() => setFastingFilter(f)}
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                border: fastingFilter === f ? 'none' : '1px solid #CBD5E1',
                backgroundColor: fastingFilter === f ? '#006B70' : '#FFFFFF',
                color: fastingFilter === f ? '#FFFFFF' : '#475569',
                fontWeight: '800',
                cursor: 'pointer',
                fontSize: '0.74rem'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Scrollable List of Available Tests */}
      <div style={{
        maxHeight: '340px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.45rem',
        border: '1.5px solid #E2E8F0',
        borderRadius: '14px',
        padding: '0.75rem',
        backgroundColor: '#FFFFFF'
      }}>
        {filteredTests.slice(0, 100).map(test => {
          const isSelected = selectedTestCodes.includes(test.code);

          return (
            <div
              key={test.code || test.id}
              onClick={() => toggleTest(test.code)}
              style={{
                padding: '0.65rem 0.95rem',
                borderRadius: '10px',
                backgroundColor: isSelected ? 'rgba(0,107,112,0.08)' : '#F8FAFC',
                border: isSelected ? '2px solid #006B70' : '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  backgroundColor: isSelected ? '#006B70' : '#FFFFFF',
                  border: isSelected ? 'none' : '1.5px solid #CBD5E1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: '0.75rem',
                  fontWeight: '900'
                }}>
                  {isSelected && <Check size={16} />}
                </div>

                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: isSelected ? '800' : '700', color: isSelected ? '#006B70' : '#0F172A' }}>
                    {test.name}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem', fontSize: '0.72rem' }}>
                    <span style={{ color: '#006B70', fontFamily: 'monospace', fontWeight: '800' }}>
                      {test.code}
                    </span>
                    <span style={{ color: '#64748B' }}>•</span>
                    <span style={{ color: '#64748B' }}>
                      🩸 {test.sampleType || 'SERUM'}
                    </span>
                    <span style={{ color: '#64748B' }}>•</span>
                    <span style={{ color: test.fasting === 'YES' ? '#B45309' : '#15803D', fontWeight: '700' }}>
                      Fasting: {test.fasting || 'NO'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.92rem', fontWeight: '900', color: '#0F172A' }}>
                  ₹{test.price || 299}
                </div>
                <div style={{ fontSize: '0.72rem', color: isSelected ? '#006B70' : '#64748B', fontWeight: '800', marginTop: '0.1rem' }}>
                  {isSelected ? '✓ Included' : '+ Click to Add'}
                </div>
              </div>
            </div>
          );
        })}

        {filteredTests.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontSize: '0.88rem' }}>
            No tests found matching "{searchTerm}". Try clearing your filters.
          </div>
        )}
      </div>

    </div>
  );
}
