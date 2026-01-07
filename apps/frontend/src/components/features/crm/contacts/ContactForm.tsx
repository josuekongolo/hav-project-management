import { useState, useEffect } from 'react';
import { Contact, ContactStatus, CreateContactData, UpdateContactData } from '../../../../services/contactService';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Select } from '../../../ui/Select';
import { Textarea } from '../../../ui/Textarea';
import { useTaskStore } from '../../../../store/taskStore';
import { CompanySelector } from '../shared/CompanySelector';

interface ContactFormProps {
  contact?: Contact | null;
  onSubmit: (data: CreateContactData | UpdateContactData) => Promise<void>;
  onCancel: () => void;
}

export function ContactForm({ contact, onSubmit, onCancel }: ContactFormProps) {
  const { users, fetchUsers } = useTaskStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateContactData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyId: '',
    website: '',
    address: '',
    city: '',
    country: '',
    status: ContactStatus.LEAD,
    source: '',
    notes: '',
    assignedToId: '',
  });

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (contact) {
      setFormData({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone || '',
        companyId: contact.companyId || '',
        website: contact.website || '',
        address: contact.address || '',
        city: contact.city || '',
        country: contact.country || '',
        status: contact.status,
        source: contact.source || '',
        notes: contact.notes || '',
        assignedToId: contact.assignedToId || '',
      });
    }
  }, [contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Remove empty optional fields
      const cleanedData: any = { ...formData };
      Object.keys(cleanedData).forEach(key => {
        if (cleanedData[key] === '') {
          delete cleanedData[key];
        }
      });
      await onSubmit(cleanedData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="First Name"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          required
        />
        <Input
          label="Last Name"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <Input
          label="Phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company
          </label>
          <CompanySelector
            value={formData.companyId || null}
            onChange={(companyId) => setFormData({ ...formData, companyId: companyId || '' })}
            placeholder="Search and select company..."
          />
        </div>
        <Input
          label="Website"
          type="url"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          placeholder="https://example.com"
        />
      </div>

      <Input
        label="Address"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="City"
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
        />
        <Input
          label="Country"
          value={formData.country}
          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as ContactStatus })}
          options={[
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
          label="Assign To"
          value={formData.assignedToId}
          onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
          options={[
            { value: '', label: 'Unassigned' },
            ...users.map((user) => ({ value: user.id, label: user.name })),
          ]}
        />
      </div>

      <Input
        label="Source"
        value={formData.source}
        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
        placeholder="How did they find you? (e.g., Website, Referral, LinkedIn)"
      />

      <Textarea
        label="Notes"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        rows={4}
        placeholder="Additional notes about this contact..."
      />

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? 'Saving...' : contact ? 'Update Contact' : 'Create Contact'}
        </Button>
      </div>
    </form>
  );
}
