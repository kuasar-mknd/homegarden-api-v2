import { AppError } from '../../../shared/errors/app-error.js'
import { fail, ok, type Result } from '../../../shared/types/result.type.js'
import type { Garden } from '../../../domain/entities/garden.entity.js'
import type { GardenRepository } from '../../../domain/repositories/garden.repository.js'

export interface FindNearbyGardensInput {
  latitude: number
  longitude: number
  radiusKm?: number
  limit?: number
}

export interface FindNearbyGardensOutput {
  gardens: Garden[]
}

export class FindNearbyGardensUseCase {
  constructor(private readonly gardenRepository: GardenRepository) {}

  async execute(input: FindNearbyGardensInput): Promise<Result<FindNearbyGardensOutput, AppError>> {
    // Validate input
    if (input.latitude === undefined || input.longitude === undefined) {
      return fail(new AppError('Latitude and longitude are required', 400, 'BAD_REQUEST'))
    }
    if (input.latitude < -90 || input.latitude > 90) {
      return fail(new AppError('Invalid latitude', 400, 'BAD_REQUEST'))
    }
    if (input.longitude < -180 || input.longitude > 180) {
      return fail(new AppError('Invalid longitude', 400, 'BAD_REQUEST'))
    }

    try {
      const gardens = await this.gardenRepository.findNearby({
        latitude: input.latitude,
        longitude: input.longitude,
        radiusKm: input.radiusKm ?? 10,
        limit: input.limit ?? 50
      })

      return ok({ gardens })
    } catch (error) {
      console.error('FindNearbyGardensUseCase Error:', error)
      return fail(new AppError('Failed to find nearby gardens', 500, 'INTERNAL_ERROR'))
    }
  }
}
