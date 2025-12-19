
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { resetDb, disconnectDb } from './helpers/reset-db.js'

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
