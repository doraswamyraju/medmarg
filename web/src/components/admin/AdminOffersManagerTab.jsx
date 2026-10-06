import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Tag, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  RefreshCw, 
  Flame, 
  ShieldCheck, 
  Layers, 
  Percent,
  CheckCircle2,
  AlertCircle,
  Ticket,
  Tent,
  Calendar,
  Copy,
  Users
} from 'lucide-react';
import { API_BASE, safeFetch } from '../../data/apiConfig';
import { getStoredOffers, saveStoredOffers, INITIAL_OFFERS } from '../../data/offersStore';

const GRADIENT_PRESETS = [
  { label: 'Deep Emerald Teal', value: 'linear-gradient(135deg, #004D40 0%, #006B70 100%)', tagBg: '#FEF3C7', tagText: '#B45309' },
  { label: 'Royal Sapphire Blue', value: 'linear-gradient(135deg, #1E3A8A 0%, #0284C7 100%)', tagBg: '#E0F2FE', tagText: '#0369A1' },
  { label: 'Vivid Purple Royalty', value: 'linear-gradient(135deg, #581C87 0%, #9333EA 100%)', tagBg: '#F3E8FF', tagText: '#6B21A8' },
  { label: 'Forest Green Vitality', value: 'linear-gradient(135deg, #065F46 0%, #059669 100%)', tagBg: '#D1FAE5', tagText: '#047857' },
  { label: 'Sunset Crimson Ruby', value: 'linear-gradient(135deg, #881337 0%, #E11D48 100%)', tagBg: '#FFE4E6', tagText: '#BE123C' },
  { label: 'Midnight Obsidian Gold', value: 'linear-gradient(135deg, #0F172A 0%, #334155 100%)', tagBg: '#FEF08A', tagText: '#854D0E' }
];

