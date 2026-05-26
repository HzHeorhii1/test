export abstract class DomainEventBase {
  readonly eventId: string;
  readonly occurredAt: Date;

  constructor() {
    this.eventId = crypto.randomUUID();
    this.occurredAt = new Date();
  }
}
