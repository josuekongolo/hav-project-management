import { PrismaClient, MilestoneStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateMilestoneData {
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status?: MilestoneStatus;
}

export interface UpdateMilestoneData {
  name?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status?: MilestoneStatus;
}

export async function getAllMilestones() {
  const milestones = await prisma.milestone.findMany({
    include: {
      tasks: {
        select: {
          id: true,
          status: true,
        },
      },
    },
    orderBy: {
      startDate: 'desc',
    },
  });

  return milestones.map((milestone) => {
    const totalTasks = milestone.tasks.length;
    const completedTasks = milestone.tasks.filter((task) => task.status === 'DONE').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      ...milestone,
      totalTasks,
      completedTasks,
      progress,
      tasks: undefined,
    };
  });
}

export async function getMilestoneById(milestoneId: string) {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: {
      tasks: {
        include: {
          assignees: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
          labels: {
            include: {
              label: true,
            },
          },
        },
        orderBy: [{ status: 'asc' }, { position: 'asc' }],
      },
    },
  });

  if (!milestone) {
    throw new Error('Milestone not found');
  }

  const totalTasks = milestone.tasks.length;
  const completedTasks = milestone.tasks.filter((task: any) => task.status === 'DONE').length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    ...milestone,
    tasks: milestone.tasks.map((task: any) => ({
      ...task,
      assignees: task.assignees.map((ta: any) => ta.user),
      labels: task.labels.map((tl: any) => tl.label),
    })),
    totalTasks,
    completedTasks,
    progress,
  };
}

export async function createMilestone(data: CreateMilestoneData) {
  if (data.endDate <= data.startDate) {
    throw new Error('End date must be after start date');
  }

  const milestone = await prisma.milestone.create({
    data: {
      name: data.name,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status || MilestoneStatus.PLANNED,
    },
  });

  return {
    ...milestone,
    totalTasks: 0,
    completedTasks: 0,
    progress: 0,
  };
}

export async function updateMilestone(milestoneId: string, data: UpdateMilestoneData) {
  const existingMilestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
  });

  if (!existingMilestone) {
    throw new Error('Milestone not found');
  }

  const startDate = data.startDate || existingMilestone.startDate;
  const endDate = data.endDate || existingMilestone.endDate;

  if (endDate <= startDate) {
    throw new Error('End date must be after start date');
  }

  const milestone = await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      name: data.name,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status,
    },
    include: {
      tasks: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  const totalTasks = milestone.tasks.length;
  const completedTasks = milestone.tasks.filter((task) => task.status === 'DONE').length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    ...milestone,
    totalTasks,
    completedTasks,
    progress,
    tasks: undefined,
  };
}

export async function deleteMilestone(milestoneId: string) {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
  });

  if (!milestone) {
    throw new Error('Milestone not found');
  }

  await prisma.milestone.delete({
    where: { id: milestoneId },
  });

  return { success: true };
}
