import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

export interface VersionedRequest extends Request {
  apiVersion: number;
}

@Injectable()
export class ApiVersionMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const header = req.headers['x-spherax-api-version'];
    const parsed = parseInt(header as string, 10);
    (req as VersionedRequest).apiVersion = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    next();
  }
}
