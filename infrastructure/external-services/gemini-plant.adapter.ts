/**
 * Google Gemini Plant AI Adapter
 *
 * Implements both AIIdentificationPort and AIDiagnosisPort
 * using Google's Gemini Vision models.
 *
 * Models used:
 * - gemini-2.0-flash: Fast identification (PlantID)
 * - gemini-2.5-pro-preview-06-05: Advanced diagnosis (DrPlant)
 */

import { type GenerativeModel, GoogleGenerativeAI, type Part } from '@google/generative-ai'
import type {
  AffectedPart,
  AIDiagnosisPort,
  ConditionType,
  DiagnoseHealthRequest,
  DiagnoseHealthResult,
  Severity,
  TreatmentRecommendation,
} from '../../application/ports/ai-diagnosis.port.js'
import type {
  AIIdentificationPort,
  IdentifySpeciesRequest,
  IdentifySpeciesResult,
  SpeciesSuggestion,
} from '../../application/ports/ai-identification.port.js'
import { AppError } from '../../shared/errors/app-error.js'
import { sanitizePromptInput } from '../../shared/utils/ai-sanitizer.js'
import { isSafeUrl } from '../../shared/utils/ssrf.validator.js'
import { env } from '../config/env.js'
import { logger } from '../config/logger.js'

// ============================================================
// CONFIGURATION - Models are read from env
// ============================================================

const getIdentificationModel = () => env.GEMINI_IDENTIFICATION_MODEL
const getDiagnosisModel = () => env.GEMINI_DIAGNOSIS_MODEL

// ============================================================
// PROMPTS
// ============================================================

const IDENTIFICATION_SYSTEM_PROMPT = `You are an expert botanist AI specialized in plant identification.
Analyze the provided plant image and identify the species.

IMPORTANT: You MUST respond with ONLY valid JSON, no markdown, no code blocks.

Response format (JSON only):
{
  "success": true,
  "suggestions": [
    {
      "confidence": 0.95,
      "commonName": "English Ivy",
      "scientificName": "Hedera helix",
      "family": "Araliaceae",
      "genus": "Hedera",
      "description": "Evergreen climbing or ground-creeping vine",
      "origin": "Europe and Western Asia"
    }
  ]
}

Rules:
1. Provide up to 5 suggestions, ordered by confidence (highest first)
2. Confidence is a decimal between 0.0 and 1.0
3. Always include commonName, scientificName, and family
4. If you cannot identify the plant, return success: false with an error message
5. Be precise with scientific names - use proper binomial nomenclature`

const DIAGNOSIS_SYSTEM_PROMPT = `You are DrPlant, an expert plant pathologist AI.
Analyze the provided plant image to diagnose health issues.

IMPORTANT: You MUST respond with ONLY valid JSON, no markdown, no code blocks.

Response format (JSON only):
{
  "success": true,
  "isHealthy": false,
  "confidence": 0.87,
  "condition": {
    "name": "Powdery Mildew",
    "type": "DISEASE",
    "severity": "MODERATE",
    "scientificName": "Erysiphales"
  },
  "affectedParts": ["leaves"],
  "symptoms": ["White powdery coating on leaves", "Yellowing leaf margins"],
  "causes": ["High humidity", "Poor air circulation", "Fungal spores"],
  "treatments": [
    {
      "priority": 1,
      "action": "Remove affected leaves",
      "instructions": "Carefully prune and dispose of heavily infected leaves. Do not compost.",
      "frequency": "once"
    },
    {
      "priority": 2,
      "action": "Apply fungicide",
      "instructions": "Spray neem oil solution on remaining foliage",
      "frequency": "weekly for 3 weeks",
      "products": ["Neem oil", "Potassium bicarbonate"]
    }
  ],
  "organicTreatment": "Mix 1 tbsp baking soda + 1 tbsp vegetable oil + 1 gallon water. Spray weekly.",
  "chemicalTreatment": "Apply sulfur-based fungicide according to package instructions.",
  "preventionTips": ["Improve air circulation", "Avoid overhead watering", "Space plants properly"],
  "urgentActions": [],
  "recoveryTimeWeeks": 3,
  "notes": "Caught early. Good prognosis with proper treatment."
}

Condition types: DISEASE, PEST, DEFICIENCY, ENVIRONMENTAL, HEALTHY
Severity levels: LOW, MODERATE, HIGH, CRITICAL
Affected parts: leaves, stems, roots, flowers, fruits, bark, whole_plant

Rules:
1. If plant is healthy, set isHealthy: true and condition: null
2. Be specific about treatments - include actual products and frequencies
3. Prioritize organic solutions when effective
4. For CRITICAL severity, always include urgentActions
5. Consider the symptom description provided by the user`

// ============================================================
// ADAPTER IMPLEMENTATION
// ============================================================

