/**
 * Garden Repository Interface (Port)
 */

import type { Garden } from '../entities/garden.entity.js'

export interface CreateGardenData {
  name: string
  latitude: number
  longitude: number
  description?: string | null
  size?: number | null
  climate?: string | null
  userId: string
}

export interface UpdateGardenData {
  name?: string
  latitude?: number
  longitude?: number
  description?: string | null
  size?: number | null
  climate?: string | null
}

export interface NearbyQuery {
  latitude: number
  longitude: number
  radiusKm?: number
  limit?: number
}

export interface GardenRepository {
  create(data: CreateGardenData): Promise<Garden>
  findById(id: string): Promise<Garden | null>
  findByIdWithPlants(id: string): Promise<Garden | null>
  findByUserId(userId: string): Promise<Garden[]>
  update(id: string, data: UpdateGardenData): Promise<Garden>
  delete(id: string): Promise<void>

  findNearby(query: NearbyQuery): Promise<Garden[]>
  findByUserAndName(userId: string, name: string): Promise<Garden | null>
  findAll(options?: {
    page?: number
    limit?: number
    userId?: string
    search?: string
  }): Promise<{ gardens: Garden[]; total: number }>
}
