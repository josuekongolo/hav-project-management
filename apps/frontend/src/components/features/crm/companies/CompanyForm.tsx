import { useState, useEffect } from 'react';
import { Company, CreateCompanyData, UpdateCompanyData } from '../../../../services/companyService';
import { CreateContactData, UpdateContactData as UpdateContactDataType } from '../../../../services/contactService';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Textarea } from '../../../ui/Textarea';
import { Modal } from '../../../ui/Modal';
import { ContactForm } from '../contacts/ContactForm';
import { useContactStore } from '../../../../store/contactStore';
import toast from 'react-hot-toast';

interface CompanyFormProps {
  company?: Company | null;
  onSubmit: (data: CreateCompanyData | UpdateCompanyData) => Promise<void>;
  onCancel: () => void;
}

export function CompanyForm({ company, onSubmit, onCancel }: CompanyFormProps) {
  const { createContact } = useContactStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [formData, setFormData] = useState<CreateCompanyData>({
    name: '',
    industry: '',
    website: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: '',
    employees: undefined,
    revenue: undefined,
    logo: '',
  });

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        industry: company.industry || '',
        website: company.website || '',
        description: company.description || '',
        phone: company.phone || '',
        email: company.email || '',
        address: company.address || '',
        city: company.city || '',
        country: company.country || '',
        employees: company.employees || undefined,
        revenue: company.revenue || undefined,
        logo: company.logo || '',
      });
    }
  }, [company]);

  const handleCreateContact = async (data: CreateContactData | UpdateContactDataType) => {
    try {
      // We're only creating contacts, not updating, so cast to CreateContactData
      const createData = data as CreateContactData;
      // If editing an existing company, set the companyId
      const contactData = company ? { ...createData, companyId: company.id } : createData;
      await createContact(contactData);
      setIsContactFormOpen(false);
      toast.success('Contact created and associated with company successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create contact');
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Remove empty optional fields
      const cleanedData: any = { ...formData };
      Object.keys(cleanedData).forEach(key => {
        if (cleanedData[key] === '' || cleanedData[key] === undefined) {
          delete cleanedData[key];
        }
      });
      await onSubmit(cleanedData);

      // If we have selected contacts and we're creating a new company,
      // we'll need to update those contacts with the company ID
      // This would require getting the created company ID back from onSubmit
      // For now, we'll handle this when editing existing companies only
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Company Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <Input
          label="Industry"
          value={formData.industry}
          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
          placeholder="e.g., Technology, Healthcare, Finance"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <Input
          label="Phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      <Input
        label="Website"
        type="url"
        value={formData.website}
        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
        placeholder="https://example.com"
      />

      <Textarea
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        rows={3}
        placeholder="Brief description of the company..."
      />

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
        <Input
          label="Employees"
          type="number"
          min="0"
          value={formData.employees || ''}
          onChange={(e) => setFormData({ ...formData, employees: e.target.value ? parseInt(e.target.value) : undefined })}
          placeholder="Number of employees"
        />
        <Input
          label="Revenue ($)"
          type="number"
          min="0"
          step="0.01"
          value={formData.revenue || ''}
          onChange={(e) => setFormData({ ...formData, revenue: e.target.value ? parseFloat(e.target.value) : undefined })}
          placeholder="Annual revenue"
        />
      </div>

      {/* Contact Management - Only show when editing an existing company */}
      {company && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contacts
          </label>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsContactFormOpen(true)}
            className="w-full"
          >
            Add New Contact
          </Button>
          <p className="text-xs text-gray-500 mt-1">
            Create contacts associated with this company. You can fill in additional details later on the contact page.
          </p>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : company ? 'Update Company' : 'Create Company'}
        </Button>
      </div>

      {/* Contact Creation Modal */}
      <Modal
        isOpen={isContactFormOpen}
        onClose={() => setIsContactFormOpen(false)}
        title="New Contact"
      >
        <ContactForm
          onSubmit={handleCreateContact}
          onCancel={() => setIsContactFormOpen(false)}
        />
      </Modal>
    </form>
  );
}
