import { Plant } from '../entities/plant.entity.js'
import { Diagnosis } from '../entities/diagnosis.entity.js'
import { CareSchedule } from '../entities/care-schedule.entity.js'

export interface DomainEvent {
  occurredOn: Date
  eventName: string
}

export class PlantAddedEvent implements DomainEvent {
  public readonly occurredOn: Date
  public readonly eventName: string = 'PlantAddedEvent'

  constructor(public readonly plant: Plant) {
    this.occurredOn = new Date()
  }
}

export class DiagnosisRequestedEvent implements DomainEvent {
  public readonly occurredOn: Date
  public readonly eventName: string = 'DiagnosisRequestedEvent'

  constructor(public readonly diagnosis: Diagnosis) {
    this.occurredOn = new Date()
  }
}

export class CareTaskDueEvent implements DomainEvent {
  public readonly occurredOn: Date
  public readonly eventName: string = 'CareTaskDueEvent'

  constructor(public readonly careSchedule: CareSchedule) {
    this.occurredOn = new Date()
  }
}
