/**
 * Identify Species Use Case
 *
 * Application layer use case for plant species identification.
 * Accepts an image and returns identification suggestions.
 */

import { AppError } from '../../../shared/errors/app-error.js'
import { fail, ok, type Result } from '../../../shared/types/result.type.js'
import type {
  AIIdentificationPort,
  IdentifySpeciesRequest,
  IdentifySpeciesResult,
  PlantOrgan,
} from '../../ports/ai-identification.port.js'

// ============================================================
// INPUT/OUTPUT TYPES
// ============================================================

/**
 * Input for the Identify Species use case
 */
export interface IdentifySpeciesInput {
  /** Base64 encoded image data */
  imageBase64?: string

  /** Image URL (alternative to base64) */
  imageUrl?: string

  /** MIME type of the image */
  mimeType?: string

  /** Plant organs visible in the image */
  organs?: PlantOrgan[]

  /** Maximum suggestions to return */
  maxSuggestions?: number

  /** Optional location context */
  location?: {
    latitude: number
    longitude: number
    country?: string
  }
}

/**
 * Output of the Identify Species use case
 */
export interface IdentifySpeciesOutput {
  /** Whether identification succeeded */
  success: boolean

  /** Top species suggestions */
  suggestions: Array<{
    confidence: number
    commonName: string
    scientificName: string
    family: string
    genus?: string
    description?: string
    origin?: string
    imageUrl?: string
  }>

  /** Processing time in ms */
  processingTimeMs: number

  /** AI model used */
  modelUsed: string
}

// ============================================================
// USE CASE IMPLEMENTATION
// ============================================================

/**
 * Identify Species Use Case
 *
 * Uses AI to identify plant species from an image.
 */
export class IdentifySpeciesUseCase {
  constructor(private readonly aiIdentification: AIIdentificationPort) {}

  /**
   * Execute the use case
   *
   * @param input - Image data and optional parameters
   * @returns Result with identification suggestions or error
   */
  async execute(input: IdentifySpeciesInput): Promise<Result<IdentifySpeciesOutput, AppError>> {
    // Validate input
    if (!input.imageBase64 && !input.imageUrl) {
      return fail(new AppError('Either imageBase64 or imageUrl is required', 400, 'MISSING_IMAGE'))
    }

    // Build the request - only add optional properties if they have values
    const request: IdentifySpeciesRequest = {
      image: input.imageUrl ?? input.imageBase64!,
      isUrl: !!input.imageUrl,
      mimeType: input.mimeType ?? 'image/jpeg',
      maxSuggestions: input.maxSuggestions ?? 5,
    }
    if (input.organs) request.organs = input.organs
    if (input.location) request.location = input.location

    try {
      // Call the AI service
      const result: IdentifySpeciesResult = await this.aiIdentification.identifySpecies(request)

      if (!result.success) {
        return fail(
          new AppError(result.error ?? 'Plant identification failed', 500, 'IDENTIFICATION_FAILED'),
        )
      }

      // Map to output format
      const output: IdentifySpeciesOutput = {
        success: true,
        suggestions: result.suggestions.map((s) => {
          const suggestion: IdentifySpeciesOutput['suggestions'][0] = {
            confidence: s.confidence,
            commonName: s.commonName,
            scientificName: s.scientificName,
            family: s.family,
          }
          if (s.genus) suggestion.genus = s.genus
          if (s.description) suggestion.description = s.description
          if (s.origin) suggestion.origin = s.origin
          if (s.imageUrl) suggestion.imageUrl = s.imageUrl
          return suggestion
        }),
        processingTimeMs: result.processingTimeMs,
        modelUsed: result.modelUsed,
      }

      return ok(output)
    } catch (error) {
      console.error('Identify species use case error:', error)
      return fail(
        new AppError(
          error instanceof Error ? error.message : 'Unknown identification error',
          500,
          'IDENTIFICATION_ERROR',
        ),
      )
    }
  }
}

/**
 * Factory function to create the use case with dependencies
 */
export const createIdentifySpeciesUseCase = (
  aiIdentification: AIIdentificationPort,
): IdentifySpeciesUseCase => {
  return new IdentifySpeciesUseCase(aiIdentification)
}
