# Clean Architecture Guide

This project strictly adheres to **Clean Architecture** principles to ensure:

1. **Independence of Frameworks**: The architecture does not depend on the existence of some library of feature laden software.
2. **Testability**: The business rules can be tested without the UI, Database, Web Server, or any other external element.
3. **Independence of UI**: The UI can change easily, without changing the rest of the system.
4. **Independence of Database**: You can swap out PostgreSQL for Mongo, BigTable, CouchDB, or something else.
5. **Independence of any external agency**: In fact your business rules simply don't know anything at all about the outside world.

---

## 🏗️ Layer Structure

The code is organized into concentric circles (layers), where dependencies only point **inwards**.

### 1. Domain Layer (`domain/`) - The Core

**Dependencies:** None

Contains the enterprise-wide business rules and logic. It is the most stable layer.

- **Entities**: Business objects with methods (e.g., `Plant`, `User`, `Garden`).
- **Value Objects**: Immutable objects defined by their attributes (e.g., `Email`, `Coordinates`).
- **Domain Services**: Logic that doesn't fit into a single entity (e.g., `PlantHealthService`).
- **Repository Interfaces**: Abstract definitions of data access (e.g., `IGardenRepository`).
- **Domain Events**: Events that happen in the domain (e.g., `PlantWateredEvent`).

### 2. Application Layer (`application/`) - The Use Cases

**Dependencies:** Domain

Orchestrates the flow of data to and from the entities, and directs those entities to use their Critical Business Rules to achieve the goals of the use case.

- **Use Cases / Services**: Specific application actions (e.g., `IdentifyPlantService`, `CreateGardenUseCase`).
- **DTOs**: Data Transfer Objects for input/output.
- **Ports**: Interfaces for external services (e.g., `IAIService`, `IWeatherService`).

### 3. Infrastructure Layer (`infrastructure/`) - The Details

**Dependencies:** Application, Domain

Implements the interfaces defined in the inner layers. This is where frameworks and tools live.

- **HTTP**: Hono routes, controllers, middleware.
- **Database**: Prisma repositories implementing domain interfaces.
- **External Services**: Adapters for Google Gemini, OpenMeteo, Supabase.
- **Config**: Environment variables, logger, server setup.

### 4. Shared (`shared/`)

**Dependencies:** None (or strictly limited)

Common utilities, constants, and types used across layers.

---

## 🔄 Data Flow

1. **Request**: Comes in via HTTP (Infrastructure).
2. **Controller**: Unpacks request, validates basic input, calls Use Case (Application).
3. **Use Case**: Orchestrates domain logic, calls Repositories/Ports (Application).
4. **Repository/Adapter**: Fetches/Saves data or calls external APIs (Infrastructure).
5. **Entity**: Enforces business rules (Domain).
6. **Response**: Data flows back up, converted to DTOs, and returned as JSON.

---

## 🧩 Adding New Features

### 1. Define the Domain

- Create `domain/entities/NewFeature.ts`.
- Define repository interface `domain/repositories/INewFeatureRepository.ts`.

### 2. Implement the Use Case

- Create `application/services/NewFeatureService.ts`.
- Define input/output DTOs.

### 3. Implement Infrastructure

- Create `infrastructure/database/repositories/PrismaNewFeatureRepository.ts`.
- Create `infrastructure/http/routes/new-feature.routes.ts`.
- Register routes in `index.ts` or main router.

---

## 🧪 Testing Strategy

The architecture enables testing in isolation:

- **Unit Tests (`tests/domain`, `tests/application`)**: Test business logic using mocks for repositories/ports. Fast and reliable.
- **Integration Tests (`tests/infrastructure`)**: Test real implementations (DB, API adapters) to ensure they work.
- **E2E Tests (`tests/e2e`)**: Test the full flow from HTTP request to response.

---

## 📦 Directory Layout

```text
/
├── application/         # Application Business Rules
│   ├── dto/            # Data Transfer Objects
│   ├── ports/          # Interfaces for Infrastructure
│   └── services/       # Use Cases
├── domain/             # Enterprise Business Rules
│   ├── entities/       # Core Business Objects
│   ├── repositories/   # Repository Interfaces
│   └── value-objects/  # Value Objects
├── infrastructure/     # Frameworks & Drivers
│   ├── config/         # Configuration
│   ├── database/       # DB Implementations (Prisma)
│   ├── external-services/ # API Adapters
│   ├── http/           # Web Server (Hono)
│   └── websocket/      # WebSocket Server
└── shared/             # Cross-cutting concerns
    ├── constants/
    ├── types/
    └── utils/
```
