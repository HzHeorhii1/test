import { AggregateRootBase } from '@spherax/common';
import { Channel, ChannelType } from '../../value-objects/channel/channel.value-object';
import { NotificationId } from '../../value-objects/notification-id/notification-id.value-object';
import { Recipient } from '../../value-objects/recipient/recipient.value-object';
import { NotificationSentEvent } from '../../events/notification-sent.event';
import { NotificationStatus } from '../../../constants/notification-status.constants';

export class Notification extends AggregateRootBase {
  private constructor(
    private readonly _id: NotificationId,
    private readonly _recipient: Recipient,
    private readonly _channel: Channel,
    private readonly _message: string,
    private _status: string,
    private readonly _createdAt: Date,
  ) {
    super();
  }

  static create(id: string, userId: string, channel: string, message: string): Notification {
    const n = new Notification(
      new NotificationId(id),
      new Recipient(userId),
      new Channel(channel),
      message,
      NotificationStatus.PENDING,
      new Date(),
    );
    n.addDomainEvent(new NotificationSentEvent(id));
    return n;
  }

  static reconstitute(raw: {
    id: string;
    userId: string;
    channel: string;
    message: string;
    status: string;
    createdAt: Date;
  }): Notification {
    return new Notification(
      NotificationId.fromPersistence(raw.id),
      Recipient.fromPersistence(raw.userId),
      Channel.fromPersistence(raw.channel as ChannelType),
      raw.message,
      raw.status,
      raw.createdAt,
    );
  }

  markFailed(): void {
    this._status = NotificationStatus.FAILED;
  }

  get id(): string {
    return this._id.value;
  }
  get userId(): string {
    return this._recipient.value;
  }
  get channel(): string {
    return this._channel.value;
  }
  get message(): string {
    return this._message;
  }
  get status(): string {
    return this._status;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
}
