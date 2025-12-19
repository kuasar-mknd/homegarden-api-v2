import type { Garden, Plant } from '@prisma/client'
import { prisma } from '../../../infrastructure/database/prisma.client.js'
import { AppError } from '../../../shared/errors/app-error.js'
import { fail, ok, type Result } from '../../../shared/types/result.type.js'

type PlantWithGarden = Plant & { garden: Garden }

export class GetUserPlantsUseCase {
  async execute(userId: string): Promise<Result<PlantWithGarden[], AppError>> {
    try {
      if (!userId) {
        return fail(new AppError('User ID is required', 400))
      }

      const plants = await prisma.plant.findMany({
        where: {
          garden: {
            userId: userId,
          },
        },
        include: {
          garden: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return ok(plants)
    } catch (error) {
      console.error('GetUserPlantsUseCase Error:', error)
      return fail(new AppError('Failed to fetch user plants', 500))
    }
  }
}
