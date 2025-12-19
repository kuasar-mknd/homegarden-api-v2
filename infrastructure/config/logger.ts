import pino from 'pino'
import { env } from './env.js'

/**
 * Application Logger
 * uses Pino for high-performance structured logging.
 */
export const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : 'info',
  transport:
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : (undefined as any),
  redact: {
    paths: [
      'password',
      'token',
      'authorization',
      'Authorization',
      'cookie',
      'Cookie',
      'user.password',
      'access_token',
      'refresh_token',
    ],
    remove: true,
  },
  base: {
    env: env.NODE_ENV,
  },
})

// Type compatibility for Hono logger or general usage
export type Logger = typeof logger
