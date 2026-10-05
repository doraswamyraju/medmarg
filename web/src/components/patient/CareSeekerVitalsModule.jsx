import React, { useState } from 'react';
import { 
  Activity, 
  Heart, 
  Droplet, 
  Scale, 
  Thermometer, 
  Wind, 
  Plus, 
  TrendingUp, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  User, 
  AlertCircle,
  Sparkles,
  X
} from 'lucide-react';

export default function CareSeekerVitalsModule({ user }) {
  const [selectedMember, setSelectedMember] = useState('SELF'); // 'SELF' | 'FATHER' | 'SPOUSE'
  const [showLogModal, setShowLogModal] = useState(false);

  // Vitals Logs State
  const [vitalsData, setVitalsData] = useState({
    SELF: {
      name: user?.name || 'Rahul Sharma',
      age: 34,
      gender: 'Male',
      bp: { systolic: 120, diastolic: 80, status: 'OPTIMAL', time: 'Today, 07:30 AM' },
      sugar: { fbs: 92, ppbs: 128, status: 'NORMAL', time: 'Today, 08:00 AM' },
      pulse: { bpm: 72, status: 'NORMAL', time: 'Today, 07:30 AM' },
      spo2: { percent: 98, status: 'NORMAL', time: 'Today, 07:30 AM' },
      temp: { fahrenheit: 98.4, status: 'NORMAL', time: 'Yesterday' },
      weight: { kg: 68.5, heightCm: 175, bmi: 22.4, status: 'HEALTHY' },
      history: [
        { date: '06 Oct 2026', bp: '120/80', fbs: '92', pulse: '72', spo2: '98%', bmi: '22.4' },
        { date: '28 Sep 2026', bp: '122/82', fbs: '96', pulse: '74', spo2: '99%', bmi: '22.5' },
        { date: '15 Sep 2026', bp: '118/78', fbs: '90', pulse: '70', spo2: '98%', bmi: '22.3' }
      ]
    },
    FATHER: {
      name: 'K. Somasekhar Sharma',
      age: 64,
      gender: 'Male',
      bp: { systolic: 138, diastolic: 88, status: 'STAGE_1_HTN', time: 'Today, 08:15 AM' },
      sugar: { fbs: 142, ppbs: 188, status: 'ELEVATED', time: 'Today, 08:45 AM' },
      pulse: { bpm: 78, status: 'NORMAL', time: 'Today, 08:15 AM' },
      spo2: { percent: 97, status: 'NORMAL', time: 'Today, 08:15 AM' },
      temp: { fahrenheit: 98.6, status: 'NORMAL', time: 'Yesterday' },
      weight: { kg: 74.0, heightCm: 168, bmi: 26.2, status: 'OVERWEIGHT' },
      history: [
        { date: '06 Oct 2026', bp: '138/88', fbs: '142', pulse: '78', spo2: '97%', bmi: '26.2' },
        { date: '28 Sep 2026', bp: '140/90', fbs: '148', pulse: '80', spo2: '97%', bmi: '26.3' },
        { date: '15 Sep 2026', bp: '135/85', fbs: '138', pulse: '76', spo2: '98%', bmi: '26.1' }
      ]
    },
    SPOUSE: {
      name: 'Sunita Sharma',
      age: 31,
      gender: 'Female',
      bp: { systolic: 116, diastolic: 76, status: 'OPTIMAL', time: 'Yesterday, 06:30 PM' },
      sugar: { fbs: 88, ppbs: 118, status: 'NORMAL', time: 'Yesterday' },
      pulse: { bpm: 70, status: 'NORMAL', time: 'Yesterday' },
      spo2: { percent: 99, status: 'NORMAL', time: 'Yesterday' },
      temp: { fahrenheit: 98.2, status: 'NORMAL', time: 'Yesterday' },
      weight: { kg: 56.0, heightCm: 162, bmi: 21.3, status: 'HEALTHY' },
      history: [
        { date: '05 Oct 2026', bp: '116/76', fbs: '88', pulse: '70', spo2: '99%', bmi: '21.3' },
        { date: '20 Sep 2026', bp: '114/74', fbs: '86', pulse: '68', spo2: '99%', bmi: '21.2' }
      ]
    }
  });

  // Modal State for new vital entry
  const [inputBpSys, setInputBpSys] = useState('120');
  const [inputBpDia, setInputBpDia] = useState('80');
  const [inputSugar, setInputSugar] = useState('92');
  const [inputPulse, setInputPulse] = useState('72');
  const [inputSpo2, setInputSpo2] = useState('98');
  const [inputWeight, setInputWeight] = useState('68.5');

  const currentVitals = vitalsData[selectedMember] || vitalsData.SELF;

  const handleSaveVitals = (e) => {
    e.preventDefault();
    const newEntry = {
      date: 'Today',
      bp: `${inputBpSys}/${inputBpDia}`,
      fbs: inputSugar,
      pulse: inputPulse,
      spo2: `${inputSpo2}%`,
      bmi: (parseFloat(inputWeight) / 3.06).toFixed(1)
    };

    setVitalsData({
      ...vitalsData,
      [selectedMember]: {
        ...currentVitals,
        bp: { systolic: parseInt(inputBpSys), diastolic: parseInt(inputBpDia), status: parseInt(inputBpSys) > 130 ? 'STAGE_1_HTN' : 'OPTIMAL', time: 'Just now' },
        sugar: { fbs: parseInt(inputSugar), ppbs: parseInt(inputSugar) + 35, status: parseInt(inputSugar) > 110 ? 'ELEVATED' : 'NORMAL', time: 'Just now' },
        pulse: { bpm: parseInt(inputPulse), status: 'NORMAL', time: 'Just now' },
        spo2: { percent: parseInt(inputSpo2), status: 'NORMAL', time: 'Just now' },
        weight: { ...currentVitals.weight, kg: parseFloat(inputWeight) },
        history: [newEntry, ...currentVitals.history]
      }
    });

    setShowLogModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Top Family Member Vitals Selector Bar */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '22px', padding: '1.25rem 1.5rem', border: '1.5px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#64748B' }}>Viewing Vitals for:</span>
          {[
            { key: 'SELF', label: `Myself (${user?.name || 'Rahul'})` },
            { key: 'FATHER', label: 'Father (Somasekhar - Diabetic Log)' },
            { key: 'SPOUSE', label: 'Spouse (Sunita)' }
          ].map(m => {
            const isSel = selectedMember === m.key;
            return (
              <button
                key={m.key}
                onClick={() => setSelectedMember(m.key)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: isSel ? '#006B70' : '#F1F5F9',
                  color: isSel ? '#FFFFFF' : '#334155',
                  fontWeight: '800',
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <User size={14} color={isSel ? '#FBBF24' : '#64748B'} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          style={{
            padding: '0.6rem 1.25rem',
            backgroundColor: '#006B70',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '800',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 4px 12px rgba(0,107,112,0.2)'
          }}
        >
          <Plus size={16} /> Log New Reading
        </button>
      </div>

      {/* 6 Core Vital Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        
        {/* 1. Blood Pressure */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={22} color="#EF4444" />
            </div>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: '900',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              backgroundColor: currentVitals.bp.status === 'STAGE_1_HTN' ? '#FEF3C7' : '#D1FAE5',
              color: currentVitals.bp.status === 'STAGE_1_HTN' ? '#B45309' : '#047857'
            }}>
              {currentVitals.bp.status === 'STAGE_1_HTN' ? 'STAGE-1 HYPERTENSION' : 'OPTIMAL'}
            </span>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '800' }}>BLOOD PRESSURE (BP)</div>
            <div style={{ fontSize: '1.85rem', fontWeight: '900', color: '#0F172A', marginTop: '0.1rem' }}>
              {currentVitals.bp.systolic}/{currentVitals.bp.diastolic} <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '600' }}>mmHg</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>
              Normal: &lt; 120/80 mmHg • {currentVitals.bp.time}
            </div>
          </div>
        </div>

        {/* 2. Blood Sugar Glucose */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Droplet size={22} color="#0284C7" />
            </div>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: '900',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              backgroundColor: currentVitals.sugar.status === 'ELEVATED' ? '#FEE2E2' : '#D1FAE5',
              color: currentVitals.sugar.status === 'ELEVATED' ? '#B91C1C' : '#047857'
            }}>
              {currentVitals.sugar.status === 'ELEVATED' ? 'ELEVATED GLUCOSE' : 'NORMAL (FASTING)'}
            </span>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '800' }}>BLOOD GLUCOSE (FBS)</div>
            <div style={{ fontSize: '1.85rem', fontWeight: '900', color: '#0F172A', marginTop: '0.1rem' }}>
              {currentVitals.sugar.fbs} <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '600' }}>mg/dL</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>
              Post-Meal PPBS: {currentVitals.sugar.ppbs} mg/dL • {currentVitals.sugar.time}
            </div>
          </div>
        </div>

        {/* 3. Heart Rate Pulse */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={22} color="#7C3AED" />
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: '900', padding: '0.2rem 0.6rem', borderRadius: '6px', backgroundColor: '#D1FAE5', color: '#047857' }}>
              RESTING NORMAL
            </span>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '800' }}>HEART RATE / PULSE</div>
            <div style={{ fontSize: '1.85rem', fontWeight: '900', color: '#0F172A', marginTop: '0.1rem' }}>
              {currentVitals.pulse.bpm} <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '600' }}>BPM</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>
              Target: 60 - 100 BPM • {currentVitals.pulse.time}
            </div>
          </div>
        </div>

        {/* 4. Blood Oxygen SpO2 */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#E0F2F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wind size={22} color="#006B70" />
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: '900', padding: '0.2rem 0.6rem', borderRadius: '6px', backgroundColor: '#D1FAE5', color: '#047857' }}>
              EXCELLENT
            </span>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '800' }}>OXYGEN SATURATION (SpO2)</div>
            <div style={{ fontSize: '1.85rem', fontWeight: '900', color: '#0F172A', marginTop: '0.1rem' }}>
              {currentVitals.spo2.percent}%
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>
              Normal: 95% - 100% • Pulse Oximeter Log
            </div>
          </div>
        </div>

        {/* 5. BMI & Weight */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Scale size={22} color="#D97706" />
            </div>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: '900',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              backgroundColor: currentVitals.weight.status === 'OVERWEIGHT' ? '#FEF3C7' : '#D1FAE5',
              color: currentVitals.weight.status === 'OVERWEIGHT' ? '#B45309' : '#047857'
            }}>
              BMI {currentVitals.weight.bmi} ({currentVitals.weight.status})
            </span>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '800' }}>WEIGHT & BODY MASS</div>
            <div style={{ fontSize: '1.85rem', fontWeight: '900', color: '#0F172A', marginTop: '0.1rem' }}>
              {currentVitals.weight.kg} <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '600' }}>kg</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>
              Height: {currentVitals.weight.heightCm} cm • Normal BMI: 18.5 - 24.9
            </div>
          </div>
        </div>

        {/* 6. Body Temperature */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Thermometer size={22} color="#475569" />
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: '900', padding: '0.2rem 0.6rem', borderRadius: '6px', backgroundColor: '#D1FAE5', color: '#047857' }}>
              AFEBRILE (NORMAL)
            </span>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '800' }}>BODY TEMPERATURE</div>
            <div style={{ fontSize: '1.85rem', fontWeight: '900', color: '#0F172A', marginTop: '0.1rem' }}>
              {currentVitals.temp.fahrenheit}° <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '600' }}>F</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>
              Normal: 97.8°F - 99.0°F (36.5°C - 37.2°C)
            </div>
          </div>
        </div>

      </div>

      {/* Historical Vitals Log Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '22px', border: '1.5px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ padding: '1.25rem 1.5rem', backgroundColor: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
              Recent Vitals Log History — {currentVitals.name}
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>Daily recordings synced with Care Seeker Health Locker.</p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F1F5F9', color: '#475569', fontWeight: '800', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>Date</th>
                <th style={{ padding: '0.85rem 1rem' }}>Blood Pressure (mmHg)</th>
                <th style={{ padding: '0.85rem 1rem' }}>Fasting Sugar (mg/dL)</th>
                <th style={{ padding: '0.85rem 1rem' }}>Pulse (BPM)</th>
                <th style={{ padding: '0.85rem 1rem' }}>SpO2 (%)</th>
                <th style={{ padding: '0.85rem 1rem' }}>BMI</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {currentVitals.history.map((log, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '0.85rem 1.25rem', fontWeight: '700', color: '#0F172A' }}>{log.date}</td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: '800', color: '#006B70' }}>{log.bp}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#334155' }}>{log.fbs}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#334155' }}>{log.pulse}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#059669', fontWeight: '700' }}>{log.spo2}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#334155' }}>{log.bmi}</td>
                  <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.72rem', backgroundColor: '#D1FAE5', color: '#047857', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>
                      ✓ RECORDED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Log New Vitals */}
      {showLogModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '22px',
            width: '100%',
            maxWidth: '520px',
            padding: '1.75rem',
            boxShadow: '0 20px 48px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                  Log Daily Vital Readings
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>For: {currentVitals.name}</div>
              </div>
              <button
                onClick={() => setShowLogModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveVitals} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={inputBpSys}
                    onChange={(e) => setInputBpSys(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={inputBpDia}
                    onChange={(e) => setInputBpDia(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Fasting Sugar (mg/dL)</label>
                  <input
                    type="number"
                    value={inputSugar}
                    onChange={(e) => setInputSugar(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Pulse Rate (BPM)</label>
                  <input
                    type="number"
                    value={inputPulse}
                    onChange={(e) => setInputPulse(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>SpO2 (%)</label>
                  <input
                    type="number"
                    value={inputSpo2}
                    onChange={(e) => setInputSpo2(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputWeight}
                    onChange={(e) => setInputWeight(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  style={{ padding: '0.55rem 1.1rem', backgroundColor: '#E2E8F0', color: '#334155', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.84rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.55rem 1.4rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.84rem', cursor: 'pointer' }}
                >
                  Save Readings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
