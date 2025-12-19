import type { Plant } from '../../../domain/entities/plant.entity.js'
import type { GardenRepository } from '../../../domain/repositories/garden.repository.js'
import type { PlantRepository } from '../../../domain/repositories/plant.repository.js'
import { AppError } from '../../../shared/errors/app-error.js'
import { fail, ok, type Result } from '../../../shared/types/result.type.js'

interface AddPlantInput {
  userId: string
  nickname?: string
  location: string // Garden name
  speciesInfo?: {
    commonName?: string
    scientificName?: string
    family?: string
    imageUrl?: string
  }
}

export class AddPlantUseCase {
  constructor(
    private readonly gardenRepository: GardenRepository,
    private readonly plantRepository: PlantRepository,
  ) {}

  async execute(input: AddPlantInput): Promise<Result<Plant, AppError>> {
    try {
      if (!input.userId) {
        return fail(new AppError('User ID is required', 400))
      }
      if (!input.location) {
        return fail(new AppError('Location (Garden name) is required', 400))
      }

      // 1. Find or Create Garden
      let garden = await this.gardenRepository.findByUserAndName(input.userId, input.location)

      if (!garden) {
        garden = await this.gardenRepository.create({
          userId: input.userId,
          name: input.location,
          latitude: 0,
          longitude: 0,
          description: 'Auto-created location',
          climate: 'Indoor', // Default assumption
        })
      }

      // 2. Create Plant
      const plant = await this.plantRepository.create({
        gardenId: garden.id,
        nickname: input.nickname || input.speciesInfo?.commonName || 'My Plant',
        commonName: input.speciesInfo?.commonName ?? null,
        scientificName: input.speciesInfo?.scientificName ?? null,
        family: input.speciesInfo?.family ?? null,
        imageUrl: input.speciesInfo?.imageUrl ?? null,
        acquiredDate: new Date(),
      })

      return ok(plant as unknown as Plant) // Casting because Repository Plant entity might slightly differ from Prisma type imported
    } catch (error) {
      console.error('AddPlantUseCase Error:', error)
      return fail(new AppError('Failed to add plant to garden', 500))
    }
  }
}
