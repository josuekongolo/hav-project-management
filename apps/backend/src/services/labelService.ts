import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateLabelData {
  name: string;
  color: string;
}

export interface UpdateLabelData {
  name?: string;
  color?: string;
}

export async function getAllLabels() {
  return await prisma.label.findMany({
    orderBy: {
      name: 'asc',
    },
  });
}

export async function getLabelById(labelId: string) {
  const label = await prisma.label.findUnique({
    where: { id: labelId },
  });

  if (!label) {
    throw new Error('Label not found');
  }

  return label;
}

export async function createLabel(data: CreateLabelData) {
  const existingLabel = await prisma.label.findUnique({
    where: { name: data.name },
  });

  if (existingLabel) {
    throw new Error('Label with this name already exists');
  }

  return await prisma.label.create({
    data: {
      name: data.name,
      color: data.color,
    },
  });
}

export async function updateLabel(labelId: string, data: UpdateLabelData) {
  const existingLabel = await prisma.label.findUnique({
    where: { id: labelId },
  });

  if (!existingLabel) {
    throw new Error('Label not found');
  }

  if (data.name && data.name !== existingLabel.name) {
    const nameConflict = await prisma.label.findUnique({
      where: { name: data.name },
    });

    if (nameConflict) {
      throw new Error('Label with this name already exists');
    }
  }

  return await prisma.label.update({
    where: { id: labelId },
    data: {
      name: data.name,
      color: data.color,
    },
  });
}

export async function deleteLabel(labelId: string) {
  const label = await prisma.label.findUnique({
    where: { id: labelId },
  });

  if (!label) {
    throw new Error('Label not found');
  }

  await prisma.label.delete({
    where: { id: labelId },
  });

  return { success: true };
}
