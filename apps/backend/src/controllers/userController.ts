import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { getAllUsers, getUserTasks } from '../services/userService.js';

export async function getUsersHandler(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const users = await getAllUsers();
    res.status(200).json({ users });
  } catch (error) {
    throw error;
  }
}

export async function getUserTasksHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const tasks = await getUserTasks(id);
    res.status(200).json({ tasks });
  } catch (error) {
    if (error instanceof Error && error.message === 'User not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    throw error;
  }
}
