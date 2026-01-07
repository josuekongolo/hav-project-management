import { useState, useEffect } from 'react';
import { useTaskStore } from '../../../store/taskStore';
import { useContactStore } from '../../../store/contactStore';
import { useDealStore } from '../../../store/dealStore';
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
  const { contacts, fetchContacts } = useContactStore();
  const { deals, fetchDeals } = useDealStore();

  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || initialStatus || TaskStatus.TODO,
    priority: task?.priority || TaskPriority.MEDIUM,
    assigneeIds: task?.assignees?.map((a) => a.id) || [],
    milestoneId: task?.milestoneId || '',
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
    labels: task?.labels?.map((l) => l.id) || [],
    contactId: (task as any)?.contactId || '',
    dealId: (task as any)?.dealId || '',
  });

  useEffect(() => {
    fetchUsers();
    fetchLabels();
    fetchMilestones();
    fetchContacts();
    fetchDeals();
  }, [fetchUsers, fetchLabels, fetchMilestones, fetchContacts, fetchDeals]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: formData.title,
      description: formData.description || undefined,
      status: formData.status,
      priority: formData.priority,
      assigneeIds: formData.assigneeIds.length > 0 ? formData.assigneeIds : undefined,
      milestoneId: formData.milestoneId || undefined,
      dueDate: formData.dueDate || undefined,
      labels: formData.labels.length > 0 ? formData.labels : undefined,
      contactId: formData.contactId || undefined,
      dealId: formData.dealId || undefined,
    } as any);
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

  const toggleAssignee = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      assigneeIds: prev.assigneeIds.includes(userId)
        ? prev.assigneeIds.filter((id) => id !== userId)
        : [...prev.assigneeIds, userId],
    }));
  };

  const milestoneOptions = [
    { value: '', label: 'No Milestone' },
    ...milestones.map((milestone) => ({ value: milestone.id, label: milestone.name })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
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
        rows={3}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      <Input
        label="Due Date"
        name="dueDate"
        type="date"
        value={formData.dueDate}
        onChange={handleChange}
      />

      <Select
        label="Milestone"
        name="milestoneId"
        value={formData.milestoneId}
        onChange={handleChange}
        options={milestoneOptions}
      />

      <Select
        label="Link to Contact (Optional)"
        name="contactId"
        value={formData.contactId}
        onChange={handleChange}
        options={[
          { value: '', label: 'No Contact' },
          ...contacts.map((contact) => ({
            value: contact.id,
            label: `${contact.firstName} ${contact.lastName}${contact.company ? ` - ${contact.company}` : ''}`,
          })),
        ]}
      />

      <Select
        label="Link to Deal (Optional)"
        name="dealId"
        value={formData.dealId}
        onChange={handleChange}
        options={[
          { value: '', label: 'No Deal' },
          ...deals.map((deal) => ({
            value: deal.id,
            label: `${deal.title} - $${deal.value.toLocaleString()}`,
          })),
        ]}
      />

      {users.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Assignees</label>
          <div className="flex flex-wrap gap-2">
            {users.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => toggleAssignee(user.id)}
                className={`px-3 py-2 sm:py-1.5 rounded-lg text-sm font-medium transition-all border-2 min-h-[40px] sm:min-h-0 ${
                  formData.assigneeIds.includes(user.id)
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300 active:bg-gray-100'
                }`}
              >
                {user.name}
                {formData.assigneeIds.includes(user.id) && (
                  <X className="inline-block ml-1 h-3 w-3" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {labels.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Labels</label>
          <div className="flex flex-wrap gap-2">
            {labels.map((label) => (
              <button
                key={label.id}
                type="button"
                onClick={() => toggleLabel(label.id)}
                className={`px-3 py-2 sm:py-1.5 rounded-full text-sm font-medium transition-all min-h-[40px] sm:min-h-0 ${
                  formData.labels.includes(label.id)
                    ? 'ring-2 ring-offset-2'
                    : 'opacity-60 hover:opacity-100 active:opacity-100'
                }`}
                style={{
                  backgroundColor: `${label.color}20`,
                  color: label.color,
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

      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" className="w-full sm:flex-1" isLoading={isLoading}>
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}
