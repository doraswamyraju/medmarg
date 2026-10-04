import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function FreelancerDeskTab({
  freelancers,
  setFreelancers,
  API_BASE,
  safeFetch
}) {
  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#FFF' }}>Freelance Phlebotomist Qualification & Verification Desk</h2>
        <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Review DMLT / Vocational MLT degrees, Paramedical Council certificates, and credit ₹2,000 Inventory Wallet upon approval.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {freelancers.map(fl => (
          <div key={fl.id} style={{ backgroundColor: '#1E293B', borderRadius: '20px', border: fl.status === 'PENDING_VERIFICATION' ? '1.5px solid #F59E0B' : '1px solid #334155', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '800', backgroundColor: fl.status === 'APPROVED' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', color: fl.status === 'APPROVED' ? '#34D399' : '#FBBF24' }}>
                {fl.status}
              </span>
              <span style={{ fontSize: '0.78rem', color: '#67E8F9', fontWeight: '800' }}>Registration Fee: ₹{fl.feeAmount} PAID</span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#FFF', marginTop: '0.5rem' }}>{fl.name}</h3>
            <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '0.2rem' }}>🎓 {fl.qualification} • {fl.experience}</div>
            <div style={{ fontSize: '0.82rem', color: '#CBD5E1', marginTop: '0.2rem' }}>📜 Paramedical Reg: {fl.paramedicalCert}</div>

            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
              {fl.status === 'PENDING_VERIFICATION' ? (
                <>
                  <button 
                    onClick={async () => {
                      try {
                        await safeFetch(`${API_BASE}/api/v1/admin/freelancers/verify`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id: fl.id, action: 'APPROVE' })
                        });
                      } catch (e) {}
                      setFreelancers(prev => prev.map(f => f.id === fl.id ? { ...f, status: 'APPROVED', walletBalance: 2000 } : f));
                    }}
                    style={{ flex: 1, padding: '0.65rem', backgroundColor: '#10B981', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    Approve & Credit ₹2,000 Wallet
                  </button>
                  <button 
                    onClick={async () => {
                      try {
                        await safeFetch(`${API_BASE}/api/v1/admin/freelancers/verify`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id: fl.id, action: 'REJECT' })
                        });
                      } catch (e) {}
                      setFreelancers(prev => prev.map(f => f.id === fl.id ? { ...f, status: 'REJECTED' } : f));
                    }}
                    style={{ padding: '0.65rem 1rem', backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    Reject
                  </button>
                </>
              ) : (
                <div style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0F172A', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                  <span style={{ color: '#34D399', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><ShieldCheck size={16} /> Verified Freelancer</span>
                  <span style={{ color: '#FBBF24', fontWeight: '800' }}>Wallet: ₹{fl.walletBalance}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
