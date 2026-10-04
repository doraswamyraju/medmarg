import React from 'react';
import { DownloadCloud, ExternalLink } from 'lucide-react';

export default function LabOrdersTab({ orders, handleSimulateDriveUpload }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A' }}>Inbound Phlebotomy Samples & Processing Queue</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {orders.map(ord => (
          <div key={ord.id} style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', padding: '1.5rem', border: '1.5px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#006B70', fontWeight: '800' }}>{ord.id} • Barcode: {ord.barcode}</div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>{ord.patient}</h4>
              <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.15rem' }}>🧪 {ord.test}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.15rem' }}>Collector: {ord.collector}</div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', backgroundColor: '#E0F2F1', color: '#006B70', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: '800' }}>
                {ord.status}
              </span>
              <div style={{ marginTop: '0.75rem' }}>
                {ord.driveReport ? (
                  <a href={ord.driveReport} target="_blank" rel="noopener noreferrer" style={{ padding: '0.45rem 0.85rem', backgroundColor: '#059669', color: '#FFF', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '800', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    View Drive Report <ExternalLink size={12} />
                  </a>
                ) : (
                  <button onClick={() => handleSimulateDriveUpload(ord.id)} style={{ padding: '0.45rem 0.85rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}>
                    + Upload Google Drive PDF
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
