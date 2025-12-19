/**
 * Plant Domain Entity
 *
 * Represents a plant in a user's garden.
 */

import type { GardenProps } from './garden.entity.js'

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
  garden?: GardenProps
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
  get watering(): string | null | undefined {
    return this.props.watering
  }
  get soilType(): string | null | undefined {
    return this.props.soilType
  }
  get flowerColor(): string | null | undefined {
    return this.props.flowerColor
  }
  get height(): number | null | undefined {
    return this.props.height
  }
  get plantedDate(): Date | null | undefined {
    return this.props.plantedDate
  }
  get acquiredDate(): Date | null | undefined {
    return this.props.acquiredDate
  }
  get bloomingSeason(): string | null | undefined {
    return this.props.bloomingSeason
  }
  get plantingSeason(): string | null | undefined {
    return this.props.plantingSeason
  }
  get careNotes(): string | null | undefined {
    return this.props.careNotes
  }
  get imageUrl(): string | null | undefined {
    return this.props.imageUrl
  }
  get thumbnailUrl(): string | null | undefined {
    return this.props.thumbnailUrl
  }
  get use(): PlantUse | null | undefined {
    return this.props.use
  }
  get gardenId(): string {
    return this.props.gardenId
  }
  get createdAt(): Date {
    return this.props.createdAt
  }
  get updatedAt(): Date {
    return this.props.updatedAt
  }
  get displayName(): string {
    return this.props.nickname ?? this.props.commonName ?? 'Unnamed Plant'
  }

  get garden(): GardenProps | undefined {
    return this.props.garden
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
