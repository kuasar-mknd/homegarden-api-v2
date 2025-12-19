import { Result, ok, fail } from '../../shared/types/result.type.js'

export class Password {
  private constructor(private readonly value: string) {}

  public static create(password: string): Result<Password, string> {
    if (!password) {
      return fail('Password is required')
    }

    if (password.length < 8) {
      return fail('Password must be at least 8 characters long')
    }

    // Add more validation if needed (e.g. uppercase, numbers)

    return ok(new Password(password))
  }

  public getValue(): string {
    return this.value
  }
}
