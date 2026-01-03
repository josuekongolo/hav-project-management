import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCompanyStore } from '../../store/companyStore';
import { useContactStore } from '../../store/contactStore';
import { useDealStore } from '../../store/dealStore';
import { CompanyForm } from '../../components/features/crm/companies/CompanyForm';
import { NotesList } from '../../components/features/crm/shared/NotesList';
import { CallLogDialog } from '../../components/features/crm/shared/CallLogDialog';
import { MeetingDialog } from '../../components/features/crm/shared/MeetingDialog';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  MapPin,
  Building2,
  Edit,
  DollarSign,
  Users,
  TrendingUp,
  PhoneCall,
  Calendar,
  User,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    selectedCompany,
    isLoading,
    fetchCompanyById,
    updateCompany,
  } = useCompanyStore();

  const { contacts, fetchContacts, setFilters: setContactFilters } = useContactStore();
  const { deals, fetchDeals, setFilters: setDealFilters } = useDealStore();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCompanyById(id);
      setContactFilters({ companyId: id });
      fetchContacts();
      setDealFilters({ companyId: id });
      fetchDeals();
    }
  }, [id, fetchCompanyById, setContactFilters, fetchContacts, setDealFilters, fetchDeals]);

  const handleEditCompany = async (data: any) => {
    if (!id) return;
    try {
      await updateCompany(id, data);
      toast.success('Company updated successfully');
      setIsEditModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update company');
    }
  };

  const companyContacts = contacts.filter((contact) => contact.companyId === id);
  const companyDeals = deals.filter((deal) => deal.companyId === id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!selectedCompany) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Company not found</p>
        <Button onClick={() => navigate('/crm/companies')} className="mt-4">
          Back to Companies
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="secondary"
          onClick={() => navigate('/crm/companies')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Companies
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {selectedCompany.logo ? (
              <img
                src={selectedCompany.logo}
                alt={selectedCompany.name}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{selectedCompany.name}</h1>
              {selectedCompany.industry && (
                <p className="text-gray-600 mt-1">{selectedCompany.industry}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="secondary" onClick={() => setIsCallDialogOpen(true)}>
              <PhoneCall className="h-4 w-4 mr-2" />
              Log Call
            </Button>
            <Button variant="secondary" onClick={() => setIsMeetingDialogOpen(true)}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Company Information */}
        <div className="lg:col-span-1 space-y-6">
          {/* Company Details */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h2>
            <div className="space-y-3">
              {selectedCompany.email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <a
                      href={`mailto:${selectedCompany.email}`}
                      className="text-sm text-primary-600 hover:underline"
                    >
                      {selectedCompany.email}
                    </a>
                  </div>
                </div>
              )}
              {selectedCompany.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <a
                      href={`tel:${selectedCompany.phone}`}
                      className="text-sm text-primary-600 hover:underline"
                    >
                      {selectedCompany.phone}
                    </a>
                  </div>
                </div>
              )}
              {selectedCompany.website && (
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    <a
                      href={selectedCompany.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:underline"
                    >
                      {selectedCompany.website}
                    </a>
                  </div>
                </div>
              )}
              {(selectedCompany.address || selectedCompany.city || selectedCompany.country) && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-sm text-gray-900">
                      {[selectedCompany.address, selectedCompany.city, selectedCompany.country]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                </div>
              )}
              {selectedCompany.employees && (
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Employees</p>
                    <p className="text-sm text-gray-900">
                      {selectedCompany.employees.toLocaleString()} employees
                    </p>
                  </div>
                </div>
              )}
              {selectedCompany.revenue && (
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Revenue</p>
                    <p className="text-sm text-gray-900">
                      ${(selectedCompany.revenue / 1000000).toFixed(1)}M annually
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Description */}
          {selectedCompany.description && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {selectedCompany.description}
              </p>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Created:</span>{' '}
                <span className="text-gray-900">
                  {formatDistanceToNow(new Date(selectedCompany.createdAt), { addSuffix: true })}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Last updated:</span>{' '}
                <span className="text-gray-900">
                  {formatDistanceToNow(new Date(selectedCompany.updatedAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Related Data */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="flex items-center gap-3">
                <User className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-purple-600">Contacts</p>
                  <p className="text-2xl font-bold text-purple-900">{companyContacts.length}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-600">Deals</p>
                  <p className="text-2xl font-bold text-green-900">{companyDeals.length}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Contacts */}
          {companyContacts.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Contacts</h2>
                <Link
                  to="/crm/contacts"
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {companyContacts.map((contact) => (
                  <Link
                    key={contact.id}
                    to={`/crm/contacts/${contact.id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {contact.firstName} {contact.lastName}
                      </p>
                      {contact.email && <p className="text-sm text-gray-600">{contact.email}</p>}
                    </div>
                    <div className="text-sm text-gray-600">{contact.status}</div>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {/* Deals */}
          {companyDeals.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Deals</h2>
                <Link to="/crm/deals" className="text-sm text-primary-600 hover:text-primary-700">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {companyDeals.map((deal) => (
                  <Link
                    key={deal.id}
                    to={`/crm/deals/${deal.id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{deal.title}</p>
                      <p className="text-sm text-gray-600">{deal.stage.replace('_', ' ')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${deal.value.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">{deal.probability}% probability</p>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {/* Notes */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
            <NotesList noteableType="Company" noteableId={id!} />
          </Card>
        </div>
      </div>

      {/* Edit Company Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Company"
      >
        <CompanyForm
          company={selectedCompany}
          onSubmit={handleEditCompany}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Call Log Dialog */}
      <CallLogDialog
        isOpen={isCallDialogOpen}
        onClose={() => setIsCallDialogOpen(false)}
        companyId={id}
        onSuccess={() => {
          // Refresh company data if needed
          if (id) fetchCompanyById(id);
        }}
      />

      {/* Meeting Dialog */}
      <MeetingDialog
        isOpen={isMeetingDialogOpen}
        onClose={() => setIsMeetingDialogOpen(false)}
        companyId={id}
        onSuccess={() => {
          // Refresh company data if needed
          if (id) fetchCompanyById(id);
        }}
      />
    </div>
  );
}
