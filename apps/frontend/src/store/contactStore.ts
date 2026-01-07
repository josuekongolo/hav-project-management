import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  contactService,
  Contact,
  ContactStatus,
  CreateContactData,
  UpdateContactData,
  ContactFilters,
} from '../services/contactService';

interface ContactState {
  contacts: Contact[];
  selectedContact: Contact | null;
  contactActivities: any[];
  contactEmails: any[];
  contactTasks: any[];
  isLoading: boolean;
  isLoadingActivities: boolean;
  isLoadingEmails: boolean;
  isLoadingTasks: boolean;
  error: string | null;
  filters: ContactFilters;

  // Actions
  fetchContacts: () => Promise<void>;
  fetchContactById: (id: string) => Promise<void>;
  fetchContactActivities: (id: string) => Promise<void>;
  fetchContactEmails: (id: string) => Promise<void>;
  fetchContactTasks: (id: string) => Promise<void>;
  createContact: (data: CreateContactData) => Promise<Contact>;
  updateContact: (id: string, data: UpdateContactData) => Promise<Contact>;
  deleteContact: (id: string) => Promise<void>;
  searchContacts: (query: string) => Promise<Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    companyRel: { id: string; name: string } | null;
  }>>;
  setFilters: (filters: ContactFilters) => void;
  clearFilters: () => void;
  setSelectedContact: (contact: Contact | null) => void;
}

export const useContactStore = create<ContactState>()(
  devtools(
    (set, get) => ({
      contacts: [],
      selectedContact: null,
      contactActivities: [],
      contactEmails: [],
      contactTasks: [],
      isLoading: false,
      isLoadingActivities: false,
      isLoadingEmails: false,
      isLoadingTasks: false,
      error: null,
      filters: {},

      fetchContacts: async () => {
        set({ isLoading: true, error: null });
        try {
          const { contacts } = await contactService.getContacts(get().filters);
          set({ contacts, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to fetch contacts',
            isLoading: false,
          });
        }
      },

      fetchContactById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const { contact } = await contactService.getContactById(id);
          set({ selectedContact: contact, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to fetch contact',
            isLoading: false,
          });
        }
      },

      createContact: async (data: CreateContactData) => {
        set({ isLoading: true, error: null });
        try {
          const { contact } = await contactService.createContact(data);
          set((state) => ({
            contacts: [contact, ...state.contacts],
            isLoading: false,
          }));
          return contact;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to create contact',
            isLoading: false,
          });
          throw error;
        }
      },

      updateContact: async (id: string, data: UpdateContactData) => {
        set({ isLoading: true, error: null });
        try {
          const { contact } = await contactService.updateContact(id, data);
          set((state) => ({
            contacts: state.contacts.map((c) => (c.id === id ? contact : c)),
            selectedContact: state.selectedContact?.id === id ? contact : state.selectedContact,
            isLoading: false,
          }));
          return contact;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to update contact',
            isLoading: false,
          });
          throw error;
        }
      },

      deleteContact: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await contactService.deleteContact(id);
          set((state) => ({
            contacts: state.contacts.filter((c) => c.id !== id),
            selectedContact: state.selectedContact?.id === id ? null : state.selectedContact,
            isLoading: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to delete contact',
            isLoading: false,
          });
          throw error;
        }
      },

      fetchContactActivities: async (id: string) => {
        set({ isLoadingActivities: true, error: null });
        try {
          const { activities } = await contactService.getContactActivities(id);
          set({ contactActivities: activities, isLoadingActivities: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to fetch activities',
            isLoadingActivities: false,
          });
        }
      },

      fetchContactEmails: async (id: string) => {
        set({ isLoadingEmails: true, error: null });
        try {
          const { emails } = await contactService.getContactEmails(id);
          set({ contactEmails: emails, isLoadingEmails: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to fetch emails',
            isLoadingEmails: false,
          });
        }
      },

      fetchContactTasks: async (id: string) => {
        set({ isLoadingTasks: true, error: null });
        try {
          const { tasks } = await contactService.getContactTasks(id);
          set({ contactTasks: tasks, isLoadingTasks: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to fetch tasks',
            isLoadingTasks: false,
          });
        }
      },

      setFilters: (filters: ContactFilters) => {
        set({ filters });
        get().fetchContacts();
      },

      clearFilters: () => {
        set({ filters: {} });
        get().fetchContacts();
      },

      searchContacts: async (query: string) => {
        try {
          const { contacts } = await contactService.searchContacts(query);
          return contacts;
        } catch (error: any) {
          console.error('Failed to search contacts:', error);
          return [];
        }
      },

      setSelectedContact: (contact: Contact | null) => {
        set({ selectedContact: contact });
      },
    }),
    { name: 'contact-store' }
  )
);
