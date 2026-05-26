import { registerAs } from '@nestjs/config';

export interface IamConfig {
  restPort: number;
  grpcPort: number;
  jwtSecret: string;
  jwtExpiresIn: number;
  databaseUrl: string;
  notifyGrpcHost: string;
  notifyGrpcPort: number;
}

export const iamConfig = registerAs(
  'iam',
  (): IamConfig => ({
    restPort: parseInt(process.env.IAM_REST_PORT ?? '3001', 10),
    grpcPort: parseInt(process.env.IAM_GRPC_PORT ?? '5001', 10),
    jwtSecret: process.env.IAM_JWT_SECRET!,
    jwtExpiresIn: parseInt(process.env.IAM_JWT_EXPIRES_IN ?? '3600', 10),
    databaseUrl: process.env.DATABASE_URL_IAM!,
    notifyGrpcHost: process.env.IAM_GRPC_HOST ?? 'localhost',
    notifyGrpcPort: parseInt(process.env.NOTIFY_GRPC_PORT ?? '5002', 10),
  }),
);
