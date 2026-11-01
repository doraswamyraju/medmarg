import React, { useState } from 'react';
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
  SlidersHorizontal
} from 'lucide-react';
import { API_BASE } from '../../../data/apiConfig';

export default function DiscoveryCategoriesTab({
  categories = [],
  setCategories = () => {},
  catalog = { tests: [], profiles: [], packages: [] },
  setCatalog = () => {},
  saveCatalogState = () => {}
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLinkItemsModal, setShowLinkItemsModal] = useState(false);
  const [activeCategoryForLinks, setActiveCategoryForLinks] = useState(null);
  const [linkSearchTerm, setLinkSearchTerm] = useState('');

  // Category Form
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: '',
    description: '',
    icon: 'square.grid.2x2.fill',
    displayOrder: 1,
    isFeatured: true,
    active: true
  });

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setCategoryForm({
      id: '',
      name: '',
      description: '',
      icon: 'square.grid.2x2.fill',
      displayOrder: (categories.length || 0) + 1,
      isFeatured: true,
      active: true
    });
    setShowCategoryModal(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({
      id: cat.id,
      name: cat.name,
      description: cat.description || '',
      icon: cat.icon || 'square.grid.2x2.fill',
      displayOrder: cat.displayOrder || 1,
      isFeatured: cat.isFeatured !== undefined ? cat.isFeatured : true,
      active: cat.active !== undefined ? cat.active : true
    });
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/api/v1/catalog/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      });
      if (res.ok) {
        const data = await res.json();
        const saved = data.category;
        let updatedList = [...categories];
        const idx = updatedList.findIndex(c => c.id === saved.id);
        if (idx >= 0) {
          updatedList[idx] = saved;
        } else {
          updatedList.push(saved);
        }
        updatedList.sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));
        setCategories(updatedList);
        setShowCategoryModal(false);
      }
    } catch (err) {
      console.error('Failed to save category:', err);
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Are you sure you want to delete this discovery category? Linked items will remain in the catalog.')) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/catalog/categories/${catId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const updatedList = categories.filter(c => c.id !== catId);
        setCategories(updatedList);
      }
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

  // Toggle item linkage to category
  const handleToggleItemLink = async (itemKind, itemCode) => {
    if (!activeCategoryForLinks) return;
    const catId = activeCategoryForLinks.id;

    let updatedCatalog = { ...catalog };

    if (itemKind === 'TEST') {
      updatedCatalog.tests = (updatedCatalog.tests || []).map(t => {
        if (t.code === itemCode) {
          const current = t.categoryIds || [];
          const next = current.includes(catId) ? current.filter(id => id !== catId) : [...current, catId];
          return { ...t, categoryIds: next };
        }
        return t;
      });
    } else if (itemKind === 'PROFILE') {
      updatedCatalog.profiles = (updatedCatalog.profiles || []).map(p => {
        if (p.code === itemCode) {
          const current = p.categoryIds || [];
          const next = current.includes(catId) ? current.filter(id => id !== catId) : [...current, catId];
          return { ...p, categoryIds: next };
        }
        return p;
      });
    } else if (itemKind === 'PACKAGE') {
      updatedCatalog.packages = (updatedCatalog.packages || []).map(pkg => {
        if (pkg.code === itemCode) {
          const current = pkg.categoryIds || [];
          const next = current.includes(catId) ? current.filter(id => id !== catId) : [...current, catId];
          return { ...pkg, categoryIds: next };
        }
        return pkg;
      });
    }

    setCatalog(updatedCatalog);
    await saveCatalogState(updatedCatalog);
  };

  const filteredCategories = categories.filter(c => {
    const q = (searchTerm || '').toLowerCase();
    return !q || (c.name && c.name.toLowerCase().includes(q)) || (c.description && c.description.toLowerCase().includes(q));
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Header & Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        backgroundColor: '#FFFFFF',
        padding: '1.25rem 1.5rem',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Tag size={22} color="#006B70" /> Discovery Categories ({categories.length})
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>
            Discovery categories organize tests, profiles, and packages for customer browsing without duplicating items or altering clinical definitions.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: '#006B70',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            padding: '0.65rem 1.25rem',
            fontSize: '0.875rem',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,107,112,0.2)'
          }}
        >
          <Plus size={18} /> Add Category
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', maxWidth: '400px' }}>
        <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.65rem 1rem 0.65rem 2.25rem',
            borderRadius: '10px',
            border: '1px solid #CBD5E1',
            fontSize: '0.85rem'
          }}
        />
      </div>

      {/* Categories Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
        {filteredCategories.map(cat => {
          const testCount = (catalog.tests || []).filter(t => (t.categoryIds || []).includes(cat.id)).length;
          const profileCount = (catalog.profiles || []).filter(p => (p.categoryIds || []).includes(cat.id)).length;
          const packageCount = (catalog.packages || []).filter(pkg => (pkg.categoryIds || []).includes(cat.id)).length;
          const totalItems = testCount + profileCount + packageCount;

          return (
            <div
              key={cat.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.7rem',
                    fontWeight: '800',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px',
                    backgroundColor: cat.isFeatured ? '#FEF3C7' : '#F1F5F9',
                    color: cat.isFeatured ? '#B45309' : '#475569'
                  }}>
                    {cat.isFeatured ? <Sparkles size={11} /> : null}
                    {cat.isFeatured ? 'FEATURED' : `ORDER: #${cat.displayOrder || 1}`}
                  </span>

                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(cat)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: '#64748B' }}
                      title="Edit Category"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: '#EF4444' }}
                      title="Delete Category"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', margin: '0 0 0.35rem 0' }}>
                  {cat.name}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                  {cat.description || 'No description provided.'}
                </p>
              </div>

              {/* Linked Items Counts */}
              <div style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '10px',
                padding: '0.75rem',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                fontSize: '0.75rem'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: '800', color: '#0284C7', fontSize: '0.95rem' }}>{testCount}</div>
                  <div style={{ color: '#64748B' }}>Tests</div>
                </div>
                <div style={{ height: '20px', width: '1px', backgroundColor: '#CBD5E1' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: '800', color: '#9333EA', fontSize: '0.95rem' }}>{profileCount}</div>
                  <div style={{ color: '#64748B' }}>Profiles</div>
                </div>
                <div style={{ height: '20px', width: '1px', backgroundColor: '#CBD5E1' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: '800', color: '#059669', fontSize: '0.95rem' }}>{packageCount}</div>
                  <div style={{ color: '#64748B' }}>Packages</div>
                </div>
              </div>

              {/* Action Button: Manage Linked Items */}
              <button
                type="button"
                onClick={() => {
                  setActiveCategoryForLinks(cat);
                  setShowLinkItemsModal(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  backgroundColor: '#FFFFFF',
                  color: '#006B70',
                  border: '1.5px solid #006B70',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                <SlidersHorizontal size={14} /> Manage Linked Items ({totalItems})
              </button>
            </div>
          );
        })}
      </div>

      {/* MODAL: ADD / EDIT CATEGORY */}
      {showCategoryModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '480px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                {editingCategory ? 'Edit Discovery Category' : 'Create Discovery Category'}
              </h3>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Heart Health, Diabetes Care"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short description for customer browsing..."
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                    SF Symbol / Icon
                  </label>
                  <select
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  >
                    <option value="flame.fill">Flame (Popular)</option>
                    <option value="drop.fill">Blood Drop (Diabetes)</option>
                    <option value="heart.fill">Heart (Cardiology)</option>
                    <option value="cross.case.fill">Cross Case (Thyroid)</option>
                    <option value="figure.stand.dress">Women's Health</option>
                    <option value="figure.walk">Senior Citizen</option>
                    <option value="shield.lefthalf.filled">Full Body Checkups</option>
                    <option value="square.grid.2x2.fill">General Grid</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={categoryForm.displayOrder}
                    onChange={(e) => setCategoryForm({ ...categoryForm, displayOrder: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#1E293B', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={categoryForm.isFeatured}
                    onChange={(e) => setCategoryForm({ ...categoryForm, isFeatured: e.target.checked })}
                  />
                  Featured in Top Carousel
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#1E293B', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={categoryForm.active}
                    onChange={(e) => setCategoryForm({ ...categoryForm, active: e.target.checked })}
                  />
                  Active & Visible
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#475569',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#006B70',
                    color: '#FFFFFF',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANAGE LINKED PRODUCTS */}
      {showLinkItemsModal && activeCategoryForLinks && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '85vh',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  Link Items to "{activeCategoryForLinks.name}"
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
                  Select which Single Tests, Profiles, and Packages appear in this category.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLinkItemsModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search across tests, profiles, packages..."
                value={linkSearchTerm}
                onChange={(e) => setLinkSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            {/* List */}
            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '50vh' }}>
              {/* Packages */}
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#059669', marginTop: '0.25rem' }}>HEALTH PACKAGES</div>
              {(catalog.packages || []).filter(pkg => !linkSearchTerm || (pkg.name && pkg.name.toLowerCase().includes(linkSearchTerm.toLowerCase()))).map(pkg => {
                const isLinked = (pkg.categoryIds || []).includes(activeCategoryForLinks.id);
                return (
                  <div
                    key={`pkg_${pkg.code}`}
                    onClick={() => handleToggleItemLink('PACKAGE', pkg.code)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: isLinked ? '1.5px solid #059669' : '1px solid #E2E8F0',
                      backgroundColor: isLinked ? '#ECFDF5' : '#FFFFFF',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Package size={16} color="#059669" />
                      <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1E293B' }}>{pkg.name} ({pkg.code})</span>
                    </div>
                    {isLinked && <Check size={16} color="#059669" />}
                  </div>
                );
              })}

              {/* Profiles */}
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#9333EA', marginTop: '0.5rem' }}>DIAGNOSTIC PROFILES</div>
              {(catalog.profiles || []).filter(p => !linkSearchTerm || (p.name && p.name.toLowerCase().includes(linkSearchTerm.toLowerCase()))).map(p => {
                const isLinked = (p.categoryIds || []).includes(activeCategoryForLinks.id);
                return (
                  <div
                    key={`prof_${p.code}`}
                    onClick={() => handleToggleItemLink('PROFILE', p.code)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: isLinked ? '1.5px solid #9333EA' : '1px solid #E2E8F0',
                      backgroundColor: isLinked ? '#FAF5FF' : '#FFFFFF',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Layers size={16} color="#9333EA" />
                      <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1E293B' }}>{p.name} ({p.code})</span>
                    </div>
                    {isLinked && <Check size={16} color="#9333EA" />}
                  </div>
                );
              })}

              {/* Tests */}
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0284C7', marginTop: '0.5rem' }}>SINGLE TESTS</div>
              {(catalog.tests || []).filter(t => !linkSearchTerm || (t.name && t.name.toLowerCase().includes(linkSearchTerm.toLowerCase()))).map(t => {
                const isLinked = (t.categoryIds || []).includes(activeCategoryForLinks.id);
                return (
                  <div
                    key={`test_${t.code}`}
                    onClick={() => handleToggleItemLink('TEST', t.code)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: isLinked ? '1.5px solid #0284C7' : '1px solid #E2E8F0',
                      backgroundColor: isLinked ? '#F0F9FF' : '#FFFFFF',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FlaskConical size={16} color="#0284C7" />
                      <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1E293B' }}>{t.name} ({t.code})</span>
                    </div>
                    {isLinked && <Check size={16} color="#0284C7" />}
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setShowLinkItemsModal(false)}
                style={{
                  padding: '0.55rem 1.25rem',
                  borderRadius: '8px',
                  backgroundColor: '#006B70',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: '700',
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

