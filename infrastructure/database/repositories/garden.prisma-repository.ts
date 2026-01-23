// import { Prisma } from '@prisma/client'
import { Garden } from '../../../domain/entities/garden.entity.js'
import { Plant } from '../../../domain/entities/plant.entity.js'
import type {
  CreateGardenData,
  GardenRepository,
  NearbyQuery,
  UpdateGardenData,
} from '../../../domain/repositories/garden.repository.js'
import { logger } from '../../config/logger.js'
import { prisma } from '../prisma.client.js'

// Optimization: Exclude description (potential large text) from list views
const GARDEN_LIST_SELECT = {
  id: true,
  name: true,
  latitude: true,
  longitude: true,
  size: true,
  climate: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  // description: false, // Excluded
}

export class GardenPrismaRepository implements GardenRepository {
  async create(data: CreateGardenData): Promise<Garden> {
    const garden = await prisma.garden.create({
      data: {
        name: data.name,
        latitude: data.latitude,
        longitude: data.longitude,
        userId: data.userId,
        description: data.description ?? null,
        size: data.size ?? null,
        climate: data.climate ?? null,
      },
    })
    return this.mapToEntity(garden)
  }

  async findById(id: string): Promise<Garden | null> {
    const garden = await prisma.garden.findUnique({
      where: { id },
    })
    return garden ? this.mapToEntity(garden) : null
  }

  async findByIdWithPlants(id: string): Promise<Garden | null> {
    // Optimization: Include plants in a single query to avoid N+1
    const garden = await prisma.garden.findUnique({
      where: { id },
      include: {
        plants: true,
      },
    })
    return garden ? this.mapToEntity(garden) : null
  }

  async findByUserId(userId: string): Promise<Garden[]> {
    const gardens = await prisma.garden.findMany({
      where: { userId },
      select: GARDEN_LIST_SELECT,
    })
    return gardens.map((g: any) => this.mapToEntity(g))
  }

  async update(id: string, data: UpdateGardenData): Promise<Garden> {
    const garden = await prisma.garden.update({
      where: { id },
      data: {
        ...data,
        description: data.description === undefined ? undefined : data.description,
        size: data.size === undefined ? undefined : data.size,
        climate: data.climate === undefined ? undefined : data.climate,
      } as any, // Bypass strict optional type check for now if persisted, or refine logic
    })
    return this.mapToEntity(garden)
  }

  async delete(id: string): Promise<void> {
    await prisma.garden.delete({ where: { id } })
  }

  async findByUserAndName(userId: string, name: string): Promise<Garden | null> {
    const garden = await prisma.garden.findFirst({
      where: { userId, name },
      select: GARDEN_LIST_SELECT, // Likely checking existence or quick lookup
    })
    return garden ? this.mapToEntity(garden) : null
  }

