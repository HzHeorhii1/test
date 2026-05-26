export class VersionedResponseMapper {
  static map<T>(
    domain: T,
    version: number,
    mappers: Record<number, (d: T) => unknown> & { 1: (d: T) => unknown },
  ): unknown {
    const fn = mappers[version] ?? mappers[1];
    return fn(domain);
  }
}
