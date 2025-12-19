import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    fileParallelism: false,
    include: ['**/*.{test,spec}.ts'],
    alias: {
      '@domain': path.resolve(__dirname, './domain'),
      '@application': path.resolve(__dirname, './application'),
      '@infrastructure': path.resolve(__dirname, './infrastructure'),
      '@shared': path.resolve(__dirname, './shared'),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        'tests/**',
        '**/*.test.ts',
        '**/*.config.ts',
        'prisma/**',
        // Server startup and configuration files (tested via E2E/integration)
        'index.ts',
        'infrastructure/config/env.ts',
        'infrastructure/database/prisma.client.ts',
        'infrastructure/websocket/index.ts',
        'infrastructure/websocket/ws-server.ts',
        'infrastructure/websocket/types.ts',
        'infrastructure/http/middleware/index.ts',
      ],
    },
  },
})
