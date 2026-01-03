import { api } from './api';

export enum MeetingStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Meeting {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startTime: string;
  endTime: string;
  status: MeetingStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  organizer: {
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

export interface CreateMeetingData {
  title: string;
  description?: string;
  location?: string;
  startTime: Date | string;
  endTime: Date | string;
  status?: MeetingStatus;
  notes?: string;
  contactId?: string;
  dealId?: string;
  companyId?: string;
}

export interface UpdateMeetingData {
  title?: string;
  description?: string;
  location?: string;
  startTime?: Date | string;
  endTime?: Date | string;
  status?: MeetingStatus;
  notes?: string;
}

export const meetingService = {
  async createMeeting(data: CreateMeetingData): Promise<{ meeting: Meeting }> {
    const response = await api.post<{ meeting: Meeting }>('/meetings', data);
    return response.data;
  },

  async getMeetingsByEntity(
    entityType: 'contact' | 'deal' | 'company',
    entityId: string
  ): Promise<{ meetings: Meeting[] }> {
    const params = new URLSearchParams();
    params.append('entityType', entityType);
    params.append('entityId', entityId);

    const response = await api.get<{ meetings: Meeting[] }>(`/meetings?${params.toString()}`);
    return response.data;
  },

  async getMeetingsByUser(filters?: {
    status?: MeetingStatus;
    startDate?: Date | string;
    endDate?: Date | string;
  }): Promise<{ meetings: Meeting[] }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate.toString());
    if (filters?.endDate) params.append('endDate', filters.endDate.toString());

    const response = await api.get<{ meetings: Meeting[] }>(
      `/meetings/user/me${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  async getMeetingById(id: string): Promise<{ meeting: Meeting }> {
    const response = await api.get<{ meeting: Meeting }>(`/meetings/${id}`);
    return response.data;
  },

  async updateMeeting(id: string, data: UpdateMeetingData): Promise<{ meeting: Meeting }> {
    const response = await api.patch<{ meeting: Meeting }>(`/meetings/${id}`, data);
    return response.data;
  },

  async deleteMeeting(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/meetings/${id}`);
    return response.data;
  },
};
