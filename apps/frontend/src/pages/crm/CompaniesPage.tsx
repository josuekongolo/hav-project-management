import { useEffect, useState } from 'react';
import { useCompanyStore } from '../../store/companyStore';
import { CompanyList } from '../../components/features/crm/companies/CompanyList';
import { CompanyFilters } from '../../components/features/crm/companies/CompanyFilters';
import { CompanyForm } from '../../components/features/crm/companies/CompanyForm';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { Company, CreateCompanyData, UpdateCompanyData } from '../../services/companyService';
import { FilePlus, Building2, Users, DollarSign, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

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
  } = useCompanyStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600 mt-1">Manage your company relationships</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsFiltersVisible(!isFiltersVisible)}>
            {isFiltersVisible ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Button onClick={handleCreateCompany}>
            <FilePlus className="h-4 w-4 mr-2" />
            New Company
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

      {/* Filters */}
      {isFiltersVisible && (
        <div className="mb-6">
          <CompanyFilters filters={filters} onFiltersChange={setFilters} />
        </div>
      )}

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
    </div>
  );
}
