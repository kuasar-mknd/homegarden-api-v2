import type { Plant } from '../../../domain/entities/plant.entity.js'
import type { PlantRepository } from '../../../domain/repositories/plant.repository.js'
import { AppError } from '../../../shared/errors/app-error.js'
import { fail, ok, type Result } from '../../../shared/types/result.type.js'

export class GetUserPlantsUseCase {
  constructor(private readonly plantRepository: PlantRepository) {}

  async execute(userId: string): Promise<Result<Plant[], AppError>> {
    try {
      if (!userId) {
        return fail(new AppError('User ID is required', 400))
      }

      const plants = await this.plantRepository.findByUserId(userId)
      // console.log('DEBUG: Plants retrieved:', plants)
      if (!plants) throw new Error('Repo returned undefined')
      return ok(plants)
    } catch (error) {
      console.error('GetUserPlantsUseCase Error:', error)
      return fail(new AppError('Failed to fetch user plants', 500))
    }
  }
}
