import { DomainEventBase } from '@spherax/common';

export class NotificationFailedEvent extends DomainEventBase {
  constructor(
    readonly notificationId: string,
    readonly reason: string,
  ) {
    super();
  }
}
