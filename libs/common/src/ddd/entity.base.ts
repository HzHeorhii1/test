export abstract class EntityBase<TId> {
  constructor(protected readonly _id: TId) {}

  get id(): TId {
    return this._id;
  }

  equals(other?: EntityBase<TId>): boolean {
    if (!other) return false;
    return this._id === other._id;
  }
}
