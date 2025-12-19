import { describe, expect, it } from 'vitest'
import { Diagnosis, type DiagnosisProps } from '../../domain/entities/diagnosis.entity.js'

describe('Diagnosis entity', () => {
  const mockProps: DiagnosisProps = {
    id: 'diag-123',
    imageUrl: 'http://image.test',
    status: 'COMPLETED',
    conditionType: 'DISEASE',
    severity: 'MODERATE',
    affectedParts: ['leaves'],
    causes: ['fungus'],
    symptoms: ['spots'],
    treatmentSteps: ['Spray'],
    preventionTips: ['Water less'],
    criticalActions: [],
    userId: 'user-123',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  }

  describe('factories', () => {
    it('should create a diagnosis instance using .create()', () => {
      const diag = Diagnosis.create(mockProps)
      expect(diag).toBeInstanceOf(Diagnosis)
      expect(diag.id).toBe('diag-123')
    })

    it('should create a diagnosis instance using .fromPersistence()', () => {
      const diag = Diagnosis.fromPersistence(mockProps)
      expect(diag).toBeInstanceOf(Diagnosis)
      expect(diag.id).toBe('diag-123')
    })
  })

  describe('getters', () => {
    it('should return all basic properties', () => {
      const diag = Diagnosis.create(mockProps)
      expect(diag.status).toBe('COMPLETED')
      expect(diag.userId).toBe('user-123')
      expect(diag.treatmentSteps).toEqual(['Spray'])
    })

    it('should return conditionName and severity if present', () => {
      const diag = Diagnosis.create({ ...mockProps, conditionName: 'Leaf Spot', severity: 'HIGH' })
      expect(diag.conditionName).toBe('Leaf Spot')
      expect(diag.severity).toBe('HIGH')
    })
  })

  describe('business logic', () => {
    it('isComplete: true for COMPLETED status', () => {
      const diag = Diagnosis.create(mockProps)
      expect(diag.isComplete).toBe(true)

      const pending = Diagnosis.create({ ...mockProps, status: 'PENDING' })
      expect(pending.isComplete).toBe(false)
    })

    it('isHealthy: true for HEALTHY conditionType', () => {
      const healthy = Diagnosis.create({ ...mockProps, conditionType: 'HEALTHY' })
      expect(healthy.isHealthy).toBe(true)

      const sick = Diagnosis.create({ ...mockProps, conditionType: 'DISEASE' })
      expect(sick.isHealthy).toBe(false)
    })

    it('requiresUrgentAction: true if severity is CRITICAL', () => {
      const critical = Diagnosis.create({ ...mockProps, severity: 'CRITICAL' })
      expect(critical.requiresUrgentAction).toBe(true)
    })

    it('requiresUrgentAction: true if criticalActions exist', () => {
      const action = Diagnosis.create({
        ...mockProps,
        severity: 'LOW',
        criticalActions: ['Burn it'],
      })
      expect(action.requiresUrgentAction).toBe(true)
    })

    it('requiresUrgentAction: false otherwise', () => {
      const normal = Diagnosis.create(mockProps)
      expect(normal.requiresUrgentAction).toBe(false)
    })
  })

  describe('serialization', () => {
    it('toJSON should return props object', () => {
      const diag = Diagnosis.create(mockProps)
      expect(diag.toJSON()).toEqual(mockProps)
    })
  })
})
