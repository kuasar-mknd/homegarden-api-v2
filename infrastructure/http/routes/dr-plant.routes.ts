
import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { DrPlantController } from '../controllers/dr-plant.controller.js'

export const createDrPlantRoutes = (controller: DrPlantController) => {
  const app = new Hono()

  app.post(
    '/diagnose',
    bodyLimit({
      maxSize: 10 * 1024 * 1024, // 10MB
      onError: (c) => {
        return c.json({
          success: false,
          error: 'PAYLOAD_TOO_LARGE',
          message: 'Image size exceeds 10MB limit',
        }, 413)
      },
    }),
    controller.diagnose
  )

  return app
}
