import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { User } from '../../../domain/aggregates/user/user.aggregate';
import { UserExistsValidator } from '../../validators/user-exists.validator';
import { GetUserQuery } from './get-user.query';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery, User> {
  constructor(private readonly userExists: UserExistsValidator) {}

  execute(query: GetUserQuery): Promise<User> {
    return this.userExists.assertExists(query.userId);
  }
}
