import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  dealService,
  Deal,
  DealStage,
  CreateDealData,
  UpdateDealData,
  DealFilters,
  DealStats,
} from '../services/dealService';

interface DealState {
  deals: Deal[];
  selectedDeal: Deal | null;
  dealActivities: any[];
  dealTasks: any[];
  stats: DealStats | null;
  isLoading: boolean;
  isLoadingActivities: boolean;
  isLoadingTasks: boolean;
  error: string | null;
  filters: DealFilters;

  // Actions
  fetchDeals: () => Promise<void>;
  fetchDealById: (id: string) => Promise<void>;
  fetchDealActivities: (id: string) => Promise<void>;
  fetchDealTasks: (id: string) => Promise<void>;
  createDeal: (data: CreateDealData) => Promise<Deal>;
  updateDeal: (id: string, data: UpdateDealData) => Promise<Deal>;
  deleteDeal: (id: string) => Promise<void>;
  updateDealStage: (id: string, stage: DealStage) => Promise<Deal>;
  fetchStats: (ownerId?: string) => Promise<void>;
  setFilters: (filters: DealFilters) => void;
  clearFilters: () => void;
  setSelectedDeal: (deal: Deal | null) => void;
}

export const useDealStore = create<DealState>()(
  devtools(
    (set, get) => ({
      deals: [],
      selectedDeal: null,
      dealActivities: [],
      dealTasks: [],
      stats: null,
      isLoading: false,
      isLoadingActivities: false,
      isLoadingTasks: false,
      error: null,
      filters: {},

      fetchDeals: async () => {
        set({ isLoading: true, error: null });
        try {
          const { deals } = await dealService.getDeals(get().filters);
          set({ deals, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to fetch deals',
            isLoading: false,
          });
        }
      },

      fetchDealById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const { deal } = await dealService.getDealById(id);
          set({ selectedDeal: deal, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to fetch deal',
            isLoading: false,
          });
        }
      },

      fetchDealActivities: async (id: string) => {
        set({ isLoadingActivities: true, error: null });
        try {
          const { activities } = await dealService.getDealActivities(id);
          set({ dealActivities: activities, isLoadingActivities: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to fetch activities',
            isLoadingActivities: false,
          });
        }
      },

      fetchDealTasks: async (id: string) => {
        set({ isLoadingTasks: true, error: null });
        try {
          const { tasks } = await dealService.getDealTasks(id);
          set({ dealTasks: tasks, isLoadingTasks: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to fetch tasks',
            isLoadingTasks: false,
          });
        }
      },

      createDeal: async (data: CreateDealData) => {
        set({ isLoading: true, error: null });
        try {
          const { deal } = await dealService.createDeal(data);
          set((state) => ({
            deals: [deal, ...state.deals],
            isLoading: false,
          }));
          return deal;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to create deal',
            isLoading: false,
          });
          throw error;
        }
      },

      updateDeal: async (id: string, data: UpdateDealData) => {
        set({ isLoading: true, error: null });
        try {
          const { deal } = await dealService.updateDeal(id, data);
          set((state) => ({
            deals: state.deals.map((d) => (d.id === id ? deal : d)),
            selectedDeal: state.selectedDeal?.id === id ? deal : state.selectedDeal,
            isLoading: false,
          }));
          return deal;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to update deal',
            isLoading: false,
          });
          throw error;
        }
      },

      deleteDeal: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await dealService.deleteDeal(id);
          set((state) => ({
            deals: state.deals.filter((d) => d.id !== id),
            selectedDeal: state.selectedDeal?.id === id ? null : state.selectedDeal,
            isLoading: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to delete deal',
            isLoading: false,
          });
          throw error;
        }
      },

      updateDealStage: async (id: string, stage: DealStage) => {
        try {
          const { deal } = await dealService.updateDealStage(id, stage);
          set((state) => ({
            deals: state.deals.map((d) => (d.id === id ? deal : d)),
            selectedDeal: state.selectedDeal?.id === id ? deal : state.selectedDeal,
          }));
          return deal;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to update deal stage',
          });
          throw error;
        }
      },

      fetchStats: async (ownerId?: string) => {
        try {
          const stats = await dealService.getDealStats(ownerId);
          set({ stats });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to fetch stats',
          });
        }
      },

      setFilters: (filters: DealFilters) => {
        set({ filters });
        get().fetchDeals();
      },

      clearFilters: () => {
        set({ filters: {} });
        get().fetchDeals();
      },

      setSelectedDeal: (deal: Deal | null) => {
        set({ selectedDeal: deal });
      },
    }),
    { name: 'deal-store' }
  )
);
