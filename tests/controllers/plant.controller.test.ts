import { describe, expect, it, vi } from 'vitest'
import { PlantController } from '../../infrastructure/http/controllers/plant.controller.js'

describe('PlantController', () => {
  const controller = new PlantController()
  const mockContext = {
    json: vi.fn().mockImplementation((data, status) => ({ data, status })),
    req: {
      valid: vi.fn().mockResolvedValue({}), // Mock successful validation
    },
  }

  it('createPlant should return 501', async () => {
    const result = (await controller.createPlant(mockContext as any)) as any
    expect(mockContext.req.valid).toHaveBeenCalledWith('json')
    expect(result.status).toBe(501)
  })

  it('listPlants should return 501', async () => {
    const result = (await controller.listPlants(mockContext as any)) as any
    // listPlants has no inputs to validate in the controller logic itself (usually handled by auth middleware or pagination defaults in query if any)
    expect(result.status).toBe(501)
  })

  it('getPlant should return 501', async () => {
    const result = (await controller.getPlant(mockContext as any)) as any
    expect(mockContext.req.valid).toHaveBeenCalledWith('param')
    expect(result.status).toBe(501)
  })

  it('updatePlant should return 501', async () => {
    const result = (await controller.updatePlant(mockContext as any)) as any
    expect(mockContext.req.valid).toHaveBeenCalledWith('param')
    expect(mockContext.req.valid).toHaveBeenCalledWith('json')
    expect(result.status).toBe(501)
  })

  it('deletePlant should return 501', async () => {
    const result = (await controller.deletePlant(mockContext as any)) as any
    expect(mockContext.req.valid).toHaveBeenCalledWith('param')
    expect(result.status).toBe(501)
  })
})
