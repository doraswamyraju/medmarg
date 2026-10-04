import React from 'react';

export default function FinancialsTab({ transactions }) {
  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#FFF' }}>Financial Transactions & Wallet Payout Approvals</h2>
        <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Razorpay prepaid logs, doorstep QR collections, and freelancer wallet payout approvals.</p>
      </div>

      <div style={{ backgroundColor: '#1E293B', borderRadius: '18px', border: '1px solid #334155', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#0F172A', borderBottom: '1px solid #334155', color: '#94A3B8' }}>
              <th style={{ padding: '1rem 1.25rem' }}>TRANSACTION ID</th>
              <th style={{ padding: '1rem' }}>ORDER ID</th>
              <th style={{ padding: '1rem' }}>PATIENT</th>
              <th style={{ padding: '1rem' }}>PAYMENT MODE</th>
              <th style={{ padding: '1rem' }}>AMOUNT (₹)</th>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(txn => (
              <tr key={txn.id} style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', color: '#67E8F9', fontWeight: '800' }}>{txn.id}</td>
                <td style={{ padding: '1rem', color: '#FBBF24', fontWeight: '700' }}>{txn.orderId}</td>
                <td style={{ padding: '1rem', color: '#FFF', fontWeight: '700' }}>{txn.patient}</td>
                <td style={{ padding: '1rem', color: '#CBD5E1' }}>{txn.mode}</td>
                <td style={{ padding: '1rem', fontWeight: '900', color: '#34D399' }}>₹{txn.amount}</td>
                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '800', backgroundColor: 'rgba(16,185,129,0.2)', color: '#34D399' }}>
                    {txn.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
