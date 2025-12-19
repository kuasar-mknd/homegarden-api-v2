import { z } from 'zod'

// Diagnosis Request DTO
export const DiagnosisRequestSchema = z.object({
  imageUrl: z.string().url('Invalid image URL'),
  description: z.string().optional(),
  plantId: z.string().uuid().optional(),
})

export type DiagnosisRequestDTO = z.infer<typeof DiagnosisRequestSchema>

// Diagnosis Response DTO
export const DiagnosisResponseSchema = z.object({
  id: z.string().uuid(),
  imageUrl: z.string(),
  description: z.string().nullable().optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']),
  confidence: z.number().nullable().optional(),
  conditionName: z.string().nullable().optional(),
  conditionType: z
    .enum(['DISEASE', 'PEST', 'DEFICIENCY', 'ENVIRONMENTAL', 'HEALTHY'])
    .nullable()
    .optional(),
  severity: z.enum(['LOW', 'MODERATE', 'HIGH', 'CRITICAL']).nullable().optional(),
  affectedParts: z.array(z.string()),
  causes: z.array(z.string()),
  symptoms: z.array(z.string()),
  treatmentSteps: z.array(z.string()),
  preventionTips: z.array(z.string()),
  organicTreatment: z.string().nullable().optional(),
  chemicalTreatment: z.string().nullable().optional(),
  recoveryTimeWeeks: z.number().nullable().optional(),
  criticalActions: z.array(z.string()),
  plantId: z.string().uuid().nullable().optional(),
  userId: z.string().uuid(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
})

export type DiagnosisResponseDTO = z.infer<typeof DiagnosisResponseSchema>
