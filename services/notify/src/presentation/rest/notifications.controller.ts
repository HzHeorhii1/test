import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { VersionedRequest, VersionedResponseMapper } from '@spherax/common';
import { SendNotificationCommand } from '../../application/commands/send-notification/send-notification.command';
import { GetNotificationsQuery } from '../../application/queries/get-notifications/get-notifications.query';
import { NotificationApplicationMapper } from '../../application/mappers/notification.application.mapper';
import { Notification } from '../../domain/aggregates/notification/notification.aggregate';
import { SendNotificationRequestDto } from './dto/request/send-notification.request.dto';

@ApiHeader({ name: 'X-SpheraX-Api-Version', enum: ['1', '2'], required: false })
@ApiTags('notifications')
@Controller('api/notifications')
export class NotificationsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async send(@Body() dto: SendNotificationRequestDto, @Req() req: VersionedRequest) {
    const notification = await this.commandBus.execute<SendNotificationCommand, Notification>(
      new SendNotificationCommand(dto.userId, dto.channel, dto.message),
    );
    return VersionedResponseMapper.map(notification, req.apiVersion ?? 1, {
      1: (n) => NotificationApplicationMapper.toV1(n),
      2: (n) => NotificationApplicationMapper.toV2(n),
    });
  }

  @Get()
  async list(@Query('userId') userId: string, @Req() req: VersionedRequest) {
    const notifications = await this.queryBus.execute<GetNotificationsQuery, Notification[]>(
      new GetNotificationsQuery(userId),
    );
    return notifications.map((n) =>
      VersionedResponseMapper.map(n, req.apiVersion ?? 1, {
        1: (x) => NotificationApplicationMapper.toV1(x),
        2: (x) => NotificationApplicationMapper.toV2(x),
      }),
    );
  }
}
