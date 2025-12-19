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
  },
})
