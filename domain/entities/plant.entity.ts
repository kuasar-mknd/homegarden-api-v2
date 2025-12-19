/**
 * Plant Domain Entity
 *
 * Represents a plant in a user's garden.
 */

export type PlantExposure = 'FULL_SUN' | 'PARTIAL_SHADE' | 'SHADE'
export type PlantUse = 'ORNAMENTAL' | 'GROUNDCOVER' | 'FOOD' | 'MEDICINAL' | 'FRAGRANCE'

export interface PlantProps {
  id: string
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
  createdAt: Date
  updatedAt: Date
}

export class Plant {
  private constructor(private readonly props: PlantProps) {}

  // ============================================================
  // FACTORY METHODS
  // ============================================================

  static create(props: PlantProps): Plant {
    return new Plant(props)
  }

  static fromPersistence(data: PlantProps): Plant {
    return new Plant(data)
  }

  // ============================================================
  // GETTERS
  // ============================================================

  get id(): string {
    return this.props.id
  }

  get displayName(): string {
    return this.props.nickname ?? this.props.commonName ?? 'Unnamed Plant'
  }

  get nickname(): string | null | undefined {
    return this.props.nickname
  }

  get speciesId(): string | null | undefined {
    return this.props.speciesId
  }

  get commonName(): string | null | undefined {
    return this.props.commonName
  }

  get scientificName(): string | null | undefined {
    return this.props.scientificName
  }

  get family(): string | null | undefined {
    return this.props.family
  }

  get exposure(): PlantExposure | null | undefined {
    return this.props.exposure
  }

  get gardenId(): string {
    return this.props.gardenId
  }

  get imageUrl(): string | null | undefined {
    return this.props.imageUrl
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  // ============================================================
  // BUSINESS METHODS
  // ============================================================

  get isIdentified(): boolean {
    return this.props.speciesId != null
  }

  get age(): { days: number; months: number; years: number } | null {
    if (!this.props.plantedDate) return null

    const now = new Date()
    const planted = new Date(this.props.plantedDate)
    const diffTime = Math.abs(now.getTime() - planted.getTime())
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return {
      days,
      months: Math.floor(days / 30),
      years: Math.floor(days / 365),
    }
  }

  // ============================================================
  // SERIALIZATION
  // ============================================================

  toJSON(): PlantProps {
    return { ...this.props }
  }
}
