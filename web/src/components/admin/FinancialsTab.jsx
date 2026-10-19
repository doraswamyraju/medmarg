import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Receipt, 
  FileText, 
  Building2, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Download,
  CreditCard,
  Percent,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { API_BASE, safeFetch } from '../../data/apiConfig';

export default function FinancialsTab({ transactions = [] }) {
  const [activeSubTab, setActiveSubTab] = useState('INVOICE_CONFIG'); // 'INVOICE_CONFIG' | 'TRANSACTIONS'

  // GST Invoice Business Settings State
  const [invoiceSettings, setInvoiceSettings] = useState({
    companyName: 'MedMarg Healthcare & Multi-Lab Logistics Pvt Ltd',
    tradeName: 'MedMarg Diagnostics',
    gstin: '37AABCM8921F1ZX',
    pan: 'AABCM8921F',
    sacCode: '999312', // SAC code for medical & diagnostic tests
    gstRatePercent: 0, // Diagnostic services exempt under GST SAC 999312 (Notification No. 12/2017)
    stateName: 'Andhra Pradesh',
    stateCode: '37',
    registeredAddress: 'Plot 42, Ground & 1st Floor, Air Bypass Road, Tirupati, Andhra Pradesh - 517501',
    billingContactEmail: 'billing@medmarg.com',
    billingContactPhone: '+91 91799 79911',
    authorizedSignatory: 'Finance & Compliance Officer (MedMarg Diagnostics)',
    invoicePrefix: 'MM-INV-2026-',
    declarationNotes: 'Medical & Diagnostic Pathological Services exempt under Sl. No. 74 of Notification No. 12/2017-Central Tax (Rate).'
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Fetch live settings on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/v1/admin/invoice-settings`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setInvoiceSettings(prev => ({ ...prev, ...data.settings }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveInvoiceSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSaveSuccess(false);
    setSaveError('');

    try {
      const res = await safeFetch(`${API_BASE}/api/v1/admin/invoice-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceSettings)
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setSaveError(data.error || 'Failed to save GST configuration');
      }
    } catch (err) {
      setSaveError(err.message || 'Connection error while saving');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      
      {/* Top Banner */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '1.75rem 2rem',
        border: '1.5px solid #E2E8F0',
        boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.74rem', backgroundColor: '#E0F2F1', color: '#006B70', padding: '0.2rem 0.65rem', borderRadius: '6px', fontWeight: '900' }}>
              FINANCIALS & BILLING DESK
            </span>
            <span style={{ fontSize: '0.74rem', backgroundColor: '#DCFCE7', color: '#15803D', padding: '0.2rem 0.65rem', borderRadius: '6px', fontWeight: '800' }}>
              ✓ GST SAC 999312 Statutory Standard
            </span>
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
            GST Tax Invoice Configuration & Settlement Ledger
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>
            Manage legal invoicing parameters, GSTIN, SAC codes, and review patient diagnostic payments.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#F1F5F9', padding: '0.35rem', borderRadius: '12px' }}>
          <button
            onClick={() => setActiveSubTab('INVOICE_CONFIG')}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: '9px',
              border: 'none',
              fontWeight: '800',
              fontSize: '0.85rem',
              cursor: 'pointer',
              backgroundColor: activeSubTab === 'INVOICE_CONFIG' ? '#006B70' : 'transparent',
              color: activeSubTab === 'INVOICE_CONFIG' ? '#FFFFFF' : '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Receipt size={16} /> GST Invoice Preparation Setup
          </button>

          <button
            onClick={() => setActiveSubTab('TRANSACTIONS')}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: '9px',
              border: 'none',
              fontWeight: '800',
              fontSize: '0.85rem',
              cursor: 'pointer',
              backgroundColor: activeSubTab === 'TRANSACTIONS' ? '#006B70' : 'transparent',
              color: activeSubTab === 'TRANSACTIONS' ? '#FFFFFF' : '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease'
            }}
          >
            <CreditCard size={16} /> Patient Payments Ledger ({transactions.length})
          </button>
        </div>
      </div>

      {/* SUBTAB 1: GST INVOICE PREPARATION CONFIGURATION */}
      {activeSubTab === 'INVOICE_CONFIG' && (
        <form onSubmit={handleSaveInvoiceSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {saveSuccess && (
            <div style={{ backgroundColor: '#D1FAE5', border: '1.5px solid #34D399', color: '#065F46', padding: '1rem 1.5rem', borderRadius: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <CheckCircle2 size={20} color="#059669" />
              <span>GST Tax Invoice configuration updated! All patient receipts will now render using these statutory details.</span>
            </div>
          )}

          {saveError && (
            <div style={{ backgroundColor: '#FEE2E2', border: '1.5px solid #F87171', color: '#991B1B', padding: '1rem 1.5rem', borderRadius: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <AlertCircle size={20} color="#DC2626" />
              <span>{saveError}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            
            {/* Box 1: Legal Entity & Tax Identifiers */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.75rem', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                <Building2 size={18} color="#006B70" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                  Statutory Entity & GST Details
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>
                    REGISTERED LEGAL COMPANY NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={invoiceSettings.companyName}
                    onChange={(e) => setInvoiceSettings({ ...invoiceSettings, companyName: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem', fontWeight: '700' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>
                    TRADE NAME (PRINTED ON INVOICE HEADER)
                  </label>
                  <input
                    type="text"
                    value={invoiceSettings.tradeName}
                    onChange={(e) => setInvoiceSettings({ ...invoiceSettings, tradeName: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>
                      GSTIN NUMBER *
                    </label>
                    <input
                      type="text"
                      required
                      value={invoiceSettings.gstin}
                      onChange={(e) => setInvoiceSettings({ ...invoiceSettings, gstin: e.target.value.toUpperCase() })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem', fontWeight: '800', letterSpacing: '1px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>
                      PAN NUMBER
                    </label>
                    <input
                      type="text"
                      value={invoiceSettings.pan}
                      onChange={(e) => setInvoiceSettings({ ...invoiceSettings, pan: e.target.value.toUpperCase() })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem', fontWeight: '800', letterSpacing: '1px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>
                      SAC CODE (DIAGNOSTICS)
                    </label>
                    <input
                      type="text"
                      value={invoiceSettings.sacCode}
                      onChange={(e) => setInvoiceSettings({ ...invoiceSettings, sacCode: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem', fontWeight: '700' }}
                    />
                    <span style={{ fontSize: '0.7rem', color: '#006B70', marginTop: '0.2rem', display: 'block' }}>
                      999312: Medical & Diagnostic Services
                    </span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>
                      APPLICABLE GST RATE (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={invoiceSettings.gstRatePercent}
                      onChange={(e) => setInvoiceSettings({ ...invoiceSettings, gstRatePercent: Number(e.target.value) })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem', fontWeight: '800' }}
                    />
                    <span style={{ fontSize: '0.7rem', color: '#15803D', marginTop: '0.2rem', display: 'block' }}>
                      Exempt / 0% under Notification 12/2017
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>
                      SUPPLY STATE
                    </label>
                    <input
                      type="text"
                      value={invoiceSettings.stateName}
                      onChange={(e) => setInvoiceSettings({ ...invoiceSettings, stateName: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>
                      STATE CODE
                    </label>
                    <input
                      type="text"
                      value={invoiceSettings.stateCode}
                      onChange={(e) => setInvoiceSettings({ ...invoiceSettings, stateCode: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem', fontWeight: '700' }}
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Box 2: Registered Address & Communication */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.75rem', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                <MapPin size={18} color="#006B70" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                  Registered Address & Signatory
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>
                    REGISTERED BILLING ADDRESS *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={invoiceSettings.registeredAddress}
                    onChange={(e) => setInvoiceSettings({ ...invoiceSettings, registeredAddress: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem', lineHeight: 1.5 }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>
                      BILLING CONTACT EMAIL
                    </label>
                    <input
                      type="email"
                      value={invoiceSettings.billingContactEmail}
                      onChange={(e) => setInvoiceSettings({ ...invoiceSettings, billingContactEmail: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>
                      BILLING PHONE HELPLINE
                    </label>
                    <input
                      type="text"
                      value={invoiceSettings.billingContactPhone}
                      onChange={(e) => setInvoiceSettings({ ...invoiceSettings, billingContactPhone: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>
                    INVOICE NUMBERING PREFIX
                  </label>
                  <input
                    type="text"
                    value={invoiceSettings.invoicePrefix}
                    onChange={(e) => setInvoiceSettings({ ...invoiceSettings, invoicePrefix: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem', fontWeight: '700' }}
                  />
                  <span style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.2rem', display: 'block' }}>
                    Example invoice will be: <strong>{invoiceSettings.invoicePrefix}8921</strong>
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>
                    AUTHORIZED SIGNATORY TITLE
                  </label>
                  <input
                    type="text"
                    value={invoiceSettings.authorizedSignatory}
                    onChange={(e) => setInvoiceSettings({ ...invoiceSettings, authorizedSignatory: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>
                    STATUTORY TAX EXEMPTION DECLARATION / FOOTER NOTE
                  </label>
                  <textarea
                    rows={2}
                    value={invoiceSettings.declarationNotes}
                    onChange={(e) => setInvoiceSettings({ ...invoiceSettings, declarationNotes: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.82rem' }}
                  />
                </div>

              </div>
            </div>

          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', padding: '1rem 0' }}>
            <button
              type="submit"
              disabled={savingSettings}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: '#006B70',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '900',
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(0,107,112,0.3)'
              }}
            >
              <Save size={18} />
              <span>{savingSettings ? 'Saving Configuration...' : 'Save GST Invoice Configuration'}</span>
            </button>
          </div>

        </form>
      )}

      {/* SUBTAB 2: TRANSACTIONS TABLE */}
      {activeSubTab === 'TRANSACTIONS' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1.5px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: '900', fontSize: '1.1rem', color: '#0F172A' }}>
              Logged Patient Receipts & Gateway Settlements
            </div>
            <span style={{ fontSize: '0.78rem', backgroundColor: '#E0F2F1', color: '#006B70', padding: '0.25rem 0.75rem', borderRadius: '20px', fontWeight: '800' }}>
              Razorpay & Doorstep UPI
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
                <th style={{ padding: '1rem 1.25rem' }}>TRANSACTION ID</th>
                <th style={{ padding: '1rem' }}>ORDER ID</th>
                <th style={{ padding: '1rem' }}>PATIENT</th>
                <th style={{ padding: '1rem' }}>PAYMENT MODE</th>
                <th style={{ padding: '1rem' }}>AMOUNT (₹)</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(txn => (
                <tr key={txn.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', color: '#006B70', fontWeight: '800' }}>{txn.id}</td>
                  <td style={{ padding: '1rem', color: '#B45309', fontWeight: '700' }}>{txn.orderId}</td>
                  <td style={{ padding: '1rem', color: '#0F172A', fontWeight: '700' }}>{txn.patient}</td>
                  <td style={{ padding: '1rem', color: '#334155' }}>{txn.mode}</td>
                  <td style={{ padding: '1rem', fontWeight: '900', color: '#059669' }}>₹{txn.amount}</td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '800', backgroundColor: '#DCFCE7', color: '#15803D' }}>
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
