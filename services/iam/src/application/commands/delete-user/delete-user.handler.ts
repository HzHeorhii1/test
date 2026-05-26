import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  USER_REPOSITORY_PORT,
  UserRepositoryPort,
} from '../../../domain/ports/user.repository.port';
import { UserExistsValidator } from '../../validators/user-exists.validator';
import { DeleteUserCommand } from './delete-user.command';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand, void> {
  constructor(
    @Inject(USER_REPOSITORY_PORT) private readonly repo: UserRepositoryPort,
    private readonly userExists: UserExistsValidator,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const user = await this.userExists.assertExists(command.userId);
    user.markDeleted();
    await this.repo.delete(command.userId);
    this.eventBus.publishAll(user.domainEvents);
    user.clearDomainEvents();
  }
}
