import { useState, useEffect } from 'react';
import { KanbanBoard } from '../components/features/kanban/KanbanBoard';
import { TaskModal } from '../components/features/tasks/TaskModal';
import { Task, TaskStatus } from '../services/taskService';
import { Button, Select, Input } from '../components/ui';
import { Plus, Filter, X, Search } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';

export function KanbanPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [initialStatus, setInitialStatus] = useState<TaskStatus | undefined>(undefined);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>('');
  const [selectedLabelId, setSelectedLabelId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { milestones, labels, fetchMilestones, fetchLabels } = useTaskStore();

  useEffect(() => {
    fetchMilestones();
    fetchLabels();
  }, [fetchMilestones, fetchLabels]);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleAddTask = (status?: TaskStatus) => {
    setSelectedTask(null);
    setInitialStatus(status);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
    setInitialStatus(undefined);
  };

  return (
    <div className="p-4 md:p-6 h-[calc(100vh-64px)] flex flex-col">
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Kanban Board</h1>
            <p className="text-gray-600 mt-1">Drag and drop tasks to update their status</p>
          </div>
          <Button
            onClick={() => handleAddTask()}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex-1 sm:flex-initial sm:min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex-1 sm:flex-initial sm:min-w-[180px]">
            <Select
              value={selectedMilestoneId}
              onChange={(e) => setSelectedMilestoneId(e.target.value)}
              options={[
                { value: '', label: 'All Milestones' },
                ...milestones.map((m) => ({ value: m.id, label: m.name })),
              ]}
            />
          </div>
          <div className="flex-1 sm:flex-initial sm:min-w-[180px]">
            <Select
              value={selectedLabelId}
              onChange={(e) => setSelectedLabelId(e.target.value)}
              options={[
                { value: '', label: 'All Labels' },
                ...labels.map((l) => ({ value: l.id, label: l.name })),
              ]}
            />
          </div>
          {(selectedMilestoneId || selectedLabelId || searchQuery) && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSelectedMilestoneId('');
                setSelectedLabelId('');
                setSearchQuery('');
              }}
              title="Clear all filters"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          onTaskClick={handleTaskClick}
          onAddTask={handleAddTask}
          milestoneFilter={selectedMilestoneId}
          labelFilter={selectedLabelId}
          searchQuery={searchQuery}
        />
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        task={selectedTask}
        initialStatus={initialStatus}
      />
    </div>
  );
}
