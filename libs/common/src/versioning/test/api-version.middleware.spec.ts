import { API_VERSION_HEADER, ApiVersionMiddleware } from './api-version.middleware';
import { Request, Response } from 'express';

type VersionedRequest = Request & { apiVersion: number };

describe('ApiVersionMiddleware', () => {
  let middleware: ApiVersionMiddleware;
  let next: jest.Mock;

  beforeEach(() => {
    middleware = new ApiVersionMiddleware();
    next = jest.fn();
  });

  const makeReq = (headerValue?: string): VersionedRequest => {
    const headers: Record<string, string> = {};
    if (headerValue !== undefined) headers[API_VERSION_HEADER] = headerValue;
    return { headers } as unknown as VersionedRequest;
  };

  it('sets apiVersion from a valid header', () => {
    const req = makeReq('2');
    middleware.use(req, {} as Response, next);
    expect(req.apiVersion).toBe(2);
    expect(next).toHaveBeenCalled();
  });

  it('defaults to 1 when header is missing', () => {
    const req = makeReq();
    middleware.use(req, {} as Response, next);
    expect(req.apiVersion).toBe(1);
  });

  it('defaults to 1 when header is non-numeric', () => {
    const req = makeReq('foo');
    middleware.use(req, {} as Response, next);
    expect(req.apiVersion).toBe(1);
  });

  it('defaults to 1 when header is empty string', () => {
    const req = makeReq('');
    middleware.use(req, {} as Response, next);
    expect(req.apiVersion).toBe(1);
  });
});
