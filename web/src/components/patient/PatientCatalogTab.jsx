import React from 'react';
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
  Star
} from 'lucide-react';

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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {displayCatalogItems.slice(0, 48).map((item, idx) => {
          const itemId = item.id || item.code || item.name;
          const isInCart = cart.some(c => c.id === itemId);
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
                justify: 'space-between',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
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
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.6rem', fontSize: '0.76rem' }}>
                  <span style={{ backgroundColor: '#F1F5F9', color: '#475569', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '700' }}>
                    🩸 {item.sampleType || item.sampleTypes?.join(', ') || 'SERUM'}
                  </span>
                  <span style={{ backgroundColor: item.fasting === 'YES' ? '#FEF3C7' : '#D1FAE5', color: item.fasting === 'YES' ? '#B45309' : '#047857', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>
                    ⏱ Fasting: {item.fasting || 'NO'}
                  </span>
                  <span style={{ backgroundColor: '#F3E8FF', color: '#6B21A8', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '700' }}>
                    TAT: {item.tatHours || 24}h
                  </span>
                </div>

                {item.tagline || item.description ? (
                  <p style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.6rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.tagline || item.description}
                  </p>
                ) : null}
              </div>

              {/* Price & Add to Cart Footer */}
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#006B70' }}>₹{item.price || 499}</div>
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                    ₹{item.mrp || (item.price ? Math.round(item.price * 1.6) : 999)}
                  </div>
                </div>

                <button
                  onClick={() => addToCart(item)}
                  style={{
                    padding: '0.55rem 1.1rem',
                    backgroundColor: isInCart ? '#059669' : '#006B70',
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
                  {isInCart ? <Check size={16} /> : <Plus size={16} />}
                  {isInCart ? 'Added to Cart' : 'Add to Cart'}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
