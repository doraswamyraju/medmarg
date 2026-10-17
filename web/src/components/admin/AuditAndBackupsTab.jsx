import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Database, 
  RotateCcw, 
  Download, 
  Clock, 
  HardDrive, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Filter, 
  RefreshCw,
  Server,
  Lock,
  Layers,
  Calendar
} from 'lucide-react';

export default function AuditAndBackupsTab({ API_BASE, safeFetch }) {
  const [activeSubTab, setActiveSubTab] = useState('AUDIT_LOGS'); // 'AUDIT_LOGS' | 'BACKUPS'
  const [auditLogs, setAuditLogs] = useState([]);
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [snapshotNotes, setSnapshotNotes] = useState('');
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);
  const [restoringFile, setRestoringFile] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);

  // Load audit logs
  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await safeFetch(`${API_BASE}/api/v1/admin/audit-logs`, {}, 3000);
      const data = await res.json();
      if (data.success && Array.isArray(data.logs)) {
        setAuditLogs(data.logs);
      }
    } catch (e) {
      console.error('Failed to load audit logs:', e);
    } finally {
      setLoading(false);
    }
  };

  // Load backups list
  const fetchBackups = async () => {
    try {
      setLoading(true);
      const res = await safeFetch(`${API_BASE}/api/v1/admin/backups`, {}, 3000);
      const data = await res.json();
      if (data.success && Array.isArray(data.backups)) {
        setBackups(data.backups);
      }
    } catch (e) {
      console.error('Failed to load backups:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'AUDIT_LOGS') {
      fetchAuditLogs();
    } else {
      fetchBackups();
    }
  }, [activeSubTab]);

  // Create manual snapshot
  const handleCreateSnapshot = async () => {
    try {
      setIsCreatingSnapshot(true);
      const res = await fetch(`${API_BASE}/api/v1/admin/backups/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: snapshotNotes || 'Manual snapshot from Admin Panel' })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: `Snapshot ${data.snapshot.filename} created successfully!` });
        setSnapshotNotes('');
        fetchBackups();
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to create snapshot' });
      }
    } catch (e) {
      setStatusMsg({ type: 'error', text: e.message });
    } finally {
      setIsCreatingSnapshot(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  // Restore snapshot
  const handleRestore = async (filename) => {
    if (!window.confirm(`CRITICAL WARNING:\nAre you sure you want to restore database snapshot:\n${filename}?\n\nA safety pre-restore backup will be automatically saved before this operation.`)) {
      return;
    }

    try {
      setRestoringFile(filename);
      const res = await fetch(`${API_BASE}/api/v1/admin/backups/restore/${filename}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: 'admin@medmarg.com' })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: data.message });
        fetchBackups();
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to restore snapshot' });
      }
    } catch (e) {
      setStatusMsg({ type: 'error', text: e.message });
    } finally {
      setRestoringFile(null);
      setTimeout(() => setStatusMsg(null), 6000);
    }
  };

  // Download snapshot
  const handleDownload = (filename) => {
    window.open(`${API_BASE}/api/v1/admin/backups/download/${filename}`, '_blank');
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      (log.user && log.user.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.entityCode && log.entityCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesModule = moduleFilter === 'ALL' || log.module === moduleFilter;
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;

    return matchesSearch && matchesModule && matchesAction;
  });

  const uniqueModules = Array.from(new Set(auditLogs.map(l => l.module).filter(Boolean)));
  const uniqueActions = Array.from(new Set(auditLogs.map(l => l.action).filter(Boolean)));

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: '16px',
        padding: '1.75rem 2rem',
        color: '#FFFFFF',
        marginBottom: '1.5rem',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #006B70 0%, #004D40 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 107, 112, 0.4)'
          }}>
            <ShieldCheck size={28} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>
                Audit Trails & Database Snapshots
              </h1>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: '800',
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                letterSpacing: '0.05em'
              }}>
                LIVE ENFORCEMENT
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#94A3B8' }}>
              Chronological ledger of catalog & inventory mutations with point-in-time recovery
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div style={{
          display: 'flex',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '4px',
          gap: '4px'
        }}>
          <button
            onClick={() => setActiveSubTab('AUDIT_LOGS')}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              background: activeSubTab === 'AUDIT_LOGS' ? '#006B70' : 'transparent',
              color: '#FFFFFF',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <Clock size={16} /> Audit Trail Log
          </button>
          <button
            onClick={() => setActiveSubTab('BACKUPS')}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              background: activeSubTab === 'BACKUPS' ? '#006B70' : 'transparent',
              color: '#FFFFFF',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <Database size={16} /> Backup & Snapshots ({backups.length})
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {statusMsg && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '10px',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backgroundColor: statusMsg.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          border: `1px solid ${statusMsg.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
          color: statusMsg.type === 'success' ? '#065F46' : '#991B1B',
          fontWeight: '600'
        }}>
          {statusMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          {statusMsg.text}
        </div>
      )}

      {/* SUBTAB 1: AUDIT TRAIL LOGS */}
      {activeSubTab === 'AUDIT_LOGS' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          {/* Controls Bar */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
              <div style={{ position: 'relative', minWidth: '260px' }}>
                <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search user, entity code or action..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem 0.6rem 2.25rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              {/* Module Filter */}
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}
              >
                <option value="ALL">All Modules ({auditLogs.length})</option>
                {uniqueModules.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              {/* Action Filter */}
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}
              >
                <option value="ALL">All Actions</option>
                {uniqueActions.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <button
              onClick={fetchAuditLogs}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#F8FAFC',
                color: '#334155',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh Ledger
            </button>
          </div>

          {/* Audit Logs Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F1F5F9', color: '#475569', fontWeight: '700', borderBottom: '2px solid #E2E8F0' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Timestamp</th>
                  <th style={{ padding: '0.75rem 1rem' }}>User / Role</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Module</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Action</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Target Entity</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                      <FileText size={36} color="#CBD5E1" style={{ marginBottom: '0.5rem' }} />
                      <div>No audit records match the selected filter.</div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const isSnapshot = log.action.includes('SNAPSHOT');
                    const isRestore = log.action.includes('RESTORE');
                    const isDelete = log.action.includes('DELETE');

                    let badgeColor = '#3B82F6';
                    let badgeBg = '#EFF6FF';
                    if (isSnapshot) { badgeColor = '#059669'; badgeBg = '#ECFDF5'; }
                    if (isRestore) { badgeColor = '#7C3AED'; badgeBg = '#F5F3FF'; }
                    if (isDelete) { badgeColor = '#DC2626'; badgeBg = '#FEF2F2'; }

                    return (
                      <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s' }}>
                        <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap', color: '#64748B', fontWeight: '500' }}>
                          {new Date(log.timestamp).toLocaleString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit', second: '2-digit'
                          })}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: '700', color: '#1E293B' }}>{log.user}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{log.role || 'Admin'}</div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontWeight: '600',
                            color: '#334155'
                          }}>
                            {log.module}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{
                            backgroundColor: badgeBg,
                            color: badgeColor,
                            fontWeight: '700',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem'
                          }}>
                            {log.action}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', fontWeight: '600', color: '#0F172A' }}>
                          {log.entityCode || '—'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#475569', maxWidth: '380px' }}>
                          {log.details || '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: DATABASE BACKUPS & POINT-IN-TIME RECOVERY */}
      {activeSubTab === 'BACKUPS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Create Manual Snapshot Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HardDrive size={20} color="#006B70" />
              Capture Manual Database Snapshot
            </h3>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#64748B' }}>
              Instantly stores a complete frozen image of tests, diagnostic profiles, packages, multi-lab pricing slabs, and current inventory stock.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Optional snapshot note (e.g., 'Before bulk tests upload' or 'Post inventory audit')..."
                value={snapshotNotes}
                onChange={(e) => setSnapshotNotes(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '300px',
                  padding: '0.7rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.88rem'
                }}
              />
              <button
                onClick={handleCreateSnapshot}
                disabled={isCreatingSnapshot}
                style={{
                  padding: '0.7rem 1.5rem',
                  backgroundColor: '#006B70',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  cursor: isCreatingSnapshot ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: isCreatingSnapshot ? 0.7 : 1,
                  boxShadow: '0 4px 12px rgba(0, 107, 112, 0.25)'
                }}
              >
                <Database size={16} />
                {isCreatingSnapshot ? 'Saving Snapshot...' : 'Create Snapshot Now'}
              </button>
            </div>
          </div>

          {/* Backup Snapshots Table */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' }}>
                Stored Recovery Snapshots ({backups.length})
              </h3>
              <button
                onClick={fetchBackups}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#F8FAFC',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh List
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F1F5F9', color: '#475569', fontWeight: '700', borderBottom: '2px solid #E2E8F0' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Snapshot File</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Created At</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Type</th>
                    <th style={{ padding: '0.75rem 1rem' }}>File Size</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Record Stats</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Notes</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {backups.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                        <Database size={36} color="#CBD5E1" style={{ marginBottom: '0.5rem' }} />
                        <div>No backup snapshots stored yet. Create your first manual snapshot above!</div>
                      </td>
                    </tr>
                  ) : (
                    backups.map((b) => (
                      <tr key={b.filename} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', fontWeight: '700', color: '#0F172A' }}>
                          {b.filename}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                          {new Date(b.createdAt).toLocaleString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{
                            backgroundColor: b.type === 'MANUAL' ? '#ECFDF5' : '#F1F5F9',
                            color: b.type === 'MANUAL' ? '#047857' : '#475569',
                            fontWeight: '800',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.72rem'
                          }}>
                            {b.type}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#334155', fontWeight: '600' }}>
                          {b.sizeFormatted}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#64748B', fontSize: '0.8rem' }}>
                          {b.stats ? (
                            <div>
                              <span style={{ color: '#006B70', fontWeight: '700' }}>{b.stats.testsCount || 0} Tests</span>,{' '}
                              <span>{b.stats.profilesCount || 0} Profiles</span>,{' '}
                              <span>{b.stats.inventoryCount || 0} Inventory Items</span>
                            </div>
                          ) : '—'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#475569', fontStyle: b.notes ? 'normal' : 'italic' }}>
                          {b.notes || 'Automated rolling snapshot'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleDownload(b.filename)}
                              title="Download snapshot JSON"
                              style={{
                                padding: '0.45rem 0.75rem',
                                borderRadius: '6px',
                                border: '1px solid #CBD5E1',
                                backgroundColor: '#FFFFFF',
                                color: '#334155',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem'
                              }}
                            >
                              <Download size={14} /> Download
                            </button>
                            <button
                              onClick={() => handleRestore(b.filename)}
                              disabled={restoringFile === b.filename}
                              title="Restore state to this snapshot"
                              style={{
                                padding: '0.45rem 0.75rem',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: '#DC2626',
                                color: '#FFFFFF',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                cursor: restoringFile === b.filename ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                opacity: restoringFile === b.filename ? 0.6 : 1
                              }}
                            >
                              <RotateCcw size={14} /> {restoringFile === b.filename ? 'Restoring...' : 'Restore'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
