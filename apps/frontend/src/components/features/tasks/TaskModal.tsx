import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTaskStore } from '../../../store/taskStore';
import { Task, TaskStatus, CreateTaskDto, UpdateTaskDto } from '../../../services/taskService';
import { Modal } from '../../ui';
import { TaskForm } from './TaskForm';
import { CommentsList } from '../comments/CommentsList';
import { TimeLogList } from '../timelog/TimeLogList';
import clsx from 'clsx';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  initialStatus?: TaskStatus;
}

type TabType = 'details' | 'comments' | 'time';

export function TaskModal({ isOpen, onClose, task, initialStatus }: TaskModalProps) {
  const { createTask, updateTask } = useTaskStore();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('details');

  const handleSubmit = async (data: CreateTaskDto | UpdateTaskDto) => {
    setIsLoading(true);
    try {
      if (task) {
        await updateTask(task.id, data as UpdateTaskDto);
        toast.success('Task updated successfully');
      } else {
        await createTask(data as CreateTaskDto);
        toast.success('Task created successfully');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || `Failed to ${task ? 'update' : 'create'} task`);
      console.error('Failed to save task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Create New Task'}
      size="xl"
    >
      {task && (
        <div className="flex border-b mb-4">
          <button
            onClick={() => setActiveTab('details')}
            className={clsx(
              'px-4 py-2 font-medium transition-colors',
              activeTab === 'details'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={clsx(
              'px-4 py-2 font-medium transition-colors',
              activeTab === 'comments'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            Comments
          </button>
          <button
            onClick={() => setActiveTab('time')}
            className={clsx(
              'px-4 py-2 font-medium transition-colors',
              activeTab === 'time'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            Time Tracking
          </button>
        </div>
      )}

      {activeTab === 'details' ? (
        <TaskForm
          task={task}
          initialStatus={initialStatus}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      ) : activeTab === 'comments' ? (
        task && <CommentsList taskId={task.id} />
      ) : (
        task && <TimeLogList taskId={task.id} />
      )}
    </Modal>
  );
}
