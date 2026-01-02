import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import * as timeLogService from '../services/timeLogService.js';

export async function createTimeLog(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { hours, description, taskId, loggedAt } = req.body;
    const userId = req.userId!;

    if (!hours || !taskId) {
      res.status(400).json({ error: 'Hours and taskId are required' });
      return;
    }

    if (hours <= 0 || hours > 24) {
      res.status(400).json({ error: 'Hours must be between 0 and 24' });
      return;
    }

    const timeLog = await timeLogService.createTimeLog({
      hours,
      description,
      taskId,
      userId,
      loggedAt: loggedAt ? new Date(loggedAt) : undefined,
    });

    res.status(201).json(timeLog);
  } catch (error: any) {
    console.error('Error creating time log:', error);
    res.status(500).json({ error: 'Failed to create time log' });
  }
}

export async function getTimeLogsByTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { taskId } = req.params;
    const result = await timeLogService.getTimeLogsByTask(taskId);
    res.json(result);
  } catch (error: any) {
    console.error('Error fetching time logs:', error);
    res.status(500).json({ error: 'Failed to fetch time logs' });
  }
}

export async function getTimeLogsByUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    const result = await timeLogService.getTimeLogsByUser(
      userId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json(result);
  } catch (error: any) {
    console.error('Error fetching time logs:', error);
    res.status(500).json({ error: 'Failed to fetch time logs' });
  }
}

export async function deleteTimeLog(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await timeLogService.deleteTimeLog(id);
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting time log:', error);
    res.status(500).json({ error: 'Failed to delete time log' });
  }
}
