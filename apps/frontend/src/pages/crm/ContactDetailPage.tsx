import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useContactStore } from '../../store/contactStore';
import { useDealStore } from '../../store/dealStore';
import { ActivityTimeline } from '../../components/features/crm/shared/ActivityTimeline';
import { ContactForm } from '../../components/features/crm/contacts/ContactForm';
import { NotesList } from '../../components/features/crm/shared/NotesList';
import { CallLogDialog } from '../../components/features/crm/shared/CallLogDialog';
import { MeetingDialog } from '../../components/features/crm/shared/MeetingDialog';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { ContactStatus } from '../../services/contactService';
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  MapPin,
  Building2,
  Edit,
  DollarSign,
  CheckCircle,
  Clock,
  Target,
  PhoneCall,
  Calendar,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const statusColors: Record<ContactStatus, string> = {
  [ContactStatus.LEAD]: 'bg-gray-100 text-gray-800',
  [ContactStatus.CONTACTED]: 'bg-blue-100 text-blue-800',
  [ContactStatus.QUALIFIED]: 'bg-cyan-100 text-cyan-800',
  [ContactStatus.PROPOSAL]: 'bg-purple-100 text-purple-800',
  [ContactStatus.NEGOTIATION]: 'bg-yellow-100 text-yellow-800',
  [ContactStatus.CUSTOMER]: 'bg-green-100 text-green-800',
  [ContactStatus.INACTIVE]: 'bg-gray-100 text-gray-600',
  [ContactStatus.LOST]: 'bg-red-100 text-red-800',
};

export function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    selectedContact,
    contactActivities,
    contactEmails,
    contactTasks,
    isLoading,
    isLoadingActivities,
    fetchContactById,
    fetchContactActivities,
    fetchContactEmails,
    fetchContactTasks,
    updateContact,
  } = useContactStore();

  const { deals, fetchDeals, setFilters: setDealFilters } = useDealStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchContactById(id);
      fetchContactActivities(id);
      fetchContactEmails(id);
      fetchContactTasks(id);
      setDealFilters({ contactId: id });
      fetchDeals();
    }
  }, [id, fetchContactById, fetchContactActivities, fetchContactEmails, fetchContactTasks, setDealFilters, fetchDeals]);

  const handleEditContact = async (data: any) => {
    if (!id) return;
    try {
      await updateContact(id, data);
      toast.success('Contact updated successfully');
      setIsEditModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update contact');
    }
  };

  const contactDeals = deals.filter((deal) => deal.contactId === id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!selectedContact) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Contact not found</p>
        <Button onClick={() => navigate('/crm/contacts')} className="mt-4">
          Back to Contacts
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
          onClick={() => navigate('/crm/contacts')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contacts
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {selectedContact.firstName} {selectedContact.lastName}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  statusColors[selectedContact.status]
                }`}
              >
                {selectedContact.status}
              </span>
              {selectedContact.assignedTo && (
                <span className="text-sm text-gray-600">
                  Assigned to: {selectedContact.assignedTo.name}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button>
              <Mail className="h-4 w-4 mr-2" />
              Send Email
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
        {/* Left Column - Contact Information */}
        <div className="lg:col-span-1 space-y-6">
          {/* Contact Details */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-3">
              {selectedContact.email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <a
                      href={`mailto:${selectedContact.email}`}
                      className="text-sm text-primary-600 hover:underline"
                    >
                      {selectedContact.email}
                    </a>
                  </div>
                </div>
              )}
              {selectedContact.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <a
                      href={`tel:${selectedContact.phone}`}
                      className="text-sm text-primary-600 hover:underline"
                    >
                      {selectedContact.phone}
                    </a>
                  </div>
                </div>
              )}
              {selectedContact.company && (
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Company</p>
                    <p className="text-sm text-gray-900">{selectedContact.company}</p>
                  </div>
                </div>
              )}
              {selectedContact.website && (
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    <a
                      href={selectedContact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:underline"
                    >
                      {selectedContact.website}
                    </a>
                  </div>
                </div>
              )}
              {(selectedContact.address || selectedContact.city || selectedContact.country) && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-sm text-gray-900">
                      {[selectedContact.address, selectedContact.city, selectedContact.country]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Notes */}
          {selectedContact.notes && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedContact.notes}</p>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
            <div className="space-y-2 text-sm">
              {selectedContact.source && (
                <div>
                  <span className="text-gray-500">Source:</span>{' '}
                  <span className="text-gray-900">{selectedContact.source}</span>
                </div>
              )}
              <div>
                <span className="text-gray-500">Created:</span>{' '}
                <span className="text-gray-900">
                  {formatDistanceToNow(new Date(selectedContact.createdAt), { addSuffix: true })}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Last updated:</span>{' '}
                <span className="text-gray-900">
                  {formatDistanceToNow(new Date(selectedContact.updatedAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Activities & Related Data */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-600">Deals</p>
                  <p className="text-2xl font-bold text-blue-900">{contactDeals.length}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="flex items-center gap-3">
                <Mail className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-purple-600">Emails</p>
                  <p className="text-2xl font-bold text-purple-900">{contactEmails.length}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-600">Tasks</p>
                  <p className="text-2xl font-bold text-green-900">{contactTasks.length}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-orange-600">Activities</p>
                  <p className="text-2xl font-bold text-orange-900">{contactActivities.length}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Deals */}
          {contactDeals.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Deals</h2>
                <Link
                  to="/crm/deals"
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {contactDeals.map((deal) => (
                  <div
                    key={deal.id}
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
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Tasks */}
          {contactTasks.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
                <Link to="/kanban" className="text-sm text-primary-600 hover:text-primary-700">
                  View all
                </Link>
              </div>
              <div className="space-y-2">
                {contactTasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <CheckCircle
                      className={`h-5 w-5 ${
                        task.status === 'DONE' ? 'text-green-600' : 'text-gray-400'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-600">{task.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Activity Timeline */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h2>
            <ActivityTimeline activities={contactActivities} isLoading={isLoadingActivities} />
          </Card>

          {/* Notes */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
            <NotesList noteableType="Contact" noteableId={id!} />
          </Card>
        </div>
      </div>

      {/* Edit Contact Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Contact"
      >
        <ContactForm
          contact={selectedContact}
          onSubmit={handleEditContact}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Call Log Dialog */}
      <CallLogDialog
        isOpen={isCallDialogOpen}
        onClose={() => setIsCallDialogOpen(false)}
        contactId={id}
        onSuccess={() => {
          if (id) {
            fetchContactActivities(id);
          }
        }}
      />

      {/* Meeting Dialog */}
      <MeetingDialog
        isOpen={isMeetingDialogOpen}
        onClose={() => setIsMeetingDialogOpen(false)}
        contactId={id}
        onSuccess={() => {
          if (id) {
            fetchContactActivities(id);
          }
        }}
      />
    </div>
  );
}
