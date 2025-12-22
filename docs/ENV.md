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
| `GOOGLE_AI_API_KEY` | Google Gemini API key | `AIza...` |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase public API key | `eyJhbGc...` |
| `JWT_SECRET` | Secret for signing JWTs (min 32 chars) | `your-super-secret-key-here` |

> **Note:** `JWT_SECRET` is marked as optional in code but required if you use the internal `TokenService`. It is recommended to set it for security consistency.

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

**Examples:**

```env
# Local development
DATABASE_URL=postgresql://postgres:password@localhost:5432/homegarden

# Supabase (Transaction Mode)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true
```

---

## 🤖 AI Configuration (Google Gemini)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_AI_API_KEY` | **Yes** | - | API key from Google AI Studio |
| `GEMINI_IDENTIFICATION_MODEL` | No | `gemini-2.0-flash` | Model for plant identification |
| `GEMINI_DIAGNOSIS_MODEL` | No | `gemini-2.5-pro-preview-06-05` | Model for disease diagnosis |

**How to get an API key:**

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Copy and paste into `.env`

---

## 🔐 Authentication (Supabase)

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | **Yes** | Your Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | **Yes** | Public anonymous key (safe to expose) |
| `SUPABASE_SECRET_KEY` | No | Service role key (keep secret!) |

### Legacy / Fallback Auth

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Optional* | Secret for signing custom JWTs (min 32 chars) |
| `JWT_EXPIRES_IN` | No | Access token expiry (default: `1h`) |
| `JWT_REFRESH_EXPIRES_IN` | No | Refresh token expiry (default: `7d`) |

---

## 🌤️ Weather Service (OpenMeteo)

No API key required! OpenMeteo is free and open-source.

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
