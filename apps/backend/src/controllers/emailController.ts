import { Request, Response } from 'express';
import * as emailHistoryService from '../services/emailHistoryService.js';

export async function getEmails(req: Request, res: Response) {
  const { contactId, senderId } = req.query;

  const emails = await emailHistoryService.getEmails(
    contactId ? String(contactId) : undefined,
    senderId ? String(senderId) : undefined
  );

  res.json({ emails });
}

export async function getEmailById(req: Request, res: Response) {
  const { id } = req.params;
  const email = await emailHistoryService.getEmailById(id);
  res.json({ email });
}

export async function sendEmail(req: Request, res: Response) {
  const userId = req.user!.id;
  const email = await emailHistoryService.sendEmail(req.body, userId);
  res.status(201).json({ email });
}

export async function sendEmailWithTemplate(req: Request, res: Response) {
  const userId = req.user!.id;
  const email = await emailHistoryService.sendEmailWithTemplate(req.body, userId);
  res.status(201).json({ email });
}

export async function sendBulkEmails(req: Request, res: Response) {
  const userId = req.user!.id;
  const results = await emailHistoryService.sendBulkEmails(req.body, userId);
  res.json(results);
}

export async function saveDraft(req: Request, res: Response) {
  const userId = req.user!.id;
  const draft = await emailHistoryService.saveDraft(req.body, userId);
  res.status(201).json({ draft });
}

export async function deleteEmail(req: Request, res: Response) {
  const { id } = req.params;
  const result = await emailHistoryService.deleteEmail(id);
  res.json(result);
}
