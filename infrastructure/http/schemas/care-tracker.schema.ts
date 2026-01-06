import { z } from '@hono/zod-openapi'

export const TaskTypeSchema = z.enum(['WATER', 'FERTILIZE', 'PRUNE', 'REPOTTING', 'OTHER']).openapi({
  example: 'WATER',
  description: 'Type of care task',
})

export const CreateScheduleSchema = z.object({
  plantId: z.string().trim().uuid().or(z.string().cuid()).openapi({ example: 'plant_123' }),
  taskType: TaskTypeSchema,
  frequencyDays: z.number().int().positive().openapi({ example: 7, description: 'Frequency in days' }),
  nextDueDate: z.string().datetime().openapi({ example: '2023-11-01T10:00:00Z' }),
  notes: z.string().trim().max(500).optional().openapi({ example: 'Water thoroughly' }),
})

export const MarkTaskCompleteSchema = z.object({
  completedAt: z.string().datetime().optional().openapi({ example: '2023-11-01T10:00:00Z' }),
  notes: z.string().trim().max(500).optional().openapi({ example: 'Done' }),
})

export const GenerateScheduleSchema = z.object({
  plantIds: z.array(z.string().trim().uuid().or(z.string().cuid())).min(1).openapi({ example: ['plant_123'] }),
})
