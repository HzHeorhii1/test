import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../../../domain/aggregates/user/user.aggregate';
import {
  USER_REPOSITORY_PORT,
  UserRepositoryPort,
} from '../../../domain/ports/user.repository.port';
import { EmailUniqueValidator } from '../../validators/email-unique.validator';
import { BCRYPT_SALT_ROUNDS, DEFAULT_USER_ROLES } from '../../../constants/auth.constants';
import { RegisterUserCommand } from './register-user.command';

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand, User> {
  constructor(
    @Inject(USER_REPOSITORY_PORT) private readonly repo: UserRepositoryPort,
    private readonly emailUnique: EmailUniqueValidator,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RegisterUserCommand): Promise<User> {
    await this.emailUnique.assertUnique(command.email);
    const passwordHash = await bcrypt.hash(command.password, BCRYPT_SALT_ROUNDS);
    const user = User.create(crypto.randomUUID(), command.email, passwordHash, [
      ...DEFAULT_USER_ROLES,
    ]);
    await this.repo.save(user);
    this.eventBus.publishAll(user.domainEvents);
    user.clearDomainEvents();
    return user;
  }
}
