import { describe, expect, it } from 'vitest'
import { AppError } from '../../../shared/errors/app-error.js'

describe('AppError', () => {
  it('should create an instance with default values', () => {
    const error = new AppError('Test error')
    expect(error.message).toBe('Test error')
    expect(error.statusCode).toBe(500)
    expect(error.code).toBe('INTERNAL_ERROR')
    expect(error.isOperational).toBe(true)
  })

  it('should create an instance with custom values', () => {
    const error = new AppError('Not found', 404, 'NOT_FOUND', false)
    expect(error.message).toBe('Not found')
    expect(error.statusCode).toBe(404)
    expect(error.code).toBe('NOT_FOUND')
    expect(error.isOperational).toBe(false)
  })

  it('should serialize to JSON correctly', () => {
    const error = new AppError('Validation failed', 400, 'VALIDATION_ERROR')
    const json = error.toJSON()
    expect(json).toEqual({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Validation failed',
      statusCode: 400,
    })
  })
})
