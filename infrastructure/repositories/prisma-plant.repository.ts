import { Plant } from '../../domain/entities/plant.entity.js'
import type {
  CreatePlantData,
  PlantRepository,
  UpdatePlantData,
} from '../../domain/repositories/plant.repository.js'
import { prisma } from '../database/prisma.client.js'

export class PrismaPlantRepository implements PlantRepository {
  async create(data: CreatePlantData): Promise<Plant> {
    const plant = await prisma.plant.create({
      data,
    })
    return Plant.fromPersistence(plant)
  }

  async findById(id: string): Promise<Plant | null> {
    const plant = await prisma.plant.findUnique({
      where: { id },
    })
    if (!plant) return null
    return Plant.fromPersistence(plant)
  }

  async findByGardenId(gardenId: string): Promise<Plant[]> {
    const plants = await prisma.plant.findMany({
      where: { gardenId },
      orderBy: { createdAt: 'desc' },
    })
    return plants.map(Plant.fromPersistence)
  }

  async findByUserId(userId: string): Promise<Plant[]> {
    const plants = await prisma.plant.findMany({
      where: {
        garden: {
          userId,
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return plants.map(Plant.fromPersistence)
  }

  async update(id: string, data: UpdatePlantData): Promise<Plant> {
    const plant = await prisma.plant.update({
      where: { id },
      data,
    })
    return Plant.fromPersistence(plant)
  }

  async delete(id: string): Promise<void> {
    await prisma.plant.delete({
      where: { id },
    })
  }

  async deleteByGardenId(gardenId: string): Promise<void> {
    await prisma.plant.deleteMany({
      where: { gardenId },
    })
  }

  async findAll(options?: {
    page?: number
    limit?: number
    gardenId?: string
    speciesId?: string
  }): Promise<{ plants: Plant[]; total: number }> {
    const page = options?.page ?? 1
    const limit = options?.limit ?? 10
    const skip = (page - 1) * limit

    const where: any = {}

    if (options?.gardenId) {
      where.gardenId = options.gardenId
    }

    if (options?.speciesId) {
      where.speciesId = options.speciesId
    }

    const [plants, total] = await Promise.all([
      prisma.plant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.plant.count({ where }),
    ])

    return {
      plants: plants.map(Plant.fromPersistence),
      total,
    }
  }

  async countByGardenId(gardenId: string): Promise<number> {
    return prisma.plant.count({
      where: { gardenId },
    })
  }

  async aggregateByCommonName(gardenId: string): Promise<{ name: string; count: number }[]> {
    const result = await prisma.plant.groupBy({
      by: ['commonName'],
      where: { gardenId },
      _count: {
        commonName: true,
      },
    })

    return result
      .filter((item) => item.commonName !== null)
      .map((item) => ({
        name: item.commonName as string,
        count: item._count.commonName,
      }))
  }
}
