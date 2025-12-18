/**
 * Diagnosis Repository Interface (Port)
 */

import type { Diagnosis, DiagnosisStatus, ConditionType, Severity } from '../entities/diagnosis.entity.js'

export interface CreateDiagnosisData {
  imageUrl: string
  description?: string | null
  plantId?: string | null
  userId: string
}

export interface UpdateDiagnosisData {
  status?: DiagnosisStatus
  confidence?: number | null
  conditionName?: string | null
  conditionType?: ConditionType | null
  severity?: Severity | null
  affectedParts?: string[]
  causes?: string[]
  symptoms?: string[]
  treatmentSteps?: string[]
  preventionTips?: string[]
  organicTreatment?: string | null
  chemicalTreatment?: string | null
  recoveryTimeWeeks?: number | null
  criticalActions?: string[]
  aiModel?: string | null
  rawResponse?: Record<string, unknown> | null
  processingMs?: number | null
}

export interface DiagnosisRepository {
  create(data: CreateDiagnosisData): Promise<Diagnosis>
  findById(id: string): Promise<Diagnosis | null>
  findByUserId(userId: string, options?: {
    page?: number
    limit?: number
    status?: DiagnosisStatus
  }): Promise<{ diagnoses: Diagnosis[]; total: number }>
  findByPlantId(plantId: string): Promise<Diagnosis[]>
  update(id: string, data: UpdateDiagnosisData): Promise<Diagnosis>
  delete(id: string): Promise<void>
  
  findPending(): Promise<Diagnosis[]>
}
