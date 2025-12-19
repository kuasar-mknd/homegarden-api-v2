import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { prisma } from '../../infrastructure/database/prisma.client.js'
import { PlantPrismaRepository } from '../../infrastructure/database/repositories/plant.prisma-repository.js'
import { resetDb, disconnectDb } from '../helpers/reset-db.js'
import crypto from 'node:crypto'

describe('PlantPrismaRepository', () => {
  const repository = new PlantPrismaRepository()

  afterAll(async () => {
    await disconnectDb()
  })

  const setupBaseData = async (seed: string) => {
    const user = await prisma.user.create({
      data: {
        email: `plant-repo-${seed}-${crypto.randomUUID()}@example.com`,
        firstName: 'Repo',
        lastName: 'Tester',
        password: 'password',
      },
    })
    const checkUser = await prisma.user.findUnique({ where: { id: user.id } })
    if (!checkUser) console.error(`CRITICAL: User ${user.id} not found after creation!`)

    const garden = await prisma.garden.create({
      data: {
        name: `Garden ${seed} ${crypto.randomUUID()}`,
        userId: user.id,
        latitude: 0,
        longitude: 0,
      },
    })
    const check = await prisma.garden.findUnique({ where: { id: garden.id } })
    if (!check) console.error(`CRITICAL: Garden ${garden.id} not found after creation!`)
    return { user, garden }
  }

  it('should create and find a plant', async () => {
    const { garden } = await setupBaseData(crypto.randomUUID())
    const created = await repository.create({
      gardenId: garden.id,
      nickname: 'My Plant',
      commonName: 'Tomato',
    })
    expect(created.id).toBeDefined()
    expect(created.nickname).toBe('My Plant')

    const found = await repository.findById(created.id)
    expect(found).not.toBeNull()
    expect(found?.nickname).toBe('My Plant')
  })

  it('should find plants by garden ID', async () => {
    const { garden } = await setupBaseData(crypto.randomUUID())
    await repository.create({ gardenId: garden.id, nickname: 'P1' })
    await repository.create({ gardenId: garden.id, nickname: 'P2' })

    const plants = await repository.findByGardenId(garden.id)
    expect(plants).toHaveLength(2)
  })

  it('should find plants by user ID', async () => {
    const { user, garden } = await setupBaseData(crypto.randomUUID())
    await repository.create({ gardenId: garden.id, nickname: 'P1' })

    const plants = await repository.findByUserId(user.id)
    expect(plants.length).toBeGreaterThanOrEqual(1)
    expect(plants.some(p => p.gardenId === garden.id)).toBe(true)
  })

  it('should update a plant', async () => {
    const { garden } = await setupBaseData(crypto.randomUUID())
    const created = await repository.create({ gardenId: garden.id, nickname: 'Old Name' })

    const updated = await repository.update(created.id, { nickname: 'New Name' })
    expect(updated.nickname).toBe('New Name')
  })

  it('should delete a plant', async () => {
    const { garden } = await setupBaseData(crypto.randomUUID())
    const created = await repository.create({ gardenId: garden.id, nickname: 'To Delete' })

    await repository.delete(created.id)
    const found = await repository.findById(created.id)
    expect(found).toBeNull()
  })

  it('should delete plants by garden ID', async () => {
    const { garden } = await setupBaseData(crypto.randomUUID())
    await repository.create({ gardenId: garden.id, nickname: 'P1' })
    await repository.create({ gardenId: garden.id, nickname: 'P2' })

    await repository.deleteByGardenId(garden.id)
    const plants = await repository.findByGardenId(garden.id)
    expect(plants).toHaveLength(0)
  })

  it('should find all with pagination and filters', async () => {
    const { garden } = await setupBaseData(crypto.randomUUID())
    const species = await prisma.species.create({
        data: {
            commonName: 'Test Species',
            scientificName: `Testus scientificus ${crypto.randomUUID()}`,
            family: 'Testaceae',
        }
    })

    await repository.create({ gardenId: garden.id, nickname: 'P1', speciesId: species.id })
    await repository.create({ gardenId: garden.id, nickname: 'P2', speciesId: species.id })
    await repository.create({ gardenId: garden.id, nickname: 'P3' })

    const result = await repository.findAll({ gardenId: garden.id, limit: 2 })
    expect(result.plants).toHaveLength(2)
    expect(result.total).toBe(3)

    const resultWithSpecies = await repository.findAll({ speciesId: species.id })
    expect(resultWithSpecies.plants).toHaveLength(2)
  })

  it('should count by garden ID', async () => {
    const { garden } = await setupBaseData(crypto.randomUUID())
    await repository.create({ gardenId: garden.id, nickname: 'P1' })
    await repository.create({ gardenId: garden.id, nickname: 'P2' })

    const count = await repository.countByGardenId(garden.id)
    expect(count).toBe(2)
  })

  it('should aggregate by common name', async () => {
    const { garden } = await setupBaseData(crypto.randomUUID())
    await repository.create({ gardenId: garden.id, commonName: 'Rose' })
    await repository.create({ gardenId: garden.id, commonName: 'Rose' })
    await repository.create({ gardenId: garden.id, commonName: 'Tulip' })
    await repository.create({ gardenId: garden.id, commonName: null })

    const stats = await repository.aggregateByCommonName(garden.id)
    expect(stats.find(s => s.name === 'Rose')?.count).toBe(2)
    expect(stats.find(s => s.name === 'Tulip')?.count).toBe(1)
    expect(stats.find(s => s.name === 'Unknown')?.count).toBe(1)
  })
})
