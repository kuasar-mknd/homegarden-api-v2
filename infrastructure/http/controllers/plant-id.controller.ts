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

// ============================================================
// REQUEST/RESPONSE TYPES
// ============================================================

interface IdentifyRequestBody {
  /** Base64 encoded image */
  imageBase64?: string

  /** Image URL */
  imageUrl?: string

  /** MIME type */
  mimeType?: string

  /** Plant organs visible */
  organs?: PlantOrgan[]

  /** Max suggestions */
  maxSuggestions?: number

  /** Location */
  location?: {
    latitude: number
    longitude: number
    country?: string
  }
}

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
      // Parse request body
      const body = await c.req.json<IdentifyRequestBody>()

      // Validate - at least one image source required
      if (!body.imageBase64 && !body.imageUrl) {
        return c.json(
          {
            success: false,
            error: 'MISSING_IMAGE',
            message: 'Either imageBase64 or imageUrl is required',
          },
          400,
        )
      }

      // Build use case input - only add properties that have values
      const input: IdentifySpeciesInput = {}
      if (body.imageBase64) input.imageBase64 = body.imageBase64
      if (body.imageUrl) input.imageUrl = body.imageUrl
      if (body.mimeType) input.mimeType = body.mimeType
      if (body.organs) input.organs = body.organs
      if (body.maxSuggestions) input.maxSuggestions = body.maxSuggestions
      if (body.location) input.location = body.location

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
