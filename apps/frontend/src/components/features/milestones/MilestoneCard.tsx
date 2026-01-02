import { Calendar, CheckCircle2, Circle, Edit, MoreVertical, Trash2 } from 'lucide-react';
import { Milestone, MilestoneStatus } from '../../../services/milestoneService';
import { Badge } from '../../ui/Badge';
import { format } from 'date-fns';
import { useState } from 'react';

interface MilestoneCardProps {
  milestone: Milestone;
  onEdit: (milestone: Milestone) => void;
  onDelete: (id: string) => void;
}

const statusConfig: Record<MilestoneStatus, { label: string; color: 'blue' | 'green' | 'purple' | 'gray' }> = {
  [MilestoneStatus.PLANNED]: { label: 'Planned', color: 'blue' },
  [MilestoneStatus.ACTIVE]: { label: 'Active', color: 'green' },
  [MilestoneStatus.COMPLETED]: { label: 'Completed', color: 'purple' },
  [MilestoneStatus.ARCHIVED]: { label: 'Archived', color: 'gray' },
};

export function MilestoneCard({ milestone, onEdit, onDelete }: MilestoneCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const statusInfo = statusConfig[milestone.status];

  const progressBarColor = () => {
    if (milestone.progress === 100) return 'bg-green-500';
    if (milestone.progress >= 70) return 'bg-blue-500';
    if (milestone.progress >= 40) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{milestone.name}</h3>
            <Badge color={statusInfo.color}>{statusInfo.label}</Badge>
          </div>
          {milestone.description && (
            <p className="text-sm text-gray-600 mb-3">{milestone.description}</p>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button
                  onClick={() => {
                    onEdit(milestone);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Milestone
                </button>
                <button
                  onClick={() => {
                    onDelete(milestone.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Milestone
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{format(new Date(milestone.startDate), 'MMM d, yyyy')}</span>
        </div>
        <span>→</span>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{format(new Date(milestone.endDate), 'MMM d, yyyy')}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-semibold text-gray-900">{milestone.progress}%</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full ${progressBarColor()} transition-all duration-300`}
            style={{ width: `${milestone.progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-sm pt-2">
          <div className="flex items-center gap-1 text-gray-600">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>{milestone.completedTasks} completed</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Circle className="w-4 h-4 text-gray-400" />
            <span>{milestone.totalTasks} total tasks</span>
          </div>
        </div>
      </div>
    </div>
  );
}
