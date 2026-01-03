import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface SendEmailParams {
  to: string | string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text: string;
  html?: string;
}

class EmailService {
  private transporter: Transporter;

  constructor() {
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

  async sendEmail(params: SendEmailParams): Promise<void> {
    const { to, cc, bcc, subject, text, html } = params;

    try {
      console.log(`[EmailService] Sending email to: ${Array.isArray(to) ? to.join(', ') : to}`);

      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: Array.isArray(to) ? to.join(', ') : to,
        cc: cc?.join(', '),
        bcc: bcc?.join(', '),
        subject,
        text,
        html: html || text,
      });

      console.log(`[EmailService] Email sent successfully. MessageId: ${info.messageId}`);
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
      console.log('[EmailService] Verifying SMTP connection...');
      await this.transporter.verify();
      console.log('[EmailService] SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('[EmailService] SMTP connection verification failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
