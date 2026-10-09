import React, { useState } from 'react';
import { DollarSign, Wallet, ArrowUpRight, CheckCircle2, Clock, ShieldCheck, Sparkles, Building, QrCode } from 'lucide-react';

export default function PhlebotomistWalletTab({ 
  wallet = {
    totalLifetimeEarnings: 18450,
    todayEarnings: 2450,
    availableCashoutBalance: 4850,
    completedTripsToday: 6,
    distancePayout: 650,
    tipsBonus: 300,
    recentPayouts: []
  }, 
  onRequestPayout 
}) {
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState(wallet.availableCashoutBalance || 3000);
  const [payoutMethod, setPayoutMethod] = useState('UPI');
  const [vpaAccount, setVpaAccount] = useState('9876543210@upi');
  const [payoutSubmitted, setPayoutSubmitted] = useState(false);

  const handlePayoutSubmit = (e) => {
    e.preventDefault();
    if (onRequestPayout) {
      onRequestPayout({
        amount: payoutAmount,
        method: payoutMethod,
        vpaOrAccount: vpaAccount
      });
    }
    setPayoutSubmitted(true);
    setTimeout(() => {
      setPayoutSubmitted(false);
      setShowPayoutModal(false);
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Wallet size={14} /> EARNINGS & PAYOUT WALLET
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700' }}>Instant UPI / Bank Settlement</span>
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A', marginTop: '0.25rem' }}>
            Field Earnings & Payout Console
          </h3>
        </div>

        <button
          onClick={() => setShowPayoutModal(true)}
          style={{
            padding: '0.75rem 1.25rem',
            backgroundColor: '#059669',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '900',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(5,150,105,0.25)'
          }}
        >
          <ArrowUpRight size={18} /> Request Instant Payout
        </button>
      </div>

      {/* Top Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        
        {/* Available Balance */}
        <div style={{ backgroundColor: '#004D40', color: '#FFF', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,77,64,0.2)' }}>
          <div style={{ fontSize: '0.8rem', color: '#80CBC4', fontWeight: '800' }}>AVAILABLE FOR CASHOUT</div>
          <div style={{ fontSize: '2.2rem', fontWeight: '900', marginTop: '0.35rem', color: '#FFF' }}>
            ₹{wallet.availableCashoutBalance?.toLocaleString('en-IN') || '4,850'}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#A7F3D0', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <ShieldCheck size={14} /> Zero transfer fees on UPI settlements
          </div>
        </div>

        {/* Today's Earning */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '800' }}>EARNED TODAY ({wallet.completedTripsToday || 6} TRIPS)</div>
          <div style={{ fontSize: '2rem', fontWeight: '900', marginTop: '0.35rem', color: '#0F172A' }}>
            ₹{wallet.todayEarnings?.toLocaleString('en-IN') || '2,450'}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: '800', marginTop: '0.5rem' }}>
            + ₹{wallet.distancePayout || 650} Distance & On-Time Bonus
          </div>
        </div>

        {/* Lifetime Earnings */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '800' }}>TOTAL LIFETIME EARNINGS</div>
          <div style={{ fontSize: '2rem', fontWeight: '900', marginTop: '0.35rem', color: '#006B70' }}>
            ₹{wallet.totalLifetimeEarnings?.toLocaleString('en-IN') || '18,450'}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700', marginTop: '0.5rem' }}>
            4.9 ★ Rating • 100% On-Time Record
          </div>
        </div>

      </div>

      {/* Payout History Ledger */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E2E8F0' }}>
        <h4 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={18} color="#006B70" /> Payout & Settlement History
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {(wallet.recentPayouts || []).map(po => (
            <div
              key={po.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 1.25rem',
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: '900', color: '#0F172A' }}>₹{po.amount?.toLocaleString('en-IN')}</span>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '900' }}>
                    ✓ {po.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.2rem' }}>
                  {po.method} • Ref: {po.id}
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700' }}>
                {po.date}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instant Payout Modal */}
      {showPayoutModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 120, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', maxWidth: '480px', width: '100%', padding: '2rem', border: '2px solid #059669' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A' }}>Request Instant Payout</h3>
                <p style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.15rem' }}>Transfer available balance directly to your bank account or UPI</p>
              </div>
              <button onClick={() => setShowPayoutModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B' }}>✕</button>
            </div>

            <form onSubmit={handlePayoutSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Payout Amount (₹)</label>
                <input
                  type="number"
                  min="100"
                  max={wallet.availableCashoutBalance || 5000}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '2px solid #CBD5E1', fontSize: '1.1rem', fontWeight: '900', outline: 'none' }}
                />
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.3rem' }}>
                  Max available: ₹{wallet.availableCashoutBalance?.toLocaleString('en-IN') || '4,850'}
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Payout Method</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('UPI')}
                    style={{
                      padding: '0.65rem',
                      borderRadius: '8px',
                      border: payoutMethod === 'UPI' ? '2px solid #059669' : '1px solid #CBD5E1',
                      backgroundColor: payoutMethod === 'UPI' ? '#ECFDF5' : '#FFF',
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    UPI VPA / QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('BANK_TRANSFER')}
                    style={{
                      padding: '0.65rem',
                      borderRadius: '8px',
                      border: payoutMethod === 'BANK_TRANSFER' ? '2px solid #059669' : '1px solid #CBD5E1',
                      backgroundColor: payoutMethod === 'BANK_TRANSFER' ? '#ECFDF5' : '#FFF',
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Direct Bank (NEFT)
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '0.35rem' }}>
                  {payoutMethod === 'UPI' ? 'UPI Virtual Payment Address (VPA)' : 'Bank Account Number & IFSC'}
                </label>
                <input
                  type="text"
                  value={vpaAccount}
                  onChange={(e) => setVpaAccount(e.target.value)}
                  placeholder={payoutMethod === 'UPI' ? 'mobile@upi' : 'Account number / IFSC'}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <button
                type="submit"
                disabled={payoutSubmitted}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  backgroundColor: payoutSubmitted ? '#059669' : '#059669',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '900',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {payoutSubmitted ? <CheckCircle2 size={18} /> : <Sparkles size={18} />}
                {payoutSubmitted ? 'Payout Dispatched via UPI!' : `Transfer ₹${payoutAmount} Instantly`}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
