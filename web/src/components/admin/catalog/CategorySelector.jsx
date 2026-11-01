import React, { useState } from 'react';
import { Tag, Plus, Check, X, Sparkles, FlaskConical, Crosshair, Heart, Users, Shield } from 'lucide-react';
import { CATEGORY_ICON_PRESETS, TAXONOMY_GROUPS } from './DiscoveryCategoriesTab';
import { API_BASE } from '../../../data/apiConfig';

/**
 * CategorySelector
 * Multi-select discovery category tagger for Single Tests, Test Profiles, and Health Packages.
 * Categorized by the 6 core taxonomy dimensions (many-to-many relationship).
 */
export default function CategorySelector({
  categories = [],
  selectedCategoryIds = [],
  onChange = () => {},
  onQuickCreateCategory = null
}) {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('ALL');

  const toggleCategory = (catId) => {
    if (selectedCategoryIds.includes(catId)) {
      onChange(selectedCategoryIds.filter(id => id !== catId));
    } else {
      onChange([...selectedCategoryIds, catId]);
    }
  };

  const handleQuickAdd = () => {
    if (!newCatName.trim()) return;
    if (onQuickCreateCategory) {
      onQuickCreateCategory(newCatName.trim());
      setNewCatName('');
      setShowQuickAdd(false);
    }
  };

  const visibleCategories = categories.filter(c => {
    if (selectedGroupFilter === 'ALL') return true;
    return (c.group || 'CONDITION') === selectedGroupFilter;
  });

  return (
    <div style={{
      backgroundColor: '#F8FAFC',
      border: '1px solid #E2E8F0',
      borderRadius: '12px',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Tag size={16} color="#006B70" />
          <span style={{ fontSize: '0.875rem', fontWeight: '800', color: '#1E293B' }}>
            Discovery Categories ({selectedCategoryIds.length} Assigned)
          </span>
        </div>
        {onQuickCreateCategory && !showQuickAdd && (
          <button
            type="button"
            onClick={() => setShowQuickAdd(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#006B70',
              fontSize: '0.8rem',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            <Plus size={14} /> + New Category
          </button>
        )}
      </div>

      <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>
        Assign this item across clinical specialty, target health concern, body organ, demographic, or promotional collections without duplicating clinical data or altering pricing.
      </p>

      {/* Taxonomy Dimension Filter Pills */}
      <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
        {TAXONOMY_GROUPS.map(grp => {
          const isSel = selectedGroupFilter === grp.key;
          const assignedInGroup = categories.filter(c => (grp.key === 'ALL' || (c.group || 'CONDITION') === grp.key) && selectedCategoryIds.includes(c.id)).length;

          return (
            <button
              key={grp.key}
              type="button"
              onClick={() => setSelectedGroupFilter(grp.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.25rem 0.6rem',
                borderRadius: '8px',
                border: isSel ? 'none' : '1px solid #CBD5E1',
                backgroundColor: isSel ? '#006B70' : '#FFFFFF',
                color: isSel ? '#FFFFFF' : '#475569',
                fontSize: '0.72rem',
                fontWeight: isSel ? '800' : '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <span>{grp.label}</span>
              {assignedInGroup > 0 && (
                <span style={{ backgroundColor: isSel ? 'rgba(255,255,255,0.3)' : '#E0F2F1', color: isSel ? '#FFFFFF' : '#006B70', fontSize: '0.65rem', padding: '0 0.35rem', borderRadius: '10px', fontWeight: '800' }}>
                  {assignedInGroup}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Add Inline Input */}
      {showQuickAdd && (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
          <input
            type="text"
            placeholder="e.g. Hematology, Thyroid Care, Kidney..."
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleQuickAdd(); } }}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '0.85rem'
            }}
          />
          <button
            type="button"
            onClick={handleQuickAdd}
            style={{
              backgroundColor: '#006B70',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setShowQuickAdd(false)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Categories Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.25rem' }}>
        {visibleCategories.map(cat => {
          const isSelected = selectedCategoryIds.includes(cat.id);
          const preset = CATEGORY_ICON_PRESETS?.find(p => p.sfSymbol === cat.icon) || { icon: Tag };
          const IconComp = preset.icon || Tag;
          const themeColor = cat.color || '#006B70';
          const hasImage = Boolean(cat.imageUrl);

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleCategory(cat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.8rem',
                borderRadius: '20px',
                border: isSelected ? `1.5px solid ${themeColor}` : '1px solid #CBD5E1',
                backgroundColor: isSelected ? `${themeColor}18` : '#FFFFFF',
                color: isSelected ? themeColor : '#475569',
                fontSize: '0.78rem',
                fontWeight: isSelected ? '800' : '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? `0 2px 8px ${themeColor}25` : 'none'
              }}
            >
              {isSelected ? (
                <Check size={14} color={themeColor} strokeWidth={3} />
              ) : hasImage ? (
                <img
                  src={cat.imageUrl.startsWith('/uploads') ? `${API_BASE}${cat.imageUrl}` : cat.imageUrl}
                  alt=""
                  style={{ width: '14px', height: '14px', borderRadius: '50%', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <IconComp size={13} color={themeColor} />
              )}
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
