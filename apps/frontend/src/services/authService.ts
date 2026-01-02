import { api } from './api';

export enum UserStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  AWAY = 'AWAY',
  OFFLINE = 'OFFLINE',
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: 'ADMIN' | 'MEMBER';
  bio?: string | null;
  status: UserStatus;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  name?: string;
  bio?: string;
  status?: UserStatus;
  timezone?: string;
  avatar?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  avatar?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    console.log('🔐 Attempting login with email:', data.email);
    console.log('🌐 API Base URL:', api.defaults.baseURL);
    try {
      const response = await api.post<AuthResponse>('/auth/login', data);
      console.log('✅ Login successful');
      return response.data;
    } catch (error: any) {
      console.error('❌ Login failed:', error.message);
      console.error('   Response:', error.response?.data);
      console.error('   Status:', error.response?.status);
      throw error;
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async getMe(): Promise<{ user: User }> {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data;
  },

  async updateProfile(data: UpdateProfileData): Promise<{ user: User }> {
    const response = await api.patch<{ user: User }>('/users/profile', data);
    return response.data;
  },
};
