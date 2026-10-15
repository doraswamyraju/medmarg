import React, { useState, useMemo } from 'react';
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
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Search,
  Layers,
  FileText
} from 'lucide-react';
import { 
  getStartingPrice, 
  getItemLabPricing, 
  getItemTierPricing, 
  getItemPriceForPeople,
  resolvePackageContents,
  resolveProfileTests,
  getCatalogState,
  savePreferredLab
} from '../../data/catalogStore';

export default function PatientUniversalItemSheet({
  item,
  catalog: propCatalog,
  selectedLabProvider = 'medmarg_suggested',
  setSelectedLabProvider = () => {},
  onClose,
  onAddToCart,
  isInCart
}) {
  const [selectedPersonCount, setSelectedPersonCount] = useState(1);
  const [searchCoveredQuery, setSearchCoveredQuery] = useState('');
  const [expandedProfileCode, setExpandedProfileCode] = useState(null);

  const catalog = propCatalog || getCatalogState();

  if (!item) return null;

  const isPackage = item.itemType === 'PACKAGE' || !!item.profiles || item.discountPercent > 50;
  const isProfile = item.itemType === 'PROFILE' || (!isPackage && (item.category === 'Diagnostic Profile' || (item.code && item.code.length <= 6 && !item.serialNo)));
  const isSingleTest = !isPackage && !isProfile;

  const startPricing = getStartingPrice(item);
  const labPricingList = getItemLabPricing(item);
  const currentTierInfo = getItemPriceForPeople(item, selectedPersonCount);

  // Resolved contents for Packages and Profiles
  const packageContents = useMemo(() => {
    if (!isPackage) return null;
    return resolvePackageContents(item, catalog);
  }, [item, isPackage, catalog]);

  const profileTests = useMemo(() => {
    if (!isProfile) return [];
    return resolveProfileTests(item, catalog.tests || []);
  }, [item, isProfile, catalog]);

  // Filtered lists based on search inside covered items
  const filteredProfiles = useMemo(() => {
    if (!packageContents?.profiles) return [];
    const q = searchCoveredQuery.trim().toLowerCase();
    if (!q) return packageContents.profiles;
    return packageContents.profiles.filter(p => 
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.code && p.code.toLowerCase().includes(q)) ||
      (p.testsInside && p.testsInside.some(t => t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q)))
    );
  }, [packageContents, searchCoveredQuery]);

  const filteredStandaloneTests = useMemo(() => {
    if (!packageContents?.standaloneTests) return [];
    const q = searchCoveredQuery.trim().toLowerCase();
    if (!q) return packageContents.standaloneTests;
    return packageContents.standaloneTests.filter(t => 
      (t.name && t.name.toLowerCase().includes(q)) ||
      (t.code && t.code.toLowerCase().includes(q))
    );
  }, [packageContents, searchCoveredQuery]);

  const filteredProfileSingleTests = useMemo(() => {
    if (!profileTests) return [];
    const q = searchCoveredQuery.trim().toLowerCase();
    if (!q) return profileTests;
    return profileTests.filter(t => 
      (t.name && t.name.toLowerCase().includes(q)) ||
      (t.code && t.code.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q))
    );
  }, [profileTests, searchCoveredQuery]);

  const totalBiomarkersCount = isPackage 
    ? (packageContents?.totalBiomarkersCount || item.testCount || 45)
    : isProfile 
      ? (profileTests.length || item.params || item.testCount || 8)
      : 1;

  // Handle Person Count Selection
  const handlePersonSelect = (count) => {
    setSelectedPersonCount(count);
    if (count > 1) {
      setSelectedLabProvider('medmarg_suggested');
      savePreferredLab('medmarg_suggested');
    }
  };

  const handleAddToCartClick = () => {
    const isMultiPerson = selectedPersonCount > 1;
    const finalLabProvider = isMultiPerson ? 'medmarg_suggested' : selectedLabProvider;

    if (isMultiPerson) {
      setSelectedLabProvider('medmarg_suggested');
      savePreferredLab('medmarg_suggested');
    }

    onAddToCart({
      ...item,
      personsCount: selectedPersonCount,
      labProvider: finalLabProvider,
      price: currentTierInfo.pricePerPerson,
      totalTierPrice: currentTierInfo.totalPrice,
      isMedmargSuggested: finalLabProvider === 'medmarg_suggested'
    });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(5px)',
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
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1.5px solid #E2E8F0'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
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
                {isPackage ? 'WELLNESS & HEALTH PACKAGE' : isProfile ? 'DIAGNOSTIC PROFILE' : 'STANDALONE TEST'}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748B', fontFamily: 'monospace', fontWeight: '800' }}>
                {item.code || item.id}
              </span>
              <span style={{ 
                fontSize: '0.72rem', 
                backgroundColor: '#ECFDF5', 
                color: '#059669', 
                padding: '0.15rem 0.45rem', 
                borderRadius: '6px', 
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <Sparkles size={11} /> {totalBiomarkersCount} Parameters Covered
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

        {/* Scrollable Content */}
        <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
          
          {/* Quick Specifications */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '800' }}>SPECIMEN TUBE</div>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F172A', marginTop: '0.2rem' }}>
                🩸 {item.sampleType || (item.sampleTypes && item.sampleTypes.join(', ')) || 'SERUM'}
              </div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: item.fasting === 'YES' ? '#FEF3C7' : '#F0FDF4', borderRadius: '12px', border: item.fasting === 'YES' ? '1px solid #FDE68A' : '1px solid #BBF7D0' }}>
              <div style={{ fontSize: '0.68rem', color: item.fasting === 'YES' ? '#B45309' : '#15803D', fontWeight: '800' }}>FASTING REQUIRED</div>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: item.fasting === 'YES' ? '#92400E' : '#166534', marginTop: '0.2rem' }}>
                ⏱ {item.fasting === 'YES' ? '10-12 Hrs Fasting' : 'No Fasting'}
              </div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '800' }}>REPORT DELIVERY</div>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F172A', marginTop: '0.2rem' }}>
                ⚡ {item.tatHours || 24} Hours
              </div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '800' }}>BIOMARKERS</div>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#006B70', marginTop: '0.2rem' }}>
                🔬 {totalBiomarkersCount} Parameters
              </div>
            </div>
          </div>

          {/* MULTI-PERSON VOLUME SLABS (MEDMARG EXCLUSIVE) */}
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
                <span style={{ fontSize: '0.92rem', fontWeight: '900', color: '#004D40' }}>
                  Booking for Multiple People? (Family or Staff)
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', backgroundColor: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: '900' }}>
                ⚡ EXCLUSIVE MEDMARG FLEET BENEFIT
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
                    onClick={() => handlePersonSelect(s.count)}
                    style={{
                      padding: '0.65rem 0.5rem',
                      borderRadius: '12px',
                      backgroundColor: isSelected ? '#006B70' : '#FFFFFF',
                      border: isSelected ? '2px solid #004D40' : '1.5px solid #CBD5E1',
                      color: isSelected ? '#FFFFFF' : '#0F172A',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontSize: '0.78rem', fontWeight: '800' }}>{s.label}</div>
                    <div style={{ fontSize: '0.98rem', fontWeight: '900', marginTop: '0.2rem' }}>
                      ₹{tierInfo.pricePerPerson}
                      <span style={{ fontSize: '0.65rem', fontWeight: '600', opacity: 0.85 }}>/p</span>
                    </div>
                    <div style={{ fontSize: '0.65rem', color: isSelected ? '#FEF3C7' : '#059669', fontWeight: '900', marginTop: '0.15rem' }}>
                      {tierInfo.discountPercent}% OFF
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedPersonCount > 1 && (
              <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#DCFCE7', padding: '0.55rem 0.85rem', borderRadius: '10px' }}>
                <TrendingDown size={15} /> Group Total: ₹{currentTierInfo.totalPrice} for {selectedPersonCount} individuals (₹{currentTierInfo.pricePerPerson}/person) - Serviced by MedMarg Fleet
              </div>
            )}
          </div>

          {/* MULTI-LAB PROCESSING NOTICE */}
          <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.86rem', fontWeight: '800', color: '#0F172A' }}>
              <Building2 size={16} color="#006B70" />
              <span>Multi-Laboratory Choice at Checkout</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.76rem', marginTop: '0.2rem' }}>
              <span style={{ backgroundColor: '#E0F2F1', color: '#006B70', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: '800' }}>
                MedMarg Smart Pick: ₹{selectedPersonCount > 1 ? currentTierInfo.totalPrice : (labPricingList[0]?.price || item.price)}
              </span>
              <span style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: '800' }}>
                Thyrocare: ₹{(labPricingList[1]?.price || Math.round((item.price || 299) * 1.15)) * selectedPersonCount}
              </span>
              <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: '800' }}>
                Dr. Lal PathLabs: ₹{(labPricingList[2]?.price || Math.round((item.price || 299) * 1.30)) * selectedPersonCount}
              </span>
            </div>
          </div>

          {/* TESTS & PROFILES COVERED EXPLORER */}
          <div style={{
            backgroundColor: '#F8FAFC',
            borderRadius: '16px',
            border: '1.5px solid #E2E8F0',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '900', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Layers size={18} color="#006B70" />
                  Tests & Profiles Covered ({totalBiomarkersCount} Parameters)
                </h4>
              </div>

              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={14} color="#64748B" style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search covered tests..."
                  value={searchCoveredQuery}
                  onChange={(e) => setSearchCoveredQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem 0.45rem 2rem',
                    fontSize: '0.78rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    outline: 'none',
                    backgroundColor: '#FFFFFF'
                  }}
                />
              </div>
            </div>

            {/* A. If PACKAGE */}
            {isPackage && packageContents && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {filteredProfiles.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '900', color: '#006B70', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Diagnostic Profiles Covered ({filteredProfiles.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {filteredProfiles.map((prof, pIdx) => {
                        const isExpanded = expandedProfileCode === (prof.code || pIdx);
                        const testsList = prof.testsInside || [];

                        return (
                          <div 
                            key={pIdx}
                            style={{
                              backgroundColor: '#FFFFFF',
                              borderRadius: '12px',
                              border: isExpanded ? '1.5px solid #006B70' : '1px solid #E2E8F0',
                              overflow: 'hidden'
                            }}
                          >
                            <div 
                              onClick={() => setExpandedProfileCode(isExpanded ? null : (prof.code || pIdx))}
                              style={{
                                padding: '0.75rem 1rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer',
                                backgroundColor: isExpanded ? '#F0FDF4' : '#FFFFFF'
                              }}
                            >
                              <div>
                                <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0F172A' }}>{prof.name}</div>
                                <div style={{ fontSize: '0.72rem', color: '#64748B', display: 'flex', gap: '0.5rem', marginTop: '0.1rem' }}>
                                  <span>Code: {prof.code}</span>
                                  <span>•</span>
                                  <span>🩸 {prof.sampleType || 'SERUM'}</span>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.74rem', backgroundColor: '#E2E8F0', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: '800' }}>
                                  {testsList.length} Tests
                                </span>
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </div>
                            </div>

                            {isExpanded && (
                              <div style={{ padding: '0.85rem 1rem', borderTop: '1px solid #E2E8F0', backgroundColor: '#FAFAFA' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.4rem' }}>
                                  {testsList.map((t, tIdx) => (
                                    <div key={tIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', backgroundColor: '#FFFFFF', padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.78rem' }}>
                                      <CheckCircle2 size={13} color="#006B70" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                                      <div>
                                        <div style={{ fontWeight: '800', color: '#0F172A' }}>{t.name}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {filteredStandaloneTests.length > 0 && (
                  <div style={{ marginTop: '0.4rem' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: '900', color: '#006B70', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Standalone Biomarker Tests ({filteredStandaloneTests.length})
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '0.45rem' }}>
                      {filteredStandaloneTests.map((t, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', backgroundColor: '#FFFFFF', padding: '0.6rem 0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.8rem' }}>
                          <CheckCircle2 size={14} color="#059669" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                          <div>
                            <div style={{ fontWeight: '800', color: '#0F172A' }}>{t.name}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748B' }}>🩸 {t.sampleType || 'SERUM'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* B. If PROFILE */}
            {isProfile && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.5rem' }}>
                {filteredProfileSingleTests.map((t, idx) => (
                  <div key={idx} style={{ backgroundColor: '#FFFFFF', padding: '0.7rem 0.85rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem' }}>
                      <CheckCircle2 size={15} color="#006B70" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                      <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#0F172A' }}>{t.name}</div>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', paddingLeft: '1.4rem', marginTop: '0.2rem' }}>
                      🩸 {t.sampleType || 'SERUM'} • {t.fasting === 'YES' ? '⏱ Fasting' : 'No Fasting'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* C. If SINGLE TEST */}
            {isSingleTest && (
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '0.85rem 1rem', border: '1px solid #E2E8F0', fontSize: '0.82rem', color: '#475569' }}>
                Single calibrated quantitative assay for <strong>{item.name}</strong>. Processed at authorized NABL diagnostic hub.
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderTop: '1px solid #E2E8F0',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>
              {selectedPersonCount > 1 ? `Total for ${selectedPersonCount} People (MedMarg)` : 'Single Person Booking'}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem' }}>
              <div style={{ fontSize: '1.55rem', fontWeight: '900', color: '#006B70' }}>
                ₹{currentTierInfo.totalPrice}
              </div>
              {selectedPersonCount > 1 && (
                <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: '700' }}>
                  (₹{currentTierInfo.pricePerPerson}/person)
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCartClick}
            style={{
              padding: '0.8rem 1.85rem',
              backgroundColor: isInCart ? '#059669' : '#006B70',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '900',
              fontSize: '0.94rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(0,107,112,0.25)'
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
