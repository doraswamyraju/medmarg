import React, { useState } from 'react';
import { 
  AlertTriangle, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  HelpCircle 
} from 'lucide-react';
import { API_BASE, safeFetch } from '../../data/apiConfig';

export default function OrderCancelModal({
  isOpen,
  onClose,
  order,
  onCancelSuccess = () => {}
}) {
  if (!isOpen || !order) return null;

  const [reason, setReason] = useState('Doctor altered diagnostic prescription');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const cancellationReasons = [
    'Doctor altered diagnostic prescription',
    'Already tested at another hospital/clinic',
    'Unable to fast for the required 10-12 hours',
    'Traveling outside Tirupati unexpectedly',
    'Selected wrong test or package by mistake',
    'Other reason'
  ];

  const handleCancel = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await safeFetch(`${API_BASE}/api/v1/admin/orders/${encodeURIComponent(order.id)}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: `${reason}${comments ? ` - ${comments}` : ''}`
        })
      });

      const data = await res.json();
      if (data.success) {
        onCancelSuccess(data.order);
        onClose();
      } else {
        setErrorMsg(data.error || 'Failed to cancel order');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Connection error while cancelling order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1.5rem'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        width: '480px',
        maxWidth: '100%',
        boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)',
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        animation: 'fadeIn 0.15s ease-out'
      }}>
        
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: '#7F1D1D',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <AlertTriangle size={20} color="#FCA5A5" />
            <div>
              <div style={{ fontSize: '1rem', fontWeight: '900' }}>Cancel Diagnostic Order</div>
              <div style={{ fontSize: '0.74rem', color: '#FECACA' }}>Order #{order.id}</div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#FCA5A5',
              cursor: 'pointer',
              fontSize: '1.3rem',
              fontWeight: '900',
              lineHeight: 1
            }}
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleCancel} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {errorMsg && (
            <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #F87171', color: '#991B1B', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.84rem', fontWeight: '700' }}>
              {errorMsg}
            </div>
          )}

          <div style={{ backgroundColor: '#FEF2F2', padding: '1rem', borderRadius: '12px', border: '1px solid #FECACA', color: '#991B1B', fontSize: '0.84rem', lineHeight: 1.5 }}>
            <strong>Refund & Phlebotomist Policy:</strong> If prepaid via UPI/Gateway, a 100% refund will be credited back to your original source account within 24-48 hours.
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#334155', marginBottom: '0.45rem' }}>
              PLEASE SELECT REASON FOR CANCELLATION *
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {cancellationReasons.map((r, idx) => (
                <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.5rem 0.75rem', borderRadius: '8px', border: reason === r ? '1.5px solid #DC2626' : '1px solid #E2E8F0', backgroundColor: reason === r ? '#FEF2F2' : '#FFFFFF', cursor: 'pointer', fontSize: '0.84rem', fontWeight: '700', color: reason === r ? '#991B1B' : '#334155' }}>
                  <input
                    type="radio"
                    name="cancelReason"
                    checked={reason === r}
                    onChange={() => setReason(r)}
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#334155', marginBottom: '0.35rem' }}>
              ADDITIONAL FEEDBACK (OPTIONAL)
            </label>
            <textarea
              rows={2}
              placeholder="Tell us what went wrong so we can improve..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem', outline: 'none' }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#F1F5F9',
                color: '#475569',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Keep Order Active
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1.5,
                padding: '0.75rem',
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '900',
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(220,38,38,0.3)'
              }}
            >
              {loading ? 'Cancelling...' : 'Confirm Order Cancellation'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
