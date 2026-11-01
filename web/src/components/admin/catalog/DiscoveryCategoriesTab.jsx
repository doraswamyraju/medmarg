import React, { useState, useEffect, useRef } from 'react';
import { 
  Tag, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Layers, 
  Package, 
  FlaskConical, 
  Check, 
  X, 
  Sparkles,
  ArrowUpDown,
  Eye,
  SlidersHorizontal,
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  Palette,
  Heart,
  Droplet,
  Flame,
  Shield,
  Activity,
  Dna,
  Pill,
  Brain,
  Stethoscope,
  Baby,
  Thermometer,
  Crosshair,
  UserCheck,
  Users,
  Target
} from 'lucide-react';
import { API_BASE, safeFetch } from '../../../data/apiConfig';

// 6 Core Taxonomy Groups
export const TAXONOMY_GROUPS = [
  { key: 'ALL', label: 'All Dimensions', icon: Tag, badge: 'ALL' },
  { key: 'CLINICAL', label: 'Clinical Specialties', icon: FlaskConical, badge: '🔬 CLINICAL', description: 'Laboratory disciplines & diagnostic specialties' },
  { key: 'CONDITION', label: 'Health Concerns', icon: Crosshair, badge: '🩺 CONCERNS', description: 'Patient symptoms, disorders & disease monitoring' },
  { key: 'ORGAN', label: 'Body Organs & Systems', icon: Heart, badge: '🫀 ORGANS', description: 'Anatomical organ and physiological system browsing' },
  { key: 'DEMOGRAPHIC', label: 'Demographics & Life Stages', icon: Users, badge: '👥 DEMOGRAPHICS', description: 'Age cohorts, gender and maternal care' },
  { key: 'GOAL', label: 'Health Goals', icon: Shield, badge: '🎯 GOALS', description: 'Preventive intent, annual checkups & fitness routines' },
  { key: 'CURATED', label: 'Curated Campaigns', icon: Sparkles, badge: '⭐ CURATED', description: 'Front-page highlights, bestsellers & seasonal promotions' }
];

// Curated medical icon presets with SF Symbol equivalents for iOS and Lucide icon components for Web
export const CATEGORY_ICON_PRESETS = [
  { id: 'flame.fill', label: 'Popular / Trending', icon: Flame, sfSymbol: 'flame.fill', defaultColor: '#F59E0B' },
  { id: 'drop.fill', label: 'Diabetes & Blood Sugar', icon: Droplet, sfSymbol: 'drop.fill', defaultColor: '#EF4444' },
  { id: 'heart.fill', label: 'Heart & Cardio Health', icon: Heart, sfSymbol: 'heart.fill', defaultColor: '#DC2626' },
  { id: 'cross.fill', label: 'Thyroid & Endocrine', icon: Crosshair, sfSymbol: 'cross.fill', defaultColor: '#006B70' },
  { id: 'person.fill', label: 'Men\'s Health', icon: UserCheck, sfSymbol: 'person.fill', defaultColor: '#2563EB' },
  { id: 'figure.dress.line.vertical.figure', label: 'Women\'s Health', icon: Sparkles, sfSymbol: 'figure.dress.line.vertical.figure', defaultColor: '#EC4899' },
  { id: 'figure.seated.side.right', label: 'Senior Citizen Care', icon: Shield, sfSymbol: 'figure.seated.side.right', defaultColor: '#7C3AED' },
  { id: 'shield.checkerboard', label: 'Full Body Wellness', icon: Shield, sfSymbol: 'shield.checkerboard', defaultColor: '#059669' },
  { id: 'waveform.path.ecg', label: 'ECG & Vital Screening', icon: Activity, sfSymbol: 'waveform.path.ecg', defaultColor: '#0891B2' },
  { id: 'dna', label: 'Genomics & Special Tests', icon: Dna, sfSymbol: 'dna', defaultColor: '#6366F1' },
  { id: 'pills.fill', label: 'Medication Monitoring', icon: Pill, sfSymbol: 'pills.fill', defaultColor: '#D97706' },
  { id: 'brain.head.profile', label: 'Neuro & Cognitive Health', icon: Brain, sfSymbol: 'brain.head.profile', defaultColor: '#8B5CF6' },
  { id: 'stethoscope', label: 'Doctor Recommended', icon: Stethoscope, sfSymbol: 'stethoscope', defaultColor: '#006B70' },
  { id: 'figure.and.child.holdinghands', label: 'Pediatric Care', icon: Baby, sfSymbol: 'figure.and.child.holdinghands', defaultColor: '#14B8A6' },
  { id: 'thermometer.medium', label: 'Fever & Infection Panel', icon: Thermometer, sfSymbol: 'thermometer.medium', defaultColor: '#E11D48' },
  { id: 'square.grid.2x2.fill', label: 'General / Other', icon: Tag, sfSymbol: 'square.grid.2x2.fill', defaultColor: '#475569' }
];

