import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  emailTemplateService,
  EmailTemplate,
  EmailTemplateCategory,
  CreateEmailTemplateData,
  UpdateEmailTemplateData,
  TemplateVariables,
} from '../services/emailTemplateService';

interface EmailTemplateState {
  templates: EmailTemplate[];
  selectedTemplate: EmailTemplate | null;
  isLoading: boolean;
  error: string | null;
  categoryFilter: EmailTemplateCategory | null;

  // Actions
  fetchTemplates: (category?: EmailTemplateCategory) => Promise<void>;
  fetchTemplateById: (id: string) => Promise<void>;
  createTemplate: (data: CreateEmailTemplateData) => Promise<EmailTemplate>;
  updateTemplate: (id: string, data: UpdateEmailTemplateData) => Promise<EmailTemplate>;
  deleteTemplate: (id: string) => Promise<void>;
  renderTemplate: (id: string, variables: TemplateVariables) => Promise<{ subject: string; body: string; htmlBody?: string }>;
  setCategoryFilter: (category: EmailTemplateCategory | null) => void;
  setSelectedTemplate: (template: EmailTemplate | null) => void;
}

export const useEmailTemplateStore = create<EmailTemplateState>()(
  devtools(
    (set, get) => ({
      templates: [],
      selectedTemplate: null,
      isLoading: false,
      error: null,
      categoryFilter: null,

      fetchTemplates: async (category?: EmailTemplateCategory) => {
        set({ isLoading: true, error: null });
        try {
          const { templates } = await emailTemplateService.getEmailTemplates(
            category || get().categoryFilter || undefined
          );
          set({ templates, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to fetch templates',
            isLoading: false,
          });
        }
      },

      fetchTemplateById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const { template } = await emailTemplateService.getEmailTemplateById(id);
          set({ selectedTemplate: template, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to fetch template',
            isLoading: false,
          });
        }
      },

      createTemplate: async (data: CreateEmailTemplateData) => {
        set({ isLoading: true, error: null });
        try {
          const { template } = await emailTemplateService.createEmailTemplate(data);
          set((state) => ({
            templates: [template, ...state.templates],
            isLoading: false,
          }));
          return template;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to create template',
            isLoading: false,
          });
          throw error;
        }
      },

      updateTemplate: async (id: string, data: UpdateEmailTemplateData) => {
        set({ isLoading: true, error: null });
        try {
          const { template } = await emailTemplateService.updateEmailTemplate(id, data);
          set((state) => ({
            templates: state.templates.map((t) => (t.id === id ? template : t)),
            selectedTemplate: state.selectedTemplate?.id === id ? template : state.selectedTemplate,
            isLoading: false,
          }));
          return template;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to update template',
            isLoading: false,
          });
          throw error;
        }
      },

      deleteTemplate: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await emailTemplateService.deleteEmailTemplate(id);
          set((state) => ({
            templates: state.templates.filter((t) => t.id !== id),
            selectedTemplate: state.selectedTemplate?.id === id ? null : state.selectedTemplate,
            isLoading: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to delete template',
            isLoading: false,
          });
          throw error;
        }
      },

      renderTemplate: async (id: string, variables: TemplateVariables) => {
        try {
          return await emailTemplateService.renderTemplate(id, variables);
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to render template',
          });
          throw error;
        }
      },

      setCategoryFilter: (category: EmailTemplateCategory | null) => {
        set({ categoryFilter: category });
        get().fetchTemplates(category || undefined);
      },

      setSelectedTemplate: (template: EmailTemplate | null) => {
        set({ selectedTemplate: template });
      },
    }),
    { name: 'email-template-store' }
  )
);
