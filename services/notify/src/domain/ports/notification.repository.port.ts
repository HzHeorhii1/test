import { Notification } from '../aggregates/notification/notification.aggregate';

export const NOTIFICATION_REPOSITORY_PORT = Symbol('NOTIFICATION_REPOSITORY_PORT');

export interface NotificationRepositoryPort {
  findByUserId(userId: string): Promise<Notification[]>;
  save(notification: Notification): Promise<void>;
}
