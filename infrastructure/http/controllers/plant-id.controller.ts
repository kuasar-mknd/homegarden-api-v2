/**
 * Plant ID Controller
 *
 * HTTP controller for plant identification endpoints.
 * Handles request parsing, validation, and response formatting.
 */

import type { Context } from 'hono'
import type { PlantOrgan } from '../../../application/ports/ai-identification.port.js'
import type {
  IdentifySpeciesInput,
  IdentifySpeciesUseCase,
} from '../../../application/use-cases/plant-id/identify-species.use-case.js'
import { isOk } from '../../../shared/types/result.type.js'
import { logger } from '../../config/logger.js'
import { identifyPlantSchema } from '../validators/plant-id.validator.js'

// ============================================================
// CONTROLLER
// ============================================================

/**
 * Plant ID Controller
 *
 * Exposes plant identification functionality via HTTP.
 */
export class PlantIdController {
  constructor(private readonly identifySpeciesUseCase: IdentifySpeciesUseCase) {}

  /**
   * POST /identify
   *
   * Identify a plant species from an image.
   */
  identify = async (c: Context) => {
    try {
      const body = await c.req.json()

      // Validate with Zod
      const validationResult = identifyPlantSchema.safeParse(body)

      if (!validationResult.success) {
        return c.json(
          {
            success: false,
            error: 'VALIDATION_ERROR',
            message: validationResult.error.issues[0].message,
            details: validationResult.error.flatten(),
          },
          400,
        )
      }

      const validatedData = validationResult.data

      // Build use case input
      const input: IdentifySpeciesInput = {}
      if (validatedData.imageBase64) input.imageBase64 = validatedData.imageBase64
      if (validatedData.imageUrl) input.imageUrl = validatedData.imageUrl
      if (validatedData.mimeType) input.mimeType = validatedData.mimeType
      if (validatedData.organs) input.organs = validatedData.organs as PlantOrgan[]
      if (validatedData.maxSuggestions) input.maxSuggestions = validatedData.maxSuggestions
      if (validatedData.location) input.location = validatedData.location

      // Execute use case
      const result = await this.identifySpeciesUseCase.execute(input)

      if (!isOk(result)) {
        const error = result.error
        return c.json(
          {
            success: false,
            error: error.code,
            message: error.message,
          },
          error.statusCode as 400 | 500,
        )
      }

      // Success response
      return c.json(
        {
          success: true,
          data: result.data,
        },
        200,
      )
    } catch (error) {
      logger.error({ err: error }, 'Plant ID controller error')

      // Handle JSON parse errors
      if (error instanceof SyntaxError) {
        return c.json(
          {
            success: false,
            error: 'INVALID_JSON',
            message: 'Request body must be valid JSON',
          },
          400,
        )
      }

      return c.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
        },
        500,
      )
    }
  }

  /**
   * GET /status
   *
   * Check if the plant identification service is available.
   */
  status = async (c: Context) => {
    return c.json(
      {
        success: true,
        data: {
          service: 'plant-id',
          status: 'operational',
          message: 'Plant identification service is ready',
        },
      },
      200,
    )
  }
}

/**
 * Factory function to create controller with dependencies
 */
export const createPlantIdController = (
  identifySpeciesUseCase: IdentifySpeciesUseCase,
): PlantIdController => {
  return new PlantIdController(identifySpeciesUseCase)
}
