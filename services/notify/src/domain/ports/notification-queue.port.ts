export interface NotificationEmailPayload {
  notificationId: string;
  to: string;
  subject: string;
  text: string;
}

export const NOTIFICATION_QUEUE_PORT = Symbol('NOTIFICATION_QUEUE_PORT');

export interface NotificationQueuePort {
  enqueue(payload: NotificationEmailPayload): Promise<void>;
}
