import { DomainEventBase } from '@spherax/common';

export class NotificationSentEvent extends DomainEventBase {
  constructor(readonly notificationId: string) {
    super();
  }
}
