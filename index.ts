import { fileURLToPath } from 'node:url'
import { serve } from '@hono/node-server'
import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono } from '@hono/zod-openapi'
import { cors } from 'hono/cors'
import { prettyJSON } from 'hono/pretty-json'
import { secureHeaders } from 'hono/secure-headers'
import { env } from './infrastructure/config/env.js'
import { logger } from './infrastructure/config/logger.js'
import {
  authMiddleware,
  errorHandler,
  loggerMiddleware,
  rateLimitMiddleware,
} from './infrastructure/http/middleware/index.js'

// ============================================================
// DEPENDENCY INJECTION SETUP
// ============================================================

// Use Cases
import { DiagnosePlantUseCase } from './application/use-cases/dr-plant/diagnose-plant.use-case.js'
// Use Cases - Garden
import { AddPlantUseCase } from './application/use-cases/garden/add-plant.use-case.js'
import { FindNearbyGardensUseCase } from './application/use-cases/garden/find-nearby-gardens.use-case.js'
import { GetGardenWeatherUseCase } from './application/use-cases/garden/get-garden-weather.use-case.js'
import { GetUserPlantsUseCase } from './application/use-cases/garden/get-user-plants.use-case.js'
// Use Cases
import { createIdentifySpeciesUseCase } from './application/use-cases/plant-id/identify-species.use-case.js'
import { GetUserPublicProfileUseCase } from './application/use-cases/user/get-user-public-profile.use-case.js'
import { GardenPrismaRepository } from './infrastructure/database/repositories/garden.prisma-repository.js'
import { PlantPrismaRepository } from './infrastructure/database/repositories/plant.prisma-repository.js'
import { UserPrismaRepository } from './infrastructure/database/repositories/user.prisma-repository.js'
// External Service Adapters
import { getGeminiPlantAdapter } from './infrastructure/external-services/gemini-plant.adapter.js'
import { OpenMeteoAdapter } from './infrastructure/external-services/open-meteo.adapter.js'
// Controllers
import { AuthController } from './infrastructure/http/controllers/auth.controller.js'
import { CareTrackerController } from './infrastructure/http/controllers/care-tracker.controller.js'
import { DrPlantController } from './infrastructure/http/controllers/dr-plant.controller.js'
import { GardenController } from './infrastructure/http/controllers/garden.controller.js'
import { PlantController } from './infrastructure/http/controllers/plant.controller.js'
// Controllers
import { createPlantIdController } from './infrastructure/http/controllers/plant-id.controller.js'
import { UserController } from './infrastructure/http/controllers/user.controller.js'
import { authMiddleware } from './infrastructure/http/middleware/auth.middleware.js'
import { createAuthRoutes } from './infrastructure/http/routes/auth.routes.js'
import { createCareTrackerRoutes } from './infrastructure/http/routes/care-tracker.routes.js'
import { createDrPlantRoutes } from './infrastructure/http/routes/dr-plant.routes.js'
// Routes,
import { createGardenRoutes } from './infrastructure/http/routes/garden.routes.js'
// Routes
import { createPlantIdRoutes } from './infrastructure/http/routes/plant-id.routes.js'
import { createPlantRoutes } from './infrastructure/http/routes/plant.routes.js'
import { createUserRoutes } from './infrastructure/http/routes/user.routes.js'
import { initializeWebSocketServer } from './infrastructure/websocket/index.js'

// Initialize dependencies
const geminiAdapter = getGeminiPlantAdapter()
const identifySpeciesUseCase = createIdentifySpeciesUseCase(geminiAdapter)
const plantIdController = createPlantIdController(identifySpeciesUseCase)
const plantIdRoutes = createPlantIdRoutes(plantIdController)

// Dr. Plant (Diagnosis)
const diagnosePlantUseCase = new DiagnosePlantUseCase(geminiAdapter)
const drPlantController = new DrPlantController(diagnosePlantUseCase)
const drPlantRoutes = createDrPlantRoutes(drPlantController)