export default function AdminOffersManagerTab({ catalog = {}, initialSubTab = 'CAROUSEL_BANNERS' }) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const [offers, setOffers] = useState(getStoredOffers());
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Form State for Carousel Offers
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formPrice, setFormPrice] = useState('₹999');
  const [formMrp, setFormMrp] = useState('₹2,499');
  const [formBadge, setFormBadge] = useState('SPECIAL');
  const [formPackageId, setFormPackageId] = useState('');
  const [formGradient, setFormGradient] = useState(GRADIENT_PRESETS[0].value);
  const [formTagBg, setFormTagBg] = useState(GRADIENT_PRESETS[0].tagBg);
  const [formTagText, setFormTagText] = useState(GRADIENT_PRESETS[0].tagText);
  const [formActive, setFormActive] = useState(true);

  // Coupons & Promo Codes State (Sub-Tab 2)
  const [coupons, setCoupons] = useState([
    { code: 'FIRST50', discount: 'Flat ₹150 OFF', minOrder: 500, expiry: '31 Dec 2026', usageCount: 84, active: true, desc: 'Welcome bonus for first-time diagnostic booking' },
    { code: 'HEALTH2026', discount: '20% OFF (Up to ₹500)', minOrder: 999, expiry: '15 Nov 2026', usageCount: 231, active: true, desc: 'Festival seasonal full-body health checkup promo' },
    { code: 'SENIORCITIZEN', discount: 'Flat ₹200 OFF', minOrder: 699, expiry: 'Ongoing', usageCount: 95, active: true, desc: 'Special concession on all elderly wellness profiles' },
    { code: 'DIABETES99', discount: 'Free HbA1c with any Profile', minOrder: 1200, expiry: '30 Oct 2026', usageCount: 42, active: true, desc: 'World Diabetes month community awareness voucher' }
  ]);

  // Campaigns & Health Camps State (Sub-Tab 3)
  const [campaigns, setCampaigns] = useState([
    {
      id: 'CAMP-01',
      title: 'Tirupati Police Department Wellness Drive',
      location: 'Alipiri Police Parade Ground, Tirupati',
      date: '12 Oct 2026 (07:00 AM - 12:00 PM)',
      packagesIncluded: 'Lipid Profile, HbA1c, Liver Function & ECG',
      enrolledCount: 140,
      status: 'SCHEDULED'
    },
    {
      id: 'CAMP-02',
      title: 'Amaravati IT Employees Preventative Screening',
      location: 'Tech Park Auditorium, Renigunta',
      date: '18 Oct 2026 (08:00 AM - 02:00 PM)',
      packagesIncluded: 'Executive 87 Biomarkers Master Checkup',
      enrolledCount: 210,
      status: 'SCHEDULED'
    }
  ]);

  const fetchOffers = async () => {
    try {
      const res = await safeFetch(`${API_BASE}/api/v1/offers`, {}, 3500);
      if (res && res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (data.success && Array.isArray(data.offers) && data.offers.length > 0) {
            setOffers(data.offers);
            saveStoredOffers(data.offers);
          }
        } catch (e) {}
      }
    } catch (err) {
      setOffers(getStoredOffers());
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingOfferId(null);
    setFormTitle('');
    setFormSubtitle('');
    setFormCode('SAVE' + Math.floor(10 + Math.random() * 80));
    setFormPrice('₹999');
    setFormMrp('₹2,499');
    setFormBadge('SPECIAL');
    setFormPackageId(catalog.packages?.[0]?.id || 'pkg_aarogyam_13');
    setFormGradient(GRADIENT_PRESETS[0].value);
    setFormTagBg(GRADIENT_PRESETS[0].tagBg);
    setFormTagText(GRADIENT_PRESETS[0].tagText);
    setFormActive(true);
    setShowModal(true);
  };

  const handleOpenEdit = (offer) => {
    setEditingOfferId(offer.id);
    setFormTitle(offer.title || '');
    setFormSubtitle(offer.subtitle || '');
    setFormCode(offer.code || '');
    setFormPrice(offer.price || '₹999');
    setFormMrp(offer.mrp || '₹2,499');
    setFormBadge(offer.badge || 'SPECIAL');
    setFormPackageId(offer.packageId || '');
    setFormGradient(offer.gradient || GRADIENT_PRESETS[0].value);
    setFormTagBg(offer.tagBg || GRADIENT_PRESETS[0].tagBg);
    setFormTagText(offer.tagText || GRADIENT_PRESETS[0].tagText);
    setFormActive(offer.active !== false);
    setShowModal(true);
  };

  const handleToggleActive = async (offerId) => {
    const updated = offers.map(o => o.id === offerId ? { ...o, active: !o.active } : o);
    setOffers(updated);
    saveStoredOffers(updated);

    try {
      await safeFetch(`${API_BASE}/api/v1/offers/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offers: updated })
      }, 3000);
      showToast('Offer visibility updated & synced live.');
    } catch (e) {
      showToast('Offer visibility updated locally.');
    }
  };

  const handleDeleteOffer = async (offerId) => {
    if (!window.confirm('Are you sure you want to delete this promotional banner?')) return;
    const updated = offers.filter(o => o.id !== offerId);
    setOffers(updated);
    saveStoredOffers(updated);

    try {
      await safeFetch(`${API_BASE}/api/v1/offers/${offerId}`, { method: 'DELETE' }, 3000);
      showToast('Offer deleted successfully.');
    } catch (e) {
      showToast('Offer removed from list.');
    }
  };

  const handleSaveOffer = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Please enter an offer title');
      return;
    }

    setSaving(true);
    const offerPayload = {
      id: editingOfferId || `offer_${Date.now()}`,
      title: formTitle.trim(),
      subtitle: formSubtitle.trim(),
      code: formCode.trim(),
      price: formPrice.trim(),
      mrp: formMrp.trim(),
      badge: formBadge.trim().toUpperCase(),
      packageId: formPackageId,
      gradient: formGradient,
      tagBg: formTagBg,
      tagText: formTagText,
      active: formActive
    };

    let updatedOffers;
    if (editingOfferId) {
      updatedOffers = offers.map(o => o.id === editingOfferId ? offerPayload : o);
    } else {
      updatedOffers = [offerPayload, ...offers];
    }

    setOffers(updatedOffers);
    saveStoredOffers(updatedOffers);
    setShowModal(false);

    try {
      await safeFetch(`${API_BASE}/api/v1/offers/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offers: updatedOffers })
      }, 3000);
      showToast(editingOfferId ? 'Offer modified & synced live!' : 'New offer created & published!');
    } catch (e) {
      showToast('Offer saved locally.');
    } finally {
      setSaving(false);
    }
  };

  const handleSeedDefaultOffers = async () => {
    setOffers(INITIAL_OFFERS);
    saveStoredOffers(INITIAL_OFFERS);
    try {
      await safeFetch(`${API_BASE}/api/v1/offers/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offers: INITIAL_OFFERS })
      }, 3000);
      showToast('Default promotional banners seeded successfully!');
    } catch (e) {
      showToast('Default offers restored.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#004D40',
          color: '#FFFFFF',
          padding: '0.85rem 1.25rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          zIndex: 9999,
          fontWeight: '800',
          fontSize: '0.9rem'
        }}>
          <CheckCircle2 size={18} color="#FBBF24" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', backgroundColor: '#FFFFFF', padding: '1.5rem 1.75rem', borderRadius: '20px', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 14px rgba(0,0,0,0.02)' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#E0F2F1', color: '#006B70', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: '900', marginBottom: '0.35rem' }}>
            <Sparkles size={13} /> MARKETING & PROMOTIONS ZONE
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>Offers Zone Control Center</h2>
          <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
            Configure real-time promotional carousel banners, discount coupons, and health camp campaigns.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {offers.length === 0 && (
            <button
              onClick={handleSeedDefaultOffers}
              style={{ padding: '0.65rem 1.1rem', borderRadius: '12px', border: '1px solid #006B70', backgroundColor: '#E0F2F1', color: '#006B70', fontWeight: '900', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Sparkles size={15} /> Seed Default Offers
            </button>
          )}
          <button
            onClick={fetchOffers}
            style={{ padding: '0.65rem 1rem', borderRadius: '12px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', color: '#334155', fontWeight: '800', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={15} /> Refresh
          </button>
          <button
            onClick={handleOpenAdd}
            style={{ padding: '0.65rem 1.25rem', borderRadius: '12px', border: 'none', backgroundColor: '#006B70', color: '#FFFFFF', fontWeight: '900', fontSize: '0.86rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(0,107,112,0.25)' }}
          >
            <Plus size={16} /> Create New Offer
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs Bar */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        backgroundColor: '#FFFFFF', 
        padding: '0.5rem', 
        borderRadius: '14px', 
        border: '1px solid #E2E8F0', 
        overflowX: 'auto',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        {[
          { key: 'CAROUSEL_BANNERS', label: '1. Carousel Promo Banners', icon: Sparkles, badge: `${offers.filter(o => o.active !== false).length} Active` },
          { key: 'COUPONS_PROMOS', label: '2. Promo Codes & Discounts', icon: Ticket, badge: `${coupons.length} Coupons` },
          { key: 'CAMPAIGNS', label: '3. Health Camps & Corporate Campaigns', icon: Tent, badge: `${campaigns.length} Camps` }
        ].map(tab => {
          const TabIcon = tab.icon;
          const isActive = activeSubTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.65rem 1.1rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: isActive ? '#006B70' : 'transparent',
                color: isActive ? '#FFFFFF' : '#64748B',
                fontWeight: isActive ? '800' : '600',
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <TabIcon size={16} color={isActive ? '#FBBF24' : '#64748B'} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span style={{ 
                  fontSize: '0.7rem', 
                  backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#F1F5F9', 
                  color: isActive ? '#FFF' : '#475569', 
                  padding: '0.1rem 0.45rem', 
                  borderRadius: '6px', 
                  fontWeight: '800' 
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: CAROUSEL PROMO BANNERS                                         */}
      {/* ========================================================================= */}
      {activeSubTab === 'CAROUSEL_BANNERS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Live Preview Bar */}
          <div style={{ backgroundColor: '#0F172A', color: '#FFFFFF', padding: '1.25rem 1.75rem', borderRadius: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ height: '10px', width: '10px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 10px #10B981' }} />
              <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>Care Seeker Live Carousel Feed</span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>({offers.filter(o => o.active !== false).length} Active cards broadcasting)</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#CBD5E1', backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.65rem', borderRadius: '6px' }}>
              Instant Sync • No App Reload Required
            </span>
          </div>

          {/* Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {offers.map((offer) => {
              const isActive = offer.active !== false;
              return (
                <div 
                  key={offer.id} 
                  style={{ 
                    backgroundColor: '#FFFFFF', 
                    borderRadius: '20px', 
                    border: isActive ? '2px solid #E2E8F0' : '2px dashed #CBD5E1', 
                    overflow: 'hidden', 
                    display: 'flex', 
                    flexDirection: 'column',
                    boxShadow: isActive ? '0 8px 24px rgba(0,0,0,0.04)' : 'none',
                    opacity: isActive ? 1 : 0.6,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Banner Card Visual Simulation */}
                  <div style={{
                    background: offer.gradient || GRADIENT_PRESETS[0].value,
                    color: '#FFFFFF',
                    padding: '1.4rem 1.4rem',
                    position: 'relative',
                    minHeight: '140px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{
                        backgroundColor: offer.tagBg || '#FEF3C7',
                        color: offer.tagText || '#B45309',
                        fontSize: '0.68rem',
                        fontWeight: '900',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        letterSpacing: '0.05em'
                      }}>
                        {offer.badge || 'PROMO'}
                      </span>

                      {offer.code && (
                        <span style={{
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          color: '#FFFFFF',
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          border: '1px solid rgba(255,255,255,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}>
                          <Tag size={10} /> {offer.code}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: '900', margin: '0 0 0.2rem 0', lineHeight: 1.25 }}>
                        {offer.title}
                      </h3>
                      <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.3 }}>
                        {offer.subtitle}
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '0.6rem' }}>
                      <div>
                        <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#FDE047' }}>{offer.price}</span>
                        {offer.mrp && (
                          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', textDecoration: 'line-through', marginLeft: '0.4rem' }}>
                            {offer.mrp}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        Book Now <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>

                  {/* Actions & Controls */}
                  <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleToggleActive(offer.id)}
                        style={{
                          padding: '0.4rem 0.75rem',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          backgroundColor: isActive ? '#ECFDF5' : '#FEF2F2',
                          color: isActive ? '#059669' : '#DC2626',
                          fontWeight: '800',
                          fontSize: '0.76rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        {isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                        {isActive ? 'Active' : 'Hidden'}
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleOpenEdit(offer)}
                        style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#006B70', fontWeight: '800', fontSize: '0.76rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <Edit3 size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteOffer(offer.id)}
                        style={{ padding: '0.4rem 0.6rem', borderRadius: '8px', border: '1px solid #FCA5A5', backgroundColor: '#FEF2F2', color: '#DC2626', fontWeight: '800', fontSize: '0.76rem', cursor: 'pointer' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: PROMO CODES & COUPONS                                         */}
      {/* ========================================================================= */}
      {activeSubTab === 'COUPONS_PROMOS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Ticket size={18} color="#006B70" /> Diagnostic Discount Vouchers & Coupons
                </h3>
                <p style={{ color: '#64748B', fontSize: '0.82rem', margin: '0.2rem 0 0 0' }}>
                  Active discount codes redeemable by Care Seekers during checkout in Cart.
                </p>
              </div>

              <button
                onClick={() => {
                  const newCode = prompt('Enter New Coupon Code (e.g. SPECIAL30):');
                  if (newCode) {
                    setCoupons(prev => [
                      {
                        code: newCode.toUpperCase(),
                        discount: 'Flat ₹100 OFF',
                        minOrder: 499,
                        expiry: '31 Dec 2026',
                        usageCount: 0,
                        active: true,
                        desc: 'Special promotional discount voucher'
                      },
                      ...prev
                    ]);
                    showToast(`Coupon ${newCode.toUpperCase()} created successfully!`);
                  }
                }}
                style={{ padding: '0.55rem 1.1rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Plus size={15} /> Add Promo Code
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {coupons.map((coupon, idx) => (
                <div key={idx} style={{ backgroundColor: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: '900', color: '#006B70', fontFamily: 'monospace', backgroundColor: '#E0F2F1', padding: '0.2rem 0.6rem', borderRadius: '6px', letterSpacing: '0.05em' }}>
                        {coupon.code}
                      </span>
                      <span style={{ fontSize: '0.72rem', backgroundColor: '#DCFCE7', color: '#15803D', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '800' }}>
                        ACTIVE
                      </span>
                    </div>

                    <div style={{ fontSize: '1rem', fontWeight: '900', color: '#0F172A', marginTop: '0.6rem' }}>
                      {coupon.discount}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>
                      {coupon.desc}
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#475569' }}>
                    <span>Min Order: <strong>₹{coupon.minOrder}</strong></span>
                    <span>Used: <strong style={{ color: '#006B70' }}>{coupon.usageCount} times</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: HEALTH CAMPS & CORPORATE CAMPAIGNS                              */}
      {/* ========================================================================= */}
      {activeSubTab === 'CAMPAIGNS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Tent size={18} color="#006B70" /> Community Health Camps & Corporate Drives
                </h3>
                <p style={{ color: '#64748B', fontSize: '0.82rem', margin: '0.2rem 0 0 0' }}>
                  Organize mass phlebotomy testing camps for organizations, apartments, and public institutions.
                </p>
              </div>

              <button
                onClick={() => alert('Camp Creation Wizard: Allows bulk slot allocation and phlebotomist fleet assignment.')}
                style={{ padding: '0.55rem 1.1rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Plus size={15} /> Schedule Health Camp
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {campaigns.map(camp => (
                <div key={camp.id} style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', backgroundColor: '#E0F2FE', color: '#0369A1', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>
                      {camp.status}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#006B70', fontWeight: '800' }}>
                      {camp.enrolledCount} Pre-Registered
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A', marginTop: '0.6rem', marginBottom: '0.25rem' }}>
                    {camp.title}
                  </h4>
                  <div style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    📍 {camp.location}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Calendar size={13} color="#006B70" /> {camp.date}
                  </div>

                  <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.8rem', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.78rem', color: '#334155' }}>
                    <strong>Packages:</strong> {camp.packagesIncluded}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL FOR CAROUSEL OFFERS */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '620px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                  {editingOfferId ? 'Edit Promotional Banner' : 'Create New Promotional Banner'}
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0.15rem 0 0 0' }}>
                  Live banner displayed on Care Seeker home page
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#94A3B8', cursor: 'pointer', padding: '0.2rem' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveOffer} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              
              {/* Title & Subtitle */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#334155', marginBottom: '0.3rem' }}>Offer Title (Catchy Headline) *</label>
                <input 
                  type="text" 
                  value={formTitle} 
                  onChange={(e) => setFormTitle(e.target.value)} 
                  placeholder="e.g. Aarogyam Full Body Profile (87 Tests)"
                  required
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#334155', marginBottom: '0.3rem' }}>Subtitle / Description</label>
                <input 
                  type="text" 
                  value={formSubtitle} 
                  onChange={(e) => setFormSubtitle(e.target.value)} 
                  placeholder="e.g. Includes Vitamin D3, B12, Liver & Kidney Function"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>

              {/* Pricing & Promo Code */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#334155', marginBottom: '0.3rem' }}>Offer Price *</label>
                  <input 
                    type="text" 
                    value={formPrice} 
                    onChange={(e) => setFormPrice(e.target.value)} 
                    placeholder="e.g. ₹999"
                    required
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#334155', marginBottom: '0.3rem' }}>Original MRP</label>
                  <input 
                    type="text" 
                    value={formMrp} 
                    onChange={(e) => setFormMrp(e.target.value)} 
                    placeholder="e.g. ₹2,499"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#334155', marginBottom: '0.3rem' }}>Promo Code</label>
                  <input 
                    type="text" 
                    value={formCode} 
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())} 
                    placeholder="e.g. SAVE50"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem', fontWeight: '800' }}
                  />
                </div>
              </div>

              {/* Badge & Linked Test Package */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#334155', marginBottom: '0.3rem' }}>Badge Tag</label>
                  <input 
                    type="text" 
                    value={formBadge} 
                    onChange={(e) => setFormBadge(e.target.value)} 
                    placeholder="e.g. 60% OFF / SPECIAL"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#334155', marginBottom: '0.3rem' }}>Linked Diagnostic Package</label>
                  <select
                    value={formPackageId}
                    onChange={(e) => setFormPackageId(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem' }}
                  >
                    <option value="">Select Package to Open on Click</option>
                    {(catalog.packages || []).map(p => (
                      <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Gradient Style Presets */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#334155', marginBottom: '0.4rem' }}>Color Theme Gradient</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {GRADIENT_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setFormGradient(preset.value);
                        setFormTagBg(preset.tagBg);
                        setFormTagText(preset.tagText);
                      }}
                      style={{
                        background: preset.value,
                        color: '#FFFFFF',
                        padding: '0.55rem',
                        borderRadius: '10px',
                        border: formGradient === preset.value ? '2.5px solid #FBBF24' : '1px solid transparent',
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        textAlign: 'center',
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Switch */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.25rem' }}>
                <input 
                  type="checkbox" 
                  id="formActive" 
                  checked={formActive} 
                  onChange={(e) => setFormActive(e.target.checked)} 
                  style={{ width: '18px', height: '18px', accentColor: '#006B70' }}
                />
                <label htmlFor="formActive" style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A', cursor: 'pointer' }}>
                  Active & Display on Care Seeker Carousel
                </label>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', color: '#475569', fontWeight: '800', fontSize: '0.84rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: '0.65rem 1.5rem', borderRadius: '10px', border: 'none', backgroundColor: '#006B70', color: '#FFFFFF', fontWeight: '900', fontSize: '0.86rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,107,112,0.25)' }}
                >
                  {saving ? 'Saving...' : editingOfferId ? 'Update Banner' : 'Publish Offer'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
