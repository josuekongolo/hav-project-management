import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  milestoneService,
  Milestone,
  MilestoneWithTasks,
  CreateMilestoneDto,
  UpdateMilestoneDto,
} from '../services/milestoneService';

interface MilestoneState {
  milestones: Milestone[];
  selectedMilestone: MilestoneWithTasks | null;
  isLoading: boolean;
  error: string | null;

  fetchMilestones: () => Promise<void>;
  fetchMilestoneById: (id: string) => Promise<void>;
  createMilestone: (data: CreateMilestoneDto) => Promise<Milestone>;
  updateMilestone: (id: string, data: UpdateMilestoneDto) => Promise<void>;
  deleteMilestone: (id: string) => Promise<void>;
  setSelectedMilestone: (milestone: MilestoneWithTasks | null) => void;
  clearError: () => void;
}

export const useMilestoneStore = create<MilestoneState>()(
  devtools(
    (set, get) => ({
      milestones: [],
      selectedMilestone: null,
      isLoading: false,
      error: null,

      fetchMilestones: async () => {
        try {
          set({ isLoading: true, error: null });
          const milestones = await milestoneService.getAll();
          set({ milestones, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to fetch milestones',
            isLoading: false,
          });
        }
      },

      fetchMilestoneById: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          const milestone = await milestoneService.getById(id);
          set({ selectedMilestone: milestone, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to fetch milestone',
            isLoading: false,
          });
        }
      },

      createMilestone: async (data: CreateMilestoneDto) => {
        try {
          set({ isLoading: true, error: null });
          const newMilestone = await milestoneService.create(data);
          set((state) => ({
            milestones: [...state.milestones, newMilestone],
            isLoading: false,
          }));
          return newMilestone;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to create milestone',
            isLoading: false,
          });
          throw error;
        }
      },

      updateMilestone: async (id: string, data: UpdateMilestoneDto) => {
        try {
          set({ isLoading: true, error: null });
          const updatedMilestone = await milestoneService.update(id, data);
          set((state) => ({
            milestones: state.milestones.map((m) => (m.id === id ? updatedMilestone : m)),
            isLoading: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to update milestone',
            isLoading: false,
          });
          throw error;
        }
      },

      deleteMilestone: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          await milestoneService.delete(id);
          set((state) => ({
            milestones: state.milestones.filter((m) => m.id !== id),
            selectedMilestone: state.selectedMilestone?.id === id ? null : state.selectedMilestone,
            isLoading: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to delete milestone',
            isLoading: false,
          });
          throw error;
        }
      },

      setSelectedMilestone: (milestone: MilestoneWithTasks | null) =>
        set({ selectedMilestone: milestone }),

      clearError: () => set({ error: null }),
    }),
    { name: 'MilestoneStore' }
  )
);
