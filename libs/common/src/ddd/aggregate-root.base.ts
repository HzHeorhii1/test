import { DomainEventBase } from './domain-event.base';
import { EntityBase } from './entity.base';

export abstract class AggregateRootBase<TId> extends EntityBase<TId> {
  private _domainEvents: DomainEventBase[] = [];

  get domainEvents(): ReadonlyArray<DomainEventBase> {
    return this._domainEvents;
  }

  protected addDomainEvent(event: DomainEventBase): void {
    this._domainEvents.push(event);
  }

  pullDomainEvents(): DomainEventBase[] {
    const events = [...this._domainEvents];
    this._domainEvents = [];
    return events;
  }
}
