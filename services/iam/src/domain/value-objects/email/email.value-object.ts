import { ValueObjectBase } from '@spherax/common';
import { EMAIL_REGEX } from '../../../constants/validation.constants';

export class Email extends ValueObjectBase<string> {
  constructor(value: string) {
    if (!EMAIL_REGEX.test(value)) throw new Error(`Invalid email: ${value}`);
    super(value.toLowerCase());
  }

  static fromPersistence(raw: string): Email {
    return Email._fromPersistence(raw.toLowerCase()) as Email;
  }
}
