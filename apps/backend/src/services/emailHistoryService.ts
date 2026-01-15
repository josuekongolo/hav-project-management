import { PrismaClient } from '@prisma/client';
import { emailService } from './emailService.js';
import * as emailTemplateService from './emailTemplateService.js';

const prisma = new PrismaClient();

export interface SendEmailData {
  contactId?: string;
  to: string | string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  htmlBody?: string;
  templateId?: string;
}

export interface SendEmailWithTemplateData {
  contactId?: string;
  to: string | string[];
  cc?: string[];
  bcc?: string[];
  templateId: string;
  variables: { [key: string]: string };
}

export interface BulkEmailData {
  contactIds: string[];
  templateId: string;
  customVariables?: { [contactId: string]: { [key: string]: string } };
}

export async function getEmails(contactId?: string, senderId?: string) {
  const where: any = {};

  if (contactId) {
    where.contactId = contactId;
  }

  if (senderId) {
    where.senderId = senderId;
  }

  const emails = await prisma.email.findMany({
    where,
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      template: {
        select: {
          id: true,
          name: true,
          category: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return emails;
}

export async function getEmailById(id: string) {
  const email = await prisma.email.findUnique({
    where: { id },
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      template: {
        select: {
          id: true,
          name: true,
          category: true,
        },
      },
    },
  });

  if (!email) {
    throw new Error('Email not found');
  }

  return email;
}

export async function sendEmail(data: SendEmailData, userId: string) {
  // Create email record
  const emailRecord = await prisma.email.create({
    data: {
      subject: data.subject,
      body: data.body,
      htmlBody: data.htmlBody,
      from: process.env.SMTP_FROM || process.env.SMTP_USER || '',
      to: Array.isArray(data.to) ? data.to : [data.to],
      cc: data.cc || [],
      bcc: data.bcc || [],
      status: 'SENDING',
      contactId: data.contactId,
      senderId: userId,
      templateId: data.templateId,
    },
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  try {
    // Send email via SMTP
    await emailService.sendEmail({
      to: data.to,
      cc: data.cc,
      bcc: data.bcc,
      subject: data.subject,
      text: data.body,
      html: data.htmlBody,
    });

    // Update status to SENT
    const updatedEmail = await prisma.email.update({
      where: { id: emailRecord.id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Log activity if linked to contact
    if (data.contactId) {
      await prisma.activity.create({
        data: {
          type: 'EMAIL_SENT',
          title: 'Email sent',
          description: `Email sent: ${data.subject}`,
          contactId: data.contactId,
          userId,
        },
      });
    }

    return updatedEmail;
  } catch (error) {
    // Update status to FAILED
    await prisma.email.update({
      where: { id: emailRecord.id },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function sendEmailWithTemplate(data: SendEmailWithTemplateData, userId: string) {
  // Render template with variables
  const rendered = await emailTemplateService.renderTemplate(data.templateId, data.variables);

  // Send email
  return await sendEmail(
    {
      contactId: data.contactId,
      to: data.to,
      cc: data.cc,
      bcc: data.bcc,
      subject: rendered.subject,
      body: rendered.body,
      htmlBody: rendered.htmlBody,
      templateId: data.templateId,
    },
    userId
  );
}

export async function sendBulkEmails(data: BulkEmailData, userId: string) {
  const results = {
    total: data.contactIds.length,
    sent: 0,
    failed: 0,
    errors: [] as { contactId: string; error: string }[],
  };

  // Fetch contacts with company relation
  const contacts = await prisma.contact.findMany({
    where: {
      id: { in: data.contactIds },
    },
    include: {
      companyRel: {
        select: {
          name: true,
        },
      },
    },
  });

  // Send email to each contact
  for (const contact of contacts) {
    try {
      // Get company name from either the company field or companyRel
      const companyName = contact.company || contact.companyRel?.name || '';

      console.log(`[BulkEmail] Contact: ${contact.firstName} ${contact.lastName}`);
      console.log(`[BulkEmail] - company field: "${contact.company}"`);
      console.log(`[BulkEmail] - companyRel: ${JSON.stringify(contact.companyRel)}`);
      console.log(`[BulkEmail] - resolved companyName: "${companyName}"`);

      // Build variables with all useful contact data
      const variables = {
        firstName: contact.firstName,
        lastName: contact.lastName,
        fullName: `${contact.firstName} ${contact.lastName}`,
        name: contact.firstName, // Alias for firstName
        email: contact.email,
        company: companyName,
        companyName: companyName, // Alias
        phone: contact.phone || '',
        city: contact.city || '',
        country: contact.country || '',
        ...(data.customVariables?.[contact.id] || {}),
      };

      console.log(`[BulkEmail] Variables being sent:`, JSON.stringify(variables, null, 2));

      await sendEmailWithTemplate(
        {
          contactId: contact.id,
          to: contact.email,
          templateId: data.templateId,
          variables,
        },
        userId
      );

      results.sent++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        contactId: contact.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

export async function saveDraft(data: SendEmailData, userId: string) {
  const draft = await prisma.email.create({
    data: {
      subject: data.subject,
      body: data.body,
      htmlBody: data.htmlBody,
      from: process.env.SMTP_FROM || process.env.SMTP_USER || '',
      to: Array.isArray(data.to) ? data.to : [data.to],
      cc: data.cc || [],
      bcc: data.bcc || [],
      status: 'DRAFT',
      contactId: data.contactId,
      senderId: userId,
      templateId: data.templateId,
    },
  });

  return draft;
}

export async function deleteEmail(id: string) {
  const email = await prisma.email.findUnique({ where: { id } });
  if (!email) {
    throw new Error('Email not found');
  }

  await prisma.email.delete({
    where: { id },
  });

  return { message: 'Email deleted successfully' };
}

export async function trackEmailOpen(id: string) {
  const email = await prisma.email.findUnique({ where: { id } });
  if (!email) {
    return;
  }

  // Only track the first open
  if (!email.openedAt) {
    await prisma.email.update({
      where: { id },
      data: {
        status: 'OPENED',
        openedAt: new Date(),
      },
    });

    // Log activity if linked to contact
    if (email.contactId) {
      await prisma.activity.create({
        data: {
          type: 'EMAIL_OPENED',
          title: 'Email opened',
          description: `Email opened: ${email.subject}`,
          contactId: email.contactId,
          userId: email.senderId,
        },
      });
    }
  }
}

export async function trackEmailClick(id: string) {
  const email = await prisma.email.findUnique({ where: { id } });
  if (!email) {
    return;
  }

  // Only track the first click
  if (!email.clickedAt) {
    await prisma.email.update({
      where: { id },
      data: {
        status: 'CLICKED',
        clickedAt: new Date(),
      },
    });

    // Log activity if linked to contact
    if (email.contactId) {
      await prisma.activity.create({
        data: {
          type: 'EMAIL_CLICKED',
          title: 'Email clicked',
          description: `Email link clicked: ${email.subject}`,
          contactId: email.contactId,
          userId: email.senderId,
        },
      });
    }
  }
}

export async function getEmailStats(senderId?: string) {
  const where: any = {};
  if (senderId) {
    where.senderId = senderId;
  }

  const [
    totalEmails,
    sentEmails,
    openedEmails,
    clickedEmails,
    failedEmails,
    draftEmails,
  ] = await Promise.all([
    prisma.email.count({ where }),
    prisma.email.count({ where: { ...where, status: { in: ['SENT', 'OPENED', 'CLICKED'] } } }),
    prisma.email.count({ where: { ...where, openedAt: { not: null } } }),
    prisma.email.count({ where: { ...where, clickedAt: { not: null } } }),
    prisma.email.count({ where: { ...where, status: 'FAILED' } }),
    prisma.email.count({ where: { ...where, status: 'DRAFT' } }),
  ]);

  const openRate = sentEmails > 0 ? (openedEmails / sentEmails) * 100 : 0;
  const clickRate = sentEmails > 0 ? (clickedEmails / sentEmails) * 100 : 0;
  const clickThroughRate = openedEmails > 0 ? (clickedEmails / openedEmails) * 100 : 0;

  return {
    totalEmails,
    sentEmails,
    openedEmails,
    clickedEmails,
    failedEmails,
    draftEmails,
    openRate,
    clickRate,
    clickThroughRate,
  };
}
