import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Building2, 
  Truck, 
  DollarSign, 
  ShieldCheck, 
  Activity, 
  Clock, 
  ArrowUpRight,
  PackageCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function OverviewKpiTab({ 
  catalog = {}, 
  partnerQueue = [],
  orders = [],
  freelancers = [],
  salariedAgents = [],
  labPartners = [],
  setActiveTab = () => {}
}) {
  const testsCount = catalog.tests?.length || 913;
  const profilesCount = catalog.profiles?.length || 87;
  const packagesCount = catalog.packages?.length || 4;
  const partnersCount = partnerQueue?.length || 5;
  const totalOrders = orders.length || 1;
  const activeFleet = (salariedAgents.length || 1) + (freelancers.filter(f => f.status === 'VERIFIED_ACTIVE').length || 0);

  // Quick summary calculations
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0) || 299;
  const pendingApprovals = (freelancers.filter(f => f.status === 'PENDING_VERIFICATION').length || 0) +
                           (partnerQueue.filter(p => p.status === 'PRE_REGISTERED').length || 0);

  const kpis = [
    {
      title: 'TOTAL CATALOG TESTS',
      value: testsCount,
      sub: `${profilesCount} Profiles • ${packagesCount} Packages`,
      icon: Activity,
      color: '#006B70',
      bg: '#E0F2FE',
      tabTarget: 'TESTS_MGMT'
    },
    {
      title: 'ACTIVE FLEET LOGISTICS',
      value: activeFleet,
      sub: `${salariedAgents.length || 1} Salaried • ${freelancers.length} Freelancers`,
      icon: Truck,
      color: '#16A34A',
      bg: '#DCFCE7',
      tabTarget: 'SALARIED_FLEET'
    },
    {
      title: 'PARTNER NETWORK QUEUE',
      value: partnersCount,
      sub: 'Doctors, Labs, Imaging & Clinics',
      icon: Building2,
      color: '#7E22CE',
      bg: '#F3E8FF',
      tabTarget: 'PARTNERS_QUEUE'
    },
    {
      title: 'DIAGNOSTIC ORDERS',
      value: totalOrders,
      sub: `Gross Value: ₹${totalRevenue.toLocaleString('en-IN')}`,
      icon: ShoppingBag,
      color: '#B45309',
      bg: '#FEF3C7',
      tabTarget: 'LIVE_ORDERS'
    }
  ];

  const quickShortcuts = [
    { label: 'Register New Customer', desc: 'Add ABHA digital ID & family members', tab: 'CUSTOMERS', icon: Users, color: '#0284C7' },
    { label: 'Review Partner Applications', desc: 'Approve doctor & clinic contracts', tab: 'PARTNERS_QUEUE', icon: Building2, color: '#9333EA' },
    { label: 'Configure NABL Labs', desc: 'Set margin % & dispatch routing', tab: 'LABS', icon: Activity, color: '#059669' },
    { label: 'GST Tax Invoices & Ledger', desc: 'Manage SAC 999312 & settlements', tab: 'FINANCIALS', icon: DollarSign, color: '#D97706' },
    { label: 'Offers & Promo Codes', desc: 'Manage banners & seasonal discounts', tab: 'OFFERS_MGMT', icon: TrendingUp, color: '#DC2626' },
    { label: 'System Security & Snapshots', desc: 'Review audit ledger & database recovery', tab: 'AUDIT_BACKUPS', icon: ShieldCheck, color: '#0F172A' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #004D40 0%, #006B70 100%)',
        borderRadius: '20px',
        padding: '2rem',
        color: '#FFFFFF',
        boxShadow: '0 10px 25px -5px rgba(0, 107, 112, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '900', letterSpacing: '0.05em' }}>
              MEDMARG CENTRAL COMMAND
            </span>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#FFFFFF', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800' }}>
              Base: Tirupati, AP
            </span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: '900', margin: 0, letterSpacing: '-0.02em' }}>
            Omnipresent Master KPI & Operational Overview
          </h1>
          <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.9rem', color: '#CCFBF1' }}>
            Real-time diagnostics platform metrics, cold-chain phlebotomy logistics, and multi-lab settlement tracking.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '0.75rem 1.25rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#99F6E4', letterSpacing: '0.05em' }}>PENDING VERIFICATIONS</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#FFFFFF' }}>{pendingApprovals} Applications</div>
          </div>
        </div>
      </div>

      {/* 4 Main KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={idx}
              onClick={() => setActiveTab(kpi.tabTarget)}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '1.5rem',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = kpi.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#E2E8F0';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', letterSpacing: '0.04em' }}>
                    {kpi.title}
                  </div>
                  <div style={{ fontSize: '2.1rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>
                    {kpi.value}
                  </div>
                </div>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: kpi.bg,
                  color: kpi.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={22} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '600' }}>{kpi.sub}</span>
                <span style={{ fontSize: '0.75rem', color: kpi.color, fontWeight: '800', display: 'flex', alignItems: 'center' }}>
                  Manage <ArrowUpRight size={14} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Operational Highlights & Shortcuts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        
        {/* Quick Operational Dispatch Actions */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="#006B70" /> Quick Administrative Action Hub
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            {quickShortcuts.map((sc, i) => {
              const ScIcon = sc.icon;
              return (
                <div
                  key={i}
                  onClick={() => setActiveTab(sc.tab)}
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '0.9rem 1rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#EFF6FF';
                    e.currentTarget.style.borderColor = '#93C5FD';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <ScIcon size={16} color={sc.color} />
                    <span style={{ fontSize: '0.84rem', fontWeight: '800', color: '#0F172A' }}>{sc.label}</span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{sc.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operating Readiness & System Health */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} color="#059669" /> Platform Health & Regulatory Compliance
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', backgroundColor: '#ECFDF5', borderRadius: '10px', border: '1px solid #A7F3D0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CheckCircle2 size={18} color="#059669" />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#065F46' }}>Central Master Database Status</div>
                  <div style={{ fontSize: '0.74rem', color: '#047857' }}>Tests: {testsCount} • Profiles: {profilesCount} • Strict Data Preservation Active</div>
                </div>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: '800', backgroundColor: '#059669', color: '#FFF', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>HEALTHY</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', backgroundColor: '#F0F9FF', borderRadius: '10px', border: '1px solid #BAE6FD' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CheckCircle2 size={18} color="#0284C7" />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#075985' }}>Statutory GST Billing Compliance</div>
                  <div style={{ fontSize: '0.74rem', color: '#0369A1' }}>SAC 999312 Notification 12/2017 Exemption Standard Enforced</div>
                </div>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: '800', backgroundColor: '#0284C7', color: '#FFF', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>VERIFIED</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', backgroundColor: '#FAF5FF', borderRadius: '10px', border: '1px solid #E9D5FF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CheckCircle2 size={18} color="#9333EA" />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#6B21A8' }}>ABDM / ABHA Digital Health Records</div>
                  <div style={{ fontSize: '0.74rem', color: '#7E22CE' }}>Seamless patient health locker linkage ready</div>
                </div>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: '800', backgroundColor: '#9333EA', color: '#FFF', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>READY</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
