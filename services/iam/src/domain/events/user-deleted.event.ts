import { DomainEventBase } from '@spherax/common';

export class UserDeletedEvent extends DomainEventBase {
  constructor(readonly userId: string) {
    super();
  }
}
