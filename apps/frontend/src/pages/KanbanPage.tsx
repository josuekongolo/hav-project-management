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
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { milestones, labels, users, fetchMilestones, fetchLabels, fetchUsers } = useTaskStore();

  useEffect(() => {
    fetchMilestones();
    fetchLabels();
    fetchUsers();
  }, [fetchMilestones, fetchLabels, fetchUsers]);

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
            <p className="text-sm sm:text-base text-gray-600 mt-1">Drag and drop tasks to update their status</p>
          </div>
          <Button
            onClick={() => handleAddTask()}
            size="sm"
            className="w-full sm:w-auto justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[44px] sm:min-h-0"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
          <Select
            value={selectedMilestoneId}
            onChange={(e) => setSelectedMilestoneId(e.target.value)}
            options={[
              { value: '', label: 'All Milestones' },
              ...milestones.map((m) => ({ value: m.id, label: m.name })),
            ]}
            className="w-full sm:w-auto sm:min-w-[160px]"
          />
          <Select
            value={selectedLabelId}
            onChange={(e) => setSelectedLabelId(e.target.value)}
            options={[
              { value: '', label: 'All Labels' },
              ...labels.map((l) => ({ value: l.id, label: l.name })),
            ]}
            className="w-full sm:w-auto sm:min-w-[140px]"
          />
          <Select
            value={selectedAssigneeId}
            onChange={(e) => setSelectedAssigneeId(e.target.value)}
            options={[
              { value: '', label: 'All Assignees' },
              ...users.map((u) => ({ value: u.id, label: u.name })),
            ]}
            className="w-full sm:w-auto sm:min-w-[150px]"
          />
          {(selectedMilestoneId || selectedLabelId || selectedAssigneeId || searchQuery) && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSelectedMilestoneId('');
                setSelectedLabelId('');
                setSelectedAssigneeId('');
                setSearchQuery('');
              }}
              title="Clear all filters"
              className="col-span-2 sm:col-span-1 w-full sm:w-auto justify-center"
            >
              <X className="h-4 w-4 mr-2 sm:mr-0" />
              <span className="sm:hidden">Clear Filters</span>
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
          assigneeFilter={selectedAssigneeId}
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
