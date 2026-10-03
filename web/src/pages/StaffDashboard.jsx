import React, { useState } from 'react';
import { 
  Building2, 
  Package, 
  Search, 
  User, 
  LogOut, 
  Phone, 
  Calendar, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  FileText, 
  Upload, 
  Truck, 
  AlertCircle,
  PlusCircle,
  Layers,
  Sparkles,
  ClipboardList,
  Boxes
} from 'lucide-react';

export default function StaffDashboard({ user, onSwitchRole, onLogout }) {
  const [activeTab, setActiveTab] = useState('ASSISTED_BOOKING'); // 'ASSISTED_BOOKING' | 'DISPATCH_QUEUE' | 'INDENTS' | 'REPORTS_UPLOAD'

  // Assisted Booking Form State
  const [patientPhone, setPatientPhone] = useState('');
  const [patientName, setPatientName] = useState('');
  const [selectedTests, setSelectedTests] = useState(['TEST_CBC']);
  const [pickupSlot, setPickupSlot] = useState('Tomorrow 07:30 AM - 08:30 AM');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Mock Indents Queue
  const [indents, setIndents] = useState([
    { id: 'IND-901', agentName: 'Ramesh Kumar (Salaried)', agentType: 'SALARIED', item: 'Gold SST Vacutainers (50 pcs)', status: 'PENDING', time: '10 mins ago' },
    { id: 'IND-902', agentName: 'Suresh Phlebo (Freelancer)', agentType: 'FREELANCE', item: 'Purple EDTA Vacutainers (30 pcs)', status: 'PENDING', time: '25 mins ago' }
  ]);

  const handleCreateAssistedBooking = (e) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => setBookingSuccess(false), 4000);
  };

  const handleApproveIndent = (indentId) => {
    setIndents(indents.map(ind => ind.id === indentId ? { ...ind, status: 'DISPATCHED' } : ind));
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      
      {/* Staff Header */}
      <header style={{ backgroundColor: '#0F172A', color: '#FFF', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/logo.png" alt="MedMarg" style={{ height: '36px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#38BDF8' }}>MedMarg Operations Staff</span>
              <span style={{ padding: '0.15rem 0.5rem', backgroundColor: '#1E293B', color: '#38BDF8', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>PORTAL</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Staff ID: {user?.identifier || 'STAFF-8910'} • Central Operations Desk</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={onSwitchRole} style={{ padding: '0.45rem 0.9rem', backgroundColor: '#1E293B', color: '#94A3B8', border: '1px solid #334155', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>
            Switch Account
          </button>
          <button onClick={onLogout} style={{ padding: '0.45rem 0.9rem', backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <LogOut size={15} /> Logout
          </button>
        </div>
      </header>

      {/* Main Staff Body */}
      <div style={{ flex: 1, display: 'flex' }}>
        
        {/* Sidebar Nav */}
        <aside style={{ width: '260px', backgroundColor: '#FFFFFF', borderRight: '1px solid #E2E8F0', padding: '1.5rem 1rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748B', letterSpacing: '0.05em', marginBottom: '0.75rem', paddingLeft: '0.5rem' }}>OPERATIONS MODULES</div>
          
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <button
              onClick={() => setActiveTab('ASSISTED_BOOKING')}
              style={{ padding: '0.75rem 1rem', borderRadius: '10px', border: 'none', textAlign: 'left', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: activeTab === 'ASSISTED_BOOKING' ? '#E0F2F1' : 'transparent', color: activeTab === 'ASSISTED_BOOKING' ? '#006B70' : '#475569' }}
            >
              <PlusCircle size={18} /> Assisted Customer Booking
            </button>

            <button
              onClick={() => setActiveTab('DISPATCH_QUEUE')}
              style={{ padding: '0.75rem 1rem', borderRadius: '10px', border: 'none', textAlign: 'left', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: activeTab === 'DISPATCH_QUEUE' ? '#E0F2F1' : 'transparent', color: activeTab === 'DISPATCH_QUEUE' ? '#006B70' : '#475569' }}
            >
              <Truck size={18} /> Dispatch Supervision Queue
            </button>

            <button
              onClick={() => setActiveTab('INDENTS')}
              style={{ padding: '0.75rem 1rem', borderRadius: '10px', border: 'none', textAlign: 'left', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: activeTab === 'INDENTS' ? '#E0F2F1' : 'transparent', color: activeTab === 'INDENTS' ? '#006B70' : '#475569' }}
            >
              <Boxes size={18} /> Agent Stock Indents
            </button>

            <button
              onClick={() => setActiveTab('REPORTS_UPLOAD')}
              style={{ padding: '0.75rem 1rem', borderRadius: '10px', border: 'none', textAlign: 'left', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: activeTab === 'REPORTS_UPLOAD' ? '#E0F2F1' : 'transparent', color: activeTab === 'REPORTS_UPLOAD' ? '#006B70' : '#475569' }}
            >
              <Upload size={18} /> NABL Report Upload Queue
            </button>
          </nav>
        </aside>

        {/* Content Panel */}
        <main style={{ flex: 1, padding: '2rem 2.5rem' }}>
          
          {/* TAB 1: ASSISTED BOOKING */}
          {activeTab === 'ASSISTED_BOOKING' && (
            <div style={{ maxWidth: '750px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.25rem' }}>
                Place Order on Behalf of Customer
              </h2>
              <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Use this portal for phone-in customers or walk-in patient booking assistance.
              </p>

              {bookingSuccess && (
                <div style={{ padding: '1rem', backgroundColor: '#D1FAE5', color: '#065F46', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={20} /> Order created successfully! Auto-dispatch assigned order to zone agent.
                </div>
              )}

              <form onSubmit={handleCreateAssistedBooking} style={{ backgroundColor: '#FFF', padding: '2rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Customer Mobile Number</label>
                    <input type="tel" placeholder="+91 9876543210" value={patientPhone} onChange={e => setPatientPhone(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Patient Full Name</label>
                    <input type="text" placeholder="e.g. Ramesh V" value={patientName} onChange={e => setPatientName(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Select Tests / Package</label>
                  <select style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem', fontWeight: '600' }}>
                    <option value="CBC">Complete Blood Count (CBC) - ₹299</option>
                    <option value="LFT">Liver Function Test (LFT) - ₹599</option>
                    <option value="PKG_FULL">MedMarg Full Body Health Package - ₹1,499</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Pickup Slot & Fasting Time</label>
                  <input type="text" value={pickupSlot} onChange={e => setPickupSlot(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }} />
                </div>

                <button type="submit" style={{ padding: '0.85rem 1.75rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: '800', cursor: 'pointer' }}>
                  Confirm Booking & Trigger Auto-Dispatch
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: DISPATCH QUEUE */}
          {activeTab === 'DISPATCH_QUEUE' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.25rem' }}>Live Order Dispatch Queue</h2>
              <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Monitor order allocations between salaried phlebotomists and broadcasted freelancers.</p>
              
              <div style={{ backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E2E8F0', fontSize: '0.8rem', color: '#64748B' }}>
                      <th style={{ padding: '0.75rem' }}>ORDER NO</th>
                      <th style={{ padding: '0.75rem' }}>PATIENT</th>
                      <th style={{ padding: '0.75rem' }}>ASSIGNED AGENT</th>
                      <th style={{ padding: '0.75rem' }}>AGENT TYPE</th>
                      <th style={{ padding: '0.75rem' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #F1F5F9', fontSize: '0.9rem' }}>
                      <td style={{ padding: '0.85rem', fontWeight: '800', color: '#0F172A' }}>MM-2026-981</td>
                      <td style={{ padding: '0.85rem' }}>Rahul Sharma</td>
                      <td style={{ padding: '0.85rem' }}>Ramesh Kumar (Zone 1)</td>
                      <td style={{ padding: '0.85rem' }}><span style={{ padding: '0.2rem 0.5rem', backgroundColor: '#FEF3C7', color: '#92400E', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>SALARIED (8/15)</span></td>
                      <td style={{ padding: '0.85rem' }}><span style={{ padding: '0.2rem 0.5rem', backgroundColor: '#E0F2F1', color: '#006B70', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>EN-ROUTE</span></td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9', fontSize: '0.9rem' }}>
                      <td style={{ padding: '0.85rem', fontWeight: '800', color: '#0F172A' }}>MM-2026-982</td>
                      <td style={{ padding: '0.85rem' }}>Priya Patel</td>
                      <td style={{ padding: '0.85rem' }}>Suresh P (Broadcast Claim)</td>
                      <td style={{ padding: '0.85rem' }}><span style={{ padding: '0.2rem 0.5rem', backgroundColor: '#F3E8FF', color: '#6B21A8', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>FREELANCER</span></td>
                      <td style={{ padding: '0.85rem' }}><span style={{ padding: '0.2rem 0.5rem', backgroundColor: '#FEF3C7', color: '#B45309', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>ACCEPTED</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: INDENTS */}
          {activeTab === 'INDENTS' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.25rem' }}>Agent Stock Replenishment Indents</h2>
              <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Fulfill inventory requests raised by field phlebotomists.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {indents.map(ind => (
                  <div key={ind.id} style={{ backgroundColor: '#FFF', padding: '1.25rem 1.5rem', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700' }}>INDENT ID: {ind.id} • {ind.time}</div>
                      <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', marginTop: '0.2rem' }}>{ind.item}</div>
                      <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.2rem' }}>Requested by: <strong>{ind.agentName}</strong></div>
                    </div>

                    <div>
                      {ind.status === 'PENDING' ? (
                        <button onClick={() => handleApproveIndent(ind.id)} style={{ padding: '0.6rem 1.2rem', backgroundColor: '#10B981', color: '#FFF', border: 'none', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer' }}>
                          Fulfill & Mark Dispatched
                        </button>
                      ) : (
                        <span style={{ padding: '0.4rem 0.85rem', backgroundColor: '#D1FAE5', color: '#065F46', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800' }}>
                          ✓ DISPATCHED
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: REPORTS UPLOAD */}
          {activeTab === 'REPORTS_UPLOAD' && (
            <div style={{ maxWidth: '700px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.25rem' }}>NABL PDF Report Upload Queue</h2>
              <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Upload certified test result PDFs to publish directly to patient account.</p>

              <div style={{ backgroundColor: '#FFF', padding: '2rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Select Order Number</label>
                  <select style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem', fontWeight: '600' }}>
                    <option>MM-2026-981 (Rahul Sharma - Complete Blood Count)</option>
                    <option>MM-2026-982 (Priya Patel - Liver Function Test)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Upload Certified NABL PDF Report</label>
                  <input type="file" accept=".pdf" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px dashed #006B70', backgroundColor: '#F0FDF4' }} />
                </div>

                <button style={{ padding: '0.85rem 1.75rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: '800', cursor: 'pointer' }}>
                  Publish Report to Patient Dashboard
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
