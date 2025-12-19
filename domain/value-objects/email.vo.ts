import { Result, ok, fail } from '../../shared/types/result.type.js'

export class Email {
  private constructor(private readonly value: string) {}

  public static create(email: string): Result<Email, string> {
    if (!email) {
      return fail('Email is required')
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return fail('Invalid email format')
    }

    return ok(new Email(email))
  }

  public getValue(): string {
    return this.value
  }

  public equals(other: Email): boolean {
    return this.value === other.value
  }
}
