import React, { useState } from 'react';
import { Bike, Thermometer } from 'lucide-react';

import PhlebotomistPickupsTab from '../components/phlebotomist/PhlebotomistPickupsTab';
import PhlebotomistTubeScannerModal from '../components/phlebotomist/PhlebotomistTubeScannerModal';

export default function PhlebotomistDashboard({ user, onSwitchRole, onLogout }) {
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [completedPickups, setCompletedPickups] = useState(new Set(['PK-01']));
  const [activePickupModal, setActivePickupModal] = useState(null);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [scanStep, setScanStep] = useState(1);

  const [pickups, setPickups] = useState([
    { id: 'PK-01', patientName: 'Rahul Sharma', age: '34M', timeSlot: '07:30 AM - 08:30 AM (Fasting)', address: 'Plot 42, Air Bypass Road, Tirupati, AP - 517501', phone: '+91 98765 43210', tests: 'Thyrocare Aarogyam 1.3 (104 Parameters)', tubes: ['Yellow SST (Serum)', 'Lavender (EDTA Blood)', 'Grey (Fluoride Sugar)'], fastingVerified: true, amount: '₹1,499 (Paid Online)' },
    { id: 'PK-02', patientName: 'Lakshmi Devi', age: '58F', timeSlot: '08:45 AM - 09:30 AM (Fasting)', address: 'Door 12-4, Gandhi Road, Tirupati - 517501', phone: '+91 98765 22114', tests: 'Thyroid Profile Total + Lipid Comprehensive', tubes: ['Yellow SST (Serum)', 'Lavender (EDTA Blood)'], fastingVerified: true, amount: '₹1,000 (Collect Cash / UPI)' },
    { id: 'PK-03', patientName: 'Suresh Reddy', age: '42M', timeSlot: '10:00 AM - 11:00 AM (Non-Fasting)', address: 'Near Alipiri Gate, Tirupati - 517507', phone: '+91 98765 33221', tests: 'HbA1c & Blood Sugar Random', tubes: ['Lavender (EDTA Blood)', 'Grey (Fluoride)'], fastingVerified: false, amount: '₹499 (Paid Online)' }
  ]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Top Header */}
      <header style={{ backgroundColor: '#004D40', color: '#FFF', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '4px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="MedMarg" style={{ height: '28px', objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '900', display: 'inline-block' }}>
              PHLEBOTOMIST FLEET CONSOLE
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '900' }}>{user?.name || 'Ramesh Kumar (AG-01)'}</h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.8rem', backgroundColor: 'rgba(255,255,255,0.15)', color: '#80CBC4', padding: '0.4rem 0.85rem', borderRadius: '8px', fontWeight: '800' }}>
            🌡️ Cold-Bag Temp: 4.2°C (Optimal)
          </span>

          <button onClick={onSwitchRole} style={{ padding: '0.45rem 0.85rem', backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFF', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}>
            Switch Portal
          </button>
          <button onClick={onLogout} style={{ padding: '0.45rem 0.85rem', backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <PhlebotomistPickupsTab 
          pickups={pickups} 
          completedPickups={completedPickups} 
          setActivePickupModal={setActivePickupModal} 
          setScanStep={setScanStep} 
          setScannedBarcode={setScannedBarcode} 
        />
      </main>

      {/* Scanner Modal */}
      <PhlebotomistTubeScannerModal 
        activePickupModal={activePickupModal} 
        setActivePickupModal={setActivePickupModal} 
        scanStep={scanStep} 
        setScanStep={setScanStep} 
        scannedBarcode={scannedBarcode} 
        setScannedBarcode={setScannedBarcode} 
        completedPickups={completedPickups} 
        setCompletedPickups={setCompletedPickups} 
      />

    </div>
  );
}
