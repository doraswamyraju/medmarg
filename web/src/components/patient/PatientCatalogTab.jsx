import React, { useState } from 'react';
import { 
  Search, 
  FlaskConical, 
  Layers, 
  Package, 
  Plus, 
  Check, 
  Info,
  Clock,
  Thermometer,
  ShieldCheck,
  Star,
  Building2,
  ChevronRight
} from 'lucide-react';
import { getItemLabPricing } from '../../data/catalogStore';

export default function PatientCatalogTab({
  catalog,
  catalogSubTab,
  setCatalogSubTab,
  searchQuery,
  setSearchQuery,
  fastingFilter,
  setFastingFilter,
  sampleFilter,
  setSampleFilter,
  displayCatalogItems,
  addToCart,
  cart,
  setSelectedDetailItem
}) {
  // Local map to track chosen lab per card (defaults to MedMarg Suggested)
  const [cardLabSelection, setCardLabSelection] = useState({});

  const handleSelectCardLab = (itemId, labOption) => {
    setCardLabSelection(prev => ({ ...prev, [itemId]: labOption }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Search & Filter Header Bar */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.25rem', border: '1.5px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Main Search Input */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={20} color="#64748B" style={{ position: 'absolute', left: '14px', top: '14px' }} />
          <input
            type="text"
            placeholder="Search from 913+ tests, 87 profiles & health packages (e.g. Vitamin D, Thyroid, Diabetes, CBC)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '0.92rem', outline: 'none', color: '#0F172A', fontWeight: '500' }}
          />
        </div>

        {/* Subtabs & Filters Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          
          {/* Subtabs Pill Switcher */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { key: 'ALL', label: 'All Catalog Items', icon: FlaskConical },
              { key: 'PACKAGES', label: 'Health Packages', icon: Package, count: catalog.packages?.length || 4 },
              { key: 'PROFILES', label: 'Diagnostic Profiles', icon: Layers, count: catalog.profiles?.length || 87 },
              { key: 'TESTS', label: 'Individual Tests', icon: FlaskConical, count: catalog.tests?.length || 913 }
            ].map(st => {
              const isSel = catalogSubTab === st.key;
              const IconC = st.icon;
              return (
                <button
                  key={st.key}
                  onClick={() => setCatalogSubTab(st.key)}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: isSel ? '#006B70' : '#F1F5F9',
                    color: isSel ? '#FFF' : '#475569',
                    fontWeight: '800',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem'
                  }}
                >
                  <IconC size={15} color={isSel ? '#FBBF24' : '#64748B'} />
                  {st.label} {st.count !== undefined ? `(${st.count})` : ''}
                </button>
              );
            })}
          </div>

          {/* Quick Filters Dropdowns */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <select
              value={fastingFilter}
              onChange={(e) => setFastingFilter(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', color: '#334155', fontWeight: '600' }}
            >
              <option value="ALL">Fasting Filter: All</option>
              <option value="YES">Fasting Required (YES)</option>
              <option value="NO">No Fasting (NO)</option>
            </select>

            <select
              value={sampleFilter}
              onChange={(e) => setSampleFilter(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', color: '#334155', fontWeight: '600' }}
            >
              <option value="ALL">Sample Type: All</option>
              <option value="SERUM">Serum Blood</option>
              <option value="EDTA">EDTA Whole Blood</option>
              <option value="URINE">Urine Container</option>
            </select>
          </div>

        </div>

      </div>

      {/* Catalog Items Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {displayCatalogItems.slice(0, 48).map((item, idx) => {
          const itemId = item.id || item.code || item.name;
          const labPricing = getItemLabPricing(item);
          const activeLab = cardLabSelection[itemId] || labPricing.find(l => l.isRecommended) || labPricing[0];
          const isItemInCart = cart.some(c => c.id === `${itemId}_${activeLab.labId}` || c.id === itemId);
          const isPackage = item.itemType === 'PACKAGE' || item.profiles || item.discountPercent;
          const isProfile = item.itemType === 'PROFILE' || (item.code && item.code.length <= 6 && !item.serialNo);

          return (
            <div
              key={itemId + '_' + idx}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                padding: '1.5rem',
                border: isPackage ? '2px solid #006B70' : '1.5px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                position: 'relative'
              }}
            >
              <div>
                {/* Badge Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.72rem', backgroundColor: isPackage ? '#FEF3C7' : isProfile ? '#E0F2FE' : '#E0F2F1', color: isPackage ? '#B45309' : isProfile ? '#0369A1' : '#006B70', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '800' }}>
                    {isPackage ? `${item.discountPercent || 50}% OFF • PACKAGE` : isProfile ? `PROFILE PANEL` : `SINGLE TEST`}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'monospace', fontWeight: '700' }}>
                    {item.code || item.id}
                  </span>
                </div>

                {/* Title */}
                <h3 
                  onClick={() => setSelectedDetailItem(item)}
                  style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', cursor: 'pointer', lineHeight: 1.3 }}
                >
                  {item.name || item.title}
                </h3>

                {/* Info Pills */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem', fontSize: '0.74rem' }}>
                  <span style={{ backgroundColor: '#F1F5F9', color: '#475569', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '700' }}>
                    🩸 {item.sampleType || item.sampleTypes?.join(', ') || 'SERUM'}
                  </span>
                  <span style={{ backgroundColor: item.fasting === 'YES' ? '#FEF3C7' : '#D1FAE5', color: item.fasting === 'YES' ? '#B45309' : '#047857', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '800' }}>
                    ⏱ Fasting: {item.fasting || 'NO'}
                  </span>
                  <span style={{ backgroundColor: '#F3E8FF', color: '#6B21A8', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '700' }}>
                    TAT: {activeLab.tatHours || item.tatHours || 24}h
                  </span>
                </div>

                {item.tagline || item.description ? (
                  <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.5rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.tagline || item.description}
                  </p>
                ) : null}

                {/* 3 LAB PROVIDERS SWITCHER CHIPS */}
                <div style={{ marginTop: '0.85rem', padding: '0.6rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '800', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    Choose Processing Lab:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem' }}>
                    {labPricing.map((labOpt) => {
                      const isOptionSelected = activeLab.labId === labOpt.labId;
                      const isMedmarg = labOpt.isMedmargSuggested;

                      return (
                        <button
                          key={labOpt.labId}
                          type="button"
                          onClick={() => handleSelectCardLab(itemId, labOpt)}
                          style={{
                            padding: '0.35rem 0.2rem',
                            borderRadius: '8px',
                            border: isOptionSelected ? (isMedmarg ? '2px solid #006B70' : '2px solid #D97706') : '1px solid #CBD5E1',
                            backgroundColor: isOptionSelected ? (isMedmarg ? '#E6FFFA' : '#FFFBEB') : '#FFFFFF',
                            color: '#0F172A',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            lineHeight: 1.15
                          }}
                        >
                          <span style={{ fontSize: '0.74rem', fontWeight: isMedmarg ? '900' : '800', color: isMedmarg ? '#006B70' : labOpt.labId === 'thyrocare' ? '#B91C1C' : '#D97706' }}>
                            {isMedmarg ? 'MedMarg' : labOpt.labName.split(' ')[0]}
                          </span>
                          <span style={{ fontSize: '0.82rem', fontWeight: '900', color: '#0F172A', marginTop: '0.1rem' }}>
                            ₹{labOpt.price}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {activeLab.isMedmargSuggested && (
                    <div style={{ fontSize: '0.68rem', color: '#004D40', fontWeight: '700', marginTop: '0.3rem', textAlign: 'center' }}>
                      ✓ MedMarg Curated (via {activeLab.suggestedLabName || 'Suggested Partner Lab'})
                    </div>
                  )}
                </div>

              </div>

              {/* Price & Add to Cart Footer */}
              <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#006B70' }}>₹{activeLab.price}</div>
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                    ₹{activeLab.mrp}
                  </div>
                </div>

                <button
                  onClick={() => addToCart(item, activeLab)}
                  style={{
                    padding: '0.55rem 1.1rem',
                    backgroundColor: isItemInCart ? '#059669' : '#006B70',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '800',
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 2px 6px rgba(0,107,112,0.2)'
                  }}
                >
                  {isItemInCart ? <Check size={16} /> : <Plus size={16} />}
                  {isItemInCart ? 'Added' : `Add (${activeLab.labName})`}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}

