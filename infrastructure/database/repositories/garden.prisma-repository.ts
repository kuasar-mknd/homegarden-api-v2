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

    try {
      // Use Prisma's raw query for PostGIS optimization
      // ST_DWithin uses spheroid distance for geography type (meters)
      // We construct points from our Float columns on the fly
      const gardens = await prisma.$queryRaw<Garden[]>`
        SELECT 
          id, name, latitude, longitude, description, size, climate, 
          created_at as "createdAt", updated_at as "updatedAt", user_id as "userId"
        FROM gardens
        WHERE ST_DWithin(
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
