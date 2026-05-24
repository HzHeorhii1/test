import { ValueObject } from './value-object.base';

class Money extends ValueObject<{ amount: number; currency: string }> {
  static create(amount: number, currency: string): Money {
    return new Money({ amount, currency });
  }
  get amount(): number {
    return this.props.amount;
  }
}

describe('ValueObject', () => {
  it('two instances with same props are equal', () => {
    expect(Money.create(10, 'USD').equals(Money.create(10, 'USD'))).toBe(true);
  });

  it('different props are not equal', () => {
    expect(Money.create(10, 'USD').equals(Money.create(20, 'USD'))).toBe(false);
  });

  it('equals returns false for undefined', () => {
    expect(Money.create(10, 'USD').equals(undefined)).toBe(false);
  });

  it('props are frozen (immutable)', () => {
    const vo = Money.create(10, 'USD');
    expect(() => {
      (vo as unknown as { props: { amount: number } }).props.amount = 99;
    }).toThrow();
  });
});
