/**
 * Diagnosis Domain Entity
 * 
 * Represents a plant disease diagnosis from the DrPlant AI feature.
 */

export type DiagnosisStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
export type ConditionType = 'DISEASE' | 'PEST' | 'DEFICIENCY' | 'ENVIRONMENTAL' | 'HEALTHY'
export type Severity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'

export interface DiagnosisProps {
  id: string
  imageUrl: string
  description?: string | null
  status: DiagnosisStatus
  confidence?: number | null
  conditionName?: string | null
  conditionType?: ConditionType | null
  severity?: Severity | null
  affectedParts: string[]
  causes: string[]
  symptoms: string[]
  treatmentSteps: string[]
  preventionTips: string[]
  organicTreatment?: string | null
  chemicalTreatment?: string | null
  recoveryTimeWeeks?: number | null
  criticalActions: string[]
  aiModel?: string | null
  rawResponse?: Record<string, unknown> | null
  processingMs?: number | null
  plantId?: string | null
  userId: string
  createdAt: Date
  updatedAt: Date
}

export class Diagnosis {
  private constructor(private readonly props: DiagnosisProps) {}

  static create(props: DiagnosisProps): Diagnosis {
    return new Diagnosis(props)
  }

  static fromPersistence(data: DiagnosisProps): Diagnosis {
    return new Diagnosis(data)
  }

  get id(): string { return this.props.id }
  get status(): DiagnosisStatus { return this.props.status }
  get conditionName(): string | null | undefined { return this.props.conditionName }
  get severity(): Severity | null | undefined { return this.props.severity }
  get treatmentSteps(): string[] { return this.props.treatmentSteps }
  get userId(): string { return this.props.userId }

  get isComplete(): boolean {
    return this.props.status === 'COMPLETED'
  }

  get isHealthy(): boolean {
    return this.props.conditionType === 'HEALTHY'
  }

  get requiresUrgentAction(): boolean {
    return this.props.severity === 'CRITICAL' || this.props.criticalActions.length > 0
  }

  toJSON(): DiagnosisProps {
    return { ...this.props }
  }
}
