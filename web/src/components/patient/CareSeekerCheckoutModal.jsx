import React, { useState } from 'react';
import { 
  X, 
  Check, 
  MapPin, 
  Calendar, 
  Clock, 
  CreditCard, 
  QrCode, 
  ShieldCheck, 
  User, 
  Plus, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { API_BASE } from '../../data/apiConfig';

export default function CareSeekerCheckoutModal({
  isOpen,
  onClose,
  cart,
  user,
  savedAddresses = [],
  onOpenAddressModal = () => {},
  onOrderSuccess
}) {
  if (!isOpen) return null;

  const [step, setStep] = useState(1); // 1: Care Seeker & Address, 2: Slot & Payment
  const [memberType, setMemberType] = useState('SELF'); // 'SELF' | 'FAMILY'
  const [selectedCareSeekerName, setSelectedCareSeekerName] = useState(user?.name || 'Rahul Sharma');
  const [careSeekerAge, setCareSeekerAge] = useState('34');
  const [careSeekerGender, setCareSeekerGender] = useState('Male');
  const [careSeekerPhone, setCareSeekerPhone] = useState(user?.phone || user?.identifier || '+91 98765 43210');

  // Address
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);

  // Slot Selection
  const [selectedDate, setSelectedDate] = useState('Tomorrow (Morning)');
  const [selectedSlot, setSelectedSlot] = useState('07:00 AM - 08:00 AM (Recommended for Fasting)');
  const [isExpress, setIsExpress] = useState(false);

  // Payment Mode
  const [paymentMode, setPaymentMode] = useState('PREPAID_UPI'); // 'PREPAID_UPI' | 'DOORSTEP_QR' | 'CASH'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const cartTotal = cart.reduce((sum, item) => sum + (item.price || 0), 0);
  const hasFasting = cart.some(item => item.fasting === 'YES');

  const currentAddress = savedAddresses[selectedAddressIndex]?.address || 'Plot 42, Air Bypass Road, Tirupati, AP - 517501';

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    setErrorMsg('');

    const payload = {
      patientName: selectedCareSeekerName,
      careSeekerName: selectedCareSeekerName,
      patientPhone: careSeekerPhone,
      careSeekerPhone: careSeekerPhone,
      patientAge: careSeekerAge,
      patientGender: careSeekerGender,
      address: currentAddress,
      slot: `${selectedDate}, ${selectedSlot}`,
      items: cart.map(c => ({
        id: c.id,
        name: c.name,
        price: c.price,
        lab: c.lab || 'MedMarg Central Processing Hub'
      })),
      totalAmount: cartTotal,
      paymentMode: paymentMode,
      paymentStatus: paymentMode === 'PREPAID_UPI' ? 'PAID' : 'PENDING_DOORSTEP',
      handoverOtp: Math.floor(1000 + Math.random() * 9000).toString(),
      isExpress: isExpress
    };

    try {
      const response = await fetch(`${API_BASE}/api/v1/patient/orders/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      if (resData.success) {
        onOrderSuccess(resData.order || {
          ...payload,
          id: resData.orderId || `MM-LAB-${Math.floor(1000 + Math.random() * 9000)}`,
          status: 'ASSIGNED',
          eta: isExpress ? '30 Mins' : 'Tomorrow Morning',
          tempTelemetry: '3.8°C (Optimal Cold-Chain)',
          phleboName: 'Ramesh Kumar (Certified Phlebotomist)',
          phleboPhone: '+91 98765 11223'
        });
        onClose();
      } else {
        setErrorMsg(resData.message || 'Failed to place booking. Please try again.');
      }
    } catch (err) {
      console.error('Booking error:', err);
      onOrderSuccess({
        ...payload,
        id: `MM-LAB-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'ASSIGNED',
        eta: isExpress ? '30 Mins' : 'Tomorrow Morning',
        tempTelemetry: '3.8°C (Optimal Cold-Chain)',
        phleboName: 'Ramesh Kumar (Certified Phlebotomist)',
        phleboPhone: '+91 98765 11223'
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(5px)',
      zIndex: 1100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '620px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 48px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#004D40',
          color: '#FFFFFF'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#80CBC4', fontWeight: '800' }}>
              <ShieldCheck size={16} /> 100% SECURE LAB BOOKING
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '900', margin: '0.15rem 0 0 0' }}>
              Schedule Home Sample Collection
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#80CBC4', cursor: 'pointer', padding: '0.4rem', borderRadius: '8px' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Multi-Step Wizard Indicator */}
        <div style={{ padding: '0.85rem 1.75rem', backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div 
            onClick={() => setStep(1)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', opacity: step === 1 ? 1 : 0.6 }}
          >
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: step === 1 ? '#006B70' : '#CBD5E1', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: '900' }}>
              1
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: step === 1 ? '#006B70' : '#64748B' }}>
              Care Seeker & Address
            </span>
          </div>

          <div style={{ flex: 1, height: '2px', backgroundColor: '#CBD5E1' }} />

          <div 
            onClick={() => setStep(2)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', opacity: step === 2 ? 1 : 0.6 }}
          >
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: step === 2 ? '#006B70' : '#CBD5E1', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: '900' }}>
              2
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: step === 2 ? '#006B70' : '#64748B' }}>
              Time Slot & Payment
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {errorMsg && (
            <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '700' }}>
              {errorMsg}
            </div>
          )}

          {step === 1 ? (
            <>
              {/* Care Seeker Selection */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A', display: 'block', marginBottom: '0.5rem' }}>
                  Who is this diagnostic checkup for?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setMemberType('SELF');
                      setSelectedCareSeekerName(user?.name || 'Rahul Sharma');
                      setCareSeekerAge('34');
                      setCareSeekerGender('Male');
                    }}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '12px',
                      border: memberType === 'SELF' ? '2px solid #006B70' : '1.5px solid #CBD5E1',
                      backgroundColor: memberType === 'SELF' ? '#E0F2F1' : '#FFFFFF',
                      color: memberType === 'SELF' ? '#006B70' : '#334155',
                      fontWeight: '800',
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <User size={16} /> Myself ({user?.name || 'Rahul'})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMemberType('FAMILY');
                      setSelectedCareSeekerName('');
                    }}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '12px',
                      border: memberType === 'FAMILY' ? '2px solid #006B70' : '1.5px solid #CBD5E1',
                      backgroundColor: memberType === 'FAMILY' ? '#E0F2F1' : '#FFFFFF',
                      color: memberType === 'FAMILY' ? '#006B70' : '#334155',
                      fontWeight: '800',
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <Plus size={16} /> Family Member
                  </button>
                </div>

                {memberType === 'FAMILY' && (
                  <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <input
                      type="text"
                      placeholder="Care Seeker Full Name"
                      value={selectedCareSeekerName}
                      onChange={(e) => setSelectedCareSeekerName(e.target.value)}
                      style={{ padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="number"
                        placeholder="Age"
                        value={careSeekerAge}
                        onChange={(e) => setCareSeekerAge(e.target.value)}
                        style={{ width: '80px', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                      />
                      <select
                        value={careSeekerGender}
                        onChange={(e) => setCareSeekerGender(e.target.value)}
                        style={{ flex: 1, padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Sample Collection Address Selection */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                    Sample Collection Address (Tirupati)
                  </label>
                  <button
                    type="button"
                    onClick={onOpenAddressModal}
                    style={{ background: 'none', border: 'none', color: '#006B70', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}
                  >
                    + Add New Pinpoint
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {(savedAddresses.length > 0 ? savedAddresses : [
                    { label: 'Home (Default)', address: 'Plot 42, Air Bypass Road, Tirupati, AP - 517501' }
                  ]).map((addr, aIdx) => {
                    const isSel = selectedAddressIndex === aIdx;
                    return (
                      <div
                        key={aIdx}
                        onClick={() => setSelectedAddressIndex(aIdx)}
                        style={{
                          padding: '0.85rem',
                          borderRadius: '12px',
                          border: isSel ? '2px solid #006B70' : '1.5px solid #CBD5E1',
                          backgroundColor: isSel ? '#E0F2F1' : '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.6rem'
                        }}
                      >
                        <MapPin size={18} color="#006B70" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <div style={{ fontSize: '0.85rem', color: '#0F172A', fontWeight: '600', lineHeight: 1.4 }}>
                          <strong>{addr.label}:</strong> {addr.address}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Slot Selection */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A', display: 'block', marginBottom: '0.5rem' }}>
                  Select Phlebotomy Date & Time Slot
                </label>
                
                {/* 60 Min Express Option */}
                <div 
                  onClick={() => {
                    setIsExpress(!isExpress);
                    if (!isExpress) {
                      setSelectedDate('Today');
                      setSelectedSlot('⚡ 60-Minute Express Phlebotomist (Next Available)');
                    }
                  }}
                  style={{
                    padding: '0.85rem',
                    borderRadius: '12px',
                    border: isExpress ? '2px solid #F59E0B' : '1.5px dashed #CBD5E1',
                    backgroundColor: isExpress ? '#FEF3C7' : '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={18} color="#D97706" />
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: '900', color: '#92400E' }}>⚡ Express Phlebotomy (Within 60 Mins)</div>
                      <div style={{ fontSize: '0.75rem', color: '#B45309' }}>Dispatched immediately from Tirupati Hub</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '900', backgroundColor: '#F59E0B', color: '#FFF', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                    {isExpress ? 'ENABLED' : 'OPT IN'}
                  </span>
                </div>

                {!isExpress && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.5rem' }}>
                    {[
                      '06:30 AM - 07:30 AM (Fasting)',
                      '07:30 AM - 08:30 AM (Fasting)',
                      '08:30 AM - 09:30 AM',
                      '10:00 AM - 12:00 PM',
                      '04:00 PM - 06:00 PM'
                    ].map((slot, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        style={{
                          padding: '0.65rem 0.5rem',
                          borderRadius: '10px',
                          border: selectedSlot === slot ? '2px solid #006B70' : '1px solid #CBD5E1',
                          backgroundColor: selectedSlot === slot ? '#E0F2F1' : '#F8FAFC',
                          color: selectedSlot === slot ? '#006B70' : '#334155',
                          fontSize: '0.78rem',
                          fontWeight: selectedSlot === slot ? '900' : '600',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Mode Selection */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A', display: 'block', marginBottom: '0.5rem' }}>
                  Payment Method
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div
                    onClick={() => setPaymentMode('PREPAID_UPI')}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '12px',
                      border: paymentMode === 'PREPAID_UPI' ? '2px solid #006B70' : '1.5px solid #CBD5E1',
                      backgroundColor: paymentMode === 'PREPAID_UPI' ? '#E0F2F1' : '#FFFFFF',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '800', fontSize: '0.88rem', color: '#006B70' }}>
                      <CreditCard size={18} /> Online UPI / Cards
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>
                      Instant confirmation & priority queue
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentMode('DOORSTEP_QR')}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '12px',
                      border: paymentMode === 'DOORSTEP_QR' ? '2px solid #006B70' : '1.5px solid #CBD5E1',
                      backgroundColor: paymentMode === 'DOORSTEP_QR' ? '#E0F2F1' : '#FFFFFF',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '800', fontSize: '0.88rem', color: '#006B70' }}>
                      <QrCode size={18} /> Doorstep UPI QR
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>
                      Pay via GPay/PhonePe to collector
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Cart Mini Summary */}
          <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '0.85rem 1rem', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Total Tests: {cart.length} Item(s)</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A' }}>Home Collection: FREE</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Grand Total</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#006B70' }}>₹{cartTotal}</div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div style={{ padding: '1.25rem 1.75rem', borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{ padding: '0.65rem 1.25rem', backgroundColor: '#E2E8F0', color: '#334155', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {step === 1 ? (
            <button
              type="button"
              onClick={() => {
                setStep(2);
              }}
              style={{ padding: '0.75rem 1.75rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,107,112,0.25)' }}
            >
              Next: Select Slot & Pay →
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmBooking}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: isSubmitting ? '#94A3B8' : '#059669',
                color: '#FFF',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '900',
                fontSize: '0.95rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(5,150,105,0.3)'
              }}
            >
              <Check size={18} />
              {isSubmitting ? 'Booking Order...' : `Confirm & Book (₹${cartTotal})`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
