import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import * as dealService from '../services/dealService.js';
import { DealStage } from '@prisma/client';

export async function getDeals(req: AuthRequest, res: Response) {
  const { stage, ownerId, contactId, search, page, limit } = req.query;

  const filters: dealService.DealFilters = {};

  if (stage && typeof stage === 'string') {
    filters.stage = stage as DealStage;
  }

  if (ownerId && typeof ownerId === 'string') {
    filters.ownerId = ownerId;
  }

  if (contactId && typeof contactId === 'string') {
    filters.contactId = contactId;
  }

  if (search && typeof search === 'string') {
    filters.search = search;
  }

  if (page) {
    filters.page = parseInt(String(page));
  }

  if (limit) {
    filters.limit = parseInt(String(limit));
  }

  const result = await dealService.getDeals(filters);
  res.json(result);
}

export async function getDealById(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const deal = await dealService.getDealById(id);
  res.json({ deal });
}

export async function createDeal(req: AuthRequest, res: Response) {
  const userId = req.userId!;
  const deal = await dealService.createDeal(req.body, userId);
  res.status(201).json({ deal });
}

export async function updateDeal(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const userId = req.userId!;
  const deal = await dealService.updateDeal(id, req.body, userId);
  res.json({ deal });
}

export async function deleteDeal(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const result = await dealService.deleteDeal(id);
  res.json(result);
}

export async function updateDealStage(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { stage } = req.body;
  const userId = req.userId!;
  const deal = await dealService.updateDealStage(id, stage, userId);
  res.json({ deal });
}

export async function getDealStats(req: AuthRequest, res: Response) {
  const { ownerId } = req.query;
  const stats = await dealService.getDealStats(
    ownerId ? String(ownerId) : undefined
  );
  res.json(stats);
}
