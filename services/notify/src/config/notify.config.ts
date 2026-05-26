import { registerAs } from '@nestjs/config';

export interface NotifyConfig {
  restPort: number;
  grpcPort: number;
  databaseUrl: string;
  iamGrpcHost: string;
  iamGrpcPort: number;
  smtpHost: string;
  smtpPort: number;
  smtpFrom: string;
  redisHost: string;
  redisPort: number;
  redisPassword?: string;
}

export const notifyConfig = registerAs(
  'notify',
  (): NotifyConfig => ({
    restPort: parseInt(process.env.NOTIFY_REST_PORT ?? '3002', 10),
    grpcPort: parseInt(process.env.NOTIFY_GRPC_PORT ?? '5002', 10),
    databaseUrl: process.env.DATABASE_URL_NOTIFY!,
    iamGrpcHost: process.env.IAM_GRPC_HOST ?? 'localhost',
    iamGrpcPort: parseInt(process.env.IAM_GRPC_PORT_INTERNAL ?? '5001', 10),
    smtpHost: process.env.SMTP_HOST ?? 'localhost',
    smtpPort: parseInt(process.env.SMTP_PORT ?? '1025', 10),
    smtpFrom: process.env.SMTP_FROM ?? 'noreply@spherax.local',
    redisHost: process.env.REDIS_HOST ?? 'localhost',
    redisPort: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    redisPassword: process.env.REDIS_PASSWORD || undefined,
  }),
);
