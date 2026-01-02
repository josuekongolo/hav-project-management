import { z } from 'zod';

export const labelSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  createdAt: z.date(),
});

export type Label = z.infer<typeof labelSchema>;

export const createLabelSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color (e.g., #FF5733)'),
});

export type CreateLabelDto = z.infer<typeof createLabelSchema>;

export const updateLabelSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export type UpdateLabelDto = z.infer<typeof updateLabelSchema>;
