import { config } from 'dotenv'

// Load environment variables from .env
config()

// Global mocks or setup can go here
// import { vi } from 'vitest'
import { afterAll, beforeAll } from 'vitest'

// Example: Mock console.log to keep test output clean (optional)
// vi.spyOn(console, 'log').mockImplementation(() => {})

beforeAll(() => {
  // Global Setup
})

afterAll(() => {
  // Global Teardown
})
