import { Request, Response } from 'express';
import * as dealService from '../services/dealService.js';
import { DealStage } from '@prisma/client';

export async function getDeals(req: Request, res: Response) {
  const { stage, ownerId, contactId } = req.query;

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

  const deals = await dealService.getDeals(filters);
  res.json({ deals });
}

export async function getDealById(req: Request, res: Response) {
  const { id } = req.params;
  const deal = await dealService.getDealById(id);
  res.json({ deal });
}

export async function createDeal(req: Request, res: Response) {
  const userId = req.user!.id;
  const deal = await dealService.createDeal(req.body, userId);
  res.status(201).json({ deal });
}

export async function updateDeal(req: Request, res: Response) {
  const { id } = req.params;
  const userId = req.user!.id;
  const deal = await dealService.updateDeal(id, req.body, userId);
  res.json({ deal });
}

export async function deleteDeal(req: Request, res: Response) {
  const { id } = req.params;
  const result = await dealService.deleteDeal(id);
  res.json(result);
}

export async function updateDealStage(req: Request, res: Response) {
  const { id } = req.params;
  const { stage } = req.body;
  const userId = req.user!.id;
  const deal = await dealService.updateDealStage(id, stage, userId);
  res.json({ deal });
}

export async function getDealStats(req: Request, res: Response) {
  const { ownerId } = req.query;
  const stats = await dealService.getDealStats(
    ownerId ? String(ownerId) : undefined
  );
  res.json(stats);
}
