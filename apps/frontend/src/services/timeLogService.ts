import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface TimeLog {
  id: string;
  hours: number;
  description: string | null;
  loggedAt: string;
  taskId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  createdAt: string;
}

export interface CreateTimeLogDto {
  hours: number;
  description?: string;
  taskId: string;
  loggedAt?: string;
}

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const timeLogService = {
  async create(data: CreateTimeLogDto): Promise<TimeLog> {
    const response = await axios.post(`${API_URL}/timelogs`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async getByTask(taskId: string): Promise<{ timeLogs: TimeLog[]; totalHours: number }> {
    const response = await axios.get(`${API_URL}/timelogs/task/${taskId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async getByUser(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{ timeLogs: TimeLog[]; totalHours: number }> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await axios.get(
      `${API_URL}/timelogs/user/${userId}?${params.toString()}`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await axios.delete(`${API_URL}/timelogs/${id}`, {
      headers: getAuthHeader(),
    });
  },
};
