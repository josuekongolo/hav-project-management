import { PrismaClient, UserStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface UpdateProfileData {
  name?: string;
  bio?: string;
  status?: UserStatus;
  timezone?: string;
  avatar?: string;
}

export async function getAllUsers() {
  return await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      role: true,
      bio: true,
      status: true,
      timezone: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
}

export async function updateProfile(userId: string, data: UpdateProfileData) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      bio: data.bio,
      status: data.status,
      timezone: data.timezone,
      avatar: data.avatar,
    },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      role: true,
      bio: true,
      status: true,
      timezone: true,
      createdAt: true,
      updatedAt: true,
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
