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
  Zap
} from 'lucide-react';
import { calculateAggregatedSamples, calculateFastingRequirement } from '../../data/catalogStore';

export default function CatalogManagementTab({ 
  catalog, 
  setCatalog, 
  saveCatalogState,
  triggerGoogleSheetsSync, 
  isSyncingSheets,
  syncLogs
}) {
  const [testsSubTab, setTestsSubTab] = useState('TESTS'); // 'TESTS' | 'PROFILES' | 'PACKAGES' | 'SYNC_HUB'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFasting, setFilterFasting] = useState('ALL');
  const [filterSample, setFilterSample] = useState('ALL');

  // Modals
  const [showCreateTestModal, setShowCreateTestModal] = useState(false);
  const [showCreateProfileModal, setShowCreateProfileModal] = useState(false);
  const [showPackageBuilderModal, setShowPackageBuilderModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Forms
  const [testForm, setTestForm] = useState({
    code: '',
    name: '',
    sampleType: 'SERUM',
    fasting: 'NO',
    mrp: 499,
    price: 299,
    tatHours: 24,
    description: ''
  });

  const [profileForm, setProfileForm] = useState({
    code: '',
    name: '',
    sampleType: 'SERUM',
    fasting: 'NO',
    mrp: 1499,
    price: 899,
    tatHours: 24,
    description: ''
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
    description: ''
  });
  const [builderSearch, setBuilderSearch] = useState('');

  // Handlers
  const handleSaveTest = async (e) => {
    e.preventDefault();
    const newTest = {
      id: editingItem ? editingItem.id : `TEST_${(catalog.tests?.length || 0) + 1}`,
      serialNo: editingItem ? editingItem.serialNo : (catalog.tests?.length || 0) + 1,
      code: testForm.code.trim().toUpperCase(),
      name: testForm.name.trim(),
      sampleType: testForm.sampleType.trim().toUpperCase(),
      fasting: testForm.fasting.trim().toUpperCase(),
      category: 'Individual Test',
      mrp: Number(testForm.mrp) || 499,
      price: Number(testForm.price) || 299,
      tatHours: Number(testForm.tatHours) || 24,
      description: testForm.description || `Clinical laboratory test for ${testForm.name}.`,
      active: true
    };

    let updatedTests = [...(catalog.tests || [])];
    if (editingItem) {
      updatedTests = updatedTests.map(t => t.id === editingItem.id ? newTest : t);
    } else {
      updatedTests.unshift(newTest);
    }

    const updatedCatalog = { ...catalog, tests: updatedTests };
    setCatalog(updatedCatalog);
    saveCatalogState(updatedCatalog);
    setShowCreateTestModal(false);
    setEditingItem(null);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const newProfile = {
      id: editingItem ? editingItem.id : `PROF_${(catalog.profiles?.length || 0) + 1}`,
      serialNo: editingItem ? editingItem.serialNo : (catalog.profiles?.length || 0) + 1,
      code: profileForm.code.trim().toUpperCase(),
      name: profileForm.name.trim(),
      sampleType: profileForm.sampleType.trim().toUpperCase(),
      fasting: profileForm.fasting.trim().toUpperCase(),
      category: 'Diagnostic Profile',
      mrp: Number(profileForm.mrp) || 1499,
      price: Number(profileForm.price) || 899,
      tatHours: Number(profileForm.tatHours) || 24,
      description: profileForm.description || `Diagnostic profile panel for ${profileForm.name}.`,
      active: true
    };

    let updatedProfiles = [...(catalog.profiles || [])];
    if (editingItem) {
      updatedProfiles = updatedProfiles.map(p => p.id === editingItem.id ? newProfile : p);
    } else {
      updatedProfiles.unshift(newProfile);
    }

    const updatedCatalog = { ...catalog, profiles: updatedProfiles };
    setCatalog(updatedCatalog);
    saveCatalogState(updatedCatalog);
    setShowCreateProfileModal(false);
    setEditingItem(null);
  };

  const handleSavePackage = (e) => {
    e.preventDefault();
    const sampleTypes = calculateAggregatedSamples(
      packageBuilderForm.selectedProfiles,
      packageBuilderForm.selectedTests,
      catalog.profiles,
      catalog.tests
    );

    const requiresFasting = calculateFastingRequirement(
      packageBuilderForm.selectedProfiles,
      packageBuilderForm.selectedTests,
      catalog.profiles,
      catalog.tests
    );

    const newPkg = {
      id: `PKG_${Date.now()}`,
      name: packageBuilderForm.name.trim(),
      code: (packageBuilderForm.code || `MM_PKG_${Date.now().toString().slice(-4)}`).toUpperCase(),
      tagline: packageBuilderForm.tagline,
      category: packageBuilderForm.category,
      mrp: Number(packageBuilderForm.mrp) || Number(packageBuilderForm.price) * 2,
      price: Number(packageBuilderForm.price),
      discountPercent: Math.round(((Number(packageBuilderForm.mrp) - Number(packageBuilderForm.price)) / Number(packageBuilderForm.mrp)) * 100) || 50,
      fasting: requiresFasting ? 'YES' : 'NO',
      fastingNote: requiresFasting ? '8-10 hours overnight fasting recommended' : 'No fasting required',
      sampleTypes,
      tatHours: Number(packageBuilderForm.tatHours) || 24,
      popular: true,
      profiles: packageBuilderForm.selectedProfiles,
      tests: packageBuilderForm.selectedTests,
      testCount: packageBuilderForm.selectedProfiles.length * 8 + packageBuilderForm.selectedTests.length,
      description: packageBuilderForm.description || `Custom package composed of ${packageBuilderForm.selectedProfiles.length} profiles and ${packageBuilderForm.selectedTests.length} tests.`
    };

    const updatedCatalog = {
      ...catalog,
      packages: [newPkg, ...(catalog.packages || [])]
    };
    setCatalog(updatedCatalog);
    saveCatalogState(updatedCatalog);
    setShowPackageBuilderModal(false);
  };

  const filteredTests = (catalog.tests || []).filter(t => {
    const q = searchTerm.toLowerCase();
    const matchQuery = !q || (t.name && t.name.toLowerCase().includes(q)) || (t.code && t.code.toLowerCase().includes(q));
    const matchFasting = filterFasting === 'ALL' || t.fasting === filterFasting;
    const matchSample = filterSample === 'ALL' || (t.sampleType && t.sampleType.includes(filterSample));
    return matchQuery && matchFasting && matchSample;
  });

  const filteredProfiles = (catalog.profiles || []).filter(p => {
    const q = searchTerm.toLowerCase();
    const matchQuery = !q || (p.name && p.name.toLowerCase().includes(q)) || (p.code && p.code.toLowerCase().includes(q));
    const matchFasting = filterFasting === 'ALL' || p.fasting === filterFasting;
    return matchQuery && matchFasting;
  });

  return (
    <div>
      {/* Subtabs Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.85rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { key: 'TESTS', label: 'Single Tests', icon: FlaskConical, count: catalog.tests?.length || 913 },
            { key: 'PROFILES', label: 'Diagnostic Profiles', icon: Layers, count: catalog.profiles?.length || 87 },
            { key: 'PACKAGES', label: 'Health Packages', icon: Package, count: catalog.packages?.length || 4 },
            { key: 'SYNC_HUB', label: 'Google Sheets Two-Way Sync', icon: FileSpreadsheet }
          ].map(st => {
            const isSel = testsSubTab === st.key;
            const IconC = st.icon;
            return (
              <button
                key={st.key}
                onClick={() => setTestsSubTab(st.key)}
                style={{
                  padding: '0.6rem 1.1rem',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: isSel ? '#006B70' : '#1E293B',
                  color: isSel ? '#FFF' : '#94A3B8',
                  fontWeight: '800',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <IconC size={16} color={isSel ? '#FBBF24' : '#94A3B8'} />
                {st.label} {st.count !== undefined ? `(${st.count})` : ''}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          {testsSubTab === 'TESTS' && (
            <button 
              onClick={() => { setEditingItem(null); setTestForm({ code: '', name: '', sampleType: 'SERUM', fasting: 'NO', mrp: 499, price: 299, tatHours: 24, description: '' }); setShowCreateTestModal(true); }}
              style={{ padding: '0.6rem 1.2rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <PlusCircle size={16} /> Add Test to Master
            </button>
          )}
          {testsSubTab === 'PROFILES' && (
            <button 
              onClick={() => { setEditingItem(null); setProfileForm({ code: '', name: '', sampleType: 'SERUM', fasting: 'NO', mrp: 1499, price: 899, tatHours: 24, description: '' }); setShowCreateProfileModal(true); }}
              style={{ padding: '0.6rem 1.2rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <PlusCircle size={16} /> Add Profile to Master
            </button>
          )}
          {testsSubTab === 'PACKAGES' && (
            <button 
              onClick={() => setShowPackageBuilderModal(true)}
              style={{ padding: '0.6rem 1.2rem', backgroundColor: '#F59E0B', color: '#0F172A', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={16} /> Visual Package Builder
            </button>
          )}
        </div>
      </div>

      {/* TESTS LIST */}
      {testsSubTab === 'TESTS' && (
        <div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
              <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                placeholder="Search 913 tests by name, test code, or sample type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.4rem', backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '10px', color: '#FFF', fontSize: '0.88rem', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ backgroundColor: '#1E293B', borderRadius: '18px', border: '1px solid #334155', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#0F172A', borderBottom: '1px solid #334155', color: '#94A3B8' }}>
                  <th style={{ padding: '1rem 1.25rem' }}>SERIAL / CODE</th>
                  <th style={{ padding: '1rem' }}>TEST NAME</th>
                  <th style={{ padding: '1rem' }}>SAMPLE TYPE</th>
                  <th style={{ padding: '1rem' }}>FASTING</th>
                  <th style={{ padding: '1rem' }}>PRICE (₹)</th>
                  <th style={{ padding: '1rem' }}>TAT</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredTests.slice(0, 50).map(test => (
                  <tr key={test.id || test.code} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', color: '#67E8F9', fontWeight: '700' }}>
                      #{test.serialNo || '-'} • {test.code}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '700', color: '#FFF' }}>
                      {test.name}
                    </td>
                    <td style={{ padding: '1rem', color: '#CBD5E1' }}>
                      <span style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        {test.sampleType || 'SERUM'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '800', backgroundColor: test.fasting === 'YES' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)', color: test.fasting === 'YES' ? '#FBBF24' : '#34D399' }}>
                        {test.fasting}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#FBBF24', fontWeight: '900' }}>₹{test.price}</td>
                    <td style={{ padding: '1rem', color: '#94A3B8' }}>{test.tatHours || 24}h</td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => { setEditingItem(test); setTestForm(test); setShowCreateTestModal(true); }}
                        style={{ background: 'none', border: 'none', color: '#38BDF8', cursor: 'pointer', marginRight: '0.6rem' }}
                      >
                        <Edit3 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PROFILES LIST */}
      {testsSubTab === 'PROFILES' && (
        <div>
          <div style={{ backgroundColor: '#1E293B', borderRadius: '18px', border: '1px solid #334155', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#0F172A', borderBottom: '1px solid #334155', color: '#94A3B8' }}>
                  <th style={{ padding: '1rem 1.25rem' }}>PROFILE CODE</th>
                  <th style={{ padding: '1rem' }}>PROFILE NAME</th>
                  <th style={{ padding: '1rem' }}>SAMPLE TYPE</th>
                  <th style={{ padding: '1rem' }}>FASTING</th>
                  <th style={{ padding: '1rem' }}>PRICE (₹)</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map(profile => (
                  <tr key={profile.id || profile.code} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', color: '#FBBF24', fontWeight: '800' }}>
                      {profile.code}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '700', color: '#FFF' }}>
                      {profile.name}
                    </td>
                    <td style={{ padding: '1rem', color: '#CBD5E1' }}>
                      <span style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        {profile.sampleType || 'SERUM'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '800', backgroundColor: profile.fasting === 'YES' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)', color: profile.fasting === 'YES' ? '#FBBF24' : '#34D399' }}>
                        {profile.fasting}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#67E8F9', fontWeight: '900' }}>₹{profile.price}</td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => { setEditingItem(profile); setProfileForm(profile); setShowCreateProfileModal(true); }}
                        style={{ background: 'none', border: 'none', color: '#38BDF8', cursor: 'pointer' }}
                      >
                        <Edit3 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* HEALTH PACKAGES */}
      {testsSubTab === 'PACKAGES' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {(catalog.packages || []).map(pkg => (
            <div key={pkg.id} style={{ backgroundColor: '#1E293B', borderRadius: '20px', border: '1.5px solid #334155', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.55rem', borderRadius: '4px', fontWeight: '800' }}>
                    {pkg.discountPercent}% OFF • {pkg.category}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontFamily: 'monospace' }}>
                    {pkg.code}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#FFF', marginTop: '0.5rem' }}>
                  {pkg.name}
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#94A3B8', marginTop: '0.3rem', lineHeight: 1.4 }}>
                  {pkg.tagline || pkg.description}
                </p>
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#FBBF24' }}>₹{pkg.price}</span>
                  <span style={{ fontSize: '0.8rem', color: '#64748B', textDecoration: 'line-through', marginLeft: '0.4rem' }}>₹{pkg.mrp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GOOGLE SHEETS SYNC HUB */}
      {testsSubTab === 'SYNC_HUB' && (
        <div style={{ backgroundColor: '#1E293B', borderRadius: '20px', border: '1.5px solid #006B70', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#FFF' }}>Google Sheets Live Sync Engine</h2>
          <p style={{ color: '#94A3B8', marginTop: '0.5rem' }}>Connected Sheet ID: 1W37T0qzCZDYoBYPIG5MsWZeBZrict_BfDUx9itGSZp0</p>
          <button onClick={triggerGoogleSheetsSync} style={{ marginTop: '1.5rem', padding: '0.85rem 1.75rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' }}>
            Trigger Manual Refresh & Sync
          </button>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT TEST */}
      {showCreateTestModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 120, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#1E293B', borderRadius: '22px', maxWidth: '520px', width: '100%', padding: '2rem', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#FFF' }}>
                {editingItem ? 'Edit Test' : 'Add New Clinical Test to Master'}
              </h3>
              <button onClick={() => setShowCreateTestModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSaveTest} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Test Code</label>
                  <input
                    type="text"
                    value={testForm.code}
                    onChange={(e) => setTestForm({ ...testForm, code: e.target.value })}
                    placeholder="e.g. VITDC"
                    required
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#67E8F9', fontWeight: '800', marginTop: '0.2rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Test Name</label>
                  <input
                    type="text"
                    value={testForm.name}
                    onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
                    placeholder="e.g. 25-OH VITAMIN D (TOTAL)"
                    required
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', fontWeight: '700', marginTop: '0.2rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Sample Type</label>
                  <input
                    type="text"
                    value={testForm.sampleType}
                    onChange={(e) => setTestForm({ ...testForm, sampleType: e.target.value })}
                    placeholder="SERUM / EDTA / URINE"
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', marginTop: '0.2rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Fasting Required?</label>
                  <select
                    value={testForm.fasting}
                    onChange={(e) => setTestForm({ ...testForm, fasting: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', marginTop: '0.2rem' }}
                  >
                    <option value="NO">NO</option>
                    <option value="YES">YES</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#FBBF24', fontWeight: '700' }}>MedMarg Price (₹)</label>
                  <input
                    type="number"
                    value={testForm.price}
                    onChange={(e) => setTestForm({ ...testForm, price: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #F59E0B', borderRadius: '8px', color: '#FBBF24', fontWeight: '800', marginTop: '0.2rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Standard MRP (₹)</label>
                  <input
                    type="number"
                    value={testForm.mrp}
                    onChange={(e) => setTestForm({ ...testForm, mrp: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#94A3B8', marginTop: '0.2rem' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{ marginTop: '0.75rem', padding: '0.85rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}
              >
                {editingItem ? 'Update Test' : 'Save Test & Sync to Google Sheets'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT PROFILE */}
      {showCreateProfileModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 120, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#1E293B', borderRadius: '22px', maxWidth: '520px', width: '100%', padding: '2rem', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#FFF' }}>
                {editingItem ? 'Edit Profile' : 'Add Diagnostic Profile to Master'}
              </h3>
              <button onClick={() => setShowCreateProfileModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Profile Code</label>
                  <input
                    type="text"
                    value={profileForm.code}
                    onChange={(e) => setProfileForm({ ...profileForm, code: e.target.value })}
                    placeholder="e.g. APCOM"
                    required
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FBBF24', fontWeight: '800', marginTop: '0.2rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Profile Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder="e.g. ALLERGY COMPREHENSIVE PROFILE"
                    required
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', fontWeight: '700', marginTop: '0.2rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Sample Type</label>
                  <input
                    type="text"
                    value={profileForm.sampleType}
                    onChange={(e) => setProfileForm({ ...profileForm, sampleType: e.target.value })}
                    placeholder="SERUM / EDTA"
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', marginTop: '0.2rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Fasting Required?</label>
                  <select
                    value={profileForm.fasting}
                    onChange={(e) => setProfileForm({ ...profileForm, fasting: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', marginTop: '0.2rem' }}
                  >
                    <option value="NO">NO</option>
                    <option value="YES">YES</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#FBBF24', fontWeight: '700' }}>MedMarg Price (₹)</label>
                  <input
                    type="number"
                    value={profileForm.price}
                    onChange={(e) => setProfileForm({ ...profileForm, price: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #F59E0B', borderRadius: '8px', color: '#FBBF24', fontWeight: '800', marginTop: '0.2rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Standard MRP (₹)</label>
                  <input
                    type="number"
                    value={profileForm.mrp}
                    onChange={(e) => setProfileForm({ ...profileForm, mrp: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#94A3B8', marginTop: '0.2rem' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{ marginTop: '0.75rem', padding: '0.85rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}
              >
                {editingItem ? 'Update Profile' : 'Save Profile & Sync to Google Sheets'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VISUAL PACKAGE BUILDER */}
      {showPackageBuilderModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 120, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#1E293B', borderRadius: '24px', maxWidth: '900px', width: '100%', padding: '2rem', border: '2px solid #F59E0B', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '900' }}>
                  ADMIN STUDIO
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#FFF', marginTop: '0.3rem' }}>
                  Visual Health Package Builder
                </h2>
              </div>
              <button onClick={() => setShowPackageBuilderModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.75rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '800', color: '#FBBF24', display: 'block', marginBottom: '0.4rem' }}>
                  1. Search & Select Components (Profiles & Tests):
                </label>
                <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                  <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                  <input
                    type="text"
                    placeholder="Search from 87 profiles & 913 tests..."
                    value={builderSearch}
                    onChange={(e) => setBuilderSearch(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ fontSize: '0.75rem', color: '#67E8F9', fontWeight: '800', marginBottom: '0.3rem' }}>
                  🔬 PROFILES / PANELS ({catalog.profiles?.length || 87})
                </div>
                <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem', paddingRight: '0.25rem' }}>
                  {(catalog.profiles || []).filter(p => !builderSearch || p.name.toLowerCase().includes(builderSearch.toLowerCase()) || p.code.toLowerCase().includes(builderSearch.toLowerCase())).slice(0, 30).map(p => {
                    const isSel = packageBuilderForm.selectedProfiles.includes(p.code);
                    return (
                      <div
                        key={p.code}
                        onClick={() => {
                          if (isSel) setPackageBuilderForm({ ...packageBuilderForm, selectedProfiles: packageBuilderForm.selectedProfiles.filter(c => c !== p.code) });
                          else setPackageBuilderForm({ ...packageBuilderForm, selectedProfiles: [...packageBuilderForm.selectedProfiles, p.code] });
                        }}
                        style={{ padding: '0.45rem 0.75rem', borderRadius: '6px', backgroundColor: isSel ? 'rgba(0,107,112,0.35)' : '#0F172A', border: isSel ? '1.5px solid #006B70' : '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        <span style={{ color: '#FFF' }}>{isSel ? '✓ ' : '+ '}{p.name} ({p.code})</span>
                        <span style={{ color: '#67E8F9', fontSize: '0.72rem' }}>{p.sampleType}</span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ fontSize: '0.75rem', color: '#FBBF24', fontWeight: '800', marginBottom: '0.3rem' }}>
                  🧪 INDIVIDUAL TESTS ({catalog.tests?.length || 913})
                </div>
                <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingRight: '0.25rem' }}>
                  {(catalog.tests || []).filter(t => !builderSearch || t.name.toLowerCase().includes(builderSearch.toLowerCase()) || t.code.toLowerCase().includes(builderSearch.toLowerCase())).slice(0, 40).map(t => {
                    const isSel = packageBuilderForm.selectedTests.includes(t.code);
                    return (
                      <div
                        key={t.code}
                        onClick={() => {
                          if (isSel) setPackageBuilderForm({ ...packageBuilderForm, selectedTests: packageBuilderForm.selectedTests.filter(c => c !== t.code) });
                          else setPackageBuilderForm({ ...packageBuilderForm, selectedTests: [...packageBuilderForm.selectedTests, t.code] });
                        }}
                        style={{ padding: '0.45rem 0.75rem', borderRadius: '6px', backgroundColor: isSel ? 'rgba(245,158,11,0.25)' : '#0F172A', border: isSel ? '1.5px solid #F59E0B' : '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        <span style={{ color: '#FFF' }}>{isSel ? '✓ ' : '+ '}{t.name} ({t.code})</span>
                        <span style={{ color: '#FBBF24', fontSize: '0.72rem' }}>{t.sampleType}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <form onSubmit={handleSavePackage} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Package Name</label>
                    <input
                      type="text"
                      value={packageBuilderForm.name}
                      onChange={(e) => setPackageBuilderForm({ ...packageBuilderForm, name: e.target.value })}
                      placeholder="e.g. Master Executive Health Shield"
                      required
                      style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', marginTop: '0.2rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#FBBF24', fontWeight: '800' }}>Package Price (₹)</label>
                      <input
                        type="number"
                        value={packageBuilderForm.price}
                        onChange={(e) => setPackageBuilderForm({ ...packageBuilderForm, price: e.target.value })}
                        required
                        style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1.5px solid #F59E0B', borderRadius: '8px', color: '#FBBF24', fontWeight: '800', marginTop: '0.2rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700' }}>Market MRP (₹)</label>
                      <input
                        type="number"
                        value={packageBuilderForm.mrp}
                        onChange={(e) => setPackageBuilderForm({ ...packageBuilderForm, mrp: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#94A3B8', marginTop: '0.2rem' }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    style={{ marginTop: '0.75rem', padding: '0.85rem', background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#0F172A', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '0.95rem', cursor: 'pointer' }}
                  >
                    Publish Package to Live Catalog
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
