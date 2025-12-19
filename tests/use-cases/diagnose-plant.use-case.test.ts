import { describe, expect, it, vi } from 'vitest'
import { DiagnosePlantUseCase } from '../../application/use-cases/dr-plant/diagnose-plant.use-case.js'
import type { AIDiagnosisPort } from '../../infrastructure/external-services/ports/ai-diagnosis.port.js'

describe('DiagnosePlantUseCase', () => {
  // Mock the AI Port
  const mockAiPort = {
    diagnoseHealth: vi.fn(),
    identifySpecies: vi.fn(), // Not used here but part of interface
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
    const mockDiagnosis = {
      success: true,
      diagnosis: {
        isHealthy: false,
        diseaseName: 'Test Disease',
        confidence: 0.95,
        treatment: 'water it',
        prevention: "don't underwater",
        symptoms: ['yellow leaves'],
      },
    }
    vi.mocked(mockAiPort.diagnoseHealth).mockResolvedValueOnce(mockDiagnosis as any)

    const buffer = Buffer.from('fake-image-data')
    const result = await useCase.execute(buffer, 'image/jpeg', 'yellow leaves')

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.diagnosis.diseaseName).toBe('Test Disease')
    }

    // Verify mock call
    expect(mockAiPort.diagnoseHealth).toHaveBeenCalledWith(
      expect.objectContaining({
        mimeType: 'image/jpeg',
        symptomDescription: 'yellow leaves',
      }),
    )
  })

  it('should handle AI service failure', async () => {
    vi.mocked(mockAiPort.diagnoseHealth).mockResolvedValueOnce({
      success: false,
      error: 'AI Error',
    })

    const result = await useCase.execute(Buffer.from('data'), 'image/png')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.message).toBe('AI Error')
    }
  })
})
