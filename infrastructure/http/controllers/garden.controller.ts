import type { z } from '@hono/zod-openapi'
import type { Context } from 'hono'
import type { AddPlantUseCase } from '../../../application/use-cases/garden/add-plant.use-case.js'
import type { FindNearbyGardensUseCase } from '../../../application/use-cases/garden/find-nearby-gardens.use-case.js'
import type { GetGardenWeatherUseCase } from '../../../application/use-cases/garden/get-garden-weather.use-case.js'
import type { GetUserPlantsUseCase } from '../../../application/use-cases/garden/get-user-plants.use-case.js'
import type { Plant } from '../../../domain/entities/plant.entity.js'
import { logger } from '../../config/logger.js'
import type { AddPlantInputSchema, NearbyGardensQuerySchema } from '../schemas/garden.schema.js'

export class GardenController {
  constructor(
    private readonly addPlantUseCase: AddPlantUseCase,
    private readonly getUserPlantsUseCase: GetUserPlantsUseCase,
    private readonly getGardenWeatherUseCase: GetGardenWeatherUseCase,
    private readonly findNearbyGardensUseCase: FindNearbyGardensUseCase,
  ) {}

  /**
   * POST /plants
   * Add a new plant to the user's garden
   */
  addPlant = async (c: Context) => {
    try {
      const user = c.get('user')
      if (!user) {
        return c.json(
          { success: false, error: 'UNAUTHORIZED', message: 'User not authenticated' },
          401,
        )
      }

      const body = (await c.req.valid('json' as never)) as z.infer<typeof AddPlantInputSchema>

      const result = await this.addPlantUseCase.execute({
        userId: user.id,
        nickname: body.nickname,
        location: body.location,
        speciesInfo: {
          ...(body.commonName ? { commonName: body.commonName } : {}),
          ...(body.scientificName ? { scientificName: body.scientificName } : {}),
          ...(body.family ? { family: body.family } : {}),
          ...(body.imageUrl ? { imageUrl: body.imageUrl } : {}),
        },
      })

      if (!result.success) {
        const error = result.error
        return c.json(
          {
            success: false,
            error: error.code,
            message: error.message,
          },
          error.statusCode as any,
        )
      }

      return c.json(
        {
          success: true,
          data: {
            plant: this.toDTO(result.data),
          },
        },
        201,
      )
    } catch (error) {
      logger.error({ err: error }, 'Garden Controller Error')
      return c.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to add plant',
        },
        500,
      )
    }
  }

  /**
   * GET /plants
   * Get all plants for the logged-in user
   */
  getPlants = async (c: Context) => {
    try {
      const user = c.get('user')
      if (!user) {
        return c.json(
          { success: false, error: 'UNAUTHORIZED', message: 'User not authenticated' },
          401,
        )
      }

      const result = await this.getUserPlantsUseCase.execute(user.id)

      if (!result.success) {
        return c.json(
          {
            success: false,
            error: 'INTERNAL_ERROR',
            message: result.error?.message || 'Failed to fetch plants',
          },
          500,
        )
      }

      return c.json(
        {
          success: true,
          data: result.data.map((p) => this.toDTO(p)),
        },
        200,
      )
    } catch (error) {
      logger.error({ err: error }, 'Garden Controller Error')
      return c.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to fetch plants',
        },
        500,
      )
    }
  }

  /**
   * GET /:gardenId/weather
   * Get weather forecast for a garden
   */
  getWeather = async (c: Context) => {
    try {
      const user = c.get('user')
      if (!user) {
        return c.json(
          { success: false, error: 'UNAUTHORIZED', message: 'User not authenticated' },
          401,
        )
      }

      const { gardenId } = c.req.valid('param' as never) as { gardenId: string }

      const result = await this.getGardenWeatherUseCase.execute(gardenId, user.id)

      if (!result.success) {
        return c.json(
          {
            success: false,
            error: result.error.code,
            message: result.error.message,
          },
          (result.error as any).statusCode || 500,
        )
      }

      // Optimization: Cache public weather data for 30 minutes
      c.header('Cache-Control', 'public, max-age=1800')

      return c.json(
        {
          success: true,
          data: result.data,
        },
        200,
      )
    } catch (error) {
      logger.error({ err: error }, 'Garden Weather Error')
      return c.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to fetch weather',
        },
        500,
      )
    }
  }

  /**
   * GET /nearby
   * Find gardens nearby
   * Query params: lat, lng, radius (km), limit
   */
  getNearby = async (c: Context) => {
    try {
      const user = c.get('user')
      if (!user) {
        return c.json(
          { success: false, error: 'UNAUTHORIZED', message: 'User not authenticated' },
          401,
        )
      }

      const query = c.req.valid('query' as never) as (typeof NearbyGardensQuerySchema)['_output']
      const { lat, lng, radius, limit } = query

      const result = await this.findNearbyGardensUseCase.execute({
        latitude: lat,
        longitude: lng,
        radiusKm: radius,
        limit,
      })

      if (!result.success) {
        return c.json(
          {
            success: false,
            error: result.error.code,
            message: result.error.message,
          },
          result.error.statusCode as any,
        )
      }

      // Optimization: Cache nearby results for 5 minutes (private to user)
      c.header('Cache-Control', 'private, max-age=300')

      return c.json(
        {
          success: true,
          data: result.data,
        },
        200,
      )
    } catch (error) {
      logger.error({ err: error }, 'Garden Nearby Error')
      return c.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to find nearby gardens',
        },
        500,
      )
    }
  }

  private toDTO(plant: Plant) {
    return {
      id: plant.id,
      nickname: plant.nickname || 'Unnamed Plant',
      commonName: plant.commonName || null,
      scientificName: plant.scientificName || null,
      gardenId: plant.gardenId,
      plantedDate: plant.plantedDate ? plant.plantedDate.toISOString() : null,
      createdAt: plant.createdAt.toISOString(),
      updatedAt: plant.updatedAt.toISOString(),
    }
  }
}
