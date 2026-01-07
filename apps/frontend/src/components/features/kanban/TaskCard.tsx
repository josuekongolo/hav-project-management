import { memo, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskStatus } from '../../../services/taskService';
import { PriorityBadge, Avatar, Badge } from '../../ui';
import { Calendar, Trash2, MoveRight } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import { useTaskStore } from '../../../store/taskStore';
import { toast } from 'react-hot-toast';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export const TaskCard = memo(function TaskCard({ task, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });
  const { deleteTask, moveTask } = useTaskStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm(`Are you sure you want to delete "${task.title}"?`)) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteTask(task.id);
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMove = async (e: React.MouseEvent, newStatus: TaskStatus) => {
    e.stopPropagation();
    setShowMoveMenu(false);

    if (task.status === newStatus) return;

    try {
      await moveTask(task.id, newStatus, 0);
      toast.success('Task moved successfully');
    } catch (error) {
      toast.error('Failed to move task');
    }
  };

  const statusOptions = [
    { status: TaskStatus.TODO, label: 'To Do', color: 'bg-gray-100 text-gray-700' },
    { status: TaskStatus.IN_PROGRESS, label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
    { status: TaskStatus.IN_REVIEW, label: 'In Review', color: 'bg-yellow-100 text-yellow-700' },
    { status: TaskStatus.DONE, label: 'Done', color: 'bg-green-100 text-green-700' },
  ];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={clsx(
        'bg-white rounded-lg p-2.5 sm:p-3 shadow-sm border border-gray-200 w-full max-w-full overflow-hidden',
        'hover:shadow-md hover:border-primary-300 transition-all cursor-pointer',
        isDragging && 'opacity-50 shadow-lg'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2 min-w-0">
        <h3 className="font-medium text-gray-900 text-sm line-clamp-1 sm:line-clamp-2 flex-1 min-w-0 break-words">{task.title}</h3>
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Mobile move button */}
          <div className="relative md:hidden">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMoveMenu(!showMoveMenu);
              }}
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Move task"
            >
              <MoveRight className="h-3.5 w-3.5" />
            </button>
            {showMoveMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMoveMenu(false);
                  }}
                />
                <div className="absolute right-0 top-8 z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px]">
                  {statusOptions.map((option) => (
                    <button
                      key={option.status}
                      onClick={(e) => handleMove(e, option.status)}
                      disabled={task.status === option.status}
                      className={clsx(
                        'w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2',
                        task.status === option.status && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <span className={clsx('w-2 h-2 rounded-full', option.color)} />
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
            title="Delete task"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <PriorityBadge priority={task.priority} size="sm" />
        </div>
      </div>

      {task.description && (
        <p
          className="text-xs text-gray-600 line-clamp-1 sm:line-clamp-2 mb-2 sm:mb-3 w-full overflow-hidden"
          style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
        >
          {task.description}
        </p>
      )}

      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
          {task.labels.slice(0, 2).map((label) => (
            <span
              key={label.id}
              className="inline-flex items-center px-1.5 sm:px-2 py-0.5 text-xs font-medium rounded-full truncate max-w-[80px] sm:max-w-none"
              style={{ backgroundColor: `${label.color}20`, color: label.color }}
              title={label.name}
            >
              {label.name}
            </span>
          ))}
          {task.labels.length > 2 && (
            <Badge size="sm" variant="secondary">
              +{task.labels.length - 2}
            </Badge>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          {task.assignees.length > 0 && (
            <div className="flex -space-x-1.5 sm:-space-x-2 flex-shrink-0">
              {task.assignees.slice(0, 2).map((assignee) => (
                <Avatar
                  key={assignee.id}
                  src={assignee.avatar}
                  name={assignee.name}
                  size="xs"
                  className="ring-2 ring-white"
                />
              ))}
              {task.assignees.length > 2 && (
                <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[9px] sm:text-[10px] font-medium text-gray-600">
                  +{task.assignees.length - 2}
                </div>
              )}
            </div>
          )}
          {task.dueDate && (
            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
              <Calendar className="h-3 w-3" />
              <span className="text-[11px] sm:text-xs">{format(new Date(task.dueDate), 'MMM d')}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {task.milestone && (
            <span className="text-[10px] sm:text-xs bg-purple-100 text-purple-700 px-1 sm:px-1.5 py-0.5 rounded truncate max-w-[60px] sm:max-w-[100px]" title={task.milestone.name}>
              {task.milestone.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});
