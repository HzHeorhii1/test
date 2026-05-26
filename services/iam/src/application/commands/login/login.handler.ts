import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  USER_REPOSITORY_PORT,
  UserRepositoryPort,
} from '../../../domain/ports/user.repository.port';
import { LoginCommand } from './login.command';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand, { accessToken: string }> {
  constructor(
    @Inject(USER_REPOSITORY_PORT) private readonly repo: UserRepositoryPort,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: LoginCommand): Promise<{ accessToken: string }> {
    const user = await this.repo.findByEmail(command.email);
    if (!user || !(await bcrypt.compare(command.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      roles: user.roles,
    });
    return { accessToken };
  }
}
