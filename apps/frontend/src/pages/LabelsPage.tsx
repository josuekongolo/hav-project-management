import { useEffect, useState } from 'react';
import { Plus, Tag } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { LabelCard } from '../components/features/labels/LabelCard';
import { LabelModal } from '../components/features/labels/LabelModal';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Skeleton';
import { Label, labelService } from '../services/taskService';
import { toast } from 'react-hot-toast';

export function LabelsPage() {
  const { labels, fetchLabels } = useTaskStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | undefined>(undefined);

  useEffect(() => {
    loadLabels();
  }, []);

  const loadLabels = async () => {
    try {
      setIsLoading(true);
      await fetchLabels();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClick = () => {
    setEditingLabel(undefined);
    setIsModalOpen(true);
  };

  const handleEditClick = (label: Label) => {
    setEditingLabel(label);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm('Are you sure you want to delete this label? This will remove it from all tasks.')) {
      return;
    }

    try {
      await labelService.delete(id);
      toast.success('Label deleted successfully');
      await fetchLabels();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete label');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingLabel(undefined);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Labels</h1>
          <p className="text-gray-600 mt-1">Organize and categorize your tasks with custom labels</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Labels</h1>
          <p className="text-gray-600 mt-1">Organize and categorize your tasks with custom labels</p>
        </div>
        <Button onClick={handleCreateClick}>
          <Plus className="w-4 h-4 mr-2" />
          New Label
        </Button>
      </div>

      {labels.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No labels yet"
          description="Create labels to categorize and organize your tasks more effectively."
          action={{
            label: 'Create Label',
            onClick: handleCreateClick,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {labels.map((label) => (
            <LabelCard
              key={label.id}
              label={label}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      <LabelModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        label={editingLabel}
      />
    </div>
  );
}
