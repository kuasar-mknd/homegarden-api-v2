import { describe, expect, it, vi } from 'vitest'
import { DiagnosePlantUseCase } from '../../application/use-cases/dr-plant/diagnose-plant.use-case.js'
import type { AIDiagnosisPort, DiagnoseHealthResult } from '../../application/ports/ai-diagnosis.port.js'
import { ok, fail } from '../../shared/types/result.type.js'

describe('DiagnosePlantUseCase', () => {
  // Mock the AI Port
  const mockAiPort = {
    diagnoseHealth: vi.fn(),
    isAvailable: vi.fn(),
    getModelName: vi.fn(),
  } as unknown as AIDiagnosisPort

  const useCase = new DiagnosePlantUseCase(mockAiPort)

  it('should return error if image buffer is empty', async () => {
    const result = await useCase.execute(Buffer.from(''), 'image/jpeg')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.message).toContain('Image is required')
    }
  })

  it('should call AI service and return success', async () => {
    // Setup mock return
    const mockDiagnosis: DiagnoseHealthResult = {
      success: true,
      isHealthy: false,
      confidence: 0.95,
      condition: {
        name: 'Test Disease',
        type: 'DISEASE',
        severity: 'MODERATE'
      },
      affectedParts: ['leaves'],
      symptoms: ['yellow leaves'],
      causes: ['too much water'],
      treatments: [{ priority: 1, action: 'water less', instructions: '...' }],
      preventionTips: ["don't overwater"],
      urgentActions: [],
      processingTimeMs: 100,
      modelUsed: 'gemini-test'
    }
    vi.mocked(mockAiPort.diagnoseHealth).mockResolvedValueOnce(mockDiagnosis)

    const buffer = Buffer.from('fake-image-data')
    const result = await useCase.execute(buffer, 'image/jpeg', 'yellow leaves')

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.condition?.name).toBe('Test Disease')
    }

    // Verify mock call
    expect(mockAiPort.diagnoseHealth).toHaveBeenCalledWith(
      expect.objectContaining({
        mimeType: 'image/jpeg',
        symptomDescription: 'yellow leaves',
      }),
    )
  })

  it('should handle AI service failure returning success=false', async () => {
    vi.mocked(mockAiPort.diagnoseHealth).mockResolvedValueOnce({
      success: false,
      error: 'AI Error',
    } as any)

    const result = await useCase.execute(Buffer.from('data'), 'image/png')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.message).toBe('AI Error')
    }
  })

  it('should handle AI service throw', async () => {
    vi.mocked(mockAiPort.diagnoseHealth).mockRejectedValueOnce(new Error('Service Unreachable'))

    const result = await useCase.execute(Buffer.from('data'), 'image/png')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.statusCode).toBe(500)
    }
  })
})
