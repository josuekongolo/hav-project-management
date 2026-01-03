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
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.domeneshop.no',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendEmail(params: SendEmailParams): Promise<void> {
    const { to, cc, bcc, subject, text, html } = params;

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: Array.isArray(to) ? to.join(', ') : to,
        cc: cc?.join(', '),
        bcc: bcc?.join(', '),
        subject,
        text,
        html: html || text,
      });
    } catch (error) {
      throw new Error(
        `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('SMTP connection failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
