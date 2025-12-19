import { Garden } from '../../domain/entities/garden.entity.js'
import { Plant } from '../../domain/entities/plant.entity.js'
import type {
  CreateGardenData,
  GardenRepository,
  NearbyQuery,
  UpdateGardenData,
} from '../../domain/repositories/garden.repository.js'
import { prisma } from '../database/prisma.client.js'

export class PrismaGardenRepository implements GardenRepository {
  async create(data: CreateGardenData): Promise<Garden> {
    const garden = await prisma.garden.create({
      data,
    })
    return Garden.fromPersistence(garden)
  }

  async findById(id: string): Promise<Garden | null> {
    const garden = await prisma.garden.findUnique({
      where: { id },
    })
    if (!garden) return null
    return Garden.fromPersistence(garden)
  }

  async findByIdWithPlants(id: string): Promise<Garden | null> {
    const garden = await prisma.garden.findUnique({
      where: { id },
      include: {
        plants: true,
      },
    })
    if (!garden) return null
    return this.mapToDomain(garden)
  }

  private mapToDomain(prismaGarden: any): Garden {
    const { plants, ...rest } = prismaGarden

    const props: any = { ...rest }

    if (plants && Array.isArray(plants)) {
      props.plants = plants.map((p: any) => Plant.fromPersistence(p))
    }

    return Garden.fromPersistence(props)
  }

  async findByUserId(userId: string): Promise<Garden[]> {
    const gardens = await prisma.garden.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    return gardens.map(Garden.fromPersistence)
  }

  async update(id: string, data: UpdateGardenData): Promise<Garden> {
    const garden = await prisma.garden.update({
      where: { id },
      data,
    })
    return Garden.fromPersistence(garden)
  }

  async delete(id: string): Promise<void> {
    await prisma.garden.delete({
      where: { id },
    })
  }

  async findNearby(query: NearbyQuery): Promise<Garden[]> {
    const { latitude, longitude, radiusKm = 10, limit = 50 } = query

    // Bounding Box Calculation
    // 1 degree lat ~= 111 km
    // 1 degree lng ~= 111 km * cos(lat)
    const latDelta = radiusKm / 111.0
    const cosLat = Math.cos((latitude * Math.PI) / 180.0)
    const lngDelta = radiusKm / (111.0 * Math.max(0.1, Math.abs(cosLat))) // Avoid division by zero

    const minLat = latitude - latDelta
    const maxLat = latitude + latDelta
    const minLng = longitude - lngDelta
    const maxLng = longitude + lngDelta

    const gardens = (await prisma.$queryRaw`
      SELECT *, (
        6371 * acos(
          cos(radians(${latitude})) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(${longitude})) +
          sin(radians(${latitude})) * sin(radians(latitude))
        )
      ) AS distance
      FROM gardens
      WHERE
        latitude BETWEEN ${minLat} AND ${maxLat}
        AND longitude BETWEEN ${minLng} AND ${maxLng}
        AND (
        6371 * acos(
          cos(radians(${latitude})) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(${longitude})) +
          sin(radians(${latitude})) * sin(radians(latitude))
        )
      ) < ${radiusKm}
      ORDER BY distance
      LIMIT ${limit}
    `) as any[]

    return gardens.map((row) => {
      return Garden.fromPersistence({
        id: row.id,
        name: row.name,
        latitude: row.latitude,
        longitude: row.longitude,
        description: row.description,
        size: row.size,
        climate: row.climate,
        userId: row.user_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })
    })
  }

  async findByUserAndName(userId: string, name: string): Promise<Garden | null> {
    const garden = await prisma.garden.findFirst({
      where: { userId, name },
    })
    if (!garden) return null
    return Garden.fromPersistence(garden)
  }

  async findAll(options?: {
    page?: number
    limit?: number
    userId?: string
    search?: string
  }): Promise<{ gardens: Garden[]; total: number }> {
    const page = options?.page ?? 1
    const limit = options?.limit ?? 10
    const skip = (page - 1) * limit

    const where: any = {}

    if (options?.userId) {
      where.userId = options.userId
    }

    if (options?.search) {
      where.name = { contains: options.search, mode: 'insensitive' }
    }

    const [gardens, total] = await Promise.all([
      prisma.garden.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.garden.count({ where }),
    ])

    return {
      gardens: gardens.map(Garden.fromPersistence),
      total,
    }
  }
}
