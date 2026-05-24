import { randomUUID } from 'crypto';

export abstract class DomainEventBase {
  readonly eventId: string;
  readonly occurredAt: Date;
  abstract readonly eventName: string;

  constructor() {
    this.eventId = randomUUID();
    this.occurredAt = new Date();
  }
}
