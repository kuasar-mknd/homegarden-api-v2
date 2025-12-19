/**
 * Plant ID Routes
 *
 * HTTP routes for plant identification endpoints.
 */

import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import type { PlantIdController } from '../controllers/plant-id.controller.js'

/**
 * Create Plant ID routes
 *
 * @param controller - PlantIdController instance
 * @returns Hono router with plant-id routes
 */
export const createPlantIdRoutes = (controller: PlantIdController): Hono => {
  const router = new Hono()

  // ============================================================
  // MIDDLEWARE
  // ============================================================

  // Body size limit for image uploads (10MB)
  router.use(
    '/identify',
    bodyLimit({
      maxSize: 10 * 1024 * 1024, // 10MB
      onError: (c) => {
        return c.json(
          {
            success: false,
            error: 'PAYLOAD_TOO_LARGE',
            message: 'Image size exceeds 10MB limit',
          },
          413,
        )
      },
    }),
  )

  // ============================================================
  // ROUTES
  // ============================================================

  /**
   * GET /status
   * Check service availability
   */
  router.get('/status', controller.status)

  /**
   * POST /identify
   * Identify plant species from an image
   *
   * Request body:
   * {
   *   "imageBase64": "base64-encoded-image",  // OR
   *   "imageUrl": "https://example.com/plant.jpg",
   *   "mimeType": "image/jpeg",  // optional
   *   "organs": ["leaf", "flower"],  // optional
   *   "maxSuggestions": 5,  // optional
   *   "location": {  // optional
   *     "latitude": 46.2044,
   *     "longitude": 6.1432,
   *     "country": "Switzerland"
   *   }
   * }
   */
  router.post('/identify', controller.identify)

  return router
}

export default createPlantIdRoutes
