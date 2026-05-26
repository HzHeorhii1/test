import { AggregateRootBase } from '@spherax/common';
import { Email } from '../../value-objects/email/email.value-object';
import { UserId } from '../../value-objects/user-id/user-id.value-object';
import { UserDeletedEvent } from '../../events/user-deleted.event';
import { UserRegisteredEvent } from '../../events/user-registered.event';

export class User extends AggregateRootBase {
  private constructor(
    private readonly _id: UserId,
    private readonly _email: Email,
    private readonly _passwordHash: string,
    private readonly _roles: string[],
    private readonly _createdAt: Date,
  ) {
    super();
  }

  static create(id: string, email: string, passwordHash: string, roles: string[]): User {
    const user = new User(new UserId(id), new Email(email), passwordHash, roles, new Date());
    user.addDomainEvent(new UserRegisteredEvent(id, email));
    return user;
  }

  static reconstitute(raw: {
    id: string;
    email: string;
    password: string;
    roles: string[];
    createdAt: Date;
  }): User {
    return new User(
      UserId.fromPersistence(raw.id),
      Email.fromPersistence(raw.email),
      raw.password,
      raw.roles,
      raw.createdAt,
    );
  }

  markDeleted(): void {
    this.addDomainEvent(new UserDeletedEvent(this._id.value));
  }

  get id(): string {
    return this._id.value;
  }
  get email(): string {
    return this._email.value;
  }
  get passwordHash(): string {
    return this._passwordHash;
  }
  get roles(): string[] {
    return [...this._roles];
  }
  get createdAt(): Date {
    return this._createdAt;
  }
}
