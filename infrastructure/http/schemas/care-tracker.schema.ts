import { z } from '@hono/zod-openapi'

export const CreateScheduleInputSchema = z.object({
  plantId: z.string().trim().uuid().or(z.string().cuid()),
  taskType: z.enum(['WATER', 'FERTILIZE', 'PRUNE']),
  frequencyDays: z.number().int().positive(),
  nextDueDate: z.string().datetime(),
})

export const MarkTaskCompleteInputSchema = z.object({
  completedAt: z.string().datetime(),
  notes: z.string().trim().max(500).optional(),
})

export const ScheduleResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.string(),
    plantId: z.string(),
    taskType: z.string(),
    nextDueDate: z.string(),
  }),
})

export const ErrorSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  error: z.string().openapi({ example: 'BAD_REQUEST' }),
  message: z.string().openapi({ example: 'Invalid input' }),
})
