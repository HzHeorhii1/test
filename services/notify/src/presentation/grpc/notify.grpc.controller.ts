import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CommandBus } from '@nestjs/cqrs';
import {
  NotifyProtoMapper,
  NotifyServiceControllerMethods,
  NOTIFY_SERVICE_NAME,
  SendNotificationRequest,
  SendNotificationResponse,
} from '@spherax/proto';
import { SendNotificationCommand } from '../../application/commands/send-notification/send-notification.command';
import { Notification } from '../../domain/aggregates/notification/notification.aggregate';

@NotifyServiceControllerMethods()
@Controller()
export class NotifyGrpcController {
  constructor(private readonly commandBus: CommandBus) {}

  @GrpcMethod(NOTIFY_SERVICE_NAME, 'SendNotification')
  async sendNotification(req: SendNotificationRequest): Promise<SendNotificationResponse> {
    const notification = await this.commandBus.execute<SendNotificationCommand, Notification>(
      new SendNotificationCommand(req.userId, req.channel, req.message),
    );
    return NotifyProtoMapper.toSendNotificationResponse(notification);
  }
}
