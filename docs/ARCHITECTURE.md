# Architecture Documentation

This project follows **Clean Architecture** principles to ensure separation of concerns, testability, and independence from external frameworks.

## 🏗 High-Level Overview

The code is organized into concentric layers, with the dependency rule pointing inwards:
`Infrastructure -> Application -> Domain`.

```
/
├── domain/             # Enterprise Business Rules (Entities, Core Logic)
├── application/        # Application Business Rules (Use Cases, Ports)
├── infrastructure/     # Frameworks & Drivers (Web, DB, External APIs)
└── shared/             # Shared Kernel (Errors, Types, Utils)
```

---

## 📂 Layer Details

### 1. Domain Layer (`domain/`)
**Responsibility:** Contains the core business logic and entities. It is pure TypeScript and has NO dependencies on outer layers (no Hono, no Prisma, no HTTP).

- **Entities**: Core business objects with logic (e.g., `Plant`, `User`).
- **Errors**: Domain-specific errors.
- **Values**: Value objects.

### 2. Application Layer (`application/`)
**Responsibility:** Orchestrates the flow of data to and from the domain entities. It implements specific use cases.

- **Use Cases**: Specific application actions (e.g., `IdentifyPlantUseCase`, `DiagnosePlantHealthUseCase`).
- **Ports**: Interfaces that define how the application interacts with the outside world (e.g., `AIIdentificationPort`, `UserRepositoryPort`).
- **DTOs**: Data Transfer Objects used for input/output boundaries.

### 3. Infrastructure Layer (`infrastructure/`)
**Responsibility:** Implements the interfaces (ports) defined in the Application layer. This is where frameworks and libraries live.

- **HTTP**: Hono server, routes, controllers, and middleware.
- **Database**: Prisma client, repositories implementation.
- **External Services**: AI adapters (Gemini), Email services, etc.
- **Config**: Environment variables and configuration.

### 4. Shared (`shared/`)
**Responsibility:** Common utilities, types, and base classes used across layers.
- `AppError`: Base error class.
- `Result`: Monad for functional error handling (if used).

---

## 🚀 Adding a New Feature

To add a new feature (e.g., "Water Plant"), follow this flow:

1.  **Domain**: Define the `Plant` entity method `water()`.
2.  **Application (Port)**: Define `PlantRepositoryPort` interface (if not exists).
3.  **Application (Use Case)**: Create `WaterPlantUseCase`.
    - Accepts `plantId`.
    - Loads plant from repository.
    - Calls `plant.water()`.
    - Saves plant.
4.  **Infrastructure (Adapter)**: Implement `PrismaPlantRepository` (if not exists).
5.  **Infrastructure (HTTP)**:
    - Create `WaterPlantController`.
    - Add route `POST /plants/:id/water` in `plant.routes.ts`.

---

## 🧩 AI Integration

The AI logic is decoupled using the **Adapter Pattern**.
- **Port**: `AIIdentificationPort`, `AIDiagnosisPort` (in `application/ports`).
- **Adapter**: `GeminiPlantAdapter` (in `infrastructure/external-services`).

This allows switching AI providers (e.g., from Gemini to OpenAI) without changing business logic.
