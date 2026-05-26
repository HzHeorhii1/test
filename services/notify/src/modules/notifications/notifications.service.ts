import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { NotifyPrismaService } from '../../infrastructure/database/notify-prisma.service';
import { IamGrpcClient } from '../../infrastructure/grpc/clients/iam.grpc.client';
import { SUPPORTED_CHANNELS } from './notifications.constants';
import { NotificationStatus } from '../../constants/notification-status.constants';
import { GRPC_NOT_FOUND } from '../../constants/grpc.constants';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: NotifyPrismaService,
    private readonly iamClient: IamGrpcClient,
  ) {}

  async send(userId: string, channel: string, message: string) {
    if (!SUPPORTED_CHANNELS.includes(channel.toUpperCase())) {
      throw new BadRequestException(`Unsupported channel: ${channel}`);
    }
    const userResponse = await firstValueFrom(this.iamClient.getUser(userId)).catch(
      (err: { code?: number }) => {
        if (err?.code === GRPC_NOT_FOUND) throw new NotFoundException(`User not found: ${userId}`);
        throw err;
      },
    );
    if (!userResponse) throw new NotFoundException(`User not found: ${userId}`);

    return this.prisma.db.notification.create({
      data: { id: crypto.randomUUID(), userId, channel, message, status: NotificationStatus.SENT },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.db.notification.findMany({ where: { userId } });
  }
}
