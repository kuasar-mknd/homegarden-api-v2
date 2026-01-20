# Architecture

HomeGarden follows **Clean Architecture** principles to ensure separation of concerns, testability, and maintainability.

## Layers

The codebase is organized into three main concentric layers:

### 1. Domain (`src/domain`)
**Enterprise Business Rules**. This layer contains the core business logic and entities. It is completely independent of frameworks, databases, or external agencies.

*   **Entities**: Core data structures (e.g., `Plant`, `User`, `Garden`).
*   **Repositories (Interfaces)**: Contracts for data access (e.g., `IGardenRepository`).
*   **Services (Interfaces)**: Contracts for external services (e.g., `AIPlantService`).
*   **Errors**: Domain-specific error classes.

### 2. Application (`src/application`)
**Application Business Rules**. This layer orchestrates the flow of data to and from the entities.

*   **Use Cases**: Specific user actions (e.g., `AddPlantUseCase`, `DiagnosePlantUseCase`). Each use case typically has a single `execute` method.
*   **DTOs**: Data Transfer Objects used for input/output boundaries.

### 3. Infrastructure (`src/infrastructure`)
**Frameworks & Drivers**. This layer contains details such as the database, web framework, and external API adapters.

*   **HTTP**: Hono controllers, routes, and middleware.
*   **Database**: Prisma repositories implementing domain interfaces.
*   **External Services**: Adapters for Google Gemini, Open-Meteo, etc.
*   **Config**: Environment variables, logger, etc.

## Folder Structure

```
src/
├── domain/           # Entities, Interface definitions
├── application/      # Use Cases
├── infrastructure/   # Implementation details (Hono, Prisma, Adapters)
│   ├── config/
│   ├── database/
│   ├── external-services/
│   └── http/
│       ├── controllers/
│       ├── middleware/
│       └── routes/
├── shared/           # Shared utilities and UI templates
└── index.ts          # Entry point (Dependency Injection & Server setup)
```

## Adding New Features

To add a new feature (e.g., "Water Plant"):

1.  **Domain**: Define the behavior in an Entity (if needed) or update a Repository interface.
2.  **Application**: Create a `WaterPlantUseCase` that implements the business logic.
3.  **Infrastructure**:
    *   Implement the persistence logic in a Prisma Repository.
    *   Create a `WaterPlantController` to handle the HTTP request.
    *   Define the route in `routes/` and bind it to the controller.
    *   Inject dependencies in `index.ts`.
