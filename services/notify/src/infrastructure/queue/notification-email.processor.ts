import { Inject, Logger } from '@nestjs/common';
import { Processor, WorkerHost, OnWorkerEvent, InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { EMAIL_SENDER_PORT, EmailSenderPort } from '../../domain/ports/email-sender.port';
import { NotifyPrismaService } from '../database/notify-prisma.service';
import {
  NOTIFICATION_EMAIL_QUEUE,
  NOTIFICATION_DLQ,
  DLQ_JOB_NAME,
  NotificationEmailJobData,
} from '../../constants/queue.constants';
import { NotificationStatus } from '../../constants/notification-status.constants';

@Processor(NOTIFICATION_EMAIL_QUEUE)
export class NotificationEmailProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationEmailProcessor.name);

  constructor(
    @Inject(EMAIL_SENDER_PORT) private readonly emailSender: EmailSenderPort,
    private readonly prisma: NotifyPrismaService,
    @InjectQueue(NOTIFICATION_DLQ) private readonly dlq: Queue<NotificationEmailJobData>,
  ) {
    super();
  }

  async process(job: Job<NotificationEmailJobData>): Promise<void> {
    const { to, subject, text, notificationId } = job.data;
    this.logger.log(`Processing email job ${job.id} for notification ${notificationId} → ${to}`);
    await this.emailSender.send(to, subject, text);
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job<NotificationEmailJobData>): Promise<void> {
    this.logger.log(`Email job ${job.id} completed for notification ${job.data.notificationId}`);
    await this.prisma.db.$transaction([
      this.prisma.db.notification.update({
        where: { id: job.data.notificationId },
        data: { status: NotificationStatus.SENT },
      }),
      this.prisma.db.deliveryAttempt.create({
        data: { notificationId: job.data.notificationId, success: true },
      }),
    ]);
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job<NotificationEmailJobData> | undefined, error: Error): Promise<void> {
    if (!job) return;

    this.logger.error(
      `Email job ${job.id} failed for notification ${job.data.notificationId} (attempt ${job.attemptsMade}): ${error.message}`,
      error.stack,
    );

    await this.prisma.db.deliveryAttempt.create({
      data: {
        notificationId: job.data.notificationId,
        success: false,
        error: error.message,
      },
    });

    const isLastAttempt = job.attemptsMade >= (job.opts.attempts ?? 1);
    if (isLastAttempt) {
      this.logger.warn(`Notification ${job.data.notificationId} exhausted retries — moving to DLQ`);
      await this.dlq.add(DLQ_JOB_NAME, job.data);
    }
  }
}
