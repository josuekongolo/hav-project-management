import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentDto {
  content: string;
  taskId: string;
}

export interface UpdateCommentDto {
  content: string;
}

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const commentService = {
  async create(data: CreateCommentDto): Promise<Comment> {
    const response = await axios.post(`${API_URL}/comments`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async getByTask(taskId: string): Promise<Comment[]> {
    const response = await axios.get(`${API_URL}/comments/task/${taskId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async update(id: string, data: UpdateCommentDto): Promise<Comment> {
    const response = await axios.patch(`${API_URL}/comments/${id}`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await axios.delete(`${API_URL}/comments/${id}`, {
      headers: getAuthHeader(),
    });
  },
};
