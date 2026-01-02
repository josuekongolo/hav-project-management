import { Modal } from '../../ui/Modal';
import { MilestoneForm } from './MilestoneForm';
import { Milestone, CreateMilestoneDto, UpdateMilestoneDto } from '../../../services/milestoneService';
import { useMilestoneStore } from '../../../store/milestoneStore';
import { toast } from 'react-hot-toast';

interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestone?: Milestone;
}

export function MilestoneModal({ isOpen, onClose, milestone }: MilestoneModalProps) {
  const { createMilestone, updateMilestone, isLoading } = useMilestoneStore();

  const handleSubmit = async (data: CreateMilestoneDto | UpdateMilestoneDto) => {
    try {
      if (milestone) {
        await updateMilestone(milestone.id, data as UpdateMilestoneDto);
        toast.success('Milestone updated successfully');
      } else {
        await createMilestone(data as CreateMilestoneDto);
        toast.success('Milestone created successfully');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save milestone');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={milestone ? 'Edit Milestone' : 'Create New Milestone'}
    >
      <MilestoneForm
        milestone={milestone}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={isLoading}
      />
    </Modal>
  );
}
