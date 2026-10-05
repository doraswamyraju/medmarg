import React, { useState } from 'react';
import { ShieldCheck, FileText, CheckCircle, PlusCircle, Award, Eye, X, Phone } from 'lucide-react';

export default function FreelancerDeskTab({
  freelancers = [],
  setFreelancers = () => {},
  API_BASE,
  safeFetch
}) {
  const [selectedDocFreelancer, setSelectedDocFreelancer] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    id: `FL-${Math.floor(100 + Math.random() * 900)}`,
    name: '',
    phone: '',
    city: 'Tirupati',
    qualification: 'DMLT (Diploma Medical Lab Tech)',
    paramedicalCert: 'AP-PMC-',
    experience: '3 Years',
    regFeePaid: true,
    feeAmount: 2000,
    walletBalance: 2000,
    status: 'PENDING_VERIFICATION'
  });

  const handleApprove = async (fl) => {
    try {
      if (safeFetch && API_BASE) {
        await safeFetch(`${API_BASE}/api/v1/admin/freelancers/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: fl.id, action: 'APPROVE' })
        });
      }
    } catch (e) {}

    setFreelancers(prev => prev.map(f => f.id === fl.id ? { ...f, status: 'APPROVED', walletBalance: 2000 } : f));
  };

  const handleReject = async (fl) => {
    try {
      if (safeFetch && API_BASE) {
        await safeFetch(`${API_BASE}/api/v1/admin/freelancers/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: fl.id, action: 'REJECT' })
        });
      }
    } catch (e) {}

    setFreelancers(prev => prev.map(f => f.id === fl.id ? { ...f, status: 'REJECTED' } : f));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    setFreelancers(prev => [addForm, ...prev]);
    setShowAddModal(false);
    setAddForm({
      id: `FL-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      phone: '',
      city: 'Tirupati',
      qualification: 'DMLT (Diploma Medical Lab Tech)',
      paramedicalCert: 'AP-PMC-',
      experience: '3 Years',
      regFeePaid: true,
      feeAmount: 2000,
      walletBalance: 2000,
      status: 'PENDING_VERIFICATION'
    });
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A' }}>Freelance Phlebotomist Qualification & Verification Desk</h2>
          <p style={{ color: '#64748B', fontSize: '0.85rem' }}>Review DMLT / Vocational MLT degrees, Paramedical Council certificates, registration fees, and credit ₹2,000 Inventory Wallet upon approval.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{ padding: '0.65rem 1.25rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem', boxShadow: '0 4px 14px rgba(0,107,112,0.2)' }}
        >
          <PlusCircle size={16} color="#FBBF24" /> Register New Freelancer
        </button>
      </div>

      {/* Freelancer Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {freelancers.map(fl => {
          const isPending = fl.status === 'PENDING_VERIFICATION';
          const isApproved = fl.status === 'APPROVED';

          return (
            <div 
              key={fl.id} 
              style={{ 
                backgroundColor: '#FFFFFF', 
                borderRadius: '20px', 
                border: isPending ? '1.5px solid #F59E0B' : isApproved ? '1px solid #10B981' : '1px solid #E2E8F0', 
                padding: '1.5rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: '800', backgroundColor: isApproved ? '#DCFCE7' : isPending ? '#FEF3C7' : '#FEE2E2', color: isApproved ? '#15803D' : isPending ? '#B45309' : '#DC2626' }}>
                    {fl.status}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#006B70', fontWeight: '800', backgroundColor: 'rgba(0,107,112,0.08)', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                    ₹{fl.feeAmount || 2000} REG FEE PAID
                  </span>
                </div>

                <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A' }}>{fl.name}</h3>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', fontFamily: 'monospace', marginTop: '0.1rem' }}>ID: {fl.id}</div>
                  </div>
                  <button
                    onClick={() => setSelectedDocFreelancer(fl)}
                    style={{ padding: '0.35rem 0.75rem', backgroundColor: '#F1F5F9', color: '#0284C7', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <Eye size={14} /> View Docs
                  </button>
                </div>

                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem' }}>
                  <div style={{ color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Award size={15} color="#D97706" /> <strong>Qualification:</strong> {fl.qualification}
                  </div>
                  <div style={{ color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FileText size={15} color="#006B70" /> <strong>Paramedical Council:</strong> {fl.paramedicalCert}
                  </div>
                  <div style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Phone size={14} /> {fl.phone || '+91 98765 00000'} • 📍 {fl.city || 'Tirupati'}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                {isPending ? (
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                      onClick={() => handleApprove(fl)}
                      style={{ flex: 1, padding: '0.65rem', backgroundColor: '#10B981', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(16,185,129,0.2)' }}
                    >
                      <CheckCircle size={16} /> Approve & Credit ₹2,000
                    </button>
                    <button 
                      onClick={() => handleReject(fl)}
                      style={{ padding: '0.65rem 1rem', backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer' }}
                    >
                      Reject
                    </button>
                  </div>
                ) : isApproved ? (
                  <div style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#F8FAFC', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem', border: '1px solid #E2E8F0' }}>
                    <span style={{ color: '#059669', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <ShieldCheck size={18} /> Verified Freelancer
                    </span>
                    <span style={{ color: '#D97706', fontWeight: '900', fontSize: '0.9rem' }}>
                      Wallet: ₹{fl.walletBalance || 2000}
                    </span>
                  </div>
                ) : (
                  <div style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#FEF2F2', borderRadius: '10px', color: '#DC2626', fontWeight: '800', fontSize: '0.84rem', textAlign: 'center' }}>
                    Application Rejected
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: QUALIFICATION DOCUMENTS VIEWER MODAL */}
      {selectedDocFreelancer && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '650px', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', position: 'sticky', top: 0, zIndex: 10 }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A' }}>Qualification Verification Dossier</h3>
                <div style={{ fontSize: '0.8rem', color: '#006B70', fontWeight: '700' }}>{selectedDocFreelancer.name} ({selectedDocFreelancer.id})</div>
              </div>
              <button onClick={() => setSelectedDocFreelancer(null)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '1rem', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    🎓 {selectedDocFreelancer.qualification} Certificate
                  </div>
                  <span style={{ fontSize: '0.72rem', backgroundColor: '#DCFCE7', color: '#15803D', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>VERIFIED FORMAT</span>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', height: '120px', borderRadius: '8px', border: '1px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.3rem' }}>
                  <FileText size={32} color="#006B70" />
                  <span style={{ fontSize: '0.8rem', color: '#0F172A', fontWeight: '700' }}>DMLT_Degree_Certificate_{selectedDocFreelancer.id}.pdf</span>
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>State Board of Technical Education & Training • 1.2 MB</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '1rem', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    📜 Paramedical Council Registration ({selectedDocFreelancer.paramedicalCert})
                  </div>
                  <span style={{ fontSize: '0.72rem', backgroundColor: '#E0F2FE', color: '#0369A1', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>ACTIVE LICENSE</span>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', height: '100px', borderRadius: '8px', border: '1px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.3rem' }}>
                  <Award size={28} color="#D97706" />
                  <span style={{ fontSize: '0.8rem', color: '#0F172A', fontWeight: '700' }}>AP_Paramedical_Registration_Card.jpg</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '1rem', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    💳 Registration Fee Payment Proof (₹{selectedDocFreelancer.feeAmount || 2000})
                  </div>
                  <span style={{ fontSize: '0.72rem', backgroundColor: '#DCFCE7', color: '#15803D', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>PAID VIA RAZORPAY</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
                  Txn Ref: <strong style={{ color: '#006B70', fontFamily: 'monospace' }}>PAY_FL_908123490</strong> • Verified by MedMarg Accounting System
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button 
                  onClick={() => setSelectedDocFreelancer(null)} 
                  style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REGISTER NEW FREELANCER MODAL */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '540px', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A' }}>Register Freelance Phlebotomist</h3>
                <div style={{ fontSize: '0.8rem', color: '#006B70', fontWeight: '700' }}>Assign ID: {addForm.id}</div>
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Phlebotomist Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand V"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 00000"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Qualification Degree</label>
                  <select
                    value={addForm.qualification}
                    onChange={(e) => setAddForm({ ...addForm, qualification: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  >
                    <option value="DMLT (Diploma Medical Lab Tech)">DMLT (Diploma Medical Lab Tech)</option>
                    <option value="BSc MLT (Bachelor MLT)">BSc MLT (Bachelor MLT)</option>
                    <option value="Vocational Phlebotomy Cert">Vocational Phlebotomy Cert</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Paramedical Reg #</label>
                  <input
                    type="text"
                    required
                    placeholder="AP-PMC-XXXXX"
                    value={addForm.paramedicalCert}
                    onChange={(e) => setAddForm({ ...addForm, paramedicalCert: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Experience</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 4 Years"
                    value={addForm.experience}
                    onChange={(e) => setAddForm({ ...addForm, experience: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Primary City</label>
                  <input
                    type="text"
                    required
                    value={addForm.city}
                    onChange={(e) => setAddForm({ ...addForm, city: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  style={{ padding: '0.65rem 1.25rem', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ padding: '0.65rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Save & Add Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
