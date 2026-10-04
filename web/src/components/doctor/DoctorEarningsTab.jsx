import React from 'react';
import { DollarSign, CreditCard } from 'lucide-react';

export default function DoctorEarningsTab({ doctorOrders }) {
  const totalEarnings = doctorOrders.reduce((sum, o) => sum + o.doctorMargin, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ backgroundColor: '#004D40', borderRadius: '22px', padding: '2rem', color: '#FFFFFF' }}>
        <div style={{ fontSize: '0.85rem', color: '#80CBC4', fontWeight: '800' }}>TOTAL ACCUMULATED DOCTOR REVENUE</div>
        <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#FBBF24', marginTop: '0.3rem' }}>₹{totalEarnings}</div>
        <div style={{ fontSize: '0.82rem', color: '#E0F2F1', marginTop: '0.5rem' }}>Direct B2B margin payout sent to bank account via Razorpay Payouts</div>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #E2E8F0' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', marginBottom: '1rem' }}>Transaction Margin Breakdown</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {doctorOrders.map(ord => (
            <div key={ord.orderId} style={{ padding: '0.85rem 1rem', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '800', color: '#0F172A' }}>{ord.patientName} ({ord.orderId})</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Patient Billed: ₹{ord.patientPrice}</div>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#059669' }}>
                + ₹{ord.doctorMargin}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
