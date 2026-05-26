import { ValueObjectBase } from '@spherax/common';

export class Password extends ValueObjectBase<string> {
  constructor(value: string) {
    if (value.length < 8) throw new Error('Password must be at least 8 characters');
    super(value);
  }
}
