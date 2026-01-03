import { api } from './api';

export enum EmailTemplateCategory {
  WELCOME = 'WELCOME',
  FOLLOW_UP = 'FOLLOW_UP',
  PROPOSAL = 'PROPOSAL',
  INVOICE = 'INVOICE',
  GENERAL = 'GENERAL',
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  htmlBody: string | null;
  category: EmailTemplateCategory;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    emails: number;
  };
}

export interface CreateEmailTemplateData {
  name: string;
  subject: string;
  body: string;
  htmlBody?: string;
  category: EmailTemplateCategory;
  variables?: string[];
  isActive?: boolean;
}

export interface UpdateEmailTemplateData {
  name?: string;
  subject?: string;
  body?: string;
  htmlBody?: string;
  category?: EmailTemplateCategory;
  variables?: string[];
  isActive?: boolean;
}

export interface TemplateVariables {
  [key: string]: string;
}

export const emailTemplateService = {
  async getEmailTemplates(category?: EmailTemplateCategory): Promise<{ templates: EmailTemplate[] }> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);

    const response = await api.get<{ templates: EmailTemplate[] }>(
      `/email-templates${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  async getEmailTemplateById(id: string): Promise<{ template: EmailTemplate }> {
    const response = await api.get<{ template: EmailTemplate }>(`/email-templates/${id}`);
    return response.data;
  },

  async createEmailTemplate(data: CreateEmailTemplateData): Promise<{ template: EmailTemplate }> {
    const response = await api.post<{ template: EmailTemplate }>('/email-templates', data);
    return response.data;
  },

  async updateEmailTemplate(
    id: string,
    data: UpdateEmailTemplateData
  ): Promise<{ template: EmailTemplate }> {
    const response = await api.patch<{ template: EmailTemplate }>(`/email-templates/${id}`, data);
    return response.data;
  },

  async deleteEmailTemplate(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/email-templates/${id}`);
    return response.data;
  },

  async renderTemplate(
    id: string,
    variables: TemplateVariables
  ): Promise<{ subject: string; body: string; htmlBody?: string }> {
    const response = await api.post<{ subject: string; body: string; htmlBody?: string }>(
      `/email-templates/${id}/render`,
      { variables }
    );
    return response.data;
  },
};
