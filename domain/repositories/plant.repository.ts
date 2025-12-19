/**
 * Plant Repository Interface (Port)
 */

import type { Plant, PlantExposure, PlantUse } from '../entities/plant.entity.js'

export interface CreatePlantData {
  nickname?: string | null
  speciesId?: string | null
  commonName?: string | null
  scientificName?: string | null
  family?: string | null
  exposure?: PlantExposure | null
  watering?: string | null
  soilType?: string | null
  flowerColor?: string | null
  height?: number | null
  plantedDate?: Date | null
  acquiredDate?: Date | null
  bloomingSeason?: string | null
  plantingSeason?: string | null
  careNotes?: string | null
  imageUrl?: string | null
  thumbnailUrl?: string | null
  use?: PlantUse | null
  gardenId: string
}

export interface UpdatePlantData {
  nickname?: string | null
  speciesId?: string | null
  commonName?: string | null
  scientificName?: string | null
  family?: string | null
  exposure?: PlantExposure | null
  watering?: string | null
  soilType?: string | null
  flowerColor?: string | null
  height?: number | null
  plantedDate?: Date | null
  acquiredDate?: Date | null
  bloomingSeason?: string | null
  plantingSeason?: string | null
  careNotes?: string | null
  imageUrl?: string | null
  thumbnailUrl?: string | null
  use?: PlantUse | null
}

export interface PlantRepository {
  create(data: CreatePlantData): Promise<Plant>
  findById(id: string): Promise<Plant | null>
  findByGardenId(gardenId: string): Promise<Plant[]>
  findByUserId(userId: string): Promise<Plant[]>
  update(id: string, data: UpdatePlantData): Promise<Plant>
  delete(id: string): Promise<void>
  deleteByGardenId(gardenId: string): Promise<void>

  findAll(options?: {
    page?: number
    limit?: number
    gardenId?: string
    speciesId?: string
  }): Promise<{ plants: Plant[]; total: number }>

  countByGardenId(gardenId: string): Promise<number>
  aggregateByCommonName(gardenId: string): Promise<{ name: string; count: number }[]>
}
