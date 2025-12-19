import { prisma } from '../../infrastructure/database/prisma.client.js'

export const resetDb = async () => {
  try {
    await prisma.careCompletion.deleteMany()
    await prisma.careSchedule.deleteMany()
    await prisma.diagnosis.deleteMany()
    await prisma.plant.deleteMany()
    await prisma.garden.deleteMany()
    await prisma.refreshToken.deleteMany()
    await prisma.user.deleteMany()
    await prisma.species.deleteMany()
  } catch (error) {
    console.error('Reset DB Error:', error)
    throw error
  }
}

export const disconnectDb = async () => {
  await prisma.$disconnect()
}
