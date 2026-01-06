import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { Resend } from 'resend';

interface SendEmailParams {
  to: string | string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text: string;
  html?: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private resend: Resend | null = null;
  private useResend: boolean;

  constructor() {
    // Use Resend if API key is available (for production/Railway)
    this.useResend = !!process.env.RESEND_API_KEY;

    if (this.useResend) {
      console.log('[EmailService] Using Resend API for email delivery');
      this.resend = new Resend(process.env.RESEND_API_KEY);
    } else {
      console.log('[EmailService] Using SMTP for email delivery');
      const port = parseInt(process.env.SMTP_PORT || '465');
      const secure = process.env.SMTP_SECURE === 'true' || port === 465;

      console.log(`[EmailService] Configuring SMTP: ${process.env.SMTP_HOST}:${port} (secure: ${secure})`);

      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.domeneshop.no',
        port,
        secure, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,
        socketTimeout: 15000,
        logger: process.env.NODE_ENV === 'development',
        debug: process.env.NODE_ENV === 'development',
      });
    }
  }

  async sendEmail(params: SendEmailParams): Promise<void> {
    const { to, cc, bcc, subject, text, html } = params;

    try {
      console.log(`[EmailService] Sending email to: ${Array.isArray(to) ? to.join(', ') : to}`);

      if (this.useResend && this.resend) {
        // Use Resend API
        const recipients = Array.isArray(to) ? to : [to];

        const result = await this.resend.emails.send({
          from: process.env.SMTP_FROM || 'onboarding@resend.dev',
          to: recipients,
          cc,
          bcc,
          subject,
          text,
          html: html || text,
        });

        // Debug: Log the full response
        console.log('[EmailService] Resend API Response:', JSON.stringify(result, null, 2));

        // Check for errors
        if (result.error) {
          console.error('[EmailService] Resend API Error:', result.error);
          throw new Error(`Resend API error: ${JSON.stringify(result.error)}`);
        }

        const emailId = result.data?.id || 'unknown';
        console.log(`[EmailService] Email sent successfully via Resend. ID: ${emailId}`);
      } else if (this.transporter) {
        // Use SMTP
        const info = await this.transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: Array.isArray(to) ? to.join(', ') : to,
          cc: cc?.join(', '),
          bcc: bcc?.join(', '),
          subject,
          text,
          html: html || text,
        });

        console.log(`[EmailService] Email sent successfully via SMTP. MessageId: ${info.messageId}`);
      } else {
        throw new Error('No email service configured');
      }
    } catch (error) {
      console.error('[EmailService] Failed to send email:', error);

      if (error instanceof Error) {
        // Provide more specific error messages
        if (error.message.includes('ETIMEDOUT') || error.message.includes('timeout')) {
          throw new Error('Email server connection timeout. Please check SMTP configuration and firewall settings.');
        } else if (error.message.includes('ECONNREFUSED')) {
          throw new Error('Email server refused connection. Please verify SMTP host and port.');
        } else if (error.message.includes('authentication')) {
          throw new Error('SMTP authentication failed. Please check username and password.');
        } else {
          throw new Error(`Failed to send email: ${error.message}`);
        }
      }

      throw new Error('Failed to send email: Unknown error');
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      if (this.useResend && this.resend) {
        console.log('[EmailService] Using Resend API - no connection verification needed');
        return true; // Resend doesn't need connection verification
      } else if (this.transporter) {
        console.log('[EmailService] Verifying SMTP connection...');
        await this.transporter.verify();
        console.log('[EmailService] SMTP connection verified successfully');
        return true;
      } else {
        console.error('[EmailService] No email service configured');
        return false;
      }
    } catch (error) {
      console.error('[EmailService] Connection verification failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
