import { useEffect, useState } from 'react';
import { useCompanyStore } from '../../store/companyStore';
import { CompanyList } from '../../components/features/crm/companies/CompanyList';
import { CompanyForm } from '../../components/features/crm/companies/CompanyForm';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { Company, CreateCompanyData, UpdateCompanyData } from '../../services/companyService';
import { FilePlus, Building2, Users, DollarSign, TrendingUp, Upload, Search, Filter, X } from 'lucide-react';
import { BulkImportDialog } from '../../components/features/import';
import toast from 'react-hot-toast';

// Common industries for the dropdown
const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Retail',
  'Education',
  'Real Estate',
  'Consulting',
  'Media',
  'Transportation',
  'Energy',
  'Other',
];

export function CompaniesPage() {
  const {
    companies,
    isLoading,
    filters,
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    setFilters,
    clearFilters,
  } = useCompanyStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isAdvancedFiltersVisible, setIsAdvancedFiltersVisible] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Local filter state for controlled inputs
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Refetch when filters change
  useEffect(() => {
    fetchCompanies();
  }, [filters, fetchCompanies]);

  // Update filters when local state changes
  useEffect(() => {
    const newFilters = { ...filters };

    if (searchQuery) {
      newFilters.search = searchQuery;
    } else {
      delete newFilters.search;
    }

    if (industryFilter) {
      newFilters.industry = industryFilter;
    } else {
      delete newFilters.industry;
    }

    setFilters(newFilters);
  }, [searchQuery, industryFilter]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setIndustryFilter('');
    clearFilters();
  };

  const hasActiveFilters = searchQuery || industryFilter || filters.minEmployees || filters.maxEmployees || filters.minRevenue || filters.maxRevenue;

  const handleCreateCompany = () => {
    setSelectedCompany(null);
    setIsFormOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateCompanyData | UpdateCompanyData) => {
    try {
      if (selectedCompany) {
        await updateCompany(selectedCompany.id, data as UpdateCompanyData);
        toast.success('Company updated successfully');
      } else {
        await createCompany(data as CreateCompanyData);
        toast.success('Company created successfully');
      }
      setIsFormOpen(false);
      setSelectedCompany(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save company');
    }
  };

  const handleDeleteCompany = async (id: string) => {
    try {
      await deleteCompany(id);
      toast.success('Company deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete company');
    }
  };

  // Calculate stats
  const totalCompanies = companies.length;
  const totalContacts = companies.reduce((acc, c) => acc + (c._count?.contacts || 0), 0);
  const totalDeals = companies.reduce((acc, c) => acc + (c._count?.deals || 0), 0);
  const totalRevenue = companies.reduce((acc, c) => acc + (c.revenue || 0), 0);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Companies</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your company relationships</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="secondary" onClick={() => setIsImportOpen(true)} className="w-full sm:w-auto justify-center">
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button onClick={handleCreateCompany} className="w-full sm:w-auto justify-center">
            <FilePlus className="h-4 w-4 mr-2" />
            New Company
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Companies</p>
              <p className="text-2xl font-bold text-blue-900">{totalCompanies}</p>
            </div>
            <Building2 className="h-8 w-8 text-blue-600 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Contacts</p>
              <p className="text-2xl font-bold text-purple-900">{totalContacts}</p>
            </div>
            <Users className="h-8 w-8 text-purple-600 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Deals</p>
              <p className="text-2xl font-bold text-green-900">{totalDeals}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Total Revenue</p>
              <p className="text-2xl font-bold text-orange-900">
                ${(totalRevenue / 1000000).toFixed(1)}M
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-orange-600 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search companies by name, industry, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            options={[
              { value: '', label: 'All Industries' },
              ...INDUSTRIES.map((industry) => ({ value: industry, label: industry })),
            ]}
          />
        </div>

        {/* Advanced Filters Toggle */}
        <div className="mt-4 pt-4 border-t">
          <button
            onClick={() => setIsAdvancedFiltersVisible(!isAdvancedFiltersVisible)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <Filter className="h-4 w-4" />
            {isAdvancedFiltersVisible ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
          </button>

          {isAdvancedFiltersVisible && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Employees
                </label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={filters.minEmployees || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      minEmployees: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Employees
                </label>
                <Input
                  type="number"
                  min="0"
                  placeholder="No limit"
                  value={filters.maxEmployees || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      maxEmployees: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Revenue ($M)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0"
                  value={filters.minRevenue ? (filters.minRevenue / 1000000).toString() : ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      minRevenue: e.target.value ? parseFloat(e.target.value) * 1000000 : undefined,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Revenue ($M)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="No limit"
                  value={filters.maxRevenue ? (filters.maxRevenue / 1000000).toString() : ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      maxRevenue: e.target.value ? parseFloat(e.target.value) * 1000000 : undefined,
                    })
                  }
                />
              </div>
            </div>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="mt-4 flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
              Clear All Filters
            </button>
          )}
        </div>
      </Card>

      {/* Company List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <CompanyList companies={companies} onDeleteCompany={handleDeleteCompany} />
      )}

      {/* Company Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedCompany(null);
        }}
        title={selectedCompany ? 'Edit Company' : 'New Company'}
      >
        <CompanyForm
          company={selectedCompany}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedCompany(null);
          }}
        />
      </Modal>

      {/* Bulk Import Dialog */}
      <BulkImportDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        entityType="companies"
        onImportComplete={() => fetchCompanies()}
      />
    </div>
  );
}
