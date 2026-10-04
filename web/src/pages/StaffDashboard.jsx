import React, { useState } from 'react';
import StaffQueueTab from '../components/staff/StaffQueueTab';

export default function StaffDashboard({ user, onSwitchRole, onLogout }) {
  const [staffTasks, setStaffTasks] = useState([
    { id: 'TSK-101', patient: 'Rahul Sharma', task: 'Receive SST Gel Tube & Assign Barcode', status: 'IN_PROGRESS' },
    { id: 'TSK-102', patient: 'Priya Verma', task: 'Print Centrifuge Tube Labels & Route to Hub', status: 'QUEUED' }
  ]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header style={{ backgroundColor: '#004D40', color: '#FFF', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '4px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="MedMarg" style={{ height: '28px', objectFit: 'contain' }} />
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '900' }}>STAFF CONSOLE</span>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '900' }}>Operations & Sample Desk Staff</h2>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={onSwitchRole} style={{ padding: '0.45rem 0.85rem', backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFF', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}>Switch Portal</button>
          <button onClick={onLogout} style={{ padding: '0.45rem 0.85rem', backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}>Logout</button>
        </div>
      </header>

      <main style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <StaffQueueTab staffTasks={staffTasks} />
      </main>
    </div>
  );
}
