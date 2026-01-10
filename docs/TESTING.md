# Testing Documentation

The HomeGarden API has **98.21% test coverage** with **285 passing tests** across unit, integration, and end-to-end test suites.

## 📊 Coverage Report

| Metric | Coverage |
|--------|----------|
| **Lines** | 98.21% |
| **Statements** | 97.40% |
| **Functions** | 97.08% |
| **Branches** | 88.71% |
| **Total Tests** | 285 |

## 🧪 Test Types

### 1. Unit Tests (Domain & Application)

**Purpose:** Test individual components in isolation

**Coverage:** 100% on Domain entities and Value Objects

**Examples:**

- `tests/domain/user.entity.test.ts` - User entity validation
- `tests/domain/value-objects/email.vo.test.ts` - Email validation logic
- `tests/use-cases/diagnose-plant.use-case.test.ts` - Diagnosis business logic

**Run:**

```bash
pnpm test tests/domain
pnpm test tests/use-cases
```

### 2. Integration Tests

**Purpose:** Test multiple components working together

**Includes:**

- Use Cases + Repositories + Database
- Controllers + Middleware + Routes
- External service adapters

**Examples:**

- `tests/integration/user-profile.test.ts` - Full user profile flow
- `tests/integration/dr-plant.test.ts` - Diagnosis with mocked Gemini
- `tests/adapters/gemini-plant.adapter.test.ts` - AI adapter with mocked API

**Run:**

```bash
pnpm test tests/integration
pnpm test tests/adapters
pnpm test tests/controllers
```

### 3. End-to-End (E2E) Tests

**Purpose:** Test complete HTTP flows with real server

**What's tested:**

- Full HTTP request/response cycle
- Authentication middleware
- WebSocket connections
- Real database operations

**Test files:**

- `tests/e2e/health.e2e.test.ts` (5 tests) - Landing page, OpenAPI docs
- `tests/e2e/auth.e2e.test.ts` (7 tests) - Auth flow, user sync
- `tests/e2e/garden.e2e.test.ts` (7 tests) - Garden CRUD, weather

**Run:**

```bash
pnpm run test:e2e
```

---

## 🚀 Running Tests

### All Tests

```bash
pnpm test                    # Run all tests in watch mode
pnpm test -- --run           # Run once without watch
```

### With Coverage

```bash
pnpm run test:coverage       # Generate full coverage report
```

Output:

- Terminal coverage summary
- HTML report in `coverage/index.html`
- JSON report in `coverage/coverage-final.json`

### E2E Tests Only

```bash
pnpm run test:e2e
```

### Specific Test File

```bash
pnpm test tests/domain/user.entity.test.ts
pnpm test tests/e2e/auth.e2e.test.ts
```

### Filter by Test Name

```bash
pnpm test -- -t "should create user"
pnpm test -- --grep "authentication"
```

---

## 🏗️ Test Structure

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest'
import { User } from '../../domain/entities/user.entity.js'

describe('User Entity', () => {
  it('should create a valid user', () => {
    const user = new User({
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe'
    })
    
    expect(user.email).toBe('test@example.com')
    expect(user.fullName()).toBe('John Doe')
  })
  
  it('should throw error for invalid email', () => {
    expect(() => {
      new User({ email: 'invalid-email', firstName: '', lastName: '' })
    }).toThrow('Invalid email format')
  })
})
```

### Integration Test Example

```typescript
import { beforeAll, afterAll, describe, it, expect } from 'vitest'
import { prisma } from '../../infrastructure/database/prisma.client.js'
import { resetDb, disconnectDb } from '../helpers/reset-db.js'
import { GetUserPlantsUseCase } from '../../application/use-cases/get-user-plants.use-case.js'

describe('GetUserPlantsUseCase Integration', () => {
  beforeAll(async () => {
    await resetDb() // Clean database
  })
  
  afterAll(async () => {
    await disconnectDb()
  })
  
  it('should return user plants from database', async () => {
    // Create test data
    const user = await prisma.user.create({
      data: { email: 'test@example.com', firstName: 'Test', lastName: 'User' }
    })
    
    const useCase = new GetUserPlantsUseCase(plantRepository)
    const result = await useCase.execute(user.id)
    
    expect(result.success).toBe(true)
    expect(result.data.plants).toBeInstanceOf(Array)
  })
})
```

### E2E Test Example

```typescript
import { beforeAll, afterAll, describe, it, expect } from 'vitest'
import request from 'supertest'
import { serve } from '@hono/node-server'
import app from '../../index.js'

