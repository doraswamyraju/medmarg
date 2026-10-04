import React from 'react';

export default function DoctorOpdQueueTab({ patients }) {
  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #E2E8F0' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A', marginBottom: '1rem' }}>
        Today's Live OPD Patient Appointments
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {patients.map((p, idx) => (
          <div key={p.id} style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '900' }}>
                TOKEN #{idx + 1}
              </span>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0F172A', marginTop: '0.3rem' }}>{p.name}</h4>
              <div style={{ fontSize: '0.82rem', color: '#64748B' }}>Age: {p.age} • Phone: {p.phone}</div>
            </div>

            <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '800' }}>
              ● Checked-In OPD
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
