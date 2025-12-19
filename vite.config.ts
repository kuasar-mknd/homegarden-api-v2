import devServer from '@hono/vite-dev-server'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    devServer({
      entry: 'index.ts',
      injectClientScript: false,
    }),
  ],
  server: {
    port: 3000,
  },
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      include: ['application/**/*.ts', 'infrastructure/**/*.ts', 'domain/**/*.ts'],
      exclude: [
        'infrastructure/database/migrations/**',
        'dist/**',
        '**/node_modules/**',
        'tests/**',
      ],
    },
  },
})
