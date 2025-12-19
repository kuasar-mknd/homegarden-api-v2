import { ok, fail, type Result } from '../../../shared/types/result.type.js'
import { AppError } from '../../../shared/errors/app-error.js'
import { prisma } from '../../../infrastructure/database/prisma.client.js'
import type { Plant } from '@prisma/client'

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
  async execute(input: AddPlantInput): Promise<Result<Plant, AppError>> {
    try {
      if (!input.userId) {
        return fail(new AppError('User ID is required', 400))
      }
      if (!input.location) {
        return fail(new AppError('Location (Garden name) is required', 400))
      }

      // 1. Find or Create Garden
      // We look for a garden with the given name for this user
      // If not found, we create a default "indoor/virtual" garden with (0,0) coords
      let garden = await prisma.garden.findFirst({
        where: {
          userId: input.userId,
          name: input.location
        }
      })

      if (!garden) {
        garden = await prisma.garden.create({
          data: {
            userId: input.userId,
            name: input.location,
            latitude: 0,
            longitude: 0,
            description: 'Auto-created location',
            climate: 'Indoor' // Default assumption
          }
        })
      }

      // 2. Create Plant
      const plant = await prisma.plant.create({
        data: {
          gardenId: garden.id,
          nickname: input.nickname || input.speciesInfo?.commonName || 'My Plant',
          commonName: input.speciesInfo?.commonName ?? null,
          scientificName: input.speciesInfo?.scientificName ?? null,
          family: input.speciesInfo?.family ?? null,
          imageUrl: input.speciesInfo?.imageUrl ?? null,
          acquiredDate: new Date(),
        }
      })

      return ok(plant)

    } catch (error) {
      console.error('AddPlantUseCase Error:', error)
      return fail(new AppError('Failed to add plant to garden', 500))
    }
  }
}
