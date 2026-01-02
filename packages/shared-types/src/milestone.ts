import { z } from 'zod';

export enum MilestoneStatus {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export const milestoneSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable(),
  startDate: z.date(),
  endDate: z.date(),
  status: z.nativeEnum(MilestoneStatus),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Milestone = z.infer<typeof milestoneSchema>;

export const createMilestoneSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  status: z.nativeEnum(MilestoneStatus).default(MilestoneStatus.PLANNED),
});

export type CreateMilestoneDto = z.infer<typeof createMilestoneSchema>;

export const updateMilestoneSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.nativeEnum(MilestoneStatus).optional(),
});

export type UpdateMilestoneDto = z.infer<typeof updateMilestoneSchema>;
