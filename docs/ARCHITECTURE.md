# Architecture Documentation

This project follows **Clean Architecture** principles (aka Hexagonal Architecture / Ports & Adapters) to ensure separation of concerns, testability, and independence from external frameworks.

## 🎯 Core Principles

1. **Independence** - Business logic is independent of frameworks, UI, database, and external services
2. **Testability** - Core logic can be tested without databases or web servers (98% test coverage)
3. **Maintainability** - Changes in one layer don't cascade to others
4. **Flexibility** - Easy to swap implementations (e.g., switch from Gemini to OpenAI)

## 🏗️ Layer Architecture

The code is organized into concentric layers with the **Dependency Rule** pointing inwards:

```
┌─────────────────────────────────────────┐
│     Infrastructure Layer               │  ← Frameworks & Drivers
│  (HTTP, DB, External APIs, WebSocket)  │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│     Application Layer                   │  ← Use Cases & Ports
│  (Business Logic Orchestration)         │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│     Domain Layer                        │  ← Enterprise Business Rules
│  (Entities, Value Objects, Services)    │
└─────────────────────────────────────────┘
```

**Shared Kernel** sits alongside all layers, providing common utilities.

---

## 📂 Layer Details

### 1. Domain Layer (`domain/`)

**Responsibility:** Pure business logic with NO external dependencies.

**Contents:**
- **Entities** (`entities/`) - Core business objects with logic
  - Examples: `User`, `Garden`, `Plant`, `Diagnosis`
  - Rich domain models with behavior, not just data containers
  
- **Value Objects** (`value-objects/`) - Immutable value types
  - Examples: `Email`, `Password`, `GeoLocation`
  - Self-validating and encapsulate business rules
  
- **Domain Services** (`services/`) - Business logic that doesn't belong to a single entity
  - Examples: `PasswordService`, `AuthorizationService`

**Rules:**
- ✅ Pure TypeScript (no framework imports)
- ✅ No HTTP, no database, no external APIs
- ✅ 100% test coverage on entities and value objects

---

### 2. Application Layer (`application/`)

**Responsibility:** Orchestrates the flow of data and implements specific use cases.

**Contents:**
- **Use Cases** (`use-cases/`) - Application-specific business rules
  - Examples: `IdentifySpeciesUseCase`, `DiagnosePlantUseCase`
  - One use case = one business operation
  - Accept input DTOs, return Results
  
- **Ports** (`ports/`) - Interfaces defining how to interact with the outside world
  - Examples: `AIIdentificationPort`, `UserRepositoryPort`
  - Implemented by Infrastructure layer

**Rules:**
- ✅ Depends only on Domain layer
- ✅ Defines interfaces (ports) for Infrastructure
- ✅ Returns `Result<T, E>` for functional error handling

---

### 3. Infrastructure Layer (`infrastructure/`)

**Responsibility:** Implements the ports and provides framework-specific code.

**Structure:**
```
infrastructure/
├── http/                    # Web layer (Hono)
│   ├── controllers/         # HTTP controllers
│   ├── routes/              # Route definitions
│   ├── middleware/          # Auth, logging, validation
│   └── schemas/             # Zod validation schemas
├── database/                # Persistence
│   ├── repositories/        # Prisma repository implementations
│   └── prisma.client.ts     # Database connection
├── external-services/       # Third-party integrations
│   ├── gemini-plant.adapter.ts   # Google Gemini AI
│   └── open-meteo.adapter.ts     # Weather API
├── websocket/               # Real-time communication
│   ├── ws-server.ts         # WebSocket server
│   └── handlers/            # Message handlers
└── config/                  # Configuration
    ├── env.ts               # Environment variables
    └── logger.ts            # Pino logger
```

**Rules:**
- ✅ Implements Application layer ports
- ✅ All framework-specific code lives here
- ✅ Can be swapped without touching business logic

---

### 4. Shared Kernel (`shared/`)

**Responsibility:** Common utilities used across all layers.

**Contents:**
- **Types** - `Result<T, E>` monad for functional error handling
- **Errors** - `AppError` base class for application errors
- **Utils** - Shared helper functions

---

## 🔄 Data Flow Example

Let's trace a request to identify a plant:

1. **HTTP Request** arrives at `/api/v2/plant-id/identify`
2. **Route** (`plant-id.routes.ts`) validates with Zod schema
3. **Controller** (`plant-id.controller.ts`) extracts data
4. **Use Case** (`identify-species.use-case.ts`) orchestrates:
   - Validates business rules
   - Calls AI port to identify plant
   - Returns Result<IdentifySpeciesOutput>
5. **Adapter** (`gemini-plant.adapter.ts`) implements AI port:
   - Calls Google Gemini API
   - Parses response
   - Returns structured data
6. **Controller** transforms Result to HTTP response
7. **HTTP Response** sent back to client

```
HTTP Request
    ↓
Route → Controller → Use Case → Domain Logic
                        ↓
                   AI Port (interface)
                        ↓
                  Gemini Adapter (implementation)
                        ↓
                  Google Gemini API
```

