import { Notification } from '../../domain/aggregates/notification/notification.aggregate';

export class NotificationApplicationMapper {
  static toV1(n: Notification) {
    return { id: n.id, channel: n.channel, status: n.status };
  }

  static toV2(n: Notification) {
    return {
      id: n.id,
      channel: n.channel,
      status: n.status,
      message: n.message,
      createdAt: n.createdAt.toISOString(),
    };
  }
}
