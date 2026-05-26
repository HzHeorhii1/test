import { join } from 'path';
import { Transport } from '@nestjs/microservices';
import { ClientsModuleOptions } from '@nestjs/microservices';

export function createGrpcClient(
  pkg: string,
  protoFile: string,
  url: string,
): ClientsModuleOptions {
  return [
    {
      name: `${pkg.toUpperCase()}_PACKAGE`,
      transport: Transport.GRPC,
      options: {
        package: pkg,
        protoPath: join(process.cwd(), `libs/proto/src/proto/${protoFile}`),
        url,
      },
    },
  ];
}
