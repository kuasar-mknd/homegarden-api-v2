import type {
  CareSchedule,
  CareScheduleProps,
} from '../../../domain/entities/care-schedule.entity.js'
import { CareSchedule as CareScheduleEntity } from '../../../domain/entities/care-schedule.entity.js'
import type {
  CareScheduleRepository,
  CreateCareScheduleData,
  UpdateCareScheduleData,
} from '../../../domain/repositories/care-schedule.repository.js'
import { prisma } from '../prisma.client.js'

export class CareSchedulePrismaRepository implements CareScheduleRepository {
  async create(data: CreateCareScheduleData): Promise<CareSchedule> {
    const schedule = await prisma.careSchedule.create({
      data: {
        taskType: data.taskType,
        frequency: data.frequency,
        intervalDays: data.intervalDays ?? null,
        nextDueDate: data.nextDueDate,
        notes: data.notes ?? null,
        isEnabled: data.isEnabled ?? true,
        weatherAdjust: data.weatherAdjust ?? false,
        gardenId: data.gardenId ?? null,
        plantId: data.plantId ?? null,
        userId: data.userId,
      },
    })
    return this.mapToEntity(schedule)
  }

  async findById(id: string): Promise<CareSchedule | null> {
    const schedule = await prisma.careSchedule.findUnique({
      where: { id },
    })
    return schedule ? this.mapToEntity(schedule) : null
  }

  async findByUserId(userId: string): Promise<CareSchedule[]> {
    const schedules = await prisma.careSchedule.findMany({
      where: { userId },
      orderBy: { nextDueDate: 'asc' },
    })
    return schedules.map(this.mapToEntity)
  }

  async findByPlantId(plantId: string): Promise<CareSchedule[]> {
    const schedules = await prisma.careSchedule.findMany({
      where: { plantId },
      orderBy: { nextDueDate: 'asc' },
    })
    return schedules.map(this.mapToEntity)
  }

  async findByGardenId(gardenId: string): Promise<CareSchedule[]> {
    const schedules = await prisma.careSchedule.findMany({
      where: { gardenId },
      orderBy: { nextDueDate: 'asc' },
    })
    return schedules.map(this.mapToEntity)
  }

  async update(id: string, data: UpdateCareScheduleData): Promise<CareSchedule> {
    const schedule = await prisma.careSchedule.update({
      where: { id },
      data: {
        ...data,
      } as any, // Cast to any to handle undefined optional fields if needed, or rely on clean data
    })
    return this.mapToEntity(schedule)
  }

  async delete(id: string): Promise<void> {
    await prisma.careSchedule.delete({ where: { id } })
  }

  async findUpcoming(userId: string, days: number): Promise<CareSchedule[]> {
    const today = new Date()
    const futureDate = new Date(today) // Optimization: Clone date instead of new Date() + setDate separately
    futureDate.setDate(today.getDate() + days)

    const schedules = await prisma.careSchedule.findMany({
      where: {
        userId,
        isEnabled: true,
        nextDueDate: {
          gte: today,
          lte: futureDate,
        },
      },
      orderBy: { nextDueDate: 'asc' },
      // Optimization: Exclude notes from list
      select: {
        id: true,
        taskType: true,
        frequency: true,
        intervalDays: true,
        nextDueDate: true,
        lastDoneAt: true,
        isEnabled: true,
        weatherAdjust: true,
        gardenId: true,
        plantId: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        // notes: excluded
      },
    })
    return schedules.map(this.mapToEntity)
  }

  async findOverdue(userId: string): Promise<CareSchedule[]> {
    const today = new Date()
    const schedules = await prisma.careSchedule.findMany({
      where: {
        userId,
        isEnabled: true,
        nextDueDate: {
          lt: today,
        },
      },
      orderBy: { nextDueDate: 'asc' },
      // Optimization: Exclude notes from list
      select: {
        id: true,
        taskType: true,
        frequency: true,
        intervalDays: true,
        nextDueDate: true,
        lastDoneAt: true,
        isEnabled: true,
        weatherAdjust: true,
        gardenId: true,
        plantId: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        // notes: excluded
      },
    })
    return schedules.map(this.mapToEntity)
  }

  async markComplete(id: string, notes?: string, photoUrl?: string): Promise<CareSchedule> {
    const completedAt = new Date()

    // Transaction: Log completion and update lastDoneAt
    // Note: nextDueDate calculation is complex (business logic) and should be handled
    // by the Use Case calling update() separately, or this method needs to be enriched.
    // For now, we update lastDoneAt to reflect the action.
    const [_, updatedSchedule] = await prisma.$transaction([
      prisma.careCompletion.create({
        data: {
          scheduleId: id,
          notes: notes ?? null,
          photoUrl: photoUrl ?? null,
          completedAt,
        },
      }),
      prisma.careSchedule.update({
        where: { id },
        data: {
          lastDoneAt: completedAt,
        },
      }),
    ])

    return this.mapToEntity(updatedSchedule)
  }

  private mapToEntity(prismaSchedule: any): CareSchedule {
    const props: CareScheduleProps = {
      id: prismaSchedule.id,
      taskType: prismaSchedule.taskType,
      frequency: prismaSchedule.frequency,
      intervalDays: prismaSchedule.intervalDays ?? null,
      nextDueDate: prismaSchedule.nextDueDate,
      lastDoneAt: prismaSchedule.lastDoneAt ?? null,
      notes: prismaSchedule.notes ?? null,
      isEnabled: prismaSchedule.isEnabled,
      weatherAdjust: prismaSchedule.weatherAdjust,
      gardenId: prismaSchedule.gardenId ?? null,
      plantId: prismaSchedule.plantId ?? null,
      userId: prismaSchedule.userId,
      createdAt: prismaSchedule.createdAt,
      updatedAt: prismaSchedule.updatedAt,
    }
    return CareScheduleEntity.fromPersistence(props)
  }
}
