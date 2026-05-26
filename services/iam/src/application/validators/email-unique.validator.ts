import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY_PORT, UserRepositoryPort } from '../../domain/ports/user.repository.port';

@Injectable()
export class EmailUniqueValidator {
  constructor(@Inject(USER_REPOSITORY_PORT) private readonly repo: UserRepositoryPort) {}

  async assertUnique(email: string): Promise<void> {
    const existing = await this.repo.findByEmail(email);
    if (existing) throw new ConflictException('Email already in use');
  }
}
