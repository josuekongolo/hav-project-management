import { useState, useEffect } from 'react';
import { Deal, DealStage, CreateDealData, UpdateDealData } from '../../../../services/dealService';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Select } from '../../../ui/Select';
import { TextArea } from '../../../ui/TextArea';
import { useContactStore } from '../../../../store/contactStore';
import { useTaskStore } from '../../../../store/taskStore';
import { useAuthStore } from '../../../../store/authStore';

interface DealFormProps {
  deal?: Deal | null;
  initialStage?: DealStage;
  onSubmit: (data: CreateDealData | UpdateDealData) => Promise<void>;
  onCancel: () => void;
}

export function DealForm({ deal, initialStage, onSubmit, onCancel }: DealFormProps) {
  const { contacts, fetchContacts } = useContactStore();
  const { users, fetchUsers } = useTaskStore();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<CreateDealData>({
    title: '',
    description: '',
    value: 0,
    stage: initialStage || DealStage.PROSPECT,
    probability: 50,
    expectedCloseDate: '',
    contactId: '',
    ownerId: user?.id || '',
  });

  useEffect(() => {
    fetchContacts();
    fetchUsers();
  }, [fetchContacts, fetchUsers]);

  useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title,
        description: deal.description || '',
        value: deal.value,
        stage: deal.stage,
        probability: deal.probability,
        expectedCloseDate: deal.expectedCloseDate
          ? new Date(deal.expectedCloseDate).toISOString().split('T')[0]
          : '',
        contactId: deal.contactId,
        ownerId: deal.ownerId,
      });
    }
  }, [deal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const cleanedData: any = { ...formData };
      if (cleanedData.description === '') delete cleanedData.description;
      if (cleanedData.expectedCloseDate === '') delete cleanedData.expectedCloseDate;
      await onSubmit(cleanedData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Deal Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
        placeholder="e.g., Website Redesign Project"
      />

      <TextArea
        label="Description (Optional)"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        rows={3}
        placeholder="Brief description of the deal..."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Deal Value"
          type="number"
          value={formData.value}
          onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
          required
          min="0"
          step="0.01"
          placeholder="0.00"
        />

        <Input
          label="Probability (%)"
          type="number"
          value={formData.probability}
          onChange={(e) =>
            setFormData({ ...formData, probability: parseInt(e.target.value) || 0 })
          }
          required
          min="0"
          max="100"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Stage"
          value={formData.stage}
          onChange={(e) => setFormData({ ...formData, stage: e.target.value as DealStage })}
          options={[
            { value: DealStage.PROSPECT, label: 'Prospect' },
            { value: DealStage.QUALIFICATION, label: 'Qualification' },
            { value: DealStage.PROPOSAL, label: 'Proposal' },
            { value: DealStage.NEGOTIATION, label: 'Negotiation' },
            { value: DealStage.CLOSED_WON, label: 'Closed Won' },
            { value: DealStage.CLOSED_LOST, label: 'Closed Lost' },
          ]}
        />

        <Input
          label="Expected Close Date (Optional)"
          type="date"
          value={formData.expectedCloseDate}
          onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
        />
      </div>

      <Select
        label="Contact"
        value={formData.contactId}
        onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
        required
        options={[
          { value: '', label: 'Select a contact' },
          ...contacts.map((c) => ({
            value: c.id,
            label: `${c.firstName} ${c.lastName}${c.company ? ` - ${c.company}` : ''}`,
          })),
        ]}
      />

      <Select
        label="Deal Owner"
        value={formData.ownerId}
        onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
        required
        options={users.map((u) => ({ value: u.id, label: u.name }))}
      />

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : deal ? 'Update Deal' : 'Create Deal'}
        </Button>
      </div>
    </form>
  );
}
