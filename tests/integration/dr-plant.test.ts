import { beforeEach, describe, expect, it, vi } from 'vitest'
import app from '../../index.js'

// Mock the Gemini adapter factory
const { mockDiagnoseHealth } = vi.hoisted(() => {
  return { mockDiagnoseHealth: vi.fn() }
})

vi.mock('../../infrastructure/external-services/gemini-plant.adapter.js', () => ({
  getGeminiPlantAdapter: () => ({
    diagnoseHealth: mockDiagnoseHealth,
  }),
}))

// Mock Supabase
const mockGetUser = vi.fn()
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
}))

describe('Dr. Plant Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Setup default auth mock
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          email: 'test@example.com',
          user_metadata: { full_name: 'Test User' },
        },
      },
      error: null,
    })
  })

  it('should diagnose a plant successfully from image', async () => {
    // Mock successful AI response
    const mockDiagnosis = {
      isPlant: true,
      name: 'Tomato',
      health: 'Sick',
      diseases: ['Early Blight'],
      treatment: 'Apply fungicide',
      confidence: 0.95,
      rawAnalysis: 'Detailed analysis...',
    }
    mockDiagnoseHealth.mockResolvedValue({ success: true, ...mockDiagnosis })

    // Create a dummy image buffer
    const imageBuffer = Buffer.from('fake-image-data')
    const blob = new Blob([imageBuffer], { type: 'image/jpeg' })
    const formData = new FormData()
    formData.append('image', blob as any, 'plant.jpg')
    formData.append('symptoms', 'Yellow leaves')

    const res = await app.request('/api/v2/dr-plant/diagnose', {
      method: 'POST',
      body: formData,
      headers: { Authorization: 'Bearer valid-token' },
    })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toEqual(expect.objectContaining(mockDiagnosis))
    expect(json.data.success).toBe(true)
    expect(mockDiagnoseHealth).toHaveBeenCalled()
  })

  it('should return 400 if image is missing', async () => {
    const formData = new FormData()
    formData.append('symptoms', 'Yellow leaves')

    const res = await app.request('/api/v2/dr-plant/diagnose', {
      method: 'POST',
      body: formData,
      headers: { Authorization: 'Bearer valid-token' },
    })

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('VALIDATION_ERROR')
  })

  it('should return 400 if file type is invalid', async () => {
    const textBuffer = Buffer.from('not-an-image')
    const blob = new Blob([textBuffer], { type: 'text/plain' })
    const formData = new FormData()
    formData.append('image', blob as any, 'notes.txt')

    const res = await app.request('/api/v2/dr-plant/diagnose', {
      method: 'POST',
      body: formData,
      headers: { Authorization: 'Bearer valid-token' },
    })

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.message).toContain('Invalid image type')
  })

  it('should handle AI service errors gracefully', async () => {
    mockDiagnoseHealth.mockResolvedValue({
      success: false,
      error: 'AI Model Overloaded',
      statusCode: 503,
    })

    const imageBuffer = Buffer.from('fake-image-data')
    const blob = new Blob([imageBuffer], { type: 'image/jpeg' })
    const formData = new FormData()
    formData.append('image', blob as any, 'plant.jpg')

    const res = await app.request('/api/v2/dr-plant/diagnose', {
      method: 'POST',
      body: formData,
      headers: { Authorization: 'Bearer valid-token' },
    })

    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toBe('INTERNAL_ERROR')
    expect(json.message).toBe('AI Model Overloaded')
  })
})
