import { User } from '../../domain/aggregates/user/user.aggregate';

export class UserApplicationMapper {
  static toV1(user: User) {
    return { id: user.id, email: user.email };
  }

  static toV2(user: User) {
    return {
      id: user.id,
      email: user.email,
      roles: user.roles,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
