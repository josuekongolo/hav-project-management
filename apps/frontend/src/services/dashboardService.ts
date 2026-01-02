import { api } from './api';

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  completionRate: number;
  totalMilestones: number;
  activeMilestones: number;
  totalUsers: number;
}

export interface TeamMemberWorkload {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  inReviewTasks: number;
  currentTask: {
    id: string;
    title: string;
    priority: string;
  } | null;
  workloadScore: number;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await api.get<{ stats: DashboardStats }>('/dashboard/stats');
    return response.data.stats;
  },

  async getTeamWorkload(): Promise<TeamMemberWorkload[]> {
    const response = await api.get<{ team: TeamMemberWorkload[] }>('/dashboard/team');
    return response.data.team;
  },
};
