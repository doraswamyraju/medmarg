import React from 'react';
import { 
  FolderHeart, 
  FileText, 
  DownloadCloud, 
  ExternalLink, 
  CheckCircle2, 
  Lock,
  Sparkles
} from 'lucide-react';

export default function PatientReportsTab({ user }) {
  const reportsList = [
    { id: 'REP-8821', title: 'Thyrocare Aarogyam Master Health Checkup (104 Params)', date: '28 Aug 2026', lab: 'MedMarg / Thyrocare Central Hub', status: 'READY_PDF', pdfUrl: '#', doctorVerified: 'Dr. Ananya Sharma (MD Path)' },
    { id: 'REP-7910', title: 'Diabetic & Lipid Comprehensive Profile', date: '14 Jul 2026', lab: 'Apollo Diagnostics Hub', status: 'READY_PDF', pdfUrl: '#', doctorVerified: 'Dr. K. Sivasankar' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header Info Banner */}
      <div style={{ backgroundColor: '#004D40', borderRadius: '22px', padding: '1.75rem', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '900', marginBottom: '0.5rem' }}>
            <Lock size={14} /> 256-BIT ENCRYPTED DIGITAL HEALTH VAULT
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900' }}>Your Lab Reports & PDF Records</h2>
          <p style={{ color: '#80CBC4', fontSize: '0.85rem', marginTop: '0.3rem' }}>
            All reports automatically synced to Google Drive & accessible anytime.
          </p>
        </div>

        <button 
          onClick={() => alert('🔒 Google Drive Auto-Sync Active! All PDF reports are backed up safely.')}
          style={{ padding: '0.7rem 1.25rem', backgroundColor: '#006B70', color: '#FFF', border: '1px solid #80CBC4', borderRadius: '12px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}
        >
          Check Drive Sync Status ✓
        </button>
      </div>

      {/* Reports List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {reportsList.map(rep => (
          <div key={rep.id} style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', padding: '1.5rem', border: '1.5px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#E0F2F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={24} color="#006B70" />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#006B70', fontWeight: '800' }}>{rep.id} • {rep.date}</div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>{rep.title}</h4>
                <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.15rem' }}>📍 Processing Lab: {rep.lab} • Verified by: {rep.doctorVerified}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => alert(`Opening official PDF report for ${rep.title}`)}
                style={{ padding: '0.65rem 1.1rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <DownloadCloud size={16} /> Download PDF
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
