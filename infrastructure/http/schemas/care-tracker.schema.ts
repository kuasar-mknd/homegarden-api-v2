import { z } from '@hono/zod-openapi'

export const CreateScheduleSchema = z.object({
  plantId: z.string().uuid(),
  taskType: z.string(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  startDate: z.string().datetime().or(z.date()),
  notes: z.string().optional(),
})

export const CompleteTaskSchema = z.object({
  notes: z.string().optional(),
  completedAt: z.string().datetime().or(z.date()).optional(),
})

export const GenerateScheduleSchema = z.object({
  plantId: z.string().uuid(),
  strategies: z.array(z.string()).optional(),
})
