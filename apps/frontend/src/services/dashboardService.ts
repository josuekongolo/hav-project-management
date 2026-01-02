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

export interface RecentActivity {
  id: string;
  taskId: string;
  taskTitle: string;
  userName: string;
  userAvatar: string | null;
  action: string;
  status: string;
  timestamp: string;
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

  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    const response = await api.get<{ activities: RecentActivity[] }>(`/dashboard/activity?limit=${limit}`);
    return response.data.activities;
  },
};
