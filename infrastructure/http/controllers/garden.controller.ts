import type { Context } from 'hono'
import type { AddPlantUseCase } from '../../../application/use-cases/garden/add-plant.use-case.js'
import type { GetUserPlantsUseCase } from '../../../application/use-cases/garden/get-user-plants.use-case.js'
import type { GetGardenWeatherUseCase } from '../../../application/use-cases/garden/get-garden-weather.use-case.js'
import type { FindNearbyGardensUseCase } from '../../../application/use-cases/garden/find-nearby-gardens.use-case.js'

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

      const body = await c.req.json()

      const result = await this.addPlantUseCase.execute({
        userId: user.id,
        nickname: body.nickname,
        location: body.location,
        speciesInfo: body.speciesInfo,
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
      console.error('Garden Controller Error:', error)
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
      console.error('Garden Controller Error:', error)
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

      const gardenId = c.req.param('gardenId')
      if (!gardenId) {
        return c.json({ success: false, error: 'BAD_REQUEST', message: 'Garden ID required' }, 400)
      }

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
      console.error('Garden Weather Error:', error)
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
      // Optional: Require auth? Previous discussion suggested it's a social feature.
      // Usually social features require auth.
      const user = c.get('user')
      if (!user) {
        return c.json({ success: false, error: 'UNAUTHORIZED' }, 401)
      }

      const lat = parseFloat(c.req.query('lat') || '')
      const lng = parseFloat(c.req.query('lng') || '')
      const radius = parseFloat(c.req.query('radius') || '10')
      const limit = parseInt(c.req.query('limit') || '50', 10)

      if (isNaN(lat) || isNaN(lng)) {
        return c.json({ success: false, error: 'BAD_REQUEST', message: 'Valid latitude and longitude required' }, 400)
      }

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
      console.error('Garden Nearby Error:', error)
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
