import { DomainEventBase } from './domain-event.base';

export abstract class AggregateRootBase {
  private _domainEvents: DomainEventBase[] = [];

  get domainEvents(): DomainEventBase[] {
    return [...this._domainEvents];
  }

  protected addDomainEvent(event: DomainEventBase): void {
    this._domainEvents.push(event);
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }
}
