import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  Power, 
  CheckCircle2, 
  Navigation, 
  ShieldCheck, 
  Star, 
  Thermometer, 
  Bike, 
  TrendingUp, 
  Award,
  Zap,
  Activity,
  Calendar
} from 'lucide-react';
import { API_BASE, safeFetch, safeJson } from '../../data/apiConfig';

export default function SalariedShiftQuotaTab({
  user,
  isOnDuty,
  onToggleDuty,
  completedCount = 0,
  currentLocation
}) {
  const [quotaStats, setQuotaStats] = useState({
    samplesToday: completedCount || 8,
    maxDailyQuota: 15,
    quotaRemaining: 7,
    rating: 4.9,
    zone: 'Tirupati Urban & Bypass (Zone 1)',
    onTimeRate: '98%',
    fastingAccuracy: '100%'
  });

  const [shiftLogs, setShiftLogs] = useState([
    { id: 'LOG-01', time: '06:45 AM', type: 'SHIFT_START', label: 'Shift Punched In (Air Bypass Road Hub)', status: 'COMPLETED' },
    { id: 'LOG-02', time: '07:35 AM', type: 'PICKUP', label: 'Doorstep Collection MM-8921 (Rahul Sharma)', status: 'COMPLETED' },
    { id: 'LOG-03', time: '08:42 AM', type: 'PICKUP', label: 'Doorstep Collection MM-8922 (Priya Verma)', status: 'COMPLETED' },
    { id: 'LOG-04', time: '10:15 AM', type: 'COLD_CHAIN', label: 'IoT Bag Temp Check 3.9°C (Optimal)', status: 'SYSTEM' }
  ]);

  // Fetch real quota stats from backend API
  useEffect(() => {
    safeFetch(`${API_BASE}/api/v1/agent/quota-stats?agentId=${user?.id || 'AG-01'}`)
      .then(res => safeJson(res))
      .then(data => {
        if (data && data.success) {
          setQuotaStats(prev => ({
            ...prev,
            ...data,
            samplesToday: Math.max(completedCount, data.samplesToday || 8)
          }));
        }
      })
      .catch(err => console.warn('Quota fetch note:', err));
  }, [completedCount, user]);

  const percentage = Math.min(100, Math.round((quotaStats.samplesToday / (quotaStats.maxDailyQuota || 15)) * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Award size={14} /> SALARIED FLEET CONSOLE
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700' }}>In-House Phlebotomist Desk</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A', marginTop: '0.25rem' }}>
            Duty Shift Attendance & Daily Quota Monitor
          </h2>
        </div>

        {/* Live Location Telemetry Chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ 
            fontSize: '0.82rem', 
            backgroundColor: currentLocation ? '#F0FDF4' : '#FFFBEB', 
            color: currentLocation ? '#166534' : '#92400E', 
            border: currentLocation ? '1.5px solid #BBF7D0' : '1.5px solid #FDE68A', 
            padding: '0.45rem 0.85rem', 
            borderRadius: '12px', 
            fontWeight: '800', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem' 
          }}>
            <Navigation size={15} color={currentLocation ? '#16a34a' : '#d97706'} />
            {currentLocation ? `GPS Live: ${currentLocation.lat?.toFixed(4)}, ${currentLocation.lng?.toFixed(4)}` : 'GPS Position Initializing...'}
          </span>
        </div>
      </div>

      {/* Grid: Shift Status & Quota Progress Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        
        {/* Card 1: Shift Punch-In / Punch-Out */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '1.75rem',
            border: isOnDuty ? '2px solid #059669' : '2px solid #E2E8F0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', backgroundColor: isOnDuty ? '#ECFDF5' : '#F1F5F9', color: isOnDuty ? '#065F46' : '#64748B', padding: '0.25rem 0.65rem', borderRadius: '6px', fontWeight: '900' }}>
                {isOnDuty ? '● ACTIVE ON DUTY' : '○ SHIFT ENDED (OFF DUTY)'}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700' }}>
                Shift: 07:00 AM - 04:00 PM
              </span>
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0F172A' }}>
              Duty Shift Controller
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.35rem', lineHeight: '1.5' }}>
              When active, your location is geo-fenced to your assigned zone and the auto-dispatch engine assigns doorstep bookings directly to your device.
            </p>

            <div style={{ marginTop: '1.25rem', backgroundColor: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.82rem', color: '#334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span>Agent ID:</span>
                <strong>{user?.id || 'AG-01'} (Ramesh Kumar)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span>Assigned EV Vehicle:</span>
                <strong>Hero Electric Nyx (AP 03 EV 4821)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Zone Territory:</span>
                <strong>{quotaStats.zone}</strong>
              </div>
            </div>
          </div>

          <button
            onClick={onToggleDuty}
            style={{
              marginTop: '1.5rem',
              padding: '0.9rem',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: isOnDuty ? '#EF4444' : '#059669',
              color: '#FFFFFF',
              fontWeight: '900',
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: isOnDuty ? '0 4px 12px rgba(239,68,68,0.25)' : '0 4px 12px rgba(5,150,105,0.25)'
            }}
          >
            <Power size={18} />
            {isOnDuty ? 'End Duty Shift (Clock Out)' : 'Start Duty Shift (Clock In with GPS)'}
          </button>
        </div>

        {/* Card 2: Daily Quota & Capacity HUD */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '1.75rem',
            border: '2px solid #006B70',
            boxShadow: '0 4px 16px rgba(0, 107, 112, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.25rem 0.65rem', borderRadius: '6px', fontWeight: '900' }}>
                DAILY QUOTA HUD
              </span>
              <span style={{ fontSize: '0.8rem', color: '#006B70', fontWeight: '800' }}>
                Max Limit: {quotaStats.maxDailyQuota} Pickups/Day
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0F172A' }}>
                {quotaStats.samplesToday}
              </span>
              <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#64748B' }}>
                / {quotaStats.maxDailyQuota} Completed
              </span>
            </div>

            {/* Progress Bar */}
            <div style={{ marginTop: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ height: '12px', width: '100%', backgroundColor: '#E2E8F0', borderRadius: '6px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${percentage}%`, 
                    backgroundColor: percentage >= 100 ? '#EF4444' : '#006B70', 
                    borderRadius: '6px', 
                    transition: 'width 0.4s ease' 
                  }} 
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem', fontSize: '0.78rem', color: '#64748B', fontWeight: '700' }}>
                <span>{percentage}% Achieved</span>
                <span>{Math.max(0, quotaStats.maxDailyQuota - quotaStats.samplesToday)} Slots Remaining</span>
              </div>
            </div>

            {/* Note on Auto-Cascade */}
            <div style={{ marginTop: '1rem', backgroundColor: '#F0FDF4', padding: '0.8rem', borderRadius: '12px', border: '1px solid #BBF7D0', fontSize: '0.8rem', color: '#166534', lineHeight: '1.4' }}>
              <strong>Operational Governance:</strong> Once you hit {quotaStats.maxDailyQuota} orders today, new incoming orders automatically overflow to backup staff or verified freelance phlebotomists via push broadcast.
            </div>
          </div>

          {/* Performance Pill Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: '1.25rem' }}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '0.65rem 0.5rem', borderRadius: '10px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>{quotaStats.rating} ★</div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '700', marginTop: '2px' }}>Rating</div>
            </div>
            <div style={{ backgroundColor: '#F8FAFC', padding: '0.65rem 0.5rem', borderRadius: '10px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#059669' }}>{quotaStats.onTimeRate}</div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '700', marginTop: '2px' }}>On-Time SLA</div>
            </div>
            <div style={{ backgroundColor: '#F8FAFC', padding: '0.65rem 0.5rem', borderRadius: '10px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0284C7' }}>{quotaStats.fastingAccuracy}</div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '700', marginTop: '2px' }}>Fasting Acc.</div>
            </div>
          </div>
        </div>

      </div>

      {/* Today's Shift Activity Milestones Log */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.75rem', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} color="#006B70" /> Today's Field Activity & Audit Milestones
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {shiftLogs.map(log => (
            <div
              key={log.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                border: '1px solid #E2E8F0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '900', color: '#006B70', backgroundColor: '#E0F2F1', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                  {log.time}
                </span>
                <span style={{ fontSize: '0.86rem', fontWeight: '700', color: '#1E293B' }}>
                  {log.label}
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle2 size={15} /> Verified
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