---

## 🧪 Testing Strategy

Our **98.21% test coverage** is achieved through layered testing:

### Unit Tests
- **Domain Layer**: Entities, Value Objects, Services (100% coverage)
- **Application Layer**: Use Cases in isolation with mocked ports
- **Infrastructure**: Adapters, Controllers, Middleware

### Integration Tests
- Test multiple components together (Use Case + Repository + DB)
- Real database interactions with test fixtures
- Example: `user-profile.test.ts`

### E2E Tests (End-to-End)
- Full HTTP request/response cycle
- Real server running on test port
- WebSocket communication
- Example: `health.e2e.test.ts`, `auth.e2e.test.ts`

**Test File Locations:**
```
tests/
├── unit/              # (Organized by layer)
├── integration/       # Use case + infrastructure
├── e2e/              # Full HTTP flows
├── controllers/       # HTTP controllers
├── adapters/         # External service adapters
├── domain/           # Entities, VOs, services
├── use-cases/        # Application use cases
└── helpers/          # Test utilities
```

---

## ➕ Adding a New Feature

Example: Adding a "Water Plant" feature

### 1. Domain Layer
Create or update entity with business logic:
```typescript
// domain/entities/plant.entity.ts
class Plant {
  water(): void {
    this.lastWateredAt = new Date()
    // Domain validation
    if (this.wateringFrequencyDays < 1) {
      throw new Error('Invalid watering frequency')
    }
  }
}
```

### 2. Application Layer

**Define Port** (if accessing repository):
```typescript
// application/ports/plant-repository.port.ts
interface PlantRepositoryPort {
  findById(id: string): Promise<Plant | null>
  save(plant: Plant): Promise<void>
}
```

**Create Use Case**:
```typescript
// application/use-cases/water-plant.use-case.ts
class WaterPlantUseCase {
  execute(plantId: string): Promise<Result<void, AppError>> {
    const plant = await this.plantRepo.findById(plantId)
    if (!plant) return fail(new AppError('Plant not found', 404))
    
    plant.water()
    await this.plantRepo.save(plant)
    return ok(undefined)
  }
}
```

### 3. Infrastructure Layer

**Implement Repository**:
```typescript
// infrastructure/database/repositories/plant.repository.ts
class PlantPrismaRepository implements PlantRepositoryPort {
  async save(plant: Plant): Promise<void> {
    await prisma.plant.update({
      where: { id: plant.id },
      data: { lastWateredAt: plant.lastWateredAt }
    })
  }
}
```

**Create Controller**:
```typescript
// infrastructure/http/controllers/plant.controller.ts
async waterPlant(c: Context) {
  const { plantId } = c.req.param()
  const result = await this.waterPlantUseCase.execute(plantId)
  
  if (!result.success) {
    return c.json({ success: false, error: result.error.message }, 404)
  }
  return c.json({ success: true }, 200)
}
```

**Add Route**:
```typescript
// infrastructure/http/routes/plant.routes.ts
app.post('/plants/:plantId/water', plantController.waterPlant)
```

### 4. Test
```typescript
// tests/use-cases/water-plant.use-case.test.ts
it('should water plant successfully', async () => {
  const result = await useCase.execute('plant-123')
  expect(result.success).toBe(true)
})
```

---

## 🔌 AI Integration Pattern

The AI logic is decoupled using the **Adapter Pattern**:

**Port (Application Layer):**
```typescript
interface AIIdentificationPort {
  identifySpecies(request: IdentifyRequest): Promise<IdentifyResult>
}
```

**Adapter (Infrastructure Layer):**
```typescript
class GeminiPlantAdapter implements AIIdentificationPort {
  async identifySpecies(request: IdentifyRequest) {
    // Call Google Gemini API
    // Parse and return structured response
  }
}
```

**Benefits:**
- ✅ Switch AI providers without changing business logic
- ✅ Easy to mock for testing
- ✅ Business logic doesn't know about Gemini specifics

---

## 📊 Code Quality

- **TypeScript**: Strict mode enabled
- **Linting**: Biome (fast, modern linter)
- **Formatting**: Biome (consistent code style)
- **Type Safety**: No `any` in business logic
- **Error Handling**: `Result<T, E>` pattern (no exceptions in use cases)

---

## 🚀 Why Clean Architecture?

**Before (Traditional Layered):**
- Business logic mixed with HTTP/DB code ❌
- Hard to test without starting server ❌
- Can't change database without rewriting logic ❌
- Framework upgrades break everything ❌

**After (Clean Architecture):**
- Business logic is pure and isolated ✅
- Tests run without database/server (fast!) ✅
- Swap Prisma for TypeORM easily ✅
- Framework changes only affect infrastructure ✅

---

**This architecture enables:**
- 🧪 **98% test coverage** - Pure logic is easy to test
- 🔄 **Easy refactoring** - Clear layer boundaries
- 🚀 **Fast development** - No framework lock-in
- 📈 **Scalability** - Add features without breaking existing code
