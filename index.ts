import { fileURLToPath } from 'node:url'
import { serve } from '@hono/node-server'
import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono } from '@hono/zod-openapi'
import { compress } from 'hono/compress'
import { cors } from 'hono/cors'
import { prettyJSON } from 'hono/pretty-json'
import { secureHeaders } from 'hono/secure-headers'
import { env } from './infrastructure/config/env.js'
import { logger } from './infrastructure/config/logger.js'
import {
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
import { createPlantRoutes } from './infrastructure/http/routes/plant.routes.js'
// Routes
import { createPlantIdRoutes } from './infrastructure/http/routes/plant-id.routes.js'
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
  servers: [{ url: 'http://localhost:3000', description: 'Local Development Server' }],
})

// Swagger UI
app.get('/ui', swaggerUI({ url: '/doc' }))

// ============================================================
// GLOBAL MIDDLEWARE
// ============================================================

// Security headers
app.use('*', secureHeaders())

// Compression
app.use('*', compress())

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
  <meta name="description" content="Smart Plant Management API with AI capabilities. Identify plants, diagnose diseases, and track your garden.">
  <meta name="theme-color" content="#2e7d32">
  <meta property="og:title" content="HomeGarden API v2">
  <meta property="og:description" content="Smart Plant Management API with AI capabilities.">
  <meta property="og:type" content="website">
  <meta property="og:image" content="https://placehold.co/600x400/2e7d32/ffffff?text=HomeGarden+API">
  <link rel="canonical" href="/">
  <title>HomeGarden API v2</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌱</text></svg>">
  <style>
    :root {
      --primary: #2e7d32;
      --secondary: #4caf50;
      --bg: #f5f9f5;
      --text: #1b1b1b;
      --card-bg: #ffffff;
      --card-border: #eee;
      --card-text: #666;
      --status-text: #888;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --primary: #81c784;
        --secondary: #66bb6a;
        --bg: #121212;
        --text: #e0e0e0;
        --card-bg: #1e1e1e;
        --card-border: #333;
        --card-text: #b0b0b0;
        --status-text: #aaa;
      }
    }
    ::selection {
      background: var(--secondary);
      color: white;
    }
    html {
      scroll-behavior: smooth;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg);
      background-image: radial-gradient(circle at 50% 0, rgba(76, 175, 80, 0.1), transparent 70%);
      color: var(--text);
      line-height: 1.6;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    /* Scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
    }
    ::-webkit-scrollbar-track {
      background: var(--bg);
    }
    ::-webkit-scrollbar-thumb {
      background: var(--card-border);
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: var(--secondary);
    }
    .skip-link {
      position: absolute;
      top: -100px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--primary);
      color: #fff;
      padding: 0.5rem 1rem;
      border-radius: 0 0 8px 8px;
      z-index: 100;
      transition: top 0.3s;
      text-decoration: none;
      font-weight: 600;
    }
    .skip-link:focus {
      top: 0;
      outline: 2px solid var(--secondary);
    }
    .container {
      background: var(--card-bg);
      padding: 3rem;
      border-radius: 16px;
      border: 1px solid var(--card-border);
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
      max-width: 600px;
      width: 90%;
      text-align: center;
    }
    header h1 {
      color: var(--primary);
      margin-bottom: 0.5rem;
      font-size: clamp(1.5rem, 5vw, 2.5rem);
    }
    .badge {
      display: inline-block;
      background: #e8f5e9;
      color: #2e7d32;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 2rem;
    }
    @media (prefers-color-scheme: dark) {
      .badge {
        background: #1b5e20;
        color: #e8f5e9;
      }
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin: 2rem 0;
      list-style: none;
      padding: 0;
    }
    @media (max-width: 600px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }
    .card {
      border: 1px solid var(--card-border);
      padding: 1.5rem;
      border-radius: 12px;
      transition: transform 0.2s, box-shadow 0.2s;
      text-decoration: none;
      color: inherit;
      display: block;
      height: 100%;
      box-sizing: border-box;
    }
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      border-color: var(--secondary);
    }
    .card:active {
      transform: scale(0.98);
    }
    .card:focus-visible {
      outline: 2px solid var(--secondary);
      outline-offset: 4px;
      border-color: var(--secondary);
    }
    .card h3 { margin: 0 0 0.5rem 0; color: var(--primary); }
    .card p { margin: 0; font-size: 0.9rem; color: var(--card-text); }

    footer.status {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid var(--card-border);
      font-size: 0.85rem;
      color: var(--status-text);
    }
    .status-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      background-color: var(--secondary);
      border-radius: 50%;
      margin-right: 6px;
    }
    @media (prefers-reduced-motion: reduce) {
      .card, .skip-link {
        transition: none;
      }
      .card:hover {
        transform: none;
      }
    }
    @media print {
      body { background: white; color: black; display: block; }
      .container { box-shadow: none; border: none; max-width: 100%; width: 100%; padding: 0; }
      .skip-link, .status-dot { display: none; }
      .grid { display: block; }
      .card { border: 1px solid #000; margin-bottom: 1rem; page-break-inside: avoid; box-shadow: none; }
      a { text-decoration: underline; color: black; }
      header h1 { color: black; }
      .badge { border: 1px solid #ccc; background: none; color: black; }
    }
  </style>
</head>
<body>
  <a href="#main" class="skip-link">Skip to main content</a>
  <div class="container">
    <header>
      <h1>🌱 HomeGarden API</h1>
      <div class="badge">v2.0.0 • AI-Powered</div>
    </header>

    <main id="main">
      <p>Welcome to the HomeGarden API. Connect your applications to smart plant management services.</p>

      <ul class="grid" role="list">
        <li>
          <a href="/ui" class="card" aria-describedby="doc-desc">
            <h3>📚 Documentation</h3>
            <p id="doc-desc">Interactive Swagger UI for API exploration.</p>
          </a>
        </li>
        <li>
          <a href="/doc" class="card" aria-describedby="openapi-desc">
            <h3>🔍 OpenAPI Spec</h3>
            <p id="openapi-desc">Raw JSON specification for integration.</p>
          </a>
        </li>
        <li>
          <a href="/ui#/PlantID" class="card" aria-describedby="plant-id-desc">
            <h3>🌿 Plant ID</h3>
            <p id="plant-id-desc">Identify species using AI vision.</p>
          </a>
        </li>
        <li>
          <a href="/ui#/DrPlant" class="card" aria-describedby="dr-plant-desc">
            <h3>🩺 Dr. Plant</h3>
            <p id="dr-plant-desc">Diagnose diseases and pests.</p>
          </a>
        </li>
      </ul>
    </main>

    <footer class="status" role="status">
      <span class="status-dot" aria-label="Status: Operational" role="img"></span> System Operational • ${env.NODE_ENV}
    </footer>
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

    // biome-ignore lint/suspicious/noExplicitAny: Hono server type compatibility
    initializeWebSocketServer(server as any)
  }
}

export default app
