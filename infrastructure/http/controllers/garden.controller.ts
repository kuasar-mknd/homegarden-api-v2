import type { Context } from 'hono'
import type { AddPlantUseCase } from '../../../application/use-cases/garden/add-plant.use-case.js'
import type { GetUserPlantsUseCase } from '../../../application/use-cases/garden/get-user-plants.use-case.js'

export class GardenController {
  constructor(
    private readonly addPlantUseCase: AddPlantUseCase,
    private readonly getUserPlantsUseCase: GetUserPlantsUseCase,
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
}
