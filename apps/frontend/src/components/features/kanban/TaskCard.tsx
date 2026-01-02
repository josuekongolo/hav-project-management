import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../../../services/taskService';
import { PriorityBadge, Avatar, Badge } from '../../ui';
import { Calendar, MessageSquare, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export const TaskCard = memo(function TaskCard({ task, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={clsx(
        'bg-white rounded-lg p-3 shadow-sm border border-gray-200',
        'hover:shadow-md hover:border-primary-300 transition-all cursor-pointer',
        isDragging && 'opacity-50 shadow-lg'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 flex-1">{task.title}</h3>
        <PriorityBadge priority={task.priority} size="sm" />
      </div>

      {task.description && (
        <p className="text-xs text-gray-600 line-clamp-2 mb-3">{task.description}</p>
      )}

      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.labels.slice(0, 3).map((label) => (
            <span
              key={label.id}
              className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full"
              style={{ backgroundColor: `${label.color}20`, color: label.color }}
            >
              {label.name}
            </span>
          ))}
          {task.labels.length > 3 && (
            <Badge size="sm" variant="secondary">
              +{task.labels.length - 3}
            </Badge>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          {task.assignees.length > 0 && (
            <div className="flex -space-x-2">
              {task.assignees.slice(0, 3).map((assignee) => (
                <Avatar
                  key={assignee.id}
                  src={assignee.avatar}
                  name={assignee.name}
                  size="xs"
                  className="ring-2 ring-white"
                />
              ))}
              {task.assignees.length > 3 && (
                <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-medium text-gray-600">
                  +{task.assignees.length - 3}
                </div>
              )}
            </div>
          )}
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(task.dueDate), 'MMM d')}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {task.milestone && (
            <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
              {task.milestone.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});
