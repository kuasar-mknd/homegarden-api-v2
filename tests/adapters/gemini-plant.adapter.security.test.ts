import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GeminiPlantAdapter } from '../../infrastructure/external-services/gemini-plant.adapter.js'
import * as ssrfValidator from '../../shared/utils/ssrf.validator.js'

vi.mock('../../infrastructure/config/env.js', () => ({
  env: {
    GEMINI_IDENTIFICATION_MODEL: 'gemini-1.5-flash',
    GEMINI_DIAGNOSIS_MODEL: 'gemini-1.5-pro',
    GOOGLE_AI_API_KEY: 'test-key',
  },
}))

// Hoist the mock function
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

describe('GeminiPlantAdapter Security', () => {
  let adapter: GeminiPlantAdapter

  beforeEach(() => {
    vi.clearAllMocks()
    adapter = new GeminiPlantAdapter('test-key')

    mockGenerateContent.mockResolvedValue({
        response: { text: () => JSON.stringify({ success: true, suggestions: [] }) }
    })
  })

  it('should throw "Image too large" when image stream exceeds size limit (DoS prevention)', async () => {
    vi.spyOn(ssrfValidator, 'isSafeUrl').mockResolvedValue(true)

    const largeStream = new ReadableStream({
        start(controller) {
            for (let i = 0; i < 11; i++) {
                controller.enqueue(new Uint8Array(1024 * 1024));
            }
            controller.close();
        }
    });

    const mockResponse = {
      ok: true,
      headers: {
          get: (name: string) => name === 'content-type' ? 'image/jpeg' : null
      },
      body: largeStream,
      arrayBuffer: async () => {
         return new ArrayBuffer(11 * 1024 * 1024);
      }
    };

    const mockFetch = vi.fn().mockResolvedValue(mockResponse);
    vi.stubGlobal('fetch', mockFetch);

    const result = await adapter.identifySpecies({
        image: 'http://example.com/large.jpg',
        isUrl: true
    });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Image too large/i);

    vi.unstubAllGlobals();
  })
})