// Garden (My Plants)
// Garden (My Plants & Weather)
const gardenRepository = new GardenPrismaRepository()
const plantRepository = new PlantPrismaRepository()
const weatherAdapter = new OpenMeteoAdapter()

const addPlantUseCase = new AddPlantUseCase(gardenRepository, plantRepository)
const getUserPlantsUseCase = new GetUserPlantsUseCase(plantRepository)
const getGardenWeatherUseCase = new GetGardenWeatherUseCase(gardenRepository, weatherAdapter)
const findNearbyGardensUseCase = new FindNearbyGardensUseCase(gardenRepository)

// User
const userRepository = new UserPrismaRepository()
const getUserPublicProfileUseCase = new GetUserPublicProfileUseCase(userRepository)

const userController = new UserController(getUserPublicProfileUseCase)
const userRoutes = createUserRoutes(userController)

const gardenController = new GardenController(
  addPlantUseCase,
  getUserPlantsUseCase,
  getGardenWeatherUseCase,
  findNearbyGardensUseCase,
)
const gardenRoutes = createGardenRoutes(gardenController)

// Initialize remaining controllers (scaffolding)
const authController = new AuthController()
const authRoutes = createAuthRoutes(authController)

const plantController = new PlantController()
const plantRoutes = createPlantRoutes(plantController)

const careTrackerController = new CareTrackerController()
const careTrackerRoutes = createCareTrackerRoutes(careTrackerController)

// ============================================================
// CREATE HONO APP
// ============================================================

const app = new OpenAPIHono()

// OpenAPI Documentation
app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '2.0.0',
    title: 'HomeGarden API',
    description: `
# 🌿 HomeGarden API

Smart Plant Management API with AI capabilities.

## Features
- **Plant ID**: Identify plants from photos using Google Gemini Vision.
- **Dr. Plant**: Diagnose plant diseases and get treatment advice.
- **Garden Management**: Track your plants, watering schedules, and growth.
- **Weather Integration**: Smart care reminders based on local weather.

## Authentication
Most endpoints require authentication using Bearer Token (JWT).
    `,
    contact: {
      name: 'API Support',
      url: 'https://github.com/homegarden/api',
    },
    license: {
      name: 'ISC',
    },
  },
  tags: [
    { name: 'Auth', description: 'User authentication and session management' },
    { name: 'Users', description: 'User profile and settings' },
    { name: 'Gardens', description: 'Garden management and geolocation' },
    { name: 'Plants', description: 'Plant tracking and details' },
    { name: 'PlantID', description: 'AI-powered plant identification' },
    { name: 'DrPlant', description: 'AI-powered disease diagnosis' },
  ],
  servers: [
    { url: 'http://localhost:3000', description: 'Local Development Server' },
  ],
})

// Swagger UI
app.get('/ui', swaggerUI({ url: '/doc' }))

// ============================================================
// GLOBAL MIDDLEWARE
// ============================================================

// Security headers
app.use('*', secureHeaders())

// CORS
app.use(
  '*',
  cors({
    origin: env.CORS_ORIGINS,
    credentials: true,
  }),
)

// Request logging
app.use('*', loggerMiddleware)

// Pretty JSON responses in development
if (env.NODE_ENV === 'development') {
  app.use('*', prettyJSON())
}

// Rate Limiting
app.use('*', rateLimitMiddleware)

// ============================================================
// ROUTES
// ============================================================

