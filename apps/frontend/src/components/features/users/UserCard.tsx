import { Mail, Shield, Calendar } from 'lucide-react';
import { User } from '../../../services/taskService';
import { Avatar } from '../../ui/Avatar';
import { Badge } from '../../ui/Badge';
import { format } from 'date-fns';

interface UserCardProps {
  user: User & { role?: string; createdAt?: string };
  taskCount?: number;
}

export function UserCard({ user, taskCount }: UserCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4 mb-4">
        <Avatar src={user.avatar || undefined} alt={user.name} size="xl" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{user.name}</h3>
            {user.role === 'ADMIN' && (
              <Badge color="purple" size="sm">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>
          {user.createdAt && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <span>Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>
      </div>

      {taskCount !== undefined && (
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Assigned Tasks</span>
            <span className="font-semibold text-gray-900">{taskCount}</span>
          </div>
        </div>
      )}
    </div>
  );
}
