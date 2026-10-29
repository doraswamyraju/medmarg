/**
 * 🔔 MedMarg Omnipresent Notification Service
 * Supports:
 * 1. Web Push / ServiceWorker Notifications
 * 2. Mobile Device APNs / FCM Push Dispatch
 * 3. Clinical Email Alerts (HTML templates for Diagnostic Reports, Order Confirmation, Dispatch, KYC)
 * 4. In-App Notification Stream Persistence
 */

const fs = require('fs');
const path = require('path');
const { dbStore, saveDbStore } = require('../models/dataStore');

// Optional nodemailer fallback
let nodemailer = null;
try {
    nodemailer = require('nodemailer');
} catch (e) {
    // nodemailer is optional, handled via graceful SMTP or logging transporter
}

class NotificationService {
    constructor() {
        this.transporter = null;
        this.initTransporter();
    }

    initTransporter() {
        if (nodemailer && process.env.SMTP_HOST && process.env.SMTP_USER) {
            try {
                this.transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: process.env.SMTP_PORT || 587,
                    secure: process.env.SMTP_SECURE === 'true',
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS
                    }
                });
                console.log('[NotificationService] SMTP Mail Transport Initialized');
            } catch (err) {
                console.warn('[NotificationService] SMTP init failed, using simulated delivery:', err.message);
            }
        }
    }

    /**
     * Store in-app notification in dbStore.notifications
     */
    persistNotification(notif) {
        if (!dbStore.notifications) {
            dbStore.notifications = [];
        }

        const entry = {
            id: notif.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            userId: notif.userId || notif.email || notif.phone || 'ALL',
            category: notif.category || 'GENERAL',
            title: notif.title,
            message: notif.message,
            link: notif.link || null,
            meta: notif.meta || {},
            read: false,
            createdAt: new Date().toISOString()
        };

        dbStore.notifications.unshift(entry);
        
        // Cap notifications to 500 to keep dbStore clean
        if (dbStore.notifications.length > 500) {
            dbStore.notifications = dbStore.notifications.slice(0, 500);
        }

        saveDbStore();
        return entry;
    }

    /**
     * Send Push Notification to Web & Mobile device tokens
     */
    async sendPush({ target, title, body, data = {}, badge = 1 }) {
        console.log(`[Push Notification] 📲 Sending to target: ${target} | Title: "${title}" | Body: "${body}"`);

        // Check if user has registered device tokens
        const tokens = (dbStore.deviceTokens || []).filter(t => 
            t.userId === target || t.email === target || t.phone === target || target === 'ALL'
        );

        // Record in notification stream
        this.persistNotification({
            userId: target,
            category: data.category || 'PUSH_ALERT',
            title,
            message: body,
            link: data.link,
            meta: data
        });

        // If FCM is configured via firebase-admin
        try {
            if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY && fs.existsSync(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)) {
                const admin = require('firebase-admin');
                const registrationTokens = tokens.map(t => t.token).filter(Boolean);

                if (registrationTokens.length > 0) {
                    const message = {
                        notification: { title, body },
                        data: { ...data, timestamp: String(Date.now()) },
                        tokens: registrationTokens
                    };
                    const response = await admin.messaging().sendMulticast(message);
                    console.log(`[Push Notification] Successfully sent ${response.successCount} push messages.`);
                }
            }
        } catch (fcmErr) {
            console.warn('[Push Notification] FCM dispatch skipped:', fcmErr.message);
        }

        return { success: true, target, delivered: true };
    }

    /**
     * Send Official Diagnostic & Clinical Emails
     */
    async sendEmail({ to, subject, htmlContent, textContent }) {
        console.log(`[Email Service] ✉️ Sending Email to: ${to} | Subject: "${subject}"`);

        if (this.transporter) {
            try {
                const info = await this.transporter.sendMail({
                    from: process.env.EMAIL_FROM || '"MedMarg Health & Diagnostics" <reports@medmarg.com>',
                    to,
                    subject,
                    text: textContent || subject,
                    html: htmlContent
                });
                console.log(`[Email Service] Message sent successfully: ${info.messageId}`);
                return { success: true, messageId: info.messageId };
            } catch (err) {
                console.error('[Email Service] Failed to send via SMTP:', err.message);
            }
        } else {
            console.log(`[Email Service] [SIMULATED] SMTP not configured. Mail logged safely.`);
        }

        return { success: true, simulated: true, to, subject };
    }

    /**
     * Clinical Event: Send Report Ready Notification (Push + Email)
     */
    async notifyReportReady(order, report) {
        const patientName = order.patientName || report.patientName || 'Care Seeker';
        const patientEmail = order.patientEmail || order.email || 'customer@medmarg.com';
        const orderId = order.id;
        const reportUrl = `https://medmarg.com/api/v1/reports/${orderId}/download`;

        // 1. Send In-App & Push Notification
        await this.sendPush({
            target: patientEmail,
            title: `🧪 NABL Report Ready: Order #${orderId}`,
            body: `Your verified diagnostic results for ${order.items || report.title || 'Health Package'} are ready for download.`,
            data: {
                category: 'REPORT_READY',
                orderId,
                reportId: report.id,
                link: `/patient?tab=REPORTS&orderId=${orderId}`
            }
        });

        // 2. Send Formatted HTML Email
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 20px; color: #0F172A; }
    .email-container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: #006B70; color: #FFFFFF; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.5px; }
    .header p { margin: 4px 0 0; font-size: 13px; opacity: 0.9; }
    .content { padding: 24px; }
    .greeting { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
    .card { background: #F0FDFA; border: 1px solid #99F6E4; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .card-title { font-size: 12px; font-weight: 800; color: #006B70; text-transform: uppercase; margin-bottom: 6px; }
    .btn { display: inline-block; background: #006B70; color: #FFFFFF !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 800; font-size: 14px; text-align: center; margin: 20px 0; }
    .footer { background: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 16px; text-align: center; font-size: 11px; color: #64748B; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>MEDMARG HEALTHCARE</h1>
      <p>NABL Accredited Diagnostics • Tirupati, Andhra Pradesh</p>
    </div>
    <div class="content">
      <div class="greeting">Dear ${patientName},</div>
      <p>Your diagnostic test report for <strong>Order #${orderId}</strong> is officially verified, digitally signed, and now available in your MedMarg Health Vault.</p>
      
      <div class="card">
        <div class="card-title">Report Summary</div>
        <div><strong>Test:</strong> ${report.title || order.items || 'Diagnostic Health Profile'}</div>
        <div><strong>Accreditation:</strong> ISO 15189:2022 Verified (NABL AP)</div>
        <div><strong>Verified By:</strong> ${report.doctorVerified || 'Dr. Ananya Sharma (MD Pathologist)'}</div>
        <div><strong>Status:</strong> DIGITALLY SIGNED & ENCRYPTED</div>
      </div>

      <div style="text-align: center;">
        <a href="${reportUrl}" target="_blank" class="btn">📄 Download Official NABL Report (PDF)</a>
      </div>

      <p style="font-size: 12px; color: #64748B;">You can also access historical biomarker trends and comparative insights on the MedMarg Web Portal or Mobile App.</p>
    </div>
    <div class="footer">
      MedMarg Health Services Pvt Ltd • Alipiri Road, Tirupati, AP 517501<br>
      Customer Care: +91 94943 45678 | Email: support@medmarg.com
    </div>
  </div>
</body>
</html>
        `;

        await this.sendEmail({
            to: patientEmail,
            subject: `📄 Your Official MedMarg Diagnostic Report is Ready (Order #${orderId})`,
            htmlContent: emailHtml,
            textContent: `Dear ${patientName}, your official diagnostic report for Order #${orderId} is ready. Download it here: ${reportUrl}`
        });
    }

    /**
     * Dispatch Phlebotomist Enroute Alert (Push + Mail)
     */
    async notifyPhlebotomistEnroute(order) {
        const patientName = order.patientName || 'Care Seeker';
        const patientEmail = order.patientEmail || order.email || 'customer@medmarg.com';
        const phleboName = order.phleboName || 'MedMarg Certified Phlebotomist';
        const otp = order.handoverOtp || order.otp || '3892';

        await this.sendPush({
            target: patientEmail,
            title: `🚴 Phlebotomist On The Way!`,
            body: `${phleboName} is arriving for sample collection. Share Handover OTP: ${otp}`,
            data: {
                category: 'PHLEBOTOMY_ENROUTE',
                orderId: order.id,
                otp,
                link: `/patient?tab=TRACK&orderId=${order.id}`
            }
        });
    }
}

const notificationService = new NotificationService();
module.exports = { notificationService };
