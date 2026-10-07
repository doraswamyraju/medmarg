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
  Tag,
  Building2
} from 'lucide-react';
import { getItemLabPricing, getStartingPrice } from '../../data/catalogStore';


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
              <tr style={{ backgroundColor: '#F8FAFC', color: '#475569', fontWeight: '800', borderBottom: '1.5px solid #E2E8F0', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '1rem 1.25rem', width: '45%' }}>Diagnostic Test / Profile</th>
                <th style={{ padding: '1rem 1rem', width: '25%' }}>Specimen & Fasting</th>
                <th style={{ padding: '1rem 1rem', width: '18%' }}>Price & Savings</th>
                <th style={{ padding: '1rem 1.25rem', width: '12%', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredByLab.slice(0, 100).map((item, idx) => {
                const itemId = item.id || item.code || item.name;
                const isPackage = item.itemType === 'PACKAGE' || item.profiles || item.discountPercent;
                const isProfile = item.itemType === 'PROFILE' || (item.code && item.code.length <= 6 && !item.serialNo);
                
                const startPricing = getStartingPrice(item);
                const isInCart = cart.some(c => (c.baseId || c.id) === itemId || c.id?.startsWith(itemId) || c.code === item.code);

                return (
                  <tr
                    key={itemId + '_' + idx}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      backgroundColor: isPackage ? '#FFFDF5' : idx % 2 === 0 ? '#FFFFFF' : '#FAFCFD',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    {/* 1. Name & Code */}
                    <td style={{ padding: '1.1rem 1.25rem', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ 
                          fontSize: '0.7rem', 
                          backgroundColor: isPackage ? '#FEF3C7' : isProfile ? '#E0F2FE' : '#E0F2F1', 
                          color: isPackage ? '#B45309' : isProfile ? '#0369A1' : '#006B70', 
                          padding: '0.15rem 0.45rem', 
                          borderRadius: '4px', 
                          fontWeight: '900' 
                        }}>
                          {isPackage ? 'PACKAGE' : isProfile ? 'PROFILE' : 'TEST'}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'monospace', fontWeight: '700' }}>
                          {item.code || item.id}
                        </span>
                      </div>
                      <div
                        onClick={() => setSelectedDetailItem(item)}
                        style={{ 
                          fontWeight: '800', 
                          color: '#0F172A', 
                          cursor: 'pointer', 
                          fontSize: '0.94rem', 
                          lineHeight: 1.35,
                          transition: 'color 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#006B70'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#0F172A'}
                      >
                        {item.name || item.title}
                      </div>
                      {item.tagline ? (
                        <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '0.2rem' }}>
                          {item.tagline}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: '0.15rem' }}>
                          {isPackage ? `${item.testsCount || '85+'} Biomarkers Included` : isProfile ? 'Multi-Parameter Organ Panel' : 'Individual Diagnostic Biomarker'}
                        </div>
                      )}
                    </td>

                    {/* 2. Specimen & Fasting */}
                    <td style={{ padding: '1.1rem 1rem', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <span style={{ fontSize: '0.76rem', color: '#475569', fontWeight: '700', backgroundColor: '#F1F5F9', padding: '0.2rem 0.5rem', borderRadius: '5px', width: 'fit-content' }}>
                          🩸 {item.sampleType || item.sampleTypes?.join(', ') || 'SERUM'}
                        </span>
                        <span style={{ 
                          fontSize: '0.74rem', 
                          color: item.fasting === 'YES' ? '#B45309' : '#047857', 
                          backgroundColor: item.fasting === 'YES' ? '#FEF3C7' : '#D1FAE5', 
                          padding: '0.2rem 0.5rem', 
                          borderRadius: '5px', 
                          fontWeight: '800', 
                          width: 'fit-content' 
                        }}>
                          ⏱ Fasting: {item.fasting || 'NO'}
                        </span>
                      </div>
                    </td>

                    {/* 3. Starting Price & MRP */}
                    <td style={{ padding: '1.1rem 1rem', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                        <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
                          Starts From
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#006B70' }}>
                            ₹{startPricing.price}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                            ₹{startPricing.mrp}
                          </span>
                        </div>
                        {startPricing.discountPercent > 0 && (
                          <span style={{ fontSize: '0.68rem', color: '#059669', backgroundColor: '#DCFCE7', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '900', width: 'fit-content' }}>
                            {startPricing.discountPercent}% OFF
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 4. Action Button */}
                    <td style={{ padding: '1.1rem 1.25rem', verticalAlign: 'middle', textAlign: 'right' }}>
                      <button
                        onClick={() => addToCart(item)}
                        style={{
                          padding: '0.55rem 1.15rem',
                          backgroundColor: isInCart ? '#059669' : '#006B70',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '10px',
                          fontWeight: '800',
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          boxShadow: isInCart ? '0 2px 6px rgba(5, 150, 105, 0.25)' : '0 2px 6px rgba(0, 107, 112, 0.25)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isInCart ? (
                          <>
                            <Check size={14} />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <Plus size={14} />
                            <span>Add</span>
                          </>
                        )}
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

