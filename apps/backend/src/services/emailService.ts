import { Resend } from 'resend';

interface SendEmailParams {
  to: string | string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

class EmailService {
  private resend: Resend;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is required');
    }

    if (!process.env.SMTP_FROM) {
      throw new Error('SMTP_FROM environment variable is required (must be verified in Resend)');
    }

    this.fromEmail = process.env.SMTP_FROM;
    // Use SMTP_FROM_NAME env var or default to Josue Kongolo
    this.fromName = process.env.SMTP_FROM_NAME || 'Josue Kongolo';

    console.log('[EmailService] Using Resend API for email delivery');
    console.log('[EmailService] Sender:', `${this.fromName} <${this.fromEmail}>`);
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendEmail(params: SendEmailParams): Promise<void> {
    const { to, cc, bcc, subject, text, html, replyTo } = params;

    try {
      const recipients = Array.isArray(to) ? to : [to];
      // Format: "Name <email@domain.com>" for better deliverability
      const fromAddress = `${this.fromName} <${this.fromEmail}>`;

      console.log(`[EmailService] Sending email via Resend`);
      console.log(`[EmailService] From: ${fromAddress}`);
      console.log(`[EmailService] To: ${recipients.join(', ')}`);
      console.log(`[EmailService] Subject: ${subject}`);

      const result = await this.resend.emails.send({
        from: fromAddress,
        to: recipients,
        cc,
        bcc,
        subject,
        text,
        html: html || text,
        // Reply-To helps with deliverability and lets recipients reply directly
        replyTo: replyTo || this.fromEmail,
        // Add headers to improve deliverability
        headers: {
          'X-Entity-Ref-ID': `hav-${Date.now()}`, // Unique ID prevents threading issues
        },
      });

      // Check for errors
      if (result.error) {
        console.error('[EmailService] Resend API Error:', result.error);
        throw new Error(`Resend API error: ${JSON.stringify(result.error)}`);
      }

      const emailId = result.data?.id || 'unknown';
      console.log(`[EmailService] Email sent successfully. ID: ${emailId}`);
    } catch (error) {
      console.error('[EmailService] Failed to send email:', error);

      if (error instanceof Error) {
        throw new Error(`Failed to send email: ${error.message}`);
      }

      throw new Error('Failed to send email: Unknown error');
    }
  }

  async verifyConnection(): Promise<boolean> {
    console.log('[EmailService] Using Resend API - no connection verification needed');
    return true; // Resend doesn't need connection verification
  }
}

export const emailService = new EmailService();
