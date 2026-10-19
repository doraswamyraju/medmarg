import React, { useState } from 'react';
import { 
  Navigation, 
  UserCheck, 
  Thermometer, 
  CheckCircle, 
  Shield, 
  Award,
  Activity,
  FolderHeart,
  FileText
} from 'lucide-react';

export default function LandingFeaturesShowcase() {
  const [activeVitalTab, setActiveVitalTab] = useState('SUGAR'); // 'SUGAR' | 'BP' | 'LIPID'

  return (
    <>
      {/* 🚀 FEATURE SHOWCASE A: LIVE PHLEBOTOMIST MAP TRACKER & IOT COLD-CHAIN TELEMETRY */}
      <section id="tracker-feature" className="landing-feature-section" style={{ padding: '4.5rem 1.25rem', backgroundColor: '#0F172A', color: '#FFFFFF', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '3rem', alignItems: 'center' }}>
            
            {/* Left Column: Deep Feature Explanation */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.85rem', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '800', marginBottom: '1rem', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                <Navigation size={16} /> CORE PLATFORM INNOVATION
              </div>

              <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#FFFFFF', lineHeight: '1.18', marginBottom: '1rem' }}>
                State-of-the-Art Precision GPS Map Tracking & 4°C Cold-Chain Telemetry
              </h2>

              <p style={{ color: '#94A3B8', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                Never wonder when your lab technician will arrive. MedMarg brings live GPS tracking, doorstep OTP verification, and smart temperature sensors to home sample collection.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#1E293B', color: '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #334155' }}>
                    <Navigation size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: '800', color: '#FFFFFF', fontSize: '1.05rem' }}>Real-Time Phlebotomist Live Map</h4>
                    <p style={{ color: '#94A3B8', fontSize: '0.88rem', marginTop: '0.25rem', lineHeight: '1.4' }}>
                      Watch your assigned phlebotomist move on the map with estimated arrival time (ETA), phone contact, and vehicle details.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#1E293B', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #334155' }}>
                    <UserCheck size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: '800', color: '#FFFFFF', fontSize: '1.05rem' }}>4-Digit Handover Security OTP</h4>
                    <p style={{ color: '#94A3B8', fontSize: '0.88rem', marginTop: '0.25rem', lineHeight: '1.4' }}>
                      Verify the identity of your lab technician at your doorstep using a secure 4-digit code to prevent unauthorized impersonation.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#1E293B', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #334155' }}>
                    <Thermometer size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: '800', color: '#FFFFFF', fontSize: '1.05rem' }}>IoT Cold-Chain Telemetry (2°C - 8°C)</h4>
                    <p style={{ color: '#94A3B8', fontSize: '0.88rem', marginTop: '0.25rem', lineHeight: '1.4' }}>
                      Blood samples are stored inside temperature-monitored carry bags linked to our IoT cloud—ensuring zero sample hemolysis or degradation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Tracking Visual Flow HUD */}
            <div style={{ backgroundColor: '#1E293B', borderRadius: '24px', border: '1px solid #334155', padding: '2rem', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>
              
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#38BDF8', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
                SAMPLE FULFILLMENT TIMELINE
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.75rem' }}>
                <div style={{ backgroundColor: '#0F172A', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid #10B981', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CheckCircle size={20} color="#10B981" />
                    <div>
                      <div style={{ fontWeight: '800', color: '#FFF', fontSize: '0.9rem' }}>1. Slot Confirmed & Technician Assigned</div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Phlebo: Ramesh Kumar (ID: AG-01)</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#10B981' }}>COMPLETED</span>
                </div>

                <div style={{ backgroundColor: '#0F172A', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid #38BDF8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Navigation size={20} color="#38BDF8" />
                    <div>
                      <div style={{ fontWeight: '800', color: '#FFF', fontSize: '0.9rem' }}>2. Live En-Route to Patient Home</div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Distance: 1.8 km • ETA 12 mins</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#38BDF8' }}>IN PROGRESS</span>
                </div>

                <div style={{ backgroundColor: '#0F172A', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.7 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Shield size={20} color="#F59E0B" />
                    <div>
                      <div style={{ fontWeight: '800', color: '#FFF', fontSize: '0.9rem' }}>3. OTP Handover & Cold Box Storage</div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Doorstep Security OTP: 4892</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B' }}>NEXT</span>
                </div>

                <div style={{ backgroundColor: '#0F172A', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Award size={20} color="#A855F7" />
                    <div>
                      <div style={{ fontWeight: '800', color: '#FFF', fontSize: '0.9rem' }}>4. NABL Lab Processing & WhatsApp Sync</div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Digital PDF Report Auto-Sent</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B' }}>PENDING</span>
                </div>
              </div>

              {/* Bottom Sensor Telemetry Meter */}
              <div style={{ backgroundColor: '#0F172A', padding: '1rem', borderRadius: '14px', border: '1px solid #38BDF8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Thermometer size={20} color="#38BDF8" />
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#E2E8F0' }}>Live Container Temp Sensor</span>
                </div>
                <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#10B981' }}>4.2°C (Optimal)</span>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 📊 FEATURE SHOWCASE B: INTERACTIVE HEALTH VITALS RADAR & TREND CURVES */}
      <section id="vitals-feature" className="landing-feature-section" style={{ padding: '4.5rem 1.25rem', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '3rem', alignItems: 'center' }}>
            
            {/* Left Column: Feature Explanation */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.85rem', backgroundColor: '#E0F2F1', color: '#005F60', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '800', marginBottom: '1rem' }}>
                <Activity size={16} /> PATIENT HEALTH MONITORING
              </div>

              <h2 style={{ fontSize: '2.4rem', fontWeight: '900', color: '#0F172A', lineHeight: '1.2', marginBottom: '1rem' }}>
                Interactive Health Vitals & Biomarker Trend Radar
              </h2>

              <p style={{ color: '#475569', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
                MedMarg goes beyond delivering raw test numbers. Our smart health engine automatically plots your blood metrics, blood pressure, fasting glucose, and lipid trends into graphical curve graphs—helping you detect risk early.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ECFDF5', color: '#065F46', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '900' }}>✓</div>
                  <div>
                    <h4 style={{ fontWeight: '800', color: '#0F172A', fontSize: '1rem' }}>Longitudinal 7-Day & 30-Day Trend Curve Graphs</h4>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '0.2rem' }}>Canvas-drawn spline curves visualizing Systolic/Diastolic BP and Fasting Sugar levels over time.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ECFDF5', color: '#065F46', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '900' }}>✓</div>
                  <div>
                    <h4 style={{ fontWeight: '800', color: '#0F172A', fontSize: '1rem' }}>Normal Reference Range Meters</h4>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '0.2rem' }}>Instant green/amber/red indicators comparing your results against NABL clinical benchmarks.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ECFDF5', color: '#065F46', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '900' }}>✓</div>
                  <div>
                    <h4 style={{ fontWeight: '800', color: '#0F172A', fontSize: '1rem' }}>Linked Family Health Sync</h4>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '0.2rem' }}>Monitor vitals for elderly parents or family members from a single unified master dashboard.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Vitals Dashboard Card Mockup */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 20px 45px -10px rgba(0,95,96,0.12)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #F1F5F9' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#005F60' }}>PATIENT VITALS RADAR</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>Rahul Sharma • 32 Yrs (Male)</div>
                </div>
                <span style={{ padding: '0.3rem 0.75rem', backgroundColor: '#D1FAE5', color: '#065F46', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '800' }}>
                  Optimal Vitals
                </span>
              </div>

              {/* Interactive Tabs */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <button 
                  onClick={() => setActiveVitalTab('SUGAR')}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: 'none', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', backgroundColor: activeVitalTab === 'SUGAR' ? '#005F60' : '#F1F5F9', color: activeVitalTab === 'SUGAR' ? '#FFF' : '#475569' }}
                >
                  Blood Glucose
                </button>
                <button 
                  onClick={() => setActiveVitalTab('BP')}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: 'none', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', backgroundColor: activeVitalTab === 'BP' ? '#005F60' : '#F1F5F9', color: activeVitalTab === 'BP' ? '#FFF' : '#475569' }}
                >
                  Blood Pressure
                </button>
                <button 
                  onClick={() => setActiveVitalTab('LIPID')}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: 'none', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', backgroundColor: activeVitalTab === 'LIPID' ? '#005F60' : '#F1F5F9', color: activeVitalTab === 'LIPID' ? '#FFF' : '#475569' }}
                >
                  Lipid Profile
                </button>
              </div>

              {/* Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>
                    {activeVitalTab === 'SUGAR' ? 'FASTING GLUCOSE' : activeVitalTab === 'BP' ? 'BLOOD PRESSURE' : 'TOTAL CHOLESTEROL'}
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>
                    {activeVitalTab === 'SUGAR' ? '94 mg/dL' : activeVitalTab === 'BP' ? '118/78 mmHg' : '172 mg/dL'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: '800', marginTop: '0.3rem' }}>
                    ✓ Normal Range
                  </div>
                </div>

                <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>
                    {activeVitalTab === 'SUGAR' ? 'HbA1c (3-MONTH AVG)' : activeVitalTab === 'BP' ? 'PULSE RATE' : 'TRIGLYCERIDES'}
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>
                    {activeVitalTab === 'SUGAR' ? '5.4%' : activeVitalTab === 'BP' ? '72 bpm' : '128 mg/dL'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: '800', marginTop: '0.3rem' }}>
                    ✓ Non-Diabetic Tier
                  </div>
                </div>
              </div>

              {/* Dynamic Curve Graph Graphic Box */}
              <div style={{ backgroundColor: '#0F172A', borderRadius: '16px', padding: '1.25rem', color: '#FFF' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#38BDF8' }}>
                    {activeVitalTab === 'SUGAR' ? '7-DAY FASTING GLUCOSE TREND CURVE' : activeVitalTab === 'BP' ? 'BLOOD PRESSURE VARIATION' : 'LIPID BIOMARKER SPECTRUM'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Verified NABL Lab Data</span>
                </div>

                <svg viewBox="0 0 300 70" style={{ width: '100%', height: '65px' }}>
                  <path d="M0 50 Q 60 15, 120 40 T 240 25 T 300 45" fill="none" stroke="#10B981" strokeWidth="3" />
                  <circle cx="120" cy="40" r="4" fill="#38BDF8" />
                  <circle cx="240" cy="25" r="4" fill="#38BDF8" />
                </svg>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 📂 FEATURE SHOWCASE C: NABL HEALTH LOCKER & REPORT SYNC */}
      <section id="locker-feature" className="landing-feature-section" style={{ padding: '4.5rem 1.25rem', backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '3rem', alignItems: 'center' }}>
            
            {/* Left Column: Locker Preview Box */}
            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FolderHeart size={26} color="#005F60" />
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>NABL Digital Health Locker</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>ABDM Health ID Verified • Encrypted Cloud</div>
                  </div>
                </div>
                <span style={{ padding: '0.3rem 0.65rem', backgroundColor: '#E0F2F1', color: '#005F60', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800' }}>
                  256-Bit SSL
                </span>
              </div>

              {/* Sample PDF Report Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ backgroundColor: '#FFF', padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FileText size={22} color="#005F60" />
                    <div>
                      <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.9rem' }}>NABL_CBC_Report_Rahul.pdf</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Complete Blood Count • 2 Oct 2026</div>
                    </div>
                  </div>
                  <span style={{ padding: '0.35rem 0.75rem', backgroundColor: '#10B981', color: '#FFF', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800' }}>
                    Download PDF
                  </span>
                </div>

                <div style={{ backgroundColor: '#FFF', padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FileText size={22} color="#005F60" />
                    <div>
                      <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.9rem' }}>Full_Body_Wellness_Report.pdf</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>87 Parameters • 18 Sep 2026</div>
                    </div>
                  </div>
                  <span style={{ padding: '0.35rem 0.75rem', backgroundColor: '#10B981', color: '#FFF', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800' }}>
                    Download PDF
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Feature Explanation */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.85rem', backgroundColor: '#E0F2F1', color: '#005F60', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '800', marginBottom: '1rem' }}>
                <FolderHeart size={16} /> LIFETIME DIGITAL STORAGE
              </div>

              <h2 style={{ fontSize: '2.4rem', fontWeight: '900', color: '#0F172A', lineHeight: '1.2', marginBottom: '1rem' }}>
                NABL Certified Reports & Automated WhatsApp Sync
              </h2>

              <p style={{ color: '#475569', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
                Never lose a paper lab report again. Every diagnostic test completed with MedMarg is digitally signed by NABL certified pathologists and stored permanently in your secure account.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ECFDF5', color: '#065F46', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '900' }}>✓</div>
                  <div>
                    <h4 style={{ fontWeight: '800', color: '#0F172A', fontSize: '1rem' }}>Automated WhatsApp & Google Drive Delivery</h4>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '0.2rem' }}>Reports automatically land in your WhatsApp inbox and Google Drive as soon as verified by lab pathologists.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ECFDF5', color: '#065F46', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '900' }}>✓</div>
                  <div>
                    <h4 style={{ fontWeight: '800', color: '#0F172A', fontSize: '1rem' }}>1-Click Encrypted Doctor Sharing</h4>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '0.2rem' }}>Generate password-protected secure share links to send test result bundles directly to consulting doctors.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>
    </>
  );
}
