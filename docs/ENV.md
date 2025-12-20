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

---

## ⚙️ Application Settings

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Environment: `development`, `production`, or `test` |
| `PORT` | No | `3000` | HTTP port for the server |
| `CORS_ORIGINS` | No | `*` | Comma-separated allowed origins |
| `LOG_LEVEL` | No | `info` | Logging level: `debug`, `info`, `warn`, `error` |

**Example:**
```env
NODE_ENV=production
PORT=3000
CORS_ORIGINS=https://app.example.com,https://admin.example.com
LOG_LEVEL=info
```

---

## 🗄️ Database

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | **Yes** | PostgreSQL connection string with credentials |

**Format:**
```
postgresql://[user]:[password]@[host]:[port]/[database]?schema=public
```

**Examples:**
```env
# Local development
DATABASE_URL=postgresql://postgres:password@localhost:5432/homegarden

# Production (SSL)
DATABASE_URL=postgresql://user:pass@db.example.com:5432/prod_db?sslmode=require

# Supabase
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
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

**Example:**
```env
GOOGLE_AI_API_KEY=AIzaSyC...
GEMINI_IDENTIFICATION_MODEL=gemini-2.0-flash
GEMINI_DIAGNOSIS_MODEL=gemini-2.5-pro-preview-06-05
```

---

## 🔐 Authentication (Supabase)

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | **Yes** | Your Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | **Yes** | Public anonymous key (safe to expose) |
| `SUPABASE_SECRET_KEY` | No | Service role key (keep secret!) |
| `JWT_SECRET` | **Yes** | Secret for signing JWTs (min 32 characters) |
| `JWT_EXPIRES_IN` | No | Access token expiry duration |

**Example:**
```env
SUPABASE_URL=https://abcdefgh.supabase.co
SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SECRET_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # Optional
JWT_SECRET=my-super-secret-jwt-key-at-least-32-chars
JWT_EXPIRES_IN=1h
```

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

**Example:**
```env
RATE_LIMIT_WINDOW_MS=60000   # 1 minute
RATE_LIMIT_MAX=100           # 100 requests per minute
```

---

## 📧 Email (Optional)

For sending notifications, password resets, etc.

| Variable | Required | Description |
|----------|----------|-------------|
| `SMTP_HOST` | No | SMTP server hostname |
| `SMTP_PORT` | No | SMTP server port |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASSWORD` | No | SMTP password |
| `SMTP_FROM_EMAIL` | No | Default "from" email address |

---

## 🧪 Testing

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TEST_DATABASE_URL` | No | (uses `DATABASE_URL`) | Separate test database |

**Best practice:** Use a separate test database to avoid polluting development data.

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/homegarden_dev
TEST_DATABASE_URL=postgresql://postgres:password@localhost:5432/homegarden_test
```

---

## 📋 Example `.env` File

```env
# ============================================
# Application
# ============================================
NODE_ENV=development
PORT=3000
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
LOG_LEVEL=debug

# ============================================
# Database (PostgreSQL)
# ============================================
DATABASE_URL=postgresql://postgres:password@localhost:5432/homegarden

# ============================================
# AI (Google Gemini)
# ============================================
GOOGLE_AI_API_KEY=AIzaSyC_your_api_key_here
GEMINI_IDENTIFICATION_MODEL=gemini-2.0-flash
GEMINI_DIAGNOSIS_MODEL=gemini-2.5-pro-preview-06-05

# ============================================
# Authentication (Supabase)
# ============================================
SUPABASE_URL=https://abcdefgh.supabase.co
SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=my-super-secret-jwt-key-at-least-32-characters-long

# ============================================
# Rate Limiting
# ============================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=350

# ============================================
# Weather (OpenMeteo)
# ============================================
WEATHER_API_BASE_URL=https://api.open-meteo.com/v1
```

---

## ✅ Validation

The application validates all environment variables on startup:

- Required variables must be present
- URLs must be valid
- API keys must have correct format
- Secrets must meet minimum length requirements

**Invalid configuration will prevent the server from starting.**

---

## 🔒 Security Best Practices

1. **Never commit `.env` to Git**
   - Add `.env` to `.gitignore` (already done)
   
2. **Use strong secrets**
   - Minimum 32 characters for `JWT_SECRET`
   - Use a password generator
   
3. **Rotate keys regularly**
   - Change API keys periodically
   - Especially after a security incident
   
4. **Separate environments**
   - Different `.env` for dev, staging, production
   - Different database credentials per environment

5. **Limit CORS origins in production**
   ```env
   # ❌ Development
   CORS_ORIGINS=*
   
   # ✅ Production
   CORS_ORIGINS=https://yourdomain.com
   ```

---

## 🚀 Production Deployment

For production deployments (Heroku, Railway, Vercel, etc.), set environment variables via the platform's dashboard or CLI:

**Heroku:**
```bash
heroku config:set GOOGLE_AI_API_KEY=your-key
heroku config:set DATABASE_URL=your-db-url
```

**Vercel:**
```bash
vercel env add GOOGLE_AI_API_KEY
```

**Docker:**
```bash
docker run -e GOOGLE_AI_API_KEY=your-key ...
```

---

**Keep your `.env` file secure and never share it publicly!** 🔐
