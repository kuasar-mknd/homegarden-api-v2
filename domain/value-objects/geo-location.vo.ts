import { fail, ok, type Result } from '../../shared/types/result.type.js'

export class GeoLocation {
  private constructor(
    private readonly latitude: number,
    private readonly longitude: number,
  ) {}

  public static create(latitude: number, longitude: number): Result<GeoLocation, string> {
    if (latitude < -90 || latitude > 90) {
      return fail('Latitude must be between -90 and 90')
    }

    if (longitude < -180 || longitude > 180) {
      return fail('Longitude must be between -180 and 180')
    }

    return ok(new GeoLocation(latitude, longitude))
  }

  public getLatitude(): number {
    return this.latitude
  }

  public getLongitude(): number {
    return this.longitude
  }

  public getCoordinates(): [number, number] {
    return [this.longitude, this.latitude]
  }
}
