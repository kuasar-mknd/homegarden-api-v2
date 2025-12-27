import { logger } from '../../../infrastructure/config/logger.js'
import { getGeminiPlantAdapter } from '../../../infrastructure/external-services/gemini-plant.adapter.js'
import { AppError } from '../../../shared/errors/app-error.js'
import { fail, ok, type Result } from '../../../shared/types/result.type.js'
import type { AIDiagnosisPort, DiagnoseHealthResult } from '../../ports/ai-diagnosis.port.js'

export class DiagnosePlantUseCase {
  private aiPort: AIDiagnosisPort

  constructor(aiPort?: AIDiagnosisPort) {
    this.aiPort = aiPort || getGeminiPlantAdapter()
  }

  async execute(
    imageBuffer: Buffer,
    mimeType: string,
    symptomDescription?: string,
  ): Promise<Result<DiagnoseHealthResult, AppError>> {
    try {
      if (!imageBuffer || imageBuffer.length === 0) {
        return fail(new AppError('Image is required for diagnosis', 400))
      }

      // Convert buffer to base64
      const imageBase64 = imageBuffer.toString('base64')

      // biome-ignore lint/suspicious/noExplicitAny: Google AI dynamic type
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
        // Pass through status code if available in the result (casted to any as it's not in the interface yet)
        const statusCode = (result as any).statusCode || 500
        return fail(
          new AppError(result.error || 'Diagnosis failed', statusCode, 'DIAGNOSIS_FAILED'),
        )
      }

      return ok(result)
    } catch (error) {
      logger.error({ err: error }, 'UseCase Error')
      return fail(new AppError('Internal server error during diagnosis', 500))
    }
  }
}
