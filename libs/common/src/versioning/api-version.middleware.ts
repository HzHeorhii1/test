import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

export const API_VERSION_HEADER = 'x-spherax-api-version';

@Injectable()
export class ApiVersionMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const raw = req.headers[API_VERSION_HEADER];
    const parsed = parseInt(Array.isArray(raw) ? raw[0] : (raw ?? ''), 10);
    (req as Request & { apiVersion: number }).apiVersion = Number.isFinite(parsed) ? parsed : 1;
    next();
  }
}
