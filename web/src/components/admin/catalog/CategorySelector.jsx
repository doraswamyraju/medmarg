import React, { useState } from 'react';
import { Tag, Plus, Check, X, Sparkles } from 'lucide-react';
import { CATEGORY_ICON_PRESETS } from './DiscoveryCategoriesTab';
import { API_BASE } from '../../../data/apiConfig';

/**
 * CategorySelector
 * Multi-select discovery category tagger for Single Tests, Test Profiles, and Health Packages.
 * Categories are independent of clinical/commercial composition (many-to-many relationship).
 */
export default function CategorySelector({
  categories = [],
  selectedCategoryIds = [],
  onChange = () => {},
  onQuickCreateCategory = null
}) {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [newCatName, setNewCatName] = useState('');

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        Assigning items to discovery categories makes them easy to find in the customer app without duplicating items or altering clinical composition.
      </p>

      {/* Quick Add Inline Input */}
      {showQuickAdd && (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
          <input
            type="text"
            placeholder="e.g. Thyroid Care, Women's Health..."
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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {categories.map(cat => {
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
                fontSize: '0.8rem',
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
