import type { Context } from 'hono'
import type { DiagnosePlantUseCase } from '../../../application/use-cases/dr-plant/diagnose-plant.use-case.js'

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
          400,
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

      return c.json(
        {
          success: true,
          data: result.data,
        },
        200,
      )
    } catch (error) {
      console.error('DrPlant Controller Error:', error)
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
