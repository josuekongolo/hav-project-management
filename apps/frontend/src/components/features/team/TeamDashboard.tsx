import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { dashboardService, TeamMemberWorkload } from '../../../services/dashboardService';
import { TeamMemberCard } from './TeamMemberCard';
import { Spinner } from '../../ui/Spinner';
import { EmptyState } from '../../ui/EmptyState';

export function TeamDashboard() {
  const [team, setTeam] = useState<TeamMemberWorkload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamWorkload();
  }, []);

  const fetchTeamWorkload = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await dashboardService.getTeamWorkload();
      setTeam(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch team workload');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (team.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No team members found"
        description="Add team members to see their workload distribution."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Workload</h2>
          <p className="text-gray-600 mt-1">View and manage your team's task distribution</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {team.map((member) => (
          <TeamMemberCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}
