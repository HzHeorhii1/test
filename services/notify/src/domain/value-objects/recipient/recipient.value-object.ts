import { ValueObjectBase } from '@spherax/common';

export class Recipient extends ValueObjectBase<string> {
  constructor(userId: string) {
    if (!userId) throw new Error('Recipient userId cannot be empty');
    super(userId);
  }

  static fromPersistence(raw: string): Recipient {
    return Recipient._fromPersistence(raw) as Recipient;
  }
}
