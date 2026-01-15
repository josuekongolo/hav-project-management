import { api } from './api';

export enum EmailStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  SENDING = 'SENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  OPENED = 'OPENED',
  CLICKED = 'CLICKED',
}

export interface Email {
  id: string;
  subject: string;
  body: string;
  htmlBody: string | null;
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
  status: EmailStatus;
  sentAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  contact?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  sender: {
    id: string;
    name: string;
    email: string;
  };
  template?: {
    id: string;
    name: string;
    category: string;
  };
}

export interface SendEmailData {
  contactId?: string;
  to: string | string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  htmlBody?: string;
  templateId?: string;
}

export interface SendEmailWithTemplateData {
  contactId?: string;
  to: string | string[];
  cc?: string[];
  bcc?: string[];
  templateId: string;
  variables: { [key: string]: string };
}

export interface BulkEmailData {
  contactIds: string[];
  templateId: string;
  customVariables?: { [contactId: string]: { [key: string]: string } };
}

export interface BulkEmailResults {
  total: number;
  sent: number;
  failed: number;
  errors: { contactId: string; error: string }[];
}

export const emailService = {
  async getEmails(contactId?: string, senderId?: string): Promise<{ emails: Email[] }> {
    const params = new URLSearchParams();
    if (contactId) params.append('contactId', contactId);
    if (senderId) params.append('senderId', senderId);

    const response = await api.get<{ emails: Email[] }>(
      `/emails${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  async getEmailById(id: string): Promise<{ email: Email }> {
    const response = await api.get<{ email: Email }>(`/emails/${id}`);
    return response.data;
  },

  async sendEmail(data: SendEmailData): Promise<{ email: Email }> {
    const response = await api.post<{ email: Email }>('/emails/send', data);
    return response.data;
  },

  async sendEmailWithTemplate(data: SendEmailWithTemplateData): Promise<{ email: Email }> {
    const response = await api.post<{ email: Email }>('/emails/send-with-template', data);
    return response.data;
  },

  async sendBulkEmails(data: BulkEmailData): Promise<BulkEmailResults> {
    const response = await api.post<BulkEmailResults>('/emails/send-bulk', data);
    return response.data;
  },

  async saveDraft(data: SendEmailData): Promise<{ draft: Email }> {
    const response = await api.post<{ draft: Email }>('/emails/draft', data);
    return response.data;
  },

  async deleteEmail(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/emails/${id}`);
    return response.data;
  },

  async bulkDeleteEmails(ids: string[]): Promise<{ deleted: number; message: string }> {
    const response = await api.post<{ deleted: number; message: string }>('/emails/bulk-delete', { ids });
    return response.data;
  },
};
