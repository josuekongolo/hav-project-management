import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { useTaskStore } from '../../../store/taskStore';
import { Task, TaskStatus } from '../../../services/taskService';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { Spinner, TaskCardSkeleton } from '../../ui';

// Hook to detect mobile screen size
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

interface KanbanBoardProps {
  onTaskClick: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
  milestoneFilter?: string;
  labelFilter?: string;
  assigneeFilter?: string;
  searchQuery?: string;
}

const COLUMNS = [
  { status: TaskStatus.TODO, title: 'To Do', color: 'gray' },
  { status: TaskStatus.IN_PROGRESS, title: 'In Progress', color: 'blue' },
  { status: TaskStatus.IN_REVIEW, title: 'In Review', color: 'yellow' },
  { status: TaskStatus.DONE, title: 'Done', color: 'green' },
];

export function KanbanBoard({ onTaskClick, onAddTask, milestoneFilter, labelFilter, assigneeFilter, searchQuery }: KanbanBoardProps) {
  const { tasks, isLoading, fetchTasks, moveTask } = useTaskStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const isMobile = useIsMobile();

  // Memoize filtered tasks to avoid recalculating on every render
  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Apply milestone filter
    if (milestoneFilter) {
      result = result.filter((task) => task.milestoneId === milestoneFilter);
    }

    // Apply label filter
    if (labelFilter) {
      result = result.filter((task) =>
        task.labels.some((label) => label.id === labelFilter)
      );
    }

    // Apply assignee filter
    if (assigneeFilter) {
      result = result.filter((task) =>
        task.assignees?.some((assignee) => assignee.id === assigneeFilter)
      );
    }

    // Apply search filter
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((task) =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.assignees?.some((assignee) => assignee.name.toLowerCase().includes(query))
      );
    }

    return result;
  }, [tasks, milestoneFilter, labelFilter, assigneeFilter, searchQuery]);

  // Only enable drag and drop on non-mobile devices
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = filteredTasks.find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  }, [filteredTasks]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const task = filteredTasks.find((t) => t.id === taskId);
    if (!task) return;

    // Determine the new status - if dropped on a task, get that task's status
    // If dropped on a column, over.id will be the status directly
    let newStatus: TaskStatus;
    const overTask = filteredTasks.find((t) => t.id === over.id);
    if (overTask) {
      newStatus = overTask.status;
    } else {
      newStatus = over.id as TaskStatus;
    }

    // If dropped in the same column, check if position changed
    if (task.status === newStatus) {
      // For now, we'll just keep it in place
      // You could implement reordering within the same column here
      return;
    }

    // Calculate new position (add to end of column)
    const tasksInNewColumn = filteredTasks.filter((t) => t.status === newStatus);
    const newPosition = tasksInNewColumn.length;

    await moveTask(taskId, newStatus, newPosition);
  }, [filteredTasks, moveTask]);

  const getTasksByStatus = useCallback((status: TaskStatus) => {
    return filteredTasks
      .filter((task) => task.status === status)
      .sort((a, b) => a.position - b.position);
  }, [filteredTasks]);

  if (isLoading && filteredTasks.length === 0) {
    return (
      <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 h-full overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
        {COLUMNS.map((column) => (
          <div key={column.status} className="bg-gray-50 rounded-lg p-4 flex flex-col min-h-0 w-[80vw] max-w-[80vw] md:w-auto md:max-w-none flex-shrink-0 overflow-hidden">
            <div className="mb-3 pb-3 border-b-2 border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-300" />
                <div className="h-5 w-24 bg-gray-300 rounded animate-pulse" />
              </div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <TaskCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const boardContent = (
    <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 h-full overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
      {COLUMNS.map((column) => (
        <div key={column.status} className="bg-gray-50 rounded-lg p-3 md:p-4 flex flex-col min-h-0 w-[80vw] max-w-[80vw] md:w-auto md:max-w-none flex-shrink-0 overflow-hidden">
          <KanbanColumn
            status={column.status}
            title={column.title}
            tasks={getTasksByStatus(column.status)}
            color={column.color}
            onTaskClick={onTaskClick}
            onAddTask={() => onAddTask(column.status)}
          />
        </div>
      ))}
    </div>
  );

  // On mobile, render without drag and drop
  if (isMobile) {
    return boardContent;
  }

  // On desktop, wrap with DndContext for drag and drop
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {boardContent}

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3">
            <TaskCard task={activeTask} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
