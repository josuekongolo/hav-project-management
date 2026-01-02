import { Modal } from '../../ui/Modal';
import { LabelForm } from './LabelForm';
import { Label } from '../../../services/taskService';
import { useTaskStore } from '../../../store/taskStore';
import { toast } from 'react-hot-toast';
import { labelService } from '../../../services/taskService';

interface LabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  label?: Label;
}

export function LabelModal({ isOpen, onClose, label }: LabelModalProps) {
  const { fetchLabels } = useTaskStore();

  const handleSubmit = async (data: { name: string; color: string }) => {
    try {
      if (label) {
        await labelService.update(label.id, data);
        toast.success('Label updated successfully');
      } else {
        await labelService.create(data);
        toast.success('Label created successfully');
      }
      await fetchLabels();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save label');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={label ? 'Edit Label' : 'Create New Label'}
    >
      <LabelForm
        label={label}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
}
