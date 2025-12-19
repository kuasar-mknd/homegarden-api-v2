/**
 * Garden Domain Entity
 *
 * Represents a user's garden with geolocation support.
 */

import { calculateDistance } from '../../shared/utils/index.js'
import type { Plant } from './plant.entity.js'

export interface GardenProps {
  id: string
  name: string
  latitude: number
  longitude: number
  description?: string | null
  size?: number | null
  climate?: string | null
  userId: string
  createdAt: Date
  updatedAt: Date
  plants?: Plant[]
}

export class Garden {
  private constructor(private readonly props: GardenProps) {}

  // ============================================================
  // FACTORY METHODS
  // ============================================================

  static create(props: GardenProps): Garden {
    return new Garden(props)
  }

  static fromPersistence(data: GardenProps): Garden {
    return new Garden(data)
  }

  // ============================================================
  // GETTERS
  // ============================================================

  get id(): string {
    return this.props.id
  }

  get name(): string {
    return this.props.name
  }

  get latitude(): number {
    return this.props.latitude
  }

  get longitude(): number {
    return this.props.longitude
  }

  get coordinates(): [number, number] {
    return [this.props.longitude, this.props.latitude]
  }

  get description(): string | null | undefined {
    return this.props.description
  }

  get size(): number | null | undefined {
    return this.props.size
  }

  get climate(): string | null | undefined {
    return this.props.climate
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

  get plants(): Plant[] {
    return this.props.plants ?? []
  }

  // ============================================================
  // BUSINESS METHODS
  // ============================================================

  isOwnedBy(userId: string): boolean {
    return this.props.userId === userId
  }

  /**
   * Calculate distance to another point in kilometers
   */
  distanceTo(lat: number, lng: number): number {
    return calculateDistance(this.props.latitude, this.props.longitude, lat, lng)
  }

  // ============================================================
  // SERIALIZATION
  // ============================================================

  toJSON(): GardenProps {
    return { ...this.props }
  }
}
