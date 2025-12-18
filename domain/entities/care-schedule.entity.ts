/**
 * CareSchedule Domain Entity
 * 
 * Represents a care task schedule for the CareTracker feature.
 */

export type CareTaskType = 
  | 'WATER' 
  | 'FERTILIZE' 
  | 'PRUNE' 
  | 'REPOT' 
  | 'HARVEST' 
  | 'PEST_CHECK' 
  | 'DISEASE_CHECK' 
  | 'MULCH' 
  | 'WEED' 
  | 'CUSTOM'

export type CareFrequency = 
  | 'DAILY' 
  | 'EVERY_OTHER_DAY' 
  | 'TWICE_WEEKLY' 
  | 'WEEKLY' 
  | 'BIWEEKLY' 
  | 'MONTHLY' 
  | 'CUSTOM'

export interface CareScheduleProps {
  id: string
  taskType: CareTaskType
  frequency: CareFrequency
  intervalDays?: number | null
  nextDueDate: Date
  lastDoneAt?: Date | null
  notes?: string | null
  isEnabled: boolean
  weatherAdjust: boolean
  gardenId?: string | null
  plantId?: string | null
  userId: string
  createdAt: Date
  updatedAt: Date
}

export class CareSchedule {
  private constructor(private readonly props: CareScheduleProps) {}

  static create(props: CareScheduleProps): CareSchedule {
    return new CareSchedule(props)
  }

  static fromPersistence(data: CareScheduleProps): CareSchedule {
    return new CareSchedule(data)
  }

  get id(): string { return this.props.id }
  get taskType(): CareTaskType { return this.props.taskType }
  get frequency(): CareFrequency { return this.props.frequency }
  get nextDueDate(): Date { return this.props.nextDueDate }
  get isEnabled(): boolean { return this.props.isEnabled }
  get userId(): string { return this.props.userId }

  get isOverdue(): boolean {
    return this.props.nextDueDate < new Date()
  }

  get daysUntilDue(): number {
    const now = new Date()
    const due = new Date(this.props.nextDueDate)
    const diffTime = due.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  get isDueToday(): boolean {
    const now = new Date()
    const due = new Date(this.props.nextDueDate)
    return (
      now.getFullYear() === due.getFullYear() &&
      now.getMonth() === due.getMonth() &&
      now.getDate() === due.getDate()
    )
  }

  toJSON(): CareScheduleProps {
    return { ...this.props }
  }
}
