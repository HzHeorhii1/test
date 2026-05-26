import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { NotifyPrismaService } from '../database/notify-prisma.service';
import { NOTIFICATION_DLQ, NotificationEmailJobData } from '../../constants/queue.constants';
import { NotificationStatus } from '../../constants/notification-status.constants';

@Processor(NOTIFICATION_DLQ)
export class NotificationDlqProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationDlqProcessor.name);

  constructor(private readonly prisma: NotifyPrismaService) {
    super();
  }

  async process(job: Job<NotificationEmailJobData>): Promise<void> {
    this.logger.error(
      `DLQ: marking notification ${job.data.notificationId} as FAILED (to: ${job.data.to})`,
    );
    await this.prisma.db.notification.update({
      where: { id: job.data.notificationId },
      data: { status: NotificationStatus.FAILED },
    });
  }
}
