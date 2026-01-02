import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateTimeLogDto {
  hours: number;
  description?: string;
  taskId: string;
  userId: string;
  loggedAt?: Date;
}

export async function createTimeLog(data: CreateTimeLogDto) {
  const timeLog = await prisma.timeLog.create({
    data: {
      hours: data.hours,
      description: data.description,
      taskId: data.taskId,
      userId: data.userId,
      loggedAt: data.loggedAt || new Date(),
    },
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
  });

  return timeLog;
}

export async function getTimeLogsByTask(taskId: string) {
  const timeLogs = await prisma.timeLog.findMany({
    where: { taskId },
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
    orderBy: {
      loggedAt: 'desc',
    },
  });

  // Calculate total hours
  const totalHours = timeLogs.reduce((sum, log) => sum + log.hours, 0);

  return { timeLogs, totalHours };
}

export async function getTimeLogsByUser(userId: string, startDate?: Date, endDate?: Date) {
  const where: any = { userId };

  if (startDate || endDate) {
    where.loggedAt = {};
    if (startDate) where.loggedAt.gte = startDate;
    if (endDate) where.loggedAt.lte = endDate;
  }

  const timeLogs = await prisma.timeLog.findMany({
    where,
    include: {
      task: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: {
      loggedAt: 'desc',
    },
  });

  const totalHours = timeLogs.reduce((sum, log) => sum + log.hours, 0);

  return { timeLogs, totalHours };
}

export async function deleteTimeLog(id: string) {
  await prisma.timeLog.delete({
    where: { id },
  });
}
