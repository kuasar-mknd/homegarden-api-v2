
import { ok, fail, type Result } from '../../../shared/types/result.type.js'
import { AppError } from '../../../shared/errors/app-error.js'
import { prisma } from '../../../infrastructure/database/prisma.client.js'
import type { Plant, Garden } from '@prisma/client'

type PlantWithGarden = Plant & { garden: Garden }

export class GetUserPlantsUseCase {
  async execute(userId: string): Promise<Result<PlantWithGarden[]>> {
    try {
      if (!userId) {
        return fail(new AppError('User ID is required', 400))
      }

      const plants = await prisma.plant.findMany({
        where: {
          garden: {
            userId: userId
          }
        },
        include: {
          garden: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return ok(plants)

    } catch (error) {
      console.error('GetUserPlantsUseCase Error:', error)
      return fail(new AppError('Failed to fetch user plants', 500))
    }
  }
}
