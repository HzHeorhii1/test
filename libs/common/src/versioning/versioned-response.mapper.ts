type VersionMapper<T, R> = (domain: T) => R;

export class VersionedResponseMapper {
  static map<T, R = unknown>(
    domain: T,
    version: number,
    mappers: Record<number, VersionMapper<T, R>>,
  ): R {
    const fn = mappers[version] ?? mappers[1];
    return fn(domain);
  }
}
