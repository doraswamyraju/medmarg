import React, { useState } from 'react';
import { 
  Bicycle, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Thermometer, 
  QrCode, 
  Clock, 
  Navigation, 
  MessageCircle, 
  Battery, 
  ShieldCheck, 
  AlertCircle,
  TrendingUp,
  Package,
  Layers,
  ArrowRight,
  LogOut,
  RefreshCw
} from 'lucide-react';

export default function PhlebotomistDashboard({ user, onSwitchRole, onLogout }) {
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [completedPickups, setCompletedPickups] = useState(new Set(['PK-01']));
  const [activePickupModal, setActivePickupModal] = useState(null);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [scanStep, setScanStep] = useState(1); // 1: Verify, 2: Scan Tube, 3: Completed

  const [pickups, setPickups] = useState([
    {
      id: 'PK-01',
      patientName: 'Rahul Sharma',
      age: '34M',
      timeSlot: '07:30 AM - 08:30 AM (Fasting)',
      address: 'Plot 42, Air Bypass Road, Tirupati, AP - 517501',
      phone: '+91 98765 43210',
      tests: 'Thyrocare Aarogyam 1.3 (104 Parameters)',
      tubes: ['Yellow SST (Serum)', 'Lavender (EDTA Blood)', 'Grey (Fluoride Sugar)'],
      fastingVerified: true,
      amount: '₹1,499 (Paid Online)'
    },
    {
      id: 'PK-02',
      patientName: 'Lakshmi Devi',
      age: '58F',
      timeSlot: '08:45 AM - 09:30 AM (Fasting)',
      address: 'Door 12-4, Gandhi Road, Tirupati - 517501',
      phone: '+91 98765 22114',
      tests: 'Thyroid Profile Total + Lipid Comprehensive',
      tubes: ['Yellow SST (Serum)', 'Lavender (EDTA Blood)'],
      fastingVerified: true,
      amount: '₹1,000 (Collect Cash / UPI)'
    },
    {
      id: 'PK-03',
      patientName: 'Suresh Reddy',
      age: '42M',
      timeSlot: '10:00 AM - 11:00 AM (Non-Fasting)',
      address: 'Near Alipiri Gate, Tirupati - 517507',
      phone: '+91 98765 99887',
      tests: 'Complete Blood Count (CBC) + Vitamin D3 & B12',
      tubes: ['Lavender (EDTA Blood)', 'Yellow SST (Serum)'],
      fastingVerified: false,
      amount: '₹1,098 (Paid Online)'
    }
  ]);

  const togglePickupStatus = (id) => {
    const updated = new Set(completedPickups);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setCompletedPickups(updated);
  };

  const handleOpenScan = (pickup) => {
    setActivePickupModal(pickup);
    setScanStep(1);
    setScannedBarcode(`MM-${pickup.id}-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  const handleConfirmCollection = () => {
    if (activePickupModal) {
      const updated = new Set(completedPickups);
      updated.add(activePickupModal.id);
      setCompletedPickups(updated);
      setActivePickupModal(null);
    }
  };

  const handleWhatsAppChat = (phone, name) => {
    const msg = encodeURIComponent(`Hello ${name}, I am Ramesh Kumar, your MedMarg Certified Phlebotomist. I am on my way for your home sample collection.`);
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${msg}`, '_blank');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <header style={{ padding: '0.85rem 2rem', backgroundColor: '#004D40', color: '#FFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,77,64,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/logo.png" alt="MedMarg" style={{ height: '32px', filter: 'brightness(0) invert(1)' }} />
          <div>
            <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '900' }}>
              FIELD PHLEBOTOMY FLEET
            </span>
            <div style={{ fontSize: '0.95rem', fontWeight: '800' }}>{user?.name || 'Ramesh Kumar (Phlebo AG-01)'}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Duty Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', backgroundColor: 'rgba(255,255,255,0.12)', padding: '0.35rem 0.85rem', borderRadius: '20px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: isOnDuty ? '#10B981' : '#EF4444', display: 'inline-block' }}></span>
            <span style={{ fontSize: '0.82rem', fontWeight: '700' }}>{isOnDuty ? 'ON DUTY (GPS Beacon Active)' : 'OFF DUTY'}</span>
            <button 
              onClick={() => setIsOnDuty(!isOnDuty)}
              style={{ background: 'none', border: 'none', color: '#80CBC4', textDecoration: 'underline', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '700' }}
            >
              Toggle
            </button>
          </div>

          <button
            onClick={onLogout}
            style={{ padding: '0.45rem 0.9rem', backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '2rem 1.5rem' }}>
        
        {/* Top Telemetry & Summary Banner */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
          
          {/* 1. IoT Cold-Chain Box */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #A7F3D0', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: '0 4px 15px rgba(16,185,129,0.06)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Thermometer size={30} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#059669', letterSpacing: '0.05em' }}>COLD-CHAIN IOT TELEMETRY #CB-88</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#064E3B' }}>4.2°C <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: '700' }}>Optimal (2°C - 8°C)</span></div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>Destination: Thyrocare NABL Central Processing Lab</div>
            </div>
          </div>

          {/* 2. Today's Pickups Progress */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: '#E0F2F1', color: '#006B70', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={28} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B' }}>TODAY'S PICKUPS</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0F172A' }}>{completedPickups.size} / {pickups.length}</div>
              <div style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: '700' }}>Target: 5 Pickups (₹1,450 Earned)</div>
            </div>
          </div>

          {/* 3. Phlebo Mileage & Logistics */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Navigation size={28} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B' }}>ROUTE & FLEET LOGISTICS</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0F172A' }}>14.2 KM</div>
              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Tirupati Sector (Air Bypass Rd - Alipiri)</div>
            </div>
          </div>

        </div>

        {/* Assigned Home Collections */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A' }}>Today's Assigned Home Collections</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.2rem' }}>Draw samples, verify fasting guidelines, scan vacutainer barcodes, and deposit to NABL lab.</p>
            </div>
            <button 
              onClick={() => alert('Refreshing live pickup roster from server...')}
              style={{ padding: '0.55rem 1rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <RefreshCw size={14} /> Refresh Roster
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {pickups.map((p) => {
              const isDone = completedPickups.has(p.id);
              return (
                <div 
                  key={p.id}
                  style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: isDone ? '1.5px solid #A7F3D0' : '1.5px solid #E2E8F0', padding: '1.75rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}
                >
                  <div style={{ flex: 1, minWidth: '320px' }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', backgroundColor: '#E0F2F1', color: '#006B70', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '800' }}>
                        {p.id}
                      </span>
                      <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F172A' }}>
                        ⏰ {p.timeSlot}
                      </span>
                      {isDone && (
                        <span style={{ fontSize: '0.72rem', backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: '900' }}>
                          ✓ SAMPLE COLLECTED & STORED
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0F172A' }}>
                      {p.patientName} <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '600' }}>({p.age})</span>
                    </h3>

                    <div style={{ fontSize: '0.88rem', color: '#475569', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={16} color="#006B70" />
                      <span>{p.address}</span>
                    </div>

                    <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>ORDERED TESTS & PROFILES:</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A', marginTop: '0.2rem' }}>{p.tests}</div>
                      
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                        {p.tubes.map((t, idx) => (
                          <span key={idx} style={{ fontSize: '0.75rem', backgroundColor: '#FFF', border: '1px solid #CBD5E1', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: '700', color: '#334155' }}>
                            🧪 {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#006B70', fontWeight: '700', marginTop: '0.75rem' }}>
                      Payment: {p.amount}
                    </div>

                  </div>

                  {/* Actions Right Side */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', minWidth: '180px' }}>
                    <button
                      onClick={() => window.open(`tel:${p.phone}`, '_self')}
                      style={{ padding: '0.65rem 1rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <Phone size={16} /> Call Patient
                    </button>

                    <button
                      onClick={() => handleWhatsAppChat(p.phone, p.patientName)}
                      style={{ padding: '0.65rem 1rem', backgroundColor: '#25D366', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <MessageCircle size={16} /> WhatsApp Live
                    </button>

                    <button
                      onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(p.address)}`, '_blank')}
                      style={{ padding: '0.65rem 1rem', backgroundColor: '#0284C7', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <Navigation size={16} /> Google Maps
                    </button>

                    <button
                      onClick={() => handleOpenScan(p)}
                      style={{ marginTop: '0.4rem', padding: '0.75rem 1rem', backgroundColor: isDone ? '#64748B' : '#059669', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(5,150,105,0.2)' }}
                    >
                      <QrCode size={18} /> {isDone ? 'View Barcode' : 'Scan & Collect'}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </main>

      {/* SAMPLE BARCODE SCAN & COLLECTION MODAL */}
      {activePickupModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 150, backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', maxWidth: '500px', width: '100%', padding: '2rem', boxShadow: '0 25px 60px -15px rgba(0,0,0,0.35)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <QrCode size={24} color="#006B70" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A' }}>Vacutainer Barcode Scan</h3>
              </div>
              <button onClick={() => setActivePickupModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B' }}>✕</button>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: '800', color: '#0F172A' }}>{activePickupModal.patientName} ({activePickupModal.id})</div>
              <div style={{ fontSize: '0.82rem', color: '#64748B' }}>{activePickupModal.tests}</div>
            </div>

            {/* Generated Barcode */}
            <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#FEF3C7', borderRadius: '16px', border: '1.5px dashed #F59E0B', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '1.5rem', letterSpacing: '0.25em', fontWeight: '900', fontFamily: 'monospace', color: '#92400E' }}>
                {scannedBarcode}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#B45309', marginTop: '0.4rem', fontWeight: '700' }}>
                ✓ Vacutainer RFID / Barcode Affixed & Verified
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#334155' }}>
              <div>✓ 10-Hour Overnight Fasting Confirmed with Patient</div>
              <div>✓ Stored in Cold-Chain Box (4.2°C IoT Telemetry)</div>
              <div>✓ SMS Notification sent to patient with live tracking</div>
            </div>

            <button
              onClick={handleConfirmCollection}
              style={{ width: '100%', padding: '0.9rem', backgroundColor: '#059669', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '1rem', cursor: 'pointer' }}
            >
              Confirm Sample Drawn & Stored in Box
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
