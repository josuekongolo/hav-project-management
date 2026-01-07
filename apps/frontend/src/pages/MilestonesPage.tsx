import { useEffect, useState } from 'react';
import { Plus, Target } from 'lucide-react';
import { useMilestoneStore } from '../store/milestoneStore';
import { MilestoneCard } from '../components/features/milestones/MilestoneCard';
import { MilestoneModal } from '../components/features/milestones/MilestoneModal';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Skeleton';
import { Milestone } from '../services/milestoneService';
import { toast } from 'react-hot-toast';

export function MilestonesPage() {
  const { milestones, isLoading, fetchMilestones, deleteMilestone } = useMilestoneStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | undefined>(undefined);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const handleCreateClick = () => {
    setEditingMilestone(undefined);
    setIsModalOpen(true);
  };

  const handleEditClick = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm('Are you sure you want to delete this milestone? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteMilestone(id);
      toast.success('Milestone deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete milestone');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingMilestone(undefined);
  };

  if (isLoading && milestones.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Milestones</h1>
          <p className="text-gray-600 mt-1">Track your project milestones and sprints</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Milestones</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Track your project milestones and sprints</p>
        </div>
        <Button onClick={handleCreateClick} className="w-full sm:w-auto justify-center">
          <Plus className="w-4 h-4 mr-2" />
          New Milestone
        </Button>
      </div>

      {milestones.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No milestones yet"
          description="Create your first milestone to start organizing your work into sprints and deliverables."
          action={{
            label: 'Create Milestone',
            onClick: handleCreateClick,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {milestones.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      <MilestoneModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        milestone={editingMilestone}
      />
    </div>
  );
}
