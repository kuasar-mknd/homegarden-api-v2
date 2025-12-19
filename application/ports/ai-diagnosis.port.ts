/**
 * AI Diagnosis Port
 *
 * Interface for plant health diagnosis services.
 * Analyzes plant images to detect diseases, pests, and deficiencies.
 */

// ============================================================
// ENUMS & CONSTANTS
// ============================================================

/**
 * Type of condition detected
 */
export type ConditionType =
  | 'DISEASE' // Fungal, bacterial, viral infections
  | 'PEST' // Insect or animal damage
  | 'DEFICIENCY' // Nutrient deficiency
  | 'ENVIRONMENTAL' // Sun damage, overwatering, etc.
  | 'HEALTHY' // No issues detected

/**
 * Severity of the condition
 */
export type Severity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'

/**
 * Affected parts of the plant
 */
export type AffectedPart =
  | 'leaves'
  | 'stems'
  | 'roots'
  | 'flowers'
  | 'fruits'
  | 'bark'
  | 'whole_plant'

// ============================================================
// REQUEST TYPES
// ============================================================

/**
 * Request to diagnose plant health from an image
 */
export interface DiagnoseHealthRequest {
  /** Base64 encoded image data OR publicly accessible URL */
  image: string

  /** Whether the image is a URL (true) or base64 data (false) */
  isUrl?: boolean

  /** MIME type if base64 (e.g., 'image/jpeg', 'image/png') */
  mimeType?: string

  /** User's description of symptoms (highly recommended) */
  symptomDescription?: string

  /** Name of the plant if known */
  plantName?: string

  /** Scientific name if known (improves accuracy) */
  plantSpecies?: string

  /** How long symptoms have been present */
  symptomDuration?: string

  /** Recent care activities */
  recentCare?: {
    watering?: string
    fertilizing?: string
    repotting?: string
    pestTreatment?: string
  }

  /** Environmental context */
  environment?: {
    indoor: boolean
    climate?: string
    recentWeather?: string
  }
}

// ============================================================
// RESPONSE TYPES
// ============================================================

/**
 * Treatment recommendation
 */
export interface TreatmentRecommendation {
  /** Priority order (1 = most important) */
  priority: number

  /** Action to take */
  action: string

  /** Detailed instructions */
  instructions: string

  /** Frequency (e.g., "once", "daily for 7 days") */
  frequency?: string

  /** Product recommendations if applicable */
  products?: string[]
}

/**
 * Complete diagnosis result
 */
export interface DiagnoseHealthResult {
  /** Whether diagnosis was successful */
  success: boolean

  /** Overall plant health status */
  isHealthy: boolean

  /** Confidence score (0.0 to 1.0) */
  confidence: number

  /** Primary condition detected (or null if healthy) */
  condition: {
    /** Name of the condition (e.g., "Powdery Mildew") */
    name: string

    /** Type of condition */
    type: ConditionType

    /** Severity level */
    severity: Severity

    /** Scientific name of pathogen/pest if applicable */
    scientificName?: string
  } | null

  /** Parts of the plant affected */
  affectedParts: AffectedPart[]

  /** Observed symptoms */
  symptoms: string[]

  /** Likely causes */
  causes: string[]

  /** Treatment recommendations */
  treatments: TreatmentRecommendation[]

  /** Organic/natural treatment options */
  organicTreatment?: string

  /** Chemical treatment options */
  chemicalTreatment?: string

  /** Prevention tips for the future */
  preventionTips: string[]

  /** Urgent actions if severity is high */
  urgentActions: string[]

  /** Estimated recovery time in weeks */
  recoveryTimeWeeks?: number

  /** Additional notes or warnings */
  notes?: string

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
 * AI Diagnosis Port Interface
 *
 * Implementations must provide plant health analysis
 * from images and symptom descriptions.
 */
export interface AIDiagnosisPort {
  /**
   * Diagnose plant health from an image and symptoms
   *
   * @param request - Image and symptom information
   * @returns Diagnosis results with treatment recommendations
   * @throws AppError if the service fails
   */
  diagnoseHealth(request: DiagnoseHealthRequest): Promise<DiagnoseHealthResult>

  /**
   * Check if the service is available and configured
   */
  isAvailable(): Promise<boolean>

  /**
   * Get the name of the underlying model/service
   */
  getModelName(): string
}
