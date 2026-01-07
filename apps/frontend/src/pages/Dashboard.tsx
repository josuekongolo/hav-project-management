import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { StatCard, Card } from '../components/ui';
import { CheckSquare, Clock, CheckCircle, Target, TrendingUp, Users, User } from 'lucide-react';
import { dashboardService, DashboardStats, RecentActivity, TeamMemberWorkload } from '../services/dashboardService';
import { Spinner } from '../components/ui/Spinner';
import { formatDistanceToNow } from 'date-fns';

export function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberWorkload[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsData, activitiesData, teamData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentActivity(5),
        dashboardService.getTeamWorkload(),
      ]);
      setStats(statsData);
      setActivities(activitiesData);
      setTeamMembers(teamData);
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
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Here's what's happening with your team today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
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

      <div className="mb-6 sm:mb-8">
        <Card>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <button
              onClick={() => navigate('/kanban')}
              className="text-left p-4 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <p className="font-medium text-gray-900">Create New Task</p>
              <p className="text-sm text-gray-500">Add a new task to your board</p>
            </button>
            <button
              onClick={() => navigate('/milestones')}
              className="text-left p-4 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <p className="font-medium text-gray-900">Create Milestone</p>
              <p className="text-sm text-gray-500">Plan your next sprint</p>
            </button>
            <button
              onClick={() => navigate('/kanban')}
              className="text-left p-4 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <p className="font-medium text-gray-900">View Kanban Board</p>
              <p className="text-sm text-gray-500">Manage your tasks visually</p>
            </button>
          </div>
        </Card>
      </div>

      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Team Overview</h2>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>{stats?.totalUsers || 0} members</span>
            <span className="mx-1 sm:mx-2">•</span>
            <span>{stats?.completionRate || 0}% completion</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {teamMembers.map((member) => (
            <Card key={member.id}>
              <div className="flex items-start gap-3 mb-4">
                <div className="relative">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="h-12 w-12 rounded-full"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{member.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{member.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Tasks</span>
                  <span className="font-semibold text-gray-900">{member.totalTasks}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${member.totalTasks > 0 ? (member.completedTasks / member.totalTasks) * 100 : 0}%`,
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <p className="text-xs text-blue-600 font-medium">In Progress</p>
                    <p className="text-lg font-bold text-blue-700">{member.inProgressTasks}</p>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <p className="text-xs text-green-600 font-medium">Completed</p>
                    <p className="text-lg font-bold text-green-700">{member.completedTasks}</p>
                  </div>
                </div>
              </div>

              {member.currentTask && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Current Task</p>
                  <p className="text-sm font-medium text-gray-900 truncate" title={member.currentTask.title}>
                    {member.currentTask.title}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Recent Activity</h2>
          <TrendingUp className="h-5 w-5 text-primary-500" />
        </div>
        <Card>
          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No recent activity</p>
            ) : (
              activities.map((activity) => {
                const statusColors: Record<string, string> = {
                  DONE: 'bg-green-500',
                  IN_PROGRESS: 'bg-blue-500',
                  IN_REVIEW: 'bg-yellow-500',
                  TODO: 'bg-gray-500',
                };

                const statusLabels: Record<string, string> = {
                  DONE: 'Done',
                  IN_PROGRESS: 'In Progress',
                  IN_REVIEW: 'In Review',
                  TODO: 'To Do',
                };

                const statusBadgeColors: Record<string, string> = {
                  DONE: 'bg-green-100 text-green-700',
                  IN_PROGRESS: 'bg-blue-100 text-blue-700',
                  IN_REVIEW: 'bg-yellow-100 text-yellow-700',
                  TODO: 'bg-gray-100 text-gray-700',
                };

                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusColors[activity.status] || 'bg-purple-500'}`}>
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">{activity.userName}</span>{' '}
                        <span className="text-gray-600">{activity.action}</span>{' '}
                        <span className="font-medium text-gray-900">"{activity.taskTitle}"</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusBadgeColors[activity.status] || 'bg-purple-100 text-purple-700'}`}>
                          {statusLabels[activity.status] || activity.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
