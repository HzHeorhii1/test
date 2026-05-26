export abstract class ValueObjectBase<T> {
  protected readonly _value: T;

  constructor(value: T) {
    this._value = value;
    Object.freeze(this);
  }

  get value(): T {
    return this._value;
  }

  equals(other: ValueObjectBase<T>): boolean {
    return JSON.stringify(this._value) === JSON.stringify(other._value);
  }

  /** Bypasses constructor validation — for repository reconstitution only. */
  protected static _fromPersistence(value: unknown): unknown {
    const o = Object.create(this.prototype);
    Object.assign(o, { _value: value });
    Object.freeze(o);
    return o;
  }
}
