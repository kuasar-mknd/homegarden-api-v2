# 🌱 HomeGarden API v2 (AI-Powered)

A modern plant management API with AI-powered species identification and disease diagnosis.

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Runtime** | Node.js 20+ |
| **Framework** | Hono |
| **Language** | TypeScript (Strict) |
| **Database** | PostgreSQL + Prisma |
| **AI** | Google Gemini (Vision) |
| **Auth** | Supabase Auth |
| **Architecture** | Clean Architecture |

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

| Endpoint | Description |
|----------|-------------|
| `GET /` | Health check |
| `GET /api/v2` | API info |
| `POST /api/v2/plant-id/identify` | Identify plant species |
| `GET /api/v2/plant-id/status` | Check PlantID service |

## Environment Variables

```env
# Required
DATABASE_URL=postgresql://...
GOOGLE_AI_API_KEY=your-gemini-key

# Optional
PORT=3000
NODE_ENV=development
```

## License

ISC
