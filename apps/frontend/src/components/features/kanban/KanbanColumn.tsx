import { memo, useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '../../../services/taskService';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';
import clsx from 'clsx';

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  color: string;
  onTaskClick: (task: Task) => void;
  onAddTask: () => void;
}

export const KanbanColumn = memo(function KanbanColumn({ status, title, tasks, color, onTaskClick, onAddTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const taskIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className={clsx('flex items-center justify-between mb-3 pb-3 border-b-2', `border-${color}-500`)}>
        <div className="flex items-center gap-2 min-w-0">
          <div className={clsx('w-3 h-3 rounded-full flex-shrink-0', `bg-${color}-500`)} />
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{title}</h3>
          <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onAddTask}
          className="p-1.5 sm:p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
          title="Add task"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={clsx(
          'flex-1 space-y-3 min-h-[200px] max-h-[calc(100vh-380px)] sm:max-h-[calc(100vh-320px)] md:max-h-[calc(100vh-280px)] p-2 rounded-lg transition-colors overflow-y-auto overflow-x-hidden',
          isOver && 'bg-primary-50 ring-2 ring-primary-300'
        )}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task, index) => (
            <div key={task.id} className="animate-slide-up w-full min-w-0 overflow-hidden" style={{ animationDelay: `${index * 30}ms` }}>
              <TaskCard task={task} onClick={() => onTaskClick(task)} />
            </div>
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No tasks</p>
          </div>
        )}
      </div>
    </div>
  );
});
