import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  emailService,
  Email,
  SendEmailData,
  SendEmailWithTemplateData,
  BulkEmailData,
} from '../services/emailService';

interface EmailState {
  emails: Email[];
  selectedEmail: Email | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchEmails: (contactId?: string, senderId?: string) => Promise<void>;
  fetchEmailById: (id: string) => Promise<void>;
  sendEmail: (data: SendEmailData) => Promise<Email>;
  sendEmailWithTemplate: (data: SendEmailWithTemplateData) => Promise<Email>;
  sendBulkEmails: (data: BulkEmailData) => Promise<any>;
  saveDraft: (data: SendEmailData) => Promise<Email>;
  deleteEmail: (id: string) => Promise<void>;
  setSelectedEmail: (email: Email | null) => void;
}

export const useEmailStore = create<EmailState>()(
  devtools(
    (set, get) => ({
      emails: [],
      selectedEmail: null,
      isLoading: false,
      error: null,

      fetchEmails: async (contactId?: string, senderId?: string) => {
        set({ isLoading: true, error: null });
        try {
          const { emails } = await emailService.getEmails(contactId, senderId);
          set({ emails, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to fetch emails',
            isLoading: false,
          });
        }
      },

      fetchEmailById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const { email } = await emailService.getEmailById(id);
          set({ selectedEmail: email, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to fetch email',
            isLoading: false,
          });
        }
      },

      sendEmail: async (data: SendEmailData) => {
        set({ isLoading: true, error: null });
        try {
          const { email } = await emailService.sendEmail(data);
          set((state) => ({
            emails: [email, ...state.emails],
            isLoading: false,
          }));
          return email;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to send email',
            isLoading: false,
          });
          throw error;
        }
      },

      sendEmailWithTemplate: async (data: SendEmailWithTemplateData) => {
        set({ isLoading: true, error: null });
        try {
          const { email } = await emailService.sendEmailWithTemplate(data);
          set((state) => ({
            emails: [email, ...state.emails],
            isLoading: false,
          }));
          return email;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to send email',
            isLoading: false,
          });
          throw error;
        }
      },

      sendBulkEmails: async (data: BulkEmailData) => {
        set({ isLoading: true, error: null });
        try {
          const results = await emailService.sendBulkEmails(data);
          set({ isLoading: false });
          // Refresh email list
          await get().fetchEmails();
          return results;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to send bulk emails',
            isLoading: false,
          });
          throw error;
        }
      },

      saveDraft: async (data: SendEmailData) => {
        set({ isLoading: true, error: null });
        try {
          const { draft } = await emailService.saveDraft(data);
          set((state) => ({
            emails: [draft, ...state.emails],
            isLoading: false,
          }));
          return draft;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to save draft',
            isLoading: false,
          });
          throw error;
        }
      },

      deleteEmail: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await emailService.deleteEmail(id);
          set((state) => ({
            emails: state.emails.filter((e) => e.id !== id),
            selectedEmail: state.selectedEmail?.id === id ? null : state.selectedEmail,
            isLoading: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to delete email',
            isLoading: false,
          });
          throw error;
        }
      },

      setSelectedEmail: (email: Email | null) => {
        set({ selectedEmail: email });
      },
    }),
    { name: 'email-store' }
  )
);
