import type { Context } from 'hono'
import type { AddPlantUseCase } from '../../../application/use-cases/garden/add-plant.use-case.js'
import type { FindNearbyGardensUseCase } from '../../../application/use-cases/garden/find-nearby-gardens.use-case.js'
import type { GetGardenWeatherUseCase } from '../../../application/use-cases/garden/get-garden-weather.use-case.js'
import type { GetUserPlantsUseCase } from '../../../application/use-cases/garden/get-user-plants.use-case.js'
import { logger } from '../../config/logger.js'
import { gardenIdSchema, nearbyGardenSchema } from '../validators/garden.validator.js'

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
        return c.json({ success: false, error: 'UNAUTHORIZED' }, 401)
      }

      const body = c.req.valid('json')

      const result = await this.addPlantUseCase.execute({
        userId: user.id,
        nickname: body.nickname,
        location: body.location,
        speciesInfo: {
          commonName: body.commonName,
          scientificName: body.scientificName,
          family: body.family,
          imageUrl: body.imageUrl,
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
          data: result.data,
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
        return c.json({ success: false, error: 'UNAUTHORIZED' }, 401)
      }

      const result = await this.getUserPlantsUseCase.execute(user.id)

      if (!result.success) {
        return c.json(
          {
            success: false,
            error: 'INTERNAL_ERROR',
            message: result.error.message,
          },
          500,
        )
      }

      return c.json(
        {
          success: true,
          data: result.data,
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
        return c.json({ success: false, error: 'UNAUTHORIZED' }, 401)
      }

      const paramResult = gardenIdSchema.safeParse(c.req.param())
      if (!paramResult.success) {
        return c.json(
          { success: false, error: 'BAD_REQUEST', message: 'Invalid Garden ID' },
          400,
        )
      }

      const { gardenId } = paramResult.data

      const result = await this.getGardenWeatherUseCase.execute(gardenId, user.id)

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
        return c.json({ success: false, error: 'UNAUTHORIZED' }, 401)
      }

      const queryResult = nearbyGardenSchema.safeParse(c.req.query())

      if (!queryResult.success) {
        return c.json(
          {
            success: false,
            error: 'BAD_REQUEST',
            message: queryResult.error.issues[0].message,
          },
          400,
        )
      }

      const { lat, lng, radius, limit } = queryResult.data

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
}
