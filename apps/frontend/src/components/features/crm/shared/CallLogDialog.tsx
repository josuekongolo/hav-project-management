import { useState } from 'react';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Select } from '../../../ui/Select';
import { CallDirection, callLogService, CreateCallLogData } from '../../../../services/callLogService';
import { X } from 'lucide-react';

interface CallLogDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contactId?: string;
  dealId?: string;
  companyId?: string;
  onSuccess?: () => void;
}

type CallLogFormData = Omit<CreateCallLogData, 'completedAt' | 'scheduledAt'> & {
  completedAt?: string;
  scheduledAt?: string;
};

export function CallLogDialog({
  isOpen,
  onClose,
  contactId,
  dealId,
  companyId,
  onSuccess,
}: CallLogDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CallLogFormData>>({
    subject: '',
    notes: '',
    duration: undefined,
    direction: CallDirection.OUTBOUND,
    outcome: '',
    completedAt: new Date().toISOString().slice(0, 16),
    contactId,
    dealId,
    companyId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.direction) return;

    setIsLoading(true);
    try {
      await callLogService.createCallLog(formData as CreateCallLogData);
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Failed to log call:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      subject: '',
      notes: '',
      duration: undefined,
      direction: CallDirection.OUTBOUND,
      outcome: '',
      completedAt: new Date().toISOString().slice(0, 16),
      contactId,
      dealId,
      companyId,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Log Call</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject *
            </label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Call subject..."
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Direction *
              </label>
              <Select
                value={formData.direction}
                onChange={(e) => setFormData({ ...formData, direction: e.target.value as CallDirection })}
                required
              >
                <option value={CallDirection.OUTBOUND}>Outbound</option>
                <option value={CallDirection.INBOUND}>Inbound</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <Input
                type="number"
                min="0"
                value={formData.duration || ''}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="e.g., 15"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Completed At
            </label>
            <Input
              type="datetime-local"
              value={formData.completedAt}
              onChange={(e) => setFormData({ ...formData, completedAt: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Outcome
            </label>
            <Input
              value={formData.outcome || ''}
              onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
              placeholder="e.g., Scheduled follow-up meeting"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              className="w-full px-3 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[100px]"
              rows={4}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Call notes..."
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? 'Logging...' : 'Log Call'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
