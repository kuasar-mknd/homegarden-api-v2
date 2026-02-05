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

// Optimization: Exclude heavy text fields (careNotes) from list views
const PLANT_LIST_SELECT = {
  id: true,
  gardenId: true,
  nickname: true,
  speciesId: true,
  commonName: true,
  scientificName: true,
  family: true,
  exposure: true,
  watering: true,
  soilType: true,
  flowerColor: true,
  height: true,
  plantedDate: true,
  acquiredDate: true,
  bloomingSeason: true,
  plantingSeason: true,
  imageUrl: true,
  thumbnailUrl: true,
  use: true,
  createdAt: true,
  updatedAt: true,
  // careNotes: false, // Excluded
}

export class PlantPrismaRepository implements PlantRepository {
  async create(data: CreatePlantData): Promise<Plant> {
    const plant = await prisma.plant.create({
      data: {
        gardenId: data.gardenId,
        nickname: data.nickname ?? null,
        speciesId: data.speciesId ?? null,
        commonName: data.commonName ?? null,
        scientificName: data.scientificName ?? null,
        family: data.family ?? null,
        exposure: data.exposure ?? null,
        watering: data.watering ?? null,
        soilType: data.soilType ?? null,
        flowerColor: data.flowerColor ?? null,
        height: data.height ?? null,
        plantedDate: data.plantedDate ?? null,
        acquiredDate: data.acquiredDate ?? null,
        bloomingSeason: data.bloomingSeason ?? null,
        plantingSeason: data.plantingSeason ?? null,
        careNotes: data.careNotes ?? null,
        imageUrl: data.imageUrl ?? null,
        thumbnailUrl: data.thumbnailUrl ?? null,
        use: data.use ?? null,
      },
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
      select: PLANT_LIST_SELECT,
    })
    return plants.map((p) => this.mapToEntity(p))
  }

  async findByUserId(userId: string): Promise<Plant[]> {
    const plants = await prisma.plant.findMany({
      where: {
        garden: { userId },
      },
      orderBy: { createdAt: 'desc' },
      select: PLANT_LIST_SELECT,
    })
    return plants.map((p) => this.mapToEntity(p))
  }

  async update(id: string, data: UpdatePlantData): Promise<Plant> {
    const plant = await prisma.plant.update({
      where: { id },
      data: {
        ...(data.nickname !== undefined ? { nickname: data.nickname } : {}),
        ...(data.speciesId !== undefined ? { speciesId: data.speciesId } : {}),
        ...(data.commonName !== undefined ? { commonName: data.commonName } : {}),
        ...(data.scientificName !== undefined ? { scientificName: data.scientificName } : {}),
        ...(data.family !== undefined ? { family: data.family } : {}),
        ...(data.exposure !== undefined ? { exposure: data.exposure } : {}),
        ...(data.watering !== undefined ? { watering: data.watering } : {}),
        ...(data.soilType !== undefined ? { soilType: data.soilType } : {}),
        ...(data.flowerColor !== undefined ? { flowerColor: data.flowerColor } : {}),
        ...(data.height !== undefined ? { height: data.height } : {}),
        ...(data.plantedDate !== undefined ? { plantedDate: data.plantedDate } : {}),
        ...(data.acquiredDate !== undefined ? { acquiredDate: data.acquiredDate } : {}),
        ...(data.bloomingSeason !== undefined ? { bloomingSeason: data.bloomingSeason } : {}),
        ...(data.plantingSeason !== undefined ? { plantingSeason: data.plantingSeason } : {}),
        ...(data.careNotes !== undefined ? { careNotes: data.careNotes } : {}),
        ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
        ...(data.thumbnailUrl !== undefined ? { thumbnailUrl: data.thumbnailUrl } : {}),
        ...(data.use !== undefined ? { use: data.use } : {}),
      },
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
  }): Promise<{ plants: Plant[]; total: number }> {
    const { page = 1, limit = 10, gardenId, speciesId } = options || {}
    const skip = (page - 1) * limit
    const where: any = {}
    if (gardenId) where.gardenId = gardenId
    if (speciesId) where.speciesId = speciesId

    const [plants, total] = await Promise.all([
      prisma.plant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: PLANT_LIST_SELECT,
      }),
      prisma.plant.count({ where }),
    ])

    return {
      plants: plants.map((p) => this.mapToEntity(p)),
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
