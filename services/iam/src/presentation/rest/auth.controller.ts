import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { Throttle } from '@nestjs/throttler';
import { THROTTLE_LOGIN_LIMIT, THROTTLE_TTL_MS } from '../../constants/throttle.constants';
import { VersionedRequest, VersionedResponseMapper } from '@spherax/common';
import { LoginCommand } from '../../application/commands/login/login.command';
import { RegisterUserCommand } from '../../application/commands/register-user/register-user.command';
import { User } from '../../domain/aggregates/user/user.aggregate';
import { UserApplicationMapper } from '../../application/mappers/user.application.mapper';
import { LoginRequestDto } from './dto/request/login.request.dto';
import { RegisterUserRequestDto } from './dto/request/register-user.request.dto';

@ApiHeader({ name: 'X-SpheraX-Api-Version', enum: ['1', '2'], required: false })
@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('register')
  async register(@Body() dto: RegisterUserRequestDto, @Req() req: VersionedRequest) {
    const user = await this.commandBus.execute<RegisterUserCommand, User>(
      new RegisterUserCommand(dto.email, dto.password),
    );
    return VersionedResponseMapper.map(user, req.apiVersion ?? 1, {
      1: (u) => UserApplicationMapper.toV1(u),
      2: (u) => UserApplicationMapper.toV2(u),
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: THROTTLE_TTL_MS, limit: THROTTLE_LOGIN_LIMIT } })
  login(@Body() dto: LoginRequestDto) {
    return this.commandBus.execute<LoginCommand, { accessToken: string }>(
      new LoginCommand(dto.email, dto.password),
    );
  }
}
