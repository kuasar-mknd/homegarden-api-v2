import type { Context } from 'hono'
import type { GetUserPublicProfileUseCase } from '../../../application/use-cases/user/get-user-public-profile.use-case.js'
import { logger } from '../../config/logger.js'

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

      const requestedUserId = c.req.param('id')
      if (!requestedUserId) {
        return c.json({ success: false, error: 'BAD_REQUEST', message: 'User ID required' }, 400)
      }

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
