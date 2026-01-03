import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  companyService,
  Company,
  CreateCompanyData,
  UpdateCompanyData,
  CompanyFilters,
} from '../services/companyService';

interface CompanyState {
  companies: Company[];
  selectedCompany: Company | null;
  isLoading: boolean;
  error: string | null;
  filters: CompanyFilters;

  // Actions
  fetchCompanies: () => Promise<void>;
  fetchCompanyById: (id: string) => Promise<void>;
  createCompany: (data: CreateCompanyData) => Promise<Company>;
  updateCompany: (id: string, data: UpdateCompanyData) => Promise<Company>;
  deleteCompany: (id: string) => Promise<void>;
  searchCompanies: (query: string) => Promise<Array<{ id: string; name: string; industry: string | null; logo: string | null }>>;
  setFilters: (filters: CompanyFilters) => void;
  clearFilters: () => void;
  setSelectedCompany: (company: Company | null) => void;
}

export const useCompanyStore = create<CompanyState>()(
  devtools(
    (set, get) => ({
      companies: [],
      selectedCompany: null,
      isLoading: false,
      error: null,
      filters: {},

      fetchCompanies: async () => {
        set({ isLoading: true, error: null });
        try {
          const { companies } = await companyService.getCompanies(get().filters);
          set({ companies, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to fetch companies',
            isLoading: false,
          });
        }
      },

      fetchCompanyById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const { company } = await companyService.getCompanyById(id);
          set({ selectedCompany: company, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to fetch company',
            isLoading: false,
          });
        }
      },

      createCompany: async (data: CreateCompanyData) => {
        set({ isLoading: true, error: null });
        try {
          const { company } = await companyService.createCompany(data);
          set((state) => ({
            companies: [company, ...state.companies],
            isLoading: false,
          }));
          return company;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to create company',
            isLoading: false,
          });
          throw error;
        }
      },

      updateCompany: async (id: string, data: UpdateCompanyData) => {
        set({ isLoading: true, error: null });
        try {
          const { company } = await companyService.updateCompany(id, data);
          set((state) => ({
            companies: state.companies.map((c) => (c.id === id ? company : c)),
            selectedCompany: state.selectedCompany?.id === id ? company : state.selectedCompany,
            isLoading: false,
          }));
          return company;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to update company',
            isLoading: false,
          });
          throw error;
        }
      },

      deleteCompany: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await companyService.deleteCompany(id);
          set((state) => ({
            companies: state.companies.filter((c) => c.id !== id),
            selectedCompany: state.selectedCompany?.id === id ? null : state.selectedCompany,
            isLoading: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to delete company',
            isLoading: false,
          });
          throw error;
        }
      },

      searchCompanies: async (query: string) => {
        try {
          const { companies } = await companyService.searchCompanies(query);
          return companies;
        } catch (error: any) {
          console.error('Failed to search companies:', error);
          return [];
        }
      },

      setFilters: (filters: CompanyFilters) => {
        set({ filters });
      },

      clearFilters: () => {
        set({ filters: {} });
      },

      setSelectedCompany: (company: Company | null) => {
        set({ selectedCompany: company });
      },
    }),
    { name: 'CompanyStore' }
  )
);
