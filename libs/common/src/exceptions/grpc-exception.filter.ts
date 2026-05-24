import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';

@Catch()
export class GrpcExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, _host: ArgumentsHost): never {
    const grpcCode = this.toGrpcCode(exception);
    const message = exception instanceof Error ? exception.message : 'Internal error';
    throw new RpcException({ code: grpcCode, message });
  }

  private toGrpcCode(exception: unknown): number {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const map: Record<number, number> = {
        [HttpStatus.NOT_FOUND]: GrpcStatus.NOT_FOUND,
        [HttpStatus.BAD_REQUEST]: GrpcStatus.INVALID_ARGUMENT,
        [HttpStatus.UNAUTHORIZED]: GrpcStatus.UNAUTHENTICATED,
        [HttpStatus.FORBIDDEN]: GrpcStatus.PERMISSION_DENIED,
        [HttpStatus.CONFLICT]: GrpcStatus.ALREADY_EXISTS,
        [HttpStatus.UNPROCESSABLE_ENTITY]: GrpcStatus.INVALID_ARGUMENT,
      };
      return map[status] ?? GrpcStatus.INTERNAL;
    }
    return GrpcStatus.INTERNAL;
  }
}
