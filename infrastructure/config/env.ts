/**
 * Environment Configuration
 *
 * Uses Zod for type-safe environment variable parsing and validation.
 * All environment variables are validated at startup.
 */

import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),

  // CORS - parse comma-separated origins
  CORS_ORIGINS: z
    .string()
    .default('*')
    .transform((val) => val.split(',')),

  // Database
  DATABASE_URL: z.string().default('postgresql://localhost:5432/homegarden'),

  // Supabase Auth
  SUPABASE_URL: z.string().url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SECRET_KEY: z.string().min(1).optional(),

  // JWT (fallback)
  JWT_SECRET: z.string().min(32).optional(),
  JWT_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Google Gemini AI
  GOOGLE_AI_API_KEY: z.string().optional(),
  GEMINI_IDENTIFICATION_MODEL: z.string().default('gemini-2.0-flash'),
  GEMINI_DIAGNOSIS_MODEL: z.string().default('gemini-2.5-pro-preview-06-05'),

  // PlantNet API (for plant identification - fallback)
  PLANTNET_API_KEY: z.string().optional(),

  // Weather API
  WEATHER_API_BASE_URL: z.string().default('https://api.open-meteo.com/v1'),

  // File Storage
  STORAGE_BUCKET: z.string().optional(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX: z.coerce.number().default(350),
})

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:')
      for (const issue of error.issues) {
        console.error(`   - ${issue.path.join('.')}: ${issue.message}`)
      }
      process.exit(1)
    }
    throw error
  }
}

export const env = parseEnv()

// Type export for use in other modules
export type Env = z.infer<typeof envSchema>
