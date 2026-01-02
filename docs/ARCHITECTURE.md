# Architecture

This project follows **Clean Architecture** principles to ensure separation of concerns, testability, and maintainability.

## 🏗 Directory Structure

The codebase is organized into four main layers:

### 1. `domain/` (Enterprise Business Rules)
This is the core of the application. It contains entities, value objects, and domain events that are independent of any external frameworks or tools.
*   **Entities**: Core business objects (e.g., `User`, `Garden`, `Plant`) with behavior and validation logic.
*   **Value Objects**: Immutable objects defined by their attributes (e.g., `Email`, `Coordinates`).
*   **Repositories (Interfaces)**: Defines how data should be accessed, but not how it is implemented.

### 2. `application/` (Application Business Rules)
This layer orchestrates the flow of data to and from the domain entities. It implements specific use cases.
*   **Services/UseCases**: Contains business logic for specific actions (e.g., `CreateGardenService`, `IdentifyPlantService`).
*   **DTOs**: Data Transfer Objects used to pass data between layers.

### 3. `infrastructure/` (Frameworks & Drivers)
This layer contains implementations of interfaces defined in the domain and application layers. It deals with external details like databases, web frameworks, and third-party APIs.
*   **Http**: Hono server setup, controllers, middleware, and routes.
*   **Database**: Prisma client and repository implementations.
*   **Config**: Environment variables, logger configuration.
*   **Adapters**: External service integrations (e.g., `GeminiAdapter`, `OpenMeteoAdapter`).

### 4. `shared/`
Contains shared utilities, types, and constants used across multiple layers (e.g., `Result` type, helper functions).

## 🧩 Adding New Features

To add a new feature (e.g., "Watering Schedule"), follow this flow:

1.  **Domain**: Define the `WateringSchedule` entity and its repository interface in `domain/`.
2.  **Application**: Create a service/use-case (e.g., `CreateWateringScheduleService`) in `application/`.
3.  **Infrastructure**:
    *   Implement the repository in `infrastructure/database/repositories/`.
    *   Create a controller in `infrastructure/http/controllers/`.
    *   Define the route in `infrastructure/http/routes/`.
    *   Register the route in the main `index.ts`.
4.  **Tests**: Add unit tests for the domain and application logic, and integration tests for the infrastructure.

## 🔄 Dependency Rule
Dependencies only point **inwards**.
*   `Infrastructure` -> `Application` -> `Domain`
*   The `Domain` layer knows nothing about the outer layers.
