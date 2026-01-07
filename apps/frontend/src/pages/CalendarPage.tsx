import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Calendar, dateFnsLocalizer, Event, View, NavigateAction } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useTaskStore } from '../store/taskStore';
import { Task } from '../services/taskService';
import { TaskModal } from '../components/features/tasks/TaskModal';
import { Button } from '../components/ui';
import { toast } from 'react-hot-toast';
import { Plus, ChevronLeft, ChevronRight, CalendarDays, List, LayoutGrid } from 'lucide-react';
import clsx from 'clsx';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/calendar.css';

// Hook to detect mobile screen
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

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
  const [currentDate, setCurrentDate] = useState(new Date());
  const isMobile = useIsMobile();
  const [currentView, setCurrentView] = useState<View>(isMobile ? 'agenda' : 'month');

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Update view when screen size changes
  useEffect(() => {
    if (isMobile && currentView === 'week') {
      setCurrentView('agenda');
    }
  }, [isMobile, currentView]);

  // Navigation handlers
  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentDate((prev) => {
      switch (currentView) {
        case 'month':
          return subMonths(prev, 1);
        case 'week':
          return subWeeks(prev, 1);
        case 'day':
          return subDays(prev, 1);
        case 'agenda':
          return subMonths(prev, 1);
        default:
          return prev;
      }
    });
  }, [currentView]);

  const goToNext = useCallback(() => {
    setCurrentDate((prev) => {
      switch (currentView) {
        case 'month':
          return addMonths(prev, 1);
        case 'week':
          return addWeeks(prev, 1);
        case 'day':
          return addDays(prev, 1);
        case 'agenda':
          return addMonths(prev, 1);
        default:
          return prev;
      }
    });
  }, [currentView]);

  // Format the current date display
  const dateDisplay = useMemo(() => {
    switch (currentView) {
      case 'month':
      case 'agenda':
        return format(currentDate, 'MMMM yyyy');
      case 'week':
        return format(currentDate, 'MMM d, yyyy');
      case 'day':
        return format(currentDate, 'EEEE, MMM d, yyyy');
      default:
        return format(currentDate, 'MMMM yyyy');
    }
  }, [currentDate, currentView]);

  const handleAddTask = useCallback(() => {
    setSelectedTask({
      dueDate: currentDate.toISOString(),
    } as Task);
    setIsModalOpen(true);
  }, [currentDate]);

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

  // Available views based on screen size
  const availableViews: View[] = isMobile
    ? ['month', 'day', 'agenda']
    : ['month', 'week', 'day', 'agenda'];

  const viewButtons = [
    { view: 'month' as View, label: 'Month', icon: LayoutGrid },
    ...(isMobile ? [] : [{ view: 'week' as View, label: 'Week', icon: CalendarDays }]),
    { view: 'day' as View, label: 'Day', icon: CalendarDays },
    { view: 'agenda' as View, label: 'Agenda', icon: List },
  ];

  return (
    <div className="p-4 md:p-6 h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Calendar</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1 hidden sm:block">View and schedule tasks by due date</p>
          </div>
          <Button onClick={handleAddTask} className="w-full sm:w-auto justify-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Mobile Custom Toolbar */}
      <div className="mb-3 md:hidden">
        {/* Navigation Row */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={goToPrev}
            className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>

          <div className="flex-1 text-center">
            <h2 className="text-lg font-semibold text-gray-900">{dateDisplay}</h2>
            <button
              onClick={goToToday}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium mt-0.5"
            >
              Today
            </button>
          </div>

          <button
            onClick={goToNext}
            className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>
        </div>

        {/* View Switcher */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {viewButtons.map(({ view, label, icon: Icon }) => (
            <button
              key={view}
              onClick={() => setCurrentView(view)}
              className={clsx(
                'flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-md text-sm font-medium transition-all',
                currentView === view
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Container */}
      <div className={clsx(
        'flex-1 bg-white rounded-lg shadow min-h-0 overflow-hidden',
        isMobile ? 'p-2' : 'p-4'
      )}>
        <Calendar
          localizer={localizer}
          events={events}
          date={currentDate}
          onNavigate={handleNavigate}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          eventPropGetter={eventStyleGetter}
          selectable
          views={availableViews}
          view={currentView}
          onView={(view) => setCurrentView(view)}
          defaultView={isMobile ? 'agenda' : 'month'}
          popup
          tooltipAccessor={(event) => event.task.title}
          toolbar={!isMobile}
        />
      </div>

      {/* Floating Add Button for Mobile */}
      <button
        onClick={handleAddTask}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-40"
        aria-label="Add task"
      >
        <Plus className="h-6 w-6" />
      </button>

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
