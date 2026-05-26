import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { VersionedRequest, VersionedResponseMapper } from '@spherax/common';
import { AuthGuard, CurrentUser, JwtPayload } from '@spherax/auth';
import { DeleteUserCommand } from '../../application/commands/delete-user/delete-user.command';
import { GetUserQuery } from '../../application/queries/get-user/get-user.query';
import { UserApplicationMapper } from '../../application/mappers/user.application.mapper';
import { User } from '../../domain/aggregates/user/user.aggregate';

@ApiHeader({ name: 'X-SpheraX-Api-Version', enum: ['1', '2'], required: false })
@ApiTags('users')
@Controller('api/users')
export class UsersController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get(':id')
  async getUser(@Param('id') id: string, @Req() req: VersionedRequest) {
    const user = await this.queryBus.execute<GetUserQuery, User>(new GetUserQuery(id));
    return VersionedResponseMapper.map(user, req.apiVersion ?? 1, {
      1: (u) => UserApplicationMapper.toV1(u),
      2: (u) => UserApplicationMapper.toV2(u),
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  deleteUser(@Param('id') id: string, @CurrentUser() currentUser: JwtPayload) {
    const isSelf = currentUser.sub === id;
    const isAdmin = currentUser.roles.includes('admin');
    if (!isSelf && !isAdmin) {
      throw new ForbiddenException('You can only delete your own account');
    }
    return this.commandBus.execute<DeleteUserCommand, void>(new DeleteUserCommand(id));
  }
}
