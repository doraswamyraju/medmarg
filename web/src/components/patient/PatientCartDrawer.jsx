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
  Sparkles
} from 'lucide-react';

export default function PatientCartDrawer({
  isOpen,
  onClose,
  cart,
  removeFromCart,
  addToCart,
  onProceedToCheckout,
  catalog = {}
}) {
  if (!isOpen) return null;

  const [inCartSearch, setInCartSearch] = useState('');

  const cartTotal = cart.reduce((sum, item) => sum + (item.price || 0), 0);
  const totalMrp = cart.reduce((sum, item) => sum + (item.mrp || Math.round((item.price || 0) * 1.6)), 0);
  const totalSavings = totalMrp - cartTotal;
  const hasFastingTest = cart.some(item => item.fasting === 'YES');

  // Quick Add-on Tests
  const quickAddOns = [
    { id: 'T001', name: 'Vitamin D3 (25-OH)', price: 499, mrp: 1200, fasting: 'NO', sampleType: 'SERUM' },
    { id: 'T002', name: 'Vitamin B12 (Active)', price: 449, mrp: 1100, fasting: 'NO', sampleType: 'SERUM' },
    { id: 'T003', name: 'Thyroid Profile Total (T3/T4/TSH)', price: 299, mrp: 650, fasting: 'YES', sampleType: 'SERUM' },
    { id: 'T004', name: 'HbA1c Glycated Hemoglobin', price: 299, mrp: 600, fasting: 'NO', sampleType: 'EDTA' },
    { id: 'T005', name: 'Complete Blood Count CBC (24 Params)', price: 249, mrp: 500, fasting: 'NO', sampleType: 'EDTA' }
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
        maxWidth: '480px',
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
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#E0F2F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

        {/* Cart Items & Quick Add Section */}
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
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748B' }}>
              <FlaskConical size={44} color="#CBD5E1" style={{ margin: '0 auto 0.75rem' }} />
              <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1E293B' }}>Your Cart is Empty</h4>
              <p style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>Select from popular add-on tests below to start your booking.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#475569' }}>Selected Diagnostic Items ({cart.length})</div>
              {cart.map((item, idx) => (
                <div
                  key={(item.id || item.name) + '_' + idx}
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
                      <div style={{ fontSize: '0.72rem', color: '#006B70', fontWeight: '800' }}>
                        {item.lab || 'MedMarg Central Diagnostics'}
                      </div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A', marginTop: '0.15rem', lineHeight: 1.3 }}>
                        {item.name}
                      </h4>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
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
                      <span style={{ fontSize: '1.05rem', fontWeight: '900', color: '#006B70' }}>₹{item.price}</span>
                      {item.mrp && item.mrp > item.price && (
                        <span style={{ fontSize: '0.76rem', color: '#94A3B8', textDecoration: 'line-through', marginLeft: '0.35rem' }}>
                          ₹{item.mrp}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
                const isAlreadyIn = cart.some(c => c.id === addon.id || c.name === addon.name);
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
                        ₹{addon.price} <span style={{ textDecoration: 'line-through', color: '#94A3B8', fontSize: '0.7rem' }}>₹{addon.mrp}</span>
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
                <span>MedMarg Multi-Lab Discount</span>
                <span>- ₹{totalSavings}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: '700' }}>
                <span>Home Phlebotomy Fee</span>
                <span>FREE (₹0)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0F172A', fontWeight: '900', fontSize: '1.05rem', borderTop: '1px solid #E2E8F0', paddingTop: '0.5rem', marginTop: '0.2rem' }}>
                <span>To Pay</span>
                <span style={{ color: '#006B70' }}>₹{cartTotal}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              style={{
                width: '100%',
                padding: '0.85rem',
                backgroundColor: '#006B70',
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
              <span>Proceed to Booking</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