describe('E2E: Authentication Flow', () => {
  let server: any
  let baseUrl: string
  
  beforeAll(async () => {
    server = serve({ fetch: app.fetch, port: 0 })
    const address = server.address()
    const port = typeof address === 'object' ? address.port : 3000
    baseUrl = `http://localhost:${port}`
  })
  
  afterAll(() => {
    server.close()
  })
  
  it('should allow access to public routes', async () => {
    const res = await request(baseUrl).get('/')
    
    expect(res.status).toBe(200)
    expect(res.text).toContain('HomeGarden API')
  })
  
  it('should block protected routes without token', async () => {
    const res = await request(baseUrl).get('/api/v2/gardens/plants')
    
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('UNAUTHORIZED')
  })
})
```

---

## 🎭 Mocking

### Mocking External Services

We mock external services to avoid real API calls during tests:

```typescript
import { vi } from 'vitest'

// Mock Gemini AI
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify({ success: true, suggestions: [...] })
        }
      })
    })
  }))
}))

// Mock Supabase Auth
const mockGetUser = vi.fn()
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser }
  })
}))

// Control mock behavior
mockGetUser.mockResolvedValueOnce({
  data: { user: { email: 'test@example.com' } },
  error: null
})
```

### Mocking Repositories

```typescript
const mockPlantRepository = {
  findById: vi.fn(),
  save: vi.fn(),
  findByUserId: vi.fn()
}

const useCase = new WaterPlantUseCase(mockPlantRepository)

// Control mock behavior
mockPlantRepository.findById.mockResolvedValue(mockPlant)
```

---

## 📁 Test Helpers

### Database Helpers

```typescript
// tests/helpers/reset-db.ts
export async function resetDb() {
  await prisma.$transaction([
    prisma.plant.deleteMany(),
    prisma.garden.deleteMany(),
    prisma.user.deleteMany()
  ])
}

export async function disconnectDb() {
  await prisma.$disconnect()
}
```

### Test Fixtures

```typescript
// tests/helpers/fixtures.ts
export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User'
}

export const mockPlant = {
  id: 'plant-123',
  nickname: 'My Plant',
  userId: 'user-123'
}
```

---

## ✅ Test Best Practices

1. **Test Names Should Be Descriptive**

   ```typescript
   ✅ it('should return 401 when token is invalid')
   ❌ it('test auth')
   ```

2. **One Assertion per Test (when possible)**

   ```typescript
   ✅ it('should return correct status code', () => {
     expect(res.status).toBe(200)
   })
   
   ✅ it('should return correct body structure', () => {
     expect(res.body).toHaveProperty('success', true)
   })
   ```

3. **Use Arrange-Act-Assert Pattern**

   ```typescript
   it('should water plant successfully', async () => {
     // Arrange
     const plant = createTestPlant()
     
     // Act
     const result = await useCase.execute(plant.id)
     
     // Assert
     expect(result.success).toBe(true)
   })
   ```

4. **Clean Up After Tests**

   ```typescript
   afterAll(async () => {
     await prisma.$disconnect()
     server.close()
   })
   ```

5. **Mock External Dependencies**
   - Never call real APIs in tests
   - Use mocks for predictable behavior
   - Test edge cases with controlled mocks

---

## 🎯 Coverage Goals

| Layer | Target | Current |
|-------|--------|---------|
| **Domain** | 100% | ✅ 100% |
| **Application** | 95%+ | ✅ 97% |
| **Infrastructure** | 90%+ | ✅ 96% |
| **Overall** | 95%+ | ✅ 98.21% |

**Files Excluded from Coverage:**

- `index.ts` - Server startup
- `env.ts` - Configuration
- `prisma.client.ts` - Database connection
- `ws-server.ts` - WebSocket initialization
- Test files and configuration

---

## 🔧 Test Configuration

### Vitest Config (`vitest.config.ts`)

```typescript
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    fileParallelism: false, // Sequential for DB tests
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'tests/**',
        '**/*.config.ts',
        'index.ts',  // Server startup
        'infrastructure/config/env.ts'
      ]
    }
  }
})
```

### Test Setup (`tests/setup.ts`)

```typescript
import { beforeAll } from 'vitest'
import dotenv from 'dotenv'

beforeAll(() => {
  dotenv.config()
})
```

---

## 📈 Continuous Integration

Tests run automatically on every push via GitHub Actions:

```yaml
# .github/workflows/ci.yml
- name: Run tests
  run: pnpm test -- --run
  
- name: Run coverage
  run: pnpm run test:coverage
```

---

## 🐛 Debugging Tests

**Run single test in watch mode:**

```bash
pnpm test tests/domain/user.entity.test.ts
```

**Debug with VSCode:**
Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest",
  "runtimeExecutable": "pnpm",
  "runtimeArgs": ["run", "test"],
  "console": "integratedTerminal"
}
```

**View detailed errors:**

```bash
pnpm test -- --reporter=verbose
```

---

**Our testing philosophy:** Every feature should be tested at multiple layers (unit, integration, E2E) to ensure robustness and prevent regressions.