// Curated theme colors
export const CATEGORY_COLORS = [
  { name: 'MedMarg Teal', hex: '#006B70' },
  { name: 'Emerald Green', hex: '#059669' },
  { name: 'Cyan Wave', hex: '#0891B2' },
  { name: 'Royal Blue', hex: '#2563EB' },
  { name: 'Indigo Aura', hex: '#6366F1' },
  { name: 'Deep Purple', hex: '#7C3AED' },
  { name: 'Crimson Red', hex: '#DC2626' },
  { name: 'Ruby Pink', hex: '#EC4899' },
  { name: 'Amber Gold', hex: '#D97706' },
  { name: 'Warm Orange', hex: '#EA580C' },
  { name: 'Slate Gray', hex: '#475569' }
];

export default function DiscoveryCategoriesTab({
  categories = [],
  setCategories = () => {},
  catalog = { tests: [], profiles: [], packages: [] },
  setCatalog = () => {},
  saveCatalogState = () => {}
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [editingCategory, setEditingCategory] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLinkItemsModal, setShowLinkItemsModal] = useState(false);
  const [activeCategoryForLinks, setActiveCategoryForLinks] = useState(null);
  const [linkSearchTerm, setLinkSearchTerm] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageTab, setImageTab] = useState('PRESET'); // 'PRESET' | 'UPLOAD' | 'URL'
  const [customGroupInput, setCustomGroupInput] = useState('');
  const [isCustomGroup, setIsCustomGroup] = useState(false);
  const fileInputRef = useRef(null);

  // Category Form
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: '',
    group: 'CONDITION',
    description: '',
    icon: 'flame.fill',
    imageUrl: '',
    color: '#006B70',
    displayOrder: 1,
    isFeatured: true,
    active: true
  });

  // Expose global opener for the "+ Add Category" button in top subtab header
  useEffect(() => {
    window._openNewCategoryModal = () => handleOpenAdd();
    return () => {
      delete window._openNewCategoryModal;
    };
  }, [categories]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setCategoryForm({
      id: '',
      name: '',
      group: selectedGroup !== 'ALL' ? selectedGroup : 'CONDITION',
      description: '',
      icon: 'flame.fill',
      imageUrl: '',
      color: '#006B70',
      displayOrder: (categories.length || 0) + 1,
      isFeatured: true,
      active: true
    });
    setIsCustomGroup(false);
    setCustomGroupInput('');
    setImageTab('PRESET');
    setShowCategoryModal(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    const isStandard = ['CLINICAL', 'CONDITION', 'ORGAN', 'DEMOGRAPHIC', 'GOAL', 'CURATED'].includes(cat.group);
    setIsCustomGroup(!isStandard && Boolean(cat.group));
    setCustomGroupInput(!isStandard ? (cat.group || '') : '');
    setCategoryForm({
      id: cat.id || '',
      name: cat.name || '',
      group: cat.group || 'CONDITION',
      description: cat.description || '',
      icon: cat.icon || 'flame.fill',
      imageUrl: cat.imageUrl || '',
      color: cat.color || '#006B70',
      displayOrder: cat.displayOrder ?? 1,
      isFeatured: cat.isFeatured !== false,
      active: cat.active !== false
    });
    setImageTab(cat.imageUrl ? 'UPLOAD' : 'PRESET');
    setShowCategoryModal(true);
  };

  // Image File Upload Handler
  const handleImageFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please upload a smaller image.');
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;
      
      try {
        const res = await safeFetch(`${API_BASE}/api/v1/catalog/categories/upload-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Data,
            filename: `${categoryForm.id || 'cat'}_${Date.now()}.${file.name.split('.').pop()}`
          })
        });

        if (res && res.imageUrl) {
          setCategoryForm(prev => ({ ...prev, imageUrl: res.imageUrl }));
        } else {
          setCategoryForm(prev => ({ ...prev, imageUrl: base64Data }));
        }
      } catch (err) {
        console.warn('Image upload fallback to data URL:', err);
        setCategoryForm(prev => ({ ...prev, imageUrl: base64Data }));
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCategory = async (e) => {
    if (e) e.preventDefault();
    if (!categoryForm.name.trim()) {
      alert('Category Name is required.');
      return;
    }

    const catId = editingCategory?.id || categoryForm.id?.trim() || `CAT_${categoryForm.name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
    const effectiveGroup = isCustomGroup ? (customGroupInput.trim().toUpperCase() || 'CUSTOM') : categoryForm.group;

    const newCategory = {
      id: catId,
      name: categoryForm.name.trim(),
      group: effectiveGroup,
      description: categoryForm.description.trim(),
      icon: categoryForm.icon || 'square.grid.2x2.fill',
      imageUrl: categoryForm.imageUrl?.trim() || '',
      color: categoryForm.color || '#006B70',
      displayOrder: Number(categoryForm.displayOrder) || 1,
      isFeatured: Boolean(categoryForm.isFeatured),
      active: Boolean(categoryForm.active)
    };

    let updatedList = [...categories];
    if (editingCategory) {
      updatedList = updatedList.map(c => c.id === editingCategory.id ? newCategory : c);
    } else {
      const exists = updatedList.some(c => c.id === catId);
      if (exists) {
        alert(`A category with ID "${catId}" already exists. Please choose a different name.`);
        return;
      }
      updatedList.push(newCategory);
    }

    updatedList.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    setCategories(updatedList);
    const updatedCatalog = { ...catalog, categories: updatedList };
    setCatalog(updatedCatalog);
    saveCatalogState(updatedCatalog);

    try {
      await safeFetch(`${API_BASE}/api/v1/catalog/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      });
      await safeFetch(`${API_BASE}/api/v1/catalog/sync-full`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tests: catalog.tests,
          profiles: catalog.profiles,
          packages: catalog.packages,
          categories: updatedList
        })
      });
    } catch (err) {
      console.warn('Save category backend error:', err);
    }

    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = async (cat) => {
    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"? Items linked to this category will simply be unlinked.`)) {
      return;
    }

    const updatedList = categories.filter(c => c.id !== cat.id);
    setCategories(updatedList);

    const cleanItem = (item) => ({
      ...item,
      categoryIds: (item.categoryIds || []).filter(cid => cid !== cat.id)
    });

    const updatedCatalog = {
      ...catalog,
      categories: updatedList,
      tests: (catalog.tests || []).map(cleanItem),
      profiles: (catalog.profiles || []).map(cleanItem),
      packages: (catalog.packages || []).map(cleanItem)
    };

    setCatalog(updatedCatalog);
    saveCatalogState(updatedCatalog);

    try {
      await safeFetch(`${API_BASE}/api/v1/catalog/categories/${cat.id}`, {
        method: 'DELETE'
      });
      await safeFetch(`${API_BASE}/api/v1/catalog/sync-full`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tests: updatedCatalog.tests,
          profiles: updatedCatalog.profiles,
          packages: updatedCatalog.packages,
          categories: updatedList
        })
      });
    } catch (err) {
      console.warn('Delete category backend sync error:', err);
    }
  };

  // LINK / UNLINK ITEM HANDLERS
  const handleToggleItemLink = async (catId, item, itemType) => {
    const isLinked = (item.categoryIds || []).includes(catId);
    const newCategoryIds = isLinked 
      ? (item.categoryIds || []).filter(c => c !== catId)
      : [...(item.categoryIds || []), catId];

    const updatedItem = { ...item, categoryIds: newCategoryIds };

    let updatedCatalog = { ...catalog };
    if (itemType === 'TEST') {
      updatedCatalog.tests = (catalog.tests || []).map(t => (t.id === item.id || t.code === item.code) ? updatedItem : t);
    } else if (itemType === 'PROFILE') {
      updatedCatalog.profiles = (catalog.profiles || []).map(p => (p.id === item.id || p.code === item.code) ? updatedItem : p);
    } else if (itemType === 'PACKAGE') {
      updatedCatalog.packages = (catalog.packages || []).map(p => (p.id === item.id || p.code === item.code) ? updatedItem : p);
    }

    setCatalog(updatedCatalog);
    saveCatalogState(updatedCatalog);

    try {
      await safeFetch(`${API_BASE}/api/v1/catalog/sync-full`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tests: updatedCatalog.tests,
          profiles: updatedCatalog.profiles,
          packages: updatedCatalog.packages,
          categories: categories
        })
      });
    } catch (err) {
      console.warn('Backend link sync:', err);
    }
  };

  const getLinkedCounts = (catId) => {
    const testsCount = (catalog.tests || []).filter(t => (t.categoryIds || []).includes(catId)).length;
    const profilesCount = (catalog.profiles || []).filter(p => (p.categoryIds || []).includes(catId)).length;
    const packagesCount = (catalog.packages || []).filter(pkg => (pkg.categoryIds || []).includes(catId)).length;
    return {
      tests: testsCount,
      profiles: profilesCount,
      packages: packagesCount,
      total: testsCount + profilesCount + packagesCount
    };
  };

  // Filter by both Search Query and Taxonomy Dimension Group
  const filteredCategories = categories.filter(c => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q || c.name.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q)) || c.id.toLowerCase().includes(q);
    const matchesGroup = selectedGroup === 'ALL' || (c.group || 'CONDITION') === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const getGroupBadge = (groupKey) => {
    const found = TAXONOMY_GROUPS.find(g => g.key === groupKey);
    return found ? found.badge : (groupKey || 'CONCERNS');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Informative Header / Concept Banner */}
      <div style={{
        backgroundColor: '#F0FDFA',
        border: '1.5px solid #006B70',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ maxWidth: '750px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Tag size={20} color="#006B70" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              Discovery Categories & Taxonomy Hub
            </h3>
            <span style={{ fontSize: '0.72rem', backgroundColor: '#CCFBF1', color: '#006B70', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '800' }}>
              6 TAXONOMY DIMENSIONS
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#334155', margin: 0, lineHeight: 1.5 }}>
            Organize catalog items across 6 complementary browsing pathways: <strong>Clinical Specialties</strong> (Lab disciplines), <strong>Health Concerns</strong> (Symptoms/conditions), <strong>Body Organs & Systems</strong>, <strong>Demographics</strong> (Age/gender), <strong>Health Goals</strong> (Preventive/Annual), and <strong>Curated Campaigns</strong>.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          style={{
            backgroundColor: '#006B70',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            padding: '0.65rem 1.3rem',
            fontWeight: '800',
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 14px rgba(0, 107, 112, 0.25)'
          }}
        >
          <Plus size={16} /> + New Category
        </button>
      </div>

      {/* 6-DIMENSION TAXONOMY PILLS BAR */}
      <div style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.85rem', flexWrap: 'wrap' }}>
        {TAXONOMY_GROUPS.map(grp => {
          const isSel = selectedGroup === grp.key;
          const GrpIcon = grp.icon;
          const count = grp.key === 'ALL' 
            ? categories.length 
            : categories.filter(c => (c.group || 'CONDITION') === grp.key).length;

          return (
            <button
              key={grp.key}
              onClick={() => setSelectedGroup(grp.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 0.95rem',
                borderRadius: '10px',
                border: isSel ? 'none' : '1px solid #CBD5E1',
                backgroundColor: isSel ? '#006B70' : '#FFFFFF',
                color: isSel ? '#FFFFFF' : '#475569',
                fontWeight: isSel ? '800' : '600',
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: isSel ? '0 4px 12px rgba(0, 107, 112, 0.2)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <GrpIcon size={14} color={isSel ? '#FDE68A' : '#64748B'} />
              <span>{grp.label}</span>
              <span style={{
                backgroundColor: isSel ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
                color: isSel ? '#FFFFFF' : '#64748B',
                fontSize: '0.72rem',
                padding: '0.1rem 0.45rem',
                borderRadius: '12px',
                fontWeight: '800'
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Stats Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', width: '340px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Search categories by name, ID or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem 0.55rem 2.25rem',
              borderRadius: '10px',
              border: '1px solid #CBD5E1',
              fontSize: '0.86rem',
              backgroundColor: '#FFFFFF',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: '600' }}>
          Showing <strong>{filteredCategories.length}</strong> of <strong>{categories.length}</strong> Categories {selectedGroup !== 'ALL' && `in ${selectedGroup}`}
        </div>
      </div>

      {/* Category Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {filteredCategories.map(cat => {
          const counts = getLinkedCounts(cat.id);
          const preset = CATEGORY_ICON_PRESETS.find(p => p.sfSymbol === cat.icon) || CATEGORY_ICON_PRESETS[CATEGORY_ICON_PRESETS.length - 1];
          const IconComponent = preset.icon;
          const themeColor = cat.color || preset.defaultColor || '#006B70';
          const hasImage = Boolean(cat.imageUrl);
          const groupBadge = getGroupBadge(cat.group);

          return (
            <div
              key={cat.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              {/* Card Header Banner / Visual */}
              <div style={{
                position: 'relative',
                height: hasImage ? '110px' : '72px',
                backgroundColor: hasImage ? '#0F172A' : `${themeColor}15`,
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {hasImage ? (
                  <img
                    src={cat.imageUrl.startsWith('/uploads') ? `${API_BASE}${cat.imageUrl}` : cat.imageUrl}
                    alt={cat.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    backgroundColor: themeColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    boxShadow: `0 4px 12px ${themeColor}40`
                  }}>
                    <IconComponent size={24} />
                  </div>
                )}

                {/* Badges Overlay */}
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <span style={{ backgroundColor: '#F0FDFA', color: '#006B70', fontSize: '0.66rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid #CCFBF1' }}>
                    {groupBadge}
                  </span>
                  {cat.isFeatured && (
                    <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', fontSize: '0.66rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Sparkles size={10} /> FEATURED
                    </span>
                  )}
                  <span style={{ backgroundColor: cat.active ? '#DCFCE7' : '#F1F5F9', color: cat.active ? '#15803D' : '#64748B', fontSize: '0.66rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '6px', border: `1px solid ${cat.active ? '#BBF7D0' : '#E2E8F0'}` }}>
                    {cat.active ? 'ACTIVE' : 'DRAFT'}
                  </span>
                </div>

                <div style={{ position: 'absolute', bottom: '8px', left: '12px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', color: '#FFFFFF', fontSize: '0.68rem', fontWeight: '700', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                    #{cat.displayOrder ?? 1} Order
                  </span>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: themeColor, border: '1.5px solid #FFFFFF' }} />
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: `${themeColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: themeColor }}>
                    <IconComponent size={16} />
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                    {cat.name}
                  </h4>
                </div>

                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '700', marginBottom: '0.5rem' }}>
                  ID: <span style={{ fontFamily: 'monospace', color: '#006B70' }}>{cat.id}</span>
                </div>

                <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0 0 1rem 0', lineHeight: 1.45, flex: 1, minHeight: '34px' }}>
                  {cat.description || 'No description provided.'}
                </p>

                {/* Linked Items Pill Matrix */}
                <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '0.65rem 0.85rem', marginBottom: '1rem', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748B' }}>LINKED CATALOG ITEMS</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#006B70' }}>{counts.total} Total</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.72rem', fontWeight: '700' }}>
                    <span style={{ color: '#0284C7', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <FlaskConical size={12} /> {counts.tests} Tests
                    </span>
                    <span style={{ color: '#D97706', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Layers size={12} /> {counts.profiles} Profiles
                    </span>
                    <span style={{ color: '#7E22CE', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Package size={12} /> {counts.packages} Packages
                    </span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem' }}>
                  <button
                    onClick={() => {
                      setActiveCategoryForLinks(cat);
                      setShowLinkItemsModal(true);
                    }}
                    style={{
                      flex: 1,
                      padding: '0.5rem 0.65rem',
                      backgroundColor: '#F0FDFA',
                      color: '#006B70',
                      border: '1px solid #99F6E4',
                      borderRadius: '8px',
                      fontSize: '0.76rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <SlidersHorizontal size={13} /> Manage Items ({counts.total})
                  </button>

                  <button
                    onClick={() => handleOpenEdit(cat)}
                    title="Edit Category Details, Icon & Banner"
                    style={{
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#F8FAFC',
                      color: '#334155',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Edit3 size={14} />
                  </button>

                  <button
                    onClick={() => handleDeleteCategory(cat)}
                    title="Delete Category"
                    style={{
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#FEF2F2',
                      color: '#DC2626',
                      border: '1px solid #FECACA',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: CREATE / EDIT CATEGORY (TAXONOMY GROUP + ICONS + IMAGE UPLOAD + COLORS) */}
      {showCategoryModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '680px',
            width: '100%',
            padding: '1.75rem',
            border: '1px solid #CBD5E1',
            maxHeight: '92vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                  {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create Discovery Category'}
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
                  Assign to a taxonomy dimension, visual icon, card banner, and hierarchy for customer mobile discovery.
                </p>
              </div>
              <button
                onClick={() => setShowCategoryModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '0.25rem' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Taxonomy Dimension / Group Dropdown */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#334155', marginBottom: '0.35rem' }}>
                  Taxonomy Dimension / Group *
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select
                    value={isCustomGroup ? '__CUSTOM__' : categoryForm.group}
                    onChange={(e) => {
                      if (e.target.value === '__CUSTOM__') {
                        setIsCustomGroup(true);
                      } else {
                        setIsCustomGroup(false);
                        setCategoryForm({ ...categoryForm, group: e.target.value });
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.88rem',
                      fontWeight: '700',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="CLINICAL">🔬 Clinical Specialties (Hematology, Biochemistry, Immunology, Microbiology, Molecular)</option>
                    <option value="CONDITION">🩺 Health Concerns & Conditions (Diabetes, Heart, Fever, Thyroid, Kidney, Liver, Allergy)</option>
                    <option value="ORGAN">🫀 Body Organs & Systems (Heart, Liver, Kidney, Lungs, Thyroid, Bone, Digestive, Full Body)</option>
                    <option value="DEMOGRAPHIC">👥 Demographic Collections (Children, Adults, Seniors, Women, Men, Pregnancy)</option>
                    <option value="GOAL">🎯 Health Goals (Preventive, Annual Checkups, Routine Monitoring, Fitness, Rx)</option>
                    <option value="CURATED">⭐ Curated Collections & Campaigns (Popular Tests, Bestsellers, Affordable, Seasonal)</option>
                    <option value="__CUSTOM__">➕ + Custom Taxonomy Dimension...</option>
                  </select>
                </div>

                {isCustomGroup && (
                  <input
                    type="text"
                    required
                    placeholder="Enter custom dimension name (e.g. OCCUPATIONAL_HEALTH, GENOMICS)..."
                    value={customGroupInput}
                    onChange={(e) => setCustomGroupInput(e.target.value)}
                    style={{
                      marginTop: '0.5rem',
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #006B70',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      boxSizing: 'border-box'
                    }}
                  />
                )}
              </div>

              {/* Basic Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#334155', marginBottom: '0.35rem' }}>
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Heart Health, Diabetes Care, Hematology"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#334155', marginBottom: '0.35rem' }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={categoryForm.displayOrder}
                    onChange={(e) => setCategoryForm({ ...categoryForm, displayOrder: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#334155', marginBottom: '0.35rem' }}>
                  Description / Subtitle
                </label>
                <input
                  type="text"
                  placeholder="e.g. Essential lipid and cardiac risk panels for proactive cardiovascular wellness"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Theme Color Selector */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', fontWeight: '800', color: '#334155', marginBottom: '0.45rem' }}>
                  <Palette size={14} color="#006B70" /> Theme Accent Color
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {CATEGORY_COLORS.map(col => {
                    const isSelected = categoryForm.color === col.hex;
                    return (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => setCategoryForm({ ...categoryForm, color: col.hex })}
                        title={col.name}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: col.hex,
                          border: isSelected ? '3px solid #0F172A' : '1px solid rgba(0,0,0,0.1)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          transform: isSelected ? 'scale(1.15)' : 'none',
                          transition: 'transform 0.1s ease'
                        }}
                      >
                        {isSelected && <Check size={16} strokeWidth={3} />}
                      </button>
                    );
                  })}
                  <input
                    type="color"
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                    title="Custom Color"
                    style={{ width: '32px', height: '32px', padding: '0', border: 'none', background: 'none', cursor: 'pointer' }}
                  />
                </div>
              </div>

              {/* Visual Media Section: Icon Preset vs Image Upload */}
              <div style={{ border: '1px solid #CBD5E1', borderRadius: '14px', padding: '1rem', backgroundColor: '#F8FAFC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <ImageIcon size={16} color="#006B70" /> Visual Icon & Card Banner
                  </div>
                  
                  {/* Selector Tabs */}
                  <div style={{ display: 'flex', backgroundColor: '#E2E8F0', padding: '2px', borderRadius: '8px', gap: '2px' }}>
                    {[
                      { key: 'PRESET', label: 'Preset Icons' },
                      { key: 'UPLOAD', label: 'Upload Image' },
                      { key: 'URL', label: 'Image URL' }
                    ].map(tab => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setImageTab(tab.key)}
                        style={{
                          padding: '0.3rem 0.7rem',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: imageTab === tab.key ? '#FFFFFF' : 'transparent',
                          color: imageTab === tab.key ? '#006B70' : '#64748B',
                          fontSize: '0.74rem',
                          fontWeight: '800',
                          cursor: 'pointer'
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subview 1: PRESET MEDICAL ICONS */}
                {imageTab === 'PRESET' && (
                  <div>
                    <p style={{ fontSize: '0.74rem', color: '#64748B', margin: '0 0 0.65rem 0' }}>
                      Select a medical vector icon. It renders natively as an Apple SF Symbol in iOS and SVG vector on Web.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                      {CATEGORY_ICON_PRESETS.map(preset => {
                        const IconP = preset.icon;
                        const isSelected = categoryForm.icon === preset.sfSymbol;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setCategoryForm({ ...categoryForm, icon: preset.sfSymbol })}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.45rem',
                              padding: '0.45rem 0.6rem',
                              borderRadius: '8px',
                              border: isSelected ? `2px solid ${categoryForm.color}` : '1px solid #CBD5E1',
                              backgroundColor: isSelected ? `${categoryForm.color}15` : '#FFFFFF',
                              cursor: 'pointer',
                              textAlign: 'left'
                            }}
                          >
                            <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: isSelected ? categoryForm.color : '#F1F5F9', color: isSelected ? '#FFFFFF' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <IconP size={14} />
                            </div>
                            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: isSelected ? categoryForm.color : '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {preset.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Subview 2: UPLOAD IMAGE BANNER */}
                {imageTab === 'UPLOAD' && (
                  <div>
                    <p style={{ fontSize: '0.74rem', color: '#64748B', margin: '0 0 0.65rem 0' }}>
                      Upload a PNG, JPG, or SVG banner image for this category card.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          flex: 1,
                          border: '2px dashed #CBD5E1',
                          borderRadius: '10px',
                          padding: '1.25rem',
                          textAlign: 'center',
                          backgroundColor: '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'border-color 0.15s ease'
                        }}
                      >
                        <Upload size={24} color="#006B70" style={{ margin: '0 auto 0.4rem auto' }} />
                        <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0F172A' }}>
                          {uploadingImage ? 'Uploading Image...' : 'Click to Browse & Upload Image'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.2rem' }}>
                          PNG, JPG, SVG, WebP up to 5MB
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileSelect}
                          style={{ display: 'none' }}
                        />
                      </div>

                      {categoryForm.imageUrl && (
                        <div style={{ position: 'relative', width: '100px', height: '75px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
                          <img
                            src={categoryForm.imageUrl.startsWith('/uploads') ? `${API_BASE}${categoryForm.imageUrl}` : categoryForm.imageUrl}
                            alt="Preview"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <button
                            type="button"
                            onClick={() => setCategoryForm({ ...categoryForm, imageUrl: '' })}
                            style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Subview 3: IMAGE URL */}
                {imageTab === 'URL' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '700', color: '#64748B', marginBottom: '0.35rem' }}>
                      Direct Image URL or Cloud Storage Link
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... or /uploads/categories/heart.png"
                      value={categoryForm.imageUrl}
                      onChange={(e) => setCategoryForm({ ...categoryForm, imageUrl: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.82rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Toggles: Featured & Active */}
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '0.5rem 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700', color: '#1E293B' }}>
                  <input
                    type="checkbox"
                    checked={categoryForm.isFeatured}
                    onChange={(e) => setCategoryForm({ ...categoryForm, isFeatured: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#006B70' }}
                  />
                  Featured on Home Screen Pill Carousel
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700', color: '#1E293B' }}>
                  <input
                    type="checkbox"
                    checked={categoryForm.active}
                    onChange={(e) => setCategoryForm({ ...categoryForm, active: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#006B70' }}
                  />
                  Active (Visible to Customers)
                </label>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#64748B',
                    fontWeight: '800',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.65rem 1.4rem',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#006B70',
                    color: '#FFFFFF',
                    fontWeight: '800',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0, 107, 112, 0.25)'
                  }}
                >
                  {editingCategory ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: LINKED ITEMS MANAGER (TESTS, PROFILES, PACKAGES) */}
      {showLinkItemsModal && activeCategoryForLinks && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '820px',
            width: '100%',
            padding: '1.75rem',
            border: '1px solid #CBD5E1',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Tag size={18} color="#006B70" />
                  Manage Items in: {activeCategoryForLinks.name}
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
                  Click items below to link or unlink them from this discovery category.
                </p>
              </div>
              <button
                onClick={() => setShowLinkItemsModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '0.25rem' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Filter */}
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Filter tests, profiles, or packages to link..."
                value={linkSearchTerm}
                onChange={(e) => setLinkSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Scrollable Items Container */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingRight: '0.5rem' }}>
              
              {/* Single Tests */}
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0284C7', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <FlaskConical size={14} /> Single Tests Master ({(catalog.tests || []).filter(t => (t.categoryIds || []).includes(activeCategoryForLinks.id)).length} Linked)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.5rem' }}>
                  {(catalog.tests || [])
                    .filter(t => !linkSearchTerm || t.name.toLowerCase().includes(linkSearchTerm.toLowerCase()) || t.code.toLowerCase().includes(linkSearchTerm.toLowerCase()))
                    .map(test => {
                      const isLinked = (test.categoryIds || []).includes(activeCategoryForLinks.id);
                      return (
                        <div
                          key={test.id || test.code}
                          onClick={() => handleToggleItemLink(activeCategoryForLinks.id, test, 'TEST')}
                          style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: '8px',
                            border: isLinked ? '1.5px solid #006B70' : '1px solid #E2E8F0',
                            backgroundColor: isLinked ? '#F0FDFA' : '#FFFFFF',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.5rem'
                          }}
                        >
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {test.name}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                              {test.code} • ₹{test.price}
                            </div>
                          </div>
                          <div style={{ width: '18px', height: '18px', borderRadius: '4px', backgroundColor: isLinked ? '#006B70' : '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', flexShrink: 0 }}>
                            {isLinked && <Check size={12} strokeWidth={3} />}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Diagnostic Profiles */}
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#D97706', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Layers size={14} /> Diagnostic Profiles ({(catalog.profiles || []).filter(p => (p.categoryIds || []).includes(activeCategoryForLinks.id)).length} Linked)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.5rem' }}>
                  {(catalog.profiles || [])
                    .filter(p => !linkSearchTerm || p.name.toLowerCase().includes(linkSearchTerm.toLowerCase()) || p.code.toLowerCase().includes(linkSearchTerm.toLowerCase()))
                    .map(prof => {
                      const isLinked = (prof.categoryIds || []).includes(activeCategoryForLinks.id);
                      return (
                        <div
                          key={prof.id || prof.code}
                          onClick={() => handleToggleItemLink(activeCategoryForLinks.id, prof, 'PROFILE')}
                          style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: '8px',
                            border: isLinked ? '1.5px solid #D97706' : '1px solid #E2E8F0',
                            backgroundColor: isLinked ? '#FFFBEB' : '#FFFFFF',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.5rem'
                          }}
                        >
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {prof.name}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                              {prof.code} • ₹{prof.price}
                            </div>
                          </div>
                          <div style={{ width: '18px', height: '18px', borderRadius: '4px', backgroundColor: isLinked ? '#D97706' : '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', flexShrink: 0 }}>
                            {isLinked && <Check size={12} strokeWidth={3} />}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Health Packages */}
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#7E22CE', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Package size={14} /> Health Packages ({(catalog.packages || []).filter(pkg => (pkg.categoryIds || []).includes(activeCategoryForLinks.id)).length} Linked)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.5rem' }}>
                  {(catalog.packages || [])
                    .filter(pkg => !linkSearchTerm || pkg.name.toLowerCase().includes(linkSearchTerm.toLowerCase()) || pkg.code.toLowerCase().includes(linkSearchTerm.toLowerCase()))
                    .map(pkg => {
                      const isLinked = (pkg.categoryIds || []).includes(activeCategoryForLinks.id);
                      return (
                        <div
                          key={pkg.id || pkg.code}
                          onClick={() => handleToggleItemLink(activeCategoryForLinks.id, pkg, 'PACKAGE')}
                          style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: '8px',
                            border: isLinked ? '1.5px solid #7E22CE' : '1px solid #E2E8F0',
                            backgroundColor: isLinked ? '#FAF5FF' : '#FFFFFF',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.5rem'
                          }}
                        >
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {pkg.name}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                              {pkg.code} • ₹{pkg.price}
                            </div>
                          </div>
                          <div style={{ width: '18px', height: '18px', borderRadius: '4px', backgroundColor: isLinked ? '#7E22CE' : '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', flexShrink: 0 }}>
                            {isLinked && <Check size={12} strokeWidth={3} />}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

            </div>

            {/* Close Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem' }}>
              <button
                onClick={() => setShowLinkItemsModal(false)}
                style={{
                  padding: '0.65rem 1.4rem',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#006B70',
                  color: '#FFFFFF',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
