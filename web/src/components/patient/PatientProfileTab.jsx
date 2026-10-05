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
  AlertCircle
} from 'lucide-react';

export default function PatientProfileTab({ user, onLogout }) {
  const [profileName, setProfileName] = useState(user?.name || 'Rahul Sharma');
  const [phone, setPhone] = useState(user?.phone || user?.identifier || '+91 98765 43210');
  const [email, setEmail] = useState(user?.email || 'rahul.sharma@example.com');
  const [bloodGroup, setBloodGroup] = useState('O+ (Positive)');
  const [preferredLanguage, setPreferredLanguage] = useState('Telugu & English');

  // ABHA Digital ID
  const abhaNumber = '91-4829-1029-4820';
  const abhaAddress = 'rahulsharma@abdm';

  // Family Members
  const [familyMembers, setFamilyMembers] = useState([
    { id: 'f1', name: 'Sunita Sharma', relation: 'Spouse', age: 31, gender: 'Female', bloodGroup: 'B+' },
    { id: 'f2', name: 'Aarav Sharma', relation: 'Son', age: 6, gender: 'Male', bloodGroup: 'O+' }
  ]);

  const [showAddFamily, setShowAddFamily] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newFamilyRelation, setNewFamilyRelation] = useState('Spouse');
  const [newFamilyAge, setNewFamilyAge] = useState('');
  const [newFamilyGender, setNewFamilyGender] = useState('Female');

  // Saved Addresses
  const [savedAddresses, setSavedAddresses] = useState([
    { id: 'a1', label: 'Home (Default)', address: 'Plot 42, Air Bypass Road, Tirupati, AP - 517501', isDefault: true },
    { id: 'a2', label: 'Parents Home', address: 'Door 12-4/A, Gandhi Road, Tirupati, AP - 517502', isDefault: false }
  ]);

  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState('Office');
  const [newAddrText, setNewAddrText] = useState('');

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
        bloodGroup: 'Unknown'
      }
    ]);
    setNewFamilyName('');
    setNewFamilyAge('');
    setShowAddFamily(false);
  };

  const handleRemoveFamilyMember = (id) => {
    setFamilyMembers(familyMembers.filter(f => f.id !== id));
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddrText.trim()) return;
    setSavedAddresses([
      ...savedAddresses,
      {
        id: 'a_' + Date.now(),
        label: newAddrLabel,
        address: newAddrText,
        isDefault: false
      }
    ]);
    setNewAddrText('');
    setShowAddAddress(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '860px' }}>
      
      {/* Patient Profile Card */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '2rem', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <div style={{ width: '68px', height: '68px', borderRadius: '50%', backgroundColor: '#004D40', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: '900', boxShadow: '0 4px 12px rgba(0,77,64,0.25)' }}>
              {profileName ? profileName[0].toUpperCase() : 'R'}
            </div>
            <div>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#E0F2F1', color: '#006B70', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: '800' }}>
                  VERIFIED PATIENT
                </span>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: '800' }}>
                  ABDM LINKED
                </span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>{profileName}</h2>
              <div style={{ fontSize: '0.85rem', color: '#64748B' }}>📞 {phone} • {email}</div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Primary City</div>
            <div style={{ fontSize: '1rem', fontWeight: '900', color: '#006B70' }}>📍 Tirupati, AP</div>
          </div>
        </div>

        {/* Quick Vitals & Health Info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div style={{ backgroundColor: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '800' }}>BLOOD GROUP</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A', marginTop: '0.2rem' }}>{bloodGroup}</div>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '800' }}>AGE & GENDER</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A', marginTop: '0.2rem' }}>34 Years • Male</div>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '800' }}>COMMUNICATION</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A', marginTop: '0.2rem' }}>{preferredLanguage}</div>
          </div>
        </div>
      </div>

      {/* ABDM / ABHA Digital Health Card */}
      <div style={{
        backgroundColor: '#004D40',
        borderRadius: '24px',
        padding: '1.75rem 2rem',
        color: '#FFFFFF',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        alignItems: 'center',
        boxShadow: '0 12px 30px rgba(0,77,64,0.3)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: '900', marginBottom: '0.6rem' }}>
            <Shield size={14} /> AYUSHMAN BHARAT DIGITAL MISSION (ABDM)
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '900', margin: 0 }}>Digital ABHA Health ID</h3>
          <p style={{ fontSize: '0.84rem', color: '#80CBC4', marginTop: '0.35rem', lineHeight: 1.4 }}>
            Directly linked to National Health Authority (NHA). All NABL test records seamlessly synchronized.
          </p>

          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ fontSize: '0.76rem', color: '#80CBC4' }}>ABHA NUMBER</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#FFFFFF', letterSpacing: '2px', fontFamily: 'monospace' }}>
              {abhaNumber}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#FEF3C7' }}>ABHA Address: {abhaAddress}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', padding: '1.25rem', color: '#0F172A', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem', maxWidth: '240px', margin: '0 auto' }}>
          <QrCode size={110} color="#004D40" />
          <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#006B70' }}>Scan for ABDM Verification</div>
        </div>
      </div>

      {/* Family Members Management */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '2rem', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>Family Members ({familyMembers.length})</h3>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>Book tests directly for dependents and family members.</p>
          </div>
          <button
            onClick={() => setShowAddFamily(!showAddFamily)}
            style={{ padding: '0.55rem 1rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} /> Add Member
          </button>
        </div>

        {/* Add Family Member Form */}
        {showAddFamily && (
          <form onSubmit={handleAddFamilyMember} style={{ backgroundColor: '#F8FAFC', padding: '1.25rem', borderRadius: '16px', border: '1px solid #CBD5E1', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.92rem' }}>Add New Family Member</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.6rem' }}>
              <input
                type="text"
                placeholder="Full Name"
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
                Save Member
              </button>
            </div>
          </form>
        )}

        {/* Family Members Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {familyMembers.map((fam) => (
            <div key={fam.id} style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', padding: '1rem 1.25rem', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.72rem', backgroundColor: '#E0F2F1', color: '#006B70', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '800' }}>
                    {fam.relation}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{fam.age} yrs • {fam.gender}</span>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', marginTop: '0.3rem' }}>{fam.name}</h4>
              </div>

              <button
                onClick={() => handleRemoveFamilyMember(fam.id)}
                style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.4rem' }}
                title="Remove family member"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Saved Addresses Book */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '2rem', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>Saved Home & Office Addresses</h3>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>Express home sample pickup points in Tirupati.</p>
          </div>
          <button
            onClick={() => setShowAddAddress(!showAddAddress)}
            style={{ padding: '0.55rem 1rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} /> Add Address
          </button>
        </div>

        {showAddAddress && (
          <form onSubmit={handleAddAddress} style={{ backgroundColor: '#F8FAFC', padding: '1.25rem', borderRadius: '16px', border: '1px solid #CBD5E1', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.92rem' }}>Add New Address</div>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <input
                type="text"
                placeholder="Label (e.g. Office, Clinic, In-Laws)"
                value={newAddrLabel}
                onChange={(e) => setNewAddrLabel(e.target.value)}
                style={{ width: '160px', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
              />
              <input
                type="text"
                placeholder="Full Door No, Street, Landmark, Tirupati Pin Code"
                value={newAddrText}
                onChange={(e) => setNewAddrText(e.target.value)}
                required
                style={{ flex: 1, padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setShowAddAddress(false)}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#E2E8F0', color: '#334155', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ padding: '0.5rem 1.25rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Save Address
              </button>
            </div>
          </form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {savedAddresses.map((addr) => (
            <div key={addr.id} style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', padding: '1rem 1.25rem', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                <MapPin size={18} color="#006B70" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A' }}>{addr.label}</span>
                    {addr.isDefault && (
                      <span style={{ fontSize: '0.7rem', backgroundColor: '#D1FAE5', color: '#047857', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '800' }}>
                        DEFAULT
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.15rem' }}>{addr.address}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Controls & Sign Out */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem' }}>
        <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
          MedMarg Healthcare Engine v2.4 • Client ID: MM-PAT-90182
        </div>
        <button
          onClick={onLogout}
          style={{ padding: '0.75rem 1.5rem', backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '0.88rem', boxShadow: '0 2px 8px rgba(239,68,68,0.2)' }}
        >
          Sign Out of Patient Console
        </button>
      </div>

    </div>
  );
}
