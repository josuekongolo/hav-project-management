import { PrismaClient, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateNotificationDto {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  userId: string;
}

export async function createNotification(data: CreateNotificationDto) {
  const notification = await prisma.notification.create({
    data: {
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
      userId: data.userId,
    },
  });

  return notification;
}

export async function getNotificationsByUser(userId: string, unreadOnly: boolean = false) {
  const where: any = { userId };
  if (unreadOnly) {
    where.read = false;
  }

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
    take: 50, // Limit to 50 most recent
  });

  return notifications;
}

export async function markAsRead(id: string) {
  const notification = await prisma.notification.update({
    where: { id },
    data: { read: true },
  });

  return notification;
}

export async function markAllAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: {
      read: true,
    },
  });
}

export async function deleteNotification(id: string) {
  await prisma.notification.delete({
    where: { id },
  });
}

export async function getUnreadCount(userId: string) {
  const count = await prisma.notification.count({
    where: {
      userId,
      read: false,
    },
  });

  return count;
}

// Helper functions to create specific notification types
export async function notifyTaskAssigned(taskId: string, taskTitle: string, assigneeId: string) {
  return createNotification({
    type: 'TASK_ASSIGNED',
    title: 'New task assigned',
    message: `You have been assigned to "${taskTitle}"`,
    link: `/kanban?task=${taskId}`,
    userId: assigneeId,
  });
}

export async function notifyTaskComment(taskId: string, taskTitle: string, commenterName: string, userId: string) {
  return createNotification({
    type: 'TASK_COMMENT',
    title: 'New comment',
    message: `${commenterName} commented on "${taskTitle}"`,
    link: `/kanban?task=${taskId}`,
    userId,
  });
}

export async function notifyTaskCompleted(taskId: string, taskTitle: string, userId: string) {
  return createNotification({
    type: 'TASK_COMPLETED',
    title: 'Task completed',
    message: `"${taskTitle}" has been marked as complete`,
    link: `/kanban?task=${taskId}`,
    userId,
  });
}
