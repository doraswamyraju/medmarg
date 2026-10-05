import React from 'react';
import { ShieldCheck, DollarSign, CheckCircle } from 'lucide-react';

export default function ExtraUsageWaiversSubTab({
  extraUsages = [],
  onDecideExtraUsage = () => {}
}) {
  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', backgroundColor: '#FDF2F8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={20} color="#DB2777" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#831843', margin: 0 }}>
            Extra Consumable Usage & Clinical Waiver Review Desk
          </h3>
        </div>
        <p style={{ fontSize: '0.82rem', color: '#9D174D', margin: '0.35rem 0 0 0', lineHeight: 1.4 }}>
          When phlebotomists encounter difficult veins, pediatric draws, or accidental vacuum issues, they report extra swabs or needles used. 
          <br />
          <strong>Admin Decision Authority:</strong> You can approve as <strong>"Allowed Clinical Waste / Waiver" (No charge to agent)</strong> or mark as <strong>"Billable Excess" (Deducted from Agent Wallet)</strong>.
        </p>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
            <th style={{ padding: '0.85rem 1.25rem' }}>Report ID / Order</th>
            <th style={{ padding: '0.85rem' }}>Phlebotomist</th>
            <th style={{ padding: '0.85rem' }}>Extra Consumables Used</th>
            <th style={{ padding: '0.85rem' }}>Reported Clinical Reason</th>
            <th style={{ padding: '0.85rem' }}>Cost Value</th>
            <th style={{ padding: '0.85rem' }}>Decision Status</th>
            <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Admin Action</th>
          </tr>
        </thead>
        <tbody>
          {extraUsages.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
              <td style={{ padding: '1rem 1.25rem' }}>
                <div style={{ fontWeight: '800', color: '#DB2777', fontFamily: 'monospace' }}>{u.id}</div>
                <div style={{ fontSize: '0.75rem', color: '#006B70', fontWeight: '700' }}>Order: {u.orderId}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Patient: {u.patientName}</div>
                <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{u.reportedAt}</div>
              </td>
              <td style={{ padding: '1rem' }}>
                <div style={{ fontWeight: '800', color: '#0F172A' }}>{u.agentName}</div>
                <div style={{ fontSize: '0.72rem', color: u.agentType === 'FREELANCE' ? '#7C3AED' : '#0284C7', fontWeight: '800' }}>
                  {u.agentType === 'FREELANCE' ? '⚡ Gig Freelancer' : '🛵 Salaried Staff'}
                </div>
              </td>
              <td style={{ padding: '1rem' }}>
                {u.itemsUsed.map((it, idx) => (
                  <div key={idx} style={{ fontSize: '0.78rem', color: '#0F172A', fontWeight: '700' }}>
                    • {it.qty}x {it.name} (₹{it.unitPrice} ea)
                  </div>
                ))}
              </td>
              <td style={{ padding: '1rem', maxWidth: '280px', color: '#334155', fontSize: '0.8rem', fontStyle: 'italic', lineHeight: 1.3 }}>
                "{u.phleboReason}"
              </td>
              <td style={{ padding: '1rem', fontWeight: '900', color: '#0F172A' }}>
                ₹{u.totalValue.toFixed(2)}
              </td>
              <td style={{ padding: '1rem' }}>
                {u.decision === 'PENDING' && (
                  <span style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', borderRadius: '6px', fontWeight: '800', backgroundColor: '#FEF3C7', color: '#B45309' }}>
                    ⏳ PENDING DECISION
                  </span>
                )}
                {u.decision === 'WAIVED_CLINICAL_BUFFER' && (
                  <span style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', borderRadius: '6px', fontWeight: '800', backgroundColor: '#DCFCE7', color: '#15803D', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle size={12} /> ALLOWED WASTE (WAIVER)
                  </span>
                )}
                {u.decision === 'CHARGED_AGENT' && (
                  <span style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', borderRadius: '6px', fontWeight: '800', backgroundColor: '#FEE2E2', color: '#991B1B', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <DollarSign size={12} /> BILLED TO AGENT WALLET
                  </span>
                )}
                {u.decisionNotes && (
                  <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '0.25rem' }}>
                    Note: {u.decisionNotes}
                  </div>
                )}
              </td>
              <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                {u.decision === 'PENDING' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'flex-end' }}>
                    <button
                      onClick={() => onDecideExtraUsage(u.id, 'WAIVED_CLINICAL_BUFFER')}
                      style={{ padding: '0.35rem 0.75rem', backgroundColor: '#059669', color: '#FFF', border: 'none', borderRadius: '6px', fontSize: '0.74rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', width: 'max-content' }}
                    >
                      <ShieldCheck size={12} /> Approve as Allowed Waste
                    </button>
                    <button
                      onClick={() => onDecideExtraUsage(u.id, 'CHARGED_AGENT')}
                      style={{ padding: '0.35rem 0.75rem', backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '6px', fontSize: '0.74rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', width: 'max-content' }}
                    >
                      <DollarSign size={12} /> Mark Billable to Agent
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>Reviewed by {u.decidedBy}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
