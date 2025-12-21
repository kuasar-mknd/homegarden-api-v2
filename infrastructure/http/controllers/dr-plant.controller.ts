import type { Context } from 'hono'
import type { DiagnosePlantUseCase } from '../../../application/use-cases/dr-plant/diagnose-plant.use-case.js'
import { logger } from '../../config/logger.js'

export class DrPlantController {
  constructor(private diagnosePlantUseCase: DiagnosePlantUseCase) {}

  diagnose = async (c: Context) => {
    try {
      const body = await c.req.parseBody()
      const imageFile = body.image
      const symptoms = body.symptoms as string | undefined

      if (!imageFile || !(imageFile instanceof File)) {
        return c.json(
          {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Image file is required',
          },
          400,
        )
      }

      // Validations
      if (imageFile.size > 10 * 1024 * 1024) {
        return c.json(
          {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Image size exceeds 10MB limit',
          },
          413,
        )
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
      if (!validTypes.includes(imageFile.type)) {
        return c.json(
          {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Invalid image type. Supported: JPEG, PNG, WebP, HEIC',
          },
          400,
        )
      }

      // Extract buffer from File
      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const result = await this.diagnosePlantUseCase.execute(buffer, imageFile.type, symptoms)

      if (!result.success) {
        const error = result.error
        const status =
          error.statusCode >= 400 && error.statusCode < 600 ? (error.statusCode as any) : 500
        return c.json(
          {
            success: false,
            error: error.code || 'DIAGNOSIS_FAILED',
            message: error.message,
          },
          status,
        )
      }

      const data = result.data
      const responseData = {
        isHealthy: data.isHealthy,
        confidence: data.confidence,
        conditionName: data.condition?.name || (data.isHealthy ? 'Healthy' : 'Unknown'),
        conditionType: data.condition?.type || (data.isHealthy ? 'HEALTHY' : 'ENVIRONMENTAL'),
        severity: data.condition?.severity || 'LOW',
        affectedParts: data.affectedParts || [],
        causes: data.causes || [],
        symptoms: data.symptoms || [],
        treatmentSteps: data.treatments?.map((t) => t.action) || [],
        preventionTips: data.preventionTips || [],
        organicTreatment: data.organicTreatment,
        chemicalTreatment: data.chemicalTreatment,
        recoveryTimeWeeks: data.recoveryTimeWeeks,
        criticalActions: data.urgentActions || [],
        processingMs: data.processingTimeMs,
        aiModel: data.modelUsed,
      }

      return c.json(
        {
          success: true,
          data: responseData,
        },
        200,
      )
    } catch (error) {
      logger.error({ err: error }, 'DrPlant Controller Error')
      return c.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
          stack: error instanceof Error ? error.stack : undefined,
        },
        500,
      )
    }
  }
}
