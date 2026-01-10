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

  get id(): string {
    return this.props.id
  }
  get imageUrl(): string {
    return this.props.imageUrl
  }
  get description(): string | null | undefined {
    return this.props.description
  }
  get status(): DiagnosisStatus {
    return this.props.status
  }
  get confidence(): number | null | undefined {
    return this.props.confidence
  }
  get conditionName(): string | null | undefined {
    return this.props.conditionName
  }
  get conditionType(): ConditionType | null | undefined {
    return this.props.conditionType
  }
  get severity(): Severity | null | undefined {
    return this.props.severity
  }
  get affectedParts(): string[] {
    return this.props.affectedParts
  }
  get causes(): string[] {
    return this.props.causes
  }
  get symptoms(): string[] {
    return this.props.symptoms
  }
  get treatmentSteps(): string[] {
    return this.props.treatmentSteps
  }
  get preventionTips(): string[] {
    return this.props.preventionTips
  }
  get organicTreatment(): string | null | undefined {
    return this.props.organicTreatment
  }
  get chemicalTreatment(): string | null | undefined {
    return this.props.chemicalTreatment
  }
  get recoveryTimeWeeks(): number | null | undefined {
    return this.props.recoveryTimeWeeks
  }
  get criticalActions(): string[] {
    return this.props.criticalActions
  }
  get aiModel(): string | null | undefined {
    return this.props.aiModel
  }
  get rawResponse(): Record<string, unknown> | null | undefined {
    return this.props.rawResponse
  }
  get processingMs(): number | null | undefined {
    return this.props.processingMs
  }
  get plantId(): string | null | undefined {
    return this.props.plantId
  }
  get userId(): string {
    return this.props.userId
  }
  get createdAt(): Date {
    return this.props.createdAt
  }
  get updatedAt(): Date {
    return this.props.updatedAt
  }

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
