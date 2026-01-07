import { Contact, ContactStatus } from '../../../../services/contactService';
import { Building2, Mail, Phone, User, Trash2 } from 'lucide-react';
import { Card } from '../../../ui/Card';
import { Badge } from '../../../ui/Badge';
import { useNavigate } from 'react-router-dom';

interface ContactListProps {
  contacts: Contact[];
  selectedContacts?: Contact[];
  onContactClick: (contact: Contact) => void;
  onDeleteContact: (id: string) => void;
  onToggleSelection?: (contact: Contact) => void;
}

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

export function ContactList({
  contacts,
  selectedContacts = [],
  onContactClick,
  onDeleteContact,
  onToggleSelection
}: ContactListProps) {
  const navigate = useNavigate();

  const isSelected = (contact: Contact) => {
    return selectedContacts.some((c) => c.id === contact.id);
  };

  if (contacts.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new contact.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {contacts.map((contact) => (
        <div key={contact.id} className="relative">
          {onToggleSelection && (
            <div className="absolute top-4 left-4 z-10">
              <input
                type="checkbox"
                checked={isSelected(contact)}
                onChange={(e) => {
                  e.stopPropagation();
                  onToggleSelection(contact);
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-6 h-6 sm:w-5 sm:h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
              />
            </div>
          )}
          <div
            className="cursor-pointer"
            onClick={() => navigate(`/crm/contacts/${contact.id}`)}
          >
            <Card className={`hover:shadow-lg transition-shadow relative group ${isSelected(contact) ? 'ring-2 ring-primary-500' : ''}`}>
            <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <User className="h-6 w-6 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {contact.firstName} {contact.lastName}
                </h3>
                <p className="text-sm text-gray-500 truncate">{contact.email}</p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this contact?')) {
                  onDeleteContact(contact.id);
                }
              }}
              className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-2 sm:p-1 hover:bg-red-50 rounded flex-shrink-0"
            >
              <Trash2 className="h-5 w-5 sm:h-4 sm:w-4 text-red-600" />
            </button>
          </div>

          <div className="space-y-2 mb-3">
            {contact.company && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building2 className="h-4 w-4" />
                <span className="truncate">{contact.company}</span>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{contact.phone}</span>
              </div>
            )}
            {contact.city && contact.country && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="truncate">
                  {contact.city}, {contact.country}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <Badge className={statusColors[contact.status]}>
              {contact.status.replace('_', ' ')}
            </Badge>
            {contact._count && (
              <div className="flex gap-3 text-xs text-gray-500">
                {contact._count.deals > 0 && <span>{contact._count.deals} deals</span>}
                {contact._count.tasks > 0 && <span>{contact._count.tasks} tasks</span>}
                {contact._count.emails > 0 && <span>{contact._count.emails} emails</span>}
              </div>
            )}
          </div>

          {contact.assignedTo && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Assigned to:</span>
                <div className="flex items-center gap-1">
                  {contact.assignedTo.avatar ? (
                    <img
                      src={contact.assignedTo.avatar}
                      alt={contact.assignedTo.name}
                      className="h-5 w-5 rounded-full"
                    />
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-3 w-3 text-gray-600" />
                    </div>
                  )}
                  <span className="text-xs font-medium text-gray-700">
                    {contact.assignedTo.name}
                  </span>
                </div>
              </div>
            </div>
          )}
          </Card>
          </div>
        </div>
      ))}
    </div>
  );
}
