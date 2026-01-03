import { useEffect, useState } from 'react';
import { useContactStore } from '../../store/contactStore';
import { ContactList } from '../../components/features/crm/contacts/ContactList';
import { ContactForm } from '../../components/features/crm/contacts/ContactForm';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { Contact, ContactStatus } from '../../services/contactService';
import { UserPlus, Search, Filter, Users as UsersIcon } from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';
import toast from 'react-hot-toast';

export function ContactsPage() {
  const {
    contacts,
    isLoading,
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
    setFilters,
    clearFilters,
  } = useContactStore();

  const { users, fetchUsers } = useTaskStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');

  useEffect(() => {
    fetchContacts();
    fetchUsers();
  }, [fetchContacts, fetchUsers]);

  useEffect(() => {
    const filters: any = {};
    if (searchQuery) filters.search = searchQuery;
    if (statusFilter) filters.status = statusFilter;
    if (assigneeFilter) filters.assignedToId = assigneeFilter;

    if (Object.keys(filters).length > 0) {
      setFilters(filters);
    } else {
      clearFilters();
    }
  }, [searchQuery, statusFilter, assigneeFilter, setFilters, clearFilters]);

  const handleCreateContact = () => {
    setSelectedContact(null);
    setIsFormOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (selectedContact) {
        await updateContact(selectedContact.id, data);
        toast.success('Contact updated successfully');
      } else {
        await createContact(data);
        toast.success('Contact created successfully');
      }
      setIsFormOpen(false);
      setSelectedContact(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save contact');
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      await deleteContact(id);
      toast.success('Contact deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete contact');
    }
  };

  // Calculate stats
  const stats = {
    total: contacts.length,
    leads: contacts.filter((c) => c.status === ContactStatus.LEAD).length,
    customers: contacts.filter((c) => c.status === ContactStatus.CUSTOMER).length,
    qualified: contacts.filter((c) => c.status === ContactStatus.QUALIFIED).length,
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600 mt-1">Manage your customer relationships</p>
        </div>
        <Button onClick={handleCreateContact}>
          <UserPlus className="h-4 w-4 mr-2" />
          New Contact
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Contacts</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <UsersIcon className="h-8 w-8 text-blue-600 opacity-50" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Leads</p>
              <p className="text-2xl font-bold text-gray-900">{stats.leads}</p>
            </div>
            <UsersIcon className="h-8 w-8 text-gray-600 opacity-50" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-cyan-600">Qualified</p>
              <p className="text-2xl font-bold text-cyan-900">{stats.qualified}</p>
            </div>
            <UsersIcon className="h-8 w-8 text-cyan-600 opacity-50" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Customers</p>
              <p className="text-2xl font-bold text-green-900">{stats.customers}</p>
            </div>
            <UsersIcon className="h-8 w-8 text-green-600 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Statuses' },
              { value: ContactStatus.LEAD, label: 'Lead' },
              { value: ContactStatus.CONTACTED, label: 'Contacted' },
              { value: ContactStatus.QUALIFIED, label: 'Qualified' },
              { value: ContactStatus.PROPOSAL, label: 'Proposal' },
              { value: ContactStatus.NEGOTIATION, label: 'Negotiation' },
              { value: ContactStatus.CUSTOMER, label: 'Customer' },
              { value: ContactStatus.INACTIVE, label: 'Inactive' },
              { value: ContactStatus.LOST, label: 'Lost' },
            ]}
          />
          <Select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            options={[
              { value: '', label: 'All Assignees' },
              ...users.map((user) => ({ value: user.id, label: user.name })),
            ]}
          />
        </div>
      </Card>

      {/* Contact List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <ContactList
          contacts={contacts}
          onContactClick={handleEditContact}
          onDeleteContact={handleDeleteContact}
        />
      )}

      {/* Contact Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedContact(null);
        }}
        title={selectedContact ? 'Edit Contact' : 'New Contact'}
      >
        <ContactForm
          contact={selectedContact}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedContact(null);
          }}
        />
      </Modal>
    </div>
  );
}
