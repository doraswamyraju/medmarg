import React, { useState } from 'react';
import { Zap, MapPin, Clock, AlertCircle, CheckCircle2, ShieldAlert, ArrowRight, DollarSign, Sparkles } from 'lucide-react';

export default function PhlebotomistBroadcastJobsTab({ jobs = [], onClaimJob, isClaiming }) {
  const [claimedJobs, setClaimedJobs] = useState(new Set());

  const handleClaim = (job) => {
    setClaimedJobs(prev => new Set([...prev, job.id]));
    if (onClaimJob) {
      onClaimJob(job);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Zap size={14} /> LIVE OVERFLOW MARKETPLACE
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700' }}>First-to-Claim Wins</span>
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A', marginTop: '0.25rem' }}>
            Broadcast Sample Pickups ({jobs.length} Available)
          </h3>
        </div>
        
        <div style={{ backgroundColor: '#F1F5F9', padding: '0.5rem 1rem', borderRadius: '12px', fontSize: '0.82rem', color: '#475569', fontWeight: '800' }}>
          ⚡ Push Notifications Active • Auto-Refresh (5s)
        </div>
      </div>

      {jobs.length === 0 ? (
        <div style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '3rem 2rem', textAlign: 'center', border: '1px dashed #CBD5E1' }}>
          <CheckCircle2 size={42} color="#059669" style={{ margin: '0 auto 0.75rem' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>No Open Broadcast Pickups Right Now</h4>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.3rem' }}>
            All assigned fleet routes are currently balanced. New overflow jobs will automatically appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {jobs.map(job => {
            const isClaimed = claimedJobs.has(job.id);
            return (
              <div 
                key={job.id} 
                style={{ 
                  backgroundColor: '#FFFFFF', 
                  borderRadius: '20px', 
                  padding: '1.5rem', 
                  border: isClaimed ? '2px solid #059669' : '1.5px solid #E2E8F0',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <span style={{ 
                      backgroundColor: '#ECFDF5', 
                      color: '#065F46', 
                      padding: '0.3rem 0.75rem', 
                      borderRadius: '8px', 
                      fontWeight: '900', 
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      <Sparkles size={15} color="#059669" /> Earn ₹{job.payout}
                    </span>

                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '800', backgroundColor: '#F8FAFC', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                      📍 {job.distance || '2.5 km away'}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A' }}>
                    {job.patientName} <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '700' }}>({job.age})</span>
                  </h4>

                  <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={14} color="#006B70" /> {job.address}
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#1E293B', fontWeight: '800', marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={14} color="#F59E0B" /> {job.timeSlot}
                  </div>

                  <div style={{ marginTop: '0.75rem', backgroundColor: '#F8FAFC', padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Prescribed Tests</div>
                    <div style={{ fontSize: '0.82rem', color: '#004D40', fontWeight: '900', marginTop: '0.15rem' }}>{job.tests}</div>
                  </div>

                  {job.fastingRequired && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#B45309', fontWeight: '800' }}>
                      <AlertCircle size={13} /> 10-12 Hrs Fasting Mandatory
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
                  {isClaimed ? (
                    <div style={{ padding: '0.75rem', backgroundColor: '#D1FAE5', color: '#065F46', borderRadius: '12px', fontWeight: '900', fontSize: '0.88rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                      <CheckCircle2 size={18} /> Job Claimed & Added to Roster!
                    </div>
                  ) : (
                    <button
                      onClick={() => handleClaim(job)}
                      disabled={isClaiming}
                      style={{
                        width: '100%',
                        padding: '0.8rem',
                        backgroundColor: '#006B70',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '900',
                        fontSize: '0.92rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 12px rgba(0,107,112,0.25)'
                      }}
                    >
                      <Zap size={17} /> ⚡ Claim Order Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
