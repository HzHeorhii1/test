import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Notification } from '../../../domain/aggregates/notification/notification.aggregate';
import {
  NOTIFICATION_REPOSITORY_PORT,
  NotificationRepositoryPort,
} from '../../../domain/ports/notification.repository.port';
import { GetNotificationsQuery } from './get-notifications.query';

@QueryHandler(GetNotificationsQuery)
export class GetNotificationsHandler implements IQueryHandler<
  GetNotificationsQuery,
  Notification[]
> {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY_PORT) private readonly repo: NotificationRepositoryPort,
  ) {}

  execute(query: GetNotificationsQuery): Promise<Notification[]> {
    return this.repo.findByUserId(query.userId);
  }
}
