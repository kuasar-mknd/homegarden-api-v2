import { Hono } from 'hono'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DrPlantController } from '../../infrastructure/http/controllers/dr-plant.controller.js'
import { ok } from '../../shared/types/result.type.js'

describe('DrPlant Integration', () => {
  let app: Hono
  let mockUseCase: any

  beforeEach(() => {
    app = new Hono()
    mockUseCase = { execute: vi.fn() }
    const controller = new DrPlantController(mockUseCase)

    // Setup route
    app.post('/dr-plant/diagnose', controller.diagnose)
  })

  it('should process diagnosis request successfully', async () => {
    const mockDiagnosis = {
      success: true,
      isHealthy: false,
      condition: { name: 'Leaf Spot' },
      symptoms: ['spots'],
      treatments: [],
    }
    mockUseCase.execute.mockResolvedValue(ok(mockDiagnosis))

    // Prepare multipart form data with valid JPEG magic bytes (padded to >12 bytes)
    const jpegMagicBytes = new Uint8Array([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ])
    const blob = new Blob([jpegMagicBytes], { type: 'image/jpeg' })

    const formData = new FormData()
    formData.append('image', blob, 'test.jpg')
    formData.append('symptoms', 'yellow spots')

    const res = await app.request('/dr-plant/diagnose', {
      method: 'POST',
      body: formData,
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.conditionName).toBe('Leaf Spot')

    expect(mockUseCase.execute).toHaveBeenCalledWith(
      expect.any(Buffer),
      'image/jpeg',
      'yellow spots',
    )
  })

  it('should return 400 for missing image', async () => {
    const formData = new FormData()
    formData.append('symptoms', 'nothing')

    const res = await app.request('/dr-plant/diagnose', {
      method: 'POST',
      body: formData,
    })

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('VALIDATION_ERROR')
  })
})
