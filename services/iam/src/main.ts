import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter, AppLoggerService, setupCors } from '@spherax/common';
import { BootstrapService } from './bootstrap.service';
import { IamConfig } from './config/iam.config';
import { GRPC_PACKAGE_NAME, PROTO_PATH } from './constants/grpc.constants';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(AppLoggerService));

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  setupCors(app);

  const { restPort, grpcPort } = app.get(ConfigService).get<IamConfig>('iam')!;

  BootstrapService.setupSwagger(app, 'SpheraX IAM', 'Authentication & user management');
  BootstrapService.setupGrpc(app, GRPC_PACKAGE_NAME, join(process.cwd(), PROTO_PATH), grpcPort);

  await app.startAllMicroservices();
  await app.listen(restPort);
}

bootstrap();
