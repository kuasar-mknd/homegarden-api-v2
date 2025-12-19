import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { disconnectDb, resetDb } from './helpers/reset-db.js'

describe('Smoke Test', () => {
  beforeAll(async () => {
    await resetDb()
  })

  afterAll(async () => {
    await disconnectDb()
  })

  it('should be true', () => {
    expect(true).toBe(true)
  })
})
