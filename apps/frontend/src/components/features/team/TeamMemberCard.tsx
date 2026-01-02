import { CheckCircle2, Circle, Clock, FileText } from 'lucide-react';
import { TeamMemberWorkload } from '../../../services/dashboardService';
import { Avatar } from '../../ui/Avatar';
import { Badge } from '../../ui/Badge';

interface TeamMemberCardProps {
  member: TeamMemberWorkload;
}

const priorityVariants: Record<string, 'danger' | 'warning' | 'info' | 'secondary'> = {
  URGENT: 'danger',
  HIGH: 'warning',
  MEDIUM: 'info',
  LOW: 'secondary',
};

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  const getWorkloadLevel = (score: number): { label: string; color: string } => {
    if (score >= 15) return { label: 'High', color: 'bg-red-500' };
    if (score >= 8) return { label: 'Medium', color: 'bg-yellow-500' };
    if (score >= 3) return { label: 'Light', color: 'bg-green-500' };
    return { label: 'Free', color: 'bg-gray-400' };
  };

  const workload = getWorkloadLevel(member.workloadScore);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4 mb-4">
        <Avatar src={member.avatar || undefined} alt={member.name} size="lg" />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{member.name}</h3>
          <p className="text-sm text-gray-600 truncate">{member.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-500">Workload:</span>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${workload.color}`} />
              <span className="text-xs font-medium text-gray-700">{workload.label}</span>
            </div>
          </div>
        </div>
      </div>

      {member.currentTask && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-blue-900 mb-1">Currently working on:</p>
              <p className="text-sm text-blue-800 truncate">{member.currentTask.title}</p>
              <Badge variant={priorityVariants[member.currentTask.priority]} className="mt-1">
                {member.currentTask.priority}
              </Badge>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 font-medium">Task Breakdown</span>
          <span className="text-gray-900 font-semibold">{member.totalTasks} total</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600">To Do</p>
              <p className="text-sm font-semibold text-gray-900">{member.todoTasks}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
            <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-blue-700">In Progress</p>
              <p className="text-sm font-semibold text-blue-900">{member.inProgressTasks}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
            <FileText className="w-4 h-4 text-purple-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-purple-700">In Review</p>
              <p className="text-sm font-semibold text-purple-900">{member.inReviewTasks}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-green-700">Completed</p>
              <p className="text-sm font-semibold text-green-900">{member.completedTasks}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
