import React from 'react';
import { FileText, DownloadCloud } from 'lucide-react';

export default function DoctorReportsTab({ doctorOrders }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #E2E8F0' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A', marginBottom: '1rem' }}>
          Completed Patient Lab Reports & Drive Vault
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {doctorOrders.map(ord => (
            <div key={ord.orderId} style={{ backgroundColor: '#F8FAFC', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#006B70', fontWeight: '800' }}>{ord.orderId} • {ord.date}</div>
                <div style={{ fontWeight: '900', color: '#0F172A', fontSize: '1.05rem', marginTop: '0.15rem' }}>{ord.patientName}</div>
                <div style={{ fontSize: '0.82rem', color: '#64748B' }}>Tests: {ord.items.join(', ')}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', backgroundColor: '#D1FAE5', color: '#059669', padding: '0.2rem 0.55rem', borderRadius: '4px', fontWeight: '800' }}>
                  {ord.status}
                </span>
                <div style={{ marginTop: '0.5rem' }}>
                  <button onClick={() => alert(`Downloading PDF for ${ord.patientName}`)} style={{ padding: '0.35rem 0.75rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <DownloadCloud size={14} /> PDF Report
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
