import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getAllUsers() {
  return await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
}

export async function getUserTasks(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const tasks = await prisma.task.findMany({
    where: {
      assigneeId: userId,
    },
    include: {
      milestone: {
        select: {
          id: true,
          name: true,
          endDate: true,
        },
      },
      labels: {
        include: {
          label: true,
        },
      },
    },
    orderBy: [{ status: 'asc' }, { position: 'asc' }],
  });

  return tasks.map((task) => ({
    ...task,
    labels: task.labels.map((tl) => tl.label),
  }));
}
