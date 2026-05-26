import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateUserRequest,
  CreateUserResponse,
  GetUserRequest,
  GetUserResponse,
  USER_SERVICE_NAME,
  UserProtoMapper,
  UserServiceControllerMethods,
} from '@spherax/proto';
import { RegisterUserCommand } from '../../application/commands/register-user/register-user.command';
import { GetUserQuery } from '../../application/queries/get-user/get-user.query';
import { User } from '../../domain/aggregates/user/user.aggregate';

@UserServiceControllerMethods()
@Controller()
export class UserGrpcController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @GrpcMethod(USER_SERVICE_NAME, 'GetUser')
  async getUser(req: GetUserRequest): Promise<GetUserResponse> {
    const user = await this.queryBus.execute<GetUserQuery, User>(new GetUserQuery(req.id));
    return UserProtoMapper.toGetUserResponse(user);
  }

  @GrpcMethod(USER_SERVICE_NAME, 'CreateUser')
  async createUser(req: CreateUserRequest): Promise<CreateUserResponse> {
    const user = await this.commandBus.execute<RegisterUserCommand, User>(
      new RegisterUserCommand(req.email, req.password),
    );
    return UserProtoMapper.toCreateUserResponse(user);
  }
}
