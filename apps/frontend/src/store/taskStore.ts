import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  taskService,
  labelService,
  userService,
  Task,
  Label,
  User,
  TaskStatus,
  CreateTaskDto,
  UpdateTaskDto,
  TaskFilters,
} from '../services/taskService';
import { milestoneService, Milestone } from '../services/milestoneService';

interface TaskState {
  tasks: Task[];
  labels: Label[];
  users: User[];
  milestones: Milestone[];
  selectedTask: Task | null;
  isLoading: boolean;
  error: string | null;

  fetchTasks: (filters?: TaskFilters) => Promise<void>;
  fetchLabels: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchMilestones: () => Promise<void>;
  createTask: (data: CreateTaskDto) => Promise<Task>;
  updateTask: (id: string, data: UpdateTaskDto) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (taskId: string, newStatus: TaskStatus, newPosition: number) => Promise<void>;
  setSelectedTask: (task: Task | null) => void;
  clearError: () => void;
}

export const useTaskStore = create<TaskState>()(
  devtools(
    (set, get) => ({
      tasks: [],
      labels: [],
      users: [],
      milestones: [],
      selectedTask: null,
      isLoading: false,
      error: null,

      fetchTasks: async (filters?: TaskFilters) => {
        try {
          set({ isLoading: true, error: null });
          const tasks = await taskService.getAll(filters);
          set({ tasks, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to fetch tasks',
            isLoading: false,
          });
        }
      },

      fetchLabels: async () => {
        try {
          const labels = await labelService.getAll();
          set({ labels });
        } catch (error: any) {
          console.error('Failed to fetch labels:', error);
        }
      },

      fetchUsers: async () => {
        try {
          const users = await userService.getAll();
          set({ users });
        } catch (error: any) {
          console.error('Failed to fetch users:', error);
        }
      },

      fetchMilestones: async () => {
        try {
          const milestones = await milestoneService.getAll();
          set({ milestones });
        } catch (error: any) {
          console.error('Failed to fetch milestones:', error);
        }
      },

      createTask: async (data: CreateTaskDto) => {
        try {
          set({ isLoading: true, error: null });
          const newTask = await taskService.create(data);
          set((state) => ({
            tasks: [...state.tasks, newTask],
            isLoading: false,
          }));
          return newTask;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to create task',
            isLoading: false,
          });
          throw error;
        }
      },

      updateTask: async (id: string, data: UpdateTaskDto) => {
        try {
          set({ isLoading: true, error: null });
          const updatedTask = await taskService.update(id, data);
          set((state) => ({
            tasks: state.tasks.map((task) => (task.id === id ? updatedTask : task)),
            selectedTask: state.selectedTask?.id === id ? updatedTask : state.selectedTask,
            isLoading: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to update task',
            isLoading: false,
          });
          throw error;
        }
      },

      deleteTask: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          await taskService.delete(id);
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id),
            selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
            isLoading: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to delete task',
            isLoading: false,
          });
          throw error;
        }
      },

      moveTask: async (taskId: string, newStatus: TaskStatus, newPosition: number) => {
        const oldTasks = get().tasks;

        // Optimistic update
        const taskToMove = oldTasks.find((t) => t.id === taskId);
        if (!taskToMove) return;

        const updatedTasks = oldTasks.map((task) => {
          if (task.id === taskId) {
            return { ...task, status: newStatus, position: newPosition };
          }
          return task;
        });

        set({ tasks: updatedTasks });

        try {
          await taskService.move(taskId, { status: newStatus, position: newPosition });
          // Refetch to ensure consistency
          await get().fetchTasks();
        } catch (error: any) {
          // Rollback on error
          set({ tasks: oldTasks });
          set({
            error: error.response?.data?.error || 'Failed to move task',
          });
        }
      },

      setSelectedTask: (task: Task | null) => set({ selectedTask: task }),

      clearError: () => set({ error: null }),
    }),
    { name: 'TaskStore' }
  )
);
