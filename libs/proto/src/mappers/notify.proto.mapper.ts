import { SendNotificationResponse } from '../generated/notify';

export class NotifyProtoMapper {
  static toSendNotificationResponse(notification: {
    id: string;
    status: string;
  }): SendNotificationResponse {
    return { notificationId: notification.id, sent: notification.status === 'SENT' };
  }
}
