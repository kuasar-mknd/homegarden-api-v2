import { GoogleGenerativeAI } from '@google/generative-ai'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  GeminiPlantAdapter,
  getGeminiPlantAdapter,
} from '../../infrastructure/external-services/gemini-plant.adapter.js'
import * as ssrfValidator from '../../shared/utils/ssrf.validator.js'

// Mock the whole @google/generative-ai module
const { mockGenerateContent, mockGetGenerativeModel } = vi.hoisted(() => ({
  mockGenerateContent: vi.fn(),
  mockGetGenerativeModel: vi.fn(),
}))

vi.mock('@google/generative-ai', () => {
  class GoogleGenerativeAI {
    constructor(public apiKey: string) {}
    getGenerativeModel = mockGetGenerativeModel.mockReturnValue({
      generateContent: mockGenerateContent,
    })
  }
  return { GoogleGenerativeAI }
})

describe('GeminiPlantAdapter', () => {
  let adapter: GeminiPlantAdapter
  const mockApiKey = 'test-api-key'

  beforeEach(() => {
    vi.clearAllMocks()
    adapter = new GeminiPlantAdapter(mockApiKey)
  })

  describe('identifySpecies', () => {
    it('should identify a species successfully', async () => {
      const mockAiResponse = {
        response: {
          text: () =>
            JSON.stringify({
              success: true,
              suggestions: [
                {
                  confidence: 0.95,
                  commonName: 'Rose',
                  scientificName: 'Rosa',
                  family: 'Rosaceae',
                },
              ],
            }),
        },
      }

      const genAIInstance = new GoogleGenerativeAI(mockApiKey)
      const model = genAIInstance.getGenerativeModel({ model: 'any' })
      vi.mocked(model.generateContent).mockResolvedValue(mockAiResponse as any)

      const result = await adapter.identifySpecies({
        image: 'base64-data',
        isUrl: false,
        mimeType: 'image/jpeg',
        maxSuggestions: 3,
        organs: ['leaf'],
      })

      expect(result.success).toBe(true)
      expect(result.suggestions).toHaveLength(1)
      expect(result.suggestions[0].commonName).toBe('Rose')
    })

    it('should handle identification failure response', async () => {
      const mockAiResponse = {
        response: {
          text: () =>
            JSON.stringify({
              success: false,
              error: 'Not a plant',
            }),
        },
      }
      const genAIInstance = new GoogleGenerativeAI(mockApiKey)
      const model = genAIInstance.getGenerativeModel({ model: 'any' })
      vi.mocked(model.generateContent).mockResolvedValue(mockAiResponse as any)

      const result = await adapter.identifySpecies({ image: 'data', isUrl: false })
      expect(result.success).toBe(false)
      expect(result.error).toBe('Not a plant')
    })

    it('should handle API errors', async () => {
      const genAIInstance = new GoogleGenerativeAI(mockApiKey)
      const model = genAIInstance.getGenerativeModel({ model: 'any' })
      vi.mocked(model.generateContent).mockRejectedValue(new Error('Quota exceeded'))

      const result = await adapter.identifySpecies({ image: 'data', isUrl: false })
      expect(result.success).toBe(false)
      expect(result.error).toBe('Quota exceeded')
    })

    it('should return error if no API key is set', async () => {
      const noKeyAdapter = new GeminiPlantAdapter('')
      const result = await noKeyAdapter.identifySpecies({ image: 'data', isUrl: false })
      expect(result.success).toBe(false)
      expect(result.error).toContain('missing API key')
    })

    it('should handle markdown wrapped JSON response', async () => {
      const mockAiResponse = {
        response: {
          text: () => '```json\n{"success": true, "suggestions": []}\n```',
        },
      }
      const genAIInstance = new GoogleGenerativeAI(mockApiKey)
      const model = genAIInstance.getGenerativeModel({ model: 'any' })
      vi.mocked(model.generateContent).mockResolvedValue(mockAiResponse as any)

      const result = await adapter.identifySpecies({ image: 'data', isUrl: false })
      expect(result.success).toBe(true)
    })

    it('should handle plain markdown wrapped JSON response', async () => {
      const mockAiResponse = {
        response: {
          text: () => '```\n{"success": true, "suggestions": []}\n```',
        },
      }
      const genAIInstance = new GoogleGenerativeAI(mockApiKey)
      const model = genAIInstance.getGenerativeModel({ model: 'any' })
      vi.mocked(model.generateContent).mockResolvedValue(mockAiResponse as any)

      const result = await adapter.identifySpecies({ image: 'data', isUrl: false })
      expect(result.success).toBe(true)
    })

    it('should handle invalid JSON response', async () => {
      const mockAiResponse = {
        response: {
          text: () => 'Not JSON at all',
        },
      }
      const genAIInstance = new GoogleGenerativeAI(mockApiKey)
      const model = genAIInstance.getGenerativeModel({ model: 'any' })
      vi.mocked(model.generateContent).mockResolvedValue(mockAiResponse as any)

      const result = await adapter.identifySpecies({ image: 'data', isUrl: false })
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid AI response format')
    })

    it('should identify from image URL', async () => {
      const mockAiResponse = {
        response: {
          text: () => JSON.stringify({ success: true, suggestions: [] }),
        },
      }
      const genAIInstance = new GoogleGenerativeAI(mockApiKey)
      const model = genAIInstance.getGenerativeModel({ model: 'any' })
      vi.mocked(model.generateContent).mockResolvedValue(mockAiResponse as any)

      // Mock ssrf validator
      vi.spyOn(ssrfValidator, 'isSafeUrl').mockResolvedValue(true)

      // Mock fetch
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
        headers: { get: () => 'image/png' },
      })
      vi.stubGlobal('fetch', mockFetch)

      const result = await adapter.identifySpecies({
        image: 'http://example.com/p.png',
        isUrl: true,
      })

      expect(result.success).toBe(true)
      expect(mockFetch).toHaveBeenCalledTimes(1)
      const [url, options] = mockFetch.mock.calls[0]
      expect(url).toBe('http://example.com/p.png')
      // options might be undefined if not passed, but we expect it to be passed
      expect(options).toEqual({ redirect: 'error' })
      vi.unstubAllGlobals()
    })

    it('should identify with location context', async () => {
      const mockAiResponse = {
        response: {
          text: () => JSON.stringify({ success: true, suggestions: [] }),
        },
      }
      const genAIInstance = new GoogleGenerativeAI(mockApiKey)
      const model = genAIInstance.getGenerativeModel({ model: 'any' })
      vi.mocked(model.generateContent).mockResolvedValue(mockAiResponse as any)

      await adapter.identifySpecies({
        image: 'data',
        isUrl: false,
        location: { latitude: 45, longitude: 6, country: 'France' },
      })

      expect(model.generateContent).toHaveBeenCalledWith(
        expect.arrayContaining([expect.stringContaining('Location context: France')]),
      )

      await adapter.identifySpecies({
        image: 'data',
        isUrl: false,
        location: { latitude: 45, longitude: 6 },
      })

      expect(model.generateContent).toHaveBeenCalledWith(
        expect.arrayContaining([expect.stringContaining('Location context: 45, 6')]),
      )
    })

    it('should handle fetch errors for image URL', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: false, statusText: 'Not Found' })
      vi.stubGlobal('fetch', mockFetch)

      const result = await adapter.identifySpecies({
        image: 'http://error.com',
        isUrl: true,
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Failed to fetch image')
      vi.unstubAllGlobals()
    })

    it('should throw error for unsafe image URL', async () => {
      // Mock ssrf validator to return false
      vi.spyOn(ssrfValidator, 'isSafeUrl').mockResolvedValue(false)

      const result = await adapter.identifySpecies({
        image: 'http://internal.safe/malicious.jpg',
        isUrl: true,
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('unsafe image URL')
    })
  })

  describe('diagnoseHealth', () => {
    it('should diagnose health successfully', async () => {
      const mockAiResponse = {
        response: {
          text: () =>
            JSON.stringify({
              success: true,
              isHealthy: false,
              confidence: 0.8,
              condition: {
                name: 'Leaf Spot',
                type: 'DISEASE',
                severity: 'LOW',
              },
              affectedParts: ['leaves'],
              symptoms: ['spots'],
              causes: ['fungus'],
              treatments: [{ priority: 1, action: 'Spray', instructions: 'Weekly' }],
            }),
        },
      }

      const genAIInstance = new GoogleGenerativeAI(mockApiKey)
      const model = genAIInstance.getGenerativeModel({ model: 'any' })
      vi.mocked(model.generateContent).mockResolvedValue(mockAiResponse as any)

      const result = await adapter.diagnoseHealth({
        image: 'data',
        isUrl: false,
        plantName: 'My Tomato',
        symptomDescription: 'Spots on leaves',
      })

      expect(result.condition?.name).toBe('Leaf Spot')
    })

    it('should use default empty arrays for symptoms and causes if missing from AI response', async () => {
      const mockAiResponse = {
        response: {
          text: () =>
            JSON.stringify({
              success: true,
              isHealthy: false,
              confidence: 0.8,
              condition: {
                name: 'Disease',
                type: 'DISEASE',
                severity: 'LOW',
              },
              affectedParts: ['leaves'],
              // symptoms and causes MISSING
              treatments: [],
            }),
        },
      }

      const genAIInstance = new GoogleGenerativeAI(mockApiKey)
      const model = genAIInstance.getGenerativeModel({ model: 'any' })
      vi.mocked(model.generateContent).mockResolvedValue(mockAiResponse as any)

      const result = await adapter.diagnoseHealth({ image: 'data', isUrl: false })

      expect(result.success).toBe(true)
      expect(result.symptoms).toEqual([])
      expect(result.causes).toEqual([])
    })

    it('should diagnose health with all optional fields', async () => {
      const mockAiResponse = {
        response: {
          text: () =>
            JSON.stringify({
              success: true,
              isHealthy: false,
              confidence: 0.8,
              condition: {
                name: 'Leaf Spot',
                type: 'DISEASE',
                severity: 'LOW',
                scientificName: 'Septoria lycopersici',
              },
              affectedParts: ['leaves'],
              symptoms: ['spots'],
              causes: ['fungus'],
              treatments: [
                { priority: 1, action: 'Spray', instructions: 'Weekly', products: ['Neem Oil'] },
              ],
              organicTreatment: 'Neem oil',
              chemicalTreatment: 'Copper fungicide',
              recoveryTimeWeeks: 2,
              notes: 'Keep leaves dry',
            }),
        },
      }

      const genAIInstance = new GoogleGenerativeAI(mockApiKey)
      const model = genAIInstance.getGenerativeModel({ model: 'any' })
      vi.mocked(model.generateContent).mockResolvedValue(mockAiResponse as any)

      const result = await adapter.diagnoseHealth({ image: 'data', isUrl: false })

      expect(result.success).toBe(true)
      expect(result.condition?.scientificName).toBe('Septoria lycopersici')
      expect(result.organicTreatment).toBe('Neem oil')
      expect(result.chemicalTreatment).toBe('Copper fungicide')
      expect(result.recoveryTimeWeeks).toBe(2)
      expect(result.notes).toBe('Keep leaves dry')
    })

    it('should handle diagnosis failure response', async () => {
      const mockAiResponse = {
        response: {
          text: () =>
            JSON.stringify({
              success: false,
              error: 'Poor image quality',
            }),
        },
      }
      const genAIInstance = new GoogleGenerativeAI(mockApiKey)
      const model = genAIInstance.getGenerativeModel({ model: 'any' })
      vi.mocked(model.generateContent).mockResolvedValue(mockAiResponse as any)

      const result = await adapter.diagnoseHealth({ image: 'data', isUrl: false })
      expect(result.success).toBe(false)
      expect(result.error).toBe('Poor image quality')
    })

    it('should handle diagnosis error exception', async () => {
      const genAIInstance = new GoogleGenerativeAI(mockApiKey)
      const model = genAIInstance.getGenerativeModel({ model: 'any' })
      vi.mocked(model.generateContent).mockRejectedValue(new Error('AI Crashed'))

      const result = await adapter.diagnoseHealth({ image: 'data', isUrl: false })
      expect(result.success).toBe(false)
      expect(result.error).toBe('AI Crashed')
    })

    it('should return error if no API key is set for diagnosis', async () => {
      const noKeyAdapter = new GeminiPlantAdapter('')
      const result = await noKeyAdapter.diagnoseHealth({ image: 'data', isUrl: false })
      expect(result.success).toBe(false)
      expect(result.error).toContain('missing API key')
    })

    it('should construct prompt with full care and environment details', async () => {
      const mockAiResponse = {
        response: {
          text: () =>
            JSON.stringify({
              success: true,
              isHealthy: true,
              confidence: 0.9,
              condition: null,
              affectedParts: [],
              symptoms: [],
              causes: [],
              treatments: [],
            }),
        },
      }

      const genAIInstance = new GoogleGenerativeAI(mockApiKey)
      const model = genAIInstance.getGenerativeModel({ model: 'any' })
      vi.mocked(model.generateContent).mockResolvedValue(mockAiResponse as any)

      await adapter.diagnoseHealth({
        image: 'data',
        isUrl: false,
        plantName: 'Fern',
        plantSpecies: 'Nephrolepis exaltata',
        symptomDescription: 'Brown tips',
        symptomDuration: '2 weeks',
        recentCare: {
          watering: 'Every 3 days',
          fertilizing: 'Monthly',
          repotting: 'Last year',
          pestTreatment: 'None',
        },
        environment: {
          indoor: true,
          climate: 'Humid',
          recentWeather: 'Rainy',
        },
      })

      expect(model.generateContent).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.stringContaining('Plant name: Fern'),
          expect.stringContaining('Scientific name: Nephrolepis exaltata'),
          expect.stringContaining('User\'s symptom description: "Brown tips"'),
          expect.stringContaining('Symptoms present for: 2 weeks'),
          expect.stringContaining('Watering: Every 3 days'),
          expect.stringContaining('Fertilizing: Monthly'),
          expect.stringContaining('Recent weather: Rainy'),
          expect.stringContaining('Indoor'),
        ]),
      )
    })

    it('should handle unparseable JSON error from AI', async () => {
      const mockAiResponse = {
        response: { text: () => 'Invalid JSON' },
      }
      const genAIInstance = new GoogleGenerativeAI(mockApiKey)
      const model = genAIInstance.getGenerativeModel({ model: 'any' })
      vi.mocked(model.generateContent).mockResolvedValue(mockAiResponse as any)

      const result = await adapter.diagnoseHealth({ image: 'data', isUrl: false })
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid AI response format')
    })

    it('should handle non-Error exceptions', async () => {
      const genAIInstance = new GoogleGenerativeAI(mockApiKey)
      const model = genAIInstance.getGenerativeModel({ model: 'any' })
      vi.mocked(model.generateContent).mockRejectedValue('String Error')

      const result = await adapter.diagnoseHealth({ image: 'data', isUrl: false })
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unknown error during diagnosis')
    })
    it('should handle failure with undefined error message', async () => {
      const mockAiResponse = {
        response: { text: () => JSON.stringify({ success: false }) },
      }
      const genAIInstance = new GoogleGenerativeAI(mockApiKey)
      const model = genAIInstance.getGenerativeModel({ model: 'any' })
      vi.mocked(model.generateContent).mockResolvedValue(mockAiResponse as any)

      const result = await adapter.diagnoseHealth({ image: 'data', isUrl: false })
      expect(result.success).toBe(false)
      expect(result.error).toBe('Could not diagnose plant')
    })

    it('should map treatment frequency and products', async () => {
      const mockAiResponse = {
        response: {
          text: () =>
            JSON.stringify({
              success: true,
              condition: null,
              affectedParts: [],
              symptoms: [],
              causes: [],
              preventionTips: [],
              urgentActions: [],
              treatments: [
                {
                  priority: 1,
                  action: 'Act',
                  instructions: 'Inst',
                  frequency: 'Daily',
                  products: ['Neem'],
                },
              ],
            }),
        },
      }
      const genAIInstance = new GoogleGenerativeAI(mockApiKey)
      const model = genAIInstance.getGenerativeModel({ model: 'any' })
      vi.mocked(model.generateContent).mockResolvedValue(mockAiResponse as any)

      const result = await adapter.diagnoseHealth({ image: 'data', isUrl: false })
      expect(result.treatments[0].frequency).toBe('Daily')
      expect(result.treatments[0].products).toEqual(['Neem'])
    })

    it('should handle full environment details', async () => {
      const genAIInstance = new GoogleGenerativeAI(mockApiKey)
      const model = genAIInstance.getGenerativeModel({ model: 'any' })
      vi.mocked(model.generateContent).mockResolvedValue({ response: { text: () => '{}' } } as any)

      await adapter.diagnoseHealth({
        image: 'data',
        isUrl: false,
        environment: { indoor: false, climate: 'Tropical', recentWeather: 'Sunny' },
      })

      expect(model.generateContent).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.stringContaining('Outdoor'),
          expect.stringContaining('Tropical climate'),
          expect.stringContaining('Recent weather: Sunny'),
        ]),
      )
    })

    it('should handle partial environment details', async () => {
      const genAIInstance = new GoogleGenerativeAI(mockApiKey)
      const model = genAIInstance.getGenerativeModel({ model: 'any' })
      vi.mocked(model.generateContent).mockResolvedValue({ response: { text: () => '{}' } } as any)

      // Environment present but optional fields missing
      await adapter.diagnoseHealth({
        image: 'data',
        isUrl: false,
        environment: { indoor: true },
      })

      expect(model.generateContent).toHaveBeenCalledWith(
        expect.arrayContaining([expect.stringContaining('Indoor')]),
      )
      // Should NOT contain undefined or "undefined climate"
      const args = vi.mocked(model.generateContent).mock.calls[0][0] as any
      const prompt = args[0]
      expect(prompt).not.toContain('climate')
      expect(prompt).not.toContain('Recent weather')
    })
  })

  describe('isAvailable', () => {
    it('should return true if API responds', async () => {
      const mockAiResponse = { response: { text: () => 'OK' } }
      const genAIInstance = new GoogleGenerativeAI(mockApiKey)
      const model = genAIInstance.getGenerativeModel({ model: 'any' })
      vi.mocked(model.generateContent).mockResolvedValue(mockAiResponse as any)
      const available = await adapter.isAvailable()
      expect(available).toBe(true)
    })

    it('should return false if API fails', async () => {
      const genAIInstance = new GoogleGenerativeAI(mockApiKey)
      const model = genAIInstance.getGenerativeModel({ model: 'any' })
      vi.mocked(model.generateContent).mockRejectedValue(new Error('Down'))

      const available = await adapter.isAvailable()
      expect(available).toBe(false)
    })

    it('should return false if API key is missing', async () => {
      const noKeyAdapter = new GeminiPlantAdapter('')
      const available = await noKeyAdapter.isAvailable()
      expect(available).toBe(false)
    })
  })

  describe('Utilities', () => {
    it('should return model names', () => {
      expect(adapter.getModelName()).toBeDefined()
      expect(adapter.getDiagnosisModelName()).toBeDefined()
    })

    it('getGeminiPlantAdapter stays a singleton', () => {
      const inst1 = getGeminiPlantAdapter()
      const inst2 = getGeminiPlantAdapter()
      expect(inst1).toBe(inst2)
    })

    it('should coerce invalid condition type to DISEASE', () => {
      const type = (adapter as any).validateConditionType('INVALID')
      expect(type).toBe('DISEASE')
    })

    it('should coerce invalid severity to MODERATE', () => {
      const severity = (adapter as any).validateSeverity('INVALID')
      expect(severity).toBe('MODERATE')
    })

    it('should use default mimeType in buildImagePart if not provided', async () => {
      const part = await (adapter as any).buildImagePart('data', false)
      expect(part.inlineData.mimeType).toBe('image/jpeg')
    })

    it('should use default mimeType if content-type header is missing from fetch', async () => {
      vi.spyOn(ssrfValidator, 'isSafeUrl').mockResolvedValue(true)
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
        headers: { get: () => null },
      })
      vi.stubGlobal('fetch', mockFetch)
      const part = await (adapter as any).buildImagePart('http://test.com', true)
      expect(part.inlineData.mimeType).toBe('image/jpeg')
      vi.unstubAllGlobals()
    })
  })
})