// Landing Page
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HomeGarden API v2</title>
  <style>
    :root {
      --primary: #2e7d32;
      --secondary: #4caf50;
      --bg: #f5f9f5;
      --text: #1b1b1b;
      --card-bg: #ffffff;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.6;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .container {
      background: var(--card-bg);
      padding: 3rem;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
      max-width: 600px;
      width: 90%;
      text-align: center;
    }
    h1 { color: var(--primary); margin-bottom: 0.5rem; }
    .badge {
      display: inline-block;
      background: #e8f5e9;
      color: var(--primary);
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 2rem;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin: 2rem 0;
    }
    .card {
      border: 1px solid #eee;
      padding: 1.5rem;
      border-radius: 12px;
      transition: transform 0.2s, box-shadow 0.2s;
      text-decoration: none;
      color: inherit;
    }
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      border-color: var(--secondary);
    }
    .card h3 { margin: 0 0 0.5rem 0; color: var(--primary); }
    .card p { margin: 0; font-size: 0.9rem; color: #666; }
    .status {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #eee;
      font-size: 0.85rem;
      color: #888;
    }
    .status-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      background-color: var(--secondary);
      border-radius: 50%;
      margin-right: 6px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🌱 HomeGarden API</h1>
    <div class="badge">v2.0.0 • AI-Powered</div>

    <p>Welcome to the HomeGarden API. Connect your applications to smart plant management services.</p>

    <div class="grid">
      <a href="/ui" class="card">
        <h3>📚 Documentation</h3>
        <p>Interactive Swagger UI for API exploration.</p>
      </a>
      <a href="/doc" class="card">
        <h3>🔍 OpenAPI Spec</h3>
        <p>Raw JSON specification for integration.</p>
      </a>
      <a href="/api/v2/plant-id" class="card">
        <h3>🌿 Plant ID</h3>
        <p>Identify species using AI vision.</p>
      </a>
      <a href="/api/v2/dr-plant/diagnose" class="card">
        <h3>🩺 Dr. Plant</h3>
        <p>Diagnose diseases and pests.</p>
      </a>
    </div>

    <div class="status">
      <span class="status-dot"></span> System Operational • ${env.NODE_ENV}
    </div>
  </div>
</body>
</html>
  `)
})

// API version prefix
app.get('/api/v2', (c) => {
  return c.json({
    message: 'Welcome to HomeGarden API v2',
    documentation: '/ui',
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
app.use('/api/v2/plant-id/*', authMiddleware)
app.route('/api/v2/plant-id', plantIdRoutes)

// Dr. Plant (Diagnosis)
app.use('/api/v2/dr-plant/*', authMiddleware)
app.route('/api/v2/dr-plant', drPlantRoutes)

// My Garden
app.route('/api/v2/gardens', gardenRoutes) // Auth is applied inside createGardenRoutes

// Auth & User
app.route('/api/v2/users', userRoutes)
app.route('/api/v2/auth', authRoutes)

// Plants & Care
app.route('/api/v2/plants', plantRoutes)
app.route('/api/v2/care-tracker', careTrackerRoutes)

// ============================================================
// ERROR HANDLING
// ============================================================

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: 'Not Found',
      message: `Cannot find ${c.req.method} ${c.req.path}`,
    },
    404,
  )
})

// Global error handler
app.onError(errorHandler)

// ============================================================
// SERVER STARTUP
// ============================================================

const port = env.PORT

if (env.NODE_ENV !== 'test' && process.env.npm_lifecycle_event !== 'test') {
  // Check if the module is being run directly (e.g. node dist/index.js)
  // When running with Vite, this file is imported, so we don't want to start the server here
  const isMainModule = process.argv[1] === fileURLToPath(import.meta.url)

  if (isMainModule) {
    logger.info(`
🌱 HomeGarden API v2.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Server:     http://localhost:${port}
📍 Health:     http://localhost:${port}/
📍 API:        http://localhost:${port}/api/v2
📍 PlantID:    http://localhost:${port}/api/v2/plant-id
📍 Dr.Plant:   http://localhost:${port}/api/v2/dr-plant/diagnose
🔧 Environment: ${env.NODE_ENV}
🤖 AI Service: ${env.GOOGLE_AI_API_KEY ? '✅ Configured' : '⚠️ Not configured'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)

    const server = serve({
      fetch: app.fetch,
      port,
    })

    initializeWebSocketServer(server as any)
  }
}

export default app
