export const NOTIFICATION_EMAIL_QUEUE = 'notification-email';
export const NOTIFICATION_DLQ = 'notification-dlq';
export const SEND_EMAIL_JOB_NAME = 'send-email';
export const DLQ_JOB_NAME = 'dlq';
export const EMAIL_JOB_ATTEMPTS = 3;
export const EMAIL_JOB_BACKOFF_DELAY_MS = 2000;

export interface NotificationEmailJobData {
  notificationId: string;
  to: string;
  subject: string;
  text: string;
}
