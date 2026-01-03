import { api } from './api';

export enum CallDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
}

export interface CallLog {
  id: string;
  subject: string;
  notes: string | null;
  duration: number | null;
  direction: CallDirection;
  outcome: string | null;
  scheduledAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
  contact?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  deal?: {
    id: string;
    title: string;
  } | null;
  company?: {
    id: string;
    name: string;
  } | null;
}

export interface CreateCallLogData {
  subject: string;
  notes?: string;
  duration?: number;
  direction: CallDirection;
  outcome?: string;
  scheduledAt?: Date | string;
  completedAt?: Date | string;
  contactId?: string;
  dealId?: string;
  companyId?: string;
}

export interface UpdateCallLogData {
  subject?: string;
  notes?: string;
  duration?: number;
  direction?: CallDirection;
  outcome?: string;
  scheduledAt?: Date | string;
  completedAt?: Date | string;
}

export const callLogService = {
  async createCallLog(data: CreateCallLogData): Promise<{ callLog: CallLog }> {
    const response = await api.post<{ callLog: CallLog }>('/call-logs', data);
    return response.data;
  },

  async getCallLogsByEntity(
    entityType: 'contact' | 'deal' | 'company',
    entityId: string
  ): Promise<{ callLogs: CallLog[] }> {
    const params = new URLSearchParams();
    params.append('entityType', entityType);
    params.append('entityId', entityId);

    const response = await api.get<{ callLogs: CallLog[] }>(`/call-logs?${params.toString()}`);
    return response.data;
  },

  async getCallLogById(id: string): Promise<{ callLog: CallLog }> {
    const response = await api.get<{ callLog: CallLog }>(`/call-logs/${id}`);
    return response.data;
  },

  async updateCallLog(id: string, data: UpdateCallLogData): Promise<{ callLog: CallLog }> {
    const response = await api.patch<{ callLog: CallLog }>(`/call-logs/${id}`, data);
    return response.data;
  },

  async deleteCallLog(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/call-logs/${id}`);
    return response.data;
  },
};
