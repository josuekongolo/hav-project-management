import { Request, Response } from 'express';
import * as contactService from '../services/contactService.js';
import { ContactStatus } from '@prisma/client';

export async function getContacts(req: Request, res: Response) {
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

export async function getContactById(req: Request, res: Response) {
  const { id } = req.params;
  const contact = await contactService.getContactById(id);
  res.json({ contact });
}

export async function createContact(req: Request, res: Response) {
  const userId = req.user!.id;
  const contact = await contactService.createContact(req.body, userId);
  res.status(201).json({ contact });
}

export async function updateContact(req: Request, res: Response) {
  const { id } = req.params;
  const userId = req.user!.id;
  const contact = await contactService.updateContact(id, req.body, userId);
  res.json({ contact });
}

export async function deleteContact(req: Request, res: Response) {
  const { id } = req.params;
  const result = await contactService.deleteContact(id);
  res.json(result);
}

export async function getContactActivities(req: Request, res: Response) {
  const { id } = req.params;
  const activities = await contactService.getContactActivities(id);
  res.json({ activities });
}

export async function getContactEmails(req: Request, res: Response) {
  const { id } = req.params;
  const emails = await contactService.getContactEmails(id);
  res.json({ emails });
}

export async function getContactTasks(req: Request, res: Response) {
  const { id } = req.params;
  const tasks = await contactService.getContactTasks(id);
  res.json({ tasks });
}
