import { CreateUserResponse, GetUserResponse } from '../generated/user';

export class UserProtoMapper {
  static toGetUserResponse(user: { id: string; email: string; createdAt: Date }): GetUserResponse {
    return { id: user.id, email: user.email, createdAt: user.createdAt.toISOString() };
  }

  static toCreateUserResponse(user: { id: string; email: string }): CreateUserResponse {
    return { id: user.id, email: user.email };
  }
}
