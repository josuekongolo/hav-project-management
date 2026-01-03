import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import * as callLogService from '../services/callLogService.js';

export async function createCallLog(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const callLog = await callLogService.createCallLog({
      ...req.body,
      userId,
    });
    res.status(201).json({ callLog });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create call log' });
  }
}

export async function getCallLogsByEntity(req: AuthRequest, res: Response) {
  try {
    const { entityType, entityId } = req.query;

    if (!entityType || !entityId || typeof entityType !== 'string' || typeof entityId !== 'string') {
      res.status(400).json({ error: 'entityType and entityId are required' });
      return;
    }

    if (!['contact', 'deal', 'company'].includes(entityType)) {
      res.status(400).json({ error: 'entityType must be contact, deal, or company' });
      return;
    }

    const callLogs = await callLogService.getCallLogsByEntity(
      entityType as 'contact' | 'deal' | 'company',
      entityId
    );

    res.json({ callLogs });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get call logs' });
  }
}

export async function getCallLogById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const callLog = await callLogService.getCallLogById(id);
    res.json({ callLog });
  } catch (error) {
    res.status(404).json({ error: error instanceof Error ? error.message : 'Call log not found' });
  }
}

export async function updateCallLog(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const callLog = await callLogService.updateCallLog(id, req.body, userId);
    res.json({ callLog });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update call log' });
  }
}

export async function deleteCallLog(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const result = await callLogService.deleteCallLog(id, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete call log' });
  }
}
