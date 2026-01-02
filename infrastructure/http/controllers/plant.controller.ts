import type { z } from '@hono/zod-openapi'
import type { Context } from 'hono'
import { logger } from '../../config/logger.js'
import type { PlantCreateSchema, PlantUpdateSchema } from '../schemas/plant.schema.js'

export class PlantController {
  /**
   * POST /
   * Create a new plant
   */
  createPlant = async (c: Context) => {
    try {
      // Validate input even if not implemented yet to enforce contract
      const _body = (await c.req.valid('json' as never)) as z.infer<typeof PlantCreateSchema>

      return c.json(
        {
          success: false,
          error: 'NOT_IMPLEMENTED',
          message: 'Endpoint not implemented',
        },
        501,
      )
    } catch (error) {
      // Validation error will be handled by middleware if using zValidator,
      // but manual valid() call throws or returns error depending on setup.
      // Hono's c.req.valid throws if validation fails in some configurations
      // or we rely on the validator middleware to have run before this.
      // Assuming zValidator middleware is used in route definition.
      logger.error({ err: error }, 'Plant Create Error')
      throw error
    }
  }

  /**
   * GET /
   * List all plants
   */
  listPlants = async (c: Context) => {
    return c.json(
      {
        success: false,
        error: 'NOT_IMPLEMENTED',
        message: 'Endpoint not implemented',
      },
      501,
    )
  }

  /**
   * GET /:id
   * Get plant details
   */
  getPlant = async (c: Context) => {
    // Validate param
    const _params = c.req.valid('param' as never)
    return c.json(
      {
        success: false,
        error: 'NOT_IMPLEMENTED',
        message: 'Endpoint not implemented',
      },
      501,
    )
  }

  /**
   * PATCH /:id
   * Update plant
   */
  updatePlant = async (c: Context) => {
    try {
      const _params = c.req.valid('param' as never)
      const _body = (await c.req.valid('json' as never)) as z.infer<typeof PlantUpdateSchema>

      return c.json(
        {
          success: false,
          error: 'NOT_IMPLEMENTED',
          message: 'Endpoint not implemented',
        },
        501,
      )
    } catch (error) {
      logger.error({ err: error }, 'Plant Update Error')
      throw error
    }
  }

  /**
   * DELETE /:id
   * Delete plant
   */
  deletePlant = async (c: Context) => {
    const _params = c.req.valid('param' as never)
    return c.json(
      {
        success: false,
        error: 'NOT_IMPLEMENTED',
        message: 'Endpoint not implemented',
      },
      501,
    )
  }
}
