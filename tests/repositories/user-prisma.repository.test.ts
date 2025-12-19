import crypto from 'node:crypto'
import { afterAll, describe, expect, it } from 'vitest'
import { UserPrismaRepository } from '../../infrastructure/database/repositories/user.prisma-repository.js'
import { disconnectDb } from '../helpers/reset-db.js'

describe('UserPrismaRepository', () => {
  const repository = new UserPrismaRepository()

  afterAll(async () => {
    await disconnectDb()
  })

  const setupUser = async (seed: string) => {
    return await repository.create({
      email: `user-repo-${seed}-${crypto.randomUUID()}@example.com`,
      firstName: 'User',
      lastName: 'Tester',
      password: 'password123',
    })
  }

  it('should create and find a user by ID', async () => {
    const user = await setupUser('create')
    expect(user.id).toBeDefined()

    const found = await repository.findById(user.id)
    expect(found).not.toBeNull()
    expect(found?.email).toBe(user.email)
  })

  it('should find a user by email', async () => {
    const user = await setupUser('findByEmail')
    const found = await repository.findByEmail(user.email)
    expect(found).not.toBeNull()
    expect(found?.id).toBe(user.id)
  })

  it('should find a user with password by ID', async () => {
    const user = await setupUser('findByIdWithPassword')
    const found = await repository.findByIdWithPassword(user.id)
    expect(found).not.toBeNull()
    expect(found?.password).toBe('password123')
  })

  it('should find a user with password by email', async () => {
    const user = await setupUser(crypto.randomUUID())
    const found = await repository.findByEmailWithPassword(user.email)
    expect(found).not.toBeNull()
    expect(found?.password).toBe('password123')
  })

  it('should create and find a user', async () => {
    const seed = crypto.randomUUID()
    const userData: CreateUserData = {
      email: `user-${seed}@test.com`,
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    }

    const created = await repository.create(userData)
    expect(created.id).toBeDefined()
    expect(created.email).toBe(userData.email)

    const found = await repository.findById(created.id)
    expect(found).not.toBeNull()
    expect(found?.email).toBe(userData.email)
  })

  it('should find by email', async () => {
    const seed = crypto.randomUUID()
    const email = `find-${seed}@test.com`
    await repository.create({ email, password: 'pwd', firstName: 'F', lastName: 'L' })

    const found = await repository.findByEmail(email)
    expect(found).not.toBeNull()
    expect(found?.email).toBe(email)
  })

  it('should update a user', async () => {
    const seed = crypto.randomUUID()
    const created = await repository.create({
      email: `upd-${seed}@test.com`,
      password: 'pwd',
      firstName: 'Old',
      lastName: 'Name',
    })
    const updated = await repository.update(created.id, { firstName: 'New' })
    expect(updated.firstName).toBe('New')

    const found = await repository.findById(created.id)
    expect(found?.firstName).toBe('New')
  })

  it('should delete a user', async () => {
    const seed = crypto.randomUUID()
    const created = await repository.create({
      email: `del-${seed}@test.com`,
      password: 'pwd',
      firstName: 'F',
      lastName: 'L',
    })
    await repository.delete(created.id)
    const found = await repository.findById(created.id)
    expect(found).toBeNull()
  })

  it('should check if user exists by email', async () => {
    const user = await setupUser(crypto.randomUUID())
    const exists = await repository.existsByEmail(user.email)
    expect(exists).toBe(true)

    const notExists = await repository.existsByEmail('nonexistent@example.com')
    expect(notExists).toBe(false)
  })

  it('should find all with pagination', async () => {
    const seed = crypto.randomUUID()
    for (let i = 0; i < 5; i++) {
      await repository.create({
        email: `list-${seed}-${i}@test.com`,
        password: 'pwd',
        firstName: 'F',
        lastName: 'L',
      })
    }

    const result = await repository.findAll({ search: seed, limit: 3 })
    expect(result.users).toHaveLength(3)
    expect(result.total).toBe(5)
  })

  it('should return null for non-existent users', async () => {
    expect(await repository.findById('none')).toBeNull()
    expect(await repository.findByEmail('none@none.com')).toBeNull()
    expect(await repository.findByIdWithPassword('none')).toBeNull()
    expect(await repository.findByEmailWithPassword('none@none.com')).toBeNull()
  })
})
