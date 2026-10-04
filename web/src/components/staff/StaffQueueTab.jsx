import React from 'react';

export default function StaffQueueTab({ staffTasks }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A' }}>Operations & Sample Desk Tasks</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {staffTasks.map(t => (
          <div key={t.id} style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', padding: '1.5rem', border: '1.5px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#006B70', fontWeight: '800' }}>{t.id} • {t.patient}</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>📋 Task: {t.task}</div>
            </div>

            <span style={{ fontSize: '0.75rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '800' }}>
              {t.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
