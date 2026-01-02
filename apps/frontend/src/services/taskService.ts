import { api } from './api';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface Label {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
}

export interface Milestone {
  id: string;
  name: string;
  endDate: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  creatorId: string;
  milestoneId: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  assignees: User[];
  creator: User;
  milestone: Milestone | null;
  labels: Label[];
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeIds?: string[];
  milestoneId?: string;
  dueDate?: string;
  labels?: string[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeIds?: string[];
  milestoneId?: string | null;
  dueDate?: string | null;
  labels?: string[];
}

export interface MoveTaskDto {
  status: TaskStatus;
  position: number;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  milestoneId?: string;
  search?: string;
}

export const taskService = {
  async getAll(filters?: TaskFilters): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.assigneeId) params.append('assigneeId', filters.assigneeId);
    if (filters?.milestoneId) params.append('milestoneId', filters.milestoneId);
    if (filters?.search) params.append('search', filters.search);

    const response = await api.get<{ tasks: Task[] }>(
      `/tasks${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data.tasks;
  },

  async getById(id: string): Promise<Task> {
    const response = await api.get<{ task: Task }>(`/tasks/${id}`);
    return response.data.task;
  },

  async create(data: CreateTaskDto): Promise<Task> {
    const response = await api.post<{ task: Task }>('/tasks', data);
    return response.data.task;
  },

  async update(id: string, data: UpdateTaskDto): Promise<Task> {
    const response = await api.patch<{ task: Task }>(`/tasks/${id}`, data);
    return response.data.task;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  async move(id: string, data: MoveTaskDto): Promise<Task> {
    const response = await api.patch<{ task: Task }>(`/tasks/${id}/move`, data);
    return response.data.task;
  },
};

export const labelService = {
  async getAll(): Promise<Label[]> {
    const response = await api.get<{ labels: Label[] }>('/labels');
    return response.data.labels;
  },

  async create(data: { name: string; color: string }): Promise<Label> {
    const response = await api.post<{ label: Label }>('/labels', data);
    return response.data.label;
  },

  async update(id: string, data: { name?: string; color?: string }): Promise<Label> {
    const response = await api.patch<{ label: Label }>(`/labels/${id}`, data);
    return response.data.label;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/labels/${id}`);
  },
};

export const userService = {
  async getAll(): Promise<User[]> {
    const response = await api.get<{ users: User[] }>('/users');
    return response.data.users;
  },
};
