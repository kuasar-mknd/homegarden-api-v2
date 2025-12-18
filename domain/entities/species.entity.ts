/**
 * Species Domain Entity
 * 
 * Catalog of plant species for PlantID feature.
 */

export type WaterRequirement = 'LOW' | 'MODERATE' | 'HIGH' | 'AQUATIC'
export type LightRequirement = 'FULL_SUN' | 'PARTIAL_SUN' | 'PARTIAL_SHADE' | 'FULL_SHADE'
export type GrowthRate = 'SLOW' | 'MODERATE' | 'FAST'

export interface SpeciesProps {
  id: string
  commonName: string
  scientificName: string
  family: string
  genus?: string | null
  description?: string | null
  origin?: string | null
  nativeRegions: string[]
  minTempCelsius?: number | null
  maxTempCelsius?: number | null
  waterRequirement?: WaterRequirement | null
  lightRequirement?: LightRequirement | null
  soilType: string[]
  averageHeight?: number | null
  growthRate?: GrowthRate | null
  lifespan?: string | null
  bloomingSeason: string[]
  harvestSeason: string[]
  defaultWateringDays?: number | null
  defaultFertilizeDays?: number | null
  gbifId?: string | null
  plantNetId?: string | null
  imageUrl?: string | null
  createdAt: Date
  updatedAt: Date
}

export class Species {
  private constructor(private readonly props: SpeciesProps) {}

  static create(props: SpeciesProps): Species {
    return new Species(props)
  }

  static fromPersistence(data: SpeciesProps): Species {
    return new Species(data)
  }

  get id(): string { return this.props.id }
  get commonName(): string { return this.props.commonName }
  get scientificName(): string { return this.props.scientificName }
  get family(): string { return this.props.family }
  get description(): string | null | undefined { return this.props.description }
  get waterRequirement(): WaterRequirement | null | undefined { return this.props.waterRequirement }
  get lightRequirement(): LightRequirement | null | undefined { return this.props.lightRequirement }
  get defaultWateringDays(): number | null | undefined { return this.props.defaultWateringDays }
  get defaultFertilizeDays(): number | null | undefined { return this.props.defaultFertilizeDays }

  toJSON(): SpeciesProps {
    return { ...this.props }
  }
}
