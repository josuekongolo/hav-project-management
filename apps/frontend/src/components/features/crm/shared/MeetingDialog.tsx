import { useState } from 'react';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Select } from '../../../ui/Select';
import { MeetingStatus, meetingService, CreateMeetingData } from '../../../../services/meetingService';
import { X } from 'lucide-react';

interface MeetingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contactId?: string;
  dealId?: string;
  companyId?: string;
  onSuccess?: () => void;
}

type MeetingFormData = Omit<CreateMeetingData, 'startTime' | 'endTime'> & {
  startTime: string;
  endTime: string;
};

export function MeetingDialog({
  isOpen,
  onClose,
  contactId,
  dealId,
  companyId,
  onSuccess,
}: MeetingDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Set default start time to next hour
  const now = new Date();
  const nextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0);
  const oneHourLater = new Date(nextHour.getTime() + 60 * 60 * 1000);

  const [formData, setFormData] = useState<Partial<MeetingFormData>>({
    title: '',
    description: '',
    location: '',
    startTime: nextHour.toISOString().slice(0, 16),
    endTime: oneHourLater.toISOString().slice(0, 16),
    status: MeetingStatus.SCHEDULED,
    notes: '',
    contactId,
    dealId,
    companyId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.startTime || !formData.endTime) return;

    setIsLoading(true);
    try {
      await meetingService.createMeeting(formData as CreateMeetingData);
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Failed to create meeting:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    const now = new Date();
    const nextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0);
    const oneHourLater = new Date(nextHour.getTime() + 60 * 60 * 1000);

    setFormData({
      title: '',
      description: '',
      location: '',
      startTime: nextHour.toISOString().slice(0, 16),
      endTime: oneHourLater.toISOString().slice(0, 16),
      status: MeetingStatus.SCHEDULED,
      notes: '',
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
          <h2 className="text-xl font-semibold">Schedule Meeting</h2>
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
              Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Meeting title..."
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <Input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time *
              </label>
              <Input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <Input
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Conference Room A, Zoom, Office"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as MeetingStatus })}
            >
              <option value={MeetingStatus.SCHEDULED}>Scheduled</option>
              <option value={MeetingStatus.COMPLETED}>Completed</option>
              <option value={MeetingStatus.CANCELLED}>Cancelled</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full px-3 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[80px]"
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Meeting description..."
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
              placeholder="Meeting notes or agenda..."
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? 'Scheduling...' : 'Schedule Meeting'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
