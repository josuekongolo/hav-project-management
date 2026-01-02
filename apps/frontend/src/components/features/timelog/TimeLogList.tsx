import { useState, useEffect } from 'react';
import { Clock, Trash2, Plus } from 'lucide-react';
import { TimeLog, timeLogService } from '../../../services/timeLogService';
import { Avatar, Button, Spinner } from '../../ui';
import { TimeLogForm } from './TimeLogForm';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

interface TimeLogListProps {
  taskId: string;
}

export function TimeLogList({ taskId }: TimeLogListProps) {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadTimeLogs();
  }, [taskId]);

  const loadTimeLogs = async () => {
    try {
      setIsLoading(true);
      const data = await timeLogService.getByTask(taskId);
      setTimeLogs(data.timeLogs);
      setTotalHours(data.totalHours);
    } catch (error) {
      console.error('Failed to load time logs:', error);
      toast.error('Failed to load time logs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTimeLog = async (hours: number, description?: string) => {
    try {
      const newLog = await timeLogService.create({ hours, description, taskId });
      setTimeLogs([newLog, ...timeLogs]);
      setTotalHours(totalHours + hours);
      setShowForm(false);
      toast.success('Time logged successfully');
    } catch (error) {
      toast.error('Failed to log time');
      throw error;
    }
  };

  const handleDeleteTimeLog = async (id: string, hours: number) => {
    if (!confirm('Are you sure you want to delete this time log?')) return;

    try {
      await timeLogService.delete(id);
      setTimeLogs(timeLogs.filter((log) => log.id !== id));
      setTotalHours(totalHours - hours);
      toast.success('Time log deleted');
    } catch (error) {
      toast.error('Failed to delete time log');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">
            Time Tracking
          </h3>
          <span className="text-sm text-gray-600">
            ({totalHours}h total)
          </span>
        </div>
        {!showForm && (
          <Button size="sm" variant="secondary" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Log Time
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <TimeLogForm
            onSubmit={handleAddTimeLog}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="space-y-3">
        {timeLogs.map((log) => (
          <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Avatar
              src={log.user.avatar}
              name={log.user.name}
              size="sm"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-gray-900">
                    {log.user.name}
                  </span>
                  <span className="text-sm font-semibold text-primary-600">
                    {log.hours}h
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(log.loggedAt), {
                      addSuffix: true,
                    })}
                  </span>
                  <button
                    onClick={() => handleDeleteTimeLog(log.id, log.hours)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
              {log.description && (
                <p className="text-sm text-gray-600">{log.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {timeLogs.length === 0 && !showForm && (
        <p className="text-center text-gray-500 text-sm py-4">
          No time logged yet. Click "Log Time" to get started!
        </p>
      )}
    </div>
  );
}
