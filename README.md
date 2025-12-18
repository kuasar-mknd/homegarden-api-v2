# 🌱 HomeGarden API v2 (AI-Powered)

A modern plant management API with AI-powered species identification and disease diagnosis, built with **Clean Architecture**.

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Runtime** | Node.js 20+ |
| **Framework** | Hono |
| **Language** | TypeScript (Strict) |
| **Database** | PostgreSQL + Prisma 6 |
| **AI** | Google Gemini (Vision) |
| **Auth** | Supabase Auth |
| **Architecture** | Clean Architecture |

## Project Structure

The project follows strict Clean Architecture principles:

```
src/
├── application/       # Business logic (Use Cases, Ports)
├── domain/           # Core business rules (Entities, Repositories)
├── infrastructure/   # External/Framework implementations (DB, Hono, Gemini)
├── shared/           # Shared kernel (Errors, Types, Utils)
└── index.ts          # Application entry point
```

## Prerequisites

- Node.js >= 20.0.0
- PostgreSQL 14+
- Google Cloud API Key (for Gemini)

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

   **Important:** For Gemini, verify available models key:
   ```env
   # Example valid configuration
   GOOGLE_AI_API_KEY=your-api-key
   GEMINI_IDENTIFICATION_MODEL=gemini-3-flash-preview
   GEMINI_DIAGNOSIS_MODEL=gemini-3-flash-preview
   ```

3. **Generate Prisma client**
   ```bash
   npm run db:generate
   ```

4. **Run migrations** (when connected to DB)
   ```bash
   npm run db:migrate
   ```

## Running

```bash
# Development (hot-reload)
npm run dev

# Production build
npm run build
npm start
```

## API Endpoints

### 🌿 Plant Identification (AI)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v2/plant-id/identify` | Identify plant species from image |
| `GET` | `/api/v2/plant-id/status` | Check AI service availability |

**Example Request:**
```json
POST /api/v2/plant-id/identify
{
  "imageUrl": "https://example.com/plant.jpg",
  "maxSuggestions": 3
}
```

### 🏥 Dr. Plant (Diagnosis) - *Coming Soon*

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v2/dr-plant/diagnose` | Diagnose plant health issues |

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/homegarden

# AI (Google Gemini)
GOOGLE_AI_API_KEY=AI...
GEMINI_IDENTIFICATION_MODEL=gemini-3-flash-preview
GEMINI_DIAGNOSIS_MODEL=gemini-3-flash-preview

# Auth
JWT_SECRET=super_secret_key
```

## License

ISC
