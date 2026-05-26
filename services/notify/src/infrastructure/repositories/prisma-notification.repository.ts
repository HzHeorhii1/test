import { Injectable } from '@nestjs/common';
import { Notification } from '../../domain/aggregates/notification/notification.aggregate';
import { NotificationRepositoryPort } from '../../domain/ports/notification.repository.port';
import { NotifyPrismaService } from '../database/notify-prisma.service';

@Injectable()
export class PrismaNotificationRepository implements NotificationRepositoryPort {
  constructor(private readonly prisma: NotifyPrismaService) {}

  async findByUserId(userId: string): Promise<Notification[]> {
    const rows = await this.prisma.db.notification.findMany({ where: { userId } });
    return rows.map((row) => Notification.reconstitute(row));
  }

  async save(notification: Notification): Promise<void> {
    await this.prisma.db.notification.upsert({
      where: { id: notification.id },
      create: {
        id: notification.id,
        userId: notification.userId,
        channel: notification.channel,
        message: notification.message,
        status: notification.status,
      },
      update: {
        status: notification.status,
      },
    });
  }
}
