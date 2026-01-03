import { api } from './api';

export enum DealStage {
  PROSPECT = 'PROSPECT',
  QUALIFICATION = 'QUALIFICATION',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  CLOSED_WON = 'CLOSED_WON',
  CLOSED_LOST = 'CLOSED_LOST',
}

export interface Deal {
  id: string;
  title: string;
  description: string | null;
  value: number;
  stage: DealStage;
  probability: number;
  expectedCloseDate: string | null;
  closedDate: string | null;
  createdAt: string;
  updatedAt: string;
  contact: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    company: string | null;
  };
  owner: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  companyId: string | null;
  companyRel?: {
    id: string;
    name: string;
    industry: string | null;
    logo: string | null;
  } | null;
  contactId: string;
  ownerId: string;
  _count?: {
    tasks: number;
  };
}

export interface CreateDealData {
  title: string;
  description?: string;
  value: number;
  stage?: DealStage;
  probability?: number;
  expectedCloseDate?: string;
  contactId: string;
  ownerId: string;
  companyId?: string;
}

export interface UpdateDealData {
  title?: string;
  description?: string;
  value?: number;
  stage?: DealStage;
  probability?: number;
  expectedCloseDate?: string;
  closedDate?: string;
  contactId?: string;
  ownerId?: string;
  companyId?: string;
}

export interface DealFilters {
  stage?: DealStage;
  ownerId?: string;
  contactId?: string;
  companyId?: string;
}

export interface DealStats {
  totalDeals: number;
  totalValue: number;
  wonDeals: number;
  wonValue: number;
  lostDeals: number;
  winRate: number;
  dealsByStage: {
    stage: DealStage;
    count: number;
    value: number;
  }[];
}

export const dealService = {
  async getDeals(filters?: DealFilters): Promise<{ deals: Deal[] }> {
    const params = new URLSearchParams();
    if (filters?.stage) params.append('stage', filters.stage);
    if (filters?.ownerId) params.append('ownerId', filters.ownerId);
    if (filters?.contactId) params.append('contactId', filters.contactId);

    const response = await api.get<{ deals: Deal[] }>(
      `/deals${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  async getDealById(id: string): Promise<{ deal: Deal }> {
    const response = await api.get<{ deal: Deal }>(`/deals/${id}`);
    return response.data;
  },

  async getDealActivities(id: string): Promise<{ activities: any[] }> {
    const response = await api.get<{ activities: any[] }>(`/deals/${id}/activities`);
    return response.data;
  },

  async getDealTasks(id: string): Promise<{ tasks: any[] }> {
    const response = await api.get<{ tasks: any[] }>(`/deals/${id}/tasks`);
    return response.data;
  },

  async createDeal(data: CreateDealData): Promise<{ deal: Deal }> {
    const response = await api.post<{ deal: Deal }>('/deals', data);
    return response.data;
  },

  async updateDeal(id: string, data: UpdateDealData): Promise<{ deal: Deal }> {
    const response = await api.patch<{ deal: Deal }>(`/deals/${id}`, data);
    return response.data;
  },

  async deleteDeal(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/deals/${id}`);
    return response.data;
  },

  async updateDealStage(id: string, stage: DealStage): Promise<{ deal: Deal }> {
    const response = await api.patch<{ deal: Deal }>(`/deals/${id}/stage`, { stage });
    return response.data;
  },

  async getDealStats(ownerId?: string): Promise<DealStats> {
    const params = new URLSearchParams();
    if (ownerId) params.append('ownerId', ownerId);

    const response = await api.get<DealStats>(
      `/deals/stats${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },
};
