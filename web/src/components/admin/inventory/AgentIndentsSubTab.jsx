import React from 'react';
import { PackageCheck, Plus, CheckCircle } from 'lucide-react';

export default function AgentIndentsSubTab({
  indents = [],
  onApproveIndent = () => {},
  onOpenCreateIndent = () => {}
}) {
  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <PackageCheck size={18} color="#D97706" /> Agent Supply Indent Requests & Approvals
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
            Review replenishment requests from Salaried Phlebotomists and Gig Freelancers. Approving automatically deducts central stock.
          </p>
        </div>

        <button
          onClick={onOpenCreateIndent}
          style={{ padding: '0.55rem 1.1rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={15} /> Raise Manual Indent
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
            <th style={{ padding: '0.85rem 1.25rem' }}>Indent ID</th>
            <th style={{ padding: '0.85rem' }}>Phlebotomist / Agent</th>
            <th style={{ padding: '0.85rem' }}>Requested Consumables</th>
            <th style={{ padding: '0.85rem' }}>Cost & Deduction Model</th>
            <th style={{ padding: '0.85rem' }}>Request Date</th>
            <th style={{ padding: '0.85rem' }}>Status</th>
            <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {indents.map(ind => (
            <tr key={ind.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
              <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', color: '#006B70', fontWeight: '800' }}>
                {ind.id}
              </td>
              <td style={{ padding: '1rem' }}>
                <div style={{ fontWeight: '800', color: '#0F172A' }}>{ind.agentName}</div>
                <div style={{ fontSize: '0.72rem', color: ind.agentType === 'FREELANCE_AGENT' ? '#7C3AED' : '#0284C7', fontWeight: '700' }}>
                  {ind.agentType === 'FREELANCE_AGENT' ? '⚡ Freelance Agent' : '🛵 Salaried Fleet'} • {ind.area}
                </div>
              </td>
              <td style={{ padding: '1rem', color: '#334155', fontWeight: '700' }}>
                {ind.requestedItems}
              </td>
              <td style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#475569', backgroundColor: '#F1F5F9', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '700' }}>
                  {ind.paymentMode}
                </span>
              </td>
              <td style={{ padding: '1rem', color: '#64748B', fontSize: '0.8rem' }}>
                {ind.date}
              </td>
              <td style={{ padding: '1rem' }}>
                <span style={{
                  fontSize: '0.72rem',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  fontWeight: '800',
                  backgroundColor: ind.status === 'APPROVED_DISPATCHED' ? '#DCFCE7' : '#FEF3C7',
                  color: ind.status === 'APPROVED_DISPATCHED' ? '#15803D' : '#B45309'
                }}>
                  {ind.status === 'APPROVED_DISPATCHED' ? 'DISPATCHED' : 'PENDING APPROVAL'}
                </span>
              </td>
              <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                {ind.status === 'PENDING_APPROVAL' ? (
                  <button
                    onClick={() => onApproveIndent(ind)}
                    style={{ padding: '0.45rem 0.9rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <CheckCircle size={14} color="#FBBF24" /> Approve & Dispatch
                  </button>
                ) : (
                  <span style={{ color: '#059669', fontSize: '0.8rem', fontWeight: '800' }}>✓ Handed Over</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
