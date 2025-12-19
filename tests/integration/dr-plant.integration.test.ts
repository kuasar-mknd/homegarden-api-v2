import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { DrPlantController } from '../../infrastructure/http/controllers/dr-plant.controller.js'
import { DiagnosePlantUseCase } from '../../application/use-cases/dr-plant/diagnose-plant.use-case.js'
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
      treatments: []
    }
    mockUseCase.execute.mockResolvedValue(ok(mockDiagnosis))

    // Prepare multipart form data
    const formData = new FormData()
    const blob = new Blob(['fake-image'], { type: 'image/jpeg' })
    formData.append('image', blob, 'test.jpg')
    formData.append('symptoms', 'yellow spots')

    const res = await app.request('/dr-plant/diagnose', {
      method: 'POST',
      body: formData
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.condition.name).toBe('Leaf Spot')
    
    expect(mockUseCase.execute).toHaveBeenCalledWith(
        expect.any(Buffer),
        'image/jpeg',
        'yellow spots'
    )
  })

  it('should return 400 for missing image', async () => {
    const formData = new FormData()
    formData.append('symptoms', 'nothing')

    const res = await app.request('/dr-plant/diagnose', {
      method: 'POST',
      body: formData
    })

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('VALIDATION_ERROR')
  })
})
