import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { StatCard, Card } from '../components/ui';
import { CheckSquare, Clock, CheckCircle, Target, TrendingUp, Users } from 'lucide-react';
import { dashboardService, DashboardStats, RecentActivity } from '../services/dashboardService';
import { Spinner } from '../components/ui/Spinner';
import { formatDistanceToNow } from 'date-fns';

export function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsData, activitiesData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentActivity(5),
      ]);
      setStats(statsData);
      setActivities(activitiesData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your team today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard
          title="Total Tasks"
          value={stats?.totalTasks.toString() || '0'}
          icon={<CheckSquare />}
          color="primary"
        />
        <StatCard
          title="In Progress"
          value={stats?.inProgressTasks.toString() || '0'}
          icon={<Clock />}
          color="info"
        />
        <StatCard
          title="Completed"
          value={stats?.completedTasks.toString() || '0'}
          icon={<CheckCircle />}
          color="success"
        />
        <StatCard
          title="Active Milestones"
          value={stats?.activeMilestones.toString() || '0'}
          icon={<Target />}
          color="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/kanban')}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <p className="font-medium text-gray-900">Create New Task</p>
              <p className="text-sm text-gray-500">Add a new task to your board</p>
            </button>
            <button
              onClick={() => navigate('/milestones')}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <p className="font-medium text-gray-900">Create Milestone</p>
              <p className="text-sm text-gray-500">Plan your next sprint</p>
            </button>
            <button
              onClick={() => navigate('/kanban')}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <p className="font-medium text-gray-900">View Kanban Board</p>
              <p className="text-sm text-gray-500">Manage your tasks visually</p>
            </button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Team Overview</h2>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Team Members</p>
                <p className="text-sm text-gray-500">{stats?.totalUsers || 0} active members</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{stats?.completionRate || 0}%</p>
                <p className="text-xs text-gray-500">Completion Rate</p>
              </div>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">Overall Progress</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${stats?.completionRate || 0}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{stats?.completedTasks || 0} of {stats?.totalTasks || 0} tasks completed</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          <TrendingUp className="h-5 w-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
          ) : (
            activities.map((activity) => {
              const statusColors: Record<string, string> = {
                DONE: 'bg-green-500',
                IN_PROGRESS: 'bg-blue-500',
                IN_REVIEW: 'bg-yellow-500',
                TODO: 'bg-gray-500',
              };

              return (
                <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-2 ${statusColors[activity.status] || 'bg-purple-500'}`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.userName}</span> {activity.action}{' '}
                      <span className="font-medium">{activity.taskTitle}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
