import { Prisma } from '@prisma/client'
import { Garden } from '../../../domain/entities/garden.entity.js'
import type {
  CreateGardenData,
  GardenRepository,
  NearbyQuery,
  UpdateGardenData,
} from '../../../domain/repositories/garden.repository.js'
import { logger } from '../../config/logger.js'
import { prisma } from '../prisma.client.js'

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
    return this.findById(id)
  }

  async findByUserId(userId: string): Promise<Garden[]> {
    const gardens = await prisma.garden.findMany({
      where: { userId },
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
    })
    return garden ? this.mapToEntity(garden) : null
  }

  async findNearby(query: NearbyQuery): Promise<Garden[]> {
    const { latitude, longitude, radiusKm = 10, limit = 50 } = query
    const radiusMeters = radiusKm * 1000

    // Optimization: Bounding Box Pre-filtering
    // Calculate rough bounding box to use B-Tree index on [latitude, longitude]
    // before applying expensive PostGIS ST_DWithin function.
    // 1 degree lat ~= 111km
    // 1 degree lon ~= 111km * cos(lat)
    const latDelta = radiusKm / 111
    // Handle pole proximity: if close to poles (e.g. > 80 deg), skip lon check or widen significantly
    // cos(80 deg) is approx 0.17, so delta is 6x larger.
    // If we are really close to the pole, longitude doesn't matter much or spans the whole globe.
    const isNearPole = Math.abs(latitude) > 80
    const lonDelta = isNearPole ? 360 : radiusKm / (111 * Math.cos(latitude * (Math.PI / 180)))

    const minLat = Math.max(-90, latitude - latDelta)
    const maxLat = Math.min(90, latitude + latDelta)

    const minLon = longitude - lonDelta
    const maxLon = longitude + lonDelta

    // Handle International Date Line wrapping
    let lonCondition: Prisma.Sql

    if (minLon < -180 || maxLon > 180) {
      // Wrap around case
      // Normalize to -180 to 180 range isn't quite right for the query directly
      // If query spans date line, we need OR logic: (lon >= minLonWrapped OR lon <= maxLonWrapped)
      // But Prisma raw query composition is tricky with dynamic conditions.
      // For simplicity in this optimization pass, if we cross the date line, we skip the longitude pre-filter.
      // It's an edge case where performance might degrade slightly back to baseline, which is acceptable.
      lonCondition = Prisma.sql`1=1`
    } else {
      // Standard case
      lonCondition = Prisma.sql`longitude BETWEEN ${minLon} AND ${maxLon}`
    }

    try {
      // Use Prisma's raw query for PostGIS optimization
      // ST_DWithin uses spheroid distance for geography type (meters)
      // We construct points from our Float columns on the fly
      const gardens = await prisma.$queryRaw<Garden[]>`
        SELECT 
          id, name, latitude, longitude, description, size, climate, 
          created_at as "createdAt", updated_at as "updatedAt", user_id as "userId"
        FROM gardens
        WHERE
          latitude BETWEEN ${minLat} AND ${maxLat}
          AND ${lonCondition}
          AND ST_DWithin(
            ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
            ${radiusMeters}
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
      prisma.garden.findMany({ where, skip, take: limit }),
      prisma.garden.count({ where }),
    ])

    return {
      gardens: gardens.map((g: any) => this.mapToEntity(g)),
      total,
    }
  }

  private mapToEntity(prismaGarden: any): Garden {
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
    })
  }
}
