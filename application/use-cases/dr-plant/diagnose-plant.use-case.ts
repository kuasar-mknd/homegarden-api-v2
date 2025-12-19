
import { ok, fail, type Result } from '../../../shared/types/result.type.js'
import { AppError } from '../../../shared/errors/app-error.js'
import type { AIDiagnosisPort, DiagnoseHealthResult } from '../../ports/ai-diagnosis.port.js'
import { getGeminiPlantAdapter } from '../../../infrastructure/external-services/gemini-plant.adapter.js'

export class DiagnosePlantUseCase {
  private aiPort: AIDiagnosisPort

  constructor(aiPort?: AIDiagnosisPort) {
    this.aiPort = aiPort || getGeminiPlantAdapter()
  }

  async execute(
    imageBuffer: Buffer,
    mimeType: string,
    symptomDescription?: string
  ): Promise<Result<DiagnoseHealthResult, AppError>> {
    try {
      if (!imageBuffer || imageBuffer.length === 0) {
        return fail(new AppError('Image is required for diagnosis', 400))
      }

      // Convert buffer to base64
      const imageBase64 = imageBuffer.toString('base64')

      const request: any = {
        image: imageBase64,
        isUrl: false,
        mimeType,
      }
      
      if (symptomDescription) {
        request.symptomDescription = symptomDescription
      }

      const result = await this.aiPort.diagnoseHealth(request)

      if (!result.success) {
        return fail(new AppError(result.error || 'Diagnosis failed', 500))
      }

      return ok(result)
    } catch (error) {
      console.error('UseCase Error:', error)
      return fail(new AppError('Internal server error during diagnosis', 500))
    }
  }
}
