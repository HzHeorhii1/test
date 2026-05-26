import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  NotificationQueuePort,
  NotificationEmailPayload,
} from '../../domain/ports/notification-queue.port';
import {
  NOTIFICATION_EMAIL_QUEUE,
  SEND_EMAIL_JOB_NAME,
  EMAIL_JOB_ATTEMPTS,
  EMAIL_JOB_BACKOFF_DELAY_MS,
  NotificationEmailJobData,
} from '../../constants/queue.constants';

@Injectable()
export class BullmqNotificationQueueService implements NotificationQueuePort {
  constructor(
    @InjectQueue(NOTIFICATION_EMAIL_QUEUE) private readonly queue: Queue<NotificationEmailJobData>,
  ) {}

  async enqueue(payload: NotificationEmailPayload): Promise<void> {
    await this.queue.add(SEND_EMAIL_JOB_NAME, payload, {
      attempts: EMAIL_JOB_ATTEMPTS,
      backoff: { type: 'exponential', delay: EMAIL_JOB_BACKOFF_DELAY_MS },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }
}
