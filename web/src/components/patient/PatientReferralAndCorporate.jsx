import React, { useState } from 'react';
import { 
  Gift, 
  Building2, 
  Users, 
  Copy, 
  Check, 
  MessageCircle, 
  Share2, 
  Plus, 
  Trash2, 
  FileText, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Wallet,
  DownloadCloud
} from 'lucide-react';

export default function PatientReferralAndCorporate({
  user,
  cart,
  addToCart,
  setSelectedDetailItem
}) {
  const [subTab, setSubTab] = useState('REFERRAL'); // 'REFERRAL' | 'CORPORATE'
  const [copied, setCopied] = useState(false);

  // Referral State
  const referralCode = `MM-HEALTH-${(user?.name || 'RAHUL').substring(0, 5).toUpperCase()}200`;
  const [walletBalance, setWalletBalance] = useState(400);
  const referralHistory = [
    { id: 'ref_1', friendName: 'Suresh Varma', date: '24 Aug 2026', testBooked: 'Aarogyam 1.3 Full Body', rewardEarned: 200, status: 'CREDITED' },
    { id: 'ref_2', friendName: 'Priya Reddy', date: '11 Aug 2026', testBooked: 'Thyroid Total Profile', rewardEarned: 200, status: 'CREDITED' }
  ];

  // Corporate & Staff Wellness State
  const [companyName, setCompanyName] = useState('Sri Balaji Tech Solutions Pvt Ltd');
  const [companyGstin, setCompanyGstin] = useState('37AAAAA0000A1Z5');
  const [staffList, setStaffList] = useState([
    { id: 'emp_101', name: 'M. Doraswamy Raju', designation: 'Engineering Lead', age: 34, gender: 'Male', packageAssigned: 'Executive Annual Wellness (92 Params)', status: 'SAMPLE_COLLECTED' },
    { id: 'emp_102', name: 'K. Suneetha', designation: 'Operations Manager', age: 29, gender: 'Female', packageAssigned: 'Executive Annual Wellness (92 Params)', status: 'REPORT_READY' },
    { id: 'emp_103', name: 'R. Naveen Kumar', designation: 'QA Specialist', age: 27, gender: 'Male', packageAssigned: 'Pre-Employment Health Screen', status: 'SCHEDULED' }
  ]);

  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffDesig, setNewStaffDesig] = useState('');
  const [newStaffAge, setNewStaffAge] = useState('');
  const [newStaffGender, setNewStaffGender] = useState('Male');
  const [newStaffPkg, setNewStaffPkg] = useState('Executive Annual Wellness (92 Params)');

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(`Book NABL certified health tests & home phlebotomy in Tirupati on MedMarg. Use my code ${referralCode} to get ₹200 OFF on your first test: https://medmarg.sriddha.com`);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareWhatsApp = () => {
    const msg = encodeURIComponent(`Hello! Book NABL certified diagnostic health tests at home in Tirupati with 60-min phlebotomy on MedMarg. Use my referral code *${referralCode}* to get ₹200 OFF on your first booking: https://medmarg.sriddha.com`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const handleAddStaff = (e) => {
    e.preventDefault();
    if (!newStaffName.trim()) return;
    setStaffList([
      ...staffList,
      {
        id: 'emp_' + (100 + staffList.length + 1),
        name: newStaffName,
        designation: newStaffDesig || 'Team Member',
        age: parseInt(newStaffAge) || 28,
        gender: newStaffGender,
        packageAssigned: newStaffPkg,
        status: 'SCHEDULED'
      }
    ]);
    setNewStaffName('');
    setNewStaffDesig('');
    setNewStaffAge('');
    setShowAddStaffModal(false);
  };

  const handleRemoveStaff = (id) => {
    setStaffList(staffList.filter(s => s.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Top Switcher Navigation */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '0.75rem', border: '1.5px solid #E2E8F0', display: 'flex', gap: '0.75rem', width: 'fit-content' }}>
        <button
          onClick={() => setSubTab('REFERRAL')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: subTab === 'REFERRAL' ? '#006B70' : 'transparent',
            color: subTab === 'REFERRAL' ? '#FFFFFF' : '#475569',
            fontWeight: '900',
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Gift size={18} color={subTab === 'REFERRAL' ? '#FBBF24' : '#64748B'} />
          <span>Refer & Earn (₹{walletBalance} Wallet)</span>
        </button>

        <button
          onClick={() => setSubTab('CORPORATE')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: subTab === 'CORPORATE' ? '#006B70' : 'transparent',
            color: subTab === 'CORPORATE' ? '#FFFFFF' : '#475569',
            fontWeight: '900',
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Building2 size={18} color={subTab === 'CORPORATE' ? '#FBBF24' : '#64748B'} />
          <span>Corporate & Staff Wellness ({staffList.length})</span>
        </button>
      </div>

      {/* 1. REFER & EARN SUBTAB */}
      {subTab === 'REFERRAL' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* Hero Banner */}
          <div style={{
            backgroundColor: '#004D40',
            borderRadius: '24px',
            padding: '2rem',
            color: '#FFFFFF',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            alignItems: 'center',
            boxShadow: '0 16px 36px -10px rgba(0,77,64,0.35)'
          }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '900', marginBottom: '0.5rem' }}>
                <Sparkles size={14} /> UNLIMITED HEALTH REWARDS
              </div>
              <h2 style={{ fontSize: '1.65rem', fontWeight: '900', margin: 0 }}>
                Give ₹200, Get ₹200 in Wallet
              </h2>
              <p style={{ color: '#80CBC4', fontSize: '0.88rem', marginTop: '0.4rem', lineHeight: 1.4 }}>
                Invite friends & family in Tirupati to book NABL lab tests. When they complete their first home collection, both of you earn ₹200 direct wallet credits.
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                <button
                  onClick={handleShareWhatsApp}
                  style={{ padding: '0.75rem 1.25rem', backgroundColor: '#25D366', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(37,211,102,0.3)' }}
                >
                  <MessageCircle size={18} /> Share on WhatsApp
                </button>

                <button
                  onClick={handleCopyReferral}
                  style={{ padding: '0.75rem 1.25rem', backgroundColor: '#006B70', color: '#FFF', border: '1px solid #80CBC4', borderRadius: '12px', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {copied ? <Check size={18} color="#4ADE80" /> : <Copy size={18} />}
                  <span>{copied ? 'Code Copied!' : 'Copy Code & Link'}</span>
                </button>
              </div>
            </div>

            {/* Wallet Balance Card */}
            <div style={{ backgroundColor: '#003830', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #006B70', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: '#80CBC4', fontWeight: '800' }}>MEDMARG HEALTH WALLET</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#FBBF24', margin: '0.2rem 0' }}>
                ₹{walletBalance}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#E0F2F1' }}>
                ✓ Automatically auto-applies at checkout
              </div>
              <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '0.8rem', color: '#80CBC4', fontFamily: 'monospace' }}>
                CODE: <strong>{referralCode}</strong>
              </div>
            </div>
          </div>

          {/* Referral Earnings History */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '22px', padding: '1.75rem', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', marginBottom: '1rem' }}>
              Referral Activity & Credited Rewards ({referralHistory.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {referralHistory.map(ref => (
                <div key={ref.id} style={{ backgroundColor: '#F8FAFC', borderRadius: '14px', padding: '1rem 1.25rem', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>{ref.friendName}</h4>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{ref.date} • {ref.testBooked}</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#059669' }}>+ ₹{ref.rewardEarned}</div>
                    <span style={{ fontSize: '0.7rem', backgroundColor: '#D1FAE5', color: '#047857', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: '800' }}>
                      CREDITED
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 2. CORPORATE & STAFF WELLNESS SUBTAB */}
      {subTab === 'CORPORATE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* Corporate Header Info */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '22px', padding: '1.75rem', border: '1.5px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#E0F2FE', color: '#0369A1', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: '800' }}>
                  CORPORATE WELLNESS ACCOUNT
                </span>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: '800' }}>
                  GST COMPLIANT
                </span>
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#0F172A', marginTop: '0.25rem' }}>{companyName}</h2>
              <div style={{ fontSize: '0.84rem', color: '#64748B' }}>GSTIN: {companyGstin} • Corporate Office: Tirupati Tech Hub</div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowAddStaffModal(true)}
                style={{ padding: '0.65rem 1.25rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '0.86rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(0,107,112,0.2)' }}
              >
                <Plus size={16} /> Add Staff Member
              </button>
            </div>
          </div>

          {/* Add Staff Modal */}
          {showAddStaffModal && (
            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '18px', padding: '1.5rem', border: '1.5px solid #CBD5E1' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A', marginBottom: '1rem' }}>
                Add Employee to Health Screening Roster
              </h3>
              <form onSubmit={handleAddStaff} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  <input
                    type="text"
                    placeholder="Staff Full Name *"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    required
                    style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.86rem' }}
                  />
                  <input
                    type="text"
                    placeholder="Designation (e.g. Developer, QA)"
                    value={newStaffDesig}
                    onChange={(e) => setNewStaffDesig(e.target.value)}
                    style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.86rem' }}
                  />
                  <input
                    type="number"
                    placeholder="Age"
                    value={newStaffAge}
                    onChange={(e) => setNewStaffAge(e.target.value)}
                    required
                    style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.86rem' }}
                  />
                  <select
                    value={newStaffGender}
                    onChange={(e) => setNewStaffGender(e.target.value)}
                    style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.86rem' }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '0.3rem' }}>Assign Health Package</label>
                  <select
                    value={newStaffPkg}
                    onChange={(e) => setNewStaffPkg(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.86rem' }}
                  >
                    <option value="Executive Annual Wellness (92 Params)">Executive Annual Wellness (92 Params) - ₹1,499</option>
                    <option value="Pre-Employment Health Screen (48 Params)">Pre-Employment Health Screen (48 Params) - ₹799</option>
                    <option value="Diabetic & Cardiac Corporate Panel">Diabetic & Cardiac Corporate Panel - ₹999</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddStaffModal(false)}
                    style={{ padding: '0.55rem 1.1rem', backgroundColor: '#E2E8F0', color: '#334155', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.84rem', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '0.55rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.84rem', cursor: 'pointer' }}
                  >
                    Save & Schedule Testing
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Staff Roster Table */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '22px', border: '1.5px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ padding: '1rem 1.5rem', backgroundColor: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0F172A' }}>
                Staff Diagnostic Roster ({staffList.length} Employees)
              </div>
              <div style={{ fontSize: '0.78rem', color: '#006B70', fontWeight: '800' }}>
                🏢 On-site & Doorstep Corporate Testing Available
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F1F5F9', color: '#475569', fontWeight: '800', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '0.75rem 1.25rem' }}>Employee Name & ID</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Designation</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Age & Gender</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Assigned Package</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Testing Status</th>
                    <th style={{ padding: '0.75rem 1.25rem', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((st, idx) => (
                    <tr key={st.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <div style={{ fontWeight: '800', color: '#0F172A' }}>{st.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'monospace' }}>{st.id}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#334155' }}>{st.designation}</td>
                      <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>{st.age} yrs • {st.gender}</td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#006B70' }}>{st.packageAssigned}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '6px',
                          fontWeight: '800',
                          backgroundColor: st.status === 'REPORT_READY' ? '#D1FAE5' : st.status === 'SAMPLE_COLLECTED' ? '#FEF3C7' : '#E0F2FE',
                          color: st.status === 'REPORT_READY' ? '#047857' : st.status === 'SAMPLE_COLLECTED' ? '#B45309' : '#0369A1'
                        }}>
                          {st.status === 'REPORT_READY' ? '✓ REPORT READY' : st.status === 'SAMPLE_COLLECTED' ? '● COLLECTED' : '⏱ SCHEDULED'}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>
                        <button
                          onClick={() => handleRemoveStaff(st.id)}
                          style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.3rem' }}
                          title="Remove from roster"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
