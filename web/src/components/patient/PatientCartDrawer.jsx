import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  FlaskConical, 
  AlertCircle,
  Plus,
  Check,
  Search,
  Sparkles,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { 
  getCartTotalsByLab, 
  getPreferredLab, 
  savePreferredLab, 
  getItemPriceForLab 
} from '../../data/catalogStore';

export default function PatientCartDrawer({
  isOpen,
  onClose,
  cart = [],
  removeFromCart,
  addToCart,
  onProceedToCheckout,
  catalog = {},
  selectedLabProvider = 'medmarg_suggested',
  setSelectedLabProvider = () => {}
}) {
  if (!isOpen) return null;

  const [inCartSearch, setInCartSearch] = useState('');
  const [rememberPreference, setRememberPreference] = useState(() => {
    return !!localStorage.getItem('medmarg_preferred_lab_choice');
  });

  // Calculate totals across all 3 lab options
  const labOptions = getCartTotalsByLab(cart);
  const activeLabOption = labOptions.find(l => l.id === selectedLabProvider) || labOptions[0];

  const cartTotal = activeLabOption.totalPrice || 0;
  const totalMrp = activeLabOption.totalMrp || Math.round(cartTotal * 1.6);
  const totalSavings = activeLabOption.totalSavings || 0;
  const hasFastingTest = cart.some(item => item.fasting === 'YES');

  const handleSelectLab = (labId) => {
    setSelectedLabProvider(labId);
    if (rememberPreference) {
      savePreferredLab(labId);
    }
  };

  const handleToggleRemember = (e) => {
    const checked = e.target.checked;
    setRememberPreference(checked);
    if (checked) {
      savePreferredLab(selectedLabProvider);
    } else {
      try {
        localStorage.removeItem('medmarg_preferred_lab_choice');
      } catch (err) {}
    }
  };

  // Quick Add-on Tests
  const quickAddOns = [
    { id: 'T001', code: 'VIT_D', name: 'Vitamin D3 (25-OH)', price: 499, mrp: 1200, fasting: 'NO', sampleType: 'SERUM' },
    { id: 'T002', code: 'VIT_B12', name: 'Vitamin B12 (Active)', price: 449, mrp: 1100, fasting: 'NO', sampleType: 'SERUM' },
    { id: 'T003', code: 'THYROID_T', name: 'Thyroid Profile Total (T3/T4/TSH)', price: 299, mrp: 650, fasting: 'YES', sampleType: 'SERUM' },
    { id: 'T004', code: 'HBA1C', name: 'HbA1c Glycated Hemoglobin', price: 299, mrp: 600, fasting: 'NO', sampleType: 'EDTA' },
    { id: 'T005', code: 'CBC', name: 'Complete Blood Count CBC (24 Params)', price: 249, mrp: 500, fasting: 'NO', sampleType: 'EDTA' }
  ];

  const searchResults = inCartSearch.trim()
    ? (catalog.tests || []).filter(t => t.name.toLowerCase().includes(inCartSearch.toLowerCase())).slice(0, 5)
    : [];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        backgroundColor: '#FFFFFF',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.2)',
        animation: 'slideInRight 0.25s ease-out'
      }}>
        {/* Cart Drawer Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#F8FAFC'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', backgroundColor: '#E0F2F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={20} color="#006B70" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                Your Diagnostic Cart ({cart.length})
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '800' }}>
                ✓ Free Home Phlebotomy Included
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '0.4rem', borderRadius: '8px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Fasting Notice */}
          {hasFastingTest && (
            <div style={{
              backgroundColor: '#FEF3C7',
              border: '1px solid #FDE68A',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              display: 'flex',
              gap: '0.6rem',
              alignItems: 'flex-start'
            }}>
              <AlertCircle size={18} color="#B45309" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.78rem', color: '#92400E', lineHeight: 1.4 }}>
                <strong>Fasting Required (10-12 Hours):</strong> One or more tests in your cart require overnight fasting. Avoid food/drinks (except water) before collection.
              </div>
            </div>
          )}

          {/* Cart Items List */}
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748B' }}>
              <FlaskConical size={48} color="#CBD5E1" style={{ margin: '0 auto 0.75rem' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1E293B' }}>Your Cart is Empty</h4>
              <p style={{ fontSize: '0.84rem', marginTop: '0.25rem' }}>Browse tests from the matrix or select from popular add-ons below.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#475569' }}>
                  Selected Items ({cart.length})
                </span>
                <span style={{ fontSize: '0.74rem', color: '#006B70', fontWeight: '700' }}>
                  Pricing via {activeLabOption.name}
                </span>
              </div>

              {cart.map((item, idx) => {
                const itemPricing = getItemPriceForLab(item, selectedLabProvider);
                const itemId = item.id || item.code || item.name;

                return (
                  <div
                    key={itemId + '_' + idx}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '14px',
                      border: '1.5px solid #E2E8F0',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, paddingRight: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                          <span style={{ 
                            fontSize: '0.68rem', 
                            backgroundColor: item.itemType === 'PACKAGE' ? '#FEF3C7' : '#E0F2FE',
                            color: item.itemType === 'PACKAGE' ? '#B45309' : '#0369A1',
                            padding: '0.15rem 0.45rem', 
                            borderRadius: '4px', 
                            fontWeight: '900' 
                          }}>
                            {item.itemType === 'PACKAGE' ? 'PACKAGE' : 'TEST'}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#64748B', fontFamily: 'monospace', fontWeight: '700' }}>
                            {item.code || item.id}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A', margin: 0, lineHeight: 1.3 }}>
                          {item.name || item.title}
                        </h4>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id || item.code)}
                        style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.3rem' }}
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: '#64748B' }}>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <span style={{ backgroundColor: '#F1F5F9', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '700' }}>
                          🩸 {item.sampleType || 'SERUM'}
                        </span>
                        {item.fasting === 'YES' && (
                          <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '800' }}>
                            ⏱ Fasting: YES
                          </span>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: '900', color: '#006B70' }}>₹{itemPricing.price}</span>
                        {itemPricing.mrp && itemPricing.mrp > itemPricing.price && (
                          <span style={{ fontSize: '0.76rem', color: '#94A3B8', textDecoration: 'line-through', marginLeft: '0.35rem' }}>
                            ₹{itemPricing.mrp}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MULTI-LAB PROCESSING SELECTOR DESK */}
          {cart.length > 0 && (
            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '16px',
              padding: '1.15rem',
              border: '1.5px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Building2 size={18} color="#006B70" />
                  <h4 style={{ fontSize: '0.94rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                    Choose Processing Diagnostic Lab
                  </h4>
                </div>
                <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
                  Select the NABL accredited laboratory for all items in this booking.
                </p>
              </div>

              {/* 3 Lab Comparison Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {labOptions.map((lab) => {
                  const isSelected = selectedLabProvider === lab.id;

                  return (
                    <div
                      key={lab.id}
                      onClick={() => handleSelectLab(lab.id)}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: '12px',
                        border: isSelected ? `2.5px solid ${lab.accentColor}` : '1.5px solid #CBD5E1',
                        backgroundColor: isSelected ? (lab.isMedmargSuggested ? '#F0FDF4' : '#FFFFFF') : '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: isSelected ? `5px solid ${lab.accentColor}` : '2px solid #CBD5E1',
                          backgroundColor: '#FFF'
                        }} />

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontSize: '1.05rem', fontWeight: '900', color: isSelected ? lab.accentColor : '#0F172A' }}>
                              {lab.name}
                            </span>
                            <span style={{ 
                              fontSize: '0.68rem', 
                              backgroundColor: lab.bgLight, 
                              color: lab.accentColor, 
                              padding: '0.1rem 0.4rem', 
                              borderRadius: '4px', 
                              fontWeight: '800' 
                            }}>
                              {lab.badge}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.15rem' }}>
                            {lab.subtitle} • {lab.tatText}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: '900', color: isSelected ? lab.accentColor : '#0F172A' }}>
                          ₹{lab.totalPrice}
                        </div>
                        {lab.totalMrp > lab.totalPrice && (
                          <div style={{ fontSize: '0.7rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                            ₹{lab.totalMrp}
                          </div>
                        )}
                        {lab.totalSavings > 0 && (
                          <div style={{ fontSize: '0.68rem', color: '#059669', fontWeight: '800' }}>
                            Save ₹{lab.totalSavings}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Remember Preference Checkbox */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.55rem 0.75rem',
                backgroundColor: '#FFFFFF',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                marginTop: '0.2rem'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.78rem', color: '#334155', fontWeight: '700' }}>
                  <input
                    type="checkbox"
                    checked={rememberPreference}
                    onChange={handleToggleRemember}
                    style={{ width: '16px', height: '16px', accentColor: '#006B70', cursor: 'pointer' }}
                  />
                  <span>Remember my laboratory choice for further orders</span>
                </label>
                {rememberPreference && (
                  <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <CheckCircle2 size={12} />
                    Saved
                  </span>
                )}
              </div>

            </div>
          )}

          {/* Quick In-Cart Search / Add More Tests */}
          <div style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', padding: '1rem', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.6rem' }}>
              <Sparkles size={15} color="#006B70" />
              <span>Add More Diagnostic Tests / Profiles</span>
            </div>

            <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
              <Search size={16} color="#64748B" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input
                type="text"
                placeholder="Search test name to add directly..."
                value={inCartSearch}
                onChange={(e) => setInCartSearch(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.2rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', outline: 'none' }}
              />
            </div>

            {/* In-Cart Search Dropdown Results */}
            {searchResults.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem' }}>
                {searchResults.map(res => (
                  <div key={res.id || res.code} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: '700', color: '#0F172A' }}>{res.name} (₹{res.price || 499})</div>
                    <button
                      onClick={() => {
                        addToCart(res);
                        setInCartSearch('');
                      }}
                      style={{ padding: '0.3rem 0.65rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Frequently Added Together Tiles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {quickAddOns.map(addon => {
                const isAlreadyIn = cart.some(c => (c.code || c.id) === addon.code || c.name === addon.name);
                return (
                  <div
                    key={addon.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.55rem 0.75rem',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F172A' }}>{addon.name}</div>
                      <div style={{ fontSize: '0.74rem', color: '#006B70', fontWeight: '700' }}>
                        Starts ₹{addon.price} <span style={{ textDecoration: 'line-through', color: '#94A3B8', fontSize: '0.7rem' }}>₹{addon.mrp}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (!isAlreadyIn) addToCart(addon);
                      }}
                      disabled={isAlreadyIn}
                      style={{
                        padding: '0.35rem 0.75rem',
                        backgroundColor: isAlreadyIn ? '#E2E8F0' : '#E0F2F1',
                        color: isAlreadyIn ? '#64748B' : '#006B70',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.76rem',
                        fontWeight: '800',
                        cursor: isAlreadyIn ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      {isAlreadyIn ? <Check size={13} /> : <Plus size={13} />}
                      <span>{isAlreadyIn ? 'Added' : 'Add'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Cart Drawer Footer */}
        {cart.length > 0 && (
          <div style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC'
          }}>
            {/* Bill Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                <span>Item Total (MRP)</span>
                <span style={{ textDecoration: 'line-through' }}>₹{totalMrp}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: '700' }}>
                <span>Multi-Lab Discount ({activeLabOption.name})</span>
                <span>- ₹{totalSavings}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: '700' }}>
                <span>Home Phlebotomy Fee</span>
                <span>FREE (₹0)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0F172A', fontWeight: '900', fontSize: '1.1rem', borderTop: '1px solid #E2E8F0', paddingTop: '0.55rem', marginTop: '0.2rem' }}>
                <div>
                  <div>To Pay</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '600' }}>
                    via {activeLabOption.name} ({activeLabOption.tatText})
                  </div>
                </div>
                <span style={{ color: activeLabOption.accentColor, fontSize: '1.25rem' }}>₹{cartTotal}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              style={{
                width: '100%',
                padding: '0.9rem',
                backgroundColor: activeLabOption.accentColor || '#006B70',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '900',
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(0,107,112,0.3)'
              }}
            >
              <span>Proceed to Booking ({activeLabOption.name})</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

