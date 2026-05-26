import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { THROTTLE_GLOBAL_LIMIT, THROTTLE_TTL_MS } from './constants/throttle.constants';
import { iamConfig, IamConfig } from './config/iam.config';
import { NOTIFY_GRPC_PACKAGE_NAME, NOTIFY_PROTO_PATH } from './constants/grpc.constants';
import { iamEnvValidationSchema } from './config/iam.validation';
import {
  LoggerModule,
  ApiVersionMiddleware,
  GRPC_KEEPALIVE_TIME_MS,
  GRPC_KEEPALIVE_TIMEOUT_MS,
  GRPC_KEEPALIVE_PERMIT_WITHOUT_CALLS,
  GRPC_HTTP2_MAX_PINGS_WITHOUT_DATA,
} from '@spherax/common';
import { AuthModule } from '@spherax/auth';
import { IamPrismaService } from './infrastructure/database/iam-prisma.service';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { NotifyGrpcClient } from './infrastructure/grpc/clients/notify.grpc.client';
import { USER_REPOSITORY_PORT } from './domain/ports/user.repository.port';
import { RegisterUserHandler } from './application/commands/register-user/register-user.handler';
import { LoginHandler } from './application/commands/login/login.handler';
import { DeleteUserHandler } from './application/commands/delete-user/delete-user.handler';
import { GetUserHandler } from './application/queries/get-user/get-user.handler';
import { EmailUniqueValidator } from './application/validators/email-unique.validator';
import { UserExistsValidator } from './application/validators/user-exists.validator';
import { AuthController } from './presentation/rest/auth.controller';
import { UsersController } from './presentation/rest/users.controller';
import { UserGrpcController } from './presentation/grpc/user.grpc.controller';

const commandHandlers = [RegisterUserHandler, LoginHandler, DeleteUserHandler];
const queryHandlers = [GetUserHandler];
const validators = [EmailUniqueValidator, UserExistsValidator];

@Module({
  imports: [
    CqrsModule,
    ThrottlerModule.forRoot([{ ttl: THROTTLE_TTL_MS, limit: THROTTLE_GLOBAL_LIMIT }]),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [iamConfig],
      validationSchema: iamEnvValidationSchema,
    }),
    LoggerModule,
    AuthModule,
    ClientsModule.registerAsync([
      {
        name: 'NOTIFY_PACKAGE',
        imports: [ConfigModule],
        useFactory: (config: ConfigService) => {
          const { notifyGrpcHost, notifyGrpcPort } = config.get<IamConfig>('iam')!;
          return {
            transport: Transport.GRPC,
            options: {
              package: NOTIFY_GRPC_PACKAGE_NAME,
              protoPath: join(process.cwd(), NOTIFY_PROTO_PATH),
              url: `${notifyGrpcHost}:${notifyGrpcPort}`,
              channelOptions: {
                'grpc.keepalive_time_ms': GRPC_KEEPALIVE_TIME_MS,
                'grpc.keepalive_timeout_ms': GRPC_KEEPALIVE_TIMEOUT_MS,
                'grpc.keepalive_permit_without_calls': GRPC_KEEPALIVE_PERMIT_WITHOUT_CALLS,
                'grpc.http2.max_pings_without_data': GRPC_HTTP2_MAX_PINGS_WITHOUT_DATA,
              },
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AuthController, UsersController, UserGrpcController],
  providers: [
    IamPrismaService,
    NotifyGrpcClient,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: USER_REPOSITORY_PORT, useClass: PrismaUserRepository },
    ...commandHandlers,
    ...queryHandlers,
    ...validators,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(ApiVersionMiddleware).forRoutes('*');
  }
}
