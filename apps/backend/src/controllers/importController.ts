import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import * as importService from '../services/importService.js';

export async function previewImport(req: AuthRequest, res: Response) {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const parsed = importService.parseCSV(req.file.buffer);

    if (parsed.totalRows === 0) {
      res.status(400).json({ error: 'CSV file is empty' });
      return;
    }

    const preview = importService.getPreviewData(parsed);
    res.json(preview);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to parse CSV file',
    });
  }
}

export async function importContacts(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const { data, mapping } = req.body;

    if (!data || !Array.isArray(data)) {
      res.status(400).json({ error: 'Data array is required' });
      return;
    }

    if (!mapping || typeof mapping !== 'object') {
      res.status(400).json({ error: 'Column mapping is required' });
      return;
    }

    const result = await importService.importContacts(data, mapping, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to import contacts',
    });
  }
}

export async function importCompanies(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const { data, mapping } = req.body;

    if (!data || !Array.isArray(data)) {
      res.status(400).json({ error: 'Data array is required' });
      return;
    }

    if (!mapping || typeof mapping !== 'object') {
      res.status(400).json({ error: 'Column mapping is required' });
      return;
    }

    const result = await importService.importCompanies(data, mapping, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to import companies',
    });
  }
}

export async function importDeals(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const { data, mapping } = req.body;

    if (!data || !Array.isArray(data)) {
      res.status(400).json({ error: 'Data array is required' });
      return;
    }

    if (!mapping || typeof mapping !== 'object') {
      res.status(400).json({ error: 'Column mapping is required' });
      return;
    }

    const result = await importService.importDeals(data, mapping, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to import deals',
    });
  }
}

export async function importTasks(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const { data, mapping } = req.body;

    if (!data || !Array.isArray(data)) {
      res.status(400).json({ error: 'Data array is required' });
      return;
    }

    if (!mapping || typeof mapping !== 'object') {
      res.status(400).json({ error: 'Column mapping is required' });
      return;
    }

    const result = await importService.importTasks(data, mapping, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to import tasks',
    });
  }
}

export async function downloadTemplate(req: AuthRequest, res: Response) {
  try {
    const { entity } = req.params;

    if (!['contacts', 'companies', 'deals', 'tasks'].includes(entity)) {
      res.status(400).json({ error: 'Invalid entity type' });
      return;
    }

    const csv = importService.generateTemplate(entity as 'contacts' | 'companies' | 'deals' | 'tasks');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${entity}_template.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate template',
    });
  }
}

export async function getEntityFields(req: AuthRequest, res: Response) {
  try {
    const { entity } = req.params;

    if (!['contacts', 'companies', 'deals', 'tasks'].includes(entity)) {
      res.status(400).json({ error: 'Invalid entity type' });
      return;
    }

    const fields = importService.ENTITY_FIELDS[entity as keyof typeof importService.ENTITY_FIELDS];
    res.json({ fields });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get entity fields',
    });
  }
}
