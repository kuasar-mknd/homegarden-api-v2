
import { prisma } from '../database/prisma.client.js'
import { Garden } from '../../domain/entities/garden.entity.js'
import { Plant } from '../../domain/entities/plant.entity.js'
import type {
  GardenRepository,
  CreateGardenData,
  UpdateGardenData,
  NearbyQuery
} from '../../domain/repositories/garden.repository.js'

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

    // Map the included plants to the domain format expected by GardenProps
    // Note: GardenProps might expect Plant[] entities, or just data.
    // Looking at GardenProps: plants?: Plant[]
    // Since Garden.fromPersistence takes GardenProps which matches Prisma output mostly,
    // but plants in Prisma is object, and Plant in domain is class.
    // However, looking at Garden.fromPersistence and GardenProps,
    // it seems `plants` is optional.
    // If we pass the prisma object directly, it might not be fully compatible if the Plant entity
    // has private constructor and static methods.
    // Ideally we should map the plants. But Garden.fromPersistence expects GardenProps.
    // If GardenProps.plants expects Plant instances, we need to map them.
    // Let's assume for now that we need to construct the Plant objects if we want to include them.

    // Actually, looking at GardenProps: plants?: Plant[]
    // And Plant is a class.
    // So we can't just pass the raw object from prisma.

    // But `Garden.fromPersistence` takes `GardenProps`.
    // Let's check `GardenProps` again.
    // export interface GardenProps { ... plants?: Plant[] }
    // Yes, it expects Plant instances.

    // So we need to map the plants.
    // But `Garden` entity constructor is private.
    // We should probably rely on `Garden.fromPersistence` but we need to feed it valid `GardenProps`.

    // The issue is `fromPersistence` usually takes raw data matching the DB structure (Persistence DTO),
    // but here the type definition says it takes `GardenProps` which uses Domain Entities (`Plant`).
    // This is a bit of a mixed concern in the provided entity definitions.
    // Assuming we need to manually map the plants if present.

    // Let's import Plant to map it.

    // Wait, I can't modify the entity file.
    // I have to work with what I have.

    // If I look at `Garden.fromPersistence(data: GardenProps)`, it returns `new Garden(data)`.
    // So `data` must adhere to `GardenProps`.

    // So I must map the plants to Plant entities.

    // I will dynamically import Plant to avoid circular dependency if any (though usually fine in TS if just type, but here I need value).
    // Actually I can just import it.

    // Let's assume I can import Plant.

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

    // Use raw query for PostGIS distance if available, or haversine formula if not.
    // The schema says `extensions = [postgis]`, so we might have geometry types.
    // But the Garden model uses float for lat/long, not geometry type.
    // So we probably need to use Haversine formula in raw SQL or filter in memory (not efficient) or raw query.
    // Given Prisma doesn't support complex math in `findMany` easily without extensions or raw query.
    // I'll use `queryRaw` for efficiency.

    // Haversine formula
    // 6371 * 2 * ASIN(SQRT(POWER(SIN((lat - ?hostLat) * pi()/180 / 2), 2) + COS(lat * pi()/180) * COS(?hostLat * pi()/180) * POWER(SIN((lng - ?hostLng) * pi()/180 / 2), 2)))

    const gardens = await prisma.$queryRaw`
      SELECT *, (
        6371 * acos(
          cos(radians(${latitude})) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(${longitude})) +
          sin(radians(${latitude})) * sin(radians(latitude))
        )
      ) AS distance
      FROM gardens
      WHERE (
        6371 * acos(
          cos(radians(${latitude})) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(${longitude})) +
          sin(radians(${latitude})) * sin(radians(latitude))
        )
      ) < ${radiusKm}
      ORDER BY distance
      LIMIT ${limit}
    ` as any[]

    // We need to map the raw results back to Garden entities.
    // The raw result fields are snake_case (from DB) but Prisma usually returns camelCase if using findMany.
    // But queryRaw returns what the DB gives.
    // The schema maps fields: e.g. @map("created_at").
    // So we get `created_at` etc.
    // Garden.fromPersistence expects camelCase props matching the entity props.
    // We need to map keys from snake_case to camelCase.

    return gardens.map(row => {
      // Manual mapping based on schema
      return Garden.fromPersistence({
        id: row.id,
        name: row.name,
        latitude: row.latitude,
        longitude: row.longitude,
        description: row.description,
        size: row.size,
        climate: row.climate,
        userId: row.user_id, // mapped from user_id
        createdAt: row.created_at,
        updatedAt: row.updated_at
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
