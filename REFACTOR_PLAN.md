# 🌱 Clean Architecture Refactor Plan

> **Project:** HomeGarden API (archiOweb-api)  
> **Target Stack:** Node.js (TypeScript) + Hono + Prisma ORM + PostgreSQL  
> **Date:** December 2024

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Target Architecture](#target-architecture)
4. [Proposed Folder Structure](#proposed-folder-structure)
5. [Prisma Schema](#prisma-schema)
6. [Migration Steps](#migration-steps)
7. [New AI Features Architecture](#new-ai-features-architecture)
8. [Timeline & Phases](#timeline--phases)

---

## Executive Summary

This document outlines a comprehensive refactoring plan to migrate the **HomeGarden API** from its current Express.js + MongoDB architecture to a **Clean Architecture** pattern using:

- **Hono** — Ultra-fast, lightweight web framework optimized for edge deployments
- **TypeScript** — Type safety and better developer experience
- **Prisma ORM** — Modern, type-safe database access
- **PostgreSQL** — Robust relational database with better querying capabilities

### Why This Stack?

| Technology | Rationale |
|------------|-----------|
| **Hono** | 4x faster than Express, edge-ready, minimal bundle size (~13kb), works on Cloudflare Workers/Deno/Bun/Node |
| **TypeScript** | Type safety, better IDE support, self-documenting code |
| **Prisma** | Type-safe queries, auto-generated types, excellent migration system |
| **PostgreSQL** | PostGIS for geospatial, better for relational data (users→gardens→plants→diagnoses) |

---

## Current State Analysis

### Current Tech Stack

```text
Node.js 20 + Express.js 5
MongoDB + Mongoose 9
JWT Authentication (jsonwebtoken)
WebSocket (ws)
Swagger/OpenAPI documentation
```

### Current Folder Structure

```text
archiOweb-api/
├── app.js                 # Express app setup
├── bin/start              # Server entry point
├── config/
│   ├── database.js        # MongoDB connection
│   └── swagger.js         # Swagger config
├── controllers/
│   ├── gardenController.js
│   ├── plantController.js
│   └── userController.js
├── middlewares/
│   ├── errorHandler.js
│   ├── isAdmin.js
│   ├── validateGarden.js
│   ├── validatePlant.js
│   ├── validator.js
│   └── verifyToken.js
├── models/
│   ├── gardenModel.js     # Mongoose schema
│   ├── plantModel.js
│   └── userModel.js
├── routes/
│   ├── gardenRoutes.js    # Express routes + Swagger docs
│   ├── plantRoutes.js
│   ├── userRoutes.js
│   └── index.js
├── services/
│   ├── gardenService.js   # Business logic
│   ├── plantService.js
│   ├── userService.js
│   └── weatherService.js
├── lib/
│   ├── websocket.js       # WS server
│   └── clientWebsocket.js
├── utils/
│   ├── AppError.js
│   └── responseHandler.js
└── tests/
```

### Current Database Schema (MongoDB)

```javascript
// User
{
  identifier: String (email, unique),
  firstName: String,
  lastName: String,
  birthDate: Date,
  password: String (hashed),
  gardens: [ObjectId → Garden]
}

// Garden
{
  name: String,
  location: { type: 'Point', coordinates: [Number, Number] },
  plants: [ObjectId → Plant],
  user: ObjectId → User
}

// Plant
{
  commonName: String,
  scientificName: String,
  family: String,
  description: String,
  origin: String,
  exposure: Enum['Full Sun', 'Partial Shade', 'Shade'],
  watering: String,
  soilType: String,
  flowerColor: String,
  height: Number,
  bloomingSeason: String,
  plantingSeason: String,
  care: String,
  imageUrl: String,
  use: Enum['Ornamental', 'Groundcover', 'Food', 'Medicinal', 'Fragrance'],
  garden: ObjectId → Garden
}
```

### Current API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register new user |
| POST | `/api/users/login` | Authenticate user |
| GET | `/api/users/gardens` | List user's gardens |
| PUT | `/api/users` | Update user profile |
| DELETE | `/api/users` | Delete user + cascade |
| GET | `/api/users/:id` | Get user profile |
| POST | `/api/gardens` | Create garden |
| GET | `/api/gardens` | List gardens (geo filter) |
| GET | `/api/gardens/:id` | Get garden details |
| PUT | `/api/gardens/:id` | Update garden |
| DELETE | `/api/gardens/:id` | Delete garden |
| GET | `/api/gardens/:id/plants` | List plants in garden |
| GET | `/api/gardens/:id/plants/aggregate` | Plant aggregation |
| POST | `/api/plants` | Create plant |
| GET | `/api/plants` | List all plants |
| GET | `/api/plants/:id` | Get plant |
| PUT | `/api/plants/:id` | Update plant |
| DELETE | `/api/plants/:id` | Delete plant |

### Issues with Current Architecture

1. **No Type Safety** — JavaScript doesn't catch errors at compile time
2. **Tight Coupling** — Services directly depend on Mongoose models
3. **No Repository Pattern** — Data access mixed with business logic
4. **Missing Domain Layer** — Business rules scattered across services
5. **No Dependency Injection** — Hard to test and swap implementations
6. **Schema Flexibility Issues** — MongoDB makes it easy to have inconsistent data

---

## Target Architecture

### Clean Architecture Layers

```text
┌──────────────────────────────────────────────────────────────────┐
│                        INFRASTRUCTURE                             │
│  (Hono HTTP, Prisma, External APIs, WebSocket, File Storage)     │
├──────────────────────────────────────────────────────────────────┤
│                         INTERFACE ADAPTERS                        │
│    Controllers (HTTP) │ Presenters │ Gateways │ Repositories     │
├──────────────────────────────────────────────────────────────────┤
│                        APPLICATION LAYER                          │
│         Use Cases │ Application Services │ DTOs │ Ports          │
├──────────────────────────────────────────────────────────────────┤
│                          DOMAIN LAYER                             │
│     Entities │ Value Objects │ Domain Services │ Domain Events   │
└──────────────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Dependency Rule**: Dependencies point inward only
2. **Ports & Adapters**: Define interfaces in inner layers, implement in outer
3. **Single Responsibility**: Each module has one reason to change
4. **Testability**: Business logic testable without frameworks

---

## Proposed Folder Structure

```text
src/
├── main.ts                           # Application entry point
├── app.ts                            # Hono app configuration
│
├── domain/                           # 🎯 DOMAIN LAYER (innermost)
│   ├── entities/
│   │   ├── user.entity.ts            # User domain entity
│   │   ├── garden.entity.ts          # Garden domain entity
│   │   ├── plant.entity.ts           # Plant domain entity
│   │   ├── species.entity.ts         # Species catalog (for PlantID)
│   │   ├── diagnosis.entity.ts       # Plant disease diagnosis (DrPlant)
│   │   └── care-schedule.entity.ts   # Watering/fertilizing (CareTracker)
│   │
│   ├── value-objects/
│   │   ├── email.vo.ts               # Email validation
│   │   ├── password.vo.ts            # Password hashing
│   │   ├── geo-location.vo.ts        # Lat/Lng coordinates
│   │   └── plant-exposure.vo.ts      # Enum value object
│   │
│   ├── repositories/                 # Repository interfaces (ports)
│   │   ├── user.repository.ts
│   │   ├── garden.repository.ts
│   │   ├── plant.repository.ts
│   │   ├── species.repository.ts
│   │   ├── diagnosis.repository.ts
│   │   └── care-schedule.repository.ts
│   │
│   ├── services/                     # Domain services
│   │   ├── password.service.ts       # Password hashing/verification
│   │   └── authorization.service.ts  # Ownership/admin checks
│   │
│   └── events/                       # Domain events
│       ├── plant-added.event.ts
│       └── diagnosis-requested.event.ts
│
├── application/                      # 🔧 APPLICATION LAYER
│   ├── use-cases/
│   │   ├── auth/
│   │   │   ├── register-user.use-case.ts
│   │   │   ├── login-user.use-case.ts
│   │   │   └── refresh-token.use-case.ts
│   │   │
│   │   ├── user/
│   │   │   ├── get-user.use-case.ts
│   │   │   ├── update-user.use-case.ts
│   │   │   └── delete-user.use-case.ts
│   │   │
│   │   ├── garden/
│   │   │   ├── create-garden.use-case.ts
│   │   │   ├── get-garden.use-case.ts
│   │   │   ├── list-gardens.use-case.ts
│   │   │   ├── list-nearby-gardens.use-case.ts
│   │   │   ├── update-garden.use-case.ts
│   │   │   └── delete-garden.use-case.ts
│   │   │
│   │   ├── plant/
│   │   │   ├── create-plant.use-case.ts
│   │   │   ├── get-plant.use-case.ts
│   │   │   ├── list-plants.use-case.ts
│   │   │   ├── update-plant.use-case.ts
│   │   │   └── delete-plant.use-case.ts
│   │   │
│   │   ├── plant-id/                 # 🆕 AI: Plant Species Identification
│   │   │   ├── identify-species.use-case.ts
│   │   │   └── get-species-info.use-case.ts
│   │   │
│   │   ├── dr-plant/                 # 🆕 AI: Disease Diagnosis
│   │   │   ├── diagnose-plant.use-case.ts
│   │   │   ├── get-diagnosis-history.use-case.ts
│   │   │   └── get-treatment-recommendations.use-case.ts
│   │   │
│   │   └── care-tracker/             # 🆕 Care Scheduling
│   │       ├── create-care-schedule.use-case.ts
│   │       ├── get-upcoming-tasks.use-case.ts
│   │       ├── mark-task-complete.use-case.ts
│   │       └── generate-smart-schedule.use-case.ts
│   │
│   ├── dto/                          # Data Transfer Objects
│   │   ├── auth/
│   │   │   ├── register.dto.ts
│   │   │   ├── login.dto.ts
│   │   │   └── auth-response.dto.ts
│   │   ├── garden/
│   │   │   ├── create-garden.dto.ts
│   │   │   └── garden-response.dto.ts
│   │   ├── plant/
│   │   ├── diagnosis/
│   │   └── care-schedule/
│   │
│   ├── ports/                        # External service interfaces
│   │   ├── ai-identification.port.ts # PlantID AI provider interface
│   │   ├── ai-diagnosis.port.ts      # DrPlant AI provider interface
│   │   ├── weather.port.ts           # Weather API interface
│   │   ├── file-storage.port.ts      # Image upload interface
│   │   └── notification.port.ts      # Push notifications interface
│   │
│   └── services/                     # Application services
│       └── token.service.ts          # JWT token management
│
├── infrastructure/                   # 🔌 INFRASTRUCTURE LAYER
│   ├── database/
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # Database schema
│   │   │   ├── migrations/           # Prisma migrations
│   │   │   └── seed.ts               # Database seeding
│   │   └── prisma.client.ts          # Prisma client singleton
│   │
│   ├── repositories/                 # Repository implementations
│   │   ├── prisma-user.repository.ts
│   │   ├── prisma-garden.repository.ts
│   │   ├── prisma-plant.repository.ts
│   │   ├── prisma-species.repository.ts
│   │   ├── prisma-diagnosis.repository.ts
│   │   └── prisma-care-schedule.repository.ts
│   │
│   ├── external-services/            # External API adapters
│   │   ├── plant-net.adapter.ts      # PlantNet API (species ID)
│   │   ├── openai-vision.adapter.ts  # GPT-4V for diagnosis
│   │   ├── open-meteo.adapter.ts     # Weather API (existing)
│   │   ├── supabase-storage.adapter.ts # Image storage
│   │   └── firebase-fcm.adapter.ts   # Push notifications
│   │
│   ├── http/                         # Hono HTTP layer
│   │   ├── routes/
│   │   │   ├── index.ts              # Route aggregator
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── garden.routes.ts
│   │   │   ├── plant.routes.ts
│   │   │   ├── plant-id.routes.ts    # 🆕
│   │   │   ├── dr-plant.routes.ts    # 🆕
│   │   │   └── care-tracker.routes.ts # 🆕
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── garden.controller.ts
│   │   │   ├── plant.controller.ts
│   │   │   ├── plant-id.controller.ts
│   │   │   ├── dr-plant.controller.ts
│   │   │   └── care-tracker.controller.ts
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts    # JWT verification
│   │   │   ├── rate-limit.middleware.ts
│   │   │   ├── error-handler.middleware.ts
│   │   │   ├── logger.middleware.ts
│   │   │   └── validation.middleware.ts
│   │   │
│   │   └── validators/               # Zod schemas
│   │       ├── auth.validator.ts
│   │       ├── garden.validator.ts
│   │       ├── plant.validator.ts
│   │       └── common.validator.ts
│   │
│   ├── websocket/
│   │   ├── ws-server.ts
│   │   └── handlers/
│   │       ├── weather.handler.ts
│   │       └── care-reminder.handler.ts
│   │
│   └── config/
│       ├── env.ts                    # Environment variables
│       ├── database.config.ts
│       └── cors.config.ts
│
├── shared/                           # Shared utilities
│   ├── errors/
│   │   ├── app-error.ts
│   │   ├── not-found.error.ts
│   │   ├── unauthorized.error.ts
│   │   └── validation.error.ts
│   │
│   ├── types/
│   │   ├── result.type.ts            # Result<T, E> pattern
│   │   └── pagination.type.ts
│   │
│   └── utils/
│       ├── date.utils.ts
│       └── geo.utils.ts
│
└── tests/
    ├── unit/
    │   ├── domain/
    │   ├── application/
    │   └── infrastructure/
    ├── integration/
    └── e2e/
```

---

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [postgis]  // For geospatial queries
}

// ============================================================
// CORE ENTITIES
// ============================================================

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // bcrypt hashed
  firstName String   @map("first_name")
  lastName  String   @map("last_name")
  birthDate DateTime? @map("birth_date") @db.Date
  role      UserRole @default(USER)
  
  // Profile settings
  avatarUrl   String?  @map("avatar_url")
  preferences Json?    // User preferences (notifications, etc.)
  
  // Timestamps
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  // Relations
  gardens       Garden[]
  diagnoses     Diagnosis[]
  careSchedules CareSchedule[]
  
  @@map("users")
}

enum UserRole {
  USER
  ADMIN
}

model Garden {
  id   String @id @default(cuid())
  name String
  
  // Location using PostGIS
  latitude  Float
  longitude Float
  // Computed geography column for spatial queries (see migration)
  // location  Unsupported("geography(Point, 4326)")
  
  // Metadata
  description String?
  size        Float?   // in square meters
  climate     String?  // e.g., "Mediterranean", "Continental"
  
  // Timestamps
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  // Relations
  userId String @map("user_id")
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  plants        Plant[]
  careSchedules CareSchedule[]
  
  @@index([userId])
  @@index([latitude, longitude])
  @@map("gardens")
}

model Plant {
  id   String @id @default(cuid())
  
  // Basic Info
  nickname String?  // User's custom name for this plant
  
  // Species Link (nullable if user didn't identify)
  speciesId String?  @map("species_id")
  species   Species? @relation(fields: [speciesId], references: [id])
  
  // Manual entry (if species not identified)
  commonName     String?  @map("common_name")
  scientificName String?  @map("scientific_name")
  family         String?
  
  // Growing conditions
  exposure     PlantExposure?
  watering     String?
  soilType     String?        @map("soil_type")
  flowerColor  String?        @map("flower_color")
  height       Float?         // in cm
  
  // Lifecycle
  plantedDate     DateTime? @map("planted_date") @db.Date
  acquiredDate    DateTime? @map("acquired_date") @db.Date
  bloomingSeason  String?   @map("blooming_season")
  plantingSeason  String?   @map("planting_season")
  
  // Care
  careNotes String? @map("care_notes") @db.Text
  
  // Media
  imageUrl     String?  @map("image_url")
  thumbnailUrl String?  @map("thumbnail_url")
  
  // Classification
  use PlantUse?
  
  // Timestamps
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  // Relations
  gardenId String @map("garden_id")
  garden   Garden @relation(fields: [gardenId], references: [id], onDelete: Cascade)
  
  diagnoses     Diagnosis[]
  careSchedules CareSchedule[]
  
  @@index([gardenId])
  @@index([speciesId])
  @@map("plants")
}

enum PlantExposure {
  FULL_SUN      @map("Full Sun")
  PARTIAL_SHADE @map("Partial Shade")
  SHADE         @map("Shade")
}

enum PlantUse {
  ORNAMENTAL
  GROUNDCOVER
  FOOD
  MEDICINAL
  FRAGRANCE
}

// ============================================================
// AI FEATURE: PLANTID - Species Catalog
// ============================================================

model Species {
  id String @id @default(cuid())
  
  // Identification
  commonName     String  @map("common_name")
  scientificName String  @unique @map("scientific_name")
  family         String
  genus          String?
  
  // Description
  description   String? @db.Text
  origin        String?
  nativeRegions String[] @map("native_regions")
  
  // Growing requirements
  minTempCelsius   Float?  @map("min_temp_celsius")
  maxTempCelsius   Float?  @map("max_temp_celsius")
  waterRequirement WaterRequirement? @map("water_requirement")
  lightRequirement LightRequirement? @map("light_requirement")
  soilType         String[]          @map("soil_types")
  
  // Lifecycle info
  averageHeight    Float?           @map("average_height") // cm
  growthRate       GrowthRate?      @map("growth_rate")
  lifespan         String?          // e.g., "Annual", "Perennial"
  bloomingSeason   String[]         @map("blooming_season")
  harvestSeason    String[]         @map("harvest_season")
  
  // Care
  defaultWateringDays  Int?   @map("default_watering_days") // water every N days
  defaultFertilizeDays Int?   @map("default_fertilize_days")
  
  // External IDs for cross-referencing
  gbifId     String? @map("gbif_id")  // Global Biodiversity Information Facility
  plantNetId String? @map("plant_net_id")
  
  // Media
  imageUrl String? @map("image_url")
  
  // Timestamps
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  // Relations
  plants Plant[]
  
  @@index([commonName])
  @@index([family])
  @@map("species")
}

enum WaterRequirement {
  LOW
  MODERATE
  HIGH
  AQUATIC
}

enum LightRequirement {
  FULL_SUN
  PARTIAL_SUN
  PARTIAL_SHADE
  FULL_SHADE
}

enum GrowthRate {
  SLOW
  MODERATE
  FAST
}

// ============================================================
// AI FEATURE: DR.PLANT - Disease Diagnosis
// ============================================================

model Diagnosis {
  id String @id @default(cuid())
  
  // Request
  imageUrl    String   @map("image_url")
  description String?  @db.Text // User's description of symptoms
  
  // AI Response
  status      DiagnosisStatus @default(PENDING)
  confidence  Float?          // 0-1 confidence score
  
  // Results
  conditionName    String?  @map("condition_name")    // e.g., "Powdery Mildew"
  conditionType    ConditionType? @map("condition_type")
  severity         Severity?
  affectedParts    String[]       @map("affected_parts") // e.g., ["leaves", "stems"]
  
  // Treatment
  causes           String[]
  symptoms         String[]
  treatmentSteps   String[]  @map("treatment_steps")
  preventionTips   String[]  @map("prevention_tips")
  organicTreatment String?   @map("organic_treatment") @db.Text
  chemicalTreatment String?  @map("chemical_treatment") @db.Text
  
  // Prognosis
  recoveryTimeWeeks Int?     @map("recovery_time_weeks")
  criticalActions   String[] @map("critical_actions")
  
  // Metadata
  aiModel      String?  @map("ai_model") // Which AI model was used
  rawResponse  Json?    @map("raw_response") // Store full AI response
  processingMs Int?     @map("processing_ms")
  
  // Timestamps
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  // Relations
  plantId String? @map("plant_id")
  plant   Plant?  @relation(fields: [plantId], references: [id], onDelete: SetNull)
  
  userId String @map("user_id")
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([plantId])
  @@index([userId])
  @@index([status])
  @@map("diagnoses")
}

enum DiagnosisStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

enum ConditionType {
  DISEASE
  PEST
  DEFICIENCY
  ENVIRONMENTAL
  HEALTHY
}

enum Severity {
  LOW
  MODERATE
  HIGH
  CRITICAL
}

// ============================================================
// FEATURE: CARE TRACKER - Schedules
// ============================================================

model CareSchedule {
  id String @id @default(cuid())
  
  // What to do
  taskType    CareTaskType @map("task_type")
  
  // Schedule
  frequency   CareFrequency
  intervalDays Int?         @map("interval_days") // For CUSTOM frequency
  
  // Next occurrence
  nextDueDate DateTime @map("next_due_date")
  lastDoneAt  DateTime? @map("last_done_at")
  
  // Context
  notes     String?
  isEnabled Boolean @default(true) @map("is_enabled")
  
  // Smart scheduling (weather-aware)
  weatherAdjust Boolean @default(false) @map("weather_adjust")
  
  // Timestamps
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  // Relations (either garden-wide or plant-specific)
  gardenId String? @map("garden_id")
  garden   Garden? @relation(fields: [gardenId], references: [id], onDelete: Cascade)
  
  plantId String? @map("plant_id")
  plant   Plant?  @relation(fields: [plantId], references: [id], onDelete: Cascade)
  
  userId String @map("user_id")
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Task history
  completions CareCompletion[]
  
  @@index([userId])
  @@index([nextDueDate])
  @@map("care_schedules")
}

model CareCompletion {
  id String @id @default(cuid())
  
  completedAt DateTime @default(now()) @map("completed_at")
  notes       String?
  skipped     Boolean  @default(false)
  skipReason  String?  @map("skip_reason")
  
  // Photo evidence (optional)
  photoUrl String? @map("photo_url")
  
  // Relation
  scheduleId String       @map("schedule_id")
  schedule   CareSchedule @relation(fields: [scheduleId], references: [id], onDelete: Cascade)
  
  @@index([scheduleId])
  @@map("care_completions")
}

enum CareTaskType {
  WATER
  FERTILIZE
  PRUNE
  REPOT
  HARVEST
  PEST_CHECK
  DISEASE_CHECK
  MULCH
  WEED
  CUSTOM
}

enum CareFrequency {
  DAILY
  EVERY_OTHER_DAY
  TWICE_WEEKLY
  WEEKLY
  BIWEEKLY
  MONTHLY
  CUSTOM
}

// ============================================================
// SUPPORTING TABLES
// ============================================================

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  expiresAt DateTime @map("expires_at")
  
  userId String @map("user_id")
  
  createdAt DateTime @default(now()) @map("created_at")
  
  @@index([userId])
  @@map("refresh_tokens")
}
```

---

## Migration Steps

### Phase 1: Foundation Setup (Week 1-2)

#### Step 1.1: Initialize TypeScript Project

```bash
# Create new src directory alongside existing code
mkdir -p src/infrastructure/database/prisma

# Initialize TypeScript
npm init -y
npm install typescript tsx @types/node --save-dev
npx tsc --init

# Install Hono + Prisma
npm install hono @hono/node-server prisma @prisma/client
npm install zod @hono/zod-validator  # Validation
npm install bcrypt jsonwebtoken      # Auth
npm install @types/bcrypt @types/jsonwebtoken --save-dev
```

#### Step 1.2: Configure Environment

```typescript
// src/infrastructure/config/env.ts
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('1h'),
})

export const env = envSchema.parse(process.env)
```

#### Step 1.3: Setup Prisma

```bash
# Initialize Prisma with PostgreSQL
npx prisma init

# After creating schema.prisma
npx prisma migrate dev --name init
npx prisma generate
```

### Phase 2: Domain Layer (Week 2-3)

1. Create domain entities with validation
2. Implement value objects (Email, Password, GeoLocation)
3. Define repository interfaces
4. Add domain services

### Phase 3: Application Layer (Week 3-4)

1. Create use cases for each feature
2. Define DTOs with Zod schemas
3. Implement application services
4. Define external service ports

### Phase 4: Infrastructure Layer (Week 4-6)

1. Implement Prisma repositories
2. Create Hono controllers and routes
3. Setup middleware (auth, error handling, rate limiting)
4. Migrate WebSocket server
5. Implement external service adapters

### Phase 5: AI Features (Week 6-8)

1. Integrate PlantNet API for species identification
2. Implement GPT-4V/Claude Vision for disease diagnosis
3. Build smart scheduling algorithm for CareTracker

### Phase 6: Testing & Migration (Week 8-10)

1. Write unit tests for domain/application layers
2. Write integration tests for repositories
3. Write E2E tests for API endpoints
4. Data migration from MongoDB to PostgreSQL
5. Run parallel deployments for validation

---

## New AI Features Architecture

### PlantID - Species Identification

```
┌─────────────────┐     ┌──────────────────┐     ┌───────────────┐
│  User uploads   │────▶│  IdentifySpecies │────▶│  PlantNet API │
│  plant photo    │     │    Use Case      │     │   (Primary)   │
└─────────────────┘     └────────┬─────────┘     └───────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │  Species table   │
                        │  (cache results) │
                        └──────────────────┘
```

**API Endpoints:**

```text
- `POST /api/v2/plant-id/identify` - Upload photo, get species suggestions
- `GET /api/v2/plant-id/species/:id` - Get detailed species info
- `GET /api/v2/plant-id/search?q=` - Search species catalog
```

### DrPlant - Disease Diagnosis

```
┌─────────────────┐     ┌──────────────────┐     ┌───────────────┐
│  Upload photo   │────▶│  DiagnosePlant   │────▶│  GPT-4 Vision │
│  + description  │     │    Use Case      │     │   Analysis    │
└─────────────────┘     └────────┬─────────┘     └───────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │  Diagnosis table │
                        │  (store history) │
                        └──────────────────┘
```

**API Endpoints:**

```text
- `POST /api/v2/dr-plant/diagnose` - Submit photo + symptoms for diagnosis
- `GET /api/v2/dr-plant/diagnoses` - List user's diagnosis history
- `GET /api/v2/dr-plant/diagnoses/:id` - Get diagnosis details
- `GET /api/v2/dr-plant/treatments/:conditionId` - Get treatment guide
```

### CareTracker - Smart Scheduling

```
┌─────────────────┐     ┌──────────────────┐     ┌───────────────┐
│  Create plant   │────▶│  GenerateSchedule│────▶│  Species data │
│  in garden      │     │    Use Case      │     │  + Weather API│
└─────────────────┘     └────────┬─────────┘     └───────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │  CareSchedule    │
                        │  table           │
                        └──────────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │  Push Notifications│
                        │  (FCM/WebSocket)  │
                        └──────────────────┘
```

**API Endpoints:**

- `POST /api/v2/care-tracker/schedules` - Create care schedule
- `GET /api/v2/care-tracker/upcoming` - Get upcoming tasks (next 7 days)
- `POST /api/v2/care-tracker/schedules/:id/complete` - Mark task done
- `POST /api/v2/care-tracker/generate` - AI generates optimal schedule

---

## Timeline & Phases

```
Week 1-2   │████████│ Phase 1: Foundation (TS, Hono, Prisma setup)
Week 2-3   │████████│ Phase 2: Domain Layer (Entities, VOs, Repos)
Week 3-4   │████████│ Phase 3: Application Layer (Use Cases, DTOs)
Week 4-6   │████████████████│ Phase 4: Infrastructure (HTTP, DB, WS)
Week 6-8   │████████████████│ Phase 5: AI Features (PlantID, DrPlant)
Week 8-10  │████████████████│ Phase 6: Testing & Data Migration
Week 10    │████│ Go Live (parallel deployment)
```

### Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Data migration errors | Run parallel systems, validate data integrity |
| Performance regression | Benchmark critical paths before/after |
| AI service costs | Implement caching, rate limiting |
| PostGIS complexity | Fallback queries for simple cases |
| Breaking changes | Version API (v1 → v2), deprecation period |

---

## Decision Points Requiring Input

> [!IMPORTANT]
> Before proceeding with implementation, please confirm:

1. **Framework Choice**: Confirm **Hono** vs **NestJS**
   - Hono: Lighter, faster, edge-ready, less opinionated
   - NestJS: More batteries-included, Angular-like structure, steeper learning curve

2. **AI Provider Preferences**:
   - PlantID: PlantNet (free tier) vs Google Cloud Vision vs custom model?
   - DrPlant: OpenAI GPT-4V vs Claude 3.5 vs Google Gemini Vision?

3. **Database Hosting**:
   - Self-managed PostgreSQL?
   - Managed service (Supabase, Neon, Railway, PlanetScale)?

4. **Authentication Strategy**:
   - Keep custom JWT implementation?
   - Migrate to Supabase Auth / Auth0 / Clerk?

5. **Deployment Target**:
   - Traditional Node.js server?
   - Edge runtime (Cloudflare Workers, Vercel Edge)?
   - Serverless (AWS Lambda, Google Cloud Functions)?

---

## Next Steps

After approval of this plan:

1. [ ] Finalize tech stack decisions (framework, AI providers, hosting)
2. [ ] Create development branch `feature/clean-architecture`
3. [ ] Setup TypeScript project structure
4. [ ] Initialize Prisma and create first migration
5. [ ] Implement core domain entities
6. [ ] Begin incremental migration of existing endpoints

---

*Last Updated: December 2024*
*Author: Architekt (Senior Backend Engineer)*
