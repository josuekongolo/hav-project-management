import { PrismaClient, ContactStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  companyId?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  status?: ContactStatus;
  source?: string;
  notes?: string;
  assignedToId?: string;
}

export interface UpdateContactData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  companyId?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  status?: ContactStatus;
  source?: string;
  notes?: string;
  assignedToId?: string;
}

export interface ContactFilters {
  status?: ContactStatus;
  assignedToId?: string;
  search?: string;
}

export async function getContacts(filters?: ContactFilters) {
  const where: any = {};

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.assignedToId) {
    where.assignedToId = filters.assignedToId;
  }

  if (filters?.search) {
    where.OR = [
      { firstName: { contains: filters.search, mode: 'insensitive' } },
      { lastName: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
      { company: { contains: filters.search, mode: 'insensitive' } },
      { companyRel: { name: { contains: filters.search, mode: 'insensitive' } } },
    ];
  }

  const contacts = await prisma.contact.findMany({
    where,
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      companyRel: {
        select: {
          id: true,
          name: true,
          industry: true,
          logo: true,
        },
      },
      _count: {
        select: {
          deals: true,
          emails: true,
          tasks: true,
          activities: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return contacts;
}

export async function getContactById(id: string) {
  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      companyRel: {
        select: {
          id: true,
          name: true,
          industry: true,
          website: true,
          logo: true,
        },
      },
      deals: {
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      emails: {
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
      tasks: {
        include: {
          assignees: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
      activities: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
      },
    },
  });

  if (!contact) {
    throw new Error('Contact not found');
  }

  return contact;
}

export async function createContact(data: CreateContactData, userId: string) {
  // Normalize email to lowercase
  const normalizedEmail = data.email.toLowerCase().trim();

  // Check if email already exists
  const existingContact = await prisma.contact.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingContact) {
    throw new Error('A contact with this email already exists');
  }

  const contact = await prisma.contact.create({
    data: {
      ...data,
      email: normalizedEmail,
    },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });

  // Log activity
  await prisma.activity.create({
    data: {
      type: 'NOTE_ADDED',
      title: 'Contact created',
      description: `${data.firstName} ${data.lastName} was added to contacts`,
      contactId: contact.id,
      userId,
    },
  });

  return contact;
}

export async function updateContact(id: string, data: UpdateContactData, userId: string) {
  // If email is being updated, normalize it and check for duplicates
  if (data.email) {
    const normalizedEmail = data.email.toLowerCase().trim();
    const existingContact = await prisma.contact.findFirst({
      where: {
        email: normalizedEmail,
        NOT: { id },
      },
    });

    if (existingContact) {
      throw new Error('A contact with this email already exists');
    }

    data.email = normalizedEmail;
  }

  const oldContact = await prisma.contact.findUnique({ where: { id } });
  if (!oldContact) {
    throw new Error('Contact not found');
  }

  const contact = await prisma.contact.update({
    where: { id },
    data,
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });

  // Log status change activity
  if (data.status && data.status !== oldContact.status) {
    await prisma.activity.create({
      data: {
        type: 'STATUS_CHANGED',
        title: 'Status updated',
        description: `Contact status changed from ${oldContact.status} to ${data.status}`,
        contactId: contact.id,
        userId,
      },
    });
  }

  return contact;
}

export async function deleteContact(id: string) {
  const contact = await prisma.contact.findUnique({ where: { id } });
  if (!contact) {
    throw new Error('Contact not found');
  }

  await prisma.contact.delete({
    where: { id },
  });

  return { message: 'Contact deleted successfully' };
}

export async function getContactActivities(id: string) {
  const activities = await prisma.activity.findMany({
    where: { contactId: id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return activities;
}

export async function getContactEmails(id: string) {
  const emails = await prisma.email.findMany({
    where: { contactId: id },
    include: {
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

export async function getContactTasks(id: string) {
  const tasks = await prisma.task.findMany({
    where: { contactId: id },
    include: {
      assignees: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      },
      labels: {
        include: {
          label: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return tasks;
}

export async function exportContactsToCSV(filters: ContactFilters = {}): Promise<string> {
  const contacts = await getContacts(filters);

  // CSV header
  const header = [
    'First Name',
    'Last Name',
    'Email',
    'Phone',
    'Company',
    'Website',
    'Address',
    'City',
    'Country',
    'Status',
    'Source',
    'Assigned To',
    'Created At',
  ].join(',');

  // CSV rows
  const rows = contacts.map((contact: any) => {
    return [
      escapeCSV(contact.firstName),
      escapeCSV(contact.lastName),
      escapeCSV(contact.email),
      escapeCSV(contact.phone || ''),
      escapeCSV(contact.company || ''),
      escapeCSV(contact.website || ''),
      escapeCSV(contact.address || ''),
      escapeCSV(contact.city || ''),
      escapeCSV(contact.country || ''),
      escapeCSV(contact.status),
      escapeCSV(contact.source || ''),
      escapeCSV(contact.assignedTo?.name || ''),
      escapeCSV(new Date(contact.createdAt).toISOString()),
    ].join(',');
  });

  return [header, ...rows].join('\n');
}

function escapeCSV(value: string): string {
  // Escape double quotes and wrap in quotes if contains comma, newline, or quotes
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
