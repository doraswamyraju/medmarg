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
import { getItemLabPricing } from '../../data/catalogStore';


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
                <th style={{ padding: '0.85rem 1.25rem', width: '28%' }}>Diagnostic Test / Profile</th>
                <th style={{ padding: '0.85rem 1rem', width: '16%' }}>Specimen & Fasting</th>
                <th style={{ padding: '0.85rem 1rem', width: '20%', backgroundColor: 'rgba(0,107,112,0.06)', borderLeft: '2px solid #006B70' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#006B70' }}>1. MEDMARG</span>
                    <span style={{ fontSize: '0.68rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: '900' }}>SUGGESTED</span>
                  </div>
                </th>
                <th style={{ padding: '0.85rem 1rem', width: '18%', borderLeft: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#B91C1C' }}>2. THYROCARE</span>
                </th>
                <th style={{ padding: '0.85rem 1rem', width: '18%', borderLeft: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#D97706' }}>3. DR. LAL PATHLABS</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredByLab.slice(0, 60).map((item, idx) => {
                const itemId = item.id || item.code || item.name;
                const isPackage = item.itemType === 'PACKAGE' || item.profiles || item.discountPercent;
                const isProfile = item.itemType === 'PROFILE' || (item.code && item.code.length <= 6 && !item.serialNo);
                
                // 3 Lab Options
                const pricing = getItemLabPricing(item);
                const medmargOpt = pricing.find(l => l.isMedmargSuggested) || pricing[0];
                const thyrocareOpt = pricing.find(l => l.labId === 'thyrocare') || pricing[1];
                const lalpathOpt = pricing.find(l => l.labId === 'lalpath') || pricing[2];

                const isMedmargInCart = cart.some(c => c.id === `${itemId}_${medmargOpt.labId}` || c.id === itemId);
                const isThyrocareInCart = cart.some(c => c.id === `${itemId}_${thyrocareOpt.labId}`);
                const isLalpathInCart = cart.some(c => c.id === `${itemId}_${lalpathOpt.labId}`);

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

                    {/* 2. Specimen & Fasting */}
                    <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '700', backgroundColor: '#F1F5F9', padding: '0.15rem 0.45rem', borderRadius: '4px', width: 'fit-content' }}>
                          🩸 {item.sampleType || item.sampleTypes?.join(', ') || 'SERUM'}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: item.fasting === 'YES' ? '#B45309' : '#047857', backgroundColor: item.fasting === 'YES' ? '#FEF3C7' : '#D1FAE5', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '800', width: 'fit-content' }}>
                          ⏱ Fasting: {item.fasting || 'NO'}
                        </span>
                      </div>
                    </td>

                    {/* 3. MedMarg Suggested Lab */}
                    <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle', backgroundColor: 'rgba(0,107,112,0.03)', borderLeft: '2px solid #006B70' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                        <span style={{ fontSize: '1.15rem', fontWeight: '900', color: '#006B70' }}>
                          MedMarg
                        </span>
                        <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: '800' }}>★ Top Pick</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: '700', marginTop: '0.1rem' }}>
                        via <span style={{ color: '#004D40', fontWeight: '800' }}>{medmargOpt.suggestedLabName || 'Suggested Partner Hub'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                        <div>
                          <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>₹{medmargOpt.price}</div>
                          <div style={{ fontSize: '0.7rem', color: '#94A3B8', textDecoration: 'line-through' }}>₹{medmargOpt.mrp}</div>
                        </div>
                        <button
                          onClick={() => addToCart(item, medmargOpt)}
                          style={{
                            padding: '0.35rem 0.75rem',
                            backgroundColor: isMedmargInCart ? '#059669' : '#006B70',
                            color: '#FFF',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '800',
                            fontSize: '0.78rem',
                            cursor: 'pointer'
                          }}
                        >
                          {isMedmargInCart ? '✓ Added' : '+ Add'}
                        </button>
                      </div>
                    </td>

                    {/* 4. Thyrocare */}
                    <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle', borderLeft: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: '900', color: '#B91C1C' }}>Thyrocare</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.1rem' }}>Direct Automated Lab</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                        <div>
                          <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>₹{thyrocareOpt.price}</div>
                          <div style={{ fontSize: '0.7rem', color: '#94A3B8', textDecoration: 'line-through' }}>₹{thyrocareOpt.mrp}</div>
                        </div>
                        <button
                          onClick={() => addToCart(item, thyrocareOpt)}
                          style={{
                            padding: '0.35rem 0.75rem',
                            backgroundColor: isThyrocareInCart ? '#059669' : '#B91C1C',
                            color: '#FFF',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '800',
                            fontSize: '0.78rem',
                            cursor: 'pointer'
                          }}
                        >
                          {isThyrocareInCart ? '✓ Added' : '+ Add'}
                        </button>
                      </div>
                    </td>

                    {/* 5. Dr. Lal PathLabs */}
                    <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle', borderLeft: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: '900', color: '#D97706' }}>Dr. Lal PathLabs</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.1rem' }}>National Reference Lab</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                        <div>
                          <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>₹{lalpathOpt.price}</div>
                          <div style={{ fontSize: '0.7rem', color: '#94A3B8', textDecoration: 'line-through' }}>₹{lalpathOpt.mrp}</div>
                        </div>
                        <button
                          onClick={() => addToCart(item, lalpathOpt)}
                          style={{
                            padding: '0.35rem 0.75rem',
                            backgroundColor: isLalpathInCart ? '#059669' : '#D97706',
                            color: '#FFF',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '800',
                            fontSize: '0.78rem',
                            cursor: 'pointer'
                          }}
                        >
                          {isLalpathInCart ? '✓ Added' : '+ Add'}
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

    </div>
  );
}
