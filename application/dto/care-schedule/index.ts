import { z } from 'zod'

// Create Care Schedule DTO
export const CreateScheduleSchema = z.object({
  taskType: z.enum([
    'WATER',
    'FERTILIZE',
    'PRUNE',
    'REPOT',
    'HARVEST',
    'PEST_CHECK',
    'DISEASE_CHECK',
    'MULCH',
    'WEED',
    'CUSTOM',
  ]),
  frequency: z.enum([
    'DAILY',
    'EVERY_OTHER_DAY',
    'TWICE_WEEKLY',
    'WEEKLY',
    'BIWEEKLY',
    'MONTHLY',
    'CUSTOM',
  ]),
  intervalDays: z.number().positive().optional(),
  nextDueDate: z.string().datetime().or(z.date()), // Accept string or Date
  notes: z.string().optional(),
  weatherAdjust: z.boolean().optional().default(false),
  gardenId: z.string().uuid().optional(),
  plantId: z.string().uuid().optional(),
}).refine((data) => data.gardenId || data.plantId, {
  message: 'Either gardenId or plantId must be provided',
  path: ['gardenId', 'plantId'],
})

export type CreateScheduleDTO = z.infer<typeof CreateScheduleSchema>

// Update Care Schedule DTO
export const UpdateScheduleSchema = z.object({
  taskType: z.enum([
    'WATER',
    'FERTILIZE',
    'PRUNE',
    'REPOT',
    'HARVEST',
    'PEST_CHECK',
    'DISEASE_CHECK',
    'MULCH',
    'WEED',
    'CUSTOM',
  ]).optional(),
  frequency: z.enum([
    'DAILY',
    'EVERY_OTHER_DAY',
    'TWICE_WEEKLY',
    'WEEKLY',
    'BIWEEKLY',
    'MONTHLY',
    'CUSTOM',
  ]).optional(),
  intervalDays: z.number().positive().optional(),
  nextDueDate: z.string().datetime().or(z.date()).optional(),
  notes: z.string().optional(),
  isEnabled: z.boolean().optional(),
  weatherAdjust: z.boolean().optional(),
})

export type UpdateScheduleDTO = z.infer<typeof UpdateScheduleSchema>

// Schedule Response DTO
export const ScheduleResponseSchema = z.object({
  id: z.string().uuid(),
  taskType: z.enum([
    'WATER',
    'FERTILIZE',
    'PRUNE',
    'REPOT',
    'HARVEST',
    'PEST_CHECK',
    'DISEASE_CHECK',
    'MULCH',
    'WEED',
    'CUSTOM',
  ]),
  frequency: z.enum([
    'DAILY',
    'EVERY_OTHER_DAY',
    'TWICE_WEEKLY',
    'WEEKLY',
    'BIWEEKLY',
    'MONTHLY',
    'CUSTOM',
  ]),
  intervalDays: z.number().nullable().optional(),
  nextDueDate: z.date().or(z.string()),
  lastDoneAt: z.date().or(z.string()).nullable().optional(),
  notes: z.string().nullable().optional(),
  isEnabled: z.boolean(),
  weatherAdjust: z.boolean(),
  gardenId: z.string().uuid().nullable().optional(),
  plantId: z.string().uuid().nullable().optional(),
  userId: z.string().uuid(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
})

export type ScheduleResponseDTO = z.infer<typeof ScheduleResponseSchema>
