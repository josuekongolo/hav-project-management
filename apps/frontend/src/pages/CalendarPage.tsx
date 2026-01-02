import { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useTaskStore } from '../store/taskStore';
import { Task } from '../services/taskService';
import { TaskModal } from '../components/features/tasks/TaskModal';
import { toast } from 'react-hot-toast';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent extends Event {
  task: Task;
}

export function CalendarPage() {
  const { tasks, fetchTasks, updateTask } = useTaskStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const events: CalendarEvent[] = useMemo(() => {
    return tasks
      .filter((task) => task.dueDate)
      .map((task) => ({
        title: task.title,
        start: new Date(task.dueDate!),
        end: new Date(task.dueDate!),
        task,
        resource: task,
      }));
  }, [tasks]);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedTask(event.task);
    setIsModalOpen(true);
  }, []);

  const handleSelectSlot = useCallback(
    ({ start }: { start: Date; end: Date }) => {
      // Create new task with this due date
      setSelectedTask({
        dueDate: start.toISOString(),
      } as Task);
      setIsModalOpen(true);
    },
    []
  );

  const handleEventDrop = async ({ event, start }: { event: CalendarEvent; start: Date }) => {
    try {
      await updateTask(event.task.id, {
        dueDate: start.toISOString(),
      });
      toast.success('Task rescheduled');
    } catch (error) {
      toast.error('Failed to reschedule task');
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const task = event.task;
    let backgroundColor = '#3b82f6'; // default blue

    // Color by priority
    switch (task.priority) {
      case 'URGENT':
        backgroundColor = '#dc2626';
        break;
      case 'HIGH':
        backgroundColor = '#ef4444';
        break;
      case 'MEDIUM':
        backgroundColor = '#f59e0b';
        break;
      case 'LOW':
        backgroundColor = '#10b981';
        break;
    }

    // Darken if completed
    if (task.status === 'DONE') {
      backgroundColor = '#6b7280';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0',
        display: 'block',
        fontSize: '0.875rem',
      },
    };
  };

  return (
    <div className="p-6 h-[calc(100vh-64px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-600 mt-1">View and schedule tasks by due date</p>
      </div>

      <div className="flex-1 bg-white rounded-lg shadow p-4 min-h-0">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          eventPropGetter={eventStyleGetter}
          selectable
          views={['month', 'week', 'day', 'agenda']}
          defaultView="month"
          popup
        />
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
      />
    </div>
  );
}
