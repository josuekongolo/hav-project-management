import { PrismaClient, DealStage } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateDealData {
  title: string;
  description?: string;
  value: number;
  stage?: DealStage;
  probability?: number;
  expectedCloseDate?: Date;
  contactId: string;
  ownerId: string;
  companyId?: string;
}

export interface UpdateDealData {
  title?: string;
  description?: string;
  value?: number;
  stage?: DealStage;
  probability?: number;
  expectedCloseDate?: Date;
  closedDate?: Date;
  contactId?: string;
  ownerId?: string;
  companyId?: string;
}

export interface DealFilters {
  stage?: DealStage;
  ownerId?: string;
  contactId?: string;
}

export async function getDeals(filters?: DealFilters) {
  const where: any = {};

  if (filters?.stage) {
    where.stage = filters.stage;
  }

  if (filters?.ownerId) {
    where.ownerId = filters.ownerId;
  }

  if (filters?.contactId) {
    where.contactId = filters.contactId;
  }

  const deals = await prisma.deal.findMany({
    where,
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          company: true,
        },
      },
      owner: {
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
          tasks: true,
        },
      },
    },
    orderBy: [
      { stage: 'asc' },
      { createdAt: 'desc' },
    ],
  });

  return deals;
}

export async function getDealById(id: string) {
  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          company: true,
          phone: true,
        },
      },
      owner: {
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
      tasks: {
        include: {
          assignees: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!deal) {
    throw new Error('Deal not found');
  }

  return deal;
}

export async function createDeal(data: CreateDealData, userId: string) {
  const deal = await prisma.deal.create({
    data: {
      title: data.title,
      description: data.description,
      value: data.value,
      stage: data.stage || 'PROSPECT',
      probability: data.probability || 50,
      expectedCloseDate: data.expectedCloseDate,
      contactId: data.contactId,
      ownerId: data.ownerId,
      companyId: data.companyId,
    },
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          company: true,
        },
      },
      owner: {
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
    },
  });

  // Log activity
  await prisma.activity.create({
    data: {
      type: 'DEAL_CREATED',
      title: 'Deal created',
      description: `Deal created: ${data.title} ($${data.value})`,
      contactId: data.contactId,
      userId,
    },
  });

  return deal;
}

export async function updateDeal(id: string, data: UpdateDealData, userId: string) {
  const oldDeal = await prisma.deal.findUnique({ where: { id } });
  if (!oldDeal) {
    throw new Error('Deal not found');
  }

  const deal = await prisma.deal.update({
    where: { id },
    data,
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          company: true,
        },
      },
      owner: {
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
    },
  });

  // Log stage change activity
  if (data.stage && data.stage !== oldDeal.stage) {
    await prisma.activity.create({
      data: {
        type: 'STATUS_CHANGED',
        title: 'Deal stage updated',
        description: `Deal moved from ${oldDeal.stage} to ${data.stage}`,
        contactId: deal.contactId,
        userId,
      },
    });

    // Log deal won/lost
    if (data.stage === 'CLOSED_WON') {
      await prisma.activity.create({
        data: {
          type: 'DEAL_WON',
          title: 'Deal won',
          description: `Deal won: ${deal.title} ($${deal.value})`,
          contactId: deal.contactId,
          userId,
        },
      });
    } else if (data.stage === 'CLOSED_LOST') {
      await prisma.activity.create({
        data: {
          type: 'DEAL_LOST',
          title: 'Deal lost',
          description: `Deal lost: ${deal.title}`,
          contactId: deal.contactId,
          userId,
        },
      });
    }
  }

  return deal;
}

export async function deleteDeal(id: string) {
  const deal = await prisma.deal.findUnique({ where: { id } });
  if (!deal) {
    throw new Error('Deal not found');
  }

  await prisma.deal.delete({
    where: { id },
  });

  return { message: 'Deal deleted successfully' };
}

export async function updateDealStage(id: string, stage: DealStage, userId: string) {
  return await updateDeal(id, { stage }, userId);
}

export async function getDealStats(ownerId?: string) {
  const where: any = ownerId ? { ownerId } : {};

  const [
    totalDeals,
    totalValue,
    wonDeals,
    wonValue,
    lostDeals,
    dealsByStage,
  ] = await Promise.all([
    prisma.deal.count({ where }),
    prisma.deal.aggregate({
      where,
      _sum: { value: true },
    }),
    prisma.deal.count({
      where: { ...where, stage: 'CLOSED_WON' },
    }),
    prisma.deal.aggregate({
      where: { ...where, stage: 'CLOSED_WON' },
      _sum: { value: true },
    }),
    prisma.deal.count({
      where: { ...where, stage: 'CLOSED_LOST' },
    }),
    prisma.deal.groupBy({
      by: ['stage'],
      where,
      _count: true,
      _sum: { value: true },
    }),
  ]);

  return {
    totalDeals,
    totalValue: totalValue._sum.value || 0,
    wonDeals,
    wonValue: wonValue._sum.value || 0,
    lostDeals,
    winRate: totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0,
    dealsByStage: dealsByStage.map((item: any) => ({
      stage: item.stage,
      count: item._count,
      value: item._sum.value || 0,
    })),
  };
}
