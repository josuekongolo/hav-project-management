import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import {
  getAllMilestones,
  getMilestoneById,
  createMilestone,
  updateMilestone,
  deleteMilestone,
} from '../services/milestoneService.js';

export async function getMilestonesHandler(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const milestones = await getAllMilestones();
    res.status(200).json({ milestones });
  } catch (error) {
    throw error;
  }
}

export async function getMilestoneByIdHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const milestone = await getMilestoneById(id);
    res.status(200).json({ milestone });
  } catch (error) {
    if (error instanceof Error && error.message === 'Milestone not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    throw error;
  }
}

export async function createMilestoneHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, description, startDate, endDate, status } = req.body;

    if (!name || !startDate || !endDate) {
      res.status(400).json({ error: 'Name, start date, and end date are required' });
      return;
    }

    const milestone = await createMilestone({
      name: name.trim(),
      description: description?.trim(),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status,
    });

    res.status(201).json({ milestone });
  } catch (error) {
    if (error instanceof Error && error.message === 'End date must be after start date') {
      res.status(400).json({ error: error.message });
      return;
    }
    throw error;
  }
}

export async function updateMilestoneHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, description, startDate, endDate, status } = req.body;

    const updateData: any = {};

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (startDate !== undefined) {
      updateData.startDate = new Date(startDate);
    }

    if (endDate !== undefined) {
      updateData.endDate = new Date(endDate);
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    const milestone = await updateMilestone(id, updateData);

    res.status(200).json({ milestone });
  } catch (error) {
    if (error instanceof Error && error.message === 'Milestone not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error instanceof Error && error.message === 'End date must be after start date') {
      res.status(400).json({ error: error.message });
      return;
    }
    throw error;
  }
}

export async function deleteMilestoneHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await deleteMilestone(id);
    res.status(200).json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Milestone not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    throw error;
  }
}
