import { Request, Response } from 'express';
import * as emailTemplateService from '../services/emailTemplateService.js';
import { EmailTemplateCategory } from '@prisma/client';

export async function getEmailTemplates(req: Request, res: Response) {
  const { category } = req.query;

  const categoryFilter = category && typeof category === 'string'
    ? (category as EmailTemplateCategory)
    : undefined;

  const templates = await emailTemplateService.getEmailTemplates(categoryFilter);
  res.json({ templates });
}

export async function getEmailTemplateById(req: Request, res: Response) {
  const { id } = req.params;
  const template = await emailTemplateService.getEmailTemplateById(id);
  res.json({ template });
}

export async function createEmailTemplate(req: Request, res: Response) {
  const template = await emailTemplateService.createEmailTemplate(req.body);
  res.status(201).json({ template });
}

export async function updateEmailTemplate(req: Request, res: Response) {
  const { id } = req.params;
  const template = await emailTemplateService.updateEmailTemplate(id, req.body);
  res.json({ template });
}

export async function deleteEmailTemplate(req: Request, res: Response) {
  const { id } = req.params;
  const result = await emailTemplateService.deleteEmailTemplate(id);
  res.json(result);
}

export async function renderTemplate(req: Request, res: Response) {
  const { id } = req.params;
  const { variables } = req.body;

  const rendered = await emailTemplateService.renderTemplate(id, variables || {});
  res.json(rendered);
}
