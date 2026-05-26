import { ValueObjectBase } from '@spherax/common';

export class UserId extends ValueObjectBase<string> {
  constructor(value: string) {
    if (!value) throw new Error('UserId cannot be empty');
    super(value);
  }

  static fromPersistence(raw: string): UserId {
    return UserId._fromPersistence(raw) as UserId;
  }
}
