import React, { useState, useEffect } from 'react';
import { 
  User, 
  KeyRound, 
  Lock, 
  ShieldCheck, 
  Bike, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Receipt,
  QrCode
} from 'lucide-react';
import { API_BASE, safeFetch, safeJson } from '../../data/apiConfig';

export default function PhlebotomistProfileTab({ user, initialSubSection = 'PROFILE' }) {
  const [activeSubSection, setActiveSubSection] = useState(initialSubSection); // 'PROFILE' | 'SECURITY' | 'PAYMENTS'

  useEffect(() => {
    if (initialSubSection) {
      setActiveSubSection(initialSubSection);
    }
  }, [initialSubSection]);
  
  // Profile Form State
  const [profile, setProfile] = useState({
    name: user?.name || 'Ramesh Kumar',
    phone: '+91 97777 77777',
    email: user?.email || 'salaried@medmarg.com',
    role: 'SALARIED_AGENT',
    zone: 'Tirupati Urban & Bypass (Zone 1)',
    vehicle: 'Hero Electric Nyx EV (AP 03 EV 4821)',
    emergencyContact: '+91 94400 99881 (Spouse)',
    bloodGroup: 'B+',
    joiningDate: '12 Jan 2025',
    qualification: 'DMLT Certified Senior Phlebotomist'
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Password Reset State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Payments Ledger State
  const [paymentsLedger, setPaymentsLedger] = useState({
    totalCollected: 2498,
    transactions: [
      { id: 'TXN-MM-8921', orderId: 'MM-8921', patientName: 'Rahul Sharma', amount: 899, paymentMode: 'DOORSTEP_QR', paymentStatus: 'PAID_DOORSTEP_QR', date: 'Today 08:15 AM', razorpayPaymentId: 'pay_qr_8921' },
      { id: 'TXN-MM-8922', orderId: 'MM-8922', patientName: 'Priya Verma', amount: 1599, paymentMode: 'DOORSTEP_QR', paymentStatus: 'PAID_DOORSTEP_QR', date: 'Today 09:20 AM', razorpayPaymentId: 'pay_qr_8922' }
    ]
  });

  useEffect(() => {
    // Fetch live agent profile details
    safeFetch(`${API_BASE}/api/v1/agent/profile/${user?.id || 'AG-01'}`)
      .then(res => safeJson(res))
      .then(data => {
        if (data && data.profile) {
          setProfile(prev => ({ ...prev, ...data.profile }));
        }
      })
      .catch(err => console.warn('Profile fetch note:', err));

    // Fetch live payments ledger
    safeFetch(`${API_BASE}/api/v1/agent/payments/${user?.id || 'AG-01'}`)
      .then(res => safeJson(res))
      .then(data => {
        if (data && data.transactions && data.transactions.length > 0) {
          setPaymentsLedger({
            totalCollected: data.totalCollected || 2498,
            transactions: data.transactions
          });
        }
      })
      .catch(err => console.warn('Payments fetch note:', err));
  }, [user]);

  // Handle Save Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccessMsg('');

    try {
      const res = await safeFetch(`${API_BASE}/api/v1/agent/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: user?.id || 'AG-01',
          ...profile
        })
      });
      const data = await safeJson(res);
      if (data && data.success) {
        setProfileSuccessMsg('Profile details updated successfully.');
        setTimeout(() => setProfileSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.warn('Profile update error:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation password do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await safeFetch(`${API_BASE}/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: profile.email || user?.email,
          newPassword: newPassword
        })
      });
      const data = await safeJson(res);
      if (data && data.success) {
        setPasswordMsg('Password changed successfully! Please use your new password next time you log in.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(data?.error || 'Failed to update password.');
      }
    } catch (err) {
      setPasswordError('Server error while resetting password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Banner & Sub-Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ backgroundColor: '#E0F2F1', color: '#006B70', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <User size={14} /> ACCOUNT SETTINGS
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700' }}>Fleet Personnel Management</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A', marginTop: '0.25rem' }}>
            Profile Management & Security Console
          </h2>
        </div>

        {/* Sub-Section Buttons */}
        <div style={{ display: 'flex', gap: '0.4rem', backgroundColor: '#FFFFFF', padding: '0.35rem', borderRadius: '12px', border: '1px solid #CBD5E1' }}>
          {[
            { key: 'PROFILE', label: 'Dossier Profile', icon: User },
            { key: 'SECURITY', label: 'Change Password', icon: KeyRound },
            { key: 'PAYMENTS', label: 'Doorstep Payments', icon: CreditCard }
          ].map(btn => {
            const IconC = btn.icon;
            const active = activeSubSection === btn.key;
            return (
              <button
                key={btn.key}
                onClick={() => setActiveSubSection(btn.key)}
                style={{
                  padding: '0.55rem 0.95rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: active ? '#006B70' : 'transparent',
                  color: active ? '#FFFFFF' : '#475569',
                  fontWeight: active ? '900' : '700',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <IconC size={15} />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: PROFILE DOSSIER */}
      {activeSubSection === 'PROFILE' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '2rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.02)', maxWidth: '800px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid #F1F5F9', marginBottom: '1.5rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#006B70', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '900' }}>
              RK
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                {profile.name}
              </h3>
              <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.2rem' }}>
                Employee ID: <strong>{user?.id || 'AG-01'}</strong> • Role: <strong>In-House Phlebotomist</strong>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '800', marginTop: '0.2rem' }}>
                ✓ {profile.qualification}
              </div>
            </div>
          </div>

          {profileSuccessMsg && (
            <div style={{ padding: '0.75rem 1rem', backgroundColor: '#ECFDF5', color: '#065F46', borderRadius: '10px', border: '1px solid #BBF7D0', fontSize: '0.85rem', fontWeight: '800', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} /> {profileSuccessMsg}
            </div>
          )}

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '0.35rem' }}>
                  Full Legal Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', fontWeight: '700', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '0.35rem' }}>
                  Primary Contact Mobile
                </label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', fontWeight: '700', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '0.35rem' }}>
                  Registered Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', fontWeight: '700', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '0.35rem' }}>
                  Assigned EV Vehicle / Bike
                </label>
                <input
                  type="text"
                  value={profile.vehicle}
                  onChange={(e) => setProfile({ ...profile, vehicle: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', fontWeight: '700', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '0.35rem' }}>
                  Assigned Operational Territory Zone
                </label>
                <input
                  type="text"
                  disabled
                  value={profile.zone}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #E2E8F0', backgroundColor: '#F8FAFC', color: '#64748B', fontSize: '0.9rem', fontWeight: '700', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '0.35rem' }}>
                  Emergency Contact & Kin
                </label>
                <input
                  type="text"
                  value={profile.emergencyContact}
                  onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', fontWeight: '700', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              style={{
                alignSelf: 'flex-start',
                marginTop: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#006B70',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '900',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 2px 6px rgba(0,107,112,0.2)'
              }}
            >
              {savingProfile ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              <span>Save Profile Changes</span>
            </button>
          </form>
        </div>
      )}

      {/* SECTION 2: CHANGE PASSWORD */}
      {activeSubSection === 'SECURITY' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '2rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.02)', maxWidth: '600px' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <KeyRound size={20} color="#006B70" /> Update Account Password
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.35rem' }}>
              Ensure your login credentials remain secure. Use a password with at least 6 characters.
            </p>
          </div>

          {passwordMsg && (
            <div style={{ padding: '0.75rem 1rem', backgroundColor: '#ECFDF5', color: '#065F46', borderRadius: '10px', border: '1px solid #BBF7D0', fontSize: '0.85rem', fontWeight: '800', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} /> {passwordMsg}
            </div>
          )}

          {passwordError && (
            <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FEF2F2', color: '#DC2626', borderRadius: '10px', border: '1px solid #FECACA', fontSize: '0.85rem', fontWeight: '800', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertCircle size={16} /> {passwordError}
            </div>
          )}

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '0.35rem' }}>
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', fontWeight: '700', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '0.35rem' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', fontWeight: '700', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              style={{
                marginTop: '0.5rem',
                padding: '0.85rem',
                backgroundColor: '#006B70',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '900',
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 12px rgba(0,107,112,0.2)'
              }}
            >
              {passwordLoading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
              <span>Update Password</span>
            </button>
          </form>
        </div>
      )}

      {/* SECTION 3: DOORSTEP PAYMENTS & SETTLEMENTS LEDGER */}
      {activeSubSection === 'PAYMENTS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '1.5rem', border: '2px solid #006B70', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>
                Total Doorstep Collections Today
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: '#0F172A', marginTop: '0.25rem' }}>
                ₹{paymentsLedger.totalCollected?.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: '800', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle2 size={14} /> 100% Cashless via Razorpay Dynamic QR
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '1.5rem', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>
                Successful Transactions
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: '#0F172A', marginTop: '0.25rem' }}>
                {paymentsLedger.transactions?.length || 2}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700', marginTop: '0.35rem' }}>
                All digital receipts verified by server
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                Today's Doorstep Collections Ledger
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#006B70', backgroundColor: '#E0F2F1', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '800' }}>
                Instant Bank Settlement
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '0.85rem 1.25rem', color: '#475569', fontWeight: '800' }}>Order ID</th>
                    <th style={{ padding: '0.85rem 1.25rem', color: '#475569', fontWeight: '800' }}>Patient Name</th>
                    <th style={{ padding: '0.85rem 1.25rem', color: '#475569', fontWeight: '800' }}>Payment Mode</th>
                    <th style={{ padding: '0.85rem 1.25rem', color: '#475569', fontWeight: '800' }}>Amount</th>
                    <th style={{ padding: '0.85rem 1.25rem', color: '#475569', fontWeight: '800' }}>Status</th>
                    <th style={{ padding: '0.85rem 1.25rem', color: '#475569', fontWeight: '800' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentsLedger.transactions.map((txn, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: '800', color: '#006B70' }}>
                        {txn.orderId}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: '700', color: '#0F172A' }}>
                        {txn.patientName}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', color: '#334155' }}>
                        <span style={{ fontSize: '0.78rem', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: '#E0F2F1', color: '#006B70', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <QrCode size={12} /> Doorstep UPI QR
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: '900', color: '#0F172A' }}>
                        ₹{txn.amount}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '6px', backgroundColor: '#ECFDF5', color: '#059669', fontWeight: '900', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle2 size={13} /> PAID SUCCESS
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', color: '#64748B', fontWeight: '700' }}>
                        {txn.date}
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
