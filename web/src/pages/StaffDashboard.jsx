import React, { useState, useEffect } from 'react';
import StaffQueueTab from '../components/staff/StaffQueueTab';
import StaffDispatchDesk from '../components/staff/StaffDispatchDesk';
import LabOrdersTab from '../components/lab/LabOrdersTab';
import CatalogManagementTab from '../components/admin/CatalogManagementTab';
import initialCatalog from '../data/catalogData.json';
import { getCatalogState, saveCatalogState } from '../data/catalogStore';
import { DollarSign, CheckSquare, Layers, Truck, FlaskConical, ShoppingBag } from 'lucide-react';
import { API_BASE, safeFetch } from '../data/apiConfig';

export default function StaffDashboard({ user, onSwitchRole, onLogout }) {
  const [activeStaffTab, setActiveStaffTab] = useState('DISPATCH_ORDERS'); // 'DISPATCH_ORDERS' | 'LAB_SAMPLES' | 'LAB_PRICING_CATALOG'
  const [catalog, setCatalog] = useState(getCatalogState() || initialCatalog);
  const [labSamples, setLabSamples] = useState([]);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [syncLogs, setSyncLogs] = useState([]);

  useEffect(() => {
    safeFetch(`${API_BASE}/api/v1/lab/queue`)
      .then(r => r.json())
      .then(d => {
        if (d && Array.isArray(d.samples)) setLabSamples(d.samples);
      })
      .catch(() => {});
  }, []);

  const [staffTasks, setStaffTasks] = useState([
    { id: 'TSK-101', patient: 'Rahul Sharma', task: 'Receive SST Gel Tube & Assign Barcode', status: 'IN_PROGRESS' },
    { id: 'TSK-102', patient: 'Priya Verma', task: 'Print Centrifuge Tube Labels & Route to Hub', status: 'QUEUED' }
  ]);

  const triggerGoogleSheetsSync = () => {
    setIsSyncingSheets(true);
    setTimeout(() => {
      setIsSyncingSheets(false);
      setSyncLogs(prev => [{ timestamp: new Date().toLocaleTimeString(), action: 'Staff sync completed', status: 'SUCCESS' }, ...prev]);
    }, 1500);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header style={{ backgroundColor: '#004D40', color: '#FFF', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '4px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="MedMarg" style={{ height: '28px', objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '900' }}>
                STAFF OPERATIONS DESK
              </span>
              <span style={{ fontSize: '0.72rem', color: '#80CBC4', fontWeight: '700' }}>
                Assigned Staff: {user?.name || 'Operations Desk Staff'}
              </span>
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '900', margin: '0.15rem 0 0 0' }}>
              MedMarg Partner Labs & Operations Console
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Subtab Switcher */}
          <div style={{ display: 'flex', backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: '10px', gap: '0.25rem' }}>
            <button
              onClick={() => setActiveStaffTab('DISPATCH_ORDERS')}
              style={{
                padding: '0.45rem 0.85rem',
                backgroundColor: activeStaffTab === 'DISPATCH_ORDERS' ? '#FBBF24' : 'transparent',
                color: activeStaffTab === 'DISPATCH_ORDERS' ? '#78350F' : '#FFF',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '900',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Truck size={14} /> 1. Dispatch & Orders Desk
            </button>
            <button
              onClick={() => setActiveStaffTab('LAB_SAMPLES')}
              style={{
                padding: '0.45rem 0.85rem',
                backgroundColor: activeStaffTab === 'LAB_SAMPLES' ? '#FBBF24' : 'transparent',
                color: activeStaffTab === 'LAB_SAMPLES' ? '#78350F' : '#FFF',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '900',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <FlaskConical size={14} /> 2. Sample Ingestion & Reports
            </button>
            <button
              onClick={() => setActiveStaffTab('LAB_PRICING_CATALOG')}
              style={{
                padding: '0.45rem 0.85rem',
                backgroundColor: activeStaffTab === 'LAB_PRICING_CATALOG' ? '#FBBF24' : 'transparent',
                color: activeStaffTab === 'LAB_PRICING_CATALOG' ? '#78350F' : '#FFF',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '900',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <DollarSign size={14} /> 3. Multi-Lab Catalog Slabs
            </button>
          </div>

          <button onClick={onSwitchRole} style={{ padding: '0.45rem 0.85rem', backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFF', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}>Switch Portal</button>
          <button onClick={onLogout} style={{ padding: '0.45rem 0.85rem', backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}>Logout</button>
        </div>
      </header>

      <main style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        {activeStaffTab === 'DISPATCH_ORDERS' && (
          <StaffDispatchDesk catalog={catalog} user={user} />
        )}

        {activeStaffTab === 'LAB_SAMPLES' && (
          <LabOrdersTab 
            orders={labSamples} 
            onResultsUpdated={(id, rep) => {
              setLabSamples(prev => prev.map(s => s.id === id ? { ...s, status: 'REPORT_READY', reportPdfUrl: rep.pdfUrl } : s));
            }} 
          />
        )}

        {activeStaffTab === 'LAB_PRICING_CATALOG' && (
          <CatalogManagementTab
            catalog={catalog}
            setCatalog={setCatalog}
            saveCatalogState={saveCatalogState}
            triggerGoogleSheetsSync={triggerGoogleSheetsSync}
            isSyncingSheets={isSyncingSheets}
            syncLogs={syncLogs}
          />
        )}
      </main>
    </div>
  );
}

