# Environment Variables

The application uses `zod` for type-safe environment variable validation. These variables must be configured in your `.env` file (or environment).

## Application

| Variable | Description | Default | Required |
|---|---|---|---|
| `NODE_ENV` | Environment mode (`development`, `production`, `test`) | `development` | No |
| `PORT` | Port to listen on | `3000` | No |
| `CORS_ORIGINS` | Comma-separated list of allowed origins or `*` | `*` | No |

## Database

| Variable | Description | Default | Required |
|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://localhost:5432/homegarden` | No |

## Authentication (Supabase)

| Variable | Description | Default | Required |
|---|---|---|---|
| `SUPABASE_URL` | Supabase Project URL | - | **Yes** |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase Anon Key | - | **Yes** |
| `SUPABASE_SECRET_KEY` | Supabase Service Role Key (Admin) | - | No |

## JWT (Fallback/Internal)

| Variable | Description | Default | Required |
|---|---|---|---|
| `JWT_SECRET` | Secret for signing tokens (min 32 chars) | - | No |
| `JWT_EXPIRES_IN` | Access token expiration | `1h` | No |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | `7d` | No |

## AI Services (Google Gemini)

| Variable | Description | Default | Required |
|---|---|---|---|
| `GOOGLE_AI_API_KEY` | Google AI Studio API Key | - | No (but AI features will fail) |
| `GEMINI_IDENTIFICATION_MODEL`| Model for Plant ID | `gemini-2.0-flash` | No |
| `GEMINI_DIAGNOSIS_MODEL` | Model for Dr. Plant | `gemini-2.5-pro-preview-06-05` | No |

## External APIs

| Variable | Description | Default | Required |
|---|---|---|---|
| `PLANTNET_API_KEY` | PlantNet API Key (Fallback ID) | - | No |
| `WEATHER_API_BASE_URL` | Open-Meteo API URL | `https://api.open-meteo.com/v1` | No |

## Storage

| Variable | Description | Default | Required |
|---|---|---|---|
| `STORAGE_BUCKET` | Storage bucket name | - | No |

## Security & Rate Limiting

| Variable | Description | Default | Required |
|---|---|---|---|
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms | `900000` (15m) | No |
| `RATE_LIMIT_MAX` | Max requests per window | `350` | No |
