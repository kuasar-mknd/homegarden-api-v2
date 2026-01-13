# Environment Variables

This document lists all environment variables used by the application, matching the source of truth in `infrastructure/config/env.ts`.

## Application

| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | Environment mode (`development`, `production`, `test`) | `development` |
| `PORT` | Port for the HTTP server | `3000` |
| `CORS_ORIGINS` | Comma-separated list of allowed origins | `*` |

## Database

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://localhost:5432/homegarden` |

## Authentication (Supabase)

| Variable | Description | Required? |
|---|---|---|
| `SUPABASE_URL` | URL of your Supabase project | **Yes** |
| `SUPABASE_PUBLISHABLE_KEY` | Public API key for Supabase | **Yes** |
| `SUPABASE_SECRET_KEY` | Service role key (optional, for admin tasks) | Optional |

## JWT (Fallback/Legacy)

| Variable | Description | Default |
|---|---|---|
| `JWT_SECRET` | Secret for signing tokens (min 32 chars) | Optional |
| `JWT_EXPIRES_IN` | Token expiration time | `1h` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration time | `7d` |

## AI & Integrations

| Variable | Description | Default |
|---|---|---|
| `GOOGLE_AI_API_KEY` | API Key for Google Gemini | Optional |
| `GEMINI_IDENTIFICATION_MODEL` | Model for plant ID | `gemini-2.0-flash` |
| `GEMINI_DIAGNOSIS_MODEL` | Model for plant diagnosis | `gemini-2.5-pro-preview-06-05` |
| `PLANTNET_API_KEY` | API Key for PlantNet (fallback) | Optional |

## Weather

| Variable | Description | Default |
|---|---|---|
| `WEATHER_API_BASE_URL` | Base URL for Weather API | `https://api.open-meteo.com/v1` |

## Storage

| Variable | Description | Default |
|---|---|---|
| `STORAGE_BUCKET` | Bucket name for file storage | Optional |

## Security

| Variable | Description | Default |
|---|---|---|
| `RATE_LIMIT_WINDOW_MS` | Window for rate limiting in ms | `900000` (15m) |
| `RATE_LIMIT_MAX` | Max requests per window | `350` |
