import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Notification } from '../../../domain/aggregates/notification/notification.aggregate';
import {
  NOTIFICATION_REPOSITORY_PORT,
  NotificationRepositoryPort,
} from '../../../domain/ports/notification.repository.port';
import {
  NOTIFICATION_QUEUE_PORT,
  NotificationQueuePort,
} from '../../../domain/ports/notification-queue.port';
import { IamGrpcClient } from '../../../infrastructure/grpc/clients/iam.grpc.client';
import { ChannelSupportedValidator } from '../../validators/channel-supported.validator';
import { GRPC_NOT_FOUND } from '../../../constants/grpc.constants';
import { ChannelType } from '../../../constants/channel.constants';
import { SendNotificationCommand } from './send-notification.command';

@CommandHandler(SendNotificationCommand)
export class SendNotificationHandler implements ICommandHandler<
  SendNotificationCommand,
  Notification
> {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY_PORT) private readonly repo: NotificationRepositoryPort,
    @Inject(NOTIFICATION_QUEUE_PORT) private readonly notificationQueue: NotificationQueuePort,
    private readonly iamClient: IamGrpcClient,
    private readonly channelValidator: ChannelSupportedValidator,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: SendNotificationCommand): Promise<Notification> {
    this.channelValidator.assertSupported(command.channel);

    const userResponse = await firstValueFrom(this.iamClient.getUser(command.userId)).catch(
      (err: { code?: number }) => {
        if (err?.code === GRPC_NOT_FOUND) return null;
        throw new ServiceUnavailableException('IAM service unavailable');
      },
    );
    if (!userResponse) throw new NotFoundException(`User not found: ${command.userId}`);

    const notification = Notification.create(
      crypto.randomUUID(),
      command.userId,
      command.channel,
      command.message,
    );
    await this.repo.save(notification);

    if (command.channel.toUpperCase() === ChannelType.EMAIL) {
      try {
        await this.notificationQueue.enqueue({
          notificationId: notification.id,
          to: userResponse.email,
          subject: 'SpheraX Notification',
          text: command.message,
        });
      } catch {
        notification.markFailed();
        await this.repo.save(notification);
        throw new ServiceUnavailableException('Failed to queue notification for delivery');
      }
    }

    this.eventBus.publishAll(notification.domainEvents);
    notification.clearDomainEvents();
    return notification;
  }
}
