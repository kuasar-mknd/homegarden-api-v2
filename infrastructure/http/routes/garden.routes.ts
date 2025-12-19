
import { Hono } from 'hono'
import { GardenController } from '../controllers/garden.controller'
import { authMiddleware } from '../middleware/auth.middleware'

export const createGardenRoutes = (controller: GardenController) => {
  const app = new Hono()

  // Apply Auth Middleware to all routes in this router
  app.use('*', authMiddleware)

  app.post('/plants', controller.addPlant)
  app.get('/plants', controller.getPlants)

  return app
}
