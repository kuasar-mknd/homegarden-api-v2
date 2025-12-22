import type { Context } from 'hono'
import type { DiagnosePlantUseCase } from '../../../application/use-cases/dr-plant/diagnose-plant.use-case.js'
import { logger } from '../../config/logger.js'
import { diagnosePlantSchema } from '../validators/dr-plant.validator.js'

export class DrPlantController {
  constructor(private diagnosePlantUseCase: DiagnosePlantUseCase) {}

  diagnose = async (c: Context) => {
    try {
      // Hono's zValidator middleware usually handles body parsing and validation automatically if used in the route definition.
      // However, here we are inside the controller and might want to use the validator manually or assume it was used in the route.
      // Given the architecture, validation seems to be done via middleware in some places, but here we are doing it manually.
      // The instruction is to 'Use the new validator'.
      // Since we are not changing the router definition in this file (it's likely in index.ts), we can validate manually here using parse.

      const body = await c.req.parseBody()

      const validationResult = diagnosePlantSchema.safeParse(body)

      if (!validationResult.success) {
        return c.json(
          {
            success: false,
            error: 'VALIDATION_ERROR',
            // Zod 4 uses 'issues' instead of 'errors'
            message: validationResult.error.issues[0]?.message || 'Validation failed',
            details: validationResult.error.flatten(),
          },
          400,
        )
      }

      const { image, symptoms } = validationResult.data

      // Extract buffer from File
      const arrayBuffer = await image.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const result = await this.diagnosePlantUseCase.execute(buffer, image.type, symptoms)

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
