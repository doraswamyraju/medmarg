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
  FileText,
  Lock,
  Info
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

export default function CareSeekerUniversalItemSheet({
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
  const [activeCoveredTab, setActiveCoveredTab] = useState('ALL'); // 'ALL' | 'PROFILES' | 'TESTS'

  const catalog = propCatalog || getCatalogState();

  if (!item) return null;

  const isPackage = item.itemType === 'PACKAGE' || !!item.profiles || item.discountPercent > 50;
  const isProfile = item.itemType === 'PROFILE' || (!isPackage && (item.category === 'Diagnostic Profile' || (item.code && item.code.length <= 6 && !item.serialNo)));
  const isSingleTest = !isPackage && !isProfile;

  const startPricing = getStartingPrice(item);
  const labPricingList = getItemLabPricing(item);
  const tierPricing = getItemTierPricing(item);
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
      // Multiple person slabs are EXCLUSIVELY available with MedMarg
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
        maxWidth: '720px',
        width: '100%',
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

        {/* Sheet Scrollable Body */}
        <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
          
          {/* Quick Specifications Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '800' }}>SPECIMEN TUBE</div>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F172A', marginTop: '0.2rem' }}>
                🩸 {item.sampleType || (item.sampleTypes && item.sampleTypes.join(', ')) || 'SERUM (Gold SST)'}
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
                ⚡ {item.tatHours || 24} Hours (WhatsApp)
              </div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '800' }}>BIOMARKERS</div>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#006B70', marginTop: '0.2rem' }}>
                🔬 {totalBiomarkersCount} Tests & Params
              </div>
            </div>
          </div>

          {/* MULTI-PERSON VOLUME SLABS (MEDMARG EXCLUSIVE BENEFIT) */}
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
              <span style={{ 
                fontSize: '0.72rem', 
                backgroundColor: '#DCFCE7', 
                color: '#166534', 
                border: '1px solid #86EFAC',
                padding: '0.2rem 0.6rem', 
                borderRadius: '6px', 
                fontWeight: '900' 
              }}>
                ⚡ EXCLUSIVE MEDMARG FLEET BENEFIT
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '0.78rem', color: '#166534', lineHeight: 1.45 }}>
              Group & family volume tier slabs are serviced <strong>exclusively by MedMarg Home Phlebotomy</strong>. 
              Our certified phlebotomist collects samples for all members in a single scheduled doorstep visit with cold-chain telemetry.
            </p>

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
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 4px 12px rgba(0, 107, 112, 0.2)' : 'none'
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
              <div style={{ 
                backgroundColor: '#DCFCE7', 
                padding: '0.6rem 0.85rem', 
                borderRadius: '10px', 
                fontSize: '0.8rem', 
                color: '#166534', 
                fontWeight: '800', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                border: '1px solid #86EFAC'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <TrendingDown size={16} />
                  <span>Group Total: ₹{currentTierInfo.totalPrice} for {selectedPersonCount} individuals (₹{currentTierInfo.pricePerPerson}/person)</span>
                </div>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#006B70', color: '#FFF', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                  Selected: MedMarg Smart Pick
                </span>
              </div>
            )}
          </div>

          {/* MULTI-LAB PROCESSING NOTICE */}
          <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.86rem', fontWeight: '800', color: '#0F172A' }}>
                <Building2 size={16} color="#006B70" />
                <span>Multi-Laboratory Pricing & Availability</span>
              </div>
              {selectedPersonCount > 1 && (
                <span style={{ fontSize: '0.7rem', color: '#B91C1C', fontWeight: '800' }}>
                  *Third-party labs charge single-person rate
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', marginTop: '0.2rem' }}>
              {/* MedMarg Option */}
              <div 
                onClick={() => {
                  setSelectedLabProvider('medmarg_suggested');
                  savePreferredLab('medmarg_suggested');
                }}
                style={{
                  padding: '0.6rem 0.75rem',
                  borderRadius: '10px',
                  backgroundColor: selectedLabProvider === 'medmarg_suggested' || selectedPersonCount > 1 ? '#E0F2F1' : '#FFFFFF',
                  border: selectedLabProvider === 'medmarg_suggested' || selectedPersonCount > 1 ? '2px solid #006B70' : '1px solid #CBD5E1',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '900', color: '#006B70' }}>MedMarg Smart Pick</span>
                  <span style={{ fontSize: '0.68rem', backgroundColor: '#006B70', color: '#FFF', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '800' }}>BEST</span>
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>
                  ₹{selectedPersonCount > 1 ? currentTierInfo.totalPrice : (labPricingList[0]?.price || item.price)}
                  {selectedPersonCount > 1 && <span style={{ fontSize: '0.7rem', color: '#059669', marginLeft: '0.3rem' }}>(Volume Slabs Active)</span>}
                </div>
              </div>

              {/* Thyrocare Option */}
              <div 
                onClick={() => {
                  if (selectedPersonCount > 1) {
                    alert('Third-party reference laboratories (Thyrocare) do not support group volume discount slabs. Slabs are exclusive to MedMarg Phlebotomy. To switch, person count will be set to 1.');
                    setSelectedPersonCount(1);
                  }
                  setSelectedLabProvider('thyrocare');
                  savePreferredLab('thyrocare');
                }}
                style={{
                  padding: '0.6rem 0.75rem',
                  borderRadius: '10px',
                  backgroundColor: selectedLabProvider === 'thyrocare' && selectedPersonCount === 1 ? '#FEE2E2' : '#FFFFFF',
                  border: selectedLabProvider === 'thyrocare' && selectedPersonCount === 1 ? '2px solid #991B1B' : '1px solid #CBD5E1',
                  opacity: selectedPersonCount > 1 ? 0.7 : 1,
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '900', color: '#991B1B' }}>Thyrocare</span>
                  {selectedPersonCount > 1 && <span style={{ fontSize: '0.65rem', color: '#64748B' }}>No Slab</span>}
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>
                  ₹{(labPricingList[1]?.price || Math.round((item.price || 299) * 1.15)) * selectedPersonCount}
                </div>
              </div>

              {/* Dr. Lal PathLabs Option */}
              <div 
                onClick={() => {
                  if (selectedPersonCount > 1) {
                    alert('Third-party reference laboratories (Dr. Lal PathLabs) do not support group volume discount slabs. Slabs are exclusive to MedMarg Phlebotomy. To switch, person count will be set to 1.');
                    setSelectedPersonCount(1);
                  }
                  setSelectedLabProvider('lalpath');
                  savePreferredLab('lalpath');
                }}
                style={{
                  padding: '0.6rem 0.75rem',
                  borderRadius: '10px',
                  backgroundColor: selectedLabProvider === 'lalpath' && selectedPersonCount === 1 ? '#FEF3C7' : '#FFFFFF',
                  border: selectedLabProvider === 'lalpath' && selectedPersonCount === 1 ? '2px solid #D97706' : '1px solid #CBD5E1',
                  opacity: selectedPersonCount > 1 ? 0.7 : 1,
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '900', color: '#92400E' }}>Dr. Lal PathLabs</span>
                  {selectedPersonCount > 1 && <span style={{ fontSize: '0.65rem', color: '#64748B' }}>No Slab</span>}
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>
                  ₹{(labPricingList[2]?.price || Math.round((item.price || 299) * 1.30)) * selectedPersonCount}
                </div>
              </div>
            </div>
          </div>

          {/* ITEM DESCRIPTION */}
          {item.description && (
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.35rem' }}>
                Clinical Significance & Purpose
              </h4>
              <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                {item.description}
              </p>
            </div>
          )}

          {/* ========================================================================= */}
          {/* REQUIREMENT #3: TESTS & PROFILES COVERED UNDER THIS PACKAGE / PROFILE     */}
          {/* ========================================================================= */}
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
                <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '0.15rem' }}>
                  {isPackage 
                    ? `Explore all diagnostic profiles and standalone tests included in this health package.`
                    : isProfile 
                      ? `All single clinical biomarkers and assays analyzed in this diagnostic profile.`
                      : `Standard clinical biomarker test specifications.`}
                </div>
              </div>

              {/* In-Sheet Search */}
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

            {/* A. If PACKAGE: Show Profiles and Standalone Tests Tabs / Sections */}
            {isPackage && packageContents && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                
                {/* 1. Included Diagnostic Profiles Accordion */}
                {filteredProfiles.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '900', color: '#006B70', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FlaskConical size={15} />
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
                              overflow: 'hidden',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {/* Profile Header Bar */}
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
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <div style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '8px',
                                  backgroundColor: '#E0F2FE',
                                  color: '#0369A1',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.75rem',
                                  fontWeight: '900'
                                }}>
                                  {pIdx + 1}
                                </div>
                                <div>
                                  <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0F172A' }}>
                                    {prof.name}
                                  </div>
                                  <div style={{ fontSize: '0.72rem', color: '#64748B', display: 'flex', gap: '0.5rem', marginTop: '0.1rem' }}>
                                    <span>Code: {prof.code}</span>
                                    <span>•</span>
                                    <span>🩸 {prof.sampleType || 'SERUM'}</span>
                                    {prof.fasting === 'YES' && (
                                      <>
                                        <span>•</span>
                                        <span style={{ color: '#B45309', fontWeight: '700' }}>Fasting Required</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.74rem', backgroundColor: '#E2E8F0', color: '#334155', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: '800' }}>
                                  {testsList.length} Tests
                                </span>
                                {isExpanded ? <ChevronUp size={16} color="#006B70" /> : <ChevronDown size={16} color="#64748B" />}
                              </div>
                            </div>

                            {/* Expanded Tests in this Profile */}
                            {isExpanded && (
                              <div style={{ padding: '0.85rem 1rem', borderTop: '1px solid #E2E8F0', backgroundColor: '#FAFAFA' }}>
                                <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                  Individual Biomarker Tests inside {prof.name}:
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.4rem' }}>
                                  {testsList.map((t, tIdx) => (
                                    <div 
                                      key={tIdx}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '0.45rem',
                                        backgroundColor: '#FFFFFF',
                                        padding: '0.45rem 0.65rem',
                                        borderRadius: '8px',
                                        border: '1px solid #E2E8F0',
                                        fontSize: '0.78rem'
                                      }}
                                    >
                                      <CheckCircle2 size={13} color="#006B70" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                                      <div>
                                        <div style={{ fontWeight: '800', color: '#0F172A' }}>{t.name}</div>
                                        {t.description && (
                                          <div style={{ fontSize: '0.7rem', color: '#64748B', lineHeight: 1.3, marginTop: '0.1rem' }}>
                                            {t.description}
                                          </div>
                                        )}
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

                {/* 2. Included Standalone Biomarker Tests */}
                {filteredStandaloneTests.length > 0 && (
                  <div style={{ marginTop: '0.4rem' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: '900', color: '#006B70', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FlaskConical size={15} />
                      Standalone Biomarker Tests ({filteredStandaloneTests.length})
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '0.45rem' }}>
                      {filteredStandaloneTests.map((t, idx) => (
                        <div 
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.5rem',
                            backgroundColor: '#FFFFFF',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '10px',
                            border: '1px solid #E2E8F0',
                            fontSize: '0.8rem'
                          }}
                        >
                          <CheckCircle2 size={14} color="#059669" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                          <div>
                            <div style={{ fontWeight: '800', color: '#0F172A' }}>{t.name}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748B', display: 'flex', gap: '0.4rem', marginTop: '0.15rem' }}>
                              <span>🩸 {t.sampleType || 'SERUM'}</span>
                              {t.fasting === 'YES' && <span style={{ color: '#B45309' }}>• Fasting</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* B. If PROFILE: Show all single tests covered */}
            {isProfile && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.5rem' }}>
                  {filteredProfileSingleTests.map((t, idx) => (
                    <div 
                      key={idx}
                      style={{
                        backgroundColor: '#FFFFFF',
                        padding: '0.7rem 0.85rem',
                        borderRadius: '10px',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem' }}>
                        <CheckCircle2 size={15} color="#006B70" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                        <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#0F172A' }}>
                          {t.name}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', display: 'flex', gap: '0.45rem', paddingLeft: '1.4rem' }}>
                        <span>🩸 {t.sampleType || 'SERUM'}</span>
                        <span>•</span>
                        <span>{t.fasting === 'YES' ? '⏱ Fasting' : 'No Fasting'}</span>
                        {t.code && <span>• Code: {t.code}</span>}
                      </div>
                      {t.description && (
                        <div style={{ fontSize: '0.72rem', color: '#64748B', lineHeight: 1.35, paddingLeft: '1.4rem', marginTop: '0.1rem' }}>
                          {t.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* C. If INDIVIDUAL TEST: Show single test parameter spec */}
            {isSingleTest && (
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '0.85rem 1rem', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.35rem' }}>
                  Quantitative Laboratory Biomarker Parameter
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.45 }}>
                  This single test provides direct, calibrated photometric / chemiluminescent quantitative assay for <strong>{item.name}</strong>. Sample is cold-preserved and processed at authorized NABL diagnostic hub.
                </div>
              </div>
            )}

          </div>

          {/* Quality Assurance */}
          <div style={{ backgroundColor: '#F8FAFC', borderRadius: '14px', padding: '0.85rem 1rem', border: '1px solid #E2E8F0', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Award size={26} color="#006B70" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#0F172A' }}>
                Certified NABL / CAP Pathology Processing
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.1rem' }}>
                Verified by MD Pathologists. IoT cold-chain telemetry (`2°C - 8°C`) monitored live during sample transit.
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
            <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>
              {selectedPersonCount > 1 ? `Group Total for ${selectedPersonCount} People (MedMarg Fleet)` : 'Single Person Booking'}
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
              <div style={{ fontSize: '0.82rem', color: '#94A3B8', textDecoration: 'line-through' }}>
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
              boxShadow: '0 4px 14px rgba(0,107,112,0.25)',
              transition: 'all 0.15s ease'
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
