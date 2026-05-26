export class Token {
  private constructor(private readonly _value: string) {}

  static create(raw: string): Token {
    const parts = raw?.split('.');
    if (!parts || parts.length !== 3 || parts.some((p) => !p)) {
      throw new Error('Invalid JWT format');
    }
    return new Token(raw);
  }

  get value(): string {
    return this._value;
  }
}
