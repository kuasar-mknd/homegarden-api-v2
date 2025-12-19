/**
 * Prisma Client Singleton
 *
 * Ensures only one instance of PrismaClient is created across the application.
 * This is important for connection pooling and avoiding "too many connections" errors.
 */

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import pg from 'pg'
import { env } from '../config/env.js'

const { Pool } = pg

declare global {
  var prismaGlobal: PrismaClient | undefined
  var poolGlobal: pg.Pool | undefined
}

const connectionString = env.DATABASE_URL

const pool =
  globalThis.poolGlobal ||
  new Pool({
    connectionString,
    max: env.NODE_ENV === 'test' ? 20 : undefined,
  })

if (env.NODE_ENV !== 'production') {
  globalThis.poolGlobal = pool
}

const adapter = new PrismaPg(pool)

export const prisma: PrismaClient =
  globalThis.prismaGlobal ||
  new PrismaClient({
    adapter,
    log: env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    errorFormat: env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
  })

if (env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}

export const disconnectDb = async () => {
  await prisma.$disconnect()
}
