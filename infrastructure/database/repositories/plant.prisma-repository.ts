import { Plant } from '../../../domain/entities/plant.entity.js'
import type {
  CreatePlantData,
  PlantRepository,
  UpdatePlantData,
} from '../../../domain/repositories/plant.repository.js'
import { prisma } from '../prisma.client.js'

// Optimization: Shared selection object to reduce payload size and avoid code duplication
const GARDEN_SELECT = {
  select: {
    id: true,
    name: true,
    userId: true,
    latitude: true,
    longitude: true,
    createdAt: true,
    updatedAt: true,
  },
}

export class PlantPrismaRepository implements PlantRepository {
  async create(data: CreatePlantData): Promise<Plant> {
    const plant = await prisma.plant.create({
      data: {
        gardenId: data.gardenId,
        nickname: data.nickname,
        speciesId: data.speciesId,
        commonName: data.commonName,
        scientificName: data.scientificName,
        family: data.family,
        exposure: data.exposure,
        watering: data.watering,
        soilType: data.soilType,
        flowerColor: data.flowerColor,
        height: data.height,
        plantedDate: data.plantedDate,
        acquiredDate: data.acquiredDate,
        bloomingSeason: data.bloomingSeason,
        plantingSeason: data.plantingSeason,
        careNotes: data.careNotes,
        imageUrl: data.imageUrl,
        thumbnailUrl: data.thumbnailUrl,
        use: data.use,
      } as any,
      include: {
        garden: GARDEN_SELECT,
      },
    })
    return this.mapToEntity(plant)
  }

  async findById(id: string): Promise<Plant | null> {
    const plant = await prisma.plant.findUnique({
      where: { id },
      include: {
        garden: GARDEN_SELECT,
      },
    })
    return plant ? this.mapToEntity(plant) : null
  }

  async findByGardenId(gardenId: string): Promise<Plant[]> {
    const plants = await prisma.plant.findMany({
      where: { gardenId },
      orderBy: { createdAt: 'desc' },
    })
    return plants.map(this.mapToEntity)
  }

  async findByUserId(userId: string): Promise<Plant[]> {
    // Optimization: Fetch garden IDs first to avoid expensive join
    const gardens = await prisma.garden.findMany({
      where: { userId },
      select: { id: true },
    })

    if (gardens.length === 0) return []

    const gardenIds = gardens.map((g) => g.id)

    const plants = await prisma.plant.findMany({
      where: {
        gardenId: { in: gardenIds },
      },
      orderBy: { createdAt: 'desc' },
    })
    return plants.map(this.mapToEntity)
  }

  async update(id: string, data: UpdatePlantData): Promise<Plant> {
    const plant = await prisma.plant.update({
      where: { id },
      data: {
        ...data,
      } as any,
      include: {
        garden: GARDEN_SELECT,
      },
    })
    return this.mapToEntity(plant)
  }

  async delete(id: string): Promise<void> {
    await prisma.plant.delete({ where: { id } })
  }

  async deleteByGardenId(gardenId: string): Promise<void> {
    await prisma.plant.deleteMany({ where: { gardenId } })
  }

  async findAll(options?: {
    page?: number
    limit?: number
    gardenId?: string
    speciesId?: string
    userId?: string
  }): Promise<{ plants: Plant[]; total: number }> {
    const { page = 1, limit = 10, gardenId, speciesId, userId } = options || {}
    const skip = (page - 1) * limit
    const where: any = {}

    if (gardenId) where.gardenId = gardenId
    if (speciesId) where.speciesId = speciesId

    // Optimization: If filtering by userId, use the 2-step approach if gardenId is not present
    if (userId && !gardenId) {
      const gardens = await prisma.garden.findMany({
        where: { userId },
        select: { id: true },
      })
      if (gardens.length === 0) {
        return { plants: [], total: 0 }
      }
      where.gardenId = { in: gardens.map((g) => g.id) }
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
      plants: plants.map(this.mapToEntity),
      total,
    }
  }

  async countByGardenId(gardenId: string): Promise<number> {
    return prisma.plant.count({ where: { gardenId } })
  }

  async aggregateByCommonName(gardenId: string): Promise<{ name: string; count: number }[]> {
    const groups = await prisma.plant.groupBy({
      by: ['commonName'],
      where: { gardenId },
      _count: {
        _all: true,
      },
      // Optimization: We added @@index([gardenId, commonName])
      // Ordering by commonName will leverage the index for faster grouping
      orderBy: {
        commonName: 'asc',
      },
    })
    return groups.map((g: any) => ({
      name: g.commonName || 'Unknown',
      count: g._count._all,
    }))
  }

  private mapToEntity(prismaPlant: any): Plant {
    const garden = prismaPlant.garden
      ? {
          id: prismaPlant.garden.id,
          name: prismaPlant.garden.name,
          userId: prismaPlant.garden.userId,
          latitude: prismaPlant.garden.latitude,
          longitude: prismaPlant.garden.longitude,
          createdAt: prismaPlant.garden.createdAt,
          updatedAt: prismaPlant.garden.updatedAt,
        }
      : undefined

    return Plant.fromPersistence({
      id: prismaPlant.id,
      nickname: prismaPlant.nickname ?? null,
      speciesId: prismaPlant.speciesId ?? null,
      commonName: prismaPlant.commonName ?? null,
      scientificName: prismaPlant.scientificName ?? null,
      family: prismaPlant.family ?? null,
      exposure: prismaPlant.exposure ?? null,
      watering: prismaPlant.watering ?? null,
      soilType: prismaPlant.soilType ?? null,
      flowerColor: prismaPlant.flowerColor ?? null,
      height: prismaPlant.height ?? null,
      plantedDate: prismaPlant.plantedDate ?? null,
      acquiredDate: prismaPlant.acquiredDate ?? null,
      bloomingSeason: prismaPlant.bloomingSeason ?? null,
      plantingSeason: prismaPlant.plantingSeason ?? null,
      careNotes: prismaPlant.careNotes ?? null,
      imageUrl: prismaPlant.imageUrl ?? null,
      thumbnailUrl: prismaPlant.thumbnailUrl ?? null,
      use: prismaPlant.use ?? null,
      gardenId: prismaPlant.gardenId,
      createdAt: prismaPlant.createdAt,
      updatedAt: prismaPlant.updatedAt,
      ...(garden ? { garden } : {}),
    })
  }
}
