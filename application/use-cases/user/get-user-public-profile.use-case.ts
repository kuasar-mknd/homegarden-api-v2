import type { UserRepository } from '../../../domain/repositories/user.repository.js'
import { AppError } from '../../../shared/errors/app-error.js'
import { fail, ok, type Result } from '../../../shared/types/result.type.js'

export interface GetUserPublicProfileInput {
  userId: string
}

export interface GetUserPublicProfileOutput {
  id: string
  firstName: string
  lastName: string
  avatarUrl: string | null
  createdAt: Date
}

export class GetUserPublicProfileUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    input: GetUserPublicProfileInput,
  ): Promise<Result<GetUserPublicProfileOutput, AppError>> {
    const user = await this.userRepository.findById(input.userId)

    if (!user) {
      return fail(new AppError('User not found', 404, 'NOT_FOUND'))
    }

    return ok({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl ?? null,
      createdAt: user.createdAt,
    })
  }
}
