import { z } from '@hono/zod-openapi'

export const CreateCareScheduleSchema = z.object({
  plantId: z.string().uuid().openapi({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the plant',
  }),
  taskType: z.enum(['WATER', 'FERTILIZE', 'PRUNE', 'MIST', 'ROTATE', 'REPOT']).openapi({
    example: 'WATER',
    description: 'Type of care task',
  }),
  frequencyDays: z.number().int().min(1).max(365).openapi({
    example: 7,
    description: 'Frequency of the task in days',
  }),
  nextDueDate: z.string().datetime().openapi({
    example: '2023-01-08T00:00:00Z',
    description: 'Next due date for the task',
  }),
  notes: z.string().trim().max(500).optional().openapi({
    example: 'Water thoroughly until it drains',
    description: 'Additional notes for the task',
  }),
})

export const UpcomingTasksQuerySchema = z.object({
  gardenId: z.string().uuid().optional().openapi({
    param: {
      name: 'gardenId',
      in: 'query',
    },
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Filter tasks by garden ID',
  }),
  limit: z.coerce.number().int().min(1).max(100).default(20).openapi({
    param: {
      name: 'limit',
      in: 'query',
    },
    example: 20,
    description: 'Maximum number of tasks to return',
  }),
})

export const CompleteTaskSchema = z.object({
  completedAt: z.string().datetime().default(() => new Date().toISOString()).openapi({
    example: '2023-01-08T10:00:00Z',
    description: 'Date and time when the task was completed',
  }),
  notes: z.string().trim().max(500).optional().openapi({
    example: 'Plant looked thirsty',
    description: 'Notes about the completion',
  }),
})

export const GenerateScheduleSchema = z.object({
  plantId: z.string().uuid().openapi({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the plant to generate schedule for',
  }),
  forceRegeneration: z.boolean().default(false).openapi({
    example: true,
    description: 'Whether to force regeneration of existing schedules',
  }),
})
