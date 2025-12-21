import { beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  AIIdentificationPort,
  IdentifySpeciesResult,
} from '../../application/ports/ai-identification.port.js'
import {
  createIdentifySpeciesUseCase,
  type IdentifySpeciesInput,
  IdentifySpeciesUseCase,
} from '../../application/use-cases/plant-id/identify-species.use-case.js'

describe('IdentifySpeciesUseCase', () => {
  let useCase: IdentifySpeciesUseCase
  let mockAiIdentification: AIIdentificationPort

  beforeEach(() => {
    mockAiIdentification = {
      identifySpecies: vi.fn(),
      isAvailable: vi.fn(),
      getModelName: vi.fn(),
    }
    useCase = new IdentifySpeciesUseCase(mockAiIdentification)
  })

  it('should identify a plant successfully', async () => {
    const input: IdentifySpeciesInput = {
      imageBase64: 'fake-base64',
      mimeType: 'image/jpeg',
      maxSuggestions: 3,
      organs: ['leaf'],
      location: { latitude: 45, longitude: 6 },
    }

    const mockResult: IdentifySpeciesResult = {
      success: true,
      suggestions: [
        {
          confidence: 0.9,
          commonName: 'Rose',
          scientificName: 'Rosa',
          family: 'Rosaceae',
          genus: 'Rosa',
          description: 'A beautiful flower',
          origin: 'Asia',
          imageUrl: 'http://example.com/rose.jpg',
        },
      ],
      processingTimeMs: 100,
      modelUsed: 'gemini-pro-vision',
    }

    vi.mocked(mockAiIdentification.identifySpecies).mockResolvedValue(mockResult)

    const result = await useCase.execute(input)

    expect(result.success).toBe(true)
    if (result.success) {
      const output = result.data
      expect(output.success).toBe(true)
      expect(output.suggestions).toHaveLength(1)
      expect(output.suggestions[0].commonName).toBe('Rose')
      expect(output.modelUsed).toBe('gemini-pro-vision')
    }
    expect(mockAiIdentification.identifySpecies).toHaveBeenCalledWith({
      image: 'fake-base64',
      isUrl: false,
      mimeType: 'image/jpeg',
      maxSuggestions: 3,
      organs: ['leaf'],
      location: { latitude: 45, longitude: 6 },
    })
  })

  it('should identify from imageUrl', async () => {
    const input: IdentifySpeciesInput = {
      imageUrl: 'http://example.com/plant.jpg',
    }

    vi.mocked(mockAiIdentification.identifySpecies).mockResolvedValue({
      success: true,
      suggestions: [],
      processingTimeMs: 50,
      modelUsed: 'test-model',
    })

    const result = await useCase.execute(input)
    expect(result.success).toBe(true)
    expect(mockAiIdentification.identifySpecies).toHaveBeenCalledWith(
      expect.objectContaining({
        image: 'http://example.com/plant.jpg',
        isUrl: true,
      }),
    )
  })

  it('should return error if no image is provided', async () => {
    const input: IdentifySpeciesInput = {}

    const result = await useCase.execute(input)

    expect(result.success).toBe(false)
    if (!result.success) {
      const error = result.error
      expect(error.message).toBe('Either imageBase64 or imageUrl is required')
      expect(error.statusCode).toBe(400)
    }
  })

  it('should handle AI service failure', async () => {
    const input: IdentifySpeciesInput = { imageBase64: 'data' }

    vi.mocked(mockAiIdentification.identifySpecies).mockResolvedValue({
      success: false,
      error: 'AI Error',
      suggestions: [],
      processingTimeMs: 10,
      modelUsed: 'dummy',
    })

    const result = await useCase.execute(input)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe('IDENTIFICATION_FAILED')
    }
  })

  it('should handle AI service failure without error message', async () => {
    const input: IdentifySpeciesInput = { imageBase64: 'data' }
    vi.mocked(mockAiIdentification.identifySpecies).mockResolvedValue({
      success: false,
    } as any)

    const result = await useCase.execute(input)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.message).toBe('Plant identification failed')
    }
  })

  it('should identify a plant successfully with sparse suggestion', async () => {
    const input: IdentifySpeciesInput = { imageBase64: 'data' }
    const mockResult: IdentifySpeciesResult = {
      success: true,
      suggestions: [
        {
          confidence: 0.5,
          commonName: 'Weed',
          scientificName: 'Unknown',
          family: 'Unknown',
        },
      ],
      processingTimeMs: 10,
      modelUsed: 'test',
    }

    vi.mocked(mockAiIdentification.identifySpecies).mockResolvedValue(mockResult)

    const result = await useCase.execute(input)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.suggestions[0].genus).toBeUndefined()
    }
  })

  it('should handle unexpected exceptions', async () => {
    const input: IdentifySpeciesInput = { imageBase64: 'data' }

    vi.mocked(mockAiIdentification.identifySpecies).mockRejectedValue(new Error('Unexpected crash'))

    const result = await useCase.execute(input)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.message).toBe('Unexpected crash')
      expect(result.error.code).toBe('IDENTIFICATION_ERROR')
    }
  })

  it('should handle unknown error types', async () => {
    const input: IdentifySpeciesInput = { imageBase64: 'data' }

    vi.mocked(mockAiIdentification.identifySpecies).mockRejectedValue('something weird')

    const result = await useCase.execute(input)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.message).toBe('Unknown identification error')
    }
  })

  describe('Factory', () => {
    it('createIdentifySpeciesUseCase should create an instance', () => {
      const instance = createIdentifySpeciesUseCase(mockAiIdentification)
      expect(instance).toBeInstanceOf(IdentifySpeciesUseCase)
    })
  })
})
