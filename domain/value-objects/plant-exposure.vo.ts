import { fail, ok, type Result } from '../../shared/types/result.type.js'

export type PlantExposureType = 'FULL_SUN' | 'PARTIAL_SHADE' | 'SHADE'

export class PlantExposure {
  private constructor(private readonly value: PlantExposureType) {}

  public static create(value: string): Result<PlantExposure, string> {
    const validValues: PlantExposureType[] = ['FULL_SUN', 'PARTIAL_SHADE', 'SHADE']

    if (!validValues.includes(value as PlantExposureType)) {
      return fail(`Invalid plant exposure. Must be one of: ${validValues.join(', ')}`)
    }

    return ok(new PlantExposure(value as PlantExposureType))
  }

  public getValue(): PlantExposureType {
    return this.value
  }
}
