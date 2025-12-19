/**
 * Species Repository Interface (Port)
 */

import type {
  GrowthRate,
  LightRequirement,
  Species,
  WaterRequirement,
} from '../entities/species.entity.js'

export interface CreateSpeciesData {
  commonName: string
  scientificName: string
  family: string
  genus?: string | null
  description?: string | null
  origin?: string | null
  nativeRegions?: string[]
  minTempCelsius?: number | null
  maxTempCelsius?: number | null
  waterRequirement?: WaterRequirement | null
  lightRequirement?: LightRequirement | null
  soilType?: string[]
  averageHeight?: number | null
  growthRate?: GrowthRate | null
  lifespan?: string | null
  bloomingSeason?: string[]
  harvestSeason?: string[]
  defaultWateringDays?: number | null
  defaultFertilizeDays?: number | null
  gbifId?: string | null
  plantNetId?: string | null
  imageUrl?: string | null
}

export interface SpeciesRepository {
  create(data: CreateSpeciesData): Promise<Species>
  findById(id: string): Promise<Species | null>
  findByScientificName(name: string): Promise<Species | null>
  findByPlantNetId(plantNetId: string): Promise<Species | null>

  search(
    query: string,
    options?: {
      page?: number
      limit?: number
    },
  ): Promise<{ species: Species[]; total: number }>

  findByFamily(family: string): Promise<Species[]>
}
