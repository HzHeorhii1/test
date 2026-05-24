export interface IRepository<T, TId> {
  save(entity: T): Promise<void>;
  findById(id: TId): Promise<T | null>;
  delete(id: TId): Promise<void>;
}
