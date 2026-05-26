import { DomainEventBase } from '@spherax/common';

export class UserRegisteredEvent extends DomainEventBase {
  constructor(
    readonly userId: string,
    readonly email: string,
  ) {
    super();
  }
}
