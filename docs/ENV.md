# Environment Variables

This document lists all environment variables used by the application.

## 📝 `.env` File

Copy `.env.example` to `.env` and fill in the values.

```bash
cp .env.example .env
```

## 📜 Variable Reference

### Application
| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | No | `development` | `development`, `production`, or `test` |
| `PORT` | No | `3000` | HTTP port to listen on |
| `CORS_ORIGINS` | No | `*` | Comma-separated list of allowed origins |

### Database
| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | **Yes** | PostgreSQL connection string (e.g., `postgresql://user:pass@host:5432/db`) |

### AI (Google Gemini)
| Variable | Required | Default | Description |
|---|---|---|---|
| `GOOGLE_AI_API_KEY` | **Yes** | - | API Key from Google AI Studio |
| `GEMINI_IDENTIFICATION_MODEL` | No | `gemini-1.5-flash` | Model for Plant ID |
| `GEMINI_DIAGNOSIS_MODEL` | No | `gemini-1.5-flash` | Model for Diagnosis |

### Authentication
| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | **Yes** | Secret key for signing JWTs (min 32 chars) |
| `JWT_EXPIRES_IN` | No | `1h` | Access token duration |
| `JWT_REFRESH_EXPIRES_IN`| No | `7d` | Refresh token duration |

### Supabase (Optional)
Used if you are integrating with Supabase services.

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | No | Your Supabase Project URL |
| `SUPABASE_ANON_KEY` | No | Public Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY`| No | Service Role Key (Keep secret!) |
