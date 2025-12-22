import bcrypt from 'bcrypt'

// biome-ignore lint/complexity/noStaticOnlyClass: Domain service using static methods pattern
export class PasswordService {
  private static readonly SALT_ROUNDS = 10

  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, PasswordService.SALT_ROUNDS)
  }

  static async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }
}
