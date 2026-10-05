import React, { useState } from 'react';
import { 
  Search, 
  FlaskConical, 
  Layers, 
  Package, 
  Plus, 
  Check, 
  Info, 
  Sparkles, 
  Clock, 
  Filter,
  ArrowRight,
  TrendingUp,
  Tag
} from 'lucide-react';

export default function PatientCatalogMatrixTab({
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
  const [selectedLabFilter, setSelectedLabFilter] = useState('ALL');

  // Multi-lab partner list
  const availableLabs = [
    { key: 'ALL', label: 'All NABL Certified Labs' },
    { key: 'Thyrocare', label: 'Thyrocare Technologies' },
    { key: 'MedMarg', label: 'MedMarg Central Processing Hub' },
    { key: 'Apollo', label: 'Apollo Diagnostics' },
    { key: 'Metropolis', label: 'Metropolis Healthcare' }
  ];

  const filteredByLab = displayCatalogItems.filter(item => {
    if (selectedLabFilter === 'ALL') return true;
    const labStr = (item.lab || '').toLowerCase();
    return labStr.includes(selectedLabFilter.toLowerCase());
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Search, Filter & Lab Multi-Selector Bar */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.25rem 1.5rem', border: '1.5px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        
        {/* Main Search Input */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={20} color="#64748B" style={{ position: 'absolute', left: '14px', top: '14px' }} />
          <input
            type="text"
            placeholder="Search from 913+ tests, 87 profiles & packages (e.g. Thyroid, HbA1c, Vitamin D, CBC, Lipid, Liver)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '0.92rem', outline: 'none', color: '#0F172A', fontWeight: '500' }}
          />
        </div>

        {/* Subtabs & Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          
          {/* Subtab Pill Switcher */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { key: 'ALL', label: 'All Catalog Items', icon: FlaskConical },
              { key: 'PACKAGES', label: 'Full Body Packages', icon: Package, count: catalog.packages?.length || 4 },
              { key: 'PROFILES', label: 'Organ Panels', icon: Layers, count: catalog.profiles?.length || 87 },
              { key: 'TESTS', label: 'Single Biomarkers', icon: FlaskConical, count: catalog.tests?.length || 913 }
            ].map(st => {
              const isSel = catalogSubTab === st.key;
              const IconC = st.icon;
              return (
                <button
                  key={st.key}
                  onClick={() => setCatalogSubTab(st.key)}
                  style={{
                    padding: '0.5rem 0.95rem',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: isSel ? '#006B70' : '#F1F5F9',
                    color: isSel ? '#FFF' : '#475569',
                    fontWeight: '800',
                    fontSize: '0.84rem',
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

          {/* Quick Dropdown Filters */}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <select
              value={selectedLabFilter}
              onChange={(e) => setSelectedLabFilter(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', color: '#334155', fontWeight: '700', backgroundColor: '#F8FAFC' }}
            >
              {availableLabs.map(l => (
                <option key={l.key} value={l.key}>{l.label}</option>
              ))}
            </select>

            <select
              value={fastingFilter}
              onChange={(e) => setFastingFilter(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', color: '#334155', fontWeight: '700', backgroundColor: '#F8FAFC' }}
            >
              <option value="ALL">Fasting: All</option>
              <option value="YES">Fasting Required (YES)</option>
              <option value="NO">No Fasting (NO)</option>
            </select>

            <select
              value={sampleFilter}
              onChange={(e) => setSampleFilter(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', color: '#334155', fontWeight: '700', backgroundColor: '#F8FAFC' }}
            >
              <option value="ALL">Sample Tube: All</option>
              <option value="SERUM">Serum (Gold Tube)</option>
              <option value="EDTA">EDTA (Purple Tube)</option>
              <option value="URINE">Urine Container</option>
            </select>
          </div>

        </div>

      </div>

      {/* MATRIX TABLE VIEW */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1.5px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
        
        {/* Table Header Bar */}
        <div style={{ padding: '1rem 1.5rem', backgroundColor: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A' }}>
            Showing <strong>{filteredByLab.length}</strong> Diagnostic Items in Tirupati Catalog Matrix
          </div>
          <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: '800' }}>
            ⚡ 100% NABL Accredited Rates & Transparent Upgrades
          </div>
        </div>

        {/* Matrix Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F1F5F9', color: '#475569', fontWeight: '800', borderBottom: '1.5px solid #E2E8F0', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>Diagnostic Test / Profile</th>
                <th style={{ padding: '0.85rem 1rem' }}>Processing Lab Hub</th>
                <th style={{ padding: '0.85rem 1rem' }}>Specimen & Fasting</th>
                <th style={{ padding: '0.85rem 1rem' }}>Biomarkers & TAT</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Package Upgrade Offer</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Price (₹)</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredByLab.slice(0, 60).map((item, idx) => {
                const itemId = item.id || item.code || item.name;
                const isInCart = cart.some(c => c.id === itemId);
                const isPackage = item.itemType === 'PACKAGE' || item.profiles || item.discountPercent;
                const isProfile = item.itemType === 'PROFILE' || (item.code && item.code.length <= 6 && !item.serialNo);

                // Dynamic package inclusion check
                const includedInPackage = isPackage 
                  ? null 
                  : (item.name.toLowerCase().includes('lipid') || item.name.toLowerCase().includes('cholesterol'))
                    ? 'Cardiac Care Package (Save ₹650)'
                    : (item.name.toLowerCase().includes('thyroid') || item.name.toLowerCase().includes('tsh'))
                    ? 'Aarogyam 1.3 Full Body (Save ₹1,400)'
                    : (item.name.toLowerCase().includes('sugar') || item.name.toLowerCase().includes('glucose') || item.name.toLowerCase().includes('hba1c'))
                    ? 'Diabetic Comprehensive Panel (Save ₹800)'
                    : 'Master Health Checkup (Save 60%)';

                return (
                  <tr
                    key={itemId + '_' + idx}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      backgroundColor: isPackage ? '#FEFCE8' : idx % 2 === 0 ? '#FFFFFF' : '#FBFDFD',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    {/* 1. Name & Code */}
                    <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontSize: '0.7rem', backgroundColor: isPackage ? '#FEF3C7' : isProfile ? '#E0F2FE' : '#E0F2F1', color: isPackage ? '#B45309' : isProfile ? '#0369A1' : '#006B70', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '900' }}>
                          {isPackage ? 'PACKAGE' : isProfile ? 'PROFILE' : 'TEST'}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'monospace', fontWeight: '700' }}>
                          {item.code || item.id}
                        </span>
                      </div>
                      <div
                        onClick={() => setSelectedDetailItem(item)}
                        style={{ fontWeight: '800', color: '#0F172A', cursor: 'pointer', fontSize: '0.92rem', lineHeight: 1.35 }}
                      >
                        {item.name || item.title}
                      </div>
                      {item.tagline && (
                        <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '0.15rem' }}>
                          {item.tagline}
                        </div>
                      )}
                    </td>

                    {/* 2. Processing Lab */}
                    <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: '700', color: '#334155' }}>
                        {item.lab || 'MedMarg Central Lab'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '800' }}>
                        ✓ NABL Certified
                      </div>
                    </td>

                    {/* 3. Specimen & Fasting */}
                    <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '700', backgroundColor: '#F1F5F9', padding: '0.15rem 0.45rem', borderRadius: '4px', width: 'fit-content' }}>
                          🩸 {item.sampleType || item.sampleTypes?.join(', ') || 'SERUM (Gold)'}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: item.fasting === 'YES' ? '#B45309' : '#047857', backgroundColor: item.fasting === 'YES' ? '#FEF3C7' : '#D1FAE5', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '800', width: 'fit-content' }}>
                          ⏱ Fasting: {item.fasting || 'NO'}
                        </span>
                      </div>
                    </td>

                    {/* 4. Biomarkers & TAT */}
                    <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                      <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.84rem' }}>
                        {item.testCount || item.params || 1} Biomarker(s)
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.15rem' }}>
                        TAT: <strong>{item.tatHours || 24}h</strong>
                      </div>
                    </td>

                    {/* 5. Package Upgrade Offer Pill */}
                    <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle' }}>
                      {isPackage ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.25rem 0.6rem', borderRadius: '8px', fontSize: '0.76rem', fontWeight: '900' }}>
                          <Sparkles size={13} /> {item.discountPercent || 60}% Standalone Savings
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            const foundPkg = (catalog.packages || []).find(p => p.name.toLowerCase().includes('aarogyam') || p.name.toLowerCase().includes('master')) || catalog.packages?.[0];
                            if (foundPkg) setSelectedDetailItem(foundPkg);
                          }}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0', padding: '0.25rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                        >
                          <Tag size={13} />
                          <span>{includedInPackage}</span>
                          <ArrowRight size={12} />
                        </div>
                      )}
                    </td>

                    {/* 6. Pricing */}
                    <td style={{ padding: '1rem', verticalAlign: 'middle', textAlign: 'right' }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#006B70' }}>
                        ₹{item.price || 499}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                        ₹{item.mrp || (item.price ? Math.round(item.price * 1.6) : 999)}
                      </div>
                    </td>

                    {/* 7. Action Button */}
                    <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle', textAlign: 'center' }}>
                      <button
                        onClick={() => addToCart(item)}
                        style={{
                          padding: '0.5rem 0.95rem',
                          backgroundColor: isInCart ? '#059669' : '#006B70',
                          color: '#FFF',
                          border: 'none',
                          borderRadius: '10px',
                          fontWeight: '800',
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          boxShadow: '0 2px 6px rgba(0,107,112,0.2)',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {isInCart ? <Check size={14} /> : <Plus size={14} />}
                        <span>{isInCart ? 'In Cart' : 'Add Test'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
