import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import { prettyJSON } from 'hono/pretty-json'

import { env } from './infrastructure/config/env.js'

// ============================================================
// DEPENDENCY INJECTION SETUP
// ============================================================

// External Service Adapters
import { getGeminiPlantAdapter } from './infrastructure/external-services/gemini-plant.adapter.js'

// Use Cases
import { createIdentifySpeciesUseCase } from './application/use-cases/plant-id/identify-species.use-case.js'

// Controllers
import { createPlantIdController } from './infrastructure/http/controllers/plant-id.controller.js'

// Routes
import { createPlantIdRoutes } from './infrastructure/http/routes/plant-id.routes.js'

// Initialize dependencies
const geminiAdapter = getGeminiPlantAdapter()
const identifySpeciesUseCase = createIdentifySpeciesUseCase(geminiAdapter)
const plantIdController = createPlantIdController(identifySpeciesUseCase)
const plantIdRoutes = createPlantIdRoutes(plantIdController)

// ============================================================
// CREATE HONO APP
// ============================================================

const app = new Hono()

// ============================================================
// GLOBAL MIDDLEWARE
// ============================================================

// Security headers
app.use('*', secureHeaders())

// CORS
app.use('*', cors({
  origin: env.CORS_ORIGINS,
  credentials: true,
}))

// Request logging
app.use('*', logger())

// Pretty JSON responses in development
if (env.NODE_ENV === 'development') {
  app.use('*', prettyJSON())
}

// ============================================================
// ROUTES
// ============================================================

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'HomeGarden API',
    version: '2.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    aiService: {
      available: !!env.GOOGLE_AI_API_KEY,
      identificationModel: env.GEMINI_IDENTIFICATION_MODEL,
      diagnosisModel: env.GEMINI_DIAGNOSIS_MODEL,
    },
  })
})

// API version prefix
app.get('/api/v2', (c) => {
  return c.json({
    message: 'Welcome to HomeGarden API v2',
    documentation: '/api-docs',
    endpoints: {
      auth: '/api/v2/auth',
      users: '/api/v2/users',
      gardens: '/api/v2/gardens',
      plants: '/api/v2/plants',
      plantId: '/api/v2/plant-id',
      drPlant: '/api/v2/dr-plant',
      careTracker: '/api/v2/care-tracker',
    },
  })
})

// ============================================================
// API ROUTES
// ============================================================

// Plant Identification
app.route('/api/v2/plant-id', plantIdRoutes)

// TODO: Mount remaining routes when implemented
// app.route('/api/v2/auth', authRoutes)
// app.route('/api/v2/users', userRoutes)
// app.route('/api/v2/gardens', gardenRoutes)
// app.route('/api/v2/plants', plantRoutes)
// app.route('/api/v2/dr-plant', drPlantRoutes)
// app.route('/api/v2/care-tracker', careTrackerRoutes)

// ============================================================
// ERROR HANDLING
// ============================================================

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Not Found',
    message: `Cannot find ${c.req.method} ${c.req.path}`,
  }, 404)
})

// Global error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err)
  
  const statusCode = 'statusCode' in err ? (err.statusCode as number) : 500
  
  return c.json({
    success: false,
    error: err.name || 'InternalServerError',
    message: env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : err.message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  }, statusCode as 400 | 401 | 403 | 404 | 500)
})

// ============================================================
// SERVER STARTUP
// ============================================================

const port = env.PORT

console.log(`
🌱 HomeGarden API v2.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Server:     http://localhost:${port}
📍 Health:     http://localhost:${port}/
📍 API:        http://localhost:${port}/api/v2
📍 PlantID:    http://localhost:${port}/api/v2/plant-id
🔧 Environment: ${env.NODE_ENV}
🤖 AI Service: ${env.GOOGLE_AI_API_KEY ? '✅ Configured' : '⚠️ Not configured'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)

serve({
  fetch: app.fetch,
  port,
})

export default app
