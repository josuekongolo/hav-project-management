import { formatDistanceToNow } from 'date-fns';
import {
  Mail,
  MailOpen,
  MousePointer,
  FileText,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Circle,
  Phone,
  Calendar,
  Target,
  DollarSign,
} from 'lucide-react';

export enum ActivityType {
  EMAIL_SENT = 'EMAIL_SENT',
  EMAIL_OPENED = 'EMAIL_OPENED',
  EMAIL_CLICKED = 'EMAIL_CLICKED',
  NOTE_ADDED = 'NOTE_ADDED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  DEAL_CREATED = 'DEAL_CREATED',
  DEAL_WON = 'DEAL_WON',
  DEAL_LOST = 'DEAL_LOST',
  TASK_CREATED = 'TASK_CREATED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  CALL_MADE = 'CALL_MADE',
  MEETING_SCHEDULED = 'MEETING_SCHEDULED',
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  metadata?: any;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface ActivityTimelineProps {
  activities: Activity[];
  isLoading?: boolean;
}

const activityConfig: Record<
  ActivityType,
  { icon: React.ElementType; color: string; bgColor: string }
> = {
  [ActivityType.EMAIL_SENT]: {
    icon: Mail,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  [ActivityType.EMAIL_OPENED]: {
    icon: MailOpen,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  [ActivityType.EMAIL_CLICKED]: {
    icon: MousePointer,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  [ActivityType.NOTE_ADDED]: {
    icon: FileText,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
  [ActivityType.STATUS_CHANGED]: {
    icon: Circle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  [ActivityType.DEAL_CREATED]: {
    icon: DollarSign,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  [ActivityType.DEAL_WON]: {
    icon: TrendingUp,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  [ActivityType.DEAL_LOST]: {
    icon: TrendingDown,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  [ActivityType.TASK_CREATED]: {
    icon: Target,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  [ActivityType.TASK_COMPLETED]: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  [ActivityType.CALL_MADE]: {
    icon: Phone,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
  [ActivityType.MEETING_SCHEDULED]: {
    icon: Calendar,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
};

export function ActivityTimeline({ activities, isLoading }: ActivityTimelineProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No activity yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Activities will appear here as you interact with this contact.
        </p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, activityIdx) => {
          const config = activityConfig[activity.type];
          const Icon = config.icon;

          return (
            <li key={activity.id}>
              <div className="relative pb-8">
                {activityIdx !== activities.length - 1 ? (
                  <span
                    className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex items-start space-x-3">
                  <div>
                    <div
                      className={`relative flex h-10 w-10 items-center justify-center rounded-full ${config.bgColor}`}
                    >
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">{activity.user.name}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">
                      <p className="font-medium">{activity.title}</p>
                      {activity.description && (
                        <p className="mt-1 text-gray-600">{activity.description}</p>
                      )}
                      {activity.metadata && (
                        <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                          {Object.entries(activity.metadata).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium">{key}:</span> {String(value)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
