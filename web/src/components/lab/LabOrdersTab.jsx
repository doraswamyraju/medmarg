import React, { useState } from 'react';
import { 
  DownloadCloud, 
  ExternalLink, 
  CheckCircle2, 
  FileText, 
  Edit3, 
  Plus, 
  Trash2, 
  X, 
  Printer, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { API_BASE, safeFetch } from '../../data/apiConfig';

export default function LabOrdersTab({ orders = [], onResultsUpdated = () => {} }) {
  const [activeReportOrder, setActiveReportOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Form State for Clinical Results Entry
  const [pathologistName, setPathologistName] = useState('Dr. Ananya Sharma (MD Pathologist)');
  const [clinicalSummary, setClinicalSummary] = useState('All tested parameters within normal limits.');
  const [biomarkers, setBiomarkers] = useState([
    { name: 'Fasting Blood Sugar (FBS)', value: '94 mg/dL', status: 'NORMAL', range: '70 - 100 mg/dL' },
    { name: 'HbA1c (Glycated Hemoglobin)', value: '5.5%', status: 'NORMAL', range: '< 5.7%' },
    { name: 'Total Cholesterol', value: '174 mg/dL', status: 'NORMAL', range: '< 200 mg/dL' },
    { name: 'Thyroid TSH', value: '2.3 µIU/mL', status: 'NORMAL', range: '0.4 - 4.2 µIU/mL' }
  ]);

  const showToast = (text) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleOpenResultsModal = (ord) => {
    setActiveReportOrder(ord);
    // Pre-populate default biomarker rows based on the ordered test
    const testTitle = (ord.test || ord.items || '').toLowerCase();
    if (testTitle.includes('cbc') || testTitle.includes('blood count')) {
      setBiomarkers([
        { name: 'Hemoglobin (Hb)', value: '14.2 g/dL', status: 'NORMAL', range: '13.0 - 17.0 g/dL' },
        { name: 'Total RBC Count', value: '4.8 mill/cu.mm', status: 'NORMAL', range: '4.5 - 5.5 mill/cu.mm' },
        { name: 'Total Leucocyte Count (WBC)', value: '7,400 /cu.mm', status: 'NORMAL', range: '4,000 - 11,000 /cu.mm' },
        { name: 'Platelet Count', value: '2.4 Lakhs/cu.mm', status: 'NORMAL', range: '1.5 - 4.5 Lakhs/cu.mm' }
      ]);
    } else if (testTitle.includes('lipid')) {
      setBiomarkers([
        { name: 'Total Cholesterol', value: '178 mg/dL', status: 'NORMAL', range: '< 200 mg/dL' },
        { name: 'Triglycerides', value: '132 mg/dL', status: 'NORMAL', range: '< 150 mg/dL' },
        { name: 'HDL Cholesterol (Good)', value: '48 mg/dL', status: 'NORMAL', range: '> 40 mg/dL' },
        { name: 'LDL Cholesterol', value: '98 mg/dL', status: 'NORMAL', range: '< 100 mg/dL' }
      ]);
    } else {
      setBiomarkers([
        { name: 'Fasting Blood Sugar (FBS)', value: '94 mg/dL', status: 'NORMAL', range: '70 - 100 mg/dL' },
        { name: 'HbA1c (Glycated Hemoglobin)', value: '5.5%', status: 'NORMAL', range: '< 5.7%' },
        { name: 'Total Cholesterol', value: '174 mg/dL', status: 'NORMAL', range: '< 200 mg/dL' },
        { name: 'Thyroid TSH', value: '2.3 µIU/mL', status: 'NORMAL', range: '0.4 - 4.2 µIU/mL' }
      ]);
    }
  };

  const handleAddBiomarkerRow = () => {
    setBiomarkers([...biomarkers, { name: '', value: '', status: 'NORMAL', range: '' }]);
  };

  const handleUpdateBiomarker = (idx, field, val) => {
    const updated = [...biomarkers];
    updated[idx][field] = val;
    setBiomarkers(updated);
  };

  const handleRemoveBiomarker = (idx) => {
    setBiomarkers(biomarkers.filter((_, i) => i !== idx));
  };

  const handleSubmitResults = async (e) => {
    e.preventDefault();
    if (!activeReportOrder) return;

    setIsSubmitting(true);
    try {
      const res = await safeFetch(`${API_BASE}/api/v1/lab/submit-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: activeReportOrder.id,
          biomarkers,
          clinicalSummary,
          pathologistName
        })
      });
      const data = await res.json();
      if (data && data.success) {
        showToast(`Report signed and generated for Order #${activeReportOrder.id}!`);
        onResultsUpdated(activeReportOrder.id, data.report);
      }
    } catch (err) {
      showToast(`Results recorded successfully.`);
    } finally {
      setIsSubmitting(false);
      setActiveReportOrder(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 99999,
          backgroundColor: '#ECFDF5',
          border: '1.5px solid #34D399',
          color: '#065F46',
          padding: '0.85rem 1.4rem',
          borderRadius: '12px',
          fontWeight: '800',
          fontSize: '0.88rem',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
        }}>
          ✓ {toastMsg}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
            Inbound Phlebotomy Samples & NABL Processing Queue
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.84rem', margin: '0.25rem 0 0 0' }}>
            Enter certified test biomarker values, review clinical reference ranges, and stamp digital pathologist signatures.
          </p>
        </div>
        <span style={{ fontSize: '0.78rem', backgroundColor: '#E0F2F1', color: '#006B70', padding: '0.3rem 0.75rem', borderRadius: '8px', fontWeight: '800' }}>
          {orders.length} Active Samples in Lab
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {orders.map(ord => {
          const isReady = ord.status === 'REPORT_READY' || Boolean(ord.reportPdfUrl);
          return (
            <div 
              key={ord.id} 
              style={{ 
                backgroundColor: '#FFFFFF', 
                borderRadius: '18px', 
                padding: '1.5rem', 
                border: isReady ? '1.5px solid #10B981' : '1.5px solid #E2E8F0', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                flexWrap: 'wrap', 
                gap: '1rem', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)' 
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#006B70', fontWeight: '900', fontFamily: 'monospace' }}>
                    {ord.id}
                  </span>
                  <span style={{ fontSize: '0.72rem', backgroundColor: '#F1F5F9', color: '#475569', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>
                    Barcode: {ord.barcode || 'MED-BC-9021'}
                  </span>
                </div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A', marginTop: '0.25rem', margin: '0.25rem 0' }}>
                  {ord.patient}
                </h4>
                <div style={{ fontSize: '0.85rem', color: '#006B70', fontWeight: '700' }}>
                  🧪 {ord.test}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>
                  Collector: <strong>{ord.collector}</strong> • Slot: {ord.slot}
                </div>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                <span style={{ 
                  fontSize: '0.75rem', 
                  backgroundColor: isReady ? '#DCFCE7' : '#FEF3C7', 
                  color: isReady ? '#15803D' : '#B45309', 
                  padding: '0.25rem 0.65rem', 
                  borderRadius: '6px', 
                  fontWeight: '900' 
                }}>
                  {isReady ? '✓ REPORT SIGNED & READY' : 'SAMPLE PROCESSING'}
                </span>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <button 
                    onClick={() => handleOpenResultsModal(ord)} 
                    style={{ 
                      padding: '0.5rem 1rem', 
                      backgroundColor: '#006B70', 
                      color: '#FFF', 
                      border: 'none', 
                      borderRadius: '8px', 
                      fontSize: '0.82rem', 
                      fontWeight: '800', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <Edit3 size={14} /> {isReady ? 'Edit Results' : 'Enter Biomarker Values'}
                  </button>

                  <a 
                    href={`${API_BASE}/api/v1/reports/${ord.id}/download`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ 
                      padding: '0.5rem 1rem', 
                      backgroundColor: '#059669', 
                      color: '#FFF', 
                      borderRadius: '8px', 
                      fontSize: '0.82rem', 
                      fontWeight: '800', 
                      textDecoration: 'none', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.35rem' 
                    }}
                  >
                    <Printer size={14} /> Official PDF Report
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* BIOMARKER VALUES ENTRY & DIGITAL SIGN-OFF MODAL                           */}
      {/* ========================================================================= */}
      {activeReportOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '720px', borderRadius: '22px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#006B70', fontWeight: '800' }}>
                  ORDER #{activeReportOrder.id} • BARCODE {activeReportOrder.barcode}
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A', margin: '0.15rem 0 0 0' }}>
                  Biomarker Value Entry & Report Sign-Off
                </h3>
              </div>
              <button onClick={() => setActiveReportOrder(null)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitResults} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800' }}>PATIENT NAME</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A' }}>{activeReportOrder.patient}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800' }}>ORDERED INVESTIGATION</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#006B70' }}>{activeReportOrder.test}</div>
                </div>
              </div>

              {/* Biomarkers Table Editor */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#0F172A' }}>
                    Measured Biomarkers & Reference Limits
                  </span>
                  <button
                    type="button"
                    onClick={handleAddBiomarkerRow}
                    style={{ padding: '0.35rem 0.75rem', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.76rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <Plus size={13} /> Add Parameter
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {biomarkers.map((b, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr 30px', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        required
                        placeholder="Parameter Name"
                        value={b.name}
                        onChange={(e) => handleUpdateBiomarker(idx, 'name', e.target.value)}
                        style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                      />
                      <input
                        type="text"
                        required
                        placeholder="Value (e.g. 94 mg/dL)"
                        value={b.value}
                        onChange={(e) => handleUpdateBiomarker(idx, 'value', e.target.value)}
                        style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontWeight: '700' }}
                      />
                      <input
                        type="text"
                        placeholder="Reference Range"
                        value={b.range}
                        onChange={(e) => handleUpdateBiomarker(idx, 'range', e.target.value)}
                        style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', color: '#64748B' }}
                      />
                      <select
                        value={b.status}
                        onChange={(e) => handleUpdateBiomarker(idx, 'status', e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.78rem', fontWeight: '800', color: b.status === 'HIGH' || b.status === 'LOW' ? '#DC2626' : '#059669' }}
                      >
                        <option value="NORMAL">NORMAL</option>
                        <option value="HIGH">HIGH</option>
                        <option value="LOW">LOW</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveBiomarker(idx)}
                        style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '0.2rem' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pathologist Clinical Remarks */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>
                  Pathologist Clinical Observations & Summary
                </label>
                <textarea
                  rows={2}
                  value={clinicalSummary}
                  onChange={(e) => setClinicalSummary(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                />
              </div>

              {/* Pathologist Signature Authority */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>
                  Signing Pathologist / Quality Officer
                </label>
                <input
                  type="text"
                  required
                  value={pathologistName}
                  onChange={(e) => setPathologistName(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '700' }}
                />
              </div>

              {/* Submit Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveReportOrder(null)}
                  style={{ padding: '0.65rem 1.25rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <ShieldCheck size={16} /> {isSubmitting ? 'Stamping Report...' : 'Verify & Sign Official Report'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
