import { ValueObjectBase } from '@spherax/common';

export class NotificationId extends ValueObjectBase<string> {
  constructor(value: string) {
    if (!value) throw new Error('NotificationId cannot be empty');
    super(value);
  }

  static fromPersistence(raw: string): NotificationId {
    return NotificationId._fromPersistence(raw) as NotificationId;
  }
}
