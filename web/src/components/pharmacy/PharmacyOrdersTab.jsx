import React from 'react';
import { Pill, CheckCircle } from 'lucide-react';

export default function PharmacyOrdersTab({ pharmacyOrders }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A' }}>Doorstep Medicine Orders Queue</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {pharmacyOrders.map(ord => (
          <div key={ord.id} style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', padding: '1.5rem', border: '1.5px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#D97706', fontWeight: '800' }}>{ord.id} • {ord.patient}</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>💊 {ord.medicines}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.15rem' }}>📍 Address: {ord.address}</div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#059669' }}>₹{ord.amount}</div>
              <span style={{ fontSize: '0.75rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '800', marginTop: '0.3rem', display: 'inline-block' }}>
                {ord.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
