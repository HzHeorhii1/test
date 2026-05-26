import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';

export abstract class PrismaServiceBase<
  TClient extends { $connect(): Promise<void>; $disconnect(): Promise<void> },
>
  implements OnModuleInit, OnModuleDestroy
{
  protected abstract readonly client: TClient;

  async onModuleInit(): Promise<void> {
    await this.client.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
  }
}
