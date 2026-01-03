import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateCompanyData {
  name: string;
  industry?: string;
  website?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  employees?: number;
  revenue?: number;
  logo?: string;
}

export interface UpdateCompanyData {
  name?: string;
  industry?: string;
  website?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  employees?: number;
  revenue?: number;
  logo?: string;
}

export interface CompanyFilters {
  industry?: string;
  search?: string;
  minEmployees?: number;
  maxEmployees?: number;
  minRevenue?: number;
  maxRevenue?: number;
}

export async function getCompanies(filters?: CompanyFilters) {
  const where: any = {};

  if (filters?.industry) {
    where.industry = filters.industry;
  }

  if (filters?.minEmployees || filters?.maxEmployees) {
    where.employees = {};
    if (filters.minEmployees) {
      where.employees.gte = filters.minEmployees;
    }
    if (filters.maxEmployees) {
      where.employees.lte = filters.maxEmployees;
    }
  }

  if (filters?.minRevenue || filters?.maxRevenue) {
    where.revenue = {};
    if (filters.minRevenue) {
      where.revenue.gte = filters.minRevenue;
    }
    if (filters.maxRevenue) {
      where.revenue.lte = filters.maxRevenue;
    }
  }

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { industry: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
      { website: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const companies = await prisma.company.findMany({
    where,
    include: {
      _count: {
        select: {
          contacts: true,
          deals: true,
          notes: true,
          calls: true,
          meetings: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return companies;
}

export async function getCompanyById(id: string) {
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      contacts: {
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
        orderBy: {
          createdAt: 'desc',
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
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      notes: {
        include: {
          author: {
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
      },
      calls: {
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
      },
      meetings: {
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          startTime: 'desc',
        },
      },
      _count: {
        select: {
          contacts: true,
          deals: true,
          notes: true,
          calls: true,
          meetings: true,
        },
      },
    },
  });

  if (!company) {
    throw new Error('Company not found');
  }

  return company;
}

export async function createCompany(data: CreateCompanyData, userId: string) {
  // Check if company with same name already exists
  const existingCompany = await prisma.company.findFirst({
    where: {
      name: {
        equals: data.name,
        mode: 'insensitive',
      },
    },
  });

  if (existingCompany) {
    throw new Error('A company with this name already exists');
  }

  const company = await prisma.company.create({
    data,
    include: {
      _count: {
        select: {
          contacts: true,
          deals: true,
          notes: true,
          calls: true,
          meetings: true,
        },
      },
    },
  });

  // Log activity
  await prisma.activity.create({
    data: {
      type: 'NOTE_ADDED',
      title: 'Company created',
      description: `${data.name} was added to companies`,
      userId,
    },
  });

  return company;
}

export async function updateCompany(id: string, data: UpdateCompanyData) {
  // If name is being updated, check for duplicates
  if (data.name) {
    const existingCompany = await prisma.company.findFirst({
      where: {
        name: {
          equals: data.name,
          mode: 'insensitive',
        },
        NOT: { id },
      },
    });

    if (existingCompany) {
      throw new Error('A company with this name already exists');
    }
  }

  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) {
    throw new Error('Company not found');
  }

  const updatedCompany = await prisma.company.update({
    where: { id },
    data,
    include: {
      _count: {
        select: {
          contacts: true,
          deals: true,
          notes: true,
          calls: true,
          meetings: true,
        },
      },
    },
  });

  return updatedCompany;
}

export async function deleteCompany(id: string) {
  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) {
    throw new Error('Company not found');
  }

  await prisma.company.delete({
    where: { id },
  });

  return { message: 'Company deleted successfully' };
}

export async function searchCompanies(query: string) {
  const companies = await prisma.company.findMany({
    where: {
      name: {
        contains: query,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      name: true,
      industry: true,
      logo: true,
    },
    take: 10,
    orderBy: {
      name: 'asc',
    },
  });

  return companies;
}
