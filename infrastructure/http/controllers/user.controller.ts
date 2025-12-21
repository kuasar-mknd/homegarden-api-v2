import type { Context } from 'hono'
import type { GetUserPublicProfileUseCase } from '../../../application/use-cases/user/get-user-public-profile.use-case.js'
import { logger } from '../../config/logger.js'
import { getProfileSchema } from '../validators/user.validator.js'

export class UserController {
  constructor(private readonly getUserPublicProfileUseCase: GetUserPublicProfileUseCase) {}

  /**
   * GET /:id
   * Get public user profile
   */
  getProfile = async (c: Context) => {
    try {
      // Auth Check: To see a profile, you must be logged in (social feature)
      const user = c.get('user')
      if (!user) {
        return c.json({ success: false, error: 'UNAUTHORIZED' }, 401)
      }

      const paramResult = getProfileSchema.safeParse(c.req.param())
      if (!paramResult.success) {
        return c.json(
          { success: false, error: 'BAD_REQUEST', message: 'Invalid User ID' },
          400,
        )
      }

      const { id: requestedUserId } = paramResult.data

      const result = await this.getUserPublicProfileUseCase.execute({
        userId: requestedUserId,
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
      logger.error({ err: error }, 'User Profile Error')
      return c.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to fetch user profile',
        },
        500,
      )
    }
  }
}
