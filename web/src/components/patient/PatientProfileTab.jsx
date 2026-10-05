import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  MapPin, 
  Shield, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  QrCode, 
  HeartHandshake, 
  Edit3, 
  Save, 
  Sparkles,
  AlertCircle,
  Activity,
  HeartPulse,
  Camera,
  FolderHeart
} from 'lucide-react';

export default function PatientProfileTab({
  user,
  onLogout,
  onOpenAddressModal = () => {},
  savedAddresses = [],
  onSetActiveFamilyMember = () => {}
}) {
  const [profileName, setProfileName] = useState(user?.name || 'Rahul Sharma');
  const [phone, setPhone] = useState(user?.phone || user?.identifier || '+91 98765 43210');
  const [email, setEmail] = useState(user?.email || 'rahul.sharma@medmarg.in');
  const [bloodGroup, setBloodGroup] = useState('O+ (Positive)');
  const [preferredLanguage, setPreferredLanguage] = useState('Telugu & English');
  const [needleSensitivity, setNeedleSensitivity] = useState('Normal (Standard Butterfly Needle)');
  const [avatarUrl, setAvatarUrl] = useState(user?.picture || user?.avatar || user?.photoURL || '');

  // ABHA Digital ID
  const abhaNumber = '91-4829-1029-4820';
  const abhaAddress = 'rahulsharma@abdm';

  // Family Members with Health Profiles & Chronic Conditions
  const [familyMembers, setFamilyMembers] = useState([
    { id: 'f1', name: 'Sunita Sharma', relation: 'Spouse', age: 31, gender: 'Female', bloodGroup: 'B+', chronicConditions: ['Thyroid (Hypothyroidism)'], abhaId: '91-3829-1920-1120' },
    { id: 'f2', name: 'Aarav Sharma', relation: 'Son', age: 6, gender: 'Male', bloodGroup: 'O+', chronicConditions: ['None / Pediatric'], abhaId: '91-8839-4410-9921' },
    { id: 'f3', name: 'K. Somasekhar Sharma', relation: 'Father', age: 64, gender: 'Male', bloodGroup: 'O+', chronicConditions: ['Type-2 Diabetes', 'Hypertension'], abhaId: '91-1192-3349-8812' }
  ]);

  const [showAddFamily, setShowAddFamily] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newFamilyRelation, setNewFamilyRelation] = useState('Spouse');
  const [newFamilyAge, setNewFamilyAge] = useState('');
  const [newFamilyGender, setNewFamilyGender] = useState('Female');
  const [newFamilyCondition, setNewFamilyCondition] = useState('None');
  const [newFamilyBlood, setNewFamilyBlood] = useState('O+');

  const handleAddFamilyMember = (e) => {
    e.preventDefault();
    if (!newFamilyName.trim()) return;
    setFamilyMembers([
      ...familyMembers,
      {
        id: 'f_' + Date.now(),
        name: newFamilyName,
        relation: newFamilyRelation,
        age: parseInt(newFamilyAge) || 25,
        gender: newFamilyGender,
        bloodGroup: newFamilyBlood,
        chronicConditions: newFamilyCondition.split(',').map(s => s.trim()),
        abhaId: `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`
      }
    ]);
    setNewFamilyName('');
    setNewFamilyAge('');
    setShowAddFamily(false);
  };

  const handleRemoveFamilyMember = (id) => {
    setFamilyMembers(familyMembers.filter(f => f.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', width: '100%' }}>
      
      {/* 1. CARE SEEKER PROFILE & AVATAR CARD (FULL WIDTH) */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '2rem', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            
            {/* User Avatar */}
            <div style={{ position: 'relative' }}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={profileName}
                  style={{ width: '74px', height: '74px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #004D40', boxShadow: '0 4px 12px rgba(0,77,64,0.2)' }}
                />
              ) : (
                <div style={{ width: '74px', height: '74px', borderRadius: '50%', backgroundColor: '#004D40', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: '900', boxShadow: '0 4px 12px rgba(0,77,64,0.25)' }}>
                  {profileName ? profileName[0].toUpperCase() : 'C'}
                </div>
              )}
              <label style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#006B70', color: '#FFF', borderRadius: '50%', padding: '5px', cursor: 'pointer', border: '2px solid #FFF', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                <Camera size={13} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setAvatarUrl(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <div>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#E0F2F1', color: '#006B70', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: '800' }}>
                  VERIFIED CARE SEEKER
                </span>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: '800' }}>
                  ABDM • COMING SOON
                </span>
              </div>
              <h2 style={{ fontSize: '1.55rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>{profileName}</h2>
              <div style={{ fontSize: '0.85rem', color: '#64748B' }}>📞 {phone} • {email}</div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Primary Healthcare City</div>
            <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#006B70' }}>📍 Tirupati, AP</div>
          </div>
        </div>

        {/* Quick Vitals & Health Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div style={{ backgroundColor: '#F8FAFC', padding: '0.9rem 1.15rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '800' }}>BLOOD GROUP</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A', marginTop: '0.2rem' }}>{bloodGroup}</div>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', padding: '0.9rem 1.15rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '800' }}>PREFERRED LANGUAGE</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A', marginTop: '0.2rem' }}>{preferredLanguage}</div>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', padding: '0.9rem 1.15rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '800' }}>NEEDLE SENSITIVITY</div>
            <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#006B70', marginTop: '0.2rem' }}>Butterfly Needle</div>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE 2-COLUMN BALANCED GRID (ABDM CARD + SAVED ADDRESSES) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>
        
        {/* ABDM / ABHA DIGITAL HEALTH CARD - COMING SOON */}
        <div style={{
          backgroundColor: '#004D40',
          borderRadius: '24px',
          padding: '1.75rem 2rem',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '1.25rem',
          boxShadow: '0 12px 30px rgba(0,77,64,0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: '900', marginBottom: '0.6rem' }}>
              <Shield size={14} /> AYUSHMAN BHARAT DIGITAL MISSION (ABDM)
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '900', margin: 0 }}>Digital ABHA Health ID & Records Sync</h3>
            <p style={{ fontSize: '0.84rem', color: '#80CBC4', marginTop: '0.4rem', lineHeight: 1.5 }}>
              MedMarg is undergoing National Health Authority (NHA / ABDM) sandbox certification. Live 14-digit ABHA creation, linking existing ABHA cards, and nationwide paperless report sync will be available soon.
            </p>
          </div>

          <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={20} color="#004D40" />
              </div>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#FFFFFF' }}>ABDM Official Integration</div>
                <div style={{ fontSize: '0.72rem', color: '#80CBC4' }}>Status: Sandbox Testing in Progress</div>
              </div>
            </div>

            <button
              onClick={() => alert('Thank you! You will be notified via WhatsApp & SMS as soon as ABHA integration goes live on MedMarg.')}
              style={{
                backgroundColor: '#FBBF24',
                color: '#004D40',
                border: 'none',
                padding: '0.5rem 0.95rem',
                borderRadius: '10px',
                fontWeight: '900',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              🔔 Notify on Launch
            </button>
          </div>
        </div>

        {/* SAVED COLLECTION ADDRESSES */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '1.75rem 2rem', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>Saved Pickup Addresses</h3>
                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.15rem 0 0 0' }}>Express home sample pickup points in Tirupati.</p>
              </div>
              <button
                onClick={onOpenAddressModal}
                style={{ padding: '0.45rem 0.9rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Plus size={15} /> Add Address
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {(savedAddresses.length > 0 ? savedAddresses : [
                { id: 'a1', label: 'Home', address: 'Plot 42, Air Bypass Road, Tirupati, AP - 517501', isDefault: true },
                { id: 'a2', label: 'Parents', address: 'Door 12-4/A, Gandhi Road, Tirupati, AP - 517502', isDefault: false }
              ]).map((addr) => (
                <div key={addr.id} style={{ backgroundColor: '#F8FAFC', borderRadius: '14px', padding: '0.85rem 1rem', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <MapPin size={17} color="#006B70" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A' }}>{addr.label}</span>
                        {addr.isDefault && (
                          <span style={{ fontSize: '0.68rem', backgroundColor: '#D1FAE5', color: '#047857', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '800' }}>
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.1rem' }}>{addr.address}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* 3. FAMILY MEMBERS HEALTH MANAGEMENT (FULL WIDTH) */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '2rem', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.85rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>Family Members Health Profiles ({familyMembers.length})</h3>
            <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>Track longitudinal health records and book tests for dependents.</p>
          </div>
          <button
            onClick={() => setShowAddFamily(!showAddFamily)}
            style={{ padding: '0.55rem 1rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} /> Add Family Member
          </button>
        </div>

        {/* Add Family Member Form */}
        {showAddFamily && (
          <form onSubmit={handleAddFamilyMember} style={{ backgroundColor: '#F8FAFC', padding: '1.25rem', borderRadius: '16px', border: '1px solid #CBD5E1', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.92rem' }}>Add Family Member Health Profile</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.6rem' }}>
              <input
                type="text"
                placeholder="Full Name *"
                value={newFamilyName}
                onChange={(e) => setNewFamilyName(e.target.value)}
                required
                style={{ padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
              />
              <select
                value={newFamilyRelation}
                onChange={(e) => setNewFamilyRelation(e.target.value)}
                style={{ padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
              >
                <option value="Spouse">Spouse</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="number"
                placeholder="Age"
                value={newFamilyAge}
                onChange={(e) => setNewFamilyAge(e.target.value)}
                required
                style={{ padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
              />
              <select
                value={newFamilyGender}
                onChange={(e) => setNewFamilyGender(e.target.value)}
                style={{ padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="text"
                placeholder="Chronic Conditions (e.g. Diabetic, Thyroid)"
                value={newFamilyCondition}
                onChange={(e) => setNewFamilyCondition(e.target.value)}
                style={{ padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setShowAddFamily(false)}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#E2E8F0', color: '#334155', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ padding: '0.5rem 1.25rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Save Family Profile
              </button>
            </div>
          </form>
        )}

        {/* Family Members Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {familyMembers.map((fam) => (
            <div key={fam.id} style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', padding: '1.25rem', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.72rem', backgroundColor: '#E0F2F1', color: '#006B70', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '800' }}>
                    {fam.relation}
                  </span>
                  <button
                    onClick={() => handleRemoveFamilyMember(fam.id)}
                    style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.2rem' }}
                    title="Remove member"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', marginTop: '0.35rem' }}>{fam.name}</h4>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{fam.age} yrs • {fam.gender} • Blood: {fam.bloodGroup}</div>
                
                {/* Chronic Conditions */}
                {fam.chronicConditions && fam.chronicConditions.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                    {fam.chronicConditions.map((cond, cIdx) => (
                      <span key={cIdx} style={{ fontSize: '0.7rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '700' }}>
                        {cond}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#006B70', fontWeight: '700' }}>ABHA Sync: Coming Soon</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sign Out Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
          MedMarg Healthcare Engine v2.4 • Client ID: MM-PAT-90182
        </div>
        <button
          onClick={onLogout}
          style={{ padding: '0.75rem 1.5rem', backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '0.88rem', boxShadow: '0 2px 8px rgba(239,68,68,0.2)' }}
        >
          Sign Out of Care Seeker Console
        </button>
      </div>

    </div>
  );
}
