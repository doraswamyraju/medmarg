import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import { API_BASE, safeFetch } from '../../data/apiConfig';

export default function OrderRescheduleModal({
  isOpen,
  onClose,
  order,
  onRescheduleSuccess = () => {}
}) {
  if (!isOpen || !order) return null;

  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  
  const [selectedSlot, setSelectedSlot] = useState(order.slot || '07:00 AM - 08:00 AM');
  const [reason, setReason] = useState('Change of morning availability');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const slotOptions = [
    { time: '06:00 AM - 07:00 AM', tag: 'Fastest Fasting' },
    { time: '07:00 AM - 08:00 AM', tag: 'Popular Slot' },
    { time: '08:00 AM - 09:00 AM', tag: 'Comfort Morning' },
    { time: '09:00 AM - 10:00 AM', tag: 'Standard' },
    { time: '10:00 AM - 11:30 AM', tag: 'Late Morning' },
    { time: '04:00 PM - 05:30 PM', tag: 'Non-Fasting Tests Only' }
  ];

  const handleReschedule = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await safeFetch(`${API_BASE}/api/v1/admin/orders/${encodeURIComponent(order.id)}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          slot: selectedSlot,
          reason
        })
      });

      const data = await res.json();
      if (data.success) {
        onRescheduleSuccess(data.order);
        onClose();
      } else {
        setErrorMsg(data.error || 'Failed to reschedule order');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Connection error while rescheduling');
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
        width: '520px',
        maxWidth: '100%',
        boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)',
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        animation: 'fadeIn 0.15s ease-out'
      }}>
        
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: '#071F1A',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Calendar size={20} color="#FBBF24" />
            <div>
              <div style={{ fontSize: '1rem', fontWeight: '900' }}>Reschedule Phlebotomist Pickup</div>
              <div style={{ fontSize: '0.74rem', color: '#80CBC4' }}>Order #{order.id}</div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
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
        <form onSubmit={handleReschedule} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {errorMsg && (
            <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #F87171', color: '#991B1B', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.84rem', fontWeight: '700' }}>
              {errorMsg}
            </div>
          )}

          {/* Current Schedule Summary */}
          <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>CURRENT SCHEDULE</div>
              <div style={{ fontSize: '0.9rem', fontWeight: '900', color: '#0F172A', marginTop: '0.15rem' }}>
                {order.date} • {order.slot}
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', backgroundColor: '#E0F2F1', color: '#006B70', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '800' }}>
              Free Rescheduling
            </span>
          </div>

          {/* Date Picker */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#334155', marginBottom: '0.45rem' }}>
              SELECT NEW COLLECTION DATE *
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                border: '1.5px solid #CBD5E1',
                fontSize: '0.9rem',
                fontWeight: '700',
                outline: 'none'
              }}
            />
          </div>

          {/* Morning Fasting Slot Picker */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#334155', marginBottom: '0.45rem' }}>
              SELECT PREFERRED TIME WINDOW *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {slotOptions.map((opt, idx) => {
                const isSel = selectedSlot === opt.time;
                return (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setSelectedSlot(opt.time)}
                    style={{
                      padding: '0.65rem 0.75rem',
                      borderRadius: '10px',
                      border: isSel ? '2px solid #006B70' : '1.5px solid #E2E8F0',
                      backgroundColor: isSel ? '#E0F2F1' : '#FFFFFF',
                      color: isSel ? '#006B70' : '#1E293B',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontSize: '0.82rem', fontWeight: '800' }}>{opt.time}</div>
                    <div style={{ fontSize: '0.68rem', color: isSel ? '#0F766E' : '#64748B', fontWeight: '700', marginTop: '0.1rem' }}>
                      {opt.tag}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#334155', marginBottom: '0.45rem' }}>
              REASON FOR RESCHEDULING
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                border: '1.5px solid #CBD5E1',
                fontSize: '0.86rem',
                outline: 'none'
              }}
            >
              <option value="Change of morning availability">Change of morning availability</option>
              <option value="Not fasted 10-12 hours yet">Not fasted 10-12 hours yet</option>
              <option value="Family member traveling">Family member traveling</option>
              <option value="Doctor suggested different testing day">Doctor suggested different testing day</option>
              <option value="Other personal reasons">Other personal reasons</option>
            </select>
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
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 2,
                padding: '0.75rem',
                backgroundColor: '#006B70',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '900',
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,107,112,0.3)'
              }}
            >
              {loading ? 'Confirming Reschedule...' : 'Confirm New Time Slot'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
