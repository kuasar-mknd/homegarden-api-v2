import { Species } from '../../domain/entities/species.entity.js'
import type {
  CreateSpeciesData,
  SpeciesRepository,
} from '../../domain/repositories/species.repository.js'
import { prisma } from '../database/prisma.client.js'

export class PrismaSpeciesRepository implements SpeciesRepository {
  async create(data: CreateSpeciesData): Promise<Species> {
    const species = await prisma.species.create({
      data,
    })
    return Species.fromPersistence(species)
  }

  async findById(id: string): Promise<Species | null> {
    const species = await prisma.species.findUnique({
      where: { id },
    })
    if (!species) return null
    return Species.fromPersistence(species)
  }

  async findByScientificName(name: string): Promise<Species | null> {
    const species = await prisma.species.findUnique({
      where: { scientificName: name },
    })
    if (!species) return null
    return Species.fromPersistence(species)
  }

  async findByPlantNetId(plantNetId: string): Promise<Species | null> {
    const species = await prisma.species.findFirst({
      where: { plantNetId },
    })
    if (!species) return null
    return Species.fromPersistence(species)
  }

  async search(
    query: string,
    options?: {
      page?: number
      limit?: number
    },
  ): Promise<{ species: Species[]; total: number }> {
    const page = options?.page ?? 1
    const limit = options?.limit ?? 10
    const skip = (page - 1) * limit

    const where = {
      OR: [
        { commonName: { contains: query, mode: 'insensitive' as const } },
        { scientificName: { contains: query, mode: 'insensitive' as const } },
        { family: { contains: query, mode: 'insensitive' as const } },
      ],
    }

    const [species, total] = await Promise.all([
      prisma.species.findMany({
        where,
        skip,
        take: limit,
        orderBy: { commonName: 'asc' },
      }),
      prisma.species.count({ where }),
    ])

    return {
      species: species.map(Species.fromPersistence),
      total,
    }
  }

  async findByFamily(family: string): Promise<Species[]> {
    const species = await prisma.species.findMany({
      where: { family: { equals: family, mode: 'insensitive' } },
      orderBy: { commonName: 'asc' },
    })
    return species.map(Species.fromPersistence)
  }
}
