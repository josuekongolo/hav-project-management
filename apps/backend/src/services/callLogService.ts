import { PrismaClient, CallDirection } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateCallLogData {
  subject: string;
  notes?: string;
  duration?: number;
  direction: CallDirection;
  outcome?: string;
  scheduledAt?: Date;
  completedAt?: Date;
  userId: string;
  contactId?: string;
  dealId?: string;
  companyId?: string;
}

export interface UpdateCallLogData {
  subject?: string;
  notes?: string;
  duration?: number;
  direction?: CallDirection;
  outcome?: string;
  scheduledAt?: Date;
  completedAt?: Date;
}

export async function createCallLog(data: CreateCallLogData) {
  const { userId, contactId, dealId, companyId, ...callData } = data;

  // Verify related entities exist
  if (contactId) {
    const contact = await prisma.contact.findUnique({ where: { id: contactId } });
    if (!contact) {
      throw new Error('Contact not found');
    }
  }

  if (dealId) {
    const deal = await prisma.deal.findUnique({ where: { id: dealId } });
    if (!deal) {
      throw new Error('Deal not found');
    }
  }

  if (companyId) {
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      throw new Error('Company not found');
    }
  }

  const callLog = await prisma.callLog.create({
    data: {
      ...callData,
      userId,
      contactId,
      dealId,
      companyId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      deal: {
        select: {
          id: true,
          title: true,
        },
      },
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Log activity
  if (contactId) {
    await prisma.activity.create({
      data: {
        type: 'CALL_MADE',
        title: 'Call logged',
        description: `${data.direction} call: ${data.subject}`,
        contactId,
        userId,
      },
    });
  }

  return callLog;
}

export async function getCallLogsByEntity(
  entityType: 'contact' | 'deal' | 'company',
  entityId: string
) {
  const where: any = {};

  if (entityType === 'contact') {
    where.contactId = entityId;
  } else if (entityType === 'deal') {
    where.dealId = entityId;
  } else if (entityType === 'company') {
    where.companyId = entityId;
  }

  const callLogs = await prisma.callLog.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      deal: {
        select: {
          id: true,
          title: true,
        },
      },
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return callLogs;
}

export async function getCallLogById(id: string) {
  const callLog = await prisma.callLog.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      deal: {
        select: {
          id: true,
          title: true,
        },
      },
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!callLog) {
    throw new Error('Call log not found');
  }

  return callLog;
}

export async function updateCallLog(id: string, data: UpdateCallLogData, userId: string) {
  const callLog = await prisma.callLog.findUnique({ where: { id } });
  if (!callLog) {
    throw new Error('Call log not found');
  }

  // Verify the user is the owner
  if (callLog.userId !== userId) {
    throw new Error('You can only edit your own call logs');
  }

  const updatedCallLog = await prisma.callLog.update({
    where: { id },
    data,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      deal: {
        select: {
          id: true,
          title: true,
        },
      },
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return updatedCallLog;
}

export async function deleteCallLog(id: string, userId: string) {
  const callLog = await prisma.callLog.findUnique({ where: { id } });
  if (!callLog) {
    throw new Error('Call log not found');
  }

  // Verify the user is the owner
  if (callLog.userId !== userId) {
    throw new Error('You can only delete your own call logs');
  }

  await prisma.callLog.delete({
    where: { id },
  });

  return { message: 'Call log deleted successfully' };
}
