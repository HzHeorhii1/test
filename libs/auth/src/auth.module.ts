import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('IAM_JWT_SECRET'),
        signOptions: { expiresIn: config.get<number>('IAM_JWT_EXPIRES_IN', 3600) },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [JwtStrategy, AuthGuard, RoleGuard],
  exports: [JwtModule, AuthGuard, RoleGuard, JwtStrategy],
})
export class AuthModule {}
