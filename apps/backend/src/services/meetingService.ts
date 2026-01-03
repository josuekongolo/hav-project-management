import { PrismaClient, MeetingStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateMeetingData {
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  status?: MeetingStatus;
  notes?: string;
  organizerId: string;
  contactId?: string;
  dealId?: string;
  companyId?: string;
}

export interface UpdateMeetingData {
  title?: string;
  description?: string;
  location?: string;
  startTime?: Date;
  endTime?: Date;
  status?: MeetingStatus;
  notes?: string;
}

export async function createMeeting(data: CreateMeetingData) {
  const { organizerId, contactId, dealId, companyId, ...meetingData } = data;

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

  const meeting = await prisma.meeting.create({
    data: {
      ...meetingData,
      organizerId,
      contactId,
      dealId,
      companyId,
    },
    include: {
      organizer: {
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
        type: 'MEETING_SCHEDULED',
        title: 'Meeting scheduled',
        description: `${data.title} scheduled for ${data.startTime.toLocaleDateString()}`,
        contactId,
        userId: organizerId,
      },
    });
  }

  return meeting;
}

export async function getMeetingsByEntity(
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

  const meetings = await prisma.meeting.findMany({
    where,
    include: {
      organizer: {
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
      startTime: 'desc',
    },
  });

  return meetings;
}

export async function getMeetingById(id: string) {
  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: {
      organizer: {
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

  if (!meeting) {
    throw new Error('Meeting not found');
  }

  return meeting;
}

export async function updateMeeting(id: string, data: UpdateMeetingData, userId: string) {
  const meeting = await prisma.meeting.findUnique({ where: { id } });
  if (!meeting) {
    throw new Error('Meeting not found');
  }

  // Verify the user is the organizer
  if (meeting.organizerId !== userId) {
    throw new Error('You can only edit meetings you organized');
  }

  const updatedMeeting = await prisma.meeting.update({
    where: { id },
    data,
    include: {
      organizer: {
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

  return updatedMeeting;
}

export async function deleteMeeting(id: string, userId: string) {
  const meeting = await prisma.meeting.findUnique({ where: { id } });
  if (!meeting) {
    throw new Error('Meeting not found');
  }

  // Verify the user is the organizer
  if (meeting.organizerId !== userId) {
    throw new Error('You can only delete meetings you organized');
  }

  await prisma.meeting.delete({
    where: { id },
  });

  return { message: 'Meeting deleted successfully' };
}

export async function getMeetingsByUser(userId: string, filters?: {
  status?: MeetingStatus;
  startDate?: Date;
  endDate?: Date;
}) {
  const where: any = {
    organizerId: userId,
  };

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.startDate || filters?.endDate) {
    where.startTime = {};
    if (filters.startDate) {
      where.startTime.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.startTime.lte = filters.endDate;
    }
  }

  const meetings = await prisma.meeting.findMany({
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
      startTime: 'asc',
    },
  });

  return meetings;
}
