import { z } from '@hono/zod-openapi'

// =============================================================================
// Dr. Plant Diagnosis Schemas
// =============================================================================

export const DiagnosePlantInputSchema = z.object({
  image: z.any().openapi({
    type: 'string',
    format: 'binary',
    description: 'Plant image file (JPEG, PNG, WEBP)',
    example: '[Binary file data]',
  }),
  symptoms: z.string().optional().openapi({
    description: 'Optional description of visible symptoms',
    example: 'Leaves are turning yellow with brown spots',
  }),
})

export const DiagnosePlantResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  data: z.object({
    isHealthy: z.boolean().openapi({
      example: false,
      description: 'Whether the plant appears healthy',
    }),
    confidence: z.number().openapi({
      example: 0.89,
      description: 'AI confidence score (0-1)',
    }),
    conditionName: z.string().openapi({
      example: 'Leaf Septoria',
      description: 'Identified condition name',
    }),
    conditionType: z.enum(['DISEASE', 'PEST', 'DEFICIENCY', 'ENVIRONMENTAL']).openapi({
      example: 'DISEASE',
      description: 'Type of condition',
    }),
    severity: z.enum(['MILD', 'MODERATE', 'SEVERE', 'CRITICAL']).openapi({
      example: 'MODERATE',
      description: 'Severity level',
    }),
    affectedParts: z.array(z.string()).openapi({
      example: ['leaves'],
      description: 'Plant parts affected',
    }),
    causes: z.array(z.string()).openapi({
      example: ['Fungus (Septoria lycopersici)', 'High humidity'],
      description: 'Possible causes',
    }),
    symptoms: z.array(z.string()).openapi({
      example: ['Yellow spots on leaves', 'Brown lesions'],
      description: 'Visible symptoms',
    }),
    treatmentSteps: z.array(z.string()).openapi({
      example: ['Remove infected leaves', 'Apply fungicide'],
      description: 'Recommended treatment steps',
    }),
    preventionTips: z.array(z.string()).openapi({
      example: ['Avoid overhead watering', 'Improve air circulation'],
      description: 'Prevention recommendations',
    }),
    organicTreatment: z.string().optional().openapi({
      example: 'Neem oil spray every 7-10 days',
      description: 'Organic treatment option',
    }),
    chemicalTreatment: z.string().optional().openapi({
      example: 'Copper fungicide (follow label)',
      description: 'Chemical treatment option',
    }),
    recoveryTimeWeeks: z.number().optional().openapi({
      example: 2,
      description: 'Estimated recovery time in weeks',
    }),
    criticalActions: z
      .array(z.string())
      .optional()
      .openapi({
        example: ['Isolate plant to prevent spread'],
        description: 'Urgent actions to take',
      }),
    processingMs: z.number().openapi({
      example: 2456,
      description: 'AI processing time in milliseconds',
    }),
    aiModel: z.string().openapi({
      example: 'gemini-2.0-flash',
      description: 'AI model used for diagnosis',
    }),
  }),
})

export const ErrorSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  error: z.string().openapi({
    example: 'VALIDATION_ERROR',
    description: 'Error code',
  }),
  message: z.string().openapi({
    example: 'Invalid image format',
    description: 'Human-readable error message',
  }),
})