  async findNearby(query: NearbyQuery): Promise<Garden[]> {
    const { latitude, longitude, radiusKm = 10, limit = 50 } = query
    const radiusMeters = radiusKm * 1000

    // Bounding Box Calculation for Index Utilization
    // 1 deg lat ~= 111km
    const latDelta = radiusKm / 111.0
    const minLat = Math.max(-90, latitude - latDelta)
    const maxLat = Math.min(90, latitude + latDelta)

    // Longitude Delta depends on latitude. Use max latitude in the box to be safe (largest delta).
    // Avoid division by zero at poles.
    const safeLat = Math.max(Math.abs(minLat), Math.abs(maxLat))
    const lonDelta =
      safeLat >= 89.9 ? 180 : radiusKm / (111.0 * Math.cos(safeLat * (Math.PI / 180)))

    const minLon = longitude - lonDelta
    const maxLon = longitude + lonDelta

    try {
      // Use Prisma's raw query for PostGIS optimization
      // Optimization: Filter by Bounding Box first to use standard B-Tree indexes
      // before running expensive ST_DWithin on the reduced set.
      // Handle date line wrapping (longitude crossing 180/-180)
      const gardens =
        minLon < -180 || maxLon > 180
          ? await prisma.$queryRaw<Garden[]>`
        SELECT
          id, name, latitude, longitude, description, size, climate,
          created_at as "createdAt", updated_at as "updatedAt", user_id as "userId"
        FROM gardens
        WHERE
          latitude BETWEEN ${minLat} AND ${maxLat}
          AND (longitude BETWEEN ${minLon < -180 ? minLon + 360 : minLon} AND 180
               OR longitude BETWEEN -180 AND ${maxLon > 180 ? maxLon - 360 : maxLon})
          AND ST_DWithin(
            ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${longitude}::float, ${latitude}::float), 4326)::geography,
            ${radiusMeters}::float
          )
        LIMIT ${limit};
      `
          : await prisma.$queryRaw<Garden[]>`
        SELECT 
          id, name, latitude, longitude, description, size, climate, 
          created_at as "createdAt", updated_at as "updatedAt", user_id as "userId"
        FROM gardens
        WHERE
          latitude BETWEEN ${minLat} AND ${maxLat}
          AND longitude BETWEEN ${minLon} AND ${maxLon}
          AND ST_DWithin(
            ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${longitude}::float, ${latitude}::float), 4326)::geography,
            ${radiusMeters}::float
          )
        LIMIT ${limit};
      `

      return gardens.map(this.mapToEntity)
    } catch (error) {
      logger.error({ err: error }, 'Geospatial Query Error')
      // Fallback or empty array if PostGIS fails/missing
      return []
    }
  }

  async findAll(options?: {
    page?: number
    limit?: number
    userId?: string
    search?: string
  }): Promise<{ gardens: Garden[]; total: number }> {
    const { page = 1, limit = 10, userId, search } = options || {}
    const skip = (page - 1) * limit
    const where: any = {}
    if (userId) where.userId = userId
    if (search) where.name = { contains: search }

    const [gardens, total] = await Promise.all([
      prisma.garden.findMany({
        where,
        skip,
        take: limit,
        select: GARDEN_LIST_SELECT,
      }),
      prisma.garden.count({ where }),
    ])

    return {
      gardens: gardens.map((g: any) => this.mapToEntity(g)),
      total,
    }
  }

  private mapToEntity(prismaGarden: any): Garden {
    // Map plants if included in the query result
    const plants = prismaGarden.plants
      ? prismaGarden.plants.map((p: any) =>
          Plant.fromPersistence({
            id: p.id,
            gardenId: p.gardenId,
            nickname: p.nickname ?? null,
            speciesId: p.speciesId ?? null,
            commonName: p.commonName ?? null,
            scientificName: p.scientificName ?? null,
            family: p.family ?? null,
            exposure: p.exposure ?? null,
            watering: p.watering ?? null,
            soilType: p.soilType ?? null,
            flowerColor: p.flowerColor ?? null,
            height: p.height ?? null,
            plantedDate: p.plantedDate ?? null,
            acquiredDate: p.acquiredDate ?? null,
            bloomingSeason: p.bloomingSeason ?? null,
            plantingSeason: p.plantingSeason ?? null,
            careNotes: p.careNotes ?? null,
            imageUrl: p.imageUrl ?? null,
            thumbnailUrl: p.thumbnailUrl ?? null,
            use: p.use ?? null,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
          }),
        )
      : undefined

    return Garden.fromPersistence({
      id: prismaGarden.id,
      name: prismaGarden.name,
      description: prismaGarden.description ?? undefined,
      latitude: prismaGarden.latitude,
      longitude: prismaGarden.longitude,
      userId: prismaGarden.userId,
      size: prismaGarden.size ?? undefined,
      climate: prismaGarden.climate ?? undefined,
      createdAt: prismaGarden.createdAt,
      updatedAt: prismaGarden.updatedAt,
      plants,
    })
  }
}
