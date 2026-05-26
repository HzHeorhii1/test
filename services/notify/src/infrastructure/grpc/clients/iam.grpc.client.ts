import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import {
  UserServiceClient,
  GetUserRequest,
  GetUserResponse,
  USER_SERVICE_NAME,
} from '@spherax/proto';
import { grpcRetryIdempotent } from '@spherax/common';

@Injectable()
export class IamGrpcClient implements OnModuleInit {
  private userService!: UserServiceClient;

  constructor(@Inject('USER_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit(): void {
    this.userService = this.client.getService<UserServiceClient>(USER_SERVICE_NAME);
  }

  getUser(id: string): Observable<GetUserResponse> {
    return this.userService.getUser({ id } as GetUserRequest).pipe(grpcRetryIdempotent());
  }
}
