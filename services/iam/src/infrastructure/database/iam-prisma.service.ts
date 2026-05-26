import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/iam-client/client';
import { PrismaServiceBase } from '@spherax/common';

@Injectable()
export class IamPrismaService extends PrismaServiceBase<PrismaClient> {
  protected readonly client = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL_IAM! }),
  });

  get db(): PrismaClient {
    return this.client;
  }
}
