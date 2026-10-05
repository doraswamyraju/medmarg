import React from 'react';

export default function FinancialsTab({ transactions = [] }) {
  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A' }}>Financial Transactions & Wallet Payout Approvals</h2>
        <p style={{ color: '#64748B', fontSize: '0.85rem' }}>Razorpay prepaid logs, doorstep QR collections, and freelancer wallet payout approvals.</p>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
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
              <tr key={txn.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', color: '#006B70', fontWeight: '800' }}>{txn.id}</td>
                <td style={{ padding: '1rem', color: '#B45309', fontWeight: '700' }}>{txn.orderId}</td>
                <td style={{ padding: '1rem', color: '#0F172A', fontWeight: '700' }}>{txn.patient}</td>
                <td style={{ padding: '1rem', color: '#334155' }}>{txn.mode}</td>
                <td style={{ padding: '1rem', fontWeight: '900', color: '#059669' }}>₹{txn.amount}</td>
                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '800', backgroundColor: '#DCFCE7', color: '#15803D' }}>
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
