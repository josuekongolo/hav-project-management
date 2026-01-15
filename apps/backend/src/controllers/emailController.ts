import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import * as emailHistoryService from '../services/emailHistoryService.js';

export async function getEmails(req: AuthRequest, res: Response) {
  try {
    const { contactId, senderId } = req.query;

    const emails = await emailHistoryService.getEmails(
      contactId ? String(contactId) : undefined,
      senderId ? String(senderId) : undefined
    );

    res.json({ emails });
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch emails' });
  }
}

export async function getEmailById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const email = await emailHistoryService.getEmailById(id);
    res.json({ email });
  } catch (error) {
    console.error('Error fetching email:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch email' });
  }
}

export async function sendEmail(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const email = await emailHistoryService.sendEmail(req.body, userId);
    res.status(201).json({ email });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to send email' });
  }
}

export async function sendEmailWithTemplate(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const email = await emailHistoryService.sendEmailWithTemplate(req.body, userId);
    res.status(201).json({ email });
  } catch (error) {
    console.error('Error sending email with template:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to send email with template' });
  }
}

export async function sendBulkEmails(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const results = await emailHistoryService.sendBulkEmails(req.body, userId);
    res.json(results);
  } catch (error) {
    console.error('Error sending bulk emails:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to send bulk emails' });
  }
}

export async function saveDraft(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const draft = await emailHistoryService.saveDraft(req.body, userId);
    res.status(201).json({ draft });
  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to save draft' });
  }
}

export async function deleteEmail(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const result = await emailHistoryService.deleteEmail(id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting email:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete email' });
  }
}

export async function bulkDeleteEmails(req: AuthRequest, res: Response) {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: 'ids array is required' });
      return;
    }
    const result = await emailHistoryService.bulkDeleteEmails(ids);
    res.json(result);
  } catch (error) {
    console.error('Error bulk deleting emails:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to bulk delete emails' });
  }
}

export async function trackEmailOpen(req: AuthRequest, res: Response) {
  try {
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
  } catch (error) {
    console.error('Error tracking email open:', error);
    res.status(500).json({ error: 'Failed to track email open' });
  }
}

export async function trackEmailClick(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { url } = req.query;

    await emailHistoryService.trackEmailClick(id);

    // Redirect to the actual URL
    if (url && typeof url === 'string') {
      res.redirect(url);
    } else {
      res.status(400).json({ error: 'URL parameter required' });
    }
  } catch (error) {
    console.error('Error tracking email click:', error);
    res.status(500).json({ error: 'Failed to track email click' });
  }
}

export async function getEmailStats(req: AuthRequest, res: Response) {
  try {
    const { senderId } = req.query;
    const stats = await emailHistoryService.getEmailStats(
      senderId ? String(senderId) : undefined
    );
    res.json(stats);
  } catch (error) {
    console.error('Error fetching email stats:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch email stats' });
  }
}
