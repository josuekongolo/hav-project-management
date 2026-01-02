import { useState, useEffect } from 'react';
import { useTaskStore } from '../../../store/taskStore';
import { Task, TaskStatus, TaskPriority, CreateTaskDto } from '../../../services/taskService';
import { Input, Textarea, Select, Button } from '../../ui';
import { X } from 'lucide-react';

interface TaskFormProps {
  task?: Task | null;
  initialStatus?: TaskStatus;
  onSubmit: (data: CreateTaskDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const statusOptions = [
  { value: TaskStatus.TODO, label: 'To Do' },
  { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
  { value: TaskStatus.IN_REVIEW, label: 'In Review' },
  { value: TaskStatus.DONE, label: 'Done' },
];

const priorityOptions = [
  { value: TaskPriority.LOW, label: 'Low' },
  { value: TaskPriority.MEDIUM, label: 'Medium' },
  { value: TaskPriority.HIGH, label: 'High' },
  { value: TaskPriority.URGENT, label: 'Urgent' },
];

export function TaskForm({ task, initialStatus, onSubmit, onCancel, isLoading }: TaskFormProps) {
  const { users, labels, milestones, fetchUsers, fetchLabels, fetchMilestones } = useTaskStore();

  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || initialStatus || TaskStatus.TODO,
    priority: task?.priority || TaskPriority.MEDIUM,
    assigneeId: task?.assigneeId || '',
    milestoneId: task?.milestoneId || '',
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
    labels: task?.labels?.map((l) => l.id) || [],
  });

  useEffect(() => {
    fetchUsers();
    fetchLabels();
    fetchMilestones();
  }, [fetchUsers, fetchLabels, fetchMilestones]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: formData.title,
      description: formData.description || undefined,
      status: formData.status,
      priority: formData.priority,
      assigneeId: formData.assigneeId || undefined,
      milestoneId: formData.milestoneId || undefined,
      dueDate: formData.dueDate || undefined,
      labels: formData.labels.length > 0 ? formData.labels : undefined,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleLabel = (labelId: string) => {
    setFormData((prev) => ({
      ...prev,
      labels: prev.labels.includes(labelId)
        ? prev.labels.filter((id) => id !== labelId)
        : [...prev.labels, labelId],
    }));
  };

  const userOptions = [
    { value: '', label: 'Unassigned' },
    ...users.map((user) => ({ value: user.id, label: user.name })),
  ];

  const milestoneOptions = [
    { value: '', label: 'No Milestone' },
    ...milestones.map((milestone) => ({ value: milestone.id, label: milestone.name })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Enter task title"
        required
        autoFocus
      />

      <Textarea
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Add a description..."
        rows={4}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={statusOptions}
        />

        <Select
          label="Priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          options={priorityOptions}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Assignee"
          name="assigneeId"
          value={formData.assigneeId}
          onChange={handleChange}
          options={userOptions}
        />

        <Input
          label="Due Date"
          name="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={handleChange}
        />
      </div>

      <Select
        label="Milestone"
        name="milestoneId"
        value={formData.milestoneId}
        onChange={handleChange}
        options={milestoneOptions}
      />

      {labels.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Labels</label>
          <div className="flex flex-wrap gap-2">
            {labels.map((label) => (
              <button
                key={label.id}
                type="button"
                onClick={() => toggleLabel(label.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  formData.labels.includes(label.id)
                    ? 'ring-2 ring-offset-2'
                    : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: `${label.color}20`,
                  color: label.color,
                  ringColor: label.color,
                }}
              >
                {label.name}
                {formData.labels.includes(label.id) && (
                  <X className="inline-block ml-1 h-3 w-3" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t">
        <Button type="submit" className="flex-1" isLoading={isLoading}>
          {task ? 'Update Task' : 'Create Task'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
