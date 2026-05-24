import { VersionedResponseMapper } from './versioned-response.mapper';

describe('VersionedResponseMapper', () => {
  const domain = { id: '1', email: 'a@b.com', createdAt: new Date() };

  const mappers = {
    1: (d: typeof domain) => ({ id: d.id, email: d.email }),
    2: (d: typeof domain) => ({ id: d.id, email: d.email, createdAt: d.createdAt }),
  };

  it('applies version 1 mapper', () => {
    const result = VersionedResponseMapper.map(domain, 1, mappers);
    expect(result).toEqual({ id: '1', email: 'a@b.com' });
    expect(result).not.toHaveProperty('createdAt');
  });

  it('applies version 2 mapper', () => {
    const result = VersionedResponseMapper.map(domain, 2, mappers);
    expect(result).toHaveProperty('createdAt');
  });

  it('falls back to version 1 for an unknown version', () => {
    const result = VersionedResponseMapper.map(domain, 99, mappers);
    expect(result).toEqual({ id: '1', email: 'a@b.com' });
  });
});