/**
 * Gemini Plant AI Adapter
 *
 * Implements plant identification and health diagnosis
 * using Google's Gemini Vision models.
 */
export class GeminiPlantAdapter implements AIIdentificationPort, AIDiagnosisPort {
  private readonly genAI: GoogleGenerativeAI
  private readonly identificationModel: GenerativeModel
  private readonly diagnosisModel: GenerativeModel
  private readonly apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey ?? env.GOOGLE_AI_API_KEY ?? ''

    if (!this.apiKey) {
      logger.warn('⚠️ GOOGLE_AI_API_KEY not configured - AI features will be unavailable')
    }

    this.genAI = new GoogleGenerativeAI(this.apiKey)

    this.identificationModel = this.genAI.getGenerativeModel({
      model: getIdentificationModel(),
      generationConfig: {
        temperature: 0.2, // Low temperature for consistent identification
        topP: 0.8,
        maxOutputTokens: 2048,
      },
    })

    this.diagnosisModel = this.genAI.getGenerativeModel({
      model: getDiagnosisModel(),
      generationConfig: {
        temperature: 0.4, // Slightly higher for nuanced diagnosis
        topP: 0.9,
        maxOutputTokens: 4096,
      },
    })
  }

  // ============================================================
  // IDENTIFICATION (PlantID)
  // ============================================================

  /**
   * Identify plant species from an image
   */
  async identifySpecies(request: IdentifySpeciesRequest): Promise<IdentifySpeciesResult> {
    const startTime = Date.now()

    if (!this.apiKey) {
      return {
        success: false,
        suggestions: [],
        processingTimeMs: Date.now() - startTime,
        modelUsed: getIdentificationModel(),
        error: 'AI service not configured - missing API key',
      }
    }

    try {
      // Build the image part
      const imagePart = await this.buildImagePart(request.image, request.isUrl, request.mimeType)

      // Build the prompt
      let prompt = IDENTIFICATION_SYSTEM_PROMPT

      if (request.organs?.length) {
        const safeOrgans = request.organs.map((o) => sanitizePromptInput(o))
        prompt += `\n\nVisible plant parts: ${safeOrgans.join(', ')}`
      }

      if (request.location) {
        const safeCountry = request.location.country
          ? sanitizePromptInput(request.location.country)
          : `${request.location.latitude}, ${request.location.longitude}`
        prompt += `\n\nLocation context: ${safeCountry}`
      }

      prompt += `\n\nPlease identify this plant and return ${request.maxSuggestions ?? 5} suggestions.`

      // Call Gemini
      const result = await this.identificationModel.generateContent([prompt, imagePart])
      const response = result.response
      const text = response.text()

      // Parse JSON response
      const parsed = this.parseJsonResponse<{
        success: boolean
        suggestions?: Array<{
          confidence: number
          commonName: string
          scientificName: string
          family: string
          genus?: string
          description?: string
          origin?: string
          imageUrl?: string
        }>
        error?: string
      }>(text)

      if (!parsed.success) {
        return {
          success: false,
          suggestions: [],
          processingTimeMs: Date.now() - startTime,
          modelUsed: getIdentificationModel(),
          error: parsed.error ?? 'Could not identify plant',
        }
      }

      const suggestions: SpeciesSuggestion[] = (parsed.suggestions ?? []).map((s) => {
        const suggestion: SpeciesSuggestion = {
          confidence: s.confidence,
          commonName: s.commonName,
          scientificName: s.scientificName,
          family: s.family,
        }
        // Only add optional properties if they have values
        if (s.genus) suggestion.genus = s.genus
        if (s.description) suggestion.description = s.description
        if (s.origin) suggestion.origin = s.origin
        if (s.imageUrl) suggestion.imageUrl = s.imageUrl
        return suggestion
      })

      return {
        success: true,
        suggestions,
        processingTimeMs: Date.now() - startTime,
        modelUsed: getIdentificationModel(),
      }
    } catch (error) {
      logger.error({ err: error }, 'Gemini identification error')
      return {
        success: false,
        suggestions: [],
        processingTimeMs: Date.now() - startTime,
        modelUsed: getIdentificationModel(),
        error: error instanceof Error ? error.message : 'Unknown error during identification',
      }
    }
  }

  // ============================================================
  // DIAGNOSIS (DrPlant)
  // ============================================================

  /**
   * Diagnose plant health from an image
   */
  async diagnoseHealth(request: DiagnoseHealthRequest): Promise<DiagnoseHealthResult> {
    const startTime = Date.now()

    if (!this.apiKey) {
      return {
        success: false,
        isHealthy: false,
        confidence: 0,
        condition: null,
        affectedParts: [],
        symptoms: [],
        causes: [],
        treatments: [],
        preventionTips: [],
        urgentActions: [],
        processingTimeMs: Date.now() - startTime,
        modelUsed: getDiagnosisModel(),
        error: 'AI service not configured - missing API key',
      }
    }

    try {
      // Build the image part
      const imagePart = await this.buildImagePart(request.image, request.isUrl, request.mimeType)

      // Build contextual prompt
      let prompt = DIAGNOSIS_SYSTEM_PROMPT

      if (request.plantName) {
        prompt += `\n\nPlant name: ${sanitizePromptInput(request.plantName)}`
      }

      if (request.plantSpecies) {
        prompt += `\nScientific name: ${sanitizePromptInput(request.plantSpecies)}`
      }

      if (request.symptomDescription) {
        prompt += `\n\nUser's symptom description: "${sanitizePromptInput(request.symptomDescription)}"`
      }

      if (request.symptomDuration) {
        prompt += `\nSymptoms present for: ${sanitizePromptInput(request.symptomDuration)}`
      }

      if (request.recentCare) {
        const care = request.recentCare
        const careDetails: string[] = []
        if (care.watering) careDetails.push(`Watering: ${sanitizePromptInput(care.watering)}`)
        if (care.fertilizing)
          careDetails.push(`Fertilizing: ${sanitizePromptInput(care.fertilizing)}`)
        if (care.repotting) careDetails.push(`Repotting: ${sanitizePromptInput(care.repotting)}`)
        if (care.pestTreatment)
          careDetails.push(`Pest treatment: ${sanitizePromptInput(care.pestTreatment)}`)
        if (careDetails.length) {
          prompt += `\n\nRecent care:\n${careDetails.join('\n')}`
        }
      }

      if (request.environment) {
        prompt += `\n\nEnvironment: ${request.environment.indoor ? 'Indoor' : 'Outdoor'}`
        if (request.environment.climate)
          prompt += `, ${sanitizePromptInput(request.environment.climate)} climate`
        if (request.environment.recentWeather)
          prompt += `, Recent weather: ${sanitizePromptInput(request.environment.recentWeather)}`
      }

      prompt += '\n\nPlease analyze this plant and provide a diagnosis.'

      // Call Gemini
      const apiResult = await this.diagnosisModel.generateContent([prompt, imagePart])
      const response = apiResult.response
      const text = response.text()

      // Parse JSON response
      const parsed = this.parseJsonResponse<{
        success: boolean
        isHealthy: boolean
        confidence: number
        condition: {
          name: string
          type: string
          severity: string
          scientificName?: string
        } | null
        affectedParts: string[]
        symptoms: string[]
        causes: string[]
        treatments: Array<{
          priority: number
          action: string
          instructions: string
          frequency?: string
          products?: string[]
        }>
        organicTreatment?: string
        chemicalTreatment?: string
        preventionTips: string[]
        urgentActions: string[]
        recoveryTimeWeeks?: number
        notes?: string
        error?: string
      }>(text)

      if (!parsed.success) {
        return {
          success: false,
          isHealthy: false,
          confidence: 0,
          condition: null,
          affectedParts: [],
          symptoms: [],
          causes: [],
          treatments: [],
          preventionTips: [],
          urgentActions: [],
          processingTimeMs: Date.now() - startTime,
          modelUsed: getDiagnosisModel(),
          error: parsed.error ?? 'Could not diagnose plant',
        }
      }

      // Map and validate response
      const treatments: TreatmentRecommendation[] = (parsed.treatments ?? []).map((t) => {
        const treatment: TreatmentRecommendation = {
          priority: t.priority,
          action: t.action,
          instructions: t.instructions,
        }
        if (t.frequency) treatment.frequency = t.frequency
        if (t.products) treatment.products = t.products
        return treatment
      })

      // Build condition object if present
      let condition: DiagnoseHealthResult['condition'] = null
      if (parsed.condition) {
        condition = {
          name: parsed.condition.name,
          type: this.validateConditionType(parsed.condition.type),
          severity: this.validateSeverity(parsed.condition.severity),
        }
        if (parsed.condition.scientificName) {
          condition.scientificName = parsed.condition.scientificName
        }
      }

      // Build diagnosis result object
      const diagnosisResult: DiagnoseHealthResult = {
        success: true,
        isHealthy: parsed.isHealthy,
        confidence: parsed.confidence,
        condition,
        affectedParts: this.validateAffectedParts(parsed.affectedParts),
        symptoms: parsed.symptoms ?? [],
        causes: parsed.causes ?? [],
        treatments,
        preventionTips: parsed.preventionTips ?? [],
        urgentActions: parsed.urgentActions ?? [],
        processingTimeMs: Date.now() - startTime,
        modelUsed: getDiagnosisModel(),
      }

      // Add optional properties
      if (parsed.organicTreatment) diagnosisResult.organicTreatment = parsed.organicTreatment
      if (parsed.chemicalTreatment) diagnosisResult.chemicalTreatment = parsed.chemicalTreatment
      if (parsed.recoveryTimeWeeks) diagnosisResult.recoveryTimeWeeks = parsed.recoveryTimeWeeks
      if (parsed.notes) diagnosisResult.notes = parsed.notes

      return diagnosisResult
    } catch (error) {
      logger.error({ err: error }, 'Gemini diagnosis error')
      return {
        success: false,
        isHealthy: false,
        confidence: 0,
        condition: null,
        affectedParts: [],
        symptoms: [],
        causes: [],
        treatments: [],
        preventionTips: [],
        urgentActions: [],
        processingTimeMs: Date.now() - startTime,
        modelUsed: getDiagnosisModel(),
        error: error instanceof Error ? error.message : 'Unknown error during diagnosis',
      }
    }
  }

  // ============================================================
  // UTILITY METHODS
  // ============================================================

  /**
   * Check if the service is available
   */
  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) return false

    try {
      // Simple API test
      const model = this.genAI.getGenerativeModel({ model: getIdentificationModel() })
      const result = await model.generateContent('Say "ok" if you can read this.')
      return result.response.text().toLowerCase().includes('ok')
    } catch {
      return false
    }
  }

  /**
   * Get the identification model name
   */
  getModelName(): string {
    return getIdentificationModel()
  }

  /**
   * Get the diagnosis model name
   */
  getDiagnosisModelName(): string {
    return getDiagnosisModel()
  }

  /**
   * Build image part for Gemini API
   */
  private async buildImagePart(image: string, isUrl?: boolean, mimeType?: string): Promise<Part> {
    if (isUrl) {
      // Validate URL against SSRF
      if (!(await isSafeUrl(image))) {
        throw new AppError('Invalid or unsafe image URL', 400)
      }

      // Fetch image from URL and convert to base64
      const response = await fetch(image, {
        redirect: 'error',
        headers: {
          'User-Agent': 'HomeGarden-API/2.0 (Security-Scan; +https://homegarden.app)',
        },
      })
      if (!response.ok) {
        throw new AppError(`Failed to fetch image from URL: ${response.statusText}`, 400)
      }

      const contentLength = response.headers.get('content-length')
      if (contentLength && Number.parseInt(contentLength, 10) > 10 * 1024 * 1024) {
        throw new AppError('Image too large (max 10MB)', 400)
      }

      const buffer = await response.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      const contentType = response.headers.get('content-type') ?? 'image/jpeg'

      return {
        inlineData: {
          data: base64,
          mimeType: contentType,
        },
      }
    }

    // Already base64
    return {
      inlineData: {
        data: image,
        mimeType: mimeType ?? 'image/jpeg',
      },
    }
  }

  /**
   * Parse JSON from AI response (handles markdown code blocks)
   */
  private parseJsonResponse<T>(text: string): T {
    // Remove markdown code blocks if present
    let cleaned = text.trim()

    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7)
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3)
    }

    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3)
    }

    cleaned = cleaned.trim()

    try {
      return JSON.parse(cleaned) as T
    } catch (error) {
      logger.error({ err: error, response: cleaned }, 'Failed to parse AI response')
      throw new AppError('Invalid AI response format', 500)
    }
  }

  /**
   * Validate and coerce condition type
   */
  private validateConditionType(type: string): ConditionType {
    const validTypes: ConditionType[] = [
      'DISEASE',
      'PEST',
      'DEFICIENCY',
      'ENVIRONMENTAL',
      'HEALTHY',
    ]
    const upperType = type.toUpperCase() as ConditionType
    return validTypes.includes(upperType) ? upperType : 'DISEASE'
  }

  /**
   * Validate and coerce severity
   */
  private validateSeverity(severity: string): Severity {
    const validSeverities: Severity[] = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL']
    const upperSeverity = severity.toUpperCase() as Severity
    return validSeverities.includes(upperSeverity) ? upperSeverity : 'MODERATE'
  }

  /**
   * Validate and coerce affected parts
   */
  private validateAffectedParts(parts: string[]): AffectedPart[] {
    const validParts: AffectedPart[] = [
      'leaves',
      'stems',
      'roots',
      'flowers',
      'fruits',
      'bark',
      'whole_plant',
    ]
    return parts.map((p) => p.toLowerCase() as AffectedPart).filter((p) => validParts.includes(p))
  }
}

// ============================================================
// SINGLETON EXPORT
// ============================================================

let instance: GeminiPlantAdapter | null = null

/**
 * Get the singleton Gemini adapter instance
 */
export const getGeminiPlantAdapter = (): GeminiPlantAdapter => {
  if (!instance) {
    instance = new GeminiPlantAdapter()
  }
  return instance
}

export default GeminiPlantAdapter
