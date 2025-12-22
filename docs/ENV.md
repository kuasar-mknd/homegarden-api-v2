# Environment Variables Reference

Complete reference for all environment variables used in the HomeGarden API.

## 📝 Setup

1. Copy the example file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your values

3. **Never commit `.env` to version control** ⚠️

---

## 🔧 Required Variables

These must be set for the application to run:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/homegarden` |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase public API key | `eyJhbGc...` |

---

## ⚙️ Application Settings

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Environment: `development`, `production`, or `test` |
| `PORT` | No | `3000` | HTTP port for the server |
| `CORS_ORIGINS` | No | `*` | Comma-separated allowed origins |

**Example:**

```env
NODE_ENV=production
PORT=3000
CORS_ORIGINS=https://app.example.com,https://admin.example.com
```

---

## 🗄️ Database

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | **Yes** | PostgreSQL connection string with credentials |

**Format:**

```text
postgresql://[user]:[password]@[host]:[port]/[database]?schema=public
```

---

## 🤖 AI Configuration (Google Gemini)

Although marked as *optional* in the configuration validation, these are **required for AI features** (Plant ID, Diagnosis).

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_AI_API_KEY` | Conditional | - | API key from Google AI Studio (Required for AI features) |
| `GEMINI_IDENTIFICATION_MODEL` | No | `gemini-2.0-flash` | Model for plant identification |
| `GEMINI_DIAGNOSIS_MODEL` | No | `gemini-2.5-pro-preview-06-05` | Model for disease diagnosis |

---

## 🔐 Authentication (Supabase)

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | **Yes** | Your Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | **Yes** | Public anonymous key (safe to expose) |
| `SUPABASE_SECRET_KEY` | No | Service role key (Used for admin tasks if needed) |

### Legacy / Fallback Auth

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | No* | - | Secret for signing custom JWTs (min 32 chars). *Required if using internal TokenService.* |
| `JWT_EXPIRES_IN` | No | `1h` | Access token expiry |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh token expiry |

---

## 🌤️ Weather Service (OpenMeteo)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `WEATHER_API_BASE_URL` | No | `https://api.open-meteo.com/v1` | OpenMeteo API base URL |

---

## 🚦 Rate Limiting

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | Time window in milliseconds (15 minutes) |
| `RATE_LIMIT_MAX` | No | `350` | Max requests per window per IP |

---

## 📦 Storage & Other

| Variable | Required | Description |
|----------|----------|-------------|
| `STORAGE_BUCKET` | No | Supabase Storage bucket name (if used) |
| `PLANTNET_API_KEY` | No | API Key for PlantNet (Optional fallback) |

---

## ✅ Validation

The application uses **Zod** in `infrastructure/config/env.ts` to validate all environment variables on startup.
**Invalid configuration will prevent the server from starting.**
