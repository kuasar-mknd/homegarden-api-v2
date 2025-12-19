/**
 * Prisma Client Singleton
 *
 * Ensures only one instance of PrismaClient is created across the application.
 * This is important for connection pooling and avoiding "too many connections" errors.
 */

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { env } from '../config/env.js'

// Declare global type for Prisma client singleton
declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined
}

// Create Prisma client with appropriate logging
const createPrismaClient = () => {
  const connectionString = env.DATABASE_URL
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
    log: env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    errorFormat: env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
  })
}

// Use global singleton in development to prevent hot-reload issues
export const prisma = globalThis.prismaGlobal ?? createPrismaClient()

if (env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})
