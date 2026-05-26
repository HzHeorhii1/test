import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bullmq';
import { join } from 'path';
import { THROTTLE_GLOBAL_LIMIT, THROTTLE_TTL_MS } from './constants/throttle.constants';
import {
  GRPC_KEEPALIVE_TIME_MS,
  GRPC_KEEPALIVE_TIMEOUT_MS,
  GRPC_KEEPALIVE_PERMIT_WITHOUT_CALLS,
  GRPC_HTTP2_MAX_PINGS_WITHOUT_DATA,
} from '@spherax/common';
import { NOTIFICATION_EMAIL_QUEUE, NOTIFICATION_DLQ } from './constants/queue.constants';
import { USER_GRPC_PACKAGE_NAME, USER_PROTO_PATH } from './constants/grpc.constants';
import { notifyConfig, NotifyConfig } from './config/notify.config';
import { notifyEnvValidationSchema } from './config/notify.validation';
import { LoggerModule, ApiVersionMiddleware } from '@spherax/common';
import { NotifyPrismaService } from './infrastructure/database/notify-prisma.service';
import { PrismaNotificationRepository } from './infrastructure/repositories/prisma-notification.repository';
import { NodemailerEmailService } from './infrastructure/email/nodemailer-email.service';
import { BullmqNotificationQueueService } from './infrastructure/queue/bullmq-notification-queue.service';
import { NotificationEmailProcessor } from './infrastructure/queue/notification-email.processor';
import { NotificationDlqProcessor } from './infrastructure/queue/notification-dlq.processor';
import { IamGrpcClient } from './infrastructure/grpc/clients/iam.grpc.client';
import { NOTIFICATION_REPOSITORY_PORT } from './domain/ports/notification.repository.port';
import { EMAIL_SENDER_PORT } from './domain/ports/email-sender.port';
import { NOTIFICATION_QUEUE_PORT } from './domain/ports/notification-queue.port';
import { SendNotificationHandler } from './application/commands/send-notification/send-notification.handler';
import { GetNotificationsHandler } from './application/queries/get-notifications/get-notifications.handler';
import { ChannelSupportedValidator } from './application/validators/channel-supported.validator';
import { NotificationsController } from './presentation/rest/notifications.controller';
import { NotifyGrpcController } from './presentation/grpc/notify.grpc.controller';

const commandHandlers = [SendNotificationHandler];
const queryHandlers = [GetNotificationsHandler];
const validators = [ChannelSupportedValidator];
const processors = [NotificationEmailProcessor, NotificationDlqProcessor];

@Module({
  imports: [
    CqrsModule,
    ThrottlerModule.forRoot([{ ttl: THROTTLE_TTL_MS, limit: THROTTLE_GLOBAL_LIMIT }]),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [notifyConfig],
      validationSchema: notifyEnvValidationSchema,
    }),
    LoggerModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const { smtpHost, smtpPort, smtpFrom } = config.get<NotifyConfig>('notify')!;
        return {
          transport: { host: smtpHost, port: smtpPort, secure: false },
          defaults: { from: smtpFrom },
        };
      },
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const { redisHost, redisPort, redisPassword } = config.get<NotifyConfig>('notify')!;
        return { connection: { host: redisHost, port: redisPort, password: redisPassword } };
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueue({ name: NOTIFICATION_EMAIL_QUEUE }, { name: NOTIFICATION_DLQ }),
    ClientsModule.registerAsync([
      {
        name: 'USER_PACKAGE',
        imports: [ConfigModule],
        useFactory: (config: ConfigService) => {
          const { iamGrpcHost, iamGrpcPort } = config.get<NotifyConfig>('notify')!;
          return {
            transport: Transport.GRPC,
            options: {
              package: USER_GRPC_PACKAGE_NAME,
              protoPath: join(process.cwd(), USER_PROTO_PATH),
              url: `${iamGrpcHost}:${iamGrpcPort}`,
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
  controllers: [NotificationsController, NotifyGrpcController],
  providers: [
    NotifyPrismaService,
    IamGrpcClient,
    BullmqNotificationQueueService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: NOTIFICATION_REPOSITORY_PORT, useClass: PrismaNotificationRepository },
    { provide: EMAIL_SENDER_PORT, useClass: NodemailerEmailService },
    { provide: NOTIFICATION_QUEUE_PORT, useClass: BullmqNotificationQueueService },
    ...commandHandlers,
    ...queryHandlers,
    ...validators,
    ...processors,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(ApiVersionMiddleware).forRoutes('*');
  }
}
