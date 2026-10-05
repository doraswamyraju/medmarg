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
  AlertCircle
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

export default function AdminOffersManagerTab({ catalog = {} }) {
  const [offers, setOffers] = useState(getStoredOffers());
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Form State
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
    setFormPrice(offer.price || '');
    setFormMrp(offer.mrp || '');
    setFormBadge(offer.badge || 'SPECIAL');
    setFormPackageId(offer.packageId || (catalog.packages?.[0]?.id || ''));
    setFormGradient(offer.gradient || GRADIENT_PRESETS[0].value);
    setFormTagBg(offer.tagColor || GRADIENT_PRESETS[0].tagBg);
    setFormTagText(offer.tagText || GRADIENT_PRESETS[0].tagText);
    setFormActive(offer.active !== false);
    setShowModal(true);
  };

  const handleSaveOffer = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formCode.trim()) {
      alert('Please provide Offer Title and Coupon Code.');
      return;
    }

    setSaving(true);
    const offerData = {
      title: formTitle,
      subtitle: formSubtitle,
      code: formCode.toUpperCase(),
      price: formPrice,
      mrp: formMrp,
      badge: formBadge,
      packageId: formPackageId,
      gradient: formGradient,
      tagColor: formTagBg,
      tagText: formTagText,
      active: formActive
    };

    let updatedList;
    if (editingOfferId) {
      const updatedOffer = { id: editingOfferId, ...offerData };
      updatedList = offers.map(o => o.id === editingOfferId ? updatedOffer : o);
      setOffers(updatedList);
      saveStoredOffers(updatedList);
      showToast('Offer banner updated successfully.');
      setShowModal(false);
      safeFetch(`${API_BASE}/api/v1/offers/${editingOfferId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerData)
      }, 3000).catch(() => {});
    } else {
      const newOffer = { id: `off_${Date.now()}`, ...offerData, createdAt: new Date().toISOString() };
      updatedList = [newOffer, ...offers];
      setOffers(updatedList);
      saveStoredOffers(updatedList);
      showToast('New promotion banner published to Care Seeker carousel.');
      setShowModal(false);
      safeFetch(`${API_BASE}/api/v1/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerData)
      }, 3000).catch(() => {});
    }
    setSaving(false);
  };

  const handleToggleActive = async (offer) => {
    const updated = !offer.active;
    const updatedList = offers.map(o => o.id === offer.id ? { ...o, active: updated } : o);
    setOffers(updatedList);
    saveStoredOffers(updatedList);
    showToast(updated ? 'Offer activated and visible to Care Seekers.' : 'Offer paused.');
    safeFetch(`${API_BASE}/api/v1/offers/${offer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: updated })
    }, 3000).catch(() => {});
  };

  const handleDeleteOffer = async (id) => {
    if (!confirm('Are you sure you want to delete this offer banner?')) return;
    const updatedList = offers.filter(o => o.id !== id);
    setOffers(updatedList);
    saveStoredOffers(updatedList);
    showToast('Offer removed.');
    safeFetch(`${API_BASE}/api/v1/offers/${id}`, { method: 'DELETE' }, 3000).catch(() => {});
  };

  const handleSeedDefaultOffers = async () => {
    setOffers(INITIAL_OFFERS);
    saveStoredOffers(INITIAL_OFFERS);
    showToast('Default starter offers generated successfully.');

    for (const off of INITIAL_OFFERS) {
      safeFetch(`${API_BASE}/api/v1/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(off)
      }, 3000).catch(() => {});
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
            <Sparkles size={13} /> MARKETING & PROMOTIONS ENGINE
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>Horizontal Offers Carousel Manager</h2>
          <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
            Create and control real-time promotional banner cards shown exclusively on the Care Seeker dashboard home carousel.
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

      {/* Offers List or Empty State */}
      {offers.length === 0 ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '3.5rem 2rem',
          textAlign: 'center',
          border: '1.5px dashed #CBD5E1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem'
        }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#E0F2F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={32} color="#006B70" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>No Offers Found in Database</h3>
            <p style={{ fontSize: '0.86rem', color: '#64748B', maxWidth: '480px', margin: '0.4rem auto 0 auto', lineHeight: 1.45 }}>
              Populate instant pre-built high-converting offer banners, or craft a new promotional banner from scratch.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.85rem' }}>
            <button
              onClick={handleSeedDefaultOffers}
              style={{ padding: '0.75rem 1.35rem', backgroundColor: '#006B70', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 14px rgba(0,107,112,0.25)' }}
            >
              <Sparkles size={16} /> Generate Starter Offers
            </button>
            <button
              onClick={handleOpenAdd}
              style={{ padding: '0.75rem 1.35rem', backgroundColor: '#F8FAFC', color: '#334155', border: '1px solid #CBD5E1', borderRadius: '12px', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={16} /> Create Custom Offer
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {offers.map((offer) => {
          const isActive = offer.active !== false;
          return (
            <div 
              key={offer.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                border: '1.5px solid #E2E8F0',
                padding: '1.25rem',
                boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                opacity: isActive ? 1 : 0.65
              }}
            >
              {/* Card Banner Preview */}
              <div style={{
                background: offer.gradient || 'linear-gradient(135deg, #004D40 0%, #006B70 100%)',
                borderRadius: '16px',
                padding: '1.25rem',
                color: '#FFFFFF',
                boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '160px'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.68rem', backgroundColor: offer.tagColor || '#FEF3C7', color: offer.tagText || '#B45309', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '900' }}>
                      {offer.badge || 'PROMO'}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#FEF3C7', fontFamily: 'monospace', fontWeight: '900' }}>
                      CODE: {offer.code}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '900', margin: '0.2rem 0', lineHeight: 1.3 }}>
                    {offer.title}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)', margin: '0.2rem 0 0 0', lineHeight: 1.35 }}>
                    {offer.subtitle}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '0.6rem', marginTop: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#FBBF24' }}>{offer.price}</span>
                    <span style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.7)', textDecoration: 'line-through', marginLeft: '0.4rem' }}>{offer.mrp}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <span>Live Preview</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              </div>

              {/* Management Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleToggleActive(offer)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: isActive ? '#E0F2FE' : '#F1F5F9',
                      color: isActive ? '#0369A1' : '#64748B',
                      fontWeight: '800',
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    {isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                    <span>{isActive ? 'Live on Home' : 'Paused / Hidden'}</span>
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    onClick={() => handleOpenEdit(offer)}
                    style={{ padding: '0.4rem 0.7rem', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.76rem', fontWeight: '800', color: '#334155' }}
                  >
                    <Edit3 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteOffer(offer.id)}
                    style={{ padding: '0.4rem 0.6rem', backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#DC2626' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* CREATE / EDIT OFFER MODAL */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.5rem'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                  {editingOfferId ? 'Edit Promotion Offer Banner' : 'Create New Carousel Offer Banner'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
                  Targeted promotional campaign displayed to Care Seekers on the home tab.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#64748B', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOffer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Title & Badge */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>Offer Title (with Emoji)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ⚡ 60-Minute Express Home Phlebotomy"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>Badge Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TOP CHOICE"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>Subtitle / Highlight Benefit</label>
                <input
                  type="text"
                  placeholder="e.g. Flat 60% OFF on Aarogyam Full Body Checkup (104 Biomarkers)"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              {/* Code, Price, MRP */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>Promo Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EXPRESS60"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', outline: 'none', fontFamily: 'monospace', textTransform: 'uppercase' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>Offer Price Display</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹1,499"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>MRP / Original Price</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹3,500"
                    value={formMrp}
                    onChange={(e) => setFormMrp(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Linked Diagnostic Package */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>Link to Diagnostic Package / Test</label>
                <select
                  value={formPackageId}
                  onChange={(e) => setFormPackageId(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', outline: 'none', backgroundColor: '#FFF' }}
                >
                  {(catalog.packages || []).map(p => (
                    <option key={p.id} value={p.id}>📦 {p.name} (₹{p.price})</option>
                  ))}
                  {(catalog.profiles || []).map(pr => (
                    <option key={pr.code || pr.id} value={pr.code || pr.id}>📋 {pr.name || pr.title} (₹{pr.price})</option>
                  ))}
                </select>
              </div>

              {/* Gradient Preset Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#475569', marginBottom: '0.45rem' }}>Visual Theme & Gradient</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                  {GRADIENT_PRESETS.map((preset, idx) => {
                    const isSel = formGradient === preset.value;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setFormGradient(preset.value);
                          setFormTagBg(preset.tagBg);
                          setFormTagText(preset.tagText);
                        }}
                        style={{
                          background: preset.value,
                          borderRadius: '10px',
                          padding: '0.6rem 0.8rem',
                          color: '#FFF',
                          fontSize: '0.74rem',
                          fontWeight: '800',
                          cursor: 'pointer',
                          border: isSel ? '3px solid #FBBF24' : '2px solid transparent',
                          boxShadow: isSel ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span>{preset.label}</span>
                        {isSel && <Check size={14} color="#FBBF24" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Published Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="offerActiveCheck"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#006B70' }}
                />
                <label htmlFor="offerActiveCheck" style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0F172A', cursor: 'pointer' }}>
                  Publish immediately to live Care Seeker carousel
                </label>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '0.75rem 1.25rem', borderRadius: '10px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', color: '#475569', fontWeight: '800', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', border: 'none', backgroundColor: '#006B70', color: '#FFF', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,107,112,0.25)' }}
                >
                  {saving ? 'Saving...' : editingOfferId ? 'Update Offer Banner' : 'Publish Offer Banner'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
