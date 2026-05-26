import { Response } from 'express';
import { ApiVersionMiddleware, VersionedRequest } from '../api-version.middleware';

describe('ApiVersionMiddleware', () => {
  const middleware = new ApiVersionMiddleware();
  const next = jest.fn();
  const res = {} as Response;

  function makeReq(header?: string): VersionedRequest {
    return { headers: { 'x-spherax-api-version': header } } as unknown as VersionedRequest;
  }

  it('sets apiVersion=1 when header is absent', () => {
    const req = makeReq(undefined);
    middleware.use(req, res, next);
    expect(req.apiVersion).toBe(1);
  });

  it('parses version 2 from header', () => {
    const req = makeReq('2');
    middleware.use(req, res, next);
    expect(req.apiVersion).toBe(2);
  });

  it('defaults to 1 for non-numeric header', () => {
    const req = makeReq('abc');
    middleware.use(req, res, next);
    expect(req.apiVersion).toBe(1);
  });

  it('defaults to 1 for zero', () => {
    const req = makeReq('0');
    middleware.use(req, res, next);
    expect(req.apiVersion).toBe(1);
  });

  it('calls next()', () => {
    middleware.use(makeReq('1'), res, next);
    expect(next).toHaveBeenCalled();
  });
});
