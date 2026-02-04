import { createServer } from 'node:http'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { WebSocket, type WebSocketServer } from 'ws'
import { authService } from '../../../infrastructure/security/auth.service.js'
import { initializeWebSocketServer } from '../../../infrastructure/websocket/ws-server.js'

// Mock authService
vi.mock('../../../infrastructure/security/auth.service.js', () => ({
  authService: {
    validateTokenAndGetUser: vi.fn(),
  },
}))

describe('WebSocket Authentication', () => {
  let server: any
  let wss: WebSocketServer
  let port: number

  beforeEach(async () => {
    // Setup server on random port
    server = createServer()
    wss = initializeWebSocketServer(server)

    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        port = (server.address() as any).port
        resolve()
      })
    })
  })

  afterEach(() => {
    wss.close()
    server.close()
    vi.resetAllMocks()
  })

  it('should close connection if no token is provided', async () => {
    const ws = new WebSocket(`ws://localhost:${port}`)

    const closePromise = new Promise<number>((resolve) => {
      ws.on('close', (code) => resolve(code))
    })

    await expect(closePromise).resolves.toBe(4001)
  })

  it('should close connection if token is invalid', async () => {
    vi.mocked(authService.validateTokenAndGetUser).mockResolvedValue(null)

    const ws = new WebSocket(`ws://localhost:${port}?token=invalid`)

    const closePromise = new Promise<number>((resolve) => {
      ws.on('close', (code) => resolve(code))
    })

    await expect(closePromise).resolves.toBe(4001)
  })

  it('should connect successfully if token is valid', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      role: 'USER',
      password: 'hashed-password',
      firstName: 'Test',
      lastName: 'User',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    vi.mocked(authService.validateTokenAndGetUser).mockResolvedValue(mockUser as any)

    const ws = new WebSocket(`ws://localhost:${port}?token=valid`)

    const openPromise = new Promise<void>((resolve) => {
      ws.on('open', () => resolve())
    })

    await expect(openPromise).resolves.toBeUndefined()
    ws.close()
  })
})
