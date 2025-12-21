import { CareSchedule } from '../../domain/entities/care-schedule.entity.js'
import type {
  CareScheduleRepository,
  CreateCareScheduleData,
  UpdateCareScheduleData,
} from '../../domain/repositories/care-schedule.repository.js'
import { prisma } from '../database/prisma.client.js'

export class PrismaCareScheduleRepository implements CareScheduleRepository {
  async create(data: CreateCareScheduleData): Promise<CareSchedule> {
    const schedule = await prisma.careSchedule.create({
      data: data as any,
    })
    return CareSchedule.fromPersistence(schedule)
  }

  async findById(id: string): Promise<CareSchedule | null> {
    const schedule = await prisma.careSchedule.findUnique({
      where: { id },
    })
    if (!schedule) return null
    return CareSchedule.fromPersistence(schedule)
  }

  async findByUserId(userId: string): Promise<CareSchedule[]> {
    const schedules = await prisma.careSchedule.findMany({
      where: { userId },
      orderBy: { nextDueDate: 'asc' },
    })
    return schedules.map(CareSchedule.fromPersistence)
  }

  async findByPlantId(plantId: string): Promise<CareSchedule[]> {
    const schedules = await prisma.careSchedule.findMany({
      where: { plantId },
      orderBy: { nextDueDate: 'asc' },
    })
    return schedules.map(CareSchedule.fromPersistence)
  }

  async findByGardenId(gardenId: string): Promise<CareSchedule[]> {
    const schedules = await prisma.careSchedule.findMany({
      where: { gardenId },
      orderBy: { nextDueDate: 'asc' },
    })
    return schedules.map(CareSchedule.fromPersistence)
  }

  async update(id: string, data: UpdateCareScheduleData): Promise<CareSchedule> {
    const schedule = await prisma.careSchedule.update({
      where: { id },
      data: data as any,
    })
    return CareSchedule.fromPersistence(schedule)
  }

  async delete(id: string): Promise<void> {
    await prisma.careSchedule.delete({
      where: { id },
    })
  }

  async findUpcoming(userId: string, days: number): Promise<CareSchedule[]> {
    const today = new Date()
    const futureDate = new Date()
    futureDate.setDate(today.getDate() + days)

    const schedules = await prisma.careSchedule.findMany({
      where: {
        userId,
        nextDueDate: {
          gte: today,
          lte: futureDate,
        },
        isEnabled: true,
      },
      orderBy: { nextDueDate: 'asc' },
    })
    return schedules.map(CareSchedule.fromPersistence)
  }

  async findOverdue(userId: string): Promise<CareSchedule[]> {
    const today = new Date()

    const schedules = await prisma.careSchedule.findMany({
      where: {
        userId,
        nextDueDate: {
          lt: today,
        },
        isEnabled: true,
      },
      orderBy: { nextDueDate: 'asc' },
    })
    return schedules.map(CareSchedule.fromPersistence)
  }

  async markComplete(id: string, notes?: string, photoUrl?: string): Promise<CareSchedule> {
    const schedule = await prisma.careSchedule.findUnique({ where: { id } })
    if (!schedule) throw new Error('Schedule not found')

    // Calculate next due date
    const lastDoneAt = new Date()
    const nextDueDate = new Date(lastDoneAt)

    // Simple calculation based on frequency
    switch (schedule.frequency) {
      case 'DAILY':
        nextDueDate.setDate(nextDueDate.getDate() + 1)
        break
      case 'EVERY_OTHER_DAY':
        nextDueDate.setDate(nextDueDate.getDate() + 2)
        break
      case 'TWICE_WEEKLY':
        nextDueDate.setTime(nextDueDate.getTime() + 3.5 * 24 * 60 * 60 * 1000)
        break
      case 'WEEKLY':
        nextDueDate.setDate(nextDueDate.getDate() + 7)
        break
      case 'BIWEEKLY':
        nextDueDate.setDate(nextDueDate.getDate() + 14)
        break
      case 'MONTHLY':
        nextDueDate.setMonth(nextDueDate.getMonth() + 1)
        break
      case 'CUSTOM':
        if (schedule.intervalDays) {
          nextDueDate.setDate(nextDueDate.getDate() + schedule.intervalDays)
        }
        break
    }

    const [updatedSchedule] = await prisma.$transaction([
      prisma.careSchedule.update({
        where: { id },
        data: {
          lastDoneAt,
          nextDueDate,
        },
      }),
      prisma.careCompletion.create({
        data: {
          scheduleId: id,
          completedAt: lastDoneAt,
          notes: notes ?? null,
          photoUrl: photoUrl ?? null,
        },
      }),
    ])

    return CareSchedule.fromPersistence(updatedSchedule)
  }
}
