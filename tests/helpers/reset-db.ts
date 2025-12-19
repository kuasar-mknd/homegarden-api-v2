
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const resetDb = async () => {
  // Order matters due to foreign key constraints
  const tablenames = [
    'care_completions',
    'care_schedules',
    'diagnoses',
    'plants',
    'gardens',
    'refresh_tokens', 
    'users',
    'species'
  ]

  try {
    for (const tableName of tablenames) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tableName}" CASCADE;`)
    }
  } catch (error) {
    console.log({ error })
  }
}

export const disconnectDb = async () => {
  await prisma.$disconnect()
}
