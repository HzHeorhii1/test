export abstract class EntityBase<TId> {
  constructor(protected readonly _id: TId) {}

  get id(): TId {
    return this._id;
  }

  equals(other: EntityBase<TId>): boolean {
    return this._id === other._id;
  }
}
