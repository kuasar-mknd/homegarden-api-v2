/**
 * CareSchedule Repository Interface (Port)
 */

import type { CareFrequency, CareSchedule, CareTaskType } from '../entities/care-schedule.entity.js'

export interface CreateCareScheduleData {
  taskType: CareTaskType
  frequency: CareFrequency
  intervalDays?: number | null
  nextDueDate: Date
  notes?: string | null
  isEnabled?: boolean
  weatherAdjust?: boolean
  gardenId?: string | null
  plantId?: string | null
  userId: string
}

export interface UpdateCareScheduleData {
  taskType?: CareTaskType
  frequency?: CareFrequency
  intervalDays?: number | null
  nextDueDate?: Date
  lastDoneAt?: Date | null
  notes?: string | null
  isEnabled?: boolean
  weatherAdjust?: boolean
}

export interface CareScheduleRepository {
  create(data: CreateCareScheduleData): Promise<CareSchedule>
  findById(id: string): Promise<CareSchedule | null>
  findByUserId(userId: string): Promise<CareSchedule[]>
  findByPlantId(plantId: string): Promise<CareSchedule[]>
  findByGardenId(gardenId: string): Promise<CareSchedule[]>
  update(id: string, data: UpdateCareScheduleData): Promise<CareSchedule>
  delete(id: string): Promise<void>

  findUpcoming(userId: string, days: number): Promise<CareSchedule[]>
  findOverdue(userId: string): Promise<CareSchedule[]>
  markComplete(id: string, notes?: string, photoUrl?: string): Promise<CareSchedule>
}
