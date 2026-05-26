import { VersionedResponseMapper } from '../versioned-response.mapper';

describe('VersionedResponseMapper', () => {
  const data = { id: '1', email: 'a@b.com', roles: ['user'], createdAt: '2024-01-01' };

  const mappers = {
    1: (d: typeof data) => ({ id: d.id, email: d.email }),
    2: (d: typeof data) => ({ id: d.id, email: d.email, roles: d.roles, createdAt: d.createdAt }),
  };

  it('returns v1 response when version=1', () => {
    expect(VersionedResponseMapper.map(data, 1, mappers)).toEqual({ id: '1', email: 'a@b.com' });
  });

  it('returns v2 response when version=2', () => {
    expect(VersionedResponseMapper.map(data, 2, mappers)).toEqual({
      id: '1',
      email: 'a@b.com',
      roles: ['user'],
      createdAt: '2024-01-01',
    });
  });

  it('falls back to v1 for unknown version', () => {
    expect(VersionedResponseMapper.map(data, 99, mappers)).toEqual({ id: '1', email: 'a@b.com' });
  });
});
