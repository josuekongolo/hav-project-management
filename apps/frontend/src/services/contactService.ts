import { api } from './api';

export enum ContactStatus {
  LEAD = 'LEAD',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  CUSTOMER = 'CUSTOMER',
  INACTIVE = 'INACTIVE',
  LOST = 'LOST',
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  company: string | null;
  companyId: string | null;
  companyRel?: {
    id: string;
    name: string;
    industry: string | null;
    logo: string | null;
  } | null;
  website: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  status: ContactStatus;
  source: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  assignedTo: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  } | null;
  assignedToId: string | null;
  _count?: {
    deals: number;
    emails: number;
    tasks: number;
    activities: number;
  };
}

export interface CreateContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  companyId?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  status?: ContactStatus;
  source?: string;
  notes?: string;
  assignedToId?: string;
}

export interface UpdateContactData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  companyId?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  status?: ContactStatus;
  source?: string;
  notes?: string;
  assignedToId?: string;
}

export interface ContactFilters {
  status?: ContactStatus;
  assignedToId?: string;
  search?: string;
  companyId?: string;
}

export const contactService = {
  async getContacts(filters?: ContactFilters): Promise<{ contacts: Contact[] }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assignedToId) params.append('assignedToId', filters.assignedToId);
    if (filters?.search) params.append('search', filters.search);

    const response = await api.get<{ contacts: Contact[] }>(
      `/contacts${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  async getContactById(id: string): Promise<{ contact: Contact }> {
    const response = await api.get<{ contact: Contact }>(`/contacts/${id}`);
    return response.data;
  },

  async createContact(data: CreateContactData): Promise<{ contact: Contact }> {
    const response = await api.post<{ contact: Contact }>('/contacts', data);
    return response.data;
  },

  async updateContact(id: string, data: UpdateContactData): Promise<{ contact: Contact }> {
    const response = await api.patch<{ contact: Contact }>(`/contacts/${id}`, data);
    return response.data;
  },

  async deleteContact(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/contacts/${id}`);
    return response.data;
  },

  async getContactActivities(id: string): Promise<{ activities: any[] }> {
    const response = await api.get<{ activities: any[] }>(`/contacts/${id}/activities`);
    return response.data;
  },

  async getContactEmails(id: string): Promise<{ emails: any[] }> {
    const response = await api.get<{ emails: any[] }>(`/contacts/${id}/emails`);
    return response.data;
  },

  async getContactTasks(id: string): Promise<{ tasks: any[] }> {
    const response = await api.get<{ tasks: any[] }>(`/contacts/${id}/tasks`);
    return response.data;
  },

  async searchContacts(query: string): Promise<{ contacts: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    companyRel: { id: string; name: string } | null;
  }> }> {
    const response = await api.get<{ contacts: Array<{
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string | null;
      companyRel: { id: string; name: string } | null;
    }> }>(`/contacts/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
};
