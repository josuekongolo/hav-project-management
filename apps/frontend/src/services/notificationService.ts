import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_COMMENT'
  | 'TASK_MENTION'
  | 'TASK_DUE_SOON'
  | 'TASK_COMPLETED'
  | 'MILESTONE_DUE_SOON';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  userId: string;
  createdAt: string;
}

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const notificationService = {
  async getAll(unreadOnly: boolean = false): Promise<Notification[]> {
    const response = await axios.get(
      `${API_URL}/notifications${unreadOnly ? '?unreadOnly=true' : ''}`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await axios.get(`${API_URL}/notifications/unread-count`, {
      headers: getAuthHeader(),
    });
    return response.data.count;
  },

  async markAsRead(id: string): Promise<Notification> {
    const response = await axios.patch(
      `${API_URL}/notifications/${id}/read`,
      {},
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  async markAllAsRead(): Promise<void> {
    await axios.patch(
      `${API_URL}/notifications/mark-all-read`,
      {},
      {
        headers: getAuthHeader(),
      }
    );
  },

  async delete(id: string): Promise<void> {
    await axios.delete(`${API_URL}/notifications/${id}`, {
      headers: getAuthHeader(),
    });
  },
};
