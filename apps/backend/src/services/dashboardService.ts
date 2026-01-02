import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  completionRate: number;
  totalMilestones: number;
  activeMilestones: number;
  totalUsers: number;
}

export interface TeamMemberWorkload {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  inReviewTasks: number;
  currentTask: {
    id: string;
    title: string;
    priority: string;
  } | null;
  workloadScore: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [totalTasks, completedTasks, inProgressTasks, todoTasks, totalMilestones, activeMilestones, totalUsers] =
    await Promise.all([
      prisma.task.count(),
      prisma.task.count({ where: { status: 'DONE' } }),
      prisma.task.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { status: 'TODO' } }),
      prisma.milestone.count(),
      prisma.milestone.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count(),
    ]);

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    todoTasks,
    completionRate,
    totalMilestones,
    activeMilestones,
    totalUsers,
  };
}

export async function getTeamWorkload(): Promise<TeamMemberWorkload[]> {
  const users = await prisma.user.findMany({
    include: {
      assignedTasks: {
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return users.map((user) => {
    const totalTasks = user.assignedTasks.length;
    const completedTasks = user.assignedTasks.filter((t) => t.status === 'DONE').length;
    const inProgressTasks = user.assignedTasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const todoTasks = user.assignedTasks.filter((t) => t.status === 'TODO').length;
    const inReviewTasks = user.assignedTasks.filter((t) => t.status === 'IN_REVIEW').length;

    const currentTask = user.assignedTasks.find((t) => t.status === 'IN_PROGRESS') || null;

    // Workload score: more weight to in-progress and high priority tasks
    const workloadScore =
      inProgressTasks * 3 +
      todoTasks * 2 +
      inReviewTasks * 2 +
      user.assignedTasks.filter((t) => t.priority === 'URGENT').length * 2 +
      user.assignedTasks.filter((t) => t.priority === 'HIGH').length * 1;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      inReviewTasks,
      currentTask: currentTask
        ? {
            id: currentTask.id,
            title: currentTask.title,
            priority: currentTask.priority,
          }
        : null,
      workloadScore,
    };
  });
}
