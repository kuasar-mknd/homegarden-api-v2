# HomeGarden API 🌿

A robust, production-ready TypeScript backend for managing home gardens, featuring AI-powered plant identification and diagnosis ("Dr. Plant"). Built with **Clean Architecture** principles to ensure maintainability, testability, and scalability.

## 🚀 Core Features

*   **Clean Architecture**: Strict separation of concerns (Domain, Application, Infrastructure).
*   **AI Integration**:
    *   **Dr. Plant**: AI-powered disease diagnosis using Google Gemini Vision.
    *   **Plant ID**: Plant species identification (integrates with PlantNet/Gemini).
*   **Care Tracker**: Schedule and track watering, fertilizing, and pruning tasks.
*   **Tech Stack**:
    *   [Hono](https://hono.dev/): Fast, lightweight web framework.
    *   [Prisma](https://www.prisma.io/): Type-safe ORM.
    *   [PostgreSQL](https://www.postgresql.org/): Relational database.
    *   [Vitest](https://vitest.dev/): Blazing fast unit and integration testing.
    *   [Zod](https://zod.dev/): Runtime schema validation (Env, API inputs).

## 🛠 Local Development Setup

### Prerequisites

*   Node.js (v20+)
*   pnpm (v9+)
*   PostgreSQL running locally or via Docker

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Configuration

Copy the example environment file and configure your secrets:

```bash
cp .env.example .env
```

Review `docs/ENV.md` for detailed information on each variable. You will need:
-   **Database URL**: Connection string for your local PostgreSQL instance.
-   **Supabase Config**: For authentication.
-   **Google AI Key**: For Dr. Plant features.

### 3. Database Setup

Push the schema to your local database:

```bash
pnpm run db:push
```

(Optional) Seed the database with initial data:

```bash
pnpm run db:seed
```

### 4. Run the Server

Start the development server with hot-reload:

```bash
pnpm dev
```

The API will be available at `http://localhost:3000`.
Visit `http://localhost:3000/ui` for the interactive Swagger UI documentation.

## ✅ Testing

Run the test suite using Vitest:

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm run test:coverage
```

**Note**: Integration tests require a running database. Ensure `DATABASE_URL` is set in your `.env`.

## 📖 Documentation

*   [**Architecture**](./docs/ARCHITECTURE.md): Deep dive into the Clean Architecture layers.
*   [**API Reference**](./docs/API.md): Overview of available endpoints.
*   [**Environment Variables**](./docs/ENV.md): Complete list of configuration options.
*   [**AI Features**](./docs/AI.md): Details on models, rate limits, and usage.

## 🐛 Troubleshooting

*   **`Error: P1001: Can't reach database server`**: Ensure your PostgreSQL service is running and the `DATABASE_URL` is correct.
*   **`Prisma Client not initialized`**: Run `pnpm run db:generate`.
*   **`Biome linting errors`**: Run `pnpm run format` to automatically fix formatting issues.

## 📄 License

ISC
