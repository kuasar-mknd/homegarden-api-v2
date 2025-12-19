import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const uuidSchema = z.string().uuid().or(z.string().cuid());

export const idParamSchema = z.object({
  id: uuidSchema,
});
