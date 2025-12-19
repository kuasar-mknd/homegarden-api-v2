/**
 * AI Identification Port
 *
 * Interface for plant species identification services.
 * Implementations can use Google Gemini, PlantNet, or other vision APIs.
 */

// ============================================================
// REQUEST TYPES
// ============================================================

/**
 * Organs/parts of the plant visible in the image
 * Specifying these improves identification accuracy
 */
export type PlantOrgan = 'leaf' | 'flower' | 'fruit' | 'bark' | 'habit' | 'other'

/**
 * Request to identify a plant from an image
 */
export interface IdentifySpeciesRequest {
  /** Base64 encoded image data OR publicly accessible URL */
  image: string

  /** Whether the image is a URL (true) or base64 data (false) */
  isUrl?: boolean

  /** MIME type if base64 (e.g., 'image/jpeg', 'image/png') */
  mimeType?: string

  /** Plant organs visible in the image for better accuracy */
  organs?: PlantOrgan[]

  /** Maximum number of suggestions to return (default: 5) */
  maxSuggestions?: number

  /** Optional context about the plant's location */
  location?: {
    latitude: number
    longitude: number
    country?: string
  }
}

// ============================================================
// RESPONSE TYPES
// ============================================================

/**
 * A single species identification suggestion
 */
export interface SpeciesSuggestion {
  /** Confidence score (0.0 to 1.0) */
  confidence: number

  /** Common name(s) of the plant */
  commonName: string

  /** Scientific/Latin name */
  scientificName: string

  /** Plant family (e.g., "Rosaceae") */
  family: string

  /** Genus (e.g., "Rosa") */
  genus?: string

  /** Brief description of the species */
  description?: string

  /** Native regions/origins */
  origin?: string

  /** URL to a reference image (if available) */
  imageUrl?: string

  /** External ID from the identification service */
  externalId?: string
}

/**
 * Complete identification result
 */
export interface IdentifySpeciesResult {
  /** Whether identification was successful */
  success: boolean

  /** Top suggestions sorted by confidence (highest first) */
  suggestions: SpeciesSuggestion[]

  /** Processing time in milliseconds */
  processingTimeMs: number

  /** Which AI model was used */
  modelUsed: string

  /** Error message if success is false */
  error?: string
}

// ============================================================
// PORT INTERFACE
// ============================================================

/**
 * AI Identification Port Interface
 *
 * Implementations must provide plant species identification
 * from images using vision AI.
 */
export interface AIIdentificationPort {
  /**
   * Identify plant species from an image
   *
   * @param request - Image and optional parameters
   * @returns Identification results with suggestions
   * @throws AppError if the service fails
   */
  identifySpecies(request: IdentifySpeciesRequest): Promise<IdentifySpeciesResult>

  /**
   * Check if the service is available and configured
   */
  isAvailable(): Promise<boolean>

  /**
   * Get the name of the underlying model/service
   */
  getModelName(): string
}
