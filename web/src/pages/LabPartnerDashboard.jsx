import React, { useState } from 'react';
import { 
  FlaskConical, 
  Upload, 
  CheckCircle, 
  Clock, 
  UserCheck, 
  Plus, 
  ExternalLink,
  MapPin,
  TrendingUp,
  FileCheck
} from 'lucide-react';

export default function LabPartnerDashboard({ user, onSwitchRole, onLogout }) {
  const [activeSubTab, setActiveSubTab] = useState('ORDERS'); // 'ORDERS' | 'CATALOG' | 'UPLOAD_REPORT'
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [generatedDriveLink, setGeneratedDriveLink] = useState('');

  const [orders, setOrders] = useState([
    {
      id: 'ORD-8921',
      patient: 'Siddharth V.',
      test: 'Complete Lipid Profile (8 Parameters)',
      type: 'Home Collection',
      slot: 'Today, 08:00 AM',
      status: 'Phlebotomist Assigned',
      collector: 'Suresh Kumar',
      barcode: 'MED-BC-9921',
      driveReport: ''
    },
    {
      id: 'ORD-8922',
      patient: 'Meera N.',
      test: 'HbA1c Glycosylated Hemoglobin',
      type: 'Lab Walk-in',
      slot: 'Today, 10:30 AM',
      status: 'Sample Analyzing',
      collector: 'Lab Desk Counter 2',
      barcode: 'MED-BC-9922',
      driveReport: ''
    }
  ]);

  const [catalog, setCatalog] = useState([
    { id: '1', name: 'Lipid Profile', price: 499, mrp: 850, tatHours: 6, nablCertified: true },
    { id: '2', name: 'Thyroid Profile (T3, T4, TSH)', price: 449, mrp: 750, tatHours: 6, nablCertified: true },
    { id: '3', name: 'Complete Blood Count (CBC)', price: 299, mrp: 450, tatHours: 4, nablCertified: true }
  ]);

  const handleSimulateDriveUpload = (orderId) => {
    setUploadStatus('Uploading report PDF to Google Drive Service Account...');
    setTimeout(() => {
      const mockDriveLink = `https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing`;
      setGeneratedDriveLink(mockDriveLink);
      setUploadStatus('Report uploaded successfully! Stored Google Drive link in MedMarg DB.');

      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Report Ready', driveReport: mockDriveLink } : o));
    }, 1000);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <nav style={{ backgroundColor: '#1E3A8A', color: '#FFF', padding: '0.85rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            <FlaskConical size={20} color="#FFF" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', lineHeight: 1.1 }}>MedMarg Partner Portal (Pathology Lab)</h2>
            <span style={{ fontSize: '0.75rem', color: '#93C5FD' }}>{user?.org || 'Dr. Lal PathLabs (NABL Center)'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={onSwitchRole} style={{ background: '#2563EB', border: 'none', color: '#FFF', padding: '0.35rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}>
            Switch Role
          </button>
          <button onClick={onLogout} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: '#FFF', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </nav>

      {/* Lab Partner Sub-navigation */}
      <div style={{ backgroundColor: '#FFF', borderBottom: '1px solid #E2E8F0', padding: '0 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '2rem' }}>
          {[
            { id: 'ORDERS', label: 'Sample Orders & Phlebotomist Dispatch', badge: `${orders.length} Active` },
            { id: 'CATALOG', label: 'Test Catalog & Pricing Manager', badge: '3 Tests' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                padding: '1rem 0.5rem',
                border: 'none',
                background: 'none',
                borderBottom: activeSubTab === tab.id ? '3px solid #2563EB' : '3px solid transparent',
                color: activeSubTab === tab.id ? '#2563EB' : '#64748B',
                fontWeight: activeSubTab === tab.id ? '700' : '500',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              {tab.label} <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.4rem', backgroundColor: '#DBEAFE', borderRadius: '10px', color: '#1E40AF', marginLeft: '0.3rem' }}>{tab.badge}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Container */}
      <main style={{ maxWidth: '1100px', margin: '2rem auto', width: '100%', padding: '0 1rem', flex: 1 }}>
        {activeSubTab === 'ORDERS' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0F172A' }}>Active Sample Collection Queue</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Assign phlebotomists, verify sample tube barcodes, and upload patient reports to Google Drive</p>
              </div>
            </div>

            {uploadStatus && (
              <div style={{ padding: '0.85rem 1rem', backgroundColor: '#ECFDF5', border: '1px solid #10B981', borderRadius: '10px', color: '#065F46', marginBottom: '1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={18} /> {uploadStatus}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {orders.map((ord) => (
                <div key={ord.id} style={{ backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <strong style={{ fontSize: '1.1rem', color: '#0F172A' }}>{ord.patient}</strong>
                      <span style={{ fontSize: '0.75rem', backgroundColor: '#F1F5F9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '700' }}>{ord.id}</span>
                      <span style={{ fontSize: '0.75rem', backgroundColor: ord.status === 'Report Ready' ? '#D1FAE5' : '#FEF3C7', color: ord.status === 'Report Ready' ? '#065F46' : '#92400E', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '700' }}>{ord.status}</span>
                    </div>
                    <div style={{ color: '#2563EB', fontWeight: '600', fontSize: '0.95rem', marginTop: '0.25rem' }}>{ord.test}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', gap: '0.85rem', marginTop: '0.35rem' }}>
                      <span>Type: <strong>{ord.type}</strong> ({ord.slot})</span>
                      <span>• Collector: <strong>{ord.collector}</strong></span>
                      <span>• Tube Barcode: <code style={{ backgroundColor: '#F1F5F9', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>{ord.barcode}</code></span>
                    </div>
                  </div>

                  <div>
                    {ord.driveReport ? (
                      <a
                        href={ord.driveReport}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', backgroundColor: '#E0F2F1', color: '#006B70', borderRadius: '8px', textDecoration: 'none', fontWeight: '700', fontSize: '0.85rem' }}
                      >
                        <FileCheck size={16} /> View Drive Report <ExternalLink size={14} />
                      </a>
                    ) : (
                      <button
                        onClick={() => handleSimulateDriveUpload(ord.id)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.1rem', backgroundColor: '#2563EB', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                      >
                        <Upload size={16} /> Upload Report PDF (Google Drive)
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'CATALOG' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0F172A' }}>Pathology Test Catalog & Pricing</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Configure your lab test offerings, turnaround times, and MedMarg discounted pricing</p>
              </div>
              <button style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', backgroundColor: '#2563EB', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>
                <Plus size={16} /> Add New Test
              </button>
            </div>

            <div style={{ backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
                  <tr>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Test Name</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Standard MRP</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>MedMarg Price</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Turnaround (TAT)</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Accreditation</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {catalog.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: '700', color: '#0F172A' }}>{item.name}</td>
                      <td style={{ padding: '1rem 1.25rem', color: '#94A3B8' }}>₹{item.mrp}</td>
                      <td style={{ padding: '1rem 1.25rem', color: '#2563EB', fontWeight: '800' }}>₹{item.price}</td>
                      <td style={{ padding: '1rem 1.25rem', color: '#475569' }}>{item.tatHours} Hours</td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ fontSize: '0.75rem', backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '700' }}>NABL Verified</span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <button style={{ background: 'none', border: '1px solid #CBD5E1', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>Edit Pricing</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
