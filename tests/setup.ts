import { config } from 'dotenv'
import { afterAll, beforeAll, vi } from 'vitest'

// Load environment variables from .env
config()

const mockDate = new Date()
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'USER',
  createdAt: mockDate,
  updatedAt: mockDate,
}

vi.mock('../infrastructure/database/prisma.client.js', () => ({
  prisma: {
    $connect: vi.fn().mockResolvedValue(undefined),
    $disconnect: vi.fn().mockResolvedValue(undefined),
    $queryRaw: vi.fn().mockResolvedValue([]),
    user: {
      findUnique: vi.fn().mockResolvedValue(mockUser),
      findFirst: vi.fn().mockResolvedValue(mockUser),
      findMany: vi.fn().mockResolvedValue([mockUser]),
      create: vi.fn().mockResolvedValue(mockUser),
      update: vi.fn().mockResolvedValue(mockUser),
      delete: vi.fn().mockResolvedValue(mockUser),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      count: vi.fn().mockResolvedValue(1),
    },
    garden: {
      findUnique: vi.fn().mockResolvedValue({
        id: 'garden-123',
        name: 'Test Garden',
        userId: 'user-123',
        createdAt: mockDate,
        updatedAt: mockDate,
      }),
      findFirst: vi.fn().mockResolvedValue({
        id: 'garden-123',
        name: 'Test Garden',
        userId: 'user-123',
        createdAt: mockDate,
        updatedAt: mockDate,
      }),
      findMany: vi.fn().mockResolvedValue([
        {
          id: 'garden-123',
          name: 'Test Garden',
          userId: 'user-123',
          createdAt: mockDate,
          updatedAt: mockDate,
        },
      ]),
      create: vi.fn().mockResolvedValue({
        id: 'garden-123',
        name: 'Test Garden',
        userId: 'user-123',
        createdAt: mockDate,
        updatedAt: mockDate,
      }),
      update: vi.fn().mockResolvedValue({
        id: 'garden-123',
        name: 'Test Garden',
        userId: 'user-123',
        createdAt: mockDate,
        updatedAt: mockDate,
      }),
      delete: vi.fn().mockResolvedValue({
        id: 'garden-123',
        name: 'Test Garden',
        userId: 'user-123',
        createdAt: mockDate,
        updatedAt: mockDate,
      }),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      count: vi.fn().mockResolvedValue(1),
    },
    plant: {
      findUnique: vi.fn().mockResolvedValue({
        id: 'plant-123',
        nickname: 'Test Plant',
        gardenId: 'garden-123',
        createdAt: mockDate,
        updatedAt: mockDate,
      }),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({
        id: 'plant-123',
        nickname: 'Test Plant',
        gardenId: 'garden-123',
        createdAt: mockDate,
        updatedAt: mockDate,
      }),
      update: vi.fn().mockResolvedValue({
        id: 'plant-123',
        nickname: 'Test Plant',
        gardenId: 'garden-123',
        createdAt: mockDate,
        updatedAt: mockDate,
      }),
      delete: vi.fn().mockResolvedValue({
        id: 'plant-123',
        nickname: 'Test Plant',
        gardenId: 'garden-123',
        createdAt: mockDate,
        updatedAt: mockDate,
      }),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      count: vi.fn().mockResolvedValue(0),
      groupBy: vi.fn().mockResolvedValue([]),
    },
    careCompletion: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
    careSchedule: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
    diagnosis: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
    refreshToken: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
    species: {
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

beforeAll(() => {
  // Global Setup
})

afterAll(() => {
  // Global Teardown
  vi.clearAllMocks()
})
