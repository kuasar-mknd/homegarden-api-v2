import type { Garden } from '../entities/garden.entity.js'
import type { Plant } from '../entities/plant.entity.js'
import type { User } from '../entities/user.entity.js'

export class AuthorizationService {
  /**
   * Checks if a user can manage a specific garden.
   * Admins can manage any garden.
   * Users can only manage their own gardens.
   */
  static canManageGarden(user: User, garden: Garden): boolean {
    if (user.isAdmin()) {
      return true
    }
    return garden.userId === user.id
  }

  /**
   * Checks if a user can manage a specific plant.
   * The user must be able to manage the garden the plant belongs to.
   * @param user The user attempting to manage the plant
   * @param plant The plant to be managed
   * @param garden The garden the plant belongs to
   */
  static canManagePlant(user: User, plant: Plant, garden: Garden): boolean {
    if (plant.gardenId !== garden.id) {
      return false
    }
    return this.canManageGarden(user, garden)
  }
}
