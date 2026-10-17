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
  ArrowRight,
  Users,
  CheckSquare,
  Square,
  Activity,
  Trash2,
  Copy,
  TrendingDown
} from 'lucide-react';
import { 
  calculateAggregatedSamples, 
  calculateFastingRequirement,
  getItemLabPricing,
  getDefaultLabPricing,
  getDefaultTierPricing,
  getItemTierPricing,
  getItemPriceForPeople,
  DEFAULT_LAB_PROVIDERS
} from '../../data/catalogStore';
import MultiLabPricingEditor from './catalog/MultiLabPricingEditor';
import MultiPeopleTierPricingEditor from './catalog/MultiPeopleTierPricingEditor';
import SingleTestsSelector from './catalog/SingleTestsSelector';
import { API_BASE, safeFetch } from '../../data/apiConfig';

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

  // Multi-Lab Pricing & Volume Slabs State
  const [labPricingFilterType, setLabPricingFilterType] = useState('ALL'); // 'ALL' | 'TESTS' | 'PROFILES' | 'PACKAGES'
  const [selectedItemForLabPricing, setSelectedItemForLabPricing] = useState(null);
  const [showLabPricingModal, setShowLabPricingModal] = useState(false);
  const [showCareSeekerPreviewModal, setShowCareSeekerPreviewModal] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [globalSuggestedLab, setGlobalSuggestedLab] = useState('Central Partner Hub (Tirupati/Regional)');
  const [labPricingForm, setLabPricingForm] = useState([]);
  const [tierPricingForm, setTierPricingForm] = useState(null);
  const [activeRateModalTab, setActiveRateModalTab] = useState('LABS'); // 'LABS' | 'PEOPLE'
  const [saveToast, setSaveToast] = useState(null);

  // Modals active sub-tabs
  const [activeTestModalTab, setActiveTestModalTab] = useState('DETAILS'); // 'DETAILS' | 'LABS' | 'PEOPLE'
  const [activeProfileModalTab, setActiveProfileModalTab] = useState('DETAILS'); // 'DETAILS' | 'TESTS' | 'LABS' | 'PEOPLE'
  const [activePackageModalTab, setActivePackageModalTab] = useState('COMPONENTS'); // 'COMPONENTS' | 'LABS' | 'PEOPLE'

  // Filtered lists (defined before pagination calculation)
  const filteredTests = (catalog?.tests || []).filter(t => {
    const q = (searchTerm || '').toLowerCase();
    const aliasStr = Array.isArray(t.aliasNames) ? t.aliasNames.join(' ') : (t.aliasNames || '');
    const matchQuery = !q || (t.name && t.name.toLowerCase().includes(q)) || (t.code && t.code.toLowerCase().includes(q)) || aliasStr.toLowerCase().includes(q);
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
    aliasNames: '',
    sampleType: 'SERUM',
    fasting: 'NO',
    mrp: 499,
    price: 299,
    tatHours: 24,
    description: '',
    labPricing: [],
    tierPricing: null
  });

  const [profileForm, setProfileForm] = useState({
    code: '',
    name: '',
    sampleType: 'SERUM',
    fasting: 'NO',
    mrp: 1499,
    price: 899,
    tatHours: 24,
    description: '',
    selectedTests: [],
    labPricing: [],
    tierPricing: null
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
    description: '',
    labPricing: [],
    tierPricing: null
  });
  const [builderSearch, setBuilderSearch] = useState('');

  // OPEN HANDLERS
  const handleOpenCreateTest = () => {
    setEditingItem(null);
    const labs = getDefaultLabPricing(299, 499, 24);
    const tiers = getDefaultTierPricing(299, 499);
    setTestForm({
      code: '',
      name: '',
      aliasNames: '',
      sampleType: 'SERUM',
      fasting: 'NO',
      mrp: 499,
      price: 299,
      tatHours: 24,
      description: '',
      labPricing: labs,
      tierPricing: tiers
    });
    setActiveTestModalTab('DETAILS');
    setShowCreateTestModal(true);
  };

  const handleOpenEditTest = (test) => {
    setEditingItem(test);
    const labs = getItemLabPricing(test);
    const tiers = getItemTierPricing(test);
    const aliasStr = Array.isArray(test.aliasNames) ? test.aliasNames.join(', ') : (test.aliasNames || '');
    setTestForm({
      code: test.code || '',
      name: test.name || '',
      aliasNames: aliasStr,
      sampleType: test.sampleType || 'SERUM',
      fasting: test.fasting || 'NO',
      mrp: test.mrp || 499,
      price: test.price || 299,
      tatHours: test.tatHours || 24,
      description: test.description || '',
      labPricing: JSON.parse(JSON.stringify(labs)),
      tierPricing: JSON.parse(JSON.stringify(tiers))
    });
    setActiveTestModalTab('DETAILS');
    setShowCreateTestModal(true);
  };

  const handleOpenCreateProfile = () => {
    setEditingItem(null);
    const labs = getDefaultLabPricing(899, 1499, 24);
    const tiers = getDefaultTierPricing(899, 1499);
    setProfileForm({
      code: '',
      name: '',
      sampleType: 'SERUM',
      fasting: 'NO',
      mrp: 1499,
      price: 899,
      tatHours: 24,
      description: '',
      selectedTests: [],
      labPricing: labs,
      tierPricing: tiers
    });
    setActiveProfileModalTab('DETAILS');
    setShowCreateProfileModal(true);
  };

  const handleOpenEditProfile = (profile) => {
    setEditingItem(profile);
    const labs = getItemLabPricing(profile);
    const tiers = getItemTierPricing(profile);
    setProfileForm({
      code: profile.code || '',
      name: profile.name || '',
      sampleType: profile.sampleType || 'SERUM',
      fasting: profile.fasting || 'NO',
      mrp: profile.mrp || 1499,
      price: profile.price || 899,
      tatHours: profile.tatHours || 24,
      description: profile.description || '',
      selectedTests: profile.tests || [],
      labPricing: JSON.parse(JSON.stringify(labs)),
      tierPricing: JSON.parse(JSON.stringify(tiers))
    });
    setActiveProfileModalTab('DETAILS');
    setShowCreateProfileModal(true);
  };

  const handleOpenPackageBuilder = (pkg = null) => {
    if (pkg) {
      setEditingItem(pkg);
      const labs = getItemLabPricing(pkg);
      const tiers = getItemTierPricing(pkg);
      setPackageBuilderForm({
        id: pkg.id,
        name: pkg.name || '',
        code: pkg.code || '',
        tagline: pkg.tagline || '',
        category: pkg.category || 'Full Body Wellness',
        mrp: pkg.mrp || 2999,
        price: pkg.price || 1299,
        tatHours: pkg.tatHours || 24,
        description: pkg.description || '',
        selectedProfiles: pkg.profiles || [],
        selectedTests: pkg.tests || [],
        labPricing: JSON.parse(JSON.stringify(labs)),
        tierPricing: JSON.parse(JSON.stringify(tiers))
      });
    } else {
      setEditingItem(null);
      const labs = getDefaultLabPricing(1299, 2999, 24);
      const tiers = getDefaultTierPricing(1299, 2999);
      setPackageBuilderForm({
        name: '',
        code: '',
        tagline: 'Comprehensive Health & Biomarker Screening',
        category: 'Full Body Wellness',
        mrp: 2999,
        price: 1299,
        tatHours: 24,
        description: '',
        selectedProfiles: catalog.profiles?.[0] ? [catalog.profiles[0].code] : [],
        selectedTests: catalog.tests?.[0] ? [catalog.tests[0].code] : [],
        labPricing: labs,
        tierPricing: tiers
      });
    }
    setActivePackageModalTab('COMPONENTS');
    setShowPackageBuilderModal(true);
  };

  // DUPLICATE & DELETE HANDLERS
  const handleDuplicateTest = (test) => {
    setEditingItem(null);
    const labs = getItemLabPricing(test);
    const tiers = getItemTierPricing(test);
    const aliasStr = Array.isArray(test.aliasNames) ? test.aliasNames.join(', ') : (test.aliasNames || '');
    setTestForm({
      code: `${test.code}_COPY`,
      name: `${test.name} (Copy)`,
      aliasNames: aliasStr,
      sampleType: test.sampleType || 'SERUM',
      fasting: test.fasting || 'NO',
      mrp: test.mrp || 499,
      price: test.price || 299,
      tatHours: test.tatHours || 24,
      description: test.description || '',
      labPricing: JSON.parse(JSON.stringify(labs)),
      tierPricing: JSON.parse(JSON.stringify(tiers))
    });
    setActiveTestModalTab('DETAILS');
    setShowCreateTestModal(true);
  };

  const handleDeleteTest = async (test) => {
    if (!window.confirm(`Are you sure you want to delete test "${test.name}" (${test.code})? This will permanently remove it from the catalog.`)) {
      return;
    }

    const updatedTests = (catalog.tests || []).filter(t => t.id !== test.id && t.code !== test.code);
    const updatedCatalog = { ...catalog, tests: updatedTests };
    setCatalog(updatedCatalog);
    saveCatalogState(updatedCatalog);

    try {
      if (safeFetch && API_BASE) {
        await safeFetch(`${API_BASE}/api/v1/catalog/tests/${test.id || test.code}`, {
          method: 'DELETE'
        });
        await safeFetch(`${API_BASE}/api/v1/catalog/sync-full`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tests: updatedTests, profiles: catalog.profiles, packages: catalog.packages })
        });
      }
    } catch (err) {
      console.warn('Delete test backend error:', err);
    }

    setSaveToast(`🗑️ Test "${test.name}" deleted successfully.`);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleDuplicateProfile = (profile) => {
    setEditingItem(null);
    const labs = getItemLabPricing(profile);
    const tiers = getItemTierPricing(profile);
    setProfileForm({
      code: `${profile.code}_COPY`,
      name: `${profile.name} (Copy)`,
      sampleType: profile.sampleType || 'SERUM',
      fasting: profile.fasting || 'NO',
      mrp: profile.mrp || 1499,
      price: profile.price || 899,
      tatHours: profile.tatHours || 24,
      description: profile.description || '',
      selectedTests: profile.tests ? [...profile.tests] : [],
      labPricing: JSON.parse(JSON.stringify(labs)),
      tierPricing: JSON.parse(JSON.stringify(tiers))
    });
    setActiveProfileModalTab('DETAILS');
    setShowCreateProfileModal(true);
  };

  const handleDeleteProfile = async (profile) => {
    if (!window.confirm(`Are you sure you want to delete profile "${profile.name}" (${profile.code})? This will permanently remove it from the catalog.`)) {
      return;
    }

    const updatedProfiles = (catalog.profiles || []).filter(p => p.id !== profile.id && p.code !== profile.code);
    const updatedCatalog = { ...catalog, profiles: updatedProfiles };
    setCatalog(updatedCatalog);
    saveCatalogState(updatedCatalog);

    try {
      if (safeFetch && API_BASE) {
        await safeFetch(`${API_BASE}/api/v1/catalog/profiles/${profile.id || profile.code}`, {
          method: 'DELETE'
        });
        await safeFetch(`${API_BASE}/api/v1/catalog/sync-full`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profiles: updatedProfiles, packages: catalog.packages, tests: catalog.tests })
        });
      }
    } catch (err) {
      console.warn('Delete profile backend error:', err);
    }

    setSaveToast(`🗑️ Diagnostic Profile "${profile.name}" deleted successfully.`);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleDuplicatePackage = (pkg) => {
    setEditingItem(null);
    const labs = getItemLabPricing(pkg);
    const tiers = getItemTierPricing(pkg);
    setPackageBuilderForm({
      id: null,
      name: `${pkg.name} (Copy)`,
      code: `${pkg.code}_COPY`,
      tagline: pkg.tagline || '',
      category: pkg.category || 'Full Body Wellness',
      mrp: pkg.mrp || 2999,
      price: pkg.price || 1299,
      tatHours: pkg.tatHours || 24,
      description: pkg.description || '',
      selectedProfiles: pkg.profiles ? [...pkg.profiles] : [],
      selectedTests: pkg.tests ? [...pkg.tests] : [],
      labPricing: JSON.parse(JSON.stringify(labs)),
      tierPricing: JSON.parse(JSON.stringify(tiers))
    });
    setActivePackageModalTab('DETAILS');
    setShowPackageBuilderModal(true);
  };

  const handleDeletePackage = async (pkg) => {
    if (!window.confirm(`Are you sure you want to delete health package "${pkg.name}" (${pkg.code})? This will permanently remove it from the catalog.`)) {
      return;
    }

    const updatedPackages = (catalog.packages || []).filter(p => p.id !== pkg.id && p.code !== pkg.code);
    const updatedCatalog = { ...catalog, packages: updatedPackages };
    setCatalog(updatedCatalog);
    saveCatalogState(updatedCatalog);

    try {
      if (safeFetch && API_BASE) {
        await safeFetch(`${API_BASE}/api/v1/catalog/packages/${pkg.id || pkg.code}`, {
          method: 'DELETE'
        });
        await safeFetch(`${API_BASE}/api/v1/catalog/sync-full`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packages: updatedPackages, profiles: catalog.profiles, tests: catalog.tests })
        });
      }
    } catch (err) {
      console.warn('Delete package backend error:', err);
    }

    setSaveToast(`🗑️ Health Package "${pkg.name}" deleted successfully.`);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleOpenLabPricingModal = (item) => {
    setSelectedItemForLabPricing(item);
    const existingLabs = getItemLabPricing(item);
    const existingTiers = getItemTierPricing(item);
    setLabPricingForm(JSON.parse(JSON.stringify(existingLabs)));
    setTierPricingForm(JSON.parse(JSON.stringify(existingTiers)));
    setActiveRateModalTab('LABS');
    setShowLabPricingModal(true);
  };

  const handleOpenPreview = (item) => {
    setPreviewItem(item);
    setShowCareSeekerPreviewModal(true);
  };

  // SAVE HANDLERS
  const handleSaveTest = async (e) => {
    if (e) e.preventDefault();
    const baseP = Number(testForm.price) || 299;
    const baseM = Number(testForm.mrp) || Math.round(baseP * 1.6);
    const tat = Number(testForm.tatHours) || 24;

    const effectiveLabs = (testForm.labPricing && testForm.labPricing.length > 0)
      ? testForm.labPricing
      : getDefaultLabPricing(baseP, baseM, tat);

    const effectiveTiers = (testForm.tierPricing && testForm.tierPricing['1'])
      ? testForm.tierPricing
      : getDefaultTierPricing(baseP, baseM);

    const aliasArray = typeof testForm.aliasNames === 'string'
      ? testForm.aliasNames.split(',').map(s => s.trim()).filter(Boolean)
      : (Array.isArray(testForm.aliasNames) ? testForm.aliasNames : []);

    const newTest = {
      id: editingItem ? editingItem.id : `TEST_${(catalog.tests?.length || 0) + 1}`,
      serialNo: editingItem ? editingItem.serialNo : (catalog.tests?.length || 0) + 1,
      code: testForm.code.trim().toUpperCase(),
      name: testForm.name.trim(),
      aliasNames: aliasArray,
      sampleType: testForm.sampleType.trim().toUpperCase(),
      fasting: testForm.fasting.trim().toUpperCase(),
      category: 'Individual Test',
      mrp: baseM,
      price: baseP,
      tatHours: tat,
      description: testForm.description || `Clinical laboratory biomarker test for ${testForm.name}.`,
      labPricing: effectiveLabs,
      tierPricing: effectiveTiers,
      active: true
    };

    let updatedTests = [...(catalog.tests || [])];
    if (editingItem) {
      updatedTests = updatedTests.map(t => (t.id === editingItem.id || t.code === editingItem.code) ? newTest : t);
    } else {
      updatedTests.unshift(newTest);
    }

    const updatedCatalog = { ...catalog, tests: updatedTests };
    setCatalog(updatedCatalog);
    saveCatalogState(updatedCatalog);

    // Persist to backend server API
    try {
      await safeFetch(`${API_BASE}/api/v1/catalog/tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTest)
      });

      await safeFetch(`${API_BASE}/api/v1/catalog/sync-full`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tests: updatedTests, profiles: catalog.profiles, packages: catalog.packages })
      });
    } catch (err) {
      console.warn('Backend test sync:', err);
    }

    setShowCreateTestModal(false);
    setEditingItem(null);
    setSaveToast(`Single Test "${newTest.name}" saved with multi-lab rates & volume slabs!`);
    setTimeout(() => setSaveToast(null), 4000);
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    const baseP = Number(profileForm.price) || 899;
    const baseM = Number(profileForm.mrp) || Math.round(baseP * 1.6);
    const tat = Number(profileForm.tatHours) || 24;

    const effectiveLabs = (profileForm.labPricing && profileForm.labPricing.length > 0)
      ? profileForm.labPricing
      : getDefaultLabPricing(baseP, baseM, tat);

    const effectiveTiers = (profileForm.tierPricing && profileForm.tierPricing['1'])
      ? profileForm.tierPricing
      : getDefaultTierPricing(baseP, baseM);

    const selectedTests = profileForm.selectedTests || [];
    const derivedSamples = selectedTests.length > 0 
      ? calculateAggregatedSamples([], selectedTests, [], catalog.tests).join(', ')
      : (profileForm.sampleType || 'SERUM');

    const derivedFasting = selectedTests.length > 0 
      ? (calculateFastingRequirement([], selectedTests, [], catalog.tests) ? 'YES' : 'NO')
      : (profileForm.fasting || 'NO');

    const newProfile = {
      id: editingItem ? editingItem.id : `PROF_${(catalog.profiles?.length || 0) + 1}`,
      serialNo: editingItem ? editingItem.serialNo : (catalog.profiles?.length || 0) + 1,
      code: profileForm.code.trim().toUpperCase(),
      name: profileForm.name.trim(),
      sampleType: derivedSamples,
      fasting: derivedFasting,
      category: 'Diagnostic Profile',
      mrp: baseM,
      price: baseP,
      tatHours: tat,
      description: profileForm.description || `Diagnostic profile panel for ${profileForm.name}.`,
      tests: selectedTests,
      testCount: selectedTests.length || 1,
      labPricing: effectiveLabs,
      tierPricing: effectiveTiers,
      active: true
    };

    let updatedProfiles = [...(catalog.profiles || [])];
    if (editingItem) {
      updatedProfiles = updatedProfiles.map(p => (p.id === editingItem.id || p.code === editingItem.code) ? newProfile : p);
    } else {
      updatedProfiles.unshift(newProfile);
    }

    const updatedCatalog = { ...catalog, profiles: updatedProfiles };
    setCatalog(updatedCatalog);
    saveCatalogState(updatedCatalog);

    // Persist to backend server API
    try {
      await safeFetch(`${API_BASE}/api/v1/catalog/profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile)
      });

      await safeFetch(`${API_BASE}/api/v1/catalog/sync-full`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profiles: updatedProfiles, packages: catalog.packages, tests: catalog.tests })
      });
    } catch (err) {
      console.warn('Backend profile sync:', err);
    }

    setShowCreateProfileModal(false);
    setEditingItem(null);
    setSaveToast(`Diagnostic Profile "${newProfile.name}" (${selectedTests.length} tests) saved with multi-lab rates & volume slabs!`);
    setTimeout(() => setSaveToast(null), 4000);
  };

  const handleSavePackage = async (e) => {
    if (e) e.preventDefault();
    const baseP = Number(packageBuilderForm.price) || 1299;
    const baseM = Number(packageBuilderForm.mrp) || Math.round(baseP * 2);
    const tat = Number(packageBuilderForm.tatHours) || 24;

    const selectedProfiles = packageBuilderForm.selectedProfiles || [];
    const selectedTests = packageBuilderForm.selectedTests || [];

    const sampleTypes = calculateAggregatedSamples(
      selectedProfiles,
      selectedTests,
      catalog.profiles,
      catalog.tests
    );

    const requiresFasting = calculateFastingRequirement(
      selectedProfiles,
      selectedTests,
      catalog.profiles,
      catalog.tests
    );

    const effectiveLabs = (packageBuilderForm.labPricing && packageBuilderForm.labPricing.length > 0)
      ? packageBuilderForm.labPricing
      : getDefaultLabPricing(baseP, baseM, tat);

    const effectiveTiers = (packageBuilderForm.tierPricing && packageBuilderForm.tierPricing['1'])
      ? packageBuilderForm.tierPricing
      : getDefaultTierPricing(baseP, baseM);

    const newPkg = {
      id: editingItem ? editingItem.id : (packageBuilderForm.id || `PKG_${Date.now()}`),
      name: packageBuilderForm.name.trim(),
      code: (packageBuilderForm.code || `MM_PKG_${Date.now().toString().slice(-4)}`).toUpperCase(),
      tagline: packageBuilderForm.tagline,
      category: packageBuilderForm.category,
      mrp: baseM,
      price: baseP,
      discountPercent: Math.round(((baseM - baseP) / baseM) * 100) || 50,
      fasting: requiresFasting ? 'YES' : 'NO',
      fastingNote: requiresFasting ? '8-10 hours overnight fasting recommended' : 'No fasting required',
      sampleTypes,
      tatHours: tat,
      popular: true,
      profiles: selectedProfiles,
      tests: selectedTests,
      testCount: (selectedProfiles.length * 8) + selectedTests.length,
      description: packageBuilderForm.description || `Comprehensive package composed of ${selectedProfiles.length} profiles and ${selectedTests.length} tests.`,
      labPricing: effectiveLabs,
      tierPricing: effectiveTiers
    };

    let updatedPackages = [...(catalog.packages || [])];
    if (editingItem) {
      updatedPackages = updatedPackages.map(p => (p.id === editingItem.id || p.code === editingItem.code) ? newPkg : p);
    } else {
      updatedPackages.unshift(newPkg);
    }

    const updatedCatalog = { ...catalog, packages: updatedPackages };
    setCatalog(updatedCatalog);
    saveCatalogState(updatedCatalog);

    // Persist to backend server API
    try {
      await safeFetch(`${API_BASE}/api/v1/catalog/packages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPkg)
      });

      await safeFetch(`${API_BASE}/api/v1/catalog/sync-full`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packages: updatedPackages, profiles: catalog.profiles, tests: catalog.tests })
      });
    } catch (err) {
      console.warn('Backend package sync:', err);
    }

    setShowPackageBuilderModal(false);
    setEditingItem(null);
    setSaveToast(`Package "${newPkg.name}" (${newPkg.profiles.length} profiles, ${newPkg.tests.length} tests) saved with multi-lab rates & volume slabs!`);
    setTimeout(() => setSaveToast(null), 4000);
  };

  const handleSaveLabPricing = async (e) => {
    if (e) e.preventDefault();
    if (!selectedItemForLabPricing) return;

    const itemId = selectedItemForLabPricing.id || selectedItemForLabPricing.code;
    const isPkg = selectedItemForLabPricing.itemType === 'PACKAGE' || selectedItemForLabPricing.profiles;
    const isProf = selectedItemForLabPricing.itemType === 'PROFILE' || (!selectedItemForLabPricing.serialNo && selectedItemForLabPricing.code?.length <= 6);

    let updatedCatalog = { ...catalog };
    const medmargOpt = labPricingForm.find(l => l.isMedmargSuggested) || labPricingForm[0];

    const patchItem = (item) => ({
      ...item,
      labPricing: labPricingForm,
      tierPricing: tierPricingForm,
      price: medmargOpt?.price || item.price,
      mrp: medmargOpt?.mrp || item.mrp
    });

    if (isPkg) {
      updatedCatalog.packages = (catalog.packages || []).map(p => (p.id === itemId || p.code === itemId) ? patchItem(p) : p);
    } else if (isProf) {
      updatedCatalog.profiles = (catalog.profiles || []).map(p => (p.id === itemId || p.code === itemId) ? patchItem(p) : p);
    } else {
      updatedCatalog.tests = (catalog.tests || []).map(t => (t.id === itemId || t.code === itemId) ? patchItem(t) : t);
    }

    setCatalog(updatedCatalog);
    saveCatalogState(updatedCatalog);

    try {
      await safeFetch(`${API_BASE}/api/v1/catalog/sync-full`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packages: updatedCatalog.packages, profiles: updatedCatalog.profiles, tests: updatedCatalog.tests })
      });
    } catch (err) {
      console.warn('Backend sync-full on pricing save:', err);
    }

    setShowLabPricingModal(false);
    setSelectedItemForLabPricing(null);
    setSaveToast(`Pricing and volume slabs for ${selectedItemForLabPricing.name || selectedItemForLabPricing.code} updated across all labs!`);
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
          <div style={{ fontSize: '0.78rem', color: '#006B70', fontWeight: '800', letterSpacing: '0.05em' }}>3-LAB & VOLUME MATRIX</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>
            Multi-Lab & Volume
          </div>
          <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '700', marginTop: '0.2rem' }}>
            MedMarg • Thyrocare • Lalpath • 1P/2P/5P/10+P
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.25rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.78rem', color: '#006B70', fontWeight: '800', letterSpacing: '0.05em' }}>SINGLE BIOMARKER TESTS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>
            {catalog.tests?.length ?? 1} <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: '700' }}>Individual</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>Single tests with multi-lab & people rates</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.25rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.78rem', color: '#D97706', fontWeight: '800', letterSpacing: '0.05em' }}>DIAGNOSTIC PROFILES</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>
            {catalog.profiles?.length ?? 1} <span style={{ fontSize: '0.85rem', color: '#D97706', fontWeight: '700' }}>Panels</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>Combinations of single tests</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.25rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.78rem', color: '#7E22CE', fontWeight: '800', letterSpacing: '0.05em' }}>HEALTH PACKAGES</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>
            {catalog.packages?.length ?? 1} <span style={{ fontSize: '0.85rem', color: '#7E22CE', fontWeight: '700' }}>Promoted</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>Combinations of profiles & tests</div>
        </div>
      </div>

      {/* Subtabs Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.85rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { key: 'LAB_PRICING', label: 'Rate & Slabs Desk', icon: DollarSign, count: (catalog.tests?.length || 0) + (catalog.profiles?.length || 0) + (catalog.packages?.length || 0) },
            { key: 'TESTS', label: 'Single Tests Master', icon: FlaskConical, count: catalog.tests?.length ?? 0 },
            { key: 'PROFILES', label: 'Diagnostic Profiles', icon: Layers, count: catalog.profiles?.length ?? 0 },
            { key: 'PACKAGES', label: 'Health Packages', icon: Package, count: catalog.packages?.length ?? 0 }
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
              onClick={handleOpenCreateTest}
              style={{ padding: '0.6rem 1.2rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(0,107,112,0.2)' }}
            >
              <PlusCircle size={16} /> + Add Single Test
            </button>
          )}
          {testsSubTab === 'PROFILES' && (
            <button 
              onClick={handleOpenCreateProfile}
              style={{ padding: '0.6rem 1.2rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(0,107,112,0.2)' }}
            >
              <PlusCircle size={16} /> + Compose Diagnostic Profile
            </button>
          )}
          {testsSubTab === 'PACKAGES' && (
            <button 
              onClick={() => handleOpenPackageBuilder(null)}
              style={{ padding: '0.6rem 1.2rem', backgroundColor: '#D97706', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(217,119,6,0.2)' }}
            >
              <Plus size={16} /> Visual Package Builder
            </button>
          )}
        </div>
      </div>

      {/* 1. RATE & SLABS DESK (MEDMARG SUGGESTED, THYROCARE, DR. LAL PATHLABS + VOLUME SLABS) */}
      {testsSubTab === 'LAB_PRICING' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Hub Configuration & Multi-Lab Global Banner */}
          <div style={{ backgroundColor: '#F8FAFC', borderRadius: '18px', border: '1.5px solid #CBD5E1', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '42px', height: '42px', backgroundColor: '#006B70', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
                <Building2 size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#0F172A' }}>
                  Laboratory Partners & Volume Tier Master Desk
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.15rem' }}>
                  Manage multiple lab rates and multi-person volume slabs (1, 2, 5, 10+ people) across tests, profiles, and packages.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#004D40' }}>MedMarg Hub Partner:</span>
              <input
                type="text"
                value={globalSuggestedLab}
                onChange={(e) => setGlobalSuggestedLab(e.target.value)}
                placeholder="e.g. Central Partner Hub (Tirupati)"
                style={{ padding: '0.45rem 0.75rem', border: '1.5px solid #006B70', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '700', color: '#0F172A', minWidth: '220px' }}
              />
              <button
                onClick={handleApplyGlobalSuggestedLab}
                style={{ padding: '0.45rem 0.9rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}
              >
                Apply to All Items
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {[
                { key: 'ALL', label: 'All Items' },
                { key: 'TESTS', label: 'Single Tests Only' },
                { key: 'PROFILES', label: 'Diagnostic Profiles Only' },
                { key: 'PACKAGES', label: 'Health Packages Only' }
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => { setLabPricingFilterType(f.key); setCurrentPage(1); }}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    border: labPricingFilterType === f.key ? 'none' : '1px solid #CBD5E1',
                    backgroundColor: labPricingFilterType === f.key ? '#006B70' : '#FFFFFF',
                    color: labPricingFilterType === f.key ? '#FFF' : '#475569',
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
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

          {/* Pricing Matrix Table */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1.5px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 18px rgba(0,0,0,0.03)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '1rem 1.25rem', width: '25%' }}>Item & Specifications</th>
                  <th style={{ padding: '1rem 1.25rem', width: '22%', backgroundColor: 'rgba(0, 107, 112, 0.06)', borderLeft: '2px solid #006B70' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: '900', color: '#006B70' }}>1. MEDMARG</span>
                      <span style={{ fontSize: '0.68rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: '900' }}>SMART PICK</span>
                    </div>
                  </th>
                  <th style={{ padding: '1rem 1.25rem', width: '18%', borderLeft: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: '900', color: '#B91C1C' }}>2. THYROCARE</span>
                    </div>
                  </th>
                  <th style={{ padding: '1rem 1.25rem', width: '18%', borderLeft: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: '900', color: '#D97706' }}>3. DR. LAL PATHLABS</span>
                    </div>
                  </th>
                  <th style={{ padding: '1rem 1.25rem', width: '17%', borderLeft: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Users size={14} color="#7E22CE" />
                      <span style={{ fontSize: '0.88rem', fontWeight: '900', color: '#7E22CE' }}>PEOPLE SLABS</span>
                    </div>
                  </th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'center', width: '10%' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLabItems.map((item, idx) => {
                  const pricing = getItemLabPricing(item);
                  const tiers = getItemTierPricing(item);
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
                            {isPkg ? 'PACKAGE' : isProf ? `PROFILE (${item.tests?.length || item.testCount || 1} Tests)` : 'SINGLE TEST'}
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

                      {/* 2. MedMarg Suggested Lab */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle', backgroundColor: 'rgba(0, 107, 112, 0.03)', borderLeft: '2px solid #006B70' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                          <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#006B70' }}>
                            MedMarg
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '800' }}>
                            ★ Curated
                          </span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '700', marginTop: '0.1rem' }}>
                          via <span style={{ color: '#004D40', fontWeight: '800' }}>{medmargLab?.suggestedLabName || globalSuggestedLab}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>
                            ₹{thyrocareLab?.price || Math.round((item.price || 299) * 1.15)}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                            ₹{thyrocareLab?.mrp || Math.round((item.mrp || 499) * 1.1)}
                          </span>
                        </div>
                      </td>

                      {/* 4. Dr. Lal PathLabs */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle', borderLeft: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#D97706' }}>
                          Dr. Lal PathLabs
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>
                            ₹{lalpathLab?.price || Math.round((item.price || 299) * 1.30)}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                            ₹{lalpathLab?.mrp || Math.round((item.mrp || 499) * 1.25)}
                          </span>
                        </div>
                      </td>

                      {/* 5. Volume Slabs (People) */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle', borderLeft: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.74rem' }}>
                          <span style={{ backgroundColor: '#F0FDF4', color: '#006B70', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: '800' }}>
                            1P: ₹{tiers['1']?.offerPrice || tiers['1']?.pricePerPerson || item.price || 299}
                          </span>
                          <span style={{ backgroundColor: '#F0F9FF', color: '#0284C7', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: '800' }}>
                            2P: ₹{tiers['2']?.offerPrice || tiers['2']?.pricePerPerson}/p
                          </span>
                          <span style={{ backgroundColor: '#FFFBEB', color: '#D97706', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: '800' }}>
                            5P: ₹{tiers['5']?.offerPrice || tiers['5']?.pricePerPerson}/p
                          </span>
                          <span style={{ backgroundColor: '#FAF5FF', color: '#7E22CE', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: '800' }}>
                            10+P: ₹{tiers['10']?.offerPrice || tiers['10']?.pricePerPerson}/p
                          </span>
                        </div>
                      </td>

                      {/* 6. Actions */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center' }}>
                          <button
                            title="Edit Multi-Lab Rates & Volume Slabs"
                            onClick={() => handleOpenLabPricingModal(item)}
                            style={{ padding: '0.45rem 0.85rem', backgroundColor: '#006B70', border: 'none', borderRadius: '8px', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem', fontWeight: '900', width: '100%', justifyContent: 'center' }}
                          >
                            <Sliders size={14} /> Edit Rates & Slabs
                          </button>
                          <button
                            title="Preview Care Seeker Card"
                            onClick={() => handleOpenPreview(item)}
                            style={{ padding: '0.35rem 0.65rem', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.74rem', fontWeight: '700', width: '100%', justifyContent: 'center' }}
                          >
                            <Eye size={13} /> Preview
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

      {/* 2. SINGLE TESTS MASTER TAB */}
      {testsSubTab === 'TESTS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Top Filter & Search Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
              <Search size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                placeholder={`Search ${catalog.tests?.length || 913} single tests by name, code, or tube...`}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.4rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#0F172A', fontSize: '0.86rem', outline: 'none' }}
              />
            </div>

            {/* Pagination controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
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
                    ←
                  </button>
                  <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F172A', padding: '0 0.3rem' }}>
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    style={{ padding: '0.4rem 0.75rem', backgroundColor: currentPage >= totalPages ? '#F1F5F9' : '#006B70', color: currentPage >= totalPages ? '#94A3B8' : '#FFF', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer' }}
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tests Table */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
                  <th style={{ padding: '1rem 1.25rem', width: '15%' }}>SERIAL / CODE</th>
                  <th style={{ padding: '1rem', width: '25%' }}>TEST NAME</th>
                  <th style={{ padding: '1rem', width: '14%' }}>SPECIMEN & FASTING</th>
                  <th style={{ padding: '1rem', width: '22%' }}>MULTI-LAB RATES (₹)</th>
                  <th style={{ padding: '1rem', width: '14%' }}>VOLUME SLABS (1P-10P)</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'right', width: '10%' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTests.map(test => {
                  const labs = getItemLabPricing(test);
                  const tiers = getItemTierPricing(test);
                  const medmargLab = labs[0];
                  const thyrocareLab = labs[1];
                  const lalpathLab = labs[2];

                  return (
                    <tr key={test.id || test.code} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', color: '#006B70', fontWeight: '800' }}>
                        #{test.serialNo || '-'} • {test.code}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: '700', color: '#0F172A' }}>
                        <div>{test.name}</div>
                        {test.aliasNames && (Array.isArray(test.aliasNames) ? test.aliasNames : test.aliasNames.split(',')).length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.3rem' }}>
                            {(Array.isArray(test.aliasNames) ? test.aliasNames : test.aliasNames.split(',')).map((alias, aIdx) => (
                              <span key={aIdx} style={{ fontSize: '0.68rem', backgroundColor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '700' }}>
                                aka: {alias.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                        <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '500', marginTop: '0.2rem' }}>
                          TAT: {test.tatHours || 24} Hours
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span style={{ backgroundColor: '#F1F5F9', padding: '0.15rem 0.45rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.75rem', fontWeight: '700', color: '#334155' }}>
                            🩸 {test.sampleType || 'SERUM'}
                          </span>
                          <span style={{ fontSize: '0.72rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '800', backgroundColor: test.fasting === 'YES' ? '#FEF3C7' : '#DCFCE7', color: test.fasting === 'YES' ? '#B45309' : '#15803D' }}>
                            ⏱ Fasting: {test.fasting || 'NO'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.76rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#006B70', fontWeight: '800' }}>
                            <span>MedMarg:</span>
                            <span>₹{medmargLab?.price || test.price} <span style={{ textDecoration: 'line-through', color: '#94A3B8', fontWeight: '500' }}>₹{medmargLab?.mrp || test.mrp}</span></span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#B91C1C', fontWeight: '700' }}>
                            <span>Thyrocare:</span>
                            <span>₹{thyrocareLab?.price || Math.round((test.price || 299) * 1.15)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#D97706', fontWeight: '700' }}>
                            <span>Dr. Lal:</span>
                            <span>₹{lalpathLab?.price || Math.round((test.price || 299) * 1.30)}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', fontSize: '0.72rem' }}>
                          <span style={{ backgroundColor: '#F0FDF4', color: '#006B70', padding: '0.15rem 0.35rem', borderRadius: '4px', fontWeight: '800' }}>
                            1P: ₹{tiers['1']?.offerPrice || test.price}
                          </span>
                          <span style={{ backgroundColor: '#F0F9FF', color: '#0284C7', padding: '0.15rem 0.35rem', borderRadius: '4px', fontWeight: '800' }}>
                            2P: ₹{tiers['2']?.offerPrice}/p
                          </span>
                          <span style={{ backgroundColor: '#FFFBEB', color: '#D97706', padding: '0.15rem 0.35rem', borderRadius: '4px', fontWeight: '800' }}>
                            5P: ₹{tiers['5']?.offerPrice}/p
                          </span>
                          <span style={{ backgroundColor: '#FAF5FF', color: '#7E22CE', padding: '0.15rem 0.35rem', borderRadius: '4px', fontWeight: '800' }}>
                            10+P: ₹{tiers['10']?.offerPrice}/p
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          <button 
                            title="Duplicate Single Test"
                            onClick={() => handleDuplicateTest(test)}
                            style={{ padding: '0.4rem 0.65rem', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#006B70', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '800', fontSize: '0.76rem' }}
                          >
                            <Copy size={13} /> Duplicate
                          </button>
                          <button 
                            title="Edit Single Test & Multi-Lab Rates"
                            onClick={() => handleOpenEditTest(test)}
                            style={{ padding: '0.4rem 0.65rem', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0284C7', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '800', fontSize: '0.76rem' }}
                          >
                            <Edit3 size={13} /> Edit
                          </button>
                          <button 
                            title="Delete Single Test"
                            onClick={() => handleDeleteTest(test)}
                            style={{ padding: '0.4rem 0.55rem', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Trash2 size={13} />
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

      {/* 3. PROFILES TAB (COMBINATIONS OF SINGLE TESTS) */}
      {testsSubTab === 'PROFILES' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Profiles Table */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
                  <th style={{ padding: '1rem 1.25rem', width: '15%' }}>PROFILE CODE</th>
                  <th style={{ padding: '1rem', width: '22%' }}>PROFILE NAME</th>
                  <th style={{ padding: '1rem', width: '20%' }}>INCLUDED SINGLE TESTS</th>
                  <th style={{ padding: '1rem', width: '13%' }}>SPECIMEN & FASTING</th>
                  <th style={{ padding: '1rem', width: '18%' }}>MULTI-LAB RATES</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'right', width: '12%' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map(profile => {
                  const labs = getItemLabPricing(profile);
                  const tiers = getItemTierPricing(profile);
                  const testsCount = (profile.tests && profile.tests.length > 0)
                    ? profile.tests.length
                    : (profile.testCount || 0);

                  return (
                    <tr key={profile.id || profile.code} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', color: '#B45309', fontWeight: '800' }}>
                        {profile.code}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: '700', color: '#0F172A' }}>
                        {profile.name}
                        <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '500', marginTop: '0.15rem' }}>
                          {profile.description?.slice(0, 50) || 'Diagnostic biomarker panel'}...
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                          <span style={{ 
                            backgroundColor: '#E0F2FE', 
                            color: '#0369A1', 
                            padding: '0.2rem 0.55rem', 
                            borderRadius: '6px', 
                            fontWeight: '800', 
                            fontSize: '0.78rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            width: 'fit-content'
                          }}>
                            🔬 {testsCount} Single Tests Included
                          </span>
                          {profile.tests && profile.tests.length > 0 && (
                            <div style={{ fontSize: '0.72rem', color: '#64748B', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                              {profile.tests.slice(0, 4).map(c => (
                                <span key={c} style={{ backgroundColor: '#F1F5F9', padding: '0.1rem 0.35rem', borderRadius: '4px', fontFamily: 'monospace' }}>
                                  {c}
                                </span>
                              ))}
                              {profile.tests.length > 4 && <span>+{profile.tests.length - 4} more</span>}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span style={{ backgroundColor: '#F1F5F9', padding: '0.15rem 0.45rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.74rem', fontWeight: '700', color: '#334155' }}>
                            🩸 {profile.sampleType || 'SERUM'}
                          </span>
                          <span style={{ fontSize: '0.72rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '800', backgroundColor: profile.fasting === 'YES' ? '#FEF3C7' : '#DCFCE7', color: profile.fasting === 'YES' ? '#B45309' : '#15803D' }}>
                            ⏱ Fasting: {profile.fasting || 'NO'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.76rem' }}>
                          <span style={{ color: '#006B70', fontWeight: '800' }}>
                            MedMarg: ₹{labs[0]?.price || profile.price}
                          </span>
                          <span style={{ color: '#B91C1C', fontWeight: '700' }}>
                            Thyrocare: ₹{labs[1]?.price || Math.round((profile.price || 899) * 1.15)}
                          </span>
                          <span style={{ color: '#D97706', fontWeight: '700' }}>
                            Dr. Lal: ₹{labs[2]?.price || Math.round((profile.price || 899) * 1.30)}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          <button 
                            title="Duplicate Profile"
                            onClick={() => handleDuplicateProfile(profile)}
                            style={{ padding: '0.45rem 0.7rem', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#006B70', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '800', fontSize: '0.78rem' }}
                          >
                            <Copy size={13} /> Duplicate
                          </button>
                          <button 
                            title="Edit Profile & Included Tests"
                            onClick={() => handleOpenEditProfile(profile)}
                            style={{ padding: '0.45rem 0.75rem', backgroundColor: '#006B70', border: 'none', borderRadius: '8px', color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '800', fontSize: '0.78rem' }}
                          >
                            <Edit3 size={14} /> Edit Tests & Rates
                          </button>
                          <button 
                            title="Delete Diagnostic Profile"
                            onClick={() => handleDeleteProfile(profile)}
                            style={{ padding: '0.45rem 0.55rem', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Trash2 size={14} />
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

      {/* 4. HEALTH PACKAGES TAB (COMBINATIONS OF PROFILES & TESTS) - TABULAR FORMAT */}
      {testsSubTab === 'PACKAGES' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
                  <th style={{ padding: '1rem 1.25rem', width: '14%' }}>PACKAGE CODE</th>
                  <th style={{ padding: '1rem', width: '24%' }}>PACKAGE NAME & TAGLINE</th>
                  <th style={{ padding: '1rem', width: '20%' }}>INCLUDED PROFILES & TESTS</th>
                  <th style={{ padding: '1rem', width: '14%' }}>SPECIMEN & FASTING</th>
                  <th style={{ padding: '1rem', width: '16%' }}>PRICING & SLABS</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'right', width: '12%' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {(catalog.packages || []).map(pkg => {
                  const labs = getItemLabPricing(pkg);
                  const tiers = getItemTierPricing(pkg);
                  const profileList = pkg.profiles || [];
                  const testList = pkg.tests || [];

                  return (
                    <tr key={pkg.id || pkg.code} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span style={{ fontFamily: 'monospace', color: '#7E22CE', fontWeight: '900', fontSize: '0.88rem' }}>
                            {pkg.code}
                          </span>
                          <span style={{ fontSize: '0.7rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.12rem 0.45rem', borderRadius: '4px', fontWeight: '800', width: 'fit-content' }}>
                            {pkg.discountPercent || 50}% OFF • {pkg.category || 'Package'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.92rem' }}>
                          {pkg.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem', lineHeight: 1.3 }}>
                          {pkg.tagline || pkg.description}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                            <span style={{ backgroundColor: '#E0F2FE', color: '#0369A1', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: '800', fontSize: '0.75rem' }}>
                              🔬 {profileList.length} Profiles
                            </span>
                            <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: '800', fontSize: '0.75rem' }}>
                              🧪 {testList.length} Tests
                            </span>
                          </div>
                          <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '800' }}>
                            ✓ {pkg.testCount || (profileList.length * 8 + testList.length)}+ Total Biomarkers
                          </span>
                          {(profileList.length > 0 || testList.length > 0) && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', fontSize: '0.7rem', color: '#64748B' }}>
                              {profileList.map(c => (
                                <span key={c} style={{ backgroundColor: '#F1F5F9', padding: '0.1rem 0.35rem', borderRadius: '4px', fontFamily: 'monospace' }}>
                                  {c}
                                </span>
                              ))}
                              {testList.map(c => (
                                <span key={c} style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.1rem 0.35rem', borderRadius: '4px', fontFamily: 'monospace' }}>
                                  {c}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span style={{ backgroundColor: '#F1F5F9', padding: '0.15rem 0.45rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.74rem', fontWeight: '700', color: '#334155' }}>
                            🩸 {Array.isArray(pkg.sampleTypes) ? pkg.sampleTypes.join(', ') : (pkg.sampleTypes || 'SERUM, EDTA')}
                          </span>
                          <span style={{ fontSize: '0.72rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '800', backgroundColor: pkg.fasting === 'YES' ? '#FEF3C7' : '#DCFCE7', color: pkg.fasting === 'YES' ? '#B45309' : '#15803D' }}>
                            ⏱ Fasting: {pkg.fasting || 'YES'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                            <span style={{ fontSize: '1.15rem', fontWeight: '900', color: '#006B70' }}>₹{pkg.price}</span>
                            <span style={{ fontSize: '0.78rem', color: '#94A3B8', textDecoration: 'line-through' }}>₹{pkg.mrp}</span>
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', fontSize: '0.7rem' }}>
                            <span style={{ backgroundColor: '#F0FDF4', color: '#006B70', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: '800' }}>
                              1P: ₹{tiers['1']?.offerPrice || pkg.price}
                            </span>
                            <span style={{ backgroundColor: '#F0F9FF', color: '#0284C7', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: '800' }}>
                              2P: ₹{tiers['2']?.offerPrice}/p
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          <button 
                            title="Duplicate Health Package"
                            onClick={() => handleDuplicatePackage(pkg)}
                            style={{ padding: '0.45rem 0.7rem', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#006B70', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '800', fontSize: '0.76rem' }}
                          >
                            <Copy size={13} /> Duplicate
                          </button>
                          <button 
                            title="Edit Health Package in Visual Builder"
                            onClick={() => handleOpenPackageBuilder(pkg)}
                            style={{ padding: '0.45rem 0.75rem', backgroundColor: '#006B70', border: 'none', borderRadius: '8px', color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '800', fontSize: '0.78rem' }}
                          >
                            <Edit3 size={13} /> Edit
                          </button>
                          <button 
                            title="Delete Health Package"
                            onClick={() => handleDeletePackage(pkg)}
                            style={{ padding: '0.45rem 0.55rem', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Trash2 size={14} />
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


      {/* MODAL 1: ADD / EDIT SINGLE TEST (WITH MULTI-LAB & VOLUME SLABS) */}
      {showCreateTestModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', maxWidth: '850px', width: '100%', padding: '2rem', border: '1px solid #CBD5E1', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#E0F2F1', color: '#006B70', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '900' }}>
                  SINGLE TEST MASTER
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem', margin: 0 }}>
                  {editingItem ? `Edit Test: ${editingItem.name}` : 'Add New Single Biomarker Test'}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.15rem' }}>
                  Configure individual test details, certified multi-lab rates, and multi-person volume slabs.
                </div>
              </div>
              <button onClick={() => setShowCreateTestModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '1.3rem', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Modal Subtabs */}
            <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              {[
                { key: 'DETAILS', label: '1. Clinical Details & Sample', icon: FlaskConical },
                { key: 'LABS', label: '2. Multi-Lab Prices (3+ Labs)', icon: Building2 },
                { key: 'PEOPLE', label: '3. Multi-Person Volume Slabs', icon: Users }
              ].map(t => (
                <button
                  type="button"
                  key={t.key}
                  onClick={() => setActiveTestModalTab(t.key)}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    border: activeTestModalTab === t.key ? 'none' : '1px solid #CBD5E1',
                    backgroundColor: activeTestModalTab === t.key ? '#006B70' : '#F8FAFC',
                    color: activeTestModalTab === t.key ? '#FFFFFF' : '#475569',
                    fontSize: '0.84rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <t.icon size={15} />
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveTest} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* TAB 1: CLINICAL DETAILS */}
              {activeTestModalTab === 'DETAILS' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '800', display: 'block', marginBottom: '0.2rem' }}>Test Code *</label>
                      <input
                        type="text"
                        value={testForm.code}
                        onChange={(e) => setTestForm({ ...testForm, code: e.target.value })}
                        placeholder="e.g. VITDC"
                        required
                        style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#006B70', fontWeight: '900', fontFamily: 'monospace', fontSize: '0.88rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '800', display: 'block', marginBottom: '0.2rem' }}>Test Name *</label>
                      <input
                        type="text"
                        value={testForm.name}
                        onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
                        placeholder="e.g. 25-OH VITAMIN D (TOTAL)"
                        required
                        style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontWeight: '800', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>

                  {/* Alias Names */}
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '800', display: 'block', marginBottom: '0.2rem' }}>
                      Alias Names / Alternative Search Terms (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={testForm.aliasNames || ''}
                      onChange={(e) => setTestForm({ ...testForm, aliasNames: e.target.value })}
                      placeholder="e.g. Complete Hemogram, CBC Test, Full Blood Count, FBC"
                      style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                    />
                    <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.2rem' }}>
                      Patients and doctors can search for this test using any of these alternative names.
                    </div>
                  </div>

                  {/* Specimen and Fasting */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '800', display: 'block', marginBottom: '0.2rem' }}>Sample Tube / Specimen</label>
                      <input
                        type="text"
                        value={testForm.sampleType}
                        onChange={(e) => setTestForm({ ...testForm, sampleType: e.target.value })}
                        placeholder="SERUM / EDTA / URINE"
                        style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                      />
                      <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                        {['SERUM', 'EDTA', 'FLUORIDE', 'CITRATE', 'URINE'].map(tube => (
                          <button
                            type="button"
                            key={tube}
                            onClick={() => setTestForm({ ...testForm, sampleType: tube })}
                            style={{ padding: '0.2rem 0.45rem', fontSize: '0.7rem', backgroundColor: testForm.sampleType === tube ? '#006B70' : '#F1F5F9', color: testForm.sampleType === tube ? '#FFF' : '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '700' }}
                          >
                            + {tube}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '800', display: 'block', marginBottom: '0.2rem' }}>Fasting Required?</label>
                      <select
                        value={testForm.fasting}
                        onChange={(e) => setTestForm({ ...testForm, fasting: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                      >
                        <option value="NO">NO - Anytime Sample</option>
                        <option value="YES">YES - 8-10h Fasting</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '800', display: 'block', marginBottom: '0.2rem' }}>Turnaround (TAT)</label>
                      <input
                        type="number"
                        value={testForm.tatHours}
                        onChange={(e) => setTestForm({ ...testForm, tatHours: e.target.value })}
                        placeholder="24"
                        style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>

                  {/* Pricing defaults */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#006B70', fontWeight: '900', display: 'block', marginBottom: '0.2rem' }}>MedMarg Base Offer Price (₹) *</label>
                      <input
                        type="number"
                        value={testForm.price}
                        onChange={(e) => setTestForm({ ...testForm, price: e.target.value })}
                        required
                        style={{ width: '100%', padding: '0.65rem', border: '1.5px solid #006B70', borderRadius: '8px', color: '#006B70', fontWeight: '900', fontSize: '1rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700', display: 'block', marginBottom: '0.2rem' }}>Standard Market MRP (₹)</label>
                      <input
                        type="number"
                        value={testForm.mrp}
                        onChange={(e) => setTestForm({ ...testForm, mrp: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#64748B', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '800', display: 'block', marginBottom: '0.2rem' }}>Clinical Description & Scope</label>
                    <textarea
                      value={testForm.description}
                      onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
                      placeholder="Clinical overview, diagnostic significance, and sample instructions..."
                      rows={2}
                      style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.86rem' }}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: MULTI-LAB PRICES */}
              {activeTestModalTab === 'LABS' && (
                <MultiLabPricingEditor
                  labPricing={testForm.labPricing}
                  onChange={(updatedLabs) => setTestForm({ ...testForm, labPricing: updatedLabs })}
                  basePrice={testForm.price}
                  baseMrp={testForm.mrp}
                  tatHours={testForm.tatHours}
                />
              )}

              {/* TAB 3: MULTI-PERSON VOLUME SLABS */}
              {activeTestModalTab === 'PEOPLE' && (
                <MultiPeopleTierPricingEditor
                  tierPricing={testForm.tierPricing}
                  onChange={(updatedTiers) => setTestForm({ ...testForm, tierPricing: updatedTiers })}
                  basePrice={testForm.price}
                  baseMrp={testForm.mrp}
                />
              )}

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateTestModal(false)}
                  style={{ padding: '0.75rem 1.4rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.75rem 1.75rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,107,112,0.25)' }}
                >
                  {editingItem ? 'Update Test & Rates' : 'Save Test to Master Catalog'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT DIAGNOSTIC PROFILE (COMBINATION OF TESTS) */}
      {showCreateProfileModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', maxWidth: '920px', width: '100%', padding: '2rem', border: '1px solid #CBD5E1', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '900' }}>
                  DIAGNOSTIC PROFILE COMPOSER
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem', margin: 0 }}>
                  {editingItem ? `Edit Profile: ${editingItem.name}` : 'Compose New Diagnostic Profile Panel'}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.15rem' }}>
                  Profiles are combinations of single biomarker tests (e.g. Lipid Profile, Liver Function Profile).
                </div>
              </div>
              <button onClick={() => setShowCreateProfileModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '1.3rem', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Modal Subtabs */}
            <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              {[
                { key: 'DETAILS', label: '1. Profile Details', icon: Layers },
                { key: 'TESTS', label: `2. Select Single Tests (${profileForm.selectedTests?.length || 0})`, icon: FlaskConical },
                { key: 'LABS', label: '3. Multi-Lab Prices (3+ Labs)', icon: Building2 },
                { key: 'PEOPLE', label: '4. Multi-Person Volume Slabs', icon: Users }
              ].map(t => (
                <button
                  type="button"
                  key={t.key}
                  onClick={() => setActiveProfileModalTab(t.key)}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    border: activeProfileModalTab === t.key ? 'none' : '1px solid #CBD5E1',
                    backgroundColor: activeProfileModalTab === t.key ? '#006B70' : '#F8FAFC',
                    color: activeProfileModalTab === t.key ? '#FFFFFF' : '#475569',
                    fontSize: '0.84rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <t.icon size={15} />
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* TAB 1: PROFILE DETAILS */}
              {activeProfileModalTab === 'DETAILS' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '800', display: 'block', marginBottom: '0.2rem' }}>Profile Code *</label>
                      <input
                        type="text"
                        value={profileForm.code}
                        onChange={(e) => setProfileForm({ ...profileForm, code: e.target.value })}
                        placeholder="e.g. APCOM"
                        required
                        style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#B45309', fontWeight: '900', fontFamily: 'monospace', fontSize: '0.88rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '800', display: 'block', marginBottom: '0.2rem' }}>Profile Name *</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        placeholder="e.g. LIPID PROFILE EXTENSIVE PANEL"
                        required
                        style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontWeight: '800', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#006B70', fontWeight: '900', display: 'block', marginBottom: '0.2rem' }}>Profile Bundle Price (₹) *</label>
                      <input
                        type="number"
                        value={profileForm.price}
                        onChange={(e) => setProfileForm({ ...profileForm, price: e.target.value })}
                        required
                        style={{ width: '100%', padding: '0.65rem', border: '1.5px solid #006B70', borderRadius: '8px', color: '#006B70', fontWeight: '900', fontSize: '1rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700', display: 'block', marginBottom: '0.2rem' }}>Standard Market MRP (₹)</label>
                      <input
                        type="number"
                        value={profileForm.mrp}
                        onChange={(e) => setProfileForm({ ...profileForm, mrp: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#64748B', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '800', display: 'block', marginBottom: '0.2rem' }}>Profile Description</label>
                    <textarea
                      value={profileForm.description}
                      onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                      placeholder="Clinical scope of this multi-biomarker profile panel..."
                      rows={3}
                      style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.86rem' }}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: SELECT SINGLE TESTS ("profiles are combination of tests") */}
              {activeProfileModalTab === 'TESTS' && (
                <SingleTestsSelector
                  allTests={catalog.tests || []}
                  selectedTestCodes={profileForm.selectedTests || []}
                  onChange={(newCodes) => setProfileForm(prev => ({ ...prev, selectedTests: newCodes }))}
                  onAutoCalculateProfile={(info) => {
                    setProfileForm(prev => ({
                      ...prev,
                      price: info.suggestedPrice,
                      mrp: info.suggestedMrp,
                      sampleType: info.sampleType,
                      fasting: info.fasting
                    }));
                    setSaveToast(`Applied suggested bundled pricing: ₹${info.suggestedPrice}!`);
                    setTimeout(() => setSaveToast(null), 3000);
                  }}
                />
              )}

              {/* TAB 3: MULTI-LAB PRICES */}
              {activeProfileModalTab === 'LABS' && (
                <MultiLabPricingEditor
                  labPricing={profileForm.labPricing}
                  onChange={(updatedLabs) => setProfileForm({ ...profileForm, labPricing: updatedLabs })}
                  basePrice={profileForm.price}
                  baseMrp={profileForm.mrp}
                  tatHours={profileForm.tatHours}
                />
              )}

              {/* TAB 4: MULTI-PERSON VOLUME SLABS */}
              {activeProfileModalTab === 'PEOPLE' && (
                <MultiPeopleTierPricingEditor
                  tierPricing={profileForm.tierPricing}
                  onChange={(updatedTiers) => setProfileForm({ ...profileForm, tierPricing: updatedTiers })}
                  basePrice={profileForm.price}
                  baseMrp={profileForm.mrp}
                />
              )}

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateProfileModal(false)}
                  style={{ padding: '0.75rem 1.4rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.75rem 1.75rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,107,112,0.25)' }}
                >
                  {editingItem ? 'Update Profile & Tests' : 'Save Diagnostic Profile to Master'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VISUAL PACKAGE BUILDER (COMBINATION OF TESTS & PROFILES) */}
      {showPackageBuilderModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', maxWidth: '1020px', width: '100%', padding: '2rem', border: '1px solid #E2E8F0', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '900' }}>
                  PACKAGE BUILDER STUDIO
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem', margin: 0 }}>
                  Visual Health Package Builder (Profiles + Single Tests)
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.15rem 0 0 0' }}>
                  Package is a combination of diagnostic profiles and single biomarker tests.
                </p>
              </div>
              <button onClick={() => setShowPackageBuilderModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '1.25rem', cursor: 'pointer', padding: '0.5rem' }}>✕</button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              {[
                { key: 'COMPONENTS', label: `1. Select Profiles & Tests (${packageBuilderForm.selectedProfiles.length} Prof, ${packageBuilderForm.selectedTests.length} Tests)`, icon: Package },
                { key: 'LABS', label: '2. Multi-Lab Prices (3+ Labs)', icon: Building2 },
                { key: 'PEOPLE', label: '3. Multi-Person Volume Slabs', icon: Users }
              ].map(t => (
                <button
                  type="button"
                  key={t.key}
                  onClick={() => setActivePackageModalTab(t.key)}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    border: activePackageModalTab === t.key ? 'none' : '1px solid #CBD5E1',
                    backgroundColor: activePackageModalTab === t.key ? '#006B70' : '#F8FAFC',
                    color: activePackageModalTab === t.key ? '#FFFFFF' : '#475569',
                    fontSize: '0.84rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <t.icon size={15} />
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSavePackage} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* TAB 1: VISUAL COMPONENTS SELECTOR */}
              {activePackageModalTab === 'COMPONENTS' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.75rem' }}>
                  
                  {/* Left Column: Profiles & Tests Picker */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                      <Search size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <input
                        type="text"
                        placeholder="Search profiles and single tests..."
                        value={builderSearch}
                        onChange={(e) => setBuilderSearch(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.4rem', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#0F172A', fontSize: '0.85rem', outline: 'none' }}
                      />
                    </div>

                    {/* Selected Components Chips */}
                    <div style={{ backgroundColor: '#F1F5F9', borderRadius: '12px', padding: '0.85rem', border: '1px solid #CBD5E1' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#006B70', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                        Selected Components ({(packageBuilderForm.selectedProfiles || []).length} Profiles, {(packageBuilderForm.selectedTests || []).length} Tests)
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', maxHeight: '90px', overflowY: 'auto' }}>
                        {(packageBuilderForm.selectedProfiles || []).map(code => (
                          <span key={code} style={{ fontSize: '0.72rem', backgroundColor: '#006B70', color: '#FFF', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            🔬 {code}
                            <button type="button" onClick={() => setPackageBuilderForm(prev => ({ ...prev, selectedProfiles: (prev.selectedProfiles || []).filter(c => c !== code) }))} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', padding: 0, fontWeight: '900' }}>✕</button>
                          </span>
                        ))}
                        {(packageBuilderForm.selectedTests || []).map(code => (
                          <span key={code} style={{ fontSize: '0.72rem', backgroundColor: '#B45309', color: '#FFF', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            🧪 {code}
                            <button type="button" onClick={() => setPackageBuilderForm(prev => ({ ...prev, selectedTests: (prev.selectedTests || []).filter(c => c !== code) }))} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', padding: 0, fontWeight: '900' }}>✕</button>
                          </span>
                        ))}
                        {(packageBuilderForm.selectedProfiles || []).length === 0 && (packageBuilderForm.selectedTests || []).length === 0 && (
                          <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontStyle: 'italic' }}>No profiles or tests selected yet. Select items below.</span>
                        )}
                      </div>
                    </div>

                    {/* Profiles List */}
                    <div>
                      <div style={{ fontSize: '0.78rem', color: '#006B70', fontWeight: '800', marginBottom: '0.35rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span>🔬 DIAGNOSTIC PROFILES ({catalog.profiles?.length || 87})</span>
                      </div>
                      <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.5rem', backgroundColor: '#FFFFFF' }}>
                        {(catalog.profiles || []).filter(p => !builderSearch || p.name.toLowerCase().includes(builderSearch.toLowerCase()) || p.code.toLowerCase().includes(builderSearch.toLowerCase())).slice(0, 40).map(p => {
                          const isSel = (packageBuilderForm.selectedProfiles || []).includes(p.code);
                          return (
                            <div
                              key={p.code}
                              onClick={() => {
                                setPackageBuilderForm(prev => {
                                  const current = prev.selectedProfiles || [];
                                  return {
                                    ...prev,
                                    selectedProfiles: current.includes(p.code)
                                      ? current.filter(c => c !== p.code)
                                      : [...current, p.code]
                                  };
                                });
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

                    {/* Single Tests List */}
                    <div>
                      <div style={{ fontSize: '0.78rem', color: '#B45309', fontWeight: '800', marginBottom: '0.35rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span>🧪 INDIVIDUAL TESTS ({catalog.tests?.length || 913})</span>
                      </div>
                      <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.5rem', backgroundColor: '#FFFFFF' }}>
                        {(catalog.tests || []).filter(t => !builderSearch || t.name.toLowerCase().includes(builderSearch.toLowerCase()) || t.code.toLowerCase().includes(builderSearch.toLowerCase())).slice(0, 50).map(t => {
                          const isSel = (packageBuilderForm.selectedTests || []).includes(t.code);
                          return (
                            <div
                              key={t.code}
                              onClick={() => {
                                setPackageBuilderForm(prev => {
                                  const current = prev.selectedTests || [];
                                  return {
                                    ...prev,
                                    selectedTests: current.includes(t.code)
                                      ? current.filter(c => c !== t.code)
                                      : [...current, t.code]
                                  };
                                });
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

                  {/* Right Column: Package Metadata */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '800', display: 'block', marginBottom: '0.2rem' }}>Package Name *</label>
                      <input
                        type="text"
                        value={packageBuilderForm.name}
                        onChange={(e) => setPackageBuilderForm({ ...packageBuilderForm, name: e.target.value })}
                        placeholder="e.g. Master Executive Health Shield"
                        required
                        style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontWeight: '800', fontSize: '0.88rem' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '800', display: 'block', marginBottom: '0.2rem' }}>Package Code</label>
                        <input
                          type="text"
                          value={packageBuilderForm.code}
                          onChange={(e) => setPackageBuilderForm({ ...packageBuilderForm, code: e.target.value })}
                          placeholder="e.g. MM_EXEC_FB"
                          style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#006B70', fontWeight: '800', fontFamily: 'monospace', fontSize: '0.88rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '800', display: 'block', marginBottom: '0.2rem' }}>Category</label>
                        <select
                          value={packageBuilderForm.category}
                          onChange={(e) => setPackageBuilderForm({ ...packageBuilderForm, category: e.target.value })}
                          style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
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
                      <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '800', display: 'block', marginBottom: '0.2rem' }}>Tagline / Subtitle</label>
                      <input
                        type="text"
                        value={packageBuilderForm.tagline}
                        onChange={(e) => setPackageBuilderForm({ ...packageBuilderForm, tagline: e.target.value })}
                        placeholder="e.g. Complete 85+ Vital Biomarkers & Full Body Screening"
                        style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <div>
                        <label style={{ fontSize: '0.78rem', color: '#006B70', fontWeight: '900', display: 'block', marginBottom: '0.2rem' }}>Offer Price (₹) *</label>
                        <input
                          type="number"
                          value={packageBuilderForm.price}
                          onChange={(e) => setPackageBuilderForm({ ...packageBuilderForm, price: e.target.value })}
                          required
                          style={{ width: '100%', padding: '0.65rem', border: '1.5px solid #006B70', borderRadius: '8px', color: '#006B70', fontWeight: '900', fontSize: '1rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700', display: 'block', marginBottom: '0.2rem' }}>Market MRP (₹)</label>
                        <input
                          type="number"
                          value={packageBuilderForm.mrp}
                          onChange={(e) => setPackageBuilderForm({ ...packageBuilderForm, mrp: e.target.value })}
                          style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#64748B', fontSize: '0.9rem' }}
                        />
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: MULTI-LAB PRICES */}
              {activePackageModalTab === 'LABS' && (
                <MultiLabPricingEditor
                  labPricing={packageBuilderForm.labPricing}
                  onChange={(updatedLabs) => setPackageBuilderForm({ ...packageBuilderForm, labPricing: updatedLabs })}
                  basePrice={packageBuilderForm.price}
                  baseMrp={packageBuilderForm.mrp}
                  tatHours={packageBuilderForm.tatHours}
                />
              )}

              {/* TAB 3: MULTI-PERSON VOLUME SLABS */}
              {activePackageModalTab === 'PEOPLE' && (
                <MultiPeopleTierPricingEditor
                  tierPricing={packageBuilderForm.tierPricing}
                  onChange={(updatedTiers) => setPackageBuilderForm({ ...packageBuilderForm, tierPricing: updatedTiers })}
                  basePrice={packageBuilderForm.price}
                  baseMrp={packageBuilderForm.mrp}
                />
              )}

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowPackageBuilderModal(false)}
                  style={{ padding: '0.75rem 1.4rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.75rem 1.75rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,107,112,0.25)' }}
                >
                  Publish Package & Slabs to Catalog
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: MULTI-LAB & VOLUME SLABS MANAGER (QUICK EDITOR) */}
      {showLabPricingModal && selectedItemForLabPricing && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', maxWidth: '880px', width: '100%', padding: '2rem', border: '1.5px solid #CBD5E1', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.72rem', backgroundColor: '#006B70', color: '#FFF', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '900' }}>
                    RATE & VOLUME MANAGER
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', fontFamily: 'monospace', fontWeight: '800' }}>
                    {selectedItemForLabPricing.code || selectedItemForLabPricing.id}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                  {selectedItemForLabPricing.name || selectedItemForLabPricing.title}
                </h2>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
                  Manage multiple lab rates and multi-person volume slabs (1, 2, 5, 10+ people) for family members & corporate staff.
                </div>
              </div>
              <button onClick={() => setShowLabPricingModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '1.3rem', cursor: 'pointer', padding: '0.4rem' }}>✕</button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setActiveRateModalTab('LABS')}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '10px',
                  border: activeRateModalTab === 'LABS' ? 'none' : '1px solid #CBD5E1',
                  backgroundColor: activeRateModalTab === 'LABS' ? '#006B70' : '#F8FAFC',
                  color: activeRateModalTab === 'LABS' ? '#FFFFFF' : '#475569',
                  fontWeight: '800',
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Building2 size={16} /> 1. Multiple Certified Labs ({labPricingForm.length} Labs)
              </button>

              <button
                type="button"
                onClick={() => setActiveRateModalTab('PEOPLE')}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '10px',
                  border: activeRateModalTab === 'PEOPLE' ? 'none' : '1px solid #CBD5E1',
                  backgroundColor: activeRateModalTab === 'PEOPLE' ? '#006B70' : '#F8FAFC',
                  color: activeRateModalTab === 'PEOPLE' ? '#FFFFFF' : '#475569',
                  fontWeight: '800',
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Users size={16} /> 2. Multiple People Volume Slabs (1, 2, 5, 10+ People)
              </button>
            </div>

            <form onSubmit={handleSaveLabPricing} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {activeRateModalTab === 'LABS' && (
                <MultiLabPricingEditor
                  labPricing={labPricingForm}
                  onChange={setLabPricingForm}
                  basePrice={selectedItemForLabPricing.price || 299}
                  baseMrp={selectedItemForLabPricing.mrp || 499}
                  tatHours={selectedItemForLabPricing.tatHours || 24}
                />
              )}

              {activeRateModalTab === 'PEOPLE' && (
                <MultiPeopleTierPricingEditor
                  tierPricing={tierPricingForm}
                  onChange={setTierPricingForm}
                  basePrice={selectedItemForLabPricing.price || 299}
                  baseMrp={selectedItemForLabPricing.mrp || 499}
                />
              )}

              {/* Bottom Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleOpenPreview(selectedItemForLabPricing)}
                  style={{ padding: '0.75rem 1.25rem', backgroundColor: '#F8FAFC', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '12px', fontWeight: '800', fontSize: '0.86rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Eye size={16} color="#006B70" /> Live Care Seeker Simulator Preview
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
                    Save & Publish All Rates & Slabs
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

            {/* Interactive Cards shown to Patients */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A' }}>
                1. Select Laboratory for Home Sample Processing:
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
                          <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A' }}>
                            {lab.labName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.1rem' }}>
                            Direct Diagnostic Provider • NABL & CAP Accredited
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.2rem' }}>
                            TAT: {lab.tatHours || 24} Hours
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A' }}>
                        ₹{lab.price}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                        ₹{lab.mrp}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '800', marginTop: '0.1rem' }}>
                        {lab.discountPercent}% OFF
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Multi-Person Volume Slabs Preview */}
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.5rem' }}>
                  2. Booking for Family or Corporate Staff (Volume Slabs):
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  {Object.entries(getItemTierPricing(previewItem)).map(([key, t]) => (
                    <div key={key} style={{ backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '0.75rem' }}>
                      <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '800' }}>
                        {t.label}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.25rem' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#006B70' }}>
                          ₹{t.offerPrice || t.pricePerPerson} <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '600' }}>/ person</span>
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '800' }}>
                          {t.discountPercent || 25}% OFF
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setShowCareSeekerPreviewModal(false)}
                style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
