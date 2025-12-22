import { describe, expect, it, vi } from 'vitest'

describe('Logger Config', () => {
  it('should create logger with development config when NODE_ENV is development', async () => {
    vi.resetModules()
    vi.doMock('../../../infrastructure/config/env.js', () => ({
      env: { NODE_ENV: 'development' },
    }))

    const { logger } = await import('../../../infrastructure/config/logger.js')

    expect(logger).toBeDefined()
    // Pino level might still be silent if not reconfigured correctly or pino.transport
    // But we want to ensure it TRIED to set it to info (default).
    // Actually, logger.ts logic: level: test ? silent : info.
    // If we mock NODE_ENV=development, level should be info.
    expect(logger.level).toBe('info')
  })

  it('should create logger with production config when NODE_ENV is production', async () => {
    vi.resetModules()
    vi.doMock('../../../infrastructure/config/env.js', () => ({
      env: { NODE_ENV: 'production' },
    }))

    const { logger } = await import('../../../infrastructure/config/logger.js')
    expect(logger).toBeDefined()
    expect(logger.level).toBe('info')
  })

  it('should be silent in test env', async () => {
    vi.resetModules()
    vi.doMock('../../../infrastructure/config/env.js', () => ({
      env: { NODE_ENV: 'test' },
    }))

    const { logger } = await import('../../../infrastructure/config/logger.js')
    expect(logger.level).toBe('silent')
  })
})
