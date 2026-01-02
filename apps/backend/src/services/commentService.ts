import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateCommentDto {
  content: string;
  taskId: string;
  authorId: string;
}

export interface UpdateCommentDto {
  content: string;
}

export async function createComment(data: CreateCommentDto) {
  const comment = await prisma.comment.create({
    data: {
      content: data.content,
      taskId: data.taskId,
      authorId: data.authorId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });

  return comment;
}

export async function getCommentsByTask(taskId: string) {
  const comments = await prisma.comment.findMany({
    where: { taskId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return comments;
}

export async function updateComment(id: string, data: UpdateCommentDto) {
  const comment = await prisma.comment.update({
    where: { id },
    data: {
      content: data.content,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });

  return comment;
}

export async function deleteComment(id: string) {
  await prisma.comment.delete({
    where: { id },
  });
}
