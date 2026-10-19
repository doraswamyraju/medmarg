import React, { useRef } from 'react';
import { 
  Printer, 
  Download, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  CreditCard,
  FileText
} from 'lucide-react';

export default function OrderGstInvoiceModal({ 
  isOpen, 
  onClose, 
  order, 
  invoiceSettings = null 
}) {
  if (!isOpen || !order) return null;

  const invoicePrintRef = useRef(null);

  const defaultSettings = {
    companyName: 'MedMarg Healthcare & Multi-Lab Logistics Pvt Ltd',
    tradeName: 'MedMarg Diagnostics',
    gstin: '37AABCM8921F1ZX',
    pan: 'AABCM8921F',
    sacCode: '999312',
    gstRatePercent: 0,
    stateName: 'Andhra Pradesh',
    stateCode: '37',
    registeredAddress: 'Plot 42, Ground & 1st Floor, Air Bypass Road, Tirupati, Andhra Pradesh - 517501',
    billingContactEmail: 'billing@medmarg.com',
    billingContactPhone: '+91 91799 79911',
    authorizedSignatory: 'Authorized Signatory (MedMarg Diagnostics Hub)',
    invoicePrefix: 'MM-INV-2026-',
    declarationNotes: 'Medical & Diagnostic Pathological Services exempt under Sl. No. 74 of Notification No. 12/2017-Central Tax (Rate).'
  };

  const cfg = invoiceSettings || defaultSettings;
  const invoiceNo = `${cfg.invoicePrefix || 'MM-INV-2026-'}${order.id?.replace(/[^0-9]/g, '') || '8921'}`;
  const invoiceDate = order.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  // Safe item breakdown
  let rawItems = order.items;
  let itemsList = [];
  if (Array.isArray(rawItems)) {
    itemsList = rawItems.map(it => {
      if (typeof it === 'string') return { name: it, price: Math.round((order.totalAmount || 499) / (rawItems.length || 1)), sampleType: 'SERUM', fasting: 'NO' };
      return {
        name: it.name || it.title || 'Diagnostic Test',
        price: it.price || Math.round((order.totalAmount || 499) / (rawItems.length || 1)),
        sampleType: it.sampleType || 'SERUM',
        fasting: it.fasting || 'NO'
      };
    });
  } else if (typeof rawItems === 'string' && rawItems.trim()) {
    const parts = rawItems.split(/[+,]/).map(s => s.trim()).filter(Boolean);
    itemsList = parts.map(name => ({
      name,
      price: Math.round((order.totalAmount || 499) / (parts.length || 1)),
      sampleType: 'SERUM',
      fasting: 'NO'
    }));
  } else {
    itemsList = [{ name: 'Comprehensive Pathology Test & Phlebotomy Visit', price: order.totalAmount || 499, sampleType: 'SERUM', fasting: 'NO' }];
  }

  const subTotal = itemsList.reduce((sum, it) => sum + (Number(it.price) || 0), 0);
  const gstRate = Number(cfg.gstRatePercent) || 0;
  const cgstRate = gstRate / 2;
  const sgstRate = gstRate / 2;
  const cgstAmount = Math.round((subTotal * cgstRate) / 100);
  const sgstAmount = Math.round((subTotal * sgstRate) / 100);
  const grandTotal = subTotal + cgstAmount + sgstAmount;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1.5rem',
      overflowY: 'auto'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        width: '840px',
        maxWidth: '100%',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)',
        border: '1px solid #E2E8F0',
        overflow: 'hidden'
      }}>
        
        {/* Modal Controls Header */}
        <div style={{
          padding: '1rem 1.5rem',
          backgroundColor: '#071F1A',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <FileText size={20} color="#FBBF24" />
            <div>
              <div style={{ fontSize: '1rem', fontWeight: '900' }}>Official Tax Invoice (GST Format)</div>
              <div style={{ fontSize: '0.74rem', color: '#80CBC4' }}>Invoice No: {invoiceNo} • Order #{order.id}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handlePrint}
              style={{
                padding: '0.45rem 1rem',
                backgroundColor: '#006B70',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '800',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Printer size={15} /> Print / Save PDF
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                fontSize: '1.3rem',
                fontWeight: '900',
                lineHeight: 1
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Invoice Printable Canvas */}
        <div ref={invoicePrintRef} style={{
          padding: '2.5rem',
          overflowY: 'auto',
          backgroundColor: '#FFFFFF',
          color: '#0F172A',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          
          {/* Top Title Banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #006B70', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <img src="/logo.png" alt="MedMarg" style={{ height: '32px', objectFit: 'contain' }} />
                <span style={{ fontSize: '1.3rem', fontWeight: '900', color: '#006B70' }}>{cfg.tradeName || 'MedMarg Diagnostics'}</span>
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#334155' }}>
                {cfg.companyName}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', maxWidth: '420px', lineHeight: 1.4, marginTop: '0.2rem' }}>
                {cfg.registeredAddress}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '0.35rem' }}>
                <span>GSTIN: <strong>{cfg.gstin}</strong></span> • <span>PAN: <strong>{cfg.pan}</strong></span> • <span>State: <strong>{cfg.stateName} ({cfg.stateCode})</strong></span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{
                backgroundColor: '#E0F2F1',
                color: '#006B70',
                padding: '0.35rem 0.85rem',
                borderRadius: '8px',
                fontWeight: '900',
                fontSize: '0.88rem',
                display: 'inline-block',
                marginBottom: '0.5rem'
              }}>
                TAX INVOICE
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: '900', color: '#0F172A' }}>
                Invoice No: {invoiceNo}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
                Date: <strong>{invoiceDate}</strong>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.15rem' }}>
                Place of Supply: <strong>{cfg.stateName} (State Code {cfg.stateCode})</strong>
              </div>
            </div>
          </div>

          {/* Billed To / Patient Recipient Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', backgroundColor: '#F8FAFC', padding: '1.25rem', borderRadius: '14px', border: '1px solid #E2E8F0', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: '900', color: '#006B70', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                BILLED TO (PATIENT / CARE SEEKER)
              </div>
              <div style={{ fontSize: '1rem', fontWeight: '900', color: '#0F172A' }}>
                {order.patientName || order.careSeekerName || 'Valued Patient'}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.25rem' }}>
                Contact: <strong>{order.phone || order.patientPhone || '+91 98765 43210'}</strong>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.15rem', lineHeight: 1.4 }}>
                Collection Address: {order.address || 'Plot 42, Air Bypass Road, Tirupati, AP'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: '900', color: '#006B70', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                ORDER & LAB DISPATCH DETAILS
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                Order ID: <strong style={{ color: '#0F172A' }}>#{order.id}</strong>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.2rem' }}>
                Processing Hub: <strong style={{ color: '#006B70' }}>{order.labProvider || order.labName || 'MedMarg Central Pathology Hub'}</strong>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.2rem' }}>
                Payment Mode: <strong style={{ color: '#15803D' }}>{order.paymentMode === 'PREPAID_UPI' ? 'Prepaid Online (UPI / Gateway)' : 'Doorstep UPI QR'}</strong>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.2rem' }}>
                Payment Status: <strong style={{ color: '#059669' }}>{order.paymentStatus || 'PAID'}</strong>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem', marginBottom: '1.5rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#071F1A', color: '#FFFFFF' }}>
                <th style={{ padding: '0.75rem 0.85rem', width: '40px' }}>#</th>
                <th style={{ padding: '0.75rem 0.85rem' }}>DESCRIPTION OF SERVICES / TESTS</th>
                <th style={{ padding: '0.75rem 0.85rem', width: '90px' }}>SAC CODE</th>
                <th style={{ padding: '0.75rem 0.85rem', width: '60px', textAlign: 'center' }}>QTY</th>
                <th style={{ padding: '0.75rem 0.85rem', width: '110px', textAlign: 'right' }}>RATE (₹)</th>
                <th style={{ padding: '0.75rem 0.85rem', width: '110px', textAlign: 'right' }}>AMOUNT (₹)</th>
              </tr>
            </thead>
            <tbody>
              {itemsList.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '0.75rem 0.85rem', color: '#64748B', fontWeight: '700' }}>{idx + 1}</td>
                  <td style={{ padding: '0.75rem 0.85rem' }}>
                    <div style={{ fontWeight: '800', color: '#0F172A' }}>{item.name}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B' }}>Sample: {item.sampleType || 'SERUM'} • NABL Accredited Reporting</div>
                  </td>
                  <td style={{ padding: '0.75rem 0.85rem', color: '#475569', fontWeight: '700' }}>{cfg.sacCode || '999312'}</td>
                  <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center', fontWeight: '700' }}>1</td>
                  <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right', fontWeight: '700' }}>₹{item.price}</td>
                  <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right', fontWeight: '800', color: '#0F172A' }}>₹{item.price}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Calculations & Totals */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, minWidth: '280px', backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: '900', color: '#006B70', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                STATUTORY TAX DECLARATION & NOTES
              </div>
              <p style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                {cfg.declarationNotes || 'Medical & Diagnostic Pathological Services exempt under Sl. No. 74 of Notification No. 12/2017-Central Tax (Rate).'}
              </p>
              <div style={{ fontSize: '0.74rem', color: '#15803D', fontWeight: '800', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={13} /> Computer Generated Tax Invoice - No Physical Signature Required
              </div>
            </div>

            <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569' }}>
                <span>Sub-Total (Taxable Value):</span>
                <span style={{ fontWeight: '800', color: '#0F172A' }}>₹{subTotal}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748B' }}>
                <span>CGST ({cgstRate}%):</span>
                <span>₹{cgstAmount}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748B' }}>
                <span>SGST ({sgstRate}%):</span>
                <span>₹{sgstAmount}</span>
              </div>

              <div style={{ borderTop: '2px solid #006B70', paddingTop: '0.5rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: '900', color: '#006B70' }}>
                <span>Grand Total:</span>
                <span>₹{grandTotal || order.totalAmount}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', textAlign: 'right' }}>
                (Inclusive of all doorstep collection & sample handling)
              </div>
            </div>
          </div>

          {/* Signatory Footer */}
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ fontSize: '0.76rem', color: '#64748B' }}>
              <div>For queries, email: <strong>{cfg.billingContactEmail}</strong></div>
              <div>Phone Support: <strong>{cfg.billingContactPhone}</strong></div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '900', color: '#0F172A' }}>
                For {cfg.companyName}
              </div>
              <div style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <span style={{ fontFamily: 'cursive', color: '#006B70', fontSize: '1.1rem', fontWeight: 'bold' }}>
                  MedMarg Authorized
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#475569', fontWeight: '700' }}>
                {cfg.authorizedSignatory}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
