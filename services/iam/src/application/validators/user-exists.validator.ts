import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../../domain/aggregates/user/user.aggregate';
import { USER_REPOSITORY_PORT, UserRepositoryPort } from '../../domain/ports/user.repository.port';

@Injectable()
export class UserExistsValidator {
  constructor(@Inject(USER_REPOSITORY_PORT) private readonly repo: UserRepositoryPort) {}

  async assertExists(id: string): Promise<User> {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException(`User not found: ${id}`);
    return user;
  }
}
