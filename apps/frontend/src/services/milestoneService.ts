import { api } from './api';
import { Task } from './taskService';

export enum MilestoneStatus {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export interface Milestone {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  status: MilestoneStatus;
  totalTasks: number;
  completedTasks: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface MilestoneWithTasks extends Milestone {
  tasks: Task[];
}

export interface CreateMilestoneDto {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status?: MilestoneStatus;
}

export interface UpdateMilestoneDto {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: MilestoneStatus;
}

export const milestoneService = {
  async getAll(): Promise<Milestone[]> {
    const response = await api.get<{ milestones: Milestone[] }>('/milestones');
    return response.data.milestones;
  },

  async getById(id: string): Promise<MilestoneWithTasks> {
    const response = await api.get<{ milestone: MilestoneWithTasks }>(`/milestones/${id}`);
    return response.data.milestone;
  },

  async create(data: CreateMilestoneDto): Promise<Milestone> {
    const response = await api.post<{ milestone: Milestone }>('/milestones', data);
    return response.data.milestone;
  },

  async update(id: string, data: UpdateMilestoneDto): Promise<Milestone> {
    const response = await api.patch<{ milestone: Milestone }>(`/milestones/${id}`, data);
    return response.data.milestone;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/milestones/${id}`);
  },
};
