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

export interface RecentActivity {
  id: string;
  taskId: string;
  taskTitle: string;
  userName: string;
  userAvatar: string | null;
  action: string;
  status: string;
  timestamp: Date;
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
        include: {
          task: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
            },
          },
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return users.map((user) => {
    const tasks = user.assignedTasks.map((ta) => ta.task);
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'DONE').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const todoTasks = tasks.filter((t) => t.status === 'TODO').length;
    const inReviewTasks = tasks.filter((t) => t.status === 'IN_REVIEW').length;

    const currentTask = tasks.find((t) => t.status === 'IN_PROGRESS') || null;

    // Workload score: more weight to in-progress and high priority tasks
    const workloadScore =
      inProgressTasks * 3 +
      todoTasks * 2 +
      inReviewTasks * 2 +
      tasks.filter((t) => t.priority === 'URGENT').length * 2 +
      tasks.filter((t) => t.priority === 'HIGH').length * 1;

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

export async function getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
  const recentTasks = await prisma.task.findMany({
    take: limit,
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      assignees: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        take: 1,
      },
    },
  });

  return recentTasks.map((task) => {
    const user = task.assignees[0]?.user || { name: 'Unknown', avatar: null };

    let action = 'updated';
    if (task.status === 'DONE') {
      action = 'completed';
    } else if (task.status === 'IN_PROGRESS') {
      action = 'is working on';
    } else if (task.status === 'IN_REVIEW') {
      action = 'submitted for review';
    } else if (task.status === 'TODO') {
      action = 'created';
    }

    return {
      id: task.id,
      taskId: task.id,
      taskTitle: task.title,
      userName: user.name,
      userAvatar: user.avatar,
      action,
      status: task.status,
      timestamp: task.updatedAt,
    };
  });
}
