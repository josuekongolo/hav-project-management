import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { getDashboardStats, getTeamWorkload, getRecentActivity } from '../services/dashboardService.js';

export async function getDashboardStatsHandler(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const stats = await getDashboardStats();
    res.status(200).json({ stats });
  } catch (error) {
    throw error;
  }
}

export async function getTeamWorkloadHandler(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const team = await getTeamWorkload();
    res.status(200).json({ team });
  } catch (error) {
    throw error;
  }
}

export async function getRecentActivityHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const activities = await getRecentActivity(limit);
    res.status(200).json({ activities });
  } catch (error) {
    throw error;
  }
}
