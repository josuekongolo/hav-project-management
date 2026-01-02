import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  TaskFilters,
} from '../services/taskService.js';
import { TaskStatus, TaskPriority } from '@prisma/client';

export async function getTasksHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const filters: TaskFilters = {};

    if (req.query.status) {
      filters.status = req.query.status as TaskStatus;
    }

    if (req.query.priority) {
      filters.priority = req.query.priority as TaskPriority;
    }

    if (req.query.assigneeId) {
      filters.assigneeId = req.query.assigneeId as string;
    }

    if (req.query.milestoneId) {
      filters.milestoneId = req.query.milestoneId as string;
    }

    if (req.query.creatorId) {
      filters.creatorId = req.query.creatorId as string;
    }

    if (req.query.search) {
      filters.search = req.query.search as string;
    }

    const tasks = await getAllTasks(filters);

    res.status(200).json({ tasks });
  } catch (error) {
    throw error;
  }
}

export async function getTaskByIdHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const task = await getTaskById(id);

    res.status(200).json({ task });
  } catch (error) {
    if (error instanceof Error && error.message === 'Task not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    throw error;
  }
}

export async function createTaskHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { title, description, status, priority, assigneeIds, milestoneId, dueDate, labels } =
      req.body;

    if (!title || title.trim() === '') {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const task = await createTask({
      title: title.trim(),
      description: description?.trim(),
      status,
      priority,
      assigneeIds,
      milestoneId,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      creatorId: req.userId,
      labels,
    });

    res.status(201).json({ task });
  } catch (error) {
    throw error;
  }
}

export async function updateTaskHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assigneeIds, milestoneId, dueDate, labels } =
      req.body;

    const updateData: any = {};

    if (title !== undefined) {
      if (title.trim() === '') {
        res.status(400).json({ error: 'Title cannot be empty' });
        return;
      }
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (priority !== undefined) {
      updateData.priority = priority;
    }

    if (assigneeIds !== undefined) {
      updateData.assigneeIds = assigneeIds;
    }

    if (milestoneId !== undefined) {
      updateData.milestoneId = milestoneId || null;
    }

    if (dueDate !== undefined) {
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    }

    if (labels !== undefined) {
      updateData.labels = labels;
    }

    const task = await updateTask(id, updateData);

    res.status(200).json({ task });
  } catch (error) {
    if (error instanceof Error && error.message === 'Task not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    throw error;
  }
}

export async function deleteTaskHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    await deleteTask(id);

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Task not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    throw error;
  }
}

export async function moveTaskHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status, position } = req.body;

    if (!status || position === undefined) {
      res.status(400).json({ error: 'Status and position are required' });
      return;
    }

    if (typeof position !== 'number' || position < 0) {
      res.status(400).json({ error: 'Position must be a non-negative number' });
      return;
    }

    const task = await moveTask(id, status, position);

    res.status(200).json({ task });
  } catch (error) {
    if (error instanceof Error && error.message === 'Task not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    throw error;
  }
}
