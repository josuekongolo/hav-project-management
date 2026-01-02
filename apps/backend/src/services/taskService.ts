import { PrismaClient, TaskStatus, TaskPriority } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeIds?: string[];
  milestoneId?: string;
  dueDate?: Date;
  creatorId: string;
  labels?: string[];
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeIds?: string[];
  milestoneId?: string | null;
  dueDate?: Date | null;
  labels?: string[];
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  milestoneId?: string;
  creatorId?: string;
  search?: string;
}

export async function getAllTasks(filters?: TaskFilters) {
  const where: any = {};

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.priority) {
    where.priority = filters.priority;
  }

  if (filters?.assigneeId) {
    where.assignees = {
      some: {
        userId: filters.assigneeId,
      },
    };
  }

  if (filters?.milestoneId) {
    where.milestoneId = filters.milestoneId;
  }

  if (filters?.creatorId) {
    where.creatorId = filters.creatorId;
  }

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const tasks = await prisma.task.findMany({
    where,
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
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
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
    orderBy: [{ status: 'asc' }, { position: 'asc' }, { createdAt: 'desc' }],
  });

  return tasks.map((task) => ({
    ...task,
    assignees: task.assignees.map((ta) => ta.user),
    labels: task.labels.map((tl) => tl.label),
  }));
}

export async function getTaskById(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
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
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      milestone: true,
      labels: {
        include: {
          label: true,
        },
      },
      comments: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!task) {
    throw new Error('Task not found');
  }

  return {
    ...task,
    assignees: task.assignees.map((ta) => ta.user),
    labels: task.labels.map((tl) => tl.label),
  };
}

export async function createTask(data: CreateTaskData) {
  const tasksInColumn = await prisma.task.count({
    where: { status: data.status || TaskStatus.TODO },
  });

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status || TaskStatus.TODO,
      priority: data.priority || TaskPriority.MEDIUM,
      position: tasksInColumn,
      milestoneId: data.milestoneId,
      dueDate: data.dueDate,
      creatorId: data.creatorId,
      assignees: data.assigneeIds
        ? {
            create: data.assigneeIds.map((userId) => ({
              userId,
            })),
          }
        : undefined,
      labels: data.labels
        ? {
            create: data.labels.map((labelId) => ({
              labelId,
            })),
          }
        : undefined,
    },
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
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
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
  });

  return {
    ...task,
    assignees: task.assignees.map((ta) => ta.user),
    labels: task.labels.map((tl) => tl.label),
  };
}

export async function updateTask(taskId: string, data: UpdateTaskData) {
  const existingTask = await prisma.task.findUnique({
    where: { id: taskId },
    include: { labels: true, assignees: true },
  });

  if (!existingTask) {
    throw new Error('Task not found');
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      milestoneId: data.milestoneId,
      dueDate: data.dueDate,
      assignees: data.assigneeIds
        ? {
            deleteMany: {},
            create: data.assigneeIds.map((userId) => ({
              userId,
            })),
          }
        : undefined,
      labels: data.labels
        ? {
            deleteMany: {},
            create: data.labels.map((labelId) => ({
              labelId,
            })),
          }
        : undefined,
    },
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
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
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
  });

  return {
    ...task,
    assignees: task.assignees.map((ta) => ta.user),
    labels: task.labels.map((tl) => tl.label),
  };
}

export async function deleteTask(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new Error('Task not found');
  }

  await prisma.task.delete({
    where: { id: taskId },
  });

  return { success: true };
}

export async function moveTask(taskId: string, newStatus: TaskStatus, newPosition: number) {
  return await prisma.$transaction(async (tx) => {
    const task = await tx.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    const oldStatus = task.status;
    const oldPosition = task.position;

    if (oldStatus === newStatus) {
      if (oldPosition === newPosition) {
        return task;
      }

      if (oldPosition < newPosition) {
        await tx.task.updateMany({
          where: {
            status: newStatus,
            position: {
              gt: oldPosition,
              lte: newPosition,
            },
          },
          data: {
            position: {
              decrement: 1,
            },
          },
        });
      } else {
        await tx.task.updateMany({
          where: {
            status: newStatus,
            position: {
              gte: newPosition,
              lt: oldPosition,
            },
          },
          data: {
            position: {
              increment: 1,
            },
          },
        });
      }
    } else {
      await tx.task.updateMany({
        where: {
          status: oldStatus,
          position: {
            gt: oldPosition,
          },
        },
        data: {
          position: {
            decrement: 1,
          },
        },
      });

      await tx.task.updateMany({
        where: {
          status: newStatus,
          position: {
            gte: newPosition,
          },
        },
        data: {
          position: {
            increment: 1,
          },
        },
      });
    }

    const updatedTask = await tx.task.update({
      where: { id: taskId },
      data: {
        status: newStatus,
        position: newPosition,
      },
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
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
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
    });

    return {
      ...updatedTask,
      assignees: updatedTask.assignees.map((ta) => ta.user),
      labels: updatedTask.labels.map((tl) => tl.label),
    };
  });
}
