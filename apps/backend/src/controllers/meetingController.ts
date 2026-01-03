import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import * as meetingService from '../services/meetingService.js';
import { MeetingStatus } from '@prisma/client';

export async function createMeeting(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const meeting = await meetingService.createMeeting({
      ...req.body,
      organizerId: userId,
    });
    res.status(201).json({ meeting });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create meeting' });
  }
}

export async function getMeetingsByEntity(req: AuthRequest, res: Response) {
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

    const meetings = await meetingService.getMeetingsByEntity(
      entityType as 'contact' | 'deal' | 'company',
      entityId
    );

    res.json({ meetings });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get meetings' });
  }
}

export async function getMeetingsByUser(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const { status, startDate, endDate } = req.query;

    const filters: any = {};

    if (status && typeof status === 'string') {
      filters.status = status as MeetingStatus;
    }

    if (startDate && typeof startDate === 'string') {
      filters.startDate = new Date(startDate);
    }

    if (endDate && typeof endDate === 'string') {
      filters.endDate = new Date(endDate);
    }

    const meetings = await meetingService.getMeetingsByUser(userId, filters);
    res.json({ meetings });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get meetings' });
  }
}

export async function getMeetingById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const meeting = await meetingService.getMeetingById(id);
    res.json({ meeting });
  } catch (error) {
    res.status(404).json({ error: error instanceof Error ? error.message : 'Meeting not found' });
  }
}

export async function updateMeeting(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const meeting = await meetingService.updateMeeting(id, req.body, userId);
    res.json({ meeting });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update meeting' });
  }
}

export async function deleteMeeting(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const result = await meetingService.deleteMeeting(id, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete meeting' });
  }
}
