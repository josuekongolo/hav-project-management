import { PrismaClient, EmailTemplateCategory } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateEmailTemplateData {
  name: string;
  subject: string;
  body: string;
  htmlBody?: string;
  category: EmailTemplateCategory;
  variables?: string[];
  isActive?: boolean;
}

export interface UpdateEmailTemplateData {
  name?: string;
  subject?: string;
  body?: string;
  htmlBody?: string;
  category?: EmailTemplateCategory;
  variables?: string[];
  isActive?: boolean;
}

export interface TemplateVariables {
  [key: string]: string;
}

export async function getEmailTemplates(category?: EmailTemplateCategory) {
  const where: any = {};

  if (category) {
    where.category = category;
  }

  const templates = await prisma.emailTemplate.findMany({
    where,
    include: {
      _count: {
        select: {
          emails: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return templates;
}

export async function getEmailTemplateById(id: string) {
  const template = await prisma.emailTemplate.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          emails: true,
        },
      },
    },
  });

  if (!template) {
    throw new Error('Email template not found');
  }

  return template;
}

export async function createEmailTemplate(data: CreateEmailTemplateData) {
  // Extract variables from template
  const extractedVariables = extractVariables(data.body);

  const template = await prisma.emailTemplate.create({
    data: {
      ...data,
      variables: data.variables || extractedVariables,
    },
  });

  return template;
}

export async function updateEmailTemplate(id: string, data: UpdateEmailTemplateData) {
  const template = await prisma.emailTemplate.findUnique({ where: { id } });
  if (!template) {
    throw new Error('Email template not found');
  }

  // If body is updated, extract variables
  if (data.body) {
    const extractedVariables = extractVariables(data.body);
    data.variables = data.variables || extractedVariables;
  }

  const updatedTemplate = await prisma.emailTemplate.update({
    where: { id },
    data,
  });

  return updatedTemplate;
}

export async function deleteEmailTemplate(id: string) {
  const template = await prisma.emailTemplate.findUnique({ where: { id } });
  if (!template) {
    throw new Error('Email template not found');
  }

  await prisma.emailTemplate.delete({
    where: { id },
  });

  return { message: 'Email template deleted successfully' };
}

/**
 * Replace variables in template with actual values
 * Variables format: {{variableName}}
 */
export function replaceVariables(template: string, variables: TemplateVariables): string {
  let result = template;

  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, variables[key] || '');
  });

  return result;
}

/**
 * Extract variable names from template
 * Returns array of variable names found in {{variableName}} format
 */
export function extractVariables(template: string): string[] {
  const regex = /{{(\w+)}}/g;
  const matches = template.matchAll(regex);
  const variables = new Set<string>();

  for (const match of matches) {
    variables.add(match[1]);
  }

  return Array.from(variables);
}

/**
 * Render template with variables
 * Returns both subject and body with variables replaced
 */
export async function renderTemplate(
  templateId: string,
  variables: TemplateVariables
): Promise<{ subject: string; body: string; htmlBody?: string }> {
  const template = await getEmailTemplateById(templateId);

  return {
    subject: replaceVariables(template.subject, variables),
    body: replaceVariables(template.body, variables),
    htmlBody: template.htmlBody ? replaceVariables(template.htmlBody, variables) : undefined,
  };
}
