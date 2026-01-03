import { api } from './api';

export interface Company {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  employees: number | null;
  revenue: number | null;
  logo: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    contacts: number;
    deals: number;
    notes: number;
    calls: number;
    meetings: number;
  };
}

export interface CreateCompanyData {
  name: string;
  industry?: string;
  website?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  employees?: number;
  revenue?: number;
  logo?: string;
}

export interface UpdateCompanyData {
  name?: string;
  industry?: string;
  website?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  employees?: number;
  revenue?: number;
  logo?: string;
}

export interface CompanyFilters {
  industry?: string;
  search?: string;
  minEmployees?: number;
  maxEmployees?: number;
  minRevenue?: number;
  maxRevenue?: number;
}

export const companyService = {
  async getCompanies(filters?: CompanyFilters): Promise<{ companies: Company[] }> {
    const params = new URLSearchParams();
    if (filters?.industry) params.append('industry', filters.industry);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.minEmployees) params.append('minEmployees', filters.minEmployees.toString());
    if (filters?.maxEmployees) params.append('maxEmployees', filters.maxEmployees.toString());
    if (filters?.minRevenue) params.append('minRevenue', filters.minRevenue.toString());
    if (filters?.maxRevenue) params.append('maxRevenue', filters.maxRevenue.toString());

    const response = await api.get<{ companies: Company[] }>(
      `/companies${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  async getCompanyById(id: string): Promise<{ company: Company }> {
    const response = await api.get<{ company: Company }>(`/companies/${id}`);
    return response.data;
  },

  async createCompany(data: CreateCompanyData): Promise<{ company: Company }> {
    const response = await api.post<{ company: Company }>('/companies', data);
    return response.data;
  },

  async updateCompany(id: string, data: UpdateCompanyData): Promise<{ company: Company }> {
    const response = await api.patch<{ company: Company }>(`/companies/${id}`, data);
    return response.data;
  },

  async deleteCompany(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/companies/${id}`);
    return response.data;
  },

  async searchCompanies(query: string): Promise<{ companies: Array<{ id: string; name: string; industry: string | null; logo: string | null }> }> {
    const response = await api.get<{ companies: Array<{ id: string; name: string; industry: string | null; logo: string | null }> }>(
      `/companies/search?q=${encodeURIComponent(query)}`
    );
    return response.data;
  },
};
