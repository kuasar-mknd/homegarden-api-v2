import type { Context } from 'hono'

export class PlantController {
  /**
   * POST /
   * Create a new plant
   */
  createPlant = async (c: Context) => {
    await c.req.valid('json' as never)
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
    await c.req.valid('json' as never)
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
   * DELETE /:id
   * Delete plant
   */
  deletePlant = async (c: Context) => {
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
