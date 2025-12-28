# Environment Variables

This document lists all environment variables used by the application.
The single source of truth for these variables is `infrastructure/config/env.ts`.

## ⚙️ Application Configuration

| Variable | Description | Default | Required |
|---|---|---|---|
| `NODE_ENV` | Environment mode (`development`, `production`, `test`). | `development` | No |
| `PORT` | HTTP server port. | `3000` | No |
| `CORS_ORIGINS` | Comma-separated list of allowed origins. | `*` | No |

## 🗄️ Database

| Variable | Description | Default | Required |
|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string. | `postgresql://...` | **Yes** |

## 🔐 Authentication (Supabase)

| Variable | Description | Default | Required |
|---|---|---|---|
| `SUPABASE_URL` | URL of your Supabase project. | - | **Yes** |
| `SUPABASE_PUBLISHABLE_KEY`| Public API key (anon). | - | **Yes** |
| `SUPABASE_SECRET_KEY` | Service role key (for admin tasks). | - | No |

## 🔑 JWT (Fallback/Internal)

| Variable | Description | Default | Required |
|---|---|---|---|
| `JWT_SECRET` | Secret for signing tokens (min 32 chars). | - | No |
| `JWT_EXPIRES_IN` | Token expiration time. | `1h` | No |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration. | `7d` | No |

## 🤖 AI & External Services

| Variable | Description | Default | Required |
|---|---|---|---|
| `GOOGLE_AI_API_KEY` | API Key for Google Gemini. | - | No* |
| `GEMINI_IDENTIFICATION_MODEL` | Model for Plant ID. | `gemini-2.0-flash` | No |
| `GEMINI_DIAGNOSIS_MODEL` | Model for Dr. Plant. | `gemini-2.5-pro-preview...` | No |
| `PLANTNET_API_KEY` | API Key for PlantNet (backup). | - | No |
| `WEATHER_API_BASE_URL` | Base URL for OpenMeteo. | `https://api.open-meteo.com/v1`| No |
| `STORAGE_BUCKET` | Storage bucket name (if applicable). | - | No |

*\*Required if using AI features.*

## 🛡️ Rate Limiting

| Variable | Description | Default | Required |
|---|---|---|---|
| `RATE_LIMIT_WINDOW_MS` | Window size in milliseconds. | `900000` (15m) | No |
| `RATE_LIMIT_MAX` | Max requests per window. | `350` | No |
