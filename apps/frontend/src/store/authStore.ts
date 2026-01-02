import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { authService, User, LoginData, UpdateProfileData } from '../services/authService';
import { api } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (data: LoginData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      token: localStorage.getItem('token'),
      isAuthenticated: false,
      isLoading: !!localStorage.getItem('token'), // Start with loading true if token exists
      error: null,

      login: async (data: LoginData) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.login(data);

          localStorage.setItem('token', response.token);
          api.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;

          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Login failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ isAuthenticated: false, user: null, isLoading: false });
          return;
        }

        try {
          set({ isLoading: true });
          const response = await authService.getMe();
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          localStorage.removeItem('token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      updateProfile: async (data: UpdateProfileData) => {
        try {
          const response = await authService.updateProfile(data);
          set({ user: response.user });
        } catch (error) {
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'AuthStore' }
  )
);
