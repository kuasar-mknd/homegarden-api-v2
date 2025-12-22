# 🌱 HomeGarden API v2.0 (AI-Powered)

A modern plant management API with AI-powered species identification and disease diagnosis, built with **Clean Architecture** principles.

[![Test Coverage](https://img.shields.io/badge/coverage-98.21%25-brightgreen.svg)](.)
[![Tests](https://img.shields.io/badge/tests-285%20passing-success.svg)](.)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](.)

## ✨ Features

- 🤖 **AI-Powered** - Species identification and disease diagnosis using Google Gemini Vision
- 🏗️ **Clean Architecture** - Testable, maintainable, and framework-independent
- 🔒 **Supabase Auth** - Secure authentication with automatic user sync
- ⚡ **WebSocket Support** - Real-time weather updates and care reminders
- 🌐 **Interactive API Docs** - Built-in Swagger UI at `/ui`
- 🧪 **98% Test Coverage** - Unit, integration, and E2E tests
- 📊 **OpenAPI 3.0** - Full API specification

## 🚀 Tech Stack

| Component | Technology |
|-----------|------------|
| **Runtime** | Node.js 20+ |
| **Framework** | Hono (Fast web framework) |
| **Language** | TypeScript 5.9 (Strict mode) |
| **Database** | PostgreSQL + Prisma 7 |
| **AI** | Google Gemini (gemini-2.0-flash / gemini-2.5-pro) |
| **Auth** | Supabase Auth + JWT |
| **WebSocket** | ws library |
| **Testing** | Vitest + SuperTest |
| **Linting** | Biome |

## 📁 Project Structure

```text
/
├── application/       # Use Cases, Ports (Business Logic)
├── domain/           # Entities, Value Objects, Services
├── infrastructure/   # HTTP, DB, External Services, WebSocket
│   ├── http/        # Routes, Controllers, Middleware
│   ├── database/    # Prisma repositories
│   ├── external-services/  # Gemini, OpenMeteo adapters
│   └── websocket/   # Real-time handlers
├── shared/          # Errors, Types, Utils
├── tests/           # Unit, Integration, E2E tests
└── index.ts         # Application entry point
```

## 🛠️ Prerequisites

- Node.js >= 20.0.0
- pnpm (Package Manager)
- PostgreSQL 14+ with PostGIS extension
- Google Cloud API Key (for Gemini Vision)
- Supabase project (for authentication)

## 📦 Installation

1. **Clone and install**

```bash
git clone <repository-url>
cd homegarden-api
pnpm install
```

2. **Configure environment**

```bash
cp .env.example .env
# Edit .env with your credentials
```

Required variables (see [docs/ENV.md](docs/ENV.md) for full list):

- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `GOOGLE_AI_API_KEY` (for AI features)

3. **Setup database**

```bash
pnpm run db:generate    # Generate Prisma client
pnpm run db:migrate     # Run migrations
pnpm run db:seed        # (Optional) Seed data
```

## 🎯 Running

### Development

```bash
pnpm run dev            # Hot-reload with Vite
```

### Production

```bash
pnpm run build          # TypeScript compilation
pnpm start              # Start production server
```

### Testing

```bash
pnpm test               # Run all tests
pnpm run test:coverage  # Run with coverage report
pnpm run test:e2e       # Run End-to-End tests only
```

### Code Quality

```bash
pnpm run lint           # Lint code
pnpm run format         # Format code
pnpm run check          # Lint + format
pnpm run ci:check       # CI linting (strict)
```

## 🌐 API Endpoints

Once running, visit `http://localhost:3000`:

- **Landing Page**: `/` - Interactive HTML landing page
- **Swagger UI**: `/ui` - Interactive API documentation
- **OpenAPI Spec**: `/doc` - Raw JSON specification
- **API Base**: `/api/v2` - All API endpoints

### Key Endpoints

| Category | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| **Plant ID** | POST | `/api/v2/plant-id/identify` | Identify plant species from image |
| **Plant ID** | GET | `/api/v2/plant-id/status` | Check AI service status |
| **Dr. Plant** | POST | `/api/v2/dr-plant/diagnose` | Diagnose plant diseases |
| **Gardens** | GET | `/api/v2/gardens/plants` | Get user's plants |
| **Gardens** | GET | `/api/v2/gardens/nearby` | Find nearby gardens |
| **Gardens** | GET | `/api/v2/gardens/:id/weather` | Get garden weather |
| **Gardens** | POST | `/api/v2/gardens/:id/plants` | Add plant to garden |
| **Users** | GET | `/api/v2/users/:id` | Get user public profile |

### Example Request

```bash
curl -X POST http://localhost:3000/api/v2/plant-id/identify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/plant.jpg",
    "maxSuggestions": 3
  }'
```

## 🔌 WebSocket API

Real-time features are available via WebSocket at `ws://localhost:3000`:

### Weather Updates

```json
{
  "type": "SUBSCRIBE",
  "channel": "weather",
  "payload": {
    "gardenId": "garden-id",
    "latitude": 46.5,
    "longitude": 6.6
  }
}
```

### Care Reminders

```json
{
  "type": "SUBSCRIBE",
  "channel": "care-reminders",
  "payload": {
    "userId": "user-id"
  }
}
```

## 🧪 Testing

The project has **98.21% test coverage** with 285 tests:

- **Unit Tests**: Domain entities, value objects, services
- **Integration Tests**: Use cases, controllers, repositories
- **E2E Tests**: Full HTTP + WebSocket flows

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm run test:coverage

# Run E2E tests only
pnpm run test:e2e       # Requires running DB
```

## 📚 Documentation

- **[API.md](docs/API.md)** - Detailed API documentation
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Clean Architecture guide
- **[AI.md](docs/AI.md)** - AI integration details
- **[ENV.md](docs/ENV.md)** - Environment variables reference

## 🏗️ Architecture

This project follows **Clean Architecture** with strict layer separation:

```text
Domain (Entities, Business Rules)
  ↑
Application (Use Cases, Ports)
  ↑  
Infrastructure (HTTP, DB, External APIs)
```

**Benefits:**

- ✅ Testable (98% coverage)
- ✅ Framework-independent business logic
- ✅ Easy to swap implementations (DB, AI provider, etc.)
- ✅ Clear separation of concerns

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`pnpm test`)
5. Commit (`git commit -m 'feat: add amazing feature'`)
6. Push (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

ISC

---

Made with ❤️ using Clean Architecture and AI
