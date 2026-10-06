import React, { useState } from 'react';
import { 
  FlaskConical, 
  Layers, 
  Package, 
  FileSpreadsheet, 
  PlusCircle, 
  Plus, 
  Search, 
  Edit3, 
  RefreshCw,
  Check,
  Zap,
  DollarSign,
  Building2,
  Tag,
  Sliders,
  Eye,
  CheckCircle2,
  Award,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { 
  calculateAggregatedSamples, 
  calculateFastingRequirement,
  getItemLabPricing,
  getDefaultLabPricing,
  DEFAULT_LAB_PROVIDERS
} from '../../data/catalogStore';

export default function CatalogManagementTab({ 
  catalog, 
  setCatalog, 
  saveCatalogState,
  triggerGoogleSheetsSync, 
  isSyncingSheets,
  syncLogs
}) {
  const [testsSubTab, setTestsSubTab] = useState('LAB_PRICING'); // 'LAB_PRICING' | 'TESTS' | 'PROFILES' | 'PACKAGES' | 'SYNC_HUB'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFasting, setFilterFasting] = useState('ALL');
  const [filterSample, setFilterSample] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50); // 50 | 100 | 250 | 500 | 'ALL'

  // Multi-Lab Pricing State
  const [labPricingFilterType, setLabPricingFilterType] = useState('ALL'); // 'ALL' | 'TESTS' | 'PROFILES' | 'PACKAGES'
  const [selectedItemForLabPricing, setSelectedItemForLabPricing] = useState(null);
  const [showLabPricingModal, setShowLabPricingModal] = useState(false);
  const [showCareSeekerPreviewModal, setShowCareSeekerPreviewModal] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [globalSuggestedLab, setGlobalSuggestedLab] = useState('Central Partner Hub (Tirupati/Regional)');
  const [labPricingForm, setLabPricingForm] = useState([]);
  const [saveToast, setSaveToast] = useState(null);


  // Filtered lists (defined before pagination calculation)
  const filteredTests = (catalog?.tests || []).filter(t => {
    const q = (searchTerm || '').toLowerCase();
    const matchQuery = !q || (t.name && t.name.toLowerCase().includes(q)) || (t.code && t.code.toLowerCase().includes(q));
    const matchFasting = filterFasting === 'ALL' || t.fasting === filterFasting;
    const matchSample = filterSample === 'ALL' || (t.sampleType && t.sampleType.includes(filterSample));
    return matchQuery && matchFasting && matchSample;
  });

  const filteredProfiles = (catalog?.profiles || []).filter(p => {
    const q = (searchTerm || '').toLowerCase();
    const matchQuery = !q || (p.name && p.name.toLowerCase().includes(q)) || (p.code && p.code.toLowerCase().includes(q));
    const matchFasting = filterFasting === 'ALL' || p.fasting === filterFasting;
    return matchQuery && matchFasting;
  });

  // Calculate paginated slice of tests
  const totalDisplayTests = filteredTests.length;
  const effectivePageSize = pageSize === 'ALL' ? totalDisplayTests : Number(pageSize);
  const totalPages = Math.ceil(totalDisplayTests / (effectivePageSize || 1));
  const startIndex = pageSize === 'ALL' ? 0 : (currentPage - 1) * effectivePageSize;
  const paginatedTests = filteredTests.slice(startIndex, startIndex + effectivePageSize);

  // Modals
  const [showCreateTestModal, setShowCreateTestModal] = useState(false);
  const [showCreateProfileModal, setShowCreateProfileModal] = useState(false);
  const [showPackageBuilderModal, setShowPackageBuilderModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Forms
  const [testForm, setTestForm] = useState({
    code: '',
    name: '',
    sampleType: 'SERUM',
    fasting: 'NO',
    mrp: 499,
    price: 299,
    tatHours: 24,
    description: ''
  });

  const [profileForm, setProfileForm] = useState({
    code: '',
    name: '',
    sampleType: 'SERUM',
    fasting: 'NO',
    mrp: 1499,
    price: 899,
    tatHours: 24,
    description: ''
  });

  const [packageBuilderForm, setPackageBuilderForm] = useState({
    name: '',
    code: '',
    tagline: 'Comprehensive Health & Biomarker Screening',
    category: 'Full Body Wellness',
    mrp: 2999,
    price: 1299,
    selectedProfiles: ['APASTS', 'BEAP'],
    selectedTests: ['AHGLU', 'VITDC', 'SGPT'],
    tatHours: 24,
    description: ''
  });
  const [builderSearch, setBuilderSearch] = useState('');

  // Handlers
  const handleSaveTest = async (e) => {
    e.preventDefault();
    const newTest = {
      id: editingItem ? editingItem.id : `TEST_${(catalog.tests?.length || 0) + 1}`,
      serialNo: editingItem ? editingItem.serialNo : (catalog.tests?.length || 0) + 1,
      code: testForm.code.trim().toUpperCase(),
      name: testForm.name.trim(),
      sampleType: testForm.sampleType.trim().toUpperCase(),
      fasting: testForm.fasting.trim().toUpperCase(),
      category: 'Individual Test',
      mrp: Number(testForm.mrp) || 499,
      price: Number(testForm.price) || 299,
      tatHours: Number(testForm.tatHours) || 24,
      description: testForm.description || `Clinical laboratory test for ${testForm.name}.`,
      active: true
    };

    let updatedTests = [...(catalog.tests || [])];
    if (editingItem) {
      updatedTests = updatedTests.map(t => t.id === editingItem.id ? newTest : t);
    } else {
      updatedTests.unshift(newTest);
    }

    const updatedCatalog = { ...catalog, tests: updatedTests };
    setCatalog(updatedCatalog);
    saveCatalogState(updatedCatalog);
    setShowCreateTestModal(false);
    setEditingItem(null);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const newProfile = {
      id: editingItem ? editingItem.id : `PROF_${(catalog.profiles?.length || 0) + 1}`,
      serialNo: editingItem ? editingItem.serialNo : (catalog.profiles?.length || 0) + 1,
      code: profileForm.code.trim().toUpperCase(),
      name: profileForm.name.trim(),
      sampleType: profileForm.sampleType.trim().toUpperCase(),
      fasting: profileForm.fasting.trim().toUpperCase(),
      category: 'Diagnostic Profile',
      mrp: Number(profileForm.mrp) || 1499,
      price: Number(profileForm.price) || 899,
      tatHours: Number(profileForm.tatHours) || 24,
      description: profileForm.description || `Diagnostic profile panel for ${profileForm.name}.`,
      active: true
    };

    let updatedProfiles = [...(catalog.profiles || [])];
    if (editingItem) {
      updatedProfiles = updatedProfiles.map(p => p.id === editingItem.id ? newProfile : p);
    } else {
      updatedProfiles.unshift(newProfile);
    }

    const updatedCatalog = { ...catalog, profiles: updatedProfiles };
    setCatalog(updatedCatalog);
    saveCatalogState(updatedCatalog);
    setShowCreateProfileModal(false);
    setEditingItem(null);
  };

  const handleSavePackage = (e) => {
    e.preventDefault();
    const sampleTypes = calculateAggregatedSamples(
      packageBuilderForm.selectedProfiles,
      packageBuilderForm.selectedTests,
      catalog.profiles,
      catalog.tests
    );

    const requiresFasting = calculateFastingRequirement(
      packageBuilderForm.selectedProfiles,
      packageBuilderForm.selectedTests,
      catalog.profiles,
      catalog.tests
    );

    const newPkg = {
      id: `PKG_${Date.now()}`,
      name: packageBuilderForm.name.trim(),
      code: (packageBuilderForm.code || `MM_PKG_${Date.now().toString().slice(-4)}`).toUpperCase(),
      tagline: packageBuilderForm.tagline,
      category: packageBuilderForm.category,
      mrp: Number(packageBuilderForm.mrp) || Number(packageBuilderForm.price) * 2,
      price: Number(packageBuilderForm.price),
      discountPercent: Math.round(((Number(packageBuilderForm.mrp) - Number(packageBuilderForm.price)) / Number(packageBuilderForm.mrp)) * 100) || 50,
      fasting: requiresFasting ? 'YES' : 'NO',
      fastingNote: requiresFasting ? '8-10 hours overnight fasting recommended' : 'No fasting required',
      sampleTypes,
      tatHours: Number(packageBuilderForm.tatHours) || 24,
      popular: true,
      profiles: packageBuilderForm.selectedProfiles,
      tests: packageBuilderForm.selectedTests,
      testCount: packageBuilderForm.selectedProfiles.length * 8 + packageBuilderForm.selectedTests.length,
      description: packageBuilderForm.description || `Custom package composed of ${packageBuilderForm.selectedProfiles.length} profiles and ${packageBuilderForm.selectedTests.length} tests.`
    };

    const updatedCatalog = {
      ...catalog,
      packages: [newPkg, ...(catalog.packages || [])]
    };
    setCatalog(updatedCatalog);
    saveCatalogState(updatedCatalog);
    setShowPackageBuilderModal(false);
  };

  // Handlers for Multi-Lab Pricing
  const handleOpenLabPricingModal = (item) => {
    setSelectedItemForLabPricing(item);
    const existing = getItemLabPricing(item);
    setLabPricingForm(JSON.parse(JSON.stringify(existing)));
    setShowLabPricingModal(true);
  };

  const handleOpenPreview = (item) => {
    setPreviewItem(item);
    setShowCareSeekerPreviewModal(true);
  };

  const handleSaveLabPricing = (e) => {
    if (e) e.preventDefault();
    if (!selectedItemForLabPricing) return;

    const itemId = selectedItemForLabPricing.id || selectedItemForLabPricing.code;
    const isPkg = selectedItemForLabPricing.itemType === 'PACKAGE' || selectedItemForLabPricing.profiles;
    const isProf = selectedItemForLabPricing.itemType === 'PROFILE' || (!selectedItemForLabPricing.serialNo && selectedItemForLabPricing.code?.length <= 6);

    let updatedCatalog = { ...catalog };
    const medmargOpt = labPricingForm.find(l => l.isMedmargSuggested) || labPricingForm[0];

    if (isPkg) {
      updatedCatalog.packages = (catalog.packages || []).map(p => 
        (p.id === itemId || p.code === itemId) ? { 
          ...p, 
          labPricing: labPricingForm, 
          price: medmargOpt?.price || p.price, 
          mrp: medmargOpt?.mrp || p.mrp 
        } : p
      );
    } else if (isProf) {
      updatedCatalog.profiles = (catalog.profiles || []).map(p => 
        (p.id === itemId || p.code === itemId) ? { 
          ...p, 
          labPricing: labPricingForm, 
          price: medmargOpt?.price || p.price, 
          mrp: medmargOpt?.mrp || p.mrp 
        } : p
      );
    } else {
      updatedCatalog.tests = (catalog.tests || []).map(t => 
        (t.id === itemId || t.code === itemId) ? { 
          ...t, 
          labPricing: labPricingForm, 
          price: medmargOpt?.price || t.price, 
          mrp: medmargOpt?.mrp || t.mrp 
        } : t
      );
    }

    setCatalog(updatedCatalog);
    saveCatalogState(updatedCatalog);
    setShowLabPricingModal(false);
    setSelectedItemForLabPricing(null);
    setSaveToast(`Pricing for ${selectedItemForLabPricing.name || selectedItemForLabPricing.code} updated across all 3 labs!`);
    setTimeout(() => setSaveToast(null), 4000);
  };

  const handleApplyGlobalSuggestedLab = () => {
    if (!globalSuggestedLab.trim()) return;
    const updateList = (list) => (list || []).map(item => {
      const currentPricing = getItemLabPricing(item);
      const updatedPricing = currentPricing.map(l => {
        if (l.isMedmargSuggested) {
          return { ...l, suggestedLabName: globalSuggestedLab.trim() };
        }
        return l;
      });
      return { ...item, labPricing: updatedPricing, suggestedLab: globalSuggestedLab.trim() };
    });

    const updatedCatalog = {
      ...catalog,
      tests: updateList(catalog.tests),
      profiles: updateList(catalog.profiles),
      packages: updateList(catalog.packages)
    };

    setCatalog(updatedCatalog);
    saveCatalogState(updatedCatalog);
    setSaveToast(`Updated MedMarg Suggested Lab partner to "${globalSuggestedLab}" across all items!`);
    setTimeout(() => setSaveToast(null), 4000);
  };

  // Aggregate items for Multi-Lab pricing matrix view
  const allLabItems = [
    ...(catalog.packages || []).map(p => ({ ...p, itemType: 'PACKAGE' })),
    ...(catalog.profiles || []).map(p => ({ ...p, itemType: 'PROFILE' })),
    ...(catalog.tests || []).map(t => ({ ...t, itemType: 'TEST' }))
  ].filter(item => {
    if (labPricingFilterType === 'PACKAGES' && item.itemType !== 'PACKAGE') return false;
    if (labPricingFilterType === 'PROFILES' && item.itemType !== 'PROFILE') return false;
    if (labPricingFilterType === 'TESTS' && item.itemType !== 'TEST') return false;
    const q = (searchTerm || '').toLowerCase();
    return !q || (item.name && item.name.toLowerCase().includes(q)) || (item.code && item.code.toLowerCase().includes(q));
  });

  const totalLabItems = allLabItems.length;
  const effectiveLabPageSize = pageSize === 'ALL' ? totalLabItems : Number(pageSize);
  const totalLabPages = Math.ceil(totalLabItems / (effectiveLabPageSize || 1));
  const startLabIndex = pageSize === 'ALL' ? 0 : (currentPage - 1) * effectiveLabPageSize;
  const paginatedLabItems = allLabItems.slice(startLabIndex, startLabIndex + effectiveLabPageSize);

  return (
    <div>
      {/* Save Notification Toast */}
      {saveToast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, backgroundColor: '#059669', color: '#FFF', padding: '0.85rem 1.4rem', borderRadius: '12px', fontWeight: '800', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem', animation: 'fadeIn 0.2s ease-out' }}>
          <CheckCircle2 size={20} />
          <span>{saveToast}</span>
        </div>
      )}

      {/* KPI Stats Overview Header Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1.5px solid #006B70', padding: '1.25rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.78rem', color: '#006B70', fontWeight: '800', letterSpacing: '0.05em' }}>3-LAB PRICING SYSTEM</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>
            Active (3 Providers)
          </div>
          <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '700', marginTop: '0.2rem' }}>
            MedMarg • Thyrocare • Lalpath Labs
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.25rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.78rem', color: '#006B70', fontWeight: '800', letterSpacing: '0.05em' }}>SINGLE BIOMARKER TESTS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>
            {catalog.tests?.length || 913} <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: '700' }}>Live</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>With 3-Way Lab Rates</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.25rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.78rem', color: '#D97706', fontWeight: '800', letterSpacing: '0.05em' }}>DIAGNOSTIC PROFILES</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>
            {catalog.profiles?.length || 87} <span style={{ fontSize: '0.85rem', color: '#D97706', fontWeight: '700' }}>Active</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>Multi-parameter Panels</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.25rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.78rem', color: '#7E22CE', fontWeight: '800', letterSpacing: '0.05em' }}>HEALTH PACKAGES</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>
            {catalog.packages?.length || 4} <span style={{ fontSize: '0.85rem', color: '#7E22CE', fontWeight: '700' }}>Promoted</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>Aggregated Biomarker Scans</div>
        </div>
      </div>

      {/* Subtabs Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.85rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { key: 'LAB_PRICING', label: '3-Lab Pricing & Offers Desk', icon: DollarSign, count: (catalog.tests?.length || 0) + (catalog.profiles?.length || 0) + (catalog.packages?.length || 0) },
            { key: 'TESTS', label: 'Single Tests Master', icon: FlaskConical, count: catalog.tests?.length || 913 },
            { key: 'PROFILES', label: 'Diagnostic Profiles', icon: Layers, count: catalog.profiles?.length || 87 },
            { key: 'PACKAGES', label: 'Health Packages', icon: Package, count: catalog.packages?.length || 4 },
            { key: 'SYNC_HUB', label: 'Google Sheets Two-Way Sync', icon: FileSpreadsheet }
          ].map(st => {
            const isSel = testsSubTab === st.key;
            const IconC = st.icon;
            return (
              <button
                key={st.key}
                onClick={() => { setTestsSubTab(st.key); setCurrentPage(1); }}
                style={{
                  padding: '0.6rem 1.1rem',
                  borderRadius: '10px',
                  border: isSel ? 'none' : '1px solid #CBD5E1',
                  backgroundColor: isSel ? '#006B70' : '#FFFFFF',
                  color: isSel ? '#FFF' : '#475569',
                  fontWeight: '800',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: isSel ? '0 4px 12px rgba(0,107,112,0.2)' : 'none'
                }}
              >
                <IconC size={16} color={isSel ? '#FBBF24' : '#64748B'} />
                {st.label} {st.count !== undefined ? `(${st.count})` : ''}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          {testsSubTab === 'TESTS' && (
            <button 
              onClick={() => { setEditingItem(null); setTestForm({ code: '', name: '', sampleType: 'SERUM', fasting: 'NO', mrp: 499, price: 299, tatHours: 24, description: '' }); setShowCreateTestModal(true); }}
              style={{ padding: '0.6rem 1.2rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(0,107,112,0.2)' }}
            >
              <PlusCircle size={16} /> Add Test to Master
            </button>
          )}
          {testsSubTab === 'PROFILES' && (
            <button 
              onClick={() => { setEditingItem(null); setProfileForm({ code: '', name: '', sampleType: 'SERUM', fasting: 'NO', mrp: 1499, price: 899, tatHours: 24, description: '' }); setShowCreateProfileModal(true); }}
              style={{ padding: '0.6rem 1.2rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(0,107,112,0.2)' }}
            >
              <PlusCircle size={16} /> Add Profile to Master
            </button>
          )}
          {testsSubTab === 'PACKAGES' && (
            <button 
              onClick={() => setShowPackageBuilderModal(true)}
              style={{ padding: '0.6rem 1.2rem', backgroundColor: '#D97706', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(217,119,6,0.2)' }}
            >
              <Plus size={16} /> Visual Package Builder
            </button>
          )}
        </div>
      </div>

      {/* 3-LAB PRICING & OFFERS DESK (MEDMARG SUGGESTED, THYROCARE, DR. LAL PATHLABS) */}
      {testsSubTab === 'LAB_PRICING' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Hub Configuration & Multi-Lab Global Banner */}
          <div style={{ backgroundColor: '#004D40', color: '#FFF', borderRadius: '18px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem', boxShadow: '0 8px 24px rgba(0,77,64,0.18)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{ backgroundColor: '#FBBF24', color: '#78350F', fontSize: '0.72rem', fontWeight: '900', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                  MULTI-LAB PRICING ENGINE
                </span>
                <span style={{ fontSize: '0.78rem', color: '#80CBC4', fontWeight: '700' }}>
                  Transparent 3-Tier Provider Pricing
                </span>
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '900', margin: 0 }}>
                Manage Rates for MedMarg Suggested, Thyrocare & Lalpath Labs
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#B2DFDB', margin: '0.3rem 0 0 0', maxWidth: '650px' }}>
                Care seekers see <strong>MedMarg (Big)</strong> with the suggested partner lab (Small) as the primary smart recommendation, with direct 1-tap options to choose <strong>Thyrocare</strong> or <strong>Dr. Lal PathLabs</strong>.
              </p>
            </div>

            {/* Global Suggested Lab Partner Quick Setter */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.2)', minWidth: '320px' }}>
              <div style={{ fontSize: '0.74rem', color: '#FBBF24', fontWeight: '800', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                🏢 Global Suggested Lab Partner Name
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={globalSuggestedLab}
                  onChange={(e) => setGlobalSuggestedLab(e.target.value)}
                  placeholder="e.g. Central Partner Hub (Tirupati)"
                  style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.3)', backgroundColor: 'rgba(0,0,0,0.25)', color: '#FFF', fontSize: '0.82rem', fontWeight: '700', outline: 'none' }}
                />
                <button
                  type="button"
                  onClick={handleApplyGlobalSuggestedLab}
                  style={{ padding: '0.5rem 0.85rem', backgroundColor: '#FBBF24', color: '#78350F', border: 'none', borderRadius: '8px', fontWeight: '900', fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  Apply All
                </button>
              </div>
            </div>
          </div>

          {/* Search, Filter Category & Page Controls Header */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            
            {/* Type Filters */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { key: 'ALL', label: 'All Catalog Items', count: (catalog.tests?.length || 0) + (catalog.profiles?.length || 0) + (catalog.packages?.length || 0) },
                { key: 'TESTS', label: 'Single Tests', count: catalog.tests?.length || 913 },
                { key: 'PROFILES', label: 'Profiles', count: catalog.profiles?.length || 87 },
                { key: 'PACKAGES', label: 'Packages', count: catalog.packages?.length || 4 }
              ].map(ft => (
                <button
                  key={ft.key}
                  onClick={() => { setLabPricingFilterType(ft.key); setCurrentPage(1); }}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: labPricingFilterType === ft.key ? '#006B70' : '#F1F5F9',
                    color: labPricingFilterType === ft.key ? '#FFF' : '#475569',
                    fontSize: '0.82rem',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  {ft.label} ({ft.count})
                </button>
              ))}
            </div>

            {/* Search Input & Pagination */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end', minWidth: '300px' }}>
              <div style={{ position: 'relative', minWidth: '240px' }}>
                <Search size={16} color="#64748B" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                <input
                  type="text"
                  placeholder="Search item to manage lab rates..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.2rem', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.84rem', color: '#0F172A', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#475569', fontWeight: '700' }}>
                <span>Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(e.target.value); setCurrentPage(1); }}
                  style={{ padding: '0.45rem 0.6rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontWeight: '800', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={250}>250</option>
                  <option value="ALL">All ({totalLabItems})</option>
                </select>
              </div>

              {pageSize !== 'ALL' && totalLabPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    style={{ padding: '0.4rem 0.65rem', backgroundColor: currentPage === 1 ? '#F1F5F9' : '#006B70', color: currentPage === 1 ? '#94A3B8' : '#FFF', border: 'none', borderRadius: '6px', fontWeight: '800', fontSize: '0.78rem', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    ←
                  </button>
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0F172A' }}>
                    {currentPage} / {totalLabPages}
                  </span>
                  <button
                    disabled={currentPage >= totalLabPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalLabPages, prev + 1))}
                    style={{ padding: '0.4rem 0.65rem', backgroundColor: currentPage >= totalLabPages ? '#F1F5F9' : '#006B70', color: currentPage >= totalLabPages ? '#94A3B8' : '#FFF', border: 'none', borderRadius: '6px', fontWeight: '800', fontSize: '0.78rem', cursor: currentPage >= totalLabPages ? 'not-allowed' : 'pointer' }}
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 3-Lab Multi-Provider Pricing Matrix Table */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1.5px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 18px rgba(0,0,0,0.03)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '1rem 1.25rem', width: '28%' }}>Item & Specifications</th>
                  <th style={{ padding: '1rem 1.25rem', width: '24%', backgroundColor: 'rgba(0, 107, 112, 0.06)', borderLeft: '2px solid #006B70' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: '900', color: '#006B70' }}>1. MEDMARG</span>
                      <span style={{ fontSize: '0.68rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: '900' }}>SUGGESTED LAB</span>
                    </div>
                  </th>
                  <th style={{ padding: '1rem 1.25rem', width: '20%', borderLeft: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: '900', color: '#B91C1C' }}>2. THYROCARE</span>
                      <span style={{ fontSize: '0.68rem', backgroundColor: '#FEE2E2', color: '#991B1B', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: '800' }}>DIRECT</span>
                    </div>
                  </th>
                  <th style={{ padding: '1rem 1.25rem', width: '20%', borderLeft: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: '900', color: '#D97706' }}>3. DR. LAL PATHLABS</span>
                      <span style={{ fontSize: '0.68rem', backgroundColor: '#FEF3C7', color: '#92400E', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: '800' }}>NABL REF</span>
                    </div>
                  </th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'center', width: '8%' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLabItems.map((item, idx) => {
                  const pricing = getItemLabPricing(item);
                  const medmargLab = pricing.find(l => l.isMedmargSuggested) || pricing[0];
                  const thyrocareLab = pricing.find(l => l.labId === 'thyrocare') || pricing[1];
                  const lalpathLab = pricing.find(l => l.labId === 'lalpath') || pricing[2];
                  const isPkg = item.itemType === 'PACKAGE';
                  const isProf = item.itemType === 'PROFILE';

                  return (
                    <tr 
                      key={(item.id || item.code || item.name) + '_' + idx}
                      style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FBFDFD' }}
                    >
                      {/* 1. Item Details */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                          <span style={{ fontSize: '0.68rem', backgroundColor: isPkg ? '#FEF3C7' : isProf ? '#E0F2FE' : '#E0F2F1', color: isPkg ? '#B45309' : isProf ? '#0369A1' : '#006B70', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '900' }}>
                            {isPkg ? 'PACKAGE' : isProf ? 'PROFILE' : 'TEST'}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'monospace', fontWeight: '800' }}>
                            {item.code || item.id}
                          </span>
                        </div>
                        <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.9rem', lineHeight: 1.3 }}>
                          {item.name || item.title}
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.35rem', fontSize: '0.72rem' }}>
                          <span style={{ backgroundColor: '#F1F5F9', color: '#475569', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '700' }}>
                            🩸 {item.sampleType || item.sampleTypes?.join(', ') || 'SERUM'}
                          </span>
                          <span style={{ backgroundColor: item.fasting === 'YES' ? '#FEF3C7' : '#DCFCE7', color: item.fasting === 'YES' ? '#B45309' : '#15803D', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '800' }}>
                            ⏱ Fasting: {item.fasting || 'NO'}
                          </span>
                        </div>
                      </td>

                      {/* 2. MedMarg Suggested Lab (Big MedMarg + Small Suggested Lab) */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle', backgroundColor: 'rgba(0, 107, 112, 0.03)', borderLeft: '2px solid #006B70' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#006B70' }}>
                            MedMarg
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '800' }}>
                            ★ Curated
                          </span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '700', marginTop: '0.1rem' }}>
                          via <span style={{ color: '#004D40', fontWeight: '800' }}>{medmargLab?.suggestedLabName || globalSuggestedLab}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                          <span style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A' }}>
                            ₹{medmargLab?.price || item.price || 299}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                            ₹{medmargLab?.mrp || item.mrp || 499}
                          </span>
                          <span style={{ fontSize: '0.7rem', backgroundColor: '#DCFCE7', color: '#15803D', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: '900' }}>
                            {medmargLab?.discountPercent || 40}% OFF
                          </span>
                        </div>
                      </td>

                      {/* 3. Thyrocare */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle', borderLeft: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#B91C1C' }}>
                          Thyrocare
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.1rem' }}>
                          Automated Track Lab
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                          <span style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A' }}>
                            ₹{thyrocareLab?.price || Math.round((item.price || 299) * 1.15)}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                            ₹{thyrocareLab?.mrp || Math.round((item.mrp || 499) * 1.1)}
                          </span>
                          <span style={{ fontSize: '0.7rem', backgroundColor: '#FEE2E2', color: '#991B1B', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: '800' }}>
                            {thyrocareLab?.discountPercent || 35}% OFF
                          </span>
                        </div>
                      </td>

                      {/* 4. Dr. Lal PathLabs */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle', borderLeft: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#D97706' }}>
                          Dr. Lal PathLabs
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.1rem' }}>
                          National Reference Lab
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                          <span style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A' }}>
                            ₹{lalpathLab?.price || Math.round((item.price || 299) * 1.30)}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                            ₹{lalpathLab?.mrp || Math.round((item.mrp || 499) * 1.25)}
                          </span>
                          <span style={{ fontSize: '0.7rem', backgroundColor: '#FEF3C7', color: '#92400E', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: '800' }}>
                            {lalpathLab?.discountPercent || 30}% OFF
                          </span>
                        </div>
                      </td>

                      {/* 5. Actions */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                          <button
                            title="Preview Care Seeker Card"
                            onClick={() => handleOpenPreview(item)}
                            style={{ padding: '0.45rem 0.65rem', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.76rem', fontWeight: '800' }}
                          >
                            <Eye size={14} /> Preview
                          </button>
                          <button
                            title="Edit Multi-Lab Pricing"
                            onClick={() => handleOpenLabPricingModal(item)}
                            style={{ padding: '0.45rem 0.75rem', backgroundColor: '#006B70', border: 'none', borderRadius: '8px', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.76rem', fontWeight: '900' }}
                          >
                            <Sliders size={14} /> Edit Rates
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}


      {/* TESTS LIST */}
      {testsSubTab === 'TESTS' && (
        <div>
          {/* Search Bar & Page Controls Header */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
              <Search size={18} color="#64748B" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                placeholder={`Search ${catalog.tests?.length || 913} tests by name, code, or sample type...`}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.4rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#0F172A', fontSize: '0.88rem', outline: 'none' }}
              />
            </div>

            {/* Page Size & Pagination Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#475569', fontWeight: '700' }}>
                <span>Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(e.target.value); setCurrentPage(1); }}
                  style={{ padding: '0.4rem 0.6rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontWeight: '800', cursor: 'pointer', fontSize: '0.82rem' }}
                >
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                  <option value={250}>250 per page</option>
                  <option value={500}>500 per page</option>
                  <option value="ALL">Show All ({totalDisplayTests})</option>
                </select>
              </div>

              {pageSize !== 'ALL' && totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    style={{ padding: '0.4rem 0.75rem', backgroundColor: currentPage === 1 ? '#F1F5F9' : '#006B70', color: currentPage === 1 ? '#94A3B8' : '#FFF', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    ← Prev
                  </button>
                  <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F172A', padding: '0 0.3rem' }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    style={{ padding: '0.4rem 0.75rem', backgroundColor: currentPage >= totalPages ? '#F1F5F9' : '#006B70', color: currentPage >= totalPages ? '#94A3B8' : '#FFF', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer' }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tests Table Container */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
                  <th style={{ padding: '1rem 1.25rem' }}>SERIAL / CODE</th>
                  <th style={{ padding: '1rem' }}>TEST NAME</th>
                  <th style={{ padding: '1rem' }}>SAMPLE TYPE</th>
                  <th style={{ padding: '1rem' }}>FASTING</th>
                  <th style={{ padding: '1rem' }}>PRICE (₹)</th>
                  <th style={{ padding: '1rem' }}>TAT</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTests.map(test => (
                  <tr key={test.id || test.code} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', color: '#006B70', fontWeight: '700' }}>
                      #{test.serialNo || '-'} • {test.code}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '700', color: '#0F172A' }}>
                      {test.name}
                    </td>
                    <td style={{ padding: '1rem', color: '#334155' }}>
                      <span style={{ backgroundColor: '#F1F5F9', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}>
                        {test.sampleType || 'SERUM'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '800', backgroundColor: test.fasting === 'YES' ? '#FEF3C7' : '#DCFCE7', color: test.fasting === 'YES' ? '#B45309' : '#15803D' }}>
                        {test.fasting}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#006B70', fontWeight: '900' }}>₹{test.price}</td>
                    <td style={{ padding: '1rem', color: '#64748B' }}>{test.tatHours || 24}h</td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => { setEditingItem(test); setTestForm(test); setShowCreateTestModal(true); }}
                        style={{ background: 'none', border: 'none', color: '#0284C7', cursor: 'pointer', marginRight: '0.6rem' }}
                      >
                        <Edit3 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Bottom Pagination Bar */}
            <div style={{ padding: '1rem 1.25rem', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem' }}>
              <span style={{ color: '#64748B', fontWeight: '700' }}>
                Showing {Math.min(startIndex + 1, totalDisplayTests)}–{Math.min(startIndex + effectivePageSize, totalDisplayTests)} of {totalDisplayTests} Biomarker Tests
              </span>
              {pageSize !== 'ALL' && totalPages > 1 && (
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    style={{ padding: '0.35rem 0.75rem', backgroundColor: currentPage === 1 ? '#E2E8F0' : '#006B70', color: currentPage === 1 ? '#94A3B8' : '#FFF', border: 'none', borderRadius: '6px', fontWeight: '800', fontSize: '0.78rem', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    Previous
                  </button>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    style={{ padding: '0.35rem 0.75rem', backgroundColor: currentPage >= totalPages ? '#E2E8F0' : '#006B70', color: currentPage >= totalPages ? '#94A3B8' : '#FFF', border: 'none', borderRadius: '6px', fontWeight: '800', fontSize: '0.78rem', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer' }}
                  >
                    Next Page →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PROFILES LIST */}
      {testsSubTab === 'PROFILES' && (
        <div>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
                  <th style={{ padding: '1rem 1.25rem' }}>PROFILE CODE</th>
                  <th style={{ padding: '1rem' }}>PROFILE NAME</th>
                  <th style={{ padding: '1rem' }}>SAMPLE TYPE</th>
                  <th style={{ padding: '1rem' }}>FASTING</th>
                  <th style={{ padding: '1rem' }}>PRICE (₹)</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map(profile => (
                  <tr key={profile.id || profile.code} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', color: '#B45309', fontWeight: '800' }}>
                      {profile.code}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '700', color: '#0F172A' }}>
                      {profile.name}
                    </td>
                    <td style={{ padding: '1rem', color: '#334155' }}>
                      <span style={{ backgroundColor: '#F1F5F9', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}>
                        {profile.sampleType || 'SERUM'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '800', backgroundColor: profile.fasting === 'YES' ? '#FEF3C7' : '#DCFCE7', color: profile.fasting === 'YES' ? '#B45309' : '#15803D' }}>
                        {profile.fasting}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#006B70', fontWeight: '900' }}>₹{profile.price}</td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => { setEditingItem(profile); setProfileForm(profile); setShowCreateProfileModal(true); }}
                        style={{ background: 'none', border: 'none', color: '#0284C7', cursor: 'pointer' }}
                      >
                        <Edit3 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* HEALTH PACKAGES */}
      {testsSubTab === 'PACKAGES' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {(catalog.packages || []).map(pkg => (
            <div key={pkg.id} style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.55rem', borderRadius: '4px', fontWeight: '800' }}>
                    {pkg.discountPercent}% OFF • {pkg.category}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'monospace' }}>
                    {pkg.code}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A', marginTop: '0.5rem' }}>
                  {pkg.name}
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#64748B', marginTop: '0.3rem', lineHeight: 1.4 }}>
                  {pkg.tagline || pkg.description}
                </p>
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#006B70' }}>₹{pkg.price}</span>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8', textDecoration: 'line-through', marginLeft: '0.4rem' }}>₹{pkg.mrp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GOOGLE SHEETS SYNC HUB */}
      {testsSubTab === 'SYNC_HUB' && (
        <div style={{ backgroundColor: '#1E293B', borderRadius: '20px', border: '1.5px solid #006B70', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#FFF' }}>Google Sheets Live Sync Engine</h2>
          <p style={{ color: '#94A3B8', marginTop: '0.5rem' }}>Connected Sheet ID: 1W37T0qzCZDYoBYPIG5MsWZeBZrict_BfDUx9itGSZp0</p>
          <button onClick={triggerGoogleSheetsSync} style={{ marginTop: '1.5rem', padding: '0.85rem 1.75rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' }}>
            Trigger Manual Refresh & Sync
          </button>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT TEST */}
      {showCreateTestModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 120, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#1E293B', borderRadius: '22px', maxWidth: '520px', width: '100%', padding: '2rem', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#FFF' }}>
                {editingItem ? 'Edit Test' : 'Add New Clinical Test to Master'}
              </h3>
              <button onClick={() => setShowCreateTestModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSaveTest} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Test Code</label>
                  <input
                    type="text"
                    value={testForm.code}
                    onChange={(e) => setTestForm({ ...testForm, code: e.target.value })}
                    placeholder="e.g. VITDC"
                    required
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#67E8F9', fontWeight: '800', marginTop: '0.2rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Test Name</label>
                  <input
                    type="text"
                    value={testForm.name}
                    onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
                    placeholder="e.g. 25-OH VITAMIN D (TOTAL)"
                    required
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', fontWeight: '700', marginTop: '0.2rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Sample Type</label>
                  <input
                    type="text"
                    value={testForm.sampleType}
                    onChange={(e) => setTestForm({ ...testForm, sampleType: e.target.value })}
                    placeholder="SERUM / EDTA / URINE"
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', marginTop: '0.2rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Fasting Required?</label>
                  <select
                    value={testForm.fasting}
                    onChange={(e) => setTestForm({ ...testForm, fasting: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', marginTop: '0.2rem' }}
                  >
                    <option value="NO">NO</option>
                    <option value="YES">YES</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#FBBF24', fontWeight: '700' }}>MedMarg Price (₹)</label>
                  <input
                    type="number"
                    value={testForm.price}
                    onChange={(e) => setTestForm({ ...testForm, price: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #F59E0B', borderRadius: '8px', color: '#FBBF24', fontWeight: '800', marginTop: '0.2rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Standard MRP (₹)</label>
                  <input
                    type="number"
                    value={testForm.mrp}
                    onChange={(e) => setTestForm({ ...testForm, mrp: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#94A3B8', marginTop: '0.2rem' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{ marginTop: '0.75rem', padding: '0.85rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}
              >
                {editingItem ? 'Update Test' : 'Save Test & Sync to Google Sheets'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT PROFILE */}
      {showCreateProfileModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 120, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#1E293B', borderRadius: '22px', maxWidth: '520px', width: '100%', padding: '2rem', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#FFF' }}>
                {editingItem ? 'Edit Profile' : 'Add Diagnostic Profile to Master'}
              </h3>
              <button onClick={() => setShowCreateProfileModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Profile Code</label>
                  <input
                    type="text"
                    value={profileForm.code}
                    onChange={(e) => setProfileForm({ ...profileForm, code: e.target.value })}
                    placeholder="e.g. APCOM"
                    required
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FBBF24', fontWeight: '800', marginTop: '0.2rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Profile Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder="e.g. ALLERGY COMPREHENSIVE PROFILE"
                    required
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', fontWeight: '700', marginTop: '0.2rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Sample Type</label>
                  <input
                    type="text"
                    value={profileForm.sampleType}
                    onChange={(e) => setProfileForm({ ...profileForm, sampleType: e.target.value })}
                    placeholder="SERUM / EDTA"
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', marginTop: '0.2rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Fasting Required?</label>
                  <select
                    value={profileForm.fasting}
                    onChange={(e) => setProfileForm({ ...profileForm, fasting: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', marginTop: '0.2rem' }}
                  >
                    <option value="NO">NO</option>
                    <option value="YES">YES</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#FBBF24', fontWeight: '700' }}>MedMarg Price (₹)</label>
                  <input
                    type="number"
                    value={profileForm.price}
                    onChange={(e) => setProfileForm({ ...profileForm, price: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #F59E0B', borderRadius: '8px', color: '#FBBF24', fontWeight: '800', marginTop: '0.2rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Standard MRP (₹)</label>
                  <input
                    type="number"
                    value={profileForm.mrp}
                    onChange={(e) => setProfileForm({ ...profileForm, mrp: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#94A3B8', marginTop: '0.2rem' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{ marginTop: '0.75rem', padding: '0.85rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}
              >
                {editingItem ? 'Update Profile' : 'Save Profile & Sync to Google Sheets'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VISUAL PACKAGE BUILDER */}
      {showPackageBuilderModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', maxWidth: '1000px', width: '100%', padding: '2rem', border: '1px solid #E2E8F0', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '900' }}>
                  ADMIN STUDIO
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>
                  Visual Health Package Builder & Biomarker Aggregator
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.1rem' }}>
                  Combine multi-parameter diagnostic profiles and single biomarker tests into promoted health packages.
                </p>
              </div>
              <button onClick={() => setShowPackageBuilderModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '1.25rem', cursor: 'pointer', padding: '0.5rem' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.75rem' }}>
              {/* LEFT COLUMN: Component Selection */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="text"
                    placeholder="Search from 87 profiles & 913 tests by name or code..."
                    value={builderSearch}
                    onChange={(e) => setBuilderSearch(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.4rem', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#0F172A', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>

                {/* Selected Basket Chips */}
                <div style={{ backgroundColor: '#F1F5F9', borderRadius: '12px', padding: '0.85rem', border: '1px solid #CBD5E1' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#006B70', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                    Selected Package Components ({packageBuilderForm.selectedProfiles.length} Profiles, {packageBuilderForm.selectedTests.length} Tests)
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', maxHeight: '90px', overflowY: 'auto' }}>
                    {packageBuilderForm.selectedProfiles.map(code => (
                      <span key={code} style={{ fontSize: '0.72rem', backgroundColor: '#006B70', color: '#FFF', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        🔬 {code}
                        <button type="button" onClick={() => setPackageBuilderForm({ ...packageBuilderForm, selectedProfiles: packageBuilderForm.selectedProfiles.filter(c => c !== code) })} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', padding: 0, fontWeight: '900' }}>✕</button>
                      </span>
                    ))}
                    {packageBuilderForm.selectedTests.map(code => (
                      <span key={code} style={{ fontSize: '0.72rem', backgroundColor: '#B45309', color: '#FFF', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        🧪 {code}
                        <button type="button" onClick={() => setPackageBuilderForm({ ...packageBuilderForm, selectedTests: packageBuilderForm.selectedTests.filter(c => c !== code) })} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', padding: 0, fontWeight: '900' }}>✕</button>
                      </span>
                    ))}
                    {packageBuilderForm.selectedProfiles.length === 0 && packageBuilderForm.selectedTests.length === 0 && (
                      <span style={{ fontSize: '0.78rem', color: '#94A3B8', italic: true }}>No profiles or tests selected yet. Select items below.</span>
                    )}
                  </div>
                </div>

                {/* Profiles List */}
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#006B70', fontWeight: '800', marginBottom: '0.35rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>🔬 DIAGNOSTIC PROFILES & PANELS ({catalog.profiles?.length || 87})</span>
                  </div>
                  <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.5rem', backgroundColor: '#FFFFFF' }}>
                    {(catalog.profiles || []).filter(p => !builderSearch || p.name.toLowerCase().includes(builderSearch.toLowerCase()) || p.code.toLowerCase().includes(builderSearch.toLowerCase())).slice(0, 40).map(p => {
                      const isSel = packageBuilderForm.selectedProfiles.includes(p.code);
                      return (
                        <div
                          key={p.code}
                          onClick={() => {
                            if (isSel) setPackageBuilderForm({ ...packageBuilderForm, selectedProfiles: packageBuilderForm.selectedProfiles.filter(c => c !== p.code) });
                            else setPackageBuilderForm({ ...packageBuilderForm, selectedProfiles: [...packageBuilderForm.selectedProfiles, p.code] });
                          }}
                          style={{ padding: '0.45rem 0.75rem', borderRadius: '8px', backgroundColor: isSel ? 'rgba(0,107,112,0.1)' : '#F8FAFC', border: isSel ? '1.5px solid #006B70' : '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '0.82rem' }}
                        >
                          <span style={{ color: isSel ? '#006B70' : '#0F172A', fontWeight: isSel ? '800' : '600' }}>{isSel ? '✓ ' : '+ '}{p.name} ({p.code})</span>
                          <span style={{ color: '#006B70', fontSize: '0.72rem', backgroundColor: '#E0F2FE', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '700' }}>{p.sampleType || 'SERUM'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tests List */}
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#B45309', fontWeight: '800', marginBottom: '0.35rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>🧪 INDIVIDUAL BIOMARKER TESTS ({catalog.tests?.length || 913})</span>
                  </div>
                  <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.5rem', backgroundColor: '#FFFFFF' }}>
                    {(catalog.tests || []).filter(t => !builderSearch || t.name.toLowerCase().includes(builderSearch.toLowerCase()) || t.code.toLowerCase().includes(builderSearch.toLowerCase())).slice(0, 50).map(t => {
                      const isSel = packageBuilderForm.selectedTests.includes(t.code);
                      return (
                        <div
                          key={t.code}
                          onClick={() => {
                            if (isSel) setPackageBuilderForm({ ...packageBuilderForm, selectedTests: packageBuilderForm.selectedTests.filter(c => c !== t.code) });
                            else setPackageBuilderForm({ ...packageBuilderForm, selectedTests: [...packageBuilderForm.selectedTests, t.code] });
                          }}
                          style={{ padding: '0.45rem 0.75rem', borderRadius: '8px', backgroundColor: isSel ? '#FEF3C7' : '#F8FAFC', border: isSel ? '1.5px solid #F59E0B' : '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '0.82rem' }}
                        >
                          <span style={{ color: isSel ? '#B45309' : '#0F172A', fontWeight: isSel ? '800' : '600' }}>{isSel ? '✓ ' : '+ '}{t.name} ({t.code})</span>
                          <span style={{ color: '#B45309', fontSize: '0.72rem', backgroundColor: '#FEF3C7', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '700' }}>{t.sampleType || 'SERUM'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Package Form & Live Preview */}
              <div>
                <form onSubmit={handleSavePackage} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  
                  {/* Live Card Preview Box */}
                  <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '800' }}>
                        {Math.round(((Number(packageBuilderForm.mrp || 2999) - Number(packageBuilderForm.price || 1299)) / Number(packageBuilderForm.mrp || 2999)) * 100) || 50}% OFF • {packageBuilderForm.category}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'monospace', fontWeight: '800' }}>
                        {packageBuilderForm.code || 'MM_PKG_NEW'}
                      </span>
                    </div>
                    <div style={{ fontWeight: '900', fontSize: '1.05rem', color: '#0F172A' }}>
                      {packageBuilderForm.name || 'Untitled Health Package'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.15rem' }}>
                      {packageBuilderForm.tagline}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '800' }}>
                        {packageBuilderForm.selectedProfiles.length * 8 + packageBuilderForm.selectedTests.length} Total Biomarkers
                      </span>
                      <span style={{ backgroundColor: '#E0F2FE', color: '#0369A1', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '800' }}>
                        Fasting: {calculateFastingRequirement(packageBuilderForm.selectedProfiles, packageBuilderForm.selectedTests, catalog.profiles, catalog.tests) ? 'YES (8-10h)' : 'NO'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '700' }}>Package Name</label>
                    <input
                      type="text"
                      value={packageBuilderForm.name}
                      onChange={(e) => setPackageBuilderForm({ ...packageBuilderForm, name: e.target.value })}
                      placeholder="e.g. Master Executive Health Shield"
                      required
                      style={{ width: '100%', padding: '0.6rem 0.8rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontWeight: '700', fontSize: '0.88rem', marginTop: '0.2rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '700' }}>Package Code</label>
                      <input
                        type="text"
                        value={packageBuilderForm.code}
                        onChange={(e) => setPackageBuilderForm({ ...packageBuilderForm, code: e.target.value })}
                        placeholder="e.g. MM_EXEC_FB"
                        style={{ width: '100%', padding: '0.6rem 0.8rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#006B70', fontWeight: '800', fontSize: '0.88rem', marginTop: '0.2rem', fontFamily: 'monospace' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '700' }}>Category</label>
                      <select
                        value={packageBuilderForm.category}
                        onChange={(e) => setPackageBuilderForm({ ...packageBuilderForm, category: e.target.value })}
                        style={{ width: '100%', padding: '0.6rem 0.8rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontWeight: '700', fontSize: '0.88rem', marginTop: '0.2rem' }}
                      >
                        <option value="Full Body Wellness">Full Body Wellness</option>
                        <option value="Cardio & Diabetes">Cardio & Diabetes Care</option>
                        <option value="Immunity & Allergy">Immunity & Allergy</option>
                        <option value="Women Health">Women Health & Hormones</option>
                        <option value="Senior Citizen Care">Senior Citizen Care</option>
                        <option value="Metabolic Profile">Metabolic & Thyroid Profile</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '700' }}>Tagline / Catchphrase</label>
                    <input
                      type="text"
                      value={packageBuilderForm.tagline}
                      onChange={(e) => setPackageBuilderForm({ ...packageBuilderForm, tagline: e.target.value })}
                      placeholder="e.g. Complete 85+ Vital Biomarkers & Full Body Evaluation"
                      style={{ width: '100%', padding: '0.6rem 0.8rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem', marginTop: '0.2rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#006B70', fontWeight: '800' }}>Offer Price (₹)</label>
                      <input
                        type="number"
                        value={packageBuilderForm.price}
                        onChange={(e) => setPackageBuilderForm({ ...packageBuilderForm, price: e.target.value })}
                        required
                        style={{ width: '100%', padding: '0.6rem 0.8rem', backgroundColor: '#FFFFFF', border: '1.5px solid #006B70', borderRadius: '8px', color: '#006B70', fontWeight: '900', fontSize: '0.88rem', marginTop: '0.2rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700' }}>Market MRP (₹)</label>
                      <input
                        type="number"
                        value={packageBuilderForm.mrp}
                        onChange={(e) => setPackageBuilderForm({ ...packageBuilderForm, mrp: e.target.value })}
                        style={{ width: '100%', padding: '0.6rem 0.8rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#64748B', fontSize: '0.88rem', marginTop: '0.2rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700' }}>TAT (Hours)</label>
                      <input
                        type="number"
                        value={packageBuilderForm.tatHours}
                        onChange={(e) => setPackageBuilderForm({ ...packageBuilderForm, tatHours: e.target.value })}
                        style={{ width: '100%', padding: '0.6rem 0.8rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem', marginTop: '0.2rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setShowPackageBuilderModal(false)} style={{ padding: '0.65rem 1.25rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                    <button
                      type="submit"
                      style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,107,112,0.25)' }}
                    >
                      Publish Package to Live Catalog
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 4: MULTI-LAB PRICING & OFFERS MANAGER */}
      {showLabPricingModal && selectedItemForLabPricing && (

        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', maxWidth: '820px', width: '100%', padding: '2rem', border: '1.5px solid #E2E8F0', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.72rem', backgroundColor: '#006B70', color: '#FFF', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '900' }}>
                    MULTI-LAB RATE MANAGER
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', fontFamily: 'monospace', fontWeight: '800' }}>
                    {selectedItemForLabPricing.code || selectedItemForLabPricing.id}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                  {selectedItemForLabPricing.name || selectedItemForLabPricing.title}
                </h2>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
                  Set distinct consumer pricing & partner offers across all 3 certified lab providers.
                </div>
              </div>
              <button onClick={() => setShowLabPricingModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '1.3rem', cursor: 'pointer', padding: '0.4rem' }}>✕</button>
            </div>

            <form onSubmit={handleSaveLabPricing} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* 3-LAB PRICING CARDS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                {/* 1. MedMarg Suggested Lab Option (Big MedMarg + Small Suggested Lab) */}
                <div style={{ backgroundColor: '#F0FDF4', borderRadius: '16px', border: '2px solid #006B70', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.3rem', fontWeight: '900', color: '#006B70' }}>
                        1. MedMarg
                      </span>
                      <span style={{ fontSize: '0.75rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '900' }}>
                        ⭐ SMART PICK / SUGGESTED LAB
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '800' }}>
                      Default Care Seeker Recommendation
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#004D40', fontWeight: '800' }}>Suggested Partner Lab Name (Small Subtext)</label>
                      <input
                        type="text"
                        value={labPricingForm[0]?.suggestedLabName || ''}
                        onChange={(e) => {
                          const updated = [...labPricingForm];
                          if (updated[0]) updated[0].suggestedLabName = e.target.value;
                          setLabPricingForm(updated);
                        }}
                        placeholder="e.g. Central Processing Partner Lab"
                        style={{ width: '100%', padding: '0.55rem', border: '1.5px solid #006B70', borderRadius: '8px', color: '#0F172A', fontWeight: '700', fontSize: '0.84rem', marginTop: '0.2rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#004D40', fontWeight: '800' }}>Offer Price (₹)</label>
                      <input
                        type="number"
                        value={labPricingForm[0]?.price || ''}
                        onChange={(e) => {
                          const updated = [...labPricingForm];
                          if (updated[0]) {
                            const newPrice = Number(e.target.value);
                            updated[0].price = newPrice;
                            updated[0].discountPercent = Math.max(0, Math.round(((updated[0].mrp - newPrice) / (updated[0].mrp || 1)) * 100));
                          }
                          setLabPricingForm(updated);
                        }}
                        required
                        style={{ width: '100%', padding: '0.55rem', border: '1.5px solid #006B70', borderRadius: '8px', color: '#006B70', fontWeight: '900', fontSize: '0.9rem', marginTop: '0.2rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>MRP (₹)</label>
                      <input
                        type="number"
                        value={labPricingForm[0]?.mrp || ''}
                        onChange={(e) => {
                          const updated = [...labPricingForm];
                          if (updated[0]) {
                            const newMrp = Number(e.target.value);
                            updated[0].mrp = newMrp;
                            updated[0].discountPercent = Math.max(0, Math.round(((newMrp - updated[0].price) / (newMrp || 1)) * 100));
                          }
                          setLabPricingForm(updated);
                        }}
                        style={{ width: '100%', padding: '0.55rem', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#64748B', fontSize: '0.86rem', marginTop: '0.2rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>TAT (Hours)</label>
                      <input
                        type="number"
                        value={labPricingForm[0]?.tatHours || 24}
                        onChange={(e) => {
                          const updated = [...labPricingForm];
                          if (updated[0]) updated[0].tatHours = Number(e.target.value);
                          setLabPricingForm(updated);
                        }}
                        style={{ width: '100%', padding: '0.55rem', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.86rem', marginTop: '0.2rem' }}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Thyrocare Option */}
                <div style={{ backgroundColor: '#FEF2F2', borderRadius: '16px', border: '1.5px solid #FECACA', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: '900', color: '#B91C1C' }}>
                        2. Thyrocare
                      </span>
                      <span style={{ fontSize: '0.72rem', backgroundColor: '#FEE2E2', color: '#991B1B', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '800' }}>
                        DIRECT AUTOMATED LAB
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#991B1B', fontWeight: '700' }}>Provider Brand</label>
                      <input
                        type="text"
                        value="Thyrocare Technologies"
                        disabled
                        style={{ width: '100%', padding: '0.55rem', border: '1px solid #FCA5A5', borderRadius: '8px', color: '#991B1B', fontWeight: '800', backgroundColor: 'rgba(255,255,255,0.7)', fontSize: '0.84rem', marginTop: '0.2rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#991B1B', fontWeight: '800' }}>Offer Price (₹)</label>
                      <input
                        type="number"
                        value={labPricingForm[1]?.price || ''}
                        onChange={(e) => {
                          const updated = [...labPricingForm];
                          if (updated[1]) {
                            const newPrice = Number(e.target.value);
                            updated[1].price = newPrice;
                            updated[1].discountPercent = Math.max(0, Math.round(((updated[1].mrp - newPrice) / (updated[1].mrp || 1)) * 100));
                          }
                          setLabPricingForm(updated);
                        }}
                        required
                        style={{ width: '100%', padding: '0.55rem', border: '1.5px solid #DC2626', borderRadius: '8px', color: '#B91C1C', fontWeight: '900', fontSize: '0.9rem', marginTop: '0.2rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>MRP (₹)</label>
                      <input
                        type="number"
                        value={labPricingForm[1]?.mrp || ''}
                        onChange={(e) => {
                          const updated = [...labPricingForm];
                          if (updated[1]) {
                            const newMrp = Number(e.target.value);
                            updated[1].mrp = newMrp;
                            updated[1].discountPercent = Math.max(0, Math.round(((newMrp - updated[1].price) / (newMrp || 1)) * 100));
                          }
                          setLabPricingForm(updated);
                        }}
                        style={{ width: '100%', padding: '0.55rem', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#64748B', fontSize: '0.86rem', marginTop: '0.2rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>TAT (Hours)</label>
                      <input
                        type="number"
                        value={labPricingForm[1]?.tatHours || 24}
                        onChange={(e) => {
                          const updated = [...labPricingForm];
                          if (updated[1]) updated[1].tatHours = Number(e.target.value);
                          setLabPricingForm(updated);
                        }}
                        style={{ width: '100%', padding: '0.55rem', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.86rem', marginTop: '0.2rem' }}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Dr. Lal PathLabs Option */}
                <div style={{ backgroundColor: '#FFFBEB', borderRadius: '16px', border: '1.5px solid #FDE68A', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: '900', color: '#D97706' }}>
                        3. Dr. Lal PathLabs
                      </span>
                      <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#92400E', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '800' }}>
                        NATIONAL REFERENCE LAB
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#92400E', fontWeight: '700' }}>Provider Brand</label>
                      <input
                        type="text"
                        value="Dr. Lal PathLabs"
                        disabled
                        style={{ width: '100%', padding: '0.55rem', border: '1px solid #FCD34D', borderRadius: '8px', color: '#92400E', fontWeight: '800', backgroundColor: 'rgba(255,255,255,0.7)', fontSize: '0.84rem', marginTop: '0.2rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#92400E', fontWeight: '800' }}>Offer Price (₹)</label>
                      <input
                        type="number"
                        value={labPricingForm[2]?.price || ''}
                        onChange={(e) => {
                          const updated = [...labPricingForm];
                          if (updated[2]) {
                            const newPrice = Number(e.target.value);
                            updated[2].price = newPrice;
                            updated[2].discountPercent = Math.max(0, Math.round(((updated[2].mrp - newPrice) / (updated[2].mrp || 1)) * 100));
                          }
                          setLabPricingForm(updated);
                        }}
                        required
                        style={{ width: '100%', padding: '0.55rem', border: '1.5px solid #D97706', borderRadius: '8px', color: '#B45309', fontWeight: '900', fontSize: '0.9rem', marginTop: '0.2rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>MRP (₹)</label>
                      <input
                        type="number"
                        value={labPricingForm[2]?.mrp || ''}
                        onChange={(e) => {
                          const updated = [...labPricingForm];
                          if (updated[2]) {
                            const newMrp = Number(e.target.value);
                            updated[2].mrp = newMrp;
                            updated[2].discountPercent = Math.max(0, Math.round(((newMrp - updated[2].price) / (newMrp || 1)) * 100));
                          }
                          setLabPricingForm(updated);
                        }}
                        style={{ width: '100%', padding: '0.55rem', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#64748B', fontSize: '0.86rem', marginTop: '0.2rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>TAT (Hours)</label>
                      <input
                        type="number"
                        value={labPricingForm[2]?.tatHours || 24}
                        onChange={(e) => {
                          const updated = [...labPricingForm];
                          if (updated[2]) updated[2].tatHours = Number(e.target.value);
                          setLabPricingForm(updated);
                        }}
                        style={{ width: '100%', padding: '0.55rem', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.86rem', marginTop: '0.2rem' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Dynamic Signed-up Labs (Extensibility) */}
                {labPricingForm.slice(3).map((customLab, cIdx) => (
                  <div key={cIdx} style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1.5px solid #CBD5E1', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>
                        {cIdx + 4}. {customLab.labName || 'Custom Signed-Up Lab'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = labPricingForm.filter((_, idx) => idx !== cIdx + 3);
                          setLabPricingForm(updated);
                        }}
                        style={{ background: 'none', border: 'none', color: '#EF4444', fontWeight: '800', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        Remove Lab
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '700' }}>Lab Partner Name</label>
                        <input
                          type="text"
                          value={customLab.labName}
                          onChange={(e) => {
                            const updated = [...labPricingForm];
                            updated[cIdx + 3].labName = e.target.value;
                            setLabPricingForm(updated);
                          }}
                          placeholder="e.g. Vijaya Diagnostics"
                          style={{ width: '100%', padding: '0.55rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.84rem', marginTop: '0.2rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '700' }}>Offer Price (₹)</label>
                        <input
                          type="number"
                          value={customLab.price}
                          onChange={(e) => {
                            const updated = [...labPricingForm];
                            updated[cIdx + 3].price = Number(e.target.value);
                            setLabPricingForm(updated);
                          }}
                          style={{ width: '100%', padding: '0.55rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.84rem', marginTop: '0.2rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '700' }}>MRP (₹)</label>
                        <input
                          type="number"
                          value={customLab.mrp}
                          onChange={(e) => {
                            const updated = [...labPricingForm];
                            updated[cIdx + 3].mrp = Number(e.target.value);
                            setLabPricingForm(updated);
                          }}
                          style={{ width: '100%', padding: '0.55rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.84rem', marginTop: '0.2rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '700' }}>TAT (Hours)</label>
                        <input
                          type="number"
                          value={customLab.tatHours || 24}
                          onChange={(e) => {
                            const updated = [...labPricingForm];
                            updated[cIdx + 3].tatHours = Number(e.target.value);
                            setLabPricingForm(updated);
                          }}
                          style={{ width: '100%', padding: '0.55rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.84rem', marginTop: '0.2rem' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add More Lab Option Button */}
                <button
                  type="button"
                  onClick={() => {
                    setLabPricingForm([
                      ...labPricingForm,
                      {
                        labId: `signed_lab_${Date.now()}`,
                        labName: 'Signed-up Regional Lab',
                        suggestedLabName: null,
                        isMedmargSuggested: false,
                        price: (labPricingForm[0]?.price || 299) + 50,
                        mrp: (labPricingForm[0]?.mrp || 499) + 100,
                        discountPercent: 30,
                        tatHours: 24,
                        tag: 'Partner Center'
                      }
                    ]);
                  }}
                  style={{ padding: '0.65rem', backgroundColor: '#F1F5F9', border: '1.5px dashed #94A3B8', borderRadius: '12px', color: '#475569', fontWeight: '800', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                >
                  <Plus size={16} /> + Add Signed-Up Partner Lab Option
                </button>
              </div>

              {/* Bottom Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleOpenPreview(selectedItemForLabPricing)}
                  style={{ padding: '0.75rem 1.25rem', backgroundColor: '#F8FAFC', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '12px', fontWeight: '800', fontSize: '0.86rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Eye size={16} color="#006B70" /> Live Care Seeker Preview
                </button>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowLabPricingModal(false)}
                    style={{ padding: '0.75rem 1.25rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '12px', fontWeight: '800', fontSize: '0.86rem', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '0.75rem 1.6rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,107,112,0.25)' }}
                  >
                    Save & Publish 3-Lab Rates
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: CARE SEEKER 3-LAB VIEW SIMULATOR PREVIEW */}
      {showCareSeekerPreviewModal && previewItem && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', maxWidth: '640px', width: '100%', padding: '2rem', border: '1px solid #E2E8F0', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '900' }}>
                  CARE SEEKER SIMULATOR
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem', margin: 0 }}>
                  Customer Choice View: {previewItem.name || previewItem.title}
                </h3>
              </div>
              <button onClick={() => setShowCareSeekerPreviewModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
            </div>

            {/* 3 Interactive Cards shown to Patients */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A' }}>
                Select Laboratory for Home Sample Processing:
              </div>

              {getItemLabPricing(previewItem).map((lab, lIdx) => {
                const isMedmarg = lab.isMedmargSuggested;
                return (
                  <div
                    key={lIdx}
                    style={{
                      border: isMedmarg ? '2.5px solid #006B70' : '1.5px solid #E2E8F0',
                      borderRadius: '16px',
                      padding: '1.25rem',
                      backgroundColor: isMedmarg ? '#F0FDF4' : '#FFFFFF',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      position: 'relative'
                    }}
                  >
                    <div>
                      {isMedmarg ? (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#006B70' }}>
                              MedMarg
                            </span>
                            <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: '900' }}>
                              ⭐ MedMarg Smart Choice
                            </span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '700', marginTop: '0.15rem' }}>
                            Suggested Lab: <span style={{ color: '#004D40', fontWeight: '800' }}>{lab.suggestedLabName || globalSuggestedLab}</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '800', marginTop: '0.3rem' }}>
                            ✓ Free Home Phlebotomy • 100% NABL Quality Certified
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.15rem', fontWeight: '900', color: lab.labId === 'thyrocare' ? '#B91C1C' : '#D97706' }}>
                              {lab.labName}
                            </span>
                            <span style={{ fontSize: '0.72rem', backgroundColor: '#F1F5F9', color: '#475569', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '800' }}>
                              {lab.tag || 'Certified Lab'}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '0.15rem' }}>
                            TAT: {lab.tatHours || 24} Hours Report
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.35rem', fontWeight: '900', color: isMedmarg ? '#006B70' : '#0F172A' }}>
                        ₹{lab.price}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                        ₹{lab.mrp}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '800' }}>
                        Save {lab.discountPercent || 35}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowCareSeekerPreviewModal(false)}
              style={{ marginTop: '1.5rem', width: '100%', padding: '0.75rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '0.9rem', cursor: 'pointer' }}
            >
              Close Simulator Preview
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

