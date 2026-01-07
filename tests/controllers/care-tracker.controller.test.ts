import { describe, expect, it, vi } from 'vitest'
import { CareTrackerController } from '../../infrastructure/http/controllers/care-tracker.controller.js'

describe('CareTrackerController', () => {
  const controller = new CareTrackerController()
  const mockContext = {
    json: vi.fn().mockImplementation((data, status) => ({ data, status })),
    req: {
      valid: vi.fn().mockResolvedValue({}), // Mock successful validation
    },
  }

  it('createSchedule should return 501', async () => {
    const result = (await controller.createSchedule(mockContext as any)) as any
    expect(mockContext.req.valid).toHaveBeenCalledWith('json')
    expect(result.status).toBe(501)
  })

  it('getUpcomingTasks should return 501', async () => {
    const result = (await controller.getUpcomingTasks(mockContext as any)) as any
    expect(mockContext.req.valid).toHaveBeenCalledWith('query')
    expect(result.status).toBe(501)
  })

  it('markTaskComplete should return 501', async () => {
    const result = (await controller.markTaskComplete(mockContext as any)) as any
    expect(mockContext.req.valid).toHaveBeenCalledWith('param')
    expect(mockContext.req.valid).toHaveBeenCalledWith('json')
    expect(result.status).toBe(501)
  })

  it('generateSchedule should return 501', async () => {
    const result = (await controller.generateSchedule(mockContext as any)) as any
    expect(result.status).toBe(501)
  })
})
