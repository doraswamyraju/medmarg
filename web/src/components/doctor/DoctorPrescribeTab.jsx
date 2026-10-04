import React from 'react';
import { THYROCARE_TESTS } from '../../data/thyrocareTests';
import { Stethoscope, Check } from 'lucide-react';

export default function DoctorPrescribeTab({
  patients,
  selectedPatientForTest,
  setSelectedPatientForTest,
  prescribedTestIds,
  setPrescribedTestIds,
  doctorCustomPrices,
  setDoctorCustomPrices,
  allowPatientAppLogin,
  setAllowPatientAppLogin,
  setOrderSuccessModal
}) {
  const toggleTest = (testId) => {
    if (prescribedTestIds.includes(testId)) {
      setPrescribedTestIds(prescribedTestIds.filter(id => id !== testId));
    } else {
      setPrescribedTestIds([...prescribedTestIds, testId]);
    }
  };

  const selectedTestsObj = THYROCARE_TESTS.filter(t => prescribedTestIds.includes(t.id));
  const totalB2bRate = selectedTestsObj.reduce((sum, t) => sum + t.b2bPrice, 0);
  const totalPatientPrice = selectedTestsObj.reduce((sum, t) => sum + (doctorCustomPrices[t.id] || t.mrp), 0);
  const totalDoctorMargin = Math.max(0, totalPatientPrice - totalB2bRate);

  const handleCreatePrescriptionOrder = () => {
    if (!selectedPatientForTest) {
      alert('Please select a patient first');
      return;
    }
    if (prescribedTestIds.length === 0) {
      alert('Please select at least 1 lab test');
      return;
    }

    setOrderSuccessModal({
      orderId: `DOC-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: selectedPatientForTest.name,
      patientPhone: selectedPatientForTest.phone,
      tests: selectedTestsObj.map(t => t.name),
      patientPrice: totalPatientPrice,
      doctorMargin: totalDoctorMargin,
      appLoginCode: allowPatientAppLogin ? 'OTP-8912' : null
    });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
      
      {/* Test Selector */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #E2E8F0' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A', marginBottom: '1rem' }}>
          Select Diagnostic Tests & Custom Patient Pricing
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '500px', overflowY: 'auto' }}>
          {THYROCARE_TESTS.map(test => {
            const isSelected = prescribedTestIds.includes(test.id);
            const currentCustomPrice = doctorCustomPrices[test.id] || test.mrp;

            return (
              <div
                key={test.id}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  backgroundColor: isSelected ? '#E0F2F1' : '#F8FAFC',
                  border: isSelected ? '1.5px solid #006B70' : '1px solid #E2E8F0',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleTest(test.id)}
                    style={{ width: '18px', height: '18px', accentColor: '#006B70', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.92rem' }}>{test.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      B2B Cost: ₹{test.b2bPrice} • Standard MRP: ₹{test.mrp}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.75rem', color: '#006B70', fontWeight: '800' }}>Patient Price (₹):</label>
                    <input
                      type="number"
                      value={currentCustomPrice}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setDoctorCustomPrices({ ...doctorCustomPrices, [test.id]: val });
                      }}
                      style={{ width: '90px', padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid #006B70', fontWeight: '800', fontSize: '0.85rem' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Summary & Patient Assignment */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A', marginBottom: '1rem' }}>
            Prescription Summary & Revenue Split
          </h3>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '800', display: 'block', marginBottom: '0.3rem' }}>Select Target Patient:</label>
            <select
              value={selectedPatientForTest?.id || ''}
              onChange={(e) => {
                const found = patients.find(p => p.id === e.target.value);
                setSelectedPatientForTest(found);
              }}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem', fontWeight: '700' }}
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
              ))}
            </select>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', borderRadius: '14px', padding: '1rem', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Lab B2B Processing Cost:</span>
              <strong style={{ color: '#64748B' }}>₹{totalB2bRate}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Amount Billed to Patient:</span>
              <strong style={{ color: '#006B70', fontSize: '1.1rem' }}>₹{totalPatientPrice}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #CBD5E1' }}>
              <span style={{ color: '#059669', fontWeight: '800' }}>Doctor Net Margin Revenue:</span>
              <strong style={{ color: '#059669', fontSize: '1.15rem' }}>+ ₹{totalDoctorMargin}</strong>
            </div>
          </div>
        </div>

        <button
          onClick={handleCreatePrescriptionOrder}
          style={{ marginTop: '1.5rem', padding: '0.85rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '0.95rem', cursor: 'pointer' }}
        >
          Confirm Prescription & Send Home Collection
        </button>
      </div>

    </div>
  );
}
