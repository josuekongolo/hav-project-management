import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import * as emailHistoryService from '../services/emailHistoryService.js';

export async function getEmails(req: AuthRequest, res: Response) {
  const { contactId, senderId } = req.query;

  const emails = await emailHistoryService.getEmails(
    contactId ? String(contactId) : undefined,
    senderId ? String(senderId) : undefined
  );

  res.json({ emails });
}

export async function getEmailById(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const email = await emailHistoryService.getEmailById(id);
  res.json({ email });
}

export async function sendEmail(req: AuthRequest, res: Response) {
  const userId = req.userId!;
  const email = await emailHistoryService.sendEmail(req.body, userId);
  res.status(201).json({ email });
}

export async function sendEmailWithTemplate(req: AuthRequest, res: Response) {
  const userId = req.userId!;
  const email = await emailHistoryService.sendEmailWithTemplate(req.body, userId);
  res.status(201).json({ email });
}

export async function sendBulkEmails(req: AuthRequest, res: Response) {
  const userId = req.userId!;
  const results = await emailHistoryService.sendBulkEmails(req.body, userId);
  res.json(results);
}

export async function saveDraft(req: AuthRequest, res: Response) {
  const userId = req.userId!;
  const draft = await emailHistoryService.saveDraft(req.body, userId);
  res.status(201).json({ draft });
}

export async function deleteEmail(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const result = await emailHistoryService.deleteEmail(id);
  res.json(result);
}

export async function trackEmailOpen(req: AuthRequest, res: Response) {
  const { id } = req.params;
  await emailHistoryService.trackEmailOpen(id);

  // Return 1x1 transparent pixel
  const pixel = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
  );
  res.writeHead(200, {
    'Content-Type': 'image/gif',
    'Content-Length': pixel.length,
  });
  res.end(pixel);
}

export async function trackEmailClick(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { url } = req.query;

  await emailHistoryService.trackEmailClick(id);

  // Redirect to the actual URL
  if (url && typeof url === 'string') {
    res.redirect(url);
  } else {
    res.status(400).json({ error: 'URL parameter required' });
  }
}

export async function getEmailStats(req: AuthRequest, res: Response) {
  const { senderId } = req.query;
  const stats = await emailHistoryService.getEmailStats(
    senderId ? String(senderId) : undefined
  );
  res.json(stats);
}
