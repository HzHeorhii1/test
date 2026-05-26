import { INestApplication } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const SWAGGER_VERSION = '1.0';
const SWAGGER_PATH = 'api/docs';
const GRPC_BIND_HOST = '0.0.0.0';

export class BootstrapService {
  static setupSwagger(app: INestApplication, title: string, description: string): void {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(title)
      .setDescription(description)
      .setVersion(SWAGGER_VERSION)
      .addBearerAuth()
      .build();
    SwaggerModule.setup(SWAGGER_PATH, app, SwaggerModule.createDocument(app, swaggerConfig));
  }

  static setupGrpc(
    app: INestApplication,
    grpcPackage: string,
    protoPath: string,
    port: number,
  ): void {
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.GRPC,
      options: {
        package: grpcPackage,
        protoPath,
        url: `${GRPC_BIND_HOST}:${port}`,
      },
    });
  }
}
