import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import * as contactService from '../services/contactService.js';
import { ContactStatus } from '@prisma/client';

export async function getContacts(req: AuthRequest, res: Response) {
  const { status, assignedToId, search } = req.query;

  const filters: contactService.ContactFilters = {};

  if (status && typeof status === 'string') {
    filters.status = status as ContactStatus;
  }

  if (assignedToId && typeof assignedToId === 'string') {
    filters.assignedToId = assignedToId;
  }

  if (search && typeof search === 'string') {
    filters.search = search;
  }

  const contacts = await contactService.getContacts(filters);
  res.json({ contacts });
}

export async function getContactById(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const contact = await contactService.getContactById(id);
  res.json({ contact });
}

export async function createContact(req: AuthRequest, res: Response) {
  const userId = req.userId!;
  const contact = await contactService.createContact(req.body, userId);
  res.status(201).json({ contact });
}

export async function updateContact(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const userId = req.userId!;
  const contact = await contactService.updateContact(id, req.body, userId);
  res.json({ contact });
}

export async function deleteContact(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const result = await contactService.deleteContact(id);
  res.json(result);
}

export async function getContactActivities(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const activities = await contactService.getContactActivities(id);
  res.json({ activities });
}

export async function getContactEmails(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const emails = await contactService.getContactEmails(id);
  res.json({ emails });
}

export async function getContactTasks(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const tasks = await contactService.getContactTasks(id);
  res.json({ tasks });
}

export async function exportContactsToCSV(req: AuthRequest, res: Response) {
  const { status, assignedToId, search } = req.query;

  const filters: contactService.ContactFilters = {};

  if (status && typeof status === 'string') {
    filters.status = status as ContactStatus;
  }

  if (assignedToId && typeof assignedToId === 'string') {
    filters.assignedToId = assignedToId;
  }

  if (search && typeof search === 'string') {
    filters.search = search;
  }

  const csv = await contactService.exportContactsToCSV(filters);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
  res.send(csv);
}
