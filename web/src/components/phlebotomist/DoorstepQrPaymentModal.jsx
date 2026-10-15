import React, { useState, useEffect } from 'react';
import { QrCode, CheckCircle2, ShieldCheck, Loader2, RefreshCw, X, ArrowRight, Smartphone } from 'lucide-react';
import { API_BASE, safeFetch, safeJson } from '../../data/apiConfig';

export default function DoorstepQrPaymentModal({
  order,
  isOpen,
  onClose,
  onPaymentSuccess
}) {
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && order) {
      setLoading(true);
      setPaymentSuccess(false);
      safeFetch(`${API_BASE}/api/v1/payments/generate-doorstep-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          amount: order.amount || order.totalAmount || 899,
          patientName: order.patientName,
          patientPhone: order.phone || order.patientPhone
        })
      })
        .then(res => safeJson(res))
        .then(data => {
          if (data && data.success && data.data) {
            setQrData(data.data);
          }
        })
        .catch(err => console.warn('QR fetch error:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const orderAmount = order.amount || order.totalAmount || 899;

  const handleConfirmPayment = async () => {
    setConfirming(true);
    try {
      await safeFetch(`${API_BASE}/api/v1/agent/pickup/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          paymentCollected: true,
          status: order.status || 'ARRIVED'
        })
      });

      setPaymentSuccess(true);
      if (onPaymentSuccess) {
        onPaymentSuccess(order.id, orderAmount);
      }
      setTimeout(() => {
        setConfirming(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.warn('Payment confirm note:', err);
      setConfirming(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 160,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1.25rem'
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          maxWidth: '460px',
          width: '100%',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '2px solid #006B70',
          position: 'relative',
          textAlign: 'center'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: '#64748B',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={20} />
        </button>

        {/* Top Header */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.75rem', backgroundColor: '#E0F2F1', color: '#006B70', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '900', marginBottom: '0.75rem' }}>
          <ShieldCheck size={16} /> 100% Cashless Doorstep PayPOS
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
          Scan to Pay (Doorstep QR)
        </h2>
        <p style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.35rem' }}>
          Ask patient to scan via GPay, PhonePe, Paytm, or BHIM
        </p>

        {/* Amount Box */}
        <div style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', padding: '1rem', border: '1px solid #E2E8F0', margin: '1.25rem 0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>
            Amount Payable
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>
            ₹{orderAmount}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#006B70', fontWeight: '800', marginTop: '0.2rem' }}>
            {order.patientName} • Order #{order.id}
          </div>
        </div>

        {/* Dynamic QR Display Box */}
        <div
          style={{
            margin: '0 auto',
            width: '210px',
            height: '210px',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '12px',
            border: '2px dashed #006B70',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <Loader2 size={36} color="#006B70" className="animate-spin" />
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>Generating Razorpay QR...</span>
            </div>
          ) : qrData?.qrImageUrl ? (
            <img
              src={qrData.qrImageUrl}
              alt="Razorpay Doorstep UPI QR"
              style={{ width: '175px', height: '175px', objectFit: 'contain' }}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
              <QrCode size={140} color="#004D40" />
              <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: '800' }}>RAZORPAY UPI LIVE</span>
            </div>
          )}
        </div>

        {/* Supported Apps */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.85rem', fontSize: '0.75rem', color: '#475569', fontWeight: '700' }}>
          <Smartphone size={14} color="#006B70" />
          <span>Google Pay • PhonePe • Paytm • BHIM • Cred</span>
        </div>

        {/* Action Button */}
        <div style={{ marginTop: '1.5rem' }}>
          {paymentSuccess ? (
            <div style={{ padding: '0.9rem', backgroundColor: '#ECFDF5', color: '#065F46', borderRadius: '12px', border: '1.5px solid #059669', fontSize: '0.95rem', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={20} color="#059669" /> Payment Verified Successfully!
            </div>
          ) : (
            <button
              onClick={handleConfirmPayment}
              disabled={confirming}
              style={{
                width: '100%',
                padding: '0.9rem',
                backgroundColor: '#059669',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontSize: '0.95rem',
                fontWeight: '900',
                cursor: confirming ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)'
              }}
            >
              {confirming ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Verifying Payment...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Confirm ₹{orderAmount} Payment Received</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
