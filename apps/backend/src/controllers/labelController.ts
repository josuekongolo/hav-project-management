import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import {
  getAllLabels,
  getLabelById,
  createLabel,
  updateLabel,
  deleteLabel,
} from '../services/labelService.js';

export async function getLabelsHandler(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const labels = await getAllLabels();
    res.status(200).json({ labels });
  } catch (error) {
    throw error;
  }
}

export async function getLabelByIdHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const label = await getLabelById(id);
    res.status(200).json({ label });
  } catch (error) {
    if (error instanceof Error && error.message === 'Label not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    throw error;
  }
}

export async function createLabelHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, color } = req.body;

    if (!name || !color) {
      res.status(400).json({ error: 'Name and color are required' });
      return;
    }

    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexColorRegex.test(color)) {
      res.status(400).json({ error: 'Color must be a valid hex color (e.g., #FF5733)' });
      return;
    }

    const label = await createLabel({ name: name.trim(), color });
    res.status(201).json({ label });
  } catch (error) {
    if (error instanceof Error && error.message === 'Label with this name already exists') {
      res.status(409).json({ error: error.message });
      return;
    }
    throw error;
  }
}

export async function updateLabelHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, color } = req.body;

    if (color) {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      if (!hexColorRegex.test(color)) {
        res.status(400).json({ error: 'Color must be a valid hex color (e.g., #FF5733)' });
        return;
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (color !== undefined) updateData.color = color;

    const label = await updateLabel(id, updateData);
    res.status(200).json({ label });
  } catch (error) {
    if (error instanceof Error && error.message === 'Label not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error instanceof Error && error.message === 'Label with this name already exists') {
      res.status(409).json({ error: error.message });
      return;
    }
    throw error;
  }
}

export async function deleteLabelHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await deleteLabel(id);
    res.status(200).json({ message: 'Label deleted successfully' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Label not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    throw error;
  }
}
